const db = require('../config/database');

class Review {
  static async create(reviewData) {
    const sql = `
      INSERT INTO reviews (booking_id, customer_id, chef_id, rating, 
        food_quality, professionalism, value_for_money, comment, images)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await db.query(sql, [
      reviewData.bookingId,
      reviewData.customerId,
      reviewData.chefId,
      reviewData.rating,
      reviewData.foodQuality || reviewData.rating,
      reviewData.professionalism || reviewData.rating,
      reviewData.valueForMoney || reviewData.rating,
      reviewData.comment,
      reviewData.images ? JSON.stringify(reviewData.images) : null
    ]);
    return result.insertId;
  }

  static async findByChefId(chefId, limit = 20, offset = 0) {
    const sql = `
      SELECT r.*, 
        u.first_name as customer_first_name, u.last_name as customer_last_name,
        b.event_date, b.event_type
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      JOIN bookings b ON r.booking_id = b.id
      WHERE r.chef_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;
    return await db.query(sql, [chefId, limit, offset]);
  }

  static async getRatingSummary(chefId) {
    const sql = `
      SELECT 
        COUNT(*) as total_reviews,
        COALESCE(AVG(rating), 0) as average_rating,
        COALESCE(AVG(food_quality), 0) as avg_food_quality,
        COALESCE(AVG(professionalism), 0) as avg_professionalism,
        COALESCE(AVG(value_for_money), 0) as avg_value_for_money,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
      FROM reviews
      WHERE chef_id = ?
    `;
    const results = await db.query(sql, [chefId]);
    return results[0];
  }

  static async checkIfReviewExists(bookingId) {
    const sql = 'SELECT id FROM reviews WHERE booking_id = ?';
    const results = await db.query(sql, [bookingId]);
    return results.length > 0;
  }

  static async findRecent(limit = 6) {
    const sql = `
      SELECT r.id, r.rating, r.comment, r.created_at,
        uc.first_name AS customer_first_name, uc.last_name AS customer_last_name,
        uch.first_name AS chef_first_name, uch.last_name AS chef_last_name
      FROM reviews r
      JOIN users uc  ON r.customer_id = uc.id
      JOIN users uch ON r.chef_id     = uch.id
      WHERE r.comment IS NOT NULL AND r.comment != ''
      ORDER BY r.created_at DESC
      LIMIT ?
    `;
    return await db.query(sql, [limit]);
  }

  static async findByBookingId(bookingId) {
    const sql = `
      SELECT r.*, 
        u.first_name as customer_first_name, u.last_name as customer_last_name
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      WHERE r.booking_id = ?
    `;
    const results = await db.query(sql, [bookingId]);
    return results[0] || null;
  }

  static async addResponse(reviewId, chefId, response) {
    const sql = 'UPDATE reviews SET response = ? WHERE id = ? AND chef_id = ?';
    await db.query(sql, [response, reviewId, chefId]);
  }
}

module.exports = Review;

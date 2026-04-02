const db = require('../config/database');

class Booking {
  static async create(bookingData) {
    const sql = `
      INSERT INTO bookings (customer_id, chef_id, menu_id, event_date, event_time,
        guest_count, event_type, event_location, special_requests, total_price, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await db.query(sql, [
      bookingData.customerId,
      bookingData.chefId,
      bookingData.menuId || null,
      bookingData.eventDate,
      bookingData.eventTime,
      bookingData.guestCount,
      bookingData.eventType,
      bookingData.eventLocation,
      bookingData.specialRequests,
      bookingData.totalPrice,
      'pending'
    ]);
    return result.insertId;
  }

  static async findById(id) {
    const sql = `
      SELECT b.*, 
        u1.first_name as customer_first_name, u1.last_name as customer_last_name, u1.email as customer_email,
        u2.first_name as chef_first_name, u2.last_name as chef_last_name, u2.email as chef_email,
        m.title as menu_title, m.price_per_person
      FROM bookings b
      JOIN users u1 ON b.customer_id = u1.id
      JOIN users u2 ON b.chef_id = u2.id
      LEFT JOIN menus m ON b.menu_id = m.id
      WHERE b.id = ?
    `;
    const results = await db.query(sql, [id]);
    return results[0];
  }

  static async findByUserId(userId, userType) {
    const column = userType === 'chef' ? 'chef_id' : 'customer_id';
    const sql = `
      SELECT b.*, 
        u1.first_name as customer_first_name, u1.last_name as customer_last_name,
        u2.first_name as chef_first_name, u2.last_name as chef_last_name,
        m.title as menu_title
      FROM bookings b
      JOIN users u1 ON b.customer_id = u1.id
      JOIN users u2 ON b.chef_id = u2.id
      LEFT JOIN menus m ON b.menu_id = m.id
      WHERE b.${column} = ?
      ORDER BY b.event_date DESC, b.created_at DESC
    `;
    return await db.query(sql, [userId]);
  }

  static async updateStatus(id, status, userId, userType) {
    const column = userType === 'chef' ? 'chef_id' : 'customer_id';
    const sql = `UPDATE bookings SET status = ? WHERE id = ? AND ${column} = ?`;
    const result = await db.query(sql, [status, id, userId]);
    return result.affectedRows > 0;
  }

  static async updatePaymentStatus(id, customerId, paymentStatus) {
    const sql = `
      UPDATE bookings
      SET payment_status = ?
      WHERE id = ? AND customer_id = ?
    `;
    const result = await db.query(sql, [paymentStatus, id, customerId]);
    return result.affectedRows > 0;
  }

  static async cancel(id, userId, reason) {
    const sql = `
      UPDATE bookings 
      SET status = 'cancelled', cancellation_reason = ? 
      WHERE id = ? AND (customer_id = ? OR chef_id = ?)
    `;
    const result = await db.query(sql, [reason, id, userId, userId]);
    return result.affectedRows > 0;
  }

  static async getUpcoming(chefId, limit = 5) {
    const sql = `
      SELECT b.*, 
        u.first_name as customer_first_name, u.last_name as customer_last_name,
        m.title as menu_title
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      LEFT JOIN menus m ON b.menu_id = m.id
      WHERE b.chef_id = ? AND b.event_date >= CURDATE() AND b.status != 'cancelled'
      ORDER BY b.event_date ASC, b.event_time ASC
      LIMIT ?
    `;
    return await db.query(sql, [chefId, limit]);
  }
}

module.exports = Booking;

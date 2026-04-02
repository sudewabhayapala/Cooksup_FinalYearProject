const db = require('../config/database');

class ChefProfile {
  static async create(userId, profileData = {}) {
    const sql = `
      INSERT INTO chef_profiles (user_id, bio, specialties, experience_years, 
        hourly_rate, min_spend, cuisine_types, certifications, is_available)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await db.query(sql, [
      userId,
      profileData.bio || null,
      profileData.specialties || null,
      profileData.experienceYears || 0,
      profileData.hourlyRate || null,
      profileData.minSpend || null,
      profileData.cuisineTypes || null,
      profileData.certifications || null,
      true
    ]);
    return result.insertId;
  }

  static async findByUserId(userId) {
    const sql = `
      SELECT cp.*, u.first_name, u.last_name, u.email, u.phone, u.location
      FROM chef_profiles cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.user_id = ?
    `;
    const results = await db.query(sql, [userId]);
    const chef = results[0];
    if (!chef) return null;

    // Attach recent reviews
    const reviewSql = `
      SELECT r.id, r.rating, r.food_quality, r.professionalism, r.value_for_money,
        r.comment, r.response, r.created_at,
        u.first_name, u.last_name,
        b.event_type, b.event_date
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      JOIN bookings b ON r.booking_id = b.id
      WHERE r.chef_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10
    `;
    chef.recentReviews = await db.query(reviewSql, [userId]);
    return chef;
  }

  static async findById(id) {
    const sql = `
      SELECT cp.*, u.first_name, u.last_name, u.email, u.phone, u.location
      FROM chef_profiles cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.id = ?
    `;
    const results = await db.query(sql, [id]);
    return results[0];
  }

  static async search(filters = {}) {
    let sql = `
      SELECT cp.*, u.first_name, u.last_name, u.location,
        COUNT(DISTINCT b.id) as booking_count,
        COUNT(DISTINCT r.id) as review_count,
        COALESCE(MAX(b.guest_count), 0) as max_guest_served,
        ROUND(
          (COALESCE(cp.average_rating, 0) * 20)
          + (COUNT(DISTINCT b.id) * 3)
          + (COUNT(DISTINCT r.id) * 2),
          2
        ) as ranking_points
      FROM chef_profiles cp
      JOIN users u ON cp.user_id = u.id
      LEFT JOIN bookings b ON cp.user_id = b.chef_id AND b.status = 'completed'
      LEFT JOIN reviews r ON cp.user_id = r.chef_id
      WHERE cp.is_available = true
    `;
    const params = [];

    if (filters.location) {
      sql += ' AND u.location LIKE ?';
      params.push(`%${filters.location}%`);
    }

    if (filters.query) {
      sql += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR CONCAT(u.first_name, " ", u.last_name) LIKE ? OR cp.specialties LIKE ? OR cp.cuisine_types LIKE ?)';
      params.push(
        `%${filters.query}%`,
        `%${filters.query}%`,
        `%${filters.query}%`,
        `%${filters.query}%`,
        `%${filters.query}%`
      );
    }

    if (filters.cuisine) {
      sql += ' AND cp.cuisine_types LIKE ?';
      params.push(`%${filters.cuisine}%`);
    }

    if (filters.minRating) {
      sql += ' AND cp.average_rating >= ?';
      params.push(filters.minRating);
    }

    if (filters.maxPrice) {
      sql += ' AND cp.hourly_rate <= ?';
      params.push(filters.maxPrice);
    }

    if (filters.featured) {
      sql += ' AND cp.featured = true';
    }

    sql += ' GROUP BY cp.id, u.id';

    const parsedGuestCount = Number(filters.guestCount);
    if (Number.isFinite(parsedGuestCount) && parsedGuestCount > 0) {
      sql += ' HAVING (COALESCE(MAX(b.guest_count), 0) >= ? OR COUNT(DISTINCT b.id) = 0)';
      params.push(parsedGuestCount);
    }

    if (filters.sortBy === 'popular') {
      sql += ' ORDER BY booking_count DESC, cp.average_rating DESC';
    } else if (filters.sortBy === 'points') {
      sql += ' ORDER BY ranking_points DESC, cp.average_rating DESC';
    } else if (filters.sortBy === 'rating') {
      sql += ' ORDER BY cp.average_rating DESC';
    } else if (filters.sortBy === 'price_low') {
      sql += ' ORDER BY cp.hourly_rate ASC';
    } else if (filters.sortBy === 'price_high') {
      sql += ' ORDER BY cp.hourly_rate DESC';
    } else {
      sql += ' ORDER BY cp.featured DESC, cp.average_rating DESC';
    }

    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return await db.query(sql, params);
  }

  static async update(userId, data) {
    const fields = [];
    const values = [];

    const fieldMap = {
      bio: 'bio',
      specialties: 'specialties',
      experienceYears: 'experience_years',
      hourlyRate: 'hourly_rate',
      minSpend: 'min_spend',
      cuisineTypes: 'cuisine_types',
      certifications: 'certifications',
      profileImage: 'profile_image',
      coverImage: 'cover_image',
      isAvailable: 'is_available',
      michelinStars: 'michelin_stars',
      celebrityClients: 'celebrity_clients'
    };

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && fieldMap[key]) {
        fields.push(`${fieldMap[key]} = ?`);
        values.push(data[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(userId);
    const sql = `UPDATE chef_profiles SET ${fields.join(', ')} WHERE user_id = ?`;
    await db.query(sql, values);
    return true;
  }

  static async updateRating(chefId) {
    const sql = `
      UPDATE chef_profiles 
      SET average_rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM reviews 
        WHERE chef_id = ?
      )
      WHERE user_id = ?
    `;
    await db.query(sql, [chefId, chefId]);
  }

  static async getDashboardStats(chefId) {
    const statsSQL = `
      SELECT 
        (SELECT COUNT(*) FROM bookings WHERE chef_id = ? AND status != 'cancelled') as total_bookings,
        (SELECT COUNT(*) FROM bookings WHERE chef_id = ? AND status = 'pending') as pending_bookings,
        (SELECT COUNT(*) FROM bookings WHERE chef_id = ? AND status = 'completed') as completed_bookings,
        (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE chef_id = ?) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE chef_id = ?) as total_reviews,
        (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE chef_id = ? AND status = 'completed') as total_earnings
    `;
    const stats = await db.query(statsSQL, [chefId, chefId, chefId, chefId, chefId, chefId]);
    return stats[0];
  }
}

module.exports = ChefProfile;

const db = require('../config/database');

class User {
  static async create({ email, password, firstName, lastName, phone, userType, location, profileImage }) {
    const sql = `
      INSERT INTO users (email, password, first_name, last_name, phone, user_type, location, profile_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await db.query(sql, [email, password, firstName, lastName, phone, userType, location, profileImage || null]);
    return result.insertId;
  }

  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const results = await db.query(sql, [email]);
    return results[0];
  }

  static async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const results = await db.query(sql, [id]);
    return results[0];
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await db.query(sql, values);
    return true;
  }
}

module.exports = User;

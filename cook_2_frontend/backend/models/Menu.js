const db = require('../config/database');

// Menu model class for managing chef menu offerings
class Menu {
  // Create a new menu item for a chef
  static async create(menuData) {
    const sql = `
      INSERT INTO menus (chef_id, title, description, cuisine_type, category,
        price_per_person, min_guests, max_guests, courses, dietary_options, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await db.query(sql, [
      menuData.chefId,
      menuData.title,
      menuData.description,
      menuData.cuisineType,
      menuData.category,
      menuData.pricePerPerson,
      menuData.minGuests || 1,
      menuData.maxGuests || 50,
      menuData.courses || 3,
      menuData.dietaryOptions,
      menuData.imageUrl
    ]);
    return result.insertId;
  }

  // Find all active menus for a specific chef
  static async findByChefId(chefId) {
    const sql = 'SELECT * FROM menus WHERE chef_id = ? AND is_active = true ORDER BY created_at DESC';
    return await db.query(sql, [chefId]);
  }

  // Find a menu by its ID
  static async findById(id) {
    const sql = 'SELECT * FROM menus WHERE id = ?';
    const results = await db.query(sql, [id]);
    return results[0];
  }

  // Update menu information (only by the menu's chef)
  static async update(id, chefId, data) {
    const fields = [];
    const values = [];

    // Map frontend field names to database column names
    const fieldMap = {
      title: 'title',
      description: 'description',
      cuisineType: 'cuisine_type',
      category: 'category',
      pricePerPerson: 'price_per_person',
      minGuests: 'min_guests',
      maxGuests: 'max_guests',
      courses: 'courses',
      dietaryOptions: 'dietary_options',
      imageUrl: 'image_url',
      isActive: 'is_active'
    };

    // Build dynamic update query based on provided fields
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && fieldMap[key]) {
        fields.push(`${fieldMap[key]} = ?`);
        values.push(data[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id, chefId);
    const sql = `UPDATE menus SET ${fields.join(', ')} WHERE id = ? AND chef_id = ?`;
    await db.query(sql, values);
    return true;
  }

  // Soft delete a menu (mark as inactive instead of removing)
  static async delete(id, chefId) {
    const sql = 'UPDATE menus SET is_active = false WHERE id = ? AND chef_id = ?';
    await db.query(sql, [id, chefId]);
  }
}

module.exports = Menu;

const mysql = require('mysql2/promise');
require('dotenv').config();

const setupDatabase = async () => {
  console.log('🔧 Setting up CooksUp Database...\n');

  try {
    // Create connection without database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to MySQL server');

    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'cooksup_db'}`);
    console.log(`✅ Database '${process.env.DB_NAME || 'cooksup_db'}' created`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME || 'cooksup_db'}`);

    // Create Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        user_type ENUM('customer', 'chef') NOT NULL,
        location VARCHAR(255),
        profile_image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_user_type (user_type)
      )
    `);
    console.log('✅ Table: users');

    // Create Chef Profiles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS chef_profiles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNIQUE NOT NULL,
        bio TEXT,
        specialties TEXT,
        experience_years INT DEFAULT 0,
        hourly_rate DECIMAL(10, 2),
        min_spend DECIMAL(10, 2),
        cuisine_types TEXT,
        certifications TEXT,
        profile_image VARCHAR(255),
        cover_image VARCHAR(255),
        is_available BOOLEAN DEFAULT true,
        total_bookings INT DEFAULT 0,
        average_rating DECIMAL(3, 2) DEFAULT 0.00,
        michelin_stars INT DEFAULT 0,
        celebrity_clients TEXT,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_available (is_available),
        INDEX idx_featured (featured),
        INDEX idx_rating (average_rating)
      )
    `);
    console.log('✅ Table: chef_profiles');

    // Create Menus table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS menus (
        id INT PRIMARY KEY AUTO_INCREMENT,
        chef_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        cuisine_type VARCHAR(100),
        category ENUM('Casual', 'Fine Dining', 'BBQ', 'Buffet', 'Brunch', 'Afternoon Tea', 'Canape', 'Christmas', 'Vegetarian', 'Other') DEFAULT 'Other',
        price_per_person DECIMAL(10, 2) NOT NULL,
        min_guests INT DEFAULT 1,
        max_guests INT DEFAULT 50,
        courses INT DEFAULT 3,
        dietary_options TEXT,
        image_url VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (chef_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_chef_id (chef_id),
        INDEX idx_cuisine (cuisine_type),
        INDEX idx_category (category),
        INDEX idx_active (is_active)
      )
    `);
    console.log('✅ Table: menus');

    // Create Menu Items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        menu_id INT NOT NULL,
        course_type ENUM('Starter', 'Main', 'Dessert', 'Side', 'Canape', 'Other') NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        dietary_tags TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
        INDEX idx_menu_id (menu_id)
      )
    `);
    console.log('✅ Table: menu_items');

    // Create Bookings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        customer_id INT NOT NULL,
        chef_id INT NOT NULL,
        menu_id INT,
        event_date DATE NOT NULL,
        event_time TIME NOT NULL,
        guest_count INT NOT NULL,
        event_type VARCHAR(100),
        event_location VARCHAR(255) NOT NULL,
        special_requests TEXT,
        total_price DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
        payment_status ENUM('pending', 'deposit_paid', 'fully_paid', 'refunded') DEFAULT 'pending',
        cancellation_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (chef_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE SET NULL,
        INDEX idx_customer (customer_id),
        INDEX idx_chef (chef_id),
        INDEX idx_event_date (event_date),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Table: bookings');

    // Create Reviews table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT PRIMARY KEY AUTO_INCREMENT,
        booking_id INT UNIQUE NOT NULL,
        customer_id INT NOT NULL,
        chef_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        food_quality INT CHECK (food_quality >= 1 AND food_quality <= 5),
        professionalism INT CHECK (professionalism >= 1 AND professionalism <= 5),
        value_for_money INT CHECK (value_for_money >= 1 AND value_for_money <= 5),
        comment TEXT,
        response TEXT,
        images TEXT,
        helpful_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (chef_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_chef_id (chef_id),
        INDEX idx_rating (rating),
        INDEX idx_created (created_at)
      )
    `);
    console.log('✅ Table: reviews');

    // Create Chef Photos table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS chef_photos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        chef_id INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        caption TEXT,
        is_portfolio BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chef_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_chef_id (chef_id)
      )
    `);
    console.log('✅ Table: chef_photos');

    // Create Availability table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS chef_availability (
        id INT PRIMARY KEY AUTO_INCREMENT,
        chef_id INT NOT NULL,
        date DATE NOT NULL,
        is_available BOOLEAN DEFAULT true,
        reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chef_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_chef_date (chef_id, date),
        INDEX idx_chef_date (chef_id, date)
      )
    `);
    console.log('✅ Table: chef_availability');

    // Create Messages table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        booking_id INT NOT NULL,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_booking (booking_id),
        INDEX idx_receiver (receiver_id, is_read)
      )
    `);
    console.log('✅ Table: messages');

    // Create Favorites table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT PRIMARY KEY AUTO_INCREMENT,
        customer_id INT NOT NULL,
        chef_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (chef_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_favorite (customer_id, chef_id),
        INDEX idx_customer (customer_id)
      )
    `);
    console.log('✅ Table: favorites');

    console.log('\n✨ Database setup completed successfully!');
    await connection.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
};

setupDatabase();

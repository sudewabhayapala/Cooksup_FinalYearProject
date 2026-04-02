const bcrypt = require('bcryptjs');
const db = require('../config/database');
require('dotenv').config();

const seedData = async () => {
  console.log('🌱 Seeding database...\n');

  try {
    // Hash password for demo users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create customers
    console.log('Creating customers...');
    const customer1 = await db.query(`
      INSERT INTO users (email, password, first_name, last_name, phone, user_type, location)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['john.doe@example.com', hashedPassword, 'John', 'Doe', '+44 7700 900000', 'customer', 'London, UK']);

    const customer2 = await db.query(`
      INSERT INTO users (email, password, first_name, last_name, phone, user_type, location)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['jane.smith@example.com', hashedPassword, 'Jane', 'Smith', '+44 7700 900001', 'customer', 'Manchester, UK']);

    console.log('✅ Customers created');

    // Create chefs
    console.log('Creating chefs...');
    const chef1 = await db.query(`
      INSERT INTO users (email, password, first_name, last_name, phone, user_type, location)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['chef.gordon@example.com', hashedPassword, 'Gordon', 'Ramsay', '+44 7700 900100', 'chef', 'London, UK']);

    const chef2 = await db.query(`
      INSERT INTO users (email, password, first_name, last_name, phone, user_type, location)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['chef.jamie@example.com', hashedPassword, 'Jamie', 'Oliver', '+44 7700 900101', 'chef', 'London, UK']);

    const chef3 = await db.query(`
      INSERT INTO users (email, password, first_name, last_name, phone, user_type, location)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['chef.maria@example.com', hashedPassword, 'Maria', 'Garcia', '+44 7700 900102', 'chef', 'Birmingham, UK']);

    console.log('✅ Chefs created');

    // Create chef profiles
    console.log('Creating chef profiles...');
    await db.query(`
      INSERT INTO chef_profiles (user_id, bio, specialties, experience_years, hourly_rate, min_spend, 
        cuisine_types, certifications, michelin_stars, celebrity_clients, average_rating, total_bookings, featured)
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      chef1.insertId, 
      'Award-winning chef with 25+ years of experience. Specialized in fine dining and modern British cuisine.',
      'Fine Dining, British, French, Mediterranean',
      25, 150.00, 500.00,
      'British, French, Mediterranean, Fine Dining',
      'Michelin Star Chef, Master Chef',
      2, 'David Beckham, Madonna, Royal Family',
      4.9, 120, true,

      chef2.insertId,
      'Passionate about healthy, sustainable cooking. TV personality and cookbook author.',
      'Italian, Healthy Cooking, Mediterranean',
      20, 120.00, 400.00,
      'Italian, Mediterranean, Healthy, BBQ',
      'Culinary Arts Degree, TV Chef',
      0, 'Various celebrities',
      4.8, 95, true,

      chef3.insertId,
      'Authentic Spanish and Mediterranean cuisine. Specializing in paella and tapas.',
      'Spanish, Mediterranean, Tapas',
      15, 100.00, 300.00,
      'Spanish, Mediterranean, Vegetarian',
      'Culinary School Graduate',
      0, null,
      4.7, 68, false
    ]);

    console.log('✅ Chef profiles created');

    // Create menus
    console.log('Creating menus...');
    await db.query(`
      INSERT INTO menus (chef_id, title, description, cuisine_type, category, price_per_person, 
        min_guests, max_guests, courses, dietary_options)
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      chef1.insertId, 'Premium Fine Dining Experience', 'Exquisite 7-course tasting menu with wine pairing', 
      'Fine Dining', 'Fine Dining', 150.00, 2, 12, 7, 'Vegetarian options available',

      chef1.insertId, 'British Heritage Menu', 'Classic British dishes with a modern twist',
      'British', 'Fine Dining', 120.00, 4, 20, 5, 'Gluten-free, Vegetarian',

      chef2.insertId, 'Italian Family Feast', 'Authentic Italian family-style dining experience',
      'Italian', 'Casual', 80.00, 6, 30, 4, 'Vegetarian, Vegan options',

      chef2.insertId, 'Healthy Mediterranean', 'Fresh, healthy Mediterranean cuisine',
      'Mediterranean', 'Casual', 70.00, 4, 25, 3, 'Vegetarian, Vegan, Gluten-free',

      chef3.insertId, 'Spanish Tapas Party', 'Variety of authentic Spanish tapas',
      'Spanish', 'Buffet', 60.00, 8, 40, 0, 'Vegetarian options available'
    ]);

    console.log('✅ Menus created');

    // Create bookings
    console.log('Creating bookings...');
    const today = new Date();
    const futureDate1 = new Date(today);
    futureDate1.setDate(futureDate1.getDate() + 10);
    const futureDate2 = new Date(today);
    futureDate2.setDate(futureDate2.getDate() + 20);
    const pastDate = new Date(today);
    pastDate.setDate(pastDate.getDate() - 30);

    const booking1 = await db.query(`
      INSERT INTO bookings (customer_id, chef_id, menu_id, event_date, event_time, guest_count,
        event_type, event_location, special_requests, total_price, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      customer1.insertId, chef1.insertId, 1, 
      futureDate1.toISOString().split('T')[0], '19:00:00', 8,
      'Birthday', '123 Park Lane, London', 'Champagne on arrival please',
      1200.00, 'confirmed'
    ]);

    const booking2 = await db.query(`
      INSERT INTO bookings (customer_id, chef_id, menu_id, event_date, event_time, guest_count,
        event_type, event_location, special_requests, total_price, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      customer2.insertId, chef2.insertId, 3,
      futureDate2.toISOString().split('T')[0], '18:30:00', 10,
      'Family Dinner', '45 Oxford Street, Manchester', 'One vegetarian guest',
      800.00, 'pending'
    ]);

    const booking3 = await db.query(`
      INSERT INTO bookings (customer_id, chef_id, menu_id, event_date, event_time, guest_count,
        event_type, event_location, special_requests, total_price, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      customer1.insertId, chef2.insertId, 4,
      pastDate.toISOString().split('T')[0], '19:00:00', 6,
      'Anniversary', '123 Park Lane, London', 'Surprise dessert please',
      420.00, 'completed'
    ]);

    console.log('✅ Bookings created');

    // Create reviews
    console.log('Creating reviews...');
    await db.query(`
      INSERT INTO reviews (booking_id, customer_id, chef_id, rating, food_quality, 
        professionalism, value_for_money, comment)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      booking3.insertId, customer1.insertId, chef2.insertId,
      5, 5, 5, 5,
      'Absolutely incredible experience! Chef Jamie was professional, the food was outstanding, and it made our anniversary truly special. Highly recommend!'
    ]);

    console.log('✅ Reviews created');

    // Update chef ratings
    await db.query(`
      UPDATE chef_profiles 
      SET average_rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM reviews 
        WHERE chef_id = user_id
      )
    `);

    console.log('\n✨ Database seeded successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log('Customer: john.doe@example.com / password123');
    console.log('Customer: jane.smith@example.com / password123');
    console.log('Chef: chef.gordon@example.com / password123');
    console.log('Chef: chef.jamie@example.com / password123');
    console.log('Chef: chef.maria@example.com / password123\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedData();

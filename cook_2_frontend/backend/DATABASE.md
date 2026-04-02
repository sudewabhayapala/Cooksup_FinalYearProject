# Database Schema Documentation

## CooksUp Chef Booking Platform Database

### Overview
MySQL database schema for a chef booking platform similar to yhangry.com, featuring user management, chef profiles, menus, bookings, and reviews.

---

## Tables

### 1. users
Stores all user accounts (customers and chefs).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| first_name | VARCHAR(100) | NOT NULL | First name |
| last_name | VARCHAR(100) | NOT NULL | Last name |
| phone | VARCHAR(20) | | Phone number |
| user_type | ENUM | NOT NULL | 'customer' or 'chef' |
| location | VARCHAR(255) | | User location |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation date |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update date |

**Indexes:** email, user_type

---

### 2. chef_profiles
Extended profile information for chef accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Profile ID |
| user_id | INT | UNIQUE, FOREIGN KEY -> users(id) | Reference to user |
| bio | TEXT | | Chef biography |
| specialties | TEXT | | Chef specialties |
| experience_years | INT | DEFAULT 0 | Years of experience |
| hourly_rate | DECIMAL(10,2) | | Hourly rate |
| min_spend | DECIMAL(10,2) | | Minimum booking spend |
| cuisine_types | TEXT | | Comma-separated cuisines |
| certifications | TEXT | | Chef certifications |
| profile_image | VARCHAR(255) | | Profile photo URL |
| cover_image | VARCHAR(255) | | Cover photo URL |
| is_available | BOOLEAN | DEFAULT true | Availability status |
| total_bookings | INT | DEFAULT 0 | Total completed bookings |
| average_rating | DECIMAL(3,2) | DEFAULT 0.00 | Average review rating |
| michelin_stars | INT | DEFAULT 0 | Michelin stars |
| celebrity_clients | TEXT | | Notable clients |
| featured | BOOLEAN | DEFAULT false | Featured chef flag |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Profile creation |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |

**Indexes:** user_id, is_available, featured, average_rating

---

### 3. menus
Chef menu offerings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Menu ID |
| chef_id | INT | FOREIGN KEY -> users(id) | Chef who owns menu |
| title | VARCHAR(255) | NOT NULL | Menu title |
| description | TEXT | | Menu description |
| cuisine_type | VARCHAR(100) | | Cuisine type |
| category | ENUM | DEFAULT 'Other' | Menu category |
| price_per_person | DECIMAL(10,2) | NOT NULL | Price per person |
| min_guests | INT | DEFAULT 1 | Minimum guests |
| max_guests | INT | DEFAULT 50 | Maximum guests |
| courses | INT | DEFAULT 3 | Number of courses |
| dietary_options | TEXT | | Dietary accommodations |
| image_url | VARCHAR(255) | | Menu image |
| is_active | BOOLEAN | DEFAULT true | Active status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |

**Categories:** Casual, Fine Dining, BBQ, Buffet, Brunch, Afternoon Tea, Canape, Christmas, Vegetarian, Other

**Indexes:** chef_id, cuisine_type, category, is_active

---

### 4. menu_items
Individual items within menus.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Item ID |
| menu_id | INT | FOREIGN KEY -> menus(id) | Parent menu |
| course_type | ENUM | NOT NULL | Course type |
| name | VARCHAR(255) | NOT NULL | Dish name |
| description | TEXT | | Dish description |
| dietary_tags | TEXT | | Dietary tags |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation date |

**Course Types:** Starter, Main, Dessert, Side, Canape, Other

**Indexes:** menu_id

---

### 5. bookings
Customer bookings with chefs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Booking ID |
| customer_id | INT | FOREIGN KEY -> users(id) | Customer |
| chef_id | INT | FOREIGN KEY -> users(id) | Chef |
| menu_id | INT | FOREIGN KEY -> menus(id) | Selected menu |
| event_date | DATE | NOT NULL | Event date |
| event_time | TIME | NOT NULL | Event time |
| guest_count | INT | NOT NULL | Number of guests |
| event_type | VARCHAR(100) | | Event type |
| event_location | VARCHAR(255) | NOT NULL | Event address |
| special_requests | TEXT | | Special requests |
| total_price | DECIMAL(10,2) | NOT NULL | Total booking price |
| status | ENUM | DEFAULT 'pending' | Booking status |
| payment_status | ENUM | DEFAULT 'pending' | Payment status |
| cancellation_reason | TEXT | | Cancellation reason |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Booking creation |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |

**Status Values:** pending, confirmed, in_progress, completed, cancelled

**Payment Status:** pending, deposit_paid, fully_paid, refunded

**Indexes:** customer_id, chef_id, event_date, status

---

### 6. reviews
Customer reviews for completed bookings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Review ID |
| booking_id | INT | UNIQUE, FOREIGN KEY -> bookings(id) | Related booking |
| customer_id | INT | FOREIGN KEY -> users(id) | Reviewer |
| chef_id | INT | FOREIGN KEY -> users(id) | Reviewed chef |
| rating | INT | NOT NULL, CHECK 1-5 | Overall rating |
| food_quality | INT | CHECK 1-5 | Food quality rating |
| professionalism | INT | CHECK 1-5 | Professionalism rating |
| value_for_money | INT | CHECK 1-5 | Value rating |
| comment | TEXT | | Review text |
| response | TEXT | | Chef response |
| images | TEXT | | Review images JSON |
| helpful_count | INT | DEFAULT 0 | Helpful votes |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Review date |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |

**Indexes:** chef_id, rating, created_at

---

### 7. chef_photos
Portfolio photos for chefs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Photo ID |
| chef_id | INT | FOREIGN KEY -> users(id) | Chef |
| image_url | VARCHAR(255) | NOT NULL | Image URL |
| caption | TEXT | | Photo caption |
| is_portfolio | BOOLEAN | DEFAULT true | Portfolio flag |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Upload date |

**Indexes:** chef_id

---

### 8. chef_availability
Chef availability calendar.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Entry ID |
| chef_id | INT | FOREIGN KEY -> users(id) | Chef |
| date | DATE | NOT NULL | Specific date |
| is_available | BOOLEAN | DEFAULT true | Available flag |
| reason | VARCHAR(255) | | Unavailability reason |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation date |

**Unique:** (chef_id, date)

**Indexes:** chef_id, date

---

### 9. messages
Booking-related messages between users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Message ID |
| booking_id | INT | FOREIGN KEY -> bookings(id) | Related booking |
| sender_id | INT | FOREIGN KEY -> users(id) | Sender |
| receiver_id | INT | FOREIGN KEY -> users(id) | Receiver |
| message | TEXT | NOT NULL | Message text |
| is_read | BOOLEAN | DEFAULT false | Read status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Send date |

**Indexes:** booking_id, (receiver_id, is_read)

---

### 10. favorites
Customer favorite chefs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Favorite ID |
| customer_id | INT | FOREIGN KEY -> users(id) | Customer |
| chef_id | INT | FOREIGN KEY -> users(id) | Favorited chef |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Favorite date |

**Unique:** (customer_id, chef_id)

**Indexes:** customer_id

---

## Relationships

```
users (customer) --< bookings >-- users (chef)
users (chef) --< chef_profiles
users (chef) --< menus --< menu_items
bookings --< reviews
users (chef) --< chef_photos
users (chef) --< chef_availability
bookings --< messages >-- users
users (customer) --< favorites >-- users (chef)
```

---

## Key Features

1. **User Management**: Separate customer and chef accounts with role-based access
2. **Chef Profiles**: Rich profiles with ratings, certifications, and portfolio
3. **Menu System**: Flexible menu creation with multiple cuisines and dietary options
4. **Booking Workflow**: Complete booking lifecycle from pending to completed
5. **Review System**: Detailed multi-criteria reviews with chef responses
6. **File Management**: Support for profile images and photo galleries
7. **Messaging**: In-app communication between customers and chefs
8. **Favorites**: Customers can save preferred chefs

---

## Sample Queries

### Find Available Chefs in London
```sql
SELECT cp.*, u.first_name, u.last_name, u.location
FROM chef_profiles cp
JOIN users u ON cp.user_id = u.id
WHERE cp.is_available = true 
  AND u.location LIKE '%London%'
ORDER BY cp.average_rating DESC;
```

### Get Chef's Upcoming Bookings
```sql
SELECT b.*, u.first_name, u.last_name, m.title
FROM bookings b
JOIN users u ON b.customer_id = u.id
LEFT JOIN menus m ON b.menu_id = m.id
WHERE b.chef_id = ? 
  AND b.event_date >= CURDATE()
  AND b.status != 'cancelled'
ORDER BY b.event_date, b.event_time;
```

### Calculate Chef Rating Summary
```sql
SELECT 
  COUNT(*) as total_reviews,
  AVG(rating) as average_rating,
  AVG(food_quality) as avg_food,
  AVG(professionalism) as avg_professionalism,
  AVG(value_for_money) as avg_value
FROM reviews
WHERE chef_id = ?;
```

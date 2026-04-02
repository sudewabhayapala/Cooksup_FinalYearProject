# Database Structure

## Database
- **Name:** `cooksup_db`
- **Engine:** MySQL (InnoDB, utf8mb4)

## Core Tables

### 1) `users`
Stores all platform users (customers + chefs).
- `id` (PK)
- `email` (UNIQUE, NOT NULL)
- `password` (NOT NULL)
- `first_name`, `last_name` (NOT NULL)
- `phone`
- `user_type` ENUM('customer','chef')
- `location`
- `profile_image`
- `created_at`, `updated_at`

### 2) `chef_profiles`
Extended details for chef users (1:1 with users).
- `id` (PK)
- `user_id` (UNIQUE, FK -> users.id)
- `bio`, `specialties`, `cuisine_types`, `certifications`
- `experience_years`, `hourly_rate`, `min_spend`
- `profile_image`, `cover_image`
- `is_available`, `total_bookings`, `average_rating`
- `michelin_stars`, `celebrity_clients`, `featured`
- `created_at`, `updated_at`

### 3) `menus`
Menus created by chefs.
- `id` (PK)
- `chef_id` (FK -> users.id)
- `title`, `description`, `cuisine_type`
- `category` ENUM(...)
- `price_per_person`, `min_guests`, `max_guests`, `courses`
- `dietary_options`, `image_url`, `is_active`
- `created_at`, `updated_at`

### 4) `menu_items`
Items inside a menu.
- `id` (PK)
- `menu_id` (FK -> menus.id)
- `course_type` ENUM('Starter','Main','Dessert','Side','Canape','Other')
- `name`, `description`, `dietary_tags`
- `created_at`

### 5) `bookings`
Customer bookings with chefs.
- `id` (PK)
- `customer_id` (FK -> users.id)
- `chef_id` (FK -> users.id)
- `menu_id` (FK -> menus.id, nullable)
- `event_date`, `event_time`, `guest_count`
- `event_type`, `event_location`, `special_requests`
- `total_price`
- `status` ENUM('pending','confirmed','in_progress','completed','cancelled')
- `payment_status` ENUM('pending','deposit_paid','fully_paid','refunded')
- `cancellation_reason`
- `created_at`, `updated_at`

### 6) `reviews`
Review per completed booking.
- `id` (PK)
- `booking_id` (UNIQUE, FK -> bookings.id)
- `customer_id` (FK -> users.id)
- `chef_id` (FK -> users.id)
- `rating` (1-5)
- `food_quality`, `professionalism`, `value_for_money` (1-5)
- `comment`, `response`, `images`, `helpful_count`
- `created_at`, `updated_at`

### 7) `chef_photos`
Chef gallery photos.
- `id` (PK)
- `chef_id` (FK -> users.id)
- `image_url`, `caption`, `is_portfolio`
- `created_at`

### 8) `chef_availability`
Chef date-wise availability.
- `id` (PK)
- `chef_id` (FK -> users.id)
- `date`, `is_available`, `reason`
- `created_at`
- UNIQUE(`chef_id`, `date`)

### 9) `messages`
Booking chat between users.
- `id` (PK)
- `booking_id` (FK -> bookings.id)
- `sender_id` (FK -> users.id)
- `receiver_id` (FK -> users.id)
- `message`, `is_read`
- `created_at`

### 10) `favorites`
Saved chefs by customers.
- `id` (PK)
- `customer_id` (FK -> users.id)
- `chef_id` (FK -> users.id)
- `created_at`
- UNIQUE(`customer_id`, `chef_id`)

## Relationships (ER-style)
- `users (chef)` 1 --- 1 `chef_profiles`
- `users (chef)` 1 --- N `menus`
- `menus` 1 --- N `menu_items`
- `users (customer)` 1 --- N `bookings`
- `users (chef)` 1 --- N `bookings`
- `bookings` 1 --- 0..1 `reviews`
- `users (chef)` 1 --- N `chef_photos`
- `users (chef)` 1 --- N `chef_availability`
- `bookings` 1 --- N `messages`
- `users (customer)` N --- N `users (chef)` via `favorites`

## Important Indexes
- `users(email)`, `users(user_type)`
- `chef_profiles(is_available, featured, average_rating)`
- `menus(chef_id, cuisine_type, category, is_active)`
- `bookings(customer_id, chef_id, event_date, status)`
- `reviews(chef_id, rating, created_at)`

## Triggers / Views
- Trigger: `after_booking_insert` (increments chef total bookings for completed bookings)
- Trigger: `after_review_insert` (recalculates chef average rating)
- View: `v_available_chefs`
- View: `v_booking_details`

## Source of Truth
- Full SQL schema: `backend/schema.sql`
- Full detailed documentation: `backend/DATABASE.md`

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Mar 25, 2026 at 05:26 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cooksup_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `chef_id` int(11) NOT NULL,
  `menu_id` int(11) DEFAULT NULL,
  `event_date` date NOT NULL,
  `event_time` time NOT NULL,
  `guest_count` int(11) NOT NULL,
  `event_type` varchar(100) DEFAULT NULL,
  `event_location` varchar(255) NOT NULL,
  `special_requests` text DEFAULT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','in_progress','completed','cancelled') DEFAULT 'pending',
  `payment_status` enum('pending','deposit_paid','fully_paid','refunded') DEFAULT 'pending',
  `cancellation_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `customer_id`, `chef_id`, `menu_id`, `event_date`, `event_time`, `guest_count`, `event_type`, `event_location`, `special_requests`, `total_price`, `status`, `payment_status`, `cancellation_reason`, `created_at`, `updated_at`) VALUES
(4, 16, 11, NULL, '2026-03-25', '22:20:00', 10, 'wedding', 'sri lanka', 'Menu requirements: non veg', 499.99, 'confirmed', 'fully_paid', NULL, '2026-03-25 13:49:09', '2026-03-25 13:57:00'),
(5, 16, 15, NULL, '2026-03-25', '22:35:00', 20, 'wedding', 'london', '', 499.99, 'confirmed', 'fully_paid', NULL, '2026-03-25 14:01:12', '2026-03-25 14:02:37');

--
-- Triggers `bookings`
--
DELIMITER $$
CREATE TRIGGER `after_booking_insert` AFTER INSERT ON `bookings` FOR EACH ROW BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE chef_profiles 
    SET total_bookings = total_bookings + 1 
    WHERE user_id = NEW.chef_id;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `chef_availability`
--

CREATE TABLE `chef_availability` (
  `id` int(11) NOT NULL,
  `chef_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chef_photos`
--

CREATE TABLE `chef_photos` (
  `id` int(11) NOT NULL,
  `chef_id` int(11) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `caption` text DEFAULT NULL,
  `is_portfolio` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chef_profiles`
--

CREATE TABLE `chef_profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `bio` text DEFAULT NULL,
  `specialties` text DEFAULT NULL,
  `experience_years` int(11) DEFAULT 0,
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `min_spend` decimal(10,2) DEFAULT NULL,
  `cuisine_types` text DEFAULT NULL,
  `certifications` text DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `total_bookings` int(11) DEFAULT 0,
  `average_rating` decimal(3,2) DEFAULT 0.00,
  `michelin_stars` int(11) DEFAULT 0,
  `celebrity_clients` text DEFAULT NULL,
  `featured` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chef_profiles`
--

INSERT INTO `chef_profiles` (`id`, `user_id`, `bio`, `specialties`, `experience_years`, `hourly_rate`, `min_spend`, `cuisine_types`, `certifications`, `profile_image`, `cover_image`, `is_available`, `total_bookings`, `average_rating`, `michelin_stars`, `celebrity_clients`, `featured`, `created_at`, `updated_at`) VALUES
(4, 11, 'aaaaaaaaaaaa', 'fine dining', 4, 20.00, 500.00, 'asian', 'cia', '/uploads/profile/image-1774420392391-356614782.jpeg', '/uploads/cover/image-1774420392395-964950038.jpg', 1, 0, 0.00, 0, NULL, 0, '2026-03-24 14:32:01', '2026-03-25 06:51:36'),
(5, 13, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, 0.00, 0, NULL, 0, '2026-03-25 06:55:06', '2026-03-25 06:55:06'),
(6, 14, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, 0.00, 0, NULL, 0, '2026-03-25 06:55:57', '2026-03-25 06:55:57'),
(7, 15, '', 'fine dining', 1, 10.00, 200.00, 'italian', '', '/uploads/profile/image-1774421838478-312796404.jpg', '/uploads/cover/image-1774421838479-651290812.jpg', 1, 0, 0.00, 0, NULL, 0, '2026-03-25 06:56:44', '2026-03-25 06:58:37');

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `chef_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `menus`
--

CREATE TABLE `menus` (
  `id` int(11) NOT NULL,
  `chef_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `cuisine_type` varchar(100) DEFAULT NULL,
  `category` enum('Casual','Fine Dining','BBQ','Buffet','Brunch','Afternoon Tea','Canape','Christmas','Vegetarian','Other') DEFAULT 'Other',
  `price_per_person` decimal(10,2) NOT NULL,
  `min_guests` int(11) DEFAULT 1,
  `max_guests` int(11) DEFAULT 50,
  `courses` int(11) DEFAULT 3,
  `dietary_options` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `menu_items`
--

CREATE TABLE `menu_items` (
  `id` int(11) NOT NULL,
  `menu_id` int(11) NOT NULL,
  `course_type` enum('Starter','Main','Dessert','Side','Canape','Other') NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `dietary_tags` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `chef_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `food_quality` int(11) DEFAULT NULL CHECK (`food_quality` >= 1 and `food_quality` <= 5),
  `professionalism` int(11) DEFAULT NULL CHECK (`professionalism` >= 1 and `professionalism` <= 5),
  `value_for_money` int(11) DEFAULT NULL CHECK (`value_for_money` >= 1 and `value_for_money` <= 5),
  `comment` text DEFAULT NULL,
  `response` text DEFAULT NULL,
  `images` text DEFAULT NULL,
  `helpful_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `reviews`
--
DELIMITER $$
CREATE TRIGGER `after_review_insert` AFTER INSERT ON `reviews` FOR EACH ROW BEGIN
  UPDATE chef_profiles 
  SET average_rating = (
    SELECT COALESCE(AVG(rating), 0) 
    FROM reviews 
    WHERE chef_id = NEW.chef_id
  )
  WHERE user_id = NEW.chef_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `user_type` enum('customer','chef') NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `first_name`, `last_name`, `phone`, `user_type`, `location`, `profile_image`, `created_at`, `updated_at`) VALUES
(1, 'demo@customer.com', '$2a$10$YourHashedPasswordHere', 'Demo', 'Customer', '+44 7700 900000', 'customer', 'London, UK', NULL, '2026-02-28 17:36:39', '2026-02-28 17:36:39'),
(2, 'demo@chef.com', '$2a$10$YourHashedPasswordHere', 'Demo', 'Chef', '+44 7700 900100', 'chef', 'London, UK', NULL, '2026-02-28 17:37:02', '2026-02-28 17:37:02'),
(3, 'testuser_20260302234006@example.com', '$2a$10$d/sL8F40ALkrgM6h7poVIu7iolFyZoC9cx8zTPwPqRinI.2kITcdW', 'Test', 'User', '1234567890', 'customer', 'Test City', NULL, '2026-03-02 18:10:06', '2026-03-02 18:10:06'),
(11, 'sudew@gmail.com', '$2a$10$0f3nIAIXzmn2wL9DmwY3iezBxIXJGQGWmpL64CxSfdD8hysTgwPh.', 'sudew', 'abayapala', '+94766577836', 'chef', 'sri lanka', NULL, '2026-03-24 14:32:01', '2026-03-24 14:32:01'),
(13, 'han@gmail.com', '$2a$10$9WNLKwHCMDPovih17qu46eydTRufjInM2g5XxzZFcVk6Sw2JlauXO', 'han', 'dee', '+94766577836', 'chef', 'sri lanka', NULL, '2026-03-25 06:55:06', '2026-03-25 06:55:06'),
(14, 'gem@gmail.com', '$2a$10$faBKptElWj7pv3dQJgeCiOEgNNf4H9f3V1W2bTKV4bpOu34y3New6', 'gem', 'dee', '0772346288', 'chef', 'new castle', NULL, '2026-03-25 06:55:57', '2026-03-25 06:55:57'),
(15, 'ben@gmail.com', '$2a$10$nWwErmuMKkelJ1Tl3xFrrOq0ZaTt51VnZUyP9Q7a6YrhniRTyzU8S', 'ben', 'dee', '0777483641', 'chef', 'london', NULL, '2026-03-25 06:56:44', '2026-03-25 06:56:44'),
(16, 'senath@gmail.com', '$2a$10$x4u8fzRb77JyDrQHE30SjeHwY666B7xT82aAeQfXnlxJbw1T/BvDW', 'senath', 'Punsith', '+94766577836', 'customer', 'sri lanka', NULL, '2026-03-25 13:48:10', '2026-03-25 13:48:10');

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_available_chefs`
-- (See below for the actual view)
--
CREATE TABLE `v_available_chefs` (
`id` int(11)
,`user_id` int(11)
,`first_name` varchar(100)
,`last_name` varchar(100)
,`email` varchar(255)
,`phone` varchar(20)
,`location` varchar(255)
,`bio` text
,`specialties` text
,`experience_years` int(11)
,`hourly_rate` decimal(10,2)
,`min_spend` decimal(10,2)
,`cuisine_types` text
,`profile_image` varchar(255)
,`average_rating` decimal(3,2)
,`total_bookings` int(11)
,`michelin_stars` int(11)
,`featured` tinyint(1)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_booking_details`
-- (See below for the actual view)
--
CREATE TABLE `v_booking_details` (
`id` int(11)
,`event_date` date
,`event_time` time
,`guest_count` int(11)
,`event_type` varchar(100)
,`event_location` varchar(255)
,`total_price` decimal(10,2)
,`status` enum('pending','confirmed','in_progress','completed','cancelled')
,`payment_status` enum('pending','deposit_paid','fully_paid','refunded')
,`customer_first_name` varchar(100)
,`customer_last_name` varchar(100)
,`customer_email` varchar(255)
,`customer_phone` varchar(20)
,`chef_first_name` varchar(100)
,`chef_last_name` varchar(100)
,`chef_email` varchar(255)
,`chef_phone` varchar(20)
,`menu_title` varchar(255)
,`price_per_person` decimal(10,2)
,`created_at` timestamp
);

-- --------------------------------------------------------

--
-- Structure for view `v_available_chefs`
--
DROP TABLE IF EXISTS `v_available_chefs`;

CREATE ALGORITHM=UNDEFINED DEFINER=`` SQL SECURITY DEFINER VIEW `v_available_chefs`  AS SELECT `cp`.`id` AS `id`, `cp`.`user_id` AS `user_id`, `u`.`first_name` AS `first_name`, `u`.`last_name` AS `last_name`, `u`.`email` AS `email`, `u`.`phone` AS `phone`, `u`.`location` AS `location`, `cp`.`bio` AS `bio`, `cp`.`specialties` AS `specialties`, `cp`.`experience_years` AS `experience_years`, `cp`.`hourly_rate` AS `hourly_rate`, `cp`.`min_spend` AS `min_spend`, `cp`.`cuisine_types` AS `cuisine_types`, `cp`.`profile_image` AS `profile_image`, `cp`.`average_rating` AS `average_rating`, `cp`.`total_bookings` AS `total_bookings`, `cp`.`michelin_stars` AS `michelin_stars`, `cp`.`featured` AS `featured` FROM (`chef_profiles` `cp` join `users` `u` on(`cp`.`user_id` = `u`.`id`)) WHERE `cp`.`is_available` = 1 ;

-- --------------------------------------------------------

--
-- Structure for view `v_booking_details`
--
DROP TABLE IF EXISTS `v_booking_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`` SQL SECURITY DEFINER VIEW `v_booking_details`  AS SELECT `b`.`id` AS `id`, `b`.`event_date` AS `event_date`, `b`.`event_time` AS `event_time`, `b`.`guest_count` AS `guest_count`, `b`.`event_type` AS `event_type`, `b`.`event_location` AS `event_location`, `b`.`total_price` AS `total_price`, `b`.`status` AS `status`, `b`.`payment_status` AS `payment_status`, `cu`.`first_name` AS `customer_first_name`, `cu`.`last_name` AS `customer_last_name`, `cu`.`email` AS `customer_email`, `cu`.`phone` AS `customer_phone`, `ch`.`first_name` AS `chef_first_name`, `ch`.`last_name` AS `chef_last_name`, `ch`.`email` AS `chef_email`, `ch`.`phone` AS `chef_phone`, `m`.`title` AS `menu_title`, `m`.`price_per_person` AS `price_per_person`, `b`.`created_at` AS `created_at` FROM (((`bookings` `b` join `users` `cu` on(`b`.`customer_id` = `cu`.`id`)) join `users` `ch` on(`b`.`chef_id` = `ch`.`id`)) left join `menus` `m` on(`b`.`menu_id` = `m`.`id`)) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `menu_id` (`menu_id`),
  ADD KEY `idx_customer` (`customer_id`),
  ADD KEY `idx_chef` (`chef_id`),
  ADD KEY `idx_event_date` (`event_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_booking_status_date` (`status`,`event_date`);

--
-- Indexes for table `chef_availability`
--
ALTER TABLE `chef_availability`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_chef_date` (`chef_id`,`date`),
  ADD KEY `idx_chef_date` (`chef_id`,`date`);

--
-- Indexes for table `chef_photos`
--
ALTER TABLE `chef_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_chef_id` (`chef_id`);

--
-- Indexes for table `chef_profiles`
--
ALTER TABLE `chef_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_available` (`is_available`),
  ADD KEY `idx_featured` (`featured`),
  ADD KEY `idx_rating` (`average_rating`),
  ADD KEY `idx_chef_rating_available` (`average_rating`,`is_available`);

--
-- Indexes for table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_favorite` (`customer_id`,`chef_id`),
  ADD KEY `chef_id` (`chef_id`),
  ADD KEY `idx_customer` (`customer_id`);

--
-- Indexes for table `menus`
--
ALTER TABLE `menus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_chef_id` (`chef_id`),
  ADD KEY `idx_cuisine` (`cuisine_type`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_menu_id` (`menu_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `idx_booking` (`booking_id`),
  ADD KEY `idx_receiver` (`receiver_id`,`is_read`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_id` (`booking_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `idx_chef_id` (`chef_id`),
  ADD KEY `idx_rating` (`rating`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_user_type` (`user_type`),
  ADD KEY `idx_chef_location` (`user_type`,`location`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `chef_availability`
--
ALTER TABLE `chef_availability`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chef_photos`
--
ALTER TABLE `chef_photos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chef_profiles`
--
ALTER TABLE `chef_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `menus`
--
ALTER TABLE `menus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `menu_items`
--
ALTER TABLE `menu_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`chef_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `chef_availability`
--
ALTER TABLE `chef_availability`
  ADD CONSTRAINT `chef_availability_ibfk_1` FOREIGN KEY (`chef_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chef_photos`
--
ALTER TABLE `chef_photos`
  ADD CONSTRAINT `chef_photos_ibfk_1` FOREIGN KEY (`chef_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chef_profiles`
--
ALTER TABLE `chef_profiles`
  ADD CONSTRAINT `chef_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`chef_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `menus`
--
ALTER TABLE `menus`
  ADD CONSTRAINT `menus_ibfk_1` FOREIGN KEY (`chef_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD CONSTRAINT `menu_items_ibfk_1` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`chef_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- 1. Create table for Top Destinations
CREATE TABLE IF NOT EXISTS `tbl_topdestinations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `country` VARCHAR(255) DEFAULT NULL,
  `code` VARCHAR(10) DEFAULT NULL,
  `region` VARCHAR(50) DEFAULT NULL,
  `hero_image` VARCHAR(500) DEFAULT NULL,
  `description` TEXT,
  `from_price` DECIMAL(10, 2) DEFAULT NULL,
  `is_featured` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_topdestinations_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create table for Flight Deals
CREATE TABLE IF NOT EXISTS `tbl_flightdeals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `origin_city` VARCHAR(255) DEFAULT NULL,
  `destination` VARCHAR(255) DEFAULT NULL,
  `airline_name` VARCHAR(255) DEFAULT NULL,
  `country` VARCHAR(255) DEFAULT NULL,
  `duration_days` INT DEFAULT NULL,
  `base_price` DECIMAL(10, 2) DEFAULT NULL,
  `thumbnail_url` VARCHAR(500) DEFAULT NULL,
  `is_flash_sale` TINYINT(1) DEFAULT 0,
  `expires_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_flightdeals_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create table for Popular Packages
CREATE TABLE IF NOT EXISTS `tbl_popularpackage` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `origin_city` VARCHAR(255) DEFAULT NULL,
  `destination` VARCHAR(255) DEFAULT NULL,
  `airline_name` VARCHAR(255) DEFAULT NULL,
  `country` VARCHAR(255) DEFAULT NULL,
  `duration_days` INT DEFAULT NULL,
  `base_price` DECIMAL(10, 2) DEFAULT NULL,
  `thumbnail_url` VARCHAR(500) DEFAULT NULL,
  `is_flash_sale` TINYINT(1) DEFAULT 0,
  `expires_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_popularpackage_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

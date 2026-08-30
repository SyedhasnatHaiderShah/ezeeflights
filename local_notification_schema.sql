-- 1. Drop existing table (Warning: clears all existing notification data)
DROP TABLE IF EXISTS `tbl_notification`;

-- 2. Create the new IN-APP notification table
CREATE TABLE `tbl_notification` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `type` varchar(20) NOT NULL DEFAULT 'IN_APP',
  `payload` json NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create the new EMAIL notification table (for outbound templated messages)
CREATE TABLE `tbl_email_notification` (
  `id` varchar(36) NOT NULL,
  `record_type` varchar(20) NOT NULL DEFAULT 'MESSAGE',
  `user_id` varchar(36) DEFAULT NULL,
  `booking_type` varchar(20) DEFAULT NULL,
  `booking_ref` varchar(50) DEFAULT NULL,
  `booking_id` varchar(50) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(25) DEFAULT NULL,
  `type` varchar(20) NOT NULL,
  `template_name` varchar(120) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'PENDING',
  `payload` json NOT NULL,
  `travel_date` datetime DEFAULT NULL,
  `retry_count` int NOT NULL DEFAULT '0',
  `next_attempt_at` timestamp NULL DEFAULT NULL,
  `delivery_logs` json DEFAULT NULL,
  `last_response` json DEFAULT NULL,
  `last_error_message` text,
  `sent_at` timestamp NULL DEFAULT NULL,
  `template_subject` varchar(255) DEFAULT NULL,
  `template_body` text,
  `template_variables` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

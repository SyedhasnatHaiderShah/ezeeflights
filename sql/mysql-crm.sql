-- =============================================================================
-- EzeeFlights CRM MySQL (mysql2) — tables + idempotent migrations
-- =============================================================================
--
-- Target an EXISTING CRM database (do not rely on CREATE DATABASE here):
--
--   Local:        mysql -u root -p ezeeflights_crm < sql/mysql-crm.sql
--   Production:   mysql -h HOST -u USER -p worldrix_ezeecrm < sql/mysql-crm.sql
--
-- First-time local DB + app user (optional):
--   mysql -u root -p < sql/mysql-crm-local-bootstrap.sql
--
-- Automatic migrations (no shell required):
--   On backend startup: CrmSchemaBootstrap → ensureMysqlCrmSchema()
--   On every flight booking CRM save: same ensureMysqlCrmSchema() runs again.
--   Set MYSQL_* env vars; restart backend to create tbl_* tables locally.
--
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Core tables (safe on empty DB or legacy CRM with same tbl_* names)
-- -----------------------------------------------------------------------------

/* 
CREATE TABLE IF NOT EXISTS tbl_customerdetails (
  Id INT(11) NOT NULL AUTO_INCREMENT,
  bookingRef VARCHAR(50) DEFAULT NULL,
  originFrom VARCHAR(10) DEFAULT NULL,
  destinationTo VARCHAR(10) DEFAULT NULL,
  airLine VARCHAR(10) DEFAULT NULL,
  travellType VARCHAR(10) DEFAULT NULL,
  cabin VARCHAR(25) DEFAULT NULL,
  departureDate DATETIME DEFAULT NULL,
  returnDate DATETIME DEFAULT NULL,
  address VARCHAR(50) DEFAULT NULL,
  phone VARCHAR(25) DEFAULT NULL,
  email VARCHAR(50) DEFAULT NULL,
  totalAmount DOUBLE DEFAULT NULL,
  status VARCHAR(11) DEFAULT '0',
  work_status VARCHAR(25) DEFAULT NULL,
  source VARCHAR(25) DEFAULT NULL,
  source_id VARCHAR(100) DEFAULT NULL,
  RefundShieldPercent INT(25) DEFAULT NULL,
  RefundShieldTotalAmount INT(25) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  RefundShieldBooking VARCHAR(10) DEFAULT NULL,
  PRIMARY KEY (Id),
  KEY status_index (status),
  KEY email_index (email),
  KEY work_status_index (work_status),
  KEY source_index (source),
  KEY idx_created_at (created_at),
  KEY idx_source_status_created (source, status, created_at)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
*/

-- tbl_customer.customerId → tbl_customerdetails.customerId (booking header FK)
/*
CREATE TABLE IF NOT EXISTS tbl_customer (
  cId INT(11) NOT NULL AUTO_INCREMENT,
  customerId INT(25) DEFAULT NULL,
  fullName VARCHAR(50) DEFAULT NULL,
  dob DATETIME DEFAULT NULL,
  gender VARCHAR(10) DEFAULT NULL,
  pessengerType VARCHAR(10) DEFAULT NULL,
  adtPrice DOUBLE DEFAULT NULL,
  chdPrice DOUBLE DEFAULT NULL,
  infPrice DOUBLE DEFAULT NULL,
  adtQty INT(11) DEFAULT NULL,
  chdQty INT(10) DEFAULT NULL,
  infQty INT(10) DEFAULT NULL,
  nationality VARCHAR(25) DEFAULT NULL,
  PRIMARY KEY (cId),
  KEY customerId_index (customerId),
  KEY fullName_index (fullName)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
*/

/*
CREATE TABLE IF NOT EXISTS tbl_flightdetailshtml (
  id INT(11) NOT NULL AUTO_INCREMENT,
  customerId INT(10) DEFAULT NULL,
  outBoundFlights TEXT DEFAULT NULL,
  inBoundFlights TEXT DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
*/

-- App users — single auth + profile table (no separate auth tables, no preferences JSON)
/* CREATE TABLE IF NOT EXISTS tbl_users (
  id VARCHAR(36) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash TEXT NULL,
  first_name VARCHAR(100) NULL,
  middle_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NULL,
  oauth_provider VARCHAR(50) NULL,
  oauth_provider_user_id VARCHAR(255) NULL,
  refresh_token_hash VARCHAR(64) NULL,
  refresh_token_expires_at TIMESTAMP NULL,
  refresh_token_revoked_at TIMESTAMP NULL,
  two_factor_enabled TINYINT(1) NOT NULL DEFAULT 0,
  two_factor_secret_ciphertext TEXT NULL,
  two_factor_pending_secret_ciphertext TEXT NULL,
  two_factor_backup_codes JSON NULL,
  password_reset_otp_id VARCHAR(36) NULL,
  password_reset_otp_hash VARCHAR(255) NULL,
  password_reset_otp_expires_at TIMESTAMP NULL,
  preferred_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  phone VARCHAR(20) NULL,
  date_of_birth DATE NULL,
  gender VARCHAR(20) NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'USER',
  nationality VARCHAR(50) NULL,
  passport_number VARCHAR(50) NULL,
  passport_expiry DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tbl_users_email (email),
  UNIQUE KEY uq_tbl_users_phone (phone),
  KEY idx_tbl_users_refresh_token_hash (refresh_token_hash),
  KEY idx_tbl_users_oauth_provider_user (oauth_provider, oauth_provider_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Unified notifications: messages, delivery logs, queue state, and admin templates
CREATE TABLE IF NOT EXISTS tbl_notification (
  id VARCHAR(36) NOT NULL,
  record_type VARCHAR(20) NOT NULL DEFAULT 'MESSAGE',
  user_id VARCHAR(36) NULL,
  booking_type VARCHAR(20) NULL,
  booking_ref VARCHAR(50) NULL,
  booking_id VARCHAR(50) NULL,
  contact_email VARCHAR(255) NULL,
  contact_phone VARCHAR(25) NULL,
  type VARCHAR(20) NOT NULL,
  template_name VARCHAR(120) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  payload JSON NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  travel_date DATETIME NULL,
  retry_count INT NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMP NULL,
  delivery_logs JSON NULL,
  last_response JSON NULL,
  last_error_message TEXT NULL,
  sent_at TIMESTAMP NULL,
  template_subject VARCHAR(255) NULL,
  template_body TEXT NULL,
  template_variables JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notification_user (user_id),
  KEY idx_notification_record_type (record_type),
  KEY idx_notification_booking_ref (booking_ref),
  KEY idx_notification_type_ref (booking_type, booking_ref),
  KEY idx_notification_template_ref (template_name, booking_ref),
  KEY idx_notification_travel_date (travel_date),
  KEY idx_notification_status (status),
  KEY idx_notification_next_attempt (next_attempt_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
*/


-- -----------------------------------------------------------------------------
-- 2. Migrations (idempotent — safe to re-run)
-- -----------------------------------------------------------------------------

-- Migration to rename Id to customerId removed to strictly match user's live database schema.

/*
-- 2b. tbl_customerdetails — web booking columns on older CRM DBs
SET @col := 'work_status';
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tbl_customerdetails' AND COLUMN_NAME = @col
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE tbl_customerdetails ADD COLUMN work_status VARCHAR(50) NULL DEFAULT ''pending'' AFTER status',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := 'source';
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tbl_customerdetails' AND COLUMN_NAME = @col
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE tbl_customerdetails ADD COLUMN source VARCHAR(50) NULL DEFAULT ''web'' AFTER work_status',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := 'source_id';
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tbl_customerdetails' AND COLUMN_NAME = @col
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE tbl_customerdetails ADD COLUMN source_id VARCHAR(50) NULL AFTER source',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2c. tbl_customer — per-passenger fare columns
SET @col := 'adtPrice';
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tbl_customer' AND COLUMN_NAME = @col
);
SET @sql := IF(@exists = 0, 'ALTER TABLE tbl_customer ADD COLUMN adtPrice DOUBLE NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := 'chdPrice';
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tbl_customer' AND COLUMN_NAME = @col
);
SET @sql := IF(@exists = 0, 'ALTER TABLE tbl_customer ADD COLUMN chdPrice DOUBLE NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := 'infPrice';
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tbl_customer' AND COLUMN_NAME = @col
);
SET @sql := IF(@exists = 0, 'ALTER TABLE tbl_customer ADD COLUMN infPrice DOUBLE NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := 'adtQty';
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tbl_customer' AND COLUMN_NAME = @col
);
SET @sql := IF(@exists = 0, 'ALTER TABLE tbl_customer ADD COLUMN adtQty INT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := 'chdQty';
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tbl_customer' AND COLUMN_NAME = @col
);
SET @sql := IF(@exists = 0, 'ALTER TABLE tbl_customer ADD COLUMN chdQty INT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := 'infQty';
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tbl_customer' AND COLUMN_NAME = @col
);
SET @sql := IF(@exists = 0, 'ALTER TABLE tbl_customer ADD COLUMN infQty INT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
*/

-- 2d. tbl_users — auth columns on tbl_users table only (no separate auth tables)
/* SET @col := 'oauth_provider_user_id';
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tbl_users' AND COLUMN_NAME = @col
);
SET @sql := IF(@exists = 0, 'ALTER TABLE tbl_users ADD COLUMN oauth_provider_user_id VARCHAR(255) NULL AFTER oauth_provider', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := 'refresh_token_hash';
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tbl_users' AND COLUMN_NAME = @col
);
SET @sql := IF(@exists = 0, 'ALTER TABLE tbl_users ADD COLUMN refresh_token_hash VARCHAR(64) NULL AFTER oauth_provider_user_id', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := 'refresh_token_expires_at';
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tbl_users' AND COLUMN_NAME = @col
);
SET @sql := IF(@exists = 0, 'ALTER TABLE tbl_users ADD COLUMN refresh_token_expires_at TIMESTAMP NULL AFTER refresh_token_hash', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := 'refresh_token_revoked_at';
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tbl_users' AND COLUMN_NAME = @col
);
SET @sql := IF(@exists = 0, 'ALTER TABLE tbl_users ADD COLUMN refresh_token_revoked_at TIMESTAMP NULL AFTER refresh_token_expires_at', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := 'two_factor_enabled';
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tbl_users' AND COLUMN_NAME = @col
);
SET @sql := IF(@exists = 0, 'ALTER TABLE tbl_users ADD COLUMN two_factor_enabled TINYINT(1) NOT NULL DEFAULT 0 AFTER refresh_token_revoked_at', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := 'two_factor_secret_ciphertext';
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tbl_users' AND COLUMN_NAME = @col
);
SET @sql := IF(@exists = 0, 'ALTER TABLE tbl_users ADD COLUMN two_factor_secret_ciphertext TEXT NULL AFTER two_factor_enabled', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := 'two_factor_pending_secret_ciphertext';
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tbl_users' AND COLUMN_NAME = @col
);
SET @sql := IF(@exists = 0, 'ALTER TABLE tbl_users ADD COLUMN two_factor_pending_secret_ciphertext TEXT NULL AFTER two_factor_secret_ciphertext', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := 'two_factor_backup_codes';
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tbl_users' AND COLUMN_NAME = @col
);
SET @sql := IF(@exists = 0, 'ALTER TABLE tbl_users ADD COLUMN two_factor_backup_codes JSON NULL AFTER two_factor_pending_secret_ciphertext', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := 'password_reset_otp_id';
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tbl_users' AND COLUMN_NAME = @col
);
SET @sql := IF(@exists = 0, 'ALTER TABLE tbl_users ADD COLUMN password_reset_otp_id VARCHAR(36) NULL AFTER two_factor_backup_codes', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := 'password_reset_otp_hash';
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tbl_users' AND COLUMN_NAME = @col
);
SET @sql := IF(@exists = 0, 'ALTER TABLE tbl_users ADD COLUMN password_reset_otp_hash VARCHAR(255) NULL AFTER password_reset_otp_id', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col := 'password_reset_otp_expires_at';
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tbl_users' AND COLUMN_NAME = @col
);
SET @sql := IF(@exists = 0, 'ALTER TABLE tbl_users ADD COLUMN password_reset_otp_expires_at TIMESTAMP NULL AFTER password_reset_otp_hash', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
*/
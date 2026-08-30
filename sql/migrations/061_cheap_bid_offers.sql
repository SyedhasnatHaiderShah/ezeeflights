-- 061_cheap_bid_offers.sql
-- Admin/agent time-limited flight price overrides (Cheap Bid).
-- Note: tbl_cheap_bid (booking_ref, bid_status, …) is a separate legacy booking-audit table.

CREATE TABLE IF NOT EXISTS tbl_cheap_bid_offer (
  id INT NOT NULL AUTO_INCREMENT,
  source VARCHAR(25) DEFAULT NULL COMMENT 'Ezeeflight US, Ezeeflight CA, TravelHeights UK, etc.',

  originFrom VARCHAR(10) DEFAULT NULL,
  destinationTo VARCHAR(10) DEFAULT NULL,
  airLine VARCHAR(10) DEFAULT NULL,
  travellType VARCHAR(10) DEFAULT NULL COMMENT 'oneway | return',
  cabin VARCHAR(25) DEFAULT NULL,
  departureDate DATETIME DEFAULT NULL,
  returnDate DATETIME DEFAULT NULL,

  bidAdtPrice DOUBLE DEFAULT NULL COMMENT 'Discounted adult price set by admin',
  bidChdPrice DOUBLE DEFAULT NULL,
  bidInfPrice DOUBLE DEFAULT NULL,
  currency VARCHAR(5) DEFAULT 'USD',

  linkExpiryDate DATETIME DEFAULT NULL,
  status VARCHAR(20) DEFAULT 'active' COMMENT 'active | expired | booked | refunded | cancelled',

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY route_status_expiry_index (originFrom, destinationTo, status, linkExpiryDate),
  KEY status_index (status),
  KEY linkExpiryDate_index (linkExpiryDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


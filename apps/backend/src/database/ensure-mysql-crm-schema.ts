import { Logger } from "@nestjs/common";

export type MysqlCrmConnection = {
  execute: (sql: string) => Promise<unknown>;
  query: (sql: string) => Promise<unknown>;
};

const logger = new Logger("EnsureMysqlCrmSchema");

const CRM_TABLE_DDLS = [
  `CREATE TABLE IF NOT EXISTS tbl_notification (
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
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS tbl_hotel_booking_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bookingRef VARCHAR(50) NOT NULL UNIQUE,
    hotelChain VARCHAR(10) NULL,
    hotelCode VARCHAR(20) NULL,
    hotelName VARCHAR(255) NULL,
    locationCode VARCHAR(10) NULL,
    city VARCHAR(120) NULL,
    country VARCHAR(120) NULL,
    address VARCHAR(255) NULL,
    distance VARCHAR(50) NULL,
    referencePoint VARCHAR(50) NULL,
    reserveRequirement VARCHAR(50) NULL,
    availability VARCHAR(20) NULL,
    checkInDate DATETIME NULL,
    checkOutDate DATETIME NULL,
    contactPhone VARCHAR(25) NULL,
    contactEmail VARCHAR(100) NULL,
    pricePerNight DECIMAL(10, 2) NULL,
    totalAmount DECIMAL(10, 2) NULL,
    status VARCHAR(20) DEFAULT '0',
    work_status VARCHAR(50) DEFAULT 'pending',
    source VARCHAR(50) DEFAULT 'web',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS tbl_car_booking_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bookingRef VARCHAR(50) NOT NULL UNIQUE,
    vendorCode VARCHAR(10) NULL,
    vehicleClass VARCHAR(50) NULL,
    acrissCode VARCHAR(10) NULL,
    pickupLocation VARCHAR(10) NULL,
    pickupDateTime DATETIME NULL,
    returnLocation VARCHAR(10) NULL,
    returnDateTime DATETIME NULL,
    ratePerDay DECIMAL(10, 2) NULL,
    estimatedTotalAmount DECIMAL(10, 2) NULL,
    contactPhone VARCHAR(25) NULL,
    contactEmail VARCHAR(100) NULL,
    status VARCHAR(20) DEFAULT '0',
    work_status VARCHAR(50) DEFAULT 'pending',
    source VARCHAR(50) DEFAULT 'web',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS tbl_cheap_bid_offer (
    id INT NOT NULL AUTO_INCREMENT,
    source VARCHAR(25) DEFAULT NULL,
    originFrom VARCHAR(10) DEFAULT NULL,
    destinationTo VARCHAR(10) DEFAULT NULL,
    airLine VARCHAR(10) DEFAULT NULL,
    travellType VARCHAR(10) DEFAULT NULL,
    cabin VARCHAR(25) DEFAULT NULL,
    departureDate DATETIME DEFAULT NULL,
    returnDate DATETIME DEFAULT NULL,
    bidAdtPrice DOUBLE DEFAULT NULL,
    bidChdPrice DOUBLE DEFAULT NULL,
    bidInfPrice DOUBLE DEFAULT NULL,
    originalAdtPrice DOUBLE DEFAULT NULL,
    originalChdPrice DOUBLE DEFAULT NULL,
    originalInfPrice DOUBLE DEFAULT NULL,
    currency VARCHAR(5) DEFAULT 'USD',
    discountType VARCHAR(20) DEFAULT 'replace',
    linkExpiryDate DATETIME DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'active',
    flightId VARCHAR(255) DEFAULT NULL,
    stops INT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY route_status_expiry_index (originFrom, destinationTo, status, linkExpiryDate),
    KEY status_index (status),
    KEY linkExpiryDate_index (linkExpiryDate)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  /*
  `CREATE TABLE IF NOT EXISTS ad_offers (
    id VARCHAR(36) NOT NULL,
    flight_id VARCHAR(255) NOT NULL,
    partner_code VARCHAR(50) NOT NULL,
    partner_name VARCHAR(100) NOT NULL,
    partner_logo_url VARCHAR(255) NULL,
    origin VARCHAR(10) NOT NULL,
    destination VARCHAR(10) NOT NULL,
    departure_at TIMESTAMP NULL,
    arrival_at TIMESTAMP NULL,
    airline VARCHAR(100) NULL,
    flight_number VARCHAR(50) NULL,
    stops INT NOT NULL DEFAULT 0,
    display_price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2) NOT NULL,
    discount_pct DECIMAL(5, 4) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    deep_link_url TEXT NOT NULL,
    tracking_click_url TEXT NOT NULL,
    utm_source VARCHAR(50) NULL,
    utm_medium VARCHAR(50) NULL,
    utm_campaign VARCHAR(50) NULL,
    ref_code VARCHAR(50) NULL,
    t_code VARCHAR(50) NULL,
    cabin_class VARCHAR(50) NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_ad_offers_flight_id (flight_id),
    KEY idx_ad_offers_expires (expires_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS ad_click_events (
    id VARCHAR(36) NOT NULL,
    ad_offer_id VARCHAR(36) NOT NULL,
    user_ip VARCHAR(50) NOT NULL,
    user_agent TEXT NULL,
    country_code VARCHAR(10) NULL,
    clicked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    converted TINYINT(1) NOT NULL DEFAULT 0,
    commission_amount DECIMAL(10, 2) NULL,
    commission_currency VARCHAR(10) NULL,
    PRIMARY KEY (id),
    KEY idx_ad_clicks_offer (ad_offer_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS tbl_flight_inquiry_payment (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    payment_type VARCHAR(50) NOT NULL,
    razorpay_order_id VARCHAR(100) NOT NULL,
    razorpay_payment_id VARCHAR(100) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    metadata JSON NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_payment_order (razorpay_order_id),
    KEY idx_payment_user (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  */
];

async function ensureNotificationUnifiedColumns(
  connection: MysqlCrmConnection,
): Promise<void> {
  const columnAlters = [
    "record_type VARCHAR(20) NOT NULL DEFAULT 'MESSAGE'",
    "retry_count INT NOT NULL DEFAULT 0",
    "next_attempt_at TIMESTAMP NULL",
    "delivery_logs JSON NULL",
    "last_response JSON NULL",
    "last_error_message TEXT NULL",
    "sent_at TIMESTAMP NULL",
    "template_subject VARCHAR(255) NULL",
    "template_body TEXT NULL",
    "template_variables JSON NULL",
  ];

  for (const columnDef of columnAlters) {
    const colName = columnDef.split(" ")[0];
    try {
      await connection.execute(
        `ALTER TABLE tbl_notification ADD COLUMN ${columnDef}`,
      );
    } catch (err: any) {
      if (err?.code !== "ER_DUP_FIELDNAME") {
        logger.warn(`tbl_notification.${colName} alter: ${err?.message}`);
      }
    }
  }
}

/** Create CRM booking tables + apply idempotent column migrations (sql/mysql-crm.sql). */
export async function ensureMysqlCrmSchema(
  connection: MysqlCrmConnection,
): Promise<void> {
  for (const ddl of CRM_TABLE_DDLS) {
    try {
      await connection.execute(ddl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.warn(`CRM table ensure failed: ${message}`);
    }
  }

  await ensureNotificationUnifiedColumns(connection);

  const passengerColumnAlters = [
    "adtPrice DOUBLE NULL",
    "chdPrice DOUBLE NULL",
    "infPrice DOUBLE NULL",
    "adtQty INT NULL",
    "chdQty INT NULL",
    "infQty INT NULL",
  ];

  for (const columnDef of passengerColumnAlters) {
    const colName = columnDef.split(" ")[0];
    try {
      await connection.execute(
        `ALTER TABLE tbl_customer ADD COLUMN ${columnDef}`,
      );
    } catch (err: any) {
      if (err?.code !== "ER_DUP_FIELDNAME") {
        logger.warn(`CRM column ${colName} alter: ${err?.message}`);
      }
    }
  }

  const customerDetailsColumnAlters = [
    "work_status VARCHAR(50) NULL DEFAULT 'pending'",
    "source VARCHAR(50) NULL DEFAULT 'web'",
    "source_id VARCHAR(50) NULL",
  ];
  for (const columnDef of customerDetailsColumnAlters) {
    const colName = columnDef.split(" ")[0];
    try {
      await connection.execute(
        `ALTER TABLE tbl_customerdetails ADD COLUMN ${columnDef}`,
      );
    } catch (err: any) {
      if (err?.code !== "ER_DUP_FIELDNAME") {
        logger.warn(
          `CRM tbl_customerdetails.${colName} alter: ${err?.message}`,
        );
      }
    }
  }

  try {
    await connection.execute(
      `ALTER TABLE tbl_cheap_bid_offer ADD COLUMN discountType VARCHAR(20) DEFAULT 'replace'`,
    );
  } catch (err: any) {
    if (err?.code !== "ER_DUP_FIELDNAME") {
      logger.warn(`CRM tbl_cheap_bid_offer.discountType alter: ${err?.message}`);
    }
  }

  try {
    await connection.execute(
      `ALTER TABLE tbl_cheap_bid_offer ADD COLUMN stops INT DEFAULT NULL`,
    );
  } catch (err: any) {
    if (err?.code !== "ER_DUP_FIELDNAME") {
      logger.warn(`CRM tbl_cheap_bid_offer.stops alter: ${err?.message}`);
    }
  }
}

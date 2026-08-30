const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const queries = [
`CREATE TABLE IF NOT EXISTS \`affirmbookingforms\` (
  \`Id\` int(11) NOT NULL AUTO_INCREMENT,
  \`UniqueId\` varchar(60) NOT NULL,
  \`PhoneNo\` varchar(20) DEFAULT NULL,
  \`Email\` varchar(100) DEFAULT NULL,
  \`MarketingClass\` varchar(50) DEFAULT NULL,
  \`PassengerJson\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`PassengerJson\`)),
  \`InboundFlightsJson\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`InboundFlightsJson\`)),
  \`OutboundFlightsJson\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`OutboundFlightsJson\`)),
  \`LinkExpiryDate\` datetime DEFAULT NULL,
  \`CreatedAt\` datetime DEFAULT current_timestamp(),
  \`Depart\` varchar(255) DEFAULT NULL,
  \`Arrive\` varchar(255) DEFAULT NULL,
  \`DepartDate\` varchar(255) DEFAULT NULL,
  \`ReturnDate\` varchar(255) DEFAULT NULL,
  \`AdultsPrice\` double NOT NULL DEFAULT 0,
  \`ChildPrice\` double DEFAULT NULL,
  \`InfantPrice\` double DEFAULT NULL,
  PRIMARY KEY (\`Id\`)
) ENGINE=InnoDB AUTO_INCREMENT=172 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci`,

`CREATE TABLE IF NOT EXISTS \`affirmpayment\` (
  \`Id\` int(11) NOT NULL AUTO_INCREMENT,
  \`BookingRef\` varchar(255) NOT NULL,
  \`CheckoutToken\` varchar(255) NOT NULL,
  \`PaymentAmount\` decimal(10,2) NOT NULL,
  \`Currency\` varchar(10) NOT NULL DEFAULT 'USD',
  \`PaymentStatus\` enum('Pending','Success','Failed') NOT NULL DEFAULT 'Pending',
  \`PaymentResponseJson\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`PaymentResponseJson\`)),
  \`Phone\` varchar(50) NOT NULL,
  \`Email\` varchar(255) NOT NULL,
  \`PaidAt\` datetime DEFAULT NULL,
  \`CreatedAt\` datetime NOT NULL DEFAULT current_timestamp(),
  \`FullCardResponse\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`FullCardResponse\`)),
  \`is_flagged\` tinyint(1) DEFAULT 0,
  \`flagged_by\` varchar(255) DEFAULT NULL,
  \`flagged_at\` datetime DEFAULT NULL,
  \`payment_review_status\` varchar(20) DEFAULT NULL,
  \`reviewed_by\` varchar(255) DEFAULT NULL,
  \`reviewed_at\` datetime DEFAULT NULL,
  PRIMARY KEY (\`Id\`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci`,

`CREATE TABLE IF NOT EXISTS \`click_detail\` (
  \`Id\` varchar(50) NOT NULL,
  \`log\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(\`log\`)),
  \`CreatedOn\` datetime NOT NULL DEFAULT current_timestamp(),
  \`Ip\` varchar(150) DEFAULT NULL,
  \`sitesource\` varchar(50) DEFAULT NULL,
  PRIMARY KEY (\`Id\`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci`,

`CREATE TABLE IF NOT EXISTS \`clickimpression\` (
  \`Id\` int(11) NOT NULL AUTO_INCREMENT,
  \`Log\` varchar(500) DEFAULT NULL,
  \`CreatedOn\` datetime DEFAULT current_timestamp(),
  \`Ip\` varchar(50) DEFAULT NULL,
  \`utm_source\` varchar(40) DEFAULT NULL,
  \`source\` varchar(10) DEFAULT NULL,
  \`destination\` varchar(10) DEFAULT NULL,
  \`DepartDate\` date DEFAULT NULL,
  \`Records\` int(2) DEFAULT NULL,
  PRIMARY KEY (\`Id\`)
) ENGINE=InnoDB AUTO_INCREMENT=1912582 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci`,

`CREATE TABLE IF NOT EXISTS \`refund_shield\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`booking_ref\` varchar(255) NOT NULL,
  \`refund_status\` varchar(20) DEFAULT NULL,
  \`refund_price\` decimal(10,2) DEFAULT NULL,
  \`trust_status\` varchar(20) DEFAULT NULL,
  \`trust_price\` decimal(10,2) DEFAULT NULL,
  \`adult_count\` int(11) DEFAULT 0,
  \`child_count\` int(11) DEFAULT 0,
  \`infant_count\` int(11) DEFAULT 0,
  \`adult_price\` decimal(10,2) DEFAULT NULL,
  \`child_price\` decimal(10,2) DEFAULT NULL,
  \`infant_price\` decimal(10,2) DEFAULT NULL,
  \`grand_tota\` decimal(10,2) DEFAULT NULL,
  \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
  \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB AUTO_INCREMENT=3905 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci`,

`CREATE TABLE IF NOT EXISTS \`refundshieldbookingscnfrm\` (
  \`Id\` int(11) NOT NULL AUTO_INCREMENT,
  \`BookingRef\` varchar(255) NOT NULL,
  \`CustomerId\` varchar(255) DEFAULT NULL,
  \`FirstName\` varchar(100) DEFAULT NULL,
  \`LastName\` varchar(100) DEFAULT NULL,
  \`BookingType\` varchar(10) DEFAULT NULL,
  \`BookingName\` varchar(200) DEFAULT NULL,
  \`BookingPaidInFull\` tinyint(1) DEFAULT NULL,
  \`BookingIsRefundable\` tinyint(1) DEFAULT NULL,
  \`BookingPaymentValue\` decimal(18,2) DEFAULT NULL,
  \`BookingTotalTransactionValue\` decimal(18,2) DEFAULT NULL,
  \`CurrencyCode\` varchar(10) DEFAULT NULL,
  \`BookingQuantity\` int(11) DEFAULT NULL,
  \`DateOfPurchase\` datetime DEFAULT NULL,
  \`StartDateOfEvent\` datetime DEFAULT NULL,
  \`EndDateOfEvent\` datetime DEFAULT NULL,
  \`Products\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`Products\`)),
  \`CreatedAt\` datetime DEFAULT current_timestamp(),
  \`EditedAt\` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (\`Id\`)
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci`,

`CREATE TABLE IF NOT EXISTS \`tbl_customer\` (
  \`cId\` int(11) NOT NULL AUTO_INCREMENT,
  \`customerId\` int(25) DEFAULT NULL,
  \`fullName\` varchar(50) DEFAULT NULL,
  \`dob\` datetime DEFAULT NULL,
  \`gender\` varchar(10) DEFAULT NULL,
  \`pessengerType\` varchar(10) DEFAULT NULL,
  \`adtPrice\` double DEFAULT NULL,
  \`chdPrice\` double DEFAULT NULL,
  \`infPrice\` double DEFAULT NULL,
  \`adtQty\` int(11) DEFAULT NULL,
  \`chdQty\` int(10) DEFAULT NULL,
  \`infQty\` int(10) DEFAULT NULL,
  \`nationality\` varchar(25) DEFAULT NULL,
  PRIMARY KEY (\`cId\`),
  KEY \`customerId_index\` (\`customerId\`),
  KEY \`fullName_index\` (\`fullName\`)
) ENGINE=MyISAM AUTO_INCREMENT=44735 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci`,

`CREATE TABLE IF NOT EXISTS \`tbl_customerdetails\` (
  \`Id\` int(11) NOT NULL AUTO_INCREMENT,
  \`bookingRef\` varchar(50) DEFAULT NULL,
  \`originFrom\` varchar(10) DEFAULT NULL,
  \`destinationTo\` varchar(10) DEFAULT NULL,
  \`airLine\` varchar(10) DEFAULT NULL,
  \`travellType\` varchar(10) DEFAULT NULL,
  \`cabin\` varchar(25) DEFAULT NULL,
  \`departureDate\` datetime DEFAULT NULL,
  \`returnDate\` datetime DEFAULT NULL,
  \`address\` varchar(50) DEFAULT NULL,
  \`phone\` varchar(25) DEFAULT NULL,
  \`email\` varchar(50) DEFAULT NULL,
  \`totalAmount\` double DEFAULT NULL,
  \`status\` varchar(11) DEFAULT '0',
  \`work_status\` varchar(25) DEFAULT NULL,
  \`source\` varchar(25) DEFAULT NULL,
  \`source_id\` varchar(100) DEFAULT NULL,
  \`RefundShieldPercent\` int(25) DEFAULT NULL,
  \`RefundShieldTotalAmount\` int(25) DEFAULT NULL,
  \`created_at\` datetime DEFAULT current_timestamp(),
  \`RefundShieldBooking\` varchar(10) DEFAULT NULL,
  PRIMARY KEY (\`Id\`),
  KEY \`status_index\` (\`status\`),
  KEY \`email_index\` (\`email\`),
  KEY \`work_status_index\` (\`work_status\`),
  KEY \`source_index\` (\`source\`),
  KEY \`idx_created_at\` (\`created_at\`),
  KEY \`idx_source_status_created\` (\`source\`,\`status\`,\`created_at\`)
) ENGINE=MyISAM AUTO_INCREMENT=29787 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci`,

`CREATE TABLE IF NOT EXISTS \`tbl_email_notification\` (
  \`id\` varchar(36) NOT NULL,
  \`record_type\` varchar(20) NOT NULL DEFAULT 'MESSAGE',
  \`user_id\` varchar(36) DEFAULT NULL,
  \`booking_type\` varchar(20) DEFAULT NULL,
  \`booking_ref\` varchar(50) DEFAULT NULL,
  \`booking_id\` varchar(50) DEFAULT NULL,
  \`contact_email\` varchar(255) DEFAULT NULL,
  \`contact_phone\` varchar(25) DEFAULT NULL,
  \`type\` varchar(20) NOT NULL,
  \`template_name\` varchar(120) DEFAULT NULL,
  \`status\` varchar(20) NOT NULL DEFAULT 'PENDING',
  \`payload\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(\`payload\`)),
  \`travel_date\` datetime DEFAULT NULL,
  \`retry_count\` int(11) NOT NULL DEFAULT 0,
  \`next_attempt_at\` timestamp NULL DEFAULT NULL,
  \`last_error_message\` text DEFAULT NULL,
  \`sent_at\` timestamp NULL DEFAULT NULL,
  \`template_subject\` varchar(255) DEFAULT NULL,
  \`template_body\` text DEFAULT NULL,
  \`created_at\` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  \`updated_at\` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  \`delivery_logs\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`delivery_logs\`)),
  \`last_response\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`last_response\`)),
  \`template_variables\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`template_variables\`)),
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

`CREATE TABLE IF NOT EXISTS \`tbl_users\` (
  \`id\` varchar(36) NOT NULL,
  \`email\` varchar(255) NOT NULL,
  \`password_hash\` text DEFAULT NULL,
  \`first_name\` varchar(100) DEFAULT NULL,
  \`middle_name\` varchar(100) DEFAULT NULL,
  \`last_name\` varchar(100) DEFAULT NULL,
  \`oauth_provider\` varchar(50) DEFAULT NULL,
  \`oauth_provider_user_id\` varchar(255) DEFAULT NULL,
  \`refresh_token_hash\` varchar(64) DEFAULT NULL,
  \`refresh_token_expires_at\` timestamp NULL DEFAULT NULL,
  \`refresh_token_revoked_at\` timestamp NULL DEFAULT NULL,
  \`preferred_currency\` varchar(3) NOT NULL DEFAULT 'USD',
  \`phone\` varchar(20) DEFAULT NULL,
  \`date_of_birth\` date DEFAULT NULL,
  \`gender\` varchar(20) DEFAULT NULL,
  \`role\` varchar(20) NOT NULL DEFAULT 'USER',
  \`nationality\` varchar(50) DEFAULT NULL,
  \`passport_number\` varchar(50) DEFAULT NULL,
  \`passport_expiry\` date DEFAULT NULL,
  \`two_factor_enabled\` tinyint(4) NOT NULL DEFAULT 0,
  \`two_factor_secret_ciphertext\` text DEFAULT NULL,
  \`two_factor_pending_secret_ciphertext\` text DEFAULT NULL,
  \`password_reset_otp_id\` varchar(36) DEFAULT NULL,
  \`password_reset_otp_hash\` varchar(255) DEFAULT NULL,
  \`password_reset_otp_expires_at\` timestamp NULL DEFAULT NULL,
  \`created_at\` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  \`updated_at\` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  \`two_factor_backup_codes\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`two_factor_backup_codes\`)),
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`IDX_d74ab662f9d3964f78b3416d5d\` (\`email\`),
  UNIQUE KEY \`IDX_ba82e71e58933be15e3e35066e\` (\`phone\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
];

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_SERVER || "127.0.0.1",
    port: parseInt(process.env.MYSQL_PORT || "3306", 10),
    user: process.env.MYSQL_UID || "root",
    password: process.env.MYSQL_PASSWORD || "",
  });

  try {
    await connection.query("CREATE DATABASE IF NOT EXISTS \`worldrix_ezeecrm\`");
    await connection.query("USE \`worldrix_ezeecrm\`");
    
    for (let i = 0; i < queries.length; i++) {
      console.log(`Running query ${i + 1}...`);
      await connection.query(queries[i]);
      console.log(`Query ${i + 1} executed successfully.`);
    }
  } catch (error) {
    console.error("Error executing queries:", error);
  } finally {
    await connection.end();
  }
}

run();

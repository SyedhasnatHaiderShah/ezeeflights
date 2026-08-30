-- Local-only: create database + app user, then apply schema/migrations.
--   mysql -u root -p < sql/mysql-crm-local-bootstrap.sql
--   mysql -u root -p ezeeflights_crm < sql/mysql-crm.sql
--
-- apps/backend/.env:
--   MYSQL_SERVER=127.0.0.1
--   MYSQL_PORT=3306
--   MYSQL_UID=ezeeflights
--   MYSQL_DATABASE=ezeeflights_crm
--   MYSQL_PASSWORD=<match GRANT password below>

CREATE DATABASE IF NOT EXISTS ezeeflights_crm
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'ezeeflights'@'localhost' IDENTIFIED BY 'khurram68';
CREATE USER IF NOT EXISTS 'ezeeflights'@'127.0.0.1' IDENTIFIED BY 'khurram68';
GRANT ALL PRIVILEGES ON ezeeflights_crm.* TO 'ezeeflights'@'localhost';
GRANT ALL PRIVILEGES ON ezeeflights_crm.* TO 'ezeeflights'@'127.0.0.1';
FLUSH PRIVILEGES;

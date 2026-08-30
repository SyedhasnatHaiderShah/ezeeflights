-- 063_add_flight_id_to_cheap_bid_offer.sql
-- Add flightId column to tbl_cheap_bid_offer.
ALTER TABLE tbl_cheap_bid_offer ADD COLUMN flightId VARCHAR(255) DEFAULT NULL;

-- 064_add_original_prices_to_cheap_bid_offer.sql
-- Add original price columns to tbl_cheap_bid_offer.
ALTER TABLE tbl_cheap_bid_offer ADD COLUMN originalAdtPrice DOUBLE DEFAULT NULL;
ALTER TABLE tbl_cheap_bid_offer ADD COLUMN originalChdPrice DOUBLE DEFAULT NULL;
ALTER TABLE tbl_cheap_bid_offer ADD COLUMN originalInfPrice DOUBLE DEFAULT NULL;

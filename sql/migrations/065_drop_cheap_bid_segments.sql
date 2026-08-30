-- 065_drop_cheap_bid_segments.sql
-- Remove the unused tbl_cheap_bid_segments table as flight matching is now simplified and done purely on tbl_cheap_bid_offer.

DROP TABLE IF EXISTS tbl_cheap_bid_segments;

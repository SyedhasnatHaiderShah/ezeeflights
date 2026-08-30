-- Fix hotel bookings schema mismatch (non-breaking)
ALTER TABLE hotel_bookings ADD COLUMN IF NOT EXISTS hotel_name VARCHAR(255);
ALTER TABLE hotel_bookings ADD COLUMN IF NOT EXISTS city VARCHAR(120);
ALTER TABLE hotel_bookings ADD COLUMN IF NOT EXISTS country VARCHAR(120);

-- Fix currency check constraint to allow any 3-letter currency code (e.g. PKR, INR, etc.)
ALTER TABLE hotel_bookings DROP CONSTRAINT IF EXISTS hotel_bookings_currency_check;
ALTER TABLE hotel_bookings ADD CONSTRAINT hotel_bookings_currency_check CHECK (currency ~ '^[A-Z]{3}$');

-- Ensure default_currency columns exist on all bookings tables
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS default_currency VARCHAR(3);

-- Fix hotel bookings column types and foreign key constraints on production database
ALTER TABLE hotel_bookings DROP CONSTRAINT IF EXISTS hotel_bookings_hotel_id_fkey;
ALTER TABLE hotel_bookings ALTER COLUMN hotel_id TYPE VARCHAR(100);

ALTER TABLE booking_rooms DROP CONSTRAINT IF EXISTS booking_rooms_room_id_fkey;
ALTER TABLE booking_rooms ALTER COLUMN room_id TYPE VARCHAR(100);

ALTER TABLE booking_guests DROP CONSTRAINT IF EXISTS booking_guests_room_id_fkey;
ALTER TABLE booking_guests ALTER COLUMN room_id TYPE VARCHAR(100);
ALTER TABLE booking_guests ADD COLUMN IF NOT EXISTS preferences TEXT;

ALTER TABLE hotel_bookings ADD COLUMN IF NOT EXISTS default_currency VARCHAR(3);
ALTER TABLE car_bookings ADD COLUMN IF NOT EXISTS default_currency VARCHAR(3);
ALTER TABLE transfer_bookings ADD COLUMN IF NOT EXISTS default_currency VARCHAR(3);
ALTER TABLE package_bookings ADD COLUMN IF NOT EXISTS default_currency VARCHAR(3);

-- Backfill default_currency from currency if not set
UPDATE bookings SET default_currency = UPPER(TRIM(currency)) WHERE default_currency IS NULL AND currency IS NOT NULL AND TRIM(currency) <> '';
UPDATE hotel_bookings SET default_currency = UPPER(TRIM(currency)) WHERE default_currency IS NULL AND currency IS NOT NULL AND TRIM(currency) <> '';
UPDATE car_bookings SET default_currency = UPPER(TRIM(currency)) WHERE default_currency IS NULL AND currency IS NOT NULL AND TRIM(currency) <> '';
UPDATE transfer_bookings SET default_currency = UPPER(TRIM(currency)) WHERE default_currency IS NULL AND currency IS NOT NULL AND TRIM(currency) <> '';
UPDATE package_bookings SET default_currency = UPPER(TRIM(currency)) WHERE default_currency IS NULL AND currency IS NOT NULL AND TRIM(currency) <> '';

-- Add phone_number column to booking_passengers table
ALTER TABLE booking_passengers ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);

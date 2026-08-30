-- Add email and phone columns to booking_guests table
ALTER TABLE booking_guests 
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

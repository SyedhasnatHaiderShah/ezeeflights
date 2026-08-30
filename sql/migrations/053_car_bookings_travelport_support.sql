-- Migration: Allow car_bookings to support Travelport (ephemeral) cars
-- car_id becomes nullable so bookings can be created without a local DB car record
-- The travelport car details are stored in vendor_booking_ref and notes

ALTER TABLE car_bookings
  ALTER COLUMN car_id DROP NOT NULL,
  DROP CONSTRAINT IF EXISTS car_bookings_car_id_fkey;

ALTER TABLE car_bookings
  ADD COLUMN IF NOT EXISTS travelport_car_id TEXT,
  ADD COLUMN IF NOT EXISTS travelport_car_name TEXT,
  ADD COLUMN IF NOT EXISTS travelport_vendor_code TEXT;

-- Allow seat_number to be NULL for passengers who haven't selected a seat yet
ALTER TABLE booking_passengers ALTER COLUMN seat_number DROP NOT NULL;

-- Also update the unique constraint to only apply to non-null seat numbers
-- In Postgres, UNIQUE constraints already ignore NULLs by default, 
-- but we had a unique index named uq_active_seat_per_booking.
-- Let's re-verify it.
DROP INDEX IF EXISTS uq_active_seat_per_booking;
CREATE UNIQUE INDEX uq_active_seat_per_booking ON booking_passengers(booking_id, seat_number) WHERE seat_number IS NOT NULL;

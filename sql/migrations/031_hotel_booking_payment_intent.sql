-- Add payment_intent_id to hotel_bookings so the real Stripe PaymentIntent
-- id can be stored after initiation and verified before marking PAID.
ALTER TABLE hotel_bookings
  ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_hotel_bookings_payment_intent_id
  ON hotel_bookings(payment_intent_id)
  WHERE payment_intent_id IS NOT NULL;

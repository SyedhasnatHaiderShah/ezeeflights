CREATE INDEX IF NOT EXISTS idx_car_bookings_user_id ON car_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_transfer_bookings_user_id ON transfer_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_package_bookings_user_id ON package_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_package_bookings_status ON package_bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_booking_flights_flight_id ON booking_flights(flight_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_user_id ON loyalty_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

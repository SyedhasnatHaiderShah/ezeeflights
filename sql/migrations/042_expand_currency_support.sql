-- Expand currency support to include INR and others if needed
-- We drop the existing check constraints and create new ones

-- 1. Flights
ALTER TABLE flights DROP CONSTRAINT IF EXISTS flights_currency_check;
ALTER TABLE flights ADD CONSTRAINT flights_currency_check CHECK (currency IN ('USD', 'AED', 'EUR', 'GBP', 'INR'));

-- 2. Users
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_preferred_currency_check;
ALTER TABLE users ADD CONSTRAINT users_preferred_currency_check CHECK (preferred_currency IN ('USD', 'AED', 'EUR', 'GBP', 'INR'));

-- 3. Hotels
ALTER TABLE hotels DROP CONSTRAINT IF EXISTS hotels_currency_check;
ALTER TABLE hotels ADD CONSTRAINT hotels_currency_check CHECK (currency IN ('USD', 'AED', 'EUR', 'GBP', 'INR'));

-- 4. Trips
ALTER TABLE trips DROP CONSTRAINT IF EXISTS trips_currency_check;
ALTER TABLE trips ADD CONSTRAINT trips_currency_check CHECK (currency IN ('USD', 'AED', 'EUR', 'GBP', 'INR'));

-- 5. Bookings
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_currency_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_currency_check CHECK (currency IN ('USD', 'AED', 'EUR', 'GBP', 'INR'));

-- 6. Payments
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_currency_check;
ALTER TABLE payments ADD CONSTRAINT payments_currency_check CHECK (currency IN ('USD', 'AED', 'EUR', 'GBP', 'INR'));

-- ezeeFlights relational schema (PostgreSQL)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TABLE IF NOT EXISTS roles (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT roles_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT roles_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT roles_name_not_null CHECK name IS NOT NULL,
  CONSTRAINT roles_slug_not_null CHECK slug IS NOT NULL,
  CONSTRAINT roles_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash text,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  oauth_provider VARCHAR(50),
  preferred_currency VARCHAR(3) DEFAULT 'USD'::character varying NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'USER'::character varying NOT NULL,
  nationality VARCHAR(50),
  passport_number VARCHAR(50),
  passport_expiry date,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  loyalty_tier LOYALTY_TIER DEFAULT 'BRONZE'::loyalty_tier,
  loyalty_points integer DEFAULT 0,
  lifetime_points integer DEFAULT 0,
  referral_code VARCHAR(20),
  CONSTRAINT users_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT users_email_not_null CHECK email IS NOT NULL,
  CONSTRAINT users_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT users_preferred_currency_check CHECK ((preferred_currency)::text = ANY ((ARRAY['USD'::character varying, 'AED'::character varying, 'EUR'::character varying, 'GBP'::character varying, 'INR'::character varying])::text[])),
  CONSTRAINT users_preferred_currency_not_null CHECK preferred_currency IS NOT NULL,
  CONSTRAINT users_role_not_null CHECK role IS NOT NULL,
  CONSTRAINT users_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  role_id uuid NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT admin_users_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
  CONSTRAINT admin_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT admin_users_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT admin_users_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT admin_users_role_id_not_null CHECK role_id IS NOT NULL,
  CONSTRAINT admin_users_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  admin_id uuid NOT NULL,
  ip_address VARCHAR(45),
  login_time TIMESTAMPTZ DEFAULT now() NOT NULL,
  logout_time TIMESTAMPTZ,
  CONSTRAINT admin_sessions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE,
  CONSTRAINT admin_sessions_admin_id_not_null CHECK admin_id IS NOT NULL,
  CONSTRAINT admin_sessions_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT admin_sessions_login_time_not_null CHECK login_time IS NOT NULL
);

CREATE TABLE IF NOT EXISTS packages (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description text NOT NULL,
  destination VARCHAR(150) NOT NULL,
  country VARCHAR(120) NOT NULL,
  duration_days integer NOT NULL,
  base_price NUMERIC NOT NULL,
  currency VARCHAR(3) NOT NULL,
  thumbnail_url text,
  status VARCHAR(20) DEFAULT 'draft'::character varying NOT NULL,
  created_by uuid NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  is_ai_generated boolean DEFAULT false NOT NULL,
  origin_city VARCHAR(150),
  airline_name VARCHAR(150),
  is_flash_sale boolean DEFAULT false,
  expires_at TIMESTAMPTZ,
  type VARCHAR(20) DEFAULT 'package'::character varying,
  CONSTRAINT packages_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT packages_base_price_check CHECK (base_price >= (0)::numeric),
  CONSTRAINT packages_base_price_not_null CHECK base_price IS NOT NULL,
  CONSTRAINT packages_country_not_null CHECK country IS NOT NULL,
  CONSTRAINT packages_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT packages_created_by_not_null CHECK created_by IS NOT NULL,
  CONSTRAINT packages_currency_check CHECK ((currency)::text = ANY ((ARRAY['USD'::character varying, 'AED'::character varying, 'EUR'::character varying, 'GBP'::character varying])::text[])),
  CONSTRAINT packages_currency_not_null CHECK currency IS NOT NULL,
  CONSTRAINT packages_description_not_null CHECK description IS NOT NULL,
  CONSTRAINT packages_destination_not_null CHECK destination IS NOT NULL,
  CONSTRAINT packages_duration_days_check CHECK (duration_days > 0),
  CONSTRAINT packages_duration_days_not_null CHECK duration_days IS NOT NULL,
  CONSTRAINT packages_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT packages_is_ai_generated_not_null CHECK is_ai_generated IS NOT NULL,
  CONSTRAINT packages_slug_not_null CHECK slug IS NOT NULL,
  CONSTRAINT packages_status_check CHECK ((status)::text = ANY ((ARRAY['draft'::character varying, 'published'::character varying, 'archived'::character varying])::text[])),
  CONSTRAINT packages_status_not_null CHECK status IS NOT NULL,
  CONSTRAINT packages_title_not_null CHECK title IS NOT NULL,
  CONSTRAINT packages_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_generated_packages (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  input_payload jsonb NOT NULL,
  generated_output jsonb NOT NULL,
  status VARCHAR(20) DEFAULT 'draft'::character varying NOT NULL,
  created_by uuid NOT NULL,
  reviewer_notes text,
  converted_package_id uuid,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT ai_generated_packages_converted_package_id_fkey FOREIGN KEY (converted_package_id) REFERENCES packages(id) ON DELETE SET NULL,
  CONSTRAINT ai_generated_packages_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT ai_generated_packages_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT ai_generated_packages_created_by_not_null CHECK created_by IS NOT NULL,
  CONSTRAINT ai_generated_packages_generated_output_not_null CHECK generated_output IS NOT NULL,
  CONSTRAINT ai_generated_packages_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT ai_generated_packages_input_payload_not_null CHECK input_payload IS NOT NULL,
  CONSTRAINT ai_generated_packages_status_check CHECK ((status)::text = ANY ((ARRAY['draft'::character varying, 'reviewed'::character varying, 'published'::character varying, 'rejected'::character varying])::text[])),
  CONSTRAINT ai_generated_packages_status_not_null CHECK status IS NOT NULL,
  CONSTRAINT ai_generated_packages_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_generation_logs (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  request_payload jsonb NOT NULL,
  response_payload jsonb,
  status VARCHAR(20) DEFAULT 'success'::character varying NOT NULL,
  provider VARCHAR(50) DEFAULT 'mock'::character varying NOT NULL,
  model VARCHAR(120),
  tokens_used integer,
  latency_ms integer,
  estimated_cost NUMERIC,
  error_message text,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT ai_generation_logs_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT ai_generation_logs_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT ai_generation_logs_provider_not_null CHECK provider IS NOT NULL,
  CONSTRAINT ai_generation_logs_request_payload_not_null CHECK request_payload IS NOT NULL,
  CONSTRAINT ai_generation_logs_status_check CHECK ((status)::text = ANY ((ARRAY['success'::character varying, 'failed'::character varying])::text[])),
  CONSTRAINT ai_generation_logs_status_not_null CHECK status IS NOT NULL
);

CREATE TABLE IF NOT EXISTS aircraft_seat_maps (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  flight_id uuid NOT NULL,
  aircraft_type VARCHAR(50),
  total_rows integer,
  columns_layout VARCHAR(20),
  seat_map_data jsonb NOT NULL,
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT aircraft_seat_maps_flight_id_not_null CHECK flight_id IS NOT NULL,
  CONSTRAINT aircraft_seat_maps_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT aircraft_seat_maps_seat_map_data_not_null CHECK seat_map_data IS NOT NULL
);

CREATE TABLE IF NOT EXISTS alerts (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  type VARCHAR(64) NOT NULL,
  message text NOT NULL,
  severity VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT alerts_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT alerts_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT alerts_message_not_null CHECK message IS NOT NULL,
  CONSTRAINT alerts_severity_check CHECK ((severity)::text = ANY ((ARRAY['LOW'::character varying, 'MEDIUM'::character varying, 'HIGH'::character varying])::text[])),
  CONSTRAINT alerts_severity_not_null CHECK severity IS NOT NULL,
  CONSTRAINT alerts_type_not_null CHECK type IS NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics_bookings (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  booking_id uuid NOT NULL,
  user_id uuid NOT NULL,
  amount NUMERIC NOT NULL,
  currency VARCHAR(8) NOT NULL,
  status VARCHAR(24) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (id, created_at),
  CONSTRAINT analytics_bookings_amount_not_null CHECK amount IS NOT NULL,
  CONSTRAINT analytics_bookings_booking_id_not_null CHECK booking_id IS NOT NULL,
  CONSTRAINT analytics_bookings_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT analytics_bookings_currency_not_null CHECK currency IS NOT NULL,
  CONSTRAINT analytics_bookings_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT analytics_bookings_status_not_null CHECK status IS NOT NULL,
  CONSTRAINT analytics_bookings_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid,
  event_type VARCHAR(24) NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (id, created_at),
  CONSTRAINT analytics_events_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT analytics_events_event_type_check CHECK ((event_type)::text = ANY ((ARRAY['SEARCH'::character varying, 'VIEW'::character varying, 'BOOK'::character varying, 'PAYMENT'::character varying])::text[])),
  CONSTRAINT analytics_events_event_type_not_null CHECK event_type IS NOT NULL,
  CONSTRAINT analytics_events_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT analytics_events_metadata_not_null CHECK metadata IS NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics_funnel (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  step VARCHAR(16) NOT NULL,
  count integer DEFAULT 0 NOT NULL,
  date date NOT NULL,
  CONSTRAINT analytics_funnel_count_not_null CHECK count IS NOT NULL,
  CONSTRAINT analytics_funnel_date_not_null CHECK date IS NOT NULL,
  CONSTRAINT analytics_funnel_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT analytics_funnel_step_check CHECK ((step)::text = ANY ((ARRAY['SEARCH'::character varying, 'SELECT'::character varying, 'BOOK'::character varying, 'PAY'::character varying])::text[])),
  CONSTRAINT analytics_funnel_step_not_null CHECK step IS NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics_revenue_daily (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  date date NOT NULL,
  total_revenue NUMERIC DEFAULT 0 NOT NULL,
  total_bookings integer DEFAULT 0 NOT NULL,
  avg_booking_value NUMERIC DEFAULT 0 NOT NULL,
  CONSTRAINT analytics_revenue_daily_avg_booking_value_not_null CHECK avg_booking_value IS NOT NULL,
  CONSTRAINT analytics_revenue_daily_date_not_null CHECK date IS NOT NULL,
  CONSTRAINT analytics_revenue_daily_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT analytics_revenue_daily_total_bookings_not_null CHECK total_bookings IS NOT NULL,
  CONSTRAINT analytics_revenue_daily_total_revenue_not_null CHECK total_revenue IS NOT NULL
);

CREATE TABLE IF NOT EXISTS ancillary_options (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  ancillary_type ANCILLARY_TYPE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description text,
  airline_code CHAR(3),
  price NUMERIC NOT NULL,
  currency CHAR(3) DEFAULT 'USD'::bpchar,
  unit VARCHAR(50),
  value jsonb,
  is_active boolean DEFAULT true,
  CONSTRAINT ancillary_options_ancillary_type_not_null CHECK ancillary_type IS NOT NULL,
  CONSTRAINT ancillary_options_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT ancillary_options_name_not_null CHECK name IS NOT NULL,
  CONSTRAINT ancillary_options_price_not_null CHECK price IS NOT NULL
);

CREATE TABLE IF NOT EXISTS countries (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  code VARCHAR(3) NOT NULL,
  description text,
  hero_image text,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  region VARCHAR(50),
  CONSTRAINT countries_code_not_null CHECK code IS NOT NULL,
  CONSTRAINT countries_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT countries_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT countries_name_not_null CHECK name IS NOT NULL
);

CREATE TABLE IF NOT EXISTS cities (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  country_id uuid NOT NULL,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(160) NOT NULL,
  description text,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  hero_image text,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  is_featured boolean DEFAULT false,
  CONSTRAINT cities_country_id_fkey FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE,
  CONSTRAINT cities_country_id_not_null CHECK country_id IS NOT NULL,
  CONSTRAINT cities_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT cities_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT cities_latitude_not_null CHECK latitude IS NOT NULL,
  CONSTRAINT cities_longitude_not_null CHECK longitude IS NOT NULL,
  CONSTRAINT cities_name_not_null CHECK name IS NOT NULL,
  CONSTRAINT cities_slug_not_null CHECK slug IS NOT NULL
);

CREATE TABLE IF NOT EXISTS attractions (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  city_id uuid NOT NULL,
  name VARCHAR(180) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  description text NOT NULL,
  category VARCHAR(20) NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  entry_fee NUMERIC DEFAULT 0 NOT NULL,
  opening_hours VARCHAR(120),
  tips text,
  rating NUMERIC DEFAULT 0 NOT NULL,
  total_reviews integer DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT attractions_city_id_fkey FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
  CONSTRAINT attractions_category_check CHECK ((category)::text = ANY ((ARRAY['museum'::character varying, 'beach'::character varying, 'hiking'::character varying, 'nightlife'::character varying, 'shopping'::character varying, 'food'::character varying])::text[])),
  CONSTRAINT attractions_category_not_null CHECK category IS NOT NULL,
  CONSTRAINT attractions_city_id_not_null CHECK city_id IS NOT NULL,
  CONSTRAINT attractions_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT attractions_description_not_null CHECK description IS NOT NULL,
  CONSTRAINT attractions_entry_fee_not_null CHECK entry_fee IS NOT NULL,
  CONSTRAINT attractions_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT attractions_latitude_not_null CHECK latitude IS NOT NULL,
  CONSTRAINT attractions_longitude_not_null CHECK longitude IS NOT NULL,
  CONSTRAINT attractions_name_not_null CHECK name IS NOT NULL,
  CONSTRAINT attractions_rating_not_null CHECK rating IS NOT NULL,
  CONSTRAINT attractions_slug_not_null CHECK slug IS NOT NULL,
  CONSTRAINT attractions_total_reviews_not_null CHECK total_reviews IS NOT NULL
);

CREATE TABLE IF NOT EXISTS attraction_images (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  attraction_id uuid NOT NULL,
  image_url text NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT attraction_images_attraction_id_fkey FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE CASCADE,
  CONSTRAINT attraction_images_attraction_id_not_null CHECK attraction_id IS NOT NULL,
  CONSTRAINT attraction_images_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT attraction_images_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT attraction_images_image_url_not_null CHECK image_url IS NOT NULL
);

CREATE TABLE IF NOT EXISTS attraction_package_links (
  attraction_id uuid NOT NULL,
  package_id uuid NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (attraction_id, package_id),
  CONSTRAINT attraction_package_links_attraction_id_fkey FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE CASCADE,
  CONSTRAINT attraction_package_links_package_id_fkey FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  CONSTRAINT attraction_package_links_attraction_id_not_null CHECK attraction_id IS NOT NULL,
  CONSTRAINT attraction_package_links_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT attraction_package_links_package_id_not_null CHECK package_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS attraction_reviews (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  attraction_id uuid NOT NULL,
  rating integer NOT NULL,
  comment text NOT NULL,
  image_url text,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT attraction_reviews_attraction_id_fkey FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE CASCADE,
  CONSTRAINT attraction_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT attraction_reviews_attraction_id_not_null CHECK attraction_id IS NOT NULL,
  CONSTRAINT attraction_reviews_comment_not_null CHECK comment IS NOT NULL,
  CONSTRAINT attraction_reviews_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT attraction_reviews_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT attraction_reviews_rating_check CHECK ((rating >= 1) AND (rating <= 5)),
  CONSTRAINT attraction_reviews_rating_not_null CHECK rating IS NOT NULL,
  CONSTRAINT attraction_reviews_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid,
  action VARCHAR(120) NOT NULL,
  module VARCHAR(64) NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT audit_logs_action_not_null CHECK action IS NOT NULL,
  CONSTRAINT audit_logs_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT audit_logs_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT audit_logs_metadata_not_null CHECK metadata IS NOT NULL,
  CONSTRAINT audit_logs_module_not_null CHECK module IS NOT NULL
);

CREATE TABLE IF NOT EXISTS booking_ancillaries (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  booking_id uuid NOT NULL,
  passenger_index integer DEFAULT 0,
  ancillary_id uuid NOT NULL,
  quantity smallint DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  currency CHAR(3) DEFAULT 'USD'::bpchar,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT booking_ancillaries_ancillary_id_fkey FOREIGN KEY (ancillary_id) REFERENCES ancillary_options(id),
  CONSTRAINT booking_ancillaries_ancillary_id_not_null CHECK ancillary_id IS NOT NULL,
  CONSTRAINT booking_ancillaries_booking_id_not_null CHECK booking_id IS NOT NULL,
  CONSTRAINT booking_ancillaries_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT booking_ancillaries_total_price_not_null CHECK total_price IS NOT NULL,
  CONSTRAINT booking_ancillaries_unit_price_not_null CHECK unit_price IS NOT NULL
);

CREATE TABLE IF NOT EXISTS hotels (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(120) NOT NULL,
  country VARCHAR(120) NOT NULL,
  star_rating smallint NOT NULL,
  nightly_rate NUMERIC NOT NULL,
  currency VARCHAR(3) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  address text,
  rating NUMERIC NOT NULL,
  description text,
  amenities jsonb DEFAULT '{}'::jsonb NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT hotels_amenities_not_null CHECK amenities IS NOT NULL,
  CONSTRAINT hotels_city_not_null CHECK city IS NOT NULL,
  CONSTRAINT hotels_country_not_null CHECK country IS NOT NULL,
  CONSTRAINT hotels_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT hotels_currency_check CHECK ((currency)::text = ANY ((ARRAY['USD'::character varying, 'AED'::character varying, 'EUR'::character varying, 'GBP'::character varying, 'INR'::character varying])::text[])),
  CONSTRAINT hotels_currency_not_null CHECK currency IS NOT NULL,
  CONSTRAINT hotels_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT hotels_name_not_null CHECK name IS NOT NULL,
  CONSTRAINT hotels_nightly_rate_not_null CHECK nightly_rate IS NOT NULL,
  CONSTRAINT hotels_rating_check CHECK ((rating >= (0)::numeric) AND (rating <= (5)::numeric)),
  CONSTRAINT hotels_rating_not_null CHECK rating IS NOT NULL,
  CONSTRAINT hotels_star_rating_check CHECK ((star_rating >= 1) AND (star_rating <= 5)),
  CONSTRAINT hotels_star_rating_not_null CHECK star_rating IS NOT NULL,
  CONSTRAINT hotels_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS trips (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  name VARCHAR(255) NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  budget NUMERIC,
  currency VARCHAR(3),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT trips_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT trips_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT trips_currency_check CHECK ((currency)::text = ANY ((ARRAY['USD'::character varying, 'AED'::character varying, 'EUR'::character varying, 'GBP'::character varying, 'INR'::character varying])::text[])),
  CONSTRAINT trips_end_date_not_null CHECK end_date IS NOT NULL,
  CONSTRAINT trips_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT trips_name_not_null CHECK name IS NOT NULL,
  CONSTRAINT trips_start_date_not_null CHECK start_date IS NOT NULL,
  CONSTRAINT trips_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  hotel_id uuid,
  trip_id uuid,
  status VARCHAR(20) DEFAULT 'PENDING'::character varying NOT NULL,
  total_amount NUMERIC NOT NULL,
  currency VARCHAR(3) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  total_price NUMERIC DEFAULT 0 NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'PENDING'::character varying NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  default_currency VARCHAR(3),
  CONSTRAINT bookings_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL,
  CONSTRAINT bookings_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL,
  CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT bookings_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT bookings_currency_check CHECK ((currency)::text = ANY ((ARRAY['USD'::character varying, 'AED'::character varying, 'EUR'::character varying, 'GBP'::character varying, 'INR'::character varying])::text[])),
  CONSTRAINT bookings_currency_not_null CHECK currency IS NOT NULL,
  CONSTRAINT bookings_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT bookings_payment_status_check CHECK ((payment_status)::text = ANY ((ARRAY['PENDING'::character varying, 'PAID'::character varying, 'FAILED'::character varying])::text[])),
  CONSTRAINT bookings_payment_status_not_null CHECK payment_status IS NOT NULL,
  CONSTRAINT bookings_status_check CHECK ((status)::text = ANY ((ARRAY['PENDING'::character varying, 'CONFIRMED'::character varying, 'CANCELLED'::character varying, 'FAILED'::character varying])::text[])),
  CONSTRAINT bookings_status_not_null CHECK status IS NOT NULL,
  CONSTRAINT bookings_total_amount_not_null CHECK total_amount IS NOT NULL,
  CONSTRAINT bookings_total_price_not_null CHECK total_price IS NOT NULL,
  CONSTRAINT bookings_updated_at_not_null CHECK updated_at IS NOT NULL,
  CONSTRAINT bookings_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS flights (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  airline_code VARCHAR(10) NOT NULL,
  flight_number VARCHAR(20) NOT NULL,
  departure_airport VARCHAR(10) NOT NULL,
  arrival_airport VARCHAR(10) NOT NULL,
  departure_at TIMESTAMPTZ NOT NULL,
  arrival_at TIMESTAMPTZ NOT NULL,
  cabin_class VARCHAR(20) NOT NULL,
  base_fare NUMERIC NOT NULL,
  currency VARCHAR(3) NOT NULL,
  seats_available integer NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  airline VARCHAR(120),
  duration_minutes integer DEFAULT 0 NOT NULL,
  stops integer DEFAULT 0 NOT NULL,
  raw_segments text,
  tax NUMERIC DEFAULT 0.00,
  total_fare NUMERIC DEFAULT 0.00,
  available_cabin_classes jsonb,
  CONSTRAINT flights_airline_code_not_null CHECK airline_code IS NOT NULL,
  CONSTRAINT flights_arrival_airport_not_null CHECK arrival_airport IS NOT NULL,
  CONSTRAINT flights_arrival_at_not_null CHECK arrival_at IS NOT NULL,
  CONSTRAINT flights_base_fare_check CHECK (base_fare >= (0)::numeric),
  CONSTRAINT flights_base_fare_not_null CHECK base_fare IS NOT NULL,
  CONSTRAINT flights_cabin_class_check CHECK ((cabin_class)::text = ANY ((ARRAY['ECONOMY'::character varying, 'PREMIUM_ECONOMY'::character varying, 'BUSINESS'::character varying, 'FIRST'::character varying])::text[])),
  CONSTRAINT flights_cabin_class_not_null CHECK cabin_class IS NOT NULL,
  CONSTRAINT flights_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT flights_currency_check CHECK ((currency)::text = ANY ((ARRAY['USD'::character varying, 'AED'::character varying, 'EUR'::character varying, 'GBP'::character varying, 'INR'::character varying])::text[])),
  CONSTRAINT flights_currency_not_null CHECK currency IS NOT NULL,
  CONSTRAINT flights_departure_airport_not_null CHECK departure_airport IS NOT NULL,
  CONSTRAINT flights_departure_at_not_null CHECK departure_at IS NOT NULL,
  CONSTRAINT flights_duration_minutes_not_null CHECK duration_minutes IS NOT NULL,
  CONSTRAINT flights_flight_number_not_null CHECK flight_number IS NOT NULL,
  CONSTRAINT flights_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT flights_seats_available_check CHECK (seats_available >= 0),
  CONSTRAINT flights_seats_available_not_null CHECK seats_available IS NOT NULL,
  CONSTRAINT flights_stops_not_null CHECK stops IS NOT NULL
);

CREATE TABLE IF NOT EXISTS booking_flights (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  booking_id uuid NOT NULL,
  flight_id uuid NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT booking_flights_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT booking_flights_flight_id_fkey FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE RESTRICT,
  CONSTRAINT booking_flights_booking_id_not_null CHECK booking_id IS NOT NULL,
  CONSTRAINT booking_flights_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT booking_flights_flight_id_not_null CHECK flight_id IS NOT NULL,
  CONSTRAINT booking_flights_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT booking_flights_price_check CHECK (price >= (0)::numeric),
  CONSTRAINT booking_flights_price_not_null CHECK price IS NOT NULL,
  CONSTRAINT booking_flights_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS hotel_bookings (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  hotel_id VARCHAR(100) NOT NULL,
  hotel_name VARCHAR(255),
  city VARCHAR(120),
  country VARCHAR(120),
  total_price NUMERIC NOT NULL,
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING'::character varying NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'PENDING'::character varying NOT NULL,
  payment_intent_id VARCHAR(255),
  currency VARCHAR(3) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  default_currency VARCHAR(3),
  CONSTRAINT hotel_bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT hotel_bookings_check CHECK (check_out_date > check_in_date),
  CONSTRAINT hotel_bookings_check_in_date_not_null CHECK check_in_date IS NOT NULL,
  CONSTRAINT hotel_bookings_check_out_date_not_null CHECK check_out_date IS NOT NULL,
  CONSTRAINT hotel_bookings_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT hotel_bookings_currency_check CHECK ((currency)::text ~ '^[A-Z]{3}$'::text),
  CONSTRAINT hotel_bookings_currency_not_null CHECK currency IS NOT NULL,
  CONSTRAINT hotel_bookings_hotel_id_not_null CHECK hotel_id IS NOT NULL,
  CONSTRAINT hotel_bookings_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT hotel_bookings_payment_status_check CHECK ((payment_status)::text = ANY ((ARRAY['PENDING'::character varying, 'PAID'::character varying, 'FAILED'::character varying])::text[])),
  CONSTRAINT hotel_bookings_payment_status_not_null CHECK payment_status IS NOT NULL,
  CONSTRAINT hotel_bookings_status_check CHECK ((status)::text = ANY ((ARRAY['PENDING'::character varying, 'CONFIRMED'::character varying, 'CANCELLED'::character varying])::text[])),
  CONSTRAINT hotel_bookings_status_not_null CHECK status IS NOT NULL,
  CONSTRAINT hotel_bookings_total_price_check CHECK (total_price >= (0)::numeric),
  CONSTRAINT hotel_bookings_total_price_not_null CHECK total_price IS NOT NULL,
  CONSTRAINT hotel_bookings_updated_at_not_null CHECK updated_at IS NOT NULL,
  CONSTRAINT hotel_bookings_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS booking_guests (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  booking_id uuid NOT NULL,
  room_id VARCHAR(100) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  age integer NOT NULL,
  type VARCHAR(10) NOT NULL,
  preferences text,
  email VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT booking_guests_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES hotel_bookings(id) ON DELETE CASCADE,
  CONSTRAINT booking_guests_age_check CHECK (age >= 0),
  CONSTRAINT booking_guests_age_not_null CHECK age IS NOT NULL,
  CONSTRAINT booking_guests_booking_id_not_null CHECK booking_id IS NOT NULL,
  CONSTRAINT booking_guests_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT booking_guests_full_name_not_null CHECK full_name IS NOT NULL,
  CONSTRAINT booking_guests_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT booking_guests_room_id_not_null CHECK room_id IS NOT NULL,
  CONSTRAINT booking_guests_type_check CHECK ((type)::text = ANY ((ARRAY['ADULT'::character varying, 'CHILD'::character varying])::text[])),
  CONSTRAINT booking_guests_type_not_null CHECK type IS NOT NULL,
  CONSTRAINT booking_guests_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS booking_logs (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  booking_id uuid NOT NULL,
  action VARCHAR(120) NOT NULL,
  performed_by VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT booking_logs_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT booking_logs_action_not_null CHECK action IS NOT NULL,
  CONSTRAINT booking_logs_booking_id_not_null CHECK booking_id IS NOT NULL,
  CONSTRAINT booking_logs_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT booking_logs_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT booking_logs_performed_by_check CHECK ((performed_by)::text = ANY ((ARRAY['USER'::character varying, 'ADMIN'::character varying, 'SYSTEM'::character varying])::text[])),
  CONSTRAINT booking_logs_performed_by_not_null CHECK performed_by IS NOT NULL
);

CREATE TABLE IF NOT EXISTS booking_modifications (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  booking_id uuid NOT NULL,
  change_type VARCHAR(32) NOT NULL,
  old_value jsonb NOT NULL,
  new_value jsonb NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT booking_modifications_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT booking_modifications_booking_id_not_null CHECK booking_id IS NOT NULL,
  CONSTRAINT booking_modifications_change_type_check CHECK ((change_type)::text = ANY ((ARRAY['DATE_CHANGE'::character varying, 'PASSENGER_UPDATE'::character varying])::text[])),
  CONSTRAINT booking_modifications_change_type_not_null CHECK change_type IS NOT NULL,
  CONSTRAINT booking_modifications_changed_at_not_null CHECK changed_at IS NOT NULL,
  CONSTRAINT booking_modifications_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT booking_modifications_new_value_not_null CHECK new_value IS NOT NULL,
  CONSTRAINT booking_modifications_old_value_not_null CHECK old_value IS NOT NULL
);

CREATE TABLE IF NOT EXISTS booking_passengers (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  booking_id uuid NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  passport_number VARCHAR(50) NOT NULL,
  seat_number VARCHAR(8),
  type VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  phone_number VARCHAR(50),
  CONSTRAINT booking_passengers_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT booking_passengers_booking_id_not_null CHECK booking_id IS NOT NULL,
  CONSTRAINT booking_passengers_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT booking_passengers_full_name_not_null CHECK full_name IS NOT NULL,
  CONSTRAINT booking_passengers_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT booking_passengers_passport_number_not_null CHECK passport_number IS NOT NULL,
  CONSTRAINT booking_passengers_type_check CHECK ((type)::text = ANY ((ARRAY['ADULT'::character varying, 'CHILD'::character varying, 'INFANT'::character varying])::text[])),
  CONSTRAINT booking_passengers_type_not_null CHECK type IS NOT NULL,
  CONSTRAINT booking_passengers_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS booking_rooms (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  booking_id uuid NOT NULL,
  room_id VARCHAR(100) NOT NULL,
  quantity integer DEFAULT 1 NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT booking_rooms_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES hotel_bookings(id) ON DELETE CASCADE,
  CONSTRAINT booking_rooms_booking_id_not_null CHECK booking_id IS NOT NULL,
  CONSTRAINT booking_rooms_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT booking_rooms_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT booking_rooms_price_check CHECK (price >= (0)::numeric),
  CONSTRAINT booking_rooms_price_not_null CHECK price IS NOT NULL,
  CONSTRAINT booking_rooms_quantity_check CHECK (quantity > 0),
  CONSTRAINT booking_rooms_quantity_not_null CHECK quantity IS NOT NULL,
  CONSTRAINT booking_rooms_room_id_not_null CHECK room_id IS NOT NULL,
  CONSTRAINT booking_rooms_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS canned_responses (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  body text NOT NULL,
  category TICKET_CATEGORY,
  is_active boolean DEFAULT true,
  CONSTRAINT canned_responses_body_not_null CHECK body IS NOT NULL,
  CONSTRAINT canned_responses_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT canned_responses_title_not_null CHECK title IS NOT NULL
);

CREATE TABLE IF NOT EXISTS car_vendors (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  logo_url text,
  api_provider VARCHAR(50),
  api_base_url text,
  is_active boolean DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT car_vendors_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT car_vendors_name_not_null CHECK name IS NOT NULL,
  CONSTRAINT car_vendors_slug_not_null CHECK slug IS NOT NULL
);

CREATE TABLE IF NOT EXISTS car_locations (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  vendor_id uuid,
  name VARCHAR(200) NOT NULL,
  address text NOT NULL,
  city VARCHAR(100) NOT NULL,
  country_code CHAR(2) NOT NULL,
  iata_code CHAR(3),
  latitude NUMERIC,
  longitude NUMERIC,
  is_airport_pickup boolean DEFAULT false,
  operating_hours jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT car_locations_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES car_vendors(id) ON DELETE CASCADE,
  CONSTRAINT car_locations_address_not_null CHECK address IS NOT NULL,
  CONSTRAINT car_locations_city_not_null CHECK city IS NOT NULL,
  CONSTRAINT car_locations_country_code_not_null CHECK country_code IS NOT NULL,
  CONSTRAINT car_locations_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT car_locations_name_not_null CHECK name IS NOT NULL
);

CREATE TABLE IF NOT EXISTS car_bookings (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  car_id uuid,
  pickup_location_id uuid,
  dropoff_location_id uuid,
  pickup_datetime TIMESTAMPTZ NOT NULL,
  dropoff_datetime TIMESTAMPTZ NOT NULL,
  total_days integer NOT NULL,
  base_price NUMERIC NOT NULL,
  insurance_type INSURANCE_TYPE DEFAULT 'basic'::insurance_type,
  insurance_price NUMERIC DEFAULT 0,
  extras_price NUMERIC DEFAULT 0,
  extras jsonb DEFAULT '[]'::jsonb,
  total_price NUMERIC NOT NULL,
  currency CHAR(3) DEFAULT 'USD'::bpchar,
  status CAR_BOOKING_STATUS DEFAULT 'pending'::car_booking_status,
  driver_name VARCHAR(200),
  driver_license_number VARCHAR(100),
  driver_nationality CHAR(2),
  additional_drivers jsonb DEFAULT '[]'::jsonb,
  payment_id uuid,
  confirmation_code VARCHAR(50),
  vendor_booking_ref VARCHAR(100),
  notes text,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason text,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  travelport_car_id text,
  travelport_car_name text,
  travelport_vendor_code text,
  default_currency VARCHAR(3),
  CONSTRAINT car_bookings_dropoff_location_id_fkey FOREIGN KEY (dropoff_location_id) REFERENCES car_locations(id),
  CONSTRAINT car_bookings_pickup_location_id_fkey FOREIGN KEY (pickup_location_id) REFERENCES car_locations(id),
  CONSTRAINT car_bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT car_bookings_base_price_not_null CHECK base_price IS NOT NULL,
  CONSTRAINT car_bookings_dropoff_datetime_not_null CHECK dropoff_datetime IS NOT NULL,
  CONSTRAINT car_bookings_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT car_bookings_pickup_datetime_not_null CHECK pickup_datetime IS NOT NULL,
  CONSTRAINT car_bookings_total_days_not_null CHECK total_days IS NOT NULL,
  CONSTRAINT car_bookings_total_price_not_null CHECK total_price IS NOT NULL,
  CONSTRAINT car_bookings_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS car_extras (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description text,
  price_per_day NUMERIC NOT NULL,
  category VARCHAR(50),
  is_active boolean DEFAULT true,
  CONSTRAINT car_extras_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT car_extras_name_not_null CHECK name IS NOT NULL,
  CONSTRAINT car_extras_price_per_day_not_null CHECK price_per_day IS NOT NULL
);

CREATE TABLE IF NOT EXISTS cars (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  vendor_id uuid,
  location_id uuid,
  category CAR_CATEGORY NOT NULL,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year smallint,
  seats smallint DEFAULT 5,
  doors smallint DEFAULT 4,
  transmission VARCHAR(20) DEFAULT 'automatic'::character varying,
  fuel_type VARCHAR(30) DEFAULT 'petrol'::character varying,
  fuel_policy FUEL_POLICY DEFAULT 'full_to_full'::fuel_policy,
  air_conditioning boolean DEFAULT true,
  unlimited_mileage boolean DEFAULT false,
  mileage_limit_km integer,
  price_per_day NUMERIC NOT NULL,
  currency CHAR(3) DEFAULT 'USD'::bpchar,
  deposit_amount NUMERIC,
  minimum_driver_age smallint DEFAULT 21,
  images jsonb DEFAULT '[]'::jsonb,
  features jsonb DEFAULT '[]'::jsonb,
  is_available boolean DEFAULT true,
  external_id VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT cars_location_id_fkey FOREIGN KEY (location_id) REFERENCES car_locations(id),
  CONSTRAINT cars_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES car_vendors(id),
  CONSTRAINT cars_category_not_null CHECK category IS NOT NULL,
  CONSTRAINT cars_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT cars_make_not_null CHECK make IS NOT NULL,
  CONSTRAINT cars_model_not_null CHECK model IS NOT NULL,
  CONSTRAINT cars_price_per_day_not_null CHECK price_per_day IS NOT NULL
);

CREATE TABLE IF NOT EXISTS invoices (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  booking_id uuid NOT NULL,
  user_id uuid NOT NULL,
  invoice_number VARCHAR(40) NOT NULL,
  total_amount NUMERIC NOT NULL,
  vat_amount NUMERIC NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(20) DEFAULT 'ISSUED'::character varying NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT invoices_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT invoices_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT invoices_booking_id_not_null CHECK booking_id IS NOT NULL,
  CONSTRAINT invoices_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT invoices_currency_check CHECK ((currency)::text = ANY ((ARRAY['USD'::character varying, 'AED'::character varying, 'EUR'::character varying, 'GBP'::character varying])::text[])),
  CONSTRAINT invoices_currency_not_null CHECK currency IS NOT NULL,
  CONSTRAINT invoices_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT invoices_invoice_number_not_null CHECK invoice_number IS NOT NULL,
  CONSTRAINT invoices_status_check CHECK ((status)::text = ANY ((ARRAY['ISSUED'::character varying, 'PAID'::character varying, 'CANCELLED'::character varying])::text[])),
  CONSTRAINT invoices_status_not_null CHECK status IS NOT NULL,
  CONSTRAINT invoices_total_amount_check CHECK (total_amount >= (0)::numeric),
  CONSTRAINT invoices_total_amount_not_null CHECK total_amount IS NOT NULL,
  CONSTRAINT invoices_user_id_not_null CHECK user_id IS NOT NULL,
  CONSTRAINT invoices_vat_amount_check CHECK (vat_amount >= (0)::numeric),
  CONSTRAINT invoices_vat_amount_not_null CHECK vat_amount IS NOT NULL
);

CREATE TABLE IF NOT EXISTS credit_notes (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  invoice_id uuid NOT NULL,
  amount NUMERIC NOT NULL,
  reason text NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT credit_notes_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  CONSTRAINT credit_notes_amount_check CHECK (amount > (0)::numeric),
  CONSTRAINT credit_notes_amount_not_null CHECK amount IS NOT NULL,
  CONSTRAINT credit_notes_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT credit_notes_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT credit_notes_invoice_id_not_null CHECK invoice_id IS NOT NULL,
  CONSTRAINT credit_notes_reason_not_null CHECK reason IS NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  city_id uuid NOT NULL,
  title VARCHAR(200) NOT NULL,
  description text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  CONSTRAINT events_city_id_fkey FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
  CONSTRAINT events_city_id_not_null CHECK city_id IS NOT NULL,
  CONSTRAINT events_description_not_null CHECK description IS NOT NULL,
  CONSTRAINT events_end_date_not_null CHECK end_date IS NOT NULL,
  CONSTRAINT events_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT events_start_date_not_null CHECK start_date IS NOT NULL,
  CONSTRAINT events_title_not_null CHECK title IS NOT NULL
);

CREATE TABLE IF NOT EXISTS flight_inquiries (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid,
  flight_id text NOT NULL,
  origin text,
  destination text,
  depart_date text,
  trip_type text,
  cabin_class text,
  adults integer DEFAULT 1 NOT NULL,
  children integer DEFAULT 0 NOT NULL,
  infants integer DEFAULT 0 NOT NULL,
  flight_snapshot jsonb,
  travelers jsonb DEFAULT '[]'::jsonb NOT NULL,
  contact_email text,
  contact_phone text,
  status text DEFAULT 'PENDING'::text NOT NULL,
  admin_notes text,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT flight_inquiries_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT flight_inquiries_adults_not_null CHECK adults IS NOT NULL,
  CONSTRAINT flight_inquiries_children_not_null CHECK children IS NOT NULL,
  CONSTRAINT flight_inquiries_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT flight_inquiries_flight_id_not_null CHECK flight_id IS NOT NULL,
  CONSTRAINT flight_inquiries_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT flight_inquiries_infants_not_null CHECK infants IS NOT NULL,
  CONSTRAINT flight_inquiries_status_not_null CHECK status IS NOT NULL,
  CONSTRAINT flight_inquiries_travelers_not_null CHECK travelers IS NOT NULL,
  CONSTRAINT flight_inquiries_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS flight_segments (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  flight_id uuid NOT NULL,
  segment_order integer NOT NULL,
  departure VARCHAR(10) NOT NULL,
  arrival VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT flight_segments_flight_id_fkey FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE,
  CONSTRAINT flight_segments_arrival_not_null CHECK arrival IS NOT NULL,
  CONSTRAINT flight_segments_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT flight_segments_departure_not_null CHECK departure IS NOT NULL,
  CONSTRAINT flight_segments_flight_id_not_null CHECK flight_id IS NOT NULL,
  CONSTRAINT flight_segments_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT flight_segments_segment_order_not_null CHECK segment_order IS NOT NULL,
  CONSTRAINT flight_segments_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS hotel_images (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  hotel_id uuid NOT NULL,
  image_url text NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT hotel_images_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  CONSTRAINT hotel_images_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT hotel_images_hotel_id_not_null CHECK hotel_id IS NOT NULL,
  CONSTRAINT hotel_images_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT hotel_images_image_url_not_null CHECK image_url IS NOT NULL,
  CONSTRAINT hotel_images_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS hybrid_api_usage (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  endpoint VARCHAR(120) NOT NULL,
  provider VARCHAR(64) NOT NULL,
  estimated_cost_usd NUMERIC DEFAULT 0 NOT NULL,
  latency_ms integer DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT hybrid_api_usage_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT hybrid_api_usage_endpoint_not_null CHECK endpoint IS NOT NULL,
  CONSTRAINT hybrid_api_usage_estimated_cost_usd_not_null CHECK estimated_cost_usd IS NOT NULL,
  CONSTRAINT hybrid_api_usage_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT hybrid_api_usage_latency_ms_not_null CHECK latency_ms IS NOT NULL,
  CONSTRAINT hybrid_api_usage_provider_not_null CHECK provider IS NOT NULL
);

CREATE TABLE IF NOT EXISTS insights_cache (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  type VARCHAR(120) NOT NULL,
  data jsonb NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT insights_cache_data_not_null CHECK data IS NOT NULL,
  CONSTRAINT insights_cache_generated_at_not_null CHECK generated_at IS NOT NULL,
  CONSTRAINT insights_cache_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT insights_cache_type_not_null CHECK type IS NOT NULL
);

CREATE TABLE IF NOT EXISTS insurance_providers (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50),
  logo_url text,
  api_endpoint text,
  api_key_env_var VARCHAR(100),
  is_active boolean DEFAULT true,
  CONSTRAINT insurance_providers_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT insurance_providers_name_not_null CHECK name IS NOT NULL
);

CREATE TABLE IF NOT EXISTS insurance_plans (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  provider_id uuid,
  name VARCHAR(200) NOT NULL,
  plan_type INSURANCE_PLAN_TYPE NOT NULL,
  coverage_level COVERAGE_LEVEL NOT NULL,
  description text,
  price_per_day NUMERIC,
  price_annual NUMERIC,
  currency CHAR(3) DEFAULT 'USD'::bpchar,
  max_trip_duration_days integer,
  coverage_details jsonb NOT NULL,
  adventure_sports_addon_price NUMERIC,
  age_limit_max smallint DEFAULT 75,
  is_active boolean DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT insurance_plans_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES insurance_providers(id),
  CONSTRAINT insurance_plans_coverage_details_not_null CHECK coverage_details IS NOT NULL,
  CONSTRAINT insurance_plans_coverage_level_not_null CHECK coverage_level IS NOT NULL,
  CONSTRAINT insurance_plans_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT insurance_plans_name_not_null CHECK name IS NOT NULL,
  CONSTRAINT insurance_plans_plan_type_not_null CHECK plan_type IS NOT NULL
);

CREATE TABLE IF NOT EXISTS insurance_policies (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  booking_id uuid,
  policy_number VARCHAR(100) NOT NULL,
  status INSURANCE_STATUS DEFAULT 'active'::insurance_status,
  start_date date NOT NULL,
  end_date date NOT NULL,
  destination_countries jsonb DEFAULT '[]'::jsonb,
  traveler_details jsonb NOT NULL,
  adventure_sports_addon boolean DEFAULT false,
  total_premium NUMERIC NOT NULL,
  currency CHAR(3) DEFAULT 'USD'::bpchar,
  payment_id uuid,
  policy_document_url text,
  provider_policy_ref VARCHAR(200),
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  payment_intent_id VARCHAR(255),
  CONSTRAINT insurance_policies_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES insurance_plans(id),
  CONSTRAINT insurance_policies_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT insurance_policies_end_date_not_null CHECK end_date IS NOT NULL,
  CONSTRAINT insurance_policies_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT insurance_policies_plan_id_not_null CHECK plan_id IS NOT NULL,
  CONSTRAINT insurance_policies_policy_number_not_null CHECK policy_number IS NOT NULL,
  CONSTRAINT insurance_policies_start_date_not_null CHECK start_date IS NOT NULL,
  CONSTRAINT insurance_policies_total_premium_not_null CHECK total_premium IS NOT NULL,
  CONSTRAINT insurance_policies_traveler_details_not_null CHECK traveler_details IS NOT NULL,
  CONSTRAINT insurance_policies_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS insurance_claims (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  policy_id uuid NOT NULL,
  user_id uuid NOT NULL,
  claim_type VARCHAR(100) NOT NULL,
  description text NOT NULL,
  incident_date date NOT NULL,
  claimed_amount NUMERIC NOT NULL,
  currency CHAR(3) DEFAULT 'USD'::bpchar,
  status CLAIM_STATUS DEFAULT 'submitted'::claim_status,
  supporting_documents jsonb DEFAULT '[]'::jsonb,
  approved_amount NUMERIC,
  rejection_reason text,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT insurance_claims_policy_id_fkey FOREIGN KEY (policy_id) REFERENCES insurance_policies(id),
  CONSTRAINT insurance_claims_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT insurance_claims_claim_type_not_null CHECK claim_type IS NOT NULL,
  CONSTRAINT insurance_claims_claimed_amount_not_null CHECK claimed_amount IS NOT NULL,
  CONSTRAINT insurance_claims_description_not_null CHECK description IS NOT NULL,
  CONSTRAINT insurance_claims_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT insurance_claims_incident_date_not_null CHECK incident_date IS NOT NULL,
  CONSTRAINT insurance_claims_policy_id_not_null CHECK policy_id IS NOT NULL,
  CONSTRAINT insurance_claims_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  invoice_id uuid NOT NULL,
  description text NOT NULL,
  quantity integer NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  CONSTRAINT invoice_items_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT invoice_items_description_not_null CHECK description IS NOT NULL,
  CONSTRAINT invoice_items_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT invoice_items_invoice_id_not_null CHECK invoice_id IS NOT NULL,
  CONSTRAINT invoice_items_quantity_check CHECK (quantity > 0),
  CONSTRAINT invoice_items_quantity_not_null CHECK quantity IS NOT NULL,
  CONSTRAINT invoice_items_total_price_check CHECK (total_price >= (0)::numeric),
  CONSTRAINT invoice_items_total_price_not_null CHECK total_price IS NOT NULL,
  CONSTRAINT invoice_items_unit_price_check CHECK (unit_price >= (0)::numeric),
  CONSTRAINT invoice_items_unit_price_not_null CHECK unit_price IS NOT NULL
);

CREATE TABLE IF NOT EXISTS loyalty_accounts (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  points_balance integer DEFAULT 0 NOT NULL,
  tier VARCHAR(20) DEFAULT 'BRONZE'::character varying NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT loyalty_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT loyalty_accounts_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT loyalty_accounts_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT loyalty_accounts_points_balance_check CHECK (points_balance >= 0),
  CONSTRAINT loyalty_accounts_points_balance_not_null CHECK points_balance IS NOT NULL,
  CONSTRAINT loyalty_accounts_tier_check CHECK ((tier)::text = ANY ((ARRAY['BRONZE'::character varying, 'SILVER'::character varying, 'GOLD'::character varying, 'PLATINUM'::character varying])::text[])),
  CONSTRAINT loyalty_accounts_tier_not_null CHECK tier IS NOT NULL,
  CONSTRAINT loyalty_accounts_updated_at_not_null CHECK updated_at IS NOT NULL,
  CONSTRAINT loyalty_accounts_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  tier LOYALTY_TIER NOT NULL,
  min_points_required integer NOT NULL,
  earn_multiplier NUMERIC DEFAULT 1.0,
  benefits jsonb NOT NULL,
  color_hex VARCHAR(7) DEFAULT '#3B82F6'::character varying,
  CONSTRAINT loyalty_tiers_benefits_not_null CHECK benefits IS NOT NULL,
  CONSTRAINT loyalty_tiers_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT loyalty_tiers_min_points_required_not_null CHECK min_points_required IS NOT NULL,
  CONSTRAINT loyalty_tiers_tier_not_null CHECK tier IS NOT NULL
);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  loyalty_account_id uuid NOT NULL,
  points integer NOT NULL,
  type VARCHAR(20) NOT NULL,
  reference_id VARCHAR(120),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT loyalty_transactions_loyalty_account_id_fkey FOREIGN KEY (loyalty_account_id) REFERENCES loyalty_accounts(id) ON DELETE CASCADE,
  CONSTRAINT loyalty_transactions_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT loyalty_transactions_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT loyalty_transactions_loyalty_account_id_not_null CHECK loyalty_account_id IS NOT NULL,
  CONSTRAINT loyalty_transactions_points_not_null CHECK points IS NOT NULL,
  CONSTRAINT loyalty_transactions_type_check CHECK ((type)::text = ANY ((ARRAY['EARN'::character varying, 'REDEEM'::character varying, 'EXPIRE'::character varying])::text[])),
  CONSTRAINT loyalty_transactions_type_not_null CHECK type IS NOT NULL
);

CREATE TABLE IF NOT EXISTS milestones (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description text,
  badge_icon VARCHAR(100),
  badge_color VARCHAR(7),
  criteria jsonb NOT NULL,
  points_reward integer DEFAULT 0,
  is_active boolean DEFAULT true,
  CONSTRAINT milestones_criteria_not_null CHECK criteria IS NOT NULL,
  CONSTRAINT milestones_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT milestones_name_not_null CHECK name IS NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  type VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING'::character varying NOT NULL,
  payload jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  is_read boolean DEFAULT false NOT NULL,
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT notifications_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT notifications_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT notifications_is_read_not_null CHECK is_read IS NOT NULL,
  CONSTRAINT notifications_payload_not_null CHECK payload IS NOT NULL,
  CONSTRAINT notifications_status_check CHECK ((status)::text = ANY ((ARRAY['PENDING'::character varying, 'SENT'::character varying, 'FAILED'::character varying])::text[])),
  CONSTRAINT notifications_status_not_null CHECK status IS NOT NULL,
  CONSTRAINT notifications_type_check CHECK ((type)::text = ANY ((ARRAY['EMAIL'::character varying, 'SMS'::character varying, 'WHATSAPP'::character varying, 'IN_APP'::character varying])::text[])),
  CONSTRAINT notifications_type_not_null CHECK type IS NOT NULL,
  CONSTRAINT notifications_updated_at_not_null CHECK updated_at IS NOT NULL,
  CONSTRAINT notifications_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS notification_logs (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  notification_id uuid NOT NULL,
  response jsonb,
  status VARCHAR(20) NOT NULL,
  error_message text,
  timestamp TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT notification_logs_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  CONSTRAINT notification_logs_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT notification_logs_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT notification_logs_notification_id_not_null CHECK notification_id IS NOT NULL,
  CONSTRAINT notification_logs_status_check CHECK ((status)::text = ANY ((ARRAY['PENDING'::character varying, 'SENT'::character varying, 'FAILED'::character varying])::text[])),
  CONSTRAINT notification_logs_status_not_null CHECK status IS NOT NULL,
  CONSTRAINT notification_logs_timestamp_not_null CHECK timestamp IS NOT NULL,
  CONSTRAINT notification_logs_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS notification_queue (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  notification_id uuid NOT NULL,
  retry_count integer DEFAULT 0 NOT NULL,
  next_attempt_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT notification_queue_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  CONSTRAINT notification_queue_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT notification_queue_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT notification_queue_next_attempt_at_not_null CHECK next_attempt_at IS NOT NULL,
  CONSTRAINT notification_queue_notification_id_not_null CHECK notification_id IS NOT NULL,
  CONSTRAINT notification_queue_retry_count_not_null CHECK retry_count IS NOT NULL,
  CONSTRAINT notification_queue_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS notification_templates (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  type VARCHAR(20) NOT NULL,
  subject VARCHAR(255),
  body text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT notification_templates_body_not_null CHECK body IS NOT NULL,
  CONSTRAINT notification_templates_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT notification_templates_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT notification_templates_name_not_null CHECK name IS NOT NULL,
  CONSTRAINT notification_templates_type_check CHECK ((type)::text = ANY ((ARRAY['EMAIL'::character varying, 'SMS'::character varying, 'WHATSAPP'::character varying])::text[])),
  CONSTRAINT notification_templates_type_not_null CHECK type IS NOT NULL,
  CONSTRAINT notification_templates_updated_at_not_null CHECK updated_at IS NOT NULL,
  CONSTRAINT notification_templates_variables_not_null CHECK variables IS NOT NULL
);

CREATE TABLE IF NOT EXISTS oauth_accounts (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  provider VARCHAR(50) NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT oauth_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT oauth_accounts_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT oauth_accounts_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT oauth_accounts_provider_not_null CHECK provider IS NOT NULL,
  CONSTRAINT oauth_accounts_provider_user_id_not_null CHECK provider_user_id IS NOT NULL,
  CONSTRAINT oauth_accounts_updated_at_not_null CHECK updated_at IS NOT NULL,
  CONSTRAINT oauth_accounts_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS oauth_exchange_codes (
  code VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT oauth_exchange_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT oauth_exchange_codes_code_not_null CHECK code IS NOT NULL,
  CONSTRAINT oauth_exchange_codes_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT oauth_exchange_codes_expires_at_not_null CHECK expires_at IS NOT NULL,
  CONSTRAINT oauth_exchange_codes_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS operations_metrics (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  date date NOT NULL,
  active_bookings integer DEFAULT 0 NOT NULL,
  failed_bookings integer DEFAULT 0 NOT NULL,
  cancellations integer DEFAULT 0 NOT NULL,
  avg_processing_time NUMERIC DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT operations_metrics_active_bookings_not_null CHECK active_bookings IS NOT NULL,
  CONSTRAINT operations_metrics_avg_processing_time_not_null CHECK avg_processing_time IS NOT NULL,
  CONSTRAINT operations_metrics_cancellations_not_null CHECK cancellations IS NOT NULL,
  CONSTRAINT operations_metrics_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT operations_metrics_date_not_null CHECK date IS NOT NULL,
  CONSTRAINT operations_metrics_failed_bookings_not_null CHECK failed_bookings IS NOT NULL,
  CONSTRAINT operations_metrics_id_not_null CHECK id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS package_bookings (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  package_id uuid NOT NULL,
  booking_id uuid NOT NULL,
  travelers_json jsonb NOT NULL,
  total_amount NUMERIC NOT NULL,
  currency VARCHAR(3) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'PENDING'::character varying NOT NULL,
  booking_status VARCHAR(25) DEFAULT 'INITIATED'::character varying NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  default_currency VARCHAR(3),
  CONSTRAINT package_bookings_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT package_bookings_package_id_fkey FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE RESTRICT,
  CONSTRAINT package_bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT package_bookings_booking_id_not_null CHECK booking_id IS NOT NULL,
  CONSTRAINT package_bookings_booking_status_check CHECK ((booking_status)::text = ANY ((ARRAY['INITIATED'::character varying, 'PAYMENT_PENDING'::character varying, 'CONFIRMED'::character varying, 'CANCELLED'::character varying, 'FAILED'::character varying])::text[])),
  CONSTRAINT package_bookings_booking_status_not_null CHECK booking_status IS NOT NULL,
  CONSTRAINT package_bookings_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT package_bookings_currency_check CHECK ((currency)::text = ANY ((ARRAY['USD'::character varying, 'AED'::character varying, 'EUR'::character varying, 'GBP'::character varying])::text[])),
  CONSTRAINT package_bookings_currency_not_null CHECK currency IS NOT NULL,
  CONSTRAINT package_bookings_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT package_bookings_package_id_not_null CHECK package_id IS NOT NULL,
  CONSTRAINT package_bookings_payment_status_check CHECK ((payment_status)::text = ANY ((ARRAY['PENDING'::character varying, 'PAID'::character varying, 'FAILED'::character varying, 'REFUNDED'::character varying])::text[])),
  CONSTRAINT package_bookings_payment_status_not_null CHECK payment_status IS NOT NULL,
  CONSTRAINT package_bookings_total_amount_check CHECK (total_amount >= (0)::numeric),
  CONSTRAINT package_bookings_total_amount_not_null CHECK total_amount IS NOT NULL,
  CONSTRAINT package_bookings_travelers_json_not_null CHECK travelers_json IS NOT NULL,
  CONSTRAINT package_bookings_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS package_exclusions (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  package_id uuid NOT NULL,
  description text NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT package_exclusions_package_id_fkey FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  CONSTRAINT package_exclusions_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT package_exclusions_description_not_null CHECK description IS NOT NULL,
  CONSTRAINT package_exclusions_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT package_exclusions_package_id_not_null CHECK package_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS package_inclusions (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  package_id uuid NOT NULL,
  type VARCHAR(20) NOT NULL,
  description text NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT package_inclusions_package_id_fkey FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  CONSTRAINT package_inclusions_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT package_inclusions_description_not_null CHECK description IS NOT NULL,
  CONSTRAINT package_inclusions_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT package_inclusions_package_id_not_null CHECK package_id IS NOT NULL,
  CONSTRAINT package_inclusions_type_check CHECK ((type)::text = ANY ((ARRAY['flight'::character varying, 'hotel'::character varying, 'meal'::character varying, 'activity'::character varying, 'transfer'::character varying])::text[])),
  CONSTRAINT package_inclusions_type_not_null CHECK type IS NOT NULL
);

CREATE TABLE IF NOT EXISTS package_itineraries (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  package_id uuid NOT NULL,
  day_number integer NOT NULL,
  title VARCHAR(255) NOT NULL,
  description text NOT NULL,
  hotel_id uuid,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT package_itineraries_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL,
  CONSTRAINT package_itineraries_package_id_fkey FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  CONSTRAINT package_itineraries_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT package_itineraries_day_number_check CHECK (day_number > 0),
  CONSTRAINT package_itineraries_day_number_not_null CHECK day_number IS NOT NULL,
  CONSTRAINT package_itineraries_description_not_null CHECK description IS NOT NULL,
  CONSTRAINT package_itineraries_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT package_itineraries_package_id_not_null CHECK package_id IS NOT NULL,
  CONSTRAINT package_itineraries_title_not_null CHECK title IS NOT NULL
);

CREATE TABLE IF NOT EXISTS package_pricing (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  package_id uuid NOT NULL,
  adult_price NUMERIC NOT NULL,
  child_price NUMERIC NOT NULL,
  infant_price NUMERIC NOT NULL,
  CONSTRAINT package_pricing_package_id_fkey FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  CONSTRAINT package_pricing_adult_price_check CHECK (adult_price >= (0)::numeric),
  CONSTRAINT package_pricing_adult_price_not_null CHECK adult_price IS NOT NULL,
  CONSTRAINT package_pricing_child_price_check CHECK (child_price >= (0)::numeric),
  CONSTRAINT package_pricing_child_price_not_null CHECK child_price IS NOT NULL,
  CONSTRAINT package_pricing_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT package_pricing_infant_price_check CHECK (infant_price >= (0)::numeric),
  CONSTRAINT package_pricing_infant_price_not_null CHECK infant_price IS NOT NULL,
  CONSTRAINT package_pricing_package_id_not_null CHECK package_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS password_reset_otps (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used boolean DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT password_reset_otps_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT password_reset_otps_expires_at_not_null CHECK expires_at IS NOT NULL,
  CONSTRAINT password_reset_otps_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT password_reset_otps_otp_hash_not_null CHECK otp_hash IS NOT NULL,
  CONSTRAINT password_reset_otps_used_not_null CHECK used IS NOT NULL,
  CONSTRAINT password_reset_otps_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_metrics (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  provider VARCHAR(20) NOT NULL,
  success_count integer DEFAULT 0 NOT NULL,
  failure_count integer DEFAULT 0 NOT NULL,
  total_volume NUMERIC DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT payment_metrics_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT payment_metrics_failure_count_not_null CHECK failure_count IS NOT NULL,
  CONSTRAINT payment_metrics_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT payment_metrics_provider_not_null CHECK provider IS NOT NULL,
  CONSTRAINT payment_metrics_success_count_not_null CHECK success_count IS NOT NULL,
  CONSTRAINT payment_metrics_total_volume_not_null CHECK total_volume IS NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  booking_id uuid NOT NULL,
  user_id uuid NOT NULL,
  provider VARCHAR(20) NOT NULL,
  amount NUMERIC NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(20) NOT NULL,
  transaction_id VARCHAR(255),
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  invoice_id uuid,
  method VARCHAR(10),
  wallet_amount NUMERIC DEFAULT 0,
  card_amount NUMERIC,
  is_split_payment boolean DEFAULT false,
  second_card_payment_intent_id text,
  threeds_required boolean DEFAULT false,
  threeds_redirect_url text,
  CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
  CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT payments_amount_check CHECK (amount > (0)::numeric),
  CONSTRAINT payments_amount_not_null CHECK amount IS NOT NULL,
  CONSTRAINT payments_booking_id_not_null CHECK booking_id IS NOT NULL,
  CONSTRAINT payments_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT payments_currency_check CHECK ((currency)::text = ANY ((ARRAY['USD'::character varying, 'AED'::character varying, 'EUR'::character varying, 'GBP'::character varying, 'INR'::character varying])::text[])),
  CONSTRAINT payments_currency_not_null CHECK currency IS NOT NULL,
  CONSTRAINT payments_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT payments_metadata_not_null CHECK metadata IS NOT NULL,
  CONSTRAINT payments_method_check CHECK ((method IS NULL) OR ((method)::text = ANY ((ARRAY['CARD'::character varying, 'BNPL'::character varying])::text[]))),
  CONSTRAINT payments_provider_check CHECK ((provider)::text = ANY ((ARRAY['STRIPE'::character varying, 'PAYTABS'::character varying, 'TABBY'::character varying, 'TAMARA'::character varying, 'MOCK'::character varying, 'RAZORPAY'::character varying])::text[])),
  CONSTRAINT payments_provider_not_null CHECK provider IS NOT NULL,
  CONSTRAINT payments_status_check CHECK ((status)::text = ANY ((ARRAY['PENDING'::character varying, 'SUCCESS'::character varying, 'FAILED'::character varying, 'REFUNDED'::character varying])::text[])),
  CONSTRAINT payments_status_not_null CHECK status IS NOT NULL,
  CONSTRAINT payments_updated_at_not_null CHECK updated_at IS NOT NULL,
  CONSTRAINT payments_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  payment_id uuid NOT NULL,
  provider_response jsonb NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT payment_transactions_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  CONSTRAINT payment_transactions_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT payment_transactions_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT payment_transactions_payment_id_not_null CHECK payment_id IS NOT NULL,
  CONSTRAINT payment_transactions_provider_response_not_null CHECK provider_response IS NOT NULL,
  CONSTRAINT payment_transactions_status_check CHECK ((status)::text = ANY ((ARRAY['PENDING'::character varying, 'SUCCESS'::character varying, 'FAILED'::character varying, 'REFUNDED'::character varying])::text[])),
  CONSTRAINT payment_transactions_status_not_null CHECK status IS NOT NULL
);

CREATE TABLE IF NOT EXISTS permissions (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  slug VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  module VARCHAR(64),
  action VARCHAR(20),
  CONSTRAINT permissions_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT permissions_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT permissions_slug_not_null CHECK slug IS NOT NULL,
  CONSTRAINT permissions_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS pnr_records (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  booking_id uuid NOT NULL,
  pnr_code VARCHAR(32) NOT NULL,
  provider VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT pnr_records_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT pnr_records_booking_id_not_null CHECK booking_id IS NOT NULL,
  CONSTRAINT pnr_records_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT pnr_records_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT pnr_records_pnr_code_not_null CHECK pnr_code IS NOT NULL,
  CONSTRAINT pnr_records_provider_check CHECK ((provider)::text = ANY ((ARRAY['AMADEUS'::character varying, 'SABRE'::character varying, 'TRAVELPORT'::character varying, 'INTERNAL'::character varying])::text[])),
  CONSTRAINT pnr_records_provider_not_null CHECK provider IS NOT NULL,
  CONSTRAINT pnr_records_status_check CHECK ((status)::text = ANY ((ARRAY['CREATED'::character varying, 'TICKETED'::character varying, 'CANCELLED'::character varying])::text[])),
  CONSTRAINT pnr_records_status_not_null CHECK status IS NOT NULL,
  CONSTRAINT pnr_records_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS points_transactions (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  transaction_type POINTS_TRANSACTION_TYPE NOT NULL,
  points integer NOT NULL,
  balance_before integer NOT NULL,
  balance_after integer NOT NULL,
  reference_id uuid,
  description text,
  expires_at TIMESTAMPTZ,
  is_expired boolean DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT points_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT points_transactions_balance_after_not_null CHECK balance_after IS NOT NULL,
  CONSTRAINT points_transactions_balance_before_not_null CHECK balance_before IS NOT NULL,
  CONSTRAINT points_transactions_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT points_transactions_points_not_null CHECK points IS NOT NULL,
  CONSTRAINT points_transactions_transaction_type_not_null CHECK transaction_type IS NOT NULL,
  CONSTRAINT points_transactions_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS price_alerts (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  alert_type VARCHAR(20) NOT NULL,
  search_params jsonb NOT NULL,
  target_price NUMERIC NOT NULL,
  currency CHAR(3) DEFAULT 'USD'::bpchar,
  channels jsonb DEFAULT '["email"]'::jsonb,
  is_active boolean DEFAULT true,
  last_checked_at TIMESTAMPTZ,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT price_alerts_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT price_alerts_alert_type_not_null CHECK alert_type IS NOT NULL,
  CONSTRAINT price_alerts_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT price_alerts_search_params_not_null CHECK search_params IS NOT NULL,
  CONSTRAINT price_alerts_target_price_not_null CHECK target_price IS NOT NULL,
  CONSTRAINT price_alerts_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS pricing_rules (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  tier VARCHAR(20) NOT NULL,
  margin_pct NUMERIC DEFAULT 0 NOT NULL,
  seasonal_pct NUMERIC DEFAULT 0 NOT NULL,
  surge_pct NUMERIC DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT pricing_rules_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT pricing_rules_is_active_not_null CHECK is_active IS NOT NULL,
  CONSTRAINT pricing_rules_margin_pct_not_null CHECK margin_pct IS NOT NULL,
  CONSTRAINT pricing_rules_seasonal_pct_not_null CHECK seasonal_pct IS NOT NULL,
  CONSTRAINT pricing_rules_surge_pct_not_null CHECK surge_pct IS NOT NULL,
  CONSTRAINT pricing_rules_tier_check CHECK ((tier)::text = ANY ((ARRAY['budget'::character varying, 'standard'::character varying, 'luxury'::character varying])::text[])),
  CONSTRAINT pricing_rules_tier_not_null CHECK tier IS NOT NULL,
  CONSTRAINT pricing_rules_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS provider_switches (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  provider VARCHAR(64) NOT NULL,
  provider_type VARCHAR(20) NOT NULL,
  is_enabled boolean DEFAULT true NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT provider_switches_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT provider_switches_is_enabled_not_null CHECK is_enabled IS NOT NULL,
  CONSTRAINT provider_switches_provider_not_null CHECK provider IS NOT NULL,
  CONSTRAINT provider_switches_provider_type_check CHECK ((provider_type)::text = ANY ((ARRAY['flight'::character varying, 'hotel'::character varying])::text[])),
  CONSTRAINT provider_switches_provider_type_not_null CHECK provider_type IS NOT NULL,
  CONSTRAINT provider_switches_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS public_reviews (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  author_name VARCHAR(180) NOT NULL,
  author_avatar text,
  author_location VARCHAR(180) NOT NULL,
  rating integer NOT NULL,
  text text NOT NULL,
  is_verified boolean DEFAULT true NOT NULL,
  category VARCHAR(80),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT public_reviews_author_location_not_null CHECK author_location IS NOT NULL,
  CONSTRAINT public_reviews_author_name_not_null CHECK author_name IS NOT NULL,
  CONSTRAINT public_reviews_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT public_reviews_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT public_reviews_is_verified_not_null CHECK is_verified IS NOT NULL,
  CONSTRAINT public_reviews_rating_check CHECK ((rating >= 1) AND (rating <= 5)),
  CONSTRAINT public_reviews_rating_not_null CHECK rating IS NOT NULL,
  CONSTRAINT public_reviews_text_not_null CHECK text IS NOT NULL
);

CREATE TABLE IF NOT EXISTS reconciliation_logs (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  transaction_id text NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT reconciliation_logs_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT reconciliation_logs_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT reconciliation_logs_status_check CHECK ((status)::text = ANY ((ARRAY['MATCHED'::character varying, 'MISMATCH'::character varying])::text[])),
  CONSTRAINT reconciliation_logs_status_not_null CHECK status IS NOT NULL,
  CONSTRAINT reconciliation_logs_transaction_id_not_null CHECK transaction_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS referrals (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  referrer_id uuid NOT NULL,
  referee_id uuid,
  referee_email VARCHAR(200),
  referral_code VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending'::character varying,
  referrer_points integer DEFAULT 500,
  referee_points integer DEFAULT 250,
  first_booking_id uuid,
  rewarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT referrals_referee_id_fkey FOREIGN KEY (referee_id) REFERENCES users(id),
  CONSTRAINT referrals_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES users(id),
  CONSTRAINT referrals_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT referrals_referral_code_not_null CHECK referral_code IS NOT NULL,
  CONSTRAINT referrals_referrer_id_not_null CHECK referrer_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  token_hash VARCHAR(64) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  replaced_by_id uuid,
  ip_address VARCHAR(45),
  user_agent text,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT refresh_tokens_replaced_by_id_fkey FOREIGN KEY (replaced_by_id) REFERENCES refresh_tokens(id),
  CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT refresh_tokens_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT refresh_tokens_expires_at_not_null CHECK expires_at IS NOT NULL,
  CONSTRAINT refresh_tokens_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT refresh_tokens_token_hash_not_null CHECK token_hash IS NOT NULL,
  CONSTRAINT refresh_tokens_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS refunds (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  payment_id uuid,
  booking_id uuid,
  amount NUMERIC NOT NULL,
  status VARCHAR(20) NOT NULL,
  provider_refund_id VARCHAR(255),
  payment_reference VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT refunds_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT refunds_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  CONSTRAINT refunds_amount_check CHECK (amount > (0)::numeric),
  CONSTRAINT refunds_amount_not_null CHECK amount IS NOT NULL,
  CONSTRAINT refunds_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT refunds_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT refunds_status_check CHECK ((status)::text = ANY ((ARRAY['PENDING'::character varying, 'SUCCESS'::character varying, 'PROCESSED'::character varying, 'FAILED'::character varying])::text[])),
  CONSTRAINT refunds_status_not_null CHECK status IS NOT NULL,
  CONSTRAINT refunds_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS revenue_metrics (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  date date NOT NULL,
  total_revenue NUMERIC DEFAULT 0 NOT NULL,
  flight_revenue NUMERIC DEFAULT 0 NOT NULL,
  hotel_revenue NUMERIC DEFAULT 0 NOT NULL,
  refund_amount NUMERIC DEFAULT 0 NOT NULL,
  net_revenue NUMERIC DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT revenue_metrics_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT revenue_metrics_date_not_null CHECK date IS NOT NULL,
  CONSTRAINT revenue_metrics_flight_revenue_not_null CHECK flight_revenue IS NOT NULL,
  CONSTRAINT revenue_metrics_hotel_revenue_not_null CHECK hotel_revenue IS NOT NULL,
  CONSTRAINT revenue_metrics_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT revenue_metrics_net_revenue_not_null CHECK net_revenue IS NOT NULL,
  CONSTRAINT revenue_metrics_refund_amount_not_null CHECK refund_amount IS NOT NULL,
  CONSTRAINT revenue_metrics_total_revenue_not_null CHECK total_revenue IS NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  booking_id uuid NOT NULL,
  rating smallint NOT NULL,
  comments text,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT reviews_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT reviews_booking_id_not_null CHECK booking_id IS NOT NULL,
  CONSTRAINT reviews_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT reviews_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT reviews_rating_check CHECK ((rating >= 1) AND (rating <= 5)),
  CONSTRAINT reviews_rating_not_null CHECK rating IS NOT NULL,
  CONSTRAINT reviews_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS reward_rules (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  action VARCHAR(20) NOT NULL,
  points_awarded integer NOT NULL,
  conditions jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT reward_rules_action_check CHECK ((action)::text = ANY ((ARRAY['BOOKING'::character varying, 'SIGNUP'::character varying, 'REFERRAL'::character varying])::text[])),
  CONSTRAINT reward_rules_action_not_null CHECK action IS NOT NULL,
  CONSTRAINT reward_rules_conditions_not_null CHECK conditions IS NOT NULL,
  CONSTRAINT reward_rules_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT reward_rules_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT reward_rules_points_awarded_check CHECK (points_awarded >= 0),
  CONSTRAINT reward_rules_points_awarded_not_null CHECK points_awarded IS NOT NULL,
  CONSTRAINT reward_rules_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id uuid NOT NULL,
  permission_id uuid NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT role_permissions_permission_id_not_null CHECK permission_id IS NOT NULL,
  CONSTRAINT role_permissions_role_id_not_null CHECK role_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS rooms (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  hotel_id uuid NOT NULL,
  room_type VARCHAR(120) NOT NULL,
  capacity integer NOT NULL,
  price_per_night NUMERIC NOT NULL,
  currency VARCHAR(3) NOT NULL,
  available_rooms integer NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT rooms_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  CONSTRAINT rooms_available_rooms_check CHECK (available_rooms >= 0),
  CONSTRAINT rooms_available_rooms_not_null CHECK available_rooms IS NOT NULL,
  CONSTRAINT rooms_capacity_check CHECK (capacity > 0),
  CONSTRAINT rooms_capacity_not_null CHECK capacity IS NOT NULL,
  CONSTRAINT rooms_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT rooms_currency_check CHECK ((currency)::text ~ '^[A-Z]{3}$'::text),
  CONSTRAINT rooms_currency_not_null CHECK currency IS NOT NULL,
  CONSTRAINT rooms_hotel_id_not_null CHECK hotel_id IS NOT NULL,
  CONSTRAINT rooms_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT rooms_price_per_night_check CHECK (price_per_night >= (0)::numeric),
  CONSTRAINT rooms_price_per_night_not_null CHECK price_per_night IS NOT NULL,
  CONSTRAINT rooms_room_type_not_null CHECK room_type IS NOT NULL,
  CONSTRAINT rooms_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS room_images (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  room_id uuid NOT NULL,
  image_url text NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT room_images_room_id_fkey FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  CONSTRAINT room_images_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT room_images_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT room_images_image_url_not_null CHECK image_url IS NOT NULL,
  CONSTRAINT room_images_room_id_not_null CHECK room_id IS NOT NULL,
  CONSTRAINT room_images_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS saved_travelers (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  passport_number VARCHAR(50) NOT NULL,
  dob date NOT NULL,
  nationality VARCHAR(80) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  gender VARCHAR(20),
  CONSTRAINT saved_travelers_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT saved_travelers_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT saved_travelers_dob_not_null CHECK dob IS NOT NULL,
  CONSTRAINT saved_travelers_full_name_not_null CHECK full_name IS NOT NULL,
  CONSTRAINT saved_travelers_gender_check CHECK ((gender)::text = ANY ((ARRAY['MALE'::character varying, 'FEMALE'::character varying, 'OTHER'::character varying, 'UNSPECIFIED'::character varying])::text[])),
  CONSTRAINT saved_travelers_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT saved_travelers_nationality_not_null CHECK nationality IS NOT NULL,
  CONSTRAINT saved_travelers_passport_number_not_null CHECK passport_number IS NOT NULL,
  CONSTRAINT saved_travelers_updated_at_not_null CHECK updated_at IS NOT NULL,
  CONSTRAINT saved_travelers_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS seat_selections (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  booking_id uuid NOT NULL,
  passenger_index integer DEFAULT 0 NOT NULL,
  flight_id uuid NOT NULL,
  seat_row integer NOT NULL,
  seat_column CHAR(1) NOT NULL,
  seat_class SEAT_CLASS NOT NULL,
  seat_position SEAT_POSITION,
  price NUMERIC DEFAULT 0,
  currency CHAR(3) DEFAULT 'USD'::bpchar,
  status SEAT_STATUS DEFAULT 'reserved'::seat_status,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT seat_selections_booking_id_not_null CHECK booking_id IS NOT NULL,
  CONSTRAINT seat_selections_flight_id_not_null CHECK flight_id IS NOT NULL,
  CONSTRAINT seat_selections_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT seat_selections_passenger_index_not_null CHECK passenger_index IS NOT NULL,
  CONSTRAINT seat_selections_seat_class_not_null CHECK seat_class IS NOT NULL,
  CONSTRAINT seat_selections_seat_column_not_null CHECK seat_column IS NOT NULL,
  CONSTRAINT seat_selections_seat_row_not_null CHECK seat_row IS NOT NULL
);

CREATE TABLE IF NOT EXISTS settlements (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  provider VARCHAR(20) NOT NULL,
  total_amount NUMERIC DEFAULT 0 NOT NULL,
  settled_amount NUMERIC DEFAULT 0 NOT NULL,
  pending_amount NUMERIC DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT settlements_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT settlements_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT settlements_pending_amount_not_null CHECK pending_amount IS NOT NULL,
  CONSTRAINT settlements_provider_not_null CHECK provider IS NOT NULL,
  CONSTRAINT settlements_settled_amount_not_null CHECK settled_amount IS NOT NULL,
  CONSTRAINT settlements_total_amount_not_null CHECK total_amount IS NOT NULL
);

CREATE TABLE IF NOT EXISTS sla_policies (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  priority TICKET_PRIORITY NOT NULL,
  first_response_hours integer NOT NULL,
  resolution_hours integer NOT NULL,
  is_active boolean DEFAULT true,
  CONSTRAINT sla_policies_first_response_hours_not_null CHECK first_response_hours IS NOT NULL,
  CONSTRAINT sla_policies_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT sla_policies_name_not_null CHECK name IS NOT NULL,
  CONSTRAINT sla_policies_priority_not_null CHECK priority IS NOT NULL,
  CONSTRAINT sla_policies_resolution_hours_not_null CHECK resolution_hours IS NOT NULL
);

CREATE TABLE IF NOT EXISTS sla_tracking (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  booking_id uuid NOT NULL,
  expected_time TIMESTAMPTZ NOT NULL,
  actual_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT sla_tracking_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT sla_tracking_actual_time_not_null CHECK actual_time IS NOT NULL,
  CONSTRAINT sla_tracking_booking_id_not_null CHECK booking_id IS NOT NULL,
  CONSTRAINT sla_tracking_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT sla_tracking_expected_time_not_null CHECK expected_time IS NOT NULL,
  CONSTRAINT sla_tracking_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT sla_tracking_status_check CHECK ((status)::text = ANY ((ARRAY['ON_TIME'::character varying, 'DELAYED'::character varying])::text[])),
  CONSTRAINT sla_tracking_status_not_null CHECK status IS NOT NULL
);

CREATE TABLE IF NOT EXISTS standby_deals (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  origin VARCHAR(10) NOT NULL,
  destination VARCHAR(10) NOT NULL,
  bid_price NUMERIC NOT NULL,
  deposit_amount NUMERIC NOT NULL,
  currency VARCHAR(10) DEFAULT 'PKR'::character varying NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT standby_deals_bid_price_not_null CHECK bid_price IS NOT NULL,
  CONSTRAINT standby_deals_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT standby_deals_currency_not_null CHECK currency IS NOT NULL,
  CONSTRAINT standby_deals_deposit_amount_not_null CHECK deposit_amount IS NOT NULL,
  CONSTRAINT standby_deals_destination_not_null CHECK destination IS NOT NULL,
  CONSTRAINT standby_deals_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT standby_deals_is_active_not_null CHECK is_active IS NOT NULL,
  CONSTRAINT standby_deals_origin_not_null CHECK origin IS NOT NULL,
  CONSTRAINT standby_deals_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS standby_deposits (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid,
  standby_deal_id uuid,
  origin VARCHAR(10) NOT NULL,
  destination VARCHAR(10) NOT NULL,
  amount_paid NUMERIC NOT NULL,
  currency VARCHAR(10) DEFAULT 'PKR'::character varying NOT NULL,
  status VARCHAR(20) DEFAULT 'pending'::character varying NOT NULL,
  razorpay_order_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  departure_date date,
  razorpay_payment_id VARCHAR(100),
  passengers jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT standby_deposits_amount_paid_not_null CHECK amount_paid IS NOT NULL,
  CONSTRAINT standby_deposits_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT standby_deposits_currency_not_null CHECK currency IS NOT NULL,
  CONSTRAINT standby_deposits_destination_not_null CHECK destination IS NOT NULL,
  CONSTRAINT standby_deposits_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT standby_deposits_origin_not_null CHECK origin IS NOT NULL,
  CONSTRAINT standby_deposits_status_not_null CHECK status IS NOT NULL,
  CONSTRAINT standby_deposits_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS support_agents (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  agent_role AGENT_ROLE DEFAULT 'agent'::agent_role,
  is_available boolean DEFAULT true,
  current_ticket_count integer DEFAULT 0,
  max_tickets integer DEFAULT 10,
  specializations jsonb DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT support_agents_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT support_agents_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT support_agents_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  ticket_number VARCHAR(30) NOT NULL,
  user_id uuid NOT NULL,
  booking_id uuid,
  assigned_agent_id uuid,
  category TICKET_CATEGORY NOT NULL,
  subject VARCHAR(300) NOT NULL,
  status TICKET_STATUS DEFAULT 'open'::ticket_status,
  priority TICKET_PRIORITY DEFAULT 'medium'::ticket_priority,
  channel TICKET_CHANNEL DEFAULT 'web'::ticket_channel,
  sla_deadline TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  satisfaction_rating smallint,
  satisfaction_comment text,
  tags jsonb DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT support_tickets_assigned_agent_id_fkey FOREIGN KEY (assigned_agent_id) REFERENCES support_agents(id),
  CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT support_tickets_category_not_null CHECK category IS NOT NULL,
  CONSTRAINT support_tickets_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT support_tickets_satisfaction_rating_check CHECK ((satisfaction_rating >= 1) AND (satisfaction_rating <= 5)),
  CONSTRAINT support_tickets_subject_not_null CHECK subject IS NOT NULL,
  CONSTRAINT support_tickets_ticket_number_not_null CHECK ticket_number IS NOT NULL,
  CONSTRAINT support_tickets_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS system_health (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  service_name VARCHAR(80) NOT NULL,
  status VARCHAR(10) NOT NULL,
  response_time NUMERIC DEFAULT 0 NOT NULL,
  checked_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT system_health_checked_at_not_null CHECK checked_at IS NOT NULL,
  CONSTRAINT system_health_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT system_health_response_time_not_null CHECK response_time IS NOT NULL,
  CONSTRAINT system_health_service_name_not_null CHECK service_name IS NOT NULL,
  CONSTRAINT system_health_status_check CHECK ((status)::text = ANY ((ARRAY['UP'::character varying, 'DOWN'::character varying])::text[])),
  CONSTRAINT system_health_status_not_null CHECK status IS NOT NULL
);

CREATE TABLE IF NOT EXISTS system_settings (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  key VARCHAR(120) NOT NULL,
  value jsonb DEFAULT '{}'::jsonb NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT system_settings_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT system_settings_key_not_null CHECK key IS NOT NULL,
  CONSTRAINT system_settings_updated_at_not_null CHECK updated_at IS NOT NULL,
  CONSTRAINT system_settings_value_not_null CHECK value IS NOT NULL
);

CREATE TABLE IF NOT EXISTS tickets (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  pnr_id uuid NOT NULL,
  ticket_number VARCHAR(32) NOT NULL,
  passenger_id uuid NOT NULL,
  flight_id uuid NOT NULL,
  issue_date TIMESTAMPTZ DEFAULT now() NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT tickets_flight_id_fkey FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE RESTRICT,
  CONSTRAINT tickets_passenger_id_fkey FOREIGN KEY (passenger_id) REFERENCES booking_passengers(id) ON DELETE RESTRICT,
  CONSTRAINT tickets_pnr_id_fkey FOREIGN KEY (pnr_id) REFERENCES pnr_records(id) ON DELETE CASCADE,
  CONSTRAINT tickets_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT tickets_flight_id_not_null CHECK flight_id IS NOT NULL,
  CONSTRAINT tickets_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT tickets_issue_date_not_null CHECK issue_date IS NOT NULL,
  CONSTRAINT tickets_passenger_id_not_null CHECK passenger_id IS NOT NULL,
  CONSTRAINT tickets_pnr_id_not_null CHECK pnr_id IS NOT NULL,
  CONSTRAINT tickets_status_check CHECK ((status)::text = ANY ((ARRAY['ISSUED'::character varying, 'CANCELLED'::character varying])::text[])),
  CONSTRAINT tickets_status_not_null CHECK status IS NOT NULL,
  CONSTRAINT tickets_ticket_number_not_null CHECK ticket_number IS NOT NULL,
  CONSTRAINT tickets_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS ticket_documents (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  ticket_id uuid NOT NULL,
  file_url text NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT ticket_documents_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  CONSTRAINT ticket_documents_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT ticket_documents_file_url_not_null CHECK file_url IS NOT NULL,
  CONSTRAINT ticket_documents_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT ticket_documents_ticket_id_not_null CHECK ticket_id IS NOT NULL,
  CONSTRAINT ticket_documents_updated_at_not_null CHECK updated_at IS NOT NULL
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  ticket_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  is_agent boolean DEFAULT false,
  is_internal_note boolean DEFAULT false,
  body text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT ticket_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES users(id),
  CONSTRAINT ticket_messages_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
  CONSTRAINT ticket_messages_body_not_null CHECK body IS NOT NULL,
  CONSTRAINT ticket_messages_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT ticket_messages_sender_id_not_null CHECK sender_id IS NOT NULL,
  CONSTRAINT ticket_messages_ticket_id_not_null CHECK ticket_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS transfer_providers (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  country_code CHAR(2) NOT NULL,
  api_endpoint text,
  is_active boolean DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT transfer_providers_country_code_not_null CHECK country_code IS NOT NULL,
  CONSTRAINT transfer_providers_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT transfer_providers_name_not_null CHECK name IS NOT NULL
);

CREATE TABLE IF NOT EXISTS transfer_routes (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  provider_id uuid,
  origin_iata CHAR(3),
  origin_name VARCHAR(200) NOT NULL,
  destination_name VARCHAR(200) NOT NULL,
  destination_city VARCHAR(100) NOT NULL,
  country_code CHAR(2) NOT NULL,
  distance_km NUMERIC,
  duration_minutes integer,
  is_active boolean DEFAULT true,
  CONSTRAINT transfer_routes_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES transfer_providers(id),
  CONSTRAINT transfer_routes_country_code_not_null CHECK country_code IS NOT NULL,
  CONSTRAINT transfer_routes_destination_city_not_null CHECK destination_city IS NOT NULL,
  CONSTRAINT transfer_routes_destination_name_not_null CHECK destination_name IS NOT NULL,
  CONSTRAINT transfer_routes_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT transfer_routes_origin_name_not_null CHECK origin_name IS NOT NULL
);

CREATE TABLE IF NOT EXISTS transfer_vehicles (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  route_id uuid,
  vehicle_type VEHICLE_TYPE NOT NULL,
  transfer_type TRANSFER_TYPE NOT NULL,
  max_passengers smallint NOT NULL,
  max_luggage smallint DEFAULT 2,
  price NUMERIC NOT NULL,
  currency CHAR(3) DEFAULT 'USD'::bpchar,
  includes_meet_and_greet boolean DEFAULT false,
  includes_flight_tracking boolean DEFAULT false,
  free_waiting_minutes integer DEFAULT 60,
  description text,
  image_url text,
  CONSTRAINT transfer_vehicles_route_id_fkey FOREIGN KEY (route_id) REFERENCES transfer_routes(id),
  CONSTRAINT transfer_vehicles_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT transfer_vehicles_max_passengers_not_null CHECK max_passengers IS NOT NULL,
  CONSTRAINT transfer_vehicles_price_not_null CHECK price IS NOT NULL,
  CONSTRAINT transfer_vehicles_transfer_type_not_null CHECK transfer_type IS NOT NULL,
  CONSTRAINT transfer_vehicles_vehicle_type_not_null CHECK vehicle_type IS NOT NULL
);

CREATE TABLE IF NOT EXISTS transfer_bookings (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  vehicle_id uuid NOT NULL,
  direction TRANSFER_DIRECTION NOT NULL,
  status TRANSFER_STATUS DEFAULT 'pending'::transfer_status,
  flight_number VARCHAR(20),
  flight_arrival_datetime TIMESTAMPTZ,
  pickup_datetime TIMESTAMPTZ NOT NULL,
  pickup_address text NOT NULL,
  dropoff_address text NOT NULL,
  passenger_count smallint NOT NULL,
  luggage_count smallint DEFAULT 1,
  passenger_name VARCHAR(200) NOT NULL,
  passenger_phone VARCHAR(30) NOT NULL,
  passenger_email VARCHAR(200),
  meet_and_greet boolean DEFAULT false,
  special_requests text,
  price NUMERIC NOT NULL,
  currency CHAR(3) DEFAULT 'USD'::bpchar,
  payment_id uuid,
  confirmation_code VARCHAR(50),
  driver_name VARCHAR(200),
  driver_phone VARCHAR(30),
  driver_vehicle_plate VARCHAR(30),
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  default_currency VARCHAR(3),
  CONSTRAINT transfer_bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT transfer_bookings_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES transfer_vehicles(id),
  CONSTRAINT transfer_bookings_direction_not_null CHECK direction IS NOT NULL,
  CONSTRAINT transfer_bookings_dropoff_address_not_null CHECK dropoff_address IS NOT NULL,
  CONSTRAINT transfer_bookings_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT transfer_bookings_passenger_count_not_null CHECK passenger_count IS NOT NULL,
  CONSTRAINT transfer_bookings_passenger_name_not_null CHECK passenger_name IS NOT NULL,
  CONSTRAINT transfer_bookings_passenger_phone_not_null CHECK passenger_phone IS NOT NULL,
  CONSTRAINT transfer_bookings_pickup_address_not_null CHECK pickup_address IS NOT NULL,
  CONSTRAINT transfer_bookings_pickup_datetime_not_null CHECK pickup_datetime IS NOT NULL,
  CONSTRAINT transfer_bookings_price_not_null CHECK price IS NOT NULL,
  CONSTRAINT transfer_bookings_user_id_not_null CHECK user_id IS NOT NULL,
  CONSTRAINT transfer_bookings_vehicle_id_not_null CHECK vehicle_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS travel_documents (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  traveler_id uuid,
  booking_id uuid,
  doc_type VARCHAR(30) NOT NULL,
  title VARCHAR(255),
  original_file_name VARCHAR(255) NOT NULL,
  storage_path text NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  size_bytes integer NOT NULL,
  issuing_country VARCHAR(80),
  destination VARCHAR(120),
  expiry_date date,
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  ocr_data jsonb DEFAULT '{}'::jsonb NOT NULL,
  share_token uuid DEFAULT uuid_generate_v4() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT travel_documents_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT travel_documents_traveler_id_fkey FOREIGN KEY (traveler_id) REFERENCES saved_travelers(id) ON DELETE SET NULL,
  CONSTRAINT travel_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT travel_documents_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT travel_documents_doc_type_check CHECK ((doc_type)::text = ANY ((ARRAY['PASSPORT'::character varying, 'NATIONAL_ID'::character varying, 'VISA'::character varying, 'E_TICKET'::character varying, 'HOTEL_VOUCHER'::character varying, 'INSURANCE'::character varying, 'OTHER'::character varying])::text[])),
  CONSTRAINT travel_documents_doc_type_not_null CHECK doc_type IS NOT NULL,
  CONSTRAINT travel_documents_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT travel_documents_metadata_not_null CHECK metadata IS NOT NULL,
  CONSTRAINT travel_documents_mime_type_not_null CHECK mime_type IS NOT NULL,
  CONSTRAINT travel_documents_ocr_data_not_null CHECK ocr_data IS NOT NULL,
  CONSTRAINT travel_documents_original_file_name_not_null CHECK original_file_name IS NOT NULL,
  CONSTRAINT travel_documents_share_token_not_null CHECK share_token IS NOT NULL,
  CONSTRAINT travel_documents_size_bytes_check CHECK (size_bytes >= 0),
  CONSTRAINT travel_documents_size_bytes_not_null CHECK size_bytes IS NOT NULL,
  CONSTRAINT travel_documents_storage_path_not_null CHECK storage_path IS NOT NULL,
  CONSTRAINT travel_documents_updated_at_not_null CHECK updated_at IS NOT NULL,
  CONSTRAINT travel_documents_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS user_milestones (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  milestone_id uuid NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT user_milestones_milestone_id_fkey FOREIGN KEY (milestone_id) REFERENCES milestones(id),
  CONSTRAINT user_milestones_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT user_milestones_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT user_milestones_milestone_id_not_null CHECK milestone_id IS NOT NULL,
  CONSTRAINT user_milestones_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  seat_preference VARCHAR(20),
  hotel_star_min smallint,
  ai_persona VARCHAR(30) DEFAULT 'balanced'::character varying,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT user_preferences_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT user_preferences_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT user_preferences_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  date_of_birth date,
  gender VARCHAR(20),
  passport_number VARCHAR(50),
  nationality VARCHAR(50),
  preferences jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  middle_name VARCHAR(100),
  passport_expiry VARCHAR(50),
  CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT user_profiles_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT user_profiles_gender_check CHECK ((gender)::text = ANY ((ARRAY['MALE'::character varying, 'FEMALE'::character varying, 'OTHER'::character varying, 'UNSPECIFIED'::character varying])::text[])),
  CONSTRAINT user_profiles_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT user_profiles_preferences_not_null CHECK preferences IS NOT NULL,
  CONSTRAINT user_profiles_updated_at_not_null CHECK updated_at IS NOT NULL,
  CONSTRAINT user_profiles_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS user_recent_searches (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  search_type VARCHAR(20) DEFAULT 'flights'::character varying NOT NULL,
  search_date date,
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT user_recent_searches_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT user_recent_searches_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT user_recent_searches_destination_not_null CHECK destination IS NOT NULL,
  CONSTRAINT user_recent_searches_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT user_recent_searches_metadata_not_null CHECK metadata IS NOT NULL,
  CONSTRAINT user_recent_searches_origin_not_null CHECK origin IS NOT NULL,
  CONSTRAINT user_recent_searches_search_type_not_null CHECK search_type IS NOT NULL,
  CONSTRAINT user_recent_searches_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id uuid NOT NULL,
  role_id uuid NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT user_roles_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT user_roles_role_id_not_null CHECK role_id IS NOT NULL,
  CONSTRAINT user_roles_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS user_two_factor (
  user_id uuid NOT NULL PRIMARY KEY,
  secret_ciphertext text,
  pending_secret_ciphertext text,
  enabled boolean DEFAULT false NOT NULL,
  backup_codes_json jsonb DEFAULT '[]'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT user_two_factor_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT user_two_factor_backup_codes_json_not_null CHECK backup_codes_json IS NOT NULL,
  CONSTRAINT user_two_factor_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT user_two_factor_enabled_not_null CHECK enabled IS NOT NULL,
  CONSTRAINT user_two_factor_updated_at_not_null CHECK updated_at IS NOT NULL,
  CONSTRAINT user_two_factor_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS user_wishlist (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  attraction_id uuid NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT user_wishlist_attraction_id_fkey FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE CASCADE,
  CONSTRAINT user_wishlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT user_wishlist_attraction_id_not_null CHECK attraction_id IS NOT NULL,
  CONSTRAINT user_wishlist_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT user_wishlist_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT user_wishlist_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS wallets (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  balance NUMERIC DEFAULT 0.00 NOT NULL,
  currency CHAR(3) DEFAULT 'USD'::bpchar,
  is_frozen boolean DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT wallets_balance_not_null CHECK balance IS NOT NULL,
  CONSTRAINT wallets_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT wallets_user_id_not_null CHECK user_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  wallet_id uuid NOT NULL,
  user_id uuid NOT NULL,
  transaction_type WALLET_TRANSACTION_TYPE NOT NULL,
  amount NUMERIC NOT NULL,
  balance_before NUMERIC NOT NULL,
  balance_after NUMERIC NOT NULL,
  reference_id uuid,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT wallet_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT wallet_transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES wallets(id),
  CONSTRAINT wallet_transactions_amount_not_null CHECK amount IS NOT NULL,
  CONSTRAINT wallet_transactions_balance_after_not_null CHECK balance_after IS NOT NULL,
  CONSTRAINT wallet_transactions_balance_before_not_null CHECK balance_before IS NOT NULL,
  CONSTRAINT wallet_transactions_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT wallet_transactions_transaction_type_not_null CHECK transaction_type IS NOT NULL,
  CONSTRAINT wallet_transactions_user_id_not_null CHECK user_id IS NOT NULL,
  CONSTRAINT wallet_transactions_wallet_id_not_null CHECK wallet_id IS NOT NULL
);

CREATE TABLE IF NOT EXISTS wishlists (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid,
  session_id VARCHAR(255),
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  data jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT wishlists_created_at_not_null CHECK created_at IS NOT NULL,
  CONSTRAINT wishlists_data_not_null CHECK data IS NOT NULL,
  CONSTRAINT wishlists_entity_id_not_null CHECK entity_id IS NOT NULL,
  CONSTRAINT wishlists_entity_type_not_null CHECK entity_type IS NOT NULL,
  CONSTRAINT wishlists_id_not_null CHECK id IS NOT NULL,
  CONSTRAINT wishlists_updated_at_not_null CHECK updated_at IS NOT NULL
);

-- Indexes
CREATE INDEX idx_admin_sessions_admin_login ON public.admin_sessions USING btree (admin_id, login_time DESC);
CREATE UNIQUE INDEX admin_users_user_id_key ON public.admin_users USING btree (user_id);
CREATE INDEX idx_ai_generated_packages_created_by ON public.ai_generated_packages USING btree (created_by, created_at DESC);
CREATE INDEX idx_ai_generated_packages_status_created ON public.ai_generated_packages USING btree (status, created_at DESC);
CREATE INDEX idx_ai_generation_logs_created ON public.ai_generation_logs USING btree (created_at DESC);
CREATE INDEX idx_seat_map_flight ON public.aircraft_seat_maps USING btree (flight_id);
CREATE UNIQUE INDEX analytics_bookings_booking_id_created_at_key ON ONLY public.analytics_bookings USING btree (booking_id, created_at);
CREATE INDEX idx_analytics_bookings_created_at ON ONLY public.analytics_bookings USING btree (created_at);
CREATE INDEX idx_analytics_bookings_user_id ON ONLY public.analytics_bookings USING btree (user_id);
CREATE UNIQUE INDEX analytics_bookings_202605_booking_id_created_at_key ON public.analytics_bookings_202605 USING btree (booking_id, created_at);
CREATE INDEX analytics_bookings_202605_created_at_idx ON public.analytics_bookings_202605 USING btree (created_at);
CREATE INDEX analytics_bookings_202605_user_id_idx ON public.analytics_bookings_202605 USING btree (user_id);
CREATE UNIQUE INDEX analytics_bookings_202606_booking_id_created_at_key ON public.analytics_bookings_202606 USING btree (booking_id, created_at);
CREATE INDEX analytics_bookings_202606_created_at_idx ON public.analytics_bookings_202606 USING btree (created_at);
CREATE INDEX analytics_bookings_202606_user_id_idx ON public.analytics_bookings_202606 USING btree (user_id);
CREATE UNIQUE INDEX analytics_bookings_default_booking_id_created_at_key ON public.analytics_bookings_default USING btree (booking_id, created_at);
CREATE INDEX analytics_bookings_default_created_at_idx ON public.analytics_bookings_default USING btree (created_at);
CREATE INDEX analytics_bookings_default_user_id_idx ON public.analytics_bookings_default USING btree (user_id);
CREATE INDEX idx_analytics_events_created_at ON ONLY public.analytics_events USING btree (created_at);
CREATE INDEX idx_analytics_events_user_id ON ONLY public.analytics_events USING btree (user_id);
CREATE INDEX analytics_events_202605_created_at_idx ON public.analytics_events_202605 USING btree (created_at);
CREATE INDEX analytics_events_202605_user_id_idx ON public.analytics_events_202605 USING btree (user_id);
CREATE INDEX analytics_events_202606_created_at_idx ON public.analytics_events_202606 USING btree (created_at);
CREATE INDEX analytics_events_202606_user_id_idx ON public.analytics_events_202606 USING btree (user_id);
CREATE INDEX analytics_events_default_created_at_idx ON public.analytics_events_default USING btree (created_at);
CREATE INDEX analytics_events_default_user_id_idx ON public.analytics_events_default USING btree (user_id);
CREATE UNIQUE INDEX analytics_funnel_step_date_key ON public.analytics_funnel USING btree (step, date);
CREATE INDEX idx_analytics_funnel_date_step ON public.analytics_funnel USING btree (date, step);
CREATE UNIQUE INDEX analytics_revenue_daily_date_key ON public.analytics_revenue_daily USING btree (date);
CREATE INDEX idx_attraction_reviews_attraction_created ON public.attraction_reviews USING btree (attraction_id, created_at DESC);
CREATE UNIQUE INDEX attractions_city_id_slug_key ON public.attractions USING btree (city_id, slug);
CREATE INDEX idx_attractions_category_rating ON public.attractions USING btree (category, rating DESC);
CREATE INDEX idx_attractions_city ON public.attractions USING btree (city_id);
CREATE INDEX idx_audit_logs_module_created ON public.audit_logs USING btree (module, created_at DESC);
CREATE INDEX idx_booking_ancillaries_booking ON public.booking_ancillaries USING btree (booking_id);
CREATE INDEX idx_booking_flights_booking ON public.booking_flights USING btree (booking_id);
CREATE INDEX idx_booking_flights_flight ON public.booking_flights USING btree (flight_id);
CREATE INDEX idx_booking_flights_flight_id ON public.booking_flights USING btree (flight_id);
CREATE INDEX idx_booking_guests_booking ON public.booking_guests USING btree (booking_id);
CREATE INDEX idx_booking_guests_room ON public.booking_guests USING btree (room_id);
CREATE INDEX idx_booking_logs_booking_created ON public.booking_logs USING btree (booking_id, created_at DESC);
CREATE INDEX idx_booking_modifications_booking_changed ON public.booking_modifications USING btree (booking_id, changed_at DESC);
CREATE INDEX idx_booking_passengers_booking ON public.booking_passengers USING btree (booking_id);
CREATE INDEX idx_booking_passengers_passport ON public.booking_passengers USING btree (passport_number);
CREATE UNIQUE INDEX uq_active_seat_per_booking ON public.booking_passengers USING btree (booking_id, seat_number) WHERE (seat_number IS NOT NULL);
CREATE INDEX idx_booking_rooms_booking ON public.booking_rooms USING btree (booking_id);
CREATE INDEX idx_booking_rooms_room ON public.booking_rooms USING btree (room_id);
CREATE INDEX idx_bookings_user_status_created ON public.bookings USING btree (user_id, status, created_at DESC);
CREATE UNIQUE INDEX car_bookings_confirmation_code_key ON public.car_bookings USING btree (confirmation_code);
CREATE INDEX idx_car_bookings_status ON public.car_bookings USING btree (status);
CREATE INDEX idx_car_bookings_user ON public.car_bookings USING btree (user_id);
CREATE INDEX idx_car_bookings_user_id ON public.car_bookings USING btree (user_id);
CREATE INDEX idx_car_locations_city ON public.car_locations USING btree (city, country_code);
CREATE INDEX idx_car_locations_iata ON public.car_locations USING btree (iata_code);
CREATE UNIQUE INDEX car_vendors_slug_key ON public.car_vendors USING btree (slug);
CREATE INDEX idx_cars_available ON public.cars USING btree (is_available);
CREATE INDEX idx_cars_category ON public.cars USING btree (category);
CREATE INDEX idx_cars_location ON public.cars USING btree (location_id);
CREATE UNIQUE INDEX cities_slug_key ON public.cities USING btree (slug);
CREATE INDEX idx_cities_country ON public.cities USING btree (country_id);
CREATE UNIQUE INDEX countries_code_key ON public.countries USING btree (code);
CREATE INDEX idx_credit_notes_invoice_created ON public.credit_notes USING btree (invoice_id, created_at DESC);
CREATE INDEX idx_events_city_start_date ON public.events USING btree (city_id, start_date);
CREATE INDEX idx_flight_inquiries_created_at ON public.flight_inquiries USING btree (created_at DESC);
CREATE INDEX idx_flight_inquiries_status ON public.flight_inquiries USING btree (status);
CREATE INDEX idx_flight_inquiries_user_id ON public.flight_inquiries USING btree (user_id);
CREATE UNIQUE INDEX flight_segments_flight_id_segment_order_key ON public.flight_segments USING btree (flight_id, segment_order);
CREATE INDEX idx_flights_airline_stops_price ON public.flights USING btree (airline_code, stops, base_fare);
CREATE INDEX idx_hotel_bookings_city ON public.hotel_bookings USING btree (city);
CREATE INDEX idx_hotel_bookings_hotel_dates ON public.hotel_bookings USING btree (hotel_id, check_in_date, check_out_date);
CREATE INDEX idx_hotel_bookings_payment_intent_id ON public.hotel_bookings USING btree (payment_intent_id) WHERE (payment_intent_id IS NOT NULL);
CREATE INDEX idx_hotel_bookings_status ON public.hotel_bookings USING btree (status, payment_status);
CREATE INDEX idx_hotel_bookings_user_created ON public.hotel_bookings USING btree (user_id, created_at DESC);
CREATE INDEX idx_hotels_amenities_gin ON public.hotels USING gin (amenities);
CREATE INDEX idx_hotels_city_rating ON public.hotels USING btree (city, rating DESC);
CREATE INDEX idx_hybrid_usage_endpoint_created ON public.hybrid_api_usage USING btree (endpoint, created_at DESC);
CREATE INDEX idx_insights_cache_type_generated ON public.insights_cache USING btree (type, generated_at DESC);
CREATE INDEX idx_insurance_claims_policy ON public.insurance_claims USING btree (policy_id);
CREATE INDEX idx_insurance_policies_booking ON public.insurance_policies USING btree (booking_id);
CREATE INDEX idx_insurance_policies_payment_intent ON public.insurance_policies USING btree (payment_intent_id) WHERE (payment_intent_id IS NOT NULL);
CREATE INDEX idx_insurance_policies_status ON public.insurance_policies USING btree (status);
CREATE INDEX idx_insurance_policies_user ON public.insurance_policies USING btree (user_id);
CREATE UNIQUE INDEX insurance_policies_policy_number_key ON public.insurance_policies USING btree (policy_number);
CREATE UNIQUE INDEX insurance_providers_slug_key ON public.insurance_providers USING btree (slug);
CREATE INDEX idx_invoice_items_invoice ON public.invoice_items USING btree (invoice_id);
CREATE INDEX idx_invoices_booking ON public.invoices USING btree (booking_id);
CREATE INDEX idx_invoices_user_created ON public.invoices USING btree (user_id, created_at DESC);
CREATE UNIQUE INDEX invoices_invoice_number_key ON public.invoices USING btree (invoice_number);
CREATE INDEX idx_loyalty_accounts_user_id ON public.loyalty_accounts USING btree (user_id);
CREATE UNIQUE INDEX loyalty_accounts_user_id_key ON public.loyalty_accounts USING btree (user_id);
CREATE UNIQUE INDEX loyalty_tiers_tier_key ON public.loyalty_tiers USING btree (tier);
CREATE INDEX idx_loyalty_transactions_account_date ON public.loyalty_transactions USING btree (loyalty_account_id, created_at DESC);
CREATE INDEX idx_loyalty_transactions_expires ON public.loyalty_transactions USING btree (expires_at) WHERE (expires_at IS NOT NULL);
CREATE UNIQUE INDEX notification_queue_notification_id_key ON public.notification_queue USING btree (notification_id);
CREATE UNIQUE INDEX notification_templates_name_type_key ON public.notification_templates USING btree (name, type);
CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at DESC);
CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);
CREATE INDEX idx_oauth_accounts_user ON public.oauth_accounts USING btree (user_id);
CREATE UNIQUE INDEX oauth_accounts_provider_provider_user_id_key ON public.oauth_accounts USING btree (provider, provider_user_id);
CREATE INDEX idx_oauth_exchange_codes_expires ON public.oauth_exchange_codes USING btree (expires_at);
CREATE INDEX idx_operations_metrics_date ON public.operations_metrics USING btree (date DESC);
CREATE UNIQUE INDEX operations_metrics_date_key ON public.operations_metrics USING btree (date);
CREATE INDEX idx_package_bookings_package_created ON public.package_bookings USING btree (package_id, created_at DESC);
CREATE INDEX idx_package_bookings_status ON public.package_bookings USING btree (booking_status);
CREATE INDEX idx_package_bookings_user_created ON public.package_bookings USING btree (user_id, created_at DESC);
CREATE INDEX idx_package_bookings_user_id ON public.package_bookings USING btree (user_id);
CREATE INDEX idx_package_itineraries_package_day ON public.package_itineraries USING btree (package_id, day_number);
CREATE UNIQUE INDEX package_itineraries_package_id_day_number_key ON public.package_itineraries USING btree (package_id, day_number);
CREATE UNIQUE INDEX package_pricing_package_id_key ON public.package_pricing USING btree (package_id);
CREATE INDEX idx_packages_slug ON public.packages USING btree (slug);
CREATE INDEX idx_packages_status_destination ON public.packages USING btree (status, destination);
CREATE UNIQUE INDEX packages_slug_key ON public.packages USING btree (slug);
CREATE INDEX idx_prot_expires ON public.password_reset_otps USING btree (expires_at) WHERE (used = false);
CREATE INDEX idx_prot_user_id ON public.password_reset_otps USING btree (user_id);
CREATE INDEX idx_payment_transactions_payment_created ON public.payment_transactions USING btree (payment_id, created_at DESC);
CREATE INDEX idx_payments_invoice_status ON public.payments USING btree (invoice_id, status);
CREATE UNIQUE INDEX idx_payments_provider_txn ON public.payments USING btree (provider, transaction_id) WHERE (transaction_id IS NOT NULL);
CREATE INDEX idx_payments_user_created ON public.payments USING btree (user_id, created_at DESC);
CREATE UNIQUE INDEX permissions_slug_key ON public.permissions USING btree (slug);
CREATE INDEX idx_pnr_records_pnr_code ON public.pnr_records USING btree (pnr_code);
CREATE UNIQUE INDEX pnr_records_booking_id_key ON public.pnr_records USING btree (booking_id);
CREATE UNIQUE INDEX pnr_records_pnr_code_key ON public.pnr_records USING btree (pnr_code);
CREATE INDEX idx_points_tx_expires ON public.points_transactions USING btree (expires_at) WHERE (is_expired = false);
CREATE INDEX idx_points_tx_user ON public.points_transactions USING btree (user_id);
CREATE INDEX idx_price_alerts_active ON public.price_alerts USING btree (is_active) WHERE (is_active = true);
CREATE INDEX idx_price_alerts_user ON public.price_alerts USING btree (user_id);
CREATE UNIQUE INDEX pricing_rules_tier_key ON public.pricing_rules USING btree (tier);
CREATE INDEX idx_provider_switches_type_enabled ON public.provider_switches USING btree (provider_type, is_enabled);
CREATE UNIQUE INDEX provider_switches_provider_key ON public.provider_switches USING btree (provider);
CREATE INDEX idx_public_reviews_created ON public.public_reviews USING btree (created_at DESC);
CREATE INDEX idx_public_reviews_rating_created ON public.public_reviews USING btree (rating DESC, created_at DESC);
CREATE INDEX idx_public_reviews_verified ON public.public_reviews USING btree (is_verified, created_at DESC);
CREATE INDEX idx_recon_status_created ON public.reconciliation_logs USING btree (status, created_at DESC);
CREATE INDEX idx_referrals_code ON public.referrals USING btree (referral_code);
CREATE INDEX idx_referrals_referrer ON public.referrals USING btree (referrer_id);
CREATE INDEX idx_refresh_tokens_active_hash ON public.refresh_tokens USING btree (token_hash) WHERE (revoked_at IS NULL);
CREATE INDEX idx_refresh_tokens_user ON public.refresh_tokens USING btree (user_id);
CREATE INDEX idx_refunds_booking_created ON public.refunds USING btree (booking_id, created_at DESC);
CREATE INDEX idx_refunds_payment_created ON public.refunds USING btree (payment_id, created_at DESC);
CREATE INDEX idx_revenue_metrics_date ON public.revenue_metrics USING btree (date DESC);
CREATE UNIQUE INDEX revenue_metrics_date_key ON public.revenue_metrics USING btree (date);
CREATE INDEX idx_reward_rules_action ON public.reward_rules USING btree (action);
CREATE UNIQUE INDEX roles_slug_key ON public.roles USING btree (slug);
CREATE INDEX idx_rooms_hotel_price ON public.rooms USING btree (hotel_id, price_per_night);
CREATE INDEX idx_saved_travelers_user_id ON public.saved_travelers USING btree (user_id);
CREATE UNIQUE INDEX saved_travelers_user_id_passport_number_key ON public.saved_travelers USING btree (user_id, passport_number);
CREATE INDEX idx_seat_selections_booking ON public.seat_selections USING btree (booking_id);
CREATE INDEX idx_settlements_provider_created ON public.settlements USING btree (provider, created_at DESC);
CREATE INDEX idx_sla_tracking_booking ON public.sla_tracking USING btree (booking_id, expected_time DESC);
CREATE INDEX idx_standby_deals_active ON public.standby_deals USING btree (is_active);
CREATE INDEX idx_standby_deals_org_des ON public.standby_deals USING btree (origin, destination);
CREATE INDEX idx_standby_deposits_status ON public.standby_deposits USING btree (status);
CREATE INDEX idx_standby_deposits_user ON public.standby_deposits USING btree (user_id);
CREATE INDEX idx_tickets_agent ON public.support_tickets USING btree (assigned_agent_id);
CREATE INDEX idx_tickets_status ON public.support_tickets USING btree (status);
CREATE INDEX idx_tickets_user ON public.support_tickets USING btree (user_id);
CREATE UNIQUE INDEX support_tickets_ticket_number_key ON public.support_tickets USING btree (ticket_number);
CREATE INDEX idx_system_health_service_checked ON public.system_health USING btree (service_name, checked_at DESC);
CREATE UNIQUE INDEX system_settings_key_key ON public.system_settings USING btree (key);
CREATE INDEX idx_ticket_documents_ticket_id ON public.ticket_documents USING btree (ticket_id);
CREATE INDEX idx_ticket_messages_ticket ON public.ticket_messages USING btree (ticket_id);
CREATE INDEX idx_tickets_pnr_id ON public.tickets USING btree (pnr_id);
CREATE INDEX idx_tickets_ticket_number ON public.tickets USING btree (ticket_number);
CREATE UNIQUE INDEX tickets_pnr_id_passenger_id_flight_id_key ON public.tickets USING btree (pnr_id, passenger_id, flight_id);
CREATE UNIQUE INDEX tickets_ticket_number_key ON public.tickets USING btree (ticket_number);
CREATE INDEX idx_transfer_bookings_flight ON public.transfer_bookings USING btree (flight_number);
CREATE INDEX idx_transfer_bookings_user ON public.transfer_bookings USING btree (user_id);
CREATE INDEX idx_transfer_bookings_user_id ON public.transfer_bookings USING btree (user_id);
CREATE UNIQUE INDEX transfer_bookings_confirmation_code_key ON public.transfer_bookings USING btree (confirmation_code);
CREATE INDEX idx_transfer_routes_iata ON public.transfer_routes USING btree (origin_iata);
CREATE INDEX idx_travel_documents_booking_id ON public.travel_documents USING btree (booking_id);
CREATE INDEX idx_travel_documents_doc_type ON public.travel_documents USING btree (doc_type);
CREATE INDEX idx_travel_documents_share_token ON public.travel_documents USING btree (share_token);
CREATE INDEX idx_travel_documents_traveler_id ON public.travel_documents USING btree (traveler_id);
CREATE INDEX idx_travel_documents_user_id ON public.travel_documents USING btree (user_id);
CREATE UNIQUE INDEX travel_documents_share_token_key ON public.travel_documents USING btree (share_token);
CREATE UNIQUE INDEX user_milestones_user_id_milestone_id_key ON public.user_milestones USING btree (user_id, milestone_id);
CREATE UNIQUE INDEX user_preferences_user_id_key ON public.user_preferences USING btree (user_id);
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles USING btree (user_id);
CREATE UNIQUE INDEX user_profiles_user_id_key ON public.user_profiles USING btree (user_id);
CREATE INDEX idx_user_recent_searches_user_created ON public.user_recent_searches USING btree (user_id, created_at DESC);
CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);
CREATE INDEX idx_wishlist_user_created ON public.user_wishlist USING btree (user_id, created_at DESC);
CREATE UNIQUE INDEX user_wishlist_user_id_attraction_id_key ON public.user_wishlist USING btree (user_id, attraction_id);
CREATE INDEX idx_users_role ON public.users USING btree (role);
CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);
CREATE UNIQUE INDEX users_referral_code_key ON public.users USING btree (referral_code);
CREATE INDEX idx_wallet_tx_user ON public.wallet_transactions USING btree (user_id);
CREATE INDEX idx_wallet_tx_wallet ON public.wallet_transactions USING btree (wallet_id);
CREATE INDEX idx_wallets_user ON public.wallets USING btree (user_id);
CREATE UNIQUE INDEX wallets_user_id_key ON public.wallets USING btree (user_id);
CREATE INDEX idx_wishlist_entity_type_id ON public.wishlists USING btree (entity_type, entity_id);
CREATE INDEX idx_wishlist_session_id ON public.wishlists USING btree (session_id);
CREATE INDEX idx_wishlist_user_id ON public.wishlists USING btree (user_id);

-- Seed Data
INSERT INTO roles (id, name, slug) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Customer', 'customer'),
  ('a0000001-0000-0000-0000-000000000002', 'Admin', 'admin')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO permissions (id, slug, description) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'trips.read', 'View trips'),
  ('b0000001-0000-0000-0000-000000000002', 'trips.write', 'Create or update trips'),
  ('b0000001-0000-0000-0000-000000000003', 'bookings.read', 'View bookings'),
  ('b0000001-0000-0000-0000-000000000004', 'bookings.write', 'Create or update bookings'),
  ('b0000001-0000-0000-0000-000000000005', 'admin.users', 'Manage users')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.slug = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.slug IN (
  'trips.read', 'trips.write', 'bookings.read', 'bookings.write'
)
WHERE r.slug = 'customer'
ON CONFLICT DO NOTHING;

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(120) NOT NULL,
  code VARCHAR(3) NOT NULL UNIQUE,
  description TEXT,
  hero_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  description TEXT,
  latitude NUMERIC(9,6) NOT NULL,
  longitude NUMERIC(9,6) NOT NULL,
  hero_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attractions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name VARCHAR(180) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('museum','beach','hiking','nightlife','shopping','food')),
  latitude NUMERIC(9,6) NOT NULL,
  longitude NUMERIC(9,6) NOT NULL,
  entry_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  opening_hours VARCHAR(120),
  tips TEXT,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  total_reviews INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (city_id, slug)
);

CREATE TABLE IF NOT EXISTS attraction_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attraction_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, attraction_id)
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS attraction_package_links (
  attraction_id UUID NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (attraction_id, package_id)
);

CREATE INDEX IF NOT EXISTS idx_cities_country ON cities(country_id);
CREATE INDEX IF NOT EXISTS idx_attractions_city ON attractions(city_id);
CREATE INDEX IF NOT EXISTS idx_attractions_category_rating ON attractions(category, rating DESC);
CREATE INDEX IF NOT EXISTS idx_events_city_start_date ON events(city_id, start_date);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_created ON user_wishlist(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attraction_reviews_attraction_created ON attraction_reviews(attraction_id, created_at DESC);

-- Geo indexes for map and distance queries
CREATE INDEX IF NOT EXISTS idx_attractions_geo ON attractions USING GIST ((ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)));
CREATE INDEX IF NOT EXISTS idx_cities_geo ON cities USING GIST ((ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)));

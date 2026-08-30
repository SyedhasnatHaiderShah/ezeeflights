-- Migration: 059_create_ad_tables.sql

CREATE TABLE IF NOT EXISTS ad_offers (
  id              UUID PRIMARY KEY,
  flight_id       UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  partner_code    VARCHAR(20) NOT NULL DEFAULT 'SELF',
  partner_name    VARCHAR(100),
  partner_logo_url TEXT,
  origin          CHAR(3) NOT NULL,
  destination     CHAR(3) NOT NULL,
  departure_at    TIMESTAMPTZ NOT NULL,
  arrival_at      TIMESTAMPTZ NOT NULL,
  airline         VARCHAR(100),
  flight_number   VARCHAR(20),
  stops           SMALLINT DEFAULT 0,
  display_price   NUMERIC(10,2) NOT NULL,
  original_price  NUMERIC(10,2) NOT NULL,
  discount_pct    NUMERIC(5,4) NOT NULL DEFAULT 0.10,
  currency        CHAR(3) NOT NULL DEFAULT 'USD',
  deep_link_url   TEXT NOT NULL,
  tracking_click_url TEXT,
  utm_source      VARCHAR(100),
  utm_medium      VARCHAR(100),
  utm_campaign    VARCHAR(100),
  ref_code        VARCHAR(200),
  t_code          VARCHAR(200),
  cabin_class     VARCHAR(30),
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_offers_flight_id  ON ad_offers(flight_id);
CREATE INDEX IF NOT EXISTS idx_ad_offers_expires_at ON ad_offers(expires_at);
CREATE INDEX IF NOT EXISTS idx_ad_offers_route ON ad_offers(origin, destination, departure_at);

-- Clean up expired offers automatically
CREATE OR REPLACE FUNCTION delete_expired_ad_offers() RETURNS void AS $$
  DELETE FROM ad_offers WHERE expires_at < NOW();
$$ LANGUAGE SQL;

-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ad_click_events (
  id                   UUID PRIMARY KEY,
  ad_offer_id          UUID NOT NULL REFERENCES ad_offers(id) ON DELETE CASCADE,
  user_ip              INET,
  user_agent           TEXT,
  country_code         CHAR(2),
  clicked_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  converted            BOOLEAN NOT NULL DEFAULT FALSE,
  commission_amount    NUMERIC(10,2),
  commission_currency  CHAR(3)
);

CREATE INDEX IF NOT EXISTS idx_ad_click_events_offer_id   ON ad_click_events(ad_offer_id);
CREATE INDEX IF NOT EXISTS idx_ad_click_events_clicked_at ON ad_click_events(clicked_at);

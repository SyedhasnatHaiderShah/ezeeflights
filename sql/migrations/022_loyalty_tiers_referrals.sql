CREATE TYPE loyalty_tier AS ENUM ('blue','silver','gold','platinum');
CREATE TYPE points_transaction_type AS ENUM (
  'earned_flight','earned_hotel','earned_car','earned_package',
  'redeemed','expired','referral_bonus','birthday_bonus','promotional',
  'manual_adjust','partner_earn'
);

CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier loyalty_tier UNIQUE NOT NULL,
  min_points_required INTEGER NOT NULL,
  earn_multiplier DECIMAL(4,2) DEFAULT 1.0,
  benefits JSONB NOT NULL,
  color_hex VARCHAR(7) DEFAULT '#3B82F6'
);

INSERT INTO loyalty_tiers (id, tier, min_points_required, earn_multiplier, benefits, color_hex)
SELECT uuid_generate_v4(), v.tier::loyalty_tier, v.min_points_required, v.earn_multiplier, v.benefits::jsonb, v.color_hex
FROM (
  VALUES
    ('blue',0,1.0,'{"lounge_access":false,"priority_checkin":false,"free_seat_selection":false,"dedicated_support":false,"bonus_baggage_kg":0,"companion_discount_pct":0}','#6B7280'),
    ('silver',5000,1.25,'{"lounge_access":false,"priority_checkin":true,"free_seat_selection":true,"dedicated_support":false,"bonus_baggage_kg":5,"companion_discount_pct":5}','#9CA3AF'),
    ('gold',25000,1.5,'{"lounge_access":true,"priority_checkin":true,"free_seat_selection":true,"dedicated_support":false,"bonus_baggage_kg":10,"companion_discount_pct":10}','#F59E0B'),
    ('platinum',100000,2.0,'{"lounge_access":true,"priority_checkin":true,"free_seat_selection":true,"dedicated_support":true,"bonus_baggage_kg":23,"companion_discount_pct":20}','#7C3AED')
) AS v(tier, min_points_required, earn_multiplier, benefits, color_hex)
WHERE NOT EXISTS (SELECT 1 FROM loyalty_tiers lt WHERE lt.tier = v.tier::loyalty_tier);

ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_tier loyalty_tier DEFAULT 'blue';
ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lifetime_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;

CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type points_transaction_type NOT NULL,
  points INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reference_id UUID,
  description TEXT,
  expires_at TIMESTAMPTZ,
  is_expired BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES users(id),
  referee_id UUID REFERENCES users(id),
  referee_email VARCHAR(200),
  referral_code VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  referrer_points INTEGER DEFAULT 500,
  referee_points INTEGER DEFAULT 250,
  first_booking_id UUID,
  rewarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  badge_icon VARCHAR(100),
  badge_color VARCHAR(7),
  criteria JSONB NOT NULL,
  points_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS user_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  milestone_id UUID NOT NULL REFERENCES milestones(id),
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, milestone_id)
);

CREATE INDEX IF NOT EXISTS idx_points_tx_user ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_tx_expires ON points_transactions(expires_at) WHERE is_expired = false;
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);

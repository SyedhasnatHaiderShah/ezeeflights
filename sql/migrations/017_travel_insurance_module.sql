CREATE TYPE insurance_plan_type AS ENUM ('single_trip','annual_multi_trip');
CREATE TYPE coverage_level AS ENUM ('basic','standard','premium');
CREATE TYPE insurance_status AS ENUM ('active','expired','cancelled','claimed');
CREATE TYPE claim_status AS ENUM ('submitted','under_review','approved','rejected','paid');

CREATE TABLE insurance_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE,
  logo_url TEXT,
  api_endpoint TEXT,
  api_key_env_var VARCHAR(100),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE insurance_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES insurance_providers(id),
  name VARCHAR(200) NOT NULL,
  plan_type insurance_plan_type NOT NULL,
  coverage_level coverage_level NOT NULL,
  description TEXT,
  price_per_day DECIMAL(8,2),
  price_annual DECIMAL(10,2),
  currency CHAR(3) DEFAULT 'USD',
  max_trip_duration_days INTEGER,
  coverage_details JSONB NOT NULL,
  adventure_sports_addon_price DECIMAL(8,2),
  age_limit_max SMALLINT DEFAULT 75,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE insurance_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  plan_id UUID NOT NULL REFERENCES insurance_plans(id),
  booking_id UUID,
  policy_number VARCHAR(100) UNIQUE NOT NULL,
  status insurance_status DEFAULT 'active',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  destination_countries JSONB DEFAULT '[]',
  traveler_details JSONB NOT NULL,
  adventure_sports_addon BOOLEAN DEFAULT false,
  total_premium DECIMAL(10,2) NOT NULL,
  currency CHAR(3) DEFAULT 'USD',
  payment_id UUID,
  policy_document_url TEXT,
  provider_policy_ref VARCHAR(200),
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE insurance_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_id UUID NOT NULL REFERENCES insurance_policies(id),
  user_id UUID NOT NULL REFERENCES users(id),
  claim_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  incident_date DATE NOT NULL,
  claimed_amount DECIMAL(10,2) NOT NULL,
  currency CHAR(3) DEFAULT 'USD',
  status claim_status DEFAULT 'submitted',
  supporting_documents JSONB DEFAULT '[]',
  approved_amount DECIMAL(10,2),
  rejection_reason TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_insurance_policies_user ON insurance_policies(user_id);
CREATE INDEX idx_insurance_policies_booking ON insurance_policies(booking_id);
CREATE INDEX idx_insurance_policies_status ON insurance_policies(status);
CREATE INDEX idx_insurance_claims_policy ON insurance_claims(policy_id);

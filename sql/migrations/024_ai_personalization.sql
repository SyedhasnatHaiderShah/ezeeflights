CREATE TABLE user_preferences_ml (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preferred_destinations JSONB DEFAULT '[]',
  preferred_cabin_class VARCHAR(20) DEFAULT 'economy',
  preferred_airlines JSONB DEFAULT '[]',
  preferred_hotel_stars SMALLINT DEFAULT 3,
  preferred_hotel_amenities JSONB DEFAULT '[]',
  travel_style JSONB DEFAULT '{}',
  -- {"adventure":0.8,"culture":0.6,"beach":0.9,"nightlife":0.3,"food":0.7}
  budget_tier VARCHAR(20) DEFAULT 'mid_range',
  -- budget/mid_range/luxury
  solo_group_preference VARCHAR(20) DEFAULT 'couple',
  last_computed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  -- nullable for anonymous
  session_id VARCHAR(100) NOT NULL,
  title VARCHAR(200),
  messages JSONB NOT NULL DEFAULT '[]',
  -- [{ "role":"user","content":"...", "timestamp":"..." },
  --  { "role":"assistant","content":"...", "timestamp":"..." }]
  context JSONB DEFAULT '{}',
  -- { "current_booking_id":"...", "search_params":{...} }
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_search_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  query_text TEXT NOT NULL,
  parsed_intent JSONB,
  -- { "type":"flight", "origin":"DXB", "destination":"LHR",
  --   "date":"2026-12-01", "budget":500, "class":"economy" }
  results_count INTEGER,
  clicked_result_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for storing user search history
CREATE TABLE IF NOT EXISTS user_recent_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  search_type VARCHAR(20) NOT NULL DEFAULT 'flights', -- flights, hotels, etc.
  search_date DATE NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_recent_searches_user_created ON user_recent_searches(user_id, created_at DESC);

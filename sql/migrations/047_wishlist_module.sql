-- Create wishlists table to support saving flights, hotels, cars, etc.
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  entity_type VARCHAR(50) NOT NULL, -- 'flights', 'hotels', 'cars'
  entity_id VARCHAR(255) NOT NULL,   -- unique identifier from the provider
  data JSONB NOT NULL,               -- full object details for offline rendering
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_session_id ON wishlists(session_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_entity_type_id ON wishlists(entity_type, entity_id);

CREATE TABLE IF NOT EXISTS public_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_name VARCHAR(180) NOT NULL,
  author_avatar TEXT,
  author_location VARCHAR(180) NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT TRUE,
  category VARCHAR(80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_reviews_created ON public_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_reviews_rating_created ON public_reviews(rating DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_reviews_verified ON public_reviews(is_verified, created_at DESC);

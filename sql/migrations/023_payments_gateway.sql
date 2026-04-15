DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='provider_reference') THEN
    ALTER TABLE payments RENAME COLUMN provider_reference TO transaction_id;
  END IF;
EXCEPTION WHEN undefined_table THEN
  NULL;
END $$;

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE payments
  ALTER COLUMN provider TYPE VARCHAR(20),
  ALTER COLUMN status TYPE VARCHAR(20);

ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_status_check,
  ADD CONSTRAINT payments_status_check CHECK (status IN ('PENDING','SUCCESS','FAILED','REFUNDED'));

CREATE INDEX IF NOT EXISTS idx_payments_user_created ON payments(user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_provider_txn ON payments(provider, transaction_id) WHERE transaction_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  provider_response JSONB NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING','SUCCESS','FAILED','REFUNDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_created ON payment_transactions(payment_id, created_at DESC);

CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING','SUCCESS','FAILED')),
  provider_refund_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refunds_payment_created ON refunds(payment_id, created_at DESC);

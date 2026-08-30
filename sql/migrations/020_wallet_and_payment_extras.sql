CREATE TYPE wallet_transaction_type AS ENUM (
  'topup','booking_payment','refund','referral_bonus','loyalty_redeem',
  'promotional_credit','withdrawal'
);

CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  currency CHAR(3) DEFAULT 'USD',
  is_frozen BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES wallets(id),
  user_id UUID NOT NULL REFERENCES users(id),
  transaction_type wallet_transaction_type NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  balance_before DECIMAL(12,2) NOT NULL,
  balance_after DECIMAL(12,2) NOT NULL,
  reference_id UUID,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payments ADD COLUMN IF NOT EXISTS wallet_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS card_amount DECIMAL(10,2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS is_split_payment BOOLEAN DEFAULT false;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS second_card_payment_intent_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS threeds_required BOOLEAN DEFAULT false;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS threeds_redirect_url TEXT;

CREATE INDEX idx_wallets_user ON wallets(user_id);
CREATE INDEX idx_wallet_tx_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_tx_user ON wallet_transactions(user_id);

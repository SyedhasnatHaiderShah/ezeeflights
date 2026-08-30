-- Add pending_payment status to insurance_status enum so a policy can be
-- created in a holding state before real payment is confirmed.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'pending_payment'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'insurance_status')
  ) THEN
    ALTER TYPE insurance_status ADD VALUE 'pending_payment' BEFORE 'active';
  END IF;
END
$$;

-- Store the provider payment-intent id so the confirm endpoint can verify it.
ALTER TABLE insurance_policies
  ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_insurance_policies_payment_intent
  ON insurance_policies(payment_intent_id)
  WHERE payment_intent_id IS NOT NULL;

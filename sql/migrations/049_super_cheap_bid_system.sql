-- 049_super_cheap_bid_system.sql
-- Up Migration

CREATE TABLE IF NOT EXISTS standby_deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin VARCHAR(10) NOT NULL,
    destination VARCHAR(10) NOT NULL,
    bid_price DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_standby_deals_org_des ON standby_deals(origin, destination);
CREATE INDEX IF NOT EXISTS idx_standby_deals_active ON standby_deals(is_active);

CREATE TABLE IF NOT EXISTS standby_deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    standby_deal_id UUID REFERENCES standby_deals(id) ON DELETE CASCADE,
    origin VARCHAR(10) NOT NULL,
    destination VARCHAR(10) NOT NULL,
    departure_date DATE,
    amount_paid DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, successful, refunded
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    passengers JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_standby_deposits_user ON standby_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_standby_deposits_status ON standby_deposits(status);

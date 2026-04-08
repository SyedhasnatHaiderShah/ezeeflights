CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE permissions ADD COLUMN IF NOT EXISTS module VARCHAR(64);
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS action VARCHAR(20);

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(120) NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(120) NOT NULL,
  module VARCHAR(64) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  ip_address VARCHAR(45),
  login_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  logout_time TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(64) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO roles (name, slug)
VALUES
  ('SUPER_ADMIN', 'super-admin'),
  ('ADMIN', 'admin-ops'),
  ('FINANCE', 'finance'),
  ('SUPPORT', 'support'),
  ('MARKETING', 'marketing')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

WITH required(module, action) AS (
  VALUES
    ('RBAC','READ'),('RBAC','WRITE'),('RBAC','CONFIGURE'),
    ('DASHBOARD','READ'),
    ('USERS','READ'),('USERS','WRITE'),
    ('BOOKINGS','READ'),('BOOKINGS','WRITE'),
    ('PAYMENTS','READ'),('PAYMENTS','WRITE'),
    ('ANALYTICS','READ'),
    ('SETTINGS','READ'),('SETTINGS','CONFIGURE'),
    ('AUDIT','READ'),('ALERTS','READ')
)
INSERT INTO permissions (slug, module, action, description)
SELECT lower(module || '.' || action), module, action, 'Admin permission for ' || module || ':' || action
FROM required
ON CONFLICT (slug) DO UPDATE SET module = EXCLUDED.module, action = EXCLUDED.action;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.slug LIKE '%.%'
WHERE r.slug = 'super-admin'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.slug IN (
  'dashboard.read','users.read','users.write','bookings.read','bookings.write','analytics.read','audit.read','alerts.read'
)
WHERE r.slug = 'admin-ops'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.slug IN ('dashboard.read','payments.read','payments.write','settings.read','audit.read')
WHERE r.slug = 'finance'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.slug IN ('dashboard.read','bookings.read','users.read','alerts.read')
WHERE r.slug = 'support'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.slug IN ('dashboard.read','analytics.read','alerts.read')
WHERE r.slug = 'marketing'
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_audit_logs_module_created ON audit_logs(module, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_login ON admin_sessions(admin_id, login_time DESC);

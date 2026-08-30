-- Add SUB-ADMIN role to roles table
INSERT INTO roles (id, name, slug) VALUES 
  (uuid_generate_v4(), 'Sub Admin', 'sub-admin') 
ON CONFLICT (slug) DO NOTHING;

-- Grant permissions for sub-admin (for flight ads)
INSERT INTO permissions (slug, module, action, description) VALUES 
  ('flights.ads', 'FLIGHTS', 'ADS', 'Manage Flight Ads') 
ON CONFLICT (slug) DO NOTHING;

-- Map the permission to the sub-admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.slug = 'sub-admin' AND p.slug = 'flights.ads'
ON CONFLICT DO NOTHING;

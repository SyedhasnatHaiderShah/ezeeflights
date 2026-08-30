require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  const users = await pool.query(`SELECT id, email, role FROM users`);
  console.log('--- Users ---');
  console.log(users.rows);

  const adminUsers = await pool.query(`
    SELECT au.id, au.user_id, au.role_id, u.email, r.name as role_name, r.slug as role_slug
    FROM admin_users au
    JOIN users u ON u.id = au.user_id
    JOIN roles r ON r.id = au.role_id
  `);
  console.log('--- Admin Users ---');
  console.log(adminUsers.rows);

  const rolePerms = await pool.query(`
    SELECT rp.role_id, r.name as role_name, p.slug as perm_slug, p.module, p.action
    FROM role_permissions rp
    JOIN roles r ON r.id = rp.role_id
    JOIN permissions p ON p.id = rp.permission_id
  `);
  console.log('--- Role Permissions Count ---');
  console.log(rolePerms.rows.length);
  if (rolePerms.rows.length > 0) {
    console.log('Sample permissions:', rolePerms.rows.slice(0, 10));
  }
}

check().then(() => pool.end()).catch(console.error);

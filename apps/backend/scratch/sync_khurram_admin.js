require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function sync() {
  // Find the role ID for slug 'admin'
  const roleRes = await pool.query("SELECT id FROM roles WHERE slug = 'admin' LIMIT 1");
  if (roleRes.rows.length === 0) {
    console.error("❌ Admin role not found in roles table");
    return;
  }
  const roleId = roleRes.rows[0].id;
  console.log(`Found Admin Role ID: ${roleId}`);

  // Find user ID for uaf.khurram@gmail.com
  const userRes = await pool.query("SELECT id FROM users WHERE email = 'uaf.khurram@gmail.com' LIMIT 1");
  if (userRes.rows.length === 0) {
    console.error("❌ User uaf.khurram@gmail.com not found");
    return;
  }
  const userId = userRes.rows[0].id;
  console.log(`Found User ID: ${userId}`);

  // Insert into user_roles
  await pool.query(
    `INSERT INTO user_roles (user_id, role_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [userId, roleId]
  );
  console.log("✅ Linked in user_roles");

  // Insert/update admin_users
  await pool.query(
    `INSERT INTO admin_users (user_id, role_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET role_id = EXCLUDED.role_id`,
    [userId, roleId]
  );
  console.log("✅ Linked in admin_users");
}

sync().then(() => pool.end()).catch(console.error);

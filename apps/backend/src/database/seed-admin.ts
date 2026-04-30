import { Pool } from "pg";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedAdmin() {
  console.log("🌱 Seeding admin user...");
  try {
    const email = "admin@ezeeflights.com";
    const password = "adminpassword123";
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 1. Create or Update user in 'users' table
    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET role = 'ADMIN', password_hash = $2
       RETURNING id`,
      [email, passwordHash, "System", "Admin", "ADMIN"],
    );
    const userId = userResult.rows[0].id;
    console.log(`✅ User created/updated with ID: ${userId}`);

    // 2. Assign 'Admin' role in 'user_roles' table
    // Get Admin role ID
    const roleResult = await pool.query(
      "SELECT id FROM roles WHERE slug = 'admin'",
    );
    if (roleResult.rows.length === 0) {
      console.error("❌ Admin role not found in roles table");
      return;
    }
    const roleId = roleResult.rows[0].id;

    await pool.query(
      `INSERT INTO user_roles (user_id, role_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, role_id) DO NOTHING`,
      [userId, roleId],
    );
    console.log("✅ Admin role assigned in user_roles");

    // 3. Ensure Permissions exist and are linked to the Role
    const modules = [
      "DASHBOARD",
      "USERS",
      "PAYMENTS",
      "SETTINGS",
      "LOGS",
      "BOOKINGS",
      "OPERATIONS",
      "PROMOTIONS",
      "ANALYTICS",
    ];
    const actions = ["READ", "WRITE", "DELETE", "CONFIGURE"];

    for (const module of modules) {
      for (const action of actions) {
        const slug = `${module.toLowerCase()}.${action.toLowerCase()}`;

        // Insert permission
        const permResult = await pool.query(
          `INSERT INTO permissions (slug, module, action, description)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (slug) DO UPDATE SET module = $2, action = $3
           RETURNING id`,
          [slug, module, action, `${action} permission for ${module} module`],
        );
        const permissionId = permResult.rows[0].id;

        // Link to admin role
        await pool.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [roleId, permissionId],
        );
      }
    }
    console.log("✅ All module permissions seeded and linked to admin role");

    // 4. Add to 'admin_users' table
    await pool.query(
      `INSERT INTO admin_users (user_id, role_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET role_id = $2`,
      [userId, roleId],
    );
    console.log("✅ User added to admin_users table");

    console.log("\n🚀 Admin credentials:");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await pool.end();
  }
}

seedAdmin();

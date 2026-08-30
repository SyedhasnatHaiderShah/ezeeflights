import * as mysql from "mysql2/promise";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function seedAdmin() {
  console.log("🌱 Seeding admin user...");
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_SERVER || "127.0.0.1",
    port: parseInt(process.env.MYSQL_PORT || "3306", 10),
    user: process.env.MYSQL_UID || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "worldrix_ezeecrm",
  });

  try {
    const email = "admin@ezeeflights.com";
    const password = "sean@ezeeflights";
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    let userId: string | null = null;
    let roleId: string | null = null;

    // 1. Create or Update user in 'tbl_users' table
    try {
      const [result]: any = await connection.execute(
        `INSERT INTO tbl_users (id, email, password_hash, first_name, last_name, role)
         VALUES (UUID(), ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE role = 'ADMIN', password_hash = ?`,
        [email, passwordHash, "System", "Admin", "ADMIN", passwordHash],
      );

      const [rows]: any = await connection.execute(
        "SELECT id FROM tbl_users WHERE email = ?",
        [email],
      );
      userId = rows[0]?.id;
      console.log(`✅ User created/updated with ID: ${userId}`);
    } catch (err: any) {
      if (err.code === "ER_NO_SUCH_TABLE") {
        console.warn(
          "⚠️ Table 'tbl_users' doesn't exist, skipping admin creation in tbl_users.",
        );
      } else if (err.code === "ER_BAD_FIELD_ERROR") {
        console.warn(
          "⚠️ tbl_users exists but a field is missing, skipping.",
          err.message,
        );
      } else {
        throw err;
      }
    }

    if (userId) {
      // 2. Assign 'Admin' role in 'user_roles' table
      try {
        const [roleResult]: any = await connection.execute(
          "SELECT id FROM roles WHERE slug = 'admin-ops'",
        );
        if (roleResult.length === 0) {
          console.error("❌ Admin role not found in roles table");
        } else {
          roleId = roleResult[0].id;
          await connection.execute(
            `INSERT INTO user_roles (user_id, role_id)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE role_id = role_id`,
            [userId, roleId],
          );
          console.log("✅ Admin role assigned in user_roles");
        }
      } catch (err: any) {
        if (err.code === "ER_NO_SUCH_TABLE")
          console.warn(
            "⚠️ roles or user_roles table missing, skipping role assignment.",
          );
        else console.error("⚠️ error querying roles:", err.message);
      }

      if (roleId) {
        // permissions
        try {
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
              await connection.execute(
                `INSERT INTO permissions (slug, module, action, description)
                     VALUES (?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE module = ?, action = ?`,
                [
                  slug,
                  module,
                  action,
                  `${action} permission for ${module} module`,
                  module,
                  action,
                ],
              );

              const [permResult]: any = await connection.execute(
                "SELECT id FROM permissions WHERE slug = ?",
                [slug],
              );
              const permissionId = permResult[0]?.id;

              // Link to admin role
              if (permissionId) {
                await connection.execute(
                  `INSERT INTO role_permissions (role_id, permission_id)
                         VALUES (?, ?)
                         ON DUPLICATE KEY UPDATE role_id = role_id`,
                  [roleId, permissionId],
                );
              }
            }
          }
          console.log(
            "✅ All module permissions seeded and linked to admin role",
          );
        } catch (err: any) {
          if (err.code === "ER_NO_SUCH_TABLE")
            console.warn(
              "⚠️ permissions or role_permissions table missing, skipping permissions seeding.",
            );
          else console.error("⚠️ error seeding permissions:", err.message);
        }

        // admin_users
        try {
          await connection.execute(
            `INSERT INTO admin_users (user_id, role_id)
                 VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE role_id = ?`,
            [userId, roleId, roleId],
          );
          console.log("✅ User added to admin_users table");
        } catch (err: any) {
          if (err.code === "ER_NO_SUCH_TABLE")
            console.warn("⚠️ admin_users table missing, skipping.");
          else console.error("⚠️ error in admin_users:", err.message);
        }
      }
    }

    console.log("\n🚀 Admin credentials:");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await connection.end();
  }
}

seedAdmin();

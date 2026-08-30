const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Simple env parser
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;
    const [key, ...valueParts] = trimmedLine.split('=');
    if (key && valueParts.length > 0) {
      let value = valueParts.join('=').trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key.trim()] = value;
    }
  }
}

const envPath = path.resolve(__dirname, '../.env');
loadEnv(envPath);

async function purge() {
  const config = {
    host: process.env.MYSQL_SERVER || '127.0.0.1',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_UID || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'ezeeflights_crm',
  };

  console.log(`Connecting to MySQL at ${config.host}:${config.port}/${config.database}...`);
  const connection = await mysql.createConnection(config);

  try {
    // 1. Get all tables
    const [tables] = await connection.query(`SHOW TABLES`);
    const keyName = `Tables_in_${config.database}`;
    
    const keepTables = ['users', 'tbl_customer', 'tbl_customerdetails', 'tbl_flightdetailshtml'];
    const tablesToDrop = [];

    for (const row of tables) {
      const tableName = row[keyName];
      if (!keepTables.includes(tableName)) {
        tablesToDrop.push(tableName);
      }
    }

    console.log('Tables to drop:', tablesToDrop);

    // Disable foreign key checks to allow dropping tables in any order
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    for (const table of tablesToDrop) {
      console.log(`Dropping table: ${table}`);
      await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
    }

    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Purge completed successfully!');

    // 2. Merge admin_users info into users role if not already done
    // Let's see if we have admin_users role info to restore/merge.
    // In our case, the 'users' table already has 'role' column. Let's make sure any admin email has the ADMIN role.
    const adminEmails = (process.env.ADMIN_EMAILS || 'admin@yourdomain.com').split(',');
    for (const email of adminEmails) {
      if (email.trim()) {
        console.log(`Setting role to ADMIN for user: ${email.trim()}`);
        await connection.query(
          `UPDATE users SET role = 'ADMIN' WHERE LOWER(email) = LOWER(?)`,
          [email.trim()]
        );
      }
    }

  } catch (err) {
    console.error('Error during purge:', err);
  } finally {
    await connection.end();
  }
}

purge();

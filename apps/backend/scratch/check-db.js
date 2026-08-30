const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from apps/backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function checkDb() {
  console.log('Connecting to:', {
    host: process.env.MYSQL_SERVER,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_UID,
    database: process.env.MYSQL_DATABASE,
  });

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_SERVER || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_UID || "",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "",
  });

  try {
    const [rows] = await connection.query('SELECT * FROM refund_shield ORDER BY id DESC LIMIT 5');
    console.log('Latest rows in refund_shield table:');
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('Error querying refund_shield table:', err.message);
  } finally {
    await connection.end();
  }
}

checkDb();

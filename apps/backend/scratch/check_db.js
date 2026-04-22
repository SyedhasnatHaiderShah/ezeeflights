require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  const res = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`);
  console.log('Tables:', res.rows.map(r => r.table_name));

  const countRes = await pool.query(`SELECT COUNT(*) FROM schema_migrations`);
  console.log('schema_migrations count:', countRes.rows[0].count);

  const migs = await pool.query(`SELECT * FROM schema_migrations`);
  console.log('schema_migrations rows:', migs.rows);
}

check().then(() => pool.end()).catch(console.error);

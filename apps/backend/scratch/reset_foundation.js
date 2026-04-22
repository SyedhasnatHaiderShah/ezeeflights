require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function reset() {
  await pool.query(`DELETE FROM schema_migrations WHERE version='000_foundation.sql'`);
  console.log('Deleted 000_foundation.sql from schema_migrations');
}

reset().then(() => pool.end()).catch(console.error);

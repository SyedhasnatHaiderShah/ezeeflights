const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env' });

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log('Running raw migration to add pricing columns...');
  try {
    await pool.query(`
      ALTER TABLE flights 
      ADD COLUMN IF NOT EXISTS tax NUMERIC, 
      ADD COLUMN IF NOT EXISTS total_fare NUMERIC, 
      ADD COLUMN IF NOT EXISTS raw_segments JSONB;
    `);
    console.log('Migration successful!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();

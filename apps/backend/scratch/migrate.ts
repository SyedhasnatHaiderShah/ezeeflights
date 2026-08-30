import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    console.log('Checking database schema...');
    
    // Add raw_segments column if it doesn't exist
    await pool.query(`
      ALTER TABLE flights 
      ADD COLUMN IF NOT EXISTS raw_segments TEXT;
    `);
    
    console.log('Migration successful: raw_segments column ensured.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();

const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../apps/backend/.env') });

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();
  try {
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_profiles'
    `);
    console.log('Columns in user_profiles table:', res.rows);
  } catch (err) {
    console.error('Error querying columns:', err);
  } finally {
    await client.end();
  }
}

run();

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necessary for some Neon connections
  }
});

async function resetDatabase() {
  console.log("⚠️  Resetting Neon Database...");
  
  try {
    // 1. Drop the entire public schema
    await pool.query('DROP SCHEMA IF EXISTS public CASCADE');
    
    // 2. Recreate the public schema
    await pool.query('CREATE SCHEMA public');
    
    // 3. Restore default permissions
    await pool.query('GRANT ALL ON SCHEMA public TO public');
    
    // 4. Re-enable UUID support
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    console.log("✅ Database reset successfully.");
  } catch (err) {
    console.error("❌ Error resetting database:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetDatabase();

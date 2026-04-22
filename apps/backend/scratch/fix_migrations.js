require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixMigrations() {
  const migrationsPath = path.resolve(__dirname, '../../../sql/migrations');
  const files = fs.readdirSync(migrationsPath).filter(f => f.endsWith('.sql'));

  for (const file of files) {
    await pool.query(
      `INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT (version) DO NOTHING`,
      [file]
    );
    console.log('Marked as applied:', file);
  }
}

fixMigrations()
  .then(() => pool.end())
  .catch(err => {
    console.error(err);
    pool.end();
  });

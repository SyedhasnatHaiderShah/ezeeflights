const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

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

const envPath = path.resolve(__dirname, '../../.env');
const rootEnvPath = path.resolve(__dirname, '../../../../.env');

console.log('DEBUG: envPath is', envPath);
console.log('DEBUG: envPath exists:', fs.existsSync(envPath));
console.log('DEBUG: rootEnvPath exists:', fs.existsSync(rootEnvPath));

loadEnv(envPath);
if (!process.env.DATABASE_URL) loadEnv(rootEnvPath);

console.log('DEBUG: DATABASE_URL is', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
if (process.env.DATABASE_URL) {
    console.log('DEBUG: DATABASE_URL starts with', process.env.DATABASE_URL.substring(0, 10));
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const migrationsDir = path.resolve(__dirname, '../../../../sql/migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  console.log('🚀 Running migrations...');

  for (const file of files) {
    console.log(`Checking migration: ${file}`);
    
    // Check if already applied
    try {
      await pool.query('CREATE TABLE IF NOT EXISTS schema_migrations (version VARCHAR(100) PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT NOW())');
      const { rows } = await pool.query('SELECT version FROM schema_migrations WHERE version = $1', [file]);
      if (rows.length > 0) {
        console.log(`Skipping ${file} (already applied)`);
        continue;
      }
    } catch (e) {
      // If table doesn't exist yet, it will be created in the first step above
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`Applying ${file}...`);
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`✅ Applied ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.log(`❌ Failed to apply ${file}:`, err.message);
      // Don't stop for all, but maybe stop for the new one
      if (file === '034_enhance_destinations.sql') {
          process.exit(1);
      }
    } finally {
      client.release();
    }
  }

  console.log('✨ All migrations checked!');
  await pool.end();
}

migrate();

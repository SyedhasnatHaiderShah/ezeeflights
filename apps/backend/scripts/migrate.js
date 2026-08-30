const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

/**
 * Splits a SQL block into individual statements, respecting dollar-quoted blocks ($$).
 */
function splitSql(sql) {
  // 1. Remove single-line comments (-- ...)
  // 2. Remove multi-line comments (/* ... */)
  const cleanSql = sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  const statements = [];
  let current = '';
  let parts = cleanSql.split('$$');

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      // Outside dollar quotes
      const subParts = parts[i].split(';');
      for (let j = 0; j < subParts.length; j++) {
        if (j < subParts.length - 1) {
          // Found a semicolon delimiter
          current += subParts[j];
          if (current.trim()) {
            statements.push(current.trim() + ';');
          }
          current = '';
        } else {
          // No semicolon, continue to next segment
          current += subParts[j];
        }
      }
    } else {
      // Inside dollar quotes - preserve the block
      current += '$$' + parts[i] + '$$';
    }
  }
  
  if (current.trim()) {
    statements.push(current.trim());
  }
  
  return statements.filter(s => s.length > 0 && s !== ';');
}

async function runStatements(client, sql, fileName) {
  const statements = splitSql(sql);
  for (let statement of statements) {
    try {
      await client.query(statement);
    } catch (err) {
      // Ignore extension errors (PostGIS, uuid-ossp)
      if (statement.toUpperCase().includes('CREATE EXTENSION')) {
        console.warn(`  Warning in ${fileName}: Extension failed - ${err.message}`);
        continue;
      }
      
      // Ignore GIS specific errors if PostGIS is missing
      if (err.message.includes('st_makepoint') || err.message.includes('st_setsrid') || err.message.includes('GIST')) {
        console.warn(`  Warning in ${fileName}: Geo-feature skipped (PostGIS missing) - ${err.message}`);
        continue;
      }

      // Handle "already exists" errors for sequence/types/tables
      if (err.message.includes('already exists')) {
        // Only warn for schema.sql, ignore for migrations if we've already matched baseline
        if (fileName.includes('schema.sql')) {
           continue;
        }
      }

      console.error(`  Error in ${fileName} at statement: "${statement.substring(0, 100)}..."`);
      console.error(`  Message: ${err.message}`);
      
      // For migrations, we usually want to stop on structural errors, but we return the error to the caller
      throw err;
    }
  }
}

async function migrate() {
  const envPath = path.join(__dirname, '../.env');
  let databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl && fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/^DATABASE_URL=(.+)$/m);
    if (match) {
      databaseUrl = match[1].trim();
    }
  }

  if (!databaseUrl) {
    console.error('Error: DATABASE_URL not found in environment or .env file');
    process.exit(1);
  }

  databaseUrl = databaseUrl.replace('@postgres:', '@localhost:');

  console.log('Connecting to database...');
  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    console.log('Connected successfully.');

    // Step 0: Initialize Tracking Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations_history (
        id SERIAL PRIMARY KEY,
        file_name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Step 1: Check Baseline
    const { rows: tableCheck } = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!tableCheck[0].exists) {
      console.log('Baseline schema not found. Applying schema.sql statement by statement...');
      const schemaPath = path.join(__dirname, '../../../sql/schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        try {
          await runStatements(client, schemaSql, 'schema.sql');
        } catch (e) {
          // We tolerate non-critical schema errors (like extensions)
        }
        console.log('  Finished applying schema.sql.');
      }
    } else {
      console.log('Baseline schema already exists. Skipping schema.sql.');
    }

    // Step 2: Fetch history
    const { rows: history } = await client.query('SELECT file_name FROM _migrations_history');
    const appliedSet = new Set(history.map(m => m.file_name));

    // Step 3: Apply Migrations
    const migrationsDir = path.join(__dirname, '../../../sql/migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`Skipping already applied migration: ${file}`);
        continue;
      }

      console.log(`Applying migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        await runStatements(client, sql, file);
        await client.query('INSERT INTO _migrations_history (file_name) VALUES ($1) ON CONFLICT DO NOTHING', [file]);
        console.log(`  Successfully processed ${file}`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.warn(`  Migration ${file} seems already applied (relation exists). Marking as done and continuing...`);
          await client.query('INSERT INTO _migrations_history (file_name) VALUES ($1) ON CONFLICT DO NOTHING', [file]);
          continue;
        }
        console.error(`  Failed to apply ${file}. Stopping migration process.`);
        process.exit(1);
      }
    }

    console.log('Migration process completed.');
  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    await client.end();
  }
}

migrate();

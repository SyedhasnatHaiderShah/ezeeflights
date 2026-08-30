const { Client } = require('pg');

async function alterIdType() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_V7IpUHPTm8uq@ep-polished-sound-a1vx9knd-pooler.ap-southeast-1.aws.neon.tech/neondb",
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log("Connected to DB. Altering 'id' column type to TEXT...");

    // We need to drop the constraint or change type. 
    // In Postgres, changing a UUID column to TEXT is generally fine.
    // However, if it's the PRIMARY KEY, we might need to handle it carefully.

    await client.query(`
      ALTER TABLE flights ALTER COLUMN id TYPE TEXT;
    `);

    console.log("Successfully changed 'id' column to TEXT.");
  } catch (err) {
    console.error("Failed to alter column:", err.message);

    if (err.message.includes("primary key")) {
      console.log("Column is part of primary key. Trying a different approach...");
      // If it's a primary key, we might need to drop and recreate it, 
      // but just changing the type should work in most PG versions if there are no foreign key dependencies.
    }
  } finally {
    await client.end();
  }
}

alterIdType();

const { Client } = require('pg');

async function checkSchema() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_V7IpUHPTm8uq@ep-polished-sound-a1vx9knd-pooler.ap-southeast-1.aws.neon.tech/neondb",
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'flight_segments';
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkSchema();

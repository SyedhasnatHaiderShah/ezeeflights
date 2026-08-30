const { Pool } = require('pg');
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_V7IpUHPTm8uq@ep-polished-sound-a1vx9knd-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
});

async function checkSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'wishlists'
    `);
    console.log('Columns in wishlists table:');
    res.rows.forEach(row => console.log(`- ${row.column_name}: ${row.data_type}`));
  } catch (err) {
    console.error('Error checking schema:', err);
  } finally {
    await pool.end();
  }
}

checkSchema();

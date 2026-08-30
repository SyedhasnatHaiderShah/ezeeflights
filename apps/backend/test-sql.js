const { Client } = require('pg');
const client = new Client({ connectionString: 'postgres://postgres:khurram68@localhost:5432/ezeeflights' });

async function run() {
  await client.connect();
  try {
    const res = await client.query(`SELECT id, flight_snapshot FROM flight_inquiries WHERE id = 'aeb94b1d-4695-44a7-9f23-d2f0af8b9fc7'`);
    console.log(JSON.stringify(res.rows[0], null, 2));
  } catch(err) {
    console.error(err.message);
  } finally {
    await client.end();
  }
}
run();

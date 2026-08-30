require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  const res = await pool.query('SELECT id, airline, flight_number, departure_airport, arrival_airport, base_fare, total_fare, tax FROM flights');
  console.log('Flights in DB:', res.rows);
}

check().then(() => pool.end()).catch(console.error);

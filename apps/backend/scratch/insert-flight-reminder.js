const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'd:/aws/ezeeflights-aws/.env' });

async function insertFlightData() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_SERVER || '127.0.0.1',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_UID || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'ezeeflights_crm'
  });

  const travelDate = new Date();
  travelDate.setHours(travelDate.getHours() + 12); // 12 hours from now

  const sql = `
    INSERT INTO tbl_customerdetails 
    (bookingRef, originFrom, destinationTo, airLine, travellType, cabin, departureDate, email, totalAmount, status, work_status, created_at) 
    VALUES 
    ('TEST-FLT-789', 'LHE', 'DXB', 'EK', 'one-way', 'economy', ?, 'testflight@example.com', 850.00, '0', 'pending', NOW())
  `;

  const [result] = await connection.execute(sql, [
    travelDate.toISOString().slice(0, 19).replace('T', ' ')
  ]);

  console.log('Inserted test flight booking with customerId:', result.insertId);
  console.log('Travel Date:', travelDate.toISOString());

  await connection.end();
}

insertFlightData().catch(console.error);

const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'd:/aws/ezeeflights-aws/.env' });

async function insertTestData() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_SERVER || '127.0.0.1',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_UID || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'ezeeflights_crm'
  });

  console.log('Connected to DB');

  // We want travelDate to be within 1 day from now to trigger the one-day-reminder
  const travelDate = new Date();
  travelDate.setHours(travelDate.getHours() + 12); // 12 hours from now

  const payload = {
    hotelName: 'Test Hotel Grand',
    checkInDate: travelDate.toISOString(),
    totalPrice: 450,
    currency: 'USD',
    guestNames: 'John Doe',
    userName: 'John'
  };

  const sql = `
    INSERT INTO tbl_notification 
    (id, user_id, type, record_type, status, booking_type, booking_ref, contact_email, template_name, travel_date, payload, created_at, updated_at) 
    VALUES 
    (UUID(), '00000000-0000-0000-0000-000000000000', 'EMAIL', 'MESSAGE', 'SENT', 'HOTEL', 'TEST-HTL-123', 'test@example.com', 'hotel-booking-confirmation', ?, ?, NOW(), NOW())
  `;

  await connection.execute(sql, [
    travelDate.toISOString().slice(0, 19).replace('T', ' '),
    JSON.stringify(payload)
  ]);

  console.log('Inserted test hotel booking confirmation into tbl_notification');
  console.log('Travel Date:', travelDate.toISOString());

  await connection.end();
}

insertTestData().catch(console.error);

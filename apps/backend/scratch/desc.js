const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection({host:'localhost', user:'root', password:'khurram68', database:'ezeeflights_crm'});
  const [rows] = await connection.execute('SELECT id, title, is_flash_sale FROM tbl_popularpackage');
  const [rows2] = await connection.execute('SELECT id, title, is_flash_sale FROM tbl_flightdeals');
  console.log('tbl_popularpackage:', rows);
  console.log('tbl_flightdeals:', rows2);
  process.exit(0);
}
run();

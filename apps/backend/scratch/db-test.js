const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: '50.6.174.52',
    port: 3306,
    user: 'spanish_jetcost',
    password: 'k7C2o3!i9',
    database: 'spanish_jetcost'
  });

  try {
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables in spanish_jetcost:', tables);
    
    // Check if there is a status table, and print its columns/data
    for (const t of tables) {
      const tableName = Object.values(t)[0];
      const [rows] = await connection.query(`SELECT * FROM \`${tableName}\` LIMIT 5`);
      console.log(`\n--- Rows from ${tableName} ---`);
      console.log(rows);
    }
  } catch (err) {
    console.error('Error running query:', err);
  } finally {
    await connection.end();
  }
}

main();

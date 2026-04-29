
const mysql = require('mysql2/promise');

async function checkInvoices() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'lumina_db'
  });

  try {
    const [rows] = await connection.execute('SELECT * FROM invoices');
    console.log('Total invoices in DB:', rows.length);
    rows.forEach(r => {
        console.log(`ID: ${r.id}, Date: ${r.date}, Amount: ${r.amount}`);
    });
  } catch (error) {
    console.error('Error querying DB:', error.message);
  } finally {
    await connection.end();
  }
}

checkInvoices();

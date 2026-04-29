
const mysql = require('mysql2/promise');

async function checkInvoices() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'lumina_db'
  });

  try {
    const [rows] = await connection.execute('SELECT * FROM invoices LIMIT 5');
    console.log('Total invoices in DB:', rows.length);
    console.log('Sample invoices:', JSON.stringify(rows, null, 2));
    
    const [count] = await connection.execute('SELECT COUNT(*) as count FROM invoices');
    console.log('Total count:', count[0].count);
  } catch (error) {
    console.error('Error querying DB:', error.message);
  } finally {
    await connection.end();
  }
}

checkInvoices();

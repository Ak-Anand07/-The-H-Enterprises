const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

async function setup() {
  const connectionConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    port: parseInt(process.env.MYSQL_PORT || '3306')
  };

  const dbName = process.env.MYSQL_DATABASE || 'lumina_db';

  console.log(`Connecting to MySQL at ${connectionConfig.host}:${connectionConfig.port} as ${connectionConfig.user}...`);

  try {
    const connection = await mysql.createConnection(connectionConfig);
    
    console.log(`Resetting database "${dbName}"...`);
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\`;`);
    await connection.query(`CREATE DATABASE \`${dbName}\`;`);
    
    console.log('Database setup successful!');
    await connection.end();
    
    console.log('\nNext step: Run migrations with "npm run migrate"');
  } catch (error) {
    console.error('Error during database setup:');
    console.error(error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\nTIP: Make sure your MySQL server is running (e.g., start MySQL in XAMPP or your local MySQL service).');
    }
    process.exit(1);
  }
}

setup();


const axios = require('axios');

async function checkInvoices() {
  try {
    const response = await axios.get('http://localhost:3032/invoices?$limit=10');
    console.log('Total invoices:', response.data.total);
    console.log('Sample invoice:', response.data.data[0]);
  } catch (error) {
    console.error('Error fetching invoices:', error.message);
  }
}

checkInvoices();

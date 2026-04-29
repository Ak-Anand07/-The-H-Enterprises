import { app } from './app'
import type { CompanyData } from './services/companies/companies.schema'
import type { InvoiceData } from './services/invoices/invoices.schema'

async function seed() {
  console.log('Seeding database...')

  // Seed Admin User
  const existingUsers = await app.service('users').find({ query: { email: 'admin@henterprises.com' } })
  if (existingUsers.total === 0) {
    await app.service('users').create({
      name: 'The H Enterprise Admin',
      email: 'admin@henterprises.com',
      password: 'admin'
    })
    console.log('Seeded admin user.')
  } else {
    console.log('Admin user already exists. Skipping user seed.')
  }
  
  // Seed Companies
  const companies: CompanyData[] = [
    { name: 'Nexus Tech Corp', status: 'Active', createdAt: '2024-01-15' },
    { name: 'Solaris Energy', status: 'Active', createdAt: '2024-02-20' },
    { name: 'Apex Logistics', status: 'Active', createdAt: '2024-03-05' },
    { name: 'Vertex Media', status: 'Active', createdAt: '2024-04-10' },
  ]
  const insertedCompanies = []

  // Check if we already have companies
  const existingCompanies = await app.service('companies').find()
  if (existingCompanies.total === 0) {
    for (const company of companies) {
      const created = await app.service('companies').create(company)
      insertedCompanies.push(created)
    }
    console.log('Seeded companies.')
  } else {
    console.log('Companies already exist. Skipping company seed.')
    insertedCompanies.push(...existingCompanies.data)
  }

  // Seed Invoices with dates in 2026 to ensure they show up in the dashboard charts
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const invoices: InvoiceData[] = [
    {
      companyId: insertedCompanies[0].id,
      companyName: 'Nexus Tech Corp',
      companyInitial: 'N',
      date: new Date(currentYear, currentMonth, 10).toISOString().split('T')[0],
      amount: '₹ 45,000.00',
      status: 'Cleared'
    },
    {
      companyId: insertedCompanies[1].id,
      companyName: 'Solaris Energy',
      companyInitial: 'S',
      date: new Date(currentYear, currentMonth - 1, 15).toISOString().split('T')[0],
      amount: '₹ 32,400.00',
      status: 'Pending'
    },
    {
      companyId: insertedCompanies[2].id,
      companyName: 'Apex Logistics',
      companyInitial: 'A',
      date: new Date(currentYear, currentMonth - 2, 5).toISOString().split('T')[0],
      amount: '₹ 18,200.00',
      status: 'Cleared'
    },
    {
      companyId: insertedCompanies[3].id,
      companyName: 'Vertex Media',
      companyInitial: 'V',
      date: new Date(currentYear, currentMonth - 3, 20).toISOString().split('T')[0],
      amount: '₹ 28,900.00',
      status: 'Pending'
    },
    {
      companyId: insertedCompanies[0].id,
      companyName: 'Nexus Tech Corp',
      companyInitial: 'N',
      date: new Date(currentYear, currentMonth - 4, 12).toISOString().split('T')[0],
      amount: '₹ 52,100.00',
      status: 'Cleared'
    },
    {
      companyId: insertedCompanies[1].id,
      companyName: 'Solaris Energy',
      companyInitial: 'S',
      date: new Date(currentYear, currentMonth - 5, 18).toISOString().split('T')[0],
      amount: '₹ 41,000.00',
      status: 'Cleared'
    }
  ]

  const existingInvoices = await app.service('invoices').find()
  if (existingInvoices.total === 0) {
    for (const invoice of invoices) {
      await app.service('invoices').create(invoice)
    }
    console.log('Seeded invoices.')
  } else {
    console.log('Invoices already exist. Skipping invoice seed.')
  }

  console.log('Done.')
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
}).then(() => {
  process.exit(0)
})

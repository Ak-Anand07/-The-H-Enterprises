import assert from 'assert'

import { app } from '../src/app'
import { buildCompanyInitial } from '../src/utils/ledger-domain'

describe('ledger business rules', () => {
  const db = app.get('sqliteClient')
  const createdCompanyIds: number[] = []
  const createdInvoiceIds: number[] = []
  const uniqueSeed = `spec-${Date.now()}`
  const uniqueGst = `27ABCDE${String(Date.now()).slice(-4)}F1Z5`

  afterEach(async () => {
    if (createdInvoiceIds.length > 0) {
      await db('invoices').whereIn('id', createdInvoiceIds.splice(0, createdInvoiceIds.length)).del()
    }

    if (createdCompanyIds.length > 0) {
      await db('companies').whereIn('id', createdCompanyIds.splice(0, createdCompanyIds.length)).del()
    }
  })

  it('normalizes companies and blocks duplicate company names', async () => {
    const company = await app.service('companies').create({
      name: `${uniqueSeed} alpha systems`,
      gstNumber: uniqueGst,
      invoiceType: 'Proforma Invoice',
      contactEmail: 'Finance@Example.com',
      margin: '12'
    })

    createdCompanyIds.push(company.id)

    assert.strictEqual(company.status, 'Active')
    assert.strictEqual(company.contactEmail, 'finance@example.com')
    assert.strictEqual(company.margin, '12.0%')
    assert.strictEqual(company.gstNumber, uniqueGst)
    assert.ok(typeof company.createdAt === 'string' && company.createdAt.length > 0)

    await assert.rejects(
      () =>
        app.service('companies').create({
          name: `${uniqueSeed} ALPHA SYSTEMS`
        }),
      (error: Error & { name?: string }) => {
        assert.strictEqual(error.name, 'Conflict')
        return true
      }
    )
  })

  it('returns notification feedback when onboarding email is triggered', async () => {
    const company = await app.service('companies').create({
      name: `${uniqueSeed} Notification Works`,
      contactName: 'Avery Finance',
      contactEmail: 'notify@example.com',
      sendNotification: true
    })

    createdCompanyIds.push(company.id)

    assert.strictEqual(company.notificationStatus, 'mocked')
    assert.ok(company.notificationMessage?.includes('notify@example.com'))
  })

  it('creates invoices from company data and generates unique invoice numbers server-side', async () => {
    const company = await app.service('companies').create({
      name: `${uniqueSeed} Proforma Works`,
      invoiceType: 'Proforma Invoice'
    })

    createdCompanyIds.push(company.id)

    const invoice = await app.service('invoices').create({
      companyId: company.id,
      companyName: 'Wrong Snapshot',
      companyInitial: 'WS',
      date: 'Apr 23, 2026',
      amount: 'Rs 1200'
    })

    createdInvoiceIds.push(invoice.id)

    assert.ok(invoice.invoiceNo?.startsWith(`PF-${new Date().getFullYear()}-`))
    assert.strictEqual(invoice.companyName, company.name)
    assert.strictEqual(invoice.companyInitial, buildCompanyInitial(company.name))
    assert.strictEqual(invoice.amount, 'INR 1,200.00')
    assert.strictEqual(invoice.status, 'Pending')
  })

  it('prepares a collection reminder for pending and overdue invoices', async () => {
    const company = await app.service('companies').create({
      name: `${uniqueSeed} Reminder Ready`,
      contactName: 'Jordan Billing',
      contactEmail: 'collections@example.com'
    })

    createdCompanyIds.push(company.id)

    const pendingInvoice = await app.service('invoices').create({
      companyId: company.id,
      date: 'Apr 21, 2026',
      amount: '1200',
      status: 'Pending'
    })

    const overdueInvoice = await app.service('invoices').create({
      companyId: company.id,
      date: 'Apr 10, 2026',
      amount: '800',
      status: 'Overdue'
    })

    createdInvoiceIds.push(pendingInvoice.id, overdueInvoice.id)

    const reminder = await app.service('collection-reminders').create({
      companyId: company.id
    })

    assert.strictEqual(reminder.notificationStatus, 'mocked')
    assert.strictEqual(reminder.recipientEmail, 'collections@example.com')
    assert.strictEqual(reminder.invoiceCount, 2)
    assert.strictEqual(reminder.totalOutstanding, 'INR 2,000.00')
  })

  it('syncs invoice company snapshots and blocks deleting linked companies', async () => {
    const company = await app.service('companies').create({
      name: `${uniqueSeed} Ledger House`
    })

    createdCompanyIds.push(company.id)

    const invoice = await app.service('invoices').create({
      companyId: company.id,
      date: 'Apr 22, 2026',
      amount: '1500',
      status: 'Cleared'
    })

    createdInvoiceIds.push(invoice.id)

    const renamedCompany = await app.service('companies').patch(company.id, {
      name: `${uniqueSeed} Ledger Collective`
    })

    const syncedInvoice = await app.service('invoices').get(invoice.id)

    assert.strictEqual(syncedInvoice.companyName, renamedCompany.name)
    assert.strictEqual(syncedInvoice.companyInitial, buildCompanyInitial(renamedCompany.name))

    await assert.rejects(
      () => app.service('companies').remove(company.id),
      (error: Error & { name?: string }) => {
        assert.strictEqual(error.name, 'Conflict')
        return true
      }
    )
  })
})

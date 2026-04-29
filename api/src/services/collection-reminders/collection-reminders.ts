import { hooks as authHooks } from '@feathersjs/authentication'
import { BadRequest, NotFound } from '@feathersjs/errors'
import type { Params } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import { sendCollectionReminderEmail } from '../../lib/mailer'
import { logger } from '../../logger'
import type { Company } from '../companies/companies.schema'
import type { Invoice } from '../invoices/invoices.schema'

type CollectionReminderRequest = {
  companyId?: number | string
}

type CollectionReminderOptions = {
  overdueOnly?: boolean
}

type CollectionReminderResult = {
  companyId: number
  companyName: string
  recipientEmail: string
  invoiceCount: number
  totalOutstanding: string
  notificationStatus: 'sent' | 'mocked' | 'skipped' | 'failed'
  notificationMessage: string
  provider?: 'gmail' | 'resend' | 'mock'
  messageId?: string
}

const formatCurrency = (value: number) =>
  `INR ${new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)}`

const parseAmount = (value: string) => Number.parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0

class CollectionReminderService {
  constructor(private app: Application) {}

  async create(data: CollectionReminderRequest, _params?: Params): Promise<CollectionReminderResult> {
    const companyId = Number(data?.companyId)

    if (!Number.isInteger(companyId) || companyId <= 0) {
      throw new BadRequest('A valid companyId is required to send a reminder email.')
    }

    return sendCollectionReminderForCompany(this.app, companyId)
  }
}

export const sendCollectionReminderForCompany = async (
  app: Application,
  companyId: number,
  options: CollectionReminderOptions = {}
): Promise<CollectionReminderResult> => {
  const db = app.get('mysqlClient')
  const company = await db<Company>('companies').where({ id: companyId }).first()
  const statuses = options.overdueOnly ? ['Overdue'] : ['Pending', 'Overdue']
  const todayDateKey = new Date().toISOString().slice(0, 10)

  if (!company) {
    throw new NotFound('Company record could not be found.')
  }

  if (!company.contactEmail) {
    return {
      companyId,
      companyName: company.name,
      recipientEmail: '',
      invoiceCount: 0,
      totalOutstanding: formatCurrency(0),
      notificationStatus: 'skipped',
      notificationMessage: 'No contact email is available for this company.'
    }
  }

  const invoices = await db<Invoice>('invoices')
    .where({ companyId })
    .whereIn('status', options.overdueOnly ? ['Pending', 'Overdue'] : statuses)
    .orderBy('id', 'asc')
    .select('id', 'invoiceNo', 'date', 'dueDate', 'amount', 'status')

  const eligibleInvoices = options.overdueOnly
    ? invoices.filter((invoice) => {
        if (invoice.status === 'Overdue') {
          return true
        }

        return typeof invoice.dueDate === 'string' && invoice.dueDate <= todayDateKey
      })
    : invoices

  if (eligibleInvoices.length === 0) {
    return {
      companyId,
      companyName: company.name,
      recipientEmail: company.contactEmail,
      invoiceCount: 0,
      totalOutstanding: formatCurrency(0),
      notificationStatus: 'skipped',
      notificationMessage: options.overdueOnly
        ? 'No overdue invoices were found for this company.'
        : 'No pending or overdue invoices were found for this company.'
    }
  }

  const totalOutstanding = formatCurrency(
    eligibleInvoices.reduce((sum, invoice) => sum + parseAmount(invoice.amount), 0)
  )

  try {
    const emailResult = await sendCollectionReminderEmail({
        companyName: company.name,
        contactName: company.contactName,
        recipientEmail: company.contactEmail,
        invoices: eligibleInvoices,
        totalOutstanding,
        hasOverdueInvoices: eligibleInvoices.some((invoice) => invoice.status === 'Overdue')
      })

    return {
      companyId,
      companyName: company.name,
      recipientEmail: company.contactEmail,
      invoiceCount: eligibleInvoices.length,
      totalOutstanding,
      notificationStatus: emailResult.mocked ? 'mocked' : 'sent',
      notificationMessage: emailResult.mocked
        ? `Mock reminder prepared for ${company.contactEmail}.`
        : `Reminder email sent to ${company.contactEmail}.`,
      provider: emailResult.provider,
      messageId: emailResult.messageId
    }
  } catch (error: any) {
    logger.warn('Collection reminder email failed: %s', error?.message || 'Unknown error')

    return {
      companyId,
      companyName: company.name,
      recipientEmail: company.contactEmail,
      invoiceCount: eligibleInvoices.length,
      totalOutstanding,
      notificationStatus: 'failed',
      notificationMessage: 'The reminder email could not be sent.'
    }
  }
}

export const collectionReminder = (app: Application) => {
  app.use('collection-reminders', new CollectionReminderService(app), {
    methods: ['create'],
    events: []
  })

  app.service('collection-reminders').hooks({
    around: {
      all: [],
      create: [authHooks.authenticate('jwt')]
    }
  })
}

declare module '../../declarations' {
  interface ServiceTypes {
    'collection-reminders': CollectionReminderService
  }
}

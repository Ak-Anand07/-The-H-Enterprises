import { BadRequest, Conflict } from '@feathersjs/errors'
import { sendInvoiceGeneratedEmail } from '../../lib/mailer'

import type { HookContext } from '../../declarations'
import type { Company } from '../companies/companies.schema'
import type { Invoice, InvoiceData, InvoicePatch } from './invoices.schema'
import {
  addDaysToCalendarDate,
  INVOICE_STATUSES,
  buildCompanyInitial,
  buildInvoicePrefix,
  normalizeCalendarDateInput,
  normalizeCurrencyAmount,
  normalizeEnum,
  normalizeInvoiceNumber,
  requireText
} from '../../utils/ledger-domain'

type InvoiceMutation = Partial<InvoiceData & InvoicePatch>

const hasOwn = (value: object, key: keyof InvoiceMutation) =>
  Object.prototype.hasOwnProperty.call(value, key)

const getInvoicesTable = (context: HookContext) => context.app.get('mysqlClient')<Invoice>('invoices')
const getCompaniesTable = (context: HookContext) => context.app.get('mysqlClient')<Company>('companies')

const getInvoiceById = async (context: HookContext) => {
  const invoiceId = Number(context.id)
  const invoice = await getInvoicesTable(context).where({ id: invoiceId }).first()

  if (!invoice) {
    throw new BadRequest('Invoice record could not be found.')
  }

  return invoice
}

const getCompanyById = async (context: HookContext, companyId: number) => {
  const company = await getCompaniesTable(context).where({ id: companyId }).first()

  if (!company) {
    throw new BadRequest('Selected company does not exist.')
  }

  return company
}

const ensureUniqueInvoiceNumber = async (
  context: HookContext,
  invoiceNo: string,
  currentId?: number
) => {
  const existing = await getInvoicesTable(context)
    .whereRaw('lower(invoiceNo) = ?', [invoiceNo.toLowerCase()])
    .modify((query) => {
      if (currentId != null) {
        query.whereNot('id', currentId)
      }
    })
    .first('id')

  if (existing) {
    throw new Conflict('An invoice with this number already exists.')
  }
}

const generateInvoiceNumber = async (context: HookContext, company: Company) => {
  const year = new Date().getFullYear()
  const prefix = `${buildInvoicePrefix(company.invoiceType)}-${year}-`
  const existingInvoices = await getInvoicesTable(context)
    .where('invoiceNo', 'like', `${prefix}%`)
    .select('invoiceNo')

  let highestSequence = 0

  for (const invoice of existingInvoices) {
    const match = invoice.invoiceNo?.match(/-(\d+)$/)

    if (!match) {
      continue
    }

    const sequence = Number.parseInt(match[1], 10)

    if (Number.isFinite(sequence) && sequence > highestSequence) {
      highestSequence = sequence
    }
  }

  return `${prefix}${String(highestSequence + 1).padStart(4, '0')}`
}

export const prepareInvoiceData = async (context: HookContext) => {
  const data = context.data as InvoiceMutation | undefined

  if (!data) {
    return context
  }

  const isPatch = context.method === 'patch'
  const existingInvoice = isPatch ? await getInvoiceById(context) : undefined
  const effectiveCompanyId = hasOwn(data, 'companyId')
    ? Number(data.companyId)
    : existingInvoice?.companyId

  if (
    effectiveCompanyId == null ||
    !Number.isInteger(effectiveCompanyId) ||
    Number(effectiveCompanyId) <= 0
  ) {
    throw new BadRequest('A valid companyId is required.')
  }

  const companyId = Number(effectiveCompanyId)
  const company = await getCompanyById(context, companyId)
  const normalizedData: InvoiceMutation = { ...data }

  normalizedData.companyId = company.id
  normalizedData.companyName = company.name
  normalizedData.companyInitial = buildCompanyInitial(company.name)

  if (!isPatch || hasOwn(data, 'date')) {
    normalizedData.date = requireText('Date', data.date, 3)
  }

  if (!isPatch || hasOwn(data, 'dueDate')) {
    const issueDate = hasOwn(data, 'date')
      ? normalizeCalendarDateInput('Date', data.date)
      : normalizeCalendarDateInput('Date', existingInvoice?.date ?? new Date().toISOString())

    normalizedData.dueDate = hasOwn(data, 'dueDate')
      ? normalizeCalendarDateInput('Due date', data.dueDate)
      : existingInvoice?.dueDate || addDaysToCalendarDate(issueDate, 14)
  }

  if (!isPatch || hasOwn(data, 'amount')) {
    normalizedData.amount = normalizeCurrencyAmount(data.amount)
  }

  if (!isPatch || hasOwn(data, 'status')) {
    normalizedData.status = normalizeEnum(
      'Status',
      data.status ?? existingInvoice?.status ?? 'Pending',
      INVOICE_STATUSES
    )
  }

  const currentInvoiceId = existingInvoice?.id ?? (context.id == null ? undefined : Number(context.id))
  const invoiceNoWasProvided = hasOwn(data, 'invoiceNo')
  const normalizedInvoiceNo = invoiceNoWasProvided ? normalizeInvoiceNumber(data.invoiceNo) : ''

  if (!isPatch || invoiceNoWasProvided || !existingInvoice?.invoiceNo) {
    normalizedData.invoiceNo =
      normalizedInvoiceNo || (await generateInvoiceNumber(context, company))

    await ensureUniqueInvoiceNumber(context, normalizedData.invoiceNo, currentInvoiceId)
  }

  context.data = normalizedData

  return context
}

export const notifyCompanyOfInvoice = async (context: HookContext) => {
  const { result } = context

  if (!result || !result.companyId) {
    return context
  }

  // We run this in a self-contained try/catch block so a mailer failure
  // doesn't block the actual database record from being created.
  try {
    const company = await getCompanyById(context, Number(result.companyId))

    if (company && company.contactEmail) {
      // Fire and forget (don't necessarily await if you want max speed, 
      // but awaiting inside this local try/catch is safe)
      await sendInvoiceGeneratedEmail({
        companyName: company.name,
        contactName: company.contactName,
        recipientEmail: company.contactEmail,
        invoiceNo: result.invoiceNo,
        amount: result.amount,
        date: result.date,
        dueDate: result.dueDate || 'N/A'
      }).catch(mailErr => {
        console.error('Mailer internal error:', mailErr)
      })
    }
  } catch (error) {
    // Log the error but don't rethrow it
    console.error('Failed to process invoice notification hook:', error)
  }

  return context
}

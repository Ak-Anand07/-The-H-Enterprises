import { Conflict } from '@feathersjs/errors'
import { logger } from '../../logger'

import type { HookContext } from '../../declarations'
import type { Company, CompanyData, CompanyPatch } from './companies.schema'
import {
  COMPANY_STATUSES,
  INVOICE_TYPES,
  buildCompanyInitial,
  normalizeEmail,
  normalizeEnum,
  normalizeGstNumber,
  normalizeMargin,
  requireText,
  toOptionalTrimmedString
} from '../../utils/ledger-domain'
import { sendCompanyOnboardingEmail } from '../../lib/mailer'

type CompanyMutation = Partial<CompanyData & CompanyPatch>
type CompanyNotificationState = {
  requested: boolean
}

const hasOwn = (value: object, key: keyof CompanyMutation) =>
  Object.prototype.hasOwnProperty.call(value, key)

const getCompaniesTable = (context: HookContext) => context.app.get('mysqlClient')<Company>('companies')
const getInvoicesTable = (context: HookContext) => context.app.get('mysqlClient')('invoices')

const ensureUniqueCompanyValues = async (
  context: HookContext,
  values: { name?: string; gstNumber?: string }
) => {
  const currentId = context.id == null ? undefined : Number(context.id)

  if (values.name) {
    const existingByName = await getCompaniesTable(context)
      .whereRaw('lower(name) = ?', [values.name.toLowerCase()])
      .modify((query) => {
        if (currentId != null) {
          query.whereNot('id', currentId)
        }
      })
      .first('id')

    if (existingByName) {
      throw new Conflict('A company with this name already exists.')
    }
  }

  if (values.gstNumber) {
    const existingByGst = await getCompaniesTable(context)
      .where({ gstNumber: values.gstNumber })
      .modify((query) => {
        if (currentId != null) {
          query.whereNot('id', currentId)
        }
      })
      .first('id')

    if (existingByGst) {
      throw new Conflict('A company with this GST number already exists.')
    }
  }
}

export const normalizeCompanyData = async (context: HookContext) => {
  const data = context.data as CompanyMutation | undefined

  if (!data) {
    return context
  }

  const isPatch = context.method === 'patch'
  const normalizedData: CompanyMutation = { ...data }
  const notificationState: CompanyNotificationState = {
    requested: Boolean(normalizedData.sendNotification)
  }

  context.params.companyNotification = notificationState
  delete normalizedData.sendNotification

  if (!isPatch || hasOwn(data, 'name')) {
    normalizedData.name = requireText('Company name', data.name, 2)
  }

  if (!isPatch || hasOwn(data, 'status')) {
    normalizedData.status = normalizeEnum(
      'Status',
      data.status ?? 'Active',
      COMPANY_STATUSES
    )
  }

  if (!isPatch || hasOwn(data, 'createdAt')) {
    normalizedData.createdAt = toOptionalTrimmedString(data.createdAt) ?? new Date().toISOString()
  }

  if (!isPatch || hasOwn(data, 'gstNumber')) {
    normalizedData.gstNumber = normalizeGstNumber(data.gstNumber)
  }

  if (!isPatch || hasOwn(data, 'invoiceType')) {
    normalizedData.invoiceType = normalizeEnum(
      'Invoice type',
      data.invoiceType ?? 'Final Invoice',
      INVOICE_TYPES
    )
  }

  if (!isPatch || hasOwn(data, 'address')) {
    normalizedData.address = toOptionalTrimmedString(data.address) ?? ''
  }

  if (!isPatch || hasOwn(data, 'city')) {
    normalizedData.city = toOptionalTrimmedString(data.city) ?? ''
  }

  if (!isPatch || hasOwn(data, 'contactName')) {
    normalizedData.contactName = toOptionalTrimmedString(data.contactName) ?? ''
  }

  if (!isPatch || hasOwn(data, 'contactEmail')) {
    normalizedData.contactEmail = normalizeEmail(data.contactEmail)
  }

  if (!isPatch || hasOwn(data, 'contactPhone')) {
    normalizedData.contactPhone = toOptionalTrimmedString(data.contactPhone) ?? ''
  }

  if (!isPatch || hasOwn(data, 'margin')) {
    normalizedData.margin = normalizeMargin(data.margin)
  }

  await ensureUniqueCompanyValues(context, {
    name: normalizedData.name,
    gstNumber: normalizedData.gstNumber
  })

  context.data = normalizedData

  return context
}

export const triggerCompanyNotification = async (context: HookContext) => {
  const notificationState = context.params.companyNotification as CompanyNotificationState | undefined
  const result = context.result as Company | undefined

  if (!notificationState?.requested || !result) {
    return context
  }

  if (!result.contactEmail) {
    context.result = {
      ...result,
      notificationStatus: 'skipped',
      notificationMessage: 'Company saved, but no contact email was available for notification.'
    }

    return context
  }

  try {
    const emailResult = await sendCompanyOnboardingEmail({
      companyName: result.name,
      contactName: result.contactName,
      invoiceType: result.invoiceType,
      recipientEmail: result.contactEmail
    })

    context.result = {
      ...result,
      notificationStatus: emailResult.mocked ? 'mocked' : 'sent',
      notificationMessage: emailResult.mocked
        ? `Company saved. Mock notification prepared for ${result.contactEmail}.`
        : `Company saved and notification email sent to ${result.contactEmail}.`
    }
  } catch (error: any) {
    logger.warn('Company notification email failed: %s', error?.message || 'Unknown error')

    context.result = {
      ...result,
      notificationStatus: 'failed',
      notificationMessage: 'Company saved, but the notification email could not be sent.'
    }
  }

  return context
}

export const preventCompanyDeletionWhenInUse = async (context: HookContext) => {
  const companyId = Number(context.id)
  const linkedInvoices = await getInvoicesTable(context)
    .where({ companyId })
    .count<{ count: number | string }[]>({ count: 'id' })
    .first()

  if (Number(linkedInvoices?.count ?? 0) > 0) {
    throw new Conflict('This company has linked invoices and cannot be deleted.')
  }

  return context
}

export const syncInvoiceCompanySnapshot = async (context: HookContext) => {
  const data = context.data as CompanyMutation | undefined
  const result = context.result as Company | undefined

  if (!data || !result || !hasOwn(data, 'name')) {
    return context
  }

  await getInvoicesTable(context)
    .where({ companyId: result.id })
    .update({
      companyName: result.name,
      companyInitial: buildCompanyInitial(result.name)
    })

  return context
}

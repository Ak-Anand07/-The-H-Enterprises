import { BadRequest } from '@feathersjs/errors'

export const COMPANY_STATUSES = ['Active', 'Inactive'] as const
export const INVOICE_TYPES = ['Final Invoice', 'Proforma Invoice'] as const
export const INVOICE_STATUSES = ['Pending', 'Cleared', 'Overdue'] as const

const GST_PATTERN = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const collapseWhitespace = (value: string) => value.trim().replace(/\s+/g, ' ')

export const toOptionalTrimmedString = (value: unknown) => {
  if (typeof value !== 'string') {
    return undefined
  }

  return collapseWhitespace(value)
}

export const requireText = (fieldName: string, value: unknown, minimumLength = 1) => {
  const normalized = toOptionalTrimmedString(value)

  if (!normalized || normalized.length < minimumLength) {
    throw new BadRequest(`${fieldName} is required.`)
  }

  return normalized
}

export const normalizeEnum = <TValues extends readonly string[]>(
  fieldName: string,
  value: unknown,
  allowedValues: TValues
) => {
  const normalized = requireText(fieldName, value)

  if (!allowedValues.includes(normalized as TValues[number])) {
    throw new BadRequest(`${fieldName} must be one of: ${allowedValues.join(', ')}.`)
  }

  return normalized as TValues[number]
}

export const normalizeEmail = (value: unknown) => {
  const normalized = toOptionalTrimmedString(value)

  if (!normalized) {
    return ''
  }

  if (!EMAIL_PATTERN.test(normalized)) {
    throw new BadRequest('Contact email must be a valid email address.')
  }

  return normalized.toLowerCase()
}

export const normalizeGstNumber = (value: unknown) => {
  const normalized = toOptionalTrimmedString(value)?.replace(/\s+/g, '').toUpperCase() ?? ''

  if (!normalized) {
    return ''
  }

  if (!GST_PATTERN.test(normalized)) {
    throw new BadRequest('GST number must be a valid 15-character GSTIN.')
  }

  return normalized
}

export const normalizeMargin = (value: unknown, fallback = '10.0%') => {
  const normalized = toOptionalTrimmedString(value)

  if (!normalized) {
    return fallback
  }

  const numericValue = Number.parseFloat(normalized.replace('%', ''))

  if (!Number.isFinite(numericValue) || numericValue < 0 || numericValue > 100) {
    throw new BadRequest('Settlement margin must be between 0% and 100%.')
  }

  return `${numericValue.toFixed(1)}%`
}

export const normalizeCurrencyAmount = (value: unknown) => {
  const normalized = requireText('Amount', value)
  const numericValue = Number.parseFloat(normalized.replace(/[^\d.]/g, '').replace(/^\.+/, ''))

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    throw new BadRequest('Amount must be a positive number.')
  }

  return `INR ${new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericValue)}`
}

export const buildCompanyInitial = (companyName: string) => {
  const initials = companyName.replace(/[^a-zA-Z0-9 ]+/g, '').trim().split(/\s+/).filter(Boolean)

  if (initials.length === 0) {
    return 'NA'
  }

  if (initials.length === 1) {
    return initials[0].slice(0, 2).toUpperCase()
  }

  return `${initials[0][0] ?? ''}${initials[1][0] ?? ''}`.toUpperCase()
}

export const buildInvoicePrefix = (invoiceType?: string | null) =>
  invoiceType === 'Proforma Invoice' ? 'PF' : 'INV'

export const normalizeInvoiceNumber = (value: unknown) => {
  const normalized = toOptionalTrimmedString(value)?.toUpperCase() ?? ''

  return normalized.replace(/\s+/g, '')
}

const toCalendarDateKey = (value: Date) => {
  const year = value.getUTCFullYear()
  const month = String(value.getUTCMonth() + 1).padStart(2, '0')
  const day = String(value.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const normalizeCalendarDateInput = (fieldName: string, value: unknown) => {
  const normalized = requireText(fieldName, value)

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized
  }

  const parsed = new Date(normalized)

  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequest(`${fieldName} must be a valid date.`)
  }

  return toCalendarDateKey(parsed)
}

export const addDaysToCalendarDate = (dateKey: string, days: number) => {
  const normalized = normalizeCalendarDateInput('Date', dateKey)
  const parsed = new Date(`${normalized}T00:00:00.000Z`)

  parsed.setUTCDate(parsed.getUTCDate() + days)

  return toCalendarDateKey(parsed)
}

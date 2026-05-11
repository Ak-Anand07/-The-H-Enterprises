import type { Params } from '@feathersjs/feathers'
import { sendInvoiceGeneratedEmail } from '../../lib/mailer'
import { logger } from '../../logger'

interface InvoiceEmailPayload {
  companyName: string
  contactName?: string
  recipientEmail: string
  invoiceNo: string
  amount: string
  date: string
  dueDate: string
  pdfBase64?: string
  logoBase64?: string
  qrBase64?: string
  signatureBase64?: string
}

class InvoiceEmailService {
  async create(data: InvoiceEmailPayload, _params?: Params) {
    try {
      const result = await sendInvoiceGeneratedEmail({
        companyName: data.companyName,
        contactName: data.contactName,
        recipientEmail: data.recipientEmail,
        invoiceNo: data.invoiceNo,
        amount: data.amount,
        date: data.date,
        dueDate: data.dueDate,
        pdfBase64: data.pdfBase64,
        logoBase64: data.logoBase64,
        qrBase64: data.qrBase64,
        signatureBase64: data.signatureBase64
      })

      logger.info('Invoice email sent for %s to %s via %s', data.invoiceNo, data.recipientEmail, result.provider)
      return { success: true, provider: result.provider, mocked: result.mocked }
    } catch (err: any) {
      logger.error('Failed to send invoice email: %s', err.message)
      return { success: false, error: err.message }
    }
  }
}

export const invoiceEmailService = new InvoiceEmailService()

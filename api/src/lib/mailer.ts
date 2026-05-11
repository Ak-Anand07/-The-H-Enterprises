import nodemailer from 'nodemailer'
import { logger } from '../logger'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text: string
}

interface SendEmailResult {
  mocked: boolean
  messageId?: string
  provider?: 'gmail' | 'resend' | 'sendgrid' | 'mock'
}

const getMailConfig = () => ({
  resendKey: process.env.RESEND_API_KEY,
  sendgridKey: process.env.SENDGRID_API_KEY,
  from: process.env.MAIL_FROM,
  replyTo: process.env.MAIL_REPLY_TO,
  gmailUser: process.env.GMAIL_SMTP_USER,
  gmailAppPassword: process.env.GMAIL_SMTP_APP_PASSWORD
})

export const sendEmail = async (options: SendEmailOptions): Promise<SendEmailResult> => {
  const config = getMailConfig()

  // 1. Try SendGrid (HTTP API - Best for personal emails on Render)
  if (config.sendgridKey && config.from) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.sendgridKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: options.to }] }],
          from: { email: config.from.includes('<') ? config.from.split('<')[1].split('>')[0].trim() : config.from },
          reply_to: config.replyTo ? { email: config.replyTo } : undefined,
          subject: options.subject,
          content: [
            { type: 'text/plain', value: options.text },
            { type: 'text/html', value: options.html }
          ]
        })
      })

      if (response.ok) {
        return { mocked: false, provider: 'sendgrid' }
      } else {
        const err = await response.json()
        logger.error('SendGrid Error: %j', err)
      }
    } catch (error: any) {
      logger.error('Failed to send via SendGrid: %s', error.message)
    }
  }

  // 2. Try Resend (HTTP API)
  if (config.resendKey && config.from) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: config.from,
          to: [options.to],
          reply_to: config.replyTo || undefined,
          subject: options.subject,
          html: options.html,
          text: options.text
        })
      })

      const payload = (await response.json().catch(() => ({}))) as { id?: string; message?: string }

      if (response.ok) {
        return { mocked: false, messageId: payload.id, provider: 'resend' }
      }
    } catch (error: any) {
      logger.error('Failed to send via Resend: %s', error.message)
    }
  }

  // 3. Fallback to Gmail (SMTP - Blocks on Render)
  if (config.gmailUser && config.gmailAppPassword && config.from) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: config.gmailUser, pass: config.gmailAppPassword },
      connectionTimeout: 10000,
      family: 4
    } as any)

    try {
      const info = await transporter.sendMail({
        from: config.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      })
      return { mocked: false, messageId: info.messageId, provider: 'gmail' }
    } catch (error: any) {
      logger.error('Gmail SMTP Error: %s', error.message)
    }
  }

  logger.info('Mock email send to %s with subject "%s"', options.to, options.subject)
  return { mocked: true, provider: 'mock' }
}

interface CompanyNotificationOptions {
  companyName: string
  contactName?: string
  invoiceType?: string
  recipientEmail: string
}

interface CollectionReminderInvoice {
  id: number
  invoiceNo?: string
  date: string
  amount: string
  status: string
}

interface CollectionReminderOptions {
  companyName: string
  contactName?: string
  recipientEmail: string
  invoices: CollectionReminderInvoice[]
  totalOutstanding: string
  hasOverdueInvoices: boolean
}

interface InvoiceNotificationOptions {
  companyName: string
  contactName?: string
  recipientEmail: string
  invoiceNo: string
  amount: string
  date: string
  dueDate: string
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export const sendCompanyOnboardingEmail = async ({
  companyName,
  contactName,
  invoiceType,
  recipientEmail
}: CompanyNotificationOptions) => {
  const greetingName = contactName?.trim() || 'there'
  const resolvedInvoiceType = invoiceType?.trim() || 'Final Invoice'

  return sendEmail({
    to: recipientEmail,
    subject: `Onboarding confirmed for ${companyName}`,
    text: [
      `Hello ${greetingName},`,
      '',
      `Your company ${companyName} has been onboarded successfully in the ledger suite.`,
      `Default invoice type: ${resolvedInvoiceType}.`,
      '',
      'You can now continue with invoice creation and contact setup.',
      '',
      'Regards,',
      'The H Enterprises'
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
        <p>Hello ${greetingName},</p>
        <p>
          Your company <strong>${companyName}</strong> has been onboarded successfully in the ledger suite.
        </p>
        <p>
          Default invoice type: <strong>${resolvedInvoiceType}</strong>.
        </p>
        <p>You can now continue with invoice creation and contact setup.</p>
        <p style="margin-top: 24px;">Regards,<br/>The H Enterprises</p>
      </div>
    `
  })
}

export const sendCollectionReminderEmail = async ({
  companyName,
  contactName,
  recipientEmail,
  invoices,
  totalOutstanding,
  hasOverdueInvoices
}: CollectionReminderOptions) => {
  const greetingName = contactName?.trim() || 'there'
  const subject = hasOverdueInvoices
    ? `Urgent payment reminder for ${companyName}`
    : `Payment reminder for ${companyName}`
  const invoiceLines = invoices.map((invoice) => {
    const reference = invoice.invoiceNo?.trim() || `Record #${invoice.id}`
    return `- ${reference} | ${invoice.date} | ${invoice.amount} | ${invoice.status}`
  })
  const invoiceRows = invoices
    .map((invoice) => {
      const reference = escapeHtml(invoice.invoiceNo?.trim() || `Record #${invoice.id}`)
      return `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">${reference}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(invoice.date)}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(invoice.amount)}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(invoice.status)}</td>
        </tr>
      `
    })
    .join('')

  return sendEmail({
    to: recipientEmail,
    subject,
    text: [
      `Hello ${greetingName},`,
      '',
      `This is a reminder that ${companyName} has ${invoices.length} outstanding invoice(s) in the ledger.`,
      `Total outstanding: ${totalOutstanding}.`,
      hasOverdueInvoices
        ? 'Some invoices are currently marked as overdue and need immediate attention.'
        : 'Please review the pending invoices listed below.',
      '',
      ...invoiceLines,
      '',
      'Kindly confirm the payment timeline or share an update with our accounts team.',
      '',
      'Regards,',
      'The H Enterprises'
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
        <p>Hello ${escapeHtml(greetingName)},</p>
        <p>
          This is a reminder that <strong>${escapeHtml(companyName)}</strong> has
          <strong> ${invoices.length} outstanding invoice(s)</strong> in the ledger.
        </p>
        <p>
          Total outstanding: <strong>${escapeHtml(totalOutstanding)}</strong>.
          ${
            hasOverdueInvoices
              ? 'Some invoices are currently marked as overdue and need immediate attention.'
              : 'Please review the pending invoices listed below.'
          }
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
          <thead>
            <tr style="background: #f3f4f6; text-align: left;">
              <th style="padding: 10px 12px;">Invoice</th>
              <th style="padding: 10px 12px;">Date</th>
              <th style="padding: 10px 12px;">Amount</th>
              <th style="padding: 10px 12px;">Status</th>
            </tr>
          </thead>
          <tbody>${invoiceRows}</tbody>
        </table>
        <p>Kindly confirm the payment timeline or share an update with our accounts team.</p>
        <p style="margin-top: 24px;">Regards,<br/>The H Enterprises</p>
      </div>
    `
  })
}

export const sendInvoiceGeneratedEmail = async ({
  companyName,
  contactName,
  recipientEmail,
  invoiceNo,
  amount,
  date,
  dueDate
}: InvoiceNotificationOptions) => {
  const greetingName = contactName?.trim() || 'there'

  return sendEmail({
    to: recipientEmail,
    subject: `New Invoice Issued: ${invoiceNo} for ${companyName}`,
    text: [
      `Hello ${greetingName},`,
      '',
      `A new invoice ${invoiceNo} has been generated for ${companyName}.`,
      '',
      `Invoice Details:`,
      `- Invoice Number: ${invoiceNo}`,
      `- Amount: ${amount}`,
      `- Date: ${date}`,
      `- Due Date: ${dueDate}`,
      '',
      'Please find the invoice details in your portal or contact our accounts team for a PDF copy.',
      '',
      'Regards,',
      'The H Enterprises'
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
        <h2 style="color: #004ac6; margin-top: 0;">Invoice Issued</h2>
        <p>Hello ${escapeHtml(greetingName)},</p>
        <p>
          A new invoice has been generated for <strong>${escapeHtml(companyName)}</strong>.
        </p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Invoice Number:</td>
              <td style="padding: 4px 0; font-weight: bold; text-align: right;">${escapeHtml(invoiceNo)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Amount:</td>
              <td style="padding: 4px 0; font-weight: bold; text-align: right; color: #004ac6;">${escapeHtml(amount)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Issue Date:</td>
              <td style="padding: 4px 0; text-align: right;">${escapeHtml(date)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Due Date:</td>
              <td style="padding: 4px 0; text-align: right;">${escapeHtml(dueDate)}</td>
            </tr>
          </table>
        </div>
        <p>Please review the details and proceed with the payment as per the terms.</p>
        <p style="margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px; font-size: 14px; color: #64748b;">
          Regards,<br/>
          <strong>The H Enterprises</strong>
        </p>
      </div>
    `
  })
}

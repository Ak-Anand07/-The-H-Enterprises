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
  provider?: 'gmail' | 'resend' | 'mock'
}

const getMailConfig = () => ({
  apiKey: process.env.RESEND_API_KEY,
  from: process.env.MAIL_FROM,
  replyTo: process.env.MAIL_REPLY_TO,
  gmailUser: process.env.GMAIL_SMTP_USER,
  gmailAppPassword: process.env.GMAIL_SMTP_APP_PASSWORD
})

export const sendEmail = async (options: SendEmailOptions): Promise<SendEmailResult> => {
  const config = getMailConfig()

  if (config.gmailUser && config.gmailAppPassword && config.from) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // use STARTTLS
      auth: {
        user: config.gmailUser,
        pass: config.gmailAppPassword
      },
      connectionTimeout: 15000 // 15 seconds
    })

    try {
      const info = await transporter.sendMail({
        from: config.from,
        to: options.to,
        replyTo: config.replyTo || undefined,
        subject: options.subject,
        html: options.html,
        text: options.text
      })

      return {
        mocked: false,
        messageId: info.messageId,
        provider: 'gmail'
      }
    } catch (error: any) {
      logger.error('Gmail SMTP Error: %s', error.message)
      if (error.response) logger.error('Gmail Response: %s', error.response)
      throw error
    }
  }

  if (!config.apiKey || !config.from) {
    logger.info(
      'Mock email send to %s with subject "%s". Configure Gmail SMTP or Resend mail env vars for real delivery.',
      options.to,
      options.subject
    )

    return { mocked: true, provider: 'mock' }
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
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

  if (!response.ok) {
    throw new Error(payload.message || `Resend request failed with status ${response.status}.`)
  }

  return {
    mocked: false,
    messageId: payload.id,
    provider: 'resend'
  }
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
      'Ledger Suite'
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

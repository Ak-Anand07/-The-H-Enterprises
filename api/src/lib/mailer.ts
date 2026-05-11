import nodemailer from 'nodemailer'
import { logger } from '../logger'

interface Attachment {
  filename: string
  content: string        // base64 encoded
  contentType: string
  cid?: string           // set for inline images
  disposition?: 'inline' | 'attachment'
}

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text: string
  attachments?: Attachment[]
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
      // Build SendGrid attachments array
      const sgAttachments = (options.attachments || []).map(a => ({
        filename: a.filename,
        content: a.content,
        type: a.contentType,
        disposition: a.disposition || 'attachment',
        content_id: a.cid || undefined
      }))

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
          ],
          attachments: sgAttachments.length ? sgAttachments : undefined
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
      // Build Resend attachments array
      const resendAttachments = (options.attachments || []).map(a => ({
        filename: a.filename,
        content: a.content
      }))

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
          text: options.text,
          attachments: resendAttachments.length ? resendAttachments : undefined
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

  // 3. Fallback to Gmail (SMTP)
  if (config.gmailUser && config.gmailAppPassword && config.from) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: config.gmailUser, pass: config.gmailAppPassword },
      connectionTimeout: 10000,
      family: 4
    } as any)

    // Build nodemailer attachments (supports CID inline images)
    const nmAttachments = (options.attachments || []).map(a => ({
      filename: a.filename,
      content: Buffer.from(a.content, 'base64'),
      contentType: a.contentType,
      cid: a.cid || undefined,
      contentDisposition: a.disposition || 'attachment'
    }))

    try {
      const info = await transporter.sendMail({
        from: config.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: nmAttachments.length ? nmAttachments : undefined
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
  pdfBase64?: string          // optional PDF attachment
  logoBase64?: string         // optional branding logo
  qrBase64?: string           // optional UPI QR code
  signatureBase64?: string    // optional signature image
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
  dueDate,
  pdfBase64,
  logoBase64,
  qrBase64,
  signatureBase64
}: InvoiceNotificationOptions) => {
  const greetingName = contactName?.trim() || 'there'
  
  // Financial Calculations
  const cleanAmount = parseFloat(amount.replace(/[^0-9.-]+/g, '') || '0')
  const gstAmount = cleanAmount * 0.18
  const totalAmount = cleanAmount + gstAmount

  const bankDetails = {
    name: 'The H Enterprises',
    accNo: '920020056431640',
    bank: 'Axis Bank',
    branch: 'Pallavaram',
    ifsc: 'UTIB0000851'
  }

  // Build attachments array - images as inline CID, PDF as downloadable
  const attachments: Array<{
    filename: string
    content: string
    contentType: string
    cid?: string
    disposition?: 'inline' | 'attachment'
  }> = []

  if (logoBase64) {
    // Strip data URI prefix if present
    const raw = logoBase64.replace(/^data:image\/[a-z]+;base64,/, '')
    attachments.push({
      filename: 'logo.png',
      content: raw,
      contentType: 'image/png',
      cid: 'invoice-logo',
      disposition: 'inline'
    })
  }

  if (qrBase64) {
    const raw = qrBase64.replace(/^data:image\/[a-z]+;base64,/, '')
    attachments.push({
      filename: 'upi-qr.png',
      content: raw,
      contentType: 'image/png',
      cid: 'invoice-qr',
      disposition: 'inline'
    })
  }

  if (signatureBase64) {
    const raw = signatureBase64.replace(/^data:image\/[a-z]+;base64,/, '')
    attachments.push({
      filename: 'signature.png',
      content: raw,
      contentType: 'image/png',
      cid: 'invoice-signature',
      disposition: 'inline'
    })
  }

  if (pdfBase64) {
    const raw = pdfBase64.replace(/^data:application\/pdf;base64,/, '')
    attachments.push({
      filename: `Invoice-${invoiceNo}.pdf`,
      content: raw,
      contentType: 'application/pdf',
      disposition: 'attachment'
    })
  }

  // Use CID refs when images are provided; fall back to empty placeholder
  const logoSrc    = logoBase64      ? 'cid:invoice-logo'      : ''
  const qrSrc      = qrBase64        ? 'cid:invoice-qr'        : ''
  const signSrc    = signatureBase64 ? 'cid:invoice-signature' : ''

  return sendEmail({
    to: recipientEmail,
    subject: `Proforma Invoice Issued: ${invoiceNo} - The H Enterprises`,
    text: `Hello ${greetingName}, your invoice ${invoiceNo} for Rs. ${totalAmount.toFixed(2)} has been issued.`,
    attachments,
    html: `

      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 700px; margin: 0 auto; border: 1px solid #eee;">
        <!-- Header -->
        <div style="text-align: center; padding: 10px 20px; background: #fff;">
          ${logoSrc ? `<img src="${logoSrc}" width="120" alt="Logo" style="display: block; margin: 0 auto; max-width: 150px;" />` : ''}
        </div>

        <div style="padding: 0 40px 40px;">
          <h2 style="text-align: center; font-size: 20px; border-bottom: 2px solid #333; display: table; margin: 0 auto 30px; padding-bottom: 5px;">Proforma Invoice</h2>
          
          <!-- Top Info Grid -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="width: 50%; padding: 15px; background: #ebf1f5; border: 1px solid #ccc; text-align: center;">
                <strong style="display: block; font-size: 14px;">${escapeHtml(companyName).toUpperCase()}</strong>
                <span style="font-size: 12px; color: #555;">Chennai</span>
              </td>
              <td style="width: 50%; padding: 15px; background: #ebf1f5; border: 1px solid #ccc; font-size: 13px;">
                <table style="width: 100%;">
                  <tr><td>Invoice No</td><td>: ${escapeHtml(invoiceNo)}</td></tr>
                  <tr><td>Invoice Date</td><td>: ${escapeHtml(date)}</td></tr>
                  <tr><td>Due date</td><td>: ${escapeHtml(dueDate)}</td></tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
            <tr>
              <td style="padding: 12px; border: 1px solid #333;">Professional software management fee</td>
              <td style="padding: 12px; border: 1px solid #333; text-align: right; width: 120px;">Rs. ${cleanAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #333; text-align: center; background: #f9f9f9;">GST 18%</td>
              <td style="padding: 12px; border: 1px solid #333; text-align: right;">Rs. ${gstAmount.toFixed(2)}</td>
            </tr>
            <tr style="font-weight: bold; background: #ebf1f5;">
              <td style="padding: 12px; border: 1px solid #333; text-align: center;">Total</td>
              <td style="padding: 12px; border: 1px solid #333; text-align: right;">Rs. ${totalAmount.toFixed(2)}</td>
            </tr>
          </table>

          <!-- Bank Details -->
          <h3 style="font-size: 15px; margin-bottom: 10px;">Bank Details:-</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 13px;">
            <tr>
              <td style="padding: 8px 12px; background: #f5f5f5; border: 1px solid #ccc; width: 35%;">ACCOUNT NAME</td>
              <td style="padding: 8px 12px; background: #ebf1f5; border: 1px solid #ccc; text-align: center;">${bankDetails.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #f5f5f5; border: 1px solid #ccc;">ACCOUNT NUMBER</td>
              <td style="padding: 8px 12px; background: #ebf1f5; border: 1px solid #ccc; text-align: center;">${bankDetails.accNo}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #f5f5f5; border: 1px solid #ccc;">BANK NAME</td>
              <td style="padding: 8px 12px; background: #ebf1f5; border: 1px solid #ccc; text-align: center;">${bankDetails.bank}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #f5f5f5; border: 1px solid #ccc;">BRANCH</td>
              <td style="padding: 8px 12px; background: #ebf1f5; border: 1px solid #ccc; text-align: center;">${bankDetails.branch}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #f5f5f5; border: 1px solid #ccc;">IFSC CODE</td>
              <td style="padding: 8px 12px; background: #ebf1f5; border: 1px solid #ccc; text-align: center;">${bankDetails.ifsc}</td>
            </tr>
          </table>

          <!-- Footer Area -->
          <table style="width: 100%; margin-top: 40px;">
            <tr>
              <td style="width: 50%; vertical-align: bottom;">
                ${qrSrc ? `<img src="${qrSrc}" width="100" height="100" alt="UPI QR" />` : ''}
                <p style="font-size: 10px; color: #666; margin: 5px 0 0;">Scan to pay</p>
              </td>
              <td style="width: 50%; text-align: right; vertical-align: bottom;">
                <p style="font-weight: bold; margin-bottom: 5px;">For The H Enterprises</p>
                ${signSrc ? `<img src="${signSrc}" width="100" alt="Signature" style="display: block; margin-left: auto;" />` : ''}
                <p style="font-size: 12px; margin: 5px 0 0;">Authorized Signature</p>
              </td>
            </tr>
          </table>
        </div>

        <!-- System Footer -->
        <div style="background: #fff; padding: 20px; text-align: center; border-top: 1px solid #eee; font-size: 11px; color: #444;">
          <strong style="display: block; font-size: 13px; margin-bottom: 5px;">The H Enterprises</strong>
          No:121/2 kamala Garden, Bakthavachalam Nagar, Ankaputhure, Chennai -600070<br/>
          Mobile : 9566689748 ; Email : maxirevota@gmail.com
        </div>
      </div>
    `
  })
}

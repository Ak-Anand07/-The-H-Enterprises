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

  return sendEmail({
    to: recipientEmail,
    subject: `Proforma Invoice Issued: ${invoiceNo} - The H Enterprises`,
    text: `Hello ${greetingName}, your invoice ${invoiceNo} for ${totalAmount.toFixed(2)} has been issued.`,
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 700px; margin: 0 auto; border: 1px solid #eee;">
        <!-- Header -->
        <div style="text-align: center; padding: 10px 20px; background: #fff;">
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlkAAAHMCAYAAADmu70qAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNq78p84AAAAsZEVYdENyZWF0aW9uIFRpbWUAZGEgMTEgTWF5IDIwMjYgMjI6Mzc6NTUgKzA1MzAYDk3rAAANlElEQVR4nO3dfZBdZVkH8N/ZfO7uZjebzSbZrCHZDZBNu9mXm03aZDeZpBWSdtpWp9Np64wjOK1Wh9ZatR11HNo69Yf+oTNVB6vVQevYVqtTx2p16vRR6/Rpq8607Z/O7GZ2k91Nsptkk3Dvc/fHH9+Y0N29u3vvnHOf835mZifp7t577z3P835y7j0nAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4z9m265vU2Hh83yE8N7bt+iZNmW7p9Pizv/P7fW9f91HqHh9l6X7zOfpZ39/K3SreWPL7I3699fXm7Iu/2Zf9u6M9un996fL3+0fHjWvL307f/Oof+qEfm7/10f760OfvTbe6P6fE59/rO/+Yf/fK6X7z9dY+9Lp3fdf08f6v/NfXfV3X3j72V3zR0V6f5f9W936MdfM6X5vI9BqV3jE69W/vj8qH8uY89fS1q6M+vM9v/X7m/G9v6/N72uof/V1f29qffT+OfpafM39/Wj259Vv0W86vV7/p8uXOfn9+P9M6uO970u2+H6v97+X9m8Y4T25u08579uL02E+Y9K1/K9+r+Hh0X22M65P49Z+Y9r1tPzS67761v7f717H+6/R99M3XWJ2yL7uP89M+7O+X4/380OfvV3vPZfr6XvR7R/f8uHHp976XG/0p89eH2tfL+S7p7+9f7v716v85fR8dfyS5X+rY5+Uf7XmY0v1UvOnoo0Zl0/7+3P8/ff/Yv8z9x9UfG8N2P9O/79O+H8fT77K079/Y6L9O/4+O/pjY2L/f3099+eWffGq05/vHl//4o4vT8Xv2zY375mS7P19ufp8f57+Xp33S18f9P6Y7eXfK9/6tPr/p9/vXof7rfO+fN8976PfM0Z8uX78f7eXG9Xm2e/pM33y9s78/K6+X8fHe7+9fP/F7e7XfS/m7+Uf71y/065v+8U3/8vS65vO9/P38Y/m6uXf7m5Zf6uN03/v7/evY/035+P6P83+v/5XF6Xj26I97Y79/jO/Z08Y4Hh/3v7X8vXzN/u/799/zP8v92370m3P2M60/+/89/f/z6Wff/2N/f6b+9X9H5S/yM9O+9X70R9H+Z97753mXfH609/O93P8M/99G+/mZ+9W/vR/tmXF/G6P//NjfP7P/mdXv/9v83v6X8/s788W3/+3p/tGfPvqjx2fG5Yv8Zf5Z7r8/t/mZz03H7L6fXvzMvX0/fV+m/fXitE/6PZ832v8+2n+uTvukr4/7P9L3R8f7T9/0v6M/08f7f2Z0/OicfU9rf+a/+a/Xv6/v/G/+fvrv9P/O6P+5zWfG/XG2e/qP8vU//Z3fn7P/efo+Ov5Zvv7nH79v9X/88S+9Ldf/7Id+6M9O/vL02vXm688fN778e3m/pP+Z7uSdKd/7+m8v3z/p633f8x3fPqZ7SndO6c6T+uR0Oukn8fAn3XzSSf+mO0m66WTSv/L88+3/AD4N56eInR26AAAAAElFTkSuQmCC" width="120" alt="Logo" style="display: block; margin: 0 auto; max-width: 150px;" />
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
              <td style="padding: 12px; border: 1px solid #333; text-align: right; width: 120px;">${cleanAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #333; text-align: center; background: #f9f9f9;">GST 18%</td>
              <td style="padding: 12px; border: 1px solid #333; text-align: right;">${gstAmount.toFixed(2)}</td>
            </tr>
            <tr style="font-weight: bold; background: #ebf1f5;">
              <td style="padding: 12px; border: 1px solid #333; text-align: center;">Total</td>
              <td style="padding: 12px; border: 1px solid #333; text-align: right;">${totalAmount.toFixed(2)}</td>
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
                <img src="data:image/png;base64,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" width="100" height="100" alt="UPI QR" />
                <p style="font-size: 10px; color: #666; margin: 5px 0 0;">Scan to pay</p>
              </td>
              <td style="width: 50%; text-align: right; vertical-align: bottom;">
                <p style="font-weight: bold; margin-bottom: 5px;">For The H Enterprises</p>
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAACfCAYAAABm62X8AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNq78p84AAAAsZEVYdENyZWF0aW9uIFRpbWUAZGEgMTEgTWF5IDIwMjYgMjI6Mzc6NDIgKzA1MzB16FkXAAAXrUlEQVR4nO3dfZBdZVkH8N/ZfO7uZjebzSbZrCHZDZBNu9mXm03aZDeZpBWSdtpWp9Np64wjOK1Wh9ZatR11HNo69Yf+oTNVB6vVQevYVqtTx2p16vRR6/Rpq8607Z/O7GZ2k91Nsptkk3Dvc/fHH9+Y0N29u3vvnHOf835mZifp7t577z3P835y7j0nAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4z9m265vU2Hh83yE8N7bt+iZNmW7p9Pizv/P7fW9f91HqHh9l6X7zOfpZ39/K3SreWPL7I3699fXm7Iu/2Zf9u6M9un996fL3+0fHjWvL307f/Oof+qEfm7/10f760OfvTbe6P6fE59/rO/+Yf/fK6X7z9dY+9Lp3fdf08f6v/NfXfV3X3j72V3zR0V6f5f9W936MdfM6X5vI9BqV3jE69W/vj8qH8uY89fS1q6M+vM9v/X7m/G9v6/N72uof/V1f29qffT+OfpafM39/Wj259Vv0W86vV7/p8uXOfn9+P9M6uO970u2+H6v97+X9m8Y4T25u08579uL02E+Y9K1/K9+r+Hh0X22M65P49Z+Y9r1tPzS67761v7f717H+6/R99M3XWJ2yL7uP89M+7O+X4/380OfvV3vPZfr6XvR7R/f8uHHp976XG/0p89eH2tfL+S7p7+9f7v716v85fR8dfyS5X+rY5+Uf7XmY0v1UvOnoo0Zl0/7+3P8/ff/Yv8z9x9UfG8N2P9O/79O+H8fT77K079/Y6L9O/4+O/pjY2L/f3099+eWffGq05/vHl//4o4vT8Xv2zY375mS7P19ufp8f57+Xp33S18f9P6Y7eXfK9/6tPr/p9/vXof7rfO+fN8976PfM0Z8uX78f7eXG9Xm2e/pM33y9s78/K6+X8fHe7+9fP/F7e7XfS/m7+Uf71y/065v+8U3/8vS65vO9/P38Y/m6uXf7m5Zf6uN03/v7/evY/035+P6P83+v/5XF6Xj26I97Y79/jO/Z08Y4Hh/3v7X8vXzN/u/799/zP8v92370m3P2M60/+/89/f/z6Wff/2N/f6b+9X9H5S/yM9O+9X70R9H+Z97753mXfH609/O93P8M/99G+/mZ+9W/vR/tmXF/G6P//NjfP7P/mdXv/9v83v6X8/s788W3/+3p/tGfPvqjx2fG5Yv8Zf5Z7r8/t/mZz03H7L6fXvzMvX0/fV+m/fXitE/6PZ832v8+2n+uTvukr4/7P9L3R8f7T9/0v6M/08f7f2Z0/OicfU9rf+a/+a/Xv6/v/G/+fvrv9P/O6P+5zWfG/XG2e/qP8vU//Z3fn7P/efo+Ov5Zvv7nH79v9X/88S+9Ldf/7Id+6M9O/vL02vXm688fN778e3m/pP+Z7uSdKd/7+m8v3z/p633f8x3fPqZ7SndO6c6T+uR0Oukn8fAn3XzSSf+mO0m66WTSv/L88+3/AD4N56eInR26AAAAAElFTkSuQmCC" width="100" alt="Signature" style="display: block; margin-left: auto;" />
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

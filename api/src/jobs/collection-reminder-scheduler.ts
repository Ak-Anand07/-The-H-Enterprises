import type { Knex } from 'knex'

import type { Application } from '../declarations'
import { logger } from '../logger'
import { sendCollectionReminderForCompany } from '../services/collection-reminders/collection-reminders'

type ReminderHistoryRecord = {
  companyId: number
  runDateKey: string
  reminderStage: string
  recipientEmail: string
  invoiceCount: number
  totalOutstanding: string
  notificationStatus: 'sent' | 'mocked' | 'skipped' | 'failed'
  provider?: 'gmail' | 'resend' | 'mock'
  messageId?: string
  notificationMessage: string
  createdAt: string
}

type SchedulerConfig = {
  enabled: boolean
  intervalMs: number
  cooldownMs: number
  runOnStartup: boolean
  overdueOnly: boolean
  timezone: string
  dailyHour: number | null
  dailyMinute: number
  stageDays: number[]
}

const AUTOMATED_LOG_TABLE = 'collection_reminder_logs'

const parseBoolean = (value: string | undefined, fallback = false) => {
  if (value == null) {
    return fallback
  }

  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase())
}

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const parseBoundedInteger = (
  value: string | undefined,
  fallback: number,
  min: number,
  max: number
) => {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : fallback
}

const parseStageDays = (value: string | undefined) => {
  const rawStages = (value ?? '1,3,7')
    .split(',')
    .map((item) => Number.parseInt(item.trim(), 10))
    .filter((item) => Number.isFinite(item) && item >= 0)

  return [...new Set(rawStages)].sort((left, right) => left - right)
}

const getLocalDateParts = (timezone: string, date = new Date()) => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  const parts = formatter.formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''

  return {
    dateKey: `${get('year')}-${get('month')}-${get('day')}`,
    hour: Number.parseInt(get('hour'), 10),
    minute: Number.parseInt(get('minute'), 10)
  }
}

const getSchedulerConfig = (): SchedulerConfig => ({
  enabled: parseBoolean(process.env.AUTO_COLLECTION_REMINDERS_ENABLED, false),
  intervalMs: parsePositiveInteger(process.env.AUTO_COLLECTION_REMINDERS_INTERVAL_MINUTES, 60) * 60 * 1000,
  cooldownMs: parsePositiveInteger(process.env.AUTO_COLLECTION_REMINDERS_COOLDOWN_HOURS, 24) * 60 * 60 * 1000,
  runOnStartup: parseBoolean(process.env.AUTO_COLLECTION_REMINDERS_RUN_ON_STARTUP, false),
  overdueOnly: parseBoolean(process.env.AUTO_COLLECTION_REMINDERS_OVERDUE_ONLY, true),
  timezone: process.env.AUTO_COLLECTION_REMINDERS_TIMEZONE?.trim() || 'Asia/Kolkata',
  dailyHour:
    process.env.AUTO_COLLECTION_REMINDERS_DAILY_HOUR == null
      ? null
      : parseBoundedInteger(process.env.AUTO_COLLECTION_REMINDERS_DAILY_HOUR, 9, 0, 23),
  dailyMinute: parseBoundedInteger(process.env.AUTO_COLLECTION_REMINDERS_DAILY_MINUTE, 0, 0, 59),
  stageDays: parseStageDays(process.env.AUTO_COLLECTION_REMINDERS_STAGE_DAYS)
})

const ensureReminderLogTable = async (db: Knex) => {
  const exists = await db.schema.hasTable(AUTOMATED_LOG_TABLE)

  if (!exists) {
    await db.schema.createTable(AUTOMATED_LOG_TABLE, (table) => {
      table.increments('id')
      table.integer('companyId').notNullable().index()
      table.string('runDateKey', 10).notNullable().index()
      table.string('reminderStage', 32).notNullable().defaultTo('generic').index()
      table.string('recipientEmail', 120).notNullable()
      table.integer('invoiceCount').notNullable().defaultTo(0)
      table.string('totalOutstanding', 64).notNullable().defaultTo('INR 0.00')
      table.string('notificationStatus', 16).notNullable()
      table.string('provider', 16)
      table.string('messageId', 255)
      table.string('notificationMessage', 255).notNullable()
      table.timestamp('createdAt').notNullable()
    })

    return
  }

  const hasRunDateKey = await db.schema.hasColumn(AUTOMATED_LOG_TABLE, 'runDateKey')
  const hasReminderStage = await db.schema.hasColumn(AUTOMATED_LOG_TABLE, 'reminderStage')

  if (!hasRunDateKey) {
    await db.schema.alterTable(AUTOMATED_LOG_TABLE, (table) => {
      table.string('runDateKey', 10).notNullable().defaultTo('1970-01-01').index()
    })
  }

  if (!hasReminderStage) {
    await db.schema.alterTable(AUTOMATED_LOG_TABLE, (table) => {
      table.string('reminderStage', 32).notNullable().defaultTo('generic').index()
    })
  }
}

const wasReminderSentRecently = async (
  db: Knex,
  companyId: number,
  cooldownMs: number,
  runDateKey: string,
  useDailySchedule: boolean
) => {
  if (useDailySchedule) {
    const sentToday = await db(AUTOMATED_LOG_TABLE)
      .where({ companyId, runDateKey })
      .first('id')

    return Boolean(sentToday)
  }

  const threshold = new Date(Date.now() - cooldownMs).toISOString()
  const recent = await db(AUTOMATED_LOG_TABLE)
    .where({ companyId })
    .whereIn('notificationStatus', ['sent', 'mocked'])
    .andWhere('createdAt', '>=', threshold)
    .first('id')

  return Boolean(recent)
}

const recordReminderRun = async (db: Knex, record: ReminderHistoryRecord) => {
  await db(AUTOMATED_LOG_TABLE).insert(record)
}

const getDaysOverdue = (dueDate: string, runDateKey: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return null
  }

  const dueTime = Date.parse(`${dueDate}T00:00:00.000Z`)
  const runTime = Date.parse(`${runDateKey}T00:00:00.000Z`)

  if (!Number.isFinite(dueTime) || !Number.isFinite(runTime)) {
    return null
  }

  return Math.floor((runTime - dueTime) / (24 * 60 * 60 * 1000))
}

const getNextReminderStage = async (
  db: Knex,
  companyId: number,
  runDateKey: string,
  stageDays: number[]
) => {
  const invoices = await db('invoices')
    .where({ companyId })
    .whereIn('status', ['Pending', 'Overdue'])
    .whereNotNull('dueDate')
    .select('dueDate')

  let highestEligibleStage: number | null = null

  for (const invoice of invoices) {
    const overdueDays = getDaysOverdue(String(invoice.dueDate ?? ''), runDateKey)

    if (overdueDays == null || overdueDays < 0) {
      continue
    }

    const eligibleStage = [...stageDays]
      .sort((left, right) => right - left)
      .find((stageDay) => overdueDays >= stageDay)

    if (eligibleStage == null) {
      continue
    }

    if (highestEligibleStage == null || eligibleStage > highestEligibleStage) {
      highestEligibleStage = eligibleStage
    }
  }

  if (highestEligibleStage == null) {
    return null
  }

  for (const stageDay of [...stageDays].sort((left, right) => right - left)) {
    if (stageDay > highestEligibleStage) {
      continue
    }

    const reminderStage = `overdue-${stageDay}d`
    const existing = await db(AUTOMATED_LOG_TABLE)
      .where({ companyId, reminderStage })
      .first('id')

    if (!existing) {
      return reminderStage
    }
  }

  return null
}

const runAutomatedCollectionReminders = async (app: Application, config: SchedulerConfig) => {
  const db = app.get('mysqlClient') as Knex
  await ensureReminderLogTable(db)

  const runDateKey = getLocalDateParts(config.timezone).dateKey

  const candidates = await db('companies')
    .join('invoices', 'companies.id', 'invoices.companyId')
    .where('companies.status', 'Active')
    .whereNotNull('companies.contactEmail')
    .where('companies.contactEmail', '<>', '')
    .whereIn('invoices.status', ['Pending', 'Overdue'])
    .distinct('companies.id')
    .orderBy('companies.id', 'asc')

  let sentCount = 0

  for (const candidate of candidates) {
    const companyId = Number(candidate.id)
    const reminderStage =
      config.overdueOnly && config.stageDays.length > 0
        ? (await getNextReminderStage(db, companyId, runDateKey, config.stageDays)) ?? 'generic'
        : 'generic'

    if (!Number.isInteger(companyId) || companyId <= 0) {
      continue
    }

    if (config.overdueOnly && config.stageDays.length > 0 && !reminderStage) {
      continue
    }

    if (
      await wasReminderSentRecently(
        db,
        companyId,
        config.cooldownMs,
        runDateKey,
        config.dailyHour != null
      )
    ) {
      continue
    }

    const result = await sendCollectionReminderForCompany(app, companyId, {
      overdueOnly: config.overdueOnly
    })

    await recordReminderRun(db, {
      companyId: result.companyId,
      runDateKey,
      reminderStage,
      recipientEmail: result.recipientEmail || '',
      invoiceCount: result.invoiceCount,
      totalOutstanding: result.totalOutstanding,
      notificationStatus: result.notificationStatus,
      provider: result.provider,
      messageId: result.messageId,
      notificationMessage: result.notificationMessage,
      createdAt: new Date().toISOString()
    })

    if (result.notificationStatus === 'sent' || result.notificationStatus === 'mocked') {
      sentCount += 1
    }
  }

  if (sentCount > 0) {
    logger.info('Automated collection reminders processed successfully for %d companie(s).', sentCount)
  }
}

export const startCollectionReminderScheduler = async (app: Application) => {
  const config = getSchedulerConfig()

  if (!config.enabled) {
    logger.info('Automated collection reminder scheduler is disabled.')
    return
  }

  const db = app.get('mysqlClient') as Knex
  await ensureReminderLogTable(db)

  let isRunning = false
  let lastDailyRunDateKey: string | null = null

  const runIfIdle = async () => {
    if (isRunning) {
      logger.info('Skipping automated collection reminder run because a previous run is still in progress.')
      return
    }

    if (config.dailyHour != null) {
      const now = getLocalDateParts(config.timezone)
      const isPastRunTime =
        now.hour > config.dailyHour ||
        (now.hour === config.dailyHour && now.minute >= config.dailyMinute)

      if (!isPastRunTime || lastDailyRunDateKey === now.dateKey) {
        return
      }

      lastDailyRunDateKey = now.dateKey
    }

    isRunning = true

    try {
      await runAutomatedCollectionReminders(app, config)
    } catch (error: any) {
      logger.error(
        'Automated collection reminder scheduler failed: %s',
        error?.message || 'Unknown error'
      )
    } finally {
      isRunning = false
    }
  }

  if (config.runOnStartup) {
    void runIfIdle()
  }

  if (config.dailyHour != null) {
    setInterval(() => {
      void runIfIdle()
    }, 60 * 1000)

    logger.info(
      'Automated collection reminder scheduler started in daily mode. Time=%s %02d:%02d, overdueOnly=%s.',
      config.timezone,
      config.dailyHour,
      config.dailyMinute,
      config.overdueOnly ? 'true' : 'false'
    )

    return
  }

  setInterval(() => {
    void runIfIdle()
  }, config.intervalMs)

  logger.info(
    'Automated collection reminder scheduler started in interval mode. Interval=%d minutes, cooldown=%d hours, overdueOnly=%s.',
    Math.round(config.intervalMs / 60000),
    Math.round(config.cooldownMs / 3600000),
    config.overdueOnly ? 'true' : 'false'
  )
}

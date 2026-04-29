import type { Knex } from 'knex'

const toCalendarDateKey = (value: Date) => {
  const year = value.getUTCFullYear()
  const month = String(value.getUTCMonth() + 1).padStart(2, '0')
  const day = String(value.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const deriveDueDate = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) {
    return null
  }

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  parsed.setUTCDate(parsed.getUTCDate() + 14)

  return toCalendarDateKey(parsed)
}

export async function up(knex: Knex): Promise<void> {
  const hasDueDate = await knex.schema.hasColumn('invoices', 'dueDate')

  if (!hasDueDate) {
    await knex.schema.alterTable('invoices', (table) => {
      table.string('dueDate')
    })
  }

  const invoices = await knex('invoices').select('id', 'date', 'dueDate')

  for (const invoice of invoices) {
    if (invoice.dueDate) {
      continue
    }

    const dueDate = deriveDueDate(invoice.date)

    if (!dueDate) {
      continue
    }

    await knex('invoices').where({ id: invoice.id }).update({ dueDate })
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasDueDate = await knex.schema.hasColumn('invoices', 'dueDate')

  if (hasDueDate) {
    await knex.schema.alterTable('invoices', (table) => {
      table.dropColumn('dueDate')
    })
  }
}

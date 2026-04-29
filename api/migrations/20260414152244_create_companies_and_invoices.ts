import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('companies', (table) => {
    table.increments('id')
    table.string('name')
    table.string('status')
    table.string('createdAt')
  })

  await knex.schema.createTable('invoices', (table) => {
    table.increments('id')
    table.integer('companyId').unsigned().references('id').inTable('companies')
    table.string('companyName')
    table.string('companyInitial')
    table.string('date')
    table.string('amount') // E.g., '₹ 12,450.00'
    table.string('status') // 'Cleared', 'Pending', etc.
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('invoices')
  await knex.schema.dropTable('companies')
}

import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('companies', (table) => {
    table.string('gstNumber')
    table.string('invoiceType')
    table.string('address')
    table.string('city')
    table.string('contactName')
    table.string('contactEmail')
    table.string('contactPhone')
    table.string('margin')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('companies', (table) => {
    table.dropColumns('gstNumber', 'invoiceType', 'address', 'city', 'contactName', 'contactEmail', 'contactPhone', 'margin')
  })
}

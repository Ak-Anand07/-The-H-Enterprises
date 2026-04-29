import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  const hasGoogleId = await knex.schema.hasColumn('users', 'googleId')
  const hasAvatar = await knex.schema.hasColumn('users', 'avatar')

  if (!hasGoogleId || !hasAvatar) {
    await knex.schema.alterTable('users', (table) => {
      if (!hasGoogleId) {
        table.string('googleId').unique()
      }

      if (!hasAvatar) {
        table.string('avatar')
      }
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasGoogleId = await knex.schema.hasColumn('users', 'googleId')
  const hasAvatar = await knex.schema.hasColumn('users', 'avatar')

  if (hasGoogleId || hasAvatar) {
    await knex.schema.alterTable('users', (table) => {
      if (hasAvatar) {
        table.dropColumn('avatar')
      }

      if (hasGoogleId) {
        table.dropColumn('googleId')
      }
    })
  }
}

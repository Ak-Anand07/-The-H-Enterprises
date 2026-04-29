import knex from 'knex'
import type { Knex } from 'knex'
import type { Application } from './declarations'

declare module './declarations' {
  interface Configuration {
    mysqlClient: Knex
  }
}

export const mysql = (app: Application) => {
  const config = app.get('mysql')
  
  const db = knex({
    ...config,
    connection: {
      ...config.connection,
      port: Number(config.connection.port || 3306),
      ssl: config.connection.ssl || false
    },
    pool: {
      min: 0,
      max: 2 // Keep it very low for Aiven Free Tier
    }
  })

  app.set('mysqlClient', db)
}

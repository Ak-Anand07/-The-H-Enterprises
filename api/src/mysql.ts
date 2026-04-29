// For more information about this file see https://dove.feathersjs.com/guides/cli/databases.html
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
  
  // If SSL is required (common for Aiven/Cloud DBs), add the necessary Knex configuration
  if (process.env.MYSQL_SSL === 'true') {
    if (config && config.connection) {
      (config.connection as any).ssl = {
        rejectUnauthorized: false // Set to false to allow Aiven's self-signed CA without manual certificate upload
      }
    }
  }

  const db = knex(config!)
  app.set('mysqlClient', db)
}

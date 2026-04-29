import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const envFilePath = path.resolve(__dirname, '../.env')

if (typeof process.loadEnvFile === 'function' && fs.existsSync(envFilePath)) {
  process.loadEnvFile(envFilePath)
}

// Load the app only after environment variables are available to Feathers configuration.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { app } = require('./app')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { logger } = require('./logger')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { startCollectionReminderScheduler } = require('./jobs/collection-reminder-scheduler')

const port = app.get('port')
const host = app.get('host')

process.on('unhandledRejection', reason => logger.error('Unhandled Rejection %O', reason))

app.listen(port).then(() => {
  logger.info(`Feathers app listening on http://${host}:${port}`)
  void startCollectionReminderScheduler(app)
})

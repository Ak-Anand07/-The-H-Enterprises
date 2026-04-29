// For more information about this file see https://dove.feathersjs.com/guides/cli/log-error.html
import type { HookContext, NextFunction } from '../declarations'
import { logger } from '../logger'

export const logError = async (context: HookContext, next: NextFunction) => {
  try {
    await next()
  } catch (error: any) {
    const statusCode = typeof error?.code === 'number' ? error.code : 500
    const message = error?.message || 'Unknown error'
    const isClientError = statusCode >= 400 && statusCode < 500
    const isTestEnv = process.env.NODE_ENV === 'test'

    if (!(isTestEnv && isClientError)) {
      if (isClientError) {
        logger.warn('%s: %s', error.name || 'ClientError', message)
      } else {
        logger.error(error?.stack || `${error?.name || 'Error'}: ${message}`)
      }

      if (error?.data) {
        logger.error('Data: %O', error.data)
      }
    }

    throw error
  }
}

import type { Params } from '@feathersjs/feathers'

class HealthService {
  async find(_params?: Params) {
    return {
      status: 'ok',
      service: 'api',
      timestamp: new Date().toISOString()
    }
  }
}

export const healthService = new HealthService()

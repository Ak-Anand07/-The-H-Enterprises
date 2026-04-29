import { hooks as schemaHooks } from '@feathersjs/schema'
import { hooks as authHooks } from '@feathersjs/authentication'

import {
  companyDataValidator,
  companyPatchValidator,
  companyQueryValidator,
  companyResolver,
  companyExternalResolver,
  companyDataResolver,
  companyPatchResolver,
  companyQueryResolver
} from './companies.schema'
import type { Application } from '../../declarations'
import { CompanyService, getOptions } from './companies.class'
import {
  normalizeCompanyData,
  preventCompanyDeletionWhenInUse,
  syncInvoiceCompanySnapshot,
  triggerCompanyNotification
} from './companies.hooks'

export const company = (app: Application) => {
  app.use('companies', new CompanyService(getOptions(app)), {
    methods: ['find', 'get', 'create', 'update', 'patch', 'remove'],
    events: []
  })

  app.service('companies').hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(companyExternalResolver),
        schemaHooks.resolveResult(companyResolver)
      ],
      find: [authHooks.authenticate('jwt')],
      get: [authHooks.authenticate('jwt')],
      create: [authHooks.authenticate('jwt')],
      update: [authHooks.authenticate('jwt')],
      patch: [authHooks.authenticate('jwt')],
      remove: [authHooks.authenticate('jwt')]
    },
    before: {
      all: [
        schemaHooks.validateQuery(companyQueryValidator),
        schemaHooks.resolveQuery(companyQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(companyDataValidator),
        schemaHooks.resolveData(companyDataResolver),
        normalizeCompanyData
      ],
      update: [
        schemaHooks.validateData(companyDataValidator),
        schemaHooks.resolveData(companyDataResolver),
        normalizeCompanyData
      ],
      patch: [
        schemaHooks.validateData(companyPatchValidator),
        schemaHooks.resolveData(companyPatchResolver),
        normalizeCompanyData
      ],
      remove: [preventCompanyDeletionWhenInUse]
    },
    after: {
      all: [],
      create: [triggerCompanyNotification],
      update: [syncInvoiceCompanySnapshot],
      patch: [syncInvoiceCompanySnapshot, triggerCompanyNotification]
    },
    error: {
      all: []
    }
  })
}

declare module '../../declarations' {
  interface ServiceTypes {
    companies: CompanyService
  }
}

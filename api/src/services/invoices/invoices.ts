import { hooks as schemaHooks } from '@feathersjs/schema'
import { hooks as authHooks } from '@feathersjs/authentication'

import {
  invoiceDataValidator,
  invoicePatchValidator,
  invoiceQueryValidator,
  invoiceResolver,
  invoiceExternalResolver,
  invoiceDataResolver,
  invoicePatchResolver,
  invoiceQueryResolver
} from './invoices.schema'
import type { Application } from '../../declarations'
import { InvoiceService, getOptions } from './invoices.class'
import { prepareInvoiceData, notifyCompanyOfInvoice } from './invoices.hooks'

export const invoice = (app: Application) => {
  app.use('invoices', new InvoiceService(getOptions(app)), {
    methods: ['find', 'get', 'create', 'update', 'patch', 'remove'],
    events: []
  })

  app.service('invoices').hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(invoiceExternalResolver),
        schemaHooks.resolveResult(invoiceResolver)
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
        schemaHooks.validateQuery(invoiceQueryValidator),
        schemaHooks.resolveQuery(invoiceQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(invoiceDataValidator),
        schemaHooks.resolveData(invoiceDataResolver),
        prepareInvoiceData
      ],
      update: [
        schemaHooks.validateData(invoiceDataValidator),
        schemaHooks.resolveData(invoiceDataResolver),
        prepareInvoiceData
      ],
      patch: [
        schemaHooks.validateData(invoicePatchValidator),
        schemaHooks.resolveData(invoicePatchResolver),
        prepareInvoiceData
      ],
      remove: []
    },
    after: {
      all: [],
      create: [notifyCompanyOfInvoice]
    },
    error: {
      all: []
    }
  })
}

declare module '../../declarations' {
  interface ServiceTypes {
    invoices: InvoiceService
  }
}

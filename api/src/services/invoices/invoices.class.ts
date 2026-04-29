import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { Invoice, InvoiceData, InvoicePatch, InvoiceQuery } from './invoices.schema'

export type { Invoice, InvoiceData, InvoicePatch, InvoiceQuery }

export interface InvoiceParams extends KnexAdapterParams<InvoiceQuery> {}

export class InvoiceService<ServiceParams extends Params = InvoiceParams> extends KnexService<
  Invoice,
  InvoiceData,
  InvoiceParams,
  InvoicePatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mysqlClient'),
    name: 'invoices'
  }
}

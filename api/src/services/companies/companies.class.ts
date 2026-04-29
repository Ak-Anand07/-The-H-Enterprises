import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { Company, CompanyData, CompanyPatch, CompanyQuery } from './companies.schema'

export type { Company, CompanyData, CompanyPatch, CompanyQuery }

export interface CompanyParams extends KnexAdapterParams<CompanyQuery> {}

export class CompanyService<ServiceParams extends Params = CompanyParams> extends KnexService<
  Company,
  CompanyData,
  CompanyParams,
  CompanyPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mysqlClient'),
    name: 'companies'
  }
}

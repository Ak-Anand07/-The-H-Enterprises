// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator as getTypeboxValidator } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'

// 1. The main Company object schema
export const companySchema = Type.Object(
  {
    id: Type.Number(),
    name: Type.String({ minLength: 2, maxLength: 120 }),
    status: Type.Optional(Type.Union([Type.Literal('Active'), Type.Literal('Inactive')])),
    createdAt: Type.Optional(Type.String()),
    gstNumber: Type.Optional(Type.String({ minLength: 0, maxLength: 15 })),
    invoiceType: Type.Optional(
      Type.Union([Type.Literal('Final Invoice'), Type.Literal('Proforma Invoice')])
    ),
    address: Type.Optional(Type.String({ maxLength: 240 })),
    city: Type.Optional(Type.String({ maxLength: 120 })),
    contactName: Type.Optional(Type.String({ maxLength: 120 })),
    contactEmail: Type.Optional(Type.String({ maxLength: 120 })),
    contactPhone: Type.Optional(Type.String({ maxLength: 40 })),
    margin: Type.Optional(Type.String({ maxLength: 10 })),
    notificationStatus: Type.Optional(
      Type.Union([Type.Literal('sent'), Type.Literal('mocked'), Type.Literal('skipped'), Type.Literal('failed')])
    ),
    notificationMessage: Type.Optional(Type.String({ maxLength: 255 }))
  },
  { $id: 'Company', additionalProperties: false }
)
export type Company = Static<typeof companySchema>
export const companyValidator = getTypeboxValidator(companySchema, dataValidator)
export const companyResolver = resolve<Company, HookContext>({
  properties: {}
})

export const companyExternalResolver = resolve<Company, HookContext>({
  properties: {}
})

// 2. Data for creating a new Company
export const companyDataSchema = Type.Object(
  {
    name: Type.String({ minLength: 2, maxLength: 120 }),
    status: Type.Optional(Type.Union([Type.Literal('Active'), Type.Literal('Inactive')])),
    createdAt: Type.Optional(Type.String()),
    gstNumber: Type.Optional(Type.String({ minLength: 0, maxLength: 15 })),
    invoiceType: Type.Optional(
      Type.Union([Type.Literal('Final Invoice'), Type.Literal('Proforma Invoice')])
    ),
    address: Type.Optional(Type.String({ maxLength: 240 })),
    city: Type.Optional(Type.String({ maxLength: 120 })),
    contactName: Type.Optional(Type.String({ maxLength: 120 })),
    contactEmail: Type.Optional(Type.String({ maxLength: 120 })),
    contactPhone: Type.Optional(Type.String({ maxLength: 40 })),
    margin: Type.Optional(Type.String({ maxLength: 10 })),
    sendNotification: Type.Optional(Type.Boolean())
  },
  { $id: 'CompanyData', additionalProperties: false }
)
export type CompanyData = Static<typeof companyDataSchema>
export const companyDataValidator = getTypeboxValidator(companyDataSchema, dataValidator)
export const companyDataResolver = resolve<CompanyData, HookContext>({
  properties: {}
})

// 3. Data for patching a Company
export const companyPatchSchema = Type.Partial(companyDataSchema, {
  $id: 'CompanyPatch',
  additionalProperties: false
})
export type CompanyPatch = Static<typeof companyPatchSchema>
export const companyPatchValidator = getTypeboxValidator(companyPatchSchema, dataValidator)
export const companyPatchResolver = resolve<CompanyPatch, HookContext>({
  properties: {}
})

// 4. Schema for allowed query parameters
export const companyQuerySchema = Type.Object({
  id: Type.Optional(Type.Number()),
  name: Type.Optional(Type.String()),
  status: Type.Optional(Type.String()),
  createdAt: Type.Optional(Type.String()),
  gstNumber: Type.Optional(Type.String()),
  invoiceType: Type.Optional(Type.String()),
  address: Type.Optional(Type.String()),
  city: Type.Optional(Type.String()),
  contactName: Type.Optional(Type.String()),
  contactEmail: Type.Optional(Type.String()),
  contactPhone: Type.Optional(Type.String()),
  margin: Type.Optional(Type.String()),
  $limit: Type.Optional(Type.Number()),
  $skip: Type.Optional(Type.Number()),
  $sort: Type.Optional(Type.Object({}, { additionalProperties: Type.Number() })),
  $select: Type.Optional(Type.Array(Type.String()))
}, { additionalProperties: false })

export type CompanyQuery = Static<typeof companyQuerySchema>
export const companyQueryValidator = getTypeboxValidator(companyQuerySchema, queryValidator)
export const companyQueryResolver = resolve<CompanyQuery, HookContext>({
  properties: {}
})

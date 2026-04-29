// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator as getTypeboxValidator } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'

export const invoiceSchema = Type.Object(
  {
    id: Type.Number(),
    invoiceNo: Type.Optional(Type.String({ minLength: 1, maxLength: 32 })),
    companyId: Type.Number(),
    companyName: Type.String({ minLength: 2, maxLength: 120 }),
    companyInitial: Type.String({ minLength: 1, maxLength: 4 }),
    date: Type.String({ minLength: 3, maxLength: 64 }),
    dueDate: Type.Optional(Type.String({ minLength: 10, maxLength: 10 })),
    amount: Type.String({ minLength: 1, maxLength: 32 }),
    status: Type.Union([
      Type.Literal('Pending'),
      Type.Literal('Cleared'),
      Type.Literal('Overdue')
    ])
  },
  { $id: 'Invoice', additionalProperties: false }
)
export type Invoice = Static<typeof invoiceSchema>
export const invoiceValidator = getTypeboxValidator(invoiceSchema, dataValidator)
export const invoiceResolver = resolve<Invoice, HookContext>({
  properties: {}
})

export const invoiceExternalResolver = resolve<Invoice, HookContext>({
  properties: {}
})

export const invoiceDataSchema = Type.Object(
  {
    invoiceNo: Type.Optional(Type.String({ minLength: 0, maxLength: 32 })),
    companyId: Type.Number(),
    companyName: Type.Optional(Type.String({ minLength: 0, maxLength: 120 })),
    companyInitial: Type.Optional(Type.String({ minLength: 0, maxLength: 4 })),
    date: Type.String({ minLength: 1, maxLength: 64 }),
    dueDate: Type.Optional(Type.String({ minLength: 10, maxLength: 10 })),
    amount: Type.String({ minLength: 1, maxLength: 32 }),
    status: Type.Optional(
      Type.Union([
        Type.Literal('Pending'),
        Type.Literal('Cleared'),
        Type.Literal('Overdue')
      ])
    )
  },
  { $id: 'InvoiceData', additionalProperties: false }
)
export type InvoiceData = Static<typeof invoiceDataSchema>
export const invoiceDataValidator = getTypeboxValidator(invoiceDataSchema, dataValidator)
export const invoiceDataResolver = resolve<InvoiceData, HookContext>({
  properties: {}
})

export const invoicePatchSchema = Type.Partial(invoiceDataSchema, {
  $id: 'InvoicePatch',
  additionalProperties: false
})
export type InvoicePatch = Static<typeof invoicePatchSchema>
export const invoicePatchValidator = getTypeboxValidator(invoicePatchSchema, dataValidator)
export const invoicePatchResolver = resolve<InvoicePatch, HookContext>({
  properties: {}
})

export const invoiceQuerySchema = Type.Object({
  id: Type.Optional(Type.Number()),
  invoiceNo: Type.Optional(Type.String()),
  companyId: Type.Optional(Type.Number()),
  companyName: Type.Optional(Type.String()),
  companyInitial: Type.Optional(Type.String()),
  date: Type.Optional(Type.String()),
  dueDate: Type.Optional(Type.String()),
  amount: Type.Optional(Type.String()),
  status: Type.Optional(Type.String()),
  $limit: Type.Optional(Type.Number()),
  $skip: Type.Optional(Type.Number()),
  $sort: Type.Optional(Type.Object({}, { additionalProperties: Type.Number() })),
  $select: Type.Optional(Type.Array(Type.String()))
}, { additionalProperties: false })

export type InvoiceQuery = Static<typeof invoiceQuerySchema>
export const invoiceQueryValidator = getTypeboxValidator(invoiceQuerySchema, queryValidator)
export const invoiceQueryResolver = resolve<InvoiceQuery, HookContext>({
  properties: {}
})

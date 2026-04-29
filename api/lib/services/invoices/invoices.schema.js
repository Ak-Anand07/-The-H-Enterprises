"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceQueryResolver = exports.invoiceQueryValidator = exports.invoiceQuerySchema = exports.invoicePatchResolver = exports.invoicePatchValidator = exports.invoicePatchSchema = exports.invoiceDataResolver = exports.invoiceDataValidator = exports.invoiceDataSchema = exports.invoiceExternalResolver = exports.invoiceResolver = exports.invoiceValidator = exports.invoiceSchema = void 0;
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
const schema_1 = require("@feathersjs/schema");
const typebox_1 = require("@feathersjs/typebox");
const validators_1 = require("../../validators");
exports.invoiceSchema = typebox_1.Type.Object({
    id: typebox_1.Type.Number(),
    invoiceNo: typebox_1.Type.Optional(typebox_1.Type.String()),
    companyId: typebox_1.Type.Number(),
    companyName: typebox_1.Type.String(),
    companyInitial: typebox_1.Type.String(),
    date: typebox_1.Type.String(),
    amount: typebox_1.Type.String(),
    status: typebox_1.Type.String()
}, { $id: 'Invoice', additionalProperties: false });
exports.invoiceValidator = (0, typebox_1.getValidator)(exports.invoiceSchema, validators_1.dataValidator);
exports.invoiceResolver = (0, schema_1.resolve)({
    properties: {}
});
exports.invoiceExternalResolver = (0, schema_1.resolve)({
    properties: {}
});
exports.invoiceDataSchema = typebox_1.Type.Object({
    invoiceNo: typebox_1.Type.Optional(typebox_1.Type.String()),
    companyId: typebox_1.Type.Number(),
    companyName: typebox_1.Type.String(),
    companyInitial: typebox_1.Type.String(),
    date: typebox_1.Type.String(),
    amount: typebox_1.Type.String(),
    status: typebox_1.Type.String()
}, { $id: 'InvoiceData', additionalProperties: false });
exports.invoiceDataValidator = (0, typebox_1.getValidator)(exports.invoiceDataSchema, validators_1.dataValidator);
exports.invoiceDataResolver = (0, schema_1.resolve)({
    properties: {}
});
exports.invoicePatchSchema = typebox_1.Type.Partial(exports.invoiceDataSchema, {
    $id: 'InvoicePatch',
    additionalProperties: false
});
exports.invoicePatchValidator = (0, typebox_1.getValidator)(exports.invoicePatchSchema, validators_1.dataValidator);
exports.invoicePatchResolver = (0, schema_1.resolve)({
    properties: {}
});
exports.invoiceQuerySchema = typebox_1.Type.Object({
    id: typebox_1.Type.Optional(typebox_1.Type.Number()),
    invoiceNo: typebox_1.Type.Optional(typebox_1.Type.String()),
    companyId: typebox_1.Type.Optional(typebox_1.Type.Number()),
    companyName: typebox_1.Type.Optional(typebox_1.Type.String()),
    companyInitial: typebox_1.Type.Optional(typebox_1.Type.String()),
    date: typebox_1.Type.Optional(typebox_1.Type.String()),
    amount: typebox_1.Type.Optional(typebox_1.Type.String()),
    status: typebox_1.Type.Optional(typebox_1.Type.String()),
    $limit: typebox_1.Type.Optional(typebox_1.Type.Number()),
    $skip: typebox_1.Type.Optional(typebox_1.Type.Number()),
    $sort: typebox_1.Type.Optional(typebox_1.Type.Object({}, { additionalProperties: typebox_1.Type.Number() })),
    $select: typebox_1.Type.Optional(typebox_1.Type.Array(typebox_1.Type.String()))
}, { additionalProperties: false });
exports.invoiceQueryValidator = (0, typebox_1.getValidator)(exports.invoiceQuerySchema, validators_1.queryValidator);
exports.invoiceQueryResolver = (0, schema_1.resolve)({
    properties: {}
});
//# sourceMappingURL=invoices.schema.js.map
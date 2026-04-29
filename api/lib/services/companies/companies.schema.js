"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyQueryResolver = exports.companyQueryValidator = exports.companyQuerySchema = exports.companyPatchResolver = exports.companyPatchValidator = exports.companyPatchSchema = exports.companyDataResolver = exports.companyDataValidator = exports.companyDataSchema = exports.companyExternalResolver = exports.companyResolver = exports.companyValidator = exports.companySchema = void 0;
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
const schema_1 = require("@feathersjs/schema");
const typebox_1 = require("@feathersjs/typebox");
const validators_1 = require("../../validators");
// 1. The main Company object schema
exports.companySchema = typebox_1.Type.Object({
    id: typebox_1.Type.Number(),
    name: typebox_1.Type.String(),
    status: typebox_1.Type.Optional(typebox_1.Type.String()),
    createdAt: typebox_1.Type.Optional(typebox_1.Type.String()),
    gstNumber: typebox_1.Type.Optional(typebox_1.Type.String()),
    invoiceType: typebox_1.Type.Optional(typebox_1.Type.String()),
    address: typebox_1.Type.Optional(typebox_1.Type.String()),
    city: typebox_1.Type.Optional(typebox_1.Type.String()),
    contactName: typebox_1.Type.Optional(typebox_1.Type.String()),
    contactEmail: typebox_1.Type.Optional(typebox_1.Type.String()),
    contactPhone: typebox_1.Type.Optional(typebox_1.Type.String()),
    margin: typebox_1.Type.Optional(typebox_1.Type.String()),
}, { $id: 'Company', additionalProperties: false });
exports.companyValidator = (0, typebox_1.getValidator)(exports.companySchema, validators_1.dataValidator);
exports.companyResolver = (0, schema_1.resolve)({
    properties: {}
});
exports.companyExternalResolver = (0, schema_1.resolve)({
    properties: {}
});
// 2. Data for creating a new Company
exports.companyDataSchema = typebox_1.Type.Object({
    name: typebox_1.Type.String(),
    status: typebox_1.Type.Optional(typebox_1.Type.String()),
    createdAt: typebox_1.Type.Optional(typebox_1.Type.String()),
    gstNumber: typebox_1.Type.Optional(typebox_1.Type.String()),
    invoiceType: typebox_1.Type.Optional(typebox_1.Type.String()),
    address: typebox_1.Type.Optional(typebox_1.Type.String()),
    city: typebox_1.Type.Optional(typebox_1.Type.String()),
    contactName: typebox_1.Type.Optional(typebox_1.Type.String()),
    contactEmail: typebox_1.Type.Optional(typebox_1.Type.String()),
    contactPhone: typebox_1.Type.Optional(typebox_1.Type.String()),
    margin: typebox_1.Type.Optional(typebox_1.Type.String()),
}, { $id: 'CompanyData', additionalProperties: false });
exports.companyDataValidator = (0, typebox_1.getValidator)(exports.companyDataSchema, validators_1.dataValidator);
exports.companyDataResolver = (0, schema_1.resolve)({
    properties: {}
});
// 3. Data for patching a Company
exports.companyPatchSchema = typebox_1.Type.Partial(exports.companyDataSchema, {
    $id: 'CompanyPatch',
    additionalProperties: false
});
exports.companyPatchValidator = (0, typebox_1.getValidator)(exports.companyPatchSchema, validators_1.dataValidator);
exports.companyPatchResolver = (0, schema_1.resolve)({
    properties: {}
});
// 4. Schema for allowed query parameters
exports.companyQuerySchema = typebox_1.Type.Object({
    id: typebox_1.Type.Optional(typebox_1.Type.Number()),
    name: typebox_1.Type.Optional(typebox_1.Type.String()),
    status: typebox_1.Type.Optional(typebox_1.Type.String()),
    createdAt: typebox_1.Type.Optional(typebox_1.Type.String()),
    gstNumber: typebox_1.Type.Optional(typebox_1.Type.String()),
    invoiceType: typebox_1.Type.Optional(typebox_1.Type.String()),
    address: typebox_1.Type.Optional(typebox_1.Type.String()),
    city: typebox_1.Type.Optional(typebox_1.Type.String()),
    contactName: typebox_1.Type.Optional(typebox_1.Type.String()),
    contactEmail: typebox_1.Type.Optional(typebox_1.Type.String()),
    contactPhone: typebox_1.Type.Optional(typebox_1.Type.String()),
    margin: typebox_1.Type.Optional(typebox_1.Type.String()),
    $limit: typebox_1.Type.Optional(typebox_1.Type.Number()),
    $skip: typebox_1.Type.Optional(typebox_1.Type.Number()),
    $sort: typebox_1.Type.Optional(typebox_1.Type.Object({}, { additionalProperties: typebox_1.Type.Number() })),
    $select: typebox_1.Type.Optional(typebox_1.Type.Array(typebox_1.Type.String()))
}, { additionalProperties: false });
exports.companyQueryValidator = (0, typebox_1.getValidator)(exports.companyQuerySchema, validators_1.queryValidator);
exports.companyQueryResolver = (0, schema_1.resolve)({
    properties: {}
});
//# sourceMappingURL=companies.schema.js.map
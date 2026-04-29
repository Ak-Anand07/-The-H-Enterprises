"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoice = void 0;
const schema_1 = require("@feathersjs/schema");
const authentication_1 = require("@feathersjs/authentication");
const invoices_schema_1 = require("./invoices.schema");
const invoices_class_1 = require("./invoices.class");
const invoice = (app) => {
    app.use('invoices', new invoices_class_1.InvoiceService((0, invoices_class_1.getOptions)(app)), {
        methods: ['find', 'get', 'create', 'update', 'patch', 'remove'],
        events: []
    });
    app.service('invoices').hooks({
        around: {
            all: [
                schema_1.hooks.resolveExternal(invoices_schema_1.invoiceExternalResolver),
                schema_1.hooks.resolveResult(invoices_schema_1.invoiceResolver)
            ],
            find: [authentication_1.hooks.authenticate('jwt')],
            get: [authentication_1.hooks.authenticate('jwt')],
            create: [authentication_1.hooks.authenticate('jwt')],
            update: [authentication_1.hooks.authenticate('jwt')],
            patch: [authentication_1.hooks.authenticate('jwt')],
            remove: [authentication_1.hooks.authenticate('jwt')]
        },
        before: {
            all: [
                schema_1.hooks.validateQuery(invoices_schema_1.invoiceQueryValidator),
                schema_1.hooks.resolveQuery(invoices_schema_1.invoiceQueryResolver)
            ],
            find: [],
            get: [],
            create: [
                schema_1.hooks.validateData(invoices_schema_1.invoiceDataValidator),
                schema_1.hooks.resolveData(invoices_schema_1.invoiceDataResolver)
            ],
            patch: [
                schema_1.hooks.validateData(invoices_schema_1.invoicePatchValidator),
                schema_1.hooks.resolveData(invoices_schema_1.invoicePatchResolver)
            ],
            remove: []
        },
        after: {
            all: []
        },
        error: {
            all: []
        }
    });
};
exports.invoice = invoice;
//# sourceMappingURL=invoices.js.map
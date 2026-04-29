"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptions = exports.InvoiceService = void 0;
const knex_1 = require("@feathersjs/knex");
class InvoiceService extends knex_1.KnexService {
}
exports.InvoiceService = InvoiceService;
const getOptions = (app) => {
    return {
        paginate: app.get('paginate'),
        Model: app.get('sqliteClient'),
        name: 'invoices'
    };
};
exports.getOptions = getOptions;
//# sourceMappingURL=invoices.class.js.map
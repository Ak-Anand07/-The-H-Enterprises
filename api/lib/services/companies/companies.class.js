"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptions = exports.CompanyService = void 0;
const knex_1 = require("@feathersjs/knex");
class CompanyService extends knex_1.KnexService {
}
exports.CompanyService = CompanyService;
const getOptions = (app) => {
    return {
        paginate: app.get('paginate'),
        Model: app.get('sqliteClient'),
        name: 'companies'
    };
};
exports.getOptions = getOptions;
//# sourceMappingURL=companies.class.js.map
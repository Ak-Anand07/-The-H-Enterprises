"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptions = exports.UserService = void 0;
const knex_1 = require("@feathersjs/knex");
class UserService extends knex_1.KnexService {
}
exports.UserService = UserService;
const getOptions = (app) => {
    return {
        paginate: app.get('paginate'),
        Model: app.get('sqliteClient'),
        name: 'users',
        id: 'id'
    };
};
exports.getOptions = getOptions;
//# sourceMappingURL=users.class.js.map
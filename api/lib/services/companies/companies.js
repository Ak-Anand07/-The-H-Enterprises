"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.company = void 0;
const schema_1 = require("@feathersjs/schema");
const authentication_1 = require("@feathersjs/authentication");
const companies_schema_1 = require("./companies.schema");
const companies_class_1 = require("./companies.class");
const company = (app) => {
    app.use('companies', new companies_class_1.CompanyService((0, companies_class_1.getOptions)(app)), {
        methods: ['find', 'get', 'create', 'update', 'patch', 'remove'],
        events: []
    });
    app.service('companies').hooks({
        around: {
            all: [
                schema_1.hooks.resolveExternal(companies_schema_1.companyExternalResolver),
                schema_1.hooks.resolveResult(companies_schema_1.companyResolver)
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
                schema_1.hooks.validateQuery(companies_schema_1.companyQueryValidator),
                schema_1.hooks.resolveQuery(companies_schema_1.companyQueryResolver)
            ],
            find: [],
            get: [],
            create: [
                schema_1.hooks.validateData(companies_schema_1.companyDataValidator),
                schema_1.hooks.resolveData(companies_schema_1.companyDataResolver)
            ],
            patch: [
                schema_1.hooks.validateData(companies_schema_1.companyPatchValidator),
                schema_1.hooks.resolveData(companies_schema_1.companyPatchResolver)
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
exports.company = company;
//# sourceMappingURL=companies.js.map
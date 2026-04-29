"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.services = void 0;
const users_1 = require("./users/users");
const companies_1 = require("./companies/companies");
const invoices_1 = require("./invoices/invoices");
const services = (app) => {
    app.configure(users_1.user);
    app.configure(companies_1.company);
    app.configure(invoices_1.invoice);
};
exports.services = services;
//# sourceMappingURL=index.js.map
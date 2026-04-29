"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
async function seed() {
    console.log('Seeding database...');
    // Seed Companies
    const companies = [
        { name: 'Nexus Tech Corp', status: 'Active', createdAt: '2024-01-15' },
        { name: 'Solaris Energy', status: 'Active', createdAt: '2024-02-20' },
        { name: 'Apex Logistics', status: 'Active', createdAt: '2024-03-05' },
        { name: 'Vertex Media', status: 'Active', createdAt: '2024-04-10' },
    ];
    const insertedCompanies = [];
    // Check if we already have companies
    const existingCompanies = await app_1.app.service('companies').find();
    if (existingCompanies.total === 0) {
        for (const company of companies) {
            const created = await app_1.app.service('companies').create(company);
            insertedCompanies.push(created);
        }
        console.log('Seeded companies.');
    }
    else {
        console.log('Companies already exist. Skipping company seed.');
        insertedCompanies.push(...existingCompanies.data);
    }
    // Seed Invoices
    const invoices = [
        {
            companyId: insertedCompanies[0].id,
            companyName: 'Nexus Tech Corp',
            companyInitial: 'N',
            date: 'Jun 14, 2024',
            amount: '₹ 12,450.00',
            status: 'Cleared'
        },
        {
            companyId: insertedCompanies[1].id,
            companyName: 'Solaris Energy',
            companyInitial: 'S',
            date: 'Jun 12, 2024',
            amount: '₹ 5,200.00',
            status: 'Pending'
        },
        {
            companyId: insertedCompanies[2].id,
            companyName: 'Apex Logistics',
            companyInitial: 'A',
            date: 'Jun 10, 2024',
            amount: '₹ 2,100.45',
            status: 'Cleared'
        },
        {
            companyId: insertedCompanies[3].id,
            companyName: 'Vertex Media',
            companyInitial: 'V',
            date: 'Jun 08, 2024',
            amount: '₹ 8,900.00',
            status: 'Pending'
        }
    ];
    const existingInvoices = await app_1.app.service('invoices').find();
    if (existingInvoices.total === 0) {
        for (const invoice of invoices) {
            await app_1.app.service('invoices').create(invoice);
        }
        console.log('Seeded invoices.');
    }
    else {
        console.log('Invoices already exist. Skipping invoice seed.');
    }
    console.log('Done.');
}
seed().catch(err => {
    console.error(err);
    process.exit(1);
}).then(() => {
    process.exit(0);
});
//# sourceMappingURL=seed.js.map
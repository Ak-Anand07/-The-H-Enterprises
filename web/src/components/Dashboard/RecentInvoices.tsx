import React from "react";

export interface InvoiceData {
  initial: string;
  name: string;
  date: string;
  amount: string;
  status: string;
  statusClass: string;
  rowBg: string;
}

export function RecentInvoices({ invoices }: { invoices: InvoiceData[] }) {
  return (
    <div className="lg:col-span-2 crm-panel rounded-xl overflow-hidden">
      <div className="px-8 py-6 flex justify-between items-center bg-surface-container-low/50">
        <h3 className="text-lg font-bold text-on-surface">Recent Invoices</h3>
        <a className="text-primary text-sm font-semibold hover:underline" href="#">
          View All
        </a>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="text-on-surface-variant text-[11px] uppercase tracking-[0.15em] font-bold">
              <th className="px-8 py-4">Client Name</th>
              <th className="px-8 py-4">Date</th>
              <th className="px-8 py-4">Amount</th>
              <th className="px-8 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium">
            {invoices.map((invoice, idx) => (
              <tr
                key={idx}
                className={`${invoice.rowBg} hover:bg-surface-container-low transition-colors group`}
              >
                <td className="px-8 py-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center font-bold text-primary">
                    {invoice.initial}
                  </div>
                  {invoice.name}
                </td>
                <td className="px-8 py-6 text-on-surface-variant">{invoice.date}</td>
                <td className="px-8 py-6 font-bold text-on-surface whitespace-nowrap">
                  {invoice.amount}
                </td>
                <td className="px-8 py-6 text-center">
                  <span
                    className={`${invoice.statusClass} px-3 py-1 rounded-full text-[10px] font-extrabold uppercase`}
                  >
                    {invoice.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

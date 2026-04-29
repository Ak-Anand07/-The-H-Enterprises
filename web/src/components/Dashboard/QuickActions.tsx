import React from "react";
import Link from "next/link";

export function QuickActions() {
  return (
    <div className="crm-panel p-8 rounded-xl relative overflow-hidden">
      <div className="relative z-10">
        <h3 className="text-xl font-extrabold text-on-surface mb-6">Quick Actions</h3>
        <div className="flex flex-col gap-3">
          <Link
            href="/companies?panel=register"
            className="flex items-center justify-between w-full p-4 rounded-xl bg-surface hover:bg-surface-container-high transition-all border border-outline-variant/10 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">add_business</span>
              </div>
              <span className="font-bold text-on-surface text-sm">Add New Company</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </Link>

          <Link
            href="/reports"
            className="flex items-center justify-between w-full p-4 rounded-xl bg-surface hover:bg-surface-container-high transition-all border border-outline-variant/10 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed/30 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined">analytics</span>
              </div>
              <span className="font-bold text-on-surface text-sm">Generate Report</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </Link>

          <Link
            href="/invoices?panel=create"
            className="flex items-center justify-between w-full p-4 rounded-xl bg-surface hover:bg-surface-container-high transition-all border border-outline-variant/10 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-tertiary-fixed/30 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined">request_quote</span>
              </div>
              <span className="font-bold text-on-surface text-sm">Create New Invoice</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

import React from "react";

export function Footer() {
  return (
    <footer className="px-8 pb-8 mt-12">
      <div className="flex flex-col items-center justify-between gap-4 border-t border-outline-variant/10 pt-8 text-xs font-medium text-on-surface-variant md:flex-row">
        <p>&copy; 2024 The H Enterprises. All rights reserved.</p>
        <div className="flex gap-6">
          <a className="transition-colors hover:text-primary" href="/reports">Data Security</a>
          <a className="transition-colors hover:text-primary" href="/reports">Compliance</a>
          <a className="transition-colors hover:text-primary" href="/companies">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

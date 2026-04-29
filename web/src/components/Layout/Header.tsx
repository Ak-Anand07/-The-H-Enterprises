import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "../../../src/providers/AuthProvider";

interface HeaderProps {
  sidebarWidth: number;
  onMenuClick?: () => void;
}

export function Header({ sidebarWidth, onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  let pageTitle = "Accounts Module";
  
  if (pathname === "/dashboard") pageTitle = "Accounts Dashboard";
  else if (pathname === "/companies") pageTitle = "Company Directory";
  else if (pathname === "/invoices") pageTitle = "Invoice Management";
  else if (pathname === "/reports") pageTitle = "Financial Reports";
  else if (pathname === "/settings") pageTitle = "System Settings";
  else if (pathname === "/support") pageTitle = "Support Center";

  return (
    <header
      className="fixed top-0 z-30 flex h-16 items-center justify-between gap-4 bg-white/85 px-2 lg:px-8 shadow-sm backdrop-blur-md transition-all duration-300"
      style={{ 
        left: "0", 
        right: "0",
        paddingLeft: "var(--sidebar-offset, 88px)" 
      }}
    >
      {/* Left Side: Hamburger (Mobile) */}
      <div className="flex items-center lg:hidden">
        <button 
          onClick={onMenuClick}
          className="flex h-12 w-12 items-center justify-center rounded-none text-slate-600 transition-all hover:bg-slate-100 border-none bg-transparent"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
      </div>

      {/* Center Side: Search Bar */}
      <div className="flex flex-1 justify-center px-4">
        <div className="flex w-full max-w-[480px] items-center rounded-full bg-surface-container-high px-4 py-2 transition-all focus-within:bg-white focus-within:shadow-md focus-within:ring-1 focus-within:ring-primary/20">
          <span className="material-symbols-outlined mr-2 text-outline shrink-0">search</span>
          <input
            className="w-full border-none bg-transparent p-0 text-sm placeholder:text-on-surface-variant focus:ring-0"
            placeholder="Search accounts, invoices or clients..."
            type="text"
          />
        </div>
      </div>

      {/* Right Side: Notifications & Profile */}
      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-slate-600 transition-all hover:bg-slate-100 border-none bg-transparent">
          <span className="material-symbols-outlined shrink-0">notifications</span>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error"></span>
        </button>
        <div className="hidden h-8 w-px bg-outline-variant/30 sm:block"></div>
        <div className="flex items-center gap-2">
          <button onClick={logout} className="hidden items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-error transition-colors hover:bg-error/10 xl:flex border-none bg-transparent">
            <span className="material-symbols-outlined text-base">logout</span>
            <span>Logout</span>
          </button>
          <button className="flex items-center gap-3 rounded-lg p-1 pr-3 transition-all hover:bg-slate-100 border-none bg-transparent">
            <span className="hidden text-right sm:block">
              <span className="block text-xs font-semibold text-cyan-900">
                {(user?.email as string) || "Admin User"}
              </span>
              <span className="block text-[10px] uppercase tracking-[0.25em] text-slate-500">Premium Plan</span>
            </span>
            <span className="material-symbols-outlined text-3xl text-slate-400">account_circle</span>
          </button>
        </div>
      </div>
    </header>
  );
}

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../../src/providers/AuthProvider";

interface SidebarProps {
  collapsed: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/companies", label: "Companies", icon: "business" },
  { href: "/invoices", label: "Invoices", icon: "description" },
  { href: "/reports", label: "Reports", icon: "assessment" },
];

export function Sidebar({ collapsed, isOpen, onClose, onMouseEnter, onMouseLeave }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const width = collapsed ? 88 : 256;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden transition-all duration-300 animate-in fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen flex-col overflow-hidden bg-slate-950/95 py-6 transition-all duration-200 backdrop-blur-md lg:translate-x-0 ${
          isOpen ? "translate-x-0 w-72 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "shadow-none" : "lg:shadow-[20px_0_50px_rgba(0,0,0,0.3)]"}`}
        style={{ width: isOpen ? "280px" : `${width}px` }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-primary to-primary-container opacity-95"></div>
      <div className="absolute -left-12 top-8 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
      <div className="absolute -bottom-8 right-0 h-36 w-36 rounded-full bg-secondary-container/20 blur-3xl"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-10 xl:block">
        <div className="absolute right-1 top-1/3 h-44 w-[2px] rounded-full bg-white/15"></div>
      </div>

      <div className="relative mb-8 px-6 overflow-hidden">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary">
            <span className="material-symbols-outlined">domain</span>
          </div>
          <div className={`min-w-0 flex-1 transition-opacity duration-300 ${collapsed && !isOpen ? "opacity-0 hidden" : "opacity-100"}`}>
            <h1 className="whitespace-nowrap text-[0.96rem] font-bold leading-tight tracking-[-0.03em] text-white">
              The H Enterprises
            </h1>
            <p className="mt-2 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.3em] text-white/55">
              Hotel CRM
            </p>
          </div>
        </div>
      </div>

      <nav className="relative flex flex-1 flex-col gap-1 px-4 overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const stateClass = isActive
            ? "bg-white/12 text-white font-bold border-r-4 border-white"
            : "text-white/70 font-medium hover:bg-white/8 hover:text-white";

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${stateClass}`}
              title={item.label}
            >
              <span className="material-symbols-outlined shrink-0">{item.icon}</span>
              <span className={`font-['Manrope'] font-semibold text-sm tracking-tight transition-opacity duration-300 ${collapsed && !isOpen ? "opacity-0 hidden" : "opacity-100"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="relative mt-auto px-4 pt-6 overflow-hidden">
        <div className="border-t border-white/15 pt-4">
          <Link 
            href="/settings" 
            onClick={onClose}
            className={`group relative flex items-center gap-3 rounded-xl px-4 py-2 transition-colors ${pathname === "/settings" ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/8 hover:text-white"}`} 
            title="Settings"
          >
            <span className="material-symbols-outlined shrink-0">settings</span>
            <span className={`font-['Manrope'] text-sm font-semibold tracking-tight transition-opacity duration-300 ${collapsed && !isOpen ? "opacity-0 hidden" : "opacity-100"}`}>Settings</span>
          </Link>
          <Link 
            href="/support" 
            onClick={onClose}
            className={`group relative mt-1 flex items-center gap-3 rounded-xl px-4 py-2 transition-colors ${pathname === "/support" ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/8 hover:text-white"}`} 
            title="Support"
          >
            <span className="material-symbols-outlined shrink-0">help</span>
            <span className={`font-['Manrope'] text-sm font-semibold tracking-tight transition-opacity duration-300 ${collapsed && !isOpen ? "opacity-0 hidden" : "opacity-100"}`}>Support</span>
          </Link>
          <button onClick={logout} className="group relative mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-2 text-error transition-colors hover:bg-error/10" title="Logout">
            <span className="material-symbols-outlined shrink-0 text-error">logout</span>
            <span className={`font-['Manrope'] text-sm font-semibold tracking-tight transition-opacity duration-300 ${collapsed && !isOpen ? "opacity-0 hidden" : "opacity-100"}`}>Logout</span>
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}

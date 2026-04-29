"use client";
import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("h-enterprises-sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
    setMounted(true);
  }, []);

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (collapsed) {
      setCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCollapsed(true);
      localStorage.setItem("h-enterprises-sidebar-collapsed", "true");
    }, 400);
  };

  const sidebarWidth = 88;

  // Prevent flash of incorrect state
  if (!mounted) {
    return <div className="min-h-screen bg-surface" />;
  }

  return (
    <div 
      className="min-h-screen bg-surface flex"
      style={{ "--sidebar-offset": mounted && window.innerWidth < 1024 ? "0px" : "88px" } as React.CSSProperties}
    >
      <Sidebar 
        collapsed={collapsed} 
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      
      <Header 
        sidebarWidth={sidebarWidth} 
        onMenuClick={() => setMobileOpen(true)}
      />

      <div 
        className="flex-1 transition-all duration-300 flex flex-col pt-16 min-h-screen w-full lg:ml-[88px]"
      >
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}

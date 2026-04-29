"use client";
import React, { useState, useEffect } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("company");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const [companySettings, setCompanySettings] = useState({
    name: "AI ACCOUNTING SOLUTIONS",
    gst: "27AAACA1234A1Z5",
    address: "123 Business Hub, Tech Park",
    city: "San Francisco, CA 94105",
    email: "billing@aiaccounting.com",
    phone: "+1 (555) 000-0000"
  });

  const [userSettings, setUserSettings] = useState({
    name: "Admin User",
    email: "admin@aiaccounting.com",
    role: "Super Admin"
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedCompany = localStorage.getItem("crm_company_settings");
    if (savedCompany) {
      setCompanySettings(JSON.parse(savedCompany));
    }
  }, []);

  const handleSave = () => {
    setSaveStatus("saving");
    
    // Simulate API delay
    setTimeout(() => {
      localStorage.setItem("crm_company_settings", JSON.stringify(companySettings));
      setSaveStatus("saved");
      
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 800000); // 800ms mock delay
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCompanySettings({ ...companySettings, [e.target.name]: e.target.value });
  };

  return (
    <div className="relative p-4 sm:p-8 z-0 min-h-[calc(100vh-100px)]">
      <div className="absolute left-4 top-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl -z-10"></div>
      
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">System Settings</h1>
        <p className="text-on-surface-variant text-sm font-medium mt-1">
          Configure your workspace, branding, and account preferences.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="col-span-12 lg:col-span-3 flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
          <button 
            onClick={() => setActiveTab("company")}
            className={`whitespace-nowrap flex items-center gap-3 px-6 lg:px-4 py-3 rounded-xl text-sm font-bold transition-all border-none ${activeTab === "company" ? "bg-primary text-white shadow-md" : "hover:bg-surface-container-high text-on-surface-variant"}`}
          >
            <span className="material-symbols-outlined">business</span>
            Company Profile
          </button>
          <button 
            onClick={() => setActiveTab("user")}
            className={`whitespace-nowrap flex items-center gap-3 px-6 lg:px-4 py-3 rounded-xl text-sm font-bold transition-all border-none ${activeTab === "user" ? "bg-primary text-white shadow-md" : "hover:bg-surface-container-high text-on-surface-variant"}`}
          >
            <span className="material-symbols-outlined">person</span>
            User Account
          </button>
          <button 
            className="whitespace-nowrap flex items-center gap-3 px-6 lg:px-4 py-3 rounded-xl text-sm font-bold transition-all border-none hover:bg-surface-container-high text-on-surface-variant opacity-50 cursor-not-allowed"
          >
            <span className="material-symbols-outlined">notifications</span>
            Notifications
          </button>
          <button 
            className="whitespace-nowrap flex items-center gap-3 px-6 lg:px-4 py-3 rounded-xl text-sm font-bold transition-all border-none hover:bg-surface-container-high text-on-surface-variant opacity-50 cursor-not-allowed"
          >
            <span className="material-symbols-outlined">security</span>
            Security
          </button>
        </div>

        {/* Content Area */}
        <div className="col-span-12 lg:col-span-9">
          <div className="crm-panel rounded-2xl p-4 sm:p-8">
            {activeTab === "company" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-6 pb-8 border-b border-surface-container">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border-2 border-dashed border-primary/30">
                    <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">Company Logo</h3>
                    <p className="text-xs text-on-surface-variant">Used for invoice generation and branding. PNG or JPG preferred.</p>
                    <button className="mt-2 text-xs font-bold text-primary hover:underline border-none bg-transparent">Upload Image</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-[11px] font-bold text-on-surface-variant ml-1 uppercase tracking-wider">Legal Entity Name</label>
                    <input 
                      name="name"
                      value={companySettings.name}
                      onChange={handleCompanyChange}
                      className="crm-drawer-field w-full p-4 rounded-xl text-sm font-bold border-x-0 border-t-0 border-b-2 border-b-slate-400 focus:border-b-primary focus:ring-0 transition-all outline-none"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-[11px] font-bold text-on-surface-variant ml-1 uppercase tracking-wider">GSTIN / Tax ID</label>
                    <input 
                      name="gst"
                      value={companySettings.gst}
                      onChange={handleCompanyChange}
                      className="crm-drawer-field w-full p-4 rounded-xl text-sm font-mono border-x-0 border-t-0 border-b-2 border-b-slate-400 focus:border-b-primary focus:ring-0 transition-all outline-none"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[11px] font-bold text-on-surface-variant ml-1 uppercase tracking-wider">Primary Office Address</label>
                    <input 
                      name="address"
                      value={companySettings.address}
                      onChange={handleCompanyChange}
                      className="crm-drawer-field w-full p-4 rounded-xl text-sm border-x-0 border-t-0 border-b-2 border-b-slate-400 focus:border-b-primary focus:ring-0 transition-all outline-none"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-[11px] font-bold text-on-surface-variant ml-1 uppercase tracking-wider">City & State</label>
                    <input 
                      name="city"
                      value={companySettings.city}
                      onChange={handleCompanyChange}
                      className="crm-drawer-field w-full p-4 rounded-xl text-sm border-x-0 border-t-0 border-b-2 border-b-slate-400 focus:border-b-primary focus:ring-0 transition-all outline-none"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-[11px] font-bold text-on-surface-variant ml-1 uppercase tracking-wider">Billing Email</label>
                    <input 
                      name="email"
                      value={companySettings.email}
                      onChange={handleCompanyChange}
                      className="crm-drawer-field w-full p-4 rounded-xl text-sm border-x-0 border-t-0 border-b-2 border-b-slate-400 focus:border-b-primary focus:ring-0 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "user" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-[11px] font-bold text-on-surface-variant ml-1 uppercase tracking-wider">Full Name</label>
                    <input 
                      value={userSettings.name}
                      readOnly
                      className="crm-drawer-field w-full p-4 rounded-xl text-sm font-bold opacity-70 border-none outline-none"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-[11px] font-bold text-on-surface-variant ml-1 uppercase tracking-wider">Email Address</label>
                    <input 
                      value={userSettings.email}
                      readOnly
                      className="crm-drawer-field w-full p-4 rounded-xl text-sm opacity-70 border-none outline-none"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-[11px] font-bold text-on-surface-variant ml-1 uppercase tracking-wider">Access Role</label>
                    <input 
                      value={userSettings.role}
                      readOnly
                      className="crm-drawer-field w-full p-4 rounded-xl text-sm font-bold text-primary bg-primary/5 border-none outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="text-xs text-on-surface-variant font-medium">Last synced: Just now</p>
              <button 
                onClick={handleSave}
                disabled={saveStatus === "saving"}
                className="crm-primary-btn px-8 py-3 rounded-xl text-on-primary font-bold flex items-center gap-2 min-w-[160px] justify-center transition-all active:scale-95 border-none"
              >
                {saveStatus === "saving" ? (
                  <span className="material-symbols-outlined animate-spin">sync</span>
                ) : saveStatus === "saved" ? (
                  <span className="material-symbols-outlined">check_circle</span>
                ) : (
                  <span className="material-symbols-outlined">save</span>
                )}
                {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Changes Saved" : "Update Profile"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

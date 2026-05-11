"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import app from "../../../lib/feathersClient";
import { ConfirmationModal } from "../../../components/UI/ConfirmationModal";
import { FeedbackModal } from "../../../components/UI/FeedbackModal";

const GSTIN_PATTERN = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/;

export default function CompaniesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<number | null>(null);

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<{id: number, name: string} | null>(null);
  
  // Feedback Modal State
  const [feedback, setFeedback] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info"
  });

  const showFeedback = (title: string, message: string, type: "success" | "error" | "info" = "info") => {
    setFeedback({ isOpen: true, title, message, type });
  };

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    gstNumber: "",
    invoiceType: "Percentage",
    address: "",
    city: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    margin: "10.0%",
    sendNotification: false,
  });

  // Fetch Companies
  const loadCompanies = async () => {
    setLoading(true);
    try {
      const res = await app.service("companies").find({
        query: { $sort: { id: -1 } },
      });
      setCompanies(res.data || res);
    } catch (err) {
      console.error("Error fetching companies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (searchParams?.get("panel") === "register") {
      openDrawerForCreate();
    }
  }, [searchParams]);

  // Drawer handlers
  const closeDrawer = () => {
    setDrawerOpen(false);
    setIsEditMode(false);
    setEditingCompanyId(null);
    setFormData({
      name: "",
      gstNumber: "",
      invoiceType: "Percentage",
      address: "",
      city: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      margin: "10.0%",
      sendNotification: false,
    });
    router.replace("/companies", { scroll: false });
  };

  const openDrawerForCreate = () => {
    setIsEditMode(false);
    setEditingCompanyId(null);
    setFormData({
      name: "",
      gstNumber: "",
      invoiceType: "Percentage",
      address: "",
      city: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      margin: "10.0%",
      sendNotification: false,
    });
    setDrawerOpen(true);
  };

  const openDrawerForEdit = (company: any) => {
    setIsEditMode(true);
    setEditingCompanyId(company.id);
    setFormData({
      name: company.name || "",
      gstNumber: company.gstNumber || "",
      invoiceType: company.invoiceType || "Percentage",
      address: company.address || "",
      city: company.city || "",
      contactName: company.contactName || "",
      contactEmail: company.contactEmail || "",
      contactPhone: company.contactPhone || "",
      margin: company.margin || "10.0%",
      sendNotification: false,
    });
    setDrawerOpen(true);
  };

  // Input Handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // CRUD Operations
  const saveCompany = async () => {
    const normalizedName = formData.name.trim();
    const normalizedGstNumber = formData.gstNumber.trim().toUpperCase().replace(/\s+/g, "");

    if (normalizedName.length < 2) {
      showFeedback("Validation Error", "Company name must be at least 2 characters.", "error");
      return;
    }

    if (normalizedGstNumber && !GSTIN_PATTERN.test(normalizedGstNumber)) {
      showFeedback("Invalid GSTIN", "GST number must be a valid 15-character GSTIN format.", "error");
      return;
    }

    const payload = {
      ...formData,
      name: normalizedName,
      gstNumber: normalizedGstNumber,
      address: formData.address.trim(),
      city: formData.city.trim(),
      contactName: formData.contactName.trim(),
      contactEmail: formData.contactEmail.trim(),
      contactPhone: formData.contactPhone.trim(),
      margin: formData.margin.trim(),
      invoiceType: formData.invoiceType.trim(),
      sendNotification: formData.sendNotification,
      status: "Active",
    };

    if (payload.sendNotification && !payload.contactEmail) {
      showFeedback("Contact Missing", "Please add a contact email before triggering the notification email.", "error");
      return;
    }

    try {
      let savedCompany;

      if (isEditMode && editingCompanyId !== null) {
        savedCompany = await app.service("companies").patch(editingCompanyId, payload);
      } else {
        savedCompany = await app.service("companies").create({
          ...payload,
          createdAt: new Date().toISOString(),
        });
      }

      if (savedCompany?.notificationMessage) {
        showFeedback("Success", savedCompany.notificationMessage, "success");
      } else {
        showFeedback("Success", `Company ${isEditMode ? "updated" : "registered"} successfully!`, "success");
      }

      closeDrawer();
      loadCompanies();
    } catch (err: any) {
      console.error("Error saving company:", err);

      const detailLines = [
        err?.message,
        ...(Array.isArray(err?.errors)
          ? err.errors.map((issue: any) => `${issue.instancePath || issue.path || "field"} ${issue.message || ""}`.trim())
          : []),
        ...(Array.isArray(err?.data?.errors)
          ? err.data.errors.map((issue: any) => `${issue.instancePath || issue.path || "field"} ${issue.message || ""}`.trim())
          : []),
      ].filter(Boolean);

      showFeedback(
        "Action Failed", 
        detailLines[0] ? `Failed to save company settings.\n${detailLines.join("\n")}` : "Failed to save company settings.",
        "error"
      );
    }
  };

  const deleteCompany = async (id: number) => {
    try {
      await app.service("companies").remove(id);
      loadCompanies();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const openDeleteModal = (id: number, name: string) => {
    setCompanyToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  return (
    <div className="relative p-4 sm:p-8 z-0">
      <div className="absolute left-2 top-4 h-64 w-64 rounded-full bg-primary/5 blur-3xl -z-10"></div>
      <div className="absolute bottom-6 right-6 h-64 w-64 rounded-full bg-secondary-container/10 blur-3xl -z-10"></div>

      <div className="relative mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h2 className="font-headline text-3xl font-extrabold text-primary tracking-tight">
            Company Directory
          </h2>
          <p className="text-on-surface-variant mt-2 font-medium">
            Manage corporate registrations and fiscal entity settings.
          </p>
        </div>
        <button
          onClick={openDrawerForCreate}
          className="crm-primary-btn w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-on-primary hover:opacity-90 transition-all"
          type="button"
        >
          <span className="material-symbols-outlined" data-icon="add_business">
            add_business
          </span>
          <span>Register Company</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6 relative z-10">
        <div className="col-span-12 lg:col-span-12">
          <div className="crm-panel rounded-xl overflow-hidden">
            <div className="p-6 border-b border-surface-container flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-primary px-3 py-1 bg-primary-fixed rounded-full">
                  Active Ledger ({companies.length})
                </span>
                <span className="text-sm font-medium text-on-surface-variant">
                  Last updated: Just now
                </span>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-surface-container rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-outline">filter_list</span>
                </button>
                <button className="p-2 hover:bg-surface-container rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-outline">download</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[800px] w-full text-left table-auto">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="px-4 py-4 font-headline text-xs uppercase tracking-widest text-on-surface-variant font-bold">
                      Company Name
                    </th>
                    <th className="px-4 py-4 font-headline text-xs uppercase tracking-widest text-on-surface-variant font-bold">
                      Contact Person
                    </th>
                    <th className="px-4 py-4 font-headline text-xs uppercase tracking-widest text-on-surface-variant font-bold text-center">
                      Invoice
                    </th>
                    <th className="px-4 py-4 font-headline text-xs uppercase tracking-widest text-on-surface-variant font-bold text-center">
                      GST Number
                    </th>
                    <th className="px-4 py-4 font-headline text-xs uppercase tracking-widest text-on-surface-variant font-bold text-right">
                      Settlement
                    </th>
                    <th className="px-4 py-4 font-headline text-xs uppercase tracking-widest text-on-surface-variant font-bold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container/50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 opacity-60">
                        <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                        <p className="mt-2 text-sm font-bold">Loading Ledger...</p>
                      </td>
                    </tr>
                  ) : companies.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 opacity-60">
                        <p className="text-sm font-bold">No companies registered.</p>
                      </td>
                    </tr>
                  ) : (
                    companies.map((co) => (
                      <tr key={co.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="px-4 py-4 border-transparent">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 shrink-0 rounded-lg bg-surface-container-high flex items-center justify-center font-bold text-primary uppercase text-xs">
                              {co.name.substring(0, 2)}
                            </div>
                            <div className="max-w-[180px]">
                              <p className="font-bold text-on-surface truncate" title={co.name}>{co.name}</p>
                              <p className="text-[10px] text-on-surface-variant truncate">{co.city || "No location set"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 border-transparent">
                          <div className="flex flex-col max-w-[150px]">
                            <span className="font-semibold text-xs truncate" title={co.contactName}>{co.contactName || "TBD"}</span>
                            <span className="text-[10px] text-on-surface-variant truncate">{co.contactEmail || "-"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 border-transparent text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider inline-block ${
                              co.invoiceType === "Percentage"
                                ? "bg-primary-fixed text-primary"
                                : "bg-tertiary-fixed text-tertiary"
                            }`}
                          >
                            {co.invoiceType === "Percentage" ? "% Ratio" : "Flat Fee"}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-mono text-xs whitespace-nowrap border-transparent text-center">
                          {co.gstNumber || "-"}
                        </td>
                        <td className="px-4 py-4 text-right border-transparent">
                          <p className="font-headline font-bold text-primary text-sm">{co.margin || "0%"}</p>
                          <p className="text-[9px] text-on-surface-variant">Margin</p>
                        </td>
                        <td className="px-4 py-4 border-transparent text-right">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => openDrawerForEdit(co)}
                              className="p-1.5 hover:bg-surface-container-high rounded-full transition-all border-none bg-transparent"
                            >
                              <span className="material-symbols-outlined text-[18px] text-outline">edit</span>
                            </button>
                            <button
                              onClick={() => openDeleteModal(co.id, co.name)}
                              className="p-1.5 hover:bg-error-container text-error rounded-full transition-all border-none bg-transparent"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-surface-container-low flex justify-center border-t border-transparent">
              <button className="text-xs font-bold text-primary uppercase tracking-widest hover:underline border-none bg-transparent">
                Load More Records
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Overlay Backdrop */}
      {drawerOpen && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-[55] bg-primary/10 backdrop-blur-sm" onClick={closeDrawer} />
      )}

      {/* Side Panel Drawer */}
      <div
        className={`fixed bottom-0 right-0 top-16 z-[60] flex w-full sm:w-[480px] flex-col border-l border-surface-container bg-white/85 backdrop-blur-md shadow-[0_20px_40px_rgba(0,67,84,0.06)] transition-transform duration-300 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-8 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-extrabold font-headline tracking-tighter text-primary">
                {isEditMode ? "Edit Company" : "Onboard Company"}
              </h3>
              <p className="text-sm text-on-surface-variant font-medium">
                {isEditMode ? "Modify an entity in the ledger." : "Register a new entity in the ledger suite."}
              </p>
            </div>
            <button
              onClick={closeDrawer}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container border-none bg-transparent"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">
                Basic Identity
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant mb-1 ml-1">
                    Company Name
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="crm-drawer-field w-full p-4 rounded-xl text-sm border-x-0 border-t-0 border-b-2 border-b-slate-400 focus:border-b-primary focus:ring-0 transition-all outline-none"
                    placeholder="e.g. Acme Corp Industries"
                    type="text"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant mb-1 ml-1">
                      GST Number
                    </label>
                    <input
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      className="crm-drawer-field w-full p-4 rounded-xl text-sm font-mono border-x-0 border-t-0 border-b-2 border-b-slate-400 focus:border-b-primary focus:ring-0 transition-all outline-none"
                      placeholder="27AAACN..."
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant mb-1 ml-1">
                      Settlement Type
                    </label>
                    <select
                      name="invoiceType"
                      value={formData.invoiceType}
                      onChange={handleChange}
                      className="crm-drawer-field w-full p-4 rounded-xl text-sm border-x-0 border-t-0 border-b-2 border-b-slate-400 focus:border-b-primary focus:ring-0 transition-all outline-none appearance-none cursor-pointer"
                    >
                      <option value="Percentage">% (Percentage)</option>
                      <option value="Amount">Amount (Fixed)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant mb-1 ml-1">
                    Settlement Margin
                  </label>
                  <input
                    name="margin"
                    value={formData.margin}
                    onChange={handleChange}
                    className="crm-drawer-field w-full p-4 rounded-xl text-sm border-x-0 border-t-0 border-b-2 border-b-slate-400 focus:border-b-primary focus:ring-0 transition-all outline-none"
                    placeholder={formData.invoiceType === "Percentage" ? "e.g. 10.0%" : "e.g. 500"}
                    type="text"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">
                Location & Presence
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant mb-1 ml-1">
                    Address
                  </label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="crm-drawer-field w-full p-4 rounded-xl text-sm border-x-0 border-t-0 border-b-2 border-b-slate-400 focus:border-b-primary focus:ring-0 transition-all outline-none"
                    placeholder="Street, Suite, Office Floor"
                    type="text"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant mb-1 ml-1">
                    City
                  </label>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="crm-drawer-field w-full p-4 rounded-xl text-sm border-x-0 border-t-0 border-b-2 border-b-slate-400 focus:border-b-primary focus:ring-0 transition-all outline-none"
                    placeholder="e.g. San Francisco"
                    type="text"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">
                Point of Contact
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant mb-1 ml-1">
                    Contact Person Name
                  </label>
                  <input
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    className="crm-drawer-field w-full p-4 rounded-xl text-sm border-x-0 border-t-0 border-b-2 border-b-slate-400 focus:border-b-primary focus:ring-0 transition-all outline-none"
                    placeholder="Full legal name"
                    type="text"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant mb-1 ml-1">
                      Email Address
                    </label>
                    <input
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      className="crm-drawer-field w-full p-4 rounded-xl text-sm border-x-0 border-t-0 border-b-2 border-b-slate-400 focus:border-b-primary focus:ring-0 transition-all outline-none"
                      placeholder="name@company.com"
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant mb-1 ml-1">
                      Mobile Number
                    </label>
                    <input
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      className="crm-drawer-field w-full p-4 rounded-xl text-sm border-x-0 border-t-0 border-b-2 border-b-slate-400 focus:border-b-primary focus:ring-0 transition-all outline-none"
                      placeholder="+1 (000) 000-0000"
                      type="tel"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">
                Notification Trigger
              </p>
              <button
                type="button"
                onClick={() =>
                  setFormData((current) => ({
                    ...current,
                    sendNotification: !current.sendNotification,
                  }))
                }
                className={`w-full rounded-2xl border px-5 py-5 text-left transition-all ${
                  formData.sendNotification
                    ? "border-primary/20 bg-primary/10 text-primary shadow-[0_12px_30px_rgba(37,99,235,0.12)]"
                    : "border-surface-container bg-surface-container-low text-on-surface-variant"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold">
                      {formData.sendNotification ? "Notification Email Enabled" : "Send Onboarding Email"}
                    </p>
                    <p className="mt-1 text-xs font-medium opacity-80">
                      {formData.contactEmail
                        ? `Trigger an onboarding email to ${formData.contactEmail.trim()}.`
                        : "Add a contact email to send the onboarding notification."}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-3xl">
                    {formData.sendNotification ? "mark_email_read" : "mail"}
                  </span>
                </div>
              </button>
            </div>
          </form>
        </div>

        <div className="p-8 bg-surface-container-low border-t border-surface-container flex gap-4">
          <button
            onClick={closeDrawer}
            className="flex-1 rounded-xl px-6 py-4 text-center font-bold text-on-surface transition-colors hover:bg-surface-container-high border-none bg-transparent"
          >
            Cancel
          </button>
          <button
            onClick={saveCompany}
            className="flex-1 bg-primary text-on-primary px-6 py-4 rounded-xl font-bold shadow-[0_20px_40px_rgba(0,67,84,0.06)] hover:opacity-90 transition-all text-center border-none"
          >
            {isEditMode ? "Save Changes" : "Initialize Company"}
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => companyToDelete && deleteCompany(companyToDelete.id)}
        title="Delete Company?"
        message={`Are you sure you want to permanently delete ${companyToDelete?.name}? This action cannot be undone and will remove all associated records.`}
        confirmText="Delete Record"
        type="danger"
      />
      <FeedbackModal
        isOpen={feedback.isOpen}
        onClose={() => setFeedback({ ...feedback, isOpen: false })}
        title={feedback.title}
        message={feedback.message}
        type={feedback.type}
      />
    </div>
  );
}

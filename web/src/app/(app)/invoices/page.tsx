"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import app from "../../../lib/feathersClient";
import { ConfirmationModal } from "../../../components/UI/ConfirmationModal";

const formatDateInput = (value: Date) => value.toISOString().slice(0, 10);
const addDays = (value: Date, days: number) => {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
};

export default function InvoicesPage() {
  // State
  const [invoices, setInvoices] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<number | null>(null);

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<{id: number, invoiceNo: string} | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    invoiceNo: "",
    companyId: 0,
    date: "",
    dueDate: "",
    amount: "",
    status: "Pending",
  });

  // Fetch Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [invRes, compRes] = await Promise.all([
        app.service("invoices").find({ query: { $sort: { id: -1 } } }),
        app.service("companies").find({ query: { $sort: { id: -1 } } }),
      ]);
      setInvoices(invRes.data || invRes);
      setCompanies(compRes.data || compRes);
    } catch (err) {
      console.error("Failed to load invoice data", err);
    } finally {
      setLoading(false);
    }
  };

  const searchParams = useSearchParams();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchParams?.get("panel") === "create") {
      openDrawerForCreate();
    }
  }, [searchParams, companies]); // Need companies loaded to set default companyId

  // Metrics Calculations
  const outstandingProformaNum = invoices
    .filter((inv) => inv.status === "Pending" || inv.invoiceNo?.startsWith("PF"))
    .reduce((sum, inv) => sum + parseFloat(inv.amount.replace(/[^0-9.-]+/g, "") || "0"), 0);
  
  const finalizedTotalNum = invoices
    .filter((inv) => inv.status === "Cleared")
    .reduce((sum, inv) => sum + parseFloat(inv.amount.replace(/[^0-9.-]+/g, "") || "0"), 0);

  const unpaidOverdueNum = invoices
    .filter((inv) => inv.status === "Overdue")
    .reduce((sum, inv) => sum + parseFloat(inv.amount.replace(/[^0-9.-]+/g, "") || "0"), 0);

  const pendingCount = invoices.filter((inv) => inv.status === "Pending").length;
  const overdueCount = invoices.filter((inv) => inv.status === "Overdue").length;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);

  // Drawer Handlers
  const closeDrawer = () => {
    setDrawerOpen(false);
    setIsEditMode(false);
    setEditingInvoiceId(null);
    setFormData({
      invoiceNo: "",
      companyId: 0,
      date: formatDateInput(new Date()),
      dueDate: formatDateInput(addDays(new Date(), 14)),
      amount: "₹ 0.00",
      status: "Pending",
    });
  };

  const openDrawerForCreate = () => {
    setIsEditMode(false);
    setEditingInvoiceId(null);
    setFormData({
      invoiceNo: `PF-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`,
      companyId: companies.length > 0 ? companies[0].id : 0,
      date: formatDateInput(new Date()),
      dueDate: formatDateInput(addDays(new Date(), 14)),
      amount: "₹ 1000.00",
      status: "Pending",
    });
    setDrawerOpen(true);
  };

  const openDrawerForEdit = (invoice: any) => {
    setIsEditMode(true);
    setEditingInvoiceId(invoice.id);
    setFormData({
      invoiceNo: invoice.invoiceNo || "",
      companyId: invoice.companyId || 0,
      date: invoice.date || "",
      dueDate: invoice.dueDate || "",
      amount: invoice.amount || "",
      status: invoice.status || "Pending",
    });
    setDrawerOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === "companyId" ? parseInt(value, 10) : value });
  };

  // CRUD Actions
  const saveInvoice = async () => {
    try {
      const selectedCompany = companies.find((c) => c.id === formData.companyId);
      const payload = {
        ...formData,
        companyName: selectedCompany ? selectedCompany.name : "Unknown Entity",
        companyInitial: selectedCompany ? selectedCompany.name.substring(0, 2).toUpperCase() : "NA",
      };

      if (isEditMode && editingInvoiceId !== null) {
        await app.service("invoices").patch(editingInvoiceId, payload);
      } else {
        await app.service("invoices").create(payload);
      }
      closeDrawer();
      loadData();
    } catch (err: any) {
      console.error("Save Error:", err);
      const message = err.message || "Unknown error occurred.";
      alert(`Action Failed: ${message}`);
    }
  };

  const deleteInvoice = async (id: number) => {
    await app.service("invoices").remove(id);
    loadData();
  };

  const openDeleteModal = (id: number, invoiceNo: string) => {
    setInvoiceToDelete({ id, invoiceNo });
    setDeleteModalOpen(true);
  };

  const markAsPaid = async (id: number) => {
    await app.service("invoices").patch(id, { status: "Cleared" });
    loadData();
  };

  const downloadInvoice = (invoice: any) => {
    const client = companies.find((c) => c.id === invoice.companyId) || {};
    
    // Exact Company Details from Template
    const yourCompany = {
      name: "The H Enterprises",
      gst: "33AFQPH8317G1ZD",
      address: "No:121/2 kamala Garden, Bakthavachalam Nagar, Ankaputhure",
      city: "Chennai -600070",
      mobile: "9566689748",
      email: "maxirevota@gmail.com"
    };

    const bankDetails = {
      name: "The H Enterprises",
      accNo: "920020056431640",
      bank: "Axis Bank",
      branch: "Pallavaram",
      ifsc: "UTIB0000851"
    };

    import("jspdf").then(({ jsPDF }) => {
      try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const colWidth = (pageWidth - (margin * 2)) / 2;

        // 1. Logo (Branding)
        const logoData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlkAAAHMCAYAAADmu70qAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNq78p84AAAAsZEVYdENyZWF0aW9uIFRpbWUAZGEgMTEgTWF5IDIwMjYgMjI6Mzc6NTUgKzA1MzAYDk3rAAANlElEQVR4nO3dfZBdZVkH8N/ZfO7uZjebzSbZrCHZDZBNu9mXm03aZDeZpBWSdtpWp9Np64wjOK1Wh9ZatR11HNo69Yf+oTNVB6vVQevYVqtTx2p16vRR6/Rpq8607Z/O7GZ2k91Nsptkk3Dvc/fHH9+Y0N29u3vvnHOf835mZifp7t577z3P835y7j0nAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4z9m265vU2Hh83yE8N7bt+iZNmW7p9Pizv/P7fW9f91HqHh9l6X7zOfpZ39/K3SreWPL7I3699fXm7Iu/2Zf9u6M9un996fL3+0fHjWvL307f/Oof+qEfm7/10f760OfvTbe6P6fE59/rO/+Yf/fK6X7z9dY+9Lp3fdf08f6v/NfXfV3X3j72V3zR0V6f5f9W936MdfM6X5vI9BqV3jE69W/vj8qH8uY89fS1q6M+vM9v/X7m/G9v6/N72uof/V1f29qffT+OfpafM39/Wj259Vv0W86vV7/p8uXOfn9+P9M6uO970u2+H6v97+X9m8Y4T25u08579uL02E+Y9K1/K9+r+Hh0X22M65P49Z+Y9r1tPzS67761v7f717H+6/R99M3XWJ2yL7uP89M+7O+X4/380OfvV3vPZfr6XvR7R/f8uHHp976XG/0p89eH2tfL+S7p7+9f7v716v85fR8dfyS5X+rY5+Uf7XmY0v1UvOnoo0Zl0/7+3P8/ff/Yv8z9x9UfG8N2P9O/79O+H8fT77K079/Y6L9O/4+O/pjY2L/f3099+eWffGq05/vHl//4o4vT8Xv2zY375mS7P19ufp8f57+Xp33S18f9P6Y7eXfK9/6tPr/p9/vXof7rfO+fN8976PfM0Z8uX78f7eXG9Xm2e/pM33y9s78/K6+X8fHe7+9fP/F7e7XfS/m7+Uf71y/065v+8U3/8vS65vO9/P38Y/m6uXf7m5Zf6uN03/v7/evY/035+P6P83+v/5XF6Xj26I97Y79/jO/Z08Y4Hh/3v7X8vXzN/u/799/zP8v92370m3P2M60/+/89/f/z6Wff/2N/f6b+9X9H5S/yM9O+9X70R9H+Z97753mXfH609/O93P8M/99G+/mZ+9W/vR/tmXF/G6P//NjfP7P/mdXv/9v83v6X8/s788W3/+3p/tGfPvqjx2fG5Yv8Zf5Z7r8/t/mZz03H7L6fXvzMvX0/fV+m/fXitE/6PZ832v8+2n+uTvukr4/7P9L3R8f7T9/0v6M/08f7f2Z0/OicfU9rf+a/+a/Xv6/v/G/+fvrv9P/O6P+5zWfG/XG2e/qP8vU//Z3fn7P/efo+Ov5Zvv7nH79v9X/88S+9Ldf/7Id+6M9O/vL02vXm688fN778e3m/pP+Z7uSdKd/7+m8v3z/p633f8x3fPqZ7SndO6c6T+uR0Oukn8fAn3XzSSf+mO0m66WTSv/L88+3/AD4N56eInR26AAAAAElFTkSuQmCC";
        doc.addImage(logoData, "PNG", margin, 10, 40, 30);

        // 2. Title & GST
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Proforma Invoice", pageWidth / 2, 45, { align: "center" });
        doc.setLineWidth(0.5);
        doc.line((pageWidth / 2) - 25, 47, (pageWidth / 2) + 25, 47);
        
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(`GSTNo: ${yourCompany.gst}`, 190, 45, { align: "right" });

        // 3. Header Tables (Client & Invoice Info)
        doc.setDrawColor(0);
        const headerFill = [235, 241, 245];
        
        // Left Box (Client)
        doc.setFillColor(headerFill[0], headerFill[1], headerFill[2]);
        doc.rect(margin, 55, colWidth, 25, "FD");
        doc.setFontSize(11);
        doc.text(String(invoice.companyName).toUpperCase(), margin + (colWidth / 2), 62, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(String(client.city || "Chennai"), margin + (colWidth / 2), 68, { align: "center" });
        doc.setFont("helvetica", "bold");
        doc.text(String(client.gstNumber || "N/A"), margin + (colWidth / 2), 74, { align: "center" });

        // Right Box (Invoice Meta) - FIX: Explicitly set fill color again to avoid black
        doc.setFillColor(headerFill[0], headerFill[1], headerFill[2]);
        doc.rect(margin + colWidth, 55, colWidth, 25, "FD");
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0); // Ensure text is black
        doc.text(`Invoice No   : ${invoice.invoiceNo}`, margin + colWidth + 5, 62);
        doc.text(`Invoice Date : ${invoice.date}`, margin + colWidth + 5, 68);
        doc.text(`Due date      : ${invoice.dueDate || "N/A"}`, margin + colWidth + 5, 74);

        // 4. Main Item Table
        const startY = 80;
        const rowH = 8;
        const cleanAmount = parseFloat(String(invoice.amount).replace(/[^0-9.-]+/g, "") || "0");
        const gstAmount = cleanAmount * 0.18;
        const totalAmount = cleanAmount + gstAmount;

        // Rows
        doc.setFont("helvetica", "normal");
        doc.rect(margin, startY, colWidth * 1.5, rowH);
        doc.text("Professional software management fee", margin + 5, startY + 5.5);
        doc.rect(margin + (colWidth * 1.5), startY, colWidth * 0.5, rowH);
        doc.text(cleanAmount.toFixed(2), margin + (colWidth * 2) - 5, startY + 5.5, { align: "right" });

        doc.rect(margin, startY + rowH, colWidth * 1.5, rowH);
        doc.text("GST 18%", margin + (colWidth * 0.75), startY + rowH + 5.5, { align: "center" });
        doc.rect(margin + (colWidth * 1.5), startY + rowH, colWidth * 0.5, rowH);
        doc.text(gstAmount.toFixed(2), margin + (colWidth * 2) - 5, startY + rowH + 5.5, { align: "right" });

        doc.setFont("helvetica", "bold");
        doc.rect(margin, startY + (rowH * 2), colWidth * 1.5, rowH);
        doc.text("Total", margin + (colWidth * 0.75), startY + (rowH * 2) + 5.5, { align: "center" });
        doc.rect(margin + (colWidth * 1.5), startY + (rowH * 2), colWidth * 0.5, rowH);
        doc.text(totalAmount.toFixed(2), margin + (colWidth * 2) - 5, startY + (rowH * 2) + 5.5, { align: "right" });

        // 5. Bank Details Table
        const bankY = 115;
        doc.setFontSize(12);
        doc.text("Bank Details:-", margin, bankY);
        
        const bRowH = 7;
        const bLabels = ["ACCOUNT NAME", "ACCOUNT NUMBER", "BANK NAME", "BRANCH", "IFSC CODE"];
        const bValues = [bankDetails.name, bankDetails.accNo, bankDetails.bank, bankDetails.branch, bankDetails.ifsc];

        doc.setFontSize(10);
        bLabels.forEach((label, i) => {
          const y = bankY + 5 + (i * bRowH);
          doc.setFillColor(245, 245, 245);
          doc.rect(margin, y, colWidth * 0.8, bRowH, "FD");
          doc.setFont("helvetica", "normal");
          doc.text(label, margin + 5, y + 4.5);
          
          doc.setFillColor(235, 241, 245);
          doc.rect(margin + (colWidth * 0.8), y, colWidth * 1.2, bRowH, "FD");
          doc.text(bValues[i], margin + (colWidth * 1.4), y + 4.5, { align: "center" });
        });

        // 6. Signatures & QR
        const footerTop = 170;
        doc.setFont("helvetica", "bold");
        doc.text("For The H Enterprises", 190, footerTop + 10, { align: "right" });
        // QR Code
        const qrData = "data:image/png;base64,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";
        doc.addImage(qrData, "PNG", margin, footerTop, 45, 45);

        // Signature
        const sigData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAACfCAYAAABm62X8AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNq78p84AAAAsZEVYdENyZWF0aW9uIFRpbWUAZGEgMTEgTWF5IDIwMjYgMjI6Mzc6NDIgKzA1MzB16FkXAAAXrUlEQVR4nO3dfZBdZVkH8N/ZfO7uZjebzSbZrCHZDZBNu9mXm03aZDeZpBWSdtpWp9Np64wjOK1Wh9ZatR11HNo69Yf+oTNVB6vVQevYVqtTx2p16vRR6/Rpq8607Z/O7GZ2k91Nsptkk3Dvc/fHH9+Y0N29u3vvnHOf835mZifp7t577z3P835y7j0nAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4z9m265vU2Hh83yE8N7bt+iZNmW7p9Pizv/P7fW9f91HqHh9l6X7zOfpZ39/K3SreWPL7I3699fXm7Iu/2Zf9u6M9un996fL3+0fHjWvL307f/Oof+qEfm7/10f760OfvTbe6P6fE59/rO/+Yf/fK6X7z9dY+9Lp3fdf08f6v/NfXfV3X3j72V3zR0V6f5f9W936MdfM6X5vI9BqV3jE69W/vj8qH8uY89fS1q6M+vM9v/X7m/G9v6/N72uof/V1f29qffT+OfpafM39/Wj259Vv0W86vV7/p8uXOfn9+P9M6uO970u2+H6v97+X9m8Y4T25u08579uL02E+Y9K1/K9+r+Hh0X22M65P49Z+Y9r1tPzS67761v7f717H+6/R99M3XWJ2yL7uP89M+7O+X4/380OfvV3vPZfr6XvR7R/f8uHHp976XG/0p89eH2tfL+S7p7+9f7v716v85fR8dfyS5X+rY5+Uf7XmY0v1UvOnoo0Zl0/7+3P8/ff/Yv8z9x9UfG8N2P9O/79O+H8fT77K079/Y6L9O/4+O/pjY2L/f3099+eWffGq05/vHl//4o4vT8Xv2zY375mS7P19ufp8f57+Xp33S18f9P6Y7eXfK9/6tPr/p9/vXof7rfO+fN8976PfM0Z8uX78f7eXG9Xm2e/pM33y9s78/K6+X8fHe7+9fP/F7e7XfS/m7+Uf71y/065v+8U3/8vS65vO9/P38Y/m6uXf7m5Zf6uN03/v7/evY/035+P6P83+v/5XF6Xj26I97Y79/jO/Z08Y4Hh/3v7X8vXzN/u/799/zP8v92370m3P2M60/+/89/f/z6Wff/2N/f6b+9X9H5S/yM9O+9X70R9H+Z97753mXfH609/O93P8M/99G+/mZ+9W/vR/tmXF/G6P//NjfP7P/mdXv/9v83v6X8/s788W3/+3p/tGfPvqjx2fG5Yv8Zf5Z7r8/t/mZz03H7L6fXvzMvX0/fV+m/fXitE/6PZ832v8+2n+uTvukr4/7P9L3R8f7T9/0v6M/08f7f2Z0/OicfU9rf+a/+a/Xv6/v/G/+fvrv9P/O6P+5zWfG/XG2e/qP8vU//Z3fn7P/efo+Ov5Zvv7nH79v9X/88S+9Ldf/7Id+6M9O/vL02vXm688fN778e3m/pP+Z7uSdKd/7+m8v3z/p633f8x3fPqZ7SndO6c6T+uR0Oukn8fAn3XzSSf+mO0m66WTSv/L88+3/AD4N56eInR26AAAAAElFTkSuQmCC";
        doc.addImage(sigData, "PNG", 150, footerTop + 15, 40, 15);

        doc.setFontSize(10);
        doc.text("Authorized Signature", 190, footerTop + 45, { align: "right" });

        // 7. Page Footer
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(yourCompany.name, pageWidth / 2, 265, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(yourCompany.address + " , " + yourCompany.city, pageWidth / 2, 271, { align: "center" });
        doc.text(`Mobile : ${yourCompany.mobile} ; Email : ${yourCompany.email}`, pageWidth / 2, 276, { align: "center" });

        doc.save(`Invoice_${invoice.invoiceNo}.pdf`);
      } catch (err) {
        console.error("PDF generation error:", err);
        alert("Could not generate PDF.");
      }
    });
  };

  return (
    <div className="relative p-4 sm:p-8 z-0">
      <div className="absolute left-4 top-6 h-64 w-64 rounded-full bg-primary/5 blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-6 h-64 w-64 rounded-full bg-secondary-container/10 blur-3xl -z-10"></div>

      <div className="relative mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-1">
          <p className="font-label text-on-surface-variant text-xs uppercase tracking-widest font-semibold">
            Ledger Overview
          </p>
          <h2 className="font-headline text-3xl font-extrabold text-primary tracking-tight">
            Invoice Management
          </h2>
        </div>
        <button
          onClick={openDrawerForCreate}
          className="crm-primary-btn w-full md:w-auto justify-center text-on-primary px-6 py-3 rounded-xl font-headline font-bold flex items-center gap-2 transition-all active:scale-95 border-none"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="crm-panel p-6 rounded-xl hover:border-outline-variant/15 transition-all">
          <p className="text-on-surface-variant text-xs font-medium mb-1">Outstanding Proforma</p>
          <h3 className="font-headline text-2xl font-bold text-on-surface">{formatCurrency(outstandingProformaNum)}</h3>
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight">
              {pendingCount} Pending
            </span>
          </div>
        </div>
        <div className="crm-panel p-6 rounded-xl hover:border-outline-variant/15 transition-all">
          <p className="text-on-surface-variant text-xs font-medium mb-1">Finalized Total (All Time)</p>
          <h3 className="font-headline text-2xl font-bold text-on-surface">{formatCurrency(finalizedTotalNum)}</h3>
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-primary-fixed text-primary px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight">
              &uarr; Verified Ledger
            </span>
          </div>
        </div>
        <div className="crm-panel p-6 rounded-xl hover:border-outline-variant/15 transition-all">
          <p className="text-on-surface-variant text-xs font-medium mb-1">Average Collection Time</p>
          <h3 className="font-headline text-2xl font-bold text-on-surface">14.2 Days</h3>
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight">
              Efficient
            </span>
          </div>
        </div>
        <div className="crm-panel p-6 rounded-xl hover:border-outline-variant/15 transition-all">
          <p className="text-on-surface-variant text-xs font-medium mb-1">Unpaid Overdue</p>
          <h3 className="font-headline text-2xl font-bold text-error">{formatCurrency(unpaidOverdueNum)}</h3>
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight">
              {overdueCount} Invoices
            </span>
          </div>
        </div>
      </div>

      <div className="crm-panel rounded-2xl p-1 mb-1 flex items-center justify-between">
        <div className="flex gap-1">
          <button className="bg-surface-container-lowest text-primary font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm border-none">
            All Invoices
          </button>
        </div>
      </div>

      <div className="crm-panel rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-surface-container-low/50">
              <th className="px-6 py-5 font-label text-[10px] uppercase tracking-widest font-extrabold text-on-surface-variant">
                Invoice No.
              </th>
              <th className="px-6 py-5 font-label text-[10px] uppercase tracking-widest font-extrabold text-on-surface-variant">
                Client Entity
              </th>
              <th className="px-6 py-5 font-label text-[10px] uppercase tracking-widest font-extrabold text-on-surface-variant">
                Issue Date
              </th>
              <th className="px-6 py-5 font-label text-[10px] uppercase tracking-widest font-extrabold text-on-surface-variant">
                Due Date
              </th>
              <th className="px-6 py-5 font-label text-[10px] uppercase tracking-widest font-extrabold text-on-surface-variant">
                Amount Due
              </th>
              <th className="px-6 py-5 font-label text-[10px] uppercase tracking-widest font-extrabold text-on-surface-variant">
                Status
              </th>
              <th className="px-6 py-5 font-label text-[10px] uppercase tracking-widest font-extrabold text-on-surface-variant text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center opacity-70">
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  <p className="text-sm font-bold mt-2">Loading Invoices...</p>
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center opacity-70">
                  <p className="text-sm font-bold">No Invoices found in the Ledger.</p>
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="group hover:bg-surface-container-low/30 transition-colors">
                  <td className="px-6 py-5">
                    <span className="font-headline font-bold text-primary">{inv.invoiceNo || `PF-${inv.id}`}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden text-[10px] font-bold">
                        {inv.companyInitial}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface text-sm">{inv.companyName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-on-surface-variant">{inv.date}</td>
                  <td className="px-6 py-5 text-sm font-medium text-on-surface-variant">{inv.dueDate || "-"}</td>
                  <td className="px-6 py-5 font-headline font-bold text-on-surface">{inv.amount}</td>
                  <td className="px-6 py-5">
                    {inv.status === "Cleared" ? (
                      <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight inline-flex items-center gap-1">
                        Cleared
                      </span>
                    ) : inv.status === "Overdue" ? (
                      <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                        Overdue
                      </span>
                    ) : (
                      <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      {inv.status === "Pending" && (
                        <button
                          onClick={() => markAsPaid(inv.id)}
                          title="Mark Cleared"
                          className="bg-primary text-on-primary w-8 h-8 rounded-lg flex items-center justify-center hover:brightness-110 active:scale-95 border-none"
                        >
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                        </button>
                      )}
                      {inv.status === "Pending" && (
                        <button
                          onClick={() => {
                            app.service("invoices").patch(inv.id, { status: "Overdue" }).then(loadData);
                          }}
                          title="Mark Overdue"
                          className="bg-error-container text-error w-8 h-8 rounded-lg flex items-center justify-center hover:brightness-110 active:scale-95 border-none"
                        >
                          <span className="material-symbols-outlined text-sm">warning</span>
                        </button>
                      )}
                      <button
                        onClick={() => downloadInvoice(inv)}
                        title="Download PDF"
                        className="w-8 h-8 hover:bg-primary/10 rounded-lg flex items-center justify-center text-primary border-none bg-transparent"
                      >
                        <span className="material-symbols-outlined text-lg">file_download</span>
                      </button>
                      <button
                        onClick={() => openDrawerForEdit(inv)}
                        title="Edit Invoice"
                        className="w-8 h-8 hover:bg-surface-container-high rounded-lg flex items-center justify-center text-on-surface-variant border-none bg-transparent"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => openDeleteModal(inv.id, inv.invoiceNo)}
                        title="Delete Invoice"
                        className="w-8 h-8 hover:bg-error-container rounded-lg flex items-center justify-center text-error border-none bg-transparent"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
                {isEditMode ? "Edit Invoice" : "Generate Invoice"}
              </h3>
              <p className="text-sm text-on-surface-variant font-medium">
                {isEditMode ? "Modify an existing accounting record." : "Issue a standardized ledger format."}
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
                Document Genesis
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant mb-1 ml-1">
                      Invoice Sequence No.
                    </label>
                    <input
                      name="invoiceNo"
                      value={formData.invoiceNo}
                      onChange={handleChange}
                      className="crm-drawer-field w-full p-4 rounded-xl text-sm font-mono border-x-0 border-t-0 border-b-2 border-b-slate-400 focus:border-b-primary focus:ring-0 transition-all outline-none"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant mb-1 ml-1">
                      Issue Date
                    </label>
                    <input
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="crm-drawer-field w-full p-4 rounded-xl text-sm border-x-0 border-t-0 border-b-2 border-b-slate-400 focus:border-b-primary focus:ring-0 transition-all outline-none"
                      type="date"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant mb-1 ml-1">
                      Due Date
                    </label>
                    <input
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className="crm-drawer-field w-full p-4 rounded-xl text-sm border-x-0 border-t-0 border-b-2 border-b-slate-400 focus:border-b-primary focus:ring-0 transition-all outline-none"
                      type="date"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">
                Relational Entity
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant mb-1 ml-1">
                    Select Valid Company
                  </label>
                  <select
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleChange}
                    className="crm-drawer-field w-full p-4 rounded-xl text-sm border-x-0 border-t-0 border-b-2 border-b-slate-400 focus:border-b-primary focus:ring-0 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value={0} disabled>-- Select Company --</option>
                    {companies.map((co) => (
                      <option key={co.id} value={co.id}>
                        {co.name} {co.gstNumber ? `(${co.gstNumber})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">
                Financial Calculus
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant mb-1 ml-1">
                      Gross Amount
                    </label>
                    <input
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      className="crm-drawer-field w-full p-4 rounded-xl font-headline font-bold text-sm border-x-0 border-t-0 border-b-2 border-b-slate-400 focus:border-b-primary focus:ring-0 transition-all outline-none"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant mb-1 ml-1">
                      Collection Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="crm-drawer-field w-full p-4 rounded-xl text-sm font-bold border-x-0 border-t-0 border-b-2 border-b-slate-400 focus:border-b-primary focus:ring-0 transition-all outline-none appearance-none cursor-pointer"
                    >
                      <option value="Pending">Pending Validation</option>
                      <option value="Cleared">Cleared (Paid)</option>
                      <option value="Overdue">Overdue (Critical)</option>
                    </select>
                  </div>
                </div>
              </div>
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
            onClick={saveInvoice}
            disabled={formData.companyId === 0}
            className="flex-1 bg-primary text-on-primary px-6 py-4 rounded-xl font-bold shadow-sm hover:opacity-90 transition-all text-center border-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditMode ? "Update Invoice" : "Generate Receipt"}
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => invoiceToDelete && deleteInvoice(invoiceToDelete.id)}
        title="Delete Invoice?"
        message={`Are you sure you want to permanently delete invoice ${invoiceToDelete?.invoiceNo}? This action is irreversible.`}
        confirmText="Confirm Delete"
        type="danger"
      />
    </div>
  );
}

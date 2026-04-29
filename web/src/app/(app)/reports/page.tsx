"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import app from "../../../lib/feathersClient";

export default function ReportsPage() {
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingCompanyId, setSendingCompanyId] = useState<number | null>(null);
  const [reminderStateByCompany, setReminderStateByCompany] = useState<
    Record<number, { status: string; message: string }>
  >({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await app.service("invoices").find({ query: { $limit: 1000 } });
        setInvoices(res.data || res);
      } catch (err) {
        console.error("Error fetching ledger for reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);
  };

  const parseAmount = (amountStr: string) => {
    if (!amountStr) return 0;
    return parseFloat(amountStr.replace(/[^0-9.-]+/g, "")) || 0;
  };

  // Financial Computations
  const totalVolume = invoices.reduce((sum, inv) => sum + parseAmount(inv.amount), 0);
  const clearedTotal = invoices
    .filter((i) => i.status === "Cleared")
    .reduce((sum, inv) => sum + parseAmount(inv.amount), 0);
  const pendingTotal = invoices
    .filter((i) => i.status === "Pending" || i.status === "Overdue")
    .reduce((sum, inv) => sum + parseAmount(inv.amount), 0);
  const overdueTotal = invoices
    .filter((i) => i.status === "Overdue")
    .reduce((sum, inv) => sum + parseAmount(inv.amount), 0);

  const clearedPercentage = totalVolume > 0 ? Math.round((clearedTotal / totalVolume) * 100) : 0;
  const pendingPercentage = totalVolume > 0 ? Math.round((pendingTotal / totalVolume) * 100) : 0;

  // Sub-Ledger Analysis (Group by Company for Pending/Overdue)
  const companyLedgers = invoices
    .filter((i) => i.status === "Pending" || i.status === "Overdue")
    .reduce((acc: any, inv: any) => {
      if (!acc[inv.companyId]) {
        acc[inv.companyId] = {
          companyId: inv.companyId,
          companyName: inv.companyName,
          companyInitial: inv.companyInitial,
          totalOwed: 0,
          oldestDate: new Date().getTime(), // track oldest pending invoice
          statusFlag: "Pending", // escalate if any invoice is Overdue
        };
      }

      acc[inv.companyId].totalOwed += parseAmount(inv.amount);
      const invDate = new Date(inv.dueDate || inv.date).getTime() || new Date().getTime();
      if (invDate < acc[inv.companyId].oldestDate) {
        acc[inv.companyId].oldestDate = invDate;
      }
      if (inv.status === "Overdue") {
        acc[inv.companyId].statusFlag = "Overdue";
      }

      return acc;
    }, {});

  const companyDebtorsArray = Object.values(companyLedgers)
    .sort((a: any, b: any) => b.totalOwed - a.totalOwed)
    .slice(0, 10); // Top 10 worst offenders

  const calculateAging = (oldestDate: number) => {
    const daysAgo = Math.floor((new Date().getTime() - oldestDate) / (1000 * 60 * 60 * 24));
    if (daysAgo > 0) return `${daysAgo} Days`;
    if (daysAgo === 0) return "Due Today";
    return "Upcoming";
  };

  const monthlyRevenueData = useMemo(() => {
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const now = new Date();
    const result: { label: string; month: number; year: number; total: number; isCurrent: boolean }[] = [];

    // Get last 7 months including current
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearStr = d.getFullYear() !== now.getFullYear() ? ` '${String(d.getFullYear()).slice(-2)}` : "";
      result.push({
        label: `${monthNames[d.getMonth()]}${yearStr}`,
        month: d.getMonth(),
        year: d.getFullYear(),
        total: 0,
        isCurrent: i === 0,
      });
    }

    invoices.forEach((inv) => {
      const d = new Date(inv.date);
      if (isNaN(d.getTime())) return;
      
      const m = d.getMonth();
      const y = d.getFullYear();

      const bucket = result.find((r) => r.month === m && r.year === y);
      if (bucket) {
        bucket.total += parseAmount(inv.amount);
      }
    });

    const maxTotal = Math.max(...result.map((r) => r.total), 0);
    return result.map((r) => ({
      ...r,
      height: maxTotal > 0 ? Math.max((r.total / maxTotal) * 80, 4) : 4, // 4% minimum height for better empty state
    }));
  }, [invoices]);

  const sendReminder = async (companyId: number) => {
    setSendingCompanyId(companyId);

    try {
      const result = await app.service("collection-reminders").create({ companyId });
      setReminderStateByCompany((current) => ({
        ...current,
        [companyId]: {
          status: result.notificationStatus,
          message: result.notificationMessage,
        },
      }));
    } catch (error) {
      console.error("Failed to send collection reminder", error);
      setReminderStateByCompany((current) => ({
        ...current,
        [companyId]: {
          status: "failed",
          message: "The reminder request could not be completed.",
        },
      }));
    } finally {
      setSendingCompanyId((current) => (current === companyId ? null : current));
    }
  };

  const handleExportExcel = async () => {
    if (invoices.length === 0) return;

    try {
      const ExcelJS = (await import("exceljs")).default;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Ledger Summary");

      // Define columns
      worksheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Invoice #", key: "invoiceNumber", width: 18 },
        { header: "Company", key: "companyName", width: 35 },
        { header: "Type", key: "invoiceType", width: 15 },
        { header: "Amount", key: "amount", width: 15, style: { numFmt: '"₹"#,##0.00' } },
        { header: "Status", key: "status", width: 12 },
        { header: "Due Date", key: "dueDate", width: 15 },
      ];

      // Format Header Row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "0F172A" }, // Slate 950
      };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };
      headerRow.height = 25;

      // Add Rows
      invoices.forEach((inv) => {
        const row = worksheet.addRow({
          date: inv.date,
          invoiceNumber: inv.invoiceNumber,
          companyName: inv.companyName,
          invoiceType: inv.invoiceType,
          amount: parseAmount(inv.amount),
          status: inv.status,
          dueDate: inv.dueDate,
        });

        // Add alternate row styling
        if (row.number % 2 === 0) {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F8FAFC" }, // Slate 50
          };
        }
      });

      // Border for all data cells
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "E2E8F0" } },
            left: { style: "thin", color: { argb: "E2E8F0" } },
            bottom: { style: "thin", color: { argb: "E2E8F0" } },
            right: { style: "thin", color: { argb: "E2E8F0" } },
          };
        });
      });

      // Write to Buffer and Download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `financial_summary_${new Date().toISOString().split("T")[0]}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Excel export failed:", err);
      alert("Failed to generate Excel report. Please try again.");
    }
  };

  return (
    <div className="relative p-4 sm:p-8 z-0 min-h-[calc(100vh-100px)]">
      <div className="absolute left-4 top-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl -z-10"></div>
      <div className="absolute bottom-6 right-6 h-64 w-64 rounded-full bg-secondary-container/10 blur-3xl -z-10"></div>

      <div className="mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">Financial Reports</h1>
          <p className="text-on-surface-variant text-sm font-['Inter']">
            Analytical insights and detailed ledgers for fiscal analysis.
          </p>
        </div>
        <div className="crm-panel flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl">
          <div className="flex bg-surface-container-low rounded-lg p-1 w-full sm:w-auto">
            <button className="flex-1 sm:px-4 py-1.5 text-xs font-semibold rounded-md transition-all bg-primary text-white shadow-sm border-none">
              All Time
            </button>
            <button className="flex-1 sm:px-4 py-1.5 text-xs font-medium text-on-surface-variant rounded-md hover:bg-surface-variant transition-all border-none bg-transparent">
              Quarterly
            </button>
          </div>
          <div className="hidden sm:block h-8 w-[1px] bg-outline-variant/50"></div>
          <button 
            onClick={handleExportExcel}
            className="crm-primary-btn w-full sm:w-auto text-on-primary px-5 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all border-none"
          >
            <span className="material-symbols-outlined text-sm">file_download</span>
            Export Summary
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-8 relative z-10">
        <div className="col-span-12 lg:col-span-8 crm-panel rounded-xl p-8 transition-all">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-lg font-bold text-on-surface tracking-tight font-headline">
                Monthly Revenue Performance
              </h3>
              <p className="text-xs text-on-surface-variant font-medium">
                Net operational revenue structure based on current ledger.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-surface-container-low rounded-lg p-1">
                <button 
                  onClick={() => setChartType("bar")}
                  className={`p-1.5 rounded-md transition-all border-none ${chartType === "bar" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:bg-surface-variant"}`}
                  title="Bar Chart"
                >
                  <span className="material-symbols-outlined text-sm block">bar_chart</span>
                </button>
                <button 
                  onClick={() => setChartType("line")}
                  className={`p-1.5 rounded-md transition-all border-none ${chartType === "line" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:bg-surface-variant"}`}
                  title="Line Chart"
                >
                  <span className="material-symbols-outlined text-sm block">show_chart</span>
                </button>
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-primary px-2 py-1 bg-primary-container/10 rounded-lg">
                <span className="material-symbols-outlined text-xs">trending_up</span>
                +12.4%
              </span>
            </div>
          </div>

          <div className="relative h-48">
            {chartType === "bar" ? (
              <div className="flex items-end justify-between h-full gap-3">
                {monthlyRevenueData.map((data, idx) => (
                  <div key={idx} className="group relative flex-1 flex flex-col items-center h-full justify-end">
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20">
                      {formatCurrency(data.total).split(".")[0]}
                    </div>
                    
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        data.isCurrent 
                          ? "bg-primary group-hover:opacity-90" 
                          : "bg-primary-container/30 group-hover:bg-primary/20"
                      }`}
                      style={{ height: `${data.height}%` }}
                    ></div>
                    <span className={`mt-3 text-[10px] font-bold font-label ${
                      data.isCurrent ? "text-primary" : "text-slate-400"
                    }`}>
                      {data.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative h-full w-full group/chart">
                <svg className="w-full h-full" viewBox="0 0 1000 100">
                  <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Horizontal Grid Lines */}
                  {[20, 40, 60, 80].map((y) => (
                    <line 
                      key={y} 
                      x1="0" y1={y} x2="1000" y2={y} 
                      stroke="currentColor" 
                      strokeWidth="0.5" 
                      className="text-slate-100" 
                    />
                  ))}

                  {/* Smooth Curved Line Path */}
                  <path
                    d={`
                      M 70,${100 - monthlyRevenueData[0].height}
                      ${monthlyRevenueData.slice(1).map((d, i) => {
                        const prev = monthlyRevenueData[i];
                        const curr = d;
                        const cp1x = i * 143 + 70 + 70;
                        const cp1y = 100 - prev.height;
                        const cp2x = (i + 1) * 143 + 70 - 70;
                        const cp2y = 100 - curr.height;
                        return `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${(i + 1) * 143 + 70},${100 - curr.height}`;
                      }).join(" ")}
                    `}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                    className="transition-all duration-1000 ease-in-out"
                  />

                  {/* Data Points (Glow Effect) */}
                  {monthlyRevenueData.map((d, i) => (
                    <g key={i} className="cursor-pointer group/point">
                      <circle
                        cx={i * 143 + 70}
                        cy={100 - d.height}
                        r="10"
                        fill="#2563eb"
                        className="opacity-0 group-hover/point:opacity-10 transition-opacity"
                      />
                      <circle
                        cx={i * 143 + 70}
                        cy={100 - d.height}
                        r="3.5"
                        fill="white"
                        stroke="#2563eb"
                        strokeWidth="2"
                        className="transition-all duration-700"
                      />
                      <title>{d.label}: {formatCurrency(d.total)}</title>
                    </g>
                  ))}
                </svg>
                {/* Labels for Area Chart */}
                <div className="flex justify-between absolute -bottom-8 left-0 right-0 px-[5.5%]">
                  {monthlyRevenueData.map((d, i) => (
                    <span key={i} className={`text-[10px] font-bold font-label ${d.isCurrent ? "text-primary" : "text-slate-400"}`}>
                      {d.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 crm-panel rounded-xl p-8 transition-all">
          <h3 className="text-lg font-bold text-on-surface tracking-tight mb-1 font-headline text-center">
            Payment Lifecycle
          </h3>
          <p className="text-xs text-on-surface-variant font-medium text-center mb-8">
            Status breakdown natively computed against global system ledger.
          </p>
          <div className="relative flex justify-center mb-8">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 36 36">
              {/* Background Pending Track */}
              <path
                className="text-surface-container"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray="100, 100"
                strokeWidth="3"
              />
              {/* Foreground Cleared Track */}
              <path
                className="text-primary transition-all duration-1000"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${clearedPercentage}, 100`}
                strokeWidth="3"
              />
              <path
                className="text-error"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${totalVolume > 0 ? (overdueTotal / totalVolume) * 100 : 0}, 100`}
                strokeDashoffset={`-${clearedPercentage}`}
                strokeWidth="3"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold text-primary font-headline">
                {formatCurrency(totalVolume).split(".")[0]}
              </span>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mt-1">
                Gross Sum
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Cleared Total</span>
                <span className="text-sm font-bold text-on-surface">{clearedPercentage}%</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-surface-container-high"></span>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Pending Sum</span>
                <span className="text-sm font-bold text-on-surface">{pendingPercentage}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 crm-panel rounded-xl overflow-hidden">
          <div className="px-8 py-6 flex justify-between items-center bg-white border-b-0">
            <div>
              <h3 className="text-lg font-bold text-on-surface font-headline">Pending Payments by Company</h3>
              <p className="text-xs text-on-surface-variant font-medium">
                Live chronological ledger analyzing aggregated outstanding corporate receivables.
              </p>
            </div>
            <Link href="/invoices" className="text-primary text-xs font-bold hover:underline">
              Manage Collection Flow
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest">
                    Corporate Organization
                  </th>
                  <th className="px-8 py-4 text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest">
                    Aggregated Liability
                  </th>
                  <th className="px-8 py-4 text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest">
                    Aging Metric
                  </th>
                  <th className="px-8 py-4 text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest text-right">
                    Notification Trigger
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-0">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-10 text-center opacity-70">
                      <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                      <p className="text-sm font-bold mt-2 text-primary">Calculating Aggregate Matrix...</p>
                    </td>
                  </tr>
                ) : companyDebtorsArray.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-10 text-center opacity-70">
                      <p className="text-sm font-bold">Incredible! Zero accounts exist in collections or arrears.</p>
                    </td>
                  </tr>
                ) : (
                  companyDebtorsArray.map((org: any) => (
                    <tr key={org.companyId} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-8 py-5 border-transparent">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-primary">
                            {org.companyInitial || "NA"}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-on-surface font-headline">{org.companyName}</div>
                            <div className="text-xs text-on-surface-variant">System Matrix ID: #{org.companyId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 border-transparent">
                        <span className="text-sm font-bold text-primary">{formatCurrency(org.totalOwed)}</span>
                      </td>
                      <td className="px-8 py-5 border-transparent">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${
                            org.statusFlag === "Overdue"
                              ? "bg-error-container text-error"
                              : "bg-tertiary-fixed text-tertiary"
                          }`}
                        >
                          {calculateAging(org.oldestDate)} Open
                          {org.statusFlag === "Overdue" && " (Overdue)"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right border-transparent">
                        <div className="flex flex-col items-end">
                          <button
                            onClick={() => sendReminder(org.companyId)}
                            disabled={sendingCompanyId === org.companyId}
                            title={reminderStateByCompany[org.companyId]?.message || "Send payment reminder"}
                            className="text-primary p-2 hover:bg-primary-container/10 rounded-full transition-all border-none bg-transparent disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <span
                              className={`material-symbols-outlined ${
                                sendingCompanyId === org.companyId ? "animate-spin" : ""
                              }`}
                            >
                              {sendingCompanyId === org.companyId
                                ? "progress_activity"
                                : reminderStateByCompany[org.companyId]?.status === "sent" ||
                                    reminderStateByCompany[org.companyId]?.status === "mocked"
                                  ? "mark_email_read"
                                  : "mail"}
                            </span>
                          </button>
                          {reminderStateByCompany[org.companyId] && (
                            <p
                              className={`mt-1 text-[10px] font-bold uppercase tracking-wide ${
                                reminderStateByCompany[org.companyId].status === "failed"
                                  ? "text-error"
                                  : reminderStateByCompany[org.companyId].status === "skipped"
                                    ? "text-on-surface-variant"
                                    : "text-primary"
                              }`}
                              title={reminderStateByCompany[org.companyId].message}
                            >
                              {reminderStateByCompany[org.companyId].status}
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-primary p-8 sm:p-12 rounded-xl text-on-primary flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden z-10">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-primary-container/20 -skew-x-12 translate-x-1/2"></div>
        <div className="relative z-10 text-center md:text-left">
          <h2 className="text-2xl font-extrabold mb-2 font-headline">Quarterly Audit Ready</h2>
          <p className="text-on-primary/80 text-sm max-w-lg font-['Inter']">
            All financial records for Q2 are synthesized and verified. You can generate a full audit trail for compliance in one click.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 relative z-10 shrink-0 w-full md:w-auto">
          <button className="flex-1 px-6 py-3 bg-white text-primary rounded-lg font-bold text-sm shadow-xl active:scale-95 duration-150 border-none">
            Generate Audit PDF
          </button>
          <Link
            href="/companies"
            className="flex-1 px-6 py-3 bg-primary-container text-white border border-white/20 rounded-lg font-bold text-sm hover:bg-primary-container/80 transition-all text-center flex items-center justify-center"
          >
            Share with stakeholders
          </Link>
        </div>
      </div>

    </div>
  );
}

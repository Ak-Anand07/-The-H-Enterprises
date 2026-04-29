"use client";
import React, { useEffect, useState } from "react";
import { MetricsCard } from "../../../components/Dashboard/MetricsCard";
import { RecentInvoices } from "../../../components/Dashboard/RecentInvoices";
import { QuickActions } from "../../../components/Dashboard/QuickActions";
import { PromoCard } from "../../../components/Dashboard/PromoCard";
import app from "../../../lib/feathersClient";
import { useAuth } from "../../../providers/AuthProvider";

export default function DashboardPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [activeCompanies, setActiveCompanies] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [invoicesRes, companiesRes] = await Promise.all([
          app.service("invoices").find({
            query: {
              $sort: { id: -1 },
              $limit: 10
            }
          }),
          app.service("companies").find({
             query: {
               status: "Active",
               $limit: 0 // Only want active company count for this card
             }
          })
        ]);

        setInvoices(invoicesRes.data || invoicesRes);
        setActiveCompanies(companiesRes.total ?? companiesRes.data?.length ?? companiesRes.length ?? 0);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Aggregate stats
  const parseAmount = (amount: string) => parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;

  const totalRevenueNum = invoices
    .filter(inv => inv.status === "Cleared")
    .reduce((sum, inv) => sum + parseAmount(inv.amount), 0);

  const pendingPaymentsNum = invoices
    .filter(inv => inv.status === "Pending" || inv.status === "Overdue")
    .reduce((sum, inv) => sum + parseAmount(inv.amount), 0);

  const overdueCount = invoices.filter(inv => inv.status === "Overdue").length;
  
  // Format stats
  const totalRevenue = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(totalRevenueNum);
  const pendingPayments = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(pendingPaymentsNum);
  const invoicesSent = invoices.length; // From current batch
  const displayName =
    typeof user?.name === "string" && user.name.trim().length > 0
      ? user.name
      : user?.email?.split("@")[0] ?? "User";

  // Transform invoices for the Component
  const formattedInvoices = invoices.map(inv => ({
    initial: inv.companyInitial || inv.companyName.charAt(0),
    name: inv.companyName,
    date: inv.date,
    amount: inv.amount,
    status: inv.status,
    statusClass: inv.status === "Cleared" 
      ? "bg-primary-fixed text-on-primary-fixed-variant" 
      : "bg-tertiary-container text-on-tertiary-container",
    rowBg: inv.status === "Cleared" ? "" : "bg-surface-container-low/20"
  }));

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center p-8">
        <div className="flex flex-col items-center justify-center gap-4 animate-pulse">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-4 sm:p-8 z-0">
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl -z-10"></div>
      <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-secondary-container/10 blur-3xl -z-10"></div>

      <header className="relative mb-10">
        <h2 className="font-headline text-3xl font-extrabold text-primary tracking-tight">
          Account Dashboard
        </h2>
        <p className="text-on-surface-variant font-medium">
          Welcome back, {displayName}. Here&apos;s your financial overview.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <MetricsCard
          title="Total Revenue"
          icon="payments"
          value={totalRevenue}
          subtitle={
            <>
              <span className="material-symbols-outlined text-xs" data-icon="trending_up">
                trending_up
              </span>
              Calculated from Cleared
            </>
          }
          themeColorClass="bg-primary"
          iconColorClass="text-primary"
          subtitleColorClass="text-primary"
        />
        <MetricsCard
          title="Pending Payments"
          icon="hourglass_empty"
          value={pendingPayments}
          subtitle={`${overdueCount} ${overdueCount === 1 ? "Invoice" : "Invoices"} overdue`}
          themeColorClass="bg-tertiary-container"
          iconColorClass="text-tertiary"
          subtitleColorClass="text-tertiary-container"
        />
        <MetricsCard
          title="Active Companies"
          icon="corporate_fare"
          value={activeCompanies.toString()}
          subtitle="Dynamic count"
          themeColorClass="bg-secondary-fixed"
          iconColorClass="text-secondary"
          subtitleColorClass="text-secondary"
        />
        <MetricsCard
          title="Invoices Issued"
          icon="receipt_long"
          value={invoicesSent.toString()}
          subtitle="Current batch"
          themeColorClass="bg-primary-fixed-dim"
          iconColorClass="text-primary-container"
          subtitleColorClass="text-primary-container"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <RecentInvoices invoices={formattedInvoices} />

        <div className="flex flex-col gap-6">
          <div className="relative">
             <QuickActions />
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl -z-10"></div>
          </div>
          
          <PromoCard />
        </div>
      </div>
    </div>
  );
}

"use client";

/**
 * @module CustomerPage
 * @description Customer dashboard page — product shopping with GPay/Cash.
 */

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { CustomerView } from "@/components/dashboard/CustomerView";
import { useDashboard } from "@/hooks/useDashboard";
import { DashboardSkeleton } from "@/components/shared/DashboardSkeleton";
import type { ISO20022Message } from "@/types";

export default function CustomerPage() {
  const { user, balances, products, taxWarnings, transactions, isLoading, fetchData, handleLogout } = useDashboard("customer");

  if (isLoading || !user) {
    return <DashboardSkeleton />;
  }

  const myBalance = balances?.users?.find((u) => u.username === user.username);

  // Add iso20022 mapping to transactions so CustomerView can render them inline
  const transactionsWithISO = transactions.map((tx) => ({
    ...tx,
    iso20022: tx.iso20022 as ISO20022Message,
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar activeRole="customer" userName={user.name} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          viewTitle="Customer Dashboard"
          viewDescription="Browse perfumes and pay via GPay or Cash"
          userName={user.name}
          userRole={user.role}
          userAddress={user.address}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="animate-fade-in max-w-7xl mx-auto">
            <CustomerView
              balance={myBalance?.balance || "0"}
              address={user.address}
              products={products}
              taxWarnings={taxWarnings}
              transactions={transactionsWithISO}
              onRefresh={fetchData}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

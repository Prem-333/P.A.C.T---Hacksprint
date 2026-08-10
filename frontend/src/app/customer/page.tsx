"use client";

/**
 * @module CustomerPage
 * @description Customer dashboard page — product shopping with GPay/Cash.
 */

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { CustomerView } from "@/components/dashboard/CustomerView";
import { TransactionLog } from "@/components/shared/TransactionLog";
import { useDashboard } from "@/hooks/useDashboard";
import type { ISO20022Message } from "@/types";

export default function CustomerPage() {
  const { user, balances, products, taxWarnings, transactions, isLoading, fetchData, handleLogout } = useDashboard("customer");

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="inline-block w-8 h-8 border-3 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin mb-4" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading Customer Dashboard...</p>
        </div>
      </div>
    );
  }

  const myBalance = balances?.users?.find((u) => u.username === user.username);

  const logEntries = transactions.map((tx) => ({
    txHash: tx.txHash,
    type: tx.type,
    timestamp: tx.timestamp,
    iso20022: tx.iso20022 as ISO20022Message,
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      <Sidebar activeRole="customer" userName={user.name} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          viewTitle="🛍️ Customer Dashboard"
          viewDescription="Browse perfumes and pay via GPay or Cash"
          userName={user.name}
          userRole={user.role}
          userAddress={user.address}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="animate-fade-in">
            <CustomerView
              balance={myBalance?.balance || "0"}
              address={user.address}
              products={products}
              taxWarnings={taxWarnings}
              transactions={transactions}
              onRefresh={fetchData}
            />
          </div>

          <div className="border-t border-[var(--color-border)] pt-6">
            <TransactionLog entries={logEntries} />
          </div>
        </main>
      </div>
    </div>
  );
}

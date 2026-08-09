"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { VendorView } from "@/components/dashboard/VendorView";
import { TransactionLog } from "@/components/shared/TransactionLog";
import { useDashboard } from "@/hooks/useDashboard";
import type { ISO20022Message } from "@/types";

export default function VendorPage() {
  const { user, balances, escrows, transactions, isLoading, handleLogout } = useDashboard("vendor");

  if (isLoading || !user || !balances) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="inline-block w-8 h-8 border-3 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin mb-4" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading Vendor Dashboard...</p>
        </div>
      </div>
    );
  }

  const logEntries = transactions.map((tx) => ({
    txHash: tx.txHash,
    type: tx.type,
    timestamp: tx.timestamp,
    iso20022: tx.iso20022 as ISO20022Message,
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      <Sidebar activeRole="vendor" userName={user.name} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          viewTitle="🔍 Vendor Dashboard — Kanish"
          viewDescription="Monitor all supply chain transactions and settlements"
          userName={user.name}
          userRole={user.role}
          userAddress={user.address}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="animate-fade-in">
            <VendorView
              balances={balances}
              escrows={escrows}
              transactions={transactions}
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

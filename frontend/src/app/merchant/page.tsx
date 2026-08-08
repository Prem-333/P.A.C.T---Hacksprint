"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MerchantView } from "@/components/dashboard/MerchantView";
import { TransactionLog } from "@/components/shared/TransactionLog";
import { useDashboard } from "@/hooks/useDashboard";
import type { ISO20022Message } from "@/types";

export default function MerchantPage() {
  const { user, balances, escrows, transactions, isLoading, fetchData, handleLogout } = useDashboard("merchant");

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] bg-mesh flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="inline-block w-8 h-8 border-3 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mb-4" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading Merchant Dashboard...</p>
        </div>
      </div>
    );
  }

  const myBalance = balances?.users.find((u) => u.username === user.username);

  const logEntries = transactions.map((tx) => ({
    txHash: tx.txHash,
    type: tx.type,
    timestamp: tx.timestamp,
    iso20022: tx.iso20022 as ISO20022Message,
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-mesh">
      <Sidebar activeRole="merchant" userName={user.name} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          viewTitle="📦 Merchant Dashboard — Prem"
          viewDescription="View incoming escrows, confirm deliveries, and receive settlements"
          userName={user.name}
          userRole={user.role}
          userAddress={user.address}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="animate-fade-in">
            <MerchantView
              balance={myBalance?.balance || "0"}
              address={user.address}
              escrows={escrows}
              activeEscrows={balances?.activeEscrows || 0}
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

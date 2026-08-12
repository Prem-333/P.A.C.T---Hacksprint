"use client";

/**
 * @module BankPage
 * @description Bank dashboard page — settlement ledger, GST reporting, all accounts.
 */

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BankView } from "@/components/dashboard/BankView";
import { TransactionLog } from "@/components/shared/TransactionLog";
import { useDashboard } from "@/hooks/useDashboard";
import type { ISO20022Message } from "@/types";

import { DashboardSkeleton } from "@/components/shared/DashboardSkeleton";

export default function BankPage() {
  const { user, balances, escrows, transactions, isLoading, handleLogout } = useDashboard("bank");

  if (isLoading || !user) {
    return <DashboardSkeleton />;
  }

  const logEntries = transactions.map((tx) => ({
    txHash: tx.txHash,
    type: tx.type,
    timestamp: tx.timestamp,
    iso20022: tx.iso20022 as ISO20022Message,
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      <Sidebar activeRole="bank" userName={user.name} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          viewTitle="🏦 Bank Dashboard"
          viewDescription="Settlement ledger, GST reporting, and account management"
          userName={user.name}
          userRole={user.role}
          userAddress={user.address}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="animate-fade-in">
            <BankView
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

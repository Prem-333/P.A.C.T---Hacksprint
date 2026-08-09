"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClientView } from "@/components/dashboard/ClientView";
import { TransactionLog } from "@/components/shared/TransactionLog";
import type { ISO20022Message } from "@/types";

export default function ClientDashboardPage() {
  return (
    <DashboardLayout
      role="client"
      title="Client Dashboard — Bharath"
      description="Send payments and create DvP escrows for raw material procurement"
    >
      {({ user, balances, escrows, fetchData, transactions }) => {
        const myBalance = balances?.users.find((u) => u.username === user.username);
        const logEntries = transactions.map((tx) => ({
          txHash: tx.txHash,
          type: tx.type,
          timestamp: tx.timestamp,
          iso20022: tx.iso20022 as ISO20022Message,
        }));

        return (
          <div className="space-y-6">
            <ClientView
              balance={myBalance?.balance || "0"}
              isPurposeBound={myBalance?.isPurposeBound || false}
              address={user.address}
              escrows={escrows}
              onRefresh={fetchData}
            />
            <div className="border-t border-[var(--color-border)] pt-6">
              <TransactionLog entries={logEntries} />
            </div>
          </div>
        );
      }}
    </DashboardLayout>
  );
}

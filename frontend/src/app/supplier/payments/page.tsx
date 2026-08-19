"use client";

/**
 * @module SupplierPaymentsPage
 * @description Supplier payments page — payment history from product sales.
 */

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { TransactionLog } from "@/components/shared/TransactionLog";
import { useDashboard } from "@/hooks/useDashboard";
import { motion } from "framer-motion";
import type { ISO20022Message } from "@/types";

import { DashboardSkeleton } from "@/components/shared/DashboardSkeleton";

export default function SupplierPaymentsPage() {
  const { user, balances, transactions, isLoading, handleLogout } = useDashboard("supplier");

  if (isLoading || !user || !balances) {
    return <DashboardSkeleton />;
  }

  const paymentTxs = transactions.filter(
    (tx) => tx.type === "GPAY_PAYMENT" || tx.type === "CASH_PAYMENT"
  );

  const logEntries = transactions.map((tx) => ({
    txHash: tx.txHash,
    type: tx.type,
    timestamp: tx.timestamp,
    iso20022: tx.iso20022 as ISO20022Message,
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      <Sidebar activeRole="supplier" userName={user.name} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          viewTitle="Payment History"
          viewDescription="Track payments received from product sales"
          userName={user.name}
          userRole={user.role}
          userAddress={user.address}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="animate-fade-in">
            {/* Payment History Table */}
            <div className="glass-card p-5 mb-6">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4"> Payment History from Sales</h3>
              {paymentTxs.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-[var(--color-border)] rounded-lg">
                  <p className="text-sm text-[var(--color-text-muted)]">No payments received yet. Waiting for product sales.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Sale</th>
                        <th>Product</th>
                        <th>Total Sale</th>
                        <th>Fragrance Oil</th>
                        <th>Bottles</th>
                        <th>Packaging</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <motion.tbody
                      initial="hidden"
                      animate="show"
                      variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
                      }}
                    >
                      {paymentTxs.slice(0, 15).map((tx) => {
                        const amount = parseFloat(tx.amount || "0");
                        const base = amount / 1.28;
                        const raw = base * 0.4;
                        return (
                          <motion.tr key={tx.txHash} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                            <td className="font-mono text-[10px] text-[var(--color-text-accent)]">{tx.txHash.slice(0, 10)}...</td>
                            <td className="text-xs">{tx.metadata?.productName || "—"}</td>
                            <td className="font-semibold">₹{amount.toLocaleString()}</td>
                            <td className="text-violet-600 text-xs">₹{(raw * 0.5).toFixed(0)}</td>
                            <td className="text-blue-600 text-xs">₹{(raw * 0.3).toFixed(0)}</td>
                            <td className="text-amber-600 text-xs">₹{(raw * 0.2).toFixed(0)}</td>
                            <td className="text-xs text-[var(--color-text-muted)]">{new Date(tx.timestamp).toLocaleTimeString()}</td>
                          </motion.tr>
                        );
                      })}
                    </motion.tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Transaction Log */}
            <TransactionLog entries={logEntries} />
          </div>
        </main>
      </div>
    </div>
  );
}

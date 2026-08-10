"use client";

/**
 * @module BankView
 * @description Bank dashboard — Settlement ledger, GST reporting,
 * cash deposit tracking, and all account balances.
 */

import { StatusBadge } from "@/components/shared/StatusBadge";
import { LiveActivityFeed } from "@/components/shared/LiveActivityFeed";
import type { BalanceData, TransactionEntry } from "@/hooks/useDashboard";

interface BankViewProps {
  balances: BalanceData | null;
  escrows: Record<string, unknown>[];
  transactions: TransactionEntry[];
}

export function BankView({ balances, escrows, transactions }: BankViewProps) {
  // Calculate GST collection totals
  const gstTransactions = transactions.filter(
    (tx) => tx.type === "GPAY_PAYMENT" || tx.type === "CASH_PAYMENT"
  );
  const totalCGST = gstTransactions.reduce(
    (sum, tx) => sum + (tx.metadata?.gstBreakdown?.cgst || 0), 0
  );
  const totalSGST = gstTransactions.reduce(
    (sum, tx) => sum + (tx.metadata?.gstBreakdown?.sgst || 0), 0
  );

  const cashPayments = transactions.filter((tx) => tx.metadata?.paymentMethod === "cash");
  const gpayPayments = transactions.filter((tx) => tx.metadata?.paymentMethod === "gpay");
  const totalSettled = gstTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount || "0"), 0);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium mb-1">Total Settled</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">₹{totalSettled.toLocaleString()}</p>
          <span className="text-[10px] text-[var(--color-text-muted)]">{gstTransactions.length} transactions</span>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium mb-1">CGST Collected</p>
          <p className="text-2xl font-bold text-amber-600">₹{totalCGST.toFixed(2)}</p>
          <span className="text-[10px] text-[var(--color-text-muted)]">→ Central Government</span>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium mb-1">SGST Collected</p>
          <p className="text-2xl font-bold text-orange-600">₹{totalSGST.toFixed(2)}</p>
          <span className="text-[10px] text-[var(--color-text-muted)]">→ State Government</span>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium mb-1">Cash Deposits Pending</p>
          <p className="text-2xl font-bold text-rose-500">{cashPayments.filter(tx => tx.metadata?.cashDepositPending).length}</p>
          <span className="text-[10px] text-[var(--color-text-muted)]">Awaiting seller deposit</span>
        </div>
      </div>

      {/* All Accounts */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">🏦 All Account Balances</h3>
        {balances ? (
          <div className="space-y-4">
            {/* Main Users */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {balances.users.map((user) => (
                <div key={user.username} className="p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-[var(--color-border)] flex items-center justify-center text-lg">
                      {user.role === "customer" ? "👤" : user.role === "seller" ? "🏪" : user.role === "bank" ? "🏦" : "📦"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{user.name}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-medium tracking-wider">
                        {user.role.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[var(--color-text-muted)]">Balance</span>
                      <span className="text-sm font-semibold text-[var(--color-text-primary)]">₹{parseFloat(user.balance).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[var(--color-text-muted)]">Address</span>
                      <span className="text-[10px] font-mono text-[var(--color-text-accent)]">{user.address.slice(0, 8)}...{user.address.slice(-6)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Suppliers */}
            {balances.suppliers && balances.suppliers.length > 0 && (
              <>
                <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mt-2">Raw Material Suppliers</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {balances.suppliers.map((sup) => (
                    <div key={sup.id} className="p-3 rounded-lg bg-violet-50/50 border border-violet-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">{sup.type === "fragrance_oil" ? "🌺" : sup.type === "bottles" ? "🍶" : "📦"}</span>
                        <div>
                          <p className="text-xs font-semibold text-[var(--color-text-primary)]">{sup.name}</p>
                          <p className="text-[10px] text-[var(--color-text-muted)]">{sup.sharePercent}% of raw material cost</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-violet-600">₹{parseFloat(sup.balance).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-6">Loading balances...</p>
        )}
      </div>

      {/* GST Collection Report */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">🏛️ GST Collection Report</h3>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Product</th>
                <th>Method</th>
                <th>Amount</th>
                <th>CGST</th>
                <th>SGST</th>
                <th>Total GST</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {gstTransactions.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-[var(--color-text-muted)] py-6">No GST records yet</td></tr>
              ) : (
                gstTransactions.slice(0, 20).map((tx) => (
                  <tr key={tx.txHash}>
                    <td className="font-mono text-[10px] text-[var(--color-text-accent)]">{tx.txHash.slice(0, 12)}...</td>
                    <td className="text-xs">{tx.metadata?.productName || "—"}</td>
                    <td>
                      <StatusBadge
                        label={tx.metadata?.paymentMethod === "gpay" ? "GPay" : "Cash"}
                        variant={tx.metadata?.paymentMethod === "gpay" ? "success" : "warning"}
                      />
                    </td>
                    <td className="font-semibold">₹{parseFloat(tx.amount).toLocaleString()}</td>
                    <td className="text-amber-600 text-xs">₹{(tx.metadata?.gstBreakdown?.cgst || 0).toFixed(2)}</td>
                    <td className="text-orange-600 text-xs">₹{(tx.metadata?.gstBreakdown?.sgst || 0).toFixed(2)}</td>
                    <td className="font-medium text-xs">₹{(tx.metadata?.gstBreakdown?.total || 0).toFixed(2)}</td>
                    <td className="text-xs text-[var(--color-text-muted)]">{new Date(tx.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {gstTransactions.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-800">Total GST Collected</span>
              <span className="text-sm font-bold text-amber-800">₹{(totalCGST + totalSGST).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-amber-700">CGST (Central): ₹{totalCGST.toFixed(2)} · SGST (State): ₹{totalSGST.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Live Activity Feed */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">📡 Live Network Activity</h3>
        <LiveActivityFeed transactions={transactions} />
      </div>
    </div>
  );
}

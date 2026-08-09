"use client";

/**
 * @module TransactionsPageContent
 * @description Full transactions page showing all on-chain events in a rich table.
 */

import { TransactionsIcon, SendIcon, RefreshCwIcon, CheckCircleIcon, ShieldCheckIcon } from "@/components/ui/Icons";

interface Transaction {
  txHash: string;
  type: string;
  from: string;
  to: string;
  amount: string;
  blockNumber: number;
  timestamp: number;
}

interface TransactionsPageContentProps {
  transactions: Transaction[];
}

function getTypeStyle(type: string) {
  if (type === "ESCROW_CREATED") return { bg: "bg-blue-50 text-blue-700 border-blue-200", icon: <ShieldCheckIcon size={13} /> };
  if (type === "DELIVERY_CONFIRMED") return { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircleIcon size={13} /> };
  if (type === "ESCROW_REFUNDED") return { bg: "bg-amber-50 text-amber-700 border-amber-200", icon: <RefreshCwIcon size={13} /> };
  if (type === "FEE_DISTRIBUTION") return { bg: "bg-purple-50 text-purple-700 border-purple-200", icon: <SendIcon size={13} /> };
  return { bg: "bg-gray-50 text-gray-700 border-gray-200", icon: <TransactionsIcon size={13} /> };
}

export function TransactionsPageContent({ transactions }: TransactionsPageContentProps) {
  const sorted = [...transactions].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Transaction History
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            All on-chain events recorded on the local EVM network
          </p>
        </div>
        <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-subtle)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
          {sorted.length} transactions
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Escrows Created", value: sorted.filter(t => t.type === "ESCROW_CREATED").length, color: "text-blue-600" },
          { label: "Deliveries Confirmed", value: sorted.filter(t => t.type === "DELIVERY_CONFIRMED").length, color: "text-emerald-600" },
          { label: "Fees Distributed", value: sorted.filter(t => t.type === "FEE_DISTRIBUTION").length, color: "text-purple-600" },
          { label: "Refunds", value: sorted.filter(t => t.type === "ESCROW_REFUNDED").length, color: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Transaction Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--color-border)] flex items-center gap-2">
          <span className="text-[var(--color-primary)]"><TransactionsIcon size={18} /></span>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Ledger</h3>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-[var(--color-text-muted)] opacity-30"><TransactionsIcon size={40} /></span>
            <p className="text-sm text-[var(--color-text-muted)] mt-3">No transactions recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)]">
                  <th className="text-left text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-5 py-2.5">Tx Hash</th>
                  <th className="text-left text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-5 py-2.5">Type</th>
                  <th className="text-left text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-5 py-2.5">From</th>
                  <th className="text-left text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-5 py-2.5">To</th>
                  <th className="text-left text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-5 py-2.5">Amount</th>
                  <th className="text-left text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-5 py-2.5">Block</th>
                  <th className="text-left text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-5 py-2.5">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {sorted.map((tx, i) => {
                  const style = getTypeStyle(tx.type);
                  return (
                    <tr key={tx.txHash + i} className="hover:bg-[var(--color-surface-subtle)] transition-colors">
                      <td className="px-5 py-3">
                        <span className="text-xs font-mono text-[var(--color-text-accent)]">
                          {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-4)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium ${style.bg}`}>
                          {style.icon}
                          {tx.type.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-mono text-[var(--color-text-secondary)]">{tx.from}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-mono text-[var(--color-text-secondary)]">{tx.to}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm font-semibold text-[var(--color-text-primary)]">{tx.amount} PBR</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-mono text-[var(--color-text-muted)]">#{tx.blockNumber}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-[var(--color-text-muted)]">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

/**
 * @module VendorView
 * @description Kanish's dashboard — Vendor/Observer view.
 * Full visibility into all users' balances, escrows, and transactions.
 * Acts as a supply chain auditor/monitor.
 */

import { StatusBadge } from "@/components/shared/StatusBadge";
import { LiveActivityFeed } from "@/components/shared/LiveActivityFeed";
import { UsersIcon, ListIcon, BarChartIcon, BuildingIcon, PackageIcon, EyeIcon, ActivityIcon } from "@/components/ui/Icons";

interface BalanceData {
  totalSupply: string;
  activeEscrows: number;
  users: {
    username: string;
    name: string;
    role: string;
    address: string;
    balance: string;
    isPurposeBound: boolean;
  }[];
}

interface VendorViewProps {
  balances: BalanceData | null;
  escrows: Record<string, unknown>[];
  transactions: {
    txHash: string;
    type: string;
    from: string;
    to: string;
    amount: string;
    blockNumber: number;
    timestamp: number;
  }[];
}

const roleIcons: Record<string, React.ReactNode> = {
  client: <BuildingIcon size={20} className="text-blue-500" />,
  merchant: <PackageIcon size={20} className="text-emerald-500" />,
  vendor: <EyeIcon size={20} className="text-purple-500" />,
};

const roleLabels: Record<string, string> = {
  client: "CLIENT",
  merchant: "MERCHANT",
  vendor: "VENDOR",
};

export function VendorView({ balances, escrows, transactions }: VendorViewProps) {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* All Users Balances */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[var(--color-primary)]"><UsersIcon size={20} /></span>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            All Users — Live Balances
          </h3>
        </div>

        {balances ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {balances.users.map((user) => (
              <div
                key={user.username}
                className="p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-[var(--color-border)] flex items-center justify-center text-lg">
                    {roleIcons[user.role] || "👤"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-medium tracking-wider">
                      {roleLabels[user.role] || user.role}
                    </p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[var(--color-text-muted)]">Balance</span>
                    <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {parseFloat(user.balance).toLocaleString()} PBR
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[var(--color-text-muted)]">Address</span>
                    <span className="text-[10px] font-mono text-[var(--color-text-accent)]">
                      {user.address.slice(0, 8)}...{user.address.slice(-6)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[var(--color-text-muted)]">Restrictions</span>
                    <StatusBadge
                      label={user.isPurposeBound ? "Purpose-Bound" : "Free"}
                      variant={user.isPurposeBound ? "warning" : "neutral"}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-[var(--color-text-muted)]">Loading balances...</p>
          </div>
        )}
      </div>

      {/* All Escrows */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-text-secondary)]"><ListIcon size={20} /></span>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              All Escrows — Supply Chain Audit
            </h3>
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">
            {escrows.length} total
          </span>
        </div>

        {escrows.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-[var(--color-border)] rounded-lg">
            <div className="flex justify-center mb-2 opacity-30 text-[var(--color-text-muted)]"><ListIcon size={32} /></div>
            <p className="text-sm text-[var(--color-text-primary)] font-medium mb-1">
              All Escrows — Supply Chain Audit
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mb-3">
              No escrows created yet. Waiting for Bharath to initiate a transaction.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-outline"
            >
              Refresh Status
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Buyer</th>
                  <th>Seller</th>
                  <th>Amount</th>
                  <th>Deadline</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {escrows.map((escrow) => (
                  <tr key={escrow.id as number}>
                    <td className="font-mono text-[var(--color-text-accent)]">
                      #{(escrow.id as number).toString()}
                    </td>
                    <td>
                      <span className="text-sm">{escrow.buyerName as string}</span>
                    </td>
                    <td>
                      <span className="text-sm">{escrow.sellerName as string}</span>
                    </td>
                    <td className="font-semibold">{escrow.amount as string} PBR</td>
                    <td className="text-xs text-[var(--color-text-muted)]">
                      {escrow.deadlineFormatted as string}
                    </td>
                    <td>
                      <StatusBadge
                        label={escrow.status as string}
                        variant={
                          escrow.status === "COMPLETED"
                            ? "success"
                            : escrow.status === "REFUNDED"
                            ? "error"
                            : "warning"
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction History (Live Feed) */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-primary)]"><ActivityIcon size={20} /></span>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Live Network Activity
            </h3>
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">
            {transactions.length} recorded
          </span>
        </div>

        <LiveActivityFeed transactions={transactions} />
      </div>
    </div>
  );
}

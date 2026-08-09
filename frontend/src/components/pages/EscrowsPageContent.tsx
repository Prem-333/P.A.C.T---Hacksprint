"use client";

/**
 * @module EscrowsPageContent
 * @description Shared escrow listing page for all roles.
 * Shows a rich table of all escrows with status, amounts, and participants.
 */

import { StatusBadge } from "@/components/shared/StatusBadge";
import { EscrowIcon, ClockIcon, UserIcon, ShieldCheckIcon } from "@/components/ui/Icons";

interface EscrowsPageContentProps {
  escrows: Record<string, unknown>[];
  role: "client" | "merchant" | "vendor";
  userAddress: string;
}

export function EscrowsPageContent({ escrows, role, userAddress }: EscrowsPageContentProps) {
  const filteredEscrows = role === "vendor"
    ? escrows
    : escrows.filter((e: any) =>
        role === "client" ? e.buyer?.toLowerCase() === userAddress.toLowerCase()
        : e.seller?.toLowerCase() === userAddress.toLowerCase()
      );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Escrow Management
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            {role === "vendor" ? "All escrows across the network" : "Your active and completed escrows"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-subtle)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
            {filteredEscrows.length} total
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", value: filteredEscrows.filter((e: any) => e.status === "PENDING").length, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Completed", value: filteredEscrows.filter((e: any) => e.status === "COMPLETED").length, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Refunded", value: filteredEscrows.filter((e: any) => e.status === "REFUNDED").length, color: "text-red-600", bg: "bg-red-50" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4">
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Escrow Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--color-border)] flex items-center gap-2">
          <span className="text-[var(--color-primary)]"><EscrowIcon size={18} /></span>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">All Escrows</h3>
        </div>

        {filteredEscrows.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-[var(--color-text-muted)] opacity-30"><EscrowIcon size={40} /></span>
            <p className="text-sm text-[var(--color-text-muted)] mt-3">No escrows found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)]">
                  <th className="text-left text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-5 py-2.5">ID</th>
                  <th className="text-left text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-5 py-2.5">Buyer</th>
                  <th className="text-left text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-5 py-2.5">Seller</th>
                  <th className="text-left text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-5 py-2.5">Amount</th>
                  <th className="text-left text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-5 py-2.5">Deadline</th>
                  <th className="text-left text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-5 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredEscrows.map((escrow: any, i: number) => (
                  <tr key={escrow.id ?? i} className="hover:bg-[var(--color-surface-subtle)] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--color-primary)]"><ShieldCheckIcon size={14} /></span>
                        <span className="text-sm font-mono font-semibold text-[var(--color-text-primary)]">#{escrow.id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[var(--color-text-muted)]"><UserIcon size={13} /></span>
                        <span className="text-xs font-mono text-[var(--color-text-secondary)]">{String(escrow.buyer).slice(0,6)}...{String(escrow.buyer).slice(-4)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[var(--color-text-muted)]"><UserIcon size={13} /></span>
                        <span className="text-xs font-mono text-[var(--color-text-secondary)]">{String(escrow.seller).slice(0,6)}...{String(escrow.seller).slice(-4)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-semibold text-[var(--color-text-primary)]">{escrow.amount} PBR</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                        <ClockIcon size={13} />
                        <span>{escrow.deadlineFormatted || new Date(Number(escrow.deadline) * 1000).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={escrow.status as string} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

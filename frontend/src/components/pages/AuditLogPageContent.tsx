"use client";

/**
 * @module AuditLogPageContent
 * @description Audit log page showing ISO 20022 compliance records,
 * balance snapshots, and a chronological event timeline.
 */

import { useState } from "react";
import { AuditLogIcon, ShieldCheckIcon, UserIcon, ClockIcon, EyeIcon } from "@/components/ui/Icons";
import type { ISO20022Message } from "@/types";

interface AuditEntry {
  txHash: string;
  type: string;
  from: string;
  to: string;
  amount: string;
  blockNumber: number;
  timestamp: number;
  iso20022: Record<string, unknown> | ISO20022Message;
}

interface BalanceUser {
  username: string;
  name: string;
  role: string;
  address: string;
  balance: string;
  isPurposeBound: boolean;
}

interface AuditLogPageContentProps {
  transactions: AuditEntry[];
  balances: {
    totalSupply: string;
    activeEscrows: number;
    users: BalanceUser[];
  } | null;
}

export function AuditLogPageContent({ transactions, balances }: AuditLogPageContentProps) {
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const sorted = [...transactions].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Audit Log & Compliance
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
          ISO 20022 compliant transaction records and network state snapshots
        </p>
      </div>

      {/* Network Snapshot */}
      {balances && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[var(--color-primary)]"><EyeIcon size={18} /></span>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Live Network Snapshot
            </h3>
            <span className="ml-auto text-[10px] text-[var(--color-text-muted)] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
              LIVE
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-3 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Total Supply</p>
              <p className="text-lg font-bold text-[var(--color-text-primary)] mt-0.5">{parseFloat(balances.totalSupply).toLocaleString()} PBR</p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Active Escrows</p>
              <p className="text-lg font-bold text-blue-600 mt-0.5">{balances.activeEscrows}</p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Participants</p>
              <p className="text-lg font-bold text-[var(--color-text-primary)] mt-0.5">{balances.users.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">On-Chain Events</p>
              <p className="text-lg font-bold text-purple-600 mt-0.5">{transactions.length}</p>
            </div>
          </div>

          {/* Balance Table */}
          <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)]">
                  <th className="text-left text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-2">User</th>
                  <th className="text-left text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-2">Role</th>
                  <th className="text-left text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-2">Address</th>
                  <th className="text-left text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-2">Balance</th>
                  <th className="text-left text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-2">Purpose-Bound</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {balances.users.map((u) => (
                  <tr key={u.address} className="hover:bg-[var(--color-surface-subtle)] transition-colors">
                    <td className="px-4 py-2.5 flex items-center gap-2">
                      <span className="text-[var(--color-text-muted)]"><UserIcon size={14} /></span>
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">{u.name}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                        u.role === "client" ? "text-blue-600" : u.role === "merchant" ? "text-emerald-600" : "text-purple-600"
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-mono text-[var(--color-text-accent)]">{u.address.slice(0,6)}...{u.address.slice(-4)}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-sm font-semibold text-[var(--color-text-primary)]">{parseFloat(u.balance).toLocaleString()} PBR</span>
                    </td>
                    <td className="px-4 py-2.5">
                      {u.isPurposeBound ? (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                          <ShieldCheckIcon size={11} /> Restricted
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200 font-medium">
                          Unrestricted
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ISO 20022 Compliance Log */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-primary)]"><AuditLogIcon size={18} /></span>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">ISO 20022 Compliance Log</h3>
          </div>
          <span className="text-[10px] text-[var(--color-text-muted)] font-mono px-2 py-0.5 bg-[var(--color-surface-subtle)] rounded border border-[var(--color-border)]">
            pacs.008.001.08
          </span>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-[var(--color-text-muted)] opacity-30"><AuditLogIcon size={40} /></span>
            <p className="text-sm text-[var(--color-text-muted)] mt-3">No audit records yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {sorted.map((entry, i) => (
              <div key={entry.txHash + i}>
                <button
                  onClick={() => setExpandedTx(expandedTx === entry.txHash + i ? null : entry.txHash + i)}
                  className="w-full px-5 py-3 flex items-center justify-between hover:bg-[var(--color-surface-subtle)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
                      <ClockIcon size={14} className="text-[var(--color-primary)]" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-mono text-[var(--color-text-accent)]">
                        {entry.txHash.slice(0, 10)}...{entry.txHash.slice(-6)}
                      </span>
                      <span className="ml-2 text-[11px] px-2 py-0.5 rounded bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium">
                        {entry.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[var(--color-text-muted)]">
                      Block #{entry.blockNumber} · {new Date(entry.timestamp).toLocaleString()}
                    </span>
                    <span className={`text-xs text-[var(--color-text-muted)] transition-transform ${expandedTx === entry.txHash + i ? "rotate-180" : ""}`}>
                      ▾
                    </span>
                  </div>
                </button>

                {expandedTx === entry.txHash + i && (
                  <div className="px-5 pb-4 animate-fade-in">
                    <div className="bg-[var(--color-surface-subtle)] rounded-lg p-4 overflow-x-auto border border-[var(--color-border)]">
                      <pre className="text-xs font-mono text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
                        {JSON.stringify(entry.iso20022, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

/**
 * @module TransactionLog
 * @description Displays ISO 20022 formatted transaction records.
 * Shows a collapsible list of recent transactions with their pacs.008 JSON payloads.
 */

import { useState } from "react";
import type { ISO20022Message } from "@/types";

interface TransactionLogEntry {
  txHash: string;
  type: string;
  timestamp: number;
  iso20022: ISO20022Message;
}

interface TransactionLogProps {
  /** List of transaction records with ISO 20022 data. */
  entries: TransactionLogEntry[];
}

export function TransactionLog({ entries }: TransactionLogProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface-subtle)]/50">
        <span className="text-4xl mb-3 opacity-80 hover:scale-110 transition-transform cursor-default">📋</span>
        <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
          No transactions yet
        </p>
        <p className="text-xs text-[var(--color-text-muted)] max-w-[280px] text-center">
          Execute a contract interaction to see ISO 20022 compliance data appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">📊</span>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              ISO 20022 Transaction Log
            </h3>
          </div>
          <span className="text-[10px] text-[var(--color-text-muted)] font-mono px-2 py-0.5 bg-[var(--color-surface-subtle)] rounded">
            pacs.008.001.08
          </span>
        </div>
      </div>

      <div className="divide-y divide-[var(--color-border)]">
        {entries.map((entry, index) => (
          <div key={entry.txHash + index} className="animate-fade-in">
            <button
              onClick={() =>
                setExpandedIndex(expandedIndex === index ? null : index)
              }
              className="w-full px-5 py-3 flex items-center justify-between hover:bg-[var(--color-surface-subtle)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[var(--color-text-accent)]">
                  {entry.txHash.slice(0, 10)}...{entry.txHash.slice(-6)}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium">
                  {entry.type}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--color-text-muted)]">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={`text-xs text-[var(--color-text-muted)] transition-transform ${
                    expandedIndex === index ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </div>
            </button>

            {expandedIndex === index && (
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
    </div>
  );
}

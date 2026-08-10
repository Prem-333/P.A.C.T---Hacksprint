"use client";

/**
 * @module TaxWarningBanner
 * @description Animated warning banner displayed when the AI tax engine
 * detects changes in Indian GST guidelines. Shows severity-coded alerts
 * with dismiss functionality.
 */

import { useState } from "react";
import type { TaxWarning } from "@/types";

interface TaxWarningBannerProps {
  warnings: TaxWarning[];
  onAcknowledge?: (warningId: string) => void;
}

export function TaxWarningBanner({ warnings, onAcknowledge }: TaxWarningBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visibleWarnings = warnings.filter((w) => !dismissed.has(w.id));

  if (visibleWarnings.length === 0) return null;

  const handleDismiss = (warningId: string) => {
    setDismissed((prev) => new Set(prev).add(warningId));
    onAcknowledge?.(warningId);
  };

  const severityStyles = {
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: "ℹ️",
      badge: "bg-blue-100 text-blue-700",
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
      icon: "⚠️",
      badge: "bg-amber-100 text-amber-700",
    },
    critical: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: "🚨",
      badge: "bg-red-100 text-red-700",
    },
  };

  return (
    <div className="space-y-3 animate-fade-in">
      {/* AI Engine Status Bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500"></span>
        </span>
        <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">
          AI Tax Engine Active — Monitoring {visibleWarnings.length} guideline update(s)
        </span>
      </div>

      {/* Warning Cards */}
      {visibleWarnings.map((warning, idx) => {
        const style = severityStyles[warning.severity];
        return (
          <div
            key={warning.id}
            className={`${style.bg} ${style.border} border rounded-xl p-4 animate-slide-in`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{style.icon}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge} uppercase tracking-wider`}>
                    {warning.severity === "critical" ? "URGENT" : warning.severity === "warning" ? "TAX UPDATE" : "NOTICE"}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                    HSN {warning.hsnCode}
                  </span>
                </div>
                <p className={`text-xs ${style.text} leading-relaxed`}>
                  {warning.message}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    Source: {warning.source}
                  </span>
                  {warning.previousRate !== warning.newRate && (
                    <span className="text-[10px] font-semibold text-[var(--color-accent-rose)]">
                      Rate: {warning.previousRate}% → {warning.newRate}%
                    </span>
                  )}
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    Effective: {warning.effectiveDate}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDismiss(warning.id)}
                className="shrink-0 text-xs px-2.5 py-1 rounded-lg border border-current opacity-60 hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

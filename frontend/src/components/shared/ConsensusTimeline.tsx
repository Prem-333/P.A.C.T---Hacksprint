"use client";

/**
 * @module ConsensusTimeline
 * @description Visual 2-of-3 multi-sig oracle consensus tracker.
 * Displays each confirmer (Buyer, Seller, Logistics Oracle) as a card with
 * real-time status (Pending / Confirmed), timestamps, and an animated progress
 * bar toward the 2-of-3 threshold. When threshold is met, a green pulse
 * animation indicates settlement readiness.
 */

import { motion } from "framer-motion";

interface ConfirmerStatus {
  /** Display label for the confirmer (e.g., "Buyer", "Seller"). */
  label: string;
  /** Role identifier. */
  role: "buyer" | "seller" | "oracle";
  /** Whether this confirmer has voted. */
  confirmed: boolean;
  /** Optional timestamp of confirmation. */
  timestamp?: string;
}

interface ConsensusTimelineProps {
  /** Array of 3 confirmers with their current status. */
  confirmers: ConfirmerStatus[];
  /** Number of confirmations received so far (0, 1, 2, or 3). */
  confirmationCount: number;
  /** Required threshold for settlement (default: 2). */
  threshold?: number;
  /** Whether the escrow has been settled. */
  isSettled?: boolean;
}

const roleIcons: Record<string, string> = {
  buyer: "👤",
  seller: "🏪",
  oracle: "🔗",
};

const roleColors: Record<string, { bg: string; border: string; text: string }> = {
  buyer: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  seller: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  oracle: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700" },
};

export function ConsensusTimeline({
  confirmers,
  confirmationCount,
  threshold = 2,
  isSettled = false,
}: ConsensusTimelineProps) {
  const thresholdMet = confirmationCount >= threshold;
  const progressPercent = Math.min((confirmationCount / threshold) * 100, 100);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">🔐</span>
          <h4 className="text-xs font-semibold text-[var(--color-text-primary)]">
            Multi-Sig Consensus ({confirmationCount}/{threshold})
          </h4>
        </div>
        <span
          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
            isSettled
              ? "bg-emerald-100 text-emerald-700"
              : thresholdMet
              ? "bg-emerald-50 text-emerald-600 consensus-pulse"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {isSettled ? "✓ Settled" : thresholdMet ? "✓ Threshold Met" : "Awaiting Votes"}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full ${
            thresholdMet ? "bg-emerald-500" : "bg-amber-400"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        />
        {/* Threshold marker at 2/3 position */}
        <div
          className="absolute top-0 bottom-0 w-px bg-slate-400"
          style={{ left: `${(threshold / 3) * 100}%` }}
        />
      </div>

      {/* Confirmer Cards */}
      <div className="grid grid-cols-3 gap-3">
        {confirmers.map((confirmer, index) => {
          const colors = roleColors[confirmer.role] || roleColors.buyer;
          return (
            <motion.div
              key={confirmer.role}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className={`relative p-3 rounded-lg border transition-all ${
                confirmer.confirmed
                  ? "bg-emerald-50/60 border-emerald-200"
                  : `${colors.bg} ${colors.border}`
              }`}
            >
              {/* Confirmed glow ring */}
              {confirmer.confirmed && (
                <div className="absolute -top-1 -right-1">
                  <span className="flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{roleIcons[confirmer.role]}</span>
                <span className={`text-[11px] font-semibold ${
                  confirmer.confirmed ? "text-emerald-700" : colors.text
                }`}>
                  {confirmer.label}
                </span>
              </div>

              <span
                className={`text-[10px] font-medium ${
                  confirmer.confirmed
                    ? "text-emerald-600"
                    : "text-slate-400"
                }`}
              >
                {confirmer.confirmed ? "✓ Confirmed" : "⏳ Pending"}
              </span>

              {confirmer.timestamp && (
                <p className="text-[9px] text-slate-400 mt-1 font-mono">
                  {confirmer.timestamp}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Settlement Info */}
      {thresholdMet && !isSettled && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-emerald-800">Consensus Reached — Atomic Settlement Ready</p>
            <p className="text-[10px] text-emerald-600">Funds will be distributed: Tax → Vendor → Merchant</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

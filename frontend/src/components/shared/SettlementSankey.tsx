"use client";

/**
 * @module SettlementSankey
 * @description Animated SVG-based Sankey flow diagram visualizing
 * the atomic 3-way fee distribution during escrow settlement.
 * Shows money flowing from Customer → Escrow → Tax / Vendor / Merchant
 * with animated particles along the paths.
 *
 * This is the "hero component" of the Bank dashboard.
 */

import { motion } from "framer-motion";

interface SettlementSankeyProps {
  /** Total escrow amount (e.g., 5000). */
  totalAmount: number;
  /** Tax amount (GST). */
  taxAmount: number;
  /** Vendor/platform fee amount. */
  vendorAmount: number;
  /** Net merchant payout. */
  merchantAmount: number;
  /** Tax rate label (e.g., "GST 18%"). */
  taxLabel?: string;
  /** Vendor rate label (e.g., "1% Fee"). */
  vendorLabel?: string;
}

export function SettlementSankey({
  totalAmount,
  taxAmount,
  vendorAmount,
  merchantAmount,
  taxLabel = "GST",
  vendorLabel = "1% Fee",
}: SettlementSankeyProps) {
  // Calculate percentages for visual proportions
  const taxPct = totalAmount > 0 ? (taxAmount / totalAmount) * 100 : 0;
  const vendorPct = totalAmount > 0 ? (vendorAmount / totalAmount) * 100 : 0;
  const merchantPct = totalAmount > 0 ? (merchantAmount / totalAmount) * 100 : 0;

  if (totalAmount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
        <svg className="w-10 h-10 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
        </svg>
        <p className="text-xs font-medium">No settlements yet</p>
        <p className="text-[10px] mt-1">Complete an escrow to see the flow</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm">⚡</span>
        <h4 className="text-xs font-semibold text-[var(--color-text-primary)]">Atomic Settlement Flow</h4>
        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium ml-auto">
          ✓ Single Transaction
        </span>
      </div>

      {/* SVG Sankey Diagram */}
      <div className="relative bg-slate-50/50 rounded-xl border border-slate-100 p-4 overflow-hidden">
        <svg viewBox="0 0 800 240" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
          <defs>
            {/* Gradient for main flow */}
            <linearGradient id="flowMain" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
            </linearGradient>
            {/* Tax branch gradient */}
            <linearGradient id="flowTax" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.15" />
            </linearGradient>
            {/* Vendor branch gradient */}
            <linearGradient id="flowVendor" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.15" />
            </linearGradient>
            {/* Merchant branch gradient */}
            <linearGradient id="flowMerchant" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Main flow: Customer → Escrow */}
          <path
            d="M 120 120 C 250 120, 300 120, 400 120"
            fill="none"
            stroke="url(#flowMain)"
            strokeWidth="40"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* Branch: Escrow → Tax */}
          <path
            d="M 400 120 C 500 120, 520 50, 640 50"
            fill="none"
            stroke="url(#flowTax)"
            strokeWidth={Math.max(6, taxPct * 0.4)}
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Branch: Escrow → Vendor */}
          <path
            d="M 400 120 C 500 120, 520 120, 640 120"
            fill="none"
            stroke="url(#flowVendor)"
            strokeWidth={Math.max(4, vendorPct * 0.4)}
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Branch: Escrow → Merchant */}
          <path
            d="M 400 120 C 500 120, 520 190, 640 190"
            fill="none"
            stroke="url(#flowMerchant)"
            strokeWidth={Math.max(10, merchantPct * 0.4)}
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Animated particles on main flow */}
          <circle r="4" fill="#6366f1" opacity="0.7">
            <animateMotion dur="2s" repeatCount="indefinite" path="M 120 120 C 250 120, 300 120, 400 120" />
          </circle>
          <circle r="3" fill="#6366f1" opacity="0.5">
            <animateMotion dur="2s" begin="0.7s" repeatCount="indefinite" path="M 120 120 C 250 120, 300 120, 400 120" />
          </circle>

          {/* Animated particles on tax branch */}
          <circle r="3" fill="#f97316" opacity="0.7">
            <animateMotion dur="1.5s" begin="0.5s" repeatCount="indefinite" path="M 400 120 C 500 120, 520 50, 640 50" />
          </circle>

          {/* Animated particles on vendor branch */}
          <circle r="2.5" fill="#8b5cf6" opacity="0.7">
            <animateMotion dur="1.5s" begin="0.8s" repeatCount="indefinite" path="M 400 120 C 500 120, 520 120, 640 120" />
          </circle>

          {/* Animated particles on merchant branch */}
          <circle r="4" fill="#06b6d4" opacity="0.7">
            <animateMotion dur="1.5s" begin="0.3s" repeatCount="indefinite" path="M 400 120 C 500 120, 520 190, 640 190" />
          </circle>
          <circle r="3" fill="#06b6d4" opacity="0.5">
            <animateMotion dur="1.5s" begin="1.0s" repeatCount="indefinite" path="M 400 120 C 500 120, 520 190, 640 190" />
          </circle>

          {/* Node: Customer */}
          <g>
            <rect x="20" y="95" width="100" height="50" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
            <text x="70" y="116" textAnchor="middle" className="text-[11px]" fill="#334155" fontWeight="600" fontSize="11">Customer</text>
            <text x="70" y="133" textAnchor="middle" className="text-[10px]" fill="#64748b" fontSize="10">₹{totalAmount.toLocaleString()}</text>
          </g>

          {/* Node: Escrow Contract */}
          <g>
            <rect x="350" y="90" width="100" height="60" rx="10" fill="#f8fafc" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 2" />
            <text x="400" y="115" textAnchor="middle" fill="#4f46e5" fontWeight="700" fontSize="10">🔒 ESCROW</text>
            <text x="400" y="133" textAnchor="middle" fill="#6366f1" fontWeight="500" fontSize="9">Smart Contract</text>
          </g>

          {/* Node: Tax */}
          <g>
            <rect x="640" y="27" width="140" height="46" rx="8" fill="#fff7ed" stroke="#fed7aa" strokeWidth="1.5" />
            <text x="710" y="46" textAnchor="middle" fill="#c2410c" fontWeight="600" fontSize="10">🏛️ {taxLabel}</text>
            <text x="710" y="63" textAnchor="middle" fill="#ea580c" fontWeight="700" fontSize="11">₹{taxAmount.toLocaleString()}</text>
          </g>

          {/* Node: Vendor */}
          <g>
            <rect x="640" y="97" width="140" height="46" rx="8" fill="#f5f3ff" stroke="#ddd6fe" strokeWidth="1.5" />
            <text x="710" y="116" textAnchor="middle" fill="#6d28d9" fontWeight="600" fontSize="10">💎 {vendorLabel}</text>
            <text x="710" y="133" textAnchor="middle" fill="#7c3aed" fontWeight="700" fontSize="11">₹{vendorAmount.toLocaleString()}</text>
          </g>

          {/* Node: Merchant */}
          <g>
            <rect x="640" y="167" width="140" height="46" rx="8" fill="#ecfeff" stroke="#a5f3fc" strokeWidth="1.5" />
            <text x="710" y="186" textAnchor="middle" fill="#0e7490" fontWeight="600" fontSize="10">🏪 Merchant</text>
            <text x="710" y="203" textAnchor="middle" fill="#0891b2" fontWeight="700" fontSize="11">₹{merchantAmount.toLocaleString()}</text>
          </g>
        </svg>

        {/* Percentage breakdown */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50/50 border border-orange-100">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <div>
              <p className="text-[10px] font-semibold text-orange-800">{taxLabel}</p>
              <p className="text-[10px] text-orange-600">{taxPct.toFixed(1)}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-violet-50/50 border border-violet-100">
            <div className="w-2 h-2 rounded-full bg-violet-500" />
            <div>
              <p className="text-[10px] font-semibold text-violet-800">{vendorLabel}</p>
              <p className="text-[10px] text-violet-600">{vendorPct.toFixed(1)}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-cyan-50/50 border border-cyan-100">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            <div>
              <p className="text-[10px] font-semibold text-cyan-800">Net Payout</p>
              <p className="text-[10px] text-cyan-600">{merchantPct.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

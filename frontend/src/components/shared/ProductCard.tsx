"use client";

/**
 * @module ProductCard
 * @description Product display card for the perfume catalog.
 * Shows product info, price, GST breakdown, and buy button.
 */

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  hsnCode: string;
  gstBreakdown: {
    basePrice: number;
    cgstRate: number;
    sgstRate: number;
    totalGST: number;
  };
  hasWarning: boolean;
  onBuy: (productId: string) => void;
}

const categoryEmojis: Record<string, string> = {
  perfume: "🌸",
  essential_oil: "🍃",
  deodorant: "💨",
};

const categoryLabels: Record<string, string> = {
  perfume: "Premium Perfume",
  essential_oil: "Essential Oil",
  deodorant: "Deodorant",
};

const categoryColors: Record<string, string> = {
  perfume: "from-violet-500/10 to-pink-500/10",
  essential_oil: "from-emerald-500/10 to-teal-500/10",
  deodorant: "from-cyan-500/10 to-blue-500/10",
};

const categoryBorderColors: Record<string, string> = {
  perfume: "border-violet-200",
  essential_oil: "border-emerald-200",
  deodorant: "border-cyan-200",
};

export function ProductCard({
  id,
  name,
  description,
  price,
  category,
  hsnCode,
  gstBreakdown,
  hasWarning,
  onBuy,
}: ProductCardProps) {
  return (
    <div
      className={`relative bg-white rounded-xl border ${categoryBorderColors[category] || "border-[var(--color-border)]"} overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group`}
    >
      {/* Warning indicator */}
      {hasWarning && (
        <div className="absolute top-2 right-2 z-10">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
        </div>
      )}

      {/* Product Image Area */}
      <div className={`h-28 bg-gradient-to-br ${categoryColors[category] || "from-gray-100 to-gray-200"} flex items-center justify-center`}>
        <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
          {categoryEmojis[category] || "📦"}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight">
            {name}
          </h3>
        </div>
        <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
          {categoryLabels[category] || category} · HSN {hsnCode}
        </p>
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-3 line-clamp-2">
          {description}
        </p>

        {/* Price & GST */}
        <div className="bg-[var(--color-surface-subtle)] rounded-lg p-2.5 mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-[var(--color-text-muted)]">Price (incl. GST)</span>
            <span className="text-base font-bold text-[var(--color-text-primary)]">
              ₹{price.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-[var(--color-text-muted)]">
              GST ({gstBreakdown.cgstRate + gstBreakdown.sgstRate}%)
            </span>
            <span className="text-[10px] font-medium text-[var(--color-accent-amber)]">
              CGST {gstBreakdown.cgstRate}% + SGST {gstBreakdown.sgstRate}%
            </span>
          </div>
          <div className="flex justify-between items-center mt-0.5">
            <span className="text-[10px] text-[var(--color-text-muted)]">Base Price</span>
            <span className="text-[10px] font-medium text-[var(--color-text-secondary)]">
              ₹{gstBreakdown.basePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Buy Button */}
        <button
          onClick={() => onBuy(id)}
          className="btn-primary w-full text-xs py-2 flex items-center justify-center gap-1.5"
        >
          🛒 Buy Now
        </button>
      </div>
    </div>
  );
}

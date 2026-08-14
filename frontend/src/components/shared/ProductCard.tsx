"use client";

/**
 * @module ProductCard
 * @description Product display card for the perfume catalog.
 * Shows product info, price, GST breakdown, and buy button.
 */
import { Flower2, Leaf, Wind, ShoppingCart } from "lucide-react";

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

const categoryIcons: Record<string, React.ElementType> = {
  perfume: Flower2,
  essential_oil: Leaf,
  deodorant: Wind,
};

const categoryLabels: Record<string, string> = {
  perfume: "PREMIUM PERFUME",
  essential_oil: "ESSENTIAL OIL",
  deodorant: "DEODORANT",
};

const categoryIconColors: Record<string, string> = {
  perfume: "text-[#d89797]",
  essential_oil: "text-[#73a99b]",
  deodorant: "text-[#a2aeb6]",
};

const categoryBgColors: Record<string, string> = {
  perfume: "bg-[#fdf9f9]",
  essential_oil: "bg-[#f4fbf9]",
  deodorant: "bg-[#f8f9fa]",
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
  const Icon = categoryIcons[category] || Flower2;

  return (
    <div className="relative bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col h-full">
      {/* Warning indicator / Dot */}
      <div className="absolute top-4 right-4 z-10">
        <span className="relative flex h-2 w-2">
          {hasWarning ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0c6a54]"></span>
          )}
        </span>
      </div>

      {/* Product Image Area */}
      <div className={`h-[160px] ${categoryBgColors[category] || "bg-slate-50"} flex items-center justify-center`}>
        <Icon className={`w-12 h-12 ${categoryIconColors[category] || "text-slate-400"} group-hover:scale-110 transition-transform duration-300`} strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-[15px] font-bold text-slate-900 leading-tight mb-1">
          {name}
        </h3>
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
          {categoryLabels[category] || category} · HSN {hsnCode}
        </p>
        <p className="text-[13px] text-slate-600 leading-relaxed mb-4 line-clamp-2">
          {description}
        </p>

        <div className="mt-auto">
          {/* Price & GST */}
          <div className="bg-slate-50 rounded-md p-3 mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] font-medium text-slate-500">Price (incl. GST)</span>
              <span className="text-base font-bold text-slate-900">
                ₹{price.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-slate-400">
                GST ({gstBreakdown.cgstRate + gstBreakdown.sgstRate}%)
              </span>
              <span className="text-[10px] font-medium text-[#448b9f]">
                CGST {gstBreakdown.cgstRate}% + SGST {gstBreakdown.sgstRate}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400">Base Price</span>
              <span className="text-[10px] font-medium text-slate-500">
                ₹{gstBreakdown.basePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Buy Button */}
          <button
            onClick={() => onBuy(id)}
            className="w-full bg-[#0a2540] text-white text-[13px] font-medium py-2.5 rounded-md flex items-center justify-center gap-2 hover:bg-[#071a2e] transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

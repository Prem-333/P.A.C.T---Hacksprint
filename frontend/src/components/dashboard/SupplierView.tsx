"use client";

/**
 * @module SupplierView
 * @description Raw Material Supplier dashboard — Track payments received
 * from product sales, view supply orders, and monitor revenue share.
 */

import type { BalanceData, TransactionEntry } from "@/hooks/useDashboard";

interface SupplierViewProps {
  balances: BalanceData | null;
  transactions: TransactionEntry[];
}

export function SupplierView({ balances, transactions }: SupplierViewProps) {
  // Filter payment transactions
  const paymentTxs = transactions.filter(
    (tx) => tx.type === "GPAY_PAYMENT" || tx.type === "CASH_PAYMENT"
  );

  // Calculate per-supplier earnings from transaction metadata
  const supplierEarnings = {
    fragranceOil: 0,
    bottles: 0,
    packaging: 0,
  };

  paymentTxs.forEach((tx) => {
    const amount = parseFloat(tx.amount || "0");
    // Rough estimation based on typical breakdown
    // In production this would come from actual distribution records
    const basePrice = amount / 1.28; // Approximate for 28% GST
    const rawMaterialCost = basePrice * 0.4; // 40% raw material
    supplierEarnings.fragranceOil += rawMaterialCost * 0.5;
    supplierEarnings.bottles += rawMaterialCost * 0.3;
    supplierEarnings.packaging += rawMaterialCost * 0.2;
  });

  const suppliers = [
    {
      name: "Fragrance Oil Supplier",
      type: "fragrance_oil",
      emoji: "🌺",
      color: "violet",
      description: "Essential fragrance oils, attar concentrates, synthetic aroma compounds",
      share: 50,
      earned: supplierEarnings.fragranceOil,
      recentOrders: paymentTxs.length,
    },
    {
      name: "Bottle Supplier",
      type: "bottles",
      emoji: "🍶",
      color: "blue",
      description: "Glass perfume bottles, spray mechanisms, atomizers, caps",
      share: 30,
      earned: supplierEarnings.bottles,
      recentOrders: paymentTxs.length,
    },
    {
      name: "Packaging Supplier",
      type: "packaging",
      emoji: "📦",
      color: "amber",
      description: "Branded boxes, inserts, labels, cellophane wrap, shipping materials",
      share: 20,
      earned: supplierEarnings.packaging,
      recentOrders: paymentTxs.length,
    },
  ];

  const totalEarned = suppliers.reduce((sum, s) => sum + s.earned, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium mb-1">Total Raw Material Revenue</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">₹{Math.round(totalEarned).toLocaleString()}</p>
          <span className="text-[10px] text-[var(--color-text-muted)]">From {paymentTxs.length} product sales</span>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium mb-1">Active Suppliers</p>
          <p className="text-2xl font-bold text-violet-600">3</p>
          <span className="text-[10px] text-[var(--color-text-muted)]">Fragrance · Bottles · Packaging</span>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium mb-1">Cost Share</p>
          <p className="text-2xl font-bold text-emerald-600">40%</p>
          <span className="text-[10px] text-[var(--color-text-muted)]">Of base product price</span>
        </div>
      </div>

      {/* Supplier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {suppliers.map((supplier) => {
          const balance = balances?.suppliers?.find((s) => s.type === supplier.type);
          return (
            <div key={supplier.type} className="glass-card overflow-hidden">
              {/* Header */}
              <div className={`p-4 bg-gradient-to-r ${
                supplier.color === "violet" ? "from-violet-50 to-purple-50" :
                supplier.color === "blue" ? "from-blue-50 to-cyan-50" :
                "from-amber-50 to-orange-50"
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{supplier.emoji}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{supplier.name}</h3>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{supplier.share}% of raw material cost</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{supplier.description}</p>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[var(--color-text-muted)]">Blockchain Balance</span>
                    <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                      ₹{balance ? parseFloat(balance.balance).toLocaleString() : "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[var(--color-text-muted)]">Estimated Earnings</span>
                    <span className="text-sm font-semibold text-emerald-600">₹{Math.round(supplier.earned).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[var(--color-text-muted)]">Orders Fulfilled</span>
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">{supplier.recentOrders}</span>
                  </div>
                </div>

                {/* Share Bar */}
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mb-1">
                    <span>Revenue Share</span>
                    <span>{supplier.share}%</span>
                  </div>
                  <div className="h-2 bg-[var(--color-surface-subtle)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        supplier.color === "violet" ? "bg-violet-500" :
                        supplier.color === "blue" ? "bg-blue-500" :
                        "bg-amber-500"
                      }`}
                      style={{ width: `${supplier.share}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Supply Payments */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">💰 Payment History from Sales</h3>
        {paymentTxs.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-[var(--color-border)] rounded-lg">
            <p className="text-sm text-[var(--color-text-muted)]">No payments received yet. Waiting for product sales.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sale</th>
                  <th>Product</th>
                  <th>Total Sale</th>
                  <th>Fragrance Oil</th>
                  <th>Bottles</th>
                  <th>Packaging</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {paymentTxs.slice(0, 15).map((tx) => {
                  const amount = parseFloat(tx.amount || "0");
                  const base = amount / 1.28;
                  const raw = base * 0.4;
                  return (
                    <tr key={tx.txHash}>
                      <td className="font-mono text-[10px] text-[var(--color-text-accent)]">{tx.txHash.slice(0, 10)}...</td>
                      <td className="text-xs">{tx.metadata?.productName || "—"}</td>
                      <td className="font-semibold">₹{amount.toLocaleString()}</td>
                      <td className="text-violet-600 text-xs">₹{(raw * 0.5).toFixed(0)}</td>
                      <td className="text-blue-600 text-xs">₹{(raw * 0.3).toFixed(0)}</td>
                      <td className="text-amber-600 text-xs">₹{(raw * 0.2).toFixed(0)}</td>
                      <td className="text-xs text-[var(--color-text-muted)]">{new Date(tx.timestamp).toLocaleTimeString()}</td>
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

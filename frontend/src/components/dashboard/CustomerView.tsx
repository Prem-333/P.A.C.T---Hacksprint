"use client";

/**
 * @module CustomerView
 * @description Customer dashboard — Browse perfumes, buy via GPay/Cash.
 * Shows product catalog, order history, and tax warnings.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/shared/ProductCard";
import { PaymentModal } from "@/components/shared/PaymentModal";
import { TaxWarningBanner } from "@/components/shared/TaxWarningBanner";
import type { ProductData, TaxWarningData } from "@/hooks/useDashboard";

interface CustomerViewProps {
  balance: string;
  address: string;
  products: ProductData[];
  taxWarnings: TaxWarningData | null;
  transactions: {
    txHash: string;
    type: string;
    amount: string;
    timestamp: number;
    metadata?: {
      paymentMethod?: string;
      productName?: string;
      upiRefNumber?: string;
    };
  }[];
  onRefresh: () => void;
}

export function CustomerView({
  balance,
  address,
  products,
  taxWarnings,
  transactions,
  onRefresh,
}: CustomerViewProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filteredProducts = filter === "all"
    ? products
    : products.filter((p) => p.category === filter);

  const recentOrders = transactions
    .filter((tx) => tx.type === "GPAY_PAYMENT" || tx.type === "CASH_PAYMENT")
    .slice(0, 5);

  const handleAcknowledge = async (warningId: string) => {
    try {
      await fetch("/api/tax-warnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ warningId }),
      });
    } catch (err) {
      console.error("Failed to acknowledge warning:", err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Tax Warnings */}
      {taxWarnings && taxWarnings.warnings.length > 0 && (
        <TaxWarningBanner
          warnings={taxWarnings.warnings}
          onAcknowledge={handleAcknowledge}
        />
      )}

      {/* Balance Card */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--color-text-muted)] mb-1 uppercase tracking-wider font-medium">
              Your Wallet Balance
            </p>
            <p className="text-3xl font-semibold text-[var(--color-text-primary)] tracking-tight">
              ₹{parseFloat(balance).toLocaleString()}{" "}
              <span className="text-lg text-[var(--color-primary)] font-medium">INR</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-medium">
              🛍️ Ready to Shop
            </span>
            <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
              {address.slice(0, 10)}..{address.slice(-6)}
            </span>
          </div>
        </div>
      </div>

      {/* Product Catalog */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              🌸 Perfume Catalog
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">Browse and buy — Pay via GPay or Cash</p>
          </div>
          <div className="flex gap-1">
            {["all", "perfume", "essential_oil", "deodorant"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`text-[10px] px-2.5 py-1 rounded-full font-medium transition-all ${
                  filter === cat
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {cat === "all" ? "All" : cat === "perfume" ? "Perfumes" : cat === "essential_oil" ? "Oils" : "Deo"}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: 0.3, delay: index * 0.05 } }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                key={product.id}
              >
                <ProductCard
                  id={product.id}
                  name={product.name}
                  description={product.description}
                  price={product.price}
                  category={product.category}
                  hsnCode={product.hsnCode}
                  gstBreakdown={product.gstBreakdown}
                  hasWarning={product.hasWarning}
                  onBuy={(id) => {
                    const prod = products.find((p) => p.id === id);
                    if (prod) setSelectedProduct(prod);
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <div id="recent-orders" className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
          📋 Recent Orders
        </h3>
        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface-subtle)]/50">
            <span className="text-4xl mb-3 opacity-80 hover:scale-110 transition-transform cursor-default">🛍️</span>
            <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
              Your order history is empty
            </p>
            <p className="text-xs text-[var(--color-text-muted)] max-w-[250px] text-center">
              Browse the catalog above and make your first purchase to see it here!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div
                key={order.txHash}
                className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {order.metadata?.paymentMethod === "gpay" ? "📱" : "💵"}
                  </span>
                  <div>
                    <p className="text-xs font-medium text-[var(--color-text-primary)]">
                      {order.metadata?.productName || "Product"}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      {order.metadata?.paymentMethod === "gpay" ? "GPay" : "Cash"} · {new Date(order.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    ₹{parseFloat(order.amount).toLocaleString()}
                  </p>
                  {order.metadata?.upiRefNumber && (
                    <p className="text-[9px] font-mono text-[var(--color-text-muted)]">
                      UPI: {order.metadata.upiRefNumber}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <PaymentModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onSuccess={() => {
              setSelectedProduct(null);
              onRefresh();
              // Automatically scroll down to Recent Orders
              setTimeout(() => {
                document.getElementById("recent-orders")?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }, 300);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

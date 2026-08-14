"use client";

/**
 * @module CustomerView
 * @description Customer dashboard — Browse perfumes, buy via GPay/Cash.
 * Shows product catalog, order history, and tax warnings.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flower2, ReceiptText, ShoppingCart, FileJson } from "lucide-react";
import { ProductCard } from "@/components/shared/ProductCard";
import { PaymentModal } from "@/components/shared/PaymentModal";
import { TaxWarningBanner } from "@/components/shared/TaxWarningBanner";
import type { ProductData, TaxWarningData } from "@/hooks/useDashboard";
import type { ISO20022Message } from "@/types";

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
    iso20022?: ISO20022Message;
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
      <div className="bg-white rounded-md border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 mb-1 uppercase tracking-wider font-semibold">
              Your Wallet Balance
            </p>
            <p className="text-[40px] font-bold text-slate-900 tracking-tight leading-none mt-2">
              ₹{parseFloat(balance).toLocaleString()}{" "}
              <span className="text-base text-slate-500 font-medium ml-1">INR</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Ready to Shop
            </span>
            <span className="text-[12px] font-mono text-slate-400">
              {address.slice(0, 10)}..{address.slice(-6)}
            </span>
          </div>
        </div>
      </div>

      {/* Product Catalog */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-pink-300 text-xl">
              <Flower2 strokeWidth={2} />
            </span>
            <div>
              <h3 className="text-[17px] font-bold text-slate-900">
                Perfume Catalog
              </h3>
              <p className="text-[13px] text-slate-600 mt-0.5">Browse and buy — Pay via GPay or Cash</p>
            </div>
          </div>
          <div className="flex gap-2 border border-slate-200 rounded-md p-1 bg-slate-50/50">
            {["all", "perfume", "essential_oil", "deodorant"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`text-[12px] px-4 py-1.5 rounded-md font-semibold transition-all ${
                  filter === cat
                    ? "bg-[#0a2540] text-white shadow-sm"
                    : "bg-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {cat === "all" ? "All" : cat === "perfume" ? "Perfumes" : cat === "essential_oil" ? "Oils" : "Deo"}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div id="recent-orders" className="bg-white rounded-md border border-slate-200 p-6 mt-8">
        <div className="flex items-center gap-2 mb-6">
          <ReceiptText className="w-5 h-5 text-slate-700" strokeWidth={2} />
          <h3 className="text-[15px] font-bold text-slate-900">
            Recent Orders
          </h3>
        </div>
        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
            <ShoppingCart className="w-8 h-8 mb-3 text-slate-300" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-slate-900 mb-1">
              Your order history is empty
            </p>
            <p className="text-xs text-slate-500 max-w-[250px] text-center">
              Browse the catalog above and make your first purchase to see it here!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.txHash} className="border border-slate-100 rounded-md overflow-hidden bg-slate-50/30">
                <div
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-md bg-pink-50 flex items-center justify-center text-pink-300">
                      <Flower2 className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-slate-900 mb-1">
                        {order.metadata?.productName || "Product"}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${order.metadata?.paymentMethod === 'gpay' ? 'bg-[#0c6a54]' : 'bg-[#0a2540]'}`}></span>
                          {order.metadata?.paymentMethod === "gpay" ? "GPay" : "Cash"}
                        </span>
                        <span>·</span>
                        <span>{new Date(order.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-bold text-slate-900 mb-1">
                      ₹{parseFloat(order.amount).toLocaleString()}
                    </p>
                    {order.metadata?.upiRefNumber && (
                      <p className="text-[10px] font-mono text-slate-400">
                        UPI: {order.metadata.upiRefNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* ISO 20022 Log Expander inline */}
                {order.iso20022 && (
                  <div className="border-t border-dashed border-slate-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FileJson className="w-4 h-4 text-slate-400" />
                      <span className="text-[11px] font-medium text-slate-500">ISO 20022 Transaction Log</span>
                      <span className="ml-auto text-[10px] text-slate-400 font-mono px-2 py-0.5 bg-white border border-slate-100 rounded-md">
                        pacs.008.001.08
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-[11px] font-mono text-slate-400 bg-white border border-slate-100 px-2 py-1 rounded-md">
                         {order.txHash.slice(0, 10)}...{order.txHash.slice(-6)}
                       </span>
                       <span className="text-[10px] px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 font-medium">
                         {order.type}
                       </span>
                       <span className="ml-auto text-[10px] text-slate-400">
                         {new Date(order.timestamp).toLocaleTimeString()}
                       </span>
                    </div>
                  </div>
                )}
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

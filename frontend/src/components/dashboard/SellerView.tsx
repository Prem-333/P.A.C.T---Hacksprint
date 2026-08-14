"use client";

/**
 * @module SellerView
 * @description Seller dashboard — Manage orders, confirm deliveries,
 * view revenue breakdown, track cash deposits, and see tax warnings.
 */

import { useState, useCallback, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TaxWarningBanner } from "@/components/shared/TaxWarningBanner";
import { useToast } from "@/components/ui/Toast";
import type { TaxWarningData, TransactionEntry } from "@/hooks/useDashboard";
import { 
  Smartphone, 
  Banknote, 
  Landmark, 
  TrendingUp,
  Network,
  User,
  Diamond,
  Package,
  CheckCircle2
} from "lucide-react";

interface SellerViewProps {
  balance: string;
  address: string;
  escrows: Record<string, unknown>[];
  activeEscrows: number;
  taxBps: number;
  vendorFeeBps: number;
  transactions: TransactionEntry[];
  taxWarnings: TaxWarningData | null;
  onRefresh: () => void;
}

export function SellerView({
  balance,
  address,
  escrows,
  activeEscrows,
  taxBps,
  vendorFeeBps,
  transactions,
  taxWarnings,
  onRefresh,
}: SellerViewProps) {
  const { toast } = useToast();

  // Recent sales from transactions
  const recentSales = transactions
    .filter((tx) => tx.type === "GPAY_PAYMENT" || tx.type === "CASH_PAYMENT")
    .slice(0, 10);

  const gpayRevenue = recentSales
    .filter((tx) => tx.type === "GPAY_PAYMENT")
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

  const cashRevenue = recentSales
    .filter((tx) => tx.type === "CASH_PAYMENT")
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

  const pendingCashDeposits = transactions.filter(
    (tx) => tx.metadata?.paymentMethod === "cash" && tx.metadata?.cashDepositPending
  );

  return (
    <div className="space-y-6">
      {/* Tax Warnings */}
      {taxWarnings && taxWarnings.warnings.length > 0 && (
        <TaxWarningBanner warnings={taxWarnings.warnings} />
      )}

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Balance */}
        <div className="bg-white rounded-md border border-slate-200 p-5 flex flex-col justify-between shadow-sm min-h-[120px]">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Balance</p>
            <p className="text-3xl font-bold text-slate-900">₹{parseFloat(balance).toLocaleString()}</p>
          </div>
          <div className="mt-4 flex items-center">
             <span className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 font-medium w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Authorized Seller
            </span>
          </div>
        </div>

        {/* GPay Revenue */}
        <div className="bg-white rounded-md border border-slate-200 p-5 flex flex-col justify-between shadow-sm min-h-[120px]">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">GPay Revenue</p>
            <p className="text-3xl font-bold text-[#0a2540]">₹{gpayRevenue.toLocaleString()}</p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Digital payments</span>
          </div>
        </div>

        {/* Cash Revenue */}
        <div className="bg-white rounded-md border border-slate-200 p-5 flex flex-col justify-between shadow-sm min-h-[120px]">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Cash Revenue</p>
            <p className="text-3xl font-bold text-[#0c6a54]">₹{cashRevenue.toLocaleString()}</p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Banknote className="w-3.5 h-3.5" />
            <span>Cash collected</span>
          </div>
        </div>

        {/* Pending Deposits */}
        <div className="bg-white rounded-md border border-slate-200 p-5 flex flex-col justify-between shadow-sm min-h-[120px]">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Pending Deposits</p>
            <p className="text-3xl font-bold text-amber-500">{pendingCashDeposits.length}</p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Landmark className="w-3.5 h-3.5" />
            <span>Cash → Bank</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales (col-span-1) */}
        <div id="recent-sales" className="bg-white rounded-md border border-slate-200 p-6 shadow-sm col-span-1 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-slate-700" strokeWidth={2} />
            <h3 className="text-[15px] font-bold text-slate-900">Recent Sales</h3>
          </div>
          
          {recentSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-slate-200 rounded-lg bg-slate-50/50 flex-1">
              <p className="text-sm font-medium text-slate-900 mb-1">
                No sales yet
              </p>
              <p className="text-xs text-slate-500 max-w-[200px] text-center">
                Your sales will appear here once customers make a purchase.
              </p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto pr-2 max-h-[300px]">
              <AnimatePresence>
                {recentSales.map((sale) => (
                  <motion.div
                    key={sale.txHash}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between p-3 rounded-md bg-slate-50/50 border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center text-slate-500">
                        {sale.type === "GPAY_PAYMENT" ? <Smartphone className="w-4 h-4" /> : <Banknote className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-slate-900">{sale.metadata?.productName || "Sale"}</p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {sale.type === "GPAY_PAYMENT" ? "GPay" : "Cash"} · {new Date(sale.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-bold text-[#0c6a54]">+₹{parseFloat(sale.amount).toLocaleString()}</p>
                      {sale.metadata?.gstBreakdown && (
                        <p className="text-[10px] text-slate-500 font-medium">GST: ₹{sale.metadata.gstBreakdown.total.toFixed(2)}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Settlement Flow (col-span-2) */}
        <div className="bg-white rounded-md border border-slate-200 p-6 shadow-sm col-span-2 flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <Network className="w-5 h-5 text-slate-700" strokeWidth={2} />
            <h3 className="text-[15px] font-bold text-slate-900">Payment Distribution Flow</h3>
          </div>
          
          <div className="flex flex-1 items-center justify-between w-full px-2">
            {[
              { 
                step: "1", 
                label: "Customer\nPays", 
                icon: User, 
                status: "GPay /\nCash",
                iconColor: "text-[#0a2540]"
              },
              { 
                step: "2", 
                label: "GST\nCollected", 
                icon: Landmark, 
                status: "CGST +\nSGST",
                iconColor: "text-slate-500"
              },
              { 
                step: "3", 
                label: "Platform\nFee", 
                icon: Diamond, 
                status: "1%\ndeducted",
                iconColor: "text-blue-500"
              },
              { 
                step: "4", 
                label: "Suppliers\nPaid", 
                icon: Package, 
                status: "Raw\nmaterials",
                iconColor: "text-orange-500"
              },
              { 
                step: "5", 
                label: "Seller\nReceives", 
                icon: Banknote, 
                status: "Net margin",
                iconColor: "text-amber-500",
                isFinal: true
              },
            ].map((item, i) => (
              <Fragment key={item.step}>
                <div 
                  className={`flex flex-col items-center justify-center text-center p-3 sm:p-4 rounded-md w-[100px] sm:w-[120px] h-[140px] transition-all duration-300 ${
                    item.isFinal 
                      ? "bg-slate-50 border-b-2 border-b-[#0c6a54] shadow-sm" 
                      : "bg-slate-50/50 border border-slate-100"
                  }`}
                >
                  <item.icon className={`w-6 h-6 mb-3 ${item.iconColor}`} strokeWidth={2} />
                  <span className="text-[12px] font-bold text-slate-900 mb-2 leading-tight whitespace-pre-line">{item.label}</span>
                  <span className="text-[10px] text-slate-500 font-medium whitespace-pre-line leading-tight">{item.status}</span>
                </div>
                {i < 4 && (
                  <span className="text-slate-400">→</span>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

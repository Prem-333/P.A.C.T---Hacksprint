"use client";

/**
 * @module SellerView
 * @description Seller dashboard — Manage orders, confirm deliveries,
 * view revenue breakdown, track cash deposits, and see tax warnings.
 */

import { useState, useCallback, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TaxWarningBanner } from "@/components/shared/TaxWarningBanner";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { ConsensusTimeline } from "@/components/shared/ConsensusTimeline";
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

  const myEscrows = escrows.filter(
    (e) => (e.seller as string)?.toLowerCase() === address.toLowerCase()
  );
  const pendingEscrows = myEscrows.filter((e) => e.status === "PENDING");
  
  const totalUnsettled = pendingEscrows.reduce(
    (sum, e) => sum + parseFloat(e.amount as string),
    0
  );

  const pendingCashAmount = pendingCashDeposits.reduce(
    (sum, tx) => sum + parseFloat(tx.amount),
    0
  );

  // Demo calculations for breakdown
  const platformFee = totalUnsettled * (vendorFeeBps / 10000); // ~1%
  const taxAmount = totalUnsettled * 0.1525; // derived average GST for demo
  const supplierAmount = totalUnsettled * 0.10; // supplier payments
  const totalDistributed = platformFee + taxAmount + supplierAmount;
  const netProfit = totalUnsettled - totalDistributed;

  const [isSettling, setIsSettling] = useState(false);

  const handleSettleFunds = useCallback(async () => {
    setIsSettling(true);
    try {
      const res = await fetch("/api/settlement/monthly", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast({ type: "success", message: "Monthly Settlement Complete", description: data.message });
        onRefresh();
      } else {
        toast({ type: "error", message: "Settlement Failed", description: data.error || "Unknown error" });
      }
    } catch {
      toast({ type: "error", message: "Network Error", description: "Failed to connect." });
    } finally {
      setIsSettling(false);
    }
  }, [onRefresh, toast]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Tax Warnings */}
      {taxWarnings && taxWarnings.warnings.length > 0 && (
        <motion.div variants={itemVariants}>
          <TaxWarningBanner warnings={taxWarnings.warnings} />
        </motion.div>
      )}

      {/* Monthly Settlement Banner */}
      <motion.div variants={itemVariants} className="bg-white rounded-md border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600">
              <Banknote className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">Monthly Settlement</h2>
          </div>
          <p className="text-sm text-slate-500 max-w-xl">
            Funds from your sales are held securely in escrow. At the end of the month, settle your account to distribute taxes, pay suppliers, and release your net profit to your bank.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
          <div className="text-center sm:text-left pr-0 sm:pr-6 sm:border-r border-slate-200">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Unsettled</p>
            <p className="text-2xl font-bold text-slate-900">₹{totalUnsettled.toLocaleString()}</p>
          </div>
          <button
            onClick={handleSettleFunds}
            disabled={totalUnsettled === 0 || isSettling}
            className={`px-6 py-2.5 rounded-md text-sm font-semibold transition-all ${
              totalUnsettled === 0
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : isSettling
                ? "bg-slate-800 text-white opacity-70 cursor-wait"
                : "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md"
            }`}
          >
            {isSettling ? "Processing..." : "Release Monthly Funds"}
          </button>
        </div>
      </motion.div>

      {/* Monthly Breakdown Cards (Profit & Distribution) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Net Profit */}
        <motion.div whileHover={{ y: -2 }} className="bg-emerald-50/50 rounded-md border border-emerald-100 p-5 flex flex-col justify-between shadow-sm min-h-[120px] transition-shadow hover:shadow-md">
          <div>
            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-2">Your Net Profit</p>
            <p className="text-2xl font-bold text-emerald-700">₹{netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-emerald-600/70 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>After deductions</span>
          </div>
        </motion.div>

        {/* Taxes */}
        <motion.div whileHover={{ y: -2 }} className="bg-orange-50/50 rounded-md border border-orange-100 p-5 flex flex-col justify-between shadow-sm min-h-[120px] transition-shadow hover:shadow-md">
          <div>
            <p className="text-[11px] font-semibold text-orange-600 uppercase tracking-wider mb-2">Taxes (GST)</p>
            <p className="text-2xl font-bold text-orange-700">₹{taxAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-orange-600/70 font-medium">
            <Landmark className="w-3.5 h-3.5" />
            <span>Auto-remitted</span>
          </div>
        </motion.div>

        {/* Platform Fees */}
        <motion.div whileHover={{ y: -2 }} className="bg-blue-50/50 rounded-md border border-blue-100 p-5 flex flex-col justify-between shadow-sm min-h-[120px] transition-shadow hover:shadow-md">
          <div>
            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mb-2">Platform Fees</p>
            <p className="text-2xl font-bold text-blue-700">₹{platformFee.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-blue-600/70 font-medium">
            <Network className="w-3.5 h-3.5" />
            <span>P.A.C.T. network</span>
          </div>
        </motion.div>

        {/* Suppliers */}
        <motion.div whileHover={{ y: -2 }} className="bg-purple-50/50 rounded-md border border-purple-100 p-5 flex flex-col justify-between shadow-sm min-h-[120px] transition-shadow hover:shadow-md">
          <div>
            <p className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider mb-2">Suppliers</p>
            <p className="text-2xl font-bold text-purple-700">₹{supplierAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-purple-600/70 font-medium">
            <Package className="w-3.5 h-3.5" />
            <span>Raw materials</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Revenue Overview Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Balance */}
        <motion.div whileHover={{ y: -2 }} className="bg-white rounded-md border border-slate-200 p-5 flex flex-col justify-between shadow-sm min-h-[120px] transition-shadow hover:shadow-md">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Settled Balance</p>
            <AnimatedCounter
              value={parseFloat(balance)}
              prefix="₹"
              className="text-3xl font-bold text-slate-900"
            />
          </div>
          <div className="mt-4 flex items-center">
             <span className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 font-medium w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Authorized Seller
            </span>
          </div>
        </motion.div>

        {/* GPay Revenue */}
        <motion.div whileHover={{ y: -2 }} className="bg-white rounded-md border border-slate-200 p-5 flex flex-col justify-between shadow-sm min-h-[120px] transition-shadow hover:shadow-md">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">GPay Collected (Monthly)</p>
            <p className="text-3xl font-bold text-[#0a2540]">₹{gpayRevenue.toLocaleString()}</p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Digital payments</span>
          </div>
        </motion.div>

        {/* Pending Cash Deposit Amount */}
        <motion.div whileHover={{ y: -2 }} className={`bg-white rounded-md border ${pendingCashAmount > 0 ? 'border-amber-200 bg-amber-50/10' : 'border-slate-200'} p-5 flex flex-col justify-between shadow-sm min-h-[120px] transition-shadow hover:shadow-md`}>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Cash To Deposit</p>
            <p className={`text-3xl font-bold ${pendingCashAmount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>₹{pendingCashAmount.toLocaleString()}</p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Landmark className="w-3.5 h-3.5" />
            <span>Physical cash → Bank</span>
          </div>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales (col-span-1) */}
        <motion.div whileHover={{ y: -2 }} className="bg-white rounded-md border border-slate-200 p-6 shadow-sm col-span-1 flex flex-col transition-shadow hover:shadow-md">
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
        </motion.div>

        {/* Settlement Flow (col-span-2) */}
        <motion.div whileHover={{ y: -2 }} className="bg-white rounded-md border border-slate-200 p-6 shadow-sm col-span-2 flex flex-col transition-shadow hover:shadow-md">
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
        </motion.div>
      </motion.div>

      {/* Multi-Sig Consensus Tracker for Pending Escrows */}
      {pendingEscrows.length > 0 && (
        <motion.div variants={itemVariants} className="bg-white rounded-md border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-base">🔐</span>
            <h3 className="text-[15px] font-bold text-slate-900">Pending Escrow Consensus</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-semibold ml-2">
              {pendingEscrows.length} pending
            </span>
          </div>
          <div className="space-y-4">
            {pendingEscrows.slice(0, 3).map((escrow) => {
              const escrowId = escrow.id as number;
              const confirmCount = (escrow.confirmationCount as number) || 0;
              return (
                <div key={escrowId} className="p-4 rounded-lg bg-slate-50/50 border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-700">Escrow #{escrowId}</span>
                    <span className="text-xs font-bold text-slate-900">₹{parseFloat(escrow.amount as string).toLocaleString()}</span>
                  </div>
                  <ConsensusTimeline
                    confirmers={[
                      { label: "Buyer", role: "buyer", confirmed: confirmCount >= 1 },
                      { label: "Seller", role: "seller", confirmed: false },
                      { label: "Oracle", role: "oracle", confirmed: false },
                    ]}
                    confirmationCount={confirmCount}
                    threshold={2}
                    isSettled={false}
                  />
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

    </motion.div>
  );
}

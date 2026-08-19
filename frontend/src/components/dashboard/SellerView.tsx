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
import type { AnalyticsData } from "@/types";
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
  analyticsData?: AnalyticsData | null;
  balance: string;
  companyAssetBalance: number;
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
  analyticsData,
  balance,
  companyAssetBalance,
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

  const totalRevenue = analyticsData?.totalRevenue || transactions
    .filter((tx) => tx.type === "GPAY_PAYMENT" || tx.type === "CASH_PAYMENT")
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

  // Use analytics data for breakdown if available to coordinate with logistics/reports
  const platformFee = totalRevenue * (vendorFeeBps / 10000); 
  const taxAmount = analyticsData?.gstCollected?.total || totalRevenue * 0.1525;
  const supplierAmount = analyticsData?.supplierPayments?.reduce((sum, s) => sum + s.total, 0) || totalRevenue * 0.10;
  const totalDistributed = platformFee + taxAmount + supplierAmount;
  const netProfit = analyticsData?.totalProfit || (totalRevenue - totalDistributed);

  const effectiveBalance = parseFloat(balance) - pendingCashAmount;
  const isUsingCompanyFunds = effectiveBalance < 0;
  
  const todaySales = analyticsData?.totalRevenue || effectiveBalance;

  const [isSettling, setIsSettling] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);

  const handleDepositCash = useCallback(async () => {
    setIsDepositing(true);
    try {
      const res = await fetch("/api/payment/deposit-all", { method: "POST" });
      if (res.ok) {
        toast({ type: "success", message: "Cash Deposited Successfully" });
        onRefresh();
      } else {
        toast({ type: "error", message: "Failed to deposit cash" });
      }
    } catch {
      toast({ type: "error", message: "Network Error" });
    } finally {
      setIsDepositing(false);
    }
  }, [onRefresh, toast]);

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
      className="space-y-8"
    >
      {/* Tax Warnings */}
      {taxWarnings && taxWarnings.warnings.length > 0 && (
        <motion.div variants={itemVariants}>
          <TaxWarningBanner warnings={taxWarnings.warnings} />
        </motion.div>
      )}

      {/* Company Funds Warning Banner */}
      {isUsingCompanyFunds && (
        <motion.div variants={itemVariants} className="bg-red-50/60 rounded-xl border border-red-200/80 p-4 shadow-sm flex items-start gap-3">
          <div className="text-red-400 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-800">Warning: Transaction under P.A.C.T. Platform Funds</h3>
            <p className="text-xs text-red-700 mt-1">
              Your digital account is currently in the negative (<b>₹{effectiveBalance.toLocaleString('en-IN')}</b>). <br/>
              <b>Reminder:</b> Please deposit physical cash at the bank immediately to clear this deficit.
            </p>
          </div>
        </motion.div>
      )}

      {/* ── SECTION 1: Company Asset Balance (Hero) ── */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-emerald-50 to-teal-50/40 rounded-xl border border-emerald-200/60 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100/80 text-emerald-600">
              <Landmark className="w-6 h-6" />
            </span>
            <div>
              <p className="text-[11px] font-semibold text-emerald-600/80 uppercase tracking-wider mb-1">Company Asset Balance</p>
              <p className="text-3xl font-bold text-emerald-700">₹{companyAssetBalance.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <span className="hidden sm:flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full bg-emerald-100/60 text-emerald-600 border border-emerald-200/50 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Main Reserve · Live
          </span>
        </div>
      </motion.div>

      {/* ── SECTION 2: Seller Key Metrics ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Settled Balance */}
        <motion.div whileHover={{ y: -2 }} className={`bg-white rounded-xl border ${isUsingCompanyFunds ? 'border-red-200/60' : 'border-slate-200/80'} p-5 shadow-sm transition-shadow hover:shadow-md`}>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Today Sales</p>
          <div className={`text-2xl font-bold ${isUsingCompanyFunds ? 'text-red-600' : 'text-slate-800'}`}>
            ₹{todaySales.toLocaleString('en-IN')}
          </div>
          <div className="mt-4">
            <span className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100/60 font-medium w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Authorized Seller
            </span>
          </div>
        </motion.div>

        {/* GPay Revenue */}
        <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm transition-shadow hover:shadow-md">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">GPay Collected</p>
          <p className="text-2xl font-bold text-slate-800">₹{gpayRevenue.toLocaleString('en-IN')}</p>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Digital payments this month</span>
          </div>
        </motion.div>

        {/* Cash To Deposit */}
        <motion.div whileHover={{ y: -2 }} className={`bg-white rounded-xl border ${pendingCashAmount > 0 ? 'border-amber-200/60' : 'border-slate-200/80'} p-5 shadow-sm transition-shadow hover:shadow-md`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Cash To Deposit</p>
              <p className={`text-2xl font-bold ${pendingCashAmount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>₹{pendingCashAmount.toLocaleString('en-IN')}</p>
            </div>
            {pendingCashAmount > 0 && (
              <button 
                onClick={handleDepositCash}
                disabled={isDepositing}
                className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                {isDepositing ? "..." : "Settle Cash"}
              </button>
            )}
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <Banknote className="w-3.5 h-3.5" />
            <span>Physical cash → Bank</span>
          </div>
        </motion.div>
      </motion.div>

      {/* ── SECTION 3: Monthly Settlement ── */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 text-slate-500">
                <Banknote className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-slate-800">Monthly Settlement</h2>
            </div>
            <p className="text-sm text-slate-400 max-w-lg leading-relaxed">
              Settle your account to distribute taxes, pay suppliers, and release your net profit.
            </p>
          </div>
          
          <div className="flex items-center gap-5 bg-slate-50/80 p-4 rounded-xl border border-slate-100/80">
            <div className="text-center sm:text-left pr-5 border-r border-slate-200/60">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Unsettled</p>
              <p className="text-xl font-bold text-slate-800">₹{totalUnsettled.toLocaleString('en-IN')}</p>
            </div>
            <button
              onClick={handleSettleFunds}
              disabled={totalUnsettled === 0 || isSettling}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                totalUnsettled === 0
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : isSettling
                  ? "bg-slate-700 text-white opacity-70 cursor-wait"
                  : "bg-slate-800 text-white hover:bg-slate-700 hover:shadow-md"
              }`}
            >
              {isSettling ? "Processing..." : "Release Funds"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── SECTION 4: Revenue Breakdown ── */}
      <motion.div variants={itemVariants}>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Revenue Breakdown</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div whileHover={{ y: -2 }} className="bg-emerald-50/30 rounded-xl border border-emerald-100/60 p-5 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider mb-2">Net Profit</p>
            <p className="text-xl font-bold text-emerald-700">₹{netProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-500/70 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>After deductions</span>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="bg-orange-50/30 rounded-xl border border-orange-100/60 p-5 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-[10px] font-semibold text-orange-500 uppercase tracking-wider mb-2">Taxes (GST)</p>
            <p className="text-xl font-bold text-orange-600">₹{taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-orange-500/70 font-medium">
              <Landmark className="w-3 h-3" />
              <span>Auto-remitted</span>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="bg-blue-50/30 rounded-xl border border-blue-100/60 p-5 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider mb-2">Platform Fees</p>
            <p className="text-xl font-bold text-blue-600">₹{platformFee.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-blue-500/70 font-medium">
              <Network className="w-3 h-3" />
              <span>P.A.C.T. network</span>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="bg-violet-50/30 rounded-xl border border-violet-100/60 p-5 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider mb-2">Suppliers</p>
            <p className="text-xl font-bold text-violet-600">₹{supplierAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-violet-500/70 font-medium">
              <Package className="w-3 h-3" />
              <span>Raw materials</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── SECTION 5: Activity ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <motion.div whileHover={{ y: -1 }} className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm col-span-1 flex flex-col transition-shadow hover:shadow-md">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-slate-400" strokeWidth={2} />
            <h3 className="text-sm font-bold text-slate-700">Recent Sales</h3>
          </div>
          
          {recentSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-slate-200/60 rounded-xl bg-slate-50/30 flex-1">
              <p className="text-sm font-medium text-slate-500 mb-1">No sales yet</p>
              <p className="text-xs text-slate-400 max-w-[200px] text-center leading-relaxed">
                Sales will appear here once customers make a purchase.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto pr-2 max-h-[300px]">
              <AnimatePresence>
                {recentSales.map((sale) => (
                  <motion.div
                    key={sale.txHash}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 border border-slate-100/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                        {sale.type === "GPAY_PAYMENT" ? <Smartphone className="w-4 h-4" /> : <Banknote className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-slate-700">{sale.metadata?.productName || "Sale"}</p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {sale.type === "GPAY_PAYMENT" ? "GPay" : "Cash"} · {new Date(sale.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-bold text-emerald-600">+₹{parseFloat(sale.amount).toLocaleString('en-IN')}</p>
                      {sale.metadata?.gstBreakdown && (
                        <p className="text-[10px] text-slate-400 font-medium">GST: ₹{sale.metadata.gstBreakdown.total.toFixed(2)}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Payment Distribution Flow */}
        <motion.div whileHover={{ y: -1 }} className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm col-span-2 flex flex-col transition-shadow hover:shadow-md">
          <div className="flex items-center gap-2 mb-6">
            <Network className="w-4 h-4 text-slate-400" strokeWidth={2} />
            <h3 className="text-sm font-bold text-slate-700">Payment Distribution Flow</h3>
          </div>
          
          <div className="flex flex-1 items-center justify-between w-full px-2">
            {[
              { step: "1", label: "Customer\nPays", icon: User, status: "GPay /\nCash", iconColor: "text-slate-500" },
              { step: "2", label: "GST\nCollected", icon: Landmark, status: "CGST +\nSGST", iconColor: "text-orange-400" },
              { step: "3", label: "Platform\nFee", icon: Diamond, status: "1%\ndeducted", iconColor: "text-blue-400" },
              { step: "4", label: "Suppliers\nPaid", icon: Package, status: "Raw\nmaterials", iconColor: "text-violet-400" },
              { step: "5", label: "Seller\nReceives", icon: Banknote, status: "Net margin", iconColor: "text-emerald-500", isFinal: true },
            ].map((item, i) => (
              <Fragment key={item.step}>
                <div 
                  className={`flex flex-col items-center justify-center text-center p-3 sm:p-4 rounded-xl w-[100px] sm:w-[120px] h-[130px] transition-all duration-300 ${
                    item.isFinal 
                      ? "bg-emerald-50/50 border border-emerald-100/60 shadow-sm" 
                      : "bg-slate-50/50 border border-slate-100/60"
                  }`}
                >
                  <item.icon className={`w-5 h-5 mb-2.5 ${item.iconColor}`} strokeWidth={2} />
                  <span className="text-[11px] font-bold text-slate-700 mb-1.5 leading-tight whitespace-pre-line">{item.label}</span>
                  <span className="text-[9px] text-slate-400 font-medium whitespace-pre-line leading-tight">{item.status}</span>
                </div>
                {i < 4 && (
                  <span className="text-slate-300 text-sm">→</span>
                )}
              </Fragment>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* ── SECTION 6: Pending Escrows ── */}
      {pendingEscrows.length > 0 && (
        <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <h3 className="text-sm font-bold text-slate-700">Pending Escrow Consensus</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-500 font-semibold">
              {pendingEscrows.length} pending
            </span>
          </div>
          <div className="space-y-4">
            {pendingEscrows.slice(0, 3).map((escrow) => {
              const escrowId = escrow.id as number;
              const confirmCount = (escrow.confirmationCount as number) || 0;
              return (
                <div key={escrowId} className="p-4 rounded-xl bg-slate-50/50 border border-slate-100/60">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-600">Escrow #{escrowId}</span>
                    <span className="text-xs font-bold text-slate-800">₹{parseFloat(escrow.amount as string).toLocaleString('en-IN')}</span>
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

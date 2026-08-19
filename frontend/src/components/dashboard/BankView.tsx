"use client";

/**
 * @module BankView
 * @description Bank dashboard — Settlement ledger, GST reporting,
 * cash deposit tracking, all account balances, and the Settlement
 * Sankey flow visualization for atomic fee distribution.
 */

import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LiveActivityFeed } from "@/components/shared/LiveActivityFeed";
import { SettlementSankey } from "@/components/shared/SettlementSankey";
import { BuildingIcon, UserIcon, PackageIcon, WalletIcon, ShieldCheckIcon, ActivityIcon, CheckIcon } from "@/components/ui/Icons";
import type { BalanceData, TransactionEntry } from "@/hooks/useDashboard";

interface BankViewProps {
  balances: BalanceData | null;
  escrows: Record<string, unknown>[];
  transactions: TransactionEntry[];
}

export function BankView({ balances, escrows, transactions }: BankViewProps) {
  // Calculate GST collection totals
  const gstTransactions = transactions.filter(
    (tx) => tx.type === "GPAY_PAYMENT" || tx.type === "CASH_PAYMENT"
  );
  const totalCGST = gstTransactions.reduce(
    (sum, tx) => sum + (tx.metadata?.gstBreakdown?.cgst || 0), 0
  );
  const totalSGST = gstTransactions.reduce(
    (sum, tx) => sum + (tx.metadata?.gstBreakdown?.sgst || 0), 0
  );

  const cashPayments = transactions.filter((tx) => tx.metadata?.paymentMethod === "cash");
  const gpayPayments = transactions.filter((tx) => tx.metadata?.paymentMethod === "gpay");
  const totalSettled = gstTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount || "0"), 0);

  // Calculate Company Asset Balance
  const bankUser = balances?.users?.find(u => u.role === "bank");
  const companyAssetBalance = bankUser ? parseFloat(bankUser.balance) : 0;

  // Calculate settlement Sankey data from the most recent settled transaction
  const lastSettlement = gstTransactions[0]; // newest first
  const sankeyTotal = lastSettlement ? parseFloat(lastSettlement.amount) : 0;
  const sankeyTax = lastSettlement?.metadata?.gstBreakdown?.total || 0;
  const sankeyVendor = sankeyTotal * 0.01; // 1% vendor fee
  const sankeyMerchant = sankeyTotal - sankeyTax - sankeyVendor;

  /** Trigger ISO 20022 XML download for a specific transaction. */
  const handleDownloadXml = (txHash: string) => {
    window.open(`/api/iso20022/download?txHash=${encodeURIComponent(txHash)}`, "_blank");
  };

  return (
    <div className="space-y-5">
      {/* Summary Metrics */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="glass-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium mb-1">Company Asset Balance</p>
          <p className="text-2xl font-bold text-emerald-600">₹{companyAssetBalance.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-[var(--color-text-muted)]">Main Account</span>
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="glass-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium mb-1">Total Settled</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">₹{totalSettled.toLocaleString()}</p>
          <span className="text-[10px] text-[var(--color-text-muted)]">{gstTransactions.length} transactions</span>
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="glass-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium mb-1">CGST Collected</p>
          <p className="text-2xl font-bold text-amber-600">₹{totalCGST.toFixed(2)}</p>
          <span className="text-[10px] text-[var(--color-text-muted)]">→ Central Government</span>
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="glass-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium mb-1">SGST Collected</p>
          <p className="text-2xl font-bold text-orange-600">₹{totalSGST.toFixed(2)}</p>
          <span className="text-[10px] text-[var(--color-text-muted)]">→ State Government</span>
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="glass-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium mb-1">Cash Deposits Pending</p>
          <p className="text-2xl font-bold text-rose-500">{cashPayments.filter(tx => tx.metadata?.cashDepositPending).length}</p>
          <span className="text-[10px] text-[var(--color-text-muted)]">Awaiting seller deposit</span>
        </motion.div>
      </motion.div>

      {/* Settlement Sankey Flow Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-5"
      >
        <SettlementSankey
          totalAmount={sankeyTotal}
          taxAmount={sankeyTax}
          vendorAmount={sankeyVendor}
          merchantAmount={Math.max(0, sankeyMerchant)}
          taxLabel={`GST ${lastSettlement?.metadata?.gstBreakdown ? `(₹${sankeyTax.toFixed(0)})` : ""}`}
          vendorLabel="1% Platform"
        />
      </motion.div>

      {/* All Accounts */}
      <div className="glass-card p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)] mb-4">
          <WalletIcon className="w-4 h-4 text-[var(--color-text-muted)]" />
          All Account Balances
        </h3>
        {balances ? (
          <div className="space-y-4">
            {/* Main Users */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(balances.users || []).map((user) => (
                <div key={user.username} className="p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-primary)]">
                      {user.role === "customer" ? <UserIcon size={20} /> : user.role === "seller" ? <BuildingIcon size={20} /> : user.role === "bank" ? <BuildingIcon size={20} /> : <PackageIcon size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{user.name}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-medium tracking-wider">
                        {user.role.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[var(--color-text-muted)]">Balance</span>
                      <span className="text-sm font-semibold text-[var(--color-text-primary)]">₹{parseFloat(user.balance).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[var(--color-text-muted)]">Address</span>
                      <span className="text-[10px] font-mono text-[var(--color-text-accent)]">{user.address.slice(0, 8)}...{user.address.slice(-6)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Suppliers */}
            {balances.suppliers && balances.suppliers.length > 0 && (
              <>
                <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mt-2">Raw Material Suppliers</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {balances.suppliers.map((sup) => (
                    <div key={sup.id} className="p-3 rounded-lg bg-violet-50/50 border border-violet-200">
                      <div className="flex items-center gap-2 mb-2 text-[var(--color-text-primary)]">
                        <span className="flex items-center justify-center w-6 h-6 text-violet-600">
                          <PackageIcon size={16} />
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-[var(--color-text-primary)]">{sup.name}</p>
                          <p className="text-[10px] text-[var(--color-text-muted)]">{sup.sharePercent}% of raw material cost</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-violet-600">₹{parseFloat(sup.balance).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-6">Loading balances...</p>
        )}
      </div>

      {/* Live Activity Feed */}
      <div className="glass-card p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)] mb-4">
          <ActivityIcon className="w-4 h-4 text-[var(--color-text-muted)]" />
          Live Network Activity
        </h3>
        <LiveActivityFeed transactions={transactions} />
      </div>
    </div>
  );
}

"use client";

/**
 * @module BankGSTPage
 * @description Bank GST reporting page — GST collection report with compliance badges and XML download.
 */

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useDashboard } from "@/hooks/useDashboard";
import { motion } from "framer-motion";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ShieldCheckIcon, CheckIcon } from "@/components/ui/Icons";

import { DashboardSkeleton } from "@/components/shared/DashboardSkeleton";

export default function BankGSTPage() {
  const { user, transactions, isLoading, handleLogout } = useDashboard("bank");

  if (isLoading || !user) {
    return <DashboardSkeleton />;
  }

  const gstTransactions = transactions.filter(
    (tx) => tx.type === "GPAY_PAYMENT" || tx.type === "CASH_PAYMENT"
  );
  const totalCGST = gstTransactions.reduce(
    (sum, tx) => sum + (tx.metadata?.gstBreakdown?.cgst || 0), 0
  );
  const totalSGST = gstTransactions.reduce(
    (sum, tx) => sum + (tx.metadata?.gstBreakdown?.sgst || 0), 0
  );

  const handleDownloadXml = (txHash: string) => {
    window.open(`/api/iso20022/download?txHash=${encodeURIComponent(txHash)}`, "_blank");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      <Sidebar activeRole="bank" userName={user.name} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          viewTitle="GST Reports"
          viewDescription="Tax collection reporting and ISO 20022 compliance"
          userName={user.name}
          userRole={user.role}
          userAddress={user.address}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="animate-fade-in">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="glass-card p-4">
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium mb-1">CGST Collected</p>
                <p className="text-2xl font-bold text-amber-600">₹{totalCGST.toFixed(2)}</p>
                <span className="text-[10px] text-[var(--color-text-muted)]">→ Central Government</span>
              </div>
              <div className="glass-card p-4">
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium mb-1">SGST Collected</p>
                <p className="text-2xl font-bold text-orange-600">₹{totalSGST.toFixed(2)}</p>
                <span className="text-[10px] text-[var(--color-text-muted)]">→ State Government</span>
              </div>
              <div className="glass-card p-4">
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium mb-1">Total GST Liability</p>
                <p className="text-2xl font-bold text-rose-600">₹{(totalCGST + totalSGST).toFixed(2)}</p>
                <span className="text-[10px] text-[var(--color-text-muted)]">{gstTransactions.length} taxable transactions</span>
              </div>
            </div>

            {/* GST Table */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
                  <ShieldCheckIcon className="w-4 h-4 text-[var(--color-text-muted)]" />
                  GST Collection Report
                </h3>
                <span className="compliance-badge flex items-center gap-1">
                  <CheckIcon className="w-3 h-3" />
                  ISO 20022 Compliant
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Transaction</th>
                      <th>Product</th>
                      <th>Method</th>
                      <th>Amount</th>
                      <th>CGST</th>
                      <th>SGST</th>
                      <th>Total GST</th>
                      <th>Time</th>
                      <th>Compliance</th>
                    </tr>
                  </thead>
                  <motion.tbody
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: { opacity: 0 },
                      show: { opacity: 1, transition: { staggerChildren: 0.05 } }
                    }}
                  >
                    {gstTransactions.length === 0 ? (
                      <tr><td colSpan={9} className="text-center text-[var(--color-text-muted)] py-6">No GST records yet</td></tr>
                    ) : (
                      gstTransactions.slice(0, 20).map((tx) => (
                        <motion.tr key={tx.txHash} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                          <td className="font-mono text-[10px] text-[var(--color-text-accent)]">{tx.txHash.slice(0, 12)}...</td>
                          <td className="text-xs">{tx.metadata?.productName || "—"}</td>
                          <td>
                            <StatusBadge
                              label={tx.metadata?.paymentMethod === "gpay" ? "GPay" : "Cash"}
                              variant={tx.metadata?.paymentMethod === "gpay" ? "success" : "warning"}
                            />
                          </td>
                          <td className="font-semibold">₹{parseFloat(tx.amount).toLocaleString()}</td>
                          <td className="text-amber-600 text-xs">₹{(tx.metadata?.gstBreakdown?.cgst || 0).toFixed(2)}</td>
                          <td className="text-orange-600 text-xs">₹{(tx.metadata?.gstBreakdown?.sgst || 0).toFixed(2)}</td>
                          <td className="font-medium text-xs">₹{(tx.metadata?.gstBreakdown?.total || 0).toFixed(2)}</td>
                          <td className="text-xs text-[var(--color-text-muted)]">{new Date(tx.timestamp).toLocaleTimeString()}</td>
                          <td>
                            <button
                              onClick={() => handleDownloadXml(tx.txHash)}
                              className="btn-download"
                              title="Download ISO 20022 pacs.008 XML"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              XML
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </motion.tbody>
                </table>
              </div>
              {gstTransactions.length > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-800">Total GST Collected</span>
                    <span className="text-sm font-bold text-amber-800">₹{(totalCGST + totalSGST).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-amber-700">CGST (Central): ₹{totalCGST.toFixed(2)} · SGST (State): ₹{totalSGST.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

"use client";

/**
 * @module SellerView
 * @description Seller dashboard — Manage orders, confirm deliveries,
 * view revenue breakdown, track cash deposits, and see tax warnings.
 */

import { useState, useCallback } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { FeeBreakdown } from "@/components/shared/FeeBreakdown";
import { EscrowTimeline } from "@/components/shared/EscrowTimeline";
import { TaxWarningBanner } from "@/components/shared/TaxWarningBanner";
import { useToast } from "@/components/ui/Toast";
import type { TaxWarningData, TransactionEntry } from "@/hooks/useDashboard";

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
  const [escrowId, setEscrowId] = useState("");
  const [deliveryProof, setDeliveryProof] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmDelivery = useCallback(async () => {
    if (!escrowId || !deliveryProof) {
      toast({ type: "error", message: "Missing fields", description: "Please enter escrow ID and delivery proof." });
      return;
    }
    setIsConfirming(true);
    try {
      const res = await fetch("/api/escrow/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ escrowId: parseInt(escrowId), deliveryProof }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ type: "success", message: "Delivery Confirmed", description: data.message });
        setEscrowId("");
        setDeliveryProof("");
        onRefresh();
      } else {
        toast({ type: "error", message: "Confirmation Failed", description: data.error });
      }
    } catch {
      toast({ type: "error", message: "Network Error", description: "Failed to connect." });
    } finally {
      setIsConfirming(false);
    }
  }, [escrowId, deliveryProof, onRefresh, toast]);

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

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Tax Warnings */}
      {taxWarnings && taxWarnings.warnings.length > 0 && (
        <TaxWarningBanner warnings={taxWarnings.warnings} />
      )}

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium mb-1">Total Balance</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">₹{parseFloat(balance).toLocaleString()}</p>
          <StatusBadge label="Authorized Seller" variant="success" icon="✓" />
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium mb-1">GPay Revenue</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">₹{gpayRevenue.toLocaleString()}</p>
          <span className="text-[10px] text-[var(--color-text-muted)]">📱 Digital payments</span>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium mb-1">Cash Revenue</p>
          <p className="text-2xl font-bold text-emerald-600">₹{cashRevenue.toLocaleString()}</p>
          <span className="text-[10px] text-[var(--color-text-muted)]">💵 Cash collected</span>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium mb-1">Pending Deposits</p>
          <p className="text-2xl font-bold text-amber-500">{pendingCashDeposits.length}</p>
          <span className="text-[10px] text-[var(--color-text-muted)]">🏦 Cash → Bank</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Sales */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">📊 Recent Sales</h3>
          {recentSales.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-[var(--color-border)] rounded-lg">
              <p className="text-xs text-[var(--color-text-muted)]">No sales yet. Waiting for customer purchases.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {recentSales.map((sale) => (
                <div key={sale.txHash} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{sale.type === "GPAY_PAYMENT" ? "📱" : "💵"}</span>
                    <div>
                      <p className="text-xs font-medium text-[var(--color-text-primary)]">{sale.metadata?.productName || "Sale"}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">
                        {sale.type === "GPAY_PAYMENT" ? "GPay" : "Cash"} · {new Date(sale.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600">+₹{parseFloat(sale.amount).toLocaleString()}</p>
                    {sale.metadata?.gstBreakdown && (
                      <p className="text-[9px] text-[var(--color-text-muted)]">GST: ₹{sale.metadata.gstBreakdown.total.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm Delivery */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">✅ Confirm Delivery</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider font-semibold">Escrow ID</label>
              <input id="input-confirm-escrow-id" type="number" value={escrowId} onChange={(e) => setEscrowId(e.target.value)} placeholder="0" className="input-field" min="0" />
            </div>
            <div>
              <label className="block text-[11px] text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider font-semibold">Delivery Proof</label>
              <input id="input-confirm-proof" type="text" value={deliveryProof} onChange={(e) => setDeliveryProof(e.target.value)} placeholder="e.g., DELIVERY-PERFUME-001" className="input-field input-field-mono" />
            </div>
            <button id="btn-confirm-delivery" onClick={handleConfirmDelivery} disabled={isConfirming || !escrowId || !deliveryProof} className="btn-success w-full mt-2 flex items-center justify-center gap-2">
              {isConfirming ? (
                <><span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Confirming...</>
              ) : (
                "Confirm Delivery & Release Funds"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Cash Deposit Tracker */}
      {pendingCashDeposits.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">🏦 Pending Cash Deposits</h3>
          <p className="text-xs text-amber-600 mb-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
            ⚠️ Cash received from customers has been debited from your bank account for digital distribution. Please deposit the physical cash at your bank.
          </p>
          <div className="space-y-2">
            {pendingCashDeposits.map((dep) => (
              <div key={dep.txHash} className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 border border-amber-200">
                <div>
                  <p className="text-xs font-medium text-[var(--color-text-primary)]">{dep.metadata?.productName}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{new Date(dep.timestamp).toLocaleString()}</p>
                </div>
                <span className="text-sm font-semibold text-amber-600">₹{parseFloat(dep.amount).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settlement Flow */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">🔗 Payment Distribution Flow</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { step: "1", label: "Customer Pays", icon: "👤", status: "GPay / Cash" },
            { step: "2", label: "GST Collected", icon: "🏛️", status: "CGST + SGST" },
            { step: "3", label: "Platform Fee", icon: "💎", status: "1% deducted" },
            { step: "4", label: "Suppliers Paid", icon: "📦", status: "Raw materials" },
            { step: "5", label: "Seller Receives", icon: "💰", status: "Net margin" },
          ].map((item, i) => (
            <div key={item.step} className="flex flex-col items-center text-center p-3 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] relative">
              <span className="text-2xl mb-2">{item.icon}</span>
              <span className="text-xs font-medium text-[var(--color-text-primary)] mb-0.5">{item.label}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">{item.status}</span>
              {i < 4 && (
                <span className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-lg">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

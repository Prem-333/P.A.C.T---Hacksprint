"use client";

/**
 * @module MerchantView
 * @description Prem's dashboard — Authorized Merchant/Supplier view.
 * Shows balance, incoming escrows, and delivery confirmation form.
 * All interactions go through API routes (server-side signing).
 */

import { useState, useCallback } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface MerchantViewProps {
  balance: string;
  address: string;
  escrows: Record<string, unknown>[];
  activeEscrows: number;
  onRefresh: () => void;
}

export function MerchantView({
  balance,
  address,
  escrows,
  activeEscrows,
  onRefresh,
}: MerchantViewProps) {
  const [escrowId, setEscrowId] = useState("");
  const [deliveryProof, setDeliveryProof] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleConfirmDelivery = useCallback(async () => {
    if (!escrowId || !deliveryProof) return;

    setIsConfirming(true);
    setResult(null);

    try {
      const res = await fetch("/api/escrow/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          escrowId: parseInt(escrowId),
          deliveryProof,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setResult({ success: true, message: data.message });
        setEscrowId("");
        setDeliveryProof("");
        onRefresh();
      } else {
        setResult({ success: false, message: data.error });
      }
    } catch {
      setResult({ success: false, message: "Network error" });
    } finally {
      setIsConfirming(false);
    }
  }, [escrowId, deliveryProof, onRefresh]);

  // Filter escrows where Prem is the seller
  const myEscrows = escrows.filter(
    (e) => (e.seller as string)?.toLowerCase() === address.toLowerCase()
  );
  const pendingEscrows = myEscrows.filter((e) => e.status === "PENDING");
  const completedEscrows = myEscrows.filter((e) => e.status === "COMPLETED");

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Balance Card */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--color-text-muted)] mb-1 uppercase tracking-wider font-medium">
              Your PBR Balance
            </p>
            <p className="text-3xl font-semibold text-[var(--color-text-primary)] tracking-tight">
              {parseFloat(balance).toLocaleString()}{" "}
              <span className="text-lg text-[var(--color-accent-emerald)] font-medium">PBR</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge label="Authorized Merchant" variant="success" icon="✓" />
            <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
              <span>Pending <strong className="text-[var(--color-accent-amber)]">{pendingEscrows.length}</strong></span>
              <span>Active <strong className="text-[var(--color-primary)]">{activeEscrows}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Incoming Pending Escrows */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-base">📥</span>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Incoming Escrows
              </h3>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-[var(--color-accent-amber)] border border-amber-200 font-medium">
              {pendingEscrows.length} pending
            </span>
          </div>

          {pendingEscrows.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-2xl mb-2 opacity-30">📭</div>
              <p className="text-xs text-[var(--color-text-muted)]">
                No pending escrows. Waiting for buyers to initiate a payment contract.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingEscrows.map((escrow) => (
                <div
                  key={escrow.id as number}
                  className="p-3.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] animate-fade-in"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-[var(--color-text-accent)]">
                      Escrow #{(escrow.id as number).toString()}
                    </span>
                    <StatusBadge label="PENDING" variant="warning" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[var(--color-text-muted)]">From:</span>{" "}
                      <span className="text-[var(--color-text-primary)] font-medium">
                        {escrow.buyerName as string}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-muted)]">Amount:</span>{" "}
                      <span className="font-semibold text-[var(--color-accent-emerald)]">
                        {escrow.amount as string} PBR
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[var(--color-text-muted)]">Deadline:</span>{" "}
                      <span className="text-[var(--color-text-secondary)]">
                        {escrow.deadlineFormatted as string}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm Delivery Panel */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-base">✅</span>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Confirm Delivery
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider font-semibold">
                Escrow ID
              </label>
              <input
                id="input-confirm-escrow-id"
                type="number"
                value={escrowId}
                onChange={(e) => setEscrowId(e.target.value)}
                placeholder="0"
                className="input-field"
                min="0"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider font-semibold">
                Delivery Proof (from Buyer)
              </label>
              <input
                id="input-confirm-proof"
                type="text"
                value={deliveryProof}
                onChange={(e) => setDeliveryProof(e.target.value)}
                placeholder="e.g., DELIVERY-SAGO-50KG"
                className="input-field input-field-mono"
              />
            </div>

            <div className="px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <p className="text-xs text-emerald-700">
                ℹ️ Enter the exact delivery proof phrase shared by the buyer.
                The smart contract verifies it matches the on-chain hash before releasing funds.
              </p>
            </div>

            <button
              id="btn-confirm-delivery"
              onClick={handleConfirmDelivery}
              disabled={isConfirming || !escrowId || !deliveryProof}
              className="btn-success w-full mt-2"
            >
              {isConfirming
                ? "Confirming..."
                : "Confirm Delivery & Release Funds →"}
            </button>

            {result && (
              <p
                className={`text-xs mt-2 ${
                  result.success ? "text-[var(--color-accent-emerald)]" : "text-[var(--color-accent-rose)]"
                }`}
              >
                {result.success ? "✓" : "✗"} {result.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Completed Escrows */}
      {completedEscrows.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">✅</span>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Completed Settlements
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>From</th>
                  <th>Amount Received</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {completedEscrows.map((escrow) => (
                  <tr key={escrow.id as number}>
                    <td className="font-mono text-[var(--color-text-accent)]">
                      #{(escrow.id as number).toString()}
                    </td>
                    <td>{escrow.buyerName as string}</td>
                    <td className="font-semibold text-[var(--color-accent-emerald)]">
                      +{escrow.amount as string} PBR
                    </td>
                    <td>
                      <StatusBadge label="COMPLETED" variant="success" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Supply Chain Flow */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">🔗</span>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Settlement Flow
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { step: "1", label: "Bharath Locks Funds", icon: "🔒", status: "Escrow Created" },
            { step: "2", label: "Goods Shipped", icon: "🚚", status: "In Transit" },
            { step: "3", label: "Prem Confirms", icon: "✅", status: "Proof Verified" },
            { step: "4", label: "Funds Released", icon: "💰", status: "Settlement Done" },
          ].map((item, i) => (
            <div
              key={item.step}
              className="flex flex-col items-center text-center p-4 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border)] relative"
            >
              <span className="text-xl mb-2">{item.icon}</span>
              <span className="text-xs font-medium text-[var(--color-text-primary)] mb-1">
                {item.label}
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                {item.status}
              </span>
              {i < 3 && (
                <span className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-lg">
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

/**
 * @module ClientView
 * @description Bharath's dashboard — MSME Client/Buyer view.
 * Shows token balance, create escrow form, and active escrows list.
 * All interactions go through API routes (server-side signing).
 */

import { useState, useCallback } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface ClientViewProps {
  balance: string;
  isPurposeBound: boolean;
  address: string;
  escrows: Record<string, unknown>[];
  onRefresh: () => void;
}

export function ClientView({
  balance,
  isPurposeBound,
  address,
  escrows,
  onRefresh,
}: ClientViewProps) {
  const [amount, setAmount] = useState("");
  const [lockDuration, setLockDuration] = useState("1");
  const [deliveryProof, setDeliveryProof] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleCreateEscrow = useCallback(async () => {
    if (!amount || !deliveryProof) return;

    setIsCreating(true);
    setResult(null);

    try {
      const res = await fetch("/api/escrow/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          lockDurationHours: lockDuration,
          deliveryProof,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setResult({ success: true, message: data.message });
        setAmount("");
        setDeliveryProof("");
        setLockDuration("1");
        onRefresh();
      } else {
        setResult({ success: false, message: data.error });
      }
    } catch {
      setResult({ success: false, message: "Network error" });
    } finally {
      setIsCreating(false);
    }
  }, [amount, lockDuration, deliveryProof, onRefresh]);

  // Filter escrows where Bharath is the buyer
  const myEscrows = escrows.filter(
    (e) => (e.buyer as string)?.toLowerCase() === address.toLowerCase()
  );

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
              <span className="text-lg text-[var(--color-primary)] font-medium">PBR</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge
              label={isPurposeBound ? "Purpose-Bound" : "Unrestricted"}
              variant={isPurposeBound ? "warning" : "success"}
              icon={isPurposeBound ? "🔒" : "🔓"}
            />
            <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
              {address.slice(0, 10)}..{address.slice(-6)}
            </span>
          </div>
        </div>
        {isPurposeBound && (
          <p className="text-xs text-[var(--color-accent-amber)] mt-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
            ℹ Your tokens are purpose-bound — can only be sent to authorized merchants (Prem).
          </p>
        )}
      </div>

      {/* Create Escrow Form */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-base">▶</span>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Send Payment to Prem (Merchant)
            </h3>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-medium">
            DvP Escrow
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider font-semibold">
              Amount (PBR)
            </label>
            <input
              id="input-escrow-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider font-semibold">
              Lock Duration (Hours)
            </label>
            <input
              id="input-escrow-lock"
              type="number"
              value={lockDuration}
              onChange={(e) => setLockDuration(e.target.value)}
              placeholder="24"
              className="input-field"
              min="0.1"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider font-semibold">
              Delivery Proof (Secret)
            </label>
            <input
              id="input-escrow-proof"
              type="text"
              value={deliveryProof}
              onChange={(e) => setDeliveryProof(e.target.value)}
              placeholder="e.g., DELIVERY-SAGO-50KG"
              className="input-field input-field-mono"
            />
          </div>
        </div>

        <div className="mt-3 px-3 py-2.5 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-xs text-blue-700">
            💡 Funds will be locked in escrow until Prem confirms delivery with the correct proof phrase.
            Share the delivery proof with Prem out-of-band once goods are shipped.
          </p>
        </div>

        <button
          id="btn-create-escrow"
          onClick={handleCreateEscrow}
          disabled={isCreating || !amount || !deliveryProof}
          className="btn-primary w-full mt-4"
        >
          {isCreating ? "Creating Escrow..." : `🔒 Lock ${amount || "—"} PBR in Escrow`}
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

      {/* Active Escrows */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-base">📋</span>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Your Active Escrows
            </h3>
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">
            {myEscrows.length} escrow(s)
          </span>
        </div>

        {myEscrows.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-[var(--color-border)] rounded-lg">
            <div className="text-2xl mb-2 opacity-40">📭</div>
            <p className="text-sm text-[var(--color-text-muted)]">
              No escrows yet. Send a payment above to create one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Seller</th>
                  <th>Amount</th>
                  <th>Deadline</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myEscrows.map((escrow) => (
                  <tr key={escrow.id as number}>
                    <td className="font-mono text-[var(--color-text-accent)]">
                      #{(escrow.id as number).toString()}
                    </td>
                    <td>{(escrow.sellerName as string) || "Unknown"}</td>
                    <td className="font-semibold">
                      {escrow.amount as string} PBR
                    </td>
                    <td className="text-xs text-[var(--color-text-muted)]">
                      {escrow.deadlineFormatted as string}
                    </td>
                    <td>
                      <StatusBadge
                        label={escrow.status as string}
                        variant={
                          escrow.status === "COMPLETED"
                            ? "success"
                            : escrow.status === "REFUNDED"
                            ? "error"
                            : "warning"
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

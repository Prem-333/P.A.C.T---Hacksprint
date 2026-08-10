"use client";

/**
 * @module PaymentModal
 * @description Payment method selection modal — GPay or Cash.
 * GPay: Shows simulated UPI payment flow
 * Cash: Records cash payment with seller bank debit notification
 */

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface PaymentModalProps {
  product: {
    id: string;
    name: string;
    price: number;
    category: string;
    hsnCode: string;
    gstBreakdown: {
      basePrice: number;
      cgstRate: number;
      sgstRate: number;
      cgstAmount: number;
      sgstAmount: number;
      totalGST: number;
    };
    distribution: {
      totalAmount: number;
      cgst: number;
      sgst: number;
      platformFee: number;
      sellerMargin: number;
      rawMaterialTotal: number;
      supplierPayments: { name: string; amount: number; percentage: number }[];
    };
  };
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentModal({ product, onClose, onSuccess }: PaymentModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"select" | "processing" | "success">("select");
  const [paymentMethod, setPaymentMethod] = useState<"gpay" | "cash" | null>(null);
  const [result, setResult] = useState<any>(null);

  const handlePayment = async (method: "gpay" | "cash") => {
    setPaymentMethod(method);
    setStep("processing");

    try {
      const res = await fetch(`/api/payment/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      const data = await res.json();

      if (res.ok) {
        setResult(data);
        setStep("success");

        // Show tax warnings if any
        if (data.taxWarnings && data.taxWarnings.length > 0) {
          toast({
            type: "info",
            message: "⚠️ Tax Guideline Update",
            description: data.taxWarnings[0].message.slice(0, 100) + "...",
            duration: 8000,
          });
        }

        toast({
          type: "success",
          message: method === "gpay" ? "GPay Payment Successful!" : "Cash Payment Recorded!",
          description: data.message,
        });

        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        toast({
          type: "error",
          message: "Payment Failed",
          description: data.error,
        });
        setStep("select");
      }
    } catch {
      toast({
        type: "error",
        message: "Network Error",
        description: "Failed to process payment.",
      });
      setStep("select");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                {step === "success" ? "Payment Complete" : "Choose Payment Method"}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">{product.name}</p>
            </div>
            <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-lg">
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === "select" && (
            <>
              {/* Amount Display */}
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-[var(--color-text-primary)]">
                  ₹{product.price.toLocaleString()}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  incl. GST ({product.gstBreakdown.cgstRate + product.gstBreakdown.sgstRate}%)
                </p>
              </div>

              {/* GST Breakdown */}
              <div className="bg-[var(--color-surface-subtle)] rounded-xl p-4 mb-5 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Distribution Preview</p>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--color-text-secondary)]">Base Price</span>
                  <span className="font-medium">₹{product.gstBreakdown.basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-amber-600">
                  <span>CGST ({product.gstBreakdown.cgstRate}%)</span>
                  <span>₹{product.gstBreakdown.cgstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-amber-600">
                  <span>SGST ({product.gstBreakdown.sgstRate}%)</span>
                  <span>₹{product.gstBreakdown.sgstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-violet-600">
                  <span>Platform Fee</span>
                  <span>₹{product.distribution.platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-600">
                  <span>Raw Materials</span>
                  <span>₹{product.distribution.rawMaterialTotal.toFixed(2)}</span>
                </div>
                <div className="border-t border-[var(--color-border)] pt-2 flex justify-between text-xs font-semibold text-[var(--color-primary)]">
                  <span>Seller Margin</span>
                  <span>₹{product.distribution.sellerMargin.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handlePayment("gpay")}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-all group"
                >
                  <span className="text-2xl">📱</span>
                  <span className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)]">
                    GPay (UPI)
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">Instant digital</span>
                </button>
                <button
                  onClick={() => handlePayment("cash")}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-[var(--color-border)] hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
                >
                  <span className="text-2xl">💵</span>
                  <span className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-emerald-600">
                    Cash
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">Seller bank debited</span>
                </button>
              </div>
            </>
          )}

          {step === "processing" && (
            <div className="text-center py-8">
              <div className="inline-block w-12 h-12 border-3 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {paymentMethod === "gpay" ? "Processing GPay Payment..." : "Recording Cash Payment..."}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {paymentMethod === "gpay"
                  ? "Connecting to UPI gateway..."
                  : "Debiting seller's bank account..."}
              </p>
            </div>
          )}

          {step === "success" && result && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <p className="text-lg font-bold text-emerald-600 mb-1">Payment Successful!</p>
              <p className="text-sm text-[var(--color-text-primary)] font-medium mb-1">
                ₹{product.price.toLocaleString()} paid for {product.name}
              </p>
              {paymentMethod === "gpay" && result.upiRefNumber && (
                <p className="text-xs font-mono text-[var(--color-text-muted)] mb-3">
                  UPI Ref: {result.upiRefNumber}
                </p>
              )}
              {paymentMethod === "cash" && result.depositId && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3 text-left">
                  <p className="text-xs text-amber-700 font-medium">
                    💡 Cash received. ₹{product.price.toLocaleString()} has been debited from the seller's bank account for digital distribution.
                  </p>
                  <p className="text-[10px] text-amber-600 mt-1">
                    Deposit ID: {result.depositId}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

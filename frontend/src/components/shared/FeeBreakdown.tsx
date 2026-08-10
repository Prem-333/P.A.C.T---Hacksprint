/**
 * @module FeeBreakdown
 * @description Shows the 5-way GST distribution breakdown for a transaction.
 * CGST, SGST, Platform Fee, Raw Material Cost, Seller Margin.
 */

interface FeeBreakdownProps {
  amount: string;
  taxBps: number;
  vendorFeeBps: number;
}

export function FeeBreakdown({ amount, taxBps, vendorFeeBps }: FeeBreakdownProps) {
  const amountNum = parseFloat(amount || "0");
  
  // Calculate GST-inclusive breakdown
  // For perfumes (28% GST): CGST 14% + SGST 14%
  const gstRate = taxBps / 100; // taxBps as percentage
  const basePrice = amountNum / (1 + gstRate / 100);
  const cgstAmount = basePrice * (gstRate / 200); // Half of total GST
  const sgstAmount = basePrice * (gstRate / 200);
  
  const platformFee = basePrice * 0.01; // 1% platform fee
  const rawMaterialCost = basePrice * 0.40; // 40% raw materials
  const sellerMargin = basePrice - platformFee - rawMaterialCost;

  return (
    <div className="w-full bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-lg p-4 mt-4 animate-fade-in">
      <h4 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-3">
        Payment Distribution Preview
      </h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center text-[var(--color-text-secondary)]">
          <span>Total Amount</span>
          <span className="font-medium">₹{amountNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between items-center text-amber-600">
          <span>CGST ({(gstRate / 2).toFixed(0)}%)</span>
          <span>- ₹{cgstAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between items-center text-orange-600">
          <span>SGST ({(gstRate / 2).toFixed(0)}%)</span>
          <span>- ₹{sgstAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between items-center text-[var(--color-accent-violet)]">
          <span>Platform Fee (1%)</span>
          <span>- ₹{platformFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between items-center text-cyan-600">
          <span>Raw Materials (40%)</span>
          <span>- ₹{rawMaterialCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="pt-2 mt-2 border-t border-[var(--color-border)] flex justify-between items-center text-[var(--color-accent-emerald)] font-semibold">
          <span>Net to Seller</span>
          <span>₹{sellerMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
}

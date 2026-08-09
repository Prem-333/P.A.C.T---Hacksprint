import { formatEther } from "viem";

interface FeeBreakdownProps {
  amount: string;
  taxBps: number;
  vendorFeeBps: number;
}

export function FeeBreakdown({ amount, taxBps, vendorFeeBps }: FeeBreakdownProps) {
  const amountNum = parseFloat(amount || "0");
  const taxPct = taxBps / 100;
  const vendorPct = vendorFeeBps / 100;

  const taxAmount = (amountNum * taxPct) / 100;
  const vendorAmount = (amountNum * vendorPct) / 100;
  const finalAmount = amountNum - taxAmount - vendorAmount;

  return (
    <div className="w-full bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-lg p-4 mt-4 animate-fade-in">
      <h4 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-3">
        Settlement Preview
      </h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center text-[var(--color-text-secondary)]">
          <span>Gross Amount</span>
          <span className="font-medium">{amountNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PBR</span>
        </div>
        <div className="flex justify-between items-center text-[var(--color-accent-rose)]">
          <span>Platform Tax ({taxPct}%)</span>
          <span>- {taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PBR</span>
        </div>
        <div className="flex justify-between items-center text-[var(--color-accent-violet)]">
          <span>Vendor Fee ({vendorPct}%)</span>
          <span>- {vendorAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PBR</span>
        </div>
        <div className="pt-2 mt-2 border-t border-[var(--color-border)] flex justify-between items-center text-[var(--color-accent-emerald)] font-semibold">
          <span>Net to Merchant</span>
          <span>{finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PBR</span>
        </div>
      </div>
    </div>
  );
}

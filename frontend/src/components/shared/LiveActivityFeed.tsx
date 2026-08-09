import { RefreshCwIcon, SendIcon, CheckCircleIcon, ShieldCheckIcon, AlertCircleIcon } from "@/components/ui/Icons";

interface Transaction {
  txHash: string;
  type: string;
  from: string;
  to: string;
  amount: string;
  timestamp: number;
}

interface LiveActivityFeedProps {
  transactions: Transaction[];
}

export function LiveActivityFeed({ transactions }: LiveActivityFeedProps) {
  const getIcon = (type: string) => {
    if (type === "ESCROW_CREATED") return <ShieldCheckIcon size={16} />;
    if (type === "DELIVERY_CONFIRMED") return <CheckCircleIcon size={16} />;
    if (type === "ESCROW_REFUNDED") return <RefreshCwIcon size={16} />;
    if (type === "FEE_DISTRIBUTION") return <SendIcon size={16} />;
    return <AlertCircleIcon size={16} />;
  };

  const getColor = (type: string) => {
    if (type === "ESCROW_CREATED") return "bg-blue-100 text-blue-600 border-blue-200";
    if (type === "DELIVERY_CONFIRMED") return "bg-emerald-100 text-emerald-600 border-emerald-200";
    if (type === "ESCROW_REFUNDED") return "bg-amber-100 text-amber-600 border-amber-200";
    if (type === "FEE_DISTRIBUTION") return "bg-purple-100 text-purple-600 border-purple-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  const getMessage = (tx: Transaction) => {
    if (tx.type === "ESCROW_CREATED") return <><span className="font-semibold text-[var(--color-text-primary)]">{tx.from}</span> created an escrow for <span className="font-semibold text-blue-600">{tx.amount} PBR</span> to <span className="font-semibold text-[var(--color-text-primary)]">{tx.to}</span>.</>;
    if (tx.type === "DELIVERY_CONFIRMED") return <><span className="font-semibold text-[var(--color-text-primary)]">{tx.from}</span> confirmed delivery. <span className="font-semibold text-emerald-600">{tx.amount} PBR</span> settled.</>;
    if (tx.type === "ESCROW_REFUNDED") return <><span className="font-semibold text-[var(--color-text-primary)]">Escrow</span> expired. <span className="font-semibold text-amber-600">{tx.amount} PBR</span> refunded to <span className="font-semibold text-[var(--color-text-primary)]">{tx.to}</span>.</>;
    if (tx.type === "FEE_DISTRIBUTION") return <>System distributed <span className="font-semibold text-purple-600">{tx.amount} PBR</span> as fee to <span className="font-semibold text-[var(--color-text-primary)]">{tx.to}</span>.</>;
    return <><span className="font-semibold text-[var(--color-text-primary)]">{tx.from}</span> sent <span className="font-semibold">{tx.amount} PBR</span> to <span className="font-semibold text-[var(--color-text-primary)]">{tx.to}</span>.</>;
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-[var(--color-text-muted)]">
        No activity yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.slice(0, 10).map((tx, index) => (
        <div key={tx.txHash + index} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center border ${getColor(tx.type)}`}>
              {getIcon(tx.type)}
            </div>
            {index !== Math.min(transactions.length, 10) - 1 && (
              <div className="w-px h-full bg-[var(--color-border)] my-1"></div>
            )}
          </div>
          <div className="pb-4">
            <p className="text-sm text-[var(--color-text-secondary)] leading-snug">
              {getMessage(tx)}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                {new Date(tx.timestamp).toLocaleTimeString()}
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)]">&bull;</span>
              <span className="text-[10px] text-[var(--color-text-accent)] font-mono">
                Tx: {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

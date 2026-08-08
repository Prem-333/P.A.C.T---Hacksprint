"use client";

/**
 * @module Sidebar
 * @description Navigation sidebar showing the logged-in user's role
 * and platform information. No tab switching needed since each user
 * sees only their own view.
 */

interface SidebarProps {
  activeRole: "client" | "merchant" | "vendor";
  userName: string;
}

const roleConfig = {
  client: {
    icon: "🏭",
    label: "Client Panel",
    description: "MSME Buyer",
    color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30",
    items: [
      { icon: "💰", label: "Token Balance" },
      { icon: "📝", label: "Create Escrow" },
      { icon: "📋", label: "Active Escrows" },
    ],
  },
  merchant: {
    icon: "📦",
    label: "Merchant Panel",
    description: "Supplier",
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
    items: [
      { icon: "💰", label: "Merchant Balance" },
      { icon: "📥", label: "Incoming Escrows" },
      { icon: "✅", label: "Confirm Delivery" },
    ],
  },
  vendor: {
    icon: "🔍",
    label: "Vendor Panel",
    description: "Observer",
    color: "from-violet-500/20 to-purple-500/10 border-violet-500/30",
    items: [
      { icon: "👥", label: "All Users" },
      { icon: "🔗", label: "All Escrows" },
      { icon: "📊", label: "Transaction Audit" },
    ],
  },
};

export function Sidebar({ activeRole, userName }: SidebarProps) {
  const config = roleConfig[activeRole];

  return (
    <aside className="w-[260px] h-screen flex flex-col glass-card-elevated border-r border-[var(--color-border)] rounded-none sticky top-0">
      {/* Brand Header */}
      <div className="px-5 py-6 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-lg">₹</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-[var(--color-text-primary)] tracking-tight">
              Purpose-Bound
            </h1>
            <p className="text-[10px] font-medium text-[var(--color-text-accent)] tracking-wider uppercase">
              Rupee Platform
            </p>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="px-4 py-4">
        <div
          className={`p-4 rounded-xl bg-gradient-to-br ${config.color} border`}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                {userName}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)]">
                {config.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Items (informational) */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        <p className="px-3 mb-3 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest">
          {config.label}
        </p>
        {config.items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--color-text-secondary)]"
          >
            <span className="text-base">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-2 mb-2">
          <span className="status-dot status-dot-success" />
          <span className="text-xs text-[var(--color-text-secondary)]">
            Hardhat Local
          </span>
        </div>
        <p className="text-[10px] text-[var(--color-text-muted)]">
          Chain ID: 31337 · Real-time sync: 5s
        </p>
      </div>
    </aside>
  );
}

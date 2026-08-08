"use client";

/**
 * @module Header
 * @description Top header showing the logged-in user's profile,
 * wallet address, and logout button. No MetaMask connection needed.
 */

interface HeaderProps {
  viewTitle: string;
  viewDescription: string;
  userName: string;
  userRole: "client" | "merchant" | "vendor";
  userAddress: string;
  onLogout: () => void;
}

const roleColors = {
  client: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  merchant: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  vendor: "bg-violet-500/10 text-violet-400 border-violet-500/30",
};

const roleLabels = {
  client: "Client",
  merchant: "Merchant",
  vendor: "Vendor",
};

export function Header({
  viewTitle,
  viewDescription,
  userName,
  userRole,
  userAddress,
  onLogout,
}: HeaderProps) {
  return (
    <header className="h-[72px] border-b border-[var(--color-border)] bg-[var(--color-surface-glass)] backdrop-blur-xl flex items-center justify-between px-6">
      {/* Left: View Title */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] tracking-tight">
          {viewTitle}
        </h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          {viewDescription}
        </p>
      </div>

      {/* Right: User Info + Logout */}
      <div className="flex items-center gap-4">
        {/* Role Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${roleColors[userRole]}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {roleLabels[userRole]}
        </span>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              {userName}
            </p>
            <p className="text-[10px] font-mono text-[var(--color-text-muted)]">
              {userAddress.slice(0, 8)}...{userAddress.slice(-6)}
            </p>
          </div>

          <button
            id="btn-logout"
            onClick={onLogout}
            className="btn-ghost text-xs"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

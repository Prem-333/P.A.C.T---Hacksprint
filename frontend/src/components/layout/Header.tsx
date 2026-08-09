"use client";

/**
 * @module Header
 * @description Top header showing the logged-in user's profile,
 * wallet address, and logout button. No MetaMask connection needed.
 */

import { BellIcon, LogOutIcon } from "@/components/ui/Icons";

interface HeaderProps {
  viewTitle: string;
  viewDescription: string;
  userName: string;
  userRole: "client" | "merchant" | "vendor";
  userAddress: string;
  onLogout: () => void;
}

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
    <header className="h-16 border-b border-[var(--color-border)] bg-white flex items-center justify-between px-6">
      {/* Left: Navigation tabs */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            {viewTitle}
          </span>
        </div>
        <nav className="flex items-center gap-4 text-[0.8125rem]">
          <span className="text-[var(--color-primary)] font-medium border-b-2 border-[var(--color-primary)] pb-0.5">
            Overview
          </span>
          <span className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer">
            Analytics
          </span>
          <span className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer">
            Reports
          </span>
        </nav>
      </div>

      {/* Right: User Info + Logout */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-subtle)] transition-colors">
          <BellIcon size={18} />
        </button>

        {/* Role badge */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-emerald)]" />
          {roleLabels[userRole]}
        </span>

        {/* User Info */}
        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <p className="text-[0.8125rem] font-medium text-[var(--color-text-primary)] leading-tight">
              {userName}
            </p>
            <p className="text-[10px] font-mono text-[var(--color-text-muted)]">
              {userAddress.slice(0, 6)}..{userAddress.slice(-4)}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-center justify-center text-xs font-medium text-[var(--color-text-secondary)]">
            {userName.charAt(0)}
          </div>
        </div>

        <button
          id="btn-logout"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.8125rem] text-[var(--color-text-secondary)] hover:text-[var(--color-accent-rose)] hover:bg-rose-50 font-medium transition-colors"
        >
          <LogOutIcon size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}

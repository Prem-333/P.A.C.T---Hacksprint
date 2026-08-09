"use client";

/**
 * @module Sidebar
 * @description Navigation sidebar with active page tracking and route links.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DashboardIcon,
  EscrowIcon,
  TransactionsIcon,
  AuditLogIcon,
  SettingsIcon,
  SupportIcon,
} from "@/components/ui/Icons";

interface SidebarProps {
  activeRole: "client" | "merchant" | "vendor";
  userName: string;
}

const roleConfig = {
  client: {
    label: "Client Panel",
    description: "MSME Buyer",
  },
  merchant: {
    label: "Merchant Panel",
    description: "Supplier",
  },
  vendor: {
    label: "Vendor Panel",
    description: "Observer",
  },
};

function getNavItems(role: string) {
  return [
    { icon: <DashboardIcon size={18} />, label: "Dashboard", href: `/${role}` },
    { icon: <EscrowIcon size={18} />, label: "Escrows", href: `/${role}/escrows` },
    { icon: <TransactionsIcon size={18} />, label: "Transactions", href: `/${role}/transactions` },
    { icon: <AuditLogIcon size={18} />, label: "Audit Log", href: `/${role}/audit` },
  ];
}

export function Sidebar({ activeRole, userName }: SidebarProps) {
  const config = roleConfig[activeRole];
  const navItems = getNavItems(activeRole);
  const pathname = usePathname();

  return (
    <aside className="w-[240px] h-screen flex flex-col bg-white border-r border-[var(--color-border)] sticky top-0">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)] flex items-center justify-center">
            <span className="text-white font-semibold text-base">₹</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight">
              Purpose-Bound
            </h1>
            <p className="text-[10px] font-medium text-[var(--color-text-muted)] tracking-wide uppercase">
              Rupee Platform
            </p>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="px-4 py-3">
        <div className="px-3 py-2.5 rounded-lg bg-[var(--color-primary)] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium">
              {userName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium leading-tight">{userName}</p>
              <p className="text-[10px] opacity-75">{config.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-1 space-y-0.5">
        <div className="flex items-center gap-2 px-3 mb-2">
          <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest">
            {config.label}
          </p>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.8125rem] transition-colors relative group ${
                isActive
                  ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[var(--color-primary)] rounded-r-full" />
              )}
              <span className={`w-5 flex justify-center ${isActive ? "" : "opacity-75 group-hover:opacity-100 transition-opacity"}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-3 space-y-0.5">
        <div className="flex items-center gap-2.5 px-3 py-2 text-[0.8125rem] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-text-primary)] rounded-lg transition-colors cursor-pointer group">
          <span className="w-5 flex justify-center opacity-75 group-hover:opacity-100 transition-opacity">
            <SettingsIcon size={18} />
          </span>
          <span>Settings</span>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-2 text-[0.8125rem] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-text-primary)] rounded-lg transition-colors cursor-pointer group">
          <span className="w-5 flex justify-center opacity-75 group-hover:opacity-100 transition-opacity">
            <SupportIcon size={18} />
          </span>
          <span>Support</span>
        </div>
      </div>
    </aside>
  );
}

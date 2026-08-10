"use client";

/**
 * @module Sidebar
 * @description Sidebar navigation with role-based menu items.
 * Updated for Customer, Seller, Bank, and Supplier roles.
 */

import { useRouter, usePathname } from "next/navigation";
import { RupeeIcon, ShieldIcon, TruckIcon, BellIcon, BarChartIcon, UsersIcon, PackageIcon, SettingsIcon } from "@/components/ui/Icons";

interface SidebarProps {
  activeRole: "customer" | "seller" | "bank" | "supplier";
  userName: string;
}

const roleConfigs = {
  customer: {
    emoji: "👤",
    label: "Customer",
    color: "var(--color-primary)",
    items: [
      { label: "Shop & Pay", path: "/customer", icon: RupeeIcon },
    ],
  },
  seller: {
    emoji: "🏪",
    label: "Seller",
    color: "var(--color-accent-emerald)",
    items: [
      { label: "Dashboard", path: "/seller", icon: RupeeIcon },
      { label: "Logistics", path: "/seller/logistics", icon: BarChartIcon },
    ],
  },
  bank: {
    emoji: "🏦",
    label: "Bank",
    color: "var(--color-accent-amber)",
    items: [
      { label: "Ledger & GST", path: "/bank", icon: ShieldIcon },
    ],
  },
  supplier: {
    emoji: "📦",
    label: "Supplier",
    color: "var(--color-accent-violet)",
    items: [
      { label: "Payments", path: "/supplier", icon: PackageIcon },
    ],
  },
};

export function Sidebar({ activeRole, userName }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const config = roleConfigs[activeRole];

  return (
    <aside className="w-60 bg-white border-r border-[var(--color-border)] flex flex-col h-screen shrink-0">
      {/* Logo */}
      <div className="h-16 border-b border-[var(--color-border)] flex items-center px-5 gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs bg-[var(--color-primary)]">
          P
        </div>
        <div>
          <span className="text-sm font-semibold text-[var(--color-text-primary)] tracking-tight">
            P.A.C.T.
          </span>
          <p className="text-[9px] text-[var(--color-text-muted)] -mt-0.5">
            Payments Automated Commerce
          </p>
        </div>
      </div>

      {/* Role Info */}
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.emoji}</span>
          <div>
            <p className="text-xs font-medium text-[var(--color-text-primary)]">{userName}</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">{config.label}</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-2 mb-2">
          Navigation
        </p>
        {config.items.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`nav-tab ${isActive ? "nav-tab-active" : ""}`}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--color-border)] p-4">
        <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Digital Payment Platform v2.0
        </div>
      </div>
    </aside>
  );
}

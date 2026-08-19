"use client";

/**
 * @module Sidebar
 * @description Sidebar navigation with role-based menu items.
 * Updated for Customer, Seller, Bank, and Supplier roles.
 */

import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { RupeeIcon, ShieldIcon, TruckIcon, BellIcon, BarChartIcon, UsersIcon, PackageIcon, SettingsIcon, UserIcon, BuildingIcon } from "@/components/ui/Icons";

interface SidebarProps {
  activeRole: "customer" | "seller" | "bank" | "supplier";
  userName: string;
}

const roleConfigs = {
  customer: {
    iconType: UserIcon,
    label: "Customer",
    color: "var(--color-primary)",
    items: [
      { label: "Shop & Pay", path: "/customer", icon: RupeeIcon },
    ],
  },
  seller: {
    iconType: BuildingIcon,
    label: "Seller",
    color: "var(--color-accent-emerald)",
    items: [
      { label: "Dashboard", path: "/seller", icon: RupeeIcon },
      { label: "Logistics", path: "/seller/logistics", icon: BarChartIcon },
      { label: "Reports", path: "/seller/reports", icon: BookOpen },
    ],
  },
  bank: {
    iconType: BuildingIcon,
    label: "Bank",
    color: "var(--color-accent-amber)",
    items: [
      { label: "Dashboard", path: "/bank", icon: RupeeIcon },
      { label: "Ledger", path: "/bank/ledger", icon: BookOpen },
      { label: "GST", path: "/bank/gst", icon: ShieldIcon },
    ],
  },
  supplier: {
    iconType: PackageIcon,
    label: "Supplier",
    color: "var(--color-accent-violet)",
    items: [
      { label: "Dashboard", path: "/supplier", icon: RupeeIcon },
      { label: "Payments", path: "/supplier/payments", icon: PackageIcon },
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
          <span className="text-lg text-[var(--color-text-primary)]">
            <config.iconType size={24} />
          </span>
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
              className={`relative flex items-center gap-3 px-3 py-2 w-full text-[13px] transition-colors rounded-lg mb-1 ${
                isActive 
                  ? "text-[#0a2540] font-semibold" 
                  : "text-slate-500 font-medium hover:text-[#0a2540] hover:bg-slate-50"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-slate-200 rounded-lg -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={16} className="relative z-10" />
              <span className="relative z-10">{item.label}</span>
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

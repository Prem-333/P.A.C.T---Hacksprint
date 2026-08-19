"use client";

/**
 * @module Header
 * @description Top header showing the logged-in user's profile,
 * wallet address, and logout button.
 */

import { BellIcon, LogOutIcon } from "@/components/ui/Icons";
import { ShoppingBag, User, Store } from "lucide-react";

interface HeaderProps {
  viewTitle: string;
  viewDescription: string;
  userName: string;
  userRole: "customer" | "seller" | "bank" | "supplier";
  userAddress: string;
  onLogout: () => void;
}

export function Header({
  viewTitle,
  viewDescription,
  userName,
  userRole,
  userAddress,
  onLogout,
}: HeaderProps) {
  // Strip emojis from viewTitle if any are passed
  const cleanTitle = viewTitle.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

  return (
    <header className="h-[72px] border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
      {/* Left: Title & Nav */}
      <div className="flex items-center gap-8 h-full">
        <div className="flex items-center gap-2">
          {userRole === 'customer' && <ShoppingBag className="w-5 h-5 text-[#0a2540]" strokeWidth={2.5} />}
          {userRole === 'seller' && <Store className="w-5 h-5 text-[#0a2540]" strokeWidth={2.5} />}
          <span className="text-[17px] font-bold text-slate-900">
            {cleanTitle}
          </span>
        </div>
      </div>

      {/* Right: User Info + Logout */}
      <div className="flex items-center gap-5">
        {/* Notifications */}
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
          <BellIcon size={20} />
        </button>

        {/* Role Badge (Seller mockup specific) */}
        {userRole === 'seller' && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-[12px] font-semibold text-slate-700">
            <ShoppingBag className="w-3.5 h-3.5" />
            Seller
          </div>
        )}

        <div className="w-px h-8 bg-slate-200 mx-1"></div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[13px] font-semibold text-slate-900 leading-tight">
              {userName}
            </p>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              {userAddress.slice(0, 6)}..{userAddress.slice(-4)}
            </p>
          </div>
          <div className="w-9 h-9 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200/60">
            <User className="w-4 h-4" strokeWidth={2.5} />
          </div>
        </div>

        <button
          id="btn-logout"
          onClick={onLogout}
          className="flex items-center gap-2 ml-2 px-3 py-1.5 rounded-md text-[13px] text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-medium transition-colors"
        >
          <LogOutIcon size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

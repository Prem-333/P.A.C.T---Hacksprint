"use client";

/**
 * @module Header
 * @description Top header showing the logged-in user's profile,
 * wallet address, and logout button.
 */

import { BellIcon, LogOutIcon } from "@/components/ui/Icons";
import { ShoppingBag, User } from "lucide-react";

interface HeaderProps {
  viewTitle: string;
  viewDescription: string;
  userName: string;
  userRole: "customer" | "seller" | "bank" | "supplier";
  userAddress: string;
  onLogout: () => void;
  activeTab?: "overview" | "analytics" | "reports";
  onTabChange?: (tab: "overview" | "analytics" | "reports") => void;
}

export function Header({
  viewTitle,
  viewDescription,
  userName,
  userRole,
  userAddress,
  onLogout,
  activeTab = "overview",
  onTabChange,
}: HeaderProps) {
  // Strip emojis from viewTitle if any are passed
  const cleanTitle = viewTitle.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

  return (
    <header className="h-[72px] border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
      {/* Left: Title & Nav */}
      <div className="flex items-center gap-8 h-full">
        <div className="flex items-center gap-2">
          {userRole === 'customer' && <ShoppingBag className="w-5 h-5 text-[#0a2540]" strokeWidth={2.5} />}
          <span className="text-[17px] font-bold text-slate-900">
            {cleanTitle}
          </span>
        </div>
        <nav className="flex items-center gap-6 text-[13px] h-full">
          <button 
            onClick={() => onTabChange?.("overview")}
            className={`h-full flex items-center px-1 transition-colors ${
              activeTab === "overview" 
                ? "text-[#0c6a54] font-semibold border-b-[3px] border-[#0c6a54]" 
                : "text-slate-500 font-medium hover:text-slate-900 border-b-[3px] border-transparent"
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => onTabChange?.("analytics")}
            className={`h-full flex items-center px-1 transition-colors ${
              activeTab === "analytics" 
                ? "text-[#0c6a54] font-semibold border-b-[3px] border-[#0c6a54]" 
                : "text-slate-500 font-medium hover:text-slate-900 border-b-[3px] border-transparent"
            }`}
          >
            Analytics
          </button>
          <button 
            onClick={() => onTabChange?.("reports")}
            className={`h-full flex items-center px-1 transition-colors ${
              activeTab === "reports" 
                ? "text-[#0c6a54] font-semibold border-b-[3px] border-[#0c6a54]" 
                : "text-slate-500 font-medium hover:text-slate-900 border-b-[3px] border-transparent"
            }`}
          >
            Reports
          </button>
        </nav>
      </div>

      {/* Right: User Info + Logout */}
      <div className="flex items-center gap-5">
        {/* Notifications */}
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
          <BellIcon size={20} />
        </button>

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
          className="flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-md text-[12px] text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-medium transition-colors"
        >
          <LogOutIcon size={16} />
        </button>
      </div>
    </header>
  );
}

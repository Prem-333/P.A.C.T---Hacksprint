"use client";

/**
 * @module LoginPage
 * @description Login page with 4 role cards: Customer, Seller, Bank, Supplier.
 * Rebranded for P.A.C.T. — Payments Automated Commerce & Tax Platform.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Store, Landmark, Package } from "lucide-react";

interface LoginCard {
  username: string;
  password: string;
  name: string;
  role: string;
  icon: React.ElementType;
  description: string;
  btnColor: string;
  iconBg: string;
  iconColor: string;
}

const users: LoginCard[] = [
  {
    username: "customer",
    password: "customer123",
    name: "Customer",
    role: "customer",
    icon: User,
    description: "Browse & buy products. Pay via integrated gateways with automatic tax calculation and invoice generation.",
    btnColor: "#042045",
    iconBg: "bg-slate-50",
    iconColor: "text-[#042045]",
  },
  {
    username: "seller",
    password: "seller123",
    name: "Seller",
    role: "seller",
    icon: Store,
    description: "Manage orders, confirm deliveries, track revenue & cash deposits. View logistics and automated compliance reports.",
    btnColor: "#0c6a54",
    iconBg: "bg-emerald-50",
    iconColor: "text-[#0c6a54]",
  },
  {
    username: "bank",
    password: "bank123",
    name: "Bank",
    role: "bank",
    icon: Landmark,
    description: "Settlement ledger, tax collection reports, view all account balances & comprehensive transaction tracking.",
    btnColor: "#f39c12",
    iconBg: "bg-orange-50",
    iconColor: "text-[#d68910]",
  },
  {
    username: "supplier",
    password: "supplier123",
    name: "Raw Material Supplier",
    role: "supplier",
    icon: Package,
    description: "Track payments from sales — monitor materials, automated inventory alerts, and packaging distribution metrics.",
    btnColor: "#ab8af5",
    iconBg: "bg-purple-50",
    iconColor: "text-[#8e44ad]",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [loadingUser, setLoadingUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (user: LoginCard) => {
    setLoadingUser(user.username);
    setError(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          password: user.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/${user.role}`);
      } else {
        setError(data.error || "Login failed");
        setLoadingUser(null);
      }
    } catch {
      setError("Network error — make sure the dev server is running");
      setLoadingUser(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-6 font-sans">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="flex flex-col items-center justify-center gap-1 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0a1128] flex items-center justify-center text-white text-xl font-bold shadow-md">
              P
            </div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              P.A.C.T.
            </h1>
          </div>
          <p className="text-[10px] sm:text-xs font-semibold text-slate-600 tracking-[0.2em] mt-1 uppercase">
            Payments Automated Commerce & Tax
          </p>
        </div>
        <p className="text-[13px] sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Digital Payment & Financial Automation Platform for B2B commerce with GPay<br className="hidden sm:block" />
          integration, automated GST distribution, and AI-powered tax compliance.
        </p>
      </div>

      {/* User Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1200px] w-full">
        {users.map((user, idx) => {
          const Icon = user.icon;
          return (
            <button
              key={user.username}
              id={`login-${user.username}`}
              onClick={() => handleLogin(user)}
              disabled={!!loadingUser}
              className={`text-left bg-white rounded-xl border border-slate-200 p-6 transition-all hover:shadow-xl hover:-translate-y-1 disabled:opacity-60 disabled:cursor-wait animate-fade-in group flex flex-col`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-lg ${user.iconBg} ${user.iconColor} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}>
                <Icon strokeWidth={2} className="w-6 h-6" />
              </div>

              <h3 className="text-base font-semibold text-slate-900 mb-2">
                {user.name}
              </h3>
              <p className="text-[13px] text-slate-500 leading-relaxed mb-6 flex-grow">
                {user.description}
              </p>

              {/* Credentials */}
              <div className="bg-slate-100/80 rounded-md p-3 mb-4 w-full">
                <div className="flex justify-between items-center text-[11px] mb-1.5">
                  <span className="text-slate-500 font-medium">User</span>
                  <span className="font-mono font-medium text-slate-800">{user.username}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 font-medium">Pass</span>
                  <span className="font-mono font-medium text-slate-800">{user.password}</span>
                </div>
              </div>

              {/* Login Button */}
              <div
                className="w-full text-center py-2.5 rounded-md text-[13px] font-medium text-white transition-all shadow-sm"
                style={{ backgroundColor: user.btnColor }}
              >
                {loadingUser === user.username ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  `Login as ${user.name === "Raw Material Supplier" ? "Supplier" : user.name}`
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 px-4 py-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-600 font-medium animate-fade-in">
          {error}
        </div>
      )}
    </div>
  );
}


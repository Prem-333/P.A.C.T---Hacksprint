"use client";

/**
 * @module LoginPage
 * @description Login page with 4 role cards: Customer, Seller, Bank, Supplier.
 * Rebranded for P.A.C.T. — Payments Automated Commerce & Tax Platform.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LoginCard {
  username: string;
  password: string;
  name: string;
  role: string;
  emoji: string;
  description: string;
  color: string;
  gradient: string;
}

const users: LoginCard[] = [
  {
    username: "customer",
    password: "customer123",
    name: "Customer",
    role: "customer",
    emoji: "👤",
    description: "Browse & buy perfumes. Pay via GPay or Cash with automatic GST calculation.",
    color: "var(--color-primary)",
    gradient: "from-violet-500/10 to-purple-500/10",
  },
  {
    username: "seller",
    password: "seller123",
    name: "Seller",
    role: "seller",
    emoji: "🏪",
    description: "Manage orders, confirm deliveries, track revenue & cash deposits. View logistics.",
    color: "var(--color-accent-emerald)",
    gradient: "from-emerald-500/10 to-teal-500/10",
  },
  {
    username: "bank",
    password: "bank123",
    name: "Bank",
    role: "bank",
    emoji: "🏦",
    description: "Settlement ledger, GST collection reports, all account balances & cash tracking.",
    color: "var(--color-accent-amber)",
    gradient: "from-amber-500/10 to-orange-500/10",
  },
  {
    username: "supplier",
    password: "supplier123",
    name: "Raw Material Supplier",
    role: "supplier",
    emoji: "📦",
    description: "Track payments from sales — fragrance oils, bottles, and packaging distribution.",
    color: "var(--color-accent-violet)",
    gradient: "from-pink-500/10 to-rose-500/10",
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
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-10 animate-fade-in">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-violet-200">
            P
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
              P.A.C.T.
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] -mt-0.5">
              Payments Automated Commerce & Tax
            </p>
          </div>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed">
          Digital Payment & Financial Automation Platform for B2B commerce with
          GPay integration, automated GST distribution, and AI-powered tax compliance.
        </p>
      </div>

      {/* User Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full">
        {users.map((user, idx) => (
          <button
            key={user.username}
            id={`login-${user.username}`}
            onClick={() => handleLogin(user)}
            disabled={!!loadingUser}
            className={`text-left bg-white rounded-2xl border border-[var(--color-border)] p-5 transition-all hover:shadow-lg hover:-translate-y-1 disabled:opacity-60 disabled:cursor-wait animate-fade-in group`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            {/* Emoji & Role */}
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${user.gradient} flex items-center justify-center text-2xl mb-4 group-hover:scale-105 transition-transform`}>
              {user.emoji}
            </div>

            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
              {user.name}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">
              {user.description}
            </p>

            {/* Credentials */}
            <div className="bg-[var(--color-surface-subtle)] rounded-lg p-2.5 mb-3">
              <div className="flex justify-between text-[10px]">
                <span className="text-[var(--color-text-muted)]">User</span>
                <span className="font-mono font-medium text-[var(--color-text-primary)]">{user.username}</span>
              </div>
              <div className="flex justify-between text-[10px] mt-1">
                <span className="text-[var(--color-text-muted)]">Pass</span>
                <span className="font-mono font-medium text-[var(--color-text-primary)]">{user.password}</span>
              </div>
            </div>

            {/* Login Button */}
            <div
              className="w-full text-center py-2 rounded-lg text-xs font-medium text-white transition-all"
              style={{ backgroundColor: user.color }}
            >
              {loadingUser === user.username ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                `Login as ${user.name}`
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 px-4 py-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-600 font-medium animate-fade-in">
          {error}
        </div>
      )}

      {/* Footer */}
      <div className="mt-10 text-center space-y-2">
        <div className="flex items-center justify-center gap-4 text-[10px] text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            GPay (UPI) Integration
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Indian GST Compliance
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            AI Tax Engine
          </span>
        </div>
        <p className="text-[10px] text-[var(--color-text-muted)]">
          ISO 20022 Compliant · Multi-party automated settlement
        </p>
      </div>
    </div>
  );
}

"use client";

/**
 * @module LoginPage
 * @description Login page with three user cards (Bharath, Prem, Kanish).
 * Users can click a card or type credentials manually.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UserCard {
  username: string;
  password: string;
  name: string;
  role: string;
  icon: string;
  color: string;
  description: string;
}

const userCards: UserCard[] = [
  {
    username: "bharath",
    password: "bharath123",
    name: "Bharath",
    role: "Client (Buyer)",
    icon: "🏭",
    color: "from-blue-500 to-indigo-600",
    description: "MSME Raw Material Buyer — Sends payments through escrow",
  },
  {
    username: "prem",
    password: "prem123",
    name: "Prem",
    role: "Merchant (Supplier)",
    icon: "📦",
    color: "from-emerald-500 to-teal-600",
    description: "Authorized Merchant — Confirms delivery & receives funds",
  },
  {
    username: "kanish",
    password: "kanish123",
    name: "Kanish",
    role: "Vendor (Observer)",
    icon: "🔍",
    color: "from-violet-500 to-purple-600",
    description: "Supply Chain Vendor — Monitors all transactions",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const handleLogin = async (user?: string, pass?: string) => {
    const loginUser = user || username;
    const loginPass = pass || password;

    if (!loginUser || !loginPass) {
      setError("Please enter username and password");
      return;
    }

    setIsLoading(true);
    setError("");
    setSelectedUser(loginUser);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser, password: loginPass }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setIsLoading(false);
        setSelectedUser(null);
        return;
      }

      // Redirect to dashboard
      router.push("/");
      router.refresh();
    } catch {
      setError("Connection failed. Is the server running?");
      setIsLoading(false);
      setSelectedUser(null);
    }
  };

  const handleCardClick = (card: UserCard) => {
    setUsername(card.username);
    setPassword(card.password);
    handleLogin(card.username, card.password);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] bg-mesh flex items-center justify-center p-6">
      <div className="w-full max-w-4xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-white font-bold text-2xl">₹</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
            Purpose-Bound Rupee
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">
            Enterprise Digital Payment Platform — B2B Industrial Procurement
          </p>
        </div>

        {/* User Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {userCards.map((card) => (
            <button
              key={card.username}
              id={`login-${card.username}`}
              onClick={() => handleCardClick(card)}
              disabled={isLoading}
              className={`glass-card p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                selectedUser === card.username
                  ? "ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/10"
                  : ""
              } ${isLoading && selectedUser !== card.username ? "opacity-50" : ""}`}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-lg`}
              >
                <span className="text-2xl">{card.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {card.name}
              </h3>
              <p className="text-xs font-medium text-[var(--color-text-accent)] mb-2">
                {card.role}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                {card.description}
              </p>

              {selectedUser === card.username && isLoading && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-block w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                  <span className="text-xs text-[var(--color-text-accent)]">
                    Signing in...
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Manual Login Form */}
        <div className="glass-card p-6 max-w-md mx-auto">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 text-center">
            Or enter credentials manually
          </h3>
          <div className="space-y-3">
            <input
              id="input-login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="input-field"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <input
              id="input-login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="input-field"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            {error && (
              <p className="text-xs text-rose-400 text-center">{error}</p>
            )}
            <button
              id="btn-login"
              onClick={() => handleLogin()}
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </div>

        {/* Credentials Info */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-[var(--color-text-muted)]">
            Demo Credentials — bharath/bharath123 · prem/prem123 ·
            kanish/kanish123
          </p>
        </div>
      </div>
    </div>
  );
}

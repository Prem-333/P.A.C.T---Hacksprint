"use client";

/**
 * @module LoginPage
 * @description Login page with three user cards (Bharath, Prem, Kanish).
 * Users can click a card or type credentials manually.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BuildingIcon, PackageIcon, EyeIcon } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";

interface UserCard {
  username: string;
  password: string;
  name: string;
  role: string;
  roleLabel: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const userCards: UserCard[] = [
  {
    username: "bharath",
    password: "bharath123",
    name: "Bharath",
    role: "Client",
    roleLabel: "CLIENT (BUYER)",
    icon: <BuildingIcon size={20} className="text-blue-500" />,
    color: "text-blue-600",
    description: "MSME Raw Material Buyer — Sends payments through escrow.",
  },
  {
    username: "prem",
    password: "prem123",
    name: "Prem",
    role: "Merchant",
    roleLabel: "MERCHANT (SUPPLIER)",
    icon: <PackageIcon size={20} className="text-emerald-500" />,
    color: "text-emerald-600",
    description: "Authorized Merchant — Confirms delivery & receives funds.",
  },
  {
    username: "kanish",
    password: "kanish123",
    name: "Kanish",
    role: "Vendor",
    roleLabel: "VENDOR (OBSERVER)",
    icon: <EyeIcon size={20} className="text-purple-500" />,
    color: "text-purple-600",
    description: "Supply Chain Vendor — Monitors all transactions securely.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const handleLogin = async (user?: string, pass?: string) => {
    const loginUser = user || username;
    const loginPass = pass || password;

    if (!loginUser || !loginPass) {
      toast({
        type: "error",
        message: "Missing credentials",
        description: "Please enter both username and password.",
      });
      return;
    }

    setIsLoading(true);
    setSelectedUser(loginUser);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser, password: loginPass }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          type: "error",
          message: "Login failed",
          description: data.error || "Invalid username or password.",
        });
        setIsLoading(false);
        setSelectedUser(null);
        return;
      }

      toast({
        type: "success",
        message: "Welcome back!",
        description: `Successfully signed in as ${data.user.name}.`,
        duration: 3000,
      });

      // Redirect to dashboard
      router.push("/");
      router.refresh();
    } catch {
      toast({
        type: "error",
        message: "Connection failed",
        description: "Could not connect to the server. Is it running?",
      });
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
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--color-primary)] mb-5">
            <span className="text-white font-semibold text-2xl">₹</span>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] tracking-tight">
            Purpose-Bound Rupee
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1.5">
            Enterprise Digital Payment Platform — B2B Industrial Procurement
          </p>
        </div>

        {/* User Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {userCards.map((card, index) => (
            <button
              key={card.username}
              id={`login-${card.username}`}
              onClick={() => handleCardClick(card)}
              disabled={isLoading}
              style={{ animationDelay: `${index * 100}ms` }}
              className={`glass-card p-5 text-left animate-fade-in opacity-0 fill-mode-forwards transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] ${
                selectedUser === card.username
                  ? "ring-2 ring-[var(--color-primary)]/40 shadow-[var(--shadow-card-hover)]"
                  : ""
              } ${isLoading && selectedUser !== card.username ? "opacity-50" : ""}`}
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-center justify-center mb-4 text-xl">
                {card.icon}
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                {card.name}
              </h3>
              <p className={`text-[10px] font-semibold ${card.color} tracking-wider mb-2`}>
                {card.roleLabel}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                {card.description}
              </p>

              {selectedUser === card.username && isLoading && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-block w-3 h-3 border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
                  <span className="text-xs text-[var(--color-primary)]">
                    Signing in...
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6 max-w-sm mx-auto">
          <div className="flex-1 h-px bg-[var(--color-border)]" />
          <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest">
            Or enter credentials manually
          </span>
          <div className="flex-1 h-px bg-[var(--color-border)]" />
        </div>

        {/* Manual Login Form */}
        <div className="glass-card p-6 max-w-sm mx-auto">
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
          <p className="text-[10px] text-[var(--color-text-muted)] tracking-wide uppercase">
            Demo Credentials — bharath/bharath123 · prem/prem123 ·
            kanish/kanish123
          </p>
        </div>
      </div>
    </div>
  );
}

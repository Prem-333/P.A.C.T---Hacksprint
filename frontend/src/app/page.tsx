"use client";

/**
 * @module Dashboard
 * @description Main dashboard page. Checks for active session cookie,
 * redirects to login if not authenticated, and renders role-specific views.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ClientView } from "@/components/dashboard/ClientView";
import { MerchantView } from "@/components/dashboard/MerchantView";
import { VendorView } from "@/components/dashboard/VendorView";
import { TransactionLog } from "@/components/shared/TransactionLog";

interface UserSession {
  username: string;
  name: string;
  role: "client" | "merchant" | "vendor";
  address: string;
  description: string;
}

interface BalanceData {
  totalSupply: string;
  activeEscrows: number;
  users: {
    username: string;
    name: string;
    role: string;
    address: string;
    balance: string;
    isPurposeBound: boolean;
  }[];
}

interface TransactionEntry {
  txHash: string;
  type: string;
  from: string;
  to: string;
  amount: string;
  blockNumber: number;
  timestamp: number;
  iso20022: Record<string, unknown>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [balances, setBalances] = useState<BalanceData | null>(null);
  const [escrows, setEscrows] = useState<Record<string, unknown>[]>([]);
  const [transactions, setTransactions] = useState<TransactionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Check Session ──
  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("pbr_session="));
    if (!cookie) {
      router.push("/login");
      return;
    }
    try {
      const token = decodeURIComponent(cookie.substring("pbr_session=".length));
      const data = JSON.parse(atob(token)) as UserSession;
      setUser(data);
      setIsLoading(false);
    } catch {
      router.push("/login");
    }
  }, [router]);

  // ── Fetch Data ──
  const fetchData = useCallback(async () => {
    try {
      const [balRes, escRes, txRes] = await Promise.all([
        fetch("/api/balance"),
        fetch("/api/escrow/list"),
        fetch("/api/transactions"),
      ]);
      const [balData, escData, txData] = await Promise.all([
        balRes.json(),
        escRes.json(),
        txRes.json(),
      ]);
      setBalances(balData);
      setEscrows(escData.escrows || []);
      setTransactions(txData.transactions || []);
    } catch (err) {
      console.error("Data fetch error:", err);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [user, fetchData]);

  // ── Logout ──
  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    document.cookie = "pbr_session=; Max-Age=0; path=/";
    router.push("/login");
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] bg-mesh flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="inline-block w-8 h-8 border-3 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mb-4" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Get current user's balance
  const myBalance = balances?.users.find(
    (u) => u.username === user.username
  );

  // Transform transactions for the log component
  const logEntries = transactions.map((tx) => ({
    txHash: tx.txHash,
    type: tx.type,
    timestamp: tx.timestamp,
    iso20022: tx.iso20022 as unknown as import("@/types").ISO20022Message,
  }));

  const viewTitles = {
    client: { title: "🏭 Client Dashboard — Bharath", desc: "Send payments and create DvP escrows for raw material procurement" },
    merchant: { title: "📦 Merchant Dashboard — Prem", desc: "View incoming escrows, confirm deliveries, and receive settlements" },
    vendor: { title: "🔍 Vendor Dashboard — Kanish", desc: "Monitor all supply chain transactions and settlements" },
  };

  const { title, desc } = viewTitles[user.role];

  return (
    <div className="flex h-screen overflow-hidden bg-mesh">
      <Sidebar activeRole={user.role} userName={user.name} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          viewTitle={title}
          viewDescription={desc}
          userName={user.name}
          userRole={user.role}
          userAddress={user.address}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="animate-fade-in">
            {user.role === "client" && (
              <ClientView
                balance={myBalance?.balance || "0"}
                isPurposeBound={myBalance?.isPurposeBound || false}
                address={user.address}
                escrows={escrows}
                onRefresh={fetchData}
              />
            )}
            {user.role === "merchant" && (
              <MerchantView
                balance={myBalance?.balance || "0"}
                address={user.address}
                escrows={escrows}
                activeEscrows={balances?.activeEscrows || 0}
                onRefresh={fetchData}
              />
            )}
            {user.role === "vendor" && (
              <VendorView
                balances={balances}
                escrows={escrows}
                transactions={transactions}
              />
            )}
          </div>

          {/* ISO 20022 Transaction Log */}
          <div className="border-t border-[var(--color-border)] pt-6">
            <TransactionLog entries={logEntries} />
          </div>
        </main>
      </div>
    </div>
  );
}

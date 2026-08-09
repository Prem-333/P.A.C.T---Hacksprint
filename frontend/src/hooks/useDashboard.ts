"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ISO20022Message } from "@/types";

export interface UserSession {
  username: string;
  name: string;
  role: "client" | "merchant" | "vendor";
  address: string;
  description: string;
}

export interface BalanceData {
  totalSupply: string;
  activeEscrows: number;
  taxBps: number;
  vendorFeeBps: number;
  users: {
    username: string;
    name: string;
    role: string;
    address: string;
    balance: string;
    isPurposeBound: boolean;
  }[];
}

export interface TransactionEntry {
  txHash: string;
  type: string;
  from: string;
  to: string;
  amount: string;
  blockNumber: number;
  timestamp: number;
  iso20022: Record<string, unknown> | ISO20022Message;
}

export function useDashboard(requiredRole: "client" | "merchant" | "vendor") {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [balances, setBalances] = useState<BalanceData | null>(null);
  const [escrows, setEscrows] = useState<Record<string, unknown>[]>([]);
  const [transactions, setTransactions] = useState<TransactionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Check Session & Role ──
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
      
      // Enforce role-based access control
      if (data.role !== requiredRole) {
        router.push(`/${data.role}`);
        return;
      }
      
      setUser(data);
      setIsLoading(false);
    } catch {
      router.push("/login");
    }
  }, [router, requiredRole]);

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

  return {
    user,
    balances,
    escrows,
    transactions,
    isLoading,
    fetchData,
    handleLogout,
  };
}

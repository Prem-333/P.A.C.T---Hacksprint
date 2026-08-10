"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ISO20022Message, TaxWarning } from "@/types";

export interface UserSession {
  username: string;
  name: string;
  role: "customer" | "seller" | "bank" | "supplier";
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
  suppliers: {
    id: string;
    name: string;
    type: string;
    address: string;
    balance: string;
    sharePercent: number;
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
  metadata?: {
    paymentMethod?: string;
    productName?: string;
    productId?: string;
    gstBreakdown?: { cgst: number; sgst: number; total: number };
    upiRefNumber?: string;
    cashDepositPending?: boolean;
  };
}

export interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  hsnCode: string;
  gstBreakdown: {
    basePrice: number;
    cgstRate: number;
    sgstRate: number;
    cgstAmount: number;
    sgstAmount: number;
    totalGST: number;
    totalPrice: number;
  };
  distribution: {
    totalAmount: number;
    basePrice: number;
    cgst: number;
    sgst: number;
    platformFee: number;
    sellerMargin: number;
    rawMaterialTotal: number;
    supplierPayments: { name: string; amount: number; percentage: number }[];
  };
  rawMaterialBreakdown: { fragranceOil: number; bottles: number; packaging: number };
  gstRateInfo: { cgst: number; sgst: number; total: number; description: string };
  hasWarning: boolean;
  warning: TaxWarning | null;
}

export interface TaxWarningData {
  warnings: TaxWarning[];
  summary: {
    lastChecked: string;
    totalWarnings: number;
    criticalWarnings: number;
    hsnCodesMonitored: number;
    status: "healthy" | "warnings" | "critical";
  };
}

export function useDashboard(requiredRole: "customer" | "seller" | "bank" | "supplier") {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [balances, setBalances] = useState<BalanceData | null>(null);
  const [escrows, setEscrows] = useState<Record<string, unknown>[]>([]);
  const [transactions, setTransactions] = useState<TransactionEntry[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [taxWarnings, setTaxWarnings] = useState<TaxWarningData | null>(null);
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
      const [balRes, escRes, txRes, prodRes, taxRes] = await Promise.all([
        fetch("/api/balance"),
        fetch("/api/escrow/list"),
        fetch("/api/transactions"),
        fetch("/api/products"),
        fetch("/api/tax-warnings"),
      ]);
      const [balData, escData, txData, prodData, taxData] = await Promise.all([
        balRes.json(),
        escRes.json(),
        txRes.json(),
        prodRes.json(),
        taxRes.json(),
      ]);
      setBalances(balData);
      setEscrows(escData.escrows || []);
      setTransactions(txData.transactions || []);
      setProducts(prodData.products || []);
      setTaxWarnings(taxData);
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
    products,
    taxWarnings,
    isLoading,
    fetchData,
    handleLogout,
  };
}

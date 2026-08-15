"use client";

/**
 * @module SellerLogisticsPage
 * @description Seller logistics & analytics page — charts, product performance, cash flow.
 */

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { LogisticsView } from "@/components/dashboard/LogisticsView";
import { useDashboard } from "@/hooks/useDashboard";

export default function SellerLogisticsPage() {
  const { user, isLoading, handleLogout } = useDashboard("seller");

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="inline-block w-8 h-8 border-3 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin mb-4" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading Logistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      <Sidebar activeRole="seller" userName={user.name} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          viewTitle="Logistics & Analytics"
          viewDescription="Sales performance, profitability, and cash flow analysis"
          userName={user.name}
          userRole={user.role}
          userAddress={user.address}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">
            <LogisticsView />
          </div>
        </main>
      </div>
    </div>
  );
}

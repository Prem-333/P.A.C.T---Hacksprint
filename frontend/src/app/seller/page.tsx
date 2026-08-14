"use client";

/**
 * @module SellerPage
 * @description Seller dashboard page — manage orders, confirm deliveries, view revenue.
 */

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SellerView } from "@/components/dashboard/SellerView";
import { AnalyticsView } from "@/components/dashboard/AnalyticsView";
import { ReportsView } from "@/components/dashboard/ReportsView";
import { TransactionLog } from "@/components/shared/TransactionLog";
import { useDashboard } from "@/hooks/useDashboard";
import { useAnalytics } from "@/hooks/useAnalytics";
import type { ISO20022Message } from "@/types";

import { DashboardSkeleton } from "@/components/shared/DashboardSkeleton";

export default function SellerPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "reports">("overview");
  
  const { user, balances, escrows, transactions, taxWarnings, isLoading, fetchData, handleLogout } = useDashboard("seller");
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useAnalytics("week");

  if (isLoading || !user) {
    return <DashboardSkeleton />;
  }

  const myBalance = balances?.users?.find((u) => u.username === user.username);

  const logEntries = transactions.map((tx) => ({
    txHash: tx.txHash,
    type: tx.type,
    timestamp: tx.timestamp,
    iso20022: tx.iso20022 as ISO20022Message,
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar activeRole="seller" userName={user.name} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          viewTitle="Seller Dashboard"
          viewDescription="Manage orders, confirm deliveries, and track revenue"
          userName={user.name}
          userRole={user.role}
          userAddress={user.address}
          onLogout={handleLogout}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="animate-fade-in max-w-7xl mx-auto">
            {activeTab === "overview" && (
              <>
                <SellerView
                  balance={myBalance?.balance || "0"}
                  address={user.address}
                  escrows={escrows}
                  activeEscrows={balances?.activeEscrows || 0}
                  taxBps={balances?.taxBps || 200}
                  vendorFeeBps={balances?.vendorFeeBps || 100}
                  transactions={transactions}
                  taxWarnings={taxWarnings}
                  onRefresh={fetchData}
                />
                <div className="border-t border-slate-200 mt-8 pt-8">
                  <TransactionLog entries={logEntries} />
                </div>
              </>
            )}

            {activeTab === "analytics" && (
              <AnalyticsView 
                data={analyticsData!} 
                isLoading={isAnalyticsLoading} 
              />
            )}

            {activeTab === "reports" && (
              <ReportsView 
                data={analyticsData!} 
                isLoading={isAnalyticsLoading} 
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

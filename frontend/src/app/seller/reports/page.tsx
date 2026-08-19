"use client";

/**
 * @module SellerReportsPage
 * @description Seller reports page.
 */

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ReportsView } from "@/components/dashboard/ReportsView";
import { useDashboard } from "@/hooks/useDashboard";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function SellerReportsPage() {
  const { user, isLoading: isDashboardLoading, handleLogout } = useDashboard("seller");
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useAnalytics("week");

  if (isDashboardLoading || !user) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="inline-block w-8 h-8 border-3 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin mb-4" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading Reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      <Sidebar activeRole="seller" userName={user.name} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          viewTitle="Reports"
          viewDescription="Financial reports and generated statements"
          userName={user.name}
          userRole={user.role}
          userAddress={user.address}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in max-w-7xl mx-auto">
            <ReportsView 
              data={analyticsData!} 
              isLoading={isAnalyticsLoading} 
            />
          </div>
        </main>
      </div>
    </div>
  );
}

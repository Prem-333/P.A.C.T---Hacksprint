"use client";

/**
 * @module DashboardLayout
 * @description Shared layout shell for all role pages.
 * Provides the Sidebar, Header, and main content area.
 */

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useDashboard } from "@/hooks/useDashboard";

interface DashboardLayoutProps {
  role: "customer" | "seller" | "bank" | "supplier";
  title: string;
  description: string;
  children: (props: {
    user: NonNullable<ReturnType<typeof useDashboard>["user"]>;
    balances: ReturnType<typeof useDashboard>["balances"];
    escrows: ReturnType<typeof useDashboard>["escrows"];
    transactions: ReturnType<typeof useDashboard>["transactions"];
    products: ReturnType<typeof useDashboard>["products"];
    taxWarnings: ReturnType<typeof useDashboard>["taxWarnings"];
    fetchData: ReturnType<typeof useDashboard>["fetchData"];
  }) => React.ReactNode;
}

export function DashboardLayout({ role, title, description, children }: DashboardLayoutProps) {
  const { user, balances, escrows, transactions, products, taxWarnings, isLoading, fetchData, handleLogout } = useDashboard(role);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="inline-block w-8 h-8 border-3 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin mb-4" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      <Sidebar activeRole={role} userName={user.name} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          viewTitle={title}
          viewDescription={description}
          userName={user.name}
          userRole={user.role}
          userAddress={user.address}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">
            {children({ user, balances, escrows, transactions, products, taxWarnings, fetchData })}
          </div>
        </main>
      </div>
    </div>
  );
}

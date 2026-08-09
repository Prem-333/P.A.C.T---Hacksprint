"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TransactionsPageContent } from "@/components/pages/TransactionsPageContent";

export default function ClientTransactionsPage() {
  return (
    <DashboardLayout role="client" title="Transactions — Bharath" description="All on-chain transaction records">
      {({ transactions }) => <TransactionsPageContent transactions={transactions} />}
    </DashboardLayout>
  );
}

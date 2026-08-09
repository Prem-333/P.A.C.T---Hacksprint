"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EscrowsPageContent } from "@/components/pages/EscrowsPageContent";

export default function ClientEscrowsPage() {
  return (
    <DashboardLayout role="client" title="Escrows — Bharath" description="View and manage your escrow agreements">
      {({ user, escrows }) => (
        <EscrowsPageContent escrows={escrows} role="client" userAddress={user.address} />
      )}
    </DashboardLayout>
  );
}

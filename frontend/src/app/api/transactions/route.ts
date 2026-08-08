/**
 * @module api/transactions
 * @description Returns transaction history with ISO 20022 metadata.
 * GET /api/transactions
 */

import { NextResponse } from "next/server";
import { getTransactions } from "@/lib/server/transactions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const transactions = getTransactions();
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Transaction history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

/**
 * @module api/balance
 * @description Returns INR balances and purpose-bound status for all users.
 * GET /api/balance
 */
import { NextResponse } from "next/server";
import {
  getBalance,
  getPurposeBoundStatus,
  getTotalSupply,
  getActiveEscrowCount,
  USERS,
  SUPPLIERS,
} from "@/lib/server/wallet";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [totalSupply, activeEscrows] = await Promise.all([
      getTotalSupply(),
      getActiveEscrowCount(),
    ]);

    // Get balances for all users
    const userBalances = await Promise.all(
      Object.values(USERS).map(async (user) => {
        const [balance, isPurposeBound] = await Promise.all([
          getBalance(user.address),
          getPurposeBoundStatus(user.address),
        ]);
        return {
          username: user.username,
          name: user.name,
          role: user.role,
          address: user.address,
          balance,
          isPurposeBound,
        };
      })
    );

    // Get supplier balances
    const supplierBalances = await Promise.all(
      SUPPLIERS.map(async (sup) => {
        const balance = await getBalance(sup.address);
        return {
          id: sup.id,
          name: sup.name,
          type: sup.type,
          address: sup.address,
          balance,
          sharePercent: sup.sharePercent,
        };
      })
    );

    return NextResponse.json({
      totalSupply,
      activeEscrows,
      taxBps: 1800, // Default for UI backward compatibility if needed
      vendorFeeBps: 100,
      users: userBalances,
      suppliers: supplierBalances,
    });
  } catch (error) {
    console.error("Balance fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch balances" },
      { status: 500 }
    );
  }
}

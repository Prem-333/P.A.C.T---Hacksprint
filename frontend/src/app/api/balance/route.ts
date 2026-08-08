/**
 * @module api/balance
 * @description Returns PBR token balance and purpose-bound status for all users.
 * GET /api/balance
 */

import { NextResponse } from "next/server";
import {
  getBalance,
  getPurposeBoundStatus,
  getTotalSupply,
  getActiveEscrowCount,
  USERS,
} from "@/lib/server/wallet";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [totalSupply, activeEscrows] = await Promise.all([
      getTotalSupply(),
      getActiveEscrowCount(),
    ]);

    const balances = await Promise.all(
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

    return NextResponse.json({
      totalSupply,
      activeEscrows,
      users: balances,
    });
  } catch (error) {
    console.error("Balance fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch balances" },
      { status: 500 }
    );
  }
}

/**
 * @module api/escrow/list
 * @description Returns all escrows with full details. Accessible by all users.
 * GET /api/escrow/list
 */

import { NextResponse } from "next/server";
import { getAllEscrows, resolveAddressName } from "@/lib/server/wallet";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const escrows = await getAllEscrows();

    const enriched = escrows.map((escrow) => ({
      ...escrow,
      buyerName: resolveAddressName(escrow.buyer),
      sellerName: resolveAddressName(escrow.seller),
    }));

    return NextResponse.json({ escrows: enriched });
  } catch (error) {
    console.error("Escrow list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch escrows" },
      { status: 500 }
    );
  }
}

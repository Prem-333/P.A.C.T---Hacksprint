/**
 * @module api/escrow/refund
 * @description Refunds an expired escrow. Only callable by Bharath (Client/Buyer).
 * POST /api/escrow/refund
 */

import { NextRequest, NextResponse } from "next/server";
import { refundEscrow, USERS, getEscrow, parseContractError } from "@/lib/server/wallet";
import { mapToISO20022 } from "@/lib/iso20022";
import type { TransactionMetadata, TransactionReceipt } from "@/lib/iso20022";
import { addTransaction } from "@/lib/server/transactions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { escrowId } = body;

    if (escrowId === undefined) {
      return NextResponse.json(
        { error: "escrowId is required" },
        { status: 400 }
      );
    }

    // Get escrow details before refunding
    const escrowBefore = await getEscrow(parseInt(escrowId));

    const result = await refundEscrow(parseInt(escrowId));

    // Generate ISO 20022 metadata
    const metadata: TransactionMetadata = {
      type: "ESCROW_REFUND",
      from: USERS.prem.address, // Returning from Escrow/Seller conceptually
      to: USERS.bharath.address,
      amount: escrowBefore.amount,
      escrowId: parseInt(escrowId),
      remittanceInfo: `Refund issued — Escrow #${escrowId} expired — ${escrowBefore.amount} PBR returned to Bharath`,
    };
    
    const receipt: TransactionReceipt = {
      blockNumber: BigInt(result.blockNumber),
      blockHash: "0x0" as `0x${string}`,
      transactionIndex: 0,
      status: "success",
      gasUsed: BigInt(0),
    };
    const iso = mapToISO20022(result.txHash as `0x${string}`, receipt, metadata);

    addTransaction({
      txHash: result.txHash,
      type: "ESCROW_REFUND",
      from: "Escrow Contract",
      fromAddress: "0x0",
      to: USERS.bharath.name,
      toAddress: USERS.bharath.address,
      amount: escrowBefore.amount,
      blockNumber: result.blockNumber,
      timestamp: Date.now(),
      iso20022: iso,
    });

    return NextResponse.json({
      success: true,
      txHash: result.txHash,
      blockNumber: result.blockNumber,
      amount: escrowBefore.amount,
      message: `Refund successful! ${escrowBefore.amount} PBR returned to you.`,
    });
  } catch (error) {
    console.error("Refund error:", error);
    const message = parseContractError(error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

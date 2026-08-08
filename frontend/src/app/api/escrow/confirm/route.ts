/**
 * @module api/escrow/confirm
 * @description Confirms delivery and releases escrow funds. Only callable by Prem (Merchant).
 * POST /api/escrow/confirm
 */

import { NextRequest, NextResponse } from "next/server";
import { confirmDelivery, USERS, getEscrow } from "@/lib/server/wallet";
import { mapToISO20022 } from "@/lib/iso20022";
import type { TransactionMetadata, TransactionReceipt } from "@/lib/iso20022";
import { addTransaction } from "@/lib/server/transactions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { escrowId, deliveryProof } = body;

    if (escrowId === undefined || !deliveryProof) {
      return NextResponse.json(
        { error: "escrowId and deliveryProof are required" },
        { status: 400 }
      );
    }

    // Get escrow details before confirming
    const escrowBefore = await getEscrow(parseInt(escrowId));

    const result = await confirmDelivery({
      escrowId: parseInt(escrowId),
      deliveryProof,
    });

    // Generate ISO 20022 metadata
    const metadata: TransactionMetadata = {
      type: "ESCROW_CONFIRM",
      from: USERS.bharath.address,
      to: USERS.prem.address,
      amount: escrowBefore.amount,
      escrowId: parseInt(escrowId),
      deliveryRef: deliveryProof,
      remittanceInfo: `Delivery confirmed — Escrow #${escrowId} — ${escrowBefore.amount} PBR released to Prem`,
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
      type: "ESCROW_CONFIRM",
      from: USERS.prem.name,
      fromAddress: USERS.prem.address,
      to: USERS.prem.name,
      toAddress: USERS.prem.address,
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
      message: `Delivery confirmed! ${escrowBefore.amount} PBR released to Prem`,
    });
  } catch (error) {
    console.error("Delivery confirmation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to confirm delivery: ${message}` },
      { status: 500 }
    );
  }
}

/**
 * @module api/escrow/confirm
 * @description Confirms delivery and releases escrow funds.
 * POST /api/escrow/confirm
 */

import { NextRequest, NextResponse } from "next/server";
import { confirmDelivery, USERS, getEscrow, parseContractError, calculateFees } from "@/lib/server/wallet";
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
    
    // Calculate fees to include in the response
    const feeBreakdown = await calculateFees(escrowBefore.amountRaw);

    const result = await confirmDelivery({
      escrowId: parseInt(escrowId),
      deliveryProof,
    });

    // Generate ISO 20022 metadata
    const metadata: TransactionMetadata = {
      type: "ESCROW_CONFIRM",
      from: USERS.customer.address,
      to: USERS.seller.address,
      amount: escrowBefore.amount,
      escrowId: parseInt(escrowId),
      deliveryRef: deliveryProof,
      remittanceInfo: `Delivery confirmed — Escrow #${escrowId} — ₹${escrowBefore.amount} released to Seller`,
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
      from: USERS.seller.name,
      fromAddress: USERS.seller.address,
      to: USERS.seller.name,
      toAddress: USERS.seller.address,
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
      feeBreakdown,
      message: `Delivery confirmed! ₹${feeBreakdown.merchantAmount} released to Seller after fees.`,
    });
  } catch (error) {
    console.error("Delivery confirmation error:", error);
    const message = parseContractError(error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

/**
 * @module api/escrow/create
 * @description Creates a new DvP escrow for product purchase.
 * POST /api/escrow/create
 */

import { NextRequest, NextResponse } from "next/server";
import { createEscrow, USERS, parseContractError } from "@/lib/server/wallet";
import { mapToISO20022 } from "@/lib/iso20022";
import type { TransactionMetadata, TransactionReceipt } from "@/lib/iso20022";
import { addTransaction } from "@/lib/server/transactions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, lockDurationHours, deliveryProof } = body;

    if (!amount || !lockDurationHours || !deliveryProof) {
      return NextResponse.json(
        { error: "amount, lockDurationHours, and deliveryProof are required" },
        { status: 400 }
      );
    }

    // Seller is the perfume merchant
    const seller = USERS.seller;

    const result = await createEscrow({
      sellerAddress: seller.address,
      amount,
      lockDurationHours: parseFloat(lockDurationHours),
      deliveryProof,
    });

    // Generate ISO 20022 metadata
    const metadata: TransactionMetadata = {
      type: "ESCROW_CREATE",
      from: USERS.customer.address,
      to: seller.address,
      amount,
      remittanceInfo: `DvP Escrow — Customer → Seller — Perfume purchase (Lock: ${lockDurationHours}h)`,
    };
    const receipt: TransactionReceipt = {
      blockNumber: BigInt(result.blockNumber),
      blockHash: "0x0" as `0x${string}`,
      transactionIndex: 0,
      status: "success",
      gasUsed: BigInt(0),
    };
    const iso = mapToISO20022(result.txHash as `0x${string}`, receipt, metadata);

    // Store transaction for history
    addTransaction({
      txHash: result.txHash,
      type: "ESCROW_CREATE",
      from: USERS.customer.name,
      fromAddress: USERS.customer.address,
      to: seller.name,
      toAddress: seller.address,
      amount,
      blockNumber: result.blockNumber,
      timestamp: Date.now(),
      iso20022: iso,
    });

    return NextResponse.json({
      success: true,
      txHash: result.txHash,
      blockNumber: result.blockNumber,
      message: `Escrow created: ₹${amount} locked for delivery from Seller`,
    });
  } catch (error) {
    console.error("Escrow creation error:", error);
    const message = parseContractError(error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

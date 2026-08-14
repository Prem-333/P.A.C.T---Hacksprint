/**
 * @module api/settlement/monthly
 * @description Simulates a monthly batch settlement.
 * Fetches all pending escrows for the seller and confirms them.
 * POST /api/settlement/monthly
 */

import { NextResponse } from "next/server";
import { confirmDelivery, USERS, getAllEscrows, getEscrow, calculateFees, parseContractError } from "@/lib/server/wallet";
import { mapToISO20022 } from "@/lib/iso20022";
import type { TransactionMetadata, TransactionReceipt } from "@/lib/iso20022";
import { addTransaction } from "@/lib/server/transactions";

export async function POST() {
  try {
    const escrows = await getAllEscrows();
    
    // Filter pending escrows for the seller
    const pendingEscrows = escrows.filter(
      (e) => e.status === "PENDING" && e.seller.toLowerCase() === USERS.seller.address.toLowerCase()
    );

    if (pendingEscrows.length === 0) {
      return NextResponse.json({ message: "No pending funds to settle.", settledCount: 0 });
    }

    let totalSettled = 0n;
    const receipts = [];

    // Confirm all pending escrows
    for (const escrow of pendingEscrows) {
      // In our mock, deliveryProof is stored off-chain or we can just pass a dummy one for the batch settlement since it's a demo
      const deliveryProof = `MONTHLY-BATCH-${escrow.id}`;
      
      const escrowBefore = await getEscrow(Number(escrow.id));
      const feeBreakdown = await calculateFees(escrowBefore.amountRaw, escrowBefore.taxBps);

      const result = await confirmDelivery({
        escrowId: Number(escrow.id),
        deliveryProof,
      });

      totalSettled += BigInt(escrowBefore.amountRaw);

      // Generate ISO 20022 metadata
      const metadata: TransactionMetadata = {
        type: "ESCROW_CONFIRM",
        from: USERS.customer.address,
        to: USERS.seller.address,
        amount: escrowBefore.amount,
        escrowId: Number(escrow.id),
        deliveryRef: deliveryProof,
        remittanceInfo: `Monthly Settlement — Escrow #${escrow.id} — ₹${escrowBefore.amount} released`,
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

      receipts.push(result.txHash);
    }

    return NextResponse.json({
      success: true,
      settledCount: pendingEscrows.length,
      message: `Monthly settlement complete! ${pendingEscrows.length} transactions processed.`,
      receipts
    });
  } catch (error) {
    console.error("Monthly settlement error:", error);
    const message = parseContractError(error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

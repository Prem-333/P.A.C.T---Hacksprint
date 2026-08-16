/**
 * @module api/payment/cash
 * @description Handles cash payment recording.
 * When customer pays cash, seller's bank account is auto-debited
 * so digital distribution can proceed. Seller can deposit cash at bank later.
 * POST /api/payment/cash
 */

import { NextRequest, NextResponse } from "next/server";
import { recordCashPayment, USERS, createEscrow, confirmDelivery } from "@/lib/server/wallet";
import { getProductById, calculateGST, calculateDistribution } from "@/lib/server/products";
import { getTaxWarnings } from "@/lib/server/taxEngine";
import { addTransaction } from "@/lib/server/transactions";
import { recordSale } from "@/lib/server/analytics";
import { mapToISO20022 } from "@/lib/iso20022";
import { requireRole } from "@/lib/server/apiAuth";
import type { TransactionMetadata, TransactionReceipt } from "@/lib/iso20022";

export async function POST(request: NextRequest) {
  try {
    // Auth: only customers can make payments
    const session = await requireRole("customer");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    // Validate quantity
    const qty = Math.floor(Number(quantity));
    if (!Number.isFinite(qty) || qty < 1) {
      return NextResponse.json(
        { error: "Quantity must be a positive integer" },
        { status: 400 }
      );
    }

    const product = getProductById(productId);
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const totalAmount = product.price * qty;
    const gst = calculateGST(totalAmount, product.hsnCode);
    const distribution = calculateDistribution(totalAmount, product.hsnCode, product.rawMaterialBreakdown);

    // Check for tax warnings
    const warnings = getTaxWarnings().filter((w) => w.hsnCode === product.hsnCode);

    // Record cash payment — this auto-debits seller's bank
    const cashResult = await recordCashPayment(totalAmount);

    if (!cashResult.success) {
      return NextResponse.json(
        { error: "Cash payment recording failed" },
        { status: 500 }
      );
    }

    // ─────────────────────────────────────────────────────────────────
    // AUTOMATED DvP SETTLEMENT via Smart Contract
    // 1. Lock funds in Escrow (Bank auto-debited for digital distribution)
    // 2. Auto-confirm delivery → on-chain atomic distribution
    //    → Tax to Bank, Vendor Fee to Bank, Net to Seller
    // Note: cashDepositPending flag tracks physical cash not yet deposited
    // ─────────────────────────────────────────────────────────────────
    const taxBps = Math.round((gst.totalGST / totalAmount) * 10000);
    const deliveryProof = `AUTO-CASH-${cashResult.depositId}`;
    
    // Step 1: Lock funds in Escrow
    const createRes = await createEscrow({
      sellerAddress: USERS.seller.address,
      amount: totalAmount.toString(),
      lockDurationHours: 1,
      deliveryProof,
      taxBps,
    });

    // Step 2: Auto-confirm delivery (triggers on-chain distribution)
    const confirmRes = await confirmDelivery({
      escrowId: createRes.escrowId,
      deliveryProof,
    });

    // ─────────────────────────────────────────────────────────────────

    // Record in analytics
    recordSale({
      id: `sale-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      quantity: qty,
      totalAmount,
      basePrice: gst.basePrice,
      cgst: gst.cgstAmount,
      sgst: gst.sgstAmount,
      platformFee: distribution.platformFee,
      sellerMargin: distribution.sellerMargin,
      rawMaterialCost: distribution.rawMaterialTotal,
      supplierPayments: distribution.supplierPayments,
      paymentMethod: "cash",
      timestamp: Date.now(),
    });

    // Generate ISO 20022 metadata using the on-chain tx hash
    const metadata: TransactionMetadata = {
      type: "ESCROW_CREATE",
      from: USERS.customer.address,
      to: USERS.seller.address,
      amount: totalAmount.toString(),
      remittanceInfo: `Cash Payment — ${product.name} × ${qty} — Deposit ID: ${cashResult.depositId} — Escrow #${createRes.escrowId} auto-settled`,
    };
    const receipt: TransactionReceipt = {
      blockNumber: BigInt(confirmRes.blockNumber),
      blockHash: "0x0" as `0x${string}`,
      transactionIndex: 0,
      status: "success",
      gasUsed: BigInt(0),
    };
    const iso = mapToISO20022(confirmRes.txHash as `0x${string}`, receipt, metadata);

    // Store transaction with on-chain hash and cash deposit pending flag
    addTransaction({
      txHash: confirmRes.txHash,
      type: "CASH_PAYMENT",
      from: "Customer",
      fromAddress: USERS.customer.address,
      to: "Seller",
      toAddress: USERS.seller.address,
      amount: totalAmount.toString(),
      blockNumber: confirmRes.blockNumber,
      timestamp: Date.now(),
      iso20022: iso,
      metadata: {
        paymentMethod: "cash",
        productName: product.name,
        productId: product.id,
        gstBreakdown: {
          cgst: gst.cgstAmount,
          sgst: gst.sgstAmount,
          total: gst.totalGST,
        },
        cashDepositPending: true,
      },
    });

    return NextResponse.json({
      success: true,
      paymentMethod: "cash",
      transactionId: confirmRes.txHash,
      depositId: cashResult.depositId,
      bankDebitAmount: cashResult.bankDebitAmount,
      escrowId: createRes.escrowId,
      product: {
        name: product.name,
        quantity: qty,
        unitPrice: product.price,
      },
      amount: totalAmount,
      gstBreakdown: gst,
      distribution,
      taxWarnings: warnings,
      message: cashResult.message,
    });
  } catch (error) {
    console.error("Cash payment error:", error);
    return NextResponse.json(
      { error: "Cash payment processing failed" },
      { status: 500 }
    );
  }
}

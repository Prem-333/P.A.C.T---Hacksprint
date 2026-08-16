/**
 * @module api/payment/gpay
 * @description Simulates GPay (UPI) payment and triggers fund distribution.
 * POST /api/payment/gpay
 */

import { NextRequest, NextResponse } from "next/server";
import { simulateGPayPayment, USERS, createEscrow, confirmDelivery } from "@/lib/server/wallet";
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

    // Simulate GPay payment
    const gpayResult = await simulateGPayPayment(totalAmount);

    if (!gpayResult.success) {
      return NextResponse.json(
        { error: "GPay payment failed" },
        { status: 500 }
      );
    }

    // ─────────────────────────────────────────────────────────────────
    // AUTOMATED DvP SETTLEMENT via Smart Contract
    // 1. Lock funds in Escrow (Customer → Contract)
    // 2. Auto-confirm delivery (Seller + Oracle co-sign)
    //    This triggers atomic on-chain distribution:
    //    → Tax to Bank, Vendor Fee to Bank, Net to Seller
    // ─────────────────────────────────────────────────────────────────
    const taxBps = Math.round((gst.totalGST / totalAmount) * 10000);
    const deliveryProof = `AUTO-GPAY-${gpayResult.upiRefNumber}`;
    
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
      paymentMethod: "gpay",
      timestamp: Date.now(),
    });

    // Generate ISO 20022 metadata using the actual on-chain tx hash
    const metadata: TransactionMetadata = {
      type: "ESCROW_CREATE",
      from: USERS.customer.address,
      to: USERS.seller.address,
      amount: totalAmount.toString(),
      remittanceInfo: `GPay Payment — ${product.name} × ${qty} — UPI Ref: ${gpayResult.upiRefNumber} — Escrow #${createRes.escrowId} auto-settled`,
    };
    const receipt: TransactionReceipt = {
      blockNumber: BigInt(confirmRes.blockNumber),
      blockHash: "0x0" as `0x${string}`,
      transactionIndex: 0,
      status: "success",
      gasUsed: BigInt(0),
    };
    const iso = mapToISO20022(confirmRes.txHash as `0x${string}`, receipt, metadata);

    // Store transaction with the on-chain confirmation hash
    addTransaction({
      txHash: confirmRes.txHash,
      type: "GPAY_PAYMENT",
      from: "Customer",
      fromAddress: USERS.customer.address,
      to: "Seller",
      toAddress: USERS.seller.address,
      amount: totalAmount.toString(),
      blockNumber: confirmRes.blockNumber,
      timestamp: Date.now(),
      iso20022: iso,
      metadata: {
        paymentMethod: "gpay",
        productName: product.name,
        productId: product.id,
        gstBreakdown: {
          cgst: gst.cgstAmount,
          sgst: gst.sgstAmount,
          total: gst.totalGST,
        },
        upiRefNumber: gpayResult.upiRefNumber,
      },
    });

    return NextResponse.json({
      success: true,
      paymentMethod: "gpay",
      transactionId: confirmRes.txHash,
      upiRefNumber: gpayResult.upiRefNumber,
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
      message: `Payment of ₹${totalAmount.toLocaleString()} via GPay successful! Funds distributed on-chain.`,
    });
  } catch (error) {
    console.error("GPay payment error:", error);
    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 500 }
    );
  }
}

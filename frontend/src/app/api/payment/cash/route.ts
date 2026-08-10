/**
 * @module api/payment/cash
 * @description Handles cash payment recording.
 * When customer pays cash, seller's bank account is auto-debited
 * so digital distribution can proceed. Seller can deposit cash at bank later.
 * POST /api/payment/cash
 */

import { NextRequest, NextResponse } from "next/server";
import { recordCashPayment, USERS } from "@/lib/server/wallet";
import { getProductById, calculateGST, calculateDistribution } from "@/lib/server/products";
import { getTaxWarnings } from "@/lib/server/taxEngine";
import { addTransaction } from "@/lib/server/transactions";
import { recordSale } from "@/lib/server/analytics";
import { mapToISO20022 } from "@/lib/iso20022";
import type { TransactionMetadata, TransactionReceipt } from "@/lib/iso20022";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
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

    const totalAmount = product.price * quantity;
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

    // Record in analytics
    recordSale({
      id: `sale-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      quantity,
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

    const txId = `CASH-${Date.now()}`;

    // Generate ISO 20022 metadata
    const metadata: TransactionMetadata = {
      type: "ESCROW_CREATE",
      from: USERS.customer.address,
      to: USERS.seller.address,
      amount: totalAmount.toString(),
      remittanceInfo: `Cash Payment — ${product.name} × ${quantity} — Deposit ID: ${cashResult.depositId}`,
    };
    const receipt: TransactionReceipt = {
      blockNumber: BigInt(0),
      blockHash: "0x0" as `0x${string}`,
      transactionIndex: 0,
      status: "success",
      gasUsed: BigInt(0),
    };
    const iso = mapToISO20022(txId as `0x${string}`, receipt, metadata);

    // Store transaction
    addTransaction({
      txHash: txId,
      type: "CASH_PAYMENT",
      from: "Customer",
      fromAddress: USERS.customer.address,
      to: "Seller",
      toAddress: USERS.seller.address,
      amount: totalAmount.toString(),
      blockNumber: 0,
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
      depositId: cashResult.depositId,
      bankDebitAmount: cashResult.bankDebitAmount,
      product: {
        name: product.name,
        quantity,
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

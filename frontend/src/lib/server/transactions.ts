/**
 * @module server/transactions
 * @description In-memory transaction store for the demo.
 * Stores transaction records with ISO 20022 metadata across all API calls.
 * Extended to support GPay, cash payments, GST distributions, and supplier payments.
 *
 * In production, this would be backed by a database.
 */

import type { ISO20022Message } from "@/types";

export interface StoredTransaction {
  txHash: string;
  type: string;
  from: string;
  fromAddress: string;
  to: string;
  toAddress: string;
  amount: string;
  blockNumber: number;
  timestamp: number;
  iso20022: ISO20022Message;
  /** Additional metadata for enhanced transaction types */
  metadata?: {
    paymentMethod?: "gpay" | "cash";
    productName?: string;
    productId?: string;
    gstBreakdown?: {
      cgst: number;
      sgst: number;
      total: number;
    };
    upiRefNumber?: string;
    cashDepositPending?: boolean;
    supplierName?: string;
    orderId?: string;
  };
}

/** In-memory transaction store. */
const transactions: StoredTransaction[] = [];

/** Adds a transaction record. */
export function addTransaction(tx: StoredTransaction): void {
  transactions.unshift(tx); // Newest first
  // Keep only last 200 transactions
  if (transactions.length > 200) {
    transactions.pop();
  }
}

/** Returns all stored transactions (newest first). */
export function getTransactions(): StoredTransaction[] {
  return [...transactions];
}

/** Returns transactions filtered by type. */
export function getTransactionsByType(type: string): StoredTransaction[] {
  return transactions.filter((tx) => tx.type === type);
}

/** Returns transactions for a specific address. */
export function getTransactionsForAddress(address: string): StoredTransaction[] {
  const lower = address.toLowerCase();
  return transactions.filter(
    (tx) =>
      tx.fromAddress.toLowerCase() === lower ||
      tx.toAddress.toLowerCase() === lower
  );
}

/** Returns cash payments that are pending deposit. */
export function getPendingCashDeposits(): StoredTransaction[] {
  return transactions.filter(
    (tx) => tx.metadata?.paymentMethod === "cash" && tx.metadata?.cashDepositPending
  );
}

/** Marks a cash payment as deposited. */
export function markCashDeposited(txHash: string): boolean {
  const tx = transactions.find((t) => t.txHash === txHash);
  if (tx && tx.metadata) {
    tx.metadata.cashDepositPending = false;
    return true;
  }
  return false;
}

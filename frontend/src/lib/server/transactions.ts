/**
 * @module server/transactions
 * @description In-memory transaction store for the demo.
 * Stores transaction records with ISO 20022 metadata across all API calls.
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
}

/** In-memory transaction store. */
const transactions: StoredTransaction[] = [];

/** Adds a transaction record. */
export function addTransaction(tx: StoredTransaction): void {
  transactions.unshift(tx); // Newest first
  // Keep only last 100 transactions
  if (transactions.length > 100) {
    transactions.pop();
  }
}

/** Returns all stored transactions (newest first). */
export function getTransactions(): StoredTransaction[] {
  return [...transactions];
}

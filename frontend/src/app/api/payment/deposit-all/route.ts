import { NextResponse } from "next/server";
import { getPendingDeposits, markCashDeposited as markCashDepositedWallet } from "@/lib/server/wallet";
import { getPendingCashDeposits, markCashDeposited as markCashDepositedTx } from "@/lib/server/transactions";

export async function POST() {
  try {
    const walletPending = getPendingDeposits();
    for (const dep of walletPending) {
      markCashDepositedWallet(dep.id);
    }

    const txPending = getPendingCashDeposits();
    for (const tx of txPending) {
      markCashDepositedTx(tx.txHash);
    }

    return NextResponse.json({ success: true, message: "All cash deposited successfully" });
  } catch (error) {
    console.error("Deposit all error:", error);
    return NextResponse.json({ error: "Failed to deposit cash" }, { status: 500 });
  }
}

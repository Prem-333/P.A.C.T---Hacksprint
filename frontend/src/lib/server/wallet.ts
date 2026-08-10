/**
 * @module server/wallet
 * @description Server-side Viem wallet clients and user management.
 * Maps generic roles (Customer, Seller, Bank, Suppliers) to Hardhat test accounts.
 * Includes GPay (UPI) payment simulation and cash payment handling.
 *
 * ⚠️ DEMO ONLY — Private keys are hardcoded Hardhat test keys.
 * Never use this pattern in production.
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  formatEther,
  parseEther,
  keccak256,
  encodePacked,
  decodeErrorResult,
} from "viem";
import { hardhat } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { PBR_ABI, PBR_CONTRACT_ADDRESS } from "@/lib/contracts";

// ──────────────────────────────────────────────
//  Chain & Transport Configuration
// ──────────────────────────────────────────────

const RPC_URL = "http://127.0.0.1:8545";

/** Public client for read-only contract calls. */
export const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(RPC_URL),
});

// ──────────────────────────────────────────────
//  User Account Definitions (Hardhat Test Keys)
// ──────────────────────────────────────────────

/**
 * Hardhat's well-known test private keys.
 * Mapped to the 4 platform roles + logistics oracle.
 */
const ACCOUNTS = {
  /** Account #0 — Bank (Central Authority / Admin). */
  bank: privateKeyToAccount(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  ),
  /** Account #1 — Seller (Perfume Merchant). */
  seller: privateKeyToAccount(
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
  ),
  /** Account #2 — Customer (Buyer). */
  customer: privateKeyToAccount(
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
  ),
  /** Account #3 — Fragrance Oil Supplier. */
  supplier1: privateKeyToAccount(
    "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"
  ),
  /** Account #4 — Bottle Supplier. */
  supplier2: privateKeyToAccount(
    "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"
  ),
  /** Account #5 — Packaging Supplier. */
  supplier3: privateKeyToAccount(
    "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba"
  ),
  /** Account #6 — Logistics Oracle (simulated e-Way Bill API signer). */
  oracle: privateKeyToAccount(
    "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e"
  ),
} as const;

// ──────────────────────────────────────────────
//  User Credentials & Role Mapping
// ──────────────────────────────────────────────

export type UserRole = "customer" | "seller" | "bank" | "supplier";

export interface UserProfile {
  username: string;
  password: string;
  name: string;
  role: UserRole;
  address: `0x${string}`;
  description: string;
}

/** Credentials for the demo users. */
export const USERS: Record<string, UserProfile> = {
  customer: {
    username: "customer",
    password: "customer123",
    name: "Customer",
    role: "customer",
    address: ACCOUNTS.customer.address,
    description: "Perfume Buyer — Browse and purchase fragrances",
  },
  seller: {
    username: "seller",
    password: "seller123",
    name: "Seller",
    role: "seller",
    address: ACCOUNTS.seller.address,
    description: "Perfume Seller — Manage orders and revenue",
  },
  bank: {
    username: "bank",
    password: "bank123",
    name: "Bank",
    role: "bank",
    address: ACCOUNTS.bank.address,
    description: "Bank — Settlement ledger and GST reporting",
  },
  supplier: {
    username: "supplier",
    password: "supplier123",
    name: "Raw Material Supplier",
    role: "supplier",
    address: ACCOUNTS.supplier1.address,
    description: "Raw Material Supplier — Track payments and supply orders",
  },
};

/** Supplier details for the 3 raw material suppliers. */
export const SUPPLIERS = [
  {
    id: "sup-1",
    name: "Fragrance Oil Supplier",
    type: "fragrance_oil" as const,
    address: ACCOUNTS.supplier1.address,
    sharePercent: 50,
  },
  {
    id: "sup-2",
    name: "Bottle Supplier",
    type: "bottles" as const,
    address: ACCOUNTS.supplier2.address,
    sharePercent: 30,
  },
  {
    id: "sup-3",
    name: "Packaging Supplier",
    type: "packaging" as const,
    address: ACCOUNTS.supplier3.address,
    sharePercent: 20,
  },
];

// ──────────────────────────────────────────────
//  Wallet Clients (per-user transaction signing)
// ──────────────────────────────────────────────

/** Creates a wallet client for the given role. */
function getWalletClient(accountKey: keyof typeof ACCOUNTS) {
  const account = ACCOUNTS[accountKey];
  return createWalletClient({
    account,
    chain: hardhat,
    transport: http(RPC_URL),
  });
}

// ──────────────────────────────────────────────
//  GPay (UPI) Payment Simulation
// ──────────────────────────────────────────────

let gpayTxCounter = 1000;

/**
 * Simulates a GPay (UPI) payment.
 * In production, this would integrate with a UPI PSP SDK
 * (e.g., Razorpay, PayTM, PhonePe).
 */
export async function simulateGPayPayment(amount: number, customerUpiId: string = "customer@upi"): Promise<{
  success: boolean;
  transactionId: string;
  upiRefNumber: string;
  amount: number;
  timestamp: number;
}> {
  // Simulate 1-2 second processing delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  gpayTxCounter++;
  const txId = `GPAY${Date.now()}${gpayTxCounter}`;
  const upiRef = `${gpayTxCounter}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  console.log(`[GPay Simulation] ₹${amount} from ${customerUpiId}`);
  console.log(`[GPay Simulation] UPI Ref: ${upiRef}, TX: ${txId}`);

  return {
    success: true,
    transactionId: txId,
    upiRefNumber: upiRef,
    amount,
    timestamp: Date.now(),
  };
}

// ──────────────────────────────────────────────
//  Cash Payment Handling
// ──────────────────────────────────────────────

/** In-memory cash deposit tracker */
const cashDeposits: {
  id: string;
  amount: number;
  timestamp: number;
  deposited: boolean;
  depositedAt?: number;
}[] = [];

/**
 * Records a cash payment. Auto-debits the seller's bank balance
 * (so the digital distribution can still proceed), and creates
 * a pending deposit record for the seller to deposit cash later.
 */
export async function recordCashPayment(amount: number): Promise<{
  success: boolean;
  depositId: string;
  bankDebitAmount: number;
  message: string;
}> {
  const depositId = `CASH-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  cashDeposits.push({
    id: depositId,
    amount,
    timestamp: Date.now(),
    deposited: false,
  });

  console.log(`[Cash Payment] ₹${amount} received in cash`);
  console.log(`[Cash Payment] Seller bank debited ₹${amount} for digital distribution`);
  console.log(`[Cash Payment] Deposit ID: ${depositId} — awaiting bank deposit`);

  return {
    success: true,
    depositId,
    bankDebitAmount: amount,
    message: `Cash payment recorded. ₹${amount} debited from seller's bank for digital distribution. Please deposit cash at the bank.`,
  };
}

/** Gets all cash deposit records. */
export function getCashDeposits() {
  return [...cashDeposits];
}

/** Gets pending cash deposits. */
export function getPendingDeposits() {
  return cashDeposits.filter((d) => !d.deposited);
}

/** Marks a cash deposit as completed. */
export function markCashDeposited(depositId: string): boolean {
  const deposit = cashDeposits.find((d) => d.id === depositId);
  if (deposit) {
    deposit.deposited = true;
    deposit.depositedAt = Date.now();
    return true;
  }
  return false;
}

// ──────────────────────────────────────────────
//  Contract Read Operations
// ──────────────────────────────────────────────

/** Gets token balance for an address (displayed as INR ₹). */
export async function getBalance(address: `0x${string}`): Promise<string> {
  const balance = await publicClient.readContract({
    address: PBR_CONTRACT_ADDRESS,
    abi: PBR_ABI,
    functionName: "balanceOf",
    args: [address],
  });
  return formatEther(balance as bigint);
}

/** Gets purpose-bound status for an address. */
export async function getPurposeBoundStatus(
  address: `0x${string}`
): Promise<boolean> {
  const status = await publicClient.readContract({
    address: PBR_CONTRACT_ADDRESS,
    abi: PBR_ABI,
    functionName: "purposeBound",
    args: [address],
  });
  return status as boolean;
}

/** Gets the total supply of tokens. */
export async function getTotalSupply(): Promise<string> {
  const supply = await publicClient.readContract({
    address: PBR_CONTRACT_ADDRESS,
    abi: PBR_ABI,
    functionName: "totalSupply",
  });
  return formatEther(supply as bigint);
}

/** Gets active escrow count. */
export async function getActiveEscrowCount(): Promise<number> {
  const count = await publicClient.readContract({
    address: PBR_CONTRACT_ADDRESS,
    abi: PBR_ABI,
    functionName: "activeEscrowCount",
  });
  return Number(count);
}

/** Gets next escrow ID. */
export async function getNextEscrowId(): Promise<number> {
  const id = await publicClient.readContract({
    address: PBR_CONTRACT_ADDRESS,
    abi: PBR_ABI,
    functionName: "nextEscrowId",
  });
  return Number(id);
}

/** Gets escrow details by ID. */
export async function getEscrow(escrowId: number) {
  const data = await publicClient.readContract({
    address: PBR_CONTRACT_ADDRESS,
    abi: PBR_ABI,
    functionName: "getEscrow",
    args: [BigInt(escrowId)],
  });
  const [buyer, seller, amount, deadline, deliveryProofHash, isCompleted, isRefunded] =
    data as [string, string, bigint, bigint, string, boolean, boolean];

  return {
    id: escrowId,
    buyer: buyer as `0x${string}`,
    seller: seller as `0x${string}`,
    amount: formatEther(amount),
    amountRaw: amount.toString(),
    deadline: Number(deadline),
    deadlineFormatted: new Date(Number(deadline) * 1000).toLocaleString(),
    deliveryProofHash,
    isCompleted,
    isRefunded,
    status: isCompleted ? "COMPLETED" : isRefunded ? "REFUNDED" : "PENDING",
  };
}

/** Gets all escrows. */
export async function getAllEscrows() {
  const total = await getNextEscrowId();
  const escrows = [];
  for (let i = 0; i < total; i++) {
    const escrow = await getEscrow(i);
    if (escrow.buyer !== "0x0000000000000000000000000000000000000000") {
      escrows.push(escrow);
    }
  }
  return escrows;
}

/** Gets fee configuration (tax and vendor fee BPS). */
export async function getFeeConfig() {
  const [taxBps, vendorFeeBps] = await Promise.all([
    publicClient.readContract({
      address: PBR_CONTRACT_ADDRESS,
      abi: PBR_ABI,
      functionName: "taxBps",
    }),
    publicClient.readContract({
      address: PBR_CONTRACT_ADDRESS,
      abi: PBR_ABI,
      functionName: "vendorFeeBps",
    }),
  ]);
  return {
    taxBps: Number(taxBps),
    vendorFeeBps: Number(vendorFeeBps),
  };
}

/** Calculates fee distribution for a given amount. */
export async function calculateFees(amountRaw: string) {
  const [tax, vendor, merchant] = await publicClient.readContract({
    address: PBR_CONTRACT_ADDRESS,
    abi: PBR_ABI,
    functionName: "calculateFees",
    args: [BigInt(amountRaw)],
  }) as [bigint, bigint, bigint];
  return {
    taxAmount: formatEther(tax),
    vendorFeeAmount: formatEther(vendor),
    merchantAmount: formatEther(merchant),
  };
}

// ──────────────────────────────────────────────
//  Contract Write Operations
// ──────────────────────────────────────────────

/** Creates a DvP escrow (called by Customer). */
export async function createEscrow(params: {
  sellerAddress: `0x${string}`;
  amount: string;
  lockDurationHours: number;
  deliveryProof: string;
}) {
  const walletClient = getWalletClient("customer");
  const proofHash = keccak256(
    encodePacked(["string"], [params.deliveryProof])
  );
  const lockSeconds = BigInt(Math.floor(params.lockDurationHours * 3600));

  const hash = await walletClient.writeContract({
    address: PBR_CONTRACT_ADDRESS,
    abi: PBR_ABI,
    functionName: "createEscrow",
    args: [
      params.sellerAddress,
      parseEther(params.amount),
      lockSeconds,
      proofHash,
    ],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return {
    txHash: hash,
    blockNumber: Number(receipt.blockNumber),
    status: receipt.status,
  };
}

/**
 * Confirms delivery via 2-of-3 multi-sig consensus.
 * The seller submits their vote, and the logistics oracle
 * automatically co-signs (simulating an e-Way Bill API webhook).
 */
export async function confirmDelivery(params: {
  escrowId: number;
  deliveryProof: string;
}) {
  // Step 1: Seller submits their vote
  const sellerClient = getWalletClient("seller");
  const hash1 = await sellerClient.writeContract({
    address: PBR_CONTRACT_ADDRESS,
    abi: PBR_ABI,
    functionName: "confirmDelivery",
    args: [BigInt(params.escrowId), params.deliveryProof],
  });
  await publicClient.waitForTransactionReceipt({ hash: hash1 });

  // Step 2: Logistics Oracle automatically co-signs
  const oracleClient = getWalletClient("oracle");
  const hash2 = await oracleClient.writeContract({
    address: PBR_CONTRACT_ADDRESS,
    abi: PBR_ABI,
    functionName: "confirmDelivery",
    args: [BigInt(params.escrowId), params.deliveryProof],
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash: hash2 });

  return {
    txHash: hash2,
    blockNumber: Number(receipt.blockNumber),
    status: receipt.status,
  };
}

/** Refunds an expired escrow (called by Customer). */
export async function refundEscrow(escrowId: number) {
  const walletClient = getWalletClient("customer");

  const hash = await walletClient.writeContract({
    address: PBR_CONTRACT_ADDRESS,
    abi: PBR_ABI,
    functionName: "refundEscrow",
    args: [BigInt(escrowId)],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return {
    txHash: hash,
    blockNumber: Number(receipt.blockNumber),
    status: receipt.status,
  };
}

// ──────────────────────────────────────────────
//  Utility
// ──────────────────────────────────────────────

/** Resolves a display name for a known address. */
export function resolveAddressName(address: string): string {
  const lower = address.toLowerCase();
  for (const user of Object.values(USERS)) {
    if (user.address.toLowerCase() === lower) return user.name;
  }
  for (const sup of SUPPLIERS) {
    if (sup.address.toLowerCase() === lower) return sup.name;
  }
  if (lower === PBR_CONTRACT_ADDRESS.toLowerCase()) return "Escrow Contract";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/** Parses Viem contract errors into user-friendly messages. */
export function parseContractError(error: any): string {
  if (error.name === "ContractFunctionExecutionError") {
    try {
      // Decode the custom error signature using our ABI
      const decoded = decodeErrorResult({
        abi: PBR_ABI,
        data: error.cause?.data || error.data,
      });

      switch (decoded.errorName as string) {
        case "PurposeBoundTransferViolation":
          return "Purpose-bound restriction: You can only send funds to authorized merchants or the escrow contract.";
        case "SellerNotAuthorizedMerchant":
          return "The recipient is not an authorized seller.";
        case "EscrowAmountZero":
          return "Amount must be greater than zero.";
        case "LockDurationZero":
          return "Lock duration must be greater than zero.";
        case "EscrowNotFound":
          return `Escrow #${(decoded as any).args?.[0]} does not exist.`;
        case "EscrowAlreadyCompleted":
          return "This escrow has already been completed.";
        case "EscrowAlreadyRefunded":
          return "This escrow has already been refunded.";
        case "NotEscrowBuyer":
          return "Only the customer can perform this action.";
        case "NotEscrowSeller":
          return "Only the seller can confirm delivery.";
        case "InvalidDeliveryProof":
          return "Delivery proof does not match the expected phrase.";
        case "EscrowNotExpired":
          const deadline = Number((decoded as any).args?.[1]);
          const date = new Date(deadline * 1000).toLocaleString();
          return `Escrow has not expired yet. Deadline is ${date}.`;
        case "CannotEscrowToSelf":
          return "You cannot create an escrow with yourself.";
        // Standard ERC20 errors
        case "ERC20InsufficientBalance":
          return `Insufficient balance (Tried to send ₹${formatEther((decoded as any).args?.[2] as bigint)} but you only have ₹${formatEther((decoded as any).args?.[1] as bigint)}).`;
        case "ERC20InvalidReceiver":
          return "Invalid recipient address.";
        default:
          return `Contract error: ${decoded.errorName}`;
      }
    } catch (e) {
      console.warn("Failed to decode contract error:", e);
    }
  }

  // Fallback
  return error.shortMessage || error.message || "An unknown blockchain error occurred";
}

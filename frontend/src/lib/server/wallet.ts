/**
 * @module server/wallet
 * @description Server-side Viem wallet clients for the named users and the logistics oracle.
 * Each user maps to a Hardhat test account with a known private key.
 * The server signs all transactions on behalf of users — no MetaMask needed.
 *
 * ⚠️ DEMO ONLY — Private keys are hardcoded Hardhat test keys.
 * Never use this pattern in production. In production, this layer would be
 * replaced by ERC-4337 Account Abstraction with a Paymaster/Bundler.
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
 * These are publicly documented and hold no real value.
 * @see https://hardhat.org/hardhat-network/docs/reference#accounts
 */
const ACCOUNTS = {
  /** Account #0 — Central Authority (admin). Used for deployment only. */
  admin: privateKeyToAccount(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  ),
  /** Account #1 — Prem (Merchant). Receives purpose-bound payments. */
  merchant: privateKeyToAccount(
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
  ),
  /** Account #2 — Bharath (Client/Buyer). Sends purpose-bound payments. */
  client: privateKeyToAccount(
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
  ),
  /** Account #3 — Kanish (Vendor). Observer/auditor of the supply chain. */
  vendor: privateKeyToAccount(
    "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"
  ),
  /** Account #4 — Logistics Oracle (simulated e-Way Bill API signer). */
  oracle: privateKeyToAccount(
    "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"
  ),
} as const;

// ──────────────────────────────────────────────
//  User Credentials & Role Mapping
// ──────────────────────────────────────────────

export type UserRole = "client" | "merchant" | "vendor";

export interface UserProfile {
  username: string;
  password: string;
  name: string;
  role: UserRole;
  address: `0x${string}`;
  description: string;
}

/** Hardcoded credentials for the three demo users. */
export const USERS: Record<string, UserProfile> = {
  bharath: {
    username: "bharath",
    password: "bharath123",
    name: "Bharath",
    role: "client",
    address: ACCOUNTS.client.address,
    description: "MSME Client — Raw Material Buyer",
  },
  prem: {
    username: "prem",
    password: "prem123",
    name: "Prem",
    role: "merchant",
    address: ACCOUNTS.merchant.address,
    description: "Authorized Merchant — Sago Supplier",
  },
  kanish: {
    username: "kanish",
    password: "kanish123",
    name: "Kanish",
    role: "vendor",
    address: ACCOUNTS.vendor.address,
    description: "Vendor — Supply Chain Observer",
  },
};

// ──────────────────────────────────────────────
//  Wallet Clients (per-user transaction signing)
// ──────────────────────────────────────────────

/** Creates a wallet client for the given role. */
function getWalletClient(role: UserRole) {
  const account = ACCOUNTS[role === "client" ? "client" : role];
  return createWalletClient({
    account,
    chain: hardhat,
    transport: http(RPC_URL),
  });
}

// ──────────────────────────────────────────────
//  Contract Read Operations
// ──────────────────────────────────────────────

/** Gets PBR token balance for an address. */
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

/** Gets the total supply of PBR tokens. */
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

/** Creates a DvP escrow (called by Bharath/Client). */
export async function createEscrow(params: {
  sellerAddress: `0x${string}`;
  amount: string;
  lockDurationHours: number;
  deliveryProof: string;
}) {
  const walletClient = getWalletClient("client");
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
 * The merchant submits their vote, and the logistics oracle
 * automatically co-signs (simulating an e-Way Bill API webhook).
 * This ensures trustless settlement: no single party can unilaterally release funds.
 */
export async function confirmDelivery(params: {
  escrowId: number;
  deliveryProof: string;
}) {
  // Step 1: Merchant submits their vote
  const merchantClient = getWalletClient("merchant");
  const hash1 = await merchantClient.writeContract({
    address: PBR_CONTRACT_ADDRESS,
    abi: PBR_ABI,
    functionName: "confirmDelivery",
    args: [BigInt(params.escrowId), params.deliveryProof],
  });
  await publicClient.waitForTransactionReceipt({ hash: hash1 });

  // Step 2: Logistics Oracle automatically co-signs (simulated e-Way Bill webhook)
  const oracleClient = createWalletClient({
    account: ACCOUNTS.oracle,
    chain: hardhat,
    transport: http(RPC_URL),
  });
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

/** Refunds an expired escrow (called by Bharath/Client). */
export async function refundEscrow(escrowId: number) {
  const walletClient = getWalletClient("client");

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
          return "The recipient is not an authorized merchant.";
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
          return "Only the buyer can perform this action.";
        case "NotEscrowSeller":
          return "Only the merchant can confirm delivery.";
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
          return `Insufficient balance (Tried to send ${formatEther((decoded as any).args?.[2] as bigint)} PBR but you only have ${formatEther((decoded as any).args?.[1] as bigint)} PBR).`;
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

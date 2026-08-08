/**
 * @module server/wallet
 * @description Server-side Viem wallet clients for the three named users.
 * Each user maps to a Hardhat test account with a known private key.
 * The server signs all transactions on behalf of users — no MetaMask needed.
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

/** Confirms delivery and releases escrow funds (called by Prem/Merchant). */
export async function confirmDelivery(params: {
  escrowId: number;
  deliveryProof: string;
}) {
  const walletClient = getWalletClient("merchant");

  const hash = await walletClient.writeContract({
    address: PBR_CONTRACT_ADDRESS,
    abi: PBR_ABI,
    functionName: "confirmDelivery",
    args: [BigInt(params.escrowId), params.deliveryProof],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return {
    txHash: hash,
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

/**
 * @module contracts
 * @description Contract ABI, address constants, and typed helper functions
 * for interacting with the PurposeBoundRupee smart contract.
 *
 * The ABI is exported as a const assertion for maximum Viem type safety.
 * Helper functions use Viem's explicit Action API (readContract/writeContract).
 */

import type { Address } from "@/types";

// ──────────────────────────────────────────────
//  Contract Address
// ──────────────────────────────────────────────

/**
 * Deployed contract address on the local Hardhat network.
 * UPDATE THIS after running `npx hardhat run scripts/deploy.ts --network localhost`.
 */
export const PBR_CONTRACT_ADDRESS: Address =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3" as Address;

// ──────────────────────────────────────────────
//  Role Constants (pre-computed keccak256 hashes)
// ──────────────────────────────────────────────

/** keccak256("CENTRAL_AUTHORITY") */
export const CENTRAL_AUTHORITY_ROLE =
  "0x1e4c11efbd6a865e7fbaa1a0dbc4bf15f9a48a8a5e3e6e4824dddee291225ae2" as `0x${string}`;

/** keccak256("AUTHORIZED_MERCHANT") */
export const AUTHORIZED_MERCHANT_ROLE =
  "0xf474b9b59c0e30e9edb0e86e4fc0275b0e8a08581b6d7d0e775b6f3a77c4d715" as `0x${string}`;

/** DEFAULT_ADMIN_ROLE = bytes32(0) */
export const DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;

// ──────────────────────────────────────────────
//  Contract ABI (const assertion for Viem type inference)
// ──────────────────────────────────────────────

export const PBR_ABI = [
  // ── Read Functions ──────────────────────────
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "purposeBound",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "nextEscrowId",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "activeEscrowCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getEscrow",
    inputs: [{ name: "escrowId", type: "uint256" }],
    outputs: [
      { name: "buyer", type: "address" },
      { name: "seller", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "deliveryProofHash", type: "bytes32" },
      { name: "isCompleted", type: "bool" },
      { name: "isRefunded", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasRole",
    inputs: [
      { name: "role", type: "bytes32" },
      { name: "account", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "CENTRAL_AUTHORITY",
    inputs: [],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "AUTHORIZED_MERCHANT",
    inputs: [],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "DEFAULT_ADMIN_ROLE",
    inputs: [],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "calculateFees",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [
      { name: "taxAmount", type: "uint256" },
      { name: "vendorFeeAmount", type: "uint256" },
      { name: "merchantAmount", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "taxCollector",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "vendorFeeCollector",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "taxBps",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "vendorFeeBps",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },

  // ── Write Functions ──────────────────────────
  {
    type: "function",
    name: "mint",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setPurposeBound",
    inputs: [
      { name: "account", type: "address" },
      { name: "status", type: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setFeeConfig",
    inputs: [
      { name: "_taxCollector", type: "address" },
      { name: "_taxBps", type: "uint256" },
      { name: "_vendorFeeCollector", type: "address" },
      { name: "_vendorFeeBps", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "grantRole",
    inputs: [
      { name: "role", type: "bytes32" },
      { name: "account", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "revokeRole",
    inputs: [
      { name: "role", type: "bytes32" },
      { name: "account", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createEscrow",
    inputs: [
      { name: "seller", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "lockDuration", type: "uint256" },
      { name: "deliveryProofHash", type: "bytes32" },
    ],
    outputs: [{ name: "escrowId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "confirmDelivery",
    inputs: [
      { name: "escrowId", type: "uint256" },
      { name: "deliveryProof", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "refundEscrow",
    inputs: [{ name: "escrowId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },

  // ── Events ──────────────────────────────────
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Approval",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "spender", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "EscrowCreated",
    inputs: [
      { name: "escrowId", type: "uint256", indexed: true },
      { name: "buyer", type: "address", indexed: true },
      { name: "seller", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "deadline", type: "uint256", indexed: false },
      { name: "deliveryProofHash", type: "bytes32", indexed: false },
    ],
  },
  {
    type: "event",
    name: "DeliveryConfirmed",
    inputs: [
      { name: "escrowId", type: "uint256", indexed: true },
      { name: "seller", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "FeeDistributed",
    inputs: [
      { name: "escrowId", type: "uint256", indexed: true },
      { name: "taxAmount", type: "uint256", indexed: false },
      { name: "vendorFeeAmount", type: "uint256", indexed: false },
      { name: "merchantAmount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "EscrowRefunded",
    inputs: [
      { name: "escrowId", type: "uint256", indexed: true },
      { name: "buyer", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "PurposeBoundStatusChanged",
    inputs: [
      { name: "account", type: "address", indexed: true },
      { name: "status", type: "bool", indexed: false },
    ],
  },
  {
    type: "event",
    name: "RoleGranted",
    inputs: [
      { name: "role", type: "bytes32", indexed: true },
      { name: "account", type: "address", indexed: true },
      { name: "sender", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "RoleRevoked",
    inputs: [
      { name: "role", type: "bytes32", indexed: true },
      { name: "account", type: "address", indexed: true },
      { name: "sender", type: "address", indexed: true },
    ],
  },
  
  // ── Errors ──────────────────────────────────
  {
    type: "error",
    name: "PurposeBoundTransferViolation",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
    ],
  },
  {
    type: "error",
    name: "SellerNotAuthorizedMerchant",
    inputs: [{ name: "seller", type: "address" }],
  },
  {
    type: "error",
    name: "EscrowAmountZero",
    inputs: [],
  },
  {
    type: "error",
    name: "LockDurationZero",
    inputs: [],
  },
  {
    type: "error",
    name: "EscrowNotFound",
    inputs: [{ name: "escrowId", type: "uint256" }],
  },
  {
    type: "error",
    name: "EscrowAlreadyCompleted",
    inputs: [{ name: "escrowId", type: "uint256" }],
  },
  {
    type: "error",
    name: "EscrowAlreadyRefunded",
    inputs: [{ name: "escrowId", type: "uint256" }],
  },
  {
    type: "error",
    name: "NotEscrowBuyer",
    inputs: [
      { name: "escrowId", type: "uint256" },
      { name: "caller", type: "address" },
    ],
  },
  {
    type: "error",
    name: "NotEscrowSeller",
    inputs: [
      { name: "escrowId", type: "uint256" },
      { name: "caller", type: "address" },
    ],
  },
  {
    type: "error",
    name: "InvalidDeliveryProof",
    inputs: [{ name: "escrowId", type: "uint256" }],
  },
  {
    type: "error",
    name: "EscrowNotExpired",
    inputs: [
      { name: "escrowId", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "CannotEscrowToSelf",
    inputs: [],
  },
] as const;

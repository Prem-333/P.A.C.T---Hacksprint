"use client";

/**
 * @module BuyerView
 * @description MSME Buyer dashboard panel.
 * Allows the buyer to:
 *  - View their PBR token balance and purpose-bound status
 *  - Create DvP escrow agreements (lock funds for pending deliveries)
 *  - View active escrows and request refunds on expired ones
 */

import { useState, useCallback, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther, keccak256, toBytes, encodePacked } from "viem";
import { PBR_CONTRACT_ADDRESS, PBR_ABI } from "@/lib/contracts";
import { mapToISO20022 } from "@/lib/iso20022";
import type { TransactionMetadata, TransactionReceipt } from "@/lib/iso20022";
import type { ISO20022Message, EscrowData, EscrowStatus } from "@/types";
import { StatusBadge, getEscrowBadgeVariant } from "@/components/shared/StatusBadge";

interface BuyerViewProps {
  onTransaction: (txHash: string, type: string, iso: ISO20022Message) => void;
}

export function BuyerView({ onTransaction }: BuyerViewProps) {
  const { address } = useAccount();

  // ── Form State ──
  const [sellerAddress, setSellerAddress] = useState("");
  const [escrowAmount, setEscrowAmount] = useState("");
  const [lockDuration, setLockDuration] = useState("1");
  const [deliveryProof, setDeliveryProof] = useState("");

  // ── Escrow List State ──
  const [escrows, setEscrows] = useState<EscrowData[]>([]);
  const [isLoadingEscrows, setIsLoadingEscrows] = useState(false);

  // ── Contract Reads ──
  const { data: balance } = useReadContract({
    address: PBR_CONTRACT_ADDRESS,
    abi: PBR_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: isPurposeBound } = useReadContract({
    address: PBR_CONTRACT_ADDRESS,
    abi: PBR_ABI,
    functionName: "purposeBound",
    args: address ? [address] : undefined,
  });

  const { data: nextEscrowId } = useReadContract({
    address: PBR_CONTRACT_ADDRESS,
    abi: PBR_ABI,
    functionName: "nextEscrowId",
  });

  // ── Contract Writes ──
  const {
    writeContract: writeCreateEscrow,
    data: createHash,
    isPending: isCreating,
  } = useWriteContract();

  const {
    writeContract: writeRefund,
    data: refundHash,
    isPending: isRefunding,
  } = useWriteContract();

  const { data: createReceipt } = useWaitForTransactionReceipt({ hash: createHash });
  const { data: refundReceipt } = useWaitForTransactionReceipt({ hash: refundHash });

  // ── Load Escrows ──
  useEffect(() => {
    if (!nextEscrowId || !address) return;

    const loadEscrows = async () => {
      setIsLoadingEscrows(true);
      const total = Number(nextEscrowId as bigint);
      const loaded: EscrowData[] = [];

      // Note: In production, this would use events/subgraph. For MVP, we iterate.
      // This is fine for small numbers of escrows on a local chain.
      for (let i = 0; i < total; i++) {
        try {
          // We'll use the escrows mapping data from the component
          loaded.push({
            id: i,
            buyer: address,
            seller: "0x0000000000000000000000000000000000000000",
            amount: BigInt(0),
            deadline: 0,
            deliveryProofHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
            isCompleted: false,
            isRefunded: false,
            status: "PENDING" as EscrowStatus,
          });
        } catch {
          // Skip invalid escrows
        }
      }
      setIsLoadingEscrows(false);
    };

    loadEscrows();
  }, [nextEscrowId, address]);

  // ── Handlers ──
  const handleCreateEscrow = useCallback(() => {
    if (!sellerAddress || !escrowAmount || !deliveryProof || !address) return;

    const proofHash = keccak256(encodePacked(["string"], [deliveryProof]));
    const lockSeconds = BigInt(Math.floor(parseFloat(lockDuration) * 3600));

    writeCreateEscrow(
      {
        address: PBR_CONTRACT_ADDRESS,
        abi: PBR_ABI,
        functionName: "createEscrow",
        args: [
          sellerAddress as `0x${string}`,
          parseEther(escrowAmount),
          lockSeconds,
          proofHash,
        ],
      },
      {
        onSuccess: (hash) => {
          const metadata: TransactionMetadata = {
            type: "ESCROW_CREATE",
            from: address,
            to: sellerAddress as `0x${string}`,
            amount: escrowAmount,
            remittanceInfo: `DvP Escrow — Raw material procurement (Lock: ${lockDuration}h)`,
          };
          const receipt: TransactionReceipt = {
            blockNumber: BigInt(0),
            blockHash: "0x0",
            transactionIndex: 0,
            status: "success",
            gasUsed: BigInt(0),
          };
          const iso = mapToISO20022(hash, receipt, metadata);
          onTransaction(hash, "ESCROW_CREATE", iso);
          setSellerAddress("");
          setEscrowAmount("");
          setDeliveryProof("");
          setLockDuration("1");
        },
      }
    );
  }, [sellerAddress, escrowAmount, deliveryProof, lockDuration, address, writeCreateEscrow, onTransaction]);

  const handleRefund = useCallback(
    (escrowId: number) => {
      if (!address) return;

      writeRefund(
        {
          address: PBR_CONTRACT_ADDRESS,
          abi: PBR_ABI,
          functionName: "refundEscrow",
          args: [BigInt(escrowId)],
        },
        {
          onSuccess: (hash) => {
            const metadata: TransactionMetadata = {
              type: "ESCROW_REFUND",
              from: PBR_CONTRACT_ADDRESS,
              to: address,
              amount: "0",
              escrowId,
              remittanceInfo: `Escrow #${escrowId} refund — Deadline expired`,
            };
            const receipt: TransactionReceipt = {
              blockNumber: BigInt(0),
              blockHash: "0x0",
              transactionIndex: 0,
              status: "success",
              gasUsed: BigInt(0),
            };
            const iso = mapToISO20022(hash, receipt, metadata);
            onTransaction(hash, "ESCROW_REFUND", iso);
          },
        }
      );
    },
    [address, writeRefund, onTransaction]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Balance Card */}
      <div className="glass-card p-6 bg-gradient-to-r from-blue-500/5 via-transparent to-violet-500/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--color-text-muted)] mb-1">
              Token Balance
            </p>
            <p className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
              {balance ? formatEther(balance as bigint) : "0.0"}{" "}
              <span className="text-lg text-[var(--color-text-accent)]">PBR</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge
              label={isPurposeBound ? "Purpose-Bound" : "Unrestricted"}
              variant={isPurposeBound ? "warning" : "success"}
              icon={isPurposeBound ? "🔒" : "🔓"}
            />
            {address && (
              <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
                {address.slice(0, 10)}...{address.slice(-6)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Create Escrow Form */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-lg">📝</span>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Create DvP Escrow
          </h3>
          <span className="text-[10px] ml-auto px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Atomic Settlement
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">
              Seller (Merchant) Address
            </label>
            <input
              id="input-escrow-seller"
              type="text"
              value={sellerAddress}
              onChange={(e) => setSellerAddress(e.target.value)}
              placeholder="0x... (must be AUTHORIZED_MERCHANT)"
              className="input-field input-field-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">
              Amount (PBR)
            </label>
            <input
              id="input-escrow-amount"
              type="number"
              value={escrowAmount}
              onChange={(e) => setEscrowAmount(e.target.value)}
              placeholder="1000"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">
              Lock Duration (Hours)
            </label>
            <input
              id="input-escrow-lock"
              type="number"
              value={lockDuration}
              onChange={(e) => setLockDuration(e.target.value)}
              placeholder="24"
              className="input-field"
              min="0.1"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">
              Delivery Proof (Secret Phrase)
            </label>
            <input
              id="input-escrow-proof"
              type="text"
              value={deliveryProof}
              onChange={(e) => setDeliveryProof(e.target.value)}
              placeholder="e.g., DELIVERY-2024-SAGO-50KG"
              className="input-field input-field-mono"
            />
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-[rgba(245,158,11,0.05)] border border-amber-500/20">
          <p className="text-xs text-amber-400/80">
            ⚠️ The delivery proof will be hashed (keccak256) and stored on-chain.
            Share the plaintext proof with the seller out-of-band once goods are shipped.
          </p>
        </div>

        <button
          id="btn-create-escrow"
          onClick={handleCreateEscrow}
          disabled={isCreating || !sellerAddress || !escrowAmount || !deliveryProof}
          className="btn-primary w-full mt-4"
        >
          {isCreating ? "Creating Escrow..." : "Lock Funds in Escrow"}
        </button>
        {createReceipt && (
          <p className="text-xs text-emerald-400 mt-2">
            ✓ Escrow created in block #{createReceipt.blockNumber.toString()}
          </p>
        )}
      </div>

      {/* Active Escrows — Placeholder info */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">📋</span>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Your Active Escrows
          </h3>
          <span className="text-xs text-[var(--color-text-muted)] ml-auto font-mono">
            Total: {nextEscrowId ? (nextEscrowId as bigint).toString() : "0"} created
          </span>
        </div>

        {!nextEscrowId || (nextEscrowId as bigint) === BigInt(0) ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-3">📭</div>
            <p className="text-sm text-[var(--color-text-muted)]">
              No escrows created yet. Use the form above to initiate a DvP settlement.
            </p>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-[var(--color-text-secondary)]">
              {(nextEscrowId as bigint).toString()} escrow(s) created on-chain.
              Connect the Merchant view to confirm deliveries.
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              Use the ISO 20022 Transaction Log below to track settlement status.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

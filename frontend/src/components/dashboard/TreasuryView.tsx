"use client";

/**
 * @module TreasuryView
 * @description Central Authority dashboard panel.
 * Allows the admin to:
 *  - Mint new PBR tokens to any address
 *  - Assign AUTHORIZED_MERCHANT role to onboard suppliers
 *  - Toggle purpose-bound restrictions on accounts
 *  - View platform statistics (total supply, active merchants, escrow count)
 */

import { useState, useCallback } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther, keccak256, toBytes } from "viem";
import {
  PBR_CONTRACT_ADDRESS,
  PBR_ABI,
  AUTHORIZED_MERCHANT_ROLE,
  CENTRAL_AUTHORITY_ROLE,
} from "@/lib/contracts";
import { mapToISO20022 } from "@/lib/iso20022";
import type { TransactionMetadata, TransactionReceipt } from "@/lib/iso20022";
import type { ISO20022Message } from "@/types";

interface TreasuryViewProps {
  /** Callback to add a transaction to the ISO 20022 log. */
  onTransaction: (txHash: string, type: string, iso: ISO20022Message) => void;
}

export function TreasuryView({ onTransaction }: TreasuryViewProps) {
  const { address } = useAccount();

  // ── Form State ──
  const [mintAddress, setMintAddress] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [merchantAddress, setMerchantAddress] = useState("");
  const [purposeBoundAddress, setPurposeBoundAddress] = useState("");
  const [purposeBoundStatus, setPurposeBoundStatus] = useState(true);

  // ── Contract Writes ──
  const { writeContract: writeMint, data: mintHash, isPending: isMinting } = useWriteContract();
  const { writeContract: writeGrantRole, data: grantHash, isPending: isGranting } = useWriteContract();
  const { writeContract: writePurposeBound, data: pbHash, isPending: isSettingPB } = useWriteContract();

  // ── Transaction Receipts ──
  const { data: mintReceipt } = useWaitForTransactionReceipt({ hash: mintHash });
  const { data: grantReceipt } = useWaitForTransactionReceipt({ hash: grantHash });
  const { data: pbReceipt } = useWaitForTransactionReceipt({ hash: pbHash });

  // ── Contract Reads ──
  const { data: totalSupply } = useReadContract({
    address: PBR_CONTRACT_ADDRESS,
    abi: PBR_ABI,
    functionName: "totalSupply",
  });

  const { data: activeEscrows } = useReadContract({
    address: PBR_CONTRACT_ADDRESS,
    abi: PBR_ABI,
    functionName: "activeEscrowCount",
  });

  const { data: isAuthority } = useReadContract({
    address: PBR_CONTRACT_ADDRESS,
    abi: PBR_ABI,
    functionName: "hasRole",
    args: address ? [CENTRAL_AUTHORITY_ROLE, address] : undefined,
  });

  // ── Handlers ──
  const handleMint = useCallback(() => {
    if (!mintAddress || !mintAmount || !address) return;

    writeMint(
      {
        address: PBR_CONTRACT_ADDRESS,
        abi: PBR_ABI,
        functionName: "mint",
        args: [mintAddress as `0x${string}`, parseEther(mintAmount)],
      },
      {
        onSuccess: (hash) => {
          const metadata: TransactionMetadata = {
            type: "MINT",
            from: address,
            to: mintAddress as `0x${string}`,
            amount: mintAmount,
            remittanceInfo: "Treasury minting operation — Purpose-Bound Rupee issuance",
          };
          const receipt: TransactionReceipt = {
            blockNumber: BigInt(0),
            blockHash: "0x0",
            transactionIndex: 0,
            status: "success",
            gasUsed: BigInt(0),
          };
          const iso = mapToISO20022(hash, receipt, metadata);
          onTransaction(hash, "MINT", iso);
          setMintAddress("");
          setMintAmount("");
        },
      }
    );
  }, [mintAddress, mintAmount, address, writeMint, onTransaction]);

  const handleGrantRole = useCallback(() => {
    if (!merchantAddress || !address) return;

    writeGrantRole(
      {
        address: PBR_CONTRACT_ADDRESS,
        abi: PBR_ABI,
        functionName: "grantRole",
        args: [AUTHORIZED_MERCHANT_ROLE, merchantAddress as `0x${string}`],
      },
      {
        onSuccess: (hash) => {
          const metadata: TransactionMetadata = {
            type: "ROLE_GRANT",
            from: address,
            to: merchantAddress as `0x${string}`,
            amount: "0",
            remittanceInfo: "AUTHORIZED_MERCHANT role grant — Supplier onboarding",
          };
          const receipt: TransactionReceipt = {
            blockNumber: BigInt(0),
            blockHash: "0x0",
            transactionIndex: 0,
            status: "success",
            gasUsed: BigInt(0),
          };
          const iso = mapToISO20022(hash, receipt, metadata);
          onTransaction(hash, "ROLE_GRANT", iso);
          setMerchantAddress("");
        },
      }
    );
  }, [merchantAddress, address, writeGrantRole, onTransaction]);

  const handleSetPurposeBound = useCallback(() => {
    if (!purposeBoundAddress || !address) return;

    writePurposeBound(
      {
        address: PBR_CONTRACT_ADDRESS,
        abi: PBR_ABI,
        functionName: "setPurposeBound",
        args: [purposeBoundAddress as `0x${string}`, purposeBoundStatus],
      },
      {
        onSuccess: (hash) => {
          const metadata: TransactionMetadata = {
            type: "ROLE_GRANT",
            from: address,
            to: purposeBoundAddress as `0x${string}`,
            amount: "0",
            remittanceInfo: `Purpose-bound status ${purposeBoundStatus ? "enabled" : "disabled"}`,
          };
          const receipt: TransactionReceipt = {
            blockNumber: BigInt(0),
            blockHash: "0x0",
            transactionIndex: 0,
            status: "success",
            gasUsed: BigInt(0),
          };
          const iso = mapToISO20022(hash, receipt, metadata);
          onTransaction(hash, "PURPOSE_BOUND", iso);
          setPurposeBoundAddress("");
        },
      }
    );
  }, [purposeBoundAddress, purposeBoundStatus, address, writePurposeBound, onTransaction]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon="💰"
          label="Total Supply"
          value={totalSupply ? `${formatEther(totalSupply as bigint)} PBR` : "—"}
          accent="blue"
        />
        <StatCard
          icon="🔒"
          label="Active Escrows"
          value={activeEscrows !== undefined ? (activeEscrows as bigint).toString() : "—"}
          accent="amber"
        />
        <StatCard
          icon="🔑"
          label="Authority Status"
          value={isAuthority ? "Authorized" : "Unauthorized"}
          accent={isAuthority ? "emerald" : "rose"}
        />
      </div>

      {/* Action Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mint Tokens Panel */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-lg">🪙</span>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Mint Tokens
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">
                Recipient Address
              </label>
              <input
                id="input-mint-address"
                type="text"
                value={mintAddress}
                onChange={(e) => setMintAddress(e.target.value)}
                placeholder="0x..."
                className="input-field input-field-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">
                Amount (PBR)
              </label>
              <input
                id="input-mint-amount"
                type="number"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                placeholder="10000"
                className="input-field"
              />
            </div>
            <button
              id="btn-mint"
              onClick={handleMint}
              disabled={isMinting || !mintAddress || !mintAmount}
              className="btn-primary w-full mt-2"
            >
              {isMinting ? "Minting..." : "Mint PBR Tokens"}
            </button>
            {mintReceipt && (
              <p className="text-xs text-emerald-400 mt-1">
                ✓ Mint confirmed in block #{mintReceipt.blockNumber.toString()}
              </p>
            )}
          </div>
        </div>

        {/* Grant Merchant Role Panel */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-lg">🏪</span>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Onboard Merchant
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">
                Merchant Wallet Address
              </label>
              <input
                id="input-merchant-address"
                type="text"
                value={merchantAddress}
                onChange={(e) => setMerchantAddress(e.target.value)}
                placeholder="0x..."
                className="input-field input-field-mono"
              />
            </div>
            <p className="text-xs text-[var(--color-text-muted)] bg-[rgba(59,130,246,0.05)] px-3 py-2 rounded-lg">
              Grants <span className="text-[var(--color-text-accent)] font-mono">AUTHORIZED_MERCHANT</span>{" "}
              role, enabling the address to receive purpose-bound token transfers.
            </p>
            <button
              id="btn-grant-merchant"
              onClick={handleGrantRole}
              disabled={isGranting || !merchantAddress}
              className="btn-success w-full mt-2"
            >
              {isGranting ? "Granting Role..." : "Grant Merchant Role"}
            </button>
            {grantReceipt && (
              <p className="text-xs text-emerald-400 mt-1">
                ✓ Role granted in block #{grantReceipt.blockNumber.toString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Purpose-Bound Panel (Full Width) */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-lg">🎯</span>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Purpose-Bound Compliance
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-end">
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">
              Account Address
            </label>
            <input
              id="input-purpose-bound-address"
              type="text"
              value={purposeBoundAddress}
              onChange={(e) => setPurposeBoundAddress(e.target.value)}
              placeholder="0x..."
              className="input-field input-field-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">
              Restriction
            </label>
            <select
              id="select-purpose-bound-status"
              value={purposeBoundStatus ? "true" : "false"}
              onChange={(e) => setPurposeBoundStatus(e.target.value === "true")}
              className="input-field"
            >
              <option value="true">Enable (Restrict Transfers)</option>
              <option value="false">Disable (Free Transfers)</option>
            </select>
          </div>
          <button
            id="btn-set-purpose-bound"
            onClick={handleSetPurposeBound}
            disabled={isSettingPB || !purposeBoundAddress}
            className="btn-primary"
          >
            {isSettingPB ? "Setting..." : "Apply"}
          </button>
        </div>
        {pbReceipt && (
          <p className="text-xs text-emerald-400 mt-3">
            ✓ Purpose-bound status updated in block #{pbReceipt.blockNumber.toString()}
          </p>
        )}
        <p className="text-xs text-[var(--color-text-muted)] mt-3">
          Purpose-bound accounts can <strong>only</strong> transfer tokens to addresses with the{" "}
          <span className="font-mono text-[var(--color-text-accent)]">AUTHORIZED_MERCHANT</span> role.
        </p>
      </div>
    </div>
  );
}

// ── Stat Card Sub-component ──

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  accent: "blue" | "emerald" | "amber" | "rose";
}

const accentColors: Record<string, string> = {
  blue: "from-blue-500/10 to-blue-600/5 border-blue-500/20",
  emerald: "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20",
  amber: "from-amber-500/10 to-amber-600/5 border-amber-500/20",
  rose: "from-rose-500/10 to-rose-600/5 border-rose-500/20",
};

function StatCard({ icon, label, value, accent }: StatCardProps) {
  return (
    <div
      className={`glass-card p-5 bg-gradient-to-br ${accentColors[accent]}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight">
        {value}
      </p>
    </div>
  );
}

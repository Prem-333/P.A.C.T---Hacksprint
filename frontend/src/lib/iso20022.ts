/**
 * @module iso20022
 * @description Maps blockchain transaction data to ISO 20022 pacs.008.001.08
 * (FI To FI Customer Credit Transfer) JSON format.
 *
 * This utility simulates compliance-by-design by generating standardized
 * financial messaging metadata for every on-chain settlement transaction.
 *
 * @see https://www.iso20022.org/catalogue-messages/iso-20022-messages-archive?search=pacs.008
 */

import type { ISO20022Message, Address, TxHash } from "@/types";

// ──────────────────────────────────────────────
//  Configuration
// ──────────────────────────────────────────────

/** Simulated financial institution identifiers for the demo. */
const PLATFORM_CONFIG = {
  /** Platform's simulated BIC code. */
  platformBIC: "PBRFINBB",
  /** Platform name. */
  platformName: "Purpose-Bound Rupee Settlement Network",
  /** Currency code (Indian Rupee digital representation). */
  currency: "INR",
  /** Settlement method: CLRG = Clearing system. */
  settlementMethod: "CLRG",
  /** Service level code: SDVA = Same Day Value. */
  serviceLevelCode: "SDVA",
  /** Charge bearer: SLEV = Following Service Level. */
  chargeBearerCode: "SLEV",
} as const;

// ──────────────────────────────────────────────
//  Metadata Input Types
// ──────────────────────────────────────────────

/** Business metadata for mapping a transaction to ISO 20022 format. */
export interface TransactionMetadata {
  /** Type of transaction for categorization. */
  type:
    | "MINT"
    | "TRANSFER"
    | "ESCROW_CREATE"
    | "ESCROW_CONFIRM"
    | "ESCROW_REFUND"
    | "ROLE_GRANT";
  /** Sender/debtor wallet address. */
  from: Address;
  /** Receiver/creditor wallet address. */
  to: Address;
  /** Amount in token units (human-readable, e.g., "1000"). */
  amount: string;
  /** Optional escrow ID for escrow-related transactions. */
  escrowId?: number;
  /** Optional delivery proof reference. */
  deliveryRef?: string;
  /** Optional remittance information / invoice details. */
  remittanceInfo?: string;
}

/** Minimal transaction receipt from Viem's waitForTransactionReceipt. */
export interface TransactionReceipt {
  blockNumber: bigint;
  blockHash: `0x${string}`;
  transactionIndex: number;
  status: "success" | "reverted";
  gasUsed: bigint;
}

// ──────────────────────────────────────────────
//  Core Mapper Function
// ──────────────────────────────────────────────

/**
 * Maps a blockchain transaction to ISO 20022 pacs.008.001.08 format.
 *
 * @param txHash - The transaction hash from the blockchain.
 * @param receipt - The transaction receipt from `waitForTransactionReceipt`.
 * @param metadata - Business context for the transaction.
 * @returns The structured ISO 20022 pacs.008 message.
 *
 * @example
 * ```typescript
 * const iso = mapToISO20022(
 *   "0xabc123...",
 *   receipt,
 *   {
 *     type: "ESCROW_CREATE",
 *     from: "0xBuyer...",
 *     to: "0xSeller...",
 *     amount: "5000",
 *     escrowId: 0,
 *     remittanceInfo: "Sago raw material procurement - 50kg"
 *   }
 * );
 * ```
 */
export function mapToISO20022(
  txHash: TxHash,
  receipt: TransactionReceipt,
  metadata: TransactionMetadata
): ISO20022Message {
  const now = new Date();
  const messageId = generateMessageId(txHash, now);
  const uetr = generateUETR(txHash);
  const endToEndId = generateEndToEndId(metadata);

  const message: ISO20022Message = {
    FIToFICstmrCdtTrf: {
      GrpHdr: {
        MsgId: messageId,
        CreDtTm: now.toISOString(),
        NbOfTxs: "1",
        SttlmInf: {
          SttlmMtd: PLATFORM_CONFIG.settlementMethod,
          SttlmAcct: {
            Id: {
              Othr: {
                Id: `PBR-ESCROW-${receipt.blockNumber.toString()}`,
              },
            },
          },
        },
      },
      CdtTrfTxInf: {
        PmtId: {
          UETR: uetr,
          EndToEndId: endToEndId,
          TxId: txHash,
        },
        PmtTpInf: {
          SvcLvl: {
            Cd: PLATFORM_CONFIG.serviceLevelCode,
          },
          LclInstrm: {
            Cd: mapTransactionTypeToInstrument(metadata.type),
          },
          CtgyPurp: {
            Cd: mapTransactionTypeToPurpose(metadata.type),
          },
        },
        IntrBkSttlmAmt: {
          value: metadata.amount,
          Ccy: PLATFORM_CONFIG.currency,
        },
        IntrBkSttlmDt: now.toISOString().split("T")[0],
        ChrgBr: PLATFORM_CONFIG.chargeBearerCode,
        Dbtr: {
          Nm: `MSME Buyer [${truncateAddress(metadata.from)}]`,
          Id: {
            OrgId: {
              Othr: {
                Id: metadata.from,
                SchmeNm: {
                  Cd: "TXID",
                },
              },
            },
          },
        },
        DbtrAgt: {
          FinInstnId: {
            BICFI: PLATFORM_CONFIG.platformBIC,
            Nm: PLATFORM_CONFIG.platformName,
          },
        },
        Cdtr: {
          Nm: `Merchant Supplier [${truncateAddress(metadata.to)}]`,
          Id: {
            OrgId: {
              Othr: {
                Id: metadata.to,
                SchmeNm: {
                  Cd: "TXID",
                },
              },
            },
          },
        },
        CdtrAgt: {
          FinInstnId: {
            BICFI: PLATFORM_CONFIG.platformBIC,
            Nm: PLATFORM_CONFIG.platformName,
          },
        },
        RmtInf: {
          Ustrd: buildRemittanceString(metadata),
          Strd: metadata.escrowId !== undefined
            ? {
                RfrdDocInf: {
                  Tp: {
                    CdOrPrtry: {
                      Cd: "CINV",
                    },
                  },
                  Nb: `ESC-${metadata.escrowId.toString().padStart(6, "0")}`,
                  RltdDt: now.toISOString().split("T")[0],
                },
              }
            : undefined,
        },
      },
    },
  };

  // Log to console for compliance demonstration
  logISO20022Message(message, metadata.type);

  return message;
}

// ──────────────────────────────────────────────
//  Helper Functions
// ──────────────────────────────────────────────

/**
 * Generates a unique message ID from the transaction hash and timestamp.
 */
function generateMessageId(txHash: string, date: Date): string {
  const dateStr = date.toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
  const hashSuffix = txHash.slice(2, 10).toUpperCase();
  return `PBR-${dateStr}-${hashSuffix}`;
}

/**
 * Generates a UUID-format UETR from the transaction hash.
 * Maps the first 32 hex chars of the tx hash into a UUID v4-like format.
 */
function generateUETR(txHash: string): string {
  const hex = txHash.slice(2, 34).padEnd(32, "0");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

/**
 * Generates a human-readable end-to-end ID based on transaction type.
 */
function generateEndToEndId(metadata: TransactionMetadata): string {
  const prefix = {
    MINT: "MINT",
    TRANSFER: "XFER",
    ESCROW_CREATE: "ESCR",
    ESCROW_CONFIRM: "DLVR",
    ESCROW_REFUND: "RFND",
    ROLE_GRANT: "ROLE",
  }[metadata.type];

  const escrowSuffix =
    metadata.escrowId !== undefined ? `-E${metadata.escrowId}` : "";
  const timestamp = Date.now().toString(36).toUpperCase();

  return `${prefix}${escrowSuffix}-${timestamp}`;
}

/**
 * Maps transaction type to ISO 20022 local instrument code.
 */
function mapTransactionTypeToInstrument(
  type: TransactionMetadata["type"]
): string {
  const mapping: Record<TransactionMetadata["type"], string> = {
    MINT: "BOOK", // Book transfer (internal)
    TRANSFER: "TRF", // Credit transfer
    ESCROW_CREATE: "ESCT", // SEPA Credit Transfer (escrow)
    ESCROW_CONFIRM: "ESCT",
    ESCROW_REFUND: "RRTN", // Request for return
    ROLE_GRANT: "BOOK",
  };
  return mapping[type];
}

/**
 * Maps transaction type to ISO 20022 category purpose code.
 */
function mapTransactionTypeToPurpose(
  type: TransactionMetadata["type"]
): string {
  const mapping: Record<TransactionMetadata["type"], string> = {
    MINT: "SUPP", // Supplier payment
    TRANSFER: "SUPP",
    ESCROW_CREATE: "GDDS", // Purchase of goods
    ESCROW_CONFIRM: "GDDS",
    ESCROW_REFUND: "REFU", // Refund
    ROLE_GRANT: "ACCT", // Account management
  };
  return mapping[type];
}

/**
 * Builds a human-readable remittance information string.
 */
function buildRemittanceString(metadata: TransactionMetadata): string {
  const parts: string[] = [];

  parts.push(`PBR ${metadata.type} Transaction`);

  if (metadata.escrowId !== undefined) {
    parts.push(`Escrow ID: ${metadata.escrowId}`);
  }

  if (metadata.deliveryRef) {
    parts.push(`Delivery Ref: ${metadata.deliveryRef}`);
  }

  if (metadata.remittanceInfo) {
    parts.push(metadata.remittanceInfo);
  }

  parts.push(`Amount: ${metadata.amount} ${PLATFORM_CONFIG.currency}`);

  return parts.join(" | ");
}

/**
 * Truncates an Ethereum address for display (0x1234...abcd).
 */
function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Logs the ISO 20022 message to console with formatted output.
 */
function logISO20022Message(
  message: ISO20022Message,
  type: TransactionMetadata["type"]
): void {
  const divider = "═".repeat(60);

  console.log(`\n${divider}`);
  console.log(`  ISO 20022 pacs.008.001.08 — ${type}`);
  console.log(`  FI To FI Customer Credit Transfer`);
  console.log(divider);
  console.log(`${divider}\n`);
}

/**
 * Generates an actual ISO 20022 XML payload (pacs.008.001.10) for escrow settlement.
 * 
 * @param escrowId - Escrow ID
 * @param buyer - Buyer address/GSTIN placeholder
 * @param seller - Seller address/GSTIN placeholder
 * @param amountRaw - Total amount in wei
 * @param taxBps - Tax basis points
 * @param timestamp - Settlement timestamp
 */
export function generatePacs008XML(
  escrowId: number,
  buyer: string,
  seller: string,
  amountRaw: string,
  taxBps: number,
  timestamp: number
): string {
  const dateStr = new Date(timestamp).toISOString();
  // We simulate formatEther for basic XML amounts
  const amountStr = (Number(amountRaw) / 1e18).toFixed(2);
  const taxAmount = ((Number(amountRaw) / 1e18) * taxBps) / 10000;
  const platformFee = ((Number(amountRaw) / 1e18) * 100) / 10000;
  const netPayout = (Number(amountRaw) / 1e18) - taxAmount - platformFee;

  const msgId = `PBR-SETTLE-${escrowId}-${Date.now()}`;
  const endToEndId = `E2E-ESC-${escrowId}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.10">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>${msgId}</MsgId>
      <CreDtTm>${dateStr}</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
      </SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>${endToEndId}</EndToEndId>
      </PmtId>
      <IntrBkSttlmAmt Ccy="INR">${amountStr}</IntrBkSttlmAmt>
      <IntrBkSttlmDt>${dateStr.split("T")[0]}</IntrBkSttlmDt>
      <Dbtr>
        <Nm>Customer/Buyer GSTIN</Nm>
        <Id>
          <OrgId>
            <Othr>
              <Id>${buyer}</Id>
            </Othr>
          </OrgId>
        </Id>
      </Dbtr>
      <Cdtr>
        <Nm>Seller GSTIN</Nm>
        <Id>
          <OrgId>
            <Othr>
              <Id>${seller}</Id>
            </Othr>
          </OrgId>
        </Id>
      </Cdtr>
      <RmtInf>
        <Ustrd>Escrow Settlement: ESC-${escrowId} | GST (CGST/SGST): INR ${taxAmount.toFixed(2)} | Net Payout: INR ${netPayout.toFixed(2)}</Ustrd>
      </RmtInf>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`;
}


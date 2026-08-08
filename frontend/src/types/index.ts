/**
 * @module types
 * @description Shared TypeScript types for the Purpose-Bound Rupee platform.
 * Covers contract interactions, escrow state, UI state, and ISO 20022 data models.
 */

// ──────────────────────────────────────────────
//  Contract & Blockchain Types
// ──────────────────────────────────────────────

/** Ethereum address as a hex string. */
export type Address = `0x${string}`;

/** Transaction hash as a hex string. */
export type TxHash = `0x${string}`;

/** Bytes32 value as a hex string. */
export type Bytes32 = `0x${string}`;

// ──────────────────────────────────────────────
//  Escrow Domain Types
// ──────────────────────────────────────────────

/** Status of an escrow throughout its lifecycle. */
export enum EscrowStatus {
  /** Escrow created, awaiting delivery confirmation. */
  PENDING = "PENDING",
  /** Delivery confirmed, funds released to seller. */
  COMPLETED = "COMPLETED",
  /** Deadline expired, funds refunded to buyer. */
  REFUNDED = "REFUNDED",
  /** Deadline approaching (< 1 hour remaining). */
  EXPIRING_SOON = "EXPIRING_SOON",
}

/** On-chain escrow data mapped to a frontend-friendly structure. */
export interface EscrowData {
  id: number;
  buyer: Address;
  seller: Address;
  amount: bigint;
  deadline: number;
  deliveryProofHash: Bytes32;
  isCompleted: boolean;
  isRefunded: boolean;
  status: EscrowStatus;
}

/** Form input for creating a new escrow. */
export interface CreateEscrowInput {
  sellerAddress: string;
  amount: string;
  lockDurationHours: string;
  deliveryProof: string;
}

// ──────────────────────────────────────────────
//  Dashboard UI Types
// ──────────────────────────────────────────────

/** Active dashboard view/tab. */
export type DashboardView = "treasury" | "buyer" | "merchant";

/** Form input for minting tokens. */
export interface MintInput {
  recipientAddress: string;
  amount: string;
}

/** Form input for granting a role. */
export interface GrantRoleInput {
  address: string;
}

/** Transaction record for display in the UI. */
export interface TransactionRecord {
  txHash: TxHash;
  type: "MINT" | "TRANSFER" | "ESCROW_CREATE" | "ESCROW_CONFIRM" | "ESCROW_REFUND" | "ROLE_GRANT";
  from: Address;
  to: Address;
  amount?: string;
  timestamp: number;
  blockNumber: number;
  iso20022?: ISO20022Message;
}

// ──────────────────────────────────────────────
//  ISO 20022 pacs.008 Types
// ──────────────────────────────────────────────

/** ISO 20022 pacs.008.001.08 — FI to FI Customer Credit Transfer message. */
export interface ISO20022Message {
  FIToFICstmrCdtTrf: {
    GrpHdr: {
      MsgId: string;
      CreDtTm: string;
      NbOfTxs: string;
      SttlmInf: {
        SttlmMtd: string;
        SttlmAcct?: {
          Id: {
            Othr: {
              Id: string;
            };
          };
        };
      };
    };
    CdtTrfTxInf: {
      PmtId: {
        UETR: string;
        EndToEndId: string;
        TxId: string;
      };
      PmtTpInf?: {
        SvcLvl: {
          Cd: string;
        };
        LclInstrm?: {
          Cd: string;
        };
        CtgyPurp?: {
          Cd: string;
        };
      };
      IntrBkSttlmAmt: {
        value: string;
        Ccy: string;
      };
      IntrBkSttlmDt: string;
      ChrgBr: string;
      Dbtr: {
        Nm: string;
        Id: {
          OrgId: {
            Othr: {
              Id: string;
              SchmeNm: {
                Cd: string;
              };
            };
          };
        };
      };
      DbtrAgt: {
        FinInstnId: {
          BICFI: string;
          Nm: string;
        };
      };
      Cdtr: {
        Nm: string;
        Id: {
          OrgId: {
            Othr: {
              Id: string;
              SchmeNm: {
                Cd: string;
              };
            };
          };
        };
      };
      CdtrAgt: {
        FinInstnId: {
          BICFI: string;
          Nm: string;
        };
      };
      RmtInf: {
        Ustrd: string;
        Strd?: {
          RfrdDocInf: {
            Tp: {
              CdOrPrtry: {
                Cd: string;
              };
            };
            Nb: string;
            RltdDt: string;
          };
        };
      };
    };
  };
}

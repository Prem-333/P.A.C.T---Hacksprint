/**
 * @module types
 * @description Shared TypeScript types for the P.A.C.T. Digital Payment Platform.
 * Covers products, GST tax, payment methods, analytics, and ISO 20022 data models.
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
//  User Roles
// ──────────────────────────────────────────────

/** All user roles in the system. */
export type UserRole = "customer" | "seller" | "bank" | "supplier";

// ──────────────────────────────────────────────
//  Product & Catalog Types
// ──────────────────────────────────────────────

/** Product category with associated HSN code for GST. */
export type ProductCategory = "perfume" | "essential_oil" | "deodorant";

/** A product in the perfume catalog. */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in INR (₹)
  category: ProductCategory;
  hsnCode: string;
  imageUrl?: string;
  /** Raw material cost breakdown as percentages */
  rawMaterialBreakdown: {
    fragranceOil: number; // percentage
    bottles: number;
    packaging: number;
  };
}

// ──────────────────────────────────────────────
//  GST & Tax Types
// ──────────────────────────────────────────────

/** GST breakdown for a product. */
export interface GSTBreakdown {
  basePrice: number;
  cgstRate: number; // percentage
  sgstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  totalGST: number;
  totalPrice: number;
}

/** Full distribution breakdown for a sale. */
export interface DistributionBreakdown {
  totalAmount: number;
  basePrice: number;
  cgst: number;
  sgst: number;
  platformFee: number;
  sellerMargin: number;
  rawMaterialTotal: number;
  supplierPayments: {
    name: string;
    amount: number;
    percentage: number;
  }[];
}

/** Tax warning from the AI engine. */
export interface TaxWarning {
  id: string;
  severity: "info" | "warning" | "critical";
  hsnCode: string;
  category: string;
  message: string;
  previousRate: number;
  newRate: number;
  effectiveDate: string;
  source: string;
  detectedAt: string;
  acknowledged: boolean;
}

// ──────────────────────────────────────────────
//  Payment Types
// ──────────────────────────────────────────────

/** Supported payment methods. */
export type PaymentMethod = "gpay" | "cash";

/** Payment result from GPay simulation. */
export interface GPayPaymentResult {
  success: boolean;
  transactionId: string;
  upiRefNumber: string;
  amount: number;
  timestamp: number;
}

/** Cash payment record. */
export interface CashPaymentRecord {
  id: string;
  amount: number;
  timestamp: number;
  bankDebitAmount: number;
  depositPending: boolean;
  depositedAt?: number;
}

// ──────────────────────────────────────────────
//  Supplier Types
// ──────────────────────────────────────────────

/** Raw material supplier info. */
export interface SupplierInfo {
  id: string;
  name: string;
  type: "fragrance_oil" | "bottles" | "packaging";
  address: Address;
  sharePercent: number; // share of raw material cost
}

// ──────────────────────────────────────────────
//  Analytics Types
// ──────────────────────────────────────────────

/** Time period for analytics views. */
export type AnalyticsPeriod = "day" | "week" | "month";

/** Single data point for charts. */
export interface DataPoint {
  label: string;
  value: number;
  timestamp: number;
}

/** Product performance metrics. */
export interface ProductPerformance {
  productId: string;
  productName: string;
  unitsSold: number;
  revenue: number;
  profit: number;
  trend: "rising" | "stable" | "declining";
  trendPercent: number;
}

/** Cash flow entry. */
export interface CashFlowEntry {
  label: string;
  inflow: number;
  outflow: number;
  net: number;
  timestamp: number;
}

/** Complete analytics data. */
export interface AnalyticsData {
  period: AnalyticsPeriod;
  totalRevenue: number;
  totalProfit: number;
  totalOrders: number;
  profitMargin: number;
  revenueData: DataPoint[];
  profitData: DataPoint[];
  productPerformance: ProductPerformance[];
  cashFlow: CashFlowEntry[];
  topProducts: { name: string; revenue: number; units: number }[];
  gstCollected: { cgst: number; sgst: number; total: number };
  supplierPayments: { name: string; total: number }[];
}

// ──────────────────────────────────────────────
//  Order Types
// ──────────────────────────────────────────────

/** Order status. */
export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  DELIVERED = "DELIVERED",
  REFUNDED = "REFUNDED",
}

/** An order/purchase record. */
export interface Order {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  gstBreakdown: GSTBreakdown;
  distribution: DistributionBreakdown;
  createdAt: number;
  deliveredAt?: number;
  txHash?: string;
}

// ──────────────────────────────────────────────
//  Escrow Domain Types (Legacy — kept for blockchain)
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
export type DashboardView = "customer" | "seller" | "bank" | "supplier";

/** Transaction record for display in the UI. */
export interface TransactionRecord {
  txHash: TxHash;
  type: "MINT" | "TRANSFER" | "ESCROW_CREATE" | "ESCROW_CONFIRM" | "ESCROW_REFUND" | "ROLE_GRANT" | "GPAY_PAYMENT" | "CASH_PAYMENT" | "GST_DISTRIBUTION" | "SUPPLIER_PAYMENT";
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

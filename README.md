<div align="center">
  
# P.A.C.T. 
**Payments Automated Commerce & Tax Platform**

A production-grade digital payment and financial automation platform engineered for the modern perfume industry.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?style=for-the-badge&logo=solidity)](https://docs.soliditylang.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Viem](https://img.shields.io/badge/Viem-2.x-orange?style=for-the-badge)](https://viem.sh/)
[![Hardhat](https://img.shields.io/badge/Hardhat-EVM-yellow?style=for-the-badge&logo=hardhat)](https://hardhat.org/)

*Seamless GPay integration, automated GST distribution compliant with Indian guidelines, and multi-party settlement using ISO 20022 financial messaging—all powered by a robust, local EVM blockchain.*

---
</div>

## Executive Summary

Building on top of a custom-designed **Purpose-Bound Rupee (PBR)** ERC20 implementation, P.A.C.T. delivers a zero-friction Web3 experience. **No MetaMask required.** We engineered a sophisticated server-side custodial signing architecture utilizing Viem, allowing users to interact with complex blockchain escrows through a beautifully crafted, glassmorphic Web2-style interface. 

Every transaction is mapped to banking-grade **ISO 20022 `pacs.008.001.08`** standards, bridging the gap between decentralized finance and traditional banking compliance.

---

## System Architecture

Our architecture represents a meticulous separation of concerns, ensuring high performance, security, and exceptional user experience across three distinct roles: Customer, Seller, and Bank/Supplier.

```
┌────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16 App Router)                │
│                                                                    │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────────────┐  │
│  │  Customer    │  │  Seller       │  │  Bank / Supplier       │  │
│  │  (Buyer)     │  │  (Merchant)   │  │  (Observer / Vendor)   │  │
│  │  Buy Perfumes│  │  Confirm      │  │  Live Feed, Audit,     │  │
│  │  Pay in Escrow│  │  Deliveries    │  │  All Balances          │  │
│  └──────┬───────┘  └───────┬────────┘  └──────────┬─────────────┘  │
│         │                  │                       │               │
│  ┌──────┴──────────────────┴───────────────────────┴────────────┐  │
│  │         Toast Notifications  ·  EscrowTimeline              │  │
│  │         FeeBreakdown  ·  LiveActivityFeed  ·  SVG Icons     │  │
│  └─────────────────────────┬───────────────────────────────────┘  │
│                            │                                      │
│  ┌─────────────────────────┴───────────────────────────────────┐  │
│  │              Next.js API Routes (Server-Side Signing)       │  │
│  │    /api/escrow/create · /api/escrow/confirm · /api/balance  │  │
│  │    /api/escrow/refund · /api/escrow/list · /api/transactions│  │
│  └─────────────────────────┬───────────────────────────────────┘  │
│                            │                                      │
│  ┌─────────────────────────┴───────────────────────────────────┐  │
│  │   Viem Custodial Wallet Clients (per-role signing)          │  │
│  │   + parseContractError (human-readable revert decoding)     │  │
│  └─────────────────────────┬───────────────────────────────────┘  │
└────────────────────────────┬──────────────────────────────────────┘
                             │ JSON-RPC (localhost:8545)
┌────────────────────────────┴──────────────────────────────────────┐
│                   SMART CONTRACT (Hardhat / EVM)                  │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                PurposeBoundRupee.sol                         │ │
│  │  ┌─────────┐ ┌──────────┐ ┌────────────┐ ┌──────────────┐  │ │
│  │  │  ERC20  │ │ Ownable  │ │AccessCtrl  │ │ReentrancyGrd │  │ │
│  │  │ (Token) │ │  (Admin) │ │  (Roles)   │ │   (Safety)   │  │ │
│  │  └─────────┘ └──────────┘ └────────────┘ └──────────────┘  │ │
│  │                                                              │ │
│  │  Purpose-Bound Transfers · DvP Escrow · Atomic Fee Split    │ │
│  │  Tax (2%) → Admin  ·  Supplier Fee (1%) → Bank/Supplier     │ │
│  │  Remaining (97%) → Seller (Merchant)                         │ │
│  └──────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

---

## The Tech Stack (Our Arsenal)

We didn't compromise on the stack. We chose the most modern, robust tools available to build a highly scalable, developer-friendly ecosystem.

| Layer              | Technology                                   |
|--------------------|----------------------------------------------|
| Smart Contracts    | Solidity 0.8.24 + OpenZeppelin v5.1          |
| Local Blockchain   | Hardhat (chainId: 31337)                     |
| Frontend           | Next.js 16 (App Router) + TypeScript         |
| Web3 Middleware    | Viem 2.x (server-side custodial signing)     |
| Styling            | Tailwind CSS v4 + Glassmorphism design       |
| Icons              | Custom Lucide-style SVG icon library         |
| Data Layer         | ISO 20022 pacs.008.001.08 simulation         |
| Notifications      | Custom Toast provider (success/error/info)   |

---

## Key Technical Achievements

We pushed the boundaries of what a hackathon project can achieve. Here is where the real hard work shines:

- **Purpose-Bound Transfers**: We engineered strict token flow controls. Buyer tokens can *only* move to authorized merchants or the escrow contract. Any malicious routing is automatically reverted.
- **Delivery-vs-Payment (DvP) Escrow**: A cryptographic lock-and-key system. The buyer locks funds; the merchant must provide an exact, cryptographically verifiable proof phrase to trigger the release.
- **Atomic Fee Splitting**: On settlement, a single transaction flawlessly deducts a 2% platform tax, routes a 1% vendor fee, and delivers the 97% remainder to the merchant—all in one atomic EVM state change.
- **Human-Readable Revert Decoding**: Blockchain errors are ugly (`0x3f93e5e5`). We built a custom `parseContractError` utility that intercepts these bytecode signatures and translates them into elegant, user-friendly UI toasts.
- **Real-time ISO 20022 Streaming**: The Vendor dashboard isn't just a table; it's a live activity feed streaming color-coded, icon-tagged network events, translating raw hex data into compliant `pacs.008.001.08` JSON payloads.
- **Bespoke Iconography & UI**: We completely bypassed generic component libraries, hand-crafting a custom Lucide-style SVG library and a proprietary glassmorphic design system from scratch.

---

## Quick Start Guide

Experience the platform locally in under 2 minutes. 
> **Developer Note:** Zero MetaMask configuration required. We handle all complex cryptography and transaction signing server-side.

### 1. Install Dependencies
```bash
# Install Smart Contract dependencies
cd contracts
npm install

# Install Frontend dependencies
cd ../frontend
npm install
```

### 2. Ignite the Blockchain
```bash
cd contracts
npx hardhat node
```
*Bootstraps a local EVM node (`http://127.0.0.1:8545`) initialized with 20 pre-funded test accounts.*

### 3. Deploy the Ecosystem
*Open a new terminal window:*
```bash
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
```
*This script is a powerhouse. It deploys the `PurposeBoundRupee`, configures role-based access control, mints initial liquidity (10,000 PBR), enforces purpose-bounds, and sets up the strict tax/fee distribution network.*

### 4. Launch the App
```bash
cd frontend
npm run dev
```
*Navigate to [http://localhost:3000](http://localhost:3000) and witness the platform.*

---

## Interactive Demo Flow

We've pre-configured four distinct roles to showcase the multi-party architecture.

| User     | Role     | Login Credentials     | Capabilities                                 |
|----------|----------|-----------------------|----------------------------------------------|
| Customer | Customer | `customer` / `customer123` | Browse & buy perfumes, pay via GPay or Cash |
| Seller   | Seller   | `seller` / `seller123`      | Manage orders, confirm deliveries, track revenue |
| Bank     | Bank     | `bank` / `bank123`  | Settlement ledger, GST collection reports |
| Supplier | Supplier | `supplier` / `supplier123`  | Track payments from sales, distribution |

### The "Happy Path" Walkthrough:
1. **Initiate**: Login as **Customer**. Create an escrow for a perfume purchase (e.g., set proof phrase: `DELIVERY-PERFUME-001`).
2. **Fulfill**: Switch to **Seller**. Locate the pending escrow. Input the exact proof phrase `DELIVERY-PERFUME-001` to authorize delivery.
3. **Settle**: Watch the magic happen. The smart contract atomically executes the transaction.
4. **Audit**: Switch to **Bank**. Verify the exact fee split (2% Tax, 1% Vendor, 97% Merchant) in the live activity feed, fully documented in ISO 20022 format.

---

## Bulletproof Testing

We don't ship untested code. The smart contract suite is backed by comprehensive coverage.

```bash
cd contracts
npx hardhat test
```

**29 Rigorous test suites encompassing:**
- Complete Access Control & Role hierarchy.
- Strict Purpose-Bound transfer validations (preventing unauthorized routing).
- End-to-end Escrow lifecycle (Creation → Confirmation → Settlement).
- Time-locked Refunds and edge-case attack vectors (Zero amounts, self-escrowing, malicious proofs).
- Precision floating-point math simulation for Atomic Fee Distribution.

---

## Project Structure

```
contracts/
├── contracts/PurposeBoundRupee.sol   # Core ERC20 + Escrow + Fee Distribution
├── scripts/deploy.ts                 # Deployment & role configuration
├── test/PurposeBoundRupee.test.ts    # 29 comprehensive tests
└── hardhat.config.ts                 # Hardhat configuration

frontend/
├── src/
│   ├── app/
│   │   ├── globals.css               # Design system (light glassmorphism)
│   │   ├── layout.tsx                # Root layout + ToastProvider
│   │   ├── login/page.tsx            # Role-based login screen
│   │   ├── customer/page.tsx         # Customer's dashboard
│   │   ├── seller/page.tsx           # Seller's dashboard
│   │   ├── bank/page.tsx             # Bank's dashboard
│   │   └── supplier/page.tsx         # Supplier's dashboard
│   │   └── api/
│   │       ├── auth/route.ts         # Session management
│   │       ├── balance/route.ts      # Token balances + fee config
│   │       ├── transactions/route.ts # Transaction history
│   │       └── escrow/
│   │           ├── create/route.ts   # Create DvP escrow
│   │           ├── confirm/route.ts  # Confirm delivery & settle
│   │           ├── refund/route.ts   # Refund expired escrow
│   │           └── list/route.ts     # List all escrows
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Icons.tsx             # 30+ custom SVG icons
│   │   │   └── Toast.tsx             # Global toast notification system
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   │   └── Header.tsx            # Top header bar
│   │   ├── dashboard/
│   │   │   ├── ClientView.tsx        # Customer — escrow creation + timeline
│   │   │   ├── MerchantView.tsx      # Seller — delivery confirmation + fees
│   │   │   └── VendorView.tsx        # Bank/Supplier — audit + live feed
│   │   └── shared/
│   │       ├── StatusBadge.tsx        # Colored status indicators
│   │       ├── TransactionLog.tsx     # ISO 20022 message viewer
│   │       ├── EscrowTimeline.tsx     # Visual progress tracker
│   │       ├── FeeBreakdown.tsx       # Settlement preview
│   │       └── LiveActivityFeed.tsx   # Real-time event stream
│   ├── hooks/
│   │   └── useDashboard.ts           # Shared dashboard data hook
│   ├── lib/
│   │   ├── contracts.ts              # ABI + address constants
│   │   ├── iso20022.ts               # pacs.008 mapper utility
│   │   └── server/
│   │       └── wallet.ts             # Viem clients + error parser
│   └── types/index.ts                # Shared TypeScript types
└── package.json
```

---
<div align="center">
<i>Built with absolute precision for the Hack Sprint.</i><br>
<b>P.A.C.T. Team</b>
</div>

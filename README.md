# P.A.C.T. — Payments Automated Commerce & Tax Platform

> **A digital payment and financial automation platform for perfume selling.**
> Features GPay integration, automated GST distribution under Indian guidelines, and multi-party settlement using ISO 20022 financial messaging — all on a local EVM blockchain.

---

## System Architecture

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

## Tech Stack

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

## Key Features

- **Purpose-Bound Transfers** — Buyer tokens can only flow to authorized merchants or the escrow contract. Any other transfer reverts.
- **DvP Escrow** — Buyer locks funds in a smart contract escrow. Merchant confirms delivery with a proof phrase to release.
- **Automatic Fee Splitting** — On settlement, the contract atomically deducts a 2% platform tax and 1% vendor fee before releasing the remainder to the merchant.
- **Human-Readable Error Handling** — Contract revert signatures (e.g., `0x3f93e5e5`) are decoded into plain English via `parseContractError`.
- **Escrow Timeline** — Visual progress tracker showing Created → In Transit → Settled/Refunded.
- **Fee Breakdown Preview** — Merchants see a live settlement preview (Gross → Tax → Vendor Fee → Net).
- **Live Activity Feed** — The Vendor dashboard streams color-coded, icon-tagged network events in real time.
- **Role-Based Access** — Three demo users with distinct dashboards and capabilities.

## Quick Start

### Prerequisites

- Node.js >= 18
- npm >= 9

> **No MetaMask required.** All signing is handled server-side using Hardhat test keys.

### 1. Install Dependencies

```bash
# Smart contracts
cd contracts
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Start Local Blockchain

```bash
cd contracts
npx hardhat node
```

This starts a local EVM node at `http://127.0.0.1:8545` with 20 pre-funded test accounts.

### 3. Deploy Contracts

In a new terminal:

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
```

The deploy script will:
- Deploy the `PurposeBoundRupee` contract
- Grant `AUTHORIZED_MERCHANT` role to Seller (Account #1)
- Mint 10,000 PBR to Customer (Account #2)
- Enable purpose-bound restrictions on Customer
- Configure fee rates: 2% tax, 1% supplier fee
- Set Bank/Supplier (Account #3) as the vendor fee recipient

**Note the contract address** — if it differs from the default, update `PBR_CONTRACT_ADDRESS` in `frontend/src/lib/contracts.ts`.

### 4. Start Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Users & Testing the Flow

| User     | Role     | Login Credentials     | Capabilities                                 |
|----------|----------|-----------------------|----------------------------------------------|
| Customer | Customer | `customer` / `customer123` | Browse & buy perfumes, pay via GPay or Cash |
| Seller   | Seller   | `seller` / `seller123`      | Manage orders, confirm deliveries, track revenue |
| Bank     | Bank     | `bank` / `bank123`  | Settlement ledger, GST collection reports |
| Supplier | Supplier | `supplier` / `supplier123`  | Track payments from sales, distribution |

### Step-by-Step

1. **Login as Customer** → Create a DvP escrow to purchase perfumes (e.g., proof: `DELIVERY-PERFUME-001`)
2. **Login as Seller** → Enter the escrow ID and the exact delivery proof → Confirm Delivery
3. **Observe the fee split**: 20 PBR tax (2%), 10 PBR supplier fee (1%), 970 PBR to Seller
4. **Login as Bank/Supplier** → See the settlement and fee distributions in the Live Activity Feed

### ISO 20022 Compliance

- Every transaction generates a full ISO 20022 `pacs.008.001.08` JSON message
- The Transaction Log panel at the bottom of each dashboard displays all formatted messages

## Smart Contract Tests

```bash
cd contracts
npx hardhat test
```

29 tests covering:
- Access control & role management
- Purpose-bound transfer enforcement
- Full escrow lifecycle (create → confirm → release)
- Escrow refund after timeout
- Fee calculation and atomic distribution
- Edge cases (zero amount, self-escrow, invalid proof, etc.)

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

## License

MIT

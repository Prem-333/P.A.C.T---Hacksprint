# Purpose-Bound Rupee — Enterprise Digital Payment Platform

> **MVP v1.0** — A Purpose-Bound Token system for automated B2B industrial procurement,
> implementing programmable compliance, atomic DvP escrow settlement, and ISO 20022
> financial messaging standards for Sago & Textile MSME supply chains.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js + Wagmi)                   │
│  ┌───────────┐  ┌───────────────┐  ┌────────────────────────┐  │
│  │ Treasury  │  │  MSME Buyer   │  │  Merchant Supplier     │  │
│  │   View    │  │    View       │  │      View              │  │
│  └─────┬─────┘  └──────┬────────┘  └──────────┬─────────────┘  │
│        │               │                      │                │
│  ┌─────┴───────────────┴──────────────────────┴─────────────┐  │
│  │              Viem (readContract / writeContract)          │  │
│  └──────────────────────────┬────────────────────────────────┘  │
│                             │                                   │
│  ┌──────────────────────────┴────────────────────────────────┐  │
│  │           ISO 20022 pacs.008 Metadata Mapper              │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │ JSON-RPC (localhost:8545)
┌─────────────────────────────┴───────────────────────────────────┐
│                 SMART CONTRACT (Hardhat/EVM)                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              PurposeBoundRupee.sol                        │  │
│  │  ┌─────────┐ ┌──────────┐ ┌────────────┐ ┌───────────┐  │  │
│  │  │  ERC20  │ │ Ownable  │ │AccessCtrl  │ │Reentrancy │  │  │
│  │  │ (Token) │ │  (Admin) │ │  (Roles)   │ │  Guard    │  │  │
│  │  └─────────┘ └──────────┘ └────────────┘ └───────────┘  │  │
│  │                                                           │  │
│  │  Features: Purpose-Bound Transfers · DvP Escrow          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity 0.8.24 + OpenZeppelin v5.1 |
| Local Blockchain | Hardhat (chainId: 31337) |
| Frontend | Next.js 15 (App Router) + TypeScript |
| Web3 Middleware | Viem 2.x + Wagmi v2 |
| Styling | Tailwind CSS v4 |
| Data Layer | ISO 20022 pacs.008.001.08 simulation |

## Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9
- MetaMask browser extension

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

This starts a local EVM node at `http://127.0.0.1:8545` with 20 pre-funded accounts.

### 3. Deploy Contracts

In a new terminal:

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
```

The deploy script will:
- Deploy `PurposeBoundRupee` contract
- Grant `AUTHORIZED_MERCHANT` role to Account #1
- Mint 10,000 PBR to Account #2 (buyer)
- Enable purpose-bound restrictions on Account #2

**Note the contract address** printed in the output — if it differs from the default, update `PBR_CONTRACT_ADDRESS` in `frontend/src/lib/contracts.ts`.

### 4. Configure MetaMask

1. Add a custom network:
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`

2. Import test accounts (private keys from Hardhat node output):
   - Account #0 → Central Authority (admin)
   - Account #1 → Merchant (supplier)
   - Account #2 → MSME Buyer

### 5. Start Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing the Flow

### Treasury Flow (Connect as Account #0)
1. Navigate to **Treasury** view
2. Mint tokens to any address
3. Grant `AUTHORIZED_MERCHANT` role to new supplier addresses
4. Toggle purpose-bound restrictions

### Buyer Flow (Connect as Account #2)
1. Navigate to **MSME Buyer** view
2. Create a DvP escrow (specify merchant address, amount, lock duration, and delivery proof phrase)
3. View escrow status

### Merchant Flow (Connect as Account #1)
1. Navigate to **Merchant** view
2. Look up the escrow by ID
3. Enter the delivery proof string → **Confirm Delivery**
4. Tokens are released to your wallet

### ISO 20022 Compliance
- Open browser DevTools (F12 → Console)
- Every transaction logs a full ISO 20022 `pacs.008.001.08` JSON message
- The Transaction Log panel at the bottom of the dashboard displays all formatted messages

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
- Edge cases (zero amount, self-escrow, invalid proof, etc.)

## Project Structure

```
contracts/
├── contracts/PurposeBoundRupee.sol   # Core ERC20 + Escrow contract
├── scripts/deploy.ts                 # Deployment script
├── test/PurposeBoundRupee.test.ts    # 29 comprehensive tests
└── hardhat.config.ts                 # Hardhat configuration

frontend/
├── src/
│   ├── app/
│   │   ├── globals.css               # Design system (glassmorphism dark theme)
│   │   ├── layout.tsx                # Root layout + Web3Provider
│   │   └── page.tsx                  # Main dashboard page
│   ├── components/
│   │   ├── providers/Web3Provider    # Wagmi + QueryClient provider
│   │   ├── layout/Sidebar            # Navigation sidebar
│   │   ├── layout/Header             # Top header with wallet connect
│   │   ├── dashboard/TreasuryView    # Central Authority panel
│   │   ├── dashboard/BuyerView       # MSME Buyer panel
│   │   ├── dashboard/MerchantView    # Merchant Supplier panel
│   │   └── shared/                   # StatusBadge, TransactionLog
│   ├── lib/
│   │   ├── wagmi.ts                  # Wagmi config (local chain)
│   │   ├── contracts.ts              # ABI + address constants
│   │   └── iso20022.ts               # pacs.008 mapper utility
│   └── types/index.ts                # Shared TypeScript types
└── package.json
```

## License

MIT

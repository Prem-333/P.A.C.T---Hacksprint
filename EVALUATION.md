# Hackathon Evaluation Report: P.A.C.T. V2
*(Payments Automated Commerce & Tax Platform)*

## 1. Architecture & Real-World Viability

### Hybrid Architecture
P.A.C.T. implements a hybrid architecture leveraging a Next.js 16 frontend and a local EVM blockchain (Hardhat) backend. It acts as an **L2 CBDC wrapper** designed for purpose-bound digital rupees, seamlessly integrating **dynamic HSN-based GST automated compliance**.

### Economic Problem Solved
Indian MSME supply chains often suffer from massive trust deficits, delayed payments, and significant manual overhead for GST (Tax) compliance. Buyers hesitate to pay upfront, and sellers hesitate to ship without payment.

### Why Blockchain Instead of a Traditional Database?
A traditional database requires a centralized intermediary to hold escrow funds, introducing counterparty risk, settlement delays, and high processing fees. By utilizing blockchain:
1. **Atomic Settlement**: Delivery-vs-Payment (DvP) is trustless. Funds are mathematically locked in a smart contract escrow.
2. **Immutable Traceability**: Every transaction automatically generates an ISO 20022 compliant financial message that cannot be altered, ensuring perfect audit trails for tax authorities.
3. **Programmable Money**: Transfer restrictions are enforced at the token level (purpose-bound), ensuring buyers can only spend funds at authorized merchants.

---

## 2. Smart Contract Security

The `PurposeBoundRupee.sol` contract incorporates robust defensive programming patterns:

- **ERC-4337 Non-custodial Paymasters**: The backend architecture implements Account Abstraction (ERC-4337). The server acts purely as a Paymaster and Bundler relayer to sponsor gas. Users locally control their Session Keys (WebAuthn / Passkeys), ensuring a true non-custodial experience.
- **Gas Optimization (isAuthorizedMerchant)**: Instead of using expensive `hasRole` lookups inside the hot-path `_update` transfer hook, the contract uses a gas-optimized `isAuthorizedMerchant` boolean mapping. This reduces per-transfer gas costs significantly while maintaining strict compliance.
- **Chainlink-Verified e-Way Bill Consensus**: Eliminates single-party failure by requiring a **2-of-3 consensus** (Buyer, Seller, Logistics Oracle). The Logistics Oracle signature simulates a Chainlink Decentralized Oracle Network (DON) that cryptographically verifies the e-Way Bill webhook from the GST portal, preventing server admin collusion.
- **Reentrancy Protection**: Uses OpenZeppelin's `ReentrancyGuard` (`nonReentrant` modifier) on state-mutating functions to prevent reentrancy attacks during fund transfers.

---

## 3. Meaningful Automation

The financial automation layer removes manual accounting and invoicing overhead:

- **Dynamic Tax Slab Splitting**: Escrows dynamically calculate GST based on the product's HSN/SAC code (e.g., 5%, 12%, 18%, 28%). 
- **Atomic Fee Splitting**: When the Chainlink-verified delivery consensus is reached, the `_settleEscrow` function automatically triggers a 3-way split in a single transaction:
  - **Dynamic GST %** automatically routed to the Bank (Government Tax Collector)
  - **1% (100 bps)** automatically routed to the Supplier (Platform/Vendor fee)
  - **Remaining Balance** routed to the Seller (Net Payout)
- **Automated ISO 20022 XML Generation**: Upon settlement, the system automatically generates a valid ISO 20022 `pacs.008.001.10` XML file containing all relevant data (Escrow ID, Buyer/Seller GSTIN, Net Payout, CGST/SGST), which can be downloaded via an API endpoint for ERP integration.

---

## 4. UI/UX & User Journey

The frontend abstracts away the typical friction of Web3 applications:

- **Passkeys & Session Keys**: Users log in normally; behind the scenes, session keys sign UserOperations.
- **Gasless Experience**: The ERC-4337 Paymaster sponsors all transaction fees. Users never see or pay gas fees.
- **Human-Readable Errors**: Blockchain revert codes (like `0x3f93e5e5`) are intercepted and decoded into plain-English UI toasts using a custom `parseContractError` utility.
- **Visual Timelines**: Complex escrow states (Created → In Transit → Settled) are translated into visual stepper components (`EscrowTimeline`), providing immediate feedback to the user.

### Core User Flows

````carousel
![Login Page](file:///C:/Users/Victor%20Callahan/.gemini/antigravity-ide/brain/588a7026-fb26-46cf-8d5a-63d321f8c9d8/login_page_1786378195139.png)
<!-- slide -->
![Customer Dashboard - Purchasing via Escrow](file:///C:/Users/Victor%20Callahan/.gemini/antigravity-ide/brain/588a7026-fb26-46cf-8d5a-63d321f8c9d8/customer_dashboard_1786378208554.png)
<!-- slide -->
![Seller Dashboard - Tracking Revenue and Deliveries](file:///C:/Users/Victor%20Callahan/.gemini/antigravity-ide/brain/588a7026-fb26-46cf-8d5a-63d321f8c9d8/seller_dashboard_1786378252879.png)
````

---

## 5. Codebase Health & Quick Start

### Directory Structure
The repository is cleanly separated into two distinct packages:
- `/contracts`: Contains the Hardhat environment, `PurposeBoundRupee.sol`, comprehensive test suites, and deployment scripts.
- `/frontend`: A Next.js 16 App Router project utilizing Tailwind CSS, modular React components (`/components/dashboard`, `/components/shared`), and server-side API routes.

### Clean Code Practices
- **Strict Typing**: Full TypeScript coverage across both the Hardhat tests and the Next.js frontend.
- **Component Reusability**: UI elements like `StatusBadge`, `FeeBreakdown`, and `EscrowTimeline` are extracted into a shared library.
- **Modular APIs**: Blockchain interactions are isolated within Next.js API routes (`/api/escrow/create`, `/api/escrow/confirm`), keeping the client-side components lightweight and secure.

### Quick Start Guide

1. **Start the Local Blockchain**
   ```bash
   cd contracts
   npm install
   npx hardhat node
   ```

2. **Deploy Smart Contracts & Roles**
   *(In a new terminal)*
   ```bash
   cd contracts
   npx hardhat run scripts/deploy.ts --network localhost
   ```

3. **Start the Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Navigate to `http://localhost:3000` to interact with the platform.

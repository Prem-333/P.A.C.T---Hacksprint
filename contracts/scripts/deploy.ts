import { ethers } from "hardhat";

/**
 * Deployment script for PurposeBoundRupee contract.
 * Sets up all three named users and the logistics oracle:
 *   - Account #0 (Admin/Central Authority) — deployer & tax collector
 *   - Account #1 (Prem / Merchant) — authorized merchant
 *   - Account #2 (Bharath / Client) — buyer with purpose-bound tokens
 *   - Account #3 (Kanish / Vendor) — supply chain observer & fee collector
 *   - Account #4 (Logistics Oracle) — simulated e-Way Bill API signer
 */
async function main() {
  const [admin, merchant, buyer, vendor, oracle] = await ethers.getSigners();

  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║    P.A.C.T. — Purpose-Bound Rupee Deployment (v2)     ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log("");
  console.log("  Admin (Central Authority): ", admin.address);
  console.log("  Prem  (Merchant/Supplier): ", merchant.address);
  console.log("  Bharath (Client/Buyer):    ", buyer.address);
  console.log("  Kanish  (Vendor/Observer): ", vendor.address);
  console.log("  Oracle (e-Way Bill API):   ", oracle.address);
  console.log("");

  // Deploy the contract
  const PurposeBoundRupee = await ethers.getContractFactory("PurposeBoundRupee");
  const token = await PurposeBoundRupee.deploy(admin.address);
  await token.waitForDeployment();
  const contractAddress = await token.getAddress();
  console.log("  ✅ Contract deployed at:      ", contractAddress);
  console.log("");

  // Authorize Prem as merchant (uses gas-optimized bitmap + AccessControl role)
  const auth1 = await token.setAuthorizedMerchant(merchant.address, true);
  await auth1.wait();
  console.log("  ✅ AUTHORIZED_MERCHANT → Prem:  ", merchant.address);

  // Authorize Kanish as merchant (so he can receive vendor fee distributions)
  const auth2 = await token.setAuthorizedMerchant(vendor.address, true);
  await auth2.wait();
  console.log("  ✅ AUTHORIZED_MERCHANT → Kanish: ", vendor.address);

  // Set the logistics oracle (simulated e-Way Bill signer — Account #4)
  const setOracle = await token.setLogisticsOracle(oracle.address);
  await setOracle.wait();
  console.log("  ✅ Logistics Oracle set:        ", oracle.address);

  // Mint tokens to Bharath (Client) — 10,000 PBR
  const mintAmount = ethers.parseEther("10000");
  const mint1 = await token.mint(buyer.address, mintAmount);
  await mint1.wait();
  console.log("  ✅ Minted 10,000 PBR → Bharath: ", buyer.address);

  // Set purpose-bound restriction on Bharath
  const pb1 = await token.setPurposeBound(buyer.address, true);
  await pb1.wait();
  console.log("  ✅ Purpose-bound ON → Bharath:  ", buyer.address);

  // Set fee configuration (2% tax to Admin, 1% fee to Vendor/Kanish)
  const setFee = await token.setFeeConfig(admin.address, 200, vendor.address, 100);
  await setFee.wait();
  console.log("  ✅ Fee Configured → 2% Tax (Admin), 1% Platform Fee (Kanish)");

  console.log("");
  console.log("┌──────────────────────────────────────────────────────────┐");
  console.log("│  USER CREDENTIALS                                      │");
  console.log("├──────────────────────────────────────────────────────────┤");
  console.log("│  Bharath (Client):  bharath / bharath123                │");
  console.log("│  Prem (Merchant):   prem / prem123                     │");
  console.log("│  Kanish (Vendor):   kanish / kanish123                 │");
  console.log("├──────────────────────────────────────────────────────────┤");
  console.log("│  MULTI-SIG ORACLE (2-of-3 Consensus)                   │");
  console.log("│  Confirmers: Buyer + Seller + Logistics Oracle         │");
  console.log("│  Oracle:    ", oracle.address, "  │");
  console.log("├──────────────────────────────────────────────────────────┤");
  console.log(`│  CONTRACT = "${contractAddress}"`);
  console.log("│  CHAIN_ID = 31337 · RPC = http://127.0.0.1:8545        │");
  console.log("└──────────────────────────────────────────────────────────┘");
  console.log("");
  console.log("  Account Addresses:");
  console.log("  ─────────────────");
  console.log("  Admin:   ", admin.address);
  console.log("  Prem:    ", merchant.address);
  console.log("  Bharath: ", buyer.address);
  console.log("  Kanish:  ", vendor.address);
  console.log("  Oracle:  ", oracle.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

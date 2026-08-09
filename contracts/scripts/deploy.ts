import { ethers } from "hardhat";

/**
 * Deployment script for PurposeBoundRupee contract.
 * Sets up all three named users:
 *   - Account #0 (Admin/Central Authority) — deployer
 *   - Account #1 (Prem / Merchant) — authorized merchant
 *   - Account #2 (Bharath / Client) — buyer with purpose-bound tokens
 *   - Account #3 (Kanish / Vendor) — observer
 */
async function main() {
  const [admin, merchant, buyer, vendor] = await ethers.getSigners();

  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║       Purpose-Bound Rupee — Contract Deployment        ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log("");
  console.log("  Admin (Central Authority): ", admin.address);
  console.log("  Prem  (Merchant/Supplier): ", merchant.address);
  console.log("  Bharath (Client/Buyer):    ", buyer.address);
  console.log("  Kanish  (Vendor/Observer): ", vendor.address);
  console.log("");

  // Deploy the contract
  const PurposeBoundRupee = await ethers.getContractFactory("PurposeBoundRupee");
  const token = await PurposeBoundRupee.deploy(admin.address);
  await token.waitForDeployment();
  const contractAddress = await token.getAddress();
  console.log("  ✅ Contract deployed at:      ", contractAddress);
  console.log("");

  // Grant AUTHORIZED_MERCHANT role to Prem
  const AUTHORIZED_MERCHANT = await token.AUTHORIZED_MERCHANT();
  const grant1 = await token.grantRole(AUTHORIZED_MERCHANT, merchant.address);
  await grant1.wait();
  console.log("  ✅ AUTHORIZED_MERCHANT → Prem:  ", merchant.address);

  // Grant AUTHORIZED_MERCHANT role to Kanish (so he can also observe/receive)
  const grant2 = await token.grantRole(AUTHORIZED_MERCHANT, vendor.address);
  await grant2.wait();
  console.log("  ✅ AUTHORIZED_MERCHANT → Kanish: ", vendor.address);

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
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

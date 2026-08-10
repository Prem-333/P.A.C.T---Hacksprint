import { ethers } from "hardhat";

/**
 * Deployment script for PurposeBoundRupee contract.
 * Sets up all platform roles:
 *   - Account #0 (Bank / Admin) — deployer & tax collector
 *   - Account #1 (Seller / Merchant) — authorized merchant
 *   - Account #2 (Customer / Buyer) — buyer with purpose-bound tokens
 *   - Account #3 (Fragrance Oil Supplier) — raw material supplier
 *   - Account #4 (Bottle Supplier) — raw material supplier
 *   - Account #5 (Packaging Supplier) — raw material supplier
 *   - Account #6 (Logistics Oracle) — simulated e-Way Bill API signer
 */
async function main() {
  const [bank, seller, customer, supplier1, supplier2, supplier3, oracle] = await ethers.getSigners();

  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║   P.A.C.T. — Payments Automated Commerce & Tax (v2)  ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log("");
  console.log("  Bank (Central Authority):     ", bank.address);
  console.log("  Seller (Perfume Merchant):     ", seller.address);
  console.log("  Customer (Buyer):              ", customer.address);
  console.log("  Supplier 1 (Fragrance Oil):    ", supplier1.address);
  console.log("  Supplier 2 (Bottles):          ", supplier2.address);
  console.log("  Supplier 3 (Packaging):        ", supplier3.address);
  console.log("  Oracle (e-Way Bill API):        ", oracle.address);
  console.log("");

  // Deploy the contract
  const PurposeBoundRupee = await ethers.getContractFactory("PurposeBoundRupee");
  const token = await PurposeBoundRupee.deploy(bank.address);
  await token.waitForDeployment();
  const contractAddress = await token.getAddress();
  console.log("  ✅ Contract deployed at:        ", contractAddress);
  console.log("");

  // Authorize Seller as merchant
  const auth1 = await token.setAuthorizedMerchant(seller.address, true);
  await auth1.wait();
  console.log("  ✅ AUTHORIZED_MERCHANT → Seller: ", seller.address);

  // Authorize all 3 suppliers as merchants (so they can receive distributions)
  const auth2 = await token.setAuthorizedMerchant(supplier1.address, true);
  await auth2.wait();
  console.log("  ✅ AUTHORIZED_MERCHANT → Supplier 1:", supplier1.address);

  const auth3 = await token.setAuthorizedMerchant(supplier2.address, true);
  await auth3.wait();
  console.log("  ✅ AUTHORIZED_MERCHANT → Supplier 2:", supplier2.address);

  const auth4 = await token.setAuthorizedMerchant(supplier3.address, true);
  await auth4.wait();
  console.log("  ✅ AUTHORIZED_MERCHANT → Supplier 3:", supplier3.address);

  // Set the logistics oracle (simulated e-Way Bill signer)
  const setOracle = await token.setLogisticsOracle(oracle.address);
  await setOracle.wait();
  console.log("  ✅ Logistics Oracle set:          ", oracle.address);

  // Mint tokens to Customer — ₹50,000 digital INR
  const mintAmount = ethers.parseEther("50000");
  const mint1 = await token.mint(customer.address, mintAmount);
  await mint1.wait();
  console.log("  ✅ Minted ₹50,000 → Customer:    ", customer.address);

  // Set purpose-bound restriction on Customer
  const pb1 = await token.setPurposeBound(customer.address, true);
  await pb1.wait();
  console.log("  ✅ Purpose-bound ON → Customer:   ", customer.address);

  // Set fee configuration (2% tax to Bank, 1% fee to Supplier 1 placeholder)
  const setFee = await token.setFeeConfig(bank.address, 200, supplier1.address, 100);
  await setFee.wait();
  console.log("  ✅ Fee Configured → 2% GST (Bank), 1% Platform Fee");

  console.log("");
  console.log("┌──────────────────────────────────────────────────────────┐");
  console.log("│  USER CREDENTIALS                                      │");
  console.log("├──────────────────────────────────────────────────────────┤");
  console.log("│  Customer:  customer / customer123                      │");
  console.log("│  Seller:    seller / seller123                          │");
  console.log("│  Bank:      bank / bank123                              │");
  console.log("│  Supplier:  supplier / supplier123                      │");
  console.log("├──────────────────────────────────────────────────────────┤");
  console.log("│  MULTI-SIG ORACLE (2-of-3 Consensus)                   │");
  console.log("│  Confirmers: Customer + Seller + Logistics Oracle      │");
  console.log("│  Oracle:    ", oracle.address, "  │");
  console.log("├──────────────────────────────────────────────────────────┤");
  console.log(`│  CONTRACT = "${contractAddress}"`);
  console.log("│  CHAIN_ID = 31337 · RPC = http://127.0.0.1:8545        │");
  console.log("└──────────────────────────────────────────────────────────┘");
  console.log("");
  console.log("  Account Addresses:");
  console.log("  ─────────────────");
  console.log("  Bank:         ", bank.address);
  console.log("  Seller:       ", seller.address);
  console.log("  Customer:     ", customer.address);
  console.log("  Supplier 1:   ", supplier1.address);
  console.log("  Supplier 2:   ", supplier2.address);
  console.log("  Supplier 3:   ", supplier3.address);
  console.log("  Oracle:       ", oracle.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

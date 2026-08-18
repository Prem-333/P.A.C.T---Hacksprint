import { ethers } from "hardhat";

async function main() {
  const [bank, seller, customer] = await ethers.getSigners();
  // We read the address from frontend config just to be sure, 
  // but hardhat standard first deployment is 0x5FbDB2315678afecb367f032d93F642f64180aa3
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  console.log("Connecting to contract at:", contractAddress);
  const token = await ethers.getContractAt("PurposeBoundRupee", contractAddress);
  
  const currentBalance = await token.balanceOf(customer.address);
  console.log(`Current Balance: ${ethers.formatEther(currentBalance)}`);
  
  const targetBalance = ethers.parseEther("50000");
  if (currentBalance < targetBalance) {
    const amountToMint = targetBalance - currentBalance;
    console.log(`Minting ${ethers.formatEther(amountToMint)}...`);
    const tx = await token.connect(bank).mint(customer.address, amountToMint);
    await tx.wait();
    console.log(`Successfully fixed balance to 50,000 PBR for Customer (${customer.address})`);
  } else {
    console.log("Customer already has >= 50,000");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

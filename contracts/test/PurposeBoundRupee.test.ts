import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import type { PurposeBoundRupee } from "../typechain-types";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("PurposeBoundRupee", function () {
  let token: PurposeBoundRupee;
  let admin: HardhatEthersSigner;
  let merchant: HardhatEthersSigner;
  let buyer: HardhatEthersSigner;
  let unauthorized: HardhatEthersSigner;

  const CENTRAL_AUTHORITY = ethers.keccak256(ethers.toUtf8Bytes("CENTRAL_AUTHORITY"));
  const AUTHORIZED_MERCHANT = ethers.keccak256(ethers.toUtf8Bytes("AUTHORIZED_MERCHANT"));
  const MINT_AMOUNT = ethers.parseEther("10000");
  const ESCROW_AMOUNT = ethers.parseEther("1000");
  const LOCK_DURATION = 3600; // 1 hour in seconds
  const DELIVERY_PROOF = "DELIVERY-2024-001-SAGO-50KG";
  const DELIVERY_PROOF_HASH = ethers.keccak256(ethers.toUtf8Bytes(DELIVERY_PROOF));

  beforeEach(async function () {
    [admin, merchant, buyer, unauthorized] = await ethers.getSigners();

    const PurposeBoundRupee = await ethers.getContractFactory("PurposeBoundRupee");
    token = await PurposeBoundRupee.deploy(admin.address);
    await token.waitForDeployment();

    // Setup roles
    await token.grantRole(AUTHORIZED_MERCHANT, merchant.address);

    // Mint tokens to buyer
    await token.mint(buyer.address, MINT_AMOUNT);
  });

  // ──────────────────────────────────────────────
  //  Role & Access Control Tests
  // ──────────────────────────────────────────────

  describe("Access Control", function () {
    it("should assign DEFAULT_ADMIN_ROLE to deployer", async function () {
      const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();
      expect(await token.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
    });

    it("should assign CENTRAL_AUTHORITY to deployer", async function () {
      expect(await token.hasRole(CENTRAL_AUTHORITY, admin.address)).to.be.true;
    });

    it("should assign AUTHORIZED_MERCHANT to merchant", async function () {
      expect(await token.hasRole(AUTHORIZED_MERCHANT, merchant.address)).to.be.true;
    });

    it("should prevent non-authority from minting", async function () {
      await expect(
        token.connect(buyer).mint(buyer.address, MINT_AMOUNT)
      ).to.be.reverted;
    });

    it("should prevent non-authority from setting purpose-bound", async function () {
      await expect(
        token.connect(buyer).setPurposeBound(buyer.address, true)
      ).to.be.reverted;
    });
  });

  // ──────────────────────────────────────────────
  //  Token Operations Tests
  // ──────────────────────────────────────────────

  describe("Token Operations", function () {
    it("should mint tokens correctly", async function () {
      expect(await token.balanceOf(buyer.address)).to.equal(MINT_AMOUNT);
    });

    it("should report correct total supply after minting", async function () {
      expect(await token.totalSupply()).to.equal(MINT_AMOUNT);
    });

    it("should have correct name and symbol", async function () {
      expect(await token.name()).to.equal("Purpose-Bound Rupee");
      expect(await token.symbol()).to.equal("PBR");
    });
  });

  // ──────────────────────────────────────────────
  //  Purpose-Bound Transfer Tests
  // ──────────────────────────────────────────────

  describe("Purpose-Bound Transfers", function () {
    beforeEach(async function () {
      await token.setPurposeBound(buyer.address, true);
    });

    it("should allow purpose-bound account to transfer to authorized merchant", async function () {
      const transferAmount = ethers.parseEther("500");
      await expect(
        token.connect(buyer).transfer(merchant.address, transferAmount)
      ).to.not.be.reverted;

      expect(await token.balanceOf(merchant.address)).to.equal(transferAmount);
    });

    it("should block purpose-bound account from transferring to unauthorized address", async function () {
      const transferAmount = ethers.parseEther("500");
      await expect(
        token.connect(buyer).transfer(unauthorized.address, transferAmount)
      ).to.be.revertedWithCustomError(token, "PurposeBoundTransferViolation");
    });

    it("should allow non-purpose-bound account to transfer freely", async function () {
      // Mint to merchant (not purpose-bound)
      await token.mint(merchant.address, ethers.parseEther("1000"));

      await expect(
        token.connect(merchant).transfer(unauthorized.address, ethers.parseEther("100"))
      ).to.not.be.reverted;
    });

    it("should emit PurposeBoundStatusChanged event", async function () {
      await expect(token.setPurposeBound(merchant.address, true))
        .to.emit(token, "PurposeBoundStatusChanged")
        .withArgs(merchant.address, true);
    });

    it("should allow removing purpose-bound status", async function () {
      await token.setPurposeBound(buyer.address, false);

      await expect(
        token.connect(buyer).transfer(unauthorized.address, ethers.parseEther("100"))
      ).to.not.be.reverted;
    });
  });

  // ──────────────────────────────────────────────
  //  Escrow Lifecycle Tests
  // ──────────────────────────────────────────────

  describe("Escrow — Create", function () {
    it("should create an escrow and lock funds", async function () {
      await expect(
        token.connect(buyer).createEscrow(
          merchant.address,
          ESCROW_AMOUNT,
          LOCK_DURATION,
          DELIVERY_PROOF_HASH
        )
      ).to.emit(token, "EscrowCreated");

      // Buyer balance should decrease
      expect(await token.balanceOf(buyer.address)).to.equal(
        MINT_AMOUNT - ESCROW_AMOUNT
      );

      // Contract should hold the escrowed tokens
      expect(await token.balanceOf(await token.getAddress())).to.equal(
        ESCROW_AMOUNT
      );
    });

    it("should store correct escrow details", async function () {
      await token.connect(buyer).createEscrow(
        merchant.address,
        ESCROW_AMOUNT,
        LOCK_DURATION,
        DELIVERY_PROOF_HASH
      );

      const escrow = await token.getEscrow(0);
      expect(escrow.buyer).to.equal(buyer.address);
      expect(escrow.seller).to.equal(merchant.address);
      expect(escrow.amount).to.equal(ESCROW_AMOUNT);
      expect(escrow.isCompleted).to.be.false;
      expect(escrow.isRefunded).to.be.false;
    });

    it("should reject escrow with zero amount", async function () {
      await expect(
        token.connect(buyer).createEscrow(
          merchant.address,
          0,
          LOCK_DURATION,
          DELIVERY_PROOF_HASH
        )
      ).to.be.revertedWithCustomError(token, "EscrowAmountZero");
    });

    it("should reject escrow with unauthorized seller", async function () {
      await expect(
        token.connect(buyer).createEscrow(
          unauthorized.address,
          ESCROW_AMOUNT,
          LOCK_DURATION,
          DELIVERY_PROOF_HASH
        )
      ).to.be.revertedWithCustomError(token, "SellerNotAuthorizedMerchant");
    });

    it("should reject escrow to self", async function () {
      await token.grantRole(AUTHORIZED_MERCHANT, buyer.address);
      await expect(
        token.connect(buyer).createEscrow(
          buyer.address,
          ESCROW_AMOUNT,
          LOCK_DURATION,
          DELIVERY_PROOF_HASH
        )
      ).to.be.revertedWithCustomError(token, "CannotEscrowToSelf");
    });

    it("should increment escrow ID", async function () {
      await token.connect(buyer).createEscrow(
        merchant.address,
        ESCROW_AMOUNT,
        LOCK_DURATION,
        DELIVERY_PROOF_HASH
      );
      await token.connect(buyer).createEscrow(
        merchant.address,
        ESCROW_AMOUNT,
        LOCK_DURATION,
        DELIVERY_PROOF_HASH
      );

      expect(await token.nextEscrowId()).to.equal(2);
    });
  });

  describe("Escrow — Confirm Delivery", function () {
    beforeEach(async function () {
      await token.connect(buyer).createEscrow(
        merchant.address,
        ESCROW_AMOUNT,
        LOCK_DURATION,
        DELIVERY_PROOF_HASH
      );
    });

    it("should release funds to seller on valid proof", async function () {
      await expect(
        token.connect(merchant).confirmDelivery(0, DELIVERY_PROOF)
      ).to.emit(token, "DeliveryConfirmed")
        .withArgs(0, merchant.address, ESCROW_AMOUNT);

      expect(await token.balanceOf(merchant.address)).to.equal(ESCROW_AMOUNT);
    });

    it("should mark escrow as completed", async function () {
      await token.connect(merchant).confirmDelivery(0, DELIVERY_PROOF);

      const escrow = await token.getEscrow(0);
      expect(escrow.isCompleted).to.be.true;
    });

    it("should reject invalid delivery proof", async function () {
      await expect(
        token.connect(merchant).confirmDelivery(0, "WRONG-PROOF")
      ).to.be.revertedWithCustomError(token, "InvalidDeliveryProof");
    });

    it("should reject non-seller caller", async function () {
      await expect(
        token.connect(buyer).confirmDelivery(0, DELIVERY_PROOF)
      ).to.be.revertedWithCustomError(token, "NotEscrowSeller");
    });

    it("should reject confirming already completed escrow", async function () {
      await token.connect(merchant).confirmDelivery(0, DELIVERY_PROOF);

      await expect(
        token.connect(merchant).confirmDelivery(0, DELIVERY_PROOF)
      ).to.be.revertedWithCustomError(token, "EscrowAlreadyCompleted");
    });
  });

  describe("Escrow — Refund", function () {
    beforeEach(async function () {
      await token.connect(buyer).createEscrow(
        merchant.address,
        ESCROW_AMOUNT,
        LOCK_DURATION,
        DELIVERY_PROOF_HASH
      );
    });

    it("should refund buyer after deadline", async function () {
      // Fast-forward past the deadline
      await time.increase(LOCK_DURATION + 1);

      await expect(
        token.connect(buyer).refundEscrow(0)
      ).to.emit(token, "EscrowRefunded")
        .withArgs(0, buyer.address, ESCROW_AMOUNT);

      expect(await token.balanceOf(buyer.address)).to.equal(MINT_AMOUNT);
    });

    it("should reject refund before deadline", async function () {
      await expect(
        token.connect(buyer).refundEscrow(0)
      ).to.be.revertedWithCustomError(token, "EscrowNotExpired");
    });

    it("should reject refund by non-buyer", async function () {
      await time.increase(LOCK_DURATION + 1);

      await expect(
        token.connect(merchant).refundEscrow(0)
      ).to.be.revertedWithCustomError(token, "NotEscrowBuyer");
    });

    it("should reject refund on completed escrow", async function () {
      await token.connect(merchant).confirmDelivery(0, DELIVERY_PROOF);
      await time.increase(LOCK_DURATION + 1);

      await expect(
        token.connect(buyer).refundEscrow(0)
      ).to.be.revertedWithCustomError(token, "EscrowAlreadyCompleted");
    });

    it("should decrement active escrow count on refund", async function () {
      expect(await token.activeEscrowCount()).to.equal(1);

      await time.increase(LOCK_DURATION + 1);
      await token.connect(buyer).refundEscrow(0);

      expect(await token.activeEscrowCount()).to.equal(0);
    });
  });
});

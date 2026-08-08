// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PurposeBoundRupee
 * @author Purpose-Bound Token Platform
 * @notice ERC20 token with programmable compliance for B2B industrial procurement.
 *         Implements purpose-bound transfer restrictions and atomic DvP escrow settlement.
 * @dev Inherits OpenZeppelin v5 contracts: ERC20, Ownable, AccessControl, ReentrancyGuard.
 *      Transfer restrictions are enforced via the `_update` hook (OZ v5 pattern).
 */
contract PurposeBoundRupee is ERC20, Ownable, AccessControl, ReentrancyGuard {
    // ──────────────────────────────────────────────
    //  Role Definitions
    // ──────────────────────────────────────────────

    /// @notice Role for central authority operations (minting, compliance management).
    bytes32 public constant CENTRAL_AUTHORITY = keccak256("CENTRAL_AUTHORITY");

    /// @notice Role for authorized merchants who can receive purpose-bound tokens.
    bytes32 public constant AUTHORIZED_MERCHANT = keccak256("AUTHORIZED_MERCHANT");

    // ──────────────────────────────────────────────
    //  Purpose-Bound State
    // ──────────────────────────────────────────────

    /// @notice Tracks whether an address has purpose-bound restrictions on outgoing transfers.
    mapping(address => bool) public purposeBound;

    // ──────────────────────────────────────────────
    //  Escrow State
    // ──────────────────────────────────────────────

    /// @notice Represents a Delivery vs. Payment escrow agreement.
    struct Escrow {
        address buyer;
        address seller;
        uint256 amount;
        uint256 deadline;
        bytes32 deliveryProofHash;
        bool isCompleted;
        bool isRefunded;
    }

    /// @notice Auto-incrementing escrow ID counter.
    uint256 public nextEscrowId;

    /// @notice Mapping from escrow ID to Escrow struct.
    mapping(uint256 => Escrow) public escrows;

    /// @notice Tracks the number of active (non-completed, non-refunded) escrows.
    uint256 public activeEscrowCount;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────

    /// @notice Emitted when a new DvP escrow is created.
    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 deadline,
        bytes32 deliveryProofHash
    );

    /// @notice Emitted when a seller confirms delivery and funds are released.
    event DeliveryConfirmed(
        uint256 indexed escrowId,
        address indexed seller,
        uint256 amount
    );

    /// @notice Emitted when an expired escrow is refunded to the buyer.
    event EscrowRefunded(
        uint256 indexed escrowId,
        address indexed buyer,
        uint256 amount
    );

    /// @notice Emitted when an account's purpose-bound status changes.
    event PurposeBoundStatusChanged(
        address indexed account,
        bool status
    );

    // ──────────────────────────────────────────────
    //  Errors
    // ──────────────────────────────────────────────

    /// @notice Transfer violates purpose-bound restriction (recipient not an authorized merchant).
    error PurposeBoundTransferViolation(address from, address to);

    /// @notice Escrow seller must hold the AUTHORIZED_MERCHANT role.
    error SellerNotAuthorizedMerchant(address seller);

    /// @notice Escrow amount must be greater than zero.
    error EscrowAmountZero();

    /// @notice Lock duration must be greater than zero.
    error LockDurationZero();

    /// @notice Escrow with the given ID does not exist.
    error EscrowNotFound(uint256 escrowId);

    /// @notice Escrow has already been completed.
    error EscrowAlreadyCompleted(uint256 escrowId);

    /// @notice Escrow has already been refunded.
    error EscrowAlreadyRefunded(uint256 escrowId);

    /// @notice Caller is not the escrow buyer.
    error NotEscrowBuyer(uint256 escrowId, address caller);

    /// @notice Caller is not the escrow seller.
    error NotEscrowSeller(uint256 escrowId, address caller);

    /// @notice Delivery proof does not match the expected hash.
    error InvalidDeliveryProof(uint256 escrowId);

    /// @notice Escrow deadline has not yet passed (refund not available).
    error EscrowNotExpired(uint256 escrowId, uint256 deadline);

    /// @notice Cannot create escrow with self as seller.
    error CannotEscrowToSelf();

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────

    /**
     * @notice Initializes the Purpose-Bound Rupee token.
     * @param initialAdmin Address that receives DEFAULT_ADMIN_ROLE and CENTRAL_AUTHORITY roles.
     */
    constructor(address initialAdmin)
        ERC20("Purpose-Bound Rupee", "PBR")
        Ownable(initialAdmin)
    {
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(CENTRAL_AUTHORITY, initialAdmin);
    }

    // ──────────────────────────────────────────────
    //  Token Operations (Central Authority)
    // ──────────────────────────────────────────────

    /**
     * @notice Mints new tokens to a specified address.
     * @dev Only callable by addresses with the CENTRAL_AUTHORITY role.
     * @param to Recipient address.
     * @param amount Number of tokens to mint (in wei units).
     */
    function mint(address to, uint256 amount) external onlyRole(CENTRAL_AUTHORITY) {
        _mint(to, amount);
    }

    /**
     * @notice Sets or removes purpose-bound restrictions on an account.
     * @dev When purpose-bound, the account can only transfer tokens to AUTHORIZED_MERCHANT addresses.
     * @param account The address to modify.
     * @param status True to enable purpose-bound restrictions, false to disable.
     */
    function setPurposeBound(address account, bool status) external onlyRole(CENTRAL_AUTHORITY) {
        purposeBound[account] = status;
        emit PurposeBoundStatusChanged(account, status);
    }

    // ──────────────────────────────────────────────
    //  Transfer Compliance (Purpose-Bound Override)
    // ──────────────────────────────────────────────

    /**
     * @notice Internal transfer hook enforcing purpose-bound compliance.
     * @dev Overrides OpenZeppelin v5's unified `_update` function.
     *      If the sender has purpose-bound status, the recipient MUST hold
     *      the AUTHORIZED_MERCHANT role. Minting (from=0) and burning (to=0) are exempt.
     * @param from Sender address (address(0) for minting).
     * @param to Recipient address (address(0) for burning).
     * @param value Transfer amount.
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override {
        // Skip compliance check for minting and burning operations
        if (from != address(0) && to != address(0)) {
            // Enforce purpose-bound restriction
            if (purposeBound[from] && !hasRole(AUTHORIZED_MERCHANT, to)) {
                revert PurposeBoundTransferViolation(from, to);
            }
        }

        super._update(from, to, value);
    }

    // ──────────────────────────────────────────────
    //  Escrow Operations (DvP Settlement)
    // ──────────────────────────────────────────────

    /**
     * @notice Creates a new DvP escrow, locking buyer's tokens in the contract.
     * @dev The seller must hold the AUTHORIZED_MERCHANT role. Tokens are transferred
     *      from the buyer to this contract. Uses nonReentrant to prevent reentrancy.
     * @param seller Address of the merchant supplier (must be AUTHORIZED_MERCHANT).
     * @param amount Number of tokens to lock in escrow.
     * @param lockDuration Duration in seconds before the escrow can be refunded.
     * @param deliveryProofHash keccak256 hash of the expected delivery proof string.
     * @return escrowId The ID of the newly created escrow.
     */
    function createEscrow(
        address seller,
        uint256 amount,
        uint256 lockDuration,
        bytes32 deliveryProofHash
    ) external nonReentrant returns (uint256 escrowId) {
        if (amount == 0) revert EscrowAmountZero();
        if (lockDuration == 0) revert LockDurationZero();
        if (seller == msg.sender) revert CannotEscrowToSelf();
        if (!hasRole(AUTHORIZED_MERCHANT, seller)) {
            revert SellerNotAuthorizedMerchant(seller);
        }

        // Transfer tokens from buyer to this contract (escrow custody)
        _transfer(msg.sender, address(this), amount);

        escrowId = nextEscrowId++;
        uint256 deadline = block.timestamp + lockDuration;

        escrows[escrowId] = Escrow({
            buyer: msg.sender,
            seller: seller,
            amount: amount,
            deadline: deadline,
            deliveryProofHash: deliveryProofHash,
            isCompleted: false,
            isRefunded: false
        });

        activeEscrowCount++;

        emit EscrowCreated(
            escrowId,
            msg.sender,
            seller,
            amount,
            deadline,
            deliveryProofHash
        );
    }

    /**
     * @notice Confirms delivery and releases escrowed funds to the seller.
     * @dev Only callable by the designated seller. The provided proof must hash
     *      to match the stored deliveryProofHash. Uses nonReentrant.
     * @param escrowId ID of the escrow to settle.
     * @param deliveryProof The plaintext delivery proof string.
     */
    function confirmDelivery(
        uint256 escrowId,
        string calldata deliveryProof
    ) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];

        if (escrow.buyer == address(0)) revert EscrowNotFound(escrowId);
        if (escrow.isCompleted) revert EscrowAlreadyCompleted(escrowId);
        if (escrow.isRefunded) revert EscrowAlreadyRefunded(escrowId);
        if (msg.sender != escrow.seller) {
            revert NotEscrowSeller(escrowId, msg.sender);
        }
        if (keccak256(abi.encodePacked(deliveryProof)) != escrow.deliveryProofHash) {
            revert InvalidDeliveryProof(escrowId);
        }

        escrow.isCompleted = true;
        activeEscrowCount--;

        // Release funds from contract to seller
        _transfer(address(this), escrow.seller, escrow.amount);

        emit DeliveryConfirmed(escrowId, escrow.seller, escrow.amount);
    }

    /**
     * @notice Refunds escrowed tokens to the buyer after the deadline has passed.
     * @dev Only callable by the buyer. Escrow must be expired and not already settled/refunded.
     *      Uses nonReentrant.
     * @param escrowId ID of the escrow to refund.
     */
    function refundEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];

        if (escrow.buyer == address(0)) revert EscrowNotFound(escrowId);
        if (escrow.isCompleted) revert EscrowAlreadyCompleted(escrowId);
        if (escrow.isRefunded) revert EscrowAlreadyRefunded(escrowId);
        if (msg.sender != escrow.buyer) {
            revert NotEscrowBuyer(escrowId, msg.sender);
        }
        if (block.timestamp < escrow.deadline) {
            revert EscrowNotExpired(escrowId, escrow.deadline);
        }

        escrow.isRefunded = true;
        activeEscrowCount--;

        // Return funds from contract to buyer
        _transfer(address(this), escrow.buyer, escrow.amount);

        emit EscrowRefunded(escrowId, escrow.buyer, escrow.amount);
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    /**
     * @notice Retrieves full details of an escrow by ID.
     * @param escrowId The ID of the escrow to query.
     * @return buyer The buyer's address.
     * @return seller The seller's address.
     * @return amount The escrowed token amount.
     * @return deadline The expiration timestamp.
     * @return deliveryProofHash The expected proof hash.
     * @return isCompleted Whether delivery has been confirmed.
     * @return isRefunded Whether the escrow has been refunded.
     */
    function getEscrow(uint256 escrowId)
        external
        view
        returns (
            address buyer,
            address seller,
            uint256 amount,
            uint256 deadline,
            bytes32 deliveryProofHash,
            bool isCompleted,
            bool isRefunded
        )
    {
        Escrow storage e = escrows[escrowId];
        return (
            e.buyer,
            e.seller,
            e.amount,
            e.deadline,
            e.deliveryProofHash,
            e.isCompleted,
            e.isRefunded
        );
    }

    // ──────────────────────────────────────────────
    //  Override Resolution
    // ──────────────────────────────────────────────

    /**
     * @dev Required override for AccessControl + Ownable supportsInterface collision.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

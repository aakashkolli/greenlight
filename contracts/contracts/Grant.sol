// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Grant
/// @notice Escrow contract for a single crowdfunding campaign.
///         Backers deposit ETH; creator withdraws if goal is met,
///         or backers refund if deadline passes without meeting goal.
contract Grant is ReentrancyGuard {
    // ─── State ────────────────────────────────────────────────────────────────

    address public immutable creator;
    uint256 public immutable goalAmount;
    uint256 public immutable fundingDeadline;

    uint256 public totalDeposited;
    bool public goalReached;
    bool public withdrawn;

    mapping(address => uint256) public contributions;

    // ─── Events ───────────────────────────────────────────────────────────────

    event Deposit(address indexed backer, uint256 amount);
    event Refund(address indexed backer, uint256 amount);
    event CreatorWithdrawal(uint256 amount);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error FundingClosed();
    error GoalAlreadyReached();
    error DeadlineNotPassed();
    error GoalNotReached();
    error NotCreator();
    error NothingToRefund();
    error AlreadyWithdrawn();
    error ZeroValue();

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address _creator, uint256 _goalAmount, uint256 _fundingDeadline) {
        require(_goalAmount > 0, "Goal must be > 0");
        require(_fundingDeadline > block.timestamp, "Deadline must be in future");
        creator = _creator;
        goalAmount = _goalAmount;
        fundingDeadline = _fundingDeadline;
    }

    // ─── Actions ──────────────────────────────────────────────────────────────

    /// @notice Deposit ETH into the escrow.
    function deposit() external payable nonReentrant {
        if (block.timestamp >= fundingDeadline) revert FundingClosed();
        if (goalReached) revert GoalAlreadyReached();
        if (msg.value == 0) revert ZeroValue();

        // Effects
        contributions[msg.sender] += msg.value;
        totalDeposited += msg.value;

        if (totalDeposited >= goalAmount) {
            goalReached = true;
        }

        emit Deposit(msg.sender, msg.value);
    }

    /// @notice Creator withdraws funds after goal is reached.
    function withdraw() external nonReentrant {
        if (msg.sender != creator) revert NotCreator();
        if (!goalReached) revert GoalNotReached();
        if (withdrawn) revert AlreadyWithdrawn();

        // Effects
        withdrawn = true;
        uint256 balance = address(this).balance;

        // Interaction
        (bool ok, ) = creator.call{value: balance}("");
        require(ok, "Transfer failed");

        emit CreatorWithdrawal(balance);
    }

    /// @notice Backer claims a refund after deadline if goal was not met.
    function refund() external nonReentrant {
        if (block.timestamp <= fundingDeadline) revert DeadlineNotPassed();
        if (goalReached) revert GoalAlreadyReached();

        uint256 amount = contributions[msg.sender];
        if (amount == 0) revert NothingToRefund();

        // Effects
        contributions[msg.sender] = 0;

        // Interaction
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "Transfer failed");

        emit Refund(msg.sender, amount);
    }

    // ─── View ─────────────────────────────────────────────────────────────────

    function getContribution(address backer) external view returns (uint256) {
        return contributions[backer];
    }

    function isActive() external view returns (bool) {
        return block.timestamp < fundingDeadline && !goalReached;
    }
}

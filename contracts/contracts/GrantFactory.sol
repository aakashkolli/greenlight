// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Grant.sol";

/// @title GrantFactory
/// @notice Deploys and tracks Grant escrow contracts.
contract GrantFactory {
    // ─── State ────────────────────────────────────────────────────────────────

    uint256 public grantCount;
    mapping(uint256 => address) public grants;

    // ─── Events ───────────────────────────────────────────────────────────────

    event GrantCreated(
        uint256 indexed grantId,
        address indexed grantAddress,
        address indexed creator,
        uint256 goalAmount,
        uint256 fundingDeadline
    );

    // ─── Actions ──────────────────────────────────────────────────────────────

    /// @notice Deploy a new Grant escrow contract.
    /// @param goalAmount  Funding goal in wei.
    /// @param deadline    Unix timestamp for funding deadline.
    /// @return id         Sequential grant ID.
    /// @return grantAddr  Address of deployed Grant contract.
    function createGrant(
        uint256 goalAmount,
        uint256 deadline
    ) external returns (uint256 id, address grantAddr) {
        require(goalAmount > 0, "Goal must be > 0");
        require(deadline > block.timestamp, "Deadline must be in future");

        Grant newGrant = new Grant(msg.sender, goalAmount, deadline);
        grantAddr = address(newGrant);

        grantCount += 1;
        id = grantCount;
        grants[id] = grantAddr;

        emit GrantCreated(id, grantAddr, msg.sender, goalAmount, deadline);
    }

    /// @notice Return all deployed grant addresses.
    function getGrants() external view returns (address[] memory) {
        address[] memory result = new address[](grantCount);
        for (uint256 i = 1; i <= grantCount; i++) {
            result[i - 1] = grants[i];
        }
        return result;
    }
}

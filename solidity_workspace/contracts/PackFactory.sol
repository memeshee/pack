// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Pack.sol";

/// @title PackFactory - deploys and indexes Pack instances
contract PackFactory {
  event PackCreated(
    address indexed pack,
    address indexed creator,
    uint256 goal,
    uint64 deadline,
    uint8 threshold,
    uint8 maxMembers,
    bytes32 metadataHash
  );

  address[] public packs;
  mapping(address => address[]) internal _packsByCreator;

  function createPack(
    uint256 goal,
    uint64 deadline,
    uint8 threshold,
    uint8 maxMembers,
    bytes32 metadataHash
  ) external returns (address pack) {
    pack = address(new Pack(msg.sender, goal, deadline, threshold, maxMembers, metadataHash));
    packs.push(pack);
    _packsByCreator[msg.sender].push(pack);
    emit PackCreated(pack, msg.sender, goal, deadline, threshold, maxMembers, metadataHash);
  }

  function packCount() external view returns (uint256) {
    return packs.length;
  }

  function packAt(uint256 index) external view returns (address) {
    return packs[index];
  }

  function packsByCreator(address creator) external view returns (address[] memory) {
    return _packsByCreator[creator];
  }

  function getPacks(uint256 offset, uint256 limit) external view returns (address[] memory result) {
    uint256 len = packs.length;
    if (offset >= len || limit == 0) {
      return new address[](0);
    }
    uint256 remaining = len - offset;
    uint256 size = limit < remaining ? limit : remaining;
    result = new address[](size);
    for (uint256 i = 0; i < size; ) {
      result[i] = packs[offset + i];
      unchecked {
        ++i;
      }
    }
  }
}

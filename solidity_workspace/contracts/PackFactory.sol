// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Pack.sol";

/// @title PackFactory - deploys, indexes and tracks membership of Pack instances
contract PackFactory is IPackRegistry {
  error NotPack();

  event PackCreated(
    address indexed pack,
    address indexed creator,
    uint256 goal,
    uint64 deadline,
    uint8 threshold,
    uint8 maxMembers,
    string name
  );
  event MemberJoined(address indexed pack, address indexed member);

  address[] public packs;
  mapping(address => bool) public isPack;
  mapping(address => address[]) internal _packsByCreator;
  mapping(address => address[]) internal _packsOfMember;
  mapping(address => mapping(address => bool)) internal _joined;

  function createPack(
    string calldata name,
    string calldata emoji,
    string calldata story,
    uint256 goal,
    uint64 deadline,
    uint8 threshold,
    uint8 maxMembers
  ) external returns (address pack) {
    pack = address(
      new Pack(address(this), msg.sender, name, emoji, story, goal, deadline, threshold, maxMembers)
    );
    isPack[pack] = true;
    packs.push(pack);
    _packsByCreator[msg.sender].push(pack);
    emit PackCreated(pack, msg.sender, goal, deadline, threshold, maxMembers, name);
  }

  function registerMember(address member) external override {
    if (!isPack[msg.sender]) revert NotPack();
    if (!_joined[msg.sender][member]) {
      _joined[msg.sender][member] = true;
      _packsOfMember[member].push(msg.sender);
      emit MemberJoined(msg.sender, member);
    }
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

  function packsOf(address member) external view returns (address[] memory) {
    return _packsOfMember[member];
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

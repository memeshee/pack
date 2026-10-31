// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IPackRegistry {
  function registerMember(address member) external;
}

/// @title Pack - group money pool with threshold-approved payouts (native DOGE)
contract Pack is ReentrancyGuard {
  // ---------- Errors ----------
  error ZeroFactory();
  error ZeroCreator();
  error ZeroGoal();
  error InvalidDeadline();
  error InvalidMaxMembers();
  error InvalidThreshold();
  error InvalidName();
  error InvalidEmoji();
  error InvalidStory();
  error DeadlinePassed();
  error ZeroAmount();
  error PackFull();
  error GoalNotReached();
  error NotMember();
  error InvalidRecipient();
  error InsufficientBalance(uint256 requested, uint256 available);
  error InvalidMemo();
  error ProposalNotFound();
  error AlreadyExecuted();
  error ProposalExpired();
  error AlreadyApproved();
  error ThresholdNotMet(uint8 approvals, uint8 required);
  error NotEnoughMembers();
  error TransferFailed();
  error DeadlineNotPassed();
  error GoalReached();
  error PayoutsMade();
  error NothingToRefund();
  error AlreadyRefunded();

  // ---------- Types ----------
  struct Proposal {
    address payable recipient;
    uint256 amount;
    string memo;
    uint8 approvals;
    bool executed;
    bool exists;
    uint64 createdAt;
    address proposer;
  }

  struct PackSummary {
    address creator;
    uint256 goal;
    uint64 deadline;
    uint8 threshold;
    uint8 maxMembers;
    bytes32 metadataHash;
    uint256 totalContributed;
    uint256 totalPaidOut;
    uint256 totalRefunded;
    uint8 memberCount;
    uint256 proposalCount;
    uint256 balance;
    uint8 status;
    uint64 createdAt;
    uint256 createdBlock;
    string name;
    string emoji;
    string story;
  }

  // ---------- Constants ----------
  uint64 public constant PROPOSAL_TTL = 7 days;
  uint256 private constant MIN_DEADLINE_OFFSET = 1 hours;
  uint256 private constant MAX_DEADLINE_OFFSET = 365 days;
  uint8 private constant MIN_MEMBERS = 2;
  uint8 private constant MAX_MEMBERS = 12;
  uint256 private constant MAX_MEMO_LENGTH = 140;
  uint256 private constant MAX_NAME_LENGTH = 48;
  uint256 private constant MAX_EMOJI_LENGTH = 16;
  uint256 private constant MAX_STORY_LENGTH = 160;

  uint8 public constant STATUS_FUNDING = 0;
  uint8 public constant STATUS_FUNDED = 1;
  uint8 public constant STATUS_PAID_OUT = 2;
  uint8 public constant STATUS_REFUNDABLE = 3;

  // ---------- Immutables ----------
  address public immutable factory;
  address public immutable creator;
  uint256 public immutable goal;
  uint64 public immutable deadline;
  uint8 public immutable threshold;
  uint8 public immutable maxMembers;
  bytes32 public immutable metadataHash;
  uint64 public immutable createdAt;
  uint256 public immutable createdBlock;

  // ---------- Metadata ----------
  string public name;
  string public emoji;
  string public story;

  // ---------- State ----------
  uint256 public totalContributed;
  uint256 public totalPaidOut;
  uint256 public totalRefunded;
  uint8 public memberCount;
  mapping(address => uint256) public contributions;
  mapping(address => bool) public refunded;
  address[] internal _members;
  uint256 public proposalCount;
  mapping(uint256 => Proposal) public proposals;
  mapping(uint256 => mapping(address => bool)) public approvedBy;

  // ---------- Events ----------
  event Contributed(address indexed member, uint256 amount, uint256 totalContributed);
  event ProposalCreated(uint256 indexed id, address indexed proposer, address indexed recipient, uint256 amount, string memo);
  event ProposalApproved(uint256 indexed id, address indexed approver, uint8 approvals);
  event PayoutExecuted(uint256 indexed id, address indexed recipient, uint256 amount);
  event RefundClaimed(address indexed member, uint256 amount);

  // factory_: address, PackFactory (registry) address, 0x5f1E9E3Efd3AC0B5C26fAb83D71bd02295Ca28e4
  // creator_: address, Pack creator address, 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
  // name_: string, Pack name (1..48 bytes), "Weekend Trip"
  // emoji_: string, Pack emoji (1..16 bytes), "🐕"
  // story_: string, Short pack story (0..160 bytes), "Saving for the lake house"
  // goal_: uint256, Funding goal in wei (18 decimals DOGE), 100000000000000000000 = 100 DOGE
  // deadline_: uint64, Funding deadline unix timestamp (>1h and <365d from now), 1767225600
  // threshold_: uint8, Approvals required to execute a payout (2..maxMembers), 2
  // maxMembers_: uint8, Maximum number of members (2..12), 5
  constructor(
    address factory_,
    address creator_,
    string memory name_,
    string memory emoji_,
    string memory story_,
    uint256 goal_,
    uint64 deadline_,
    uint8 threshold_,
    uint8 maxMembers_
  ) {
    if (factory_ == address(0)) revert ZeroFactory();
    if (creator_ == address(0)) revert ZeroCreator();
    if (goal_ == 0) revert ZeroGoal();
    if (
      uint256(deadline_) <= block.timestamp + MIN_DEADLINE_OFFSET ||
      uint256(deadline_) >= block.timestamp + MAX_DEADLINE_OFFSET
    ) revert InvalidDeadline();
    if (maxMembers_ < MIN_MEMBERS || maxMembers_ > MAX_MEMBERS) revert InvalidMaxMembers();
    if (threshold_ < MIN_MEMBERS || threshold_ > maxMembers_) revert InvalidThreshold();
    _validateMetadata(name_, emoji_, story_);

    factory = factory_;
    creator = creator_;
    goal = goal_;
    deadline = deadline_;
    threshold = threshold_;
    maxMembers = maxMembers_;
    metadataHash = keccak256(abi.encode(name_, emoji_, story_));
    createdAt = uint64(block.timestamp);
    createdBlock = block.number;

    name = name_;
    emoji = emoji_;
    story = story_;
  }

  // ---------- Modifiers ----------
  modifier onlyMember() {
    if (contributions[msg.sender] == 0) revert NotMember();
    _;
  }

  // ---------- Mutating ----------
  function contribute() external payable nonReentrant {
    if (block.timestamp > deadline) revert DeadlinePassed();
    if (msg.value == 0) revert ZeroAmount();

    bool isNew = contributions[msg.sender] == 0;
    if (isNew) {
      if (memberCount >= maxMembers) revert PackFull();
      unchecked {
        memberCount++;
      }
      _members.push(msg.sender);
    }

    uint256 previousTotal = totalContributed;
    contributions[msg.sender] += msg.value;
    totalContributed = previousTotal + msg.value;

    // A contribution that crosses the goal needs enough backers to approve a spend,
    // otherwise the pot could never be paid out or refunded. Contributions after the
    // goal is already met are never blocked.
    if (previousTotal < goal && totalContributed >= goal && memberCount < threshold) {
      revert NotEnoughMembers();
    }

    if (isNew) {
      IPackRegistry(factory).registerMember(msg.sender);
    }

    emit Contributed(msg.sender, msg.value, totalContributed);
  }

  function createProposal(
    address payable recipient,
    uint256 amount,
    string calldata memo
  ) external onlyMember returns (uint256 id) {
    if (totalContributed < goal) revert GoalNotReached();
    if (memberCount < threshold) revert NotEnoughMembers();
    if (recipient == address(0) || recipient == address(this)) revert InvalidRecipient();
    if (amount == 0) revert ZeroAmount();
    if (amount > address(this).balance) revert InsufficientBalance(amount, address(this).balance);
    uint256 memoLen = bytes(memo).length;
    if (memoLen == 0 || memoLen > MAX_MEMO_LENGTH) revert InvalidMemo();

    id = proposalCount++;

    Proposal storage p = proposals[id];
    p.recipient = recipient;
    p.amount = amount;
    p.memo = memo;
    p.approvals = 1;
    p.exists = true;
    p.createdAt = uint64(block.timestamp);
    p.proposer = msg.sender;

    approvedBy[id][msg.sender] = true;

    emit ProposalCreated(id, msg.sender, recipient, amount, memo);
    emit ProposalApproved(id, msg.sender, 1);
  }

  function approve(uint256 id) external onlyMember {
    Proposal storage p = _activeProposal(id);
    if (approvedBy[id][msg.sender]) revert AlreadyApproved();

    approvedBy[id][msg.sender] = true;
    unchecked {
      p.approvals++;
    }

    emit ProposalApproved(id, msg.sender, p.approvals);
  }

  function execute(uint256 id) external nonReentrant onlyMember {
    Proposal storage p = _activeProposal(id);
    if (p.approvals < threshold) revert ThresholdNotMet(p.approvals, threshold);
    if (threshold > memberCount) revert NotEnoughMembers();
    uint256 amount = p.amount;
    if (amount > address(this).balance) revert InsufficientBalance(amount, address(this).balance);

    p.executed = true;
    totalPaidOut += amount;

    address payable recipient = p.recipient;
    (bool ok, ) = recipient.call{value: amount}("");
    if (!ok) revert TransferFailed();

    emit PayoutExecuted(id, recipient, amount);
  }

  function claimRefund() external nonReentrant {
    if (block.timestamp <= deadline) revert DeadlineNotPassed();
    // Refundable when the goal was missed OR too few backers exist to ever approve a spend.
    if (totalContributed >= goal && memberCount >= threshold) revert GoalReached();
    if (totalPaidOut != 0) revert PayoutsMade();
    uint256 amt = contributions[msg.sender];
    if (amt == 0) revert NothingToRefund();
    if (refunded[msg.sender]) revert AlreadyRefunded();

    refunded[msg.sender] = true;
    totalRefunded += amt;

    (bool ok, ) = payable(msg.sender).call{value: amt}("");
    if (!ok) revert TransferFailed();

    emit RefundClaimed(msg.sender, amt);
  }

  // ---------- Views ----------
  function balance() external view returns (uint256) {
    return address(this).balance;
  }

  function members() external view returns (address[] memory) {
    return _members;
  }

  function getProposal(uint256 id) external view returns (Proposal memory) {
    return proposals[id];
  }

  function getProposals() external view returns (Proposal[] memory list) {
    uint256 count = proposalCount;
    list = new Proposal[](count);
    for (uint256 i = 0; i < count; ) {
      list[i] = proposals[i];
      unchecked {
        ++i;
      }
    }
  }

  function status() public view returns (uint8) {
    return _status();
  }

  function summary() external view returns (PackSummary memory s) {
    s.creator = creator;
    s.goal = goal;
    s.deadline = deadline;
    s.threshold = threshold;
    s.maxMembers = maxMembers;
    s.metadataHash = metadataHash;
    s.totalContributed = totalContributed;
    s.totalPaidOut = totalPaidOut;
    s.totalRefunded = totalRefunded;
    s.memberCount = memberCount;
    s.proposalCount = proposalCount;
    s.balance = address(this).balance;
    s.status = _status();
    s.createdAt = createdAt;
    s.createdBlock = createdBlock;
    s.name = name;
    s.emoji = emoji;
    s.story = story;
  }

  // ---------- Internal ----------
  function _validateMetadata(
    string memory name_,
    string memory emoji_,
    string memory story_
  ) internal pure {
    uint256 nameLen = bytes(name_).length;
    if (nameLen == 0 || nameLen > MAX_NAME_LENGTH) revert InvalidName();
    uint256 emojiLen = bytes(emoji_).length;
    if (emojiLen == 0 || emojiLen > MAX_EMOJI_LENGTH) revert InvalidEmoji();
    if (bytes(story_).length > MAX_STORY_LENGTH) revert InvalidStory();
  }

  function _status() internal view returns (uint8) {
    if (totalPaidOut > 0) return STATUS_PAID_OUT;
    bool expired = block.timestamp > deadline;
    if (totalContributed >= goal) {
      return (expired && memberCount < threshold) ? STATUS_REFUNDABLE : STATUS_FUNDED;
    }
    return expired ? STATUS_REFUNDABLE : STATUS_FUNDING;
  }

  function _activeProposal(uint256 id) internal view returns (Proposal storage p) {
    p = proposals[id];
    if (!p.exists) revert ProposalNotFound();
    if (p.executed) revert AlreadyExecuted();
    if (block.timestamp > uint256(p.createdAt) + PROPOSAL_TTL) revert ProposalExpired();
  }
}

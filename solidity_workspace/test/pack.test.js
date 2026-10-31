const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const ONE = ethers.parseEther("1");
const NAME = "Weekend Trip";
const EMOJI = "🐕";
const STORY = "Saving for the lake house";

function metaHash(name, emoji, story) {
  return ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(["string", "string", "string"], [name, emoji, story])
  );
}

describe("Pack + PackFactory", function () {
  async function deployFactoryFixture() {
    const [creator, alice, bob, carol, recipient, outsider] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("PackFactory");
    const factory = await Factory.deploy();
    await factory.waitForDeployment();
    return { factory, creator, alice, bob, carol, recipient, outsider };
  }

  async function packFixture() {
    const base = await deployFactoryFixture();
    const { factory, creator } = base;
    const now = await time.latest();
    const deadline = now + 7 * 24 * 3600;
    const goal = ethers.parseEther("10");
    await factory.connect(creator).createPack(NAME, EMOJI, STORY, goal, deadline, 2, 3);
    const addr = await factory.packAt(0);
    const pack = await ethers.getContractAt("Pack", addr);
    return { ...base, pack, goal, deadline };
  }

  async function fundedPackFixture() {
    const base = await packFixture();
    const { pack, creator, alice } = base;
    await pack.connect(creator).contribute({ value: ethers.parseEther("6") });
    await pack.connect(alice).contribute({ value: ethers.parseEther("4") });
    return base;
  }

  it("createPack deploys Pack, emits PackCreated, stores metadata and hash", async function () {
    const { factory, creator } = await loadFixture(deployFactoryFixture);
    const now = await time.latest();
    const deadline = now + 3 * 24 * 3600;
    const goal = ethers.parseEther("5");
    await expect(factory.connect(creator).createPack(NAME, EMOJI, STORY, goal, deadline, 2, 4))
      .to.emit(factory, "PackCreated")
      .withArgs(anyValue, creator.address, goal, deadline, 2, 4, NAME);
    expect(await factory.packCount()).to.equal(1n);
    const addr = await factory.packAt(0);
    expect(await factory.isPack(addr)).to.equal(true);
    expect(await factory.packsByCreator(creator.address)).to.deep.equal([addr]);
    expect(await factory.getPacks(0, 5)).to.deep.equal([addr]);
    const pack = await ethers.getContractAt("Pack", addr);
    expect(await pack.factory()).to.equal(await factory.getAddress());
    expect(await pack.creator()).to.equal(creator.address);
    expect(await pack.name()).to.equal(NAME);
    expect(await pack.emoji()).to.equal(EMOJI);
    expect(await pack.story()).to.equal(STORY);
    expect(await pack.metadataHash()).to.equal(metaHash(NAME, EMOJI, STORY));
    expect(await pack.goal()).to.equal(goal);
    expect(await pack.deadline()).to.equal(BigInt(deadline));
    expect(await pack.threshold()).to.equal(2n);
    expect(await pack.maxMembers()).to.equal(4n);
    expect(await pack.status()).to.equal(0n);
    const s = await pack.summary();
    expect(s.creator).to.equal(creator.address);
    expect(s.metadataHash).to.equal(metaHash(NAME, EMOJI, STORY));
    expect(s.name).to.equal(NAME);
    expect(s.emoji).to.equal(EMOJI);
    expect(s.story).to.equal(STORY);
    expect(s.createdBlock).to.be.gt(0n);
  });

  it("createPack reverts on invalid name/emoji/story and params", async function () {
    const { factory } = await loadFixture(deployFactoryFixture);
    const Pack = await ethers.getContractFactory("Pack");
    const now = await time.latest();
    const dl = now + 2 * 24 * 3600;
    await expect(factory.createPack("", EMOJI, STORY, ONE, dl, 2, 3)).to.be.revertedWithCustomError(Pack, "InvalidName");
    await expect(factory.createPack("x".repeat(49), EMOJI, STORY, ONE, dl, 2, 3)).to.be.revertedWithCustomError(Pack, "InvalidName");
    await expect(factory.createPack(NAME, "", STORY, ONE, dl, 2, 3)).to.be.revertedWithCustomError(Pack, "InvalidEmoji");
    await expect(factory.createPack(NAME, "e".repeat(17), STORY, ONE, dl, 2, 3)).to.be.revertedWithCustomError(Pack, "InvalidEmoji");
    await expect(factory.createPack(NAME, EMOJI, "s".repeat(161), ONE, dl, 2, 3)).to.be.revertedWithCustomError(Pack, "InvalidStory");
    await expect(factory.createPack(NAME, EMOJI, "", ONE, dl, 2, 3)).to.not.be.reverted;
    await expect(factory.createPack(NAME, EMOJI, STORY, 0, dl, 2, 3)).to.be.revertedWithCustomError(Pack, "ZeroGoal");
    await expect(factory.createPack(NAME, EMOJI, STORY, ONE, now + 60, 2, 3)).to.be.revertedWithCustomError(Pack, "InvalidDeadline");
    await expect(factory.createPack(NAME, EMOJI, STORY, ONE, now + 400 * 24 * 3600, 2, 3)).to.be.revertedWithCustomError(Pack, "InvalidDeadline");
    await expect(factory.createPack(NAME, EMOJI, STORY, ONE, dl, 2, 1)).to.be.revertedWithCustomError(Pack, "InvalidMaxMembers");
    await expect(factory.createPack(NAME, EMOJI, STORY, ONE, dl, 2, 13)).to.be.revertedWithCustomError(Pack, "InvalidMaxMembers");
    await expect(factory.createPack(NAME, EMOJI, STORY, ONE, dl, 1, 3)).to.be.revertedWithCustomError(Pack, "InvalidThreshold");
    await expect(factory.createPack(NAME, EMOJI, STORY, ONE, dl, 4, 3)).to.be.revertedWithCustomError(Pack, "InvalidThreshold");
  });

  it("registerMember is only callable by packs", async function () {
    const { factory, outsider, alice } = await loadFixture(packFixture);
    await expect(factory.connect(outsider).registerMember(alice.address))
      .to.be.revertedWithCustomError(factory, "NotPack");
    expect(await factory.packsOf(alice.address)).to.deep.equal([]);
  });

  it("contribute registers member in factory once (no duplicates)", async function () {
    const { factory, pack, alice } = await loadFixture(packFixture);
    const packAddr = await pack.getAddress();
    await expect(pack.connect(alice).contribute({ value: ONE }))
      .to.emit(factory, "MemberJoined").withArgs(packAddr, alice.address)
      .and.to.emit(pack, "Contributed").withArgs(alice.address, ONE, ONE);
    await expect(pack.connect(alice).contribute({ value: ONE }))
      .to.not.emit(factory, "MemberJoined");
    expect(await factory.packsOf(alice.address)).to.deep.equal([packAddr]);
    expect(await pack.memberCount()).to.equal(1n);
    expect(await pack.contributions(alice.address)).to.equal(ONE * 2n);
    expect(await pack.members()).to.deep.equal([alice.address]);
  });

  it("packsOf tracks membership across multiple packs", async function () {
    const { factory, pack, creator, alice, deadline } = await loadFixture(packFixture);
    await factory.createPack("Second", "🎉", "", ethers.parseEther("2"), deadline, 2, 2);
    const second = await ethers.getContractAt("Pack", await factory.packAt(1));
    await pack.connect(alice).contribute({ value: ONE });
    // Two backers are needed to cross the 2 DOGE goal, so the creator chips in first.
    await second.connect(creator).contribute({ value: ONE });
    await second.connect(alice).contribute({ value: ONE });
    expect(await factory.packsOf(alice.address)).to.deep.equal([
      await pack.getAddress(),
      await second.getAddress(),
    ]);
  });

  it("contribute enforces member cap and deadline", async function () {
    const { pack, creator, alice, bob, carol, deadline } = await loadFixture(packFixture);
    await pack.connect(creator).contribute({ value: ONE });
    await pack.connect(alice).contribute({ value: ONE });
    await pack.connect(bob).contribute({ value: ONE });
    await expect(pack.connect(carol).contribute({ value: ONE })).to.be.revertedWithCustomError(pack, "PackFull");
    await pack.connect(bob).contribute({ value: ONE });
    await expect(pack.connect(bob).contribute({ value: 0 })).to.be.revertedWithCustomError(pack, "ZeroAmount");
    await time.increaseTo(deadline + 1);
    await expect(pack.connect(bob).contribute({ value: ONE })).to.be.revertedWithCustomError(pack, "DeadlinePassed");
  });

  it("proposal only allowed after goal is reached and by members", async function () {
    const { pack, creator, alice, recipient, outsider } = await loadFixture(packFixture);
    await pack.connect(creator).contribute({ value: ethers.parseEther("5") });
    await expect(pack.connect(creator).createProposal(recipient.address, ONE, "dinner"))
      .to.be.revertedWithCustomError(pack, "GoalNotReached");
    await pack.connect(alice).contribute({ value: ethers.parseEther("5") });
    expect(await pack.status()).to.equal(1n);
    await expect(pack.connect(outsider).createProposal(recipient.address, ONE, "dinner"))
      .to.be.revertedWithCustomError(pack, "NotMember");
    await expect(pack.connect(creator).createProposal(recipient.address, ONE, ""))
      .to.be.revertedWithCustomError(pack, "InvalidMemo");
    await expect(pack.connect(creator).createProposal(await pack.getAddress(), ONE, "x"))
      .to.be.revertedWithCustomError(pack, "InvalidRecipient");
    await expect(pack.connect(creator).createProposal(recipient.address, ONE, "dinner"))
      .to.emit(pack, "ProposalCreated").withArgs(0n, creator.address, recipient.address, ONE, "dinner")
      .and.to.emit(pack, "ProposalApproved").withArgs(0n, creator.address, 1);
    expect(await pack.proposalCount()).to.equal(1n);
  });

  it("approve works and duplicate approval reverts", async function () {
    const { pack, creator, alice, recipient } = await loadFixture(fundedPackFixture);
    await pack.connect(creator).createProposal(recipient.address, ONE, "rent");
    await expect(pack.connect(creator).approve(0)).to.be.revertedWithCustomError(pack, "AlreadyApproved");
    await expect(pack.connect(alice).approve(0)).to.emit(pack, "ProposalApproved").withArgs(0n, alice.address, 2);
    await expect(pack.connect(alice).approve(0)).to.be.revertedWithCustomError(pack, "AlreadyApproved");
    await expect(pack.connect(alice).approve(5)).to.be.revertedWithCustomError(pack, "ProposalNotFound");
    expect(await pack.approvedBy(0, alice.address)).to.equal(true);
  });

  it("execute below threshold reverts", async function () {
    const { pack, creator, recipient } = await loadFixture(fundedPackFixture);
    await pack.connect(creator).createProposal(recipient.address, ONE, "rent");
    await expect(pack.connect(creator).execute(0))
      .to.be.revertedWithCustomError(pack, "ThresholdNotMet").withArgs(1, 2);
  });

  it("execute happy path pays recipient and blocks re-execution", async function () {
    const { pack, creator, alice, recipient, outsider } = await loadFixture(fundedPackFixture);
    const amt = ethers.parseEther("3");
    await pack.connect(creator).createProposal(recipient.address, amt, "tickets");
    await pack.connect(alice).approve(0);
    await expect(pack.connect(outsider).execute(0)).to.be.revertedWithCustomError(pack, "NotMember");
    const tx = pack.connect(alice).execute(0);
    await expect(tx).to.changeEtherBalances([pack, recipient], [-amt, amt]);
    await expect(tx).to.emit(pack, "PayoutExecuted").withArgs(0n, recipient.address, amt);
    expect(await pack.totalPaidOut()).to.equal(amt);
    expect(await pack.status()).to.equal(2n);
    expect((await pack.getProposal(0)).executed).to.equal(true);
    await expect(pack.connect(alice).execute(0)).to.be.revertedWithCustomError(pack, "AlreadyExecuted");
  });

  it("expired proposal cannot be approved", async function () {
    const { pack, creator, alice, recipient } = await loadFixture(fundedPackFixture);
    await pack.connect(creator).createProposal(recipient.address, ONE, "late");
    await time.increase(7 * 24 * 3600 + 2);
    await expect(pack.connect(alice).approve(0)).to.be.revertedWithCustomError(pack, "ProposalExpired");
  });

  it("getProposals returns all proposals in id order", async function () {
    const { pack, creator, alice, recipient, bob } = await loadFixture(fundedPackFixture);
    expect((await pack.getProposals()).length).to.equal(0);
    await pack.connect(creator).createProposal(recipient.address, ONE, "first");
    await pack.connect(alice).createProposal(bob.address, ONE * 2n, "second");
    await pack.connect(creator).approve(1);
    const list = await pack.getProposals();
    expect(list.length).to.equal(2);
    expect(list[0].memo).to.equal("first");
    expect(list[0].recipient).to.equal(recipient.address);
    expect(list[0].proposer).to.equal(creator.address);
    expect(list[0].approvals).to.equal(1n);
    expect(list[1].memo).to.equal("second");
    expect(list[1].amount).to.equal(ONE * 2n);
    expect(list[1].proposer).to.equal(alice.address);
    expect(list[1].approvals).to.equal(2n);
    expect(list[1].exists).to.equal(true);
  });

  it("refund is exact and cannot be claimed twice", async function () {
    const { pack, creator, alice, outsider, deadline } = await loadFixture(packFixture);
    const amt = ethers.parseEther("3");
    await pack.connect(alice).contribute({ value: amt });
    await pack.connect(creator).contribute({ value: ONE });
    await expect(pack.connect(alice).claimRefund()).to.be.revertedWithCustomError(pack, "DeadlineNotPassed");
    await time.increaseTo(deadline + 1);
    expect(await pack.status()).to.equal(3n);
    const tx = pack.connect(alice).claimRefund();
    await expect(tx).to.changeEtherBalances([pack, alice], [-amt, amt]);
    await expect(tx).to.emit(pack, "RefundClaimed").withArgs(alice.address, amt);
    await expect(pack.connect(alice).claimRefund()).to.be.revertedWithCustomError(pack, "AlreadyRefunded");
    await expect(pack.connect(outsider).claimRefund()).to.be.revertedWithCustomError(pack, "NothingToRefund");
    expect(await pack.totalRefunded()).to.equal(amt);
  });

  it("one wallet cannot cross the goal below threshold", async function () {
    const { pack, creator, alice, goal } = await loadFixture(packFixture);
    await expect(pack.connect(creator).contribute({ value: goal }))
      .to.be.revertedWithCustomError(pack, "NotEnoughMembers");
    // staying below the goal is fine, and the second backer can cross it
    await pack.connect(creator).contribute({ value: goal - 1n });
    await expect(pack.connect(creator).contribute({ value: 1n }))
      .to.be.revertedWithCustomError(pack, "NotEnoughMembers");
    await pack.connect(alice).contribute({ value: 1n });
    expect(await pack.status()).to.equal(1n);
    // contributions after the goal is met are never blocked
    await expect(pack.connect(creator).contribute({ value: ONE })).to.not.be.reverted;
  });

  it("createProposal requires enough backers", async function () {
    const { pack, creator, recipient } = await loadFixture(packFixture);
    // Below the 10 DOGE goal nobody can propose yet.
    await pack.connect(creator).contribute({ value: ONE });
    await expect(pack.connect(creator).createProposal(recipient.address, ONE, "x"))
      .to.be.revertedWithCustomError(pack, "GoalNotReached");
  });

  it("a goal-met pack with too few backers is refundable (threshold 3, 2 backers)", async function () {
    const { factory, creator, alice, bob } = await loadFixture(deployFactoryFixture);
    const now = await time.latest();
    const deadline = now + 7 * 24 * 3600;
    await factory.connect(creator).createPack(NAME, EMOJI, STORY, ethers.parseEther("10"), deadline, 3, 3);
    const pack = await ethers.getContractAt("Pack", await factory.packAt(0));
    await pack.connect(creator).contribute({ value: ethers.parseEther("9") });
    await expect(pack.connect(alice).contribute({ value: ethers.parseEther("1") }))
      .to.be.revertedWithCustomError(pack, "NotEnoughMembers");
    await pack.connect(alice).contribute({ value: ethers.parseEther("0.5") });
    await expect(pack.connect(creator).contribute({ value: ethers.parseEther("1") }))
      .to.be.revertedWithCustomError(pack, "NotEnoughMembers");
    await time.increaseTo(deadline + 1);
    expect(await pack.status()).to.equal(3n);
    const tx = pack.connect(creator).claimRefund();
    await expect(tx).to.changeEtherBalances([pack, creator], [-ethers.parseEther("9"), ethers.parseEther("9")]);
    await expect(pack.connect(alice).claimRefund()).to.emit(pack, "RefundClaimed");
    await expect(pack.connect(bob).claimRefund()).to.be.revertedWithCustomError(pack, "NothingToRefund");
  });

  it("normal 2-of-3 payout end to end", async function () {
    const { pack, creator, alice, bob, recipient } = await loadFixture(packFixture);
    await pack.connect(creator).contribute({ value: ethers.parseEther("4") });
    await pack.connect(alice).contribute({ value: ethers.parseEther("3") });
    await pack.connect(bob).contribute({ value: ethers.parseEther("3") });
    expect(await pack.status()).to.equal(1n);
    const amt = ethers.parseEther("8");
    await pack.connect(bob).createProposal(recipient.address, amt, "venue deposit");
    await pack.connect(alice).approve(0);
    await expect(pack.connect(creator).execute(0)).to.changeEtherBalances([pack, recipient], [-amt, amt]);
    expect(await pack.status()).to.equal(2n);
  });

  it("normal missed-goal refund works exactly once per backer", async function () {
    const { pack, creator, alice, bob, deadline } = await loadFixture(packFixture);
    await pack.connect(creator).contribute({ value: ethers.parseEther("2") });
    await pack.connect(alice).contribute({ value: ethers.parseEther("3") });
    await time.increaseTo(deadline + 1);
    expect(await pack.status()).to.equal(3n);
    await expect(pack.connect(creator).claimRefund()).to.changeEtherBalances([creator], [ethers.parseEther("2")]);
    await expect(pack.connect(creator).claimRefund()).to.be.revertedWithCustomError(pack, "AlreadyRefunded");
    await expect(pack.connect(alice).claimRefund()).to.changeEtherBalances([alice], [ethers.parseEther("3")]);
    await expect(pack.connect(bob).claimRefund()).to.be.revertedWithCustomError(pack, "NothingToRefund");
    expect(await ethers.provider.getBalance(await pack.getAddress())).to.equal(0n);
  });

  it("refund blocked when goal met", async function () {
    const { pack, alice, deadline } = await loadFixture(fundedPackFixture);
    await time.increaseTo(deadline + 1);
    expect(await pack.status()).to.equal(1n);
    await expect(pack.connect(alice).claimRefund()).to.be.revertedWithCustomError(pack, "GoalReached");
  });
});

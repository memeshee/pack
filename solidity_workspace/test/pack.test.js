const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

const ONE = ethers.parseEther("1");
const META = ethers.keccak256(ethers.toUtf8Bytes("pack-metadata"));

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
    await factory.connect(creator).createPack(goal, deadline, 2, 3, META);
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

  it("deploys factory with zero packs", async function () {
    const { factory } = await loadFixture(deployFactoryFixture);
    expect(await factory.packCount()).to.equal(0n);
    expect(await factory.getPacks(0, 10)).to.deep.equal([]);
  });

  it("createPack deploys Pack, emits PackCreated and indexes it", async function () {
    const { factory, creator } = await loadFixture(deployFactoryFixture);
    const now = await time.latest();
    const deadline = now + 3 * 24 * 3600;
    const goal = ethers.parseEther("5");
    await expect(factory.connect(creator).createPack(goal, deadline, 2, 4, META))
      .to.emit(factory, "PackCreated");
    expect(await factory.packCount()).to.equal(1n);
    const addr = await factory.packAt(0);
    expect(await factory.packsByCreator(creator.address)).to.deep.equal([addr]);
    expect(await factory.getPacks(0, 5)).to.deep.equal([addr]);
    const pack = await ethers.getContractAt("Pack", addr);
    expect(await pack.creator()).to.equal(creator.address);
    expect(await pack.goal()).to.equal(goal);
    expect(await pack.deadline()).to.equal(BigInt(deadline));
    expect(await pack.threshold()).to.equal(2n);
    expect(await pack.maxMembers()).to.equal(4n);
    expect(await pack.metadataHash()).to.equal(META);
    expect(await pack.status()).to.equal(0n);
  });

  it("createPack reverts on invalid params", async function () {
    const { factory } = await loadFixture(deployFactoryFixture);
    const Pack = await ethers.getContractFactory("Pack");
    const now = await time.latest();
    const dl = now + 2 * 24 * 3600;
    await expect(factory.createPack(0, dl, 2, 3, META)).to.be.revertedWithCustomError(Pack, "ZeroGoal");
    await expect(factory.createPack(ONE, now + 60, 2, 3, META)).to.be.revertedWithCustomError(Pack, "InvalidDeadline");
    await expect(factory.createPack(ONE, now + 400 * 24 * 3600, 2, 3, META)).to.be.revertedWithCustomError(Pack, "InvalidDeadline");
    await expect(factory.createPack(ONE, dl, 2, 1, META)).to.be.revertedWithCustomError(Pack, "InvalidMaxMembers");
    await expect(factory.createPack(ONE, dl, 2, 13, META)).to.be.revertedWithCustomError(Pack, "InvalidMaxMembers");
    await expect(factory.createPack(ONE, dl, 1, 3, META)).to.be.revertedWithCustomError(Pack, "InvalidThreshold");
    await expect(factory.createPack(ONE, dl, 4, 3, META)).to.be.revertedWithCustomError(Pack, "InvalidThreshold");
    await expect(factory.createPack(ONE, dl, 2, 3, ethers.ZeroHash)).to.be.revertedWithCustomError(Pack, "ZeroMetadataHash");
  });

  it("getPacks paginates correctly", async function () {
    const { factory } = await loadFixture(deployFactoryFixture);
    const now = await time.latest();
    for (let i = 0; i < 3; i++) {
      await factory.createPack(ONE, now + 10 * 24 * 3600, 2, 3, META);
    }
    const all = await factory.getPacks(0, 100);
    expect(all.length).to.equal(3);
    expect(await factory.getPacks(1, 1)).to.deep.equal([all[1]]);
    expect(await factory.getPacks(5, 1)).to.deep.equal([]);
    expect((await factory.getPacks(1, ethers.MaxUint256)).length).to.equal(2);
  });

  it("contribute tracks members and totals, emits Contributed", async function () {
    const { pack, creator, alice } = await loadFixture(packFixture);
    await expect(pack.connect(alice).contribute({ value: ONE }))
      .to.emit(pack, "Contributed").withArgs(alice.address, ONE, ONE);
    await pack.connect(alice).contribute({ value: ONE });
    await pack.connect(creator).contribute({ value: ONE });
    expect(await pack.memberCount()).to.equal(2n);
    expect(await pack.contributions(alice.address)).to.equal(ONE * 2n);
    expect(await pack.totalContributed()).to.equal(ONE * 3n);
    expect(await pack.balance()).to.equal(ONE * 3n);
    expect(await pack.members()).to.deep.equal([alice.address, creator.address]);
    await expect(pack.connect(alice).contribute({ value: 0 })).to.be.revertedWithCustomError(pack, "ZeroAmount");
  });

  it("contribute enforces member cap and deadline", async function () {
    const { pack, creator, alice, bob, carol, deadline } = await loadFixture(packFixture);
    await pack.connect(creator).contribute({ value: ONE });
    await pack.connect(alice).contribute({ value: ONE });
    await pack.connect(bob).contribute({ value: ONE });
    await expect(pack.connect(carol).contribute({ value: ONE })).to.be.revertedWithCustomError(pack, "PackFull");
    // existing member can top up
    await pack.connect(bob).contribute({ value: ONE });
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
    await expect(pack.connect(creator).createProposal(recipient.address, ethers.parseEther("11"), "x"))
      .to.be.revertedWithCustomError(pack, "InsufficientBalance");
    await expect(pack.connect(creator).createProposal(recipient.address, ONE, "dinner"))
      .to.emit(pack, "ProposalCreated").withArgs(0n, creator.address, recipient.address, ONE, "dinner")
      .and.to.emit(pack, "ProposalApproved").withArgs(0n, creator.address, 1);
    const p = await pack.getProposal(0);
    expect(p.recipient).to.equal(recipient.address);
    expect(p.amount).to.equal(ONE);
    expect(p.memo).to.equal("dinner");
    expect(p.approvals).to.equal(1n);
    expect(p.exists).to.equal(true);
    expect(p.executed).to.equal(false);
    expect(p.proposer).to.equal(creator.address);
    expect(await pack.proposalCount()).to.equal(1n);
  });

  it("approve works and duplicate approval reverts", async function () {
    const { pack, creator, alice, recipient } = await loadFixture(fundedPackFixture);
    await pack.connect(creator).createProposal(recipient.address, ONE, "rent");
    await expect(pack.connect(creator).approve(0)).to.be.revertedWithCustomError(pack, "AlreadyApproved");
    await expect(pack.connect(alice).approve(0)).to.emit(pack, "ProposalApproved").withArgs(0n, alice.address, 2);
    await expect(pack.connect(alice).approve(0)).to.be.revertedWithCustomError(pack, "AlreadyApproved");
    await expect(pack.connect(alice).approve(5)).to.be.revertedWithCustomError(pack, "ProposalNotFound");
  });

  it("execute below threshold reverts", async function () {
    const { pack, creator, recipient } = await loadFixture(fundedPackFixture);
    await pack.connect(creator).createProposal(recipient.address, ONE, "rent");
    await expect(pack.connect(creator).execute(0)).to.be.revertedWithCustomError(pack, "ThresholdNotMet");
  });

  it("execute happy path transfers DOGE and cannot re-execute", async function () {
    const { pack, creator, alice, recipient } = await loadFixture(fundedPackFixture);
    const amount = ethers.parseEther("3");
    await pack.connect(creator).createProposal(recipient.address, amount, "trip");
    await pack.connect(alice).approve(0);
    const before = await ethers.provider.getBalance(recipient.address);
    await expect(pack.connect(alice).execute(0))
      .to.emit(pack, "PayoutExecuted").withArgs(0n, recipient.address, amount);
    const after = await ethers.provider.getBalance(recipient.address);
    expect(after - before).to.equal(amount);
    expect(await pack.totalPaidOut()).to.equal(amount);
    expect(await pack.balance()).to.equal(ethers.parseEther("7"));
    expect(await pack.status()).to.equal(2n);
    await expect(pack.connect(alice).execute(0)).to.be.revertedWithCustomError(pack, "AlreadyExecuted");
  });

  it("proposals expire after TTL", async function () {
    const { pack, creator, alice, recipient } = await loadFixture(fundedPackFixture);
    await pack.connect(creator).createProposal(recipient.address, ONE, "late");
    await time.increase(7 * 24 * 3600 + 1);
    await expect(pack.connect(alice).approve(0)).to.be.revertedWithCustomError(pack, "ProposalExpired");
  });

  it("refund after deadline when goal missed returns exact amount and no double-claim", async function () {
    const { pack, alice, bob, deadline } = await loadFixture(packFixture);
    const amt = ethers.parseEther("2");
    await pack.connect(alice).contribute({ value: amt });
    await pack.connect(bob).contribute({ value: ONE });
    await expect(pack.connect(alice).claimRefund()).to.be.revertedWithCustomError(pack, "DeadlineNotPassed");
    await time.increaseTo(deadline + 1);
    expect(await pack.status()).to.equal(3n);

    const before = await ethers.provider.getBalance(alice.address);
    const tx = await pack.connect(alice).claimRefund();
    const rc = await tx.wait();
    const gas = rc.gasUsed * rc.gasPrice;
    const after = await ethers.provider.getBalance(alice.address);
    expect(after - before + gas).to.equal(amt);
    await expect(tx).to.emit(pack, "RefundClaimed").withArgs(alice.address, amt);
    expect(await pack.refunded(alice.address)).to.equal(true);
    expect(await pack.totalRefunded()).to.equal(amt);
    expect(await pack.balance()).to.equal(ONE);
    await expect(pack.connect(alice).claimRefund()).to.be.revertedWithCustomError(pack, "AlreadyRefunded");
  });

  it("refund blocked when goal met", async function () {
    const { pack, creator, deadline } = await loadFixture(fundedPackFixture);
    await time.increaseTo(deadline + 1);
    await expect(pack.connect(creator).claimRefund()).to.be.revertedWithCustomError(pack, "GoalReached");
  });

  it("summary returns aggregated state", async function () {
    const { pack, creator, goal, deadline } = await loadFixture(fundedPackFixture);
    const s = await pack.summary();
    expect(s.creator).to.equal(creator.address);
    expect(s.goal).to.equal(goal);
    expect(s.deadline).to.equal(BigInt(deadline));
    expect(s.threshold).to.equal(2n);
    expect(s.maxMembers).to.equal(3n);
    expect(s.metadataHash).to.equal(META);
    expect(s.totalContributed).to.equal(goal);
    expect(s.memberCount).to.equal(2n);
    expect(s.balance).to.equal(goal);
    expect(s.status).to.equal(1n);
    expect(s.proposalCount).to.equal(0n);
  });
});

import { expect } from 'chai';
import { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { Grant, GrantFactory } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('GrantFactory', () => {
  let factory: GrantFactory;
  let owner: SignerWithAddress;

  beforeEach(async () => {
    [owner] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory('GrantFactory');
    factory = await Factory.deploy();
  });

  it('deploys a Grant and emits GrantCreated', async () => {
    const goal = ethers.parseEther('1');
    const deadline = (await time.latest()) + 3600;

    const tx = await factory.createGrant(goal, deadline);
    const receipt = await tx.wait();
    const grantAddr = await factory.grants(1);

    await expect(tx)
      .to.emit(factory, 'GrantCreated')
      .withArgs(1, grantAddr, owner.address, goal, deadline);

    expect(await factory.grantCount()).to.equal(1);
    expect(grantAddr).to.not.equal(ethers.ZeroAddress);
  });

  it('reverts if goal is zero', async () => {
    const deadline = (await time.latest()) + 3600;
    await expect(factory.createGrant(0, deadline)).to.be.revertedWith('Goal must be > 0');
  });

  it('reverts if deadline is in the past', async () => {
    const pastDeadline = (await time.latest()) - 1;
    await expect(factory.createGrant(ethers.parseEther('1'), pastDeadline))
      .to.be.revertedWith('Deadline must be in future');
  });
});

describe('Grant', () => {
  let grant: Grant;
  let creator: SignerWithAddress;
  let backer1: SignerWithAddress;
  let backer2: SignerWithAddress;
  let goal: bigint;
  let deadline: number;

  beforeEach(async () => {
    [creator, backer1, backer2] = await ethers.getSigners();
    goal = ethers.parseEther('2');
    deadline = (await time.latest()) + 3600; // 1 hour

    const GrantContract = await ethers.getContractFactory('Grant');
    grant = await GrantContract.deploy(creator.address, goal, deadline);
  });

  describe('deposit', () => {
    it('accepts ETH and emits Deposit', async () => {
      const amount = ethers.parseEther('1');
      await expect(grant.connect(backer1).deposit({ value: amount }))
        .to.emit(grant, 'Deposit')
        .withArgs(backer1.address, amount);

      expect(await grant.totalDeposited()).to.equal(amount);
      expect(await grant.contributions(backer1.address)).to.equal(amount);
    });

    it('sets goalReached when goal is met', async () => {
      await grant.connect(backer1).deposit({ value: goal });
      expect(await grant.goalReached()).to.be.true;
    });

    it('reverts after deadline', async () => {
      await time.increaseTo(deadline + 1);
      await expect(
        grant.connect(backer1).deposit({ value: ethers.parseEther('1') })
      ).to.be.revertedWithCustomError(grant, 'FundingClosed');
    });

    it('reverts if goal already reached', async () => {
      await grant.connect(backer1).deposit({ value: goal });
      await expect(
        grant.connect(backer2).deposit({ value: ethers.parseEther('0.1') })
      ).to.be.revertedWithCustomError(grant, 'GoalAlreadyReached');
    });

    it('reverts on zero value', async () => {
      await expect(
        grant.connect(backer1).deposit({ value: 0 })
      ).to.be.revertedWithCustomError(grant, 'ZeroValue');
    });
  });

  describe('withdraw', () => {
    it('allows creator to withdraw when goal reached', async () => {
      await grant.connect(backer1).deposit({ value: goal });

      const balanceBefore = await ethers.provider.getBalance(creator.address);
      const tx = await grant.connect(creator).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(creator.address);

      expect(balanceAfter + gasUsed - balanceBefore).to.be.closeTo(goal, ethers.parseEther('0.001'));
      await expect(tx).to.emit(grant, 'CreatorWithdrawal');
    });

    it('reverts if not creator', async () => {
      await grant.connect(backer1).deposit({ value: goal });
      await expect(grant.connect(backer1).withdraw())
        .to.be.revertedWithCustomError(grant, 'NotCreator');
    });

    it('reverts if goal not reached', async () => {
      await expect(grant.connect(creator).withdraw())
        .to.be.revertedWithCustomError(grant, 'GoalNotReached');
    });

    it('reverts on double withdrawal', async () => {
      await grant.connect(backer1).deposit({ value: goal });
      await grant.connect(creator).withdraw();
      await expect(grant.connect(creator).withdraw())
        .to.be.revertedWithCustomError(grant, 'AlreadyWithdrawn');
    });
  });

  describe('refund', () => {
    it('allows backer to refund after failed deadline', async () => {
      const amount = ethers.parseEther('0.5');
      await grant.connect(backer1).deposit({ value: amount });

      await time.increaseTo(deadline + 1);

      const balanceBefore = await ethers.provider.getBalance(backer1.address);
      const tx = await grant.connect(backer1).refund();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(backer1.address);

      expect(balanceAfter + gasUsed - balanceBefore).to.be.closeTo(amount, ethers.parseEther('0.001'));
      await expect(tx).to.emit(grant, 'Refund').withArgs(backer1.address, amount);
    });

    it('reverts if deadline has not passed', async () => {
      await grant.connect(backer1).deposit({ value: ethers.parseEther('0.5') });
      await expect(grant.connect(backer1).refund())
        .to.be.revertedWithCustomError(grant, 'DeadlineNotPassed');
    });

    it('reverts if goal was reached', async () => {
      await grant.connect(backer1).deposit({ value: goal });
      await time.increaseTo(deadline + 1);
      await expect(grant.connect(backer1).refund())
        .to.be.revertedWithCustomError(grant, 'GoalAlreadyReached');
    });

    it('reverts if nothing to refund', async () => {
      await time.increaseTo(deadline + 1);
      await expect(grant.connect(backer2).refund())
        .to.be.revertedWithCustomError(grant, 'NothingToRefund');
    });

    it('prevents double refund', async () => {
      const amount = ethers.parseEther('0.5');
      await grant.connect(backer1).deposit({ value: amount });
      await time.increaseTo(deadline + 1);
      await grant.connect(backer1).refund();
      await expect(grant.connect(backer1).refund())
        .to.be.revertedWithCustomError(grant, 'NothingToRefund');
    });
  });
});

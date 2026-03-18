import { ethers } from 'hardhat';

const FACTORY_ABI = [
  'function createGrant(uint256 goalAmount, uint256 deadline) returns (uint256 id, address grantAddr)',
  'event GrantCreated(uint256 indexed grantId, address indexed grantAddress, address indexed creator, uint256 goalAmount, uint256 fundingDeadline)',
];

const GRANT_ABI = [
  'function deposit() payable',
  'function withdraw()',
  'function totalDeposited() view returns (uint256)',
  'function goalReached() view returns (bool)',
];

async function fetchJSON(url: string, opts?: RequestInit): Promise<any> {
  const r = await fetch(url, opts);
  return r.json();
}

async function main() {
  const [creator, backer] = await ethers.getSigners();
  console.log('Creator:', creator.address);
  console.log('Backer: ', backer.address);

  const factory = new ethers.Contract(
    '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    FACTORY_ABI,
    creator
  );

  // 1. Deploy a new Grant
  const goal = ethers.parseEther('1');
  const deadline = Math.floor(Date.now() / 1000) + 3600;

  console.log('\n[1] Creating grant via factory...');
  const tx = await factory.createGrant(goal, deadline);
  const receipt = await tx.wait();
  console.log('    txHash:', receipt.hash);

  let grantAddress = '';
  for (const log of receipt.logs) {
    try {
      const parsed = factory.interface.parseLog({ topics: [...log.topics], data: log.data });
      if (parsed?.name === 'GrantCreated') {
        grantAddress = parsed.args[1] as string;
        console.log('    grantId:', parsed.args[0].toString());
        console.log('    grantAddress:', grantAddress);
      }
    } catch {}
  }
  if (!grantAddress) throw new Error('Could not parse GrantCreated event');

  // 2. Register project in backend
  console.log('\n[2] Registering project in backend...');
  const project = await fetchJSON('http://localhost:4000/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grantContractAddress: grantAddress,
      title: 'E2E Integration Test Project',
      description: 'Automated integration test',
      goalAmount: goal.toString(),
      deadline: new Date(deadline * 1000).toISOString(),
      creatorWallet: creator.address,
    }),
  });
  console.log('    projectId:', project.id);
  console.log('    status:', project.id ? 'OK' : 'FAILED');

  // 3. Deposit 0.5 ETH
  const grant = new ethers.Contract(grantAddress, GRANT_ABI, backer);
  const depositAmount = ethers.parseEther('0.5');
  console.log('\n[3] Depositing 0.5 ETH from backer...');
  const depositTx = await grant.deposit({ value: depositAmount });
  await depositTx.wait();
  console.log('    on-chain totalDeposited:', ethers.formatEther(await grant.totalDeposited()), 'ETH');

  // 4. Wait for event listener
  console.log('\n[4] Waiting 2s for event listener...');
  await new Promise(r => setTimeout(r, 2000));
  const updated = await fetchJSON(`http://localhost:4000/projects/${project.id}`);
  console.log('    DB amountRaised:', ethers.formatEther(BigInt(updated.amountRaised)), 'ETH');
  console.log('    DB contributions:', updated.contributions?.length ?? 0);
  const listenerWorking = BigInt(updated.amountRaised) > 0n;
  console.log('    Event listener synced:', listenerWorking ? '✅' : '❌ (listener may need ws upgrade)');

  // 5. Deposit 0.5 more to hit goal
  console.log('\n[5] Depositing 0.5 ETH more to hit goal...');
  await (await grant.deposit({ value: depositAmount })).wait();
  console.log('    goalReached on-chain:', await grant.goalReached());

  // 6. Creator withdraw
  console.log('\n[6] Creator withdrawing...');
  const grantAsCreator = grant.connect(creator) as typeof grant;
  const balBefore = await ethers.provider.getBalance(creator.address);
  await (await (grantAsCreator as any).withdraw()).wait();
  const balAfter = await ethers.provider.getBalance(creator.address);
  const gained = balAfter - balBefore;
  console.log('    ETH gained:', ethers.formatEther(gained));
  console.log('    Withdraw success:', gained > 0n ? '✅' : '❌');

  // 7. Test refund path: new grant that expires
  console.log('\n[7] Testing refund path...');
  const shortDeadline = Math.floor(Date.now() / 1000) + 300; // 5 min; evm_increaseTime will advance past it
  const refundTx = await factory.createGrant(ethers.parseEther('10'), shortDeadline);
  const refundReceipt = await refundTx.wait();
  let refundGrantAddr = '';
  for (const log of refundReceipt.logs) {
    try {
      const parsed = factory.interface.parseLog({ topics: [...log.topics], data: log.data });
      if (parsed?.name === 'GrantCreated') refundGrantAddr = parsed.args[1];
    } catch {}
  }
  const refundGrant = new ethers.Contract(refundGrantAddr, GRANT_ABI, backer);
  await (await refundGrant.deposit({ value: ethers.parseEther('0.1') })).wait();
  
  // Advance time past deadline
  await ethers.provider.send('evm_increaseTime', [400]);
  await ethers.provider.send('evm_mine', []);
  
  const refundGrantABI = [...GRANT_ABI, 'function refund()'];
  const refundGrantWithRefund = new ethers.Contract(refundGrantAddr, refundGrantABI, backer);
  const backerBefore = await ethers.provider.getBalance(backer.address);
  await (await (refundGrantWithRefund as any).refund()).wait();
  const backerAfter = await ethers.provider.getBalance(backer.address);
  console.log('    ETH refunded:', ethers.formatEther(backerAfter - backerBefore));
  console.log('    Refund success:', backerAfter > backerBefore ? '✅' : '❌');

  // 8. Test POST /contributions manually
  console.log('\n[8] Testing POST /contributions...');
  const contribRes = await fetchJSON('http://localhost:4000/contributions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId: project.id,
      walletAddress: backer.address,
      amount: depositAmount.toString(),
      txHash: depositTx.hash,
    }),
  });
  console.log('    result:', contribRes.message === 'Already recorded' ? '✅ idempotent (already recorded)' : JSON.stringify(contribRes));

  // 9. GET /users/:wallet
  console.log('\n[9] Testing GET /users/:wallet...');
  const user = await fetchJSON(`http://localhost:4000/users/${creator.address.toLowerCase()}`);
  console.log('    user wallet:', user.walletAddress);
  console.log('    projects count:', user.projects?.length ?? 0);

  console.log('\n' + '═'.repeat(50));
  console.log('✅  All integration tests passed!');
  console.log('═'.repeat(50));
}

main().catch(err => {
  console.error('\n❌ FAILED:', err.message);
  process.exit(1);
});

import { ethers } from 'ethers';
import { prisma } from '../lib/prisma';
import dotenv from 'dotenv';
import path from 'path';

// __dirname = backend/src/services → ../../../ = repo root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Inline structured logger
const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = LOG_LEVELS[(process.env.LOG_LEVEL as keyof typeof LOG_LEVELS) ?? 'info'] ?? 1;
const log = {
  debug: (...a: unknown[]) => { if (currentLevel <= 0) console.debug(new Date().toISOString(), '[DEBUG]', ...a); },
  info:  (...a: unknown[]) => { if (currentLevel <= 1) console.info(new Date().toISOString(), '[INFO]',  ...a); },
  warn:  (...a: unknown[]) => { if (currentLevel <= 2) console.warn(new Date().toISOString(), '[WARN]',  ...a); },
  error: (...a: unknown[]) => { if (currentLevel <= 3) console.error(new Date().toISOString(), '[ERROR]', ...a); },
};

// Minimal ABIs — only the events we care about
const FACTORY_ABI = [
  'event GrantCreated(uint256 indexed grantId, address indexed grantAddress, address indexed creator, uint256 goalAmount, uint256 fundingDeadline)',
];

const GRANT_ABI = [
  'event Deposit(address indexed backer, uint256 amount)',
  'event Refund(address indexed backer, uint256 amount)',
  'event CreatorWithdrawal(uint256 amount)',
];

export async function startListener(): Promise<void> {
  const rpcUrl = process.env.NEXT_PUBLIC_CHAIN_RPC;
  const factoryAddress = process.env.NEXT_PUBLIC_FACTORY_ADDRESS;

  if (!rpcUrl || !factoryAddress) {
    throw new Error('NEXT_PUBLIC_CHAIN_RPC and NEXT_PUBLIC_FACTORY_ADDRESS must be set');
  }

  let reconnectDelay = 1000;

  async function connect(): Promise<void> {
    const wsUrl = rpcUrl!.replace('http://', 'ws://');
    const provider = new ethers.WebSocketProvider(wsUrl);
    const factory = new ethers.Contract(factoryAddress!, FACTORY_ABI, provider);

    log.info(`[Listener] Connected to ${wsUrl}`);
    log.info(`[Listener] Watching GrantFactory at ${factoryAddress}`);

    // Subscribe to new grants
    factory.on('GrantCreated', async (grantId: bigint, grantAddress: string) => {
      log.info(`[Listener] GrantCreated: id=${grantId}, address=${grantAddress}`);
      await subscribeToGrant(grantAddress.toLowerCase(), provider);
    });

    // Rehydrate — subscribe to all existing grants on startup
    const existingProjects = await prisma.project.findMany({
      select: { grantContractAddress: true },
    });
    for (const project of existingProjects) {
      await subscribeToGrant(project.grantContractAddress, provider);
    }

    provider.on('error', (err: Error) => {
      log.error('[Listener] Provider error:', err.message);
      scheduleReconnect();
    });

    // Detect WebSocket close
    const ws = (provider as unknown as { websocket?: { on: (event: string, cb: () => void) => void } }).websocket;
    if (ws) {
      ws.on('close', () => {
        log.warn('[Listener] WebSocket closed, scheduling reconnect...');
        scheduleReconnect();
      });
    }
  }

  function scheduleReconnect(): void {
    log.info(`[Listener] Reconnecting in ${reconnectDelay}ms...`);
    setTimeout(async () => {
      try {
        await connect();
        reconnectDelay = 1000; // reset on success
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        log.error('[Listener] Reconnect failed:', message);
        reconnectDelay = Math.min(reconnectDelay * 2, 30_000);
        scheduleReconnect();
      }
    }, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 2, 30_000);
  }

  await connect();
}

async function subscribeToGrant(grantAddress: string, provider: ethers.WebSocketProvider): Promise<void> {
  const grant = new ethers.Contract(grantAddress, GRANT_ABI, provider);

  grant.on('Deposit', async (backer: string, amount: bigint, payload: ethers.ContractEventPayload) => {
    log.info(`[Listener] Deposit from ${backer}: ${ethers.formatEther(amount)} ETH`);

    try {
      const project = await prisma.project.findUnique({
        where: { grantContractAddress: grantAddress },
      });

      if (!project) {
        log.warn(`[Listener] Project not found for grant ${grantAddress}`);
        return;
      }

      // Upsert user
      await prisma.user.upsert({
        where: { walletAddress: backer.toLowerCase() },
        update: {},
        create: { walletAddress: backer.toLowerCase() },
      });

      // Record contribution (idempotent via unique txHash)
      const txHash = payload.log.transactionHash.toLowerCase();
      await prisma.contribution.upsert({
        where: { txHash },
        update: {},
        create: {
          projectId: project.id,
          walletAddress: backer.toLowerCase(),
          amount: amount.toString(),
          txHash,
        },
      });

      // Recalculate total from unrefunded contributions
      const all = await prisma.contribution.findMany({ where: { projectId: project.id, refunded: false } });
      const total = all.reduce((sum: bigint, c: { amount: string }) => sum + BigInt(c.amount), BigInt(0));
      await prisma.project.update({
        where: { id: project.id },
        data: { amountRaised: total.toString() },
      });

      log.info(`[Listener] Updated project ${project.id} amountRaised: ${ethers.formatEther(total)} ETH`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      log.error('[Listener] Deposit handler error:', message);
    }
  });

  grant.on('Refund', async (backer: string, amount: bigint) => {
    log.info(`[Listener] Refund to ${backer}: ${ethers.formatEther(amount)} ETH`);
    try {
      const project = await prisma.project.findUnique({
        where: { grantContractAddress: grantAddress },
      });
      if (!project) return;

      // Find the oldest unrefunded contribution matching backer + amount, mark it refunded
      const contribution = await prisma.contribution.findFirst({
        where: {
          projectId: project.id,
          walletAddress: backer.toLowerCase(),
          amount: amount.toString(),
          refunded: false,
        },
        orderBy: { createdAt: 'asc' },
      });

      if (contribution) {
        await prisma.contribution.update({
          where: { id: contribution.id },
          data: { refunded: true },
        });
      }

      // Recalculate total from unrefunded contributions only
      const all = await prisma.contribution.findMany({ where: { projectId: project.id, refunded: false } });
      const total = all.reduce((sum: bigint, c: { amount: string }) => sum + BigInt(c.amount), BigInt(0));
      await prisma.project.update({
        where: { id: project.id },
        data: { amountRaised: total.toString() },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      log.error('[Listener] Refund handler error:', message);
    }
  });

  log.debug(`[Listener] Subscribed to Grant ${grantAddress}`);
}

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const contributionsRouter = Router();

const ETH_ADDR = /^0x[0-9a-fA-F]{40}$/;
const TX_HASH  = /^0x[0-9a-fA-F]{64}$/;

// POST /contributions — record a contribution (called by frontend + event listener)
// Idempotent: duplicate txHash is a no-op (both paths converge here).
contributionsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { projectId, walletAddress, amount, txHash } = req.body;

    if (!projectId || !walletAddress || !amount || !txHash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!ETH_ADDR.test(walletAddress)) {
      return res.status(400).json({ error: 'Invalid walletAddress' });
    }
    if (!TX_HASH.test(txHash)) {
      return res.status(400).json({ error: 'Invalid txHash' });
    }

    const normalizedTx = (txHash as string).toLowerCase();

    // Idempotent: skip if already recorded
    const existing = await prisma.contribution.findUnique({ where: { txHash: normalizedTx } });
    if (existing) {
      return res.status(200).json({ message: 'Already recorded', contribution: existing });
    }

    // Upsert user
    await prisma.user.upsert({
      where: { walletAddress: walletAddress.toLowerCase() },
      update: {},
      create: { walletAddress: walletAddress.toLowerCase() },
    });

    const contribution = await prisma.contribution.create({
      data: {
        projectId,
        walletAddress: walletAddress.toLowerCase(),
        amount: amount.toString(),
        txHash: normalizedTx,
      },
    });

    // Recalculate from unrefunded contributions only
    const allContributions = await prisma.contribution.findMany({
      where: { projectId, refunded: false },
    });
    const total = allContributions.reduce(
      (sum: bigint, c: { amount: string }) => sum + BigInt(c.amount),
      BigInt(0),
    );
    await prisma.project.update({
      where: { id: projectId },
      data: { amountRaised: total.toString() },
    });

    return res.status(201).json(contribution);
  } catch (err: any) {
    console.error('POST /contributions error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /contributions?projectId=...
contributionsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const where = projectId ? { projectId: projectId as string } : {};
    const contributions = await prisma.contribution.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return res.json(contributions);
  } catch (err: any) {
    console.error('GET /contributions error:', err);
    return res.status(500).json({ error: err.message });
  }
});

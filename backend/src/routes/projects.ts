import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const projectsRouter = Router();

const ETH_ADDR = /^0x[0-9a-fA-F]{40}$/;

// POST /projects — create a new project
projectsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      grantContractAddress,
      title,
      description,
      imageUrl,
      goalAmount,
      deadline,
      creatorWallet,
    } = req.body;

    if (!grantContractAddress || !title || !goalAmount || !deadline || !creatorWallet) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!ETH_ADDR.test(grantContractAddress)) {
      return res.status(400).json({ error: 'Invalid grantContractAddress' });
    }
    if (!ETH_ADDR.test(creatorWallet)) {
      return res.status(400).json({ error: 'Invalid creatorWallet' });
    }

    // Upsert the user (wallet-based auth)
    await prisma.user.upsert({
      where: { walletAddress: creatorWallet.toLowerCase() },
      update: {},
      create: { walletAddress: creatorWallet.toLowerCase() },
    });

    const project = await prisma.project.upsert({
      where: { grantContractAddress: grantContractAddress.toLowerCase() },
      update: { title, description: description || '', imageUrl: imageUrl || null },
      create: {
        grantContractAddress: grantContractAddress.toLowerCase(),
        title,
        description: description || '',
        imageUrl: imageUrl || null,
        goalAmount: goalAmount.toString(),
        deadline: new Date(deadline),
        creatorWallet: creatorWallet.toLowerCase(),
      },
    });

    return res.status(201).json(project);
  } catch (err: any) {
    console.error('POST /projects error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /projects — list projects with optional cursor pagination
projectsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const cursor = req.query.cursor as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: { _count: { select: { contributions: true } } },
    });

    const hasMore = projects.length > limit;
    const data = hasMore ? projects.slice(0, limit) : projects;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return res.json({ data, nextCursor });
  } catch (err: any) {
    console.error('GET /projects error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /projects/:id — get project by ID
projectsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        contributions: {
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { contributions: true } },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json(project);
  } catch (err: any) {
    console.error('GET /projects/:id error:', err);
    return res.status(500).json({ error: err.message });
  }
});


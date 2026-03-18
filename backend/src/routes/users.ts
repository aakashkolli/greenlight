import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const usersRouter = Router();

// GET /users/:walletAddress
usersRouter.get('/:walletAddress', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { walletAddress: req.params.walletAddress.toLowerCase() },
      include: {
        projects: true,
        contributions: {
          include: { project: { select: { id: true, title: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (err: any) {
    console.error('GET /users/:walletAddress error:', err);
    return res.status(500).json({ error: err.message });
  }
});

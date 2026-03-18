export interface Contribution {
  id: string;
  walletAddress: string;
  amount: string;
  txHash: string;
  refunded: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  goalAmount: string;
  amountRaised: string;
  deadline: string;
  creatorWallet: string;
  grantContractAddress: string;
  contributions?: Contribution[];
  _count?: { contributions: number };
}

export type ProjectStatus = 'active' | 'funded' | 'expired';

export function getProjectStatus(p: Pick<Project, 'amountRaised' | 'goalAmount' | 'deadline'>): ProjectStatus {
  if (BigInt(p.amountRaised) >= BigInt(p.goalAmount)) return 'funded';
  if (new Date(p.deadline) < new Date()) return 'expired';
  return 'active';
}

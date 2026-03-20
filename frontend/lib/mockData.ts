import { Project } from './types';
import { demoTemplates } from '../../shared/demoData';

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

function milestones(baseDaysFromNow: number, labels: Array<{ title: string; description: string; percent: number }>) {
  return labels.map((label, index) => ({
    ...label,
    dueDate: new Date(now + (baseDaysFromNow + index * 7) * day).toISOString(),
    completed: baseDaysFromNow + index * 7 < 0,
  }));
}

export const mockProjects: Project[] = demoTemplates.map((t) => ({
  id: t.id,
  title: t.title,
  description: t.description,
  imageUrl: t.imageUrl,
  goalAmount: t.goalAmount,
  amountRaised: t.amountRaised,
  deadline: new Date(now + t.deadlineOffsetDays * day).toISOString(),
  creatorWallet: t.creatorWallet,
  grantContractAddress: t.grantContractAddress,
  milestones: milestones(t.milestoneBaseDays, t.milestones),
  contributions: [],
  _count: { contributions: 0 },
}));

export const demoProjectIds = mockProjects.map((project) => project.id);

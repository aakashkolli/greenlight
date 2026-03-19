import { API_BASE } from './contracts';
import { Contribution, Project } from './types';
import { mockProjects } from './mockData';

export interface ProjectListResponse {
  data: Project[];
  nextCursor: string | null;
}

export interface ContributionWithProject {
  id: string;
  amount: string;
  txHash: string;
  refunded: boolean;
  createdAt: string;
  project: { id: string; title: string };
}

export interface UserActivity {
  walletAddress: string;
  projects: Project[];
  contributions: ContributionWithProject[];
}

const PAGE_SIZE = 6;

export const DEMO_MODE = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function getMockProjectList(cursor?: string): ProjectListResponse {
  const startIndex = cursor ? Number(cursor) : 0;
  const endIndex = startIndex + PAGE_SIZE;
  return {
    data: mockProjects.slice(startIndex, endIndex),
    nextCursor: endIndex < mockProjects.length ? String(endIndex) : null,
  };
}

export async function listProjects(cursor?: string): Promise<ProjectListResponse> {
  if (DEMO_MODE || !API_BASE) return getMockProjectList(cursor);
  try {
    const url = cursor ? `${API_BASE}/projects?cursor=${cursor}` : `${API_BASE}/projects`;
    return await fetchJson<ProjectListResponse>(url);
  } catch {
    return getMockProjectList(cursor);
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  if (DEMO_MODE || !API_BASE) {
    return mockProjects.find((project) => project.id === id) ?? null;
  }
  try {
    return await fetchJson<Project>(`${API_BASE}/projects/${id}`);
  } catch {
    return mockProjects.find((project) => project.id === id) ?? null;
  }
}

function projectContributions(project: Project): Contribution[] {
  return project.contributions ?? [];
}

function toContributionWithProject(project: Project, contribution: Contribution): ContributionWithProject {
  return {
    id: contribution.id,
    amount: contribution.amount,
    txHash: contribution.txHash,
    refunded: contribution.refunded,
    createdAt: contribution.createdAt,
    project: { id: project.id, title: project.title },
  };
}

function getMockActivity(walletAddress: string): UserActivity {
  const normalized = walletAddress.toLowerCase();
  const projects = mockProjects.filter((project) => project.creatorWallet.toLowerCase() === normalized);
  const contributions = mockProjects
    .flatMap((project) => projectContributions(project).map((c) => toContributionWithProject(project, c)))
    .filter((item) => item.project.id && item.id)
    .filter((item) => {
      const sourceProject = mockProjects.find((project) => project.id === item.project.id);
      if (!sourceProject) return false;
      const sourceContribution = projectContributions(sourceProject).find((c) => c.id === item.id);
      return sourceContribution?.walletAddress.toLowerCase() === normalized;
    });

  return { walletAddress, projects, contributions };
}

export async function getUserActivity(walletAddress: string): Promise<UserActivity | null> {
  if (DEMO_MODE || !API_BASE) return getMockActivity(walletAddress);
  try {
    return await fetchJson<UserActivity>(`${API_BASE}/users/${walletAddress}`);
  } catch {
    return getMockActivity(walletAddress);
  }
}

import { Project } from './types';

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

export const mockProjects: Project[] = [
  {
    id: 'demo-solar-school',
    title: 'Solar Classrooms for Rural Schools',
    description:
      'Install solar micro-grids for five schools to keep classes running after sunset and power low-cost tablets for students.',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80&auto=format&fit=crop',
    goalAmount: '3500000000000000000',
    amountRaised: '2780000000000000000',
    deadline: new Date(now + 9 * day).toISOString(),
    creatorWallet: '0x4d5a6b7c8d9e0f1234567890abcdef1234567890',
    grantContractAddress: '0x1111111111111111111111111111111111111111',
    contributions: [
      {
        id: 'c-1',
        walletAddress: '0x9a8b7c6d5e4f32100112233445566778899aabbc',
        amount: '420000000000000000',
        txHash: '0xabc1000000000000000000000000000000000000000000000000000000000001',
        refunded: false,
        createdAt: new Date(now - 2 * day).toISOString(),
      },
      {
        id: 'c-2',
        walletAddress: '0x7f6e5d4c3b2a1099887766554433221100ffeedd',
        amount: '860000000000000000',
        txHash: '0xabc2000000000000000000000000000000000000000000000000000000000002',
        refunded: false,
        createdAt: new Date(now - day).toISOString(),
      },
    ],
    _count: { contributions: 9 },
  },
  {
    id: 'demo-open-clinic',
    title: 'Open-Source Neighborhood Clinic',
    description:
      'Fund equipment and first-year operations for a community-run clinic with transparent spending and open governance updates.',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&q=80&auto=format&fit=crop',
    goalAmount: '5000000000000000000',
    amountRaised: '5000000000000000000',
    deadline: new Date(now - 2 * day).toISOString(),
    creatorWallet: '0x66aa77889900bbccddeeff001122334455667788',
    grantContractAddress: '0x2222222222222222222222222222222222222222',
    contributions: [
      {
        id: 'c-3',
        walletAddress: '0x9a8b7c6d5e4f32100112233445566778899aabbc',
        amount: '1000000000000000000',
        txHash: '0xabc3000000000000000000000000000000000000000000000000000000000003',
        refunded: false,
        createdAt: new Date(now - 8 * day).toISOString(),
      },
    ],
    _count: { contributions: 17 },
  },
  {
    id: 'demo-bike-stations',
    title: 'Community Bike Repair & Share Stations',
    description:
      'Fund and install five self-service bike repair kiosks in underserved neighborhoods, each stocked with tools, pumps, and a QR-code map for local cyclists.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80&auto=format&fit=crop',
    goalAmount: '1800000000000000000',
    amountRaised: '740000000000000000',
    deadline: new Date(now - day).toISOString(),
    creatorWallet: '0x1234567890abcdef1234567890abcdef12345678',
    grantContractAddress: '0x3333333333333333333333333333333333333333',
    contributions: [
      {
        id: 'c-4',
        walletAddress: '0x4444555566667777888899990000aaaabbbbcccc',
        amount: '250000000000000000',
        txHash: '0xabc4000000000000000000000000000000000000000000000000000000000004',
        refunded: true,
        createdAt: new Date(now - 6 * day).toISOString(),
      },
    ],
    _count: { contributions: 6 },
  },
];

export const demoProjectIds = mockProjects.map((project) => project.id);

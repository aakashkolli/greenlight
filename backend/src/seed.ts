import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

// Hardhat deterministic accounts
const CREATOR = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'; // account #0
const BACKER1 = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'; // account #1
const BACKER2 = '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc'; // account #2

// Stable Unsplash photo CDN URLs - no API key required
const IMGS = {
  privacy:  'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=400&fit=crop&q=80',
  climate:  'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=400&fit=crop&q=80',
  legal:    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=400&fit=crop&q=80',
  edu:      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop&q=80',
  health:   'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=400&fit=crop&q=80',
  defi:     'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop&q=80',
  infra:    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop&q=80',
  science:  'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&h=400&fit=crop&q=80',
  media:    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop&q=80',
};

const eth = (n: number) => (BigInt(Math.round(n * 1e4)) * 10n ** 14n).toString();
const days = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

const projects = [
  {
    grantContractAddress: '0x0000000000000000000000000000000000000001',
    title: 'Open Source Privacy Shield',
    description:
      'A free browser extension that blocks third-party trackers, fingerprinting scripts, and ad surveillance - built for journalists, activists, and anyone who values their privacy online. All code is open source and auditable.',
    imageUrl: IMGS.privacy,
    goalAmount: eth(2),
    deadline: days(30),
    creatorWallet: CREATOR,
    amountRaised: eth(0.5),
  },
  {
    grantContractAddress: '0x0000000000000000000000000000000000000002',
    title: 'Decentralized Climate Data Registry',
    description:
      'An on-chain registry for verified climate sensor data submitted by certified research stations worldwide. Data is immutable, publicly accessible, and tamper-proof - enabling better climate models and transparent environmental reporting.',
    imageUrl: IMGS.climate,
    goalAmount: eth(5),
    deadline: days(60),
    creatorWallet: CREATOR,
    amountRaised: eth(3),
  },
  {
    grantContractAddress: '0x0000000000000000000000000000000000000003',
    title: 'Community Legal Aid Platform',
    description:
      'AI-assisted legal document drafting for underserved communities who cannot afford legal counsel. Users describe their situation in plain language and receive jurisdiction-specific document templates, intake checklists, and referrals to pro-bono services.',
    imageUrl: IMGS.legal,
    goalAmount: eth(1),
    deadline: days(14),
    creatorWallet: CREATOR,
    amountRaised: eth(1), // fully funded
  },
  {
    grantContractAddress: '0x0000000000000000000000000000000000000004',
    title: 'Peer-to-Peer Tutoring Network',
    description:
      'A decentralized marketplace connecting students in underserved regions with volunteer tutors globally. Smart contracts escrow session fees and release payment only after session confirmation - ensuring fair compensation and accountability on both sides.',
    imageUrl: IMGS.edu,
    goalAmount: eth(3),
    deadline: days(45),
    creatorWallet: CREATOR,
    amountRaised: eth(0.8),
  },
  {
    grantContractAddress: '0x0000000000000000000000000000000000000005',
    title: 'Open Medical Records Protocol',
    description:
      'A patient-controlled health data standard that lets individuals share verified medical records with any provider or researcher - without lock-in to any hospital system. Built on EIP-712 signed attestations with selective disclosure.',
    imageUrl: IMGS.health,
    goalAmount: eth(8),
    deadline: days(90),
    creatorWallet: CREATOR,
    amountRaised: eth(1.2),
  },
  {
    grantContractAddress: '0x0000000000000000000000000000000000000006',
    title: 'DeFi Yield Transparency Dashboard',
    description:
      'A real-time, open-source dashboard that aggregates APY data, impermanent loss metrics, and protocol risk scores across 50+ DeFi protocols. All calculations are reproducible and published on-chain for independent verification.',
    imageUrl: IMGS.defi,
    goalAmount: eth(1.5),
    deadline: days(21),
    creatorWallet: CREATOR,
    amountRaised: eth(1.5), // fully funded
  },
  {
    grantContractAddress: '0x0000000000000000000000000000000000000007',
    title: 'Decentralized Node Infrastructure Grant',
    description:
      'Fund distributed RPC node infrastructure across three continents to reduce Ethereum network latency and single-point-of-failure risk for public dApp users. All nodes publish uptime and performance metrics on-chain.',
    imageUrl: IMGS.infra,
    goalAmount: eth(6),
    deadline: days(75),
    creatorWallet: CREATOR,
    amountRaised: eth(2.1),
  },
  {
    grantContractAddress: '0x0000000000000000000000000000000000000008',
    title: 'Citizen Science Protocol',
    description:
      'An incentive layer for distributed scientific research - participants contribute compute, data collection, or peer review, and are rewarded with on-chain tokens proportional to verified contributions. First use case: air quality monitoring.',
    imageUrl: IMGS.science,
    goalAmount: eth(4),
    deadline: days(50),
    creatorWallet: CREATOR,
    amountRaised: eth(0.3),
  },
  {
    grantContractAddress: '0x0000000000000000000000000000000000000009',
    title: 'Open-Source Journalism Fund',
    description:
      'A milestone-based grant pool for independent journalists covering underreported stories. Each funding tranche is released only after an editorial committee confirms publication of the agreed deliverable, creating accountability without censorship.',
    imageUrl: IMGS.media,
    goalAmount: eth(2.5),
    deadline: days(-5), // expired - demonstrates closed state
    creatorWallet: CREATOR,
    amountRaised: eth(1.8),
  },
];

async function main() {
  console.log('Seeding database...\n');

  for (const wallet of [CREATOR, BACKER1, BACKER2]) {
    await prisma.user.upsert({
      where: { walletAddress: wallet },
      update: {},
      create: { walletAddress: wallet },
    });
  }

  for (const p of projects) {
    const project = await prisma.project.upsert({
      where: { grantContractAddress: p.grantContractAddress },
      update: { amountRaised: p.amountRaised, imageUrl: p.imageUrl, description: p.description },
      create: p,
    });
    console.log(`  ✓ ${project.title}`);
  }

  console.log('\nSeed complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

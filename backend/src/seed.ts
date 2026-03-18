import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

// Hardhat deterministic accounts
const CREATOR = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'; // account #0
const BACKER1 = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'; // account #1
const BACKER2 = '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc'; // account #2

// Stable Unsplash photo CDN URLs — no API key required
const IMGS = {
  privacy:  'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=400&fit=crop&q=80',
  climate:  'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=400&fit=crop&q=80',
  legal:    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=400&fit=crop&q=80',
  edu:      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop&q=80',
  health:   'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=400&fit=crop&q=80',
};

const eth = (n: number) => (BigInt(Math.round(n * 1e4)) * 10n ** 14n).toString();

const projects = [
  {
    grantContractAddress: '0x0000000000000000000000000000000000000001',
    title: 'Open Source Privacy Shield',
    description:
      'A free browser extension that blocks third-party trackers, fingerprinting scripts, and ad surveillance — built for journalists, activists, and anyone who values their privacy online. All code is open source and auditable.',
    imageUrl: IMGS.privacy,
    goalAmount: eth(2),
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    creatorWallet: CREATOR,
    amountRaised: eth(0.5),
  },
  {
    grantContractAddress: '0x0000000000000000000000000000000000000002',
    title: 'Decentralized Climate Data Registry',
    description:
      'An on-chain registry for verified climate sensor data submitted by certified research stations worldwide. Data is immutable, publicly accessible, and tamper-proof — enabling better climate models and transparent environmental reporting.',
    imageUrl: IMGS.climate,
    goalAmount: eth(5),
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
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
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    creatorWallet: CREATOR,
    amountRaised: eth(1), // fully funded
  },
  {
    grantContractAddress: '0x0000000000000000000000000000000000000004',
    title: 'Peer-to-Peer Tutoring Network',
    description:
      'A decentralized marketplace connecting students in underserved regions with volunteer tutors globally. Smart contracts escrow session fees and release payment only after session confirmation — ensuring fair compensation and accountability on both sides.',
    imageUrl: IMGS.edu,
    goalAmount: eth(3),
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    creatorWallet: CREATOR,
    amountRaised: eth(0.8),
  },
  {
    grantContractAddress: '0x0000000000000000000000000000000000000005',
    title: 'Open Medical Records Protocol',
    description:
      'A patient-controlled health data standard that lets individuals share verified medical records with any provider or researcher — without lock-in to any hospital system. Built on EIP-712 signed attestations with selective disclosure.',
    imageUrl: IMGS.health,
    goalAmount: eth(8),
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    creatorWallet: CREATOR,
    amountRaised: eth(1.2),
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

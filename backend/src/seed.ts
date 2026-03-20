import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { demoTemplates } from '../../shared/demoData';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

// Hardhat deterministic accounts
const CREATOR = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'; // account #0
const BACKER1 = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'; // account #1
const BACKER2 = '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc'; // account #2

const eth = (n: number) => (BigInt(Math.round(n * 1e4)) * 10n ** 14n).toString();
const days = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

// Map shared templates into DB-ready objects
const projects = demoTemplates.map((t, i) => ({
  grantContractAddress: t.grantContractAddress,
  title: t.title,
  description: t.description,
  imageUrl: t.imageUrl || null,
  goalAmount: t.goalAmount,
  deadline: days(t.deadlineOffsetDays),
  creatorWallet: CREATOR,
  amountRaised: t.amountRaised,
}));
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

import { Project } from './types';

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

function milestones(baseDaysFromNow: number, labels: Array<{ title: string; description: string; tranchePercent: number }>) {
  return labels.map((label, index) => ({
    ...label,
    dueDate: new Date(now + (baseDaysFromNow + index * 7) * day).toISOString(),
    completed: baseDaysFromNow + index * 7 < 0,
  }));
}

export const mockProjects: Project[] = [
  {
    id: 'demo-solar-school',
    title: 'Solar Classrooms for Rural Schools',
    description:
      'Install solar micro-grids for five schools to keep classes running after sunset and power low-cost tablets for students.',
    // Appropriate Unsplash placeholder for solar school
    imageUrl: 'https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?w=1200&q=80&auto=format&fit=crop',
    goalAmount: '3500000000000000000',
    amountRaised: '2780000000000000000',
    deadline: new Date(now + 9 * day).toISOString(),
    creatorWallet: '0x4d5a6b7c8d9e0f1234567890abcdef1234567890',
    grantContractAddress: '0x1111111111111111111111111111111111111111',
    milestones: milestones(-7, [
      { title: 'Site Survey + Permits', description: 'Finalize school sites, permitting, and electrical safety approvals.', tranchePercent: 30 },
      { title: 'Hardware Installation', description: 'Install panels, inverters, and battery systems at all 5 schools.', tranchePercent: 45 },
      { title: 'Training + Handover', description: 'Train local operators and publish maintenance docs to the public repo.', tranchePercent: 25 },
    ]),
    contributions: [],
    _count: { contributions: 9 },
  },
  {
    id: 'demo-open-clinic',
    title: 'Open-Source Neighborhood Clinic',
    description:
      'Fund equipment and first-year operations for a community-run clinic with transparent spending and open governance updates.',
    // Appropriate Unsplash placeholder for open clinic
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80&auto=format&fit=crop',
    goalAmount: '5000000000000000000',
    amountRaised: '5000000000000000000',
    deadline: new Date(now - 2 * day).toISOString(),
    creatorWallet: '0x66aa77889900bbccddeeff001122334455667788',
    grantContractAddress: '0x2222222222222222222222222222222222222222',
    milestones: milestones(-28, [
      { title: 'Facility Buildout', description: 'Renovate clinic space and install baseline medical equipment.', tranchePercent: 40 },
      { title: 'Clinical Launch', description: 'Begin patient intake with volunteer clinicians and open scheduling.', tranchePercent: 35 },
      { title: 'Transparency Report', description: 'Publish first-quarter budget, patient volume, and outcomes report.', tranchePercent: 25 },
    ]),
    contributions: [],
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
    deadline: new Date(now - 1 * day).toISOString(),
    creatorWallet: '0x1234567890abcdef1234567890abcdef12345678',
    grantContractAddress: '0x3333333333333333333333333333333333333333',
    milestones: milestones(-10, [
      { title: 'Permit + Vendor Lock', description: 'Secure city permits and kiosk hardware procurement contracts.', tranchePercent: 30 },
      { title: 'Station Deployment', description: 'Install five repair stations with sensors and inventory tags.', tranchePercent: 45 },
      { title: 'Community Ops Onboarding', description: 'Train local volunteers and publish service uptime dashboard.', tranchePercent: 25 },
    ]),
    contributions: [],
    _count: { contributions: 6 },
  },
  {
    id: 'demo-privacy-shield',
    title: 'Open Source Privacy Shield',
    description:
      'A free browser extension that blocks third-party trackers, fingerprinting scripts, and ad surveillance — built for journalists, activists, and anyone who values their privacy online.',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=400&fit=crop&q=80',
    goalAmount: '2000000000000000000',
    amountRaised: '500000000000000000',
    deadline: new Date(now + 30 * day).toISOString(),
    creatorWallet: '0xabcdef1234567890abcdef1234567890abcdef12',
    grantContractAddress: '0x4444444444444444444444444444444444444444',
    milestones: milestones(5, [
      { title: 'Threat Model + Audit', description: 'Complete extension threat model and third-party code audit.', tranchePercent: 35 },
      { title: 'Cross-Browser Release', description: 'Ship stable builds for Chromium and Firefox with telemetry-off defaults.', tranchePercent: 40 },
      { title: 'Public Research Pack', description: 'Publish benchmark methodology and reproducible tracker-block reports.', tranchePercent: 25 },
    ]),
    contributions: [],
    _count: { contributions: 4 },
  },
  {
    id: 'demo-climate-registry',
    title: 'Decentralized Climate Data Registry',
    description:
      'An on-chain registry for verified climate sensor data submitted by certified research stations worldwide. Data is immutable, publicly accessible, and tamper-proof.',
    imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=400&fit=crop&q=80',
    goalAmount: '5000000000000000000',
    amountRaised: '3000000000000000000',
    deadline: new Date(now + 60 * day).toISOString(),
    creatorWallet: '0x9876543210fedcba9876543210fedcba98765432',
    grantContractAddress: '0x5555555555555555555555555555555555555555',
    milestones: milestones(12, [
      { title: 'Validator Partnerships', description: 'Onboard accredited climate research partners and verification schema.', tranchePercent: 30 },
      { title: 'Registry Mainnet Pilot', description: 'Deploy immutable registry contracts and indexer APIs.', tranchePercent: 45 },
      { title: 'Open Data Rollout', description: 'Launch query portal and publish governance handoff process.', tranchePercent: 25 },
    ]),
    contributions: [],
    _count: { contributions: 22 },
  },
  {
    id: 'demo-p2p-tutoring',
    title: 'Peer-to-Peer Tutoring Network',
    description:
      'A decentralized marketplace connecting students in underserved regions with volunteer tutors globally. Smart contracts escrow session fees and release payment only after session confirmation.',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop&q=80',
    goalAmount: '3000000000000000000',
    amountRaised: '800000000000000000',
    deadline: new Date(now + 45 * day).toISOString(),
    creatorWallet: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    grantContractAddress: '0x6666666666666666666666666666666666666666',
    milestones: milestones(8, [
      { title: 'Tutor Onboarding', description: 'Vet volunteer tutors and create subject-level quality rubrics.', tranchePercent: 30 },
      { title: 'Escrow Session Engine', description: 'Launch milestone escrow for tutoring sessions and dispute windows.', tranchePercent: 45 },
      { title: 'Regional Expansion', description: 'Open operations in 3 additional regions with local partners.', tranchePercent: 25 },
    ]),
    contributions: [],
    _count: { contributions: 11 },
  },
  {
    id: 'demo-disaster-mesh',
    title: 'Disaster-Response Mesh Network Kits',
    description:
      'Pre-position portable mesh networking kits for wildfire and flood zones so emergency teams can maintain connectivity when cellular infrastructure fails.',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=400&fit=crop&q=80',
    goalAmount: '3200000000000000000',
    amountRaised: '1910000000000000000',
    deadline: new Date(now + 26 * day).toISOString(),
    creatorWallet: '0xfedcba9876543210fedcba9876543210fedcba98',
    grantContractAddress: '0x7777777777777777777777777777777777777777',
    milestones: milestones(3, [
      { title: 'Kit Procurement', description: 'Purchase radios, battery packs, and hardened transport cases.', tranchePercent: 35 },
      { title: 'Field Deployment', description: 'Install and test mesh coverage corridors across priority counties.', tranchePercent: 40 },
      { title: 'Responder Training', description: 'Run drills and certify local teams on emergency communications runbooks.', tranchePercent: 25 },
    ]),
    contributions: [],
    _count: { contributions: 19 },
  },
  {
    id: 'demo-water-sensors',
    title: 'Open River Water Quality Sensor Grid',
    description:
      'Deploy low-cost open-hardware sensors across regional waterways and publish tamper-evident contaminant readings for communities and local labs.',
    imageUrl: 'https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=800&h=400&fit=crop&q=80',
    goalAmount: '4100000000000000000',
    amountRaised: '1260000000000000000',
    deadline: new Date(now + 64 * day).toISOString(),
    creatorWallet: '0x0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
    grantContractAddress: '0x8888888888888888888888888888888888888888',
    milestones: milestones(11, [
      { title: 'Sensor Build Batch', description: 'Assemble and calibrate first 40 sensor units in open labs.', tranchePercent: 30 },
      { title: 'Network Installation', description: 'Install stations on river segments and complete data pipeline setup.', tranchePercent: 45 },
      { title: 'Public Data Portal', description: 'Launch open API and dashboard with historical trend exports.', tranchePercent: 25 },
    ]),
    contributions: [],
    _count: { contributions: 7 },
  },
  {
    id: 'demo-journalism-fund',
    title: 'Open-Source Journalism Fund',
    description:
      'A milestone-based grant pool for independent journalists covering underreported stories. Each tranche releases only after editorial confirmation of publication.',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop&q=80',
    goalAmount: '2500000000000000000',
    amountRaised: '1800000000000000000',
    deadline: new Date(now - 5 * day).toISOString(),
    creatorWallet: '0xc0ffee1234567890abcdef1234567890abcdef12',
    grantContractAddress: '0x9999999999999999999999999999999999999999',
    milestones: milestones(-14, [
      { title: 'Editorial Vetting Pool', description: 'Onboard independent editors and anti-disinformation reviewers.', tranchePercent: 30 },
      { title: 'Publication Grants', description: 'Release milestone grants to vetted investigations.', tranchePercent: 45 },
      { title: 'Impact Ledger', description: 'Publish transparent outcomes, references, and corrections ledger.', tranchePercent: 25 },
    ]),
    contributions: [],
    _count: { contributions: 14 },
  },
];

export const demoProjectIds = mockProjects.map((project) => project.id);

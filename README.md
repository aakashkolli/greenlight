# Greenlight

Greenlight is a Web3 crowdfunding app with escrow guarantees.

> **Personal portfolio project.** This is not a functional platform for real-life fundraising. No real ETH can be sent or received through the deployed site. Wallet connection (MetaMask or any injected wallet) works, but all transaction buttons — fund, withdraw, and refund — are intentionally disabled in demo mode. The live site at [https://aakashkolli.github.io/greenlight/](https://aakashkolli.github.io/greenlight/) runs entirely on static mock data.

Backers fund projects in ETH. Funds stay locked in a smart contract until the goal is reached. If a campaign misses its goal, contributors can claim refunds.

This repo is designed to be portfolio friendly in two modes:

- Demo mode for recruiters, static hosting, and quick evaluation
- Live mode for full local blockchain and backend workflows

## Product pitch

- Fund real ideas with transparent on-chain escrow
- Remove trust overhead with contract-enforced refunds
- Keep UX clean with a modern frontend and realistic sample campaigns

## Tech stack

- Frontend: Next.js App Router, Chakra UI, wagmi, viem
- Backend: Express, Prisma, PostgreSQL
- Smart contracts: Solidity, Hardhat, OpenZeppelin

## Repository layout

```text
greenlight/
├── contracts/   Solidity escrow contracts and tests
├── backend/     REST API, Prisma schema, blockchain listener
└── frontend/    Next.js UI, wallet connect, mock/live data modes
```

## Run the project

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ for live mode

### Install

```bash
npm install
```

### Environment

Copy the example env file and set values as needed:

```bash
cp .env.example .env
```

Important variables:

```env
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_CHAIN=hardhat
NEXT_PUBLIC_CHAIN_RPC=http://127.0.0.1:8545
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_FACTORY_ADDRESS=0x...
DATABASE_URL=postgresql://<pg_user>@localhost:5432/greenlight?schema=public
PORT=4000
```

### Demo mode (recommended for portfolio)

Demo mode needs only the frontend and works with static mock data.

```bash
npm --workspace frontend run dev
```

### Live mode (full stack)

```bash
npm run dev:chain
npm run deploy
npm run db:setup
npm run dev
```

## Key scripts

- `npm run dev` starts backend and frontend
- `npm run dev:chain` starts Hardhat local chain
- `npm run deploy` deploys contracts
- `npm run db:setup` prepares DB schema and seed data
- `npm run test:contracts` runs contract tests
- `npm --workspace frontend run build` builds frontend for production
- `npm --workspace frontend run build:github-pages` exports static frontend for GitHub Pages

## GitHub Pages deployment

Greenlight supports a static export path for GitHub Pages in demo mode.

1. Keep `NEXT_PUBLIC_USE_MOCK_DATA=true`
2. Build with the GitHub Pages script
3. Publish `frontend/out` to Pages

```bash
cd frontend
GITHUB_REPOSITORY=<owner>/<repo> npm run build:github-pages
```

The build automatically configures `basePath`, `assetPrefix`, and static output when `GITHUB_PAGES=true`.

## Recruiter and portfolio notes

- Demo mode ensures the app is usable without blockchain nodes, API servers, or DB setup
- Mock projects are realistic and designed to show product UX, not placeholder lorem ipsum
- Wallet connect works with injected wallets like MetaMask
- Transaction actions are intentionally disabled in demo mode so reviewers can explore safely
- Live mode remains available for full on-chain and backend demonstrations

## What to highlight in interviews

- Escrow and refund mechanics in `contracts/`
- Event-driven backend sync from blockchain to API
- Frontend architecture that supports both live APIs and static mock data
- Deployment strategy that covers both local full-stack and GitHub Pages portfolio hosting

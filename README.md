# Greenlight

A full-stack crowdfunding platform where funds are held in Ethereum smart contract escrow — released to the creator only when the funding goal is met, and returned automatically to backers if it isn't.

**Live stack:** Next.js · Solidity · Express · PostgreSQL · Privy · wagmi/viem · Chakra UI

---

## How it works

1. A creator connects their wallet and deploys a `Grant` escrow contract with a funding goal and deadline
2. Backers deposit ETH directly into the escrow — funds never touch Greenlight's servers
3. If the goal is met: the creator can withdraw the full amount
4. If the deadline passes unfunded: every backer can claim a full refund on-chain
5. A backend event listener watches the blockchain in real time and keeps the database in sync

---

## Project structure

```text
greenlight/
├── contracts/   Solidity escrow contracts (Hardhat + OpenZeppelin)
├── backend/     Express REST API · Prisma ORM · blockchain event listener
└── frontend/    Next.js 14 App Router · Chakra UI · wagmi v2 · Privy auth
```

---

## Local setup

### Prerequisites

| Tool       | Version                   |
| ---------- | ------------------------- |
| Node.js    | ≥ 20                      |
| PostgreSQL | ≥ 14 (running locally)    |

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/greenlight.git
cd greenlight
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your values:

```env
DATABASE_URL=postgresql://<pg_user>@localhost:5432/greenlight?schema=public
NEXT_PUBLIC_CHAIN_RPC=http://127.0.0.1:8545
NEXT_PUBLIC_FACTORY_ADDRESS=        # filled automatically by npm run deploy
NEXT_PUBLIC_API_URL=http://localhost:4000
PORT=4000
NEXT_PUBLIC_PRIVY_APP_ID=           # get from dashboard.privy.io
PRIVY_APP_SECRET=                   # server-side only, never exposed to browser
```

> `frontend/.env.local` and `backend/.env` are symlinked to the root `.env`.

### 3. Create the database

```bash
createdb greenlight
```

### 4. Start the local blockchain (Terminal 1)

```bash
npm run dev:chain
```

Starts Hardhat on `http://127.0.0.1:8545` with 20 pre-funded accounts (10,000 ETH each).

### 5. Deploy contracts (Terminal 2)

```bash
npm run deploy
```

Deploys `GrantFactory` and writes `NEXT_PUBLIC_FACTORY_ADDRESS` to `.env` automatically.

### 6. Initialize the database

```bash
npm run db:setup
```

Runs `prisma db push` and seeds sample projects.

### 7. Start the app

```bash
npm run dev
```

| Service      | URL                                        |
| ------------ | ------------------------------------------ |
| Frontend     | <http://localhost:3000>                    |
| Backend API  | <http://localhost:4000>                    |

---

## Scripts

| Command                  | Description                                    |
| ------------------------ | ---------------------------------------------- |
| `npm run dev`            | Start backend + frontend                       |
| `npm run dev:chain`      | Start Hardhat local blockchain                 |
| `npm run deploy`         | Deploy contracts, update `.env`                |
| `npm run db:setup`       | Create tables + seed data                      |
| `npm run db:reset`       | Drop all tables (run after restarting Hardhat) |
| `npm run seed`           | Re-seed sample projects                        |
| `npm run test:contracts` | Run 17 smart contract unit tests               |

---

## Tests

### Smart contract unit tests

```bash
npm run test:contracts
```

Covers deposit, withdraw, refund, all revert conditions, reentrancy protection, and deadline enforcement (17 tests).

### End-to-end integration test

Requires `npm run dev:chain` and the backend running:

```bash
cd contracts && npx hardhat run scripts/test_e2e.ts --network localhost
```

Runs 9 checks: contract deployment, API registration, deposit, event sync, withdrawal, refund, idempotent contribution recording, and user data retrieval.

### TypeScript

```bash
cd backend  && npx tsc --noEmit
cd frontend && npx tsc --noEmit
```

---

## Wallet login

Greenlight uses [Privy](https://privy.io) — no browser extension required. Users can sign in with:

- Email
- Google
- An existing wallet (MetaMask, Rainbow, etc.)

To use your own Privy app, create a free account at [dashboard.privy.io](https://dashboard.privy.io), add `http://localhost:3000` as an allowed origin, and set `NEXT_PUBLIC_PRIVY_APP_ID` in `.env`.

---

## Troubleshooting

### Port 8545 already in use

```bash
lsof -ti:8545 | xargs kill
```

### `npm run deploy` fails — no signers / connection refused

`npm run dev:chain` must be running first.

### Stale data after restarting Hardhat

Hardhat resets contract addresses on restart. Clear and re-seed:

```bash
npm run db:reset && npm run db:setup
```

### `DATABASE_URL` not found

Re-create the backend symlink:

```bash
cd backend && ln -sf ../.env .env
```

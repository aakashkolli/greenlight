# GreenLight - Claude Code Operating Guide

## Project Overview

GreenLight is an open-source, decentralized milestone-based escrow protocol. Funds are locked in Solidity smart contracts and released in tranches only when predefined milestones are met. If a milestone fails, remaining balance automatically reverts to backers.

**Target audience:** Hiring managers, senior engineers, and hackathon judges. This must read like a high-end engineering case study.

**Stack:** Next.js 14 App Router + Chakra UI + Privy + wagmi/viem (frontend) | Express + Prisma + PostgreSQL (backend) | Hardhat + Solidity 0.8.24 (contracts)

---

## Monorepo Structure

```
/greenlight
  /frontend    Next.js 14 App Router, Chakra UI dark theme, Privy wallet
  /backend    - Express + Prisma + PostgreSQL, blockchain event listener
  /contracts  - Hardhat + Solidity, Grant.sol + GrantFactory.sol
```

---

## Design System

**Aesthetic:** Cyber-Secure Dark Mode - high-tech, institutional, DeFi-vault energy. NOT playful, NOT retro, NOT brutalist.

### Palette
| Token | Value | Usage |
|---|---|---|
| `--bg-base` | `#09090B` | Page background |
| `--bg-surface` | `#111113` | Card / panel backgrounds |
| `--bg-elevated` | `#18181B` | Modals, elevated surfaces |
| `--border` | `#27272A` | Subtle borders |
| `--mint` | `#00FF66` | Primary CTA, active states, terminal prompts |
| `--text-primary` | `#F4F4F5` | Body copy |
| `--text-muted` | `#71717A` | Secondary labels, metadata |

### Typography
| Role | Font | Weight |
|---|---|---|
| Headings | Space Grotesk | 700 |
| Body | Inter | 400 / 500 |
| Code / Tags / Data | JetBrains Mono | 400 |

### Spacing & Radii
- Cards: `border-radius: 12px`, `border: 1px solid #27272A`
- Buttons: sharp corners (no border-radius on primary CTAs)
- Section padding: `py={20}` desktop, `py={12}` mobile

---

## Agent Skills Workflow

Use these skills at the appropriate lifecycle phase - do NOT skip them:

### Planning
- `/plan-ceo-review` - Before any new feature: rethink from first principles, find the 10-star product
- `/plan-eng-review` - Before implementation: lock architecture, data flow, edge cases, test plan

### Design
- `/design-consultation` - When redesigning UI: competitor analysis, design system decisions, mockups

### Development
- `/review` - Before merging: SQL safety, LLM trust boundaries, conditional side effects
- `/investigate` - When debugging: trace data flow, root-cause systematically

### QA & Testing
- `/qa` - After feature complete: find bugs, fix with atomic commits, generate regression tests
- `/qa-only` - Report-only mode (no code changes)
- `/browse` - Visual context: headless Chromium for frontend verification
- `/setup-browser-cookies` - Authenticated page testing

### Shipping
- `/ship` - Merge main, run tests, bump VERSION, push, open PR
- `/retro` - Weekly: shipping streaks, test health, per-person breakdown

---

## Key Commands

```bash
# From monorepo root:
npm run dev:chain     # Start Hardhat local node (run first)
npm run deploy        # Deploy GrantFactory -> .deployment.json
npm run seed          # Seed mock projects
npm run dev           # Start backend + frontend concurrently

# Database:
cd backend && npx prisma db push
```

## Environment Variables
```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CHAIN_RPC=http://127.0.0.1:8545
NEXT_PUBLIC_FACTORY_ADDRESS=<from .deployment.json>
NEXT_PUBLIC_PRIVY_APP_ID=<privy app id>
```

---

## Protocol Architecture

```
Backer -> deposit(milestoneId) -> Grant.sol (escrow vault)
                                     │
                          blockchainListener.ts
                          (WebSocket event sync)
                                     │
                           PostgreSQL (projects, contributions)
                                     │
                    Milestone criteria met? -> withdraw() tranche
                    Milestone failed?       -> refund() -> original wallets
```

## Rules for Claude

1. **Never flatten the monorepo.** All packages stay separate.
2. **Dark mode only.** Never introduce light-mode defaults.
3. **No fake startup copy.** Copy must be direct, technical, and protocol-accurate.
4. **Chakra UI stays.** Do not swap UI libraries - extend the existing theme.
5. **Atomic commits per bug fix.** Use `/review` before every PR.
6. **Test coverage must not decrease.** Contracts have 17 passing tests - maintain them.

'use client';

/**
 * DemoModeContext
 *
 * Provides two operational states:
 *
 *   DEMO  (isDemoMode=true, default)
 *     – No real wallet required.
 *     – "Run Demo" activates a simulated session with a fake address.
 *     – simulateDeposit() mimics what would happen on-chain:
 *         1. 1 500 ms pending delay (tx confirmation simulation)
 *         2. Optimistic local state update (progress bar fills immediately)
 *         3. Fire-and-forget POST to /contributions/demo so the PostgreSQL
 *            row is also updated, proving the full-stack event path.
 *     – Session persisted to localStorage so page reloads don't reset progress.
 *
 *   PRODUCTION  (isDemoMode=false, set NEXT_PUBLIC_DEMO_MODE=false)
 *     – Real Privy / wagmi wallet hooks.
 *     – Contract writes go to the actual blockchain.
 *     – blockchainListener.ts in the backend picks up the Deposit event
 *       and replicates the state change to PostgreSQL.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { API_BASE } from './contracts';

// Wei added on top of a project's on-chain amountRaised during this demo session
type Overrides = Record<string, bigint>;

export interface DemoModeContextType {
  isDemoMode: boolean;
  demoActive: boolean;     // true after user clicks "Run Demo"
  demoAddress: string;     // fake wallet address shown in the nav
  demoOverrides: Overrides;
  pendingProjectId: string | null;
  launchDemo: () => void;
  exitDemo: () => void;
  simulateDeposit: (projectId: string, amountWei?: bigint) => Promise<void>;
}

const DEFAULT_CTX: DemoModeContextType = {
  isDemoMode: true,
  demoActive: false,
  demoAddress: '',
  demoOverrides: {},
  pendingProjectId: null,
  launchDemo: () => {},
  exitDemo: () => {},
  simulateDeposit: async () => {},
};

const DemoModeContext = createContext<DemoModeContextType>(DEFAULT_CTX);

const LS_KEY = 'gl_demo_v1';

// Deterministic fake address — looks real enough for a portfolio demo
const DEMO_WALLET = '0xD3e0aBcDeF1234567890AbCdEf1234567890abcD' as const;
// Default amount deposited when no explicit amount is provided.
const DEMO_DEPOSIT_WEI = 250_000_000_000_000_000n; // 0.25 ETH

function loadFromStorage(): { demoActive: boolean; demoOverrides: Overrides } {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { demoActive: false, demoOverrides: {} };
    const parsed = JSON.parse(raw);
    const overrides: Overrides = {};
    if (parsed.demoOverrides && typeof parsed.demoOverrides === 'object') {
      for (const [k, v] of Object.entries(parsed.demoOverrides)) {
        overrides[k] = BigInt(v as string);
      }
    }
    return {
      demoActive: !!parsed.demoActive,
      demoOverrides: overrides,
    };
  } catch {
    return { demoActive: false, demoOverrides: {} };
  }
}

function saveToStorage(demoActive: boolean, demoOverrides: Overrides) {
  try {
    const serialized = Object.fromEntries(
      Object.entries(demoOverrides).map(([k, v]) => [k, v.toString()]),
    );
    localStorage.setItem(LS_KEY, JSON.stringify({ demoActive, demoOverrides: serialized }));
  } catch {}
}

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false'; // default on

  const [hydrated, setHydrated] = useState(false);
  const [demoActive, setDemoActive] = useState(false);
  const [demoOverrides, setDemoOverrides] = useState<Overrides>({});
  const [pendingProjectId, setPendingProjectId] = useState<string | null>(null);

  // ── Hydrate from localStorage on mount (client-only) ─────────────────────
  useEffect(() => {
    if (!isDemoMode) { setHydrated(true); return; }
    const saved = loadFromStorage();
    if (saved.demoActive) setDemoActive(true);
    if (Object.keys(saved.demoOverrides).length > 0) setDemoOverrides(saved.demoOverrides);
    setHydrated(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persist to localStorage whenever state changes (after hydration) ──────
  useEffect(() => {
    if (!hydrated || !isDemoMode) return;
    saveToStorage(demoActive, demoOverrides);
  }, [hydrated, isDemoMode, demoActive, demoOverrides]);

  const launchDemo = useCallback(() => {
    setDemoActive(true);
  }, []);

  const exitDemo = useCallback(() => {
    try { localStorage.removeItem(LS_KEY); } catch {}
    window.location.reload();
  }, []);

  const simulateDeposit = useCallback(
    async (projectId: string, amountWei: bigint = DEMO_DEPOSIT_WEI) => {
      if (pendingProjectId) return; // debounce concurrent clicks

      setPendingProjectId(projectId);

      // ── 1. Simulate tx confirmation latency ─────────────────────────────
      await new Promise<void>((resolve) => setTimeout(resolve, 1500));

      // ── 2. Optimistic UI update ─────────────────────────────────────────
      setDemoOverrides((prev) => ({
        ...prev,
        [projectId]: (prev[projectId] ?? 0n) + amountWei,
      }));

      setPendingProjectId(null);

      // ── 3. Backend sync (non-blocking) ──────────────────────────────────
      // Mirrors what blockchainListener.ts does when it sees a real Deposit
      // event: upsert a contribution row, recalculate amountRaised.
      // Fire-and-forget — demo UX never waits on the backend.
      if (API_BASE) {
        const fakeTxHash = `0xdemo${Date.now().toString(16).padStart(60, '0')}`;
        fetch(`${API_BASE}/contributions/demo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            walletAddress: DEMO_WALLET,
            amount: amountWei.toString(),
            txHash: fakeTxHash,
          }),
        }).catch(() => {
          // Backend unavailable in demo — that's fine, UI already updated
        });
      }
    },
    [pendingProjectId],
  );

  return (
    <DemoModeContext.Provider
      value={{
        isDemoMode,
        demoActive,
        demoAddress: DEMO_WALLET,
        demoOverrides,
        pendingProjectId,
        launchDemo,
        exitDemo,
        simulateDeposit,
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
}

export const useDemoMode = () => useContext(DemoModeContext);

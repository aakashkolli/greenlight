const BASE = process.env.PREWARM_BASE_URL || 'http://localhost:3000';
const ROUTES = ['/', '/project/demo-water-sensors', '/create', '/activity'];
const MAX_WAIT_MS = 90_000;
const RETRY_MS = 1_000;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer() {
  const start = Date.now();
  while (Date.now() - start < MAX_WAIT_MS) {
    try {
      const res = await fetch(`${BASE}/`, { method: 'HEAD' });
      if (res.ok) return true;
    } catch {
      // Server not up yet.
    }
    await sleep(RETRY_MS);
  }
  return false;
}

async function prewarm() {
  const ready = await waitForServer();
  if (!ready) {
    console.log('[prewarm] Timed out waiting for frontend server.');
    process.exit(0);
  }

  console.log('[prewarm] Frontend detected, warming key routes...');

  for (const route of ROUTES) {
    const url = `${BASE}${route}`;
    const started = Date.now();
    try {
      const res = await fetch(url);
      const elapsed = Date.now() - started;
      console.log(`[prewarm] ${route} -> ${res.status} in ${elapsed}ms`);
    } catch (err) {
      console.log(`[prewarm] ${route} failed: ${String(err)}`);
    }
  }

  console.log('[prewarm] Done. First navigation should now feel much faster.');
}

prewarm().catch((err) => {
  console.error('[prewarm] Unhandled error:', err);
  process.exit(0);
});

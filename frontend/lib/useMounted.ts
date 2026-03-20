import { useEffect, useState } from 'react';

/**
 * Returns true only after the component has mounted on the client.
 *
 * Use this to guard any Web3 / wallet state that differs between the
 * server render and the first client paint. Without it, SSR emits the
 * loading/disconnected state, the client hydrates with a different
 * wallet state, and React logs a hydration mismatch (the "stuck Loading"
 * symptom seen in WalletButton).
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

import {useEffect, useState} from 'react';
import {
  getActiveAdminCashflowSession,
  type ActiveAdminCashflowSession,
} from '../services/kolam-cashflow-session-api';

export type AdminCashflowHeaderState = 'open' | 'locked' | 'none' | 'loading';

export function useKolamAdminCashflowHeaderController({
  enabled = true,
  intervalMs = 60_000,
}: {
  enabled?: boolean;
  intervalMs?: number;
} = {}) {
  const [session, setSession] = useState<ActiveAdminCashflowSession | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setSession(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    const refresh = async () => {
      try {
        const next = await getActiveAdminCashflowSession();
        if (cancelled) {
          return;
        }
        setSession(next);
      } catch {
        if (cancelled) {
          return;
        }
        setSession(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void refresh();
    timer = setInterval(() => {
      void refresh();
    }, intervalMs);

    return () => {
      cancelled = true;
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [enabled, intervalMs]);

  const state: AdminCashflowHeaderState = loading
    ? 'loading'
    : session?.status === 'open'
      ? 'open'
      : session?.status === 'locked'
        ? 'locked'
        : 'none';

  return {loading, session, state};
}

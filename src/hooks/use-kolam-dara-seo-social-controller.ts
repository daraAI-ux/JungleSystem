import {useCallback, useEffect, useRef, useState} from 'react';
import {
  getKolamDaraSeoTab,
  isKolamDaraSeoRoute,
  type KolamDaraSeoSocialPlatform,
  type KolamDaraSeoSocialSnapshot,
} from '../domain/kolam-dara-seo';
import {sanitizeApiErrorMessage} from '../lib/api-error';
import {
  fetchKolamDaraSeoSocialInsights,
  syncKolamDaraSeoSocialInsights,
} from '../services/kolam-dara-seo-api';

const SOCIAL_POLL_MS = 5000;

export interface KolamDaraSeoSocialController {
  error: string | null;
  loading: boolean;
  notice: string | null;
  rows: KolamDaraSeoSocialSnapshot[];
  syncBusyKey: string | null;
  total: number;
  onRefresh: () => Promise<void>;
  onSync: (
    platform: KolamDaraSeoSocialPlatform,
    periodDays: 7 | 28,
  ) => Promise<void>;
}

export function useKolamDaraSeoSocialController(
  route: string,
): KolamDaraSeoSocialController {
  const enabled =
    isKolamDaraSeoRoute(route) && getKolamDaraSeoTab(route) === 'social-insights';
  const [rows, setRows] = useState<KolamDaraSeoSocialSnapshot[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [syncBusyKey, setSyncBusyKey] = useState<string | null>(null);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchKolamDaraSeoSocialInsights({limit: 30});
      setRows(data.rows);
      setTotal(data.total);
    } catch (err) {
      setRows([]);
      setTotal(0);
      setError(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Gagal memuat social insights',
      );
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void onRefresh();
  }, [enabled, onRefresh]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    const timer = setInterval(() => {
      const hasPending = rowsRef.current.some(
        row => row.status === 'pending',
      );
      if (!hasPending) {
        return;
      }
      void onRefresh();
    }, SOCIAL_POLL_MS);
    return () => {
      clearInterval(timer);
    };
  }, [enabled, onRefresh]);

  const onSync = useCallback(
    async (platform: KolamDaraSeoSocialPlatform, periodDays: 7 | 28) => {
      const key = `${platform}-${periodDays}`;
      setSyncBusyKey(key);
      setNotice(null);
      try {
        const message = await syncKolamDaraSeoSocialInsights({
          platform,
          periodDays,
        });
        setNotice(message);
        await onRefresh();
      } catch (err) {
        setNotice(
          err instanceof Error && err.message.trim()
            ? sanitizeApiErrorMessage(err.message)
            : 'Sync gagal',
        );
      } finally {
        setSyncBusyKey(null);
      }
    },
    [onRefresh],
  );

  return {
    error,
    loading,
    notice,
    rows,
    syncBusyKey,
    total,
    onRefresh,
    onSync,
  };
}

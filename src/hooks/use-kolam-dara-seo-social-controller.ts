import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  getKolamDaraSeoTab,
  isKolamDaraSeoRoute,
  paginateKolamDaraSeoSocialSnapshots,
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
  page: number;
  pagedItems: KolamDaraSeoSocialSnapshot[];
  rows: KolamDaraSeoSocialSnapshot[];
  syncing: boolean;
  total: number;
  totalPages: number;
  onRefresh: () => Promise<void>;
  onSetPage: (page: number) => void;
  onSync: (
    platform: KolamDaraSeoSocialPlatform,
    periodDays: 7 | 28,
  ) => Promise<void>;
}

export function useKolamDaraSeoSocialController(
  route: string,
): KolamDaraSeoSocialController {
  const enabled =
    isKolamDaraSeoRoute(route) &&
    getKolamDaraSeoTab(route) === 'social-insights';
  const [rows, setRows] = useState<KolamDaraSeoSocialSnapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [page, setPage] = useState(1);
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
    } catch (err) {
      setRows([]);
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
      const hasPending = rowsRef.current.some(row => row.status === 'pending');
      if (!hasPending) {
        return;
      }
      void onRefresh();
    }, SOCIAL_POLL_MS);
    return () => {
      clearInterval(timer);
    };
  }, [enabled, onRefresh]);

  const paged = useMemo(
    () => paginateKolamDaraSeoSocialSnapshots(rows, page),
    [page, rows],
  );

  const onSync = useCallback(
    async (platform: KolamDaraSeoSocialPlatform, periodDays: 7 | 28) => {
      setSyncing(true);
      setNotice(null);
      try {
        const message = await syncKolamDaraSeoSocialInsights({
          platform,
          periodDays,
        });
        setNotice(message);
        setPage(1);
        await onRefresh();
      } catch (err) {
        setNotice(
          err instanceof Error && err.message.trim()
            ? sanitizeApiErrorMessage(err.message)
            : `Gagal sync ${platform}`,
        );
      } finally {
        setSyncing(false);
      }
    },
    [onRefresh],
  );

  return {
    error,
    loading,
    notice,
    page: paged.page,
    pagedItems: paged.items,
    rows,
    syncing,
    total: paged.total,
    totalPages: paged.totalPages,
    onRefresh,
    onSetPage: setPage,
    onSync,
  };
}

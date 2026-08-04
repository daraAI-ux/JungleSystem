import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  getKolamDaraSeoTab,
  isKolamDaraSeoRoute,
  paginateKolamDaraSeoKeywords,
  type KolamDaraSeoKeywordRow,
} from '../domain/kolam-dara-seo';
import {sanitizeApiErrorMessage} from '../lib/api-error';
import {fetchKolamDaraSeoKeywords} from '../services/kolam-dara-seo-api';

export interface KolamDaraSeoKeywordsController {
  error: string | null;
  loading: boolean;
  page: number;
  pagedItems: KolamDaraSeoKeywordRow[];
  rows: KolamDaraSeoKeywordRow[];
  total: number;
  totalPages: number;
  onRefresh: () => Promise<void>;
  onSetPage: (page: number) => void;
}

export function useKolamDaraSeoKeywordsController(
  route: string,
): KolamDaraSeoKeywordsController {
  const enabled =
    isKolamDaraSeoRoute(route) && getKolamDaraSeoTab(route) === 'keywords';
  const [rows, setRows] = useState<KolamDaraSeoKeywordRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchKolamDaraSeoKeywords();
      setRows(data);
      setPage(1);
    } catch (err) {
      setRows([]);
      setError(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Gagal memuat keywords',
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

  const paged = useMemo(
    () => paginateKolamDaraSeoKeywords(rows, page),
    [page, rows],
  );

  return {
    error,
    loading,
    page: paged.page,
    pagedItems: paged.items,
    rows,
    total: paged.total,
    totalPages: paged.totalPages,
    onRefresh,
    onSetPage: setPage,
  };
}

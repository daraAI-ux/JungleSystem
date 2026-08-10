import {useCallback, useEffect, useState} from 'react';
import type {KolamKpiChatReviewPage} from '../domain/kolam-kpi';
import {ApiError} from '../lib/api-error';
import {fetchKolamKpiChatReviews} from '../services/kolam-kpi-team-api';

export function useKolamKpiChatReviewsController(options: {enabled: boolean}) {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<KolamKpiChatReviewPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!options.enabled) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const next = await fetchKolamKpiChatReviews({page, limit: 20});
      setResult(next);
    } catch (err) {
      setResult(null);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal memuat review chat.',
      );
    } finally {
      setLoading(false);
    }
  }, [options.enabled, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = result
    ? Math.max(1, Math.ceil(result.total / Math.max(result.limit, 1)))
    : 1;

  return {
    page,
    setPage,
    rows: result?.rows ?? [],
    total: result?.total ?? 0,
    limit: result?.limit ?? 20,
    totalPages,
    loading,
    error,
    onRefresh: load,
  };
}

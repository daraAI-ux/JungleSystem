import {useCallback, useEffect, useState} from 'react';
import type {KolamDaraTrainingStats} from '../domain/kolam-dara-training';
import {isKolamDaraTrainingRoute} from '../domain/kolam-dara-training';
import {ApiError} from '../lib/api-error';
import {fetchKolamDaraTrainingStats} from '../services/kolam-dara-training-api';

export interface KolamDaraTrainingController {
  loading: boolean;
  error: string;
  stats: KolamDaraTrainingStats | null;
  onRefresh: () => Promise<void>;
}

export function useKolamDaraTrainingController(
  route: string,
  opts?: {enabled?: boolean},
): KolamDaraTrainingController {
  const routeOk = isKolamDaraTrainingRoute(route);
  const enabled = routeOk && opts?.enabled !== false;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<KolamDaraTrainingStats | null>(null);

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      setStats(await fetchKolamDaraTrainingStats());
    } catch (err) {
      setStats(null);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal memuat data pelatihan DARA',
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

  return {
    loading,
    error,
    stats,
    onRefresh,
  };
}

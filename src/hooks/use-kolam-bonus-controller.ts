import { useCallback, useEffect, useState } from 'react';
import {
  buildBonusListRoute,
  createInitialBonusListFilters,
  type KolamBonusListFilters,
  type KolamBonusListRow,
} from '../domain/kolam-bonus';
import { ApiError } from '../lib/api-error';
import { fetchKolamBonusList } from '../services/kolam-bonus-api';

export interface KolamBonusListController {
  filters: KolamBonusListFilters;
  rows: KolamBonusListRow[];
  loading: boolean;
  error: string;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onRefresh: () => Promise<void>;
}

export function useKolamBonusListController(
  route: string,
  onRouteChange?: (route: string) => void,
): KolamBonusListController {
  const [filters, setFilters] = useState<KolamBonusListFilters>(() =>
    createInitialBonusListFilters(route),
  );
  const [rows, setRows] = useState<KolamBonusListRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFilters(createInitialBonusListFilters(route));
  }, [route]);

  const syncRoute = useCallback(
    (next: KolamBonusListFilters) => {
      onRouteChange?.(buildBonusListRoute(next));
    },
    [onRouteChange],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const nextRows = await fetchKolamBonusList(filters);
      setRows(nextRows);
    } catch (err) {
      setRows([]);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal memuat bonus',
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onYearChange = useCallback(
    (year: number) => {
      setFilters(prev => {
        const next = { ...prev, year: Math.max(1, year) };
        syncRoute(next);
        return next;
      });
    },
    [syncRoute],
  );

  const onMonthChange = useCallback(
    (month: number) => {
      setFilters(prev => {
        const next = {
          ...prev,
          month: Math.min(12, Math.max(1, month)),
        };
        syncRoute(next);
        return next;
      });
    },
    [syncRoute],
  );

  return {
    filters,
    rows,
    loading,
    error,
    onYearChange,
    onMonthChange,
    onRefresh: refresh,
  };
}

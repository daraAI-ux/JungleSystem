import { useEffect, useMemo, useState } from 'react';
import {
  createInitialStockOpnameListFilters,
  getKolamStockOpnameRouteId,
  getKolamStockOpnameSurfaceMode,
  type KolamStockOpname,
  type KolamStockOpnameListFilters,
  type KolamStockOpnamePagination,
  type KolamStockOpnameSurfaceMode,
} from '../domain/kolam-stock-opname';
import { getKolamStockOpnameList } from '../services/kolam-stock-opname-api';
import { ApiError } from '../lib/api-error';

export interface KolamStockOpnameController {
  mode: KolamStockOpnameSurfaceMode;
  documentId: string | null;
  filters: KolamStockOpnameListFilters;
  items: KolamStockOpname[];
  pagination: KolamStockOpnamePagination;
  loading: boolean;
  error: string;
  onChangeFilters: (patch: Partial<KolamStockOpnameListFilters>) => void;
  onClearFilters: () => void;
  onRefresh: () => Promise<void>;
}

export function useKolamStockOpnameController(
  route: string,
): KolamStockOpnameController {
  const mode = getKolamStockOpnameSurfaceMode(route);
  const documentId = getKolamStockOpnameRouteId(route);
  const [filters, setFilters] = useState<KolamStockOpnameListFilters>(() =>
    createInitialStockOpnameListFilters(route),
  );
  const [items, setItems] = useState<KolamStockOpname[]>([]);
  const [pagination, setPagination] = useState<KolamStockOpnamePagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFilters(createInitialStockOpnameListFilters(route));
  }, [route]);

  useEffect(() => {
    if (mode !== 'list') {
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    void getKolamStockOpnameList(filters)
      .then(result => {
        if (cancelled) {
          return;
        }
        setItems(result.data);
        setPagination(result.pagination);
      })
      .catch(err => {
        if (cancelled) {
          return;
        }
        setItems([]);
        setError(formatError(err));
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [mode, filters]);

  return useMemo(
    () => ({
      mode,
      documentId,
      filters,
      items,
      pagination,
      loading,
      error,
      onChangeFilters: patch => {
        setFilters(prev => ({
          ...prev,
          ...patch,
          page:
            patch.page != null
              ? patch.page
              : patch.search != null ||
                patch.status != null ||
                patch.startDate != null ||
                patch.endDate != null
              ? 1
              : prev.page,
        }));
      },
      onClearFilters: () => {
        setFilters({
          search: '',
          status: '',
          startDate: '',
          endDate: '',
          page: 1,
          limit: filters.limit,
          sort: 'createdAt:desc',
        });
      },
      onRefresh: async () => {
        if (mode !== 'list') {
          return;
        }
        setLoading(true);
        setError('');
        try {
          const result = await getKolamStockOpnameList(filters);
          setItems(result.data);
          setPagination(result.pagination);
        } catch (err) {
          setError(formatError(err));
        } finally {
          setLoading(false);
        }
      },
    }),
    [mode, documentId, filters, items, pagination, loading, error],
  );
}

function formatError(err: unknown) {
  if (err instanceof ApiError) {
    const payload = err.payload as { message?: string } | null;
    return payload?.message || err.message || `HTTP ${err.status}`;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Gagal memuat dokumen stock opname';
}

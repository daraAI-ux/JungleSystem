import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  buildCommissionListRoute,
  createInitialCommissionListFilters,
  getKolamCommissionSurfaceMode,
  hasKolamCommissionPermission,
  type KolamCommissionListFilters,
  type KolamCommissionListRow,
  type KolamCommissionStatusFilter,
} from '../domain/kolam-commission';
import type { KolamWalletOption } from '../domain/kolam-wallet-option';
import { ApiError } from '../lib/api-error';
import {
  fetchKolamCommissionList,
  releaseKolamCommission,
} from '../services/kolam-commission-api';
import { getKolamWalletOptionsPaginated } from '../services/kolam-wallet-option-api';

export interface KolamCommissionListController {
  mode: 'list' | 'unsupported';
  filters: KolamCommissionListFilters;
  rows: KolamCommissionListRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  wallets: KolamWalletOption[];
  walletByRow: Record<string, string>;
  loading: boolean;
  releasingId: string | null;
  error: string;
  statusMessage: string;
  canView: boolean;
  canRelease: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (status: KolamCommissionStatusFilter) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onWalletChange: (rowId: string, walletId: string) => void;
  onRefresh: () => Promise<void>;
  onRelease: (row: KolamCommissionListRow) => Promise<void>;
}

export function useKolamCommissionListController(
  route: string,
  onRouteChange?: (route: string) => void,
): KolamCommissionListController {
  const { authUser } = useKolamAuthContext();
  const mode = getKolamCommissionSurfaceMode(route);
  const [filters, setFilters] = useState<KolamCommissionListFilters>(() =>
    createInitialCommissionListFilters(route),
  );
  const [rows, setRows] = useState<KolamCommissionListRow[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [wallets, setWallets] = useState<KolamWalletOption[]>([]);
  const [walletByRow, setWalletByRow] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const permissions = authUser?.permissions;
  const roleKey = authUser?.roleKey;
  const canView = hasKolamCommissionPermission(permissions, 'view', roleKey);
  const canRelease = hasKolamCommissionPermission(
    permissions,
    'confirm',
    roleKey,
  );

  const syncRoute = useCallback(
    (nextFilters: KolamCommissionListFilters) => {
      onRouteChange?.(buildCommissionListRoute(nextFilters));
    },
    [onRouteChange],
  );

  const refresh = useCallback(async () => {
    if (!canView || mode !== 'list') {
      return;
    }
    const current = filtersRef.current;
    setLoading(true);
    setError('');
    try {
      const result = await fetchKolamCommissionList(current);
      setRows(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setRows([]);
      setPagination(currentState => ({
        ...currentState,
        total: 0,
        totalPages: 1,
      }));
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal memuat komisi',
      );
    } finally {
      setLoading(false);
    }
  }, [canView, mode]);

  useEffect(() => {
    setFilters(createInitialCommissionListFilters(route));
  }, [route]);

  useEffect(() => {
    if (mode !== 'list' || !canView) {
      return;
    }
    void refresh();
  }, [
    canView,
    filters.limit,
    filters.page,
    filters.search,
    filters.status,
    mode,
    refresh,
  ]);

  useEffect(() => {
    if (!canRelease || mode !== 'list') {
      return;
    }
    let cancelled = false;
    void getKolamWalletOptionsPaginated({ limit: 100 })
      .then(items => {
        if (!cancelled) {
          setWallets(items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setWallets([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [canRelease, mode]);

  const patchFilters = useCallback(
    (patch: Partial<KolamCommissionListFilters>) => {
      setFilters(current => {
        const next = { ...current, ...patch };
        syncRoute(next);
        return next;
      });
    },
    [syncRoute],
  );

  const onSearchChange = useCallback(
    (value: string) => {
      patchFilters({ search: value, page: 1 });
    },
    [patchFilters],
  );

  const onStatusChange = useCallback(
    (status: KolamCommissionStatusFilter) => {
      patchFilters({ status, page: 1 });
    },
    [patchFilters],
  );

  const onPageChange = useCallback(
    (page: number) => {
      patchFilters({ page: Math.max(1, page) });
    },
    [patchFilters],
  );

  const onLimitChange = useCallback(
    (limit: number) => {
      patchFilters({ limit: Math.max(1, limit), page: 1 });
    },
    [patchFilters],
  );

  const onWalletChange = useCallback((rowId: string, walletId: string) => {
    setWalletByRow(current => ({
      ...current,
      [rowId]: walletId,
    }));
  }, []);

  const onRelease = useCallback(
    async (row: KolamCommissionListRow) => {
      if (!canRelease || !row.id || !row.canRelease) {
        return;
      }
      const walletFrom = walletByRow[row.id];
      if (!walletFrom) {
        setError('Pilih dompet');
        return;
      }
      setReleasingId(row.id);
      setError('');
      setStatusMessage('');
      try {
        await releaseKolamCommission(row.id, walletFrom);
        setStatusMessage('Komisi dibayar');
        await refresh();
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Gagal bayar komisi',
        );
      } finally {
        setReleasingId(null);
      }
    },
    [canRelease, refresh, walletByRow],
  );

  return useMemo(
    () => ({
      mode,
      filters,
      rows,
      pagination,
      wallets,
      walletByRow,
      loading,
      releasingId,
      error,
      statusMessage,
      canView,
      canRelease,
      onSearchChange,
      onStatusChange,
      onPageChange,
      onLimitChange,
      onWalletChange,
      onRefresh: refresh,
      onRelease,
    }),
    [
      mode,
      filters,
      rows,
      pagination,
      wallets,
      walletByRow,
      loading,
      releasingId,
      error,
      statusMessage,
      canView,
      canRelease,
      onSearchChange,
      onStatusChange,
      onPageChange,
      onLimitChange,
      onWalletChange,
      refresh,
      onRelease,
    ],
  );
}

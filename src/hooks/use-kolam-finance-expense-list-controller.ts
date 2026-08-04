import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  buildFinanceExpenseListRoute,
  createInitialFinanceExpenseListFilters,
  getKolamFinanceExpenseRoot,
  getKolamFinanceExpenseSurfaceMode,
  hasKolamFinanceExpensePermission,
  type KolamFinanceExpenseKind,
  type KolamFinanceExpenseListFilters,
  type KolamFinanceExpenseListRow,
  type KolamFinanceExpenseStatusFilter,
} from '../domain/kolam-finance-expense';
import { ApiError } from '../lib/api-error';
import {
  fetchKolamFinanceExpenseList,
  verifyKolamFinanceExpense,
} from '../services/kolam-finance-expense-api';

export interface KolamFinanceExpenseListController {
  kind: KolamFinanceExpenseKind;
  mode: 'list' | 'unsupported';
  filters: KolamFinanceExpenseListFilters;
  rows: KolamFinanceExpenseListRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  totals: {
    totalAmount: number;
    totalCount: number;
  } | null;
  loading: boolean;
  verifyingId: string | null;
  error: string;
  statusMessage: string;
  canView: boolean;
  canVerify: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (status: KolamFinanceExpenseStatusFilter) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onRefresh: () => Promise<void>;
  onVerify: (row: KolamFinanceExpenseListRow) => Promise<void>;
}

export function useKolamFinanceExpenseListController(
  kind: KolamFinanceExpenseKind,
  route: string,
  onRouteChange?: (route: string) => void,
): KolamFinanceExpenseListController {
  const { authUser } = useKolamAuthContext();
  const mode = getKolamFinanceExpenseSurfaceMode(route);
  const [filters, setFilters] = useState<KolamFinanceExpenseListFilters>(() =>
    createInitialFinanceExpenseListFilters(route),
  );
  const [rows, setRows] = useState<KolamFinanceExpenseListRow[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [totals, setTotals] = useState<{
    totalAmount: number;
    totalCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const permissions = authUser?.permissions;
  const roleKey = authUser?.roleKey;
  const canView = hasKolamFinanceExpensePermission(
    permissions,
    kind,
    'view',
    roleKey,
  );
  const canVerify = hasKolamFinanceExpensePermission(
    permissions,
    kind,
    'verify',
    roleKey,
  );

  const syncRoute = useCallback(
    (nextFilters: KolamFinanceExpenseListFilters) => {
      onRouteChange?.(buildFinanceExpenseListRoute(kind, nextFilters));
    },
    [kind, onRouteChange],
  );

  const refresh = useCallback(async () => {
    if (!canView || mode !== 'list') {
      return;
    }
    const current = filtersRef.current;
    setLoading(true);
    setError('');
    try {
      const result = await fetchKolamFinanceExpenseList(kind, current);
      setRows(result.data);
      setPagination(result.pagination);
      setTotals(result.totals);
    } catch (err) {
      setRows([]);
      setPagination(current => ({
        ...current,
        total: 0,
        totalPages: 1,
      }));
      setTotals(null);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal memuat data',
      );
    } finally {
      setLoading(false);
    }
  }, [canView, kind, mode]);

  useEffect(() => {
    setFilters(createInitialFinanceExpenseListFilters(route));
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

  const patchFilters = useCallback(
    (patch: Partial<KolamFinanceExpenseListFilters>) => {
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
    (status: KolamFinanceExpenseStatusFilter) => {
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

  const onVerify = useCallback(
    async (row: KolamFinanceExpenseListRow) => {
      if (!canVerify || !row.id || row.status === 'verified') {
        return;
      }
      setVerifyingId(row.id);
      setError('');
      setStatusMessage('');
      try {
        await verifyKolamFinanceExpense(kind, row.id);
        setStatusMessage('Terverifikasi');
        await refresh();
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Gagal verifikasi',
        );
      } finally {
        setVerifyingId(null);
      }
    },
    [canVerify, kind, refresh],
  );

  return useMemo(
    () => ({
      kind,
      mode,
      filters,
      rows,
      pagination,
      totals,
      loading,
      verifyingId,
      error,
      statusMessage,
      canView,
      canVerify,
      onSearchChange,
      onStatusChange,
      onPageChange,
      onLimitChange,
      onRefresh: refresh,
      onVerify,
    }),
    [
      kind,
      mode,
      filters,
      rows,
      pagination,
      totals,
      loading,
      verifyingId,
      error,
      statusMessage,
      canView,
      canVerify,
      onSearchChange,
      onStatusChange,
      onPageChange,
      onLimitChange,
      refresh,
      onVerify,
    ],
  );
}

export function getFinanceExpenseUnsupportedBackRoute(
  kind: KolamFinanceExpenseKind,
): string {
  return getKolamFinanceExpenseRoot(kind);
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  createInitialReceivableListFilters,
  hasKolamReceivablePermission,
  type KolamReceivable,
  type KolamReceivableListFilters,
  type KolamReceivableSourceModel,
  type KolamReceivableStatus,
  type KolamReceivableSummaryData,
} from '../domain/kolam-receivable';
import { ApiError } from '../lib/api-error';
import {
  fetchKolamReceivableSummary,
  fetchKolamReceivables,
  markKolamReceivablePaid,
} from '../services/kolam-receivable-api';

export interface KolamReceivableController {
  filters: KolamReceivableListFilters;
  items: KolamReceivable[];
  summary: KolamReceivableSummaryData | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  markingId: string | null;
  error: string;
  statusMessage: string;
  canView: boolean;
  canMarkPaid: boolean;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: '' | KolamReceivableStatus) => void;
  onSourceModelChange: (sourceModel: '' | KolamReceivableSourceModel) => void;
  onOverdueToggle: () => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onRefresh: () => Promise<void>;
  onMarkPaid: (item: KolamReceivable) => Promise<void>;
  clearStatusMessage: () => void;
}

export function useKolamReceivableController(
  route: string,
): KolamReceivableController {
  const { authUser } = useKolamAuthContext();
  void route;
  const [filters, setFilters] = useState<KolamReceivableListFilters>(() =>
    createInitialReceivableListFilters(),
  );
  const [items, setItems] = useState<KolamReceivable[]>([]);
  const [summary, setSummary] = useState<KolamReceivableSummaryData | null>(
    null,
  );
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const canView = hasKolamReceivablePermission(
    authUser?.permissions,
    'view',
    authUser?.roleKey,
  );
  const canMarkPaid = hasKolamReceivablePermission(
    authUser?.permissions,
    'update',
    authUser?.roleKey,
  );

  const refresh = useCallback(async () => {
    const current = filtersRef.current;
    setLoading(true);
    setError('');
    try {
      const [listResult, summaryResult] = await Promise.all([
        fetchKolamReceivables({
          page: current.page,
          limit: current.limit,
          search: current.search,
          status: current.status,
          sourceModel: current.sourceModel,
          overdue: current.overdue,
        }),
        fetchKolamReceivableSummary(),
      ]);
      setItems(listResult.items);
      setSummary(summaryResult);
      setPagination({
        page: listResult.page,
        limit: listResult.limit,
        total: listResult.total,
        totalPages: listResult.totalPages,
      });
    } catch (err) {
      setItems([]);
      setSummary(null);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal memuat piutang',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canView) {
      return;
    }
    void refresh();
  }, [
    canView,
    filters.page,
    filters.limit,
    filters.search,
    filters.status,
    filters.sourceModel,
    filters.overdue,
    refresh,
  ]);

  const onSearchChange = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  }, []);

  const onStatusChange = useCallback((status: '' | KolamReceivableStatus) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  }, []);

  const onSourceModelChange = useCallback(
    (sourceModel: '' | KolamReceivableSourceModel) => {
      setFilters(prev => ({ ...prev, sourceModel, page: 1 }));
    },
    [],
  );

  const onOverdueToggle = useCallback(() => {
    setFilters(prev => ({ ...prev, overdue: !prev.overdue, page: 1 }));
  }, []);

  const onPageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page: Math.max(1, page) }));
  }, []);

  const onLimitChange = useCallback((limit: number) => {
    setFilters(prev => ({
      ...prev,
      limit: Math.max(1, limit),
      page: 1,
    }));
  }, []);

  const onMarkPaid = useCallback(
    async (item: KolamReceivable) => {
      if (!item.id || !canMarkPaid || item.status !== 'open') {
        return;
      }
      setMarkingId(item.id);
      setError('');
      setStatusMessage('');
      try {
        await markKolamReceivablePaid(item.id);
        setStatusMessage(`${item.code} dibayar`);
        await refresh();
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Gagal menandai dibayar',
        );
      } finally {
        setMarkingId(null);
      }
    },
    [canMarkPaid, refresh],
  );

  const clearStatusMessage = useCallback(() => {
    setStatusMessage('');
  }, []);

  return {
    filters,
    items,
    summary,
    pagination,
    loading,
    markingId,
    error,
    statusMessage,
    canView,
    canMarkPaid,
    onSearchChange,
    onStatusChange,
    onSourceModelChange,
    onOverdueToggle,
    onPageChange,
    onLimitChange,
    onRefresh: refresh,
    onMarkPaid,
    clearStatusMessage,
  };
}

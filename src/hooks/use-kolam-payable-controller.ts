import { useCallback, useEffect, useRef, useState } from 'react';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  createInitialPayableListFilters,
  getKolamPayableRouteId,
  getKolamPayableSurfaceMode,
  hasKolamPayablePermission,
  type KolamPayable,
  type KolamPayableListFilters,
  type KolamPayableSourceModel,
  type KolamPayableStatus,
  type KolamPayableSummaryData,
  type KolamPayableSurfaceMode,
} from '../domain/kolam-payable';
import { ApiError } from '../lib/api-error';
import {
  getKolamPayableInstallments,
  type KolamPayableInstallment,
} from '../services/kolam-payable-installment-api';
import {
  fetchKolamPayableSummary,
  fetchKolamPayables,
  payKolamPayableFull,
} from '../services/kolam-payable-api';

export interface KolamPayableController {
  mode: KolamPayableSurfaceMode;
  documentId: string | null;
  filters: KolamPayableListFilters;
  items: KolamPayable[];
  summary: KolamPayableSummaryData | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  installments: KolamPayableInstallment[];
  installmentsLoading: boolean;
  loading: boolean;
  payingId: string | null;
  error: string;
  statusMessage: string;
  canView: boolean;
  canPay: boolean;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: '' | KolamPayableStatus) => void;
  onSourceModelChange: (sourceModel: '' | KolamPayableSourceModel) => void;
  onOverdueToggle: () => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onRefresh: () => Promise<void>;
  onPayFull: (item: KolamPayable) => Promise<void>;
  clearStatusMessage: () => void;
}

export function useKolamPayableController(route: string): KolamPayableController {
  const { authUser } = useKolamAuthContext();
  const mode = getKolamPayableSurfaceMode(route);
  const documentId = getKolamPayableRouteId(route);
  const [filters, setFilters] = useState<KolamPayableListFilters>(() =>
    createInitialPayableListFilters(),
  );
  const [items, setItems] = useState<KolamPayable[]>([]);
  const [summary, setSummary] = useState<KolamPayableSummaryData | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [installments, setInstallments] = useState<KolamPayableInstallment[]>(
    [],
  );
  const [installmentsLoading, setInstallmentsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const canView = hasKolamPayablePermission(
    authUser?.permissions,
    'view',
    authUser?.roleKey,
  );
  const canPay = hasKolamPayablePermission(
    authUser?.permissions,
    'update',
    authUser?.roleKey,
  );

  const refreshList = useCallback(async () => {
    const current = filtersRef.current;
    setLoading(true);
    setError('');
    try {
      const [listResult, summaryResult] = await Promise.all([
        fetchKolamPayables({
          page: current.page,
          limit: current.limit,
          search: current.search,
          status: current.status,
          sourceModel: current.sourceModel,
          overdue: current.overdue,
        }),
        fetchKolamPayableSummary(),
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
            : 'Gagal memuat utang',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshInstallments = useCallback(async (payableId: string) => {
    if (!payableId) {
      setInstallments([]);
      return;
    }
    setInstallmentsLoading(true);
    try {
      const list = await getKolamPayableInstallments(payableId);
      setInstallments(list);
    } catch {
      setInstallments([]);
    } finally {
      setInstallmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canView) {
      return;
    }
    void refreshList();
  }, [
    canView,
    filters.page,
    filters.limit,
    filters.search,
    filters.status,
    filters.sourceModel,
    filters.overdue,
    refreshList,
  ]);

  useEffect(() => {
    if (!canView || mode !== 'detail' || !documentId) {
      setInstallments([]);
      return;
    }
    void refreshInstallments(documentId);
  }, [canView, documentId, mode, refreshInstallments]);

  const onSearchChange = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  }, []);

  const onStatusChange = useCallback((status: '' | KolamPayableStatus) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  }, []);

  const onSourceModelChange = useCallback(
    (sourceModel: '' | KolamPayableSourceModel) => {
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

  const onPayFull = useCallback(
    async (item: KolamPayable) => {
      if (!item.id || !canPay || item.status !== 'open') {
        return;
      }
      setPayingId(item.id);
      setError('');
      setStatusMessage('');
      try {
        await payKolamPayableFull(item.id);
        setStatusMessage(`${item.code} lunas`);
        await refreshList();
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Gagal melunasi utang',
        );
      } finally {
        setPayingId(null);
      }
    },
    [canPay, refreshList],
  );

  const clearStatusMessage = useCallback(() => {
    setStatusMessage('');
  }, []);

  return {
    mode,
    documentId,
    filters,
    items,
    summary,
    pagination,
    installments,
    installmentsLoading,
    loading,
    payingId,
    error,
    statusMessage,
    canView,
    canPay,
    onSearchChange,
    onStatusChange,
    onSourceModelChange,
    onOverdueToggle,
    onPageChange,
    onLimitChange,
    onRefresh: refreshList,
    onPayFull,
    clearStatusMessage,
  };
}

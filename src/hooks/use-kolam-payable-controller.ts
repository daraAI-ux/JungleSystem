import { useCallback, useEffect, useRef, useState } from 'react';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  createInitialPayableListFilters,
  getKolamPayableRouteId,
  getKolamPayableSurfaceMode,
  hasKolamPayablePermission,
  type KolamPayable,
  type KolamPayableInstallmentDueFilter,
  type KolamPayableListFilters,
  type KolamPayablePeriodFilter,
  type KolamPayableSourceModel,
  type KolamPayableSortOption,
  type KolamPayableStatus,
  type KolamPayableSummaryData,
  type KolamPayableSurfaceMode,
} from '../domain/kolam-payable';
import { ApiError } from '../lib/api-error';
import {
  getKolamPayableInstallments,
  payKolamPayableInstallment,
  uploadKolamPayableInstallmentProof,
  type KolamPayableInstallment,
} from '../services/kolam-payable-installment-api';
import {
  fetchKolamPayableDetail,
  fetchKolamPayableSummary,
  fetchKolamPayables,
  payKolamPayableFull,
  uploadKolamPayableProof,
} from '../services/kolam-payable-api';
import { pickNativeAssetFile } from '../services/native-file-picker';

export interface KolamPayableController {
  mode: KolamPayableSurfaceMode;
  documentId: string | null;
  filters: KolamPayableListFilters;
  items: KolamPayable[];
  detailItem: KolamPayable | null;
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
  detailLoading: boolean;
  payingId: string | null;
  payingInstallmentId: string | null;
  uploadingProof: boolean;
  uploadingInstallmentProofId: string | null;
  error: string;
  statusMessage: string;
  canView: boolean;
  canCreate: boolean;
  canPay: boolean;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: '' | KolamPayableStatus) => void;
  onSourceModelChange: (sourceModel: '' | KolamPayableSourceModel) => void;
  onOverdueToggle: () => void;
  onInstallmentDueChange: (value: KolamPayableInstallmentDueFilter) => void;
  onPeriodChange: (period: KolamPayablePeriodFilter) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onSortChange: (sort: KolamPayableSortOption) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onRefresh: () => Promise<void>;
  onPayFull: (item: KolamPayable) => Promise<void>;
  onPayInstallment: (
    item: KolamPayable,
    installment: KolamPayableInstallment,
    withProof?: boolean,
  ) => Promise<void>;
  onUploadPayableProof: (item: KolamPayable) => Promise<void>;
  onUploadInstallmentProof: (
    item: KolamPayable,
    installment: KolamPayableInstallment,
  ) => Promise<void>;
  clearStatusMessage: () => void;
}

export function useKolamPayableController(
  route: string,
): KolamPayableController {
  const { authUser } = useKolamAuthContext();
  const mode = getKolamPayableSurfaceMode(route);
  const documentId = getKolamPayableRouteId(route);
  const [filters, setFilters] = useState<KolamPayableListFilters>(() =>
    createInitialPayableListFilters(),
  );
  const [items, setItems] = useState<KolamPayable[]>([]);
  const [detailItem, setDetailItem] = useState<KolamPayable | null>(null);
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
  const [detailLoading, setDetailLoading] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payingInstallmentId, setPayingInstallmentId] = useState<string | null>(
    null,
  );
  const [uploadingProof, setUploadingProof] = useState(false);
  const [uploadingInstallmentProofId, setUploadingInstallmentProofId] =
    useState<string | null>(null);
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
  const canCreate = hasKolamPayablePermission(
    authUser?.permissions,
    'create',
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
          period: current.period,
          startDate: current.startDate,
          endDate: current.endDate,
          sort: current.sort,
        }),
        fetchKolamPayableSummary(),
      ]);
      setItems(applyPayableClientFilters(listResult.items, current));
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
          : 'Gagal memuat hutang',
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

  const refreshDetail = useCallback(async (payableId: string) => {
    if (!payableId) {
      setDetailItem(null);
      return;
    }
    setDetailLoading(true);
    setError('');
    try {
      const detail = await fetchKolamPayableDetail(payableId);
      setDetailItem(detail);
    } catch (err) {
      setDetailItem(null);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Gagal memuat detail hutang',
      );
    } finally {
      setDetailLoading(false);
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
    filters.installmentDue,
    filters.period,
    filters.startDate,
    filters.endDate,
    filters.sort,
    refreshList,
  ]);

  useEffect(() => {
    if (!canView || mode !== 'detail' || !documentId) {
      setInstallments([]);
      setDetailItem(null);
      return;
    }
    void refreshDetail(documentId);
    void refreshInstallments(documentId);
  }, [canView, documentId, mode, refreshDetail, refreshInstallments]);

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

  const onInstallmentDueChange = useCallback(
    (installmentDue: KolamPayableInstallmentDueFilter) => {
      setFilters(prev => ({ ...prev, installmentDue, page: 1 }));
    },
    [],
  );

  const onPeriodChange = useCallback((period: KolamPayablePeriodFilter) => {
    setFilters(prev => ({
      ...prev,
      period,
      startDate: period === 'custom' ? prev.startDate : '',
      endDate: period === 'custom' ? prev.endDate : '',
      page: 1,
    }));
  }, []);

  const onStartDateChange = useCallback((startDate: string) => {
    setFilters(prev => ({ ...prev, startDate, period: 'custom', page: 1 }));
  }, []);

  const onEndDateChange = useCallback((endDate: string) => {
    setFilters(prev => ({ ...prev, endDate, period: 'custom', page: 1 }));
  }, []);

  const onSortChange = useCallback((sort: KolamPayableSortOption) => {
    setFilters(prev => ({ ...prev, sort, page: 1 }));
  }, []);

  const onClearFilters = useCallback(() => {
    setFilters(createInitialPayableListFilters());
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
        if (mode === 'detail' && documentId === item.id) {
          await refreshDetail(item.id);
        }
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Gagal melunasi hutang',
        );
      } finally {
        setPayingId(null);
      }
    },
    [canPay, documentId, mode, refreshDetail, refreshList],
  );

  const onUploadPayableProof = useCallback(
    async (item: KolamPayable) => {
      if (!item.id || !canPay) {
        return;
      }
      setError('');
      setStatusMessage('');
      let picked;
      try {
        picked = await pickNativeAssetFile();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal pilih bukti');
        return;
      }
      if (picked.cancelled) {
        return;
      }
      const localUri = picked.uri ?? picked.path ?? '';
      if (!localUri.trim()) {
        setError('File bukti wajib');
        return;
      }
      setUploadingProof(true);
      try {
        const updated = await uploadKolamPayableProof(item.id, localUri);
        setDetailItem(updated);
        setStatusMessage('Bukti pembayaran diunggah');
        await refreshList();
        await refreshDetail(item.id);
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Gagal unggah bukti',
        );
      } finally {
        setUploadingProof(false);
      }
    },
    [canPay, refreshDetail, refreshList],
  );

  const onPayInstallment = useCallback(
    async (
      item: KolamPayable,
      installment: KolamPayableInstallment,
      withProof = false,
    ) => {
      if (
        !item.id ||
        !installment.id ||
        !canPay ||
        installment.status !== 'pending'
      ) {
        return;
      }
      const nextPending = installments.find(row => row.status === 'pending');
      if (nextPending && nextPending.id !== installment.id) {
        setError('Bayar cicilan sebelumnya dulu');
        return;
      }
      setError('');
      setStatusMessage('');
      let proofUri = '';
      if (withProof) {
        try {
          const picked = await pickNativeAssetFile();
          if (picked.cancelled) {
            return;
          }
          proofUri = picked.uri ?? picked.path ?? '';
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Gagal pilih bukti');
          return;
        }
        if (!proofUri.trim()) {
          setError('File bukti wajib');
          return;
        }
      }
      setPayingInstallmentId(installment.id);
      try {
        const updated = await payKolamPayableInstallment(
          item.id,
          installment.id,
          proofUri ? [proofUri] : [],
        );
        if (updated.length) {
          setInstallments(prev =>
            prev.map(row =>
              row.id === installment.id
                ? updated.find(next => next.id === row.id) ?? row
                : row,
            ),
          );
        }
        setStatusMessage(`Cicilan #${installment.installmentNumber} lunas`);
        await refreshList();
        await refreshDetail(item.id);
        await refreshInstallments(item.id);
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Gagal bayar cicilan',
        );
      } finally {
        setPayingInstallmentId(null);
      }
    },
    [canPay, installments, refreshDetail, refreshInstallments, refreshList],
  );

  const onUploadInstallmentProof = useCallback(
    async (item: KolamPayable, installment: KolamPayableInstallment) => {
      if (
        !item.id ||
        !installment.id ||
        !canPay ||
        installment.status !== 'paid'
      ) {
        return;
      }
      setError('');
      setStatusMessage('');
      let picked;
      try {
        picked = await pickNativeAssetFile();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal pilih bukti');
        return;
      }
      if (picked.cancelled) {
        return;
      }
      const localUri = picked.uri ?? picked.path ?? '';
      if (!localUri.trim()) {
        setError('File bukti wajib');
        return;
      }
      setUploadingInstallmentProofId(installment.id);
      try {
        const updated = await uploadKolamPayableInstallmentProof(
          item.id,
          installment.id,
          localUri,
        );
        if (updated.length) {
          setInstallments(prev =>
            prev.map(row =>
              row.id === installment.id
                ? updated.find(next => next.id === row.id) ?? row
                : row,
            ),
          );
        }
        setStatusMessage('Bukti cicilan diunggah');
        await refreshList();
        await refreshDetail(item.id);
        await refreshInstallments(item.id);
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Gagal unggah bukti',
        );
      } finally {
        setUploadingInstallmentProofId(null);
      }
    },
    [canPay, refreshDetail, refreshInstallments, refreshList],
  );

  const clearStatusMessage = useCallback(() => {
    setStatusMessage('');
  }, []);

  return {
    mode,
    documentId,
    filters,
    items,
    detailItem,
    summary,
    pagination,
    installments,
    installmentsLoading,
    loading,
    detailLoading,
    payingId,
    payingInstallmentId,
    uploadingProof,
    uploadingInstallmentProofId,
    error,
    statusMessage,
    canView,
    canCreate,
    canPay,
    onSearchChange,
    onStatusChange,
    onSourceModelChange,
    onOverdueToggle,
    onInstallmentDueChange,
    onPeriodChange,
    onStartDateChange,
    onEndDateChange,
    onSortChange,
    onClearFilters,
    onPageChange,
    onLimitChange,
    onRefresh: refreshList,
    onPayFull,
    onPayInstallment,
    onUploadPayableProof,
    onUploadInstallmentProof,
    clearStatusMessage,
  };
}

function applyPayableClientFilters(
  items: KolamPayable[],
  filters: KolamPayableListFilters,
): KolamPayable[] {
  let next = [...items];

  if (filters.installmentDue !== 'all') {
    const now = new Date();
    next = next.filter(item => {
      const dueDate = item.installmentSummary?.nextInstallment?.dueDate ?? '';
      const days = getPayableDueDeltaDays(dueDate, now);
      if (days == null) {
        return false;
      }
      if (filters.installmentDue === 'overdue') {
        return days < 0;
      }
      return days >= 0 && days <= 7;
    });
  }

  if (filters.sort === 'next_installment_due_asc') {
    next.sort(comparePayableByNextInstallmentDue);
  }

  return next;
}

function comparePayableByNextInstallmentDue(
  left: KolamPayable,
  right: KolamPayable,
): number {
  const leftTime = getPayableTimestamp(
    left.installmentSummary?.nextInstallment?.dueDate,
  );
  const rightTime = getPayableTimestamp(
    right.installmentSummary?.nextInstallment?.dueDate,
  );
  if (leftTime == null && rightTime == null) {
    return 0;
  }
  if (leftTime == null) {
    return 1;
  }
  if (rightTime == null) {
    return -1;
  }
  return leftTime - rightTime;
}

function getPayableDueDeltaDays(value: string, now: Date): number | null {
  const timestamp = getPayableTimestamp(value);
  if (timestamp == null) {
    return null;
  }
  const nowMs = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  return Math.floor((timestamp - nowMs) / 86400000);
}

function getPayableTimestamp(value?: string): number | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

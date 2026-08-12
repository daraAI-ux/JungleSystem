import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  buildCommissionListRoute,
  canReleaseCommissionRowFromNormalized,
  createInitialCommissionListFilters,
  getKolamCommissionSummaryTotals,
  getKolamCommissionSurfaceMode,
  hasKolamCommissionPermission,
  KOLAM_COMMISSION_DEFAULT_LIMIT,
  type KolamCommissionListFilters,
  type KolamCommissionListRow,
  type KolamCommissionRecipientSummaryRow,
  type KolamCommissionSummaryTotals,
  type KolamCommissionStatusFilter,
} from '../domain/kolam-commission';
import type { KolamWalletOption } from '../domain/kolam-wallet-option';
import { ApiError } from '../lib/api-error';
import {
  accrueKolamCommission,
  fetchKolamCommissionRecipientSummary,
  fetchKolamCommissionList,
  recalculateKolamCommission,
  releaseKolamCommission,
  releaseKolamCommissionBatch,
  uploadKolamCommissionTransferProof,
} from '../services/kolam-commission-api';
import { pickNativeAssetFile } from '../services/native-file-picker';
import { getKolamWalletOptionsPaginated } from '../services/kolam-wallet-option-api';

export interface KolamCommissionListController {
  mode: 'list' | 'unsupported';
  filters: KolamCommissionListFilters;
  rows: KolamCommissionListRow[];
  recipientSummaryRows: KolamCommissionRecipientSummaryRow[];
  summaryTotals: KolamCommissionSummaryTotals;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  actionSaleId: string;
  batchEligibleCount: number;
  batchWalletId: string;
  wallets: KolamWalletOption[];
  walletByRow: Record<string, string>;
  loading: boolean;
  summaryLoading: boolean;
  releasingId: string | null;
  adminAction: string | null;
  uploadingProofId: string | null;
  error: string;
  statusMessage: string;
  canView: boolean;
  canRelease: boolean;
  onSearchChange: (value: string) => void;
  onRecipientFilterChange: (recipientUser: string) => void;
  onActionSaleIdChange: (value: string) => void;
  onBatchWalletChange: (walletId: string) => void;
  onStatusChange: (status: KolamCommissionStatusFilter) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onWalletChange: (rowId: string, walletId: string) => void;
  onRefresh: () => Promise<void>;
  onRelease: (row: KolamCommissionListRow) => Promise<void>;
  onUploadTransferProof: (row: KolamCommissionListRow) => Promise<void>;
  onReleaseBatch: () => Promise<void>;
  onAccrueSale: () => Promise<void>;
  onRecalculateSale: () => Promise<void>;
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
  const [recipientSummaryRows, setRecipientSummaryRows] = useState<
    KolamCommissionRecipientSummaryRow[]
  >([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: KOLAM_COMMISSION_DEFAULT_LIMIT,
    total: 0,
    totalPages: 1,
  });
  const [actionSaleId, setActionSaleId] = useState('');
  const [batchWalletId, setBatchWalletId] = useState('');
  const [wallets, setWallets] = useState<KolamWalletOption[]>([]);
  const [walletByRow, setWalletByRow] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [adminAction, setAdminAction] = useState<string | null>(null);
  const [uploadingProofId, setUploadingProofId] = useState<string | null>(null);
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

  const refreshSummary = useCallback(async () => {
    if (!canView || mode !== 'list') {
      return;
    }
    setSummaryLoading(true);
    try {
      const result = await fetchKolamCommissionRecipientSummary();
      setRecipientSummaryRows(result.data);
    } catch {
      setRecipientSummaryRows([]);
    } finally {
      setSummaryLoading(false);
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
    filters.recipientUser,
    filters.search,
    filters.status,
    mode,
    refresh,
  ]);

  useEffect(() => {
    if (mode !== 'list' || !canView) {
      return;
    }
    void refreshSummary();
  }, [canView, mode, refreshSummary]);

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

  const onRecipientFilterChange = useCallback(
    (recipientUser: string) => {
      patchFilters({ recipientUser, page: 1 });
    },
    [patchFilters],
  );

  const onActionSaleIdChange = useCallback((value: string) => {
    setActionSaleId(value);
  }, []);

  const onBatchWalletChange = useCallback((walletId: string) => {
    setBatchWalletId(walletId);
  }, []);

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
        await refreshSummary();
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
    [canRelease, refresh, refreshSummary, walletByRow],
  );

  const onUploadTransferProof = useCallback(
    async (row: KolamCommissionListRow) => {
      if (!canRelease || !row.id || row.status !== 'released') {
        return;
      }
      setError('');
      setStatusMessage('');
      let picked;
      try {
        picked = await pickNativeAssetFile();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Gagal pilih bukti transfer',
        );
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
      setUploadingProofId(row.id);
      try {
        await uploadKolamCommissionTransferProof(row.id, localUri);
        setStatusMessage('Bukti transfer diunggah');
        await refresh();
        await refreshSummary();
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Gagal unggah bukti',
        );
      } finally {
        setUploadingProofId(null);
      }
    },
    [canRelease, refresh, refreshSummary],
  );

  const refreshAll = useCallback(async () => {
    await refresh();
    await refreshSummary();
  }, [refresh, refreshSummary]);

  const batchEligibleRows = useMemo(
    () =>
      rows.filter(row =>
        canReleaseCommissionRowFromNormalized({
          status: row.status,
          canRelease: row.canRelease,
        }),
      ),
    [rows],
  );

  const runAdminAction = useCallback(
    async (actionId: string, task: () => Promise<void>, success: string) => {
      if (!canRelease) {
        return;
      }
      setAdminAction(actionId);
      setError('');
      setStatusMessage('');
      try {
        await task();
        setStatusMessage(success);
        await refreshAll();
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Aksi komisi gagal',
        );
      } finally {
        setAdminAction(null);
      }
    },
    [canRelease, refreshAll],
  );

  const onReleaseBatch = useCallback(async () => {
    if (!batchEligibleRows.length) {
      setError('Tidak ada baris eligible');
      return;
    }
    if (!batchWalletId) {
      setError('Pilih dompet');
      return;
    }
    await runAdminAction(
      'release-batch',
      () =>
        releaseKolamCommissionBatch(
          batchEligibleRows.map(row => row.id),
          batchWalletId,
        ),
      'Komisi dibayar',
    );
  }, [batchEligibleRows, batchWalletId, runAdminAction]);

  const onAccrueSale = useCallback(async () => {
    const saleId = actionSaleId.trim();
    if (!saleId) {
      setError('Sale ID wajib');
      return;
    }
    await runAdminAction(
      'accrue',
      () => accrueKolamCommission(saleId),
      'Komisi diakru',
    );
  }, [actionSaleId, runAdminAction]);

  const onRecalculateSale = useCallback(async () => {
    const saleId = actionSaleId.trim();
    if (!saleId) {
      setError('Sale ID wajib');
      return;
    }
    await runAdminAction(
      'recalculate',
      () => recalculateKolamCommission(saleId, true),
      'Komisi dihitung ulang',
    );
  }, [actionSaleId, runAdminAction]);

  const summaryTotals = useMemo(
    () => getKolamCommissionSummaryTotals(recipientSummaryRows),
    [recipientSummaryRows],
  );

  return useMemo(
    () => ({
      mode,
      filters,
      rows,
      recipientSummaryRows,
      summaryTotals,
      pagination,
      actionSaleId,
      batchEligibleCount: batchEligibleRows.length,
      batchWalletId,
      wallets,
      walletByRow,
      loading,
      summaryLoading,
      releasingId,
      adminAction,
      uploadingProofId,
      error,
      statusMessage,
      canView,
      canRelease,
      onSearchChange,
      onRecipientFilterChange,
      onActionSaleIdChange,
      onBatchWalletChange,
      onStatusChange,
      onPageChange,
      onLimitChange,
      onWalletChange,
      onRefresh: refresh,
      onRelease,
      onUploadTransferProof,
      onReleaseBatch,
      onAccrueSale,
      onRecalculateSale,
    }),
    [
      mode,
      filters,
      rows,
      recipientSummaryRows,
      summaryTotals,
      pagination,
      actionSaleId,
      batchEligibleRows.length,
      batchWalletId,
      wallets,
      walletByRow,
      loading,
      summaryLoading,
      releasingId,
      adminAction,
      uploadingProofId,
      error,
      statusMessage,
      canView,
      canRelease,
      onSearchChange,
      onRecipientFilterChange,
      onActionSaleIdChange,
      onBatchWalletChange,
      onStatusChange,
      onPageChange,
      onLimitChange,
      onWalletChange,
      refresh,
      onRelease,
      onUploadTransferProof,
      onReleaseBatch,
      onAccrueSale,
      onRecalculateSale,
    ],
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { KolamProductOption } from '../domain/kolam-product-option';
import type { KolamSpecies } from '../domain/kolam-species';
import {
  createInitialStockTransactionListFilters,
  getKolamStockTransactionBreadcrumbPath,
  getKolamStockTransactionRouteId,
  isKolamStockTransactionDetailRoute,
  isKolamStockTransactionListRoute,
  isKolamStockTransactionOpnameRoute,
  isKolamStockTransactionRoute,
  type KolamStockTransaction,
  type KolamStockTransactionListFilters,
  type KolamStockTransactionPagination,
  type KolamStockTransactionPendingReturn,
  type KolamStockTransactionStatus,
} from '../domain/kolam-stock-transaction';
import { getErrorMessage } from '../lib/api-error';
import { getKolamProductOptions } from '../services/kolam-product-option-api';
import { getKolamSpeciesList } from '../services/kolam-species-api';
import {
  cancelKolamStockTransactionFinance,
  downloadKolamStockTransactionExport,
  getKolamStockTransaction,
  getKolamStockTransactionList,
  verifyKolamStockTransaction,
} from '../services/kolam-stock-transaction-api';

export type KolamStockTransactionSurfaceMode = 'list' | 'detail' | 'opname';
export type KolamStockTransactionDataSource = 'idle' | 'live' | 'error';

const DEFAULT_PAGINATION: KolamStockTransactionPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

export interface KolamStockTransactionController {
  breadcrumbPath: string;
  dataSource: KolamStockTransactionDataSource;
  error: string | null;
  exporting: boolean;
  filters: KolamStockTransactionListFilters;
  loading: boolean;
  mode: KolamStockTransactionSurfaceMode;
  mutating: boolean;
  pagination: KolamStockTransactionPagination;
  pendingReturns: KolamStockTransactionPendingReturn[];
  productOptions: KolamProductOption[];
  selectedTransaction: KolamStockTransaction | null;
  speciesOptions: KolamSpecies[];
  statusMessage: string | null;
  transactions: KolamStockTransaction[];
  onCancelFinance: () => Promise<boolean>;
  onChangeFilters: (patch: Partial<KolamStockTransactionListFilters>) => void;
  onClearFilters: () => void;
  onExport: () => Promise<void>;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => Promise<void>;
  onSearchChange: (search: string) => void;
  onVerify: () => Promise<boolean>;
}

export function useKolamStockTransactionController(
  route: string,
): KolamStockTransactionController {
  const initialMode = getInitialMode(route);
  const [mode, setMode] = useState<KolamStockTransactionSurfaceMode>(initialMode);
  const [filters, setFilters] = useState<KolamStockTransactionListFilters>(() =>
    createInitialStockTransactionListFilters(route),
  );
  const [transactions, setTransactions] = useState<KolamStockTransaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<KolamStockTransaction | null>(null);
  const [pagination, setPagination] =
    useState<KolamStockTransactionPagination>(DEFAULT_PAGINATION);
  const [pendingReturns, setPendingReturns] = useState<
    KolamStockTransactionPendingReturn[]
  >([]);
  const [productOptions, setProductOptions] = useState<KolamProductOption[]>([]);
  const [speciesOptions, setSpeciesOptions] = useState<KolamSpecies[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] =
    useState<KolamStockTransactionDataSource>('idle');

  useEffect(() => {
    const nextMode = getInitialMode(route);
    setMode(nextMode);
    if (nextMode === 'list') {
      setFilters(createInitialStockTransactionListFilters(route));
      setSelectedTransaction(null);
    }
    if (nextMode === 'opname') {
      setSelectedTransaction(null);
    }
    setError(null);
    setStatusMessage(null);
  }, [route]);

  const refreshOptions = useCallback(async () => {
    const [productResult, speciesResult] = await Promise.allSettled([
      getKolamProductOptions(),
      getKolamSpeciesList({ limit: 1000, page: 1 }),
    ]);
    if (productResult.status === 'fulfilled') {
      setProductOptions(productResult.value);
    }
    if (speciesResult.status === 'fulfilled') {
      setSpeciesOptions(speciesResult.value.data);
    }
  }, []);

  const refreshList = useCallback(async () => {
    if (!isKolamStockTransactionListRoute(route)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await refreshOptions();
      const liveResult = await getKolamStockTransactionList(filters);
      setTransactions(liveResult.data);
      setPagination(liveResult.pagination);
      setPendingReturns(liveResult.pendingReturnExpectations);
      setDataSource('live');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [filters, refreshOptions, route]);

  const refreshDetail = useCallback(async () => {
    const id = getKolamStockTransactionRouteId(route);
    if (!id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const live = await getKolamStockTransaction(id);
      setSelectedTransaction(live);
      setDataSource('live');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [route]);

  const refresh = useCallback(async () => {
    if (!isKolamStockTransactionRoute(route)) {
      return;
    }
    if (isKolamStockTransactionListRoute(route)) {
      await refreshList();
      return;
    }
    if (isKolamStockTransactionDetailRoute(route)) {
      await refreshDetail();
    }
  }, [refreshDetail, refreshList, route]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onChangeFilters = useCallback(
    (patch: Partial<KolamStockTransactionListFilters>) => {
      setFilters(current => {
        const next: KolamStockTransactionListFilters = {
          ...current,
          ...patch,
          page: patch.page ?? 1,
        };
        if (patch.productId !== undefined && patch.productId) {
          next.speciesId = '';
        }
        if (patch.speciesId !== undefined && patch.speciesId) {
          next.productId = '';
        }
        if (patch.status !== undefined) {
          next.status =
            patch.status === 'verified' || patch.status === 'unverified'
              ? (patch.status as KolamStockTransactionStatus)
              : '';
        }
        return next;
      });
    },
    [],
  );

  const onClearFilters = useCallback(() => {
    setFilters({
      search: '',
      productId: '',
      speciesId: '',
      stockOpnameId: '',
      status: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 10,
    });
  }, []);

  const onSearchChange = useCallback((search: string) => {
    setFilters(current => ({ ...current, search, page: 1 }));
  }, []);

  const onPageChange = useCallback((page: number) => {
    setFilters(current => ({ ...current, page: Math.max(1, page) }));
  }, []);

  const onLimitChange = useCallback((limit: number) => {
    setFilters(current => ({ ...current, limit, page: 1 }));
  }, []);

  const onExport = useCallback(async () => {
    setExporting(true);
    setError(null);
    try {
      await downloadKolamStockTransactionExport(filters);
    } catch (exportError) {
      setError(getErrorMessage(exportError));
    } finally {
      setExporting(false);
    }
  }, [filters]);

  const onVerify = useCallback(async () => {
    const id = selectedTransaction?.id || getKolamStockTransactionRouteId(route);
    if (!id) {
      return false;
    }
    setMutating(true);
    setError(null);
    setStatusMessage(null);
    try {
      const updated = await verifyKolamStockTransaction(id);
      setSelectedTransaction(updated);
      setStatusMessage('Verifikasi finance berhasil');
      setDataSource('live');
      return true;
    } catch (verifyError) {
      setError(getErrorMessage(verifyError));
      return false;
    } finally {
      setMutating(false);
    }
  }, [route, selectedTransaction?.id]);

  const onCancelFinance = useCallback(async () => {
    const id = selectedTransaction?.id || getKolamStockTransactionRouteId(route);
    if (!id) {
      return false;
    }
    setMutating(true);
    setError(null);
    setStatusMessage(null);
    try {
      const updated = await cancelKolamStockTransactionFinance(id);
      setSelectedTransaction(updated);
      setStatusMessage('Finance dibatalkan untuk transaksi ini');
      setDataSource('live');
      return true;
    } catch (cancelError) {
      setError(getErrorMessage(cancelError));
      return false;
    } finally {
      setMutating(false);
    }
  }, [route, selectedTransaction?.id]);

  const breadcrumbPath = useMemo(
    () => getKolamStockTransactionBreadcrumbPath(mode),
    [mode],
  );

  return {
    breadcrumbPath,
    dataSource,
    error,
    exporting,
    filters,
    loading,
    mode,
    mutating,
    pagination,
    pendingReturns,
    productOptions,
    selectedTransaction,
    speciesOptions,
    statusMessage,
    transactions,
    onCancelFinance,
    onChangeFilters,
    onClearFilters,
    onExport,
    onLimitChange,
    onPageChange,
    onRefresh: refresh,
    onSearchChange,
    onVerify,
  };
}

function getInitialMode(route: string): KolamStockTransactionSurfaceMode {
  if (isKolamStockTransactionOpnameRoute(route)) {
    return 'opname';
  }
  if (isKolamStockTransactionDetailRoute(route)) {
    return 'detail';
  }
  return 'list';
}

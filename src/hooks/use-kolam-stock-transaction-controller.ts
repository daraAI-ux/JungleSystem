import { useCallback, useEffect, useMemo, useState } from 'react';
import type { KolamProductOption } from '../domain/kolam-product-option';
import type { KolamSpecies } from '../domain/kolam-species';
import {
  createInitialStockTransactionListFilters,
  getKolamStockTransactionBreadcrumbPath,
  isKolamStockTransactionListRoute,
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
  downloadKolamStockTransactionExport,
  getKolamStockTransactionList,
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
  pagination: KolamStockTransactionPagination;
  pendingReturns: KolamStockTransactionPendingReturn[];
  productOptions: KolamProductOption[];
  speciesOptions: KolamSpecies[];
  transactions: KolamStockTransaction[];
  onChangeFilters: (patch: Partial<KolamStockTransactionListFilters>) => void;
  onClearFilters: () => void;
  onExport: () => Promise<void>;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => Promise<void>;
  onSearchChange: (search: string) => void;
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
  const [pagination, setPagination] =
    useState<KolamStockTransactionPagination>(DEFAULT_PAGINATION);
  const [pendingReturns, setPendingReturns] = useState<
    KolamStockTransactionPendingReturn[]
  >([]);
  const [productOptions, setProductOptions] = useState<KolamProductOption[]>([]);
  const [speciesOptions, setSpeciesOptions] = useState<KolamSpecies[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] =
    useState<KolamStockTransactionDataSource>('idle');

  useEffect(() => {
    setMode(getInitialMode(route));
    setFilters(createInitialStockTransactionListFilters(route));
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

  const refresh = useCallback(async () => {
    if (!isKolamStockTransactionRoute(route)) {
      return;
    }
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
    pagination,
    pendingReturns,
    productOptions,
    speciesOptions,
    transactions,
    onChangeFilters,
    onClearFilters,
    onExport,
    onLimitChange,
    onPageChange,
    onRefresh: refresh,
    onSearchChange,
  };
}

function getInitialMode(route: string): KolamStockTransactionSurfaceMode {
  const path = route.trim().split('?')[0].replace(/\/+$/, '');
  if (path.endsWith('/opname')) {
    return 'opname';
  }
  if (/\/stock-transaction\/[^/]+$/.test(path) && !path.endsWith('/opname')) {
    return 'detail';
  }
  return 'list';
}

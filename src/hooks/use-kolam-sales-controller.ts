import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createInitialKolamSaleListFilters,
  getKolamSaleBreadcrumbPath,
  getKolamSaleRouteId,
  getKolamSaleSurfaceMode,
  isKolamSalesDetailRoute,
  isKolamSalesListRoute,
  isKolamSalesRoute,
  type KolamSale,
  type KolamSaleListFilters,
  type KolamSalePagination,
  type KolamSaleSurfaceMode,
} from '../domain/kolam-sales';
import { getErrorMessage } from '../lib/api-error';
import { getKolamSale, getKolamSalesList } from '../services/kolam-sales-api';

export type KolamSalesDataSource = 'idle' | 'live' | 'error';

const DEFAULT_PAGINATION: KolamSalePagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

export interface KolamSalesController {
  breadcrumbPath: string;
  dataSource: KolamSalesDataSource;
  documentId: string | null;
  error: string | null;
  filters: KolamSaleListFilters;
  loading: boolean;
  mode: KolamSaleSurfaceMode;
  pagination: KolamSalePagination;
  sales: KolamSale[];
  selectedSale: KolamSale | null;
  statusMessage: string | null;
  onChangeFilters: (patch: Partial<KolamSaleListFilters>) => void;
  onClearFilters: () => void;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => Promise<void>;
  onSearchChange: (search: string) => void;
  onSelectSale: (sale: KolamSale) => void;
}

export function useKolamSalesController(route: string): KolamSalesController {
  const [mode, setMode] = useState<KolamSaleSurfaceMode>(() =>
    getKolamSaleSurfaceMode(route),
  );
  const [filters, setFilters] = useState<KolamSaleListFilters>(() =>
    createInitialKolamSaleListFilters(route),
  );
  const [sales, setSales] = useState<KolamSale[]>([]);
  const [selectedSale, setSelectedSale] = useState<KolamSale | null>(null);
  const [pagination, setPagination] =
    useState<KolamSalePagination>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<KolamSalesDataSource>('idle');
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const documentId = useMemo(() => getKolamSaleRouteId(route), [route]);

  useEffect(() => {
    const nextMode = getKolamSaleSurfaceMode(route);
    setMode(nextMode);
    if (nextMode === 'list') {
      setFilters(createInitialKolamSaleListFilters(route));
      setSelectedSale(null);
    }
    setError(null);
    setStatusMessage(null);
  }, [route]);

  const refreshList = useCallback(async () => {
    if (!isKolamSalesListRoute(route)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getKolamSalesList(filtersRef.current);
      setSales(result.data);
      setPagination(result.pagination);
      setDataSource('live');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [route]);

  const refreshDetail = useCallback(async () => {
    const id = getKolamSaleRouteId(route);
    if (!id) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const sale = await getKolamSale(id);
      setSelectedSale(sale);
      setDataSource('live');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [route]);

  const onRefresh = useCallback(async () => {
    if (!isKolamSalesRoute(route)) {
      return;
    }
    if (isKolamSalesListRoute(route)) {
      await refreshList();
      return;
    }
    if (isKolamSalesDetailRoute(route)) {
      await refreshDetail();
    }
  }, [refreshDetail, refreshList, route]);

  useEffect(() => {
    void onRefresh();
  }, [onRefresh, filters]);

  const onChangeFilters = useCallback(
    (patch: Partial<KolamSaleListFilters>) => {
      setFilters(prev => {
        const next = { ...prev, ...patch };
        if (
          patch.search !== undefined ||
          patch.status !== undefined ||
          patch.deliveryStatus !== undefined ||
          patch.lifecycle !== undefined ||
          patch.needsAction !== undefined ||
          patch.startDate !== undefined ||
          patch.endDate !== undefined
        ) {
          next.page = 1;
        }
        return next;
      });
    },
    [],
  );

  const onClearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: '',
      deliveryStatus: '',
      lifecycle: 'active',
      needsAction: false,
      startDate: '',
      endDate: '',
      page: 1,
      limit: filtersRef.current.limit,
    });
  }, []);

  const onSearchChange = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
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

  const onSelectSale = useCallback((sale: KolamSale) => {
    setSelectedSale(sale);
  }, []);

  return {
    breadcrumbPath: getKolamSaleBreadcrumbPath(mode),
    dataSource,
    documentId,
    error,
    filters,
    loading,
    mode,
    pagination,
    sales,
    selectedSale,
    statusMessage,
    onChangeFilters,
    onClearFilters,
    onLimitChange,
    onPageChange,
    onRefresh,
    onSearchChange,
    onSelectSale,
  };
}

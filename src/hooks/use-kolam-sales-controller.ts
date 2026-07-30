import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  canMarkKolamSalePaid,
  createInitialKolamSaleListFilters,
  formatKolamSaleMutationError,
  getKolamSaleAllowedStatusTransitions,
  getKolamSaleBreadcrumbPath,
  getKolamSaleRouteId,
  getKolamSaleSurfaceMode,
  isKolamSaleMarketplaceManaged,
  isKolamSalesDetailRoute,
  isKolamSalesListRoute,
  isKolamSalesRoute,
  type KolamSale,
  type KolamSaleListFilters,
  type KolamSalePagination,
  type KolamSaleStatusTransitionTarget,
  type KolamSaleSurfaceMode,
} from '../domain/kolam-sales';
import { getErrorMessage } from '../lib/api-error';
import {
  downloadKolamSaleInvoice,
  getKolamSale,
  getKolamSalesList,
  updateKolamSaleStatus,
  uploadKolamSalePaymentProofs,
} from '../services/kolam-sales-api';
import { pickNativeImageFile } from '../services/native-file-picker';

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
  downloadingInvoice: boolean;
  error: string | null;
  filters: KolamSaleListFilters;
  loading: boolean;
  mode: KolamSaleSurfaceMode;
  mutating: boolean;
  pagination: KolamSalePagination;
  sales: KolamSale[];
  selectedSale: KolamSale | null;
  statusMessage: string | null;
  onChangeFilters: (patch: Partial<KolamSaleListFilters>) => void;
  onClearFilters: () => void;
  onDownloadInvoice: () => Promise<boolean>;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
  onPickImage: () => Promise<string | null>;
  onRefresh: () => Promise<void>;
  onSearchChange: (search: string) => void;
  onSelectSale: (sale: KolamSale) => void;
  onUpdateStatus: (status: KolamSaleStatusTransitionTarget) => Promise<boolean>;
  onUploadPaymentProof: (localUri: string) => Promise<boolean>;
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
  const [mutating, setMutating] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
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

  const onPickImage = useCallback(async () => {
    try {
      const picked = await pickNativeImageFile();
      if (picked.cancelled || !picked.uri) {
        return null;
      }
      return picked.uri;
    } catch (pickError) {
      setError(getErrorMessage(pickError));
      return null;
    }
  }, []);

  const onUpdateStatus = useCallback(
    async (status: KolamSaleStatusTransitionTarget) => {
      const sale = selectedSale;
      if (!sale) {
        return false;
      }
      if (isKolamSaleMarketplaceManaged(sale)) {
        setError(
          'Status pembayaran marketplace dikelola otomatis dan tidak bisa diubah di sini.',
        );
        return false;
      }
      const allowed = getKolamSaleAllowedStatusTransitions(sale.status);
      if (!allowed.includes(status)) {
        setError('Transisi status tidak diizinkan dari status saat ini.');
        return false;
      }
      if (status === 'paid') {
        const gate = canMarkKolamSalePaid(sale);
        if (!gate.ok) {
          setError(gate.reason);
          return false;
        }
      }

      setMutating(true);
      setError(null);
      setStatusMessage(null);
      try {
        const updated = await updateKolamSaleStatus(sale.id, status);
        setSelectedSale(updated);
        setStatusMessage('Status berhasil diubah.');
        setDataSource('live');
        return true;
      } catch (mutationError) {
        setError(formatKolamSaleMutationError(mutationError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [selectedSale],
  );

  const onUploadPaymentProof = useCallback(
    async (localUri: string) => {
      const sale = selectedSale;
      if (!sale) {
        return false;
      }
      setMutating(true);
      setError(null);
      setStatusMessage(null);
      try {
        const updated = await uploadKolamSalePaymentProofs(sale.id, [localUri]);
        setSelectedSale(updated);
        setStatusMessage('Bukti pembayaran berhasil diunggah.');
        setDataSource('live');
        return true;
      } catch (mutationError) {
        setError(formatKolamSaleMutationError(mutationError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [selectedSale],
  );

  const onDownloadInvoice = useCallback(async () => {
    const sale = selectedSale;
    if (!sale) {
      return false;
    }
    setDownloadingInvoice(true);
    setError(null);
    setStatusMessage(null);
    try {
      const result = await downloadKolamSaleInvoice(sale.id, sale.invoiceCode);
      setStatusMessage(
        result.path
          ? `Invoice disimpan: ${result.name}`
          : `Invoice diunduh: ${result.name}`,
      );
      return true;
    } catch (downloadError) {
      setError(formatKolamSaleMutationError(downloadError));
      return false;
    } finally {
      setDownloadingInvoice(false);
    }
  }, [selectedSale]);

  return {
    breadcrumbPath: getKolamSaleBreadcrumbPath(mode),
    dataSource,
    documentId,
    downloadingInvoice,
    error,
    filters,
    loading,
    mode,
    mutating,
    pagination,
    sales,
    selectedSale,
    statusMessage,
    onChangeFilters,
    onClearFilters,
    onDownloadInvoice,
    onLimitChange,
    onPageChange,
    onPickImage,
    onRefresh,
    onSearchChange,
    onSelectSale,
    onUpdateStatus,
    onUploadPaymentProof,
  };
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KolamCustomer } from '../domain/kolam-customer';
import type { KolamProduct } from '../domain/kolam-product';
import type { KolamSpecies } from '../domain/kolam-species';
import {
  buildKolamSaleCreateBody,
  canMarkKolamSalePaid,
  createInitialKolamSaleCreateForm,
  createInitialKolamSaleListFilters,
  createEmptyKolamSaleCreateItem,
  filterOptionsBySalesSource,
  formatKolamSaleMutationError,
  getKolamSaleAllowedStatusTransitions,
  getKolamSaleBreadcrumbPath,
  getKolamSaleRouteId,
  getKolamSaleSurfaceMode,
  isKolamSaleMarketplaceManaged,
  isKolamSalesCreateRoute,
  isKolamSalesDetailRoute,
  isKolamSalesListRoute,
  isKolamSalesRoute,
  pickDefaultOfflinePosSourceId,
  validateKolamSaleCreatePayload,
  type KolamSale,
  type KolamSaleCreateFormState,
  type KolamSaleCreateItemForm,
  type KolamSaleListFilters,
  type KolamSalePagination,
  type KolamSaleSourceOption,
  type KolamSaleStatusTransitionTarget,
  type KolamSaleSurfaceMode,
} from '../domain/kolam-sales';
import { getErrorMessage } from '../lib/api-error';
import { getKolamCustomerList } from '../services/kolam-customer-api';
import {
  getKolamPaymentMethods,
  type KolamPaymentMethod,
} from '../services/kolam-financial-settings-api';
import { getKolamProducts } from '../services/kolam-product-api';
import {
  createKolamSale,
  downloadKolamSaleInvoice,
  getKolamSale,
  getKolamSalesActiveSources,
  getKolamSalesList,
  updateKolamSaleStatus,
  uploadKolamSalePaymentProofs,
} from '../services/kolam-sales-api';
import { getKolamSpeciesList } from '../services/kolam-species-api';
import { pickNativeImageFile } from '../services/native-file-picker';

export type KolamSalesDataSource = 'idle' | 'live' | 'error';

const DEFAULT_PAGINATION: KolamSalePagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

const CREATE_OPTIONS_LIMIT = 200;

export interface KolamSalesController {
  breadcrumbPath: string;
  customers: KolamCustomer[];
  dataSource: KolamSalesDataSource;
  documentId: string | null;
  downloadingInvoice: boolean;
  error: string | null;
  filteredCustomers: KolamCustomer[];
  filteredPaymentMethods: KolamPaymentMethod[];
  filters: KolamSaleListFilters;
  form: KolamSaleCreateFormState;
  loading: boolean;
  mode: KolamSaleSurfaceMode;
  mutating: boolean;
  optionsLoading: boolean;
  pagination: KolamSalePagination;
  paymentMethods: KolamPaymentMethod[];
  products: KolamProduct[];
  sales: KolamSale[];
  selectedSale: KolamSale | null;
  sources: KolamSaleSourceOption[];
  species: KolamSpecies[];
  statusMessage: string | null;
  onAddCreateItem: () => void;
  onChangeCreateItem: (
    key: string,
    patch: Partial<KolamSaleCreateItemForm>,
  ) => void;
  onChangeFilters: (patch: Partial<KolamSaleListFilters>) => void;
  onChangeForm: (patch: Partial<KolamSaleCreateFormState>) => void;
  onClearFilters: () => void;
  onDownloadInvoice: () => Promise<boolean>;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
  onPickImage: () => Promise<string | null>;
  onRefresh: () => Promise<void>;
  onRemoveCreateItem: (key: string) => void;
  onSave: () => Promise<string | null>;
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
  const [form, setForm] = useState<KolamSaleCreateFormState>(() =>
    createInitialKolamSaleCreateForm(),
  );
  const [sales, setSales] = useState<KolamSale[]>([]);
  const [selectedSale, setSelectedSale] = useState<KolamSale | null>(null);
  const [pagination, setPagination] =
    useState<KolamSalePagination>(DEFAULT_PAGINATION);
  const [sources, setSources] = useState<KolamSaleSourceOption[]>([]);
  const [customers, setCustomers] = useState<KolamCustomer[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<KolamPaymentMethod[]>(
    [],
  );
  const [products, setProducts] = useState<KolamProduct[]>([]);
  const [species, setSpecies] = useState<KolamSpecies[]>([]);
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<KolamSalesDataSource>('idle');
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const documentId = useMemo(() => getKolamSaleRouteId(route), [route]);

  const selectedSource = useMemo(
    () => sources.find(source => source.id === form.sourceRefId) ?? null,
    [form.sourceRefId, sources],
  );

  const filteredCustomers = useMemo(
    () => filterOptionsBySalesSource(customers, selectedSource),
    [customers, selectedSource],
  );

  const filteredPaymentMethods = useMemo(
    () => filterOptionsBySalesSource(paymentMethods, selectedSource),
    [paymentMethods, selectedSource],
  );

  useEffect(() => {
    const nextMode = getKolamSaleSurfaceMode(route);
    setMode(nextMode);
    if (nextMode === 'list') {
      setFilters(createInitialKolamSaleListFilters(route));
      setSelectedSale(null);
    }
    if (nextMode === 'create') {
      setForm(createInitialKolamSaleCreateForm());
      setSelectedSale(null);
    }
    setError(null);
    setStatusMessage(null);
  }, [route]);

  useEffect(() => {
    if (!form.customerId) {
      return;
    }
    if (!filteredCustomers.some(customer => customer.id === form.customerId)) {
      setForm(prev => ({ ...prev, customerId: '' }));
    }
  }, [filteredCustomers, form.customerId]);

  useEffect(() => {
    if (!form.paymentMethodId) {
      return;
    }
    if (
      !filteredPaymentMethods.some(method => method.id === form.paymentMethodId)
    ) {
      setForm(prev => ({ ...prev, paymentMethodId: '' }));
    }
  }, [filteredPaymentMethods, form.paymentMethodId]);

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

  const refreshCreateOptions = useCallback(async () => {
    if (!isKolamSalesCreateRoute(route)) {
      return;
    }
    setOptionsLoading(true);
    setLoading(true);
    setError(null);
    try {
      const [
        sourceRows,
        customerResult,
        paymentResult,
        productResult,
        speciesResult,
      ] = await Promise.all([
        getKolamSalesActiveSources(),
        getKolamCustomerList({ page: 1, limit: CREATE_OPTIONS_LIMIT }),
        getKolamPaymentMethods({ page: 1, limit: CREATE_OPTIONS_LIMIT }),
        getKolamProducts({
          page: 1,
          limit: CREATE_OPTIONS_LIMIT,
          type: 'product',
        }),
        getKolamSpeciesList({
          page: 1,
          limit: CREATE_OPTIONS_LIMIT,
          sellable: 'sellable',
        }),
      ]);

      setSources(sourceRows);
      setCustomers(customerResult.items);
      setPaymentMethods(paymentResult.rows.filter(row => row.isActive));
      setProducts(productResult.data);
      setSpecies(speciesResult.data);
      setDataSource('live');

      const defaultSourceId = pickDefaultOfflinePosSourceId(sourceRows);
      setForm(prev => ({
        ...prev,
        sourceRefId: prev.sourceRefId || defaultSourceId || '',
      }));
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setOptionsLoading(false);
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
    if (isKolamSalesCreateRoute(route)) {
      await refreshCreateOptions();
      return;
    }
    if (isKolamSalesDetailRoute(route)) {
      await refreshDetail();
    }
  }, [refreshCreateOptions, refreshDetail, refreshList, route]);

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

  const onChangeForm = useCallback((patch: Partial<KolamSaleCreateFormState>) => {
    setForm(prev => ({ ...prev, ...patch }));
  }, []);

  const onAddCreateItem = useCallback(() => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, createEmptyKolamSaleCreateItem()],
    }));
  }, []);

  const onChangeCreateItem = useCallback(
    (key: string, patch: Partial<KolamSaleCreateItemForm>) => {
      setForm(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.key === key ? { ...item, ...patch } : item,
        ),
      }));
    },
    [],
  );

  const onRemoveCreateItem = useCallback((key: string) => {
    setForm(prev => {
      if (prev.items.length <= 1) {
        return prev;
      }
      return {
        ...prev,
        items: prev.items.filter(item => item.key !== key),
      };
    });
  }, []);

  const onSave = useCallback(async (): Promise<string | null> => {
    if (!isKolamSalesCreateRoute(route)) {
      return null;
    }
    const body = buildKolamSaleCreateBody(form);
    const validation = validateKolamSaleCreatePayload(body);
    if (!validation.isValid) {
      setError(validation.errors[0] ?? 'Form tidak valid.');
      return null;
    }

    setMutating(true);
    setError(null);
    setStatusMessage(null);
    try {
      const created = await createKolamSale(body);
      setStatusMessage('Invoice penjualan berhasil dibuat.');
      setDataSource('live');
      return created.id;
    } catch (mutationError) {
      setError(formatKolamSaleMutationError(mutationError));
      return null;
    } finally {
      setMutating(false);
    }
  }, [form, route]);

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
    customers,
    dataSource,
    documentId,
    downloadingInvoice,
    error,
    filteredCustomers,
    filteredPaymentMethods,
    filters,
    form,
    loading,
    mode,
    mutating,
    optionsLoading,
    pagination,
    paymentMethods,
    products,
    sales,
    selectedSale,
    sources,
    species,
    statusMessage,
    onAddCreateItem,
    onChangeCreateItem,
    onChangeFilters,
    onChangeForm,
    onClearFilters,
    onDownloadInvoice,
    onLimitChange,
    onPageChange,
    onPickImage,
    onRefresh,
    onRemoveCreateItem,
    onSave,
    onSearchChange,
    onSelectSale,
    onUpdateStatus,
    onUploadPaymentProof,
  };
}

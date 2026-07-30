import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KolamCustomer } from '../domain/kolam-customer';
import type { KolamProduct } from '../domain/kolam-product';
import type { KolamSpecies } from '../domain/kolam-species';
import {
  buildKolamSaleAddItemsBody,
  buildKolamSaleCreateBody,
  buildKolamSaleUpdateBody,
  canAddItemsToKolamSale,
  canEditKolamSaleDraft,
  canMarkKolamSalePaid,
  createEmptyKolamSaleCreateItem,
  createEmptyKolamSaleCustomCost,
  createInitialKolamSaleCreateForm,
  createInitialKolamSaleListFilters,
  filterOptionsBySalesSource,
  formatKolamSaleMutationError,
  getKolamSaleAllowedDeliveryTransitions,
  getKolamSaleAllowedStatusTransitions,
  getKolamSaleBreadcrumbPath,
  getKolamSaleEditRouteId,
  getKolamSaleRouteId,
  getKolamSaleSurfaceMode,
  hydrateKolamSaleCreateFormFromSale,
  isKolamSaleMarketplaceManaged,
  isKolamSalesAddItemsRoute,
  isKolamSalesCreateRoute,
  isKolamSalesDetailRoute,
  isKolamSalesDiscountApprovalRoute,
  isKolamSalesEditRoute,
  isKolamSalesListRoute,
  isKolamSalesRoute,
  isMarketplaceSalesSource,
  pickDefaultOfflinePosSourceId,
  saleHasUnsupportedEditItemTypes,
  validateKolamSaleAddItemsPayload,
  validateKolamSaleCreatePayload,
  validateKolamSaleUpdatePayload,
  type KolamSale,
  type KolamSaleAnalyticsOverview,
  type KolamSaleCatalogOption,
  type KolamSaleCreateFormState,
  type KolamSaleCreateItemForm,
  type KolamSaleCustomCostForm,
  type KolamSaleDeliveryTransitionTarget,
  type KolamSaleListFilters,
  type KolamSaleLivestockAllocationRow,
  type KolamSaleNotificationSummary,
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
  addItemsToKolamSale,
  createKolamSale,
  deleteKolamSalePaymentProof,
  downloadKolamSaleInvoice,
  downloadKolamSaleResi,
  exportKolamSalesListXlsx,
  getKolamSale,
  getKolamSalePendingLivestockAllocations,
  getKolamSalesActiveSources,
  getKolamSalesAnalyticsOverview,
  getKolamSalesEnclosuresForSale,
  getKolamSalesList,
  getKolamSalesNotificationSummary,
  getKolamSalesServices,
  replaceKolamSalePaymentProof,
  requestKolamSaleBiteshipPickup,
  updateKolamSale,
  updateKolamSaleDelivery,
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

const EMPTY_ANALYTICS: KolamSaleAnalyticsOverview = {
  totalSales: 0,
  totalRevenue: 0,
  bySource: [],
};

const EMPTY_NOTIFICATIONS: KolamSaleNotificationSummary = {
  pendingApproval: 0,
  needsAction: 0,
  needDelivery: 0,
};

export interface KolamSalesController {
  analytics: KolamSaleAnalyticsOverview;
  breadcrumbPath: string;
  customers: KolamCustomer[];
  dataSource: KolamSalesDataSource;
  documentId: string | null;
  downloadingInvoice: boolean;
  enclosures: KolamSaleCatalogOption[];
  error: string | null;
  exporting: boolean;
  filteredCustomers: KolamCustomer[];
  filteredPaymentMethods: KolamPaymentMethod[];
  filters: KolamSaleListFilters;
  form: KolamSaleCreateFormState;
  livestockAllocations: KolamSaleLivestockAllocationRow[];
  loading: boolean;
  mode: KolamSaleSurfaceMode;
  mutating: boolean;
  notificationSummary: KolamSaleNotificationSummary;
  optionsLoading: boolean;
  pagination: KolamSalePagination;
  paymentMethods: KolamPaymentMethod[];
  products: KolamProduct[];
  sales: KolamSale[];
  selectedSale: KolamSale | null;
  services: KolamSaleCatalogOption[];
  sources: KolamSaleSourceOption[];
  species: KolamSpecies[];
  statusMessage: string | null;
  useBuyerInfo: boolean;
  onAddCreateItem: (itemType?: KolamSaleCreateItemForm['itemType']) => void;
  onAddCustomCost: () => void;
  onChangeCreateItem: (
    key: string,
    patch: Partial<KolamSaleCreateItemForm>,
  ) => void;
  onChangeCustomCost: (
    key: string,
    patch: Partial<KolamSaleCustomCostForm>,
  ) => void;
  onChangeFilters: (patch: Partial<KolamSaleListFilters>) => void;
  onChangeForm: (patch: Partial<KolamSaleCreateFormState>) => void;
  onClearFilters: () => void;
  onDeletePaymentProof: (proofId: string) => Promise<boolean>;
  onDownloadInvoice: () => Promise<boolean>;
  onDownloadResi: () => Promise<boolean>;
  onExportList: () => Promise<boolean>;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
  onPickImage: () => Promise<string | null>;
  onRefresh: () => Promise<void>;
  onRemoveCreateItem: (key: string) => void;
  onRemoveCustomCost: (key: string) => void;
  onReplacePaymentProof: (proofId: string, localUri: string) => Promise<boolean>;
  onRequestBiteshipPickup: () => Promise<boolean>;
  onSave: () => Promise<string | null>;
  onSearchChange: (search: string) => void;
  onSelectSale: (sale: KolamSale) => void;
  onUpdateDelivery: (
    target: KolamSaleDeliveryTransitionTarget,
  ) => Promise<boolean>;
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
  const [services, setServices] = useState<KolamSaleCatalogOption[]>([]);
  const [enclosures, setEnclosures] = useState<KolamSaleCatalogOption[]>([]);
  const [livestockAllocations, setLivestockAllocations] = useState<
    KolamSaleLivestockAllocationRow[]
  >([]);
  const [analytics, setAnalytics] =
    useState<KolamSaleAnalyticsOverview>(EMPTY_ANALYTICS);
  const [notificationSummary, setNotificationSummary] =
    useState<KolamSaleNotificationSummary>(EMPTY_NOTIFICATIONS);
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<KolamSalesDataSource>('idle');
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const documentId = useMemo(() => {
    return (
      getKolamSaleRouteId(route) ||
      getKolamSaleEditRouteId(route) ||
      null
    );
  }, [route]);

  const selectedSource = useMemo(
    () => sources.find(source => source.id === form.sourceRefId) ?? null,
    [form.sourceRefId, sources],
  );

  const useBuyerInfo = isMarketplaceSalesSource(selectedSource);

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
    if (nextMode === 'create' || nextMode === 'add-items') {
      setForm(createInitialKolamSaleCreateForm());
      setSelectedSale(null);
    }
    if (nextMode === 'approval') {
      setSelectedSale(null);
    }
    setError(null);
    setStatusMessage(null);
  }, [route]);

  useEffect(() => {
    if (useBuyerInfo || !form.customerId) {
      return;
    }
    if (!filteredCustomers.some(customer => customer.id === form.customerId)) {
      setForm(prev => ({ ...prev, customerId: '' }));
    }
  }, [filteredCustomers, form.customerId, useBuyerInfo]);

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

  const loadFormOptions = useCallback(async () => {
    const [
      sourceRows,
      customerResult,
      paymentResult,
      productResult,
      speciesResult,
      serviceRows,
      enclosureRows,
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
      getKolamSalesServices().catch(() => [] as KolamSaleCatalogOption[]),
      getKolamSalesEnclosuresForSale().catch(
        () => [] as KolamSaleCatalogOption[],
      ),
    ]);

    setSources(sourceRows);
    setCustomers(customerResult.items);
    setPaymentMethods(paymentResult.rows.filter(row => row.isActive));
    setProducts(productResult.data);
    setSpecies(speciesResult.data);
    setServices(serviceRows);
    setEnclosures(enclosureRows);
    return sourceRows;
  }, []);

  const refreshList = useCallback(async () => {
    if (!isKolamSalesListRoute(route)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [result, overview, summary] = await Promise.all([
        getKolamSalesList(filtersRef.current),
        getKolamSalesAnalyticsOverview().catch(() => EMPTY_ANALYTICS),
        getKolamSalesNotificationSummary().catch(() => EMPTY_NOTIFICATIONS),
      ]);
      setSales(result.data);
      setPagination(result.pagination);
      setAnalytics(overview);
      setNotificationSummary(summary);
      setDataSource('live');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [route]);

  const refreshApproval = useCallback(async () => {
    if (!isKolamSalesDiscountApprovalRoute(route)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getKolamSalesList({
        search: '',
        status: 'pending',
        deliveryStatus: '',
        lifecycle: 'active',
        needsAction: false,
        startDate: '',
        endDate: '',
        page: 1,
        limit: 20,
      });
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
      const [sale, allocations] = await Promise.all([
        getKolamSale(id),
        getKolamSalePendingLivestockAllocations(id).catch(
          () => [] as KolamSaleLivestockAllocationRow[],
        ),
      ]);
      setSelectedSale(sale);
      setLivestockAllocations(allocations);
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
      const sourceRows = await loadFormOptions();
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
  }, [loadFormOptions, route]);

  const refreshEdit = useCallback(async () => {
    const id = getKolamSaleEditRouteId(route);
    if (!id || (!isKolamSalesEditRoute(route) && !isKolamSalesAddItemsRoute(route))) {
      return;
    }
    setOptionsLoading(true);
    setLoading(true);
    setError(null);
    try {
      const [sale] = await Promise.all([getKolamSale(id), loadFormOptions()]);
      setSelectedSale(sale);
      if (isKolamSalesEditRoute(route)) {
        if (!canEditKolamSaleDraft(sale)) {
          setError(
            sale.status === 'pending'
              ? 'Invoice menunggu persetujuan diskon. Gunakan menu Persetujuan Diskon.'
              : 'Invoice ini tidak bisa diedit (hanya draft).',
          );
        } else if (saleHasUnsupportedEditItemTypes(sale.items)) {
          setError(
            'Invoice berisi tipe item yang tidak didukung form edit (freyer/teranura/enclosure).',
          );
        } else {
          setForm(hydrateKolamSaleCreateFormFromSale(sale));
        }
      } else {
        if (!canAddItemsToKolamSale(sale)) {
          setError(
            'Tambah item hanya untuk invoice lunas dengan pengiriman belum dimulai.',
          );
        } else {
          setForm(createInitialKolamSaleCreateForm());
        }
      }
      setDataSource('live');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setOptionsLoading(false);
      setLoading(false);
    }
  }, [loadFormOptions, route]);

  const onRefresh = useCallback(async () => {
    if (!isKolamSalesRoute(route)) {
      return;
    }
    if (isKolamSalesListRoute(route)) {
      await refreshList();
      return;
    }
    if (isKolamSalesDiscountApprovalRoute(route)) {
      await refreshApproval();
      return;
    }
    if (isKolamSalesCreateRoute(route)) {
      await refreshCreateOptions();
      return;
    }
    if (isKolamSalesEditRoute(route) || isKolamSalesAddItemsRoute(route)) {
      await refreshEdit();
      return;
    }
    if (isKolamSalesDetailRoute(route)) {
      await refreshDetail();
    }
  }, [
    refreshApproval,
    refreshCreateOptions,
    refreshDetail,
    refreshEdit,
    refreshList,
    route,
  ]);

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

  const onAddCreateItem = useCallback(
    (itemType: KolamSaleCreateItemForm['itemType'] = 'product') => {
      setForm(prev => ({
        ...prev,
        items: [...prev.items, createEmptyKolamSaleCreateItem(itemType)],
      }));
    },
    [],
  );

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

  const onAddCustomCost = useCallback(() => {
    setForm(prev => ({
      ...prev,
      customCosts: [...prev.customCosts, createEmptyKolamSaleCustomCost()],
    }));
  }, []);

  const onChangeCustomCost = useCallback(
    (key: string, patch: Partial<KolamSaleCustomCostForm>) => {
      setForm(prev => ({
        ...prev,
        customCosts: prev.customCosts.map(cost =>
          cost.key === key ? { ...cost, ...patch } : cost,
        ),
      }));
    },
    [],
  );

  const onRemoveCustomCost = useCallback((key: string) => {
    setForm(prev => ({
      ...prev,
      customCosts: prev.customCosts.filter(cost => cost.key !== key),
    }));
  }, []);

  const onSave = useCallback(async (): Promise<string | null> => {
    setMutating(true);
    setError(null);
    setStatusMessage(null);
    try {
      if (isKolamSalesCreateRoute(route)) {
        const body = buildKolamSaleCreateBody(form, { useBuyerInfo });
        const validation = validateKolamSaleCreatePayload(body);
        if (!validation.isValid) {
          setError(validation.errors[0] ?? 'Form tidak valid.');
          return null;
        }
        const created = await createKolamSale(body);
        setStatusMessage('Invoice penjualan berhasil dibuat.');
        setDataSource('live');
        return created.id;
      }

      if (isKolamSalesEditRoute(route)) {
        const id = getKolamSaleEditRouteId(route);
        if (!id) {
          return null;
        }
        const body = buildKolamSaleUpdateBody(form);
        const validation = validateKolamSaleUpdatePayload(body);
        if (!validation.isValid) {
          setError(validation.errors[0] ?? 'Form tidak valid.');
          return null;
        }
        const updated = await updateKolamSale(id, body);
        setSelectedSale(updated);
        setStatusMessage('Invoice berhasil diperbarui.');
        setDataSource('live');
        return updated.id;
      }

      if (isKolamSalesAddItemsRoute(route)) {
        const id = getKolamSaleEditRouteId(route);
        if (!id) {
          return null;
        }
        const body = buildKolamSaleAddItemsBody(form);
        const validation = validateKolamSaleAddItemsPayload(body);
        if (!validation.isValid) {
          setError(validation.errors[0] ?? 'Form tidak valid.');
          return null;
        }
        const updated = await addItemsToKolamSale(
          id,
          body,
          `add-${id}-${Date.now()}`,
        );
        setSelectedSale(updated);
        setStatusMessage('Item berhasil ditambahkan.');
        setDataSource('live');
        return updated.id;
      }

      return null;
    } catch (mutationError) {
      setError(formatKolamSaleMutationError(mutationError));
      return null;
    } finally {
      setMutating(false);
    }
  }, [form, route, useBuyerInfo]);

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
      const approvalMode = isKolamSalesDiscountApprovalRoute(route);
      const targetId = sale?.id;
      if (!targetId) {
        return false;
      }
      if (!approvalMode && isKolamSaleMarketplaceManaged(sale!)) {
        setError(
          'Status pembayaran marketplace dikelola otomatis dan tidak bisa diubah di sini.',
        );
        return false;
      }
      if (!approvalMode) {
        const allowed = getKolamSaleAllowedStatusTransitions(sale!.status);
        if (!allowed.includes(status as 'sent' | 'paid' | 'cancelled')) {
          if (status !== 'reject') {
            setError('Transisi status tidak diizinkan dari status saat ini.');
            return false;
          }
        }
        if (status === 'paid') {
          const gate = canMarkKolamSalePaid(sale!);
          if (!gate.ok) {
            setError(gate.reason);
            return false;
          }
        }
      }

      setMutating(true);
      setError(null);
      setStatusMessage(null);
      try {
        const updated = await updateKolamSaleStatus(targetId, status);
        setSelectedSale(updated);
        setStatusMessage('Status berhasil diubah.');
        setDataSource('live');
        if (approvalMode) {
          await refreshApproval();
        }
        return true;
      } catch (mutationError) {
        setError(formatKolamSaleMutationError(mutationError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [refreshApproval, route, selectedSale],
  );

  const onUpdateDelivery = useCallback(
    async (target: KolamSaleDeliveryTransitionTarget) => {
      const sale = selectedSale;
      if (!sale) {
        return false;
      }
      if (isKolamSaleMarketplaceManaged(sale)) {
        setError('Pengiriman marketplace dikelola otomatis.');
        return false;
      }
      const isOffline = sale.sourceRef?.type === 'offline';
      const allowed = getKolamSaleAllowedDeliveryTransitions(
        sale.deliveryStatus,
        { isOfflineSource: isOffline },
      );
      if (!allowed.includes(target)) {
        setError('Transisi pengiriman tidak diizinkan.');
        return false;
      }
      setMutating(true);
      setError(null);
      setStatusMessage(null);
      try {
        const updated = await updateKolamSaleDelivery(sale.id, target);
        setSelectedSale(updated);
        setStatusMessage('Status pengiriman diperbarui.');
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

  const onDeletePaymentProof = useCallback(
    async (proofId: string) => {
      const sale = selectedSale;
      if (!sale) {
        return false;
      }
      setMutating(true);
      setError(null);
      try {
        const updated = await deleteKolamSalePaymentProof(sale.id, proofId);
        setSelectedSale(updated);
        setStatusMessage('Bukti pembayaran dihapus.');
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

  const onReplacePaymentProof = useCallback(
    async (proofId: string, localUri: string) => {
      const sale = selectedSale;
      if (!sale) {
        return false;
      }
      setMutating(true);
      setError(null);
      try {
        const updated = await replaceKolamSalePaymentProof(
          sale.id,
          proofId,
          localUri,
        );
        setSelectedSale(updated);
        setStatusMessage('Bukti pembayaran diganti.');
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

  const onDownloadResi = useCallback(async () => {
    const sale = selectedSale;
    if (!sale) {
      return false;
    }
    setDownloadingInvoice(true);
    setError(null);
    try {
      const result = await downloadKolamSaleResi(sale.id, sale.invoiceCode);
      setStatusMessage(
        result.path
          ? `Resi disimpan: ${result.name}`
          : `Resi diunduh: ${result.name}`,
      );
      return true;
    } catch (downloadError) {
      setError(formatKolamSaleMutationError(downloadError));
      return false;
    } finally {
      setDownloadingInvoice(false);
    }
  }, [selectedSale]);

  const onExportList = useCallback(async () => {
    setExporting(true);
    setError(null);
    try {
      const result = await exportKolamSalesListXlsx(filtersRef.current);
      setStatusMessage(
        result.path
          ? `Export disimpan: ${result.name}`
          : `Export diunduh: ${result.name}`,
      );
      return true;
    } catch (exportError) {
      setError(formatKolamSaleMutationError(exportError));
      return false;
    } finally {
      setExporting(false);
    }
  }, []);

  const onRequestBiteshipPickup = useCallback(async () => {
    const sale = selectedSale;
    if (!sale) {
      return false;
    }
    setMutating(true);
    setError(null);
    try {
      await requestKolamSaleBiteshipPickup(sale.id);
      setStatusMessage('Request pickup Biteship dikirim.');
      await refreshDetail();
      return true;
    } catch (mutationError) {
      setError(formatKolamSaleMutationError(mutationError));
      return false;
    } finally {
      setMutating(false);
    }
  }, [refreshDetail, selectedSale]);

  return {
    analytics,
    breadcrumbPath: getKolamSaleBreadcrumbPath(mode),
    customers,
    dataSource,
    documentId,
    downloadingInvoice,
    enclosures,
    error,
    exporting,
    filteredCustomers,
    filteredPaymentMethods,
    filters,
    form,
    livestockAllocations,
    loading,
    mode,
    mutating,
    notificationSummary,
    optionsLoading,
    pagination,
    paymentMethods,
    products,
    sales,
    selectedSale,
    services,
    sources,
    species,
    statusMessage,
    useBuyerInfo,
    onAddCreateItem,
    onAddCustomCost,
    onChangeCreateItem,
    onChangeCustomCost,
    onChangeFilters,
    onChangeForm,
    onClearFilters,
    onDeletePaymentProof,
    onDownloadInvoice,
    onDownloadResi,
    onExportList,
    onLimitChange,
    onPageChange,
    onPickImage,
    onRefresh,
    onRemoveCreateItem,
    onRemoveCustomCost,
    onReplacePaymentProof,
    onRequestBiteshipPickup,
    onSave,
    onSearchChange,
    onSelectSale,
    onUpdateDelivery,
    onUpdateStatus,
    onUploadPaymentProof,
  };
}

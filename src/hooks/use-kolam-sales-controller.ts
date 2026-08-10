import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import type { KolamCustomer } from '../domain/kolam-customer';
import type { KolamProduct } from '../domain/kolam-product';
import type { KolamSpecies } from '../domain/kolam-species';
import {
  buildKolamSaleAddItemsBody,
  buildKolamSaleCreateBody,
  buildKolamSaleUpdateBody,
  canAddItemsToKolamSale,
  canApproveKolamSaleDiscount,
  canEditKolamSaleDraft,
  canMarkKolamSalePaid,
  createEmptyKolamSaleCreateItem,
  createEmptyKolamSaleCustomCost,
  createInitialKolamSaleCreateForm,
  createInitialKolamSaleListFilters,
  EMPTY_KOLAM_SALE_ANALYTICS,
  filterOptionsBySalesSourceWithFallback,
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
  needsKolamTokopediaPickupRequest,
  isKolamSalesEditRoute,
  isKolamSalesListRoute,
  isKolamSalesRoute,
  isMarketplaceSalesSource,
  pickDefaultOfflinePosSourceId,
  resolveKolamSaleSourceLogoUri,
  saleHasUnsupportedEditItemTypes,
  sumKolamSaleCreateItemShippingCost,
  validateKolamSaleAddItemsPayload,
  validateKolamSaleCreatePayload,
  validateKolamSaleUpdatePayload,
  type KolamSale,
  type KolamSaleAnalyticsOverview,
  type KolamSaleAnalyticsRange,
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
import type { KolamShippingMethod } from '../domain/kolam-shipping-method';
import { getKolamProducts, getKolamProductWarrantyTermsTemplates } from '../services/kolam-product-api';
import type { KolamProductTermsTemplate } from '../services/kolam-product-api';
import { getKolamActiveShippingMethods } from '../services/kolam-shipping-method-api';
import { getKolamSpeciesList } from '../services/kolam-species-api';
import { pickNativeImageFile } from '../services/native-file-picker';
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
  requestKolamSaleMarketplacePickup,
  setKolamSaleBiteshipWaybill,
  updateKolamSale,
  updateKolamSaleDelivery,
  updateKolamSaleStatus,
  uploadKolamSalePaymentProofs,
} from '../services/kolam-sales-api';

export type KolamSalesDataSource = 'idle' | 'live' | 'error';

const DEFAULT_PAGINATION: KolamSalePagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

const CREATE_OPTIONS_LIMIT = 1000;

const EMPTY_ANALYTICS = EMPTY_KOLAM_SALE_ANALYTICS;

const EMPTY_NOTIFICATIONS: KolamSaleNotificationSummary = {
  pendingApproval: 0,
  needsAction: 0,
  needDelivery: 0,
};

export interface KolamSalesController {
  analytics: KolamSaleAnalyticsOverview;
  analyticsLoading: boolean;
  analyticsRange: KolamSaleAnalyticsRange;
  breadcrumbPath: string;
  canApproveDiscount: boolean;
  customers: KolamCustomer[];
  dataSource: KolamSalesDataSource;
  documentId: string | null;
  downloadingInvoice: boolean;
  enclosures: KolamSaleCatalogOption[];
  error: string | null;
  exporting: boolean;
  filteredCustomers: KolamCustomer[];
  filteredPaymentMethods: KolamPaymentMethod[];
  /** True when channel filter emptied the list and UI fell back to all rows. */
  optionsChannelFilterRelaxed: boolean;
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
  shippingMethods: KolamShippingMethod[];
  sources: KolamSaleSourceOption[];
  species: KolamSpecies[];
  statusMessage: string | null;
  termsTemplates: KolamProductTermsTemplate[];
  useBuyerInfo: boolean;
  onAddCreateItem: (itemType?: KolamSaleCreateItemForm['itemType']) => void;
  onAddCustomCost: () => void;
  onAnalyticsRangeChange: (range: KolamSaleAnalyticsRange) => void;
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
  onSetBiteshipWaybill: (
    itemId: string,
    waybillId: string,
  ) => Promise<boolean>;
  /** Tokopedia platform pickup via AM (empty body). Shopee slot UI is out of scope. */
  onRequestMarketplacePickup: () => Promise<boolean>;
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
  const { authUser } = useKolamAuthContext();
  const canApproveDiscount = canApproveKolamSaleDiscount(authUser?.roleKey);
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
  const [shippingMethods, setShippingMethods] = useState<
    KolamShippingMethod[]
  >([]);
  const [termsTemplates, setTermsTemplates] = useState<
    KolamProductTermsTemplate[]
  >([]);
  const [enclosures, setEnclosures] = useState<KolamSaleCatalogOption[]>([]);
  const [livestockAllocations, setLivestockAllocations] = useState<
    KolamSaleLivestockAllocationRow[]
  >([]);
  const [analytics, setAnalytics] =
    useState<KolamSaleAnalyticsOverview>(EMPTY_ANALYTICS);
  const [analyticsRange, setAnalyticsRange] =
    useState<KolamSaleAnalyticsRange>('month');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
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
  const analyticsRangeRef = useRef(analyticsRange);
  analyticsRangeRef.current = analyticsRange;

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

  const filteredCustomersResult = useMemo(
    () => filterOptionsBySalesSourceWithFallback(customers, selectedSource),
    [customers, selectedSource],
  );

  const filteredPaymentMethodsResult = useMemo(
    () =>
      filterOptionsBySalesSourceWithFallback(paymentMethods, selectedSource),
    [paymentMethods, selectedSource],
  );

  const filteredCustomers = filteredCustomersResult.items;
  const filteredPaymentMethods = filteredPaymentMethodsResult.items;
  const optionsChannelFilterRelaxed =
    filteredCustomersResult.usedFallback ||
    filteredPaymentMethodsResult.usedFallback;

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
    const failures: string[] = [];
    const capture = async <T,>(
      label: string,
      task: Promise<T>,
      fallback: T,
    ): Promise<T> => {
      try {
        return await task;
      } catch (error) {
        failures.push(`${label} (${getErrorMessage(error)})`);
        return fallback;
      }
    };

    const [
      sourceRows,
      customerResult,
      paymentResult,
      productResult,
      speciesResult,
      serviceRows,
      enclosureRows,
      shippingMethodRows,
      termsTemplateRows,
    ] = await Promise.all([
      capture('sumber', getKolamSalesActiveSources(), [] as KolamSaleSourceOption[]),
      capture('pelanggan', getKolamCustomerList({page: 1, limit: CREATE_OPTIONS_LIMIT}), {
        items: [],
        pagination: {
          page: 1,
          limit: CREATE_OPTIONS_LIMIT,
          total: 0,
          totalPages: 1,
        },
      }),
      capture(
        'metode pembayaran',
        getKolamPaymentMethods({page: 1, limit: CREATE_OPTIONS_LIMIT}),
        {
          rows: [],
          pagination: {
            total: 0,
            page: 1,
            limit: CREATE_OPTIONS_LIMIT,
            totalPages: 1,
          },
        },
      ),
      capture(
        'produk',
        // Omit view=list so BE returns populated availableShippingMethods
        // (FE create uses the same full /products payload).
        getKolamProducts({
          page: 1,
          limit: CREATE_OPTIONS_LIMIT,
          type: 'product',
          view: '',
        }),
        {
          data: [] as KolamProduct[],
          pagination: {
            page: 1,
            limit: CREATE_OPTIONS_LIMIT,
            total: 0,
            totalPages: 1,
          },
        },
      ),
      capture(
        'spesies',
        getKolamSpeciesList({
          page: 1,
          limit: CREATE_OPTIONS_LIMIT,
          sellable: 'sellable',
          view: '',
        }),
        {
          data: [] as KolamSpecies[],
          pagination: {
            page: 1,
            limit: CREATE_OPTIONS_LIMIT,
            total: 0,
            totalPages: 1,
          },
        },
      ),
      capture('layanan', getKolamSalesServices(), [] as KolamSaleCatalogOption[]),
      capture(
        'enclosure',
        getKolamSalesEnclosuresForSale(),
        [] as KolamSaleCatalogOption[],
      ),
      capture(
        'pengiriman',
        getKolamActiveShippingMethods(),
        [] as KolamShippingMethod[],
      ),
      capture(
        'tos',
        getKolamProductWarrantyTermsTemplates(),
        [] as KolamProductTermsTemplate[],
      ),
    ]);

    // Match FE create form: keep inactive rows; prefer active when both exist.
    const paymentRows = paymentResult.rows;
    const activePayments = paymentRows.filter(row => row.isActive);
    const nextPaymentMethods =
      activePayments.length > 0 ? activePayments : paymentRows;

    setSources(sourceRows);
    setCustomers(customerResult.items);
    setPaymentMethods(nextPaymentMethods);
    setProducts(productResult.data);
    setSpecies(speciesResult.data);
    setServices(serviceRows);
    setEnclosures(enclosureRows);
    setShippingMethods(shippingMethodRows);
    setTermsTemplates(termsTemplateRows);

    if (failures.length > 0) {
      setError(`Gagal memuat opsi: ${failures.join(' · ')}`);
    } else {
      setStatusMessage(
        `Opsi dimuat: ${sourceRows.length} sumber, ${customerResult.items.length} pelanggan, ${nextPaymentMethods.length} metode.`,
      );
    }

    return sourceRows;
  }, []);

  const refreshAnalytics = useCallback(async (range: KolamSaleAnalyticsRange) => {
    setAnalyticsLoading(true);
    try {
      const [overview, summary] = await Promise.all([
        getKolamSalesAnalyticsOverview(range).catch(() => ({
          ...EMPTY_ANALYTICS,
          range,
        })),
        getKolamSalesNotificationSummary().catch(() => EMPTY_NOTIFICATIONS),
      ]);
      setAnalytics(overview);
      setNotificationSummary(summary);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const refreshList = useCallback(async () => {
    if (getKolamSaleSurfaceMode(route) !== 'list') {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getKolamSalesList(filtersRef.current);
      setSales(result.data);
      setPagination(result.pagination);
      setDataSource('live');
      if (
        result.pagination.total > 0 &&
        result.data.length === 0 &&
        filtersRef.current.page === 1
      ) {
        setError(
          'Server mengembalikan penjualan, tetapi baris gagal dibaca. Coba Refresh.',
        );
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }

    void refreshAnalytics(analyticsRangeRef.current);
  }, [refreshAnalytics, route]);

  const onAnalyticsRangeChange = useCallback(
    (range: KolamSaleAnalyticsRange) => {
      setAnalyticsRange(range);
      void refreshAnalytics(range);
    },
    [refreshAnalytics],
  );

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
        page: filtersRef.current.page,
        limit: filtersRef.current.limit,
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
      const [sale, allocations, sourceRows] = await Promise.all([
        getKolamSale(id),
        getKolamSalePendingLivestockAllocations(id).catch(
          () => [] as KolamSaleLivestockAllocationRow[],
        ),
        getKolamSalesActiveSources().catch(
          () => [] as KolamSaleSourceOption[],
        ),
      ]);
      setSources(sourceRows);
      // Detail GET omits sourceRef.logo — attach Sales Source master logo.
      const logoUri = resolveKolamSaleSourceLogoUri(sale, sourceRows);
      setSelectedSale(
        sale.sourceRef && logoUri
          ? {
              ...sale,
              sourceRef: { ...sale.sourceRef, logoUri },
            }
          : sale,
      );
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
    setStatusMessage(null);
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
      setForm(prev => {
        const items = prev.items.map(item => {
          if (item.key !== key) {
            return item;
          }
          const next = { ...item, ...patch };
          const catalogChanged =
            (patch.itemType !== undefined && patch.itemType !== item.itemType) ||
            (patch.productId !== undefined &&
              patch.productId !== item.productId) ||
            (patch.speciesId !== undefined &&
              patch.speciesId !== item.speciesId) ||
            (patch.serviceId !== undefined &&
              patch.serviceId !== item.serviceId) ||
            (patch.enclosureId !== undefined &&
              patch.enclosureId !== item.enclosureId);
          if (catalogChanged && patch.shippingMethodId === undefined) {
            next.shippingMethodId = '';
            next.shippingCost = '';
          }
          return next;
        });
        const shippingTouched =
          patch.shippingCost !== undefined ||
          patch.shippingMethodId !== undefined ||
          (patch.productId !== undefined ||
            patch.speciesId !== undefined ||
            patch.serviceId !== undefined ||
            patch.enclosureId !== undefined ||
            patch.itemType !== undefined);
        const itemSum = sumKolamSaleCreateItemShippingCost(items);
        return {
          ...prev,
          items,
          ...(shippingTouched
            ? {
                shippingCost: itemSum > 0 ? String(itemSum) : '',
              }
            : {}),
        };
      });
    },
    [],
  );

  const onRemoveCreateItem = useCallback((key: string) => {
    setForm(prev => {
      if (prev.items.length <= 1) {
        return prev;
      }
      const items = prev.items.filter(item => item.key !== key);
      const itemSum = sumKolamSaleCreateItemShippingCost(items);
      return {
        ...prev,
        items,
        shippingCost: itemSum > 0 ? String(itemSum) : '',
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
      if (
        approvalMode &&
        (status === 'sent' || status === 'reject') &&
        !canApproveDiscount
      ) {
        setError(
          'Hanya role finance atau super-admin yang dapat menyetujui atau menolak diskon.',
        );
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
    [canApproveDiscount, refreshApproval, route, selectedSale],
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

  const onSetBiteshipWaybill = useCallback(
    async (itemId: string, waybillId: string) => {
      const sale = selectedSale;
      const trimmedWaybill = waybillId.trim();
      if (!sale || !itemId || !trimmedWaybill) {
        return false;
      }
      setMutating(true);
      setError(null);
      try {
        await setKolamSaleBiteshipWaybill(sale.id, itemId, trimmedWaybill);
        setStatusMessage('Nomor resi Biteship disimpan.');
        await refreshDetail();
        return true;
      } catch (mutationError) {
        setError(formatKolamSaleMutationError(mutationError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [refreshDetail, selectedSale],
  );

  const onRequestMarketplacePickup = useCallback(async () => {
    const sale = selectedSale;
    if (!sale) {
      return false;
    }
    if (String(sale.marketplaceSource || '').toLowerCase() === 'shopee') {
      setError(
        'Request jemput Shopee membutuhkan pemilihan slot — belum tersedia di JungleSystem.',
      );
      return false;
    }
    if (!needsKolamTokopediaPickupRequest(sale)) {
      setError(
        'Penjualan Tokopedia ini belum eligible untuk request jemput kurir.',
      );
      return false;
    }
    setMutating(true);
    setError(null);
    setStatusMessage(null);
    try {
      await requestKolamSaleMarketplacePickup(sale.id, {});
      setStatusMessage('Request jemput kurir Tokopedia dikirim.');
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
    analyticsLoading,
    analyticsRange,
    breadcrumbPath: getKolamSaleBreadcrumbPath(mode),
    canApproveDiscount,
    customers,
    dataSource,
    documentId,
    downloadingInvoice,
    enclosures,
    error,
    exporting,
    filteredCustomers,
    filteredPaymentMethods,
    optionsChannelFilterRelaxed,
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
    shippingMethods,
    sources,
    species,
    statusMessage,
    termsTemplates,
    useBuyerInfo,
    onAddCreateItem,
    onAddCustomCost,
    onAnalyticsRangeChange,
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
    onRequestMarketplacePickup,
    onSetBiteshipWaybill,
    onSave,
    onSearchChange,
    onSelectSale,
    onUpdateDelivery,
    onUpdateStatus,
    onUploadPaymentProof,
  };
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  buildKolamCampaignDetailRoute,
  buildKolamCampaignEditRoute,
  createEmptyKolamCampaignFormState,
  createKolamCampaignFormState,
  createKolamCampaignSavePayload,
  getKolamCampaignIdFromRoute,
  getKolamCampaignRouteMode,
  isKolamCampaignRoute,
  mapKolamProductToCampaignOption,
  seedKolamCampaignProductOptionsFromCampaign,
  validateKolamCampaignForm,
  type KolamCampaign,
  type KolamCampaignFormState,
  type KolamCampaignProductOption,
  type KolamCampaignStatus,
} from '../domain/kolam-campaign';
import { hasKolamSalePermission } from '../domain/kolam-layanan';
import { getErrorMessage as getApiErrorMessage } from '../lib/api-error';
import {
  createKolamCampaign,
  deleteKolamCampaign,
  getKolamCampaign,
  getKolamCampaigns,
  updateKolamCampaign,
} from '../services/kolam-campaign-api';
import { getKolamProducts } from '../services/kolam-product-api';

export type KolamCampaignSurfaceMode = 'list' | 'detail' | 'edit' | 'new';
export type KolamCampaignDataSource = 'idle' | 'live' | 'error';

const PRODUCT_BIG_LIMIT = 5000;
const PRODUCT_SEARCH_LIMIT = 100;

export interface KolamCampaignController {
  campaigns: KolamCampaign[];
  canCreate: boolean;
  canDelete: boolean;
  canUpdate: boolean;
  canView: boolean;
  dataSource: KolamCampaignDataSource;
  error: string | null;
  form: KolamCampaignFormState;
  loading: boolean;
  loadingProducts: boolean;
  mode: KolamCampaignSurfaceMode;
  mutating: boolean;
  page: number;
  pageSize: number;
  productOptions: KolamCampaignProductOption[];
  productSearch: string;
  saving: boolean;
  search: string;
  selectedCampaign: KolamCampaign | null;
  statusFilter: '' | KolamCampaignStatus;
  statusMessage: string | null;
  total: number;
  totalPages: number;
  onAddProductRow: () => void;
  onBackToList: () => string;
  onChangeForm: (patch: Partial<KolamCampaignFormState>) => void;
  onClearFilters: () => void;
  onCreateNew: () => void;
  onDeleteCampaign: (campaign: KolamCampaign) => Promise<boolean>;
  onEdit: () => string | null;
  onProductSearchChange: (value: string) => void;
  onRefresh: () => Promise<void>;
  onRemoveProductRow: (index: number) => void;
  onSave: () => Promise<string | null>;
  onSearchChange: (value: string) => void;
  onSetPage: (page: number) => void;
  onSetPageSize: (pageSize: number) => void;
  onSetProductId: (index: number, productId: string) => void;
  onSetStatusFilter: (value: '' | KolamCampaignStatus) => void;
  onSetVariantIds: (index: number, variantIds: string[]) => void;
  onToggleVariant: (index: number, variantId: string) => void;
}

export function useKolamCampaignController(
  route: string,
): KolamCampaignController {
  const { authUser } = useKolamAuthContext();
  const initialMode = getKolamCampaignRouteMode(route);
  const routeCampaignId = getKolamCampaignIdFromRoute(route);

  const canView = hasKolamSalePermission(
    authUser?.permissions,
    'view',
    authUser?.roleKey,
  );
  const canCreate = hasKolamSalePermission(
    authUser?.permissions,
    'create',
    authUser?.roleKey,
  );
  const canUpdate = hasKolamSalePermission(
    authUser?.permissions,
    'update',
    authUser?.roleKey,
  );
  const canDelete = hasKolamSalePermission(
    authUser?.permissions,
    'delete',
    authUser?.roleKey,
  );

  const [campaigns, setCampaigns] = useState<KolamCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<KolamCampaign | null>(
    null,
  );
  const [mode, setMode] = useState<KolamCampaignSurfaceMode>(initialMode);
  const [form, setForm] = useState<KolamCampaignFormState>(() =>
    createEmptyKolamCampaignFormState(),
  );
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] =
    useState<KolamCampaignDataSource>('idle');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | KolamCampaignStatus>('');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [productOptions, setProductOptions] = useState<
    KolamCampaignProductOption[]
  >([]);
  const [productSearch, setProductSearch] = useState('');
  const [productCache, setProductCache] = useState<
    Record<string, KolamCampaignProductOption>
  >({});

  const refreshList = useCallback(async () => {
    if (!isKolamCampaignRoute(route)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const live = await getKolamCampaigns({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setCampaigns(live.items);
      setTotal(live.total);
      setTotalPages(live.totalPages);
      setDataSource('live');
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, route, search, statusFilter]);

  const loadCampaignById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const live = await getKolamCampaign(id);
      setSelectedCampaign(live);
      setForm(createKolamCampaignFormState(live));
      const seeded = seedKolamCampaignProductOptionsFromCampaign(live);
      setProductCache(prev => {
        const next = { ...prev };
        for (const option of seeded) {
          next[option.id] = option;
        }
        return next;
      });
      setDataSource('live');
      return live;
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
      setSelectedCampaign(null);
      setDataSource('error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setStatusMessage(null);
    if (initialMode === 'new') {
      setSelectedCampaign(null);
      setForm(createEmptyKolamCampaignFormState());
      setProductSearch('');
    }
  }, [initialMode, route]);

  useEffect(() => {
    if (!canView) {
      setLoading(false);
      return;
    }
    if (mode === 'list') {
      void refreshList();
      return;
    }
    if (
      (mode === 'detail' || mode === 'edit') &&
      routeCampaignId &&
      selectedCampaign?.id !== routeCampaignId
    ) {
      void loadCampaignById(routeCampaignId);
    }
  }, [
    canView,
    loadCampaignById,
    mode,
    refreshList,
    routeCampaignId,
    selectedCampaign?.id,
  ]);

  useEffect(() => {
    if (!canView) {
      return;
    }
    if (mode !== 'new' && mode !== 'edit') {
      return;
    }

    let cancelled = false;
    const handle = setTimeout(() => {
      void (async () => {
        setLoadingProducts(true);
        try {
          const result = await getKolamProducts({
            page: 1,
            limit: productSearch.trim()
              ? PRODUCT_SEARCH_LIMIT
              : PRODUCT_BIG_LIMIT,
            search: productSearch.trim() || undefined,
            view: '',
          });
          if (cancelled) {
            return;
          }
          const mapped = result.data.map(mapKolamProductToCampaignOption);
          setProductOptions(mapped);
          setProductCache(prev => {
            const next = { ...prev };
            for (const option of mapped) {
              next[option.id] = option;
            }
            return next;
          });
        } catch {
          if (!cancelled) {
            setProductOptions([]);
          }
        } finally {
          if (!cancelled) {
            setLoadingProducts(false);
          }
        }
      })();
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [canView, mode, productSearch]);

  const mergedProductOptions = useMemo(() => {
    const map = new Map<string, KolamCampaignProductOption>();
    for (const option of Object.values(productCache)) {
      map.set(option.id, option);
    }
    for (const option of productOptions) {
      map.set(option.id, option);
    }
    return Array.from(map.values());
  }, [productCache, productOptions]);

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const onSetPage = useCallback((nextPage: number) => {
    setPage(Math.max(1, nextPage));
  }, []);

  const onSetPageSize = useCallback((nextPageSize: number) => {
    setPageSize(Math.max(1, nextPageSize));
    setPage(1);
  }, []);

  const onSetStatusFilter = useCallback((value: '' | KolamCampaignStatus) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const onClearFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('');
    setPage(1);
  }, []);

  const onCreateNew = useCallback(() => {
    setMode('new');
    setSelectedCampaign(null);
    setForm(createEmptyKolamCampaignFormState());
    setError(null);
    setStatusMessage(null);
  }, []);

  const onBackToList = useCallback(() => {
    setMode('list');
    setSelectedCampaign(null);
    setForm(createEmptyKolamCampaignFormState());
    setError(null);
    setStatusMessage(null);
    return '/campaign';
  }, []);

  const onEdit = useCallback(() => {
    if (!selectedCampaign) {
      return null;
    }
    setMode('edit');
    setForm(createKolamCampaignFormState(selectedCampaign));
    setError(null);
    setStatusMessage(null);
    return buildKolamCampaignEditRoute(selectedCampaign.id);
  }, [selectedCampaign]);

  const onChangeForm = useCallback((patch: Partial<KolamCampaignFormState>) => {
    setForm(prev => {
      const next = { ...prev, ...patch };
      if (
        patch.startDate &&
        next.endDate &&
        next.startDate > next.endDate
      ) {
        next.endDate = '';
      }
      return next;
    });
  }, []);

  const onAddProductRow = useCallback(() => {
    setForm(prev => ({
      ...prev,
      products: [...prev.products, { productId: '', variantIds: [] }],
    }));
  }, []);

  const onRemoveProductRow = useCallback((index: number) => {
    setForm(prev => {
      if (prev.products.length <= 1) {
        return prev;
      }
      return {
        ...prev,
        products: prev.products.filter((_, rowIndex) => rowIndex !== index),
      };
    });
  }, []);

  const onSetProductId = useCallback((index: number, productId: string) => {
    setForm(prev => ({
      ...prev,
      products: prev.products.map((row, rowIndex) =>
        rowIndex === index
          ? { productId, variantIds: [] }
          : row,
      ),
    }));
  }, []);

  const onSetVariantIds = useCallback(
    (index: number, variantIds: string[]) => {
      setForm(prev => ({
        ...prev,
        products: prev.products.map((row, rowIndex) =>
          rowIndex === index ? { ...row, variantIds } : row,
        ),
      }));
    },
    [],
  );

  const onToggleVariant = useCallback((index: number, variantId: string) => {
    setForm(prev => ({
      ...prev,
      products: prev.products.map((row, rowIndex) => {
        if (rowIndex !== index) {
          return row;
        }
        const exists = row.variantIds.includes(variantId);
        return {
          ...row,
          variantIds: exists
            ? row.variantIds.filter(id => id !== variantId)
            : [...row.variantIds, variantId],
        };
      }),
    }));
  }, []);

  const onProductSearchChange = useCallback((value: string) => {
    setProductSearch(value);
  }, []);

  const onDeleteCampaign = useCallback(
    async (campaign: KolamCampaign) => {
      if (!canDelete) {
        setError('Anda tidak memiliki izin menghapus kampanye.');
        return false;
      }
      setMutating(true);
      setError(null);
      setStatusMessage(null);
      try {
        await deleteKolamCampaign(campaign.id);
        setStatusMessage('Kampanye berhasil dihapus');
        await refreshList();
        return true;
      } catch (deleteError) {
        setError(getApiErrorMessage(deleteError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [canDelete, refreshList],
  );

  const onSave = useCallback(async () => {
    if (mode === 'new' && !canCreate) {
      setError('Anda tidak memiliki izin membuat kampanye.');
      return null;
    }
    if (mode === 'edit' && !canUpdate) {
      setError('Anda tidak memiliki izin mengubah kampanye.');
      return null;
    }

    const validationError = validateKolamCampaignForm(form);
    if (validationError) {
      setError(validationError);
      return null;
    }

    const body = createKolamCampaignSavePayload(form);
    setSaving(true);
    setError(null);
    setStatusMessage(null);

    try {
      const saved =
        mode === 'edit' && selectedCampaign
          ? await updateKolamCampaign(selectedCampaign.id, body)
          : await createKolamCampaign(body);
      setSelectedCampaign(saved);
      setForm(createKolamCampaignFormState(saved));
      setStatusMessage(
        mode === 'edit'
          ? 'Kampanye berhasil diperbarui'
          : 'Kampanye berhasil dibuat',
      );
      setMode('detail');
      return buildKolamCampaignDetailRoute(saved.id);
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
      return null;
    } finally {
      setSaving(false);
    }
  }, [canCreate, canUpdate, form, mode, selectedCampaign]);

  const onRefresh = useCallback(async () => {
    if (mode === 'list') {
      await refreshList();
      return;
    }
    if (routeCampaignId) {
      await loadCampaignById(routeCampaignId);
    }
  }, [loadCampaignById, mode, refreshList, routeCampaignId]);

  return useMemo(
    () => ({
      campaigns,
      canCreate,
      canDelete,
      canUpdate,
      canView,
      dataSource,
      error,
      form,
      loading,
      loadingProducts,
      mode,
      mutating,
      page,
      pageSize,
      productOptions: mergedProductOptions,
      productSearch,
      saving,
      search,
      selectedCampaign,
      statusFilter,
      statusMessage,
      total,
      totalPages,
      onAddProductRow,
      onBackToList,
      onChangeForm,
      onClearFilters,
      onCreateNew,
      onDeleteCampaign,
      onEdit,
      onProductSearchChange,
      onRefresh,
      onRemoveProductRow,
      onSave,
      onSearchChange,
      onSetPage,
      onSetPageSize,
      onSetProductId,
      onSetStatusFilter,
      onSetVariantIds,
      onToggleVariant,
    }),
    [
      campaigns,
      canCreate,
      canDelete,
      canUpdate,
      canView,
      dataSource,
      error,
      form,
      loading,
      loadingProducts,
      mergedProductOptions,
      mode,
      mutating,
      onAddProductRow,
      onBackToList,
      onChangeForm,
      onClearFilters,
      onCreateNew,
      onDeleteCampaign,
      onEdit,
      onProductSearchChange,
      onRefresh,
      onRemoveProductRow,
      onSave,
      onSearchChange,
      onSetPage,
      onSetPageSize,
      onSetProductId,
      onSetStatusFilter,
      onSetVariantIds,
      onToggleVariant,
      page,
      pageSize,
      productSearch,
      saving,
      search,
      selectedCampaign,
      statusFilter,
      statusMessage,
      total,
      totalPages,
    ],
  );
}

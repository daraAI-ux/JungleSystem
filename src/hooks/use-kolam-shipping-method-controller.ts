import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BITESHIP_COURIERS,
  buildBiteshipCouriersFromCatalog,
  buildMethodName,
  findCourier,
  findService,
  getKolamShippingCourierCatalogStats,
  type KolamBiteshipCourierOption,
  type KolamShippingCourierCatalogItem,
  type KolamShippingCourierCatalogStats,
} from '../domain/kolam-shipping-courier-catalog';
import {
  createEmptyKolamShippingMethodFormState,
  createKolamShippingMethodFormState,
  getKolamShippingMethodBreadcrumbPath,
  isKolamShippingMethodRoute,
  parseKolamShippingMethodRoute,
  validateKolamShippingMethodForm,
  type KolamShippingMethod,
  type KolamShippingMethodFormState,
} from '../domain/kolam-shipping-method';
import { getErrorMessage as getApiErrorMessage } from '../lib/api-error';
import {
  getKolamShippingCourierCatalog,
  patchKolamShippingCourierCatalogItem,
  syncKolamBiteshipCourierCatalog,
} from '../services/kolam-shipping-courier-catalog-api';
import {
  createKolamShippingMethod,
  deleteKolamShippingMethod,
  deleteKolamShippingMethodIcon,
  getKolamActiveShippingMethods,
  getKolamShippingMethod,
  getKolamShippingMethods,
  initializeKolamShippingMethodDefaults,
  patchKolamShippingMethodFlags,
  updateKolamShippingMethod,
  uploadKolamShippingMethodIcon,
} from '../services/kolam-shipping-method-api';
import {
  readKolamShippingMethodAdminListCache,
  readKolamShippingMethodDetailCache,
  writeKolamShippingMethodAdminListCache,
  writeKolamShippingMethodDetailCache,
  writeKolamShippingMethodListCache,
} from '../services/kolam-shipping-method-local-cache';

export type KolamShippingMethodSurfaceMode = 'list' | 'detail' | 'edit' | 'new';
export type KolamShippingMethodListTab = 'methods' | 'catalog';
export type KolamShippingMethodDataSource = 'idle' | 'cache' | 'live' | 'error';

export interface KolamShippingMethodController {
  biteshipCouriers: KolamBiteshipCourierOption[];
  catalogItems: KolamShippingCourierCatalogItem[];
  catalogLoading: boolean;
  catalogSearch: string;
  catalogStats: KolamShippingCourierCatalogStats;
  catalogSyncing: boolean;
  dataSource: KolamShippingMethodDataSource;
  error: string | null;
  form: KolamShippingMethodFormState;
  initializingDefaults: boolean;
  isEditable: boolean;
  listTab: KolamShippingMethodListTab;
  loading: boolean;
  methods: KolamShippingMethod[];
  mode: KolamShippingMethodSurfaceMode;
  page: number;
  pageSize: number;
  saving: boolean;
  search: string;
  selectedMethod: KolamShippingMethod | null;
  total: number;
  totalPages: number;
  getCreateRoute: () => string;
  getDetailRoute: (method: Pick<KolamShippingMethod, 'id'>) => string;
  getEditRoute: (method: Pick<KolamShippingMethod, 'id'>) => string;
  getListRoute: () => string;
  onBackToList: () => void;
  onCancelForm: () => void;
  onCatalogSearchChange: (value: string) => void;
  onChangeForm: (patch: Partial<KolamShippingMethodFormState>) => void;
  onCreateNew: () => void;
  onDeleteMethod: (method: KolamShippingMethod) => Promise<boolean>;
  onEdit: () => void;
  onInitializeDefaults: () => Promise<boolean>;
  onRefresh: () => Promise<void>;
  onRefreshCatalog: () => Promise<void>;
  onSave: () => Promise<string | null>;
  onSearchChange: (value: string) => void;
  onSelectMethod: (method: KolamShippingMethod) => Promise<void>;
  onSetListTab: (tab: KolamShippingMethodListTab) => void;
  onSetPage: (page: number) => void;
  onSetPageSize: (pageSize: number) => void;
  onSyncCatalog: () => Promise<boolean>;
  onToggleCatalogActive: (
    item: KolamShippingCourierCatalogItem,
    nextActive: boolean,
  ) => Promise<boolean>;
  onToggleMethodActive: (
    method: KolamShippingMethod,
    nextActive: boolean,
  ) => Promise<boolean>;
  onToggleWebstore: (
    method: KolamShippingMethod,
    nextAvailable: boolean,
  ) => Promise<boolean>;
}

export function useKolamShippingMethodController(
  route: string,
): KolamShippingMethodController {
  const parsedRoute = parseKolamShippingMethodRoute(route);
  const [methods, setMethods] = useState<KolamShippingMethod[]>([]);
  const [selectedMethod, setSelectedMethod] =
    useState<KolamShippingMethod | null>(null);
  const [mode, setMode] =
    useState<KolamShippingMethodSurfaceMode>(parsedRoute.mode);
  const [form, setForm] = useState<KolamShippingMethodFormState>(() =>
    createEmptyKolamShippingMethodFormState(),
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initializingDefaults, setInitializingDefaults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] =
    useState<KolamShippingMethodDataSource>('idle');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [listTab, setListTab] = useState<KolamShippingMethodListTab>('methods');
  const [catalogItems, setCatalogItems] = useState<
    KolamShippingCourierCatalogItem[]
  >([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogSyncing, setCatalogSyncing] = useState(false);
  const [activeCatalogCouriers, setActiveCatalogCouriers] = useState<
    KolamShippingCourierCatalogItem[]
  >([]);

  const refreshActiveListCache = useCallback(async () => {
    try {
      const active = await getKolamActiveShippingMethods();
      await writeKolamShippingMethodListCache(active);
    } catch {
      // keep picker cache as-is on failure
    }
  }, []);

  const refreshMethods = useCallback(async () => {
    if (!isKolamShippingMethodRoute(route)) {
      return;
    }

    setLoading(true);
    setError(null);

    const cached = await readKolamShippingMethodAdminListCache();
    if (cached?.value.length) {
      setMethods(cached.value);
      setDataSource('cache');
    }

    try {
      const live = await getKolamShippingMethods({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
      });
      await writeKolamShippingMethodAdminListCache(live.data);
      setMethods(live.data);
      setTotal(live.total);
      setTotalPages(live.totalPages);
      setDataSource('live');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource(cached?.value.length ? 'cache' : 'error');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, route, search]);

  const refreshCatalog = useCallback(async () => {
    setCatalogLoading(true);
    setError(null);

    try {
      const live = await getKolamShippingCourierCatalog({
        limit: 10,
        search: catalogSearch.trim() || undefined,
      });
      setCatalogItems(live);

      const activeRows = await getKolamShippingCourierCatalog({
        isActive: true,
        limit: 2000,
      });
      setActiveCatalogCouriers(activeRows);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setCatalogItems([]);
    } finally {
      setCatalogLoading(false);
    }
  }, [catalogSearch]);

  useEffect(() => {
    setMode(parsedRoute.mode);
    if (parsedRoute.mode === 'new') {
      setSelectedMethod(null);
      setForm(createEmptyKolamShippingMethodFormState());
    }
  }, [parsedRoute.mode]);

  useEffect(() => {
    if (mode === 'list' && listTab === 'methods') {
      void refreshMethods();
    }
  }, [listTab, mode, refreshMethods]);

  useEffect(() => {
    if (mode === 'list' && listTab === 'catalog') {
      void refreshCatalog();
    }
  }, [listTab, mode, refreshCatalog]);

  useEffect(() => {
    void getKolamShippingCourierCatalog({ isActive: true, limit: 2000 })
      .then(setActiveCatalogCouriers)
      .catch(() => setActiveCatalogCouriers([]));
  }, []);

  const onSelectMethod = useCallback(async (method: KolamShippingMethod) => {
    setMode('detail');
    setSelectedMethod(method);
    setForm(createKolamShippingMethodFormState(method));
    setError(null);

    const cached = await readKolamShippingMethodDetailCache(method.id);
    if (cached?.value) {
      setSelectedMethod(cached.value);
      setForm(createKolamShippingMethodFormState(cached.value));
      setDataSource('cache');
    }

    try {
      const live = await getKolamShippingMethod(method.id);
      await writeKolamShippingMethodDetailCache(live);
      setSelectedMethod(live);
      setForm(createKolamShippingMethodFormState(live));
      setDataSource('live');
    } catch (detailError) {
      setError(getErrorMessage(detailError));
    }
  }, []);

  useEffect(() => {
    const methodId = parsedRoute.id;
    if (!methodId || mode === 'new') {
      return;
    }

    if (selectedMethod?.id === methodId) {
      if (parsedRoute.mode === 'edit' && mode !== 'edit') {
        setMode('edit');
      }
      return;
    }

    let active = true;
    void (async () => {
      const fromList = methods.find(item => item.id === methodId);
      if (fromList) {
        if (active) {
          await onSelectMethod(fromList);
          if (parsedRoute.mode === 'edit') {
            setMode('edit');
          }
        }
        return;
      }

      try {
        const live = await getKolamShippingMethod(methodId);
        if (!active) {
          return;
        }
        await writeKolamShippingMethodDetailCache(live);
        setSelectedMethod(live);
        setForm(createKolamShippingMethodFormState(live));
        setMode(parsedRoute.mode === 'edit' ? 'edit' : 'detail');
        setDataSource('live');
      } catch (detailError) {
        if (active) {
          setError(getErrorMessage(detailError));
          setDataSource('error');
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [
    methods,
    mode,
    onSelectMethod,
    parsedRoute.id,
    parsedRoute.mode,
    selectedMethod?.id,
  ]);

  const onBackToList = useCallback(() => {
    setMode('list');
    setSelectedMethod(null);
    setForm(createEmptyKolamShippingMethodFormState());
    setError(null);
  }, []);

  const onCancelForm = useCallback(() => {
    if (selectedMethod) {
      setMode('detail');
      setForm(createKolamShippingMethodFormState(selectedMethod));
      setError(null);
      return;
    }
    onBackToList();
  }, [onBackToList, selectedMethod]);

  const onCreateNew = useCallback(() => {
    setMode('new');
    setSelectedMethod(null);
    setForm(createEmptyKolamShippingMethodFormState());
    setError(null);
  }, []);

  const onEdit = useCallback(() => {
    if (selectedMethod) {
      setMode('edit');
    }
  }, [selectedMethod]);

  const onChangeForm = useCallback(
    (patch: Partial<KolamShippingMethodFormState>) => {
      setForm(current => ({ ...current, ...patch }));
    },
    [],
  );

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const onCatalogSearchChange = useCallback((value: string) => {
    setCatalogSearch(value);
  }, []);

  const onSetPage = useCallback((nextPage: number) => {
    setPage(Math.max(1, nextPage));
  }, []);

  const onSetPageSize = useCallback((nextSize: number) => {
    setPageSize(Math.max(1, nextSize));
    setPage(1);
  }, []);

  const onSetListTab = useCallback((tab: KolamShippingMethodListTab) => {
    setListTab(tab);
  }, []);

  const onToggleMethodActive = useCallback(
    async (method: KolamShippingMethod, nextActive: boolean) => {
      setSaving(true);
      setError(null);
      try {
        const updated = await patchKolamShippingMethodFlags(method.id, {
          isActive: nextActive,
        });
        setMethods(current => {
          const next = upsertMethod(current, updated);
          void writeKolamShippingMethodAdminListCache(next);
          return next;
        });
        if (selectedMethod?.id === updated.id) {
          setSelectedMethod(updated);
          setForm(createKolamShippingMethodFormState(updated));
        }
        await refreshActiveListCache();
        return true;
      } catch (toggleError) {
        setError(getErrorMessage(toggleError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [refreshActiveListCache, selectedMethod?.id],
  );

  const onToggleWebstore = useCallback(
    async (method: KolamShippingMethod, nextAvailable: boolean) => {
      setSaving(true);
      setError(null);
      try {
        const updated = await patchKolamShippingMethodFlags(method.id, {
          isAvailableOnWebstore: nextAvailable,
        });
        setMethods(current => upsertMethod(current, updated));
        if (selectedMethod?.id === updated.id) {
          setSelectedMethod(updated);
          setForm(createKolamShippingMethodFormState(updated));
        }
        await refreshActiveListCache();
        return true;
      } catch (toggleError) {
        setError(getErrorMessage(toggleError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [refreshActiveListCache, selectedMethod?.id],
  );

  const onDeleteMethod = useCallback(
    async (method: KolamShippingMethod) => {
      setSaving(true);
      setError(null);
      try {
        await deleteKolamShippingMethod(method.id);
        const nextMethods = methods.filter(item => item.id !== method.id);
        setMethods(nextMethods);
        setTotal(current => Math.max(0, current - 1));
        await writeKolamShippingMethodAdminListCache(nextMethods);
        await refreshActiveListCache();
        setMode('list');
        setSelectedMethod(null);
        setForm(createEmptyKolamShippingMethodFormState());
        return true;
      } catch (deleteError) {
        setError(getErrorMessage(deleteError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [methods, refreshActiveListCache],
  );

  const onInitializeDefaults = useCallback(async () => {
    setInitializingDefaults(true);
    setError(null);
    try {
      await initializeKolamShippingMethodDefaults();
      await refreshMethods();
      await refreshActiveListCache();
      return true;
    } catch (initError) {
      setError(getErrorMessage(initError));
      return false;
    } finally {
      setInitializingDefaults(false);
    }
  }, [refreshActiveListCache, refreshMethods]);

  const onSave = useCallback(async () => {
    const validationError = validateKolamShippingMethodForm(form);
    if (validationError) {
      setError(validationError);
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      const saved =
        mode === 'new'
          ? await createKolamShippingMethod(form)
          : await updateKolamShippingMethod(
              selectedMethod?.id ?? form.id ?? '',
              form,
            );

      let finalMethod = saved;
      if (form.pendingLogoUri) {
        finalMethod = await uploadKolamShippingMethodIcon(
          saved.id,
          form.pendingLogoUri,
        );
      } else if (form.removeLogo && selectedMethod?.iconPath) {
        finalMethod = await deleteKolamShippingMethodIcon(saved.id);
      }

      await writeKolamShippingMethodDetailCache(finalMethod);
      const nextMethods = upsertMethod(methods, finalMethod);
      setMethods(nextMethods);
      await writeKolamShippingMethodAdminListCache(nextMethods);
      await refreshActiveListCache();
      setSelectedMethod(finalMethod);
      setForm(createKolamShippingMethodFormState(finalMethod));
      setMode('detail');
      setDataSource('live');
      return finalMethod.id;
    } catch (saveError) {
      setError(getErrorMessage(saveError));
      return null;
    } finally {
      setSaving(false);
    }
  }, [form, mode, methods, refreshActiveListCache, selectedMethod?.id]);

  const onSyncCatalog = useCallback(async () => {
    setCatalogSyncing(true);
    setError(null);
    try {
      await syncKolamBiteshipCourierCatalog();
      await refreshCatalog();
      const activeRows = await getKolamShippingCourierCatalog({
        isActive: true,
        limit: 2000,
      });
      setActiveCatalogCouriers(activeRows);
      return true;
    } catch (syncError) {
      setError(getErrorMessage(syncError));
      return false;
    } finally {
      setCatalogSyncing(false);
    }
  }, [refreshCatalog]);

  const onToggleCatalogActive = useCallback(
    async (item: KolamShippingCourierCatalogItem, nextActive: boolean) => {
      setSaving(true);
      setError(null);
      try {
        const updated = await patchKolamShippingCourierCatalogItem(item.id, {
          isActive: nextActive,
        });
        setCatalogItems(current =>
          current.map(row => (row.id === updated.id ? updated : row)),
        );
        const activeRows = await getKolamShippingCourierCatalog({
          isActive: true,
          limit: 2000,
        });
        setActiveCatalogCouriers(activeRows);
        return true;
      } catch (toggleError) {
        setError(getErrorMessage(toggleError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const catalogCouriersBuilt = useMemo(
    () => buildBiteshipCouriersFromCatalog(activeCatalogCouriers),
    [activeCatalogCouriers],
  );

  const biteshipCouriers = useMemo(
    () =>
      catalogCouriersBuilt.length > 0
        ? catalogCouriersBuilt
        : BITESHIP_COURIERS,
    [catalogCouriersBuilt],
  );

  const catalogStats = useMemo(
    () => getKolamShippingCourierCatalogStats(catalogItems),
    [catalogItems],
  );

  const isEditable = mode === 'edit' || mode === 'new';

  const getListRoute = useCallback(
    () => getKolamShippingMethodBreadcrumbPath('list'),
    [],
  );
  const getCreateRoute = useCallback(
    () => getKolamShippingMethodBreadcrumbPath('new'),
    [],
  );
  const getDetailRoute = useCallback(
    (method: Pick<KolamShippingMethod, 'id'>) =>
      getKolamShippingMethodBreadcrumbPath('detail', method),
    [],
  );
  const getEditRoute = useCallback(
    (method: Pick<KolamShippingMethod, 'id'>) =>
      getKolamShippingMethodBreadcrumbPath('edit', method),
    [],
  );

  return useMemo(
    () => ({
      biteshipCouriers,
      catalogItems,
      catalogLoading,
      catalogSearch,
      catalogStats,
      catalogSyncing,
      dataSource,
      error,
      form,
      initializingDefaults,
      isEditable,
      listTab,
      loading,
      methods,
      mode,
      page,
      pageSize,
      saving,
      search,
      selectedMethod,
      total,
      totalPages,
      getCreateRoute,
      getDetailRoute,
      getEditRoute,
      getListRoute,
      onBackToList,
      onCancelForm,
      onCatalogSearchChange,
      onChangeForm,
      onCreateNew,
      onDeleteMethod,
      onEdit,
      onInitializeDefaults,
      onRefresh: refreshMethods,
      onRefreshCatalog: refreshCatalog,
      onSave,
      onSearchChange,
      onSelectMethod,
      onSetListTab,
      onSetPage,
      onSetPageSize,
      onSyncCatalog,
      onToggleCatalogActive,
      onToggleMethodActive,
      onToggleWebstore,
    }),
    [
      biteshipCouriers,
      catalogItems,
      catalogLoading,
      catalogSearch,
      catalogStats,
      catalogSyncing,
      dataSource,
      error,
      form,
      getCreateRoute,
      getDetailRoute,
      getEditRoute,
      getListRoute,
      initializingDefaults,
      isEditable,
      listTab,
      loading,
      methods,
      mode,
      onBackToList,
      onCancelForm,
      onCatalogSearchChange,
      onChangeForm,
      onCreateNew,
      onDeleteMethod,
      onEdit,
      onInitializeDefaults,
      onSave,
      onSearchChange,
      onSelectMethod,
      onSetListTab,
      onSetPage,
      onSetPageSize,
      onSyncCatalog,
      onToggleCatalogActive,
      onToggleMethodActive,
      onToggleWebstore,
      page,
      pageSize,
      refreshCatalog,
      refreshMethods,
      saving,
      search,
      selectedMethod,
      total,
      totalPages,
    ],
  );
}

export { buildMethodName, findCourier, findService };

function upsertMethod(list: KolamShippingMethod[], item: KolamShippingMethod) {
  const index = list.findIndex(row => row.id === item.id);
  if (index < 0) {
    return [item, ...list];
  }
  const next = list.slice();
  next[index] = item;
  return next;
}

function getErrorMessage(error: unknown) {
  const message = getApiErrorMessage(error).trim();
  return message || 'Terjadi kesalahan pada metode pengiriman.';
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { KolamBrand } from '../domain/kolam-brand';
import {
  createEmptyKolamLayananServiceFormState,
  createKolamLayananServiceFormState,
  createKolamLayananServiceSavePayload,
  getKolamLayananListTab,
  getKolamLayananRouteMode,
  getKolamLayananServiceIdFromRoute,
  getKolamLayananTabHref,
  isKolamLayananNativeRoute,
  KOLAM_LAYANAN_SERVICE_DETAIL_VOUCHER_STATUSES,
  validateKolamLayananServiceForm,
  type KolamLayananListTab,
  type KolamLayananOpsDashboard,
  type KolamLayananPendingService,
  type KolamLayananService,
  type KolamLayananServiceFormState,
  type KolamLayananSubscription,
  type KolamLayananSubscriptionStatus,
  type KolamLayananSurfaceMode,
} from '../domain/kolam-layanan';
import { getErrorMessage as getApiErrorMessage } from '../lib/api-error';
import { getKolamBrands } from '../services/kolam-brand-api';
import {
  createKolamLayananService,
  getKolamLayananOpsDashboard,
  getKolamLayananPendingServices,
  getKolamLayananService,
  getKolamLayananServices,
  getKolamLayananSubscriptions,
  updateKolamLayananService,
} from '../services/kolam-layanan-api';

export type KolamLayananDataSource = 'idle' | 'live' | 'error';

export interface KolamLayananController {
  activeTab: KolamLayananListTab;
  brandOptions: KolamBrand[];
  dataSource: KolamLayananDataSource;
  error: string | null;
  form: KolamLayananServiceFormState;
  loading: boolean;
  mode: KolamLayananSurfaceMode;
  opsDashboard: KolamLayananOpsDashboard | null;
  opsLoading: boolean;
  page: number;
  pageSize: number;
  pendingServices: KolamLayananPendingService[];
  relatedVouchers: KolamLayananPendingService[];
  relatedVouchersLoading: boolean;
  saving: boolean;
  search: string;
  selectedService: KolamLayananService | null;
  services: KolamLayananService[];
  subscriptionStatusFilter: KolamLayananSubscriptionStatus | 'all';
  subscriptions: KolamLayananSubscription[];
  total: number;
  totalPages: number;
  onBackToList: () => void;
  onChangeForm: (patch: Partial<KolamLayananServiceFormState>) => void;
  onCreateNew: () => void;
  onEdit: () => void;
  onOpenEdit: (service: KolamLayananService) => void;
  onRefresh: () => Promise<void>;
  onSave: () => Promise<string | null>;
  onSearchChange: (value: string) => void;
  onSelectPending: (item: KolamLayananPendingService) => void;
  onSelectService: (service: KolamLayananService) => void;
  onSelectSubscription: (item: KolamLayananSubscription) => void;
  onSetPage: (page: number) => void;
  onSetPageSize: (pageSize: number) => void;
  onSetSubscriptionStatusFilter: (
    value: KolamLayananSubscriptionStatus | 'all',
  ) => void;
  onTabChange: (tab: KolamLayananListTab) => string;
  onToggleBrand: (brandId: string) => void;
  onToggleEnclosureType: (enclosureType: string) => void;
  onToggleTaskTypeKey: (taskType: string) => void;
}

const PENDING_OPEN_STATUSES =
  'pending,awaiting_staff_approval,awaiting_client_approval,schedule_approved';

export function useKolamLayananController(
  route: string,
): KolamLayananController {
  const initialMode = getKolamLayananRouteMode(route);
  const initialTab = getKolamLayananListTab(route);
  const [mode, setMode] = useState<KolamLayananSurfaceMode>(initialMode);
  const [activeTab, setActiveTab] = useState<KolamLayananListTab>(initialTab);
  const [services, setServices] = useState<KolamLayananService[]>([]);
  const [pendingServices, setPendingServices] = useState<
    KolamLayananPendingService[]
  >([]);
  const [relatedVouchers, setRelatedVouchers] = useState<
    KolamLayananPendingService[]
  >([]);
  const [relatedVouchersLoading, setRelatedVouchersLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<KolamLayananSubscription[]>(
    [],
  );
  const [selectedService, setSelectedService] =
    useState<KolamLayananService | null>(null);
  const [form, setForm] = useState<KolamLayananServiceFormState>(() =>
    createEmptyKolamLayananServiceFormState(),
  );
  const [brandOptions, setBrandOptions] = useState<KolamBrand[]>([]);
  const [opsDashboard, setOpsDashboard] =
    useState<KolamLayananOpsDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [opsLoading, setOpsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<KolamLayananDataSource>('idle');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState<
    KolamLayananSubscriptionStatus | 'all'
  >('all');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const refreshOps = useCallback(async () => {
    if (!isKolamLayananNativeRoute(route) || mode !== 'list') {
      return;
    }
    setOpsLoading(true);
    try {
      const live = await getKolamLayananOpsDashboard();
      setOpsDashboard(live);
    } catch {
      // Keep previous KPI if ops fails; list errors stay primary.
    } finally {
      setOpsLoading(false);
    }
  }, [mode, route]);

  const refresh = useCallback(async () => {
    if (!isKolamLayananNativeRoute(route) || mode !== 'list') {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'daftar') {
        const live = await getKolamLayananServices({
          page,
          limit: pageSize,
          search: search.trim() || undefined,
        });
        setServices(live.items);
        setTotal(live.total);
        setTotalPages(live.totalPages);
      } else if (activeTab === 'operasional') {
        const live = await getKolamLayananPendingServices({
          page,
          limit: pageSize,
          statuses: PENDING_OPEN_STATUSES,
        });
        setPendingServices(live.items);
        setTotal(live.total);
        setTotalPages(live.totalPages);
      } else {
        const live = await getKolamLayananSubscriptions({
          page,
          limit: pageSize,
          search: search.trim() || undefined,
          status: subscriptionStatusFilter,
        });
        setSubscriptions(live.items);
        setTotal(live.total);
        setTotalPages(live.totalPages);
      }
      setDataSource('live');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    mode,
    page,
    pageSize,
    route,
    search,
    subscriptionStatusFilter,
  ]);

  const loadBrands = useCallback(async () => {
    try {
      const brands = await getKolamBrands();
      setBrandOptions(brands);
    } catch {
      setBrandOptions([]);
    }
  }, []);

  useEffect(() => {
    setMode(initialMode);
    setActiveTab(initialTab);
  }, [initialMode, initialTab]);

  useEffect(() => {
    if (mode === 'list') {
      void refreshOps();
      void refresh();
    }
  }, [mode, refresh, refreshOps]);

  useEffect(() => {
    if (mode === 'create' || mode === 'edit') {
      void loadBrands();
    }
  }, [loadBrands, mode]);

  useEffect(() => {
    if (mode === 'create') {
      setSelectedService(null);
      setForm(createEmptyKolamLayananServiceFormState());
      setError(null);
      return;
    }

    const serviceId = getKolamLayananServiceIdFromRoute(route);
    if (!serviceId || (mode !== 'detail' && mode !== 'edit')) {
      return;
    }

    let active = true;
    void (async () => {
      setLoading(true);
      setError(null);
      setRelatedVouchers([]);
      try {
        const live = await getKolamLayananService(serviceId);
        if (!active) {
          return;
        }
        setSelectedService(live);
        if (mode === 'edit') {
          setForm(createKolamLayananServiceFormState(live));
        }
        setDataSource('live');

        if (mode === 'detail') {
          setRelatedVouchersLoading(true);
          try {
            const vouchers = await getKolamLayananPendingServices({
              service: serviceId,
              statuses: KOLAM_LAYANAN_SERVICE_DETAIL_VOUCHER_STATUSES,
              page: 1,
              limit: 200,
            });
            if (active) {
              setRelatedVouchers(
                [...vouchers.items].sort((a, b) => {
                  const ta = a.purchasedAt
                    ? new Date(a.purchasedAt).getTime()
                    : 0;
                  const tb = b.purchasedAt
                    ? new Date(b.purchasedAt).getTime()
                    : 0;
                  return tb - ta;
                }),
              );
            }
          } catch {
            if (active) {
              setRelatedVouchers([]);
            }
          } finally {
            if (active) {
              setRelatedVouchersLoading(false);
            }
          }
        }
      } catch (detailError) {
        if (active) {
          setError(getErrorMessage(detailError));
          setDataSource('error');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [mode, route]);

  const onTabChange = useCallback((tab: KolamLayananListTab) => {
    setActiveTab(tab);
    setPage(1);
    setSearch('');
    return getKolamLayananTabHref(tab);
  }, []);

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const onSetPage = useCallback((nextPage: number) => {
    setPage(Math.max(1, nextPage));
  }, []);

  const onSetPageSize = useCallback((nextSize: number) => {
    setPageSize(Math.max(1, nextSize));
    setPage(1);
  }, []);

  const onSetSubscriptionStatusFilter = useCallback(
    (value: KolamLayananSubscriptionStatus | 'all') => {
      setSubscriptionStatusFilter(value);
      setPage(1);
    },
    [],
  );

  const onCreateNew = useCallback(() => {
    setMode('create');
    setSelectedService(null);
    setForm(createEmptyKolamLayananServiceFormState());
    setError(null);
  }, []);

  const onBackToList = useCallback(() => {
    setMode('list');
    setSelectedService(null);
    setForm(createEmptyKolamLayananServiceFormState());
    setError(null);
  }, []);

  const onSelectService = useCallback((service: KolamLayananService) => {
    setMode('detail');
    setSelectedService(service);
    setError(null);
  }, []);

  const onEdit = useCallback(() => {
    if (!selectedService) {
      return;
    }
    setMode('edit');
    setForm(createKolamLayananServiceFormState(selectedService));
    setError(null);
  }, [selectedService]);

  const onOpenEdit = useCallback((service: KolamLayananService) => {
    setMode('edit');
    setSelectedService(service);
    setForm(createKolamLayananServiceFormState(service));
    setError(null);
  }, []);

  const onChangeForm = useCallback(
    (patch: Partial<KolamLayananServiceFormState>) => {
      setForm(current => ({ ...current, ...patch }));
    },
    [],
  );

  const onToggleBrand = useCallback((brandId: string) => {
    setForm(current => {
      const exists = current.brandIds.includes(brandId);
      return {
        ...current,
        brandIds: exists
          ? current.brandIds.filter(id => id !== brandId)
          : [...current.brandIds, brandId],
      };
    });
  }, []);

  const onToggleEnclosureType = useCallback((enclosureType: string) => {
    setForm(current => {
      const exists = current.enclosureTypes.includes(enclosureType);
      return {
        ...current,
        enclosureTypes: exists
          ? current.enclosureTypes.filter(item => item !== enclosureType)
          : [...current.enclosureTypes, enclosureType],
      };
    });
  }, []);

  const onToggleTaskTypeKey = useCallback((taskType: string) => {
    setForm(current => {
      const exists = current.enclosureTaskTypeKeys.includes(taskType);
      const enclosureTaskTypeKeys = exists
        ? current.enclosureTaskTypeKeys.filter(item => item !== taskType)
        : [...current.enclosureTaskTypeKeys, taskType];
      const nextPrimary =
        current.taskType && enclosureTaskTypeKeys.includes(current.taskType)
          ? current.taskType
          : enclosureTaskTypeKeys[0] || '';
      return {
        ...current,
        enclosureTaskTypeKeys,
        taskType: nextPrimary,
      };
    });
  }, []);

  const onSelectPending = useCallback((_item: KolamLayananPendingService) => {
    setMode('voucher');
  }, []);

  const onSelectSubscription = useCallback(
    (_item: KolamLayananSubscription) => {
      setMode('langganan');
    },
    [],
  );

  const onSave = useCallback(async () => {
    const validationError = validateKolamLayananServiceForm(form);
    if (validationError) {
      setError(validationError);
      return null;
    }

    setSaving(true);
    setError(null);
    try {
      const body = createKolamLayananServiceSavePayload(form);
      const saved =
        mode === 'edit' && form.id
          ? await updateKolamLayananService(form.id, body)
          : await createKolamLayananService(body);
      setSelectedService(saved);
      setForm(createKolamLayananServiceFormState(saved));
      setMode('detail');
      setDataSource('live');
      return saved.id;
    } catch (saveError) {
      setError(getErrorMessage(saveError));
      return null;
    } finally {
      setSaving(false);
    }
  }, [form, mode]);

  const onRefreshAll = useCallback(async () => {
    if (mode === 'list') {
      await Promise.all([refreshOps(), refresh()]);
      return;
    }
    const serviceId =
      selectedService?.id || getKolamLayananServiceIdFromRoute(route);
    if (!serviceId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const live = await getKolamLayananService(serviceId);
      setSelectedService(live);
      if (mode === 'edit') {
        setForm(createKolamLayananServiceFormState(live));
      }
      if (mode === 'detail') {
        setRelatedVouchersLoading(true);
        try {
          const vouchers = await getKolamLayananPendingServices({
            service: serviceId,
            statuses: KOLAM_LAYANAN_SERVICE_DETAIL_VOUCHER_STATUSES,
            page: 1,
            limit: 200,
          });
          setRelatedVouchers(
            [...vouchers.items].sort((a, b) => {
              const ta = a.purchasedAt ? new Date(a.purchasedAt).getTime() : 0;
              const tb = b.purchasedAt ? new Date(b.purchasedAt).getTime() : 0;
              return tb - ta;
            }),
          );
        } catch {
          setRelatedVouchers([]);
        } finally {
          setRelatedVouchersLoading(false);
        }
      }
      setDataSource('live');
    } catch (detailError) {
      setError(getErrorMessage(detailError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [mode, refresh, refreshOps, route, selectedService?.id]);

  return useMemo(
    () => ({
      activeTab,
      brandOptions,
      dataSource,
      error,
      form,
      loading,
      mode,
      opsDashboard,
      opsLoading,
      page,
      pageSize,
      pendingServices,
      relatedVouchers,
      relatedVouchersLoading,
      saving,
      search,
      selectedService,
      services,
      subscriptionStatusFilter,
      subscriptions,
      total,
      totalPages,
      onBackToList,
      onChangeForm,
      onCreateNew,
      onEdit,
      onOpenEdit,
      onRefresh: onRefreshAll,
      onSave,
      onSearchChange,
      onSelectPending,
      onSelectService,
      onSelectSubscription,
      onSetPage,
      onSetPageSize,
      onSetSubscriptionStatusFilter,
      onTabChange,
      onToggleBrand,
      onToggleEnclosureType,
      onToggleTaskTypeKey,
    }),
    [
      activeTab,
      brandOptions,
      dataSource,
      error,
      form,
      loading,
      mode,
      onBackToList,
      onChangeForm,
      onCreateNew,
      onEdit,
      onOpenEdit,
      onRefreshAll,
      onSave,
      onSearchChange,
      onSelectPending,
      onSelectService,
      onSelectSubscription,
      onSetPage,
      onSetPageSize,
      onSetSubscriptionStatusFilter,
      onTabChange,
      onToggleBrand,
      onToggleEnclosureType,
      onToggleTaskTypeKey,
      opsDashboard,
      opsLoading,
      page,
      pageSize,
      pendingServices,
      relatedVouchers,
      relatedVouchersLoading,
      saving,
      search,
      selectedService,
      services,
      subscriptionStatusFilter,
      subscriptions,
      total,
      totalPages,
    ],
  );
}

function getErrorMessage(error: unknown) {
  const message = getApiErrorMessage(error).trim();
  return message || 'Terjadi kesalahan pada modul layanan.';
}

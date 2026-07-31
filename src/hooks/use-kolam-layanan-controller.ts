import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getKolamLayananListTab,
  getKolamLayananRouteMode,
  getKolamLayananTabHref,
  isKolamLayananNativeRoute,
  type KolamLayananListTab,
  type KolamLayananOpsDashboard,
  type KolamLayananPendingService,
  type KolamLayananService,
  type KolamLayananSubscription,
  type KolamLayananSubscriptionStatus,
  type KolamLayananSurfaceMode,
} from '../domain/kolam-layanan';
import { getErrorMessage as getApiErrorMessage } from '../lib/api-error';
import {
  getKolamLayananOpsDashboard,
  getKolamLayananPendingServices,
  getKolamLayananServices,
  getKolamLayananSubscriptions,
} from '../services/kolam-layanan-api';

export type KolamLayananDataSource = 'idle' | 'live' | 'error';

export interface KolamLayananController {
  activeTab: KolamLayananListTab;
  dataSource: KolamLayananDataSource;
  error: string | null;
  loading: boolean;
  mode: KolamLayananSurfaceMode;
  opsDashboard: KolamLayananOpsDashboard | null;
  opsLoading: boolean;
  page: number;
  pageSize: number;
  pendingServices: KolamLayananPendingService[];
  search: string;
  services: KolamLayananService[];
  subscriptionStatusFilter: KolamLayananSubscriptionStatus | 'all';
  subscriptions: KolamLayananSubscription[];
  total: number;
  totalPages: number;
  onCreateNew: () => void;
  onRefresh: () => Promise<void>;
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
  const [subscriptions, setSubscriptions] = useState<KolamLayananSubscription[]>(
    [],
  );
  const [opsDashboard, setOpsDashboard] =
    useState<KolamLayananOpsDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [opsLoading, setOpsLoading] = useState(false);
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
  }, []);

  const onSelectService = useCallback((_service: KolamLayananService) => {
    setMode('detail');
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

  const onRefreshAll = useCallback(async () => {
    await Promise.all([refreshOps(), refresh()]);
  }, [refresh, refreshOps]);

  return useMemo(
    () => ({
      activeTab,
      dataSource,
      error,
      loading,
      mode,
      opsDashboard,
      opsLoading,
      page,
      pageSize,
      pendingServices,
      search,
      services,
      subscriptionStatusFilter,
      subscriptions,
      total,
      totalPages,
      onCreateNew,
      onRefresh: onRefreshAll,
      onSearchChange,
      onSelectPending,
      onSelectService,
      onSelectSubscription,
      onSetPage,
      onSetPageSize,
      onSetSubscriptionStatusFilter,
      onTabChange,
    }),
    [
      activeTab,
      dataSource,
      error,
      loading,
      mode,
      onCreateNew,
      onRefreshAll,
      onSearchChange,
      onSelectPending,
      onSelectService,
      onSelectSubscription,
      onSetPage,
      onSetPageSize,
      onSetSubscriptionStatusFilter,
      onTabChange,
      opsDashboard,
      opsLoading,
      page,
      pageSize,
      pendingServices,
      search,
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

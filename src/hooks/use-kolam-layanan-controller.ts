import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getKolamLayananListTab,
  getKolamLayananRouteMode,
  getKolamLayananTabHref,
  isKolamLayananNativeRoute,
  type KolamLayananListTab,
  type KolamLayananService,
  type KolamLayananSurfaceMode,
} from '../domain/kolam-layanan';
import { getErrorMessage as getApiErrorMessage } from '../lib/api-error';
import { getKolamLayananServices } from '../services/kolam-layanan-api';

export type KolamLayananDataSource = 'idle' | 'live' | 'error';

export interface KolamLayananController {
  activeTab: KolamLayananListTab;
  dataSource: KolamLayananDataSource;
  error: string | null;
  loading: boolean;
  mode: KolamLayananSurfaceMode;
  page: number;
  pageSize: number;
  search: string;
  services: KolamLayananService[];
  total: number;
  totalPages: number;
  onCreateNew: () => void;
  onRefresh: () => Promise<void>;
  onSearchChange: (value: string) => void;
  onSelectService: (service: KolamLayananService) => void;
  onSetPage: (page: number) => void;
  onSetPageSize: (pageSize: number) => void;
  onTabChange: (tab: KolamLayananListTab) => string;
}

export function useKolamLayananController(
  route: string,
): KolamLayananController {
  const initialMode = getKolamLayananRouteMode(route);
  const initialTab = getKolamLayananListTab(route);
  const [mode, setMode] = useState<KolamLayananSurfaceMode>(initialMode);
  const [activeTab, setActiveTab] = useState<KolamLayananListTab>(initialTab);
  const [services, setServices] = useState<KolamLayananService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<KolamLayananDataSource>('idle');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const refresh = useCallback(async () => {
    if (!isKolamLayananNativeRoute(route) || mode !== 'list') {
      return;
    }
    if (activeTab !== 'daftar') {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const live = await getKolamLayananServices({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
      });
      setServices(live.items);
      setTotal(live.total);
      setTotalPages(live.totalPages);
      setDataSource('live');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, mode, page, pageSize, route, search]);

  useEffect(() => {
    setMode(initialMode);
    setActiveTab(initialTab);
  }, [initialMode, initialTab]);

  useEffect(() => {
    if (mode === 'list' && activeTab === 'daftar') {
      void refresh();
    }
  }, [activeTab, mode, refresh]);

  const onTabChange = useCallback((tab: KolamLayananListTab) => {
    setActiveTab(tab);
    setPage(1);
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

  const onCreateNew = useCallback(() => {
    setMode('create');
  }, []);

  const onSelectService = useCallback((_service: KolamLayananService) => {
    setMode('detail');
  }, []);

  return useMemo(
    () => ({
      activeTab,
      dataSource,
      error,
      loading,
      mode,
      page,
      pageSize,
      search,
      services,
      total,
      totalPages,
      onCreateNew,
      onRefresh: refresh,
      onSearchChange,
      onSelectService,
      onSetPage,
      onSetPageSize,
      onTabChange,
    }),
    [
      activeTab,
      dataSource,
      error,
      loading,
      mode,
      onCreateNew,
      onSearchChange,
      onSelectService,
      onSetPage,
      onSetPageSize,
      onTabChange,
      page,
      pageSize,
      refresh,
      search,
      services,
      total,
      totalPages,
    ],
  );
}

function getErrorMessage(error: unknown) {
  const message = getApiErrorMessage(error).trim();
  return message || 'Terjadi kesalahan pada modul layanan.';
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getKolamCampaignRouteMode,
  isKolamCampaignRoute,
  type KolamCampaign,
  type KolamCampaignStatus,
} from '../domain/kolam-campaign';
import { getErrorMessage as getApiErrorMessage } from '../lib/api-error';
import {
  deleteKolamCampaign,
  getKolamCampaigns,
} from '../services/kolam-campaign-api';

export type KolamCampaignSurfaceMode = 'list' | 'detail' | 'edit' | 'new';
export type KolamCampaignDataSource = 'idle' | 'live' | 'error';

export interface KolamCampaignController {
  campaigns: KolamCampaign[];
  dataSource: KolamCampaignDataSource;
  error: string | null;
  loading: boolean;
  mode: KolamCampaignSurfaceMode;
  mutating: boolean;
  page: number;
  pageSize: number;
  search: string;
  statusFilter: '' | KolamCampaignStatus;
  statusMessage: string | null;
  total: number;
  totalPages: number;
  onClearFilters: () => void;
  onCreateNew: () => void;
  onDeleteCampaign: (campaign: KolamCampaign) => Promise<boolean>;
  onRefresh: () => Promise<void>;
  onSearchChange: (value: string) => void;
  onSetPage: (page: number) => void;
  onSetPageSize: (pageSize: number) => void;
  onSetStatusFilter: (value: '' | KolamCampaignStatus) => void;
}

export function useKolamCampaignController(
  route: string,
): KolamCampaignController {
  const initialMode = getKolamCampaignRouteMode(route);
  const [campaigns, setCampaigns] = useState<KolamCampaign[]>([]);
  const [mode, setMode] = useState<KolamCampaignSurfaceMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
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

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (mode === 'list') {
      void refreshList();
    }
  }, [mode, refreshList]);

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
    setError(null);
    setStatusMessage(null);
  }, []);

  const onDeleteCampaign = useCallback(
    async (campaign: KolamCampaign) => {
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
    [refreshList],
  );

  const onRefresh = useCallback(async () => {
    await refreshList();
  }, [refreshList]);

  return useMemo(
    () => ({
      campaigns,
      dataSource,
      error,
      loading,
      mode,
      mutating,
      page,
      pageSize,
      search,
      statusFilter,
      statusMessage,
      total,
      totalPages,
      onClearFilters,
      onCreateNew,
      onDeleteCampaign,
      onRefresh,
      onSearchChange,
      onSetPage,
      onSetPageSize,
      onSetStatusFilter,
    }),
    [
      campaigns,
      dataSource,
      error,
      loading,
      mode,
      mutating,
      onClearFilters,
      onCreateNew,
      onDeleteCampaign,
      onRefresh,
      onSearchChange,
      onSetPage,
      onSetPageSize,
      onSetStatusFilter,
      page,
      pageSize,
      search,
      statusFilter,
      statusMessage,
      total,
      totalPages,
    ],
  );
}

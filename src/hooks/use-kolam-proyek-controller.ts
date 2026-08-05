import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildKolamProyekDetailRouteForItem,
  buildKolamProyekListRoute,
  buildKolamProyekNewRoute,
  getKolamProyekRouteRef,
  getKolamProyekSurfaceMode,
  isKolamProyekRoute,
  type KolamProyekDetail,
  type KolamProyekLifecycleStatus,
  type KolamProyekListItem,
  type KolamProyekSurfaceMode,
} from '../domain/kolam-proyek';
import { getErrorMessage as getApiErrorMessage } from '../lib/api-error';
import {
  getKolamProyek,
  getKolamProyekList,
} from '../services/kolam-proyek-api';

export type KolamProyekDataSource = 'idle' | 'live' | 'error';

export interface KolamProyekController {
  dataSource: KolamProyekDataSource;
  error: string | null;
  items: KolamProyekListItem[];
  lifecycleFilter: '' | KolamProyekLifecycleStatus;
  loading: boolean;
  mode: KolamProyekSurfaceMode;
  page: number;
  pageSize: number;
  selected: KolamProyekDetail | null;
  statusMessage: string | null;
  total: number;
  totalPages: number;
  onBackToList: () => void;
  onCreateNew: () => void;
  onOpenItem: (item: KolamProyekListItem) => void;
  onRefresh: () => Promise<void>;
  onSetLifecycleFilter: (status: '' | KolamProyekLifecycleStatus) => void;
  onSetPage: (page: number) => void;
  onSetPageSize: (pageSize: number) => void;
}

export function useKolamProyekController(
  route: string,
  onRouteChange?: (route: string) => void,
): KolamProyekController {
  const mode = getKolamProyekSurfaceMode(route);
  const routeRef = getKolamProyekRouteRef(route);

  const [items, setItems] = useState<KolamProyekListItem[]>([]);
  const [selected, setSelected] = useState<KolamProyekDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<KolamProyekDataSource>('idle');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [lifecycleFilter, setLifecycleFilter] = useState<
    '' | KolamProyekLifecycleStatus
  >('');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const refreshList = useCallback(async () => {
    if (!isKolamProyekRoute(route)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const live = await getKolamProyekList({
        page,
        limit: pageSize,
        lifecycleStatus: lifecycleFilter || undefined,
      });
      setItems(live.items);
      setTotal(live.total);
      setTotalPages(live.totalPages);
      setDataSource('live');
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [lifecycleFilter, page, pageSize, route]);

  const refreshDetail = useCallback(async () => {
    if (!routeRef) {
      setSelected(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const detail = await getKolamProyek(routeRef);
      setSelected(detail);
      setDataSource('live');
    } catch (loadError) {
      setSelected(null);
      setError(getApiErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [routeRef]);

  useEffect(() => {
    if (mode === 'list') {
      void refreshList();
      return;
    }
    if (mode === 'detail' || mode === 'edit') {
      void refreshDetail();
    }
  }, [mode, refreshDetail, refreshList]);

  const onRefresh = useCallback(async () => {
    setStatusMessage(null);
    if (mode === 'list') {
      await refreshList();
      return;
    }
    if (mode === 'detail' || mode === 'edit') {
      await refreshDetail();
    }
  }, [mode, refreshDetail, refreshList]);

  const onBackToList = useCallback(() => {
    setStatusMessage(null);
    onRouteChange?.(buildKolamProyekListRoute());
  }, [onRouteChange]);

  const onCreateNew = useCallback(() => {
    setStatusMessage(null);
    onRouteChange?.(buildKolamProyekNewRoute());
  }, [onRouteChange]);

  const onOpenItem = useCallback(
    (item: KolamProyekListItem) => {
      setStatusMessage(null);
      onRouteChange?.(buildKolamProyekDetailRouteForItem(item));
    },
    [onRouteChange],
  );

  const onSetLifecycleFilter = useCallback(
    (status: '' | KolamProyekLifecycleStatus) => {
      setLifecycleFilter(status);
      setPage(1);
    },
    [],
  );

  const onSetPage = useCallback((next: number) => {
    setPage(Math.max(1, next));
  }, []);

  const onSetPageSize = useCallback((next: number) => {
    setPageSize(Math.max(1, next));
    setPage(1);
  }, []);

  return useMemo(
    () => ({
      dataSource,
      error,
      items,
      lifecycleFilter,
      loading,
      mode,
      page,
      pageSize,
      selected,
      statusMessage,
      total,
      totalPages,
      onBackToList,
      onCreateNew,
      onOpenItem,
      onRefresh,
      onSetLifecycleFilter,
      onSetPage,
      onSetPageSize,
    }),
    [
      dataSource,
      error,
      items,
      lifecycleFilter,
      loading,
      mode,
      onBackToList,
      onCreateNew,
      onOpenItem,
      onRefresh,
      onSetLifecycleFilter,
      onSetPage,
      onSetPageSize,
      page,
      pageSize,
      selected,
      statusMessage,
      total,
      totalPages,
    ],
  );
}

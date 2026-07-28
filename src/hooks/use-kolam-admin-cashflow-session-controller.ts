import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createInitialAdminCashflowListFilters,
  getKolamAdminCashflowRouteId,
  getKolamAdminCashflowSurfaceMode,
  type KolamAdminCashflowListFilters,
  type KolamAdminCashflowOpenBody,
  type KolamAdminCashflowPagination,
  type KolamAdminCashflowSession,
  type KolamAdminCashflowSurfaceMode,
  type KolamAdminCashflowTodaySession,
} from '../domain/kolam-admin-cashflow-session';
import { ApiError } from '../lib/api-error';
import {
  getKolamAdminCashflowActiveProbe,
  getKolamAdminCashflowSessions,
  openKolamAdminCashflowSession,
} from '../services/kolam-cashflow-session-api';

export interface KolamAdminCashflowSessionController {
  mode: KolamAdminCashflowSurfaceMode;
  documentId: string | null;
  filters: KolamAdminCashflowListFilters;
  items: KolamAdminCashflowSession[];
  filteredItems: KolamAdminCashflowSession[];
  pagination: KolamAdminCashflowPagination;
  todaySession: KolamAdminCashflowTodaySession | null;
  loading: boolean;
  opening: boolean;
  error: string;
  statusMessage: string;
  onChangeFilters: (patch: Partial<KolamAdminCashflowListFilters>) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onRefresh: () => Promise<void>;
  onOpenSession: (
    body: KolamAdminCashflowOpenBody,
  ) => Promise<KolamAdminCashflowSession | null>;
  clearStatusMessage: () => void;
}

export function useKolamAdminCashflowSessionController(
  route: string,
): KolamAdminCashflowSessionController {
  const mode = getKolamAdminCashflowSurfaceMode(route);
  const documentId = getKolamAdminCashflowRouteId(route);
  const [filters, setFilters] = useState<KolamAdminCashflowListFilters>(() =>
    createInitialAdminCashflowListFilters(),
  );
  const [items, setItems] = useState<KolamAdminCashflowSession[]>([]);
  const [pagination, setPagination] = useState<KolamAdminCashflowPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [todaySession, setTodaySession] =
    useState<KolamAdminCashflowTodaySession | null>(null);
  const [loading, setLoading] = useState(false);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const filteredItems = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    if (!query) {
      return items;
    }
    return items.filter(session => {
      const openedBy = session.openedBy?.name || '';
      const haystack = `${session.name} ${session.status} ${openedBy}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [filters.search, items]);

  const refreshList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const current = filtersRef.current;
      const [listResult, probe] = await Promise.all([
        getKolamAdminCashflowSessions({
          page: current.page,
          limit: current.limit,
          status: current.status,
          source: current.source,
        }),
        getKolamAdminCashflowActiveProbe(),
      ]);
      setItems(listResult.items);
      setPagination(listResult.pagination);
      setTodaySession(probe.todaySession);
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memuat sesi tunai.'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mode !== 'list') {
      return;
    }
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError('');
      try {
        const current = filtersRef.current;
        const [listResult, probe] = await Promise.all([
          getKolamAdminCashflowSessions({
            page: current.page,
            limit: current.limit,
            status: current.status,
            source: current.source,
          }),
          getKolamAdminCashflowActiveProbe(),
        ]);
        if (cancelled) {
          return;
        }
        setItems(listResult.items);
        setPagination(listResult.pagination);
        setTodaySession(probe.todaySession);
      } catch (err) {
        if (cancelled) {
          return;
        }
        setError(getErrorMessage(err, 'Gagal memuat sesi tunai.'));
        setItems([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    mode,
    filters.page,
    filters.limit,
    filters.status,
    filters.source,
  ]);

  useEffect(() => {
    if (mode !== 'create') {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const probe = await getKolamAdminCashflowActiveProbe();
        if (!cancelled) {
          setTodaySession(probe.todaySession);
        }
      } catch {
        if (!cancelled) {
          setTodaySession(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const onChangeFilters = useCallback(
    (patch: Partial<KolamAdminCashflowListFilters>) => {
      setFilters(current => {
        const next = { ...current, ...patch };
        if (
          patch.status !== undefined ||
          patch.source !== undefined ||
          patch.search !== undefined ||
          patch.limit !== undefined
        ) {
          next.page = patch.page ?? 1;
        }
        return next;
      });
    },
    [],
  );

  const onClearFilters = useCallback(() => {
    setFilters(createInitialAdminCashflowListFilters());
  }, []);

  const onPageChange = useCallback((page: number) => {
    setFilters(current => ({ ...current, page }));
  }, []);

  const onLimitChange = useCallback((limit: number) => {
    setFilters(current => ({ ...current, limit, page: 1 }));
  }, []);

  const onOpenSession = useCallback(
    async (body: KolamAdminCashflowOpenBody) => {
      setOpening(true);
      setError('');
      setStatusMessage('');
      try {
        const session = await openKolamAdminCashflowSession(body);
        setStatusMessage(`Sesi tunai dibuka: ${session.name}`);
        return session;
      } catch (err) {
        setError(getErrorMessage(err, 'Gagal membuka sesi tunai.'));
        return null;
      } finally {
        setOpening(false);
      }
    },
    [],
  );

  return {
    mode,
    documentId,
    filters,
    items,
    filteredItems,
    pagination,
    todaySession,
    loading,
    opening,
    error,
    statusMessage,
    onChangeFilters,
    onClearFilters,
    onPageChange,
    onLimitChange,
    onRefresh: refreshList,
    onOpenSession,
    clearStatusMessage: () => setStatusMessage(''),
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getKolamComplaintIdFromRoute,
  getKolamComplaintRouteMode,
  isKolamComplaintRoute,
  type KolamComplaint,
  type KolamComplaintDecision,
  type KolamComplaintSource,
  type KolamComplaintStatus,
} from '../domain/kolam-complaint';
import { getErrorMessage as getApiErrorMessage } from '../lib/api-error';
import {
  getKolamComplaint,
  getKolamComplaints,
} from '../services/kolam-complaint-api';

export type KolamComplaintSurfaceMode = 'list' | 'detail' | 'new';
export type KolamComplaintDataSource = 'idle' | 'live' | 'error';

export interface KolamComplaintController {
  complaints: KolamComplaint[];
  customProjectOnly: boolean;
  dataSource: KolamComplaintDataSource;
  decisionFilter: NonNullable<KolamComplaintDecision> | 'all';
  error: string | null;
  loading: boolean;
  mode: KolamComplaintSurfaceMode;
  page: number;
  pageSize: number;
  search: string;
  selectedComplaint: KolamComplaint | null;
  sourceFilter: KolamComplaintSource | 'all';
  statusFilter: KolamComplaintStatus | 'all';
  total: number;
  totalPages: number;
  onBackToList: () => void;
  onCreateNew: () => void;
  onRefresh: () => Promise<void>;
  onSearchChange: (value: string) => void;
  onSelectComplaint: (complaint: KolamComplaint) => Promise<void>;
  onSetCustomProjectOnly: (value: boolean) => void;
  onSetDecisionFilter: (
    value: NonNullable<KolamComplaintDecision> | 'all',
  ) => void;
  onSetPage: (page: number) => void;
  onSetPageSize: (pageSize: number) => void;
  onSetSourceFilter: (value: KolamComplaintSource | 'all') => void;
  onSetStatusFilter: (value: KolamComplaintStatus | 'all') => void;
}

export function useKolamComplaintController(
  route: string,
): KolamComplaintController {
  const initialMode = getKolamComplaintRouteMode(route);
  const [complaints, setComplaints] = useState<KolamComplaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] =
    useState<KolamComplaint | null>(null);
  const [mode, setMode] = useState<KolamComplaintSurfaceMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] =
    useState<KolamComplaintDataSource>('idle');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    KolamComplaintStatus | 'all'
  >('all');
  const [decisionFilter, setDecisionFilter] = useState<
    NonNullable<KolamComplaintDecision> | 'all'
  >('all');
  const [sourceFilter, setSourceFilter] = useState<
    KolamComplaintSource | 'all'
  >('all');
  const [customProjectOnly, setCustomProjectOnly] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const refresh = useCallback(async () => {
    if (!isKolamComplaintRoute(route)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const live = await getKolamComplaints({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        decision: decisionFilter === 'all' ? undefined : decisionFilter,
        source: sourceFilter === 'all' ? undefined : sourceFilter,
        customProject: customProjectOnly || undefined,
      });
      setComplaints(live.items);
      setTotal(live.total);
      setTotalPages(live.totalPages);
      setDataSource('live');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [
    customProjectOnly,
    decisionFilter,
    page,
    pageSize,
    route,
    search,
    sourceFilter,
    statusFilter,
  ]);

  useEffect(() => {
    setMode(initialMode);
    if (initialMode === 'new') {
      setSelectedComplaint(null);
    }
  }, [initialMode]);

  useEffect(() => {
    if (mode === 'list' || mode === 'new') {
      void refresh();
    }
  }, [mode, refresh]);

  const onSelectComplaint = useCallback(async (complaint: KolamComplaint) => {
    setMode('detail');
    setSelectedComplaint(complaint);
    setError(null);

    try {
      const live = await getKolamComplaint(complaint.id);
      setSelectedComplaint(live);
      setDataSource('live');
    } catch (detailError) {
      setError(getErrorMessage(detailError));
    }
  }, []);

  useEffect(() => {
    const complaintId = getKolamComplaintIdFromRoute(route);
    if (!complaintId || mode === 'new') {
      return;
    }

    if (selectedComplaint?.id === complaintId) {
      return;
    }

    let active = true;
    void (async () => {
      const fromList = complaints.find(item => item.id === complaintId);
      if (fromList) {
        if (active) {
          await onSelectComplaint(fromList);
        }
        return;
      }

      try {
        const live = await getKolamComplaint(complaintId);
        if (!active) {
          return;
        }
        setSelectedComplaint(live);
        setMode('detail');
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
  }, [complaints, mode, onSelectComplaint, route, selectedComplaint?.id]);

  const onBackToList = useCallback(() => {
    setMode('list');
    setSelectedComplaint(null);
    setError(null);
  }, []);

  const onCreateNew = useCallback(() => {
    setMode('new');
    setSelectedComplaint(null);
    setError(null);
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

  const onSetStatusFilter = useCallback(
    (value: KolamComplaintStatus | 'all') => {
      setStatusFilter(value);
      setPage(1);
    },
    [],
  );

  const onSetDecisionFilter = useCallback(
    (value: NonNullable<KolamComplaintDecision> | 'all') => {
      setDecisionFilter(value);
      setPage(1);
    },
    [],
  );

  const onSetSourceFilter = useCallback(
    (value: KolamComplaintSource | 'all') => {
      setSourceFilter(value);
      setPage(1);
    },
    [],
  );

  const onSetCustomProjectOnly = useCallback((value: boolean) => {
    setCustomProjectOnly(value);
    setPage(1);
  }, []);

  return useMemo(
    () => ({
      complaints,
      customProjectOnly,
      dataSource,
      decisionFilter,
      error,
      loading,
      mode,
      page,
      pageSize,
      search,
      selectedComplaint,
      sourceFilter,
      statusFilter,
      total,
      totalPages,
      onBackToList,
      onCreateNew,
      onRefresh: refresh,
      onSearchChange,
      onSelectComplaint,
      onSetCustomProjectOnly,
      onSetDecisionFilter,
      onSetPage,
      onSetPageSize,
      onSetSourceFilter,
      onSetStatusFilter,
    }),
    [
      complaints,
      customProjectOnly,
      dataSource,
      decisionFilter,
      error,
      loading,
      mode,
      onBackToList,
      onCreateNew,
      onSearchChange,
      onSelectComplaint,
      onSetCustomProjectOnly,
      onSetDecisionFilter,
      onSetPage,
      onSetPageSize,
      onSetSourceFilter,
      onSetStatusFilter,
      page,
      pageSize,
      refresh,
      search,
      selectedComplaint,
      sourceFilter,
      statusFilter,
      total,
      totalPages,
    ],
  );
}

function getErrorMessage(error: unknown) {
  const message = getApiErrorMessage(error).trim();
  return message || 'Terjadi kesalahan pada modul komplain.';
}

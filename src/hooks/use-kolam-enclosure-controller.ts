import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  createInitialEnclosureListFilters,
  getKolamEnclosureRouteId,
  getKolamEnclosureSurfaceMode,
  groupKolamEnclosureAllocationRows,
  normalizeKolamEnclosurePageSize,
  type KolamEnclosure,
  type KolamEnclosureAllocationOverview,
  type KolamEnclosureDashboardStats,
  type KolamEnclosureListFilters,
  type KolamEnclosureListTab,
  type KolamEnclosurePagination,
  type KolamEnclosurePendingAllocation,
  type KolamEnclosureStaffRef,
  type KolamEnclosureSurfaceMode,
} from '../domain/kolam-enclosure';
import {getErrorMessage} from '../lib/api-error';
import {
  getKolamEnclosureDashboardStats,
  getKolamEnclosureStaffAssignees,
  getKolamEnclosures,
  getKolamPendingLivestockAllocations,
  getKolamSpeciesAllocationOverview,
} from '../services/kolam-enclosure-api';

export type KolamEnclosureDataSource = 'idle' | 'live' | 'error';

const DEFAULT_PAGINATION: KolamEnclosurePagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

const EMPTY_DASHBOARD_STATS: KolamEnclosureDashboardStats = {
  totals: {
    enclosures: 0,
    speciesDistinct: 0,
    individuals: 0,
  },
  byType: [],
  production: {
    rows: [],
    speciesDistinct: 0,
    totalQty: 0,
  },
  saleable: {
    rows: [],
    speciesDistinct: 0,
    totalQty: 0,
  },
  deaths: {
    recent: [],
    reportedAnimals: 0,
    reportedCases: 0,
    totalAnimals: 0,
    totalCases: 0,
  },
  births: {
    totalAnimals: 0,
    totalCases: 0,
  },
};

const EMPTY_ALLOCATION_OVERVIEW: KolamEnclosureAllocationOverview = {
  totals: {
    rowCount: 0,
    speciesCount: 0,
    totalAllocated: 0,
    totalStock: 0,
    totalUnallocated: 0,
  },
  items: [],
};

export interface KolamEnclosureController {
  activeTab: KolamEnclosureListTab;
  allocationOverview: KolamEnclosureAllocationOverview;
  allocationSpeciesGroups: ReturnType<typeof groupKolamEnclosureAllocationRows>;
  dashboardStats: KolamEnclosureDashboardStats;
  dataSource: KolamEnclosureDataSource;
  enclosures: KolamEnclosure[];
  error: string | null;
  filters: KolamEnclosureListFilters;
  loading: boolean;
  mode: KolamEnclosureSurfaceMode;
  pagination: KolamEnclosurePagination;
  pendingAllocations: KolamEnclosurePendingAllocation[];
  pendingTotal: number;
  routeEnclosureId: string;
  staffAssignees: KolamEnclosureStaffRef[];
  statusMessage: string | null;
  onChangeFilters: (patch: Partial<KolamEnclosureListFilters>) => void;
  onClearFilters: () => void;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => Promise<void>;
  onSearchChange: (search: string) => void;
  onTabChange: (tab: KolamEnclosureListTab) => void;
}

export function useKolamEnclosureController(
  route: string,
): KolamEnclosureController {
  const requestSeq = useRef(0);
  const routeRef = useRef(route);
  const [mode, setMode] = useState<KolamEnclosureSurfaceMode>(() =>
    getKolamEnclosureSurfaceMode(route),
  );
  const [filters, setFilters] = useState<KolamEnclosureListFilters>(() =>
    createInitialEnclosureListFilters(route),
  );
  const [enclosures, setEnclosures] = useState<KolamEnclosure[]>([]);
  const [dashboardStats, setDashboardStats] =
    useState<KolamEnclosureDashboardStats>(EMPTY_DASHBOARD_STATS);
  const [pendingAllocations, setPendingAllocations] = useState<
    KolamEnclosurePendingAllocation[]
  >([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [allocationOverview, setAllocationOverview] =
    useState<KolamEnclosureAllocationOverview>(EMPTY_ALLOCATION_OVERVIEW);
  const [staffAssignees, setStaffAssignees] = useState<KolamEnclosureStaffRef[]>(
    [],
  );
  const [pagination, setPagination] =
    useState<KolamEnclosurePagination>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] =
    useState<KolamEnclosureDataSource>('idle');

  useEffect(() => {
    if (routeRef.current === route) {
      return;
    }
    routeRef.current = route;
    setMode(getKolamEnclosureSurfaceMode(route));
    setFilters(createInitialEnclosureListFilters(route));
    setError(null);
    setStatusMessage(null);
  }, [route]);

  const refresh = useCallback(async () => {
    const currentMode = getKolamEnclosureSurfaceMode(route);
    const activeRequest = requestSeq.current + 1;
    requestSeq.current = activeRequest;

    if (currentMode === 'unsupported') {
      setDataSource('idle');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (filters.scope === 'dashboard') {
        const [stats, assignees] = await Promise.all([
          getKolamEnclosureDashboardStats(),
          getKolamEnclosureStaffAssignees({limit: 200}).catch(() => []),
        ]);
        if (requestSeq.current !== activeRequest) {
          return;
        }
        setDashboardStats(stats);
        setStaffAssignees(assignees);
        setDataSource('live');
        return;
      }

      if (filters.scope === 'pending') {
        const [result, assignees] = await Promise.all([
          getKolamPendingLivestockAllocations({status: 'pending'}),
          getKolamEnclosureStaffAssignees({limit: 200}).catch(() => []),
        ]);
        if (requestSeq.current !== activeRequest) {
          return;
        }
        setPendingAllocations(result.items);
        setPendingTotal(result.total);
        setStaffAssignees(assignees);
        setDataSource('live');
        return;
      }

      if (filters.scope === 'allocation') {
        const [overview, assignees] = await Promise.all([
          getKolamSpeciesAllocationOverview(),
          getKolamEnclosureStaffAssignees({limit: 200}).catch(() => []),
        ]);
        if (requestSeq.current !== activeRequest) {
          return;
        }
        setAllocationOverview(overview);
        setStaffAssignees(assignees);
        setDataSource('live');
        return;
      }

      const pageLimit = normalizeKolamEnclosurePageSize(filters.limit);
      const [listResult, assignees] = await Promise.all([
        getKolamEnclosures({...filters, limit: pageLimit}),
        getKolamEnclosureStaffAssignees({limit: 200}).catch(() => []),
      ]);
      if (requestSeq.current !== activeRequest) {
        return;
      }
      setEnclosures(listResult.data.slice(0, pageLimit));
      setPagination({
        ...listResult.pagination,
        limit: pageLimit,
        page: filters.page,
        totalPages: Math.max(
          1,
          Math.ceil(listResult.pagination.total / pageLimit),
        ),
      });
      if (filters.limit !== pageLimit) {
        setFilters(current =>
          current.limit === pageLimit
            ? current
            : {...current, limit: pageLimit, page: 1},
        );
      }
      setStaffAssignees(assignees);
      setDataSource('live');
    } catch (loadError) {
      if (requestSeq.current !== activeRequest) {
        return;
      }
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      if (requestSeq.current === activeRequest) {
        setLoading(false);
      }
    }
  }, [filters, route]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onChangeFilters = useCallback(
    (patch: Partial<KolamEnclosureListFilters>) => {
      setFilters(current => ({
        ...current,
        ...patch,
        page: patch.page ?? 1,
      }));
      setStatusMessage(null);
    },
    [],
  );

  const onSearchChange = useCallback((search: string) => {
    setFilters(current => ({...current, page: 1, search}));
    setStatusMessage(null);
  }, []);

  const onPageChange = useCallback((page: number) => {
    setFilters(current => ({...current, page: Math.max(1, page)}));
  }, []);

  const onLimitChange = useCallback((limit: number) => {
    setFilters(current => ({
      ...current,
      limit: normalizeKolamEnclosurePageSize(limit),
      page: 1,
    }));
  }, []);

  const onClearFilters = useCallback(() => {
    setFilters(current => ({
      search: '',
      scope: current.scope,
      page: 1,
      limit: normalizeKolamEnclosurePageSize(current.limit),
      livestockPurpose: 'all',
      enclosureType: 'all',
    }));
    setStatusMessage(null);
  }, []);

  const onTabChange = useCallback((tab: KolamEnclosureListTab) => {
    setFilters(current => ({
      ...current,
      scope: tab,
      page: 1,
      limit: normalizeKolamEnclosurePageSize(current.limit),
    }));
    setError(null);
    setStatusMessage(null);
  }, []);

  const allocationSpeciesGroups = useMemo(
    () => groupKolamEnclosureAllocationRows(allocationOverview.items),
    [allocationOverview.items],
  );

  return {
    activeTab: filters.scope,
    allocationOverview,
    allocationSpeciesGroups,
    dashboardStats,
    dataSource,
    enclosures,
    error,
    filters,
    loading,
    mode,
    pagination,
    pendingAllocations,
    pendingTotal,
    routeEnclosureId: getKolamEnclosureRouteId(route),
    staffAssignees,
    statusMessage,
    onChangeFilters,
    onClearFilters,
    onLimitChange,
    onPageChange,
    onRefresh: refresh,
    onSearchChange,
    onTabChange,
  };
}

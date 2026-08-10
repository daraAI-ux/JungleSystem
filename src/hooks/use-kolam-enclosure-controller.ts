import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  createInitialEnclosureListFilters,
  getKolamEnclosureRouteId,
  getKolamEnclosureSurfaceMode,
  groupKolamEnclosureAllocationRows,
  normalizeKolamEnclosurePageSize,
  type KolamEnclosure,
  type KolamEnclosureAllocationOverview,
  type KolamEnclosureComment,
  type KolamEnclosureDashboardStats,
  type KolamEnclosureListFilters,
  type KolamEnclosureListTab,
  type KolamEnclosurePagination,
  type KolamEnclosurePendingAllocation,
  type KolamEnclosureRecurringEnrollment,
  type KolamEnclosureStaffRef,
  type KolamEnclosureStatistics,
  type KolamEnclosureSurfaceMode,
  type KolamEnclosureTaskItem,
  type KolamEnclosureTaskType,
} from '../domain/kolam-enclosure';
import type {KolamBrand} from '../domain/kolam-brand';
import type {KolamStockTransaction} from '../domain/kolam-stock-transaction';
import type {KolamUnit} from '../domain/kolam-unit';
import {getErrorMessage} from '../lib/api-error';
import {getKolamBrands} from '../services/kolam-brand-api';
import {
  addKolamEnclosureProductionEggs,
  advanceKolamEnclosureProductionEggs,
  attachKolamEnclosureSpecies,
  changeKolamEnclosureProductionPhase,
  createKolamEnclosure,
  createKolamEnclosureComment,
  crossPoolTransferKolamEnclosureSpecies,
  deleteKolamEnclosureComment,
  deleteKolamEnclosureCoverPhoto,
  deleteKolamEnclosurePhoto,
  editKolamEnclosureComment,
  getKolamEnclosureDashboardStats,
  getKolamEnclosureComments,
  getKolamEnclosureDetail,
  getKolamEnclosureRecurringEnrollments,
  getKolamEnclosureStaffAssignees,
  getKolamEnclosureStatistics,
  getKolamEnclosureTaskTypes,
  getKolamEnclosureTasks,
  getKolamEnclosures,
  getKolamPendingLivestockAllocations,
  getKolamSpeciesAllocationOverview,
  likeKolamEnclosureComment,
  moveKolamEnclosureProductionPhaseToSale,
  recordKolamEnclosurePopulationEvent,
  replyKolamEnclosureComment,
  setKolamEnclosureRecurringEnrollment,
  spawnKolamEnclosureTask,
  switchKolamEnclosureSpeciesVariant,
  transferKolamEnclosureSpecies,
  updateKolamEnclosure,
  updateKolamEnclosureAssignedTo,
  updateKolamEnclosureSaleListing,
  uploadKolamEnclosureCoverPhoto,
  uploadKolamEnclosurePhotos,
  upsertKolamEnclosureParameter,
  type KolamEnclosureCrossPoolTransferInput,
  type KolamEnclosureCreateBody,
  type KolamEnclosureParameterInput,
  type KolamEnclosurePopulationEventInput,
  type KolamEnclosureProductionEggAdvanceInput,
  type KolamEnclosureProductionEggInput,
  type KolamEnclosureProductionPhaseChangeInput,
  type KolamEnclosureProductionPhaseToSaleInput,
  type KolamEnclosureSaleListingInput,
  type KolamEnclosureSpeciesAttachInput,
  type KolamEnclosureSpeciesTransferInput,
  type KolamEnclosureUpdateBody,
  type KolamEnclosureVariantSwitchInput,
} from '../services/kolam-enclosure-api';
import {
  getKolamLocations,
  type KolamLocationOption,
} from '../services/kolam-location-api';
import {getKolamStockTransactionList} from '../services/kolam-stock-transaction-api';
import {getKolamUnits} from '../services/kolam-unit-api';

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
  selectedEnclosure: KolamEnclosure | null;
  enclosureComments: KolamEnclosureComment[];
  enclosureStatistics: KolamEnclosureStatistics | null;
  enclosureStatisticsError: string | null;
  enclosureStatisticsLoading: boolean;
  enclosureTasks: KolamEnclosureTaskItem[];
  enclosureTasksLoading: boolean;
  enclosureTaskTypes: KolamEnclosureTaskType[];
  enclosureRecurringEnrollments: KolamEnclosureRecurringEnrollment[];
  enclosureRecurringLoading: boolean;
  enclosureStockTransactions: KolamStockTransaction[];
  enclosureStockTransactionsLoading: boolean;
  enclosureStockTransactionsError: string | null;
  editBrands: KolamBrand[];
  editLocations: KolamLocationOption[];
  editUnits: KolamUnit[];
  operationLoading: boolean;
  staffAssignees: KolamEnclosureStaffRef[];
  statusMessage: string | null;
  onAddProductionEggs: (input: KolamEnclosureProductionEggInput) => Promise<void>;
  onAdvanceProductionEggs: (input: KolamEnclosureProductionEggAdvanceInput) => Promise<void>;
  onChangeFilters: (patch: Partial<KolamEnclosureListFilters>) => void;
  onChangeProductionPhase: (input: KolamEnclosureProductionPhaseChangeInput) => Promise<void>;
  onClearFilters: () => void;
  onCreateComment: (comment: string) => Promise<void>;
  onCrossPoolTransferSpecies: (input: KolamEnclosureCrossPoolTransferInput) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onDeleteCoverPhoto: () => Promise<void>;
  onDeletePhoto: (index: number) => Promise<void>;
  onEditComment: (commentId: string, comment: string) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<void>;
  onLimitChange: (limit: number) => void;
  onMoveProductionPhaseToSale: (input: KolamEnclosureProductionPhaseToSaleInput) => Promise<void>;
  onPageChange: (page: number) => void;
  onRecordPopulationEvent: (input: KolamEnclosurePopulationEventInput) => Promise<void>;
  onRefresh: () => Promise<void>;
  onRefreshComments: () => Promise<void>;
  onRefreshTasks: () => Promise<void>;
  onRefreshStockTransactions: () => Promise<void>;
  onReplyComment: (commentId: string, comment: string) => Promise<void>;
  onSearchChange: (search: string) => void;
  onSetRecurringEnrollment: (input: {
    taskTypeId: string;
    active: boolean;
  }) => Promise<void>;
  onSpawnTask: (input: {
    title?: string;
    taskTypeId?: string;
  }) => Promise<void>;
  onProvisionCode: (enclosureCode: string) => Promise<void>;
  onSaveEnclosureEdit: (input: {
    body: KolamEnclosureUpdateBody;
    assignedTo: string | null;
  }) => Promise<boolean>;
  onCreateEnclosure?: (body: KolamEnclosureCreateBody) => Promise<KolamEnclosure | null>;
  onUpsertClimateParameter: (body: KolamEnclosureParameterInput) => Promise<void>;
  onSwitchSpeciesVariant: (input: KolamEnclosureVariantSwitchInput) => Promise<void>;
  onTabChange: (tab: KolamEnclosureListTab) => void;
  onTransferSpecies: (input: KolamEnclosureSpeciesTransferInput) => Promise<void>;
  onUpdateParameter: (body: KolamEnclosureParameterInput) => Promise<void>;
  onUpdateSaleListing: (body: KolamEnclosureSaleListingInput) => Promise<void>;
  onUploadCoverPhoto: (localUri: string) => Promise<void>;
  onUploadPhotos: (localUris: string[]) => Promise<void>;
  onAttachSpecies: (input: KolamEnclosureSpeciesAttachInput) => Promise<void>;
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
  const [selectedEnclosure, setSelectedEnclosure] =
    useState<KolamEnclosure | null>(null);
  const [enclosureComments, setEnclosureComments] = useState<
    KolamEnclosureComment[]
  >([]);
  const [enclosureStatistics, setEnclosureStatistics] =
    useState<KolamEnclosureStatistics | null>(null);
  const [enclosureStatisticsError, setEnclosureStatisticsError] =
    useState<string | null>(null);
  const [enclosureStatisticsLoading, setEnclosureStatisticsLoading] =
    useState(false);
  const [enclosureTasks, setEnclosureTasks] = useState<KolamEnclosureTaskItem[]>(
    [],
  );
  const [enclosureTasksLoading, setEnclosureTasksLoading] = useState(false);
  const [enclosureTaskTypes, setEnclosureTaskTypes] = useState<
    KolamEnclosureTaskType[]
  >([]);
  const [enclosureRecurringEnrollments, setEnclosureRecurringEnrollments] =
    useState<KolamEnclosureRecurringEnrollment[]>([]);
  const [enclosureRecurringLoading, setEnclosureRecurringLoading] =
    useState(false);
  const [enclosureStockTransactions, setEnclosureStockTransactions] = useState<
    KolamStockTransaction[]
  >([]);
  const [enclosureStockTransactionsLoading, setEnclosureStockTransactionsLoading] =
    useState(false);
  const [enclosureStockTransactionsError, setEnclosureStockTransactionsError] =
    useState<string | null>(null);
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
  const [editBrands, setEditBrands] = useState<KolamBrand[]>([]);
  const [editLocations, setEditLocations] = useState<KolamLocationOption[]>([]);
  const [editUnits, setEditUnits] = useState<KolamUnit[]>([]);
  const [pagination, setPagination] =
    useState<KolamEnclosurePagination>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false);
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
    setSelectedEnclosure(null);
    setEnclosureComments([]);
    setEnclosureStatistics(null);
    setEnclosureStatisticsError(null);
    setEnclosureTasks([]);
    setEnclosureTaskTypes([]);
    setEnclosureRecurringEnrollments([]);
    setEnclosureStockTransactions([]);
    setEnclosureStockTransactionsError(null);
    setStaffAssignees([]);
    setEditBrands([]);
    setEditLocations([]);
    setEditUnits([]);
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
      if (currentMode === 'detail' || currentMode === 'customer-detail') {
        const enclosureId = getKolamEnclosureRouteId(route);
        if (!enclosureId) {
          setSelectedEnclosure(null);
          setDataSource('error');
          setError('ID kandang tidak ditemukan.');
          return;
        }
        setEnclosureStatisticsLoading(true);
        setEnclosureStatisticsError(null);
        const [detail, statisticsResult] = await Promise.all([
          getKolamEnclosureDetail(enclosureId),
          getKolamEnclosureStatistics(enclosureId)
            .then(data => ({data, error: null as string | null}))
            .catch(loadError => ({
              data: null,
              error: getErrorMessage(loadError),
            })),
        ]);
        if (requestSeq.current !== activeRequest) {
          return;
        }
        setSelectedEnclosure(detail);
        setEnclosureStatistics(statisticsResult.data);
        setEnclosureStatisticsError(statisticsResult.error);
        setEnclosureTasksLoading(true);
        setEnclosureRecurringLoading(true);
        void getKolamEnclosureComments(enclosureId)
          .then(comments => {
            if (requestSeq.current === activeRequest) {
              setEnclosureComments(comments);
            }
          })
          .catch(() => {
            if (requestSeq.current === activeRequest) {
              setEnclosureComments([]);
            }
          });
        void Promise.all([
          getKolamEnclosureTasks(enclosureId)
            .then(tasks => ({tasks, error: null as string | null}))
            .catch(() => ({tasks: [] as KolamEnclosureTaskItem[], error: 'tasks'})),
          getKolamEnclosureTaskTypes()
            .then(types => ({types, error: null as string | null}))
            .catch(() => ({
              types: [] as KolamEnclosureTaskType[],
              error: 'types',
            })),
          getKolamEnclosureRecurringEnrollments(enclosureId)
            .then(enrollments => ({enrollments, error: null as string | null}))
            .catch(() => ({
              enrollments: [] as KolamEnclosureRecurringEnrollment[],
              error: 'enrollments',
            })),
        ]).then(([tasksResult, typesResult, enrollmentsResult]) => {
          if (requestSeq.current !== activeRequest) {
            return;
          }
          setEnclosureTasks(tasksResult.tasks);
          setEnclosureTaskTypes(typesResult.types);
          setEnclosureRecurringEnrollments(enrollmentsResult.enrollments);
          setEnclosureTasksLoading(false);
          setEnclosureRecurringLoading(false);
        });
        setEnclosureStockTransactionsLoading(true);
        setEnclosureStockTransactionsError(null);
        void getKolamStockTransactionList({
          enclosureId,
          endDate: '',
          limit: 30,
          page: 1,
          productId: '',
          search: '',
          speciesId: '',
          startDate: '',
          status: '',
          stockOpnameId: '',
        })
          .then(result => {
            if (requestSeq.current !== activeRequest) {
              return;
            }
            setEnclosureStockTransactions(result.data);
            setEnclosureStockTransactionsError(null);
          })
          .catch(loadError => {
            if (requestSeq.current !== activeRequest) {
              return;
            }
            setEnclosureStockTransactions([]);
            setEnclosureStockTransactionsError(getErrorMessage(loadError));
          })
          .finally(() => {
            if (requestSeq.current === activeRequest) {
              setEnclosureStockTransactionsLoading(false);
            }
          });
        setDataSource('live');
        return;
      }

      if (currentMode === 'new') {
        const [assignees, brands, locations, units] = await Promise.all([
          getKolamEnclosureStaffAssignees({limit: 200}).catch(() => []),
          getKolamBrands().catch(() => [] as KolamBrand[]),
          getKolamLocations().catch(() => [] as KolamLocationOption[]),
          getKolamUnits().catch(() => [] as KolamUnit[]),
        ]);
        if (requestSeq.current !== activeRequest) {
          return;
        }
        setSelectedEnclosure(null);
        setStaffAssignees(assignees);
        setEditBrands(brands);
        setEditLocations(locations);
        setEditUnits(units);
        setDataSource('live');
        return;
      }

      if (currentMode === 'edit') {
        const enclosureId = getKolamEnclosureRouteId(route);
        if (!enclosureId) {
          setSelectedEnclosure(null);
          setDataSource('error');
          setError('ID kandang tidak ditemukan.');
          return;
        }
        const [detail, assignees, brands, locations, units] = await Promise.all([
          getKolamEnclosureDetail(enclosureId),
          getKolamEnclosureStaffAssignees({limit: 200}).catch(() => []),
          getKolamBrands().catch(() => [] as KolamBrand[]),
          getKolamLocations().catch(() => [] as KolamLocationOption[]),
          getKolamUnits().catch(() => [] as KolamUnit[]),
        ]);
        if (requestSeq.current !== activeRequest) {
          return;
        }
        setSelectedEnclosure(detail);
        setStaffAssignees(assignees);
        setEditBrands(brands);
        setEditLocations(locations);
        setEditUnits(units);
        setDataSource('live');
        return;
      }

      if (filters.scope === 'dashboard' || filters.scope === 'deaths') {
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
        setEnclosureStatisticsLoading(false);
      }
    }
  }, [filters, route]);

  const refreshComments = useCallback(async () => {
    const enclosureId = getKolamEnclosureRouteId(route);
    if (!enclosureId) {
      setEnclosureComments([]);
      return;
    }
    const comments = await getKolamEnclosureComments(enclosureId);
    setEnclosureComments(comments);
  }, [route]);

  const refreshTasks = useCallback(async () => {
    const enclosureId = getKolamEnclosureRouteId(route);
    if (!enclosureId) {
      setEnclosureTasks([]);
      setEnclosureTaskTypes([]);
      setEnclosureRecurringEnrollments([]);
      return;
    }
    setEnclosureTasksLoading(true);
    setEnclosureRecurringLoading(true);
    try {
      const [tasks, typesResult, enrollments] = await Promise.all([
        getKolamEnclosureTasks(enclosureId),
        getKolamEnclosureTaskTypes()
          .then(types => ({types, ok: true as const}))
          .catch(() => ({types: [] as KolamEnclosureTaskType[], ok: false as const})),
        getKolamEnclosureRecurringEnrollments(enclosureId),
      ]);
      setEnclosureTasks(tasks);
      if (typesResult.ok) {
        setEnclosureTaskTypes(typesResult.types);
      }
      setEnclosureRecurringEnrollments(enrollments);
    } finally {
      setEnclosureTasksLoading(false);
      setEnclosureRecurringLoading(false);
    }
  }, [route]);

  const refreshStockTransactions = useCallback(async () => {
    const enclosureId = getKolamEnclosureRouteId(route);
    if (!enclosureId) {
      setEnclosureStockTransactions([]);
      setEnclosureStockTransactionsError(null);
      return;
    }
    setEnclosureStockTransactionsLoading(true);
    setEnclosureStockTransactionsError(null);
    try {
      const result = await getKolamStockTransactionList({
        enclosureId,
        endDate: '',
        limit: 30,
        page: 1,
        productId: '',
        search: '',
        speciesId: '',
        startDate: '',
        status: '',
        stockOpnameId: '',
      });
      setEnclosureStockTransactions(result.data);
    } catch (loadError) {
      setEnclosureStockTransactions([]);
      setEnclosureStockTransactionsError(getErrorMessage(loadError));
    } finally {
      setEnclosureStockTransactionsLoading(false);
    }
  }, [route]);

  const onSpawnTask = useCallback(
    async (input: {title?: string; taskTypeId?: string}) => {
      const enclosureId = getKolamEnclosureRouteId(route);
      if (!enclosureId) {
        throw new Error('ID kandang tidak ditemukan.');
      }
      setOperationLoading(true);
      setError(null);
      setStatusMessage(null);
      try {
        const result = await spawnKolamEnclosureTask({
          enclosureId,
          title: input.title,
          taskTypeId: input.taskTypeId,
        });
        setStatusMessage(
          result.created ? 'Task dibuat' : 'Sub-task ditambahkan',
        );
        await refreshTasks();
      } catch (operationError) {
        setError(getErrorMessage(operationError));
        throw operationError;
      } finally {
        setOperationLoading(false);
      }
    },
    [refreshTasks, route],
  );

  const onSetRecurringEnrollment = useCallback(
    async (input: {taskTypeId: string; active: boolean}) => {
      const enclosureId = getKolamEnclosureRouteId(route);
      if (!enclosureId) {
        throw new Error('ID kandang tidak ditemukan.');
      }
      setOperationLoading(true);
      setError(null);
      setStatusMessage(null);
      try {
        await setKolamEnclosureRecurringEnrollment(enclosureId, input);
        setStatusMessage(input.active ? 'Jadwal aktif' : 'Jadwal nonaktif');
        const enrollments =
          await getKolamEnclosureRecurringEnrollments(enclosureId);
        setEnclosureRecurringEnrollments(enrollments);
      } catch (operationError) {
        setError(getErrorMessage(operationError));
        throw operationError;
      } finally {
        setOperationLoading(false);
      }
    },
    [route],
  );

  const runOperation = useCallback(
    async (action: () => Promise<unknown>, successMessage: string) => {
      setOperationLoading(true);
      setError(null);
      setStatusMessage(null);
      try {
        await action();
        setStatusMessage(successMessage);
        await refresh();
      } catch (operationError) {
        setError(getErrorMessage(operationError));
      } finally {
        setOperationLoading(false);
      }
    },
    [refresh],
  );

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

  const onUpdateParameter = useCallback(
    (body: KolamEnclosureParameterInput) =>
      runOperation(async () => {
        const enclosureId = getKolamEnclosureRouteId(route);
        if (!enclosureId) throw new Error('ID kandang tidak ditemukan.');
        await upsertKolamEnclosureParameter(enclosureId, body);
      }, 'Parameter kandang diperbarui.'),
    [route, runOperation],
  );

  const onUpsertClimateParameter = useCallback(
    async (body: KolamEnclosureParameterInput) => {
      const enclosureId = getKolamEnclosureRouteId(route);
      if (!enclosureId) {
        throw new Error('ID kandang tidak ditemukan.');
      }
      await upsertKolamEnclosureParameter(enclosureId, body);
      const detail = await getKolamEnclosureDetail(enclosureId);
      setSelectedEnclosure(detail);
    },
    [route],
  );

  const onProvisionCode = useCallback(
    (enclosureCode: string) =>
      runOperation(async () => {
        const enclosureId = getKolamEnclosureRouteId(route);
        if (!enclosureId) throw new Error('ID kandang tidak ditemukan.');
        const next = enclosureCode.trim().toUpperCase();
        if (!next) {
          throw new Error('Kode kandang wajib diisi.');
        }
        await updateKolamEnclosure(enclosureId, {enclosure_code: next});
      }, 'Kode kandang disimpan.'),
    [route, runOperation],
  );

  const onSaveEnclosureEdit = useCallback(
    async (input: {
      body: KolamEnclosureUpdateBody;
      assignedTo: string | null;
    }): Promise<boolean> => {
      const enclosureId = getKolamEnclosureRouteId(route);
      if (!enclosureId) {
        setError('ID kandang tidak ditemukan.');
        return false;
      }
      setOperationLoading(true);
      setError(null);
      setStatusMessage(null);
      try {
        await updateKolamEnclosure(enclosureId, input.body);
        const currentPic =
          selectedEnclosure?.assignedToId ||
          selectedEnclosure?.assignedTo?.id ||
          null;
        const nextPic = input.assignedTo?.trim() || null;
        if (nextPic !== currentPic) {
          await updateKolamEnclosureAssignedTo(enclosureId, nextPic);
        }
        setStatusMessage('Kandang disimpan.');
        await refresh();
        return true;
      } catch (operationError) {
        setError(getErrorMessage(operationError));
        return false;
      } finally {
        setOperationLoading(false);
      }
    },
    [refresh, route, selectedEnclosure],
  );

  const onCreateEnclosure = useCallback(
    async (body: KolamEnclosureCreateBody): Promise<KolamEnclosure | null> => {
      setOperationLoading(true);
      setError(null);
      setStatusMessage(null);
      try {
        const created = await createKolamEnclosure(body);
        setStatusMessage('Kandang dibuat.');
        return created;
      } catch (operationError) {
        setError(getErrorMessage(operationError));
        return null;
      } finally {
        setOperationLoading(false);
      }
    },
    [],
  );

  const onUploadCoverPhoto = useCallback(
    (localUri: string) =>
      runOperation(async () => {
        const enclosureId = getKolamEnclosureRouteId(route);
        if (!enclosureId) throw new Error('ID kandang tidak ditemukan.');
        await uploadKolamEnclosureCoverPhoto(enclosureId, localUri);
      }, 'Cover kandang diunggah.'),
    [route, runOperation],
  );

  const onDeleteCoverPhoto = useCallback(
    () =>
      runOperation(async () => {
        const enclosureId = getKolamEnclosureRouteId(route);
        if (!enclosureId) throw new Error('ID kandang tidak ditemukan.');
        await deleteKolamEnclosureCoverPhoto(enclosureId);
      }, 'Cover kandang dihapus.'),
    [route, runOperation],
  );

  const onUploadPhotos = useCallback(
    (localUris: string[]) =>
      runOperation(async () => {
        const enclosureId = getKolamEnclosureRouteId(route);
        if (!enclosureId) throw new Error('ID kandang tidak ditemukan.');
        await uploadKolamEnclosurePhotos(enclosureId, localUris);
      }, 'Foto kandang diunggah.'),
    [route, runOperation],
  );

  const onDeletePhoto = useCallback(
    (index: number) =>
      runOperation(async () => {
        const enclosureId = getKolamEnclosureRouteId(route);
        if (!enclosureId) throw new Error('ID kandang tidak ditemukan.');
        await deleteKolamEnclosurePhoto(enclosureId, index);
      }, 'Foto kandang dihapus.'),
    [route, runOperation],
  );

  const onAttachSpecies = useCallback(
    (input: KolamEnclosureSpeciesAttachInput) =>
      runOperation(() => attachKolamEnclosureSpecies(input), 'Species ditempatkan.'),
    [runOperation],
  );

  const onRecordPopulationEvent = useCallback(
    (input: KolamEnclosurePopulationEventInput) =>
      runOperation(
        () => recordKolamEnclosurePopulationEvent(input),
        'Perubahan populasi dicatat.',
      ),
    [runOperation],
  );

  const onTransferSpecies = useCallback(
    (input: KolamEnclosureSpeciesTransferInput) =>
      runOperation(
        () => transferKolamEnclosureSpecies(input),
        'Species dipindahkan.',
      ),
    [runOperation],
  );

  const onCrossPoolTransferSpecies = useCallback(
    (input: KolamEnclosureCrossPoolTransferInput) =>
      runOperation(
        () => crossPoolTransferKolamEnclosureSpecies(input),
        'Species dipindahkan antar pool.',
      ),
    [runOperation],
  );

  const onSwitchSpeciesVariant = useCallback(
    (input: KolamEnclosureVariantSwitchInput) =>
      runOperation(
        () => switchKolamEnclosureSpeciesVariant(input),
        'Variant species diperbarui.',
      ),
    [runOperation],
  );

  const onUpdateSaleListing = useCallback(
    (body: KolamEnclosureSaleListingInput) =>
      runOperation(async () => {
        const enclosureId = getKolamEnclosureRouteId(route);
        if (!enclosureId) throw new Error('ID kandang tidak ditemukan.');
        await updateKolamEnclosureSaleListing(enclosureId, body);
      }, 'Listing penjualan kandang diperbarui.'),
    [route, runOperation],
  );

  const onCreateComment = useCallback(
    (comment: string) =>
      runOperation(async () => {
        const enclosureId = getKolamEnclosureRouteId(route);
        if (!enclosureId) throw new Error('ID kandang tidak ditemukan.');
        await createKolamEnclosureComment(enclosureId, comment);
        await refreshComments();
      }, 'Komentar ditambahkan.'),
    [refreshComments, route, runOperation],
  );

  const onReplyComment = useCallback(
    (commentId: string, comment: string) =>
      runOperation(async () => {
        await replyKolamEnclosureComment(commentId, comment);
        await refreshComments();
      }, 'Balasan dikirim.'),
    [refreshComments, runOperation],
  );

  const onEditComment = useCallback(
    (commentId: string, comment: string) =>
      runOperation(async () => {
        await editKolamEnclosureComment(commentId, comment);
        await refreshComments();
      }, 'Komentar diperbarui.'),
    [refreshComments, runOperation],
  );

  const onDeleteComment = useCallback(
    (commentId: string) =>
      runOperation(async () => {
        await deleteKolamEnclosureComment(commentId);
        await refreshComments();
      }, 'Komentar dihapus.'),
    [refreshComments, runOperation],
  );

  const onLikeComment = useCallback(
    (commentId: string) =>
      runOperation(async () => {
        await likeKolamEnclosureComment(commentId);
        await refreshComments();
      }, 'Reaksi komentar diperbarui.'),
    [refreshComments, runOperation],
  );

  const onAddProductionEggs = useCallback(
    (input: KolamEnclosureProductionEggInput) =>
      runOperation(
        () => addKolamEnclosureProductionEggs(input),
        'Telur produksi ditambahkan.',
      ),
    [runOperation],
  );

  const onAdvanceProductionEggs = useCallback(
    (input: KolamEnclosureProductionEggAdvanceInput) =>
      runOperation(
        () => advanceKolamEnclosureProductionEggs(input),
        'Telur produksi di-advance.',
      ),
    [runOperation],
  );

  const onChangeProductionPhase = useCallback(
    (input: KolamEnclosureProductionPhaseChangeInput) =>
      runOperation(
        () => changeKolamEnclosureProductionPhase(input),
        'Fase produksi diperbarui.',
      ),
    [runOperation],
  );

  const onMoveProductionPhaseToSale = useCallback(
    (input: KolamEnclosureProductionPhaseToSaleInput) =>
      runOperation(
        () => moveKolamEnclosureProductionPhaseToSale(input),
        'Fase produksi dipindah ke stok jual.',
      ),
    [runOperation],
  );

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
    selectedEnclosure,
    enclosureComments,
    enclosureStatistics,
    enclosureStatisticsError,
    enclosureStatisticsLoading,
    enclosureTasks,
    enclosureTasksLoading,
    enclosureTaskTypes,
    enclosureRecurringEnrollments,
    enclosureRecurringLoading,
    enclosureStockTransactions,
    enclosureStockTransactionsLoading,
    enclosureStockTransactionsError,
    editBrands,
    editLocations,
    editUnits,
    operationLoading,
    staffAssignees,
    statusMessage,
    onAddProductionEggs,
    onAdvanceProductionEggs,
    onChangeFilters,
    onChangeProductionPhase,
    onClearFilters,
    onCreateComment,
    onCrossPoolTransferSpecies,
    onDeleteComment,
    onDeleteCoverPhoto,
    onDeletePhoto,
    onEditComment,
    onLikeComment,
    onLimitChange,
    onMoveProductionPhaseToSale,
    onPageChange,
    onRecordPopulationEvent,
    onRefresh: refresh,
    onRefreshComments: refreshComments,
    onRefreshTasks: refreshTasks,
    onRefreshStockTransactions: refreshStockTransactions,
    onReplyComment,
    onSearchChange,
    onSetRecurringEnrollment,
    onSpawnTask,
    onProvisionCode,
    onSaveEnclosureEdit,
    onCreateEnclosure,
    onUpsertClimateParameter,
    onSwitchSpeciesVariant,
    onTabChange,
    onTransferSpecies,
    onUpdateParameter,
    onUpdateSaleListing,
    onUploadCoverPhoto,
    onUploadPhotos,
    onAttachSpecies,
  };
}

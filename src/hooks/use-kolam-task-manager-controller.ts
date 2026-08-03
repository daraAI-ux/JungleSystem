import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { KolamAuthContext } from '../context/kolam-app-contexts';
import {
  buildKolamTaskManagerKpi,
  getKolamTaskManagerIdFromRoute,
  getKolamTaskManagerRouteMode,
  KOLAM_TASK_MANAGER_RECURRING_ROUTE,
  KOLAM_TASK_MANAGER_ROOT,
  type KolamTaskCategoryBucket,
  type KolamTaskManagerCategory,
  type KolamTaskManagerKpi,
  type KolamTaskManagerPriority,
  type KolamTaskManagerStatus,
  type KolamTaskManagerSurfaceMode,
  type KolamTaskManagerTask,
} from '../domain/kolam-task-manager';
import type { KolamUserListItem } from '../domain/kolam-user';
import { getErrorMessage as getApiErrorMessage } from '../lib/api-error';
import {
  getKolamTaskManagerCategories,
  getKolamTaskManagerTask,
  getKolamTaskManagerTasks,
  updateKolamTaskManagerStatus,
  updateKolamTaskManagerTask,
} from '../services/kolam-task-manager-api';
import { getKolamUserList } from '../services/kolam-user-api';

export type KolamTaskManagerDataSource = 'error' | 'idle' | 'live';

export interface KolamTaskManagerStaffOption {
  id: string;
  label: string;
}

export interface KolamTaskManagerController {
  categories: KolamTaskManagerCategory[];
  categoryBucketFilter: KolamTaskCategoryBucket | 'all';
  categoryFilter: string;
  currentUserId: string;
  dataSource: KolamTaskManagerDataSource;
  error: string | null;
  kpi: KolamTaskManagerKpi;
  loading: boolean;
  mineOnly: boolean;
  isTaskAdmin: boolean;
  mode: KolamTaskManagerSurfaceMode;
  mutatingTaskId: string | null;
  page: number;
  pageSize: number;
  priorityFilter: KolamTaskManagerPriority | 'all';
  route: string;
  search: string;
  staffOptions: KolamTaskManagerStaffOption[];
  statusFilter: KolamTaskManagerStatus | 'all';
  statusMessage: string | null;
  selectedTask: KolamTaskManagerTask | null;
  tasks: KolamTaskManagerTask[];
  total: number;
  totalPages: number;
  onCreateNew: () => void;
  onBackToList: () => void;
  onRefresh: () => Promise<void>;
  onResetFilters: () => void;
  onSelectPage: (page: number) => void;
  onSetCategoryBucketFilter: (value: KolamTaskCategoryBucket | 'all') => void;
  onSetCategoryFilter: (value: string) => void;
  onSetMineOnly: (value: boolean) => void;
  onSetPageSize: (pageSize: number) => void;
  onSetPriorityFilter: (value: KolamTaskManagerPriority | 'all') => void;
  onSetSearch: (value: string) => void;
  onSetStatusFilter: (value: KolamTaskManagerStatus | 'all') => void;
  onSetTaskPriority: (
    task: KolamTaskManagerTask,
    priority: KolamTaskManagerPriority,
  ) => Promise<boolean>;
  onSetTaskStatus: (
    task: KolamTaskManagerTask,
    status: KolamTaskManagerStatus,
  ) => Promise<boolean>;
  onSwitchTab: (tab: 'recurring' | 'tasks') => void;
}

export function useKolamTaskManagerController({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}): KolamTaskManagerController {
  const authContext = useContext(KolamAuthContext);
  const authUser = authContext?.authUser ?? null;
  const mode = getKolamTaskManagerRouteMode(route);
  const roleKey = String(authUser?.roleKey ?? '').toLowerCase();
  const isTaskAdmin =
    roleKey === 'admin' ||
    roleKey === 'super-admin' ||
    roleKey === 'super_admin' ||
    roleKey === 'super_administrator';
  const currentUserId = authUser?.id ?? '';
  const [tasks, setTasks] = useState<KolamTaskManagerTask[]>([]);
  const [selectedTask, setSelectedTask] =
    useState<KolamTaskManagerTask | null>(null);
  const [categories, setCategories] = useState<KolamTaskManagerCategory[]>([]);
  const [staffOptions, setStaffOptions] = useState<KolamTaskManagerStaffOption[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [mutatingTaskId, setMutatingTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] =
    useState<KolamTaskManagerDataSource>('idle');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    KolamTaskManagerStatus | 'all'
  >('all');
  const [priorityFilter, setPriorityFilter] = useState<
    KolamTaskManagerPriority | 'all'
  >('all');
  const [categoryBucketFilter, setCategoryBucketFilter] = useState<
    KolamTaskCategoryBucket | 'all'
  >('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [mineOnly, setMineOnly] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [kpi, setKpi] = useState<KolamTaskManagerKpi>({
    done: 0,
    inProgress: 0,
    overdue: 0,
    todo: 0,
    total: 0,
  });

  const loadCategories = useCallback(async () => {
    try {
      const live = await getKolamTaskManagerCategories(true);
      setCategories(live);
    } catch {
      // Non-blocking: list can still load without category labels.
    }
  }, []);

  const loadStaff = useCallback(async () => {
    try {
      const live = await getKolamUserList({
        isEmployee: 'true',
        limit: 500,
        page: 1,
      });
      setStaffOptions(mapStaffOptions(live.items));
    } catch {
      // Non-blocking: PIC filter can stay minimal.
    }
  }, []);

  const refreshList = useCallback(async () => {
    if (mode !== 'list') {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const list = await getKolamTaskManagerTasks({
        page,
        limit: pageSize,
        search,
        status: statusFilter,
        priority: priorityFilter,
        categoryBucket: categoryBucketFilter,
        categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
        mine: mineOnly,
      });
      setTasks(list.items);
      setTotal(list.total);
      setTotalPages(list.totalPages);
      setDataSource('live');

      const [totalKpi, todoKpi, progressKpi, doneKpi, pool] =
        await Promise.all([
          getKolamTaskManagerTasks({ page: 1, limit: 1 }),
          getKolamTaskManagerTasks({ page: 1, limit: 1, status: 'todo' }),
          getKolamTaskManagerTasks({
            page: 1,
            limit: 1,
            status: 'in_progress',
          }),
          getKolamTaskManagerTasks({ page: 1, limit: 1, status: 'done' }),
          getKolamTaskManagerTasks({ page: 1, limit: 400 }),
        ]);
      setKpi(
        buildKolamTaskManagerKpi(
          totalKpi.total,
          todoKpi.total,
          progressKpi.total,
          doneKpi.total,
          pool.items,
        ),
      );
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [
    categoryBucketFilter,
    categoryFilter,
    mineOnly,
    mode,
    page,
    pageSize,
    priorityFilter,
    search,
    statusFilter,
  ]);

  const refreshDetail = useCallback(async () => {
    if (mode !== 'detail') {
      return;
    }
    const taskId = getKolamTaskManagerIdFromRoute(route);
    if (!taskId) {
      setSelectedTask(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const live = await getKolamTaskManagerTask(taskId);
      setSelectedTask(live);
      setDataSource('live');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [mode, route]);

  useEffect(() => {
    void loadCategories();
    void loadStaff();
  }, [loadCategories, loadStaff]);

  useEffect(() => {
    void refreshList();
  }, [refreshList]);

  useEffect(() => {
    void refreshDetail();
  }, [refreshDetail]);

  const setFilterAndFirstPage = useCallback(
    <TValue,>(setter: (value: TValue) => void) =>
      (value: TValue) => {
        setter(value);
        setPage(1);
        setStatusMessage(null);
      },
    [],
  );

  const onSetTaskStatus = useCallback(
    async (task: KolamTaskManagerTask, status: KolamTaskManagerStatus) => {
      if (task.status === status) return true;
      setMutatingTaskId(task.id);
      setError(null);
      setStatusMessage(null);
      try {
        await updateKolamTaskManagerStatus(task.id, status);
        setStatusMessage('Status diperbarui');
        await refreshList();
        if (mode === 'detail') {
          await refreshDetail();
        }
        return true;
      } catch (mutationError) {
        setError(getErrorMessage(mutationError));
        return false;
      } finally {
        setMutatingTaskId(null);
      }
    },
    [mode, refreshDetail, refreshList],
  );

  const onSetTaskPriority = useCallback(
    async (task: KolamTaskManagerTask, priority: KolamTaskManagerPriority) => {
      if (task.priority === priority) return true;
      setMutatingTaskId(task.id);
      setError(null);
      setStatusMessage(null);
      try {
        await updateKolamTaskManagerTask(task.id, {
          priority,
          title: task.title,
        });
        setStatusMessage('Prioritas diperbarui');
        await refreshList();
        if (mode === 'detail') {
          await refreshDetail();
        }
        return true;
      } catch (mutationError) {
        setError(getErrorMessage(mutationError));
        return false;
      } finally {
        setMutatingTaskId(null);
      }
    },
    [mode, refreshDetail, refreshList],
  );

  const onResetFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryBucketFilter('all');
    setCategoryFilter('all');
    setMineOnly(false);
    setPage(1);
    setStatusMessage(null);
  }, []);

  const onSwitchTab = useCallback(
    (tab: 'recurring' | 'tasks') => {
      onRouteChange?.(
        tab === 'recurring'
          ? KOLAM_TASK_MANAGER_RECURRING_ROUTE
          : KOLAM_TASK_MANAGER_ROOT,
      );
    },
    [onRouteChange],
  );

  const onBackToList = useCallback(() => {
    onRouteChange?.(KOLAM_TASK_MANAGER_ROOT);
  }, [onRouteChange]);

  const onCreateNew = useCallback(() => {
    setStatusMessage('Form tugas baru masuk batch berikutnya');
  }, []);

  return useMemo(
    () => ({
      categories,
      categoryBucketFilter,
      categoryFilter,
      currentUserId,
      dataSource,
      error,
      kpi,
      loading,
      mineOnly,
      isTaskAdmin,
      mode,
      mutatingTaskId,
      page,
      pageSize,
      priorityFilter,
      route,
      search,
      staffOptions,
      statusFilter,
      statusMessage,
      tasks,
      total,
      totalPages,
      selectedTask,
      onBackToList,
      onCreateNew,
      onRefresh: mode === 'detail' ? refreshDetail : refreshList,
      onResetFilters,
      onSelectPage: setPage,
      onSetCategoryBucketFilter: setFilterAndFirstPage(
        setCategoryBucketFilter,
      ),
      onSetCategoryFilter: setFilterAndFirstPage(setCategoryFilter),
      onSetMineOnly: setFilterAndFirstPage(setMineOnly),
      onSetPageSize: setFilterAndFirstPage(setPageSize),
      onSetPriorityFilter: setFilterAndFirstPage(setPriorityFilter),
      onSetSearch: setFilterAndFirstPage(setSearch),
      onSetStatusFilter: setFilterAndFirstPage(setStatusFilter),
      onSetTaskPriority,
      onSetTaskStatus,
      onSwitchTab,
    }),
    [
      categories,
      categoryBucketFilter,
      categoryFilter,
      currentUserId,
      dataSource,
      error,
      kpi,
      loading,
      mineOnly,
      isTaskAdmin,
      mode,
      mutatingTaskId,
      onCreateNew,
      onBackToList,
      onResetFilters,
      onSetTaskPriority,
      onSetTaskStatus,
      onSwitchTab,
      page,
      pageSize,
      priorityFilter,
      refreshList,
      refreshDetail,
      route,
      search,
      setFilterAndFirstPage,
      staffOptions,
      statusFilter,
      statusMessage,
      tasks,
      total,
      totalPages,
      selectedTask,
    ],
  );
}

function mapStaffOptions(users: KolamUserListItem[]): KolamTaskManagerStaffOption[] {
  return users.map(user => ({
    id: user.id,
    label:
      user.displayName ||
      `${user.firstName} ${user.lastName}`.trim() ||
      user.username ||
      user.email ||
      user.id,
  }));
}

function getErrorMessage(error: unknown) {
  return getApiErrorMessage(error) || 'Gagal memuat Task Manager';
}

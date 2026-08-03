import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { KolamAuthContext } from '../context/kolam-app-contexts';
import {
  buildKolamTaskManagerKpi,
  buildKolamTaskDueDateIso,
  getKolamTaskManagerIdFromRoute,
  getKolamTaskManagerRouteMode,
  splitKolamTaskDueDateTime,
  KOLAM_TASK_MANAGER_RECURRING_ROUTE,
  KOLAM_TASK_MANAGER_ROOT,
  type KolamTaskCategoryBucket,
  type KolamTaskManagerCategory,
  type KolamTaskManagerKpi,
  type KolamTaskManagerPriority,
  type KolamTaskManagerStatus,
  type KolamTaskManagerSurfaceMode,
  type KolamTaskManagerTask,
  type KolamTaskManagerTaskType,
  type KolamTaskManagerTaskTypeHandler,
  type KolamTaskRecurringEnrollmentCompliance,
  type KolamTaskRecurringEnrollmentDashboard,
  type KolamTaskRecurringOccurrence,
  type KolamTaskRecurringServiceVisit,
  type KolamTaskRecurringTemplate,
} from '../domain/kolam-task-manager';
import type { KolamUserListItem } from '../domain/kolam-user';
import { getErrorMessage as getApiErrorMessage } from '../lib/api-error';
import {
  addKolamTaskManagerNote,
  createKolamTaskManagerCategory,
  createKolamTaskManagerTask,
  createKolamTaskManagerTaskType,
  createKolamTaskRecurringTemplate,
  deleteKolamTaskManagerCategory,
  deleteKolamTaskManagerTaskType,
  deleteKolamTaskRecurringTemplate,
  getKolamTaskManagerCategories,
  getKolamTaskManagerTask,
  getKolamTaskManagerTasks,
  getKolamTaskManagerTaskTypes,
  getKolamTaskRecurringEnrollmentCompliance,
  getKolamTaskRecurringEnrollmentDashboard,
  getKolamTaskRecurringOccurrences,
  getKolamTaskRecurringServiceVisits,
  getKolamTaskRecurringTemplates,
  runKolamTaskRecurringTick,
  sendKolamTaskManagerDiscussion,
  updateKolamTaskManagerCategory,
  updateKolamTaskManagerChecklist,
  updateKolamTaskManagerStatus,
  updateKolamTaskManagerTask,
  updateKolamTaskManagerTaskType,
} from '../services/kolam-task-manager-api';
import { getKolamUserList } from '../services/kolam-user-api';

export type KolamTaskManagerDataSource = 'error' | 'idle' | 'live';

export interface KolamTaskManagerStaffOption {
  id: string;
  label: string;
}

export interface KolamTaskManagerFormState {
  assistedById: string;
  categoryId: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: KolamTaskManagerPriority;
  assignedToId: string;
  status: KolamTaskManagerStatus;
  title: string;
  urgent: boolean;
}

export interface KolamTaskManagerCategoryFormState {
  active: boolean;
  color: string;
  name: string;
  sortOrder: string;
}

export interface KolamTaskManagerTaskTypeFormState {
  active: boolean;
  categoryBuckets: KolamTaskCategoryBucket[];
  description: string;
  handler: KolamTaskManagerTaskTypeHandler;
  key: string;
  name: string;
  requiresProductComponents: boolean;
  sortOrder: string;
}

export interface KolamTaskRecurringTemplateFormState {
  assignedToId: string;
  dayOfMonth: string;
  description: string;
  recurrenceType: 'daily' | 'monthly' | 'weekly';
  sampleReviewPercent: string;
  taskTypeId: string;
  time: string;
  title: string;
  weekPreset: 'all' | 'weekdays';
}

export interface KolamTaskManagerController {
  categories: KolamTaskManagerCategory[];
  categoryForm: KolamTaskManagerCategoryFormState;
  categoryFormError: string | null;
  categoryFormMode: 'edit' | 'new';
  categoryFormOpen: boolean;
  taskTypeForm: KolamTaskManagerTaskTypeFormState;
  taskTypeFormError: string | null;
  taskTypeFormMode: 'edit' | 'new';
  taskTypeFormOpen: boolean;
  recurringTemplateForm: KolamTaskRecurringTemplateFormState;
  recurringTemplateFormError: string | null;
  recurringTemplateFormOpen: boolean;
  categoryBucketFilter: KolamTaskCategoryBucket | 'all';
  categoryFilter: string;
  assignedToFilter: string;
  currentUserId: string;
  dataSource: KolamTaskManagerDataSource;
  error: string | null;
  form: KolamTaskManagerFormState;
  formError: string | null;
  formMode: 'edit' | 'new';
  formOpen: boolean;
  checklistDraft: string;
  discussionDraft: string;
  noteDraft: string;
  kpi: KolamTaskManagerKpi;
  loading: boolean;
  mineOnly: boolean;
  isTaskAdmin: boolean;
  mode: KolamTaskManagerSurfaceMode;
  mutatingTaskId: string | null;
  page: number;
  pageSize: number;
  priorityFilter: KolamTaskManagerPriority | 'all';
  recurringEnclosureOnly: boolean;
  recurringEnrollmentCompliance: KolamTaskRecurringEnrollmentCompliance | null;
  recurringEnrollmentDashboard: KolamTaskRecurringEnrollmentDashboard | null;
  recurringOccurrences: KolamTaskRecurringOccurrence[];
  recurringServiceVisits: KolamTaskRecurringServiceVisit[];
  recurringTemplates: KolamTaskRecurringTemplate[];
  route: string;
  search: string;
  staffOptions: KolamTaskManagerStaffOption[];
  statusFilter: KolamTaskManagerStatus | 'all';
  statusMessage: string | null;
  selectedTask: KolamTaskManagerTask | null;
  taskTypes: KolamTaskManagerTaskType[];
  tasks: KolamTaskManagerTask[];
  total: number;
  totalPages: number;
  onAddChecklistItem: () => Promise<boolean>;
  onAddDiscussion: () => Promise<boolean>;
  onAddNote: () => Promise<boolean>;
  onChangeCategoryForm: (
    patch: Partial<KolamTaskManagerCategoryFormState>,
  ) => void;
  onChangeForm: (patch: Partial<KolamTaskManagerFormState>) => void;
  onChangeTaskTypeForm: (
    patch: Partial<KolamTaskManagerTaskTypeFormState>,
  ) => void;
  onChangeRecurringTemplateForm: (
    patch: Partial<KolamTaskRecurringTemplateFormState>,
  ) => void;
  onCloseCategoryForm: () => void;
  onCloseForm: () => void;
  onCloseRecurringTemplateForm: () => void;
  onCloseTaskTypeForm: () => void;
  onCreateCategory: () => void;
  onCreateNew: () => void;
  onCreateRecurringTemplate: () => void;
  onCreateTaskType: () => void;
  onDeleteCategory: (category: KolamTaskManagerCategory) => Promise<boolean>;
  onDeleteRecurringTemplate: (
    template: KolamTaskRecurringTemplate,
  ) => Promise<boolean>;
  onDeleteTaskType: (taskType: KolamTaskManagerTaskType) => Promise<boolean>;
  onEditCategory: (category: KolamTaskManagerCategory) => void;
  onEditTaskType: (taskType: KolamTaskManagerTaskType) => void;
  onEditTask: (task: KolamTaskManagerTask) => void;
  onBackToList: () => void;
  onRefresh: () => Promise<void>;
  onResetFilters: () => void;
  onSelectPage: (page: number) => void;
  onSetCategoryBucketFilter: (value: KolamTaskCategoryBucket | 'all') => void;
  onSetCategoryFilter: (value: string) => void;
  onSetAssignedToFilter: (value: string) => void;
  onSetMineOnly: (value: boolean) => void;
  onSetPageSize: (pageSize: number) => void;
  onSetPriorityFilter: (value: KolamTaskManagerPriority | 'all') => void;
  onSetRecurringEnclosureOnly: (value: boolean) => void;
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
  onRemoveChecklistItem: (index: number) => Promise<boolean>;
  onSaveCategory: () => Promise<boolean>;
  onSaveForm: () => Promise<boolean>;
  onSaveRecurringTemplate: () => Promise<boolean>;
  onSaveTaskType: () => Promise<boolean>;
  onSetChecklistDraft: (value: string) => void;
  onSetDiscussionDraft: (value: string) => void;
  onSetNoteDraft: (value: string) => void;
  onToggleChecklistItem: (index: number) => Promise<boolean>;
  onRunRecurringTick: () => Promise<boolean>;
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
  const [recurringTemplates, setRecurringTemplates] = useState<
    KolamTaskRecurringTemplate[]
  >([]);
  const [recurringOccurrences, setRecurringOccurrences] = useState<
    KolamTaskRecurringOccurrence[]
  >([]);
  const [recurringServiceVisits, setRecurringServiceVisits] = useState<
    KolamTaskRecurringServiceVisit[]
  >([]);
  const [recurringEnrollmentDashboard, setRecurringEnrollmentDashboard] =
    useState<KolamTaskRecurringEnrollmentDashboard | null>(null);
  const [recurringEnrollmentCompliance, setRecurringEnrollmentCompliance] =
    useState<KolamTaskRecurringEnrollmentCompliance | null>(null);
  const [taskTypes, setTaskTypes] = useState<KolamTaskManagerTaskType[]>([]);
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
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'edit' | 'new'>('new');
  const [editingTaskId, setEditingTaskId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<KolamTaskManagerFormState>(() =>
    getDefaultTaskForm(currentUserId),
  );
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [categoryFormMode, setCategoryFormMode] = useState<'edit' | 'new'>(
    'new',
  );
  const [editingCategoryId, setEditingCategoryId] = useState('');
  const [categoryFormError, setCategoryFormError] = useState<string | null>(
    null,
  );
  const [categoryForm, setCategoryForm] =
    useState<KolamTaskManagerCategoryFormState>(() => getDefaultCategoryForm());
  const [taskTypeFormOpen, setTaskTypeFormOpen] = useState(false);
  const [taskTypeFormMode, setTaskTypeFormMode] = useState<'edit' | 'new'>(
    'new',
  );
  const [editingTaskTypeId, setEditingTaskTypeId] = useState('');
  const [taskTypeFormError, setTaskTypeFormError] = useState<string | null>(
    null,
  );
  const [taskTypeForm, setTaskTypeForm] =
    useState<KolamTaskManagerTaskTypeFormState>(() => getDefaultTaskTypeForm());
  const [recurringTemplateFormOpen, setRecurringTemplateFormOpen] =
    useState(false);
  const [recurringTemplateFormError, setRecurringTemplateFormError] = useState<
    string | null
  >(null);
  const [recurringTemplateForm, setRecurringTemplateForm] =
    useState<KolamTaskRecurringTemplateFormState>(() =>
      getDefaultRecurringTemplateForm(currentUserId),
    );
  const [checklistDraft, setChecklistDraft] = useState('');
  const [discussionDraft, setDiscussionDraft] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
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
  const [assignedToFilter, setAssignedToFilter] = useState('all');
  const [mineOnly, setMineOnly] = useState(false);
  const [recurringEnclosureOnly, setRecurringEnclosureOnly] = useState(false);
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
      const live = await getKolamTaskManagerCategories(mode !== 'categories');
      setCategories(live);
    } catch {
      // Non-blocking: list can still load without category labels.
    }
  }, [mode]);

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

  const loadTaskTypes = useCallback(async () => {
    if (mode !== 'task-types' && mode !== 'recurring') return;
    if (mode === 'task-types') {
      setLoading(true);
      setError(null);
    }
    try {
      setTaskTypes(await getKolamTaskManagerTaskTypes(true));
      if (mode === 'task-types') {
        setDataSource('live');
      }
    } catch (loadError) {
      if (mode === 'task-types') {
        setError(getErrorMessage(loadError));
        setDataSource('error');
      }
    } finally {
      if (mode === 'task-types') {
        setLoading(false);
      }
    }
  }, [mode]);

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
        assignedToId:
          assignedToFilter === 'all' ? undefined : assignedToFilter,
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
    assignedToFilter,
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

  const refreshRecurring = useCallback(async () => {
    if (mode !== 'recurring') {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [
        templates,
        occurrences,
        serviceVisits,
        enrollmentDashboard,
        enrollmentCompliance,
      ] = await Promise.all([
        getKolamTaskRecurringTemplates(),
        getKolamTaskRecurringOccurrences({
          enclosureOnly: isTaskAdmin && recurringEnclosureOnly,
          limit: 100,
          mine: !isTaskAdmin,
          page: 1,
        }),
        getKolamTaskRecurringServiceVisits({ limit: 200 }),
        isTaskAdmin
          ? getKolamTaskRecurringEnrollmentDashboard()
          : Promise.resolve(null),
        isTaskAdmin
          ? getKolamTaskRecurringEnrollmentCompliance({ days: 30 })
          : Promise.resolve(null),
      ]);
      setRecurringTemplates(templates);
      setRecurringOccurrences(occurrences);
      setRecurringServiceVisits(serviceVisits);
      setRecurringEnrollmentDashboard(enrollmentDashboard);
      setRecurringEnrollmentCompliance(enrollmentCompliance);
      setDataSource('live');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [isTaskAdmin, mode, recurringEnclosureOnly]);

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

  useEffect(() => {
    void refreshRecurring();
  }, [refreshRecurring]);

  useEffect(() => {
    void loadTaskTypes();
  }, [loadTaskTypes]);

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
    setAssignedToFilter('all');
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

  const onRunRecurringTick = useCallback(async () => {
    setMutatingTaskId('recurring');
    setError(null);
    setStatusMessage(null);
    try {
      await runKolamTaskRecurringTick();
      setStatusMessage('Jadwal di-generate');
      await refreshRecurring();
      return true;
    } catch (mutationError) {
      setError(getErrorMessage(mutationError));
      return false;
    } finally {
      setMutatingTaskId(null);
    }
  }, [refreshRecurring]);

  const onCreateRecurringTemplate = useCallback(() => {
    setRecurringTemplateForm(
      getDefaultRecurringTemplateForm(currentUserId || staffOptions[0]?.id || ''),
    );
    setRecurringTemplateFormError(null);
    setStatusMessage(null);
    setRecurringTemplateFormOpen(true);
  }, [currentUserId, staffOptions]);

  const onCloseRecurringTemplateForm = useCallback(() => {
    setRecurringTemplateFormOpen(false);
    setRecurringTemplateFormError(null);
  }, []);

  const onChangeRecurringTemplateForm = useCallback(
    (patch: Partial<KolamTaskRecurringTemplateFormState>) => {
      setRecurringTemplateForm(current => ({ ...current, ...patch }));
      setRecurringTemplateFormError(null);
      setStatusMessage(null);
    },
    [],
  );

  const onSaveRecurringTemplate = useCallback(async () => {
    const title = recurringTemplateForm.title.trim();
    const assignedToId = recurringTemplateForm.assignedToId.trim();
    if (!title || !assignedToId) {
      setRecurringTemplateFormError('Judul dan Maintainer wajib');
      return false;
    }

    setMutatingTaskId('recurring-template:new');
    setError(null);
    setStatusMessage(null);
    try {
      await createKolamTaskRecurringTemplate({
        assignedToId,
        dayOfMonth: Number(recurringTemplateForm.dayOfMonth) || 1,
        daysOfWeek:
          recurringTemplateForm.weekPreset === 'all'
            ? [0, 1, 2, 3, 4, 5, 6]
            : [1, 2, 3, 4, 5],
        description: recurringTemplateForm.description,
        recurrenceType: recurringTemplateForm.recurrenceType,
        sampleReviewPercent:
          Number(recurringTemplateForm.sampleReviewPercent) || 0,
        taskTypeId: recurringTemplateForm.taskTypeId || null,
        time: recurringTemplateForm.time,
        title,
      });
      setRecurringTemplateFormOpen(false);
      setStatusMessage('Template berulang dibuat');
      await refreshRecurring();
      return true;
    } catch (mutationError) {
      setRecurringTemplateFormError(getErrorMessage(mutationError));
      return false;
    } finally {
      setMutatingTaskId(null);
    }
  }, [recurringTemplateForm, refreshRecurring]);

  const onDeleteRecurringTemplate = useCallback(
    async (template: KolamTaskRecurringTemplate) => {
      setMutatingTaskId(`recurring-template:${template.id}`);
      setError(null);
      setStatusMessage(null);
      try {
        await deleteKolamTaskRecurringTemplate(template.id);
        setStatusMessage('Dihapus');
        await refreshRecurring();
        return true;
      } catch (mutationError) {
        setError(getErrorMessage(mutationError));
        return false;
      } finally {
        setMutatingTaskId(null);
      }
    },
    [refreshRecurring],
  );

  const onCreateNew = useCallback(() => {
    setFormMode('new');
    setEditingTaskId('');
    setForm(
      getDefaultTaskForm(
        currentUserId || staffOptions[0]?.id || '',
        categories[0]?.id ?? '',
      ),
    );
    setFormError(null);
    setError(null);
    setStatusMessage(null);
    setFormOpen(true);
  }, [categories, currentUserId, staffOptions]);

  const onEditTask = useCallback((task: KolamTaskManagerTask) => {
    setFormMode('edit');
    setEditingTaskId(task.id);
    setForm(getTaskFormFromTask(task));
    setFormError(null);
    setError(null);
    setStatusMessage(null);
    setFormOpen(true);
  }, []);

  const onCloseForm = useCallback(() => {
    setFormOpen(false);
    setFormError(null);
  }, []);

  const onChangeForm = useCallback(
    (patch: Partial<KolamTaskManagerFormState>) => {
      setForm(current => ({ ...current, ...patch }));
      setFormError(null);
      setStatusMessage(null);
    },
    [],
  );

  const onSaveForm = useCallback(async () => {
    const title = form.title.trim();
    const assignedToId = form.assignedToId.trim();
    const categoryId = form.categoryId.trim();
    const dueDate = buildKolamTaskDueDateIso(form.dueDate, form.dueTime);

    if (!title) {
      setFormError('Judul wajib diisi');
      return false;
    }
    if (!assignedToId) {
      setFormError('PIC wajib dipilih');
      return false;
    }
    if (!categoryId) {
      setFormError('Kategori wajib dipilih');
      return false;
    }
    if (!dueDate) {
      setFormError('Due wajib diisi');
      return false;
    }

    setMutatingTaskId(formMode === 'edit' ? editingTaskId : 'new');
    setError(null);
    setFormError(null);
    setStatusMessage(null);
    try {
      const payload = {
        title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        urgent: form.urgent,
        assignedToId,
        assistedById: form.assistedById || null,
        dueDate,
        categoryId,
      };
      if (formMode === 'edit' && editingTaskId) {
        await updateKolamTaskManagerTask(editingTaskId, payload);
        setStatusMessage('Tugas diperbarui');
        if (mode === 'detail') {
          await refreshDetail();
        } else {
          await refreshList();
        }
      } else {
        await createKolamTaskManagerTask(payload);
        setStatusMessage('Tugas dibuat');
        await refreshList();
      }
      setFormOpen(false);
      return true;
    } catch (mutationError) {
      setFormError(getErrorMessage(mutationError));
      return false;
    } finally {
      setMutatingTaskId(null);
    }
  }, [editingTaskId, form, formMode, mode, refreshDetail, refreshList]);

  const persistChecklist = useCallback(
    async (nextChecklist: KolamTaskManagerTask['checklist']) => {
      if (!selectedTask) return false;
      setMutatingTaskId(`checklist:${selectedTask.id}`);
      setError(null);
      setStatusMessage(null);
      try {
        const updated = await updateKolamTaskManagerChecklist(
          selectedTask.id,
          nextChecklist,
        );
        setSelectedTask(updated);
        setStatusMessage('Checklist diperbarui');
        return true;
      } catch (mutationError) {
        setError(getErrorMessage(mutationError));
        return false;
      } finally {
        setMutatingTaskId(null);
      }
    },
    [selectedTask],
  );

  const onAddChecklistItem = useCallback(async () => {
    if (!selectedTask) return false;
    const title = checklistDraft.trim();
    if (!title) return false;
    const nextChecklist = [
      ...selectedTask.checklist,
      {
        assignedTo: null,
        done: false,
        doneAt: '',
        doneBy: null,
        id: '',
        sortOrder: selectedTask.checklist.length,
        title,
      },
    ];
    const ok = await persistChecklist(nextChecklist);
    if (ok) {
      setChecklistDraft('');
    }
    return ok;
  }, [checklistDraft, persistChecklist, selectedTask]);

  const onToggleChecklistItem = useCallback(
    async (index: number) => {
      if (!selectedTask) return false;
      const nextChecklist = selectedTask.checklist.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              done: !item.done,
              doneAt: item.done ? '' : item.doneAt,
              doneBy: item.done ? null : item.doneBy,
            }
          : item,
      );
      return persistChecklist(nextChecklist);
    },
    [persistChecklist, selectedTask],
  );

  const onRemoveChecklistItem = useCallback(
    async (index: number) => {
      if (!selectedTask) return false;
      const nextChecklist = selectedTask.checklist
        .filter((_item, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({ ...item, sortOrder: itemIndex }));
      return persistChecklist(nextChecklist);
    },
    [persistChecklist, selectedTask],
  );

  const onAddNote = useCallback(async () => {
    if (!selectedTask) return false;
    const note = noteDraft.trim();
    if (!note) return false;
    setMutatingTaskId(`note:${selectedTask.id}`);
    setError(null);
    setStatusMessage(null);
    try {
      const updated = await addKolamTaskManagerNote(selectedTask.id, note);
      setSelectedTask(updated);
      setNoteDraft('');
      setStatusMessage('Catatan ditambahkan');
      return true;
    } catch (mutationError) {
      setError(getErrorMessage(mutationError));
      return false;
    } finally {
      setMutatingTaskId(null);
    }
  }, [noteDraft, selectedTask]);

  const onAddDiscussion = useCallback(async () => {
    if (!selectedTask) return false;
    const message = discussionDraft.trim();
    if (!message) return false;
    setMutatingTaskId(`discussion:${selectedTask.id}`);
    setError(null);
    setStatusMessage(null);
    try {
      const updated = await sendKolamTaskManagerDiscussion(
        selectedTask.id,
        message,
      );
      setSelectedTask(updated);
      setDiscussionDraft('');
      setStatusMessage('Pesan dikirim');
      return true;
    } catch (mutationError) {
      setError(getErrorMessage(mutationError));
      return false;
    } finally {
      setMutatingTaskId(null);
    }
  }, [discussionDraft, selectedTask]);

  const onCreateCategory = useCallback(() => {
    setCategoryFormMode('new');
    setEditingCategoryId('');
    setCategoryForm(getDefaultCategoryForm());
    setCategoryFormError(null);
    setStatusMessage(null);
    setCategoryFormOpen(true);
  }, []);

  const onEditCategory = useCallback((category: KolamTaskManagerCategory) => {
    setCategoryFormMode('edit');
    setEditingCategoryId(category.id);
    setCategoryForm({
      active: category.active,
      color: category.color || '#6366f1',
      name: category.name,
      sortOrder: String(category.sortOrder ?? 0),
    });
    setCategoryFormError(null);
    setStatusMessage(null);
    setCategoryFormOpen(true);
  }, []);

  const onCloseCategoryForm = useCallback(() => {
    setCategoryFormOpen(false);
    setCategoryFormError(null);
  }, []);

  const onChangeCategoryForm = useCallback(
    (patch: Partial<KolamTaskManagerCategoryFormState>) => {
      setCategoryForm(current => ({ ...current, ...patch }));
      setCategoryFormError(null);
      setStatusMessage(null);
    },
    [],
  );

  const onSaveCategory = useCallback(async () => {
    const name = categoryForm.name.trim();
    if (!name) {
      setCategoryFormError('Nama wajib diisi');
      return false;
    }

    setMutatingTaskId(
      categoryFormMode === 'edit'
        ? `category:${editingCategoryId}`
        : 'category:new',
    );
    setError(null);
    setStatusMessage(null);
    try {
      const input = {
        active: categoryForm.active,
        color: categoryForm.color,
        name,
        sortOrder: Number(categoryForm.sortOrder) || 0,
      };
      if (categoryFormMode === 'edit' && editingCategoryId) {
        await updateKolamTaskManagerCategory(editingCategoryId, input);
      } else {
        await createKolamTaskManagerCategory(input);
      }
      setCategoryFormOpen(false);
      setStatusMessage('Kategori disimpan');
      await loadCategories();
      return true;
    } catch (mutationError) {
      setCategoryFormError(getErrorMessage(mutationError));
      return false;
    } finally {
      setMutatingTaskId(null);
    }
  }, [categoryForm, categoryFormMode, editingCategoryId, loadCategories]);

  const onDeleteCategory = useCallback(
    async (category: KolamTaskManagerCategory) => {
      setMutatingTaskId(`category:${category.id}`);
      setError(null);
      setStatusMessage(null);
      try {
        await deleteKolamTaskManagerCategory(category.id);
        setStatusMessage('Kategori dihapus');
        await loadCategories();
        return true;
      } catch (mutationError) {
        setError(getErrorMessage(mutationError));
        return false;
      } finally {
        setMutatingTaskId(null);
      }
    },
    [loadCategories],
  );

  const onCreateTaskType = useCallback(() => {
    setTaskTypeFormMode('new');
    setEditingTaskTypeId('');
    setTaskTypeForm(getDefaultTaskTypeForm());
    setTaskTypeFormError(null);
    setStatusMessage(null);
    setTaskTypeFormOpen(true);
  }, []);

  const onEditTaskType = useCallback((taskType: KolamTaskManagerTaskType) => {
    setTaskTypeFormMode('edit');
    setEditingTaskTypeId(taskType.id);
    setTaskTypeForm({
      active: taskType.active,
      categoryBuckets: taskType.categoryBuckets,
      description: taskType.description,
      handler: taskType.handler,
      key: taskType.key,
      name: taskType.name,
      requiresProductComponents: taskType.requiresProductComponents,
      sortOrder: String(taskType.sortOrder ?? 100),
    });
    setTaskTypeFormError(null);
    setStatusMessage(null);
    setTaskTypeFormOpen(true);
  }, []);

  const onChangeTaskTypeForm = useCallback(
    (patch: Partial<KolamTaskManagerTaskTypeFormState>) => {
      setTaskTypeForm(current => ({ ...current, ...patch }));
      setTaskTypeFormError(null);
      setStatusMessage(null);
    },
    [],
  );

  const onCloseTaskTypeForm = useCallback(() => {
    setTaskTypeFormOpen(false);
    setTaskTypeFormError(null);
  }, []);

  const onSaveTaskType = useCallback(async () => {
    const name = taskTypeForm.name.trim();
    const key = taskTypeForm.key.trim().toLowerCase();
    if (!name) {
      setTaskTypeFormError('Nama wajib diisi');
      return false;
    }
    if (taskTypeFormMode === 'new' && !key) {
      setTaskTypeFormError('Key wajib diisi');
      return false;
    }
    setMutatingTaskId(
      taskTypeFormMode === 'edit'
        ? `task-type:${editingTaskTypeId}`
        : 'task-type:new',
    );
    setError(null);
    setStatusMessage(null);
    try {
      const input = {
        active: taskTypeForm.active,
        categoryBuckets: taskTypeForm.categoryBuckets,
        description: taskTypeForm.description,
        handler: taskTypeForm.handler,
        key,
        name,
        requiresProductComponents: taskTypeForm.requiresProductComponents,
        sortOrder: Number(taskTypeForm.sortOrder) || 100,
      };
      if (taskTypeFormMode === 'edit' && editingTaskTypeId) {
        await updateKolamTaskManagerTaskType(editingTaskTypeId, input);
      } else {
        await createKolamTaskManagerTaskType(input);
      }
      setTaskTypeFormOpen(false);
      setStatusMessage('Tipe task disimpan');
      await loadTaskTypes();
      return true;
    } catch (mutationError) {
      setTaskTypeFormError(getErrorMessage(mutationError));
      return false;
    } finally {
      setMutatingTaskId(null);
    }
  }, [editingTaskTypeId, loadTaskTypes, taskTypeForm, taskTypeFormMode]);

  const onDeleteTaskType = useCallback(
    async (taskType: KolamTaskManagerTaskType) => {
      setMutatingTaskId(`task-type:${taskType.id}`);
      setError(null);
      setStatusMessage(null);
      try {
        await deleteKolamTaskManagerTaskType(taskType.id);
        setStatusMessage('Tipe task dihapus');
        await loadTaskTypes();
        return true;
      } catch (mutationError) {
        setError(getErrorMessage(mutationError));
        return false;
      } finally {
        setMutatingTaskId(null);
      }
    },
    [loadTaskTypes],
  );

  return useMemo(
    () => ({
      categories,
      categoryForm,
      categoryFormError,
      categoryFormMode,
      categoryFormOpen,
      taskTypeForm,
      taskTypeFormError,
      taskTypeFormMode,
      taskTypeFormOpen,
      recurringTemplateForm,
      recurringTemplateFormError,
      recurringTemplateFormOpen,
      categoryBucketFilter,
      categoryFilter,
      assignedToFilter,
      currentUserId,
      dataSource,
      error,
      form,
      formError,
      formMode,
      formOpen,
      checklistDraft,
      discussionDraft,
      noteDraft,
      kpi,
      loading,
      mineOnly,
      isTaskAdmin,
      mode,
      mutatingTaskId,
      page,
      pageSize,
      priorityFilter,
      recurringEnclosureOnly,
      recurringEnrollmentCompliance,
      recurringEnrollmentDashboard,
      recurringOccurrences,
      recurringServiceVisits,
      recurringTemplates,
      route,
      search,
      staffOptions,
      statusFilter,
      statusMessage,
      tasks,
      total,
      totalPages,
      selectedTask,
      taskTypes,
      onAddChecklistItem,
      onAddDiscussion,
      onAddNote,
      onChangeCategoryForm,
      onChangeForm,
      onChangeRecurringTemplateForm,
      onChangeTaskTypeForm,
      onCloseCategoryForm,
      onCloseForm,
      onCloseRecurringTemplateForm,
      onCloseTaskTypeForm,
      onBackToList,
      onCreateCategory,
      onCreateNew,
      onCreateRecurringTemplate,
      onCreateTaskType,
      onDeleteCategory,
      onDeleteRecurringTemplate,
      onDeleteTaskType,
      onEditCategory,
      onEditTask,
      onEditTaskType,
      onRefresh:
        mode === 'detail'
          ? refreshDetail
          : mode === 'task-types'
            ? loadTaskTypes
          : mode === 'recurring'
            ? refreshRecurring
            : refreshList,
      onResetFilters,
      onSelectPage: setPage,
      onSetCategoryBucketFilter: setFilterAndFirstPage(
        setCategoryBucketFilter,
      ),
      onSetCategoryFilter: setFilterAndFirstPage(setCategoryFilter),
      onSetAssignedToFilter: setFilterAndFirstPage(setAssignedToFilter),
      onSetMineOnly: setFilterAndFirstPage(setMineOnly),
      onSetPageSize: setFilterAndFirstPage(setPageSize),
      onSetPriorityFilter: setFilterAndFirstPage(setPriorityFilter),
      onSetRecurringEnclosureOnly: setFilterAndFirstPage(
        setRecurringEnclosureOnly,
      ),
      onSetSearch: setFilterAndFirstPage(setSearch),
      onSetStatusFilter: setFilterAndFirstPage(setStatusFilter),
      onSetTaskPriority,
      onSetTaskStatus,
      onRemoveChecklistItem,
      onSaveCategory,
      onSaveForm,
      onSaveRecurringTemplate,
      onSaveTaskType,
      onSetChecklistDraft: setChecklistDraft,
      onSetDiscussionDraft: setDiscussionDraft,
      onSetNoteDraft: setNoteDraft,
      onToggleChecklistItem,
      onRunRecurringTick,
      onSwitchTab,
    }),
    [
      categories,
      categoryForm,
      categoryFormError,
      categoryFormMode,
      categoryFormOpen,
      taskTypeForm,
      taskTypeFormError,
      taskTypeFormMode,
      taskTypeFormOpen,
      recurringTemplateForm,
      recurringTemplateFormError,
      recurringTemplateFormOpen,
      categoryBucketFilter,
      categoryFilter,
      assignedToFilter,
      currentUserId,
      dataSource,
      error,
      form,
      formError,
      formMode,
      formOpen,
      checklistDraft,
      discussionDraft,
      noteDraft,
      kpi,
      loading,
      mineOnly,
      isTaskAdmin,
      mode,
      mutatingTaskId,
      onAddChecklistItem,
      onAddDiscussion,
      onAddNote,
      onChangeCategoryForm,
      onChangeForm,
      onChangeRecurringTemplateForm,
      onChangeTaskTypeForm,
      onCloseCategoryForm,
      onCloseForm,
      onCloseRecurringTemplateForm,
      onCloseTaskTypeForm,
      onCreateCategory,
      onCreateNew,
      onCreateRecurringTemplate,
      onCreateTaskType,
      onDeleteCategory,
      onDeleteRecurringTemplate,
      onDeleteTaskType,
      onEditCategory,
      onEditTask,
      onEditTaskType,
      onBackToList,
      onResetFilters,
      onRunRecurringTick,
      onSetTaskPriority,
      onSetTaskStatus,
      onRemoveChecklistItem,
      onSaveCategory,
      onSaveForm,
      onSaveRecurringTemplate,
      onSaveTaskType,
      onToggleChecklistItem,
      onSwitchTab,
      page,
      pageSize,
      priorityFilter,
      recurringEnclosureOnly,
      recurringEnrollmentCompliance,
      recurringEnrollmentDashboard,
      recurringOccurrences,
      recurringServiceVisits,
      recurringTemplates,
      refreshList,
      refreshDetail,
      refreshRecurring,
      route,
      search,
      setFilterAndFirstPage,
      staffOptions,
      statusFilter,
      statusMessage,
      taskTypes,
      tasks,
      total,
      totalPages,
      selectedTask,
    ],
  );
}

function getDefaultTaskForm(
  assignedToId: string,
  categoryId = '',
): KolamTaskManagerFormState {
  return {
    assistedById: '',
    categoryId,
    description: '',
    dueDate: '',
    dueTime: '',
    priority: 'medium',
    assignedToId,
    status: 'todo',
    title: '',
    urgent: false,
  };
}

function getDefaultCategoryForm(): KolamTaskManagerCategoryFormState {
  return {
    active: true,
    color: '#6366f1',
    name: '',
    sortOrder: '0',
  };
}

function getDefaultTaskTypeForm(): KolamTaskManagerTaskTypeFormState {
  return {
    active: true,
    categoryBuckets: [],
    description: '',
    handler: 'dosing',
    key: '',
    name: '',
    requiresProductComponents: false,
    sortOrder: '100',
  };
}

function getDefaultRecurringTemplateForm(
  assignedToId: string,
): KolamTaskRecurringTemplateFormState {
  return {
    assignedToId,
    dayOfMonth: '1',
    description: '',
    recurrenceType: 'daily',
    sampleReviewPercent: '10',
    taskTypeId: '',
    time: '09:00',
    title: '',
    weekPreset: 'weekdays',
  };
}

function getTaskFormFromTask(
  task: KolamTaskManagerTask,
): KolamTaskManagerFormState {
  const due = splitKolamTaskDueDateTime(task.dueDate);
  return {
    assistedById: getTaskUserId(task.assistedBy),
    categoryId: getTaskCategoryId(task.category),
    description: task.description,
    dueDate: due.date,
    dueTime: due.time,
    priority: task.priority,
    assignedToId: getTaskUserId(task.assignedTo),
    status: task.status,
    title: task.title,
    urgent: task.urgent,
  };
}

function getTaskUserId(value: KolamTaskManagerTask['assignedTo']) {
  if (!value) return '';
  return typeof value === 'string' ? value : value.id;
}

function getTaskCategoryId(value: KolamTaskManagerTask['category']) {
  if (!value) return '';
  return typeof value === 'string' ? value : value.id;
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

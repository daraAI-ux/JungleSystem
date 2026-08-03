import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { KolamAuthContext } from '../context/kolam-app-contexts';
import {
  buildKolamTaskManagerKpi,
  buildKolamTaskDueDateIso,
  canAccessKolamTaskManager,
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
  type KolamTaskCustomerCrmContext,
  type KolamTaskRecurringEnrollmentCompliance,
  type KolamTaskRecurringEnrollmentDashboard,
  type KolamTaskRecurringEnrollmentStats,
  type KolamTaskRecurringOccurrence,
  type KolamTaskRecurringServiceVisit,
  type KolamTaskRecurringTemplate,
} from '../domain/kolam-task-manager';
import type {
  KolamUserListItem,
  KolamUserRatingSummary,
} from '../domain/kolam-user';
import type { KolamLocationOption } from '../services/kolam-location-api';
import { getErrorMessage as getApiErrorMessage } from '../lib/api-error';
import {
  getKolamCustomProjectOptions,
  type KolamCustomProjectOption,
} from '../services/kolam-custom-project-api';
import {
  addKolamTaskManagerNote,
  bulkSetKolamTaskRecurringEnrollment,
  createKolamTaskManagerCategory,
  createKolamTaskManagerTask,
  createKolamTaskManagerTaskType,
  createKolamTaskRecurringTemplate,
  deleteKolamTaskManagerCategory,
  deleteKolamTaskManagerTask,
  deleteKolamTaskManagerTaskType,
  deleteKolamTaskRecurringTemplate,
  getKolamTaskManagerCategories,
  getKolamTaskManagerCrmContext,
  getKolamTaskManagerTask,
  getKolamTaskManagerTasks,
  getKolamTaskManagerTaskTypes,
  getKolamTaskOvertimeEligibility,
  getKolamTaskRecurringEnrollmentCompliance,
  getKolamTaskRecurringEnrollmentDashboard,
  getKolamTaskRecurringEnrollmentStats,
  getKolamTaskRecurringOccurrences,
  getKolamTaskRecurringServiceVisits,
  getKolamTaskRecurringTemplates,
  requestKolamTaskOvertime,
  runKolamTaskRecurringTick,
  sendKolamTaskManagerDiscussion,
  updateKolamTaskManagerCategory,
  updateKolamTaskManagerChecklist,
  updateKolamTaskManagerStatus,
  updateKolamTaskManagerTask,
  updateKolamTaskManagerTaskType,
  type KolamTaskOvertimeEligibility,
} from '../services/kolam-task-manager-api';
import { getKolamLocations } from '../services/kolam-location-api';
import { getKolamCustomerList } from '../services/kolam-customer-api';
import {
  getKolamUserList,
  getKolamUserRatingSummary,
} from '../services/kolam-user-api';
import {
  pickNativeImageFile,
  pickNativeVideoFile,
  type NativeImagePickerResult,
} from '../services/native-file-picker';

export type KolamTaskManagerDataSource = 'error' | 'idle' | 'live';

export interface KolamTaskManagerStaffOption {
  id: string;
  label: string;
}

export interface KolamTaskManagerCustomerOption {
  id: string;
  label: string;
}

export interface KolamTaskManagerFormState {
  assistedById: string;
  categoryId: string;
  customerId: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: KolamTaskManagerPriority;
  projectId: string;
  saleId: string;
  complaintId: string;
  conversationId: string;
  assignedToId: string;
  status: KolamTaskManagerStatus;
  taskTypeId: string;
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

export interface KolamTaskRecurringBulkEnrollmentFormState {
  active: boolean;
  allWithPic: boolean;
  locationId: string;
  taskTypeId: string;
}

export interface KolamTaskManagerController {
  categories: KolamTaskManagerCategory[];
  categoryForm: KolamTaskManagerCategoryFormState;
  categoryFormError: string | null;
  categoryFormMode: 'edit' | 'new';
  categoryFormOpen: boolean;
  taskTypeForm: KolamTaskManagerTaskTypeFormState;
  taskTypeFormError: string | null;
  taskTypeFormKeyLocked: boolean;
  taskTypeFormMode: 'edit' | 'new';
  taskTypeFormOpen: boolean;
  deleteTaskTypeConfirmTaskType: KolamTaskManagerTaskType | null;
  recurringTemplateForm: KolamTaskRecurringTemplateFormState;
  recurringTemplateFormError: string | null;
  recurringTemplateFormOpen: boolean;
  categoryBucketFilter: KolamTaskCategoryBucket | 'all';
  categoryFilter: string;
  assignedToFilter: string;
  projectFilter: string;
  currentUserId: string;
  dataSource: KolamTaskManagerDataSource;
  error: string | null;
  form: KolamTaskManagerFormState;
  formError: string | null;
  formMode: 'edit' | 'new';
  formOpen: boolean;
  deleteTaskConfirmTask: KolamTaskManagerTask | null;
  crmContext: KolamTaskCustomerCrmContext | null;
  ratingSummary: KolamUserRatingSummary | null;
  checklistDraft: string;
  discussionDraft: string;
  discussionAttachments: NativeImagePickerResult[];
  noteDraft: string;
  overtimeEligibilityByTaskId: Record<string, KolamTaskOvertimeEligibility | null>;
  overtimeRequestError: string | null;
  overtimeRequestReason: string;
  overtimeRequestTaskId: string;
  kpi: KolamTaskManagerKpi;
  loading: boolean;
  mineOnly: boolean;
  canAccess: boolean;
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
  recurringBulkForm: KolamTaskRecurringBulkEnrollmentFormState;
  recurringBulkFormError: string | null;
  recurringBulkFormOpen: boolean;
  recurringBulkLocations: KolamLocationOption[];
  recurringBulkStats: KolamTaskRecurringEnrollmentStats | null;
  route: string;
  search: string;
  staffOptions: KolamTaskManagerStaffOption[];
  customerOptions: KolamTaskManagerCustomerOption[];
  projectOptions: KolamCustomProjectOption[];
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
  onChangeRecurringBulkForm: (
    patch: Partial<KolamTaskRecurringBulkEnrollmentFormState>,
  ) => void;
  onCloseCategoryForm: () => void;
  onCloseForm: () => void;
  onCloseDeleteTaskConfirm: () => void;
  onCloseDeleteTaskTypeConfirm: () => void;
  onCloseRecurringBulkForm: () => void;
  onCloseRecurringTemplateForm: () => void;
  onCloseTaskTypeForm: () => void;
  onCloseOvertimeRequest: () => void;
  onCreateCategory: () => void;
  onCreateNew: () => void;
  onCreateRecurringBulkEnrollment: () => void;
  onCreateRecurringTemplate: () => void;
  onCreateTaskType: () => void;
  onDeleteCategory: (category: KolamTaskManagerCategory) => Promise<boolean>;
  onDeleteTask: (task: KolamTaskManagerTask) => Promise<boolean>;
  onDeleteRecurringTemplate: (
    template: KolamTaskRecurringTemplate,
  ) => Promise<boolean>;
  onDeleteTaskType: (taskType: KolamTaskManagerTaskType) => Promise<boolean>;
  onEditCategory: (category: KolamTaskManagerCategory) => void;
  onEditTaskType: (taskType: KolamTaskManagerTaskType) => void;
  onEditTask: (task: KolamTaskManagerTask) => void;
  onOpenOvertimeRequest: (task: KolamTaskManagerTask) => void;
  onRequestDeleteTask: (task: KolamTaskManagerTask) => void;
  onRequestDeleteTaskType: (taskType: KolamTaskManagerTaskType) => void;
  onBackToList: () => void;
  onRefresh: () => Promise<void>;
  onResetFilters: () => void;
  onSelectPage: (page: number) => void;
  onSetCategoryBucketFilter: (value: KolamTaskCategoryBucket | 'all') => void;
  onSetCategoryFilter: (value: string) => void;
  onSetAssignedToFilter: (value: string) => void;
  onSetProjectFilter: (value: string) => void;
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
  onSaveRecurringBulkEnrollment: () => Promise<boolean>;
  onSaveRecurringTemplate: () => Promise<boolean>;
  onSaveTaskType: () => Promise<boolean>;
  onSetChecklistDraft: (value: string) => void;
  onPickDiscussionImage: () => Promise<boolean>;
  onPickDiscussionVideo: () => Promise<boolean>;
  onRemoveDiscussionAttachment: (index: number) => void;
  onSetDiscussionDraft: (value: string) => void;
  onSetNoteDraft: (value: string) => void;
  onSetOvertimeRequestReason: (value: string) => void;
  onToggleChecklistItem: (index: number) => Promise<boolean>;
  onRunRecurringTick: () => Promise<boolean>;
  onSubmitOvertimeRequest: () => Promise<boolean>;
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
  const canAccess = canAccessKolamTaskManager(authUser?.permissions, roleKey);
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
  const [crmContext, setCrmContext] =
    useState<KolamTaskCustomerCrmContext | null>(null);
  const [ratingSummary, setRatingSummary] =
    useState<KolamUserRatingSummary | null>(null);
  const [categories, setCategories] = useState<KolamTaskManagerCategory[]>([]);
  const [staffOptions, setStaffOptions] = useState<KolamTaskManagerStaffOption[]>(
    [],
  );
  const [customerOptions, setCustomerOptions] = useState<
    KolamTaskManagerCustomerOption[]
  >([]);
  const [projectOptions, setProjectOptions] = useState<
    KolamCustomProjectOption[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [mutatingTaskId, setMutatingTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'edit' | 'new'>('new');
  const [editingTaskId, setEditingTaskId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTaskConfirmTask, setDeleteTaskConfirmTask] =
    useState<KolamTaskManagerTask | null>(null);
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
  const [deleteTaskTypeConfirmTaskType, setDeleteTaskTypeConfirmTaskType] =
    useState<KolamTaskManagerTaskType | null>(null);
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
  const [recurringBulkFormOpen, setRecurringBulkFormOpen] = useState(false);
  const [recurringBulkFormError, setRecurringBulkFormError] = useState<
    string | null
  >(null);
  const [recurringBulkForm, setRecurringBulkForm] =
    useState<KolamTaskRecurringBulkEnrollmentFormState>(() =>
      getDefaultRecurringBulkEnrollmentForm(),
    );
  const [recurringBulkStats, setRecurringBulkStats] =
    useState<KolamTaskRecurringEnrollmentStats | null>(null);
  const [recurringBulkLocations, setRecurringBulkLocations] = useState<
    KolamLocationOption[]
  >([]);
  const [checklistDraft, setChecklistDraft] = useState('');
  const [discussionDraft, setDiscussionDraft] = useState('');
  const [discussionAttachments, setDiscussionAttachments] = useState<
    NativeImagePickerResult[]
  >([]);
  const [noteDraft, setNoteDraft] = useState('');
  const [overtimeEligibilityByTaskId, setOvertimeEligibilityByTaskId] =
    useState<Record<string, KolamTaskOvertimeEligibility | null>>({});
  const [overtimeRequestTaskId, setOvertimeRequestTaskId] = useState('');
  const [overtimeRequestReason, setOvertimeRequestReason] = useState('');
  const [overtimeRequestError, setOvertimeRequestError] = useState<
    string | null
  >(null);
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
  const [projectFilter, setProjectFilter] = useState('all');
  const [mineOnly, setMineOnly] = useState(false);
  const [recurringEnclosureOnly, setRecurringEnclosureOnly] = useState(false);

  useEffect(() => {
    if (
      currentUserId &&
      !isTaskAdmin &&
      (mode === 'categories' || mode === 'task-types')
    ) {
      onRouteChange?.(KOLAM_TASK_MANAGER_ROOT);
    }
  }, [currentUserId, isTaskAdmin, mode, onRouteChange]);

  const taskTypeFormKeyLocked =
    taskTypeFormMode === 'edit' &&
    taskTypes.some(row => row.id === editingTaskTypeId && row.isSystem);
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

  const loadProjects = useCallback(async () => {
    try {
      setProjectOptions(await getKolamCustomProjectOptions({ limit: 200, page: 1 }));
    } catch {
      // Non-blocking: project filter/form can stay minimal.
    }
  }, []);

  const loadCustomers = useCallback(async () => {
    try {
      const live = await getKolamCustomerList({ limit: 200, page: 1 });
      setCustomerOptions(mapCustomerOptions(live.items));
    } catch {
      // Non-blocking: customer field can stay minimal.
    }
  }, []);

  const loadLocations = useCallback(async () => {
    if (!isTaskAdmin || mode !== 'recurring') {
      return;
    }
    try {
      setRecurringBulkLocations(await getKolamLocations());
    } catch {
      // Non-blocking: bulk enrollment can still run without location filter.
    }
  }, [isTaskAdmin, mode]);

  const loadTaskTypes = useCallback(async () => {
    if (
      mode !== 'task-types' &&
      mode !== 'recurring' &&
      mode !== 'list' &&
      mode !== 'detail'
    ) {
      return;
    }
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

  const refreshOvertimeEligibility = useCallback(
    async (taskIds: string[]) => {
      const uniqueTaskIds = Array.from(new Set(taskIds.filter(Boolean)));
      if (!uniqueTaskIds.length) return;

      const pairs = await Promise.all(
        uniqueTaskIds.map(async taskId => {
          try {
            return [
              taskId,
              await getKolamTaskOvertimeEligibility(taskId),
            ] as const;
          } catch {
            return [taskId, null] as const;
          }
        }),
      );
      setOvertimeEligibilityByTaskId(current => ({
        ...current,
        ...Object.fromEntries(pairs),
      }));
    },
    [],
  );

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
        projectId: projectFilter === 'all' ? undefined : projectFilter,
        mine: mineOnly,
      });
      setTasks(list.items);
      void refreshOvertimeEligibility(getOvertimeCandidateTaskIds(list.items));
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
      setCrmContext(null);
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [
    categoryBucketFilter,
    categoryFilter,
    assignedToFilter,
    projectFilter,
    mineOnly,
    mode,
    page,
    pageSize,
    priorityFilter,
    refreshOvertimeEligibility,
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
      setCrmContext(null);
      setRatingSummary(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const live = await getKolamTaskManagerTask(taskId);
      setSelectedTask(live);
      void refreshOvertimeEligibility(getOvertimeCandidateTaskIds([live]));
      const assigneeId = getTaskUserId(live.assignedTo);
      if (live.customerId) {
        try {
          setCrmContext(await getKolamTaskManagerCrmContext(taskId));
        } catch {
          setCrmContext(null);
        }
      } else {
        setCrmContext(null);
      }
      if (live.categoryBucket === 'crm' && assigneeId) {
        try {
          setRatingSummary(await getKolamUserRatingSummary(assigneeId));
        } catch {
          setRatingSummary(null);
        }
      } else {
        setRatingSummary(null);
      }
      setDataSource('live');
    } catch (loadError) {
      setCrmContext(null);
      setRatingSummary(null);
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [mode, refreshOvertimeEligibility, route]);

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
    void loadCustomers();
    void loadStaff();
    void loadProjects();
  }, [loadCategories, loadCustomers, loadProjects, loadStaff]);

  useEffect(() => {
    void loadLocations();
  }, [loadLocations]);

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
    setProjectFilter('all');
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

  const onCreateRecurringBulkEnrollment = useCallback(() => {
    const initialTaskTypeId =
      taskTypes.find(taskType => taskType.active && taskType.categoryBuckets.includes('enclosure'))
        ?.id ??
      taskTypes.find(taskType => taskType.active)?.id ??
      '';
    setRecurringBulkForm({
      ...getDefaultRecurringBulkEnrollmentForm(),
      taskTypeId: initialTaskTypeId,
    });
    setRecurringBulkStats(null);
    setRecurringBulkFormError(null);
    setStatusMessage(null);
    setRecurringBulkFormOpen(true);
  }, [taskTypes]);

  const onCloseRecurringBulkForm = useCallback(() => {
    setRecurringBulkFormOpen(false);
    setRecurringBulkFormError(null);
  }, []);

  const onChangeRecurringBulkForm = useCallback(
    (patch: Partial<KolamTaskRecurringBulkEnrollmentFormState>) => {
      setRecurringBulkForm(current => ({ ...current, ...patch }));
      setRecurringBulkFormError(null);
      setStatusMessage(null);
    },
    [],
  );

  useEffect(() => {
    if (!recurringBulkFormOpen || !recurringBulkForm.taskTypeId) {
      setRecurringBulkStats(null);
      return;
    }

    let cancelled = false;
    getKolamTaskRecurringEnrollmentStats(recurringBulkForm.taskTypeId)
      .then(stats => {
        if (!cancelled) {
          setRecurringBulkStats(stats);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRecurringBulkStats(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [recurringBulkForm.taskTypeId, recurringBulkFormOpen]);

  const onSaveRecurringBulkEnrollment = useCallback(async () => {
    const taskTypeId = recurringBulkForm.taskTypeId.trim();
    if (!taskTypeId) {
      setRecurringBulkFormError('Pilih tipe task');
      return false;
    }
    if (!recurringBulkForm.allWithPic && !recurringBulkForm.locationId.trim()) {
      setRecurringBulkFormError('Pilih lokasi atau PIC');
      return false;
    }

    setMutatingTaskId('recurring-bulk');
    setError(null);
    setStatusMessage(null);
    try {
      const result = await bulkSetKolamTaskRecurringEnrollment({
        active: recurringBulkForm.active,
        allWithPic: recurringBulkForm.allWithPic || undefined,
        locationId: recurringBulkForm.locationId || undefined,
        taskTypeId,
      });
      setRecurringBulkFormOpen(false);
      setStatusMessage(
        `${recurringBulkForm.active ? 'Diaktifkan' : 'Dinonaktifkan'} ${result.updated}`,
      );
      await refreshRecurring();
      return true;
    } catch (mutationError) {
      setRecurringBulkFormError(getErrorMessage(mutationError));
      return false;
    } finally {
      setMutatingTaskId(null);
    }
  }, [recurringBulkForm, refreshRecurring]);

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
    if (!isTaskAdmin) return;
    setFormMode('new');
    setEditingTaskId('');
    setForm(
      getDefaultTaskForm(
        currentUserId || staffOptions[0]?.id || '',
        categories[0]?.id ?? '',
        projectFilter === 'all' ? '' : projectFilter,
      ),
    );
    setFormError(null);
    setError(null);
    setStatusMessage(null);
    setFormOpen(true);
  }, [categories, currentUserId, isTaskAdmin, projectFilter, staffOptions]);

  const onEditTask = useCallback((task: KolamTaskManagerTask) => {
    if (!isTaskAdmin) return;
    setFormMode('edit');
    setEditingTaskId(task.id);
    setForm(getTaskFormFromTask(task));
    setFormError(null);
    setError(null);
    setStatusMessage(null);
    setFormOpen(true);
  }, [isTaskAdmin]);

  const onOpenOvertimeRequest = useCallback((task: KolamTaskManagerTask) => {
    setOvertimeRequestTaskId(task.id);
    setOvertimeRequestReason('');
    setOvertimeRequestError(null);
    setStatusMessage(null);
  }, []);

  const onCloseOvertimeRequest = useCallback(() => {
    setOvertimeRequestTaskId('');
    setOvertimeRequestReason('');
    setOvertimeRequestError(null);
  }, []);

  const onRequestDeleteTask = useCallback((task: KolamTaskManagerTask) => {
    if (!isTaskAdmin) return;
    setDeleteTaskConfirmTask(task);
    setError(null);
    setStatusMessage(null);
  }, [isTaskAdmin]);

  const onCloseDeleteTaskConfirm = useCallback(() => {
    setDeleteTaskConfirmTask(null);
  }, []);

  const onRequestDeleteTaskType = useCallback(
    (taskType: KolamTaskManagerTaskType) => {
      if (taskType.isSystem) {
        setError('Tipe sistem tidak bisa dihapus');
        return;
      }
      setDeleteTaskTypeConfirmTaskType(taskType);
      setError(null);
      setStatusMessage(null);
    },
    [],
  );

  const onCloseDeleteTaskTypeConfirm = useCallback(() => {
    setDeleteTaskTypeConfirmTaskType(null);
  }, []);

  const onSubmitOvertimeRequest = useCallback(async () => {
    const reason = overtimeRequestReason.trim();
    if (!overtimeRequestTaskId) return false;
    if (reason.length < 10) {
      setOvertimeRequestError('Alasan minimal 10 karakter');
      return false;
    }

    setMutatingTaskId(`overtime:${overtimeRequestTaskId}`);
    setOvertimeRequestError(null);
    setStatusMessage(null);
    try {
      await requestKolamTaskOvertime(overtimeRequestTaskId, reason);
      setStatusMessage('Pengajuan lembur terkirim');
      setOvertimeRequestTaskId('');
      setOvertimeRequestReason('');
      await refreshOvertimeEligibility([overtimeRequestTaskId]);
      return true;
    } catch (mutationError) {
      setOvertimeRequestError(getErrorMessage(mutationError));
      return false;
    } finally {
      setMutatingTaskId(null);
    }
  }, [
    overtimeRequestReason,
    overtimeRequestTaskId,
    refreshOvertimeEligibility,
  ]);

  const onDeleteTask = useCallback(
    async (task: KolamTaskManagerTask) => {
      if (!isTaskAdmin) return false;
      setMutatingTaskId(`delete:${task.id}`);
      setError(null);
      setStatusMessage(null);
      try {
        await deleteKolamTaskManagerTask(task.id);
        setDeleteTaskConfirmTask(null);
        setStatusMessage('Tugas dihapus');
        if (mode === 'detail') {
          setSelectedTask(null);
          onRouteChange?.(KOLAM_TASK_MANAGER_ROOT);
        }
        await refreshList();
        return true;
      } catch (mutationError) {
        setError(getErrorMessage(mutationError));
        return false;
      } finally {
        setMutatingTaskId(null);
      }
    },
    [isTaskAdmin, mode, onRouteChange, refreshList],
  );

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
        customerId: taskFormShowsCustomerField(form)
          ? form.customerId || null
          : null,
        taskTypeId: form.taskTypeId || null,
        projectId: form.projectId || null,
        saleId: form.saleId || null,
        complaintId: form.complaintId || null,
        conversationId: form.conversationId || null,
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
    if (!stripHtmlText(message) && discussionAttachments.length === 0) {
      return false;
    }
    setMutatingTaskId(`discussion:${selectedTask.id}`);
    setError(null);
    setStatusMessage(null);
    try {
      const updated = await sendKolamTaskManagerDiscussion(
        selectedTask.id,
        message || '<p></p>',
        discussionAttachments,
      );
      setSelectedTask(updated);
      setDiscussionDraft('');
      setDiscussionAttachments([]);
      setStatusMessage('Pesan dikirim');
      return true;
    } catch (mutationError) {
      setError(getErrorMessage(mutationError));
      return false;
    } finally {
      setMutatingTaskId(null);
    }
  }, [discussionAttachments, discussionDraft, selectedTask]);

  const onPickDiscussionImage = useCallback(async () => {
    try {
      const file = await pickNativeImageFile();
      if (file.cancelled || (!file.uri && !file.path)) return false;
      setDiscussionAttachments(current => [...current, file].slice(0, 8));
      return true;
    } catch (pickerError) {
      setError(getErrorMessage(pickerError));
      return false;
    }
  }, []);

  const onPickDiscussionVideo = useCallback(async () => {
    try {
      const file = await pickNativeVideoFile();
      if (file.cancelled || (!file.uri && !file.path)) return false;
      setDiscussionAttachments(current => [...current, file].slice(0, 8));
      return true;
    } catch (pickerError) {
      setError(getErrorMessage(pickerError));
      return false;
    }
  }, []);

  const onRemoveDiscussionAttachment = useCallback((index: number) => {
    setDiscussionAttachments(current =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  }, []);

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
        setDeleteTaskTypeConfirmTaskType(null);
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
      taskTypeFormKeyLocked,
      taskTypeFormMode,
      taskTypeFormOpen,
      deleteTaskTypeConfirmTaskType,
      recurringTemplateForm,
      recurringTemplateFormError,
      recurringTemplateFormOpen,
      categoryBucketFilter,
      categoryFilter,
      assignedToFilter,
      projectFilter,
      currentUserId,
      dataSource,
      error,
      form,
      formError,
      formMode,
      formOpen,
      deleteTaskConfirmTask,
      crmContext,
      ratingSummary,
      checklistDraft,
      discussionDraft,
      discussionAttachments,
      noteDraft,
      overtimeEligibilityByTaskId,
      overtimeRequestError,
      overtimeRequestReason,
      overtimeRequestTaskId,
      kpi,
      loading,
      mineOnly,
      canAccess,
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
      recurringBulkForm,
      recurringBulkFormError,
      recurringBulkFormOpen,
      recurringBulkLocations,
      recurringBulkStats,
      route,
      search,
      staffOptions,
      customerOptions,
      projectOptions,
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
      onChangeRecurringBulkForm,
      onChangeRecurringTemplateForm,
      onChangeTaskTypeForm,
      onCloseCategoryForm,
      onCloseDeleteTaskConfirm,
      onCloseDeleteTaskTypeConfirm,
      onCloseForm,
      onCloseRecurringBulkForm,
      onCloseRecurringTemplateForm,
      onCloseTaskTypeForm,
      onCloseOvertimeRequest,
      onBackToList,
      onCreateCategory,
      onCreateNew,
      onCreateRecurringBulkEnrollment,
      onCreateRecurringTemplate,
      onCreateTaskType,
      onDeleteCategory,
      onDeleteTask,
      onDeleteRecurringTemplate,
      onDeleteTaskType,
      onEditCategory,
      onEditTask,
      onEditTaskType,
      onOpenOvertimeRequest,
      onRequestDeleteTask,
      onRequestDeleteTaskType,
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
      onSetProjectFilter: setFilterAndFirstPage(setProjectFilter),
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
      onSaveRecurringBulkEnrollment,
      onSaveRecurringTemplate,
      onSaveTaskType,
      onSetChecklistDraft: setChecklistDraft,
      onPickDiscussionImage,
      onPickDiscussionVideo,
      onRemoveDiscussionAttachment,
      onSetDiscussionDraft: setDiscussionDraft,
      onSetNoteDraft: setNoteDraft,
      onSetOvertimeRequestReason: setOvertimeRequestReason,
      onToggleChecklistItem,
      onRunRecurringTick,
      onSubmitOvertimeRequest,
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
      taskTypeFormKeyLocked,
      taskTypeFormMode,
      taskTypeFormOpen,
      deleteTaskTypeConfirmTaskType,
      recurringTemplateForm,
      recurringTemplateFormError,
      recurringTemplateFormOpen,
      categoryBucketFilter,
      categoryFilter,
      assignedToFilter,
      projectFilter,
      currentUserId,
      dataSource,
      error,
      form,
      formError,
      formMode,
      formOpen,
      deleteTaskConfirmTask,
      crmContext,
      ratingSummary,
      checklistDraft,
      discussionDraft,
      discussionAttachments,
      noteDraft,
      overtimeEligibilityByTaskId,
      overtimeRequestError,
      overtimeRequestReason,
      overtimeRequestTaskId,
      kpi,
      loading,
      mineOnly,
      canAccess,
      isTaskAdmin,
      mode,
      mutatingTaskId,
      onAddChecklistItem,
      onAddDiscussion,
      onAddNote,
      onChangeCategoryForm,
      onChangeForm,
      onChangeRecurringBulkForm,
      onChangeRecurringTemplateForm,
      onChangeTaskTypeForm,
      onCloseCategoryForm,
      onCloseDeleteTaskConfirm,
      onCloseDeleteTaskTypeConfirm,
      onCloseForm,
      onCloseRecurringBulkForm,
      onCloseRecurringTemplateForm,
      onCloseTaskTypeForm,
      onCloseOvertimeRequest,
      onCreateCategory,
      onCreateNew,
      onCreateRecurringBulkEnrollment,
      onCreateRecurringTemplate,
      onCreateTaskType,
      onDeleteCategory,
      onDeleteTask,
      onDeleteRecurringTemplate,
      onDeleteTaskType,
      onEditCategory,
      onEditTask,
      onEditTaskType,
      onOpenOvertimeRequest,
      onRequestDeleteTask,
      onRequestDeleteTaskType,
      onBackToList,
      onResetFilters,
      onRunRecurringTick,
      onSetTaskPriority,
      onSetTaskStatus,
      onRemoveChecklistItem,
      onSaveCategory,
      onSaveForm,
      onSaveRecurringBulkEnrollment,
      onSaveRecurringTemplate,
      onSaveTaskType,
      onSubmitOvertimeRequest,
      onPickDiscussionImage,
      onPickDiscussionVideo,
      onRemoveDiscussionAttachment,
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
      recurringBulkForm,
      recurringBulkFormError,
      recurringBulkFormOpen,
      recurringBulkLocations,
      recurringBulkStats,
      refreshList,
      refreshDetail,
      refreshRecurring,
      route,
      search,
      setFilterAndFirstPage,
      staffOptions,
      customerOptions,
      projectOptions,
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
  projectId = '',
): KolamTaskManagerFormState {
  return {
    assistedById: '',
    categoryId,
    customerId: '',
    description: '',
    dueDate: '',
    dueTime: '',
    priority: 'medium',
    projectId,
    saleId: '',
    complaintId: '',
    conversationId: '',
    assignedToId,
    status: 'todo',
    taskTypeId: '',
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

function getDefaultRecurringBulkEnrollmentForm(): KolamTaskRecurringBulkEnrollmentFormState {
  return {
    active: true,
    allWithPic: true,
    locationId: '',
    taskTypeId: '',
  };
}

function getTaskFormFromTask(
  task: KolamTaskManagerTask,
): KolamTaskManagerFormState {
  const due = splitKolamTaskDueDateTime(task.dueDate);
  return {
    assistedById: getTaskUserId(task.assistedBy),
    categoryId: getTaskCategoryId(task.category),
    customerId: task.customerId,
    description: task.description,
    dueDate: due.date,
    dueTime: due.time,
    priority: task.priority,
    projectId: task.projectId,
    saleId: task.saleId,
    complaintId: task.complaintId,
    conversationId: task.conversationId,
    assignedToId: getTaskUserId(task.assignedTo),
    status: task.status,
    taskTypeId: getTaskTypeId(task.taskType),
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

function getTaskTypeId(value: KolamTaskManagerTask['taskType']) {
  if (!value) return '';
  return typeof value === 'string' ? value : value.id;
}

function getOvertimeCandidateTaskIds(tasks: KolamTaskManagerTask[]) {
  return tasks
    .filter(
      task =>
        Boolean(task.dueDate) &&
        ['todo', 'in_progress', 'needs_review'].includes(task.status),
    )
    .map(task => task.id);
}

function stripHtmlText(value: string) {
  return value.replace(/<[^>]+>/g, '').trim();
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

function mapCustomerOptions(
  customers: Array<{ id: string; name: string; phone?: string; email?: string }>,
): KolamTaskManagerCustomerOption[] {
  return customers.map(customer => ({
    id: customer.id,
    label: customer.name || customer.phone || customer.email || customer.id,
  }));
}

function taskFormShowsCustomerField(form: {
  conversationId?: string;
  projectId?: string;
  saleId?: string;
}) {
  return Boolean(
    form.projectId?.trim() ||
      form.conversationId?.trim() ||
      form.saleId?.trim(),
  );
}

function getErrorMessage(error: unknown) {
  return getApiErrorMessage(error) || 'Gagal memuat Task Manager';
}

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
  deleteKolamTaskManagerCategory,
  getKolamTaskManagerCategories,
  getKolamTaskManagerTask,
  getKolamTaskManagerTasks,
  getKolamTaskRecurringOccurrences,
  getKolamTaskRecurringServiceVisits,
  getKolamTaskRecurringTemplates,
  runKolamTaskRecurringTick,
  updateKolamTaskManagerCategory,
  updateKolamTaskManagerChecklist,
  updateKolamTaskManagerStatus,
  updateKolamTaskManagerTask,
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

export interface KolamTaskManagerController {
  categories: KolamTaskManagerCategory[];
  categoryForm: KolamTaskManagerCategoryFormState;
  categoryFormError: string | null;
  categoryFormMode: 'edit' | 'new';
  categoryFormOpen: boolean;
  categoryBucketFilter: KolamTaskCategoryBucket | 'all';
  categoryFilter: string;
  currentUserId: string;
  dataSource: KolamTaskManagerDataSource;
  error: string | null;
  form: KolamTaskManagerFormState;
  formError: string | null;
  formMode: 'edit' | 'new';
  formOpen: boolean;
  checklistDraft: string;
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
  recurringOccurrences: KolamTaskRecurringOccurrence[];
  recurringServiceVisits: KolamTaskRecurringServiceVisit[];
  recurringTemplates: KolamTaskRecurringTemplate[];
  route: string;
  search: string;
  staffOptions: KolamTaskManagerStaffOption[];
  statusFilter: KolamTaskManagerStatus | 'all';
  statusMessage: string | null;
  selectedTask: KolamTaskManagerTask | null;
  tasks: KolamTaskManagerTask[];
  total: number;
  totalPages: number;
  onAddChecklistItem: () => Promise<boolean>;
  onAddNote: () => Promise<boolean>;
  onChangeCategoryForm: (
    patch: Partial<KolamTaskManagerCategoryFormState>,
  ) => void;
  onChangeForm: (patch: Partial<KolamTaskManagerFormState>) => void;
  onCloseCategoryForm: () => void;
  onCloseForm: () => void;
  onCreateCategory: () => void;
  onCreateNew: () => void;
  onDeleteCategory: (category: KolamTaskManagerCategory) => Promise<boolean>;
  onEditCategory: (category: KolamTaskManagerCategory) => void;
  onEditTask: (task: KolamTaskManagerTask) => void;
  onBackToList: () => void;
  onRefresh: () => Promise<void>;
  onResetFilters: () => void;
  onSelectPage: (page: number) => void;
  onSetCategoryBucketFilter: (value: KolamTaskCategoryBucket | 'all') => void;
  onSetCategoryFilter: (value: string) => void;
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
  onSetChecklistDraft: (value: string) => void;
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
  const [checklistDraft, setChecklistDraft] = useState('');
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

  const refreshRecurring = useCallback(async () => {
    if (mode !== 'recurring') {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [templates, occurrences, serviceVisits] = await Promise.all([
        getKolamTaskRecurringTemplates(),
        getKolamTaskRecurringOccurrences({
          enclosureOnly: isTaskAdmin && recurringEnclosureOnly,
          limit: 100,
          mine: !isTaskAdmin,
          page: 1,
        }),
        getKolamTaskRecurringServiceVisits({ limit: 200 }),
      ]);
      setRecurringTemplates(templates);
      setRecurringOccurrences(occurrences);
      setRecurringServiceVisits(serviceVisits);
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

  return useMemo(
    () => ({
      categories,
      categoryForm,
      categoryFormError,
      categoryFormMode,
      categoryFormOpen,
      categoryBucketFilter,
      categoryFilter,
      currentUserId,
      dataSource,
      error,
      form,
      formError,
      formMode,
      formOpen,
      checklistDraft,
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
      onAddChecklistItem,
      onAddNote,
      onChangeCategoryForm,
      onChangeForm,
      onCloseCategoryForm,
      onCloseForm,
      onBackToList,
      onCreateCategory,
      onCreateNew,
      onDeleteCategory,
      onEditCategory,
      onEditTask,
      onRefresh:
        mode === 'detail'
          ? refreshDetail
          : mode === 'recurring'
            ? refreshRecurring
            : refreshList,
      onResetFilters,
      onSelectPage: setPage,
      onSetCategoryBucketFilter: setFilterAndFirstPage(
        setCategoryBucketFilter,
      ),
      onSetCategoryFilter: setFilterAndFirstPage(setCategoryFilter),
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
      onSetChecklistDraft: setChecklistDraft,
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
      categoryBucketFilter,
      categoryFilter,
      currentUserId,
      dataSource,
      error,
      form,
      formError,
      formMode,
      formOpen,
      checklistDraft,
      noteDraft,
      kpi,
      loading,
      mineOnly,
      isTaskAdmin,
      mode,
      mutatingTaskId,
      onAddChecklistItem,
      onAddNote,
      onChangeCategoryForm,
      onChangeForm,
      onCloseCategoryForm,
      onCloseForm,
      onCreateCategory,
      onCreateNew,
      onDeleteCategory,
      onEditCategory,
      onEditTask,
      onBackToList,
      onResetFilters,
      onRunRecurringTick,
      onSetTaskPriority,
      onSetTaskStatus,
      onRemoveChecklistItem,
      onSaveCategory,
      onSaveForm,
      onToggleChecklistItem,
      onSwitchTab,
      page,
      pageSize,
      priorityFilter,
      recurringEnclosureOnly,
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

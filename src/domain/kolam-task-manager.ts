import type { KolamStatusBadgeIntent } from '../components/kolam-status-badge';

export const KOLAM_TASK_MANAGER_ROOT = '/task-manager';
export const KOLAM_TASK_MANAGER_RECURRING_ROUTE =
  '/task-manager/tugas-terjadwal';
export const KOLAM_TASK_MANAGER_CATEGORY_SETTINGS_ROUTE =
  '/task-manager/settings/categories';
export const KOLAM_TASK_MANAGER_TASK_TYPES_ROUTE =
  '/task-manager/settings/task-types';

export type KolamTaskManagerSurfaceMode =
  | 'categories'
  | 'detail'
  | 'list'
  | 'recurring'
  | 'task-types';

export type KolamTaskManagerStatus =
  | 'todo'
  | 'in_progress'
  | 'needs_review'
  | 'done'
  | 'cancelled';

export type KolamTaskManagerPriority = 'low' | 'medium' | 'high';

export type KolamTaskCategoryBucket =
  | 'enclosure'
  | 'project'
  | 'crm'
  | 'production';

export type KolamTaskManagerSource =
  | 'manual'
  | 'inbox_follow_up'
  | 'recurring';

export type KolamTaskTimelineType =
  | 'assign_change'
  | 'created'
  | 'link_change'
  | 'note'
  | 'status_change'
  | 'updated';

export type KolamTaskRecurrenceType = 'daily' | 'monthly' | 'weekly';
export type KolamTaskRecurringStatus =
  | 'done'
  | 'missed'
  | 'pending'
  | 'skipped';

export interface KolamTaskManagerUserRef {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profilePicture: string;
  displayName: string;
}

export interface KolamTaskManagerCategoryRef {
  id: string;
  name: string;
  color: string;
}

export interface KolamTaskManagerTaskTypeRef {
  id: string;
  key: string;
  name: string;
  handler: string;
}

export type KolamTaskManagerTaskTypeHandler = 'dosing' | 'maintenance';

export interface KolamTaskManagerTaskType {
  id: string;
  key: string;
  name: string;
  description: string;
  handler: KolamTaskManagerTaskTypeHandler;
  requiresProductComponents: boolean;
  active: boolean;
  sortOrder: number;
  isSystem: boolean;
  categoryBuckets: KolamTaskCategoryBucket[];
}

export interface KolamTaskManagerChecklistItem {
  id: string;
  title: string;
  done: boolean;
  assignedTo: string | KolamTaskManagerUserRef | null;
  sortOrder: number;
  doneAt: string;
  doneBy: string | KolamTaskManagerUserRef | null;
}

export interface KolamTaskTimelineItem {
  id: string;
  type: KolamTaskTimelineType | string;
  message: string;
  by: string | KolamTaskManagerUserRef | null;
  at: string;
}

export interface KolamTaskDiscussionAttachment {
  fileName: string;
  mimeType: string;
  path: string;
  type: 'file' | 'image' | 'video';
}

export interface KolamTaskDiscussionMessage {
  id: string;
  sender: string | KolamTaskManagerUserRef | null;
  message: string;
  attachments: KolamTaskDiscussionAttachment[];
  createdAt: string;
}

export interface KolamTaskRecurrenceRule {
  dayOfMonth: number | null;
  daysOfWeek: number[];
  dueHoursAfter: number;
  time: string;
  type: KolamTaskRecurrenceType;
}

export interface KolamTaskRecurringTemplate {
  id: string;
  title: string;
  description: string;
  priority: KolamTaskManagerPriority;
  assignedTo: string | KolamTaskManagerUserRef | null;
  taskType: string | KolamTaskManagerTaskTypeRef | null;
  categoryBucket: KolamTaskCategoryBucket | null;
  sampleReviewPercent: number;
  recurrence: KolamTaskRecurrenceRule;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KolamTaskRecurringOccurrence {
  id: string;
  title: string;
  status: KolamTaskRecurringStatus;
  priority: KolamTaskManagerPriority;
  assignedTo: string | KolamTaskManagerUserRef | null;
  scheduledAt: string;
  dueAt: string;
  categoryLabel: string;
  categoryBucket: KolamTaskCategoryBucket | null;
  taskId: string;
}

export interface KolamTaskRecurringServiceVisit {
  id: string;
  title: string;
  status: KolamTaskRecurringStatus;
  assignedTo: string | KolamTaskManagerUserRef | null;
  scheduledAt: string;
  dueAt: string;
  categoryLabel: string;
  href: string;
  serviceName: string;
  subscriptionNumber: string;
}

export interface KolamTaskManagerTask {
  id: string;
  title: string;
  description: string;
  status: KolamTaskManagerStatus;
  priority: KolamTaskManagerPriority;
  urgent: boolean;
  assignedTo: string | KolamTaskManagerUserRef | null;
  assistedBy: string | KolamTaskManagerUserRef | null;
  source: KolamTaskManagerSource | '';
  category: string | KolamTaskManagerCategoryRef | null;
  categoryBucket: KolamTaskCategoryBucket | null;
  taskType: string | KolamTaskManagerTaskTypeRef | null;
  customerId: string;
  projectId: string;
  enclosureId: string;
  serviceId: string;
  productionId: string;
  saleId: string;
  complaintId: string;
  conversationId: string;
  dueDate: string;
  completedAt: string;
  checklist: KolamTaskManagerChecklistItem[];
  discussion: KolamTaskDiscussionMessage[];
  timeline: KolamTaskTimelineItem[];
  createdBy: string | KolamTaskManagerUserRef | null;
  updatedBy: string | KolamTaskManagerUserRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface KolamTaskManagerCategory {
  id: string;
  name: string;
  color: string;
  bucket: KolamTaskCategoryBucket | null;
  sortOrder: number;
  active: boolean;
}

export interface KolamTaskManagerListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: KolamTaskManagerStatus | 'all';
  priority?: KolamTaskManagerPriority | 'all';
  categoryBucket?: KolamTaskCategoryBucket | 'all';
  categoryId?: string;
  assignedToId?: string;
  mine?: boolean;
}

export interface KolamTaskManagerListResult {
  items: KolamTaskManagerTask[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface KolamTaskManagerKpi {
  done: number;
  inProgress: number;
  overdue: number;
  todo: number;
  total: number;
}

export const KOLAM_TASK_STATUS_OPTIONS: Array<{
  id: KolamTaskManagerStatus | 'all';
  label: string;
}> = [
  { id: 'all', label: 'Status' },
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'Sedang berjalan' },
  { id: 'needs_review', label: 'Butuh diperiksa' },
  { id: 'done', label: 'Selesai' },
  { id: 'cancelled', label: 'Dibatalkan' },
];

export const KOLAM_TASK_PRIORITY_OPTIONS: Array<{
  id: KolamTaskManagerPriority | 'all';
  label: string;
}> = [
  { id: 'all', label: 'Prioritas' },
  { id: 'low', label: 'Rendah' },
  { id: 'medium', label: 'Sedang' },
  { id: 'high', label: 'Tinggi' },
];

export const KOLAM_TASK_CATEGORY_BUCKET_LABEL: Record<
  KolamTaskCategoryBucket,
  string
> = {
  enclosure: 'Enclosure',
  project: 'Proyek / Layanan',
  crm: 'CRM / Chat',
  production: 'Produksi',
};

export const KOLAM_TASK_CATEGORY_BUCKET_OPTIONS: Array<{
  id: KolamTaskCategoryBucket | 'all';
  label: string;
}> = [
  { id: 'all', label: 'Bucket' },
  { id: 'enclosure', label: KOLAM_TASK_CATEGORY_BUCKET_LABEL.enclosure },
  { id: 'project', label: KOLAM_TASK_CATEGORY_BUCKET_LABEL.project },
  { id: 'crm', label: KOLAM_TASK_CATEGORY_BUCKET_LABEL.crm },
  { id: 'production', label: KOLAM_TASK_CATEGORY_BUCKET_LABEL.production },
];

const TASK_STATUS_RANK: Record<KolamTaskManagerStatus, number> = {
  todo: 0,
  in_progress: 1,
  needs_review: 2,
  done: 3,
  cancelled: 3,
};

export function isKolamTaskManagerRoute(route: string) {
  const path = normalizeTaskManagerRoutePath(route);
  return (
    path === KOLAM_TASK_MANAGER_ROOT ||
    path.startsWith(`${KOLAM_TASK_MANAGER_ROOT}/`)
  );
}

export function getKolamTaskManagerRouteMode(
  route: string,
): KolamTaskManagerSurfaceMode {
  const path = normalizeTaskManagerRoutePath(route);
  if (path === KOLAM_TASK_MANAGER_RECURRING_ROUTE) return 'recurring';
  if (path === KOLAM_TASK_MANAGER_CATEGORY_SETTINGS_ROUTE) return 'categories';
  if (path === KOLAM_TASK_MANAGER_TASK_TYPES_ROUTE) return 'task-types';
  if (/^\/task-manager\/[^/]+$/.test(path)) return 'detail';
  return 'list';
}

export function getKolamTaskManagerIdFromRoute(route: string) {
  const path = normalizeTaskManagerRoutePath(route);
  const match = /^\/task-manager\/([^/]+)$/.exec(path);
  if (!match?.[1]) return '';
  return decodeURIComponent(match[1]);
}

export function getKolamTaskStatusLabel(status?: string | null) {
  return (
    KOLAM_TASK_STATUS_OPTIONS.find(option => option.id === status)?.label ??
    status ??
    ''
  );
}

export function getKolamTaskPriorityLabel(priority?: string | null) {
  return (
    KOLAM_TASK_PRIORITY_OPTIONS.find(option => option.id === priority)?.label ??
    priority ??
    ''
  );
}

export function getKolamTaskCategoryBucketLabel(bucket?: string | null) {
  if (!bucket) return '-';
  return (
    KOLAM_TASK_CATEGORY_BUCKET_LABEL[bucket as KolamTaskCategoryBucket] ??
    bucket
  );
}

export function getKolamTaskStatusBadgeIntent(
  status: KolamTaskManagerStatus,
): KolamStatusBadgeIntent {
  switch (status) {
    case 'done':
      return 'success';
    case 'in_progress':
      return 'info';
    case 'needs_review':
      return 'warning';
    case 'cancelled':
      return 'muted';
    case 'todo':
    default:
      return 'primary';
  }
}

export function getKolamTaskPriorityBadgeIntent(
  priority: KolamTaskManagerPriority,
): KolamStatusBadgeIntent {
  switch (priority) {
    case 'high':
      return 'danger';
    case 'medium':
      return 'warning';
    case 'low':
    default:
      return 'muted';
  }
}

export function isKolamTaskOverdue(task: Pick<KolamTaskManagerTask, 'dueDate' | 'status'>) {
  if (!task.dueDate) return false;
  if (task.status === 'done' || task.status === 'cancelled') return false;
  return new Date(task.dueDate).getTime() < Date.now();
}

export function formatKolamTaskListDatetime(input?: string | null) {
  if (!input) return '-';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '-';
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = String(date.getFullYear() % 100).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year}-${hours}:${minutes}`;
}

export function splitKolamTaskDueDateTime(input?: string | null) {
  if (!input) return { date: '', time: '' };
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return { date: '', time: '' };
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return {
    date: `${year}-${month}-${day}`,
    time: hours === '23' && minutes === '59' ? '' : `${hours}:${minutes}`,
  };
}

export function buildKolamTaskDueDateIso(date: string, time?: string) {
  const normalizedDate = date.trim();
  if (!normalizedDate) return null;
  const normalizedTime = time?.trim() || '23:59';
  const parsed = new Date(`${normalizedDate}T${normalizedTime}:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export function getKolamTaskUserDisplayName(
  user: string | KolamTaskManagerUserRef | null | undefined,
) {
  if (!user || typeof user === 'string') return '-';
  return (
    user.displayName ||
    `${user.firstName} ${user.lastName}`.trim() ||
    user.username ||
    user.email ||
    user.id ||
    '-'
  );
}

export function getKolamTaskChecklistProgress(task: KolamTaskManagerTask) {
  const total = task.checklist.length;
  if (!total) return null;
  const done = task.checklist.filter(item => item.done).length;
  return {
    done,
    percent: Math.round((done / total) * 100),
    total,
  };
}

export function getKolamTaskTimelineLabel(type: string) {
  switch (type) {
    case 'created':
      return 'Dibuat';
    case 'status_change':
      return 'Status';
    case 'assign_change':
      return 'Assign / Dibantu';
    case 'note':
      return 'Catatan';
    case 'updated':
      return 'Diperbarui';
    case 'link_change':
      return 'Link';
    default:
      return type || '-';
  }
}

export function getKolamTaskRefId(
  ref: string | { id?: string; _id?: string } | null | undefined,
) {
  if (!ref) return '';
  return typeof ref === 'string' ? ref : ref.id ?? ref._id ?? '';
}

export function canUpgradeKolamTaskStatus(
  from: KolamTaskManagerStatus,
  to: KolamTaskManagerStatus,
  opts?: { allowReviewRevision?: boolean },
) {
  if (from === to) return true;
  if (from === 'done' || from === 'cancelled') return false;
  if (to === 'cancelled') return true;
  if (
    opts?.allowReviewRevision !== false &&
    from === 'needs_review' &&
    to === 'in_progress'
  ) {
    return true;
  }
  return (TASK_STATUS_RANK[to] ?? -1) > (TASK_STATUS_RANK[from] ?? -1);
}

export function getKolamTaskStatusOptionsForUser({
  currentUserId,
  isTaskAdmin,
  task,
}: {
  currentUserId?: string;
  isTaskAdmin: boolean;
  task: KolamTaskManagerTask;
}) {
  const uid = currentUserId || '';
  const isPic = !!uid && getKolamTaskRefId(task.assignedTo) === uid;
  const isCreator = !!uid && getKolamTaskRefId(task.createdBy) === uid;
  const allowReviewRevision = isTaskAdmin || isCreator;

  return KOLAM_TASK_STATUS_OPTIONS.filter(
    (option): option is { id: KolamTaskManagerStatus; label: string } =>
      option.id !== 'all',
  )
    .filter(option => {
      if (isTaskAdmin) return true;
      if (isPic) {
        return option.id === 'in_progress' || option.id === 'needs_review';
      }
      if (isCreator) return option.id !== 'needs_review';
      return false;
    })
    .filter(option =>
      canUpgradeKolamTaskStatus(task.status, option.id, {
        allowReviewRevision,
      }),
    );
}

export function normalizeKolamTaskManagerList(
  payload: unknown,
  fallbackQuery: KolamTaskManagerListQuery = {},
): KolamTaskManagerListResult {
  const record = unwrapData(payload);
  const sourceItems = Array.isArray(record)
    ? record
    : Array.isArray(record.data)
      ? record.data
      : Array.isArray(record.items)
        ? record.items
        : [];
  const pagination = isRecord(record.pagination) ? record.pagination : {};
  const page = toNumber(pagination.page, fallbackQuery.page ?? 1);
  const pageSize = toNumber(
    pagination.limit ?? pagination.pageSize,
    fallbackQuery.limit ?? 10,
  );
  const total = toNumber(pagination.total, sourceItems.length);
  const totalPages = Math.max(
    1,
    toNumber(pagination.totalPages, Math.ceil(total / Math.max(1, pageSize))),
  );

  return {
    items: sourceItems.map(normalizeKolamTaskManagerTask),
    page,
    pageSize,
    total,
    totalPages,
  };
}

export function normalizeKolamTaskManagerTask(payload: unknown): KolamTaskManagerTask {
  const record = unwrapData(payload);
  return {
    id: toStringValue(record._id ?? record.id),
    title: toStringValue(record.title),
    description: toStringValue(record.description),
    status: toTaskStatus(record.status),
    priority: toTaskPriority(record.priority),
    urgent: Boolean(record.urgent),
    assignedTo: normalizeUserRef(record.assignedTo),
    assistedBy: normalizeUserRef(record.assistedBy),
    source: toTaskSource(record.source),
    category: normalizeCategoryRef(record.category),
    categoryBucket: toTaskCategoryBucket(record.categoryBucket),
    taskType: normalizeTaskTypeRef(record.taskType),
    customerId: getLooseRefId(record.customer ?? record.customerId),
    projectId: getLooseRefId(record.project ?? record.projectId),
    enclosureId: getLooseRefId(record.enclosure ?? record.enclosureId),
    serviceId: getLooseRefId(record.service ?? record.serviceId),
    productionId: getLooseRefId(record.production ?? record.productionId),
    saleId: getLooseRefId(record.sale ?? record.saleId),
    complaintId: getLooseRefId(record.complaint ?? record.complaintId),
    conversationId: getLooseRefId(record.conversation ?? record.conversationId),
    dueDate: toStringValue(record.dueDate),
    completedAt: toStringValue(record.completedAt),
    checklist: Array.isArray(record.checklist)
      ? record.checklist.map(normalizeChecklistItem)
      : [],
    discussion: Array.isArray(record.discussion)
      ? record.discussion.map(normalizeDiscussionMessage)
      : [],
    timeline: Array.isArray(record.timeline)
      ? record.timeline.map(normalizeTimelineItem)
      : [],
    createdBy: normalizeUserRef(record.createdBy),
    updatedBy: normalizeUserRef(record.updatedBy),
    createdAt: toStringValue(record.createdAt),
    updatedAt: toStringValue(record.updatedAt),
  };
}

function normalizeDiscussionMessage(
  payload: unknown,
): KolamTaskDiscussionMessage {
  const record = unwrapData(payload);
  return {
    id: toStringValue(record._id ?? record.id),
    sender: normalizeUserRef(record.sender),
    message: toStringValue(record.message),
    attachments: Array.isArray(record.attachments)
      ? record.attachments.map(normalizeDiscussionAttachment)
      : [],
    createdAt: toStringValue(record.createdAt),
  };
}

function normalizeDiscussionAttachment(
  payload: unknown,
): KolamTaskDiscussionAttachment {
  const record = unwrapData(payload);
  const type =
    record.type === 'video' || record.type === 'file' ? record.type : 'image';
  return {
    fileName: toStringValue(record.fileName),
    mimeType: toStringValue(record.mimeType),
    path: toStringValue(record.path),
    type,
  };
}

function normalizeTimelineItem(payload: unknown): KolamTaskTimelineItem {
  const record = unwrapData(payload);
  return {
    id: toStringValue(record._id ?? record.id),
    type: toStringValue(record.type),
    message: toStringValue(record.message),
    by: normalizeUserRef(record.by),
    at: toStringValue(record.at),
  };
}

export function normalizeKolamTaskManagerCategories(
  payload: unknown,
): KolamTaskManagerCategory[] {
  const record = unwrapData(payload);
  const items = Array.isArray(record)
    ? record
    : Array.isArray(record.data)
      ? record.data
      : Array.isArray(record.items)
        ? record.items
        : toStringValue(record._id ?? record.id)
          ? [record]
          : [];
  return items.map(item => {
    const row = unwrapData(item);
    return {
      id: toStringValue(row._id ?? row.id),
      name: toStringValue(row.name),
      color: toStringValue(row.color) || '#6366f1',
      bucket: toTaskCategoryBucket(row.bucket ?? row.categoryBucket),
      sortOrder: toNumber(row.sortOrder, 0),
      active: row.active !== false && row.isActive !== false,
    };
  });
}

export function normalizeKolamTaskManagerTaskTypes(
  payload: unknown,
): KolamTaskManagerTaskType[] {
  return unwrapArrayPayload(payload).map(item => {
    const row = unwrapData(item);
    return {
      id: toStringValue(row._id ?? row.id),
      key: toStringValue(row.key),
      name: toStringValue(row.name),
      description: toStringValue(row.description),
      handler: row.handler === 'maintenance' ? 'maintenance' : 'dosing',
      requiresProductComponents: row.requiresProductComponents === true,
      active: row.active !== false,
      sortOrder: toNumber(row.sortOrder, 100),
      isSystem: row.isSystem === true,
      categoryBuckets: Array.isArray(row.categoryBuckets)
        ? row.categoryBuckets
            .map(toTaskCategoryBucket)
            .filter((bucket): bucket is KolamTaskCategoryBucket =>
              Boolean(bucket),
            )
        : [],
    };
  });
}

export function normalizeKolamTaskRecurringTemplates(
  payload: unknown,
): KolamTaskRecurringTemplate[] {
  return unwrapArrayPayload(payload).map(item => {
    const row = unwrapData(item);
    return {
      id: toStringValue(row._id ?? row.id),
      title: toStringValue(row.title),
      description: toStringValue(row.description),
      priority: toTaskPriority(row.priority),
      assignedTo: normalizeUserRef(row.assignedTo),
      taskType: normalizeTaskTypeRef(row.taskType),
      categoryBucket: toTaskCategoryBucket(row.categoryBucket),
      sampleReviewPercent: toNumber(row.sampleReviewPercent, 0),
      recurrence: normalizeRecurrenceRule(row.recurrence),
      active: row.active !== false,
      createdAt: toStringValue(row.createdAt),
      updatedAt: toStringValue(row.updatedAt),
    };
  });
}

export function normalizeKolamTaskRecurringOccurrences(
  payload: unknown,
): KolamTaskRecurringOccurrence[] {
  return unwrapArrayPayload(payload).map(item => {
    const row = unwrapData(item);
    return {
      id: toStringValue(row._id ?? row.id),
      title: toStringValue(row.title),
      status: toRecurringStatus(row.status),
      priority: toTaskPriority(row.priority),
      assignedTo: normalizeUserRef(row.assignedTo),
      scheduledAt: toStringValue(row.scheduledAt),
      dueAt: toStringValue(row.dueAt),
      categoryLabel: toStringValue(row.categoryLabel),
      categoryBucket: toTaskCategoryBucket(row.categoryBucket),
      taskId: getLooseRefId(row.task),
    };
  });
}

export function normalizeKolamTaskRecurringServiceVisits(
  payload: unknown,
): KolamTaskRecurringServiceVisit[] {
  return unwrapArrayPayload(payload).map(item => {
    const row = unwrapData(item);
    return {
      id: toStringValue(row._id ?? row.id),
      title: toStringValue(row.visitTitle ?? row.title),
      status: toRecurringStatus(row.status),
      assignedTo: normalizeUserRef(row.assignedTo),
      scheduledAt: toStringValue(row.scheduledAt),
      dueAt: toStringValue(row.dueAt),
      categoryLabel: toStringValue(row.categoryLabel),
      href: toStringValue(row.href),
      serviceName: toStringValue(row.serviceName),
      subscriptionNumber: toStringValue(row.subscriptionNumber),
    };
  });
}

export function buildKolamTaskManagerKpi(
  total: number,
  todo: number,
  inProgress: number,
  done: number,
  pool: KolamTaskManagerTask[],
): KolamTaskManagerKpi {
  return {
    done,
    inProgress,
    overdue: pool.filter(isKolamTaskOverdue).length,
    todo,
    total,
  };
}

function normalizeTaskManagerRoutePath(route: string) {
  return route.split('?')[0].replace(/\/+$/, '') || '/';
}

function normalizeChecklistItem(payload: unknown): KolamTaskManagerChecklistItem {
  const record = unwrapData(payload);
  return {
    id: toStringValue(record._id ?? record.id),
    title: toStringValue(record.title),
    done: Boolean(record.done),
    assignedTo: normalizeUserRef(record.assignedTo),
    sortOrder: toNumber(record.sortOrder, 0),
    doneAt: toStringValue(record.doneAt),
    doneBy: normalizeUserRef(record.doneBy),
  };
}

function normalizeRecurrenceRule(value: unknown): KolamTaskRecurrenceRule {
  const record = unwrapData(value);
  const type =
    record.type === 'weekly' || record.type === 'monthly' ? record.type : 'daily';
  return {
    dayOfMonth:
      record.dayOfMonth == null ? null : toNumber(record.dayOfMonth, 1),
    daysOfWeek: Array.isArray(record.daysOfWeek)
      ? record.daysOfWeek.map(day => toNumber(day, 0))
      : [],
    dueHoursAfter: toNumber(record.dueHoursAfter, 24),
    time: toStringValue(record.time) || '09:00',
    type,
  };
}

function normalizeUserRef(
  value: unknown,
): string | KolamTaskManagerUserRef | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (!isRecord(value)) return null;
  const id = toStringValue(value._id ?? value.id);
  if (!id) return null;
  const firstName = toStringValue(value.first_name ?? value.firstName);
  const lastName = toStringValue(value.last_name ?? value.lastName);
  const username = toStringValue(value.username);
  const email = toStringValue(value.email);
  const displayName =
    toStringValue(value.displayName ?? value.name) ||
    `${firstName} ${lastName}`.trim() ||
    username ||
    email ||
    id;
  return {
    id,
    firstName,
    lastName,
    username,
    email,
    profilePicture: toStringValue(value.profile_picture ?? value.profilePicture),
    displayName,
  };
}

function normalizeCategoryRef(
  value: unknown,
): string | KolamTaskManagerCategoryRef | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (!isRecord(value)) return null;
  const id = toStringValue(value._id ?? value.id);
  if (!id) return null;
  return {
    id,
    name: toStringValue(value.name),
    color: toStringValue(value.color) || '#6366f1',
  };
}

function normalizeTaskTypeRef(
  value: unknown,
): string | KolamTaskManagerTaskTypeRef | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (!isRecord(value)) return null;
  const id = toStringValue(value._id ?? value.id);
  if (!id) return null;
  return {
    id,
    key: toStringValue(value.key),
    name: toStringValue(value.name),
    handler: toStringValue(value.handler),
  };
}

function getLooseRefId(value: unknown) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (!isRecord(value)) return '';
  return toStringValue(value._id ?? value.id);
}

function toTaskStatus(value: unknown): KolamTaskManagerStatus {
  return isTaskStatus(value) ? value : 'todo';
}

function toTaskPriority(value: unknown): KolamTaskManagerPriority {
  return value === 'low' || value === 'high' ? value : 'medium';
}

function toTaskCategoryBucket(value: unknown): KolamTaskCategoryBucket | null {
  if (
    value === 'enclosure' ||
    value === 'project' ||
    value === 'crm' ||
    value === 'production'
  ) {
    return value;
  }
  return null;
}

function toTaskSource(value: unknown): KolamTaskManagerSource | '' {
  if (
    value === 'manual' ||
    value === 'inbox_follow_up' ||
    value === 'recurring'
  ) {
    return value;
  }
  return '';
}

function toRecurringStatus(value: unknown): KolamTaskRecurringStatus {
  if (
    value === 'done' ||
    value === 'missed' ||
    value === 'pending' ||
    value === 'skipped'
  ) {
    return value;
  }
  return 'pending';
}

function isTaskStatus(value: unknown): value is KolamTaskManagerStatus {
  return (
    value === 'todo' ||
    value === 'in_progress' ||
    value === 'needs_review' ||
    value === 'done' ||
    value === 'cancelled'
  );
}

function unwrapData(payload: unknown): Record<string, unknown> {
  if (!isRecord(payload)) return {};
  if (isRecord(payload.data) && !Array.isArray(payload.data)) {
    return payload.data;
  }
  return payload;
}

function unwrapArrayPayload(payload: unknown): unknown[] {
  const record = unwrapData(payload);
  if (Array.isArray(record)) return record;
  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.items)) return record.items;
  if (toStringValue(record._id ?? record.id)) return [record];
  return [];
}

function toStringValue(value: unknown) {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function toNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object');
}

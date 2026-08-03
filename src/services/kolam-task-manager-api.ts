import { appConfig } from '../config/app';
import {
  normalizeKolamTaskManagerCategories,
  normalizeKolamTaskManagerList,
  normalizeKolamTaskManagerTask,
  normalizeKolamTaskManagerTaskTypes,
  normalizeKolamTaskCustomerCrmContext,
  normalizeKolamTaskRecurringBulkEnrollmentResult,
  normalizeKolamTaskRecurringOccurrences,
  normalizeKolamTaskRecurringEnrollmentCompliance,
  normalizeKolamTaskRecurringEnrollmentDashboard,
  normalizeKolamTaskRecurringEnrollmentStats,
  normalizeKolamTaskRecurringServiceVisits,
  normalizeKolamTaskRecurringTemplates,
  type KolamTaskManagerCategory,
  type KolamTaskManagerChecklistItem,
  type KolamTaskManagerListQuery,
  type KolamTaskManagerListResult,
  type KolamTaskManagerPriority,
  type KolamTaskManagerStatus,
  type KolamTaskManagerTask,
  type KolamTaskManagerTaskType,
  type KolamTaskManagerTaskTypeHandler,
  type KolamTaskCustomerCrmContext,
  type KolamTaskRecurringBulkEnrollmentResult,
  type KolamTaskRecurringOccurrence,
  type KolamTaskRecurringEnrollmentCompliance,
  type KolamTaskRecurringEnrollmentDashboard,
  type KolamTaskRecurringEnrollmentStats,
  type KolamTaskRecurringServiceVisit,
  type KolamTaskRecurringTemplate,
} from '../domain/kolam-task-manager';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export interface KolamTaskManagerTaskInput {
  title: string;
  description?: string;
  status?: KolamTaskManagerStatus;
  priority?: KolamTaskManagerPriority;
  urgent?: boolean;
  assignedToId: string;
  assistedById?: string | null;
  dueDate: string | null;
  customerId?: string | null;
  projectId?: string | null;
  categoryId: string;
  taskTypeId?: string | null;
  saleId?: string | null;
  complaintId?: string | null;
  conversationId?: string | null;
}

export interface KolamTaskManagerDiscussionFileInput {
  extension?: string;
  mimeType?: string;
  name?: string;
  path?: string;
  uri?: string;
}

export interface KolamTaskManagerCategoryInput {
  active?: boolean;
  color: string;
  name: string;
  sortOrder: number;
}

export interface KolamTaskManagerTaskTypeInput {
  active: boolean;
  categoryBuckets: string[];
  description?: string | null;
  handler: KolamTaskManagerTaskTypeHandler;
  key?: string;
  name: string;
  requiresProductComponents: boolean;
  sortOrder: number;
}

export interface KolamTaskRecurringTemplateInput {
  active?: boolean;
  assignedToId: string;
  dayOfMonth?: number | null;
  daysOfWeek?: number[];
  description?: string;
  dueHoursAfter?: number;
  priority?: KolamTaskManagerPriority;
  recurrenceType: 'daily' | 'monthly' | 'weekly';
  sampleReviewPercent?: number;
  taskTypeId?: string | null;
  time: string;
  title: string;
}

export interface KolamTaskRecurringBulkEnrollmentInput {
  active: boolean;
  allWithPic?: boolean;
  assignedToId?: string | null;
  enclosureIds?: string[];
  locationId?: string | null;
  taskTypeId: string;
}

export async function getKolamTaskManagerTasks(
  query: KolamTaskManagerListQuery = {},
): Promise<KolamTaskManagerListResult> {
  const payload = await kolamRequest<unknown>('/task-manager', {
    query: {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      ...(query.search?.trim() ? { search: query.search.trim() } : {}),
      ...(query.status && query.status !== 'all' ? { status: query.status } : {}),
      ...(query.priority && query.priority !== 'all'
        ? { priority: query.priority }
        : {}),
      ...(query.categoryBucket && query.categoryBucket !== 'all'
        ? { categoryBucket: query.categoryBucket }
        : {}),
      ...(query.categoryId?.trim() ? { categoryId: query.categoryId.trim() } : {}),
      ...(query.assignedToId?.trim()
        ? { assignedToId: query.assignedToId.trim() }
        : {}),
      ...(query.projectId?.trim() ? { projectId: query.projectId.trim() } : {}),
      ...(query.mine ? { mine: true } : {}),
    },
  });
  return normalizeKolamTaskManagerList(payload, query);
}

export async function getKolamTaskManagerTask(
  taskId: string,
): Promise<KolamTaskManagerTask> {
  const payload = await kolamRequest<unknown>(
    `/task-manager/${encodeURIComponent(taskId)}`,
  );
  return normalizeKolamTaskManagerTask(payload);
}

export async function getKolamTaskManagerCrmContext(
  taskId: string,
): Promise<KolamTaskCustomerCrmContext> {
  const payload = await kolamRequest<unknown>(
    `/task-manager/${encodeURIComponent(taskId)}/crm-context`,
  );
  return normalizeKolamTaskCustomerCrmContext(payload);
}

export async function getKolamTaskManagerCategories(
  activeOnly = true,
): Promise<KolamTaskManagerCategory[]> {
  const payload = await kolamRequest<unknown>('/task-manager/categories', {
    query: activeOnly ? { active: true } : {},
  });
  return normalizeKolamTaskManagerCategories(payload);
}

export async function createKolamTaskManagerCategory(
  input: KolamTaskManagerCategoryInput,
): Promise<KolamTaskManagerCategory> {
  const payload = await kolamRequest<unknown>('/task-manager/categories', {
    method: 'POST',
    body: normalizeCategoryInput(input),
  });
  return normalizeKolamTaskManagerCategories(payload)[0];
}

export async function updateKolamTaskManagerCategory(
  categoryId: string,
  input: Partial<KolamTaskManagerCategoryInput>,
): Promise<KolamTaskManagerCategory> {
  const payload = await kolamRequest<unknown>(
    `/task-manager/categories/${encodeURIComponent(categoryId)}`,
    {
      method: 'PATCH',
      body: normalizeCategoryInput(input),
    },
  );
  return normalizeKolamTaskManagerCategories(payload)[0];
}

export async function deleteKolamTaskManagerCategory(categoryId: string) {
  await kolamRequest<unknown>(
    `/task-manager/categories/${encodeURIComponent(categoryId)}`,
    { method: 'DELETE' },
  );
}

export async function getKolamTaskManagerTaskTypes(
  includeInactive = true,
): Promise<KolamTaskManagerTaskType[]> {
  const payload = await kolamRequest<unknown>('/enclosure-task-types', {
    query: includeInactive ? { includeInactive: true } : {},
  });
  return normalizeKolamTaskManagerTaskTypes(payload);
}

export async function createKolamTaskManagerTaskType(
  input: KolamTaskManagerTaskTypeInput,
): Promise<KolamTaskManagerTaskType> {
  const payload = await kolamRequest<unknown>('/enclosure-task-types', {
    method: 'POST',
    body: normalizeTaskTypeInput(input),
  });
  return normalizeKolamTaskManagerTaskTypes(payload)[0];
}

export async function updateKolamTaskManagerTaskType(
  taskTypeId: string,
  input: Partial<KolamTaskManagerTaskTypeInput>,
): Promise<KolamTaskManagerTaskType> {
  const payload = await kolamRequest<unknown>(
    `/enclosure-task-types/${encodeURIComponent(taskTypeId)}`,
    {
      method: 'PUT',
      body: normalizeTaskTypeInput(input),
    },
  );
  return normalizeKolamTaskManagerTaskTypes(payload)[0];
}

export async function deleteKolamTaskManagerTaskType(taskTypeId: string) {
  await kolamRequest<unknown>(
    `/enclosure-task-types/${encodeURIComponent(taskTypeId)}`,
    { method: 'DELETE' },
  );
}

export async function getKolamTaskRecurringTemplates(): Promise<
  KolamTaskRecurringTemplate[]
> {
  const payload = await kolamRequest<unknown>(
    '/task-manager/recurring/templates',
    { query: { active: true } },
  );
  return normalizeKolamTaskRecurringTemplates(payload);
}

export async function createKolamTaskRecurringTemplate(
  input: KolamTaskRecurringTemplateInput,
): Promise<KolamTaskRecurringTemplate> {
  const payload = await kolamRequest<unknown>(
    '/task-manager/recurring/templates',
    {
      method: 'POST',
      body: normalizeRecurringTemplateInput(input),
    },
  );
  return normalizeKolamTaskRecurringTemplates(payload)[0];
}

export async function deleteKolamTaskRecurringTemplate(templateId: string) {
  await kolamRequest<unknown>(
    `/task-manager/recurring/templates/${encodeURIComponent(templateId)}`,
    { method: 'DELETE' },
  );
}

export async function getKolamTaskRecurringOccurrences(
  query: {
    enclosureOnly?: boolean;
    limit?: number;
    mine?: boolean;
    page?: number;
  } = {},
): Promise<KolamTaskRecurringOccurrence[]> {
  const payload = await kolamRequest<unknown>(
    '/task-manager/recurring/occurrences',
    {
      query: {
        page: query.page ?? 1,
        limit: query.limit ?? 100,
        ...(query.mine ? { mine: true } : {}),
        ...(query.enclosureOnly ? { enclosureOnly: true } : {}),
      },
    },
  );
  return normalizeKolamTaskRecurringOccurrences(payload);
}

export async function getKolamTaskRecurringServiceVisits(
  query: { limit?: number } = {},
): Promise<KolamTaskRecurringServiceVisit[]> {
  const payload = await kolamRequest<unknown>(
    '/task-manager/recurring/service-visits',
    { query: { limit: query.limit ?? 200 } },
  );
  return normalizeKolamTaskRecurringServiceVisits(payload);
}

export async function getKolamTaskRecurringEnrollmentDashboard(): Promise<
  KolamTaskRecurringEnrollmentDashboard
> {
  const payload = await kolamRequest<unknown>(
    '/task-manager/recurring/enrollment-dashboard',
  );
  return normalizeKolamTaskRecurringEnrollmentDashboard(payload);
}

export async function getKolamTaskRecurringEnrollmentCompliance(
  query: { days?: number } = {},
): Promise<KolamTaskRecurringEnrollmentCompliance> {
  const payload = await kolamRequest<unknown>(
    '/task-manager/recurring/enrollment-compliance',
    { query: { days: query.days ?? 30 } },
  );
  return normalizeKolamTaskRecurringEnrollmentCompliance(payload);
}

export async function getKolamTaskRecurringEnrollmentStats(
  taskTypeId: string,
): Promise<KolamTaskRecurringEnrollmentStats> {
  const payload = await kolamRequest<unknown>(
    '/task-manager/recurring/enrollment-stats',
    { query: { taskTypeId } },
  );
  return normalizeKolamTaskRecurringEnrollmentStats(payload);
}

export async function bulkSetKolamTaskRecurringEnrollment(
  input: KolamTaskRecurringBulkEnrollmentInput,
): Promise<KolamTaskRecurringBulkEnrollmentResult> {
  const payload = await kolamRequest<unknown>(
    '/task-manager/recurring/enrollment-bulk',
    {
      method: 'POST',
      body: {
        taskTypeId: input.taskTypeId.trim(),
        active: input.active,
        ...(input.enclosureIds?.length
          ? { enclosureIds: input.enclosureIds }
          : {}),
        ...(input.allWithPic ? { allWithPic: true } : {}),
        ...(input.locationId?.trim() ? { locationId: input.locationId.trim() } : {}),
        ...(input.assignedToId?.trim()
          ? { assignedToId: input.assignedToId.trim() }
          : {}),
      },
    },
  );
  return normalizeKolamTaskRecurringBulkEnrollmentResult(payload);
}

export async function runKolamTaskRecurringTick(): Promise<void> {
  await kolamRequest<unknown>('/task-manager/recurring/run-tick', {
    method: 'POST',
  });
}

export async function createKolamTaskManagerTask(
  input: KolamTaskManagerTaskInput,
): Promise<KolamTaskManagerTask> {
  const payload = await kolamRequest<unknown>('/task-manager', {
    method: 'POST',
    body: normalizeTaskInput(input),
  });
  return normalizeKolamTaskManagerTask(payload);
}

export async function updateKolamTaskManagerTask(
  taskId: string,
  input: Partial<KolamTaskManagerTaskInput>,
): Promise<KolamTaskManagerTask> {
  const payload = await kolamRequest<unknown>(
    `/task-manager/${encodeURIComponent(taskId)}`,
    {
      method: 'PATCH',
      body: normalizeTaskInput(input),
    },
  );
  return normalizeKolamTaskManagerTask(payload);
}

export async function updateKolamTaskManagerStatus(
  taskId: string,
  status: KolamTaskManagerStatus,
): Promise<KolamTaskManagerTask> {
  const payload = await kolamRequest<unknown>(
    `/task-manager/${encodeURIComponent(taskId)}/status`,
    {
      method: 'PATCH',
      body: { status },
    },
  );
  return normalizeKolamTaskManagerTask(payload);
}

export async function updateKolamTaskManagerChecklist(
  taskId: string,
  checklist: KolamTaskManagerChecklistItem[],
): Promise<KolamTaskManagerTask> {
  const payload = await kolamRequest<unknown>(
    `/task-manager/${encodeURIComponent(taskId)}/checklist`,
    {
      method: 'PATCH',
      body: {
        checklist: checklist.map((item, index) => ({
          title: item.title,
          done: item.done,
          assignedToId: getTaskRefId(item.assignedTo),
          sortOrder: item.sortOrder ?? index,
          doneAt: item.doneAt || null,
          doneById: getTaskRefId(item.doneBy),
        })),
      },
    },
  );
  return normalizeKolamTaskManagerTask(payload);
}

export async function addKolamTaskManagerNote(
  taskId: string,
  note: string,
): Promise<KolamTaskManagerTask> {
  const payload = await kolamRequest<unknown>(
    `/task-manager/${encodeURIComponent(taskId)}/notes`,
    {
      method: 'POST',
      body: { note: note.trim() },
    },
  );
  return normalizeKolamTaskManagerTask(payload);
}

export async function sendKolamTaskManagerDiscussion(
  taskId: string,
  message: string,
  files: KolamTaskManagerDiscussionFileInput[] = [],
): Promise<KolamTaskManagerTask> {
  const normalizedFiles = files.filter(file => file.uri || file.path);
  const body =
    normalizedFiles.length > 0
      ? createTaskDiscussionFormData(message, normalizedFiles)
      : { message: message.trim() };
  const payload = await kolamRequest<unknown>(
    `/task-manager/${encodeURIComponent(taskId)}/discussion`,
    {
      method: 'POST',
      body,
    },
  );
  return normalizeKolamTaskManagerTask(payload);
}

export async function deleteKolamTaskManagerTask(taskId: string) {
  await kolamRequest<unknown>(`/task-manager/${encodeURIComponent(taskId)}`, {
    method: 'DELETE',
  });
}

function getTaskRefId(value: unknown) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value != null && 'id' in value) {
    const id = (value as { id?: unknown }).id;
    return typeof id === 'string' ? id : null;
  }
  return null;
}

function normalizeCategoryInput(input: Partial<KolamTaskManagerCategoryInput>) {
  return {
    ...(input.name != null ? { name: input.name.trim() } : {}),
    ...(input.color != null ? { color: input.color.trim() } : {}),
    ...(input.sortOrder != null ? { sortOrder: Number(input.sortOrder) || 0 } : {}),
    ...(input.active != null ? { isActive: input.active } : {}),
  };
}

function normalizeTaskTypeInput(input: Partial<KolamTaskManagerTaskTypeInput>) {
  return {
    ...(input.key != null ? { key: input.key.trim().toLowerCase() } : {}),
    ...(input.name != null ? { name: input.name.trim() } : {}),
    ...(input.description !== undefined
      ? { description: input.description?.trim() || null }
      : {}),
    ...(input.handler ? { handler: input.handler } : {}),
    ...(input.requiresProductComponents != null
      ? { requiresProductComponents: input.requiresProductComponents }
      : {}),
    ...(input.active != null ? { active: input.active } : {}),
    ...(input.sortOrder != null ? { sortOrder: Number(input.sortOrder) || 100 } : {}),
    ...(input.categoryBuckets != null
      ? { categoryBuckets: input.categoryBuckets }
      : {}),
  };
}

function normalizeRecurringTemplateInput(input: KolamTaskRecurringTemplateInput) {
  return {
    title: input.title.trim(),
    description: input.description?.trim() ?? '',
    priority: input.priority ?? 'medium',
    assignedToId: input.assignedToId.trim(),
    taskTypeId: input.taskTypeId?.trim() || undefined,
    sampleReviewPercent: input.taskTypeId
      ? Math.min(100, Math.max(0, Number(input.sampleReviewPercent) || 0))
      : undefined,
    recurrence: {
      type: input.recurrenceType,
      ...(input.recurrenceType === 'weekly'
        ? { daysOfWeek: input.daysOfWeek?.length ? input.daysOfWeek : [1, 2, 3, 4, 5] }
        : {}),
      ...(input.recurrenceType === 'monthly'
        ? { dayOfMonth: Number(input.dayOfMonth) || 1 }
        : {}),
      time: input.time.trim() || '09:00',
      dueHoursAfter: Number(input.dueHoursAfter) || 24,
    },
    ...(input.active != null ? { active: input.active } : {}),
  };
}

function normalizeTaskInput(input: Partial<KolamTaskManagerTaskInput>) {
  return {
    ...(input.title != null ? { title: input.title.trim() } : {}),
    ...(input.description != null
      ? { description: input.description.trim() }
      : {}),
    ...(input.status ? { status: input.status } : {}),
    ...(input.priority ? { priority: input.priority } : {}),
    ...(input.urgent != null ? { urgent: input.urgent } : {}),
    ...(input.assignedToId != null
      ? { assignedToId: input.assignedToId.trim() }
      : {}),
    ...(input.assistedById !== undefined
      ? { assistedById: input.assistedById?.trim() || null }
      : {}),
    ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
    ...(input.customerId !== undefined
      ? { customerId: input.customerId?.trim() || null }
      : {}),
    ...(input.projectId !== undefined
      ? { projectId: input.projectId?.trim() || null }
      : {}),
    ...(input.categoryId != null ? { categoryId: input.categoryId.trim() } : {}),
    ...(input.taskTypeId !== undefined
      ? { taskTypeId: input.taskTypeId?.trim() || null }
      : {}),
    ...(input.saleId !== undefined
      ? { saleId: input.saleId?.trim() || null }
      : {}),
    ...(input.complaintId !== undefined
      ? { complaintId: input.complaintId?.trim() || null }
      : {}),
    ...(input.conversationId !== undefined
      ? { conversationId: input.conversationId?.trim() || null }
      : {}),
  };
}

function createTaskDiscussionFormData(
  message: string,
  files: KolamTaskManagerDiscussionFileInput[],
) {
  const formData = new FormData();
  formData.append('message', message.trim() || '<p></p>');
  files.slice(0, 8).forEach((file, index) => {
    const localUri = file.uri || file.path;
    if (!localUri) return;
    formData.append(
      'files',
      createReactNativeFilePart(
        localUri,
        file.name || `task-discussion-${index + 1}`,
        file.mimeType,
      ) as unknown as Blob,
    );
  });
  return formData;
}

function createReactNativeFilePart(
  localUri: string,
  fallbackName: string,
  mimeType?: string,
) {
  const normalizedUri = localUri.startsWith('file://')
    ? localUri
    : `file:///${localUri.replace(/\\/g, '/')}`;
  const name = normalizedUri.split('/').pop() || fallbackName;

  return {
    uri: normalizedUri,
    name,
    type: mimeType || inferFileMimeType(name),
  };
}

function inferFileMimeType(name: string) {
  const extension = name.split('.').pop()?.toLowerCase();
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  if (extension === 'gif') return 'image/gif';
  if (extension === 'mp4') return 'video/mp4';
  if (extension === 'webm') return 'video/webm';
  if (extension === 'mov') return 'video/quicktime';
  return 'image/jpeg';
}

function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    query?: Record<string, string | number | boolean | undefined | null>;
  } = {},
) {
  return apiRequest<T | DataResponse<T>>({
    method: options.method ?? 'GET',
    path,
    body: options.body,
    query: options.query,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  }) as Promise<T>;
}

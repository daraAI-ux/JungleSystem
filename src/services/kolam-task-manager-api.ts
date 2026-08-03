import { appConfig } from '../config/app';
import {
  normalizeKolamTaskManagerCategories,
  normalizeKolamTaskManagerList,
  normalizeKolamTaskManagerTask,
  normalizeKolamTaskRecurringOccurrences,
  normalizeKolamTaskRecurringServiceVisits,
  normalizeKolamTaskRecurringTemplates,
  type KolamTaskManagerCategory,
  type KolamTaskManagerListQuery,
  type KolamTaskManagerListResult,
  type KolamTaskManagerPriority,
  type KolamTaskManagerStatus,
  type KolamTaskManagerTask,
  type KolamTaskRecurringOccurrence,
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

export async function getKolamTaskManagerCategories(
  activeOnly = true,
): Promise<KolamTaskManagerCategory[]> {
  const payload = await kolamRequest<unknown>('/task-manager/categories', {
    query: activeOnly ? { active: true } : {},
  });
  return normalizeKolamTaskManagerCategories(payload);
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

export async function deleteKolamTaskManagerTask(taskId: string) {
  await kolamRequest<unknown>(`/task-manager/${encodeURIComponent(taskId)}`, {
    method: 'DELETE',
  });
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

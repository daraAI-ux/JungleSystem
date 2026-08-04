import { appConfig } from '../config/app';
import {
  normalizeKolamReceivable,
  normalizeKolamReceivableList,
  normalizeKolamReceivableSummary,
  type KolamReceivable,
  type KolamReceivableListFilters,
  type KolamReceivableListResult,
  type KolamReceivableSummaryData,
} from '../domain/kolam-receivable';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export type KolamReceivableListQuery = Pick<
  KolamReceivableListFilters,
  'page' | 'limit' | 'search' | 'status' | 'sourceModel' | 'overdue'
>;

export async function fetchKolamReceivables(
  query: Partial<KolamReceivableListQuery> = {},
): Promise<KolamReceivableListResult> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const payload = await kolamRequest<unknown>('/receivable', {
    query: {
      page,
      limit,
      ...(query.search?.trim() ? { search: query.search.trim() } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.sourceModel ? { sourceModel: query.sourceModel } : {}),
      ...(query.overdue ? { overdue: 'true' } : {}),
    },
  });
  return normalizeKolamReceivableList(payload, { page, limit });
}

export async function fetchKolamReceivableSummary(): Promise<KolamReceivableSummaryData> {
  const payload = await kolamRequest<unknown>('/receivable/summary');
  return normalizeKolamReceivableSummary(payload);
}

export async function markKolamReceivablePaid(
  id: string,
): Promise<KolamReceivable> {
  const payload = await kolamRequest<unknown>(
    `/receivable/${encodeURIComponent(id)}/mark-paid`,
    { method: 'PUT' },
  );
  return normalizeKolamReceivable(unwrapData(payload));
}

function unwrapData(payload: unknown): unknown {
  const record =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : null;
  if (record && 'data' in record && record.data != null) {
    return record.data;
  }
  return payload;
}

function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    query?: Record<string, string | number | boolean | undefined | null>;
    body?: unknown;
  } = {},
) {
  return apiRequest<T | DataResponse<T>>({
    method: options.method ?? 'GET',
    path,
    query: options.query,
    body: options.body,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  }) as Promise<T>;
}

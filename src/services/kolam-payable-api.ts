import { appConfig } from '../config/app';
import {
  normalizeKolamPayable,
  normalizeKolamPayableList,
  normalizeKolamPayableSummary,
  type KolamPayable,
  type KolamPayableListFilters,
  type KolamPayableListResult,
  type KolamPayableSummaryData,
} from '../domain/kolam-payable';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export type KolamPayableListQuery = Pick<
  KolamPayableListFilters,
  'page' | 'limit' | 'search' | 'status' | 'sourceModel' | 'overdue'
>;

export async function fetchKolamPayables(
  query: Partial<KolamPayableListQuery> = {},
): Promise<KolamPayableListResult> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const payload = await kolamRequest<unknown>('/payable', {
    query: {
      page,
      limit,
      ...(query.search?.trim() ? { search: query.search.trim() } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.sourceModel ? { sourceModel: query.sourceModel } : {}),
      ...(query.overdue ? { overdue: 'true' } : {}),
    },
  });
  return normalizeKolamPayableList(payload, { page, limit });
}

export async function fetchKolamPayableSummary(): Promise<KolamPayableSummaryData> {
  const payload = await kolamRequest<unknown>('/payable/summary');
  return normalizeKolamPayableSummary(payload);
}

export async function payKolamPayableFull(id: string): Promise<KolamPayable> {
  const payload = await kolamRequest<unknown>(
    `/payable/${encodeURIComponent(id)}/pay-full`,
    { method: 'PUT' },
  );
  return normalizeKolamPayable(unwrapData(payload));
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

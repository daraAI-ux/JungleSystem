import { appConfig } from '../config/app';
import {
  normalizeKolamComplaintDetail,
  normalizeKolamComplaintList,
  type KolamComplaint,
  type KolamComplaintListQuery,
  type KolamComplaintListResult,
} from '../domain/kolam-complaint';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export async function getKolamComplaints(
  query: KolamComplaintListQuery = {},
): Promise<KolamComplaintListResult> {
  const payload = await kolamRequest<unknown>('/complaints', {
    query: {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      ...(query.search?.trim() ? { search: query.search.trim() } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.decision ? { decision: query.decision } : {}),
      ...(query.source ? { source: query.source } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.customProject ? { customProject: '1' } : {}),
    },
  });
  return normalizeKolamComplaintList(payload, query);
}

export async function getKolamComplaint(id: string): Promise<KolamComplaint> {
  const payload = await kolamRequest<unknown>(
    `/complaints/${encodeURIComponent(id)}`,
  );
  return normalizeKolamComplaintDetail(payload);
}

function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    query?: Record<string, string | number | boolean | undefined>;
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

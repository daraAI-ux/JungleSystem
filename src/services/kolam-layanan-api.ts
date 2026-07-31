import { appConfig } from '../config/app';
import {
  normalizeKolamLayananServiceList,
  type KolamLayananServiceListQuery,
  type KolamLayananServiceListResult,
} from '../domain/kolam-layanan';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export async function getKolamLayananServices(
  query: KolamLayananServiceListQuery = {},
): Promise<KolamLayananServiceListResult> {
  const payload = await kolamRequest<unknown>('/service', {
    query: {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      ...(query.search?.trim() ? { search: query.search.trim() } : {}),
      ...(query.sortBy ? { sortBy: query.sortBy } : {}),
      ...(query.sortOrder ? { sortOrder: query.sortOrder } : {}),
      ...(typeof query.sellable === 'boolean'
        ? { sellable: query.sellable }
        : {}),
    },
  });
  return normalizeKolamLayananServiceList(payload, query);
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

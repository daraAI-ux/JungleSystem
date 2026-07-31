import { appConfig } from '../config/app';
import {
  normalizeKolamLayananOpsDashboard,
  normalizeKolamLayananPendingList,
  normalizeKolamLayananServiceList,
  normalizeKolamLayananSubscriptionList,
  type KolamLayananOpsDashboard,
  type KolamLayananPendingListQuery,
  type KolamLayananPendingListResult,
  type KolamLayananServiceListQuery,
  type KolamLayananServiceListResult,
  type KolamLayananSubscriptionListQuery,
  type KolamLayananSubscriptionListResult,
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

export async function getKolamLayananOpsDashboard(): Promise<KolamLayananOpsDashboard> {
  const payload = await kolamRequest<unknown>('/service-ops/dashboard');
  return normalizeKolamLayananOpsDashboard(payload);
}

export async function getKolamLayananPendingServices(
  query: KolamLayananPendingListQuery = {},
): Promise<KolamLayananPendingListResult> {
  const payload = await kolamRequest<unknown>('/pending-services', {
    query: {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      ...(query.status ? { status: query.status } : {}),
      ...(query.statuses ? { statuses: query.statuses } : {}),
      ...(query.search?.trim() ? { search: query.search.trim() } : {}),
    },
  });
  return normalizeKolamLayananPendingList(payload, query);
}

export async function getKolamLayananSubscriptions(
  query: KolamLayananSubscriptionListQuery = {},
): Promise<KolamLayananSubscriptionListResult> {
  const payload = await kolamRequest<unknown>('/subscriptions', {
    query: {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      ...(query.search?.trim() ? { search: query.search.trim() } : {}),
      ...(query.status && query.status !== 'all'
        ? { status: query.status }
        : {}),
    },
  });
  return normalizeKolamLayananSubscriptionList(payload, query);
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

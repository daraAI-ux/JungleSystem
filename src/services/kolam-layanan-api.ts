import { appConfig } from '../config/app';
import {
  normalizeKolamLayananOpsDashboard,
  normalizeKolamLayananPendingList,
  normalizeKolamLayananService,
  normalizeKolamLayananServiceList,
  normalizeKolamLayananSubscriptionList,
  type KolamLayananOpsDashboard,
  type KolamLayananPendingListQuery,
  type KolamLayananPendingListResult,
  type KolamLayananService,
  type KolamLayananServiceListQuery,
  type KolamLayananServiceListResult,
  type KolamLayananServiceSavePayload,
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

export async function getKolamLayananService(
  id: string,
): Promise<KolamLayananService> {
  const payload = await kolamRequest<unknown>(
    `/service/${encodeURIComponent(id)}`,
  );
  return normalizeKolamLayananService(payload);
}

export async function createKolamLayananService(
  body: KolamLayananServiceSavePayload,
): Promise<KolamLayananService> {
  const payload = await kolamRequest<unknown>('/service', {
    method: 'POST',
    body,
  });
  return normalizeKolamLayananService(payload);
}

export async function updateKolamLayananService(
  id: string,
  body: KolamLayananServiceSavePayload,
): Promise<KolamLayananService> {
  const payload = await kolamRequest<unknown>(
    `/service/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body,
    },
  );
  return normalizeKolamLayananService(payload);
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

import { appConfig } from '../config/app';
import type {
  KolamSale,
  KolamSaleListFilters,
  KolamSaleListResult,
} from '../domain/kolam-sales';
import {
  normalizeKolamSale,
  normalizeKolamSaleList,
} from '../domain/kolam-sales';
import { apiRequest } from '../lib/api-client';

/**
 * Staff Kolam sales API (`/api/sales`).
 * P0 batch 1: list + detail read only.
 */
export async function getKolamSalesList(
  filters: KolamSaleListFilters,
): Promise<KolamSaleListResult> {
  const query: Record<string, string | number | boolean | undefined> = {
    page: filters.page,
    limit: filters.limit,
  };

  if (filters.search.trim()) {
    query.search = filters.search.trim();
  }
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.deliveryStatus) {
    query.deliveryStatus = filters.deliveryStatus;
  }
  if (filters.needsAction) {
    query.needsAction = true;
  } else if (filters.lifecycle) {
    query.lifecycle = filters.lifecycle;
  }
  if (filters.startDate.trim()) {
    query.startDate = filters.startDate.trim();
  }
  if (filters.endDate.trim()) {
    query.endDate = filters.endDate.trim();
  }

  const payload = await kolamRequest<unknown>('/sales', { query });
  return normalizeKolamSaleList(payload);
}

export async function getKolamSale(id: string): Promise<KolamSale> {
  const payload = await kolamRequest<unknown>(
    `/sales/${encodeURIComponent(id)}`,
  );
  const row =
    payload && typeof payload === 'object' && 'data' in (payload as object)
      ? (payload as { data: unknown }).data
      : payload;
  return normalizeKolamSale(row);
}

function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    query?: Record<string, string | number | boolean | undefined | null>;
    body?: unknown;
  } = {},
) {
  return apiRequest<T>({
    method: options.method ?? 'GET',
    path,
    query: options.query,
    body: options.body,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });
}

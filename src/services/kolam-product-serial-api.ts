import { appConfig } from '../config/app';
import type {
  KolamProductSerialListFilters,
  KolamProductSerialListResult,
  KolamProductSerialOpnameResult,
} from '../domain/kolam-product-serial';
import {
  normalizeKolamProductSerialList,
  normalizeKolamProductSerialOpnameResult,
} from '../domain/kolam-product-serial';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export async function getKolamProductSerialList(
  filters: KolamProductSerialListFilters,
): Promise<KolamProductSerialListResult> {
  const response = await kolamRequest<unknown>('/product-serials', {
    query: {
      page: filters.page,
      limit: filters.limit,
      sort: 'createdAt:desc',
      search: filters.search.trim() || undefined,
      productType: filters.productType || undefined,
      status: filters.status || undefined,
      productId: filters.productId.trim() || undefined,
    },
  });
  return normalizeKolamProductSerialList(response);
}

export async function submitKolamProductSerialOpname(
  serialNumber: string,
): Promise<KolamProductSerialOpnameResult> {
  const response = await kolamRequest<unknown>('/product-serials/opname', {
    method: 'POST',
    body: { serialNumber: serialNumber.trim().toUpperCase() },
  });
  return normalizeKolamProductSerialOpnameResult(response);
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

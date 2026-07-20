import { appConfig } from '../config/app';
import {
  normalizeKolamVendorList,
  type KolamVendor,
} from '../domain/kolam-vendor';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export async function getKolamVendors(): Promise<KolamVendor[]> {
  const response = await kolamRequest<unknown>('/vendor', {
    query: {
      limit: 1000,
      page: 1,
    },
  });

  return normalizeKolamVendorList(response);
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
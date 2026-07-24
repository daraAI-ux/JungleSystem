import { appConfig } from '../config/app';
import {
  normalizeKolamProductOptionList,
  type KolamProductOption,
} from '../domain/kolam-product-option';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export async function getKolamProductOptions(): Promise<KolamProductOption[]> {
  const response = await kolamRequest<unknown>('/products', {
    query: {
      limit: 1000,
      page: 1,
    },
  });

  return normalizeKolamProductOptionList(response);
}

export async function getKolamRawProductOptions(): Promise<KolamProductOption[]> {
  const response = await kolamRequest<unknown>('/products', {
    query: {
      limit: 1000,
      page: 1,
      type: 'raw',
    },
  });

  return normalizeKolamProductOptionList(response);
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

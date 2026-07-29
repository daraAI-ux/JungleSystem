import {appConfig} from '../config/app';
import {
  normalizeKolamCustomerListResult,
  type KolamCustomerListQuery,
  type KolamCustomerListResult,
} from '../domain/kolam-customer';
import {apiRequest} from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export async function getKolamCustomerList({
  limit = 10,
  page = 1,
  search,
}: KolamCustomerListQuery = {}): Promise<KolamCustomerListResult> {
  const response = await kolamRequest<unknown>('/customer', {
    query: {
      limit,
      page,
      ...(search?.trim() ? {search: search.trim()} : {}),
    },
  });

  return normalizeKolamCustomerListResult(response, {limit, page});
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

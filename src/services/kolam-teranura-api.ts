import { appConfig } from '../config/app';
import {
  normalizeKolamTeranuraList,
  type KolamTeranuraListResult,
  type KolamTeranuraSortBy,
  type KolamTeranuraSortOrder,
} from '../domain/kolam-teranura';
import { apiRequest } from '../lib/api-client';

type QueryValue = string | number | boolean | string[] | undefined | null;

interface DataResponse<T> {
  data: T;
}

export interface GetKolamTeranurasOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string | string[];
  brand?: string | string[];
  sellable?: boolean | string;
  sortBy?: KolamTeranuraSortBy | string;
  sortOrder?: KolamTeranuraSortOrder;
  includeAllLines?: boolean;
}

export async function getKolamTeranuras(
  options: GetKolamTeranurasOptions = {},
): Promise<KolamTeranuraListResult> {
  const response = await kolamRequest<unknown>('/teranura', {
    query: createTeranuraQuery(options),
  });

  return normalizeKolamTeranuraList(response);
}

function createTeranuraQuery(
  options: GetKolamTeranurasOptions,
): Record<string, QueryValue> {
  return {
    page: options.page,
    limit: options.limit,
    search: options.search || undefined,
    category: options.category,
    brand: options.brand,
    sellable: options.sellable,
    sortBy: options.sortBy,
    sortOrder: options.sortOrder,
    includeAllLines: options.includeAllLines ?? true,
  };
}

function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    query?: Record<string, QueryValue>;
    body?: unknown;
    headers?: Record<string, string>;
  } = {},
) {
  return apiRequest<T | DataResponse<T>>({
    method: options.method ?? 'GET',
    path,
    query: options.query,
    body: options.body,
    headers: options.headers,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  }) as Promise<T>;
}

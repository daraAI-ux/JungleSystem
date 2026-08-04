import { appConfig } from '../config/app';
import {
  normalizeKolamBonusList,
  type KolamBonusListFilters,
  type KolamBonusListRow,
} from '../domain/kolam-bonus';
import { apiRequest } from '../lib/api-client';

export async function fetchKolamBonusList(
  filters: Pick<KolamBonusListFilters, 'year' | 'month' | 'status'>,
): Promise<KolamBonusListRow[]> {
  const query: Record<string, string | number> = {};
  if (filters.year) {
    query.year = filters.year;
  }
  if (filters.month) {
    query.month = filters.month;
  }
  if (filters.status.trim()) {
    query.status = filters.status.trim();
  }
  const payload = await kolamRequest<unknown>('/salary/bonus', { query });
  return normalizeKolamBonusList(payload);
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

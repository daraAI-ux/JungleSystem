import { appConfig } from '../config/app';
import {
  normalizeKolamBonusList,
  normalizeKolamBonusRow,
  type KolamBonusCreateBody,
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

export async function createKolamBonus(
  body: KolamBonusCreateBody,
): Promise<KolamBonusListRow | null> {
  const payload = await kolamRequest<unknown>('/salary/bonus', {
    method: 'POST',
    body: {
      userId: body.userId,
      amount: body.amount,
      ...(body.reason?.trim() ? { reason: body.reason.trim() } : {}),
    },
  });
  return normalizeKolamBonusRow(payload);
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

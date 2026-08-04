import { appConfig } from '../config/app';
import {
  normalizeKolamCommissionList,
  type KolamCommissionListFilters,
  type KolamCommissionListResult,
} from '../domain/kolam-commission';
import { apiRequest } from '../lib/api-client';

export async function fetchKolamCommissionList(
  filters: Pick<
    KolamCommissionListFilters,
    'search' | 'status' | 'page' | 'limit'
  >,
): Promise<KolamCommissionListResult> {
  const query: Record<string, string | number> = {
    page: filters.page,
    limit: filters.limit,
  };
  if (filters.search.trim()) {
    query.search = filters.search.trim();
  }
  if (filters.status !== 'all') {
    query.status = filters.status;
  }

  const payload = await kolamRequest<unknown>('/commission', { query });
  return normalizeKolamCommissionList(payload);
}

export async function releaseKolamCommission(
  id: string,
  walletFrom: string,
  note?: string,
): Promise<void> {
  await kolamRequest(`/commission/${encodeURIComponent(id)}/release`, {
    method: 'POST',
    body: {
      walletFrom,
      ...(note?.trim() ? { note: note.trim() } : {}),
    },
  });
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

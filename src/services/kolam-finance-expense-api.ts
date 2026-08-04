import { appConfig } from '../config/app';
import {
  getKolamFinanceExpenseApiSegment,
  normalizeKolamFinanceExpenseList,
  type KolamFinanceExpenseKind,
  type KolamFinanceExpenseListFilters,
  type KolamFinanceExpenseListResult,
} from '../domain/kolam-finance-expense';
import { apiRequest } from '../lib/api-client';

export async function fetchKolamFinanceExpenseList(
  kind: KolamFinanceExpenseKind,
  filters: Pick<
    KolamFinanceExpenseListFilters,
    'search' | 'status' | 'page' | 'limit'
  >,
): Promise<KolamFinanceExpenseListResult> {
  const segment = getKolamFinanceExpenseApiSegment(kind);
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

  const payload = await kolamRequest<unknown>(`/${segment}`, { query });
  return normalizeKolamFinanceExpenseList(payload, kind);
}

export async function verifyKolamFinanceExpense(
  kind: KolamFinanceExpenseKind,
  id: string,
): Promise<void> {
  const segment = getKolamFinanceExpenseApiSegment(kind);
  await kolamRequest(`/${segment}/${encodeURIComponent(id)}/verify`, {
    method: 'PUT',
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

import {appConfig} from '../config/app';
import {
  normalizeKolamDaraSeoBrands,
  normalizeKolamDaraSeoBulkActionResults,
  normalizeKolamDaraSeoDashboard,
  normalizeKolamDaraSeoPendingSuggestions,
  normalizeKolamDaraSeoStatus,
  normalizeKolamDaraSeoSuggestionDetail,
  normalizeKolamDaraSeoSuggestions,
  type KolamDaraSeoBrand,
  type KolamDaraSeoBulkActionResult,
  type KolamDaraSeoDashboard,
  type KolamDaraSeoPendingSuggestion,
  type KolamDaraSeoStatus,
  type KolamDaraSeoSuggestion,
  type KolamDaraSeoSuggestionDetail,
  type KolamDaraSeoTargetType,
} from '../domain/kolam-dara-seo';
import {apiRequest} from '../lib/api-client';

type QueryValue = string | number | boolean | undefined | null;

interface DataResponse<T> {
  data: T;
}

/** GET /dara-seo/status */
export async function fetchKolamDaraSeoStatus(): Promise<KolamDaraSeoStatus> {
  const payload = await kolamRequest<unknown>('/dara-seo/status');
  return normalizeKolamDaraSeoStatus(payload);
}

/** GET /dara-seo/active-brands */
export async function fetchKolamDaraSeoActiveBrands(): Promise<{
  brands: KolamDaraSeoBrand[];
  defaultBrandId: string;
}> {
  const payload = await kolamRequest<unknown>('/dara-seo/active-brands');
  return normalizeKolamDaraSeoBrands(payload);
}

/** GET /dara-seo/dashboard */
export async function fetchKolamDaraSeoDashboard(
  brandId?: string,
): Promise<KolamDaraSeoDashboard> {
  const payload = await kolamRequest<unknown>('/dara-seo/dashboard', {
    query:
      brandId && brandId !== 'all' ? {brandId} : undefined,
  });
  const dash = normalizeKolamDaraSeoDashboard(payload);
  if (!dash) {
    throw new Error('Dashboard DARA SEO kosong');
  }
  return dash;
}

/** GET /dara-seo/suggestions?status=pending_approval */
export async function fetchKolamDaraSeoPendingSuggestions(
  brandId?: string,
  limit = 10,
): Promise<KolamDaraSeoPendingSuggestion[]> {
  const payload = await kolamRequest<unknown>('/dara-seo/suggestions', {
    query: {
      status: 'pending_approval',
      limit,
      ...(brandId && brandId !== 'all' ? {brandId} : {}),
    },
  });
  return normalizeKolamDaraSeoPendingSuggestions(payload);
}

/** GET /dara-seo/suggestions — FE `fetchSeoSuggestions`. */
export async function fetchKolamDaraSeoSuggestions(params?: {
  status?: string;
  targetType?: KolamDaraSeoTargetType | 'all';
  page?: number;
  limit?: number;
  brandId?: string;
}): Promise<{items: KolamDaraSeoSuggestion[]; total: number}> {
  const payload = await kolamRequest<unknown>('/dara-seo/suggestions', {
    query: {
      ...(params?.status ? {status: params.status} : {}),
      ...(params?.targetType && params.targetType !== 'all'
        ? {targetType: params.targetType}
        : {}),
      ...(params?.page != null ? {page: params.page} : {}),
      ...(params?.limit != null ? {limit: params.limit} : {}),
      ...(params?.brandId && params.brandId !== 'all'
        ? {brandId: params.brandId}
        : {}),
    },
  });
  const items = normalizeKolamDaraSeoSuggestions(payload);
  const root =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {};
  const data =
    root.data && typeof root.data === 'object' && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root;
  const total =
    typeof data.total === 'number' && Number.isFinite(data.total)
      ? data.total
      : items.length;
  return {items, total};
}

/** GET /dara-seo/suggestions/:id — FE `fetchSeoSuggestion`. */
export async function fetchKolamDaraSeoSuggestion(
  id: string,
): Promise<KolamDaraSeoSuggestionDetail> {
  const payload = await kolamRequest<unknown>(
    `/dara-seo/suggestions/${encodeURIComponent(id)}`,
  );
  const detail = normalizeKolamDaraSeoSuggestionDetail(payload);
  if (!detail) {
    throw new Error('Detail usulan SEO tidak ditemukan');
  }
  return detail;
}

/** POST /dara-seo/suggestions/:id/submit */
export async function submitKolamDaraSeoSuggestion(id: string) {
  await kolamRequest(`/dara-seo/suggestions/${encodeURIComponent(id)}/submit`, {
    method: 'POST',
  });
}

/** POST /dara-seo/suggestions/:id/approve */
export async function approveKolamDaraSeoSuggestion(
  id: string,
  body?: {itemIds?: string[]; note?: string},
) {
  await kolamRequest(
    `/dara-seo/suggestions/${encodeURIComponent(id)}/approve`,
    {
      method: 'POST',
      body,
    },
  );
}

/** POST /dara-seo/suggestions/:id/reject */
export async function rejectKolamDaraSeoSuggestion(
  id: string,
  note?: string,
) {
  await kolamRequest(
    `/dara-seo/suggestions/${encodeURIComponent(id)}/reject`,
    {
      method: 'POST',
      body: {note},
    },
  );
}

/** POST /dara-seo/suggestions/:id/defer */
export async function deferKolamDaraSeoSuggestion(
  id: string,
  note?: string,
) {
  await kolamRequest(
    `/dara-seo/suggestions/${encodeURIComponent(id)}/defer`,
    {
      method: 'POST',
      body: {note},
    },
  );
}

/** POST /dara-seo/suggestions/:id/rollback */
export async function rollbackKolamDaraSeoSuggestion(id: string) {
  await kolamRequest(
    `/dara-seo/suggestions/${encodeURIComponent(id)}/rollback`,
    {
      method: 'POST',
    },
  );
}

/** POST /dara-seo/suggestions/bulk-approve */
export async function bulkApproveKolamDaraSeoSuggestions(
  suggestionIds: string[],
  note?: string,
): Promise<KolamDaraSeoBulkActionResult[]> {
  const payload = await kolamRequest<unknown>(
    '/dara-seo/suggestions/bulk-approve',
    {
      method: 'POST',
      body: {suggestionIds, note},
    },
  );
  return normalizeKolamDaraSeoBulkActionResults(payload);
}

/** POST /dara-seo/suggestions/bulk-reject */
export async function bulkRejectKolamDaraSeoSuggestions(
  suggestionIds: string[],
  note?: string,
): Promise<KolamDaraSeoBulkActionResult[]> {
  const payload = await kolamRequest<unknown>(
    '/dara-seo/suggestions/bulk-reject',
    {
      method: 'POST',
      body: {suggestionIds, note},
    },
  );
  return normalizeKolamDaraSeoBulkActionResults(payload);
}

function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    query?: Record<string, QueryValue>;
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

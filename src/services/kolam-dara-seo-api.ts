import {appConfig} from '../config/app';
import {
  normalizeKolamDaraSeoBrands,
  normalizeKolamDaraSeoDashboard,
  normalizeKolamDaraSeoPendingSuggestions,
  normalizeKolamDaraSeoStatus,
  type KolamDaraSeoBrand,
  type KolamDaraSeoDashboard,
  type KolamDaraSeoPendingSuggestion,
  type KolamDaraSeoStatus,
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

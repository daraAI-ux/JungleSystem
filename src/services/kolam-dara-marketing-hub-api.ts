import {appConfig} from '../config/app';
import {
  normalizeKolamDaraMarketingHub,
  type KolamDaraMarketingHubSummary,
} from '../domain/kolam-pusat-ai';
import {apiRequest} from '../lib/api-client';

type QueryValue = string | number | boolean | undefined | null;

interface DataResponse<T> {
  data: T;
}

/** GET /dara-seo/marketing-hub — FE `fetchMarketingHub`. */
export async function fetchKolamDaraMarketingHub(
  brandId?: string,
): Promise<KolamDaraMarketingHubSummary> {
  const payload = await kolamRequest<unknown>('/dara-seo/marketing-hub', {
    query:
      brandId && brandId !== 'all'
        ? {brandId}
        : undefined,
  });
  return normalizeKolamDaraMarketingHub(payload);
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

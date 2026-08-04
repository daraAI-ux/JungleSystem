import {appConfig} from '../config/app';
import {
  normalizeKolamDaraMarketIntelBrands,
  normalizeKolamDaraMarketIntelDashboard,
  normalizeKolamDaraMarketIntelStatus,
  type KolamDaraMarketIntelBrand,
  type KolamDaraMarketIntelDashboard,
  type KolamDaraMarketIntelStatus,
} from '../domain/kolam-dara-market-intel';
import {apiRequest} from '../lib/api-client';

type QueryValue = string | number | boolean | undefined | null;

interface DataResponse<T> {
  data: T;
}

/** GET /dara-market-intel/status */
export async function fetchKolamDaraMarketIntelStatus(): Promise<KolamDaraMarketIntelStatus> {
  const payload = await kolamRequest<unknown>('/dara-market-intel/status');
  return normalizeKolamDaraMarketIntelStatus(payload);
}

/** GET /dara-market-intel/active-brands */
export async function fetchKolamDaraMarketIntelActiveBrands(): Promise<{
  brands: KolamDaraMarketIntelBrand[];
  defaultBrandId: string;
}> {
  const payload = await kolamRequest<unknown>(
    '/dara-market-intel/active-brands',
  );
  return normalizeKolamDaraMarketIntelBrands(payload);
}

/** GET /dara-market-intel/dashboard */
export async function fetchKolamDaraMarketIntelDashboard(
  brandId?: string,
): Promise<KolamDaraMarketIntelDashboard> {
  const payload = await kolamRequest<unknown>('/dara-market-intel/dashboard', {
    query:
      brandId && brandId !== 'all' ? {brandId} : undefined,
  });
  const dash = normalizeKolamDaraMarketIntelDashboard(payload);
  if (!dash) {
    throw new Error('Dashboard Intel Pasar kosong');
  }
  return dash;
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
  });
}

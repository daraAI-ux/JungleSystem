import {
  normalizeKolamDaraTaxDashboard,
  normalizeKolamDaraTaxOverviewSeries,
  type KolamDaraTaxDashboard,
  type KolamDaraTaxOverviewSeries,
} from '../domain/kolam-dara-tax';
import type {KolamDaraTaxPeriod} from '../domain/kolam-finance-tax';
import {appConfig} from '../config/app';
import {apiRequest} from '../lib/api-client';

type QueryValue = string | number | boolean | undefined | null;

interface DataResponse<T> {
  data: T;
}

/** GET /dara-tax/dashboard?period= */
export async function fetchKolamDaraTaxDashboard(
  period: KolamDaraTaxPeriod = 'month',
): Promise<KolamDaraTaxDashboard> {
  const payload = await kolamRequest<unknown>('/dara-tax/dashboard', {
    query: {period},
  });
  return normalizeKolamDaraTaxDashboard(payload);
}

/** GET /dara-tax/overview-series?months= */
export async function fetchKolamDaraTaxOverviewSeries(
  months = 6,
): Promise<KolamDaraTaxOverviewSeries> {
  const payload = await kolamRequest<unknown>('/dara-tax/overview-series', {
    query: {months},
  });
  return normalizeKolamDaraTaxOverviewSeries(payload);
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

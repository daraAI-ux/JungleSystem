import {
  normalizeKolamDaraTaxAllocationBySource,
  normalizeKolamDaraTaxDashboard,
  normalizeKolamDaraTaxJournalPreview,
  normalizeKolamDaraTaxMissingFakturPos,
  normalizeKolamDaraTaxMissingFakturSales,
  normalizeKolamDaraTaxOverviewSeries,
  normalizeKolamDaraTaxSptPpnMasaPreview,
  type KolamDaraTaxAllocationBySource,
  type KolamDaraTaxDashboard,
  type KolamDaraTaxJournalPreview,
  type KolamDaraTaxMissingFakturPo,
  type KolamDaraTaxMissingFakturSale,
  type KolamDaraTaxOverviewSeries,
  type KolamDaraTaxSptPpnMasaPreview,
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

/** GET /dara-tax/allocation/by-source?period= */
export async function fetchKolamDaraTaxAllocationBySource(
  period: KolamDaraTaxPeriod = 'month',
): Promise<KolamDaraTaxAllocationBySource> {
  const payload = await kolamRequest<unknown>('/dara-tax/allocation/by-source', {
    query: {period},
  });
  return normalizeKolamDaraTaxAllocationBySource(payload);
}

/** GET /dara-tax/journal/preview?period= */
export async function fetchKolamDaraTaxJournalPreview(
  period: KolamDaraTaxPeriod = 'month',
): Promise<KolamDaraTaxJournalPreview> {
  const payload = await kolamRequest<unknown>('/dara-tax/journal/preview', {
    query: {period},
  });
  return normalizeKolamDaraTaxJournalPreview(payload);
}

/** GET /dara-tax/spt/ppn-masa/preview?period= */
export async function fetchKolamDaraTaxSptPpnMasaPreview(
  period: KolamDaraTaxPeriod = 'month',
): Promise<KolamDaraTaxSptPpnMasaPreview> {
  const payload = await kolamRequest<unknown>('/dara-tax/spt/ppn-masa/preview', {
    query: {period},
  });
  return normalizeKolamDaraTaxSptPpnMasaPreview(payload);
}

/** GET /dara-tax/faktur-pajak/sales-missing?limit= */
export async function fetchKolamDaraTaxSalesMissingFaktur(
  limit = 15,
): Promise<KolamDaraTaxMissingFakturSale[]> {
  const payload = await kolamRequest<unknown>(
    '/dara-tax/faktur-pajak/sales-missing',
    {query: {limit}},
  );
  return normalizeKolamDaraTaxMissingFakturSales(payload);
}

/** GET /dara-tax/faktur-pajak/po-missing?limit= */
export async function fetchKolamDaraTaxPoMissingFaktur(
  limit = 15,
): Promise<KolamDaraTaxMissingFakturPo[]> {
  const payload = await kolamRequest<unknown>(
    '/dara-tax/faktur-pajak/po-missing',
    {query: {limit}},
  );
  return normalizeKolamDaraTaxMissingFakturPos(payload);
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

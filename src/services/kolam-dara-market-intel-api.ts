import {appConfig} from '../config/app';
import {
  normalizeKolamDaraMarketIntelBrands,
  normalizeKolamDaraMarketIntelBulkActionResults,
  normalizeKolamDaraMarketIntelCompetitorBaseline,
  normalizeKolamDaraMarketIntelCompetitorFetchResult,
  normalizeKolamDaraMarketIntelCompetitorLinks,
  normalizeKolamDaraMarketIntelDashboard,
  normalizeKolamDaraMarketIntelRecommendation,
  normalizeKolamDaraMarketIntelRecommendations,
  normalizeKolamDaraMarketIntelStatus,
  normalizeKolamDaraMarketIntelStoreHealthScan,
  type KolamDaraMarketIntelBrand,
  type KolamDaraMarketIntelBulkActionResult,
  type KolamDaraMarketIntelCompetitorBaseline,
  type KolamDaraMarketIntelCompetitorFetchResult,
  type KolamDaraMarketIntelCompetitorLink,
  type KolamDaraMarketIntelDashboard,
  type KolamDaraMarketIntelRecommendation,
  type KolamDaraMarketIntelStatus,
  type KolamDaraMarketIntelStoreHealthScan,
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

/** GET /dara-market-intel/recommendations — FE `fetchMarketRecommendations`. */
export async function fetchKolamDaraMarketIntelRecommendations(params?: {
  status?: string;
  brandId?: string;
  category?: string;
  limit?: number;
  page?: number;
}): Promise<{items: KolamDaraMarketIntelRecommendation[]; total: number}> {
  const payload = await kolamRequest<unknown>(
    '/dara-market-intel/recommendations',
    {
      query: {
        ...(params?.status ? {status: params.status} : {}),
        ...(params?.category ? {category: params.category} : {}),
        ...(params?.limit != null ? {limit: params.limit} : {}),
        ...(params?.page != null ? {page: params.page} : {}),
        ...(params?.brandId && params.brandId !== 'all'
          ? {brandId: params.brandId}
          : {}),
      },
    },
  );
  return normalizeKolamDaraMarketIntelRecommendations(payload);
}

/** GET /dara-market-intel/recommendations/:id */
export async function fetchKolamDaraMarketIntelRecommendation(
  id: string,
): Promise<KolamDaraMarketIntelRecommendation> {
  const payload = await kolamRequest<unknown>(
    `/dara-market-intel/recommendations/${encodeURIComponent(id)}`,
  );
  const item = normalizeKolamDaraMarketIntelRecommendation(payload);
  if (!item) {
    throw new Error('Rekomendasi tidak ditemukan');
  }
  return item;
}

/** POST /dara-market-intel/recommendations/:id/approve */
export async function approveKolamDaraMarketIntelRecommendation(
  id: string,
  note?: string,
) {
  await kolamRequest(
    `/dara-market-intel/recommendations/${encodeURIComponent(id)}/approve`,
    {
      method: 'POST',
      body: note != null && note.trim() ? {note} : {},
    },
  );
}

/** POST /dara-market-intel/recommendations/:id/reject */
export async function rejectKolamDaraMarketIntelRecommendation(
  id: string,
  note?: string,
) {
  await kolamRequest(
    `/dara-market-intel/recommendations/${encodeURIComponent(id)}/reject`,
    {
      method: 'POST',
      body: {note},
    },
  );
}

/** POST /dara-market-intel/recommendations/bulk-approve */
export async function bulkApproveKolamDaraMarketIntelRecommendations(
  ids: string[],
): Promise<KolamDaraMarketIntelBulkActionResult[]> {
  const payload = await kolamRequest<unknown>(
    '/dara-market-intel/recommendations/bulk-approve',
    {
      method: 'POST',
      body: {ids},
    },
  );
  return normalizeKolamDaraMarketIntelBulkActionResults(payload);
}

/** GET /dara-market-intel/competitors/links — FE `fetchCompetitorLinks`. */
export async function fetchKolamDaraMarketIntelCompetitorLinks(params?: {
  productId?: string;
  competitorName?: string;
  brandId?: string;
  enriched?: boolean;
}): Promise<KolamDaraMarketIntelCompetitorLink[]> {
  const payload = await kolamRequest<unknown>(
    '/dara-market-intel/competitors/links',
    {
      query: {
        ...(params?.productId ? {productId: params.productId} : {}),
        ...(params?.competitorName
          ? {competitorName: params.competitorName}
          : {}),
        ...(params?.brandId && params.brandId !== 'all'
          ? {brandId: params.brandId}
          : {}),
        ...(params?.enriched === false ? {} : {enriched: '1'}),
      },
    },
  );
  return normalizeKolamDaraMarketIntelCompetitorLinks(payload);
}

/** GET /dara-market-intel/competitors/product-baseline */
export async function fetchKolamDaraMarketIntelCompetitorBaseline(
  productId: string,
): Promise<KolamDaraMarketIntelCompetitorBaseline> {
  const payload = await kolamRequest<unknown>(
    '/dara-market-intel/competitors/product-baseline',
    {query: {productId}},
  );
  const baseline = normalizeKolamDaraMarketIntelCompetitorBaseline(payload);
  if (!baseline) {
    throw new Error('Baseline produk kosong');
  }
  return baseline;
}

/** POST /dara-market-intel/competitors/links — FE `saveCompetitorLink`. */
export async function saveKolamDaraMarketIntelCompetitorLink(body: {
  productId: string;
  competitorName: string;
  platform?: string;
  listingUrl?: string;
  websiteUrl?: string;
  compareWith?: 'website' | 'marketplace';
  ingestIntervalDays?: number;
}) {
  await kolamRequest('/dara-market-intel/competitors/links', {
    method: 'POST',
    body,
  });
}

/** DELETE /dara-market-intel/competitors/links/:id */
export async function deleteKolamDaraMarketIntelCompetitorLink(id: string) {
  await kolamRequest(
    `/dara-market-intel/competitors/links/${encodeURIComponent(id)}`,
    {method: 'DELETE'},
  );
}

/**
 * POST /dara-market-intel/competitors/links/:id/fetch
 * Long-running — caller must keep busy state per-row (FE 90s timeout).
 */
export async function fetchKolamDaraMarketIntelCompetitorLinkPrice(
  linkId: string,
): Promise<KolamDaraMarketIntelCompetitorFetchResult> {
  const payload = await kolamRequest<unknown>(
    `/dara-market-intel/competitors/links/${encodeURIComponent(linkId)}/fetch`,
    {method: 'POST', body: {}},
  );
  return normalizeKolamDaraMarketIntelCompetitorFetchResult(payload);
}

/** POST /dara-market-intel/competitors/report */
export async function sendKolamDaraMarketIntelCompetitorReport(
  brandId?: string,
) {
  await kolamRequest('/dara-market-intel/competitors/report', {
    method: 'POST',
    body: brandId && brandId !== 'all' ? {brandId} : {},
  });
}

/** GET /dara-market-intel/store-health/products — FE `scanStoreHealthProducts`. */
export async function fetchKolamDaraMarketIntelStoreHealthProducts(opts?: {
  sellableOnly?: boolean;
}): Promise<KolamDaraMarketIntelStoreHealthScan> {
  const payload = await kolamRequest<unknown>(
    '/dara-market-intel/store-health/products',
    {
      query:
        opts?.sellableOnly === false ? {sellableOnly: '0'} : undefined,
    },
  );
  const scan = normalizeKolamDaraMarketIntelStoreHealthScan(payload);
  if (!scan) {
    throw new Error('Respons scan kosong');
  }
  return scan;
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

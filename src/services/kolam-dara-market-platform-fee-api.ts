import {appConfig} from '../config/app';
import {
  normalizeKolamDaraMarketPlatformFeeCalculation,
  normalizeKolamDaraMarketPlatformFeeCheckResult,
  normalizeKolamDaraMarketPlatformFeeMeta,
  normalizeKolamDaraMarketPlatformFeeProfiles,
  normalizeKolamDaraMarketPlatformFeeSnapshots,
  normalizeKolamDaraMarketPlatformFeeSources,
  normalizeKolamDaraMarketPlatformFeeSummary,
  type KolamDaraMarketPlatformFeeCalculation,
  type KolamDaraMarketPlatformFeeCheckResult,
  type KolamDaraMarketPlatformFeeMeta,
  type KolamDaraMarketPlatformFeeProfile,
  type KolamDaraMarketPlatformFeeSnapshot,
  type KolamDaraMarketPlatformFeeSource,
  type KolamDaraMarketPlatformFeeSummary,
  type KolamDaraMarketPlatformId,
} from '../domain/kolam-dara-market-platform-fee';
import {apiRequest} from '../lib/api-client';

type QueryValue = string | number | boolean | undefined | null;

interface DataResponse<T> {
  data: T;
}

/** FE `PLATFORM_FEE_SCAN_TIMEOUT_MS` — sequential checks; notice must stay visible. */
export const KOLAM_DARA_MARKET_PLATFORM_FEE_SCAN_TIMEOUT_MS = 180_000;

/** GET /dara-market-intel/platform-fees/meta */
export async function fetchKolamDaraMarketPlatformFeeMeta(): Promise<KolamDaraMarketPlatformFeeMeta> {
  const payload = await kolamRequest<unknown>('/dara-market-intel/platform-fees/meta');
  return normalizeKolamDaraMarketPlatformFeeMeta(payload);
}

/** GET /dara-market-intel/platform-fees/profiles */
export async function fetchKolamDaraMarketPlatformFeeProfiles(): Promise<
  KolamDaraMarketPlatformFeeProfile[]
> {
  const payload = await kolamRequest<unknown>(
    '/dara-market-intel/platform-fees/profiles',
  );
  return normalizeKolamDaraMarketPlatformFeeProfiles(payload);
}

/** PUT /dara-market-intel/platform-fees/profiles/:platform */
export async function saveKolamDaraMarketPlatformFeeProfile(
  platform: KolamDaraMarketPlatformId,
  body: Partial<{
    sellerTier: string;
    primaryCategoryId: string;
    primaryCategoryLabel: string;
    programs: Record<string, boolean | undefined>;
    notes: string;
  }>,
): Promise<KolamDaraMarketPlatformFeeProfile> {
  const payload = await kolamRequest<unknown>(
    `/dara-market-intel/platform-fees/profiles/${platform}`,
    {method: 'PUT', body},
  );
  const list = normalizeKolamDaraMarketPlatformFeeProfiles({
    data: [unwrapOne(payload)],
  });
  if (!list[0]) {
    throw new Error('Profil gagal disimpan');
  }
  return list[0];
}

/** GET /dara-market-intel/platform-fees/sources */
export async function fetchKolamDaraMarketPlatformFeeSources(
  platform?: KolamDaraMarketPlatformId,
): Promise<KolamDaraMarketPlatformFeeSource[]> {
  const payload = await kolamRequest<unknown>(
    '/dara-market-intel/platform-fees/sources',
    {query: platform ? {platform} : undefined},
  );
  return normalizeKolamDaraMarketPlatformFeeSources(payload);
}

/** POST /dara-market-intel/platform-fees/sources */
export async function addKolamDaraMarketPlatformFeeSource(body: {
  name: string;
  url: string;
  platform?: KolamDaraMarketPlatformId;
}): Promise<KolamDaraMarketPlatformFeeSource> {
  const payload = await kolamRequest<unknown>(
    '/dara-market-intel/platform-fees/sources',
    {method: 'POST', body},
  );
  const list = normalizeKolamDaraMarketPlatformFeeSources({
    data: [unwrapOne(payload)],
  });
  if (!list[0]) {
    throw new Error('Sumber gagal ditambah');
  }
  return list[0];
}

/**
 * POST /dara-market-intel/platform-fees/sources/:id/check
 * Long-running (FE 180s). Prefer sequential UI progress over check-all.
 */
export async function checkKolamDaraMarketPlatformFeeSource(
  id: string,
): Promise<KolamDaraMarketPlatformFeeCheckResult> {
  const payload = await kolamRequest<unknown>(
    `/dara-market-intel/platform-fees/sources/${encodeURIComponent(id)}/check`,
    {method: 'POST', body: {}},
  );
  return normalizeKolamDaraMarketPlatformFeeCheckResult(payload);
}

/** GET /dara-market-intel/platform-fees/snapshots */
export async function fetchKolamDaraMarketPlatformFeeSnapshots(opts?: {
  status?: string;
  platform?: KolamDaraMarketPlatformId;
}): Promise<KolamDaraMarketPlatformFeeSnapshot[]> {
  const payload = await kolamRequest<unknown>(
    '/dara-market-intel/platform-fees/snapshots',
    {
      query: {
        ...(opts?.status ? {status: opts.status} : {}),
        ...(opts?.platform ? {platform: opts.platform} : {}),
      },
    },
  );
  return normalizeKolamDaraMarketPlatformFeeSnapshots(payload);
}

/** POST /dara-market-intel/platform-fees/snapshots/:id/approve */
export async function approveKolamDaraMarketPlatformFeeSnapshot(
  id: string,
  note?: string,
) {
  await kolamRequest(
    `/dara-market-intel/platform-fees/snapshots/${encodeURIComponent(id)}/approve`,
    {method: 'POST', body: note != null && note.trim() ? {note} : {}},
  );
}

/** POST /dara-market-intel/platform-fees/snapshots/:id/reject */
export async function rejectKolamDaraMarketPlatformFeeSnapshot(
  id: string,
  note?: string,
) {
  await kolamRequest(
    `/dara-market-intel/platform-fees/snapshots/${encodeURIComponent(id)}/reject`,
    {method: 'POST', body: note != null && note.trim() ? {note} : {}},
  );
}

/** GET /dara-market-intel/platform-fees/summary */
export async function fetchKolamDaraMarketPlatformFeeSummary(): Promise<KolamDaraMarketPlatformFeeSummary> {
  const payload = await kolamRequest<unknown>(
    '/dara-market-intel/platform-fees/summary',
  );
  return normalizeKolamDaraMarketPlatformFeeSummary(payload);
}

/** GET /dara-market-intel/platform-fees/calculation */
export async function fetchKolamDaraMarketPlatformFeeCalculation(opts?: {
  samplePrice?: number;
  sampleDiscount?: number;
  sampleQty?: number;
}): Promise<KolamDaraMarketPlatformFeeCalculation> {
  const payload = await kolamRequest<unknown>(
    '/dara-market-intel/platform-fees/calculation',
    {
      query: {
        ...(opts?.samplePrice != null ? {samplePrice: opts.samplePrice} : {}),
        ...(opts?.sampleDiscount != null
          ? {sampleDiscount: opts.sampleDiscount}
          : {}),
        ...(opts?.sampleQty != null ? {sampleQty: opts.sampleQty} : {}),
      },
    },
  );
  return normalizeKolamDaraMarketPlatformFeeCalculation(payload);
}

function unwrapOne(payload: unknown): unknown {
  const root =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {};
  if (root.data != null) {
    return root.data;
  }
  return payload;
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

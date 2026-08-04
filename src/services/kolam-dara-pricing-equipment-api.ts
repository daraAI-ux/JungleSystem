import {appConfig} from '../config/app';
import {
  normalizeKolamDaraPricingEquipmentJobPoll,
  normalizeKolamDaraPricingEquipmentPreview,
  normalizeKolamDaraPricingEquipmentStartResult,
  type KolamDaraPricingEquipmentJobPoll,
  type KolamDaraPricingEquipmentOperation,
  type KolamDaraPricingEquipmentPreview,
  type KolamDaraPricingMarketplaceMode,
  type KolamDaraPricingMarkupType,
} from '../domain/kolam-dara-pricing-equipment';
import {apiRequest} from '../lib/api-client';

type QueryValue = string | number | boolean | undefined | null;

interface DataResponse<T> {
  data: T;
}

/** POST /dara-pricing/equipment/preview — FE `previewEquipmentPricing`. */
export async function previewKolamDaraPricingEquipment(body: {
  operation: 'kolam' | 'marketplace_db';
  markupType?: KolamDaraPricingMarkupType;
  markupValue?: number;
  marketplaceMode?: KolamDaraPricingMarketplaceMode;
  includeProducts?: boolean;
  includeSpecies?: boolean;
}): Promise<KolamDaraPricingEquipmentPreview> {
  const payload = await kolamRequest<unknown>(
    '/dara-pricing/equipment/preview',
    {method: 'POST', body},
  );
  return normalizeKolamDaraPricingEquipmentPreview(payload);
}

/** POST /dara-pricing/equipment/start — FE `startEquipmentPricingJob`. */
export async function startKolamDaraPricingEquipmentJob(body: {
  operation: KolamDaraPricingEquipmentOperation;
  params?: Record<string, unknown>;
  label?: string;
}): Promise<{jobId: string}> {
  const payload = await kolamRequest<unknown>(
    '/dara-pricing/equipment/start',
    {method: 'POST', body},
  );
  const result = normalizeKolamDaraPricingEquipmentStartResult(payload);
  if (!result.jobId) {
    throw new Error('jobId kosong');
  }
  return result;
}

/**
 * GET /dara-jobs/:id — poll progress + result.logs for equipment console.
 * Reuses dara-jobs path (same as FE fetchDaraJob).
 */
export async function fetchKolamDaraPricingEquipmentJob(
  jobId: string,
): Promise<KolamDaraPricingEquipmentJobPoll> {
  const payload = await kolamRequest<unknown>(
    `/dara-jobs/${encodeURIComponent(jobId)}`,
  );
  const job = normalizeKolamDaraPricingEquipmentJobPoll(payload);
  if (!job) {
    throw new Error('Job tidak ditemukan');
  }
  return job;
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

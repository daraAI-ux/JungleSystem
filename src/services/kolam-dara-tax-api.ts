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
import {
  normalizeKolamDaraTaxAuditLogs,
  normalizeKolamDaraTaxKitab,
  normalizeKolamDaraTaxKnowledge,
  normalizeKolamDaraTaxRegulationDrafts,
  normalizeKolamDaraTaxRegulationSources,
  normalizeKolamDaraTaxRegulationVersions,
  normalizeKolamDaraTaxTaxStatus,
  normalizeKolamDaraTaxVersionCompare,
  type KolamDaraTaxAuditLog,
  type KolamDaraTaxKitab,
  type KolamDaraTaxKnowledge,
  type KolamDaraTaxRegulationDraft,
  type KolamDaraTaxRegulationSource,
  type KolamDaraTaxRegulationVersion,
  type KolamDaraTaxTaxStatus,
  type KolamDaraTaxVersionCompare,
} from '../domain/kolam-dara-tax-regulasi';
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

/** GET /dara-tax/status */
export async function fetchKolamDaraTaxStatus(): Promise<KolamDaraTaxTaxStatus> {
  const payload = await kolamRequest<unknown>('/dara-tax/status');
  return normalizeKolamDaraTaxTaxStatus(payload);
}

/** GET /dara-tax/regulations/versions */
export async function fetchKolamDaraTaxRegulationVersions(): Promise<
  KolamDaraTaxRegulationVersion[]
> {
  const payload = await kolamRequest<unknown>('/dara-tax/regulations/versions');
  return normalizeKolamDaraTaxRegulationVersions(payload);
}

/** GET /dara-tax/regulations/drafts */
export async function fetchKolamDaraTaxRegulationDrafts(): Promise<
  KolamDaraTaxRegulationDraft[]
> {
  const payload = await kolamRequest<unknown>('/dara-tax/regulations/drafts');
  return normalizeKolamDaraTaxRegulationDrafts(payload);
}

/** GET /dara-tax/regulations/sources */
export async function fetchKolamDaraTaxRegulationSources(): Promise<
  KolamDaraTaxRegulationSource[]
> {
  const payload = await kolamRequest<unknown>('/dara-tax/regulations/sources');
  return normalizeKolamDaraTaxRegulationSources(payload);
}

/** POST /dara-tax/regulations/sources */
export async function createKolamDaraTaxRegulationSource(body: {
  name: string;
  url: string;
  authority?: string;
  checkIntervalHours?: number;
  isActive?: boolean;
}): Promise<void> {
  await kolamRequest('/dara-tax/regulations/sources', {
    method: 'POST',
    body,
  });
}

/** DELETE /dara-tax/regulations/sources/:id */
export async function deleteKolamDaraTaxRegulationSource(
  id: string,
): Promise<void> {
  await kolamRequest(
    `/dara-tax/regulations/sources/${encodeURIComponent(id)}`,
    {method: 'DELETE'},
  );
}

/** POST /dara-tax/regulations/sources/:id/check */
export async function checkKolamDaraTaxRegulationSource(id: string): Promise<{
  changed?: boolean;
  error?: string;
}> {
  const payload = await kolamRequest<unknown>(
    `/dara-tax/regulations/sources/${encodeURIComponent(id)}/check`,
    {method: 'POST', body: {}},
  );
  const data =
    payload && typeof payload === 'object' && 'data' in (payload as object)
      ? ((payload as {data: Record<string, unknown>}).data ?? {})
      : (payload as Record<string, unknown>);
  return {
    changed: (data as {changed?: boolean}).changed === true,
    error: String((data as {error?: string}).error || '').trim() || undefined,
  };
}

/** POST /dara-tax/regulations/watch/run */
export async function runKolamDaraTaxRegulationWatcher(): Promise<void> {
  await kolamRequest('/dara-tax/regulations/watch/run', {
    method: 'POST',
    body: {},
  });
}

/** POST /dara-tax/regulations/drafts/:id/approve */
export async function approveKolamDaraTaxRegulationDraft(
  id: string,
  body?: {
    note?: string;
    formulas?: {
      ppnRate?: number;
      pph23Rate?: number;
      umkmFinalRate?: number;
    };
  },
): Promise<void> {
  await kolamRequest(
    `/dara-tax/regulations/drafts/${encodeURIComponent(id)}/approve`,
    {method: 'POST', body: body ?? {}},
  );
}

/** POST /dara-tax/regulations/drafts/:id/reject */
export async function rejectKolamDaraTaxRegulationDraft(
  id: string,
  note?: string,
): Promise<void> {
  await kolamRequest(
    `/dara-tax/regulations/drafts/${encodeURIComponent(id)}/reject`,
    {method: 'POST', body: {note}},
  );
}

/** GET /dara-tax/regulations/versions/compare */
export async function compareKolamDaraTaxRegulationVersions(
  versionA: string,
  versionB: string,
): Promise<KolamDaraTaxVersionCompare> {
  const payload = await kolamRequest<unknown>(
    '/dara-tax/regulations/versions/compare',
    {query: {versionA, versionB}},
  );
  return normalizeKolamDaraTaxVersionCompare(payload);
}

/** POST /dara-tax/regulations/versions/:id/rollback */
export async function rollbackKolamDaraTaxRegulationVersion(
  id: string,
  note?: string,
): Promise<void> {
  await kolamRequest(
    `/dara-tax/regulations/versions/${encodeURIComponent(id)}/rollback`,
    {method: 'POST', body: {note}},
  );
}

/** GET /dara-tax/knowledge */
export async function fetchKolamDaraTaxKnowledge(): Promise<
  KolamDaraTaxKnowledge[]
> {
  const payload = await kolamRequest<unknown>('/dara-tax/knowledge');
  return normalizeKolamDaraTaxKnowledge(payload);
}

/** GET /dara-tax/audit-logs */
export async function fetchKolamDaraTaxAuditLogs(): Promise<
  KolamDaraTaxAuditLog[]
> {
  const payload = await kolamRequest<unknown>('/dara-tax/audit-logs');
  return normalizeKolamDaraTaxAuditLogs(payload);
}

/** GET /dara-tax/regulations/kitab */
export async function fetchKolamDaraTaxKitab(): Promise<KolamDaraTaxKitab> {
  const payload = await kolamRequest<unknown>('/dara-tax/regulations/kitab');
  return normalizeKolamDaraTaxKitab(payload);
}

/** POST /dara-tax/regulations/kitab/ai-fill */
export async function aiFillKolamDaraTaxKitab(): Promise<KolamDaraTaxKitab> {
  const payload = await kolamRequest<unknown>(
    '/dara-tax/regulations/kitab/ai-fill',
    {method: 'POST', body: {}},
  );
  const data = unwrapNestedData(payload);
  if (data.kitab) {
    return normalizeKolamDaraTaxKitab({data: data.kitab});
  }
  return normalizeKolamDaraTaxKitab(payload);
}

/** POST /dara-tax/bootstrap */
export async function runKolamDaraTaxBootstrap(): Promise<void> {
  await kolamRequest('/dara-tax/bootstrap', {method: 'POST', body: {}});
}

/** POST /dara-tax/admin/backfill-snapshots */
export async function runKolamDaraTaxSnapshotBackfill(body: {
  dryRun?: boolean;
  limit?: number;
}): Promise<string> {
  const payload = await kolamRequest<unknown>(
    '/dara-tax/admin/backfill-snapshots',
    {method: 'POST', body},
  );
  const root = asApiRecord(payload);
  return String(root.message || '').trim();
}

/** POST /dara-tax/admin/reaccrue-commission-pph21 (host path may vary) */
export async function runKolamDaraTaxReaccruePph21(body: {
  dryRun?: boolean;
  limit?: number;
}): Promise<string> {
  const payload = await kolamRequest<unknown>(
    '/dara-tax/admin/reaccrue-commission-pph21',
    {method: 'POST', body},
  );
  const root = asApiRecord(payload);
  return String(root.message || '').trim();
}

function asApiRecord(payload: unknown): Record<string, unknown> {
  return payload && typeof payload === 'object' && !Array.isArray(payload)
    ? (payload as Record<string, unknown>)
    : {};
}

function unwrapNestedData(payload: unknown): Record<string, unknown> {
  const root = asApiRecord(payload);
  if (root.data && typeof root.data === 'object' && !Array.isArray(root.data)) {
    return root.data as Record<string, unknown>;
  }
  return root;
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

import {appConfig} from '../config/app';
import {
  normalizeKolamDaraSeoAuditLogs,
  normalizeKolamDaraSeoBrands,
  normalizeKolamDaraSeoBulkActionResults,
  normalizeKolamDaraSeoDashboard,
  normalizeKolamDaraSeoIntegrationReport,
  normalizeKolamDaraSeoIntegrationSettings,
  normalizeKolamDaraSeoKeywords,
  normalizeKolamDaraSeoMentions,
  normalizeKolamDaraSeoPendingSuggestions,
  normalizeKolamDaraSeoRankings,
  normalizeKolamDaraSeoSentimentRows,
  normalizeKolamDaraSeoSocialInsights,
  normalizeKolamDaraSeoStatus,
  normalizeKolamDaraSeoSuggestionDetail,
  normalizeKolamDaraSeoSuggestions,
  normalizeKolamDaraSeoWebsitePreview,
  type KolamDaraSeoAuditLogRow,
  type KolamDaraSeoBrand,
  type KolamDaraSeoBulkActionResult,
  type KolamDaraSeoDashboard,
  type KolamDaraSeoIntegrationReport,
  type KolamDaraSeoIntegrationSettings,
  type KolamDaraSeoKeywordRow,
  type KolamDaraSeoMentionRow,
  type KolamDaraSeoPendingSuggestion,
  type KolamDaraSeoRankingRow,
  type KolamDaraSeoSentimentRow,
  type KolamDaraSeoSocialPlatform,
  type KolamDaraSeoSocialSnapshot,
  type KolamDaraSeoStatus,
  type KolamDaraSeoSuggestion,
  type KolamDaraSeoSuggestionDetail,
  type KolamDaraSeoTargetType,
  type KolamDaraSeoWebsitePreview,
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

/** GET /dara-seo/rankings */
export async function fetchKolamDaraSeoRankings(params?: {
  keyword?: string;
  limit?: number;
  brandId?: string;
}): Promise<{items: KolamDaraSeoRankingRow[]; total: number}> {
  const payload = await kolamRequest<unknown>('/dara-seo/rankings', {
    query: {
      keyword: params?.keyword?.trim() || undefined,
      limit: params?.limit ?? 50,
      ...(params?.brandId && params.brandId !== 'all'
        ? {brandId: params.brandId}
        : {}),
    },
  });
  return normalizeKolamDaraSeoRankings(payload);
}

/** GET /dara-seo/keywords */
export async function fetchKolamDaraSeoKeywords(
  productId?: string,
): Promise<KolamDaraSeoKeywordRow[]> {
  const payload = await kolamRequest<unknown>('/dara-seo/keywords', {
    query: productId ? {productId} : undefined,
  });
  return normalizeKolamDaraSeoKeywords(payload);
}

/** GET /dara-seo/brand-mentions */
export async function fetchKolamDaraSeoBrandMentions(): Promise<
  KolamDaraSeoMentionRow[]
> {
  const payload = await kolamRequest<unknown>('/dara-seo/brand-mentions');
  return normalizeKolamDaraSeoMentions(payload);
}

/** POST /dara-seo/monitoring/search/fetch */
export async function fetchKolamDaraSeoSerpKeyword(
  keyword: string,
  productId?: string,
) {
  await kolamRequest('/dara-seo/monitoring/search/fetch', {
    method: 'POST',
    body: {keyword, productId},
  });
}

/** POST /dara-seo/monitoring/competitor/ingest */
export async function ingestKolamDaraSeoCompetitor(entityName: string) {
  await kolamRequest('/dara-seo/monitoring/competitor/ingest', {
    method: 'POST',
    body: {entityName},
  });
}

/** POST /dara-seo/monitoring/backlink/ingest */
export async function ingestKolamDaraSeoBacklink(url: string) {
  await kolamRequest('/dara-seo/monitoring/backlink/ingest', {
    method: 'POST',
    body: {url},
  });
}

/** GET /dara-seo/website/preview */
export async function fetchKolamDaraSeoWebsitePreview(): Promise<KolamDaraSeoWebsitePreview> {
  const payload = await kolamRequest<unknown>('/dara-seo/website/preview');
  const preview = normalizeKolamDaraSeoWebsitePreview(payload);
  if (!preview) {
    throw new Error('Preview SEO website kosong');
  }
  return preview;
}

/** PUT /dara-seo/website/seo */
export async function updateKolamDaraSeoWebsite(body: {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  publicSiteUrl?: string;
}) {
  await kolamRequest('/dara-seo/website/seo', {
    method: 'PUT',
    body,
  });
}

/** POST /dara-seo/integrations/indexing/submit */
export async function submitKolamDaraSeoGoogleIndexing(
  url: string,
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED',
): Promise<string> {
  const payload = await kolamRequest<unknown>(
    '/dara-seo/integrations/indexing/submit',
    {
      method: 'POST',
      body: {url, type},
    },
  );
  const root = asRecord(payload);
  const message = String(root.message || '').trim();
  return message || 'URL dikirim ke Google Indexing';
}

/** GET /dara-seo/audit-logs */
export async function fetchKolamDaraSeoAuditLogs(): Promise<
  KolamDaraSeoAuditLogRow[]
> {
  const payload = await kolamRequest<unknown>('/dara-seo/audit-logs');
  return normalizeKolamDaraSeoAuditLogs(payload);
}

/** GET /dara-seo/sentiment */
export async function fetchKolamDaraSeoSentiment(): Promise<
  KolamDaraSeoSentimentRow[]
> {
  const payload = await kolamRequest<unknown>('/dara-seo/sentiment');
  return normalizeKolamDaraSeoSentimentRows(payload);
}

/** POST /dara-seo/sentiment/ingest */
export async function ingestKolamDaraSeoSentiment(body: {
  text: string;
  useLlm?: boolean;
}) {
  await kolamRequest('/dara-seo/sentiment/ingest', {
    method: 'POST',
    body,
  });
}

/** DELETE /dara-seo/sentiment/:id */
export async function deleteKolamDaraSeoSentiment(id: string) {
  await kolamRequest(`/dara-seo/sentiment/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

/** GET /dara-seo/integrations/settings */
export async function fetchKolamDaraSeoIntegrationSettings(): Promise<KolamDaraSeoIntegrationSettings> {
  const payload = await kolamRequest<unknown>(
    '/dara-seo/integrations/settings',
  );
  const settings = normalizeKolamDaraSeoIntegrationSettings(payload);
  if (!settings) {
    throw new Error('Integrasi SEO kosong');
  }
  return settings;
}

/** PATCH /dara-seo/integrations/settings */
export async function updateKolamDaraSeoIntegrationSettings(
  body: Record<string, unknown>,
): Promise<KolamDaraSeoIntegrationSettings> {
  const payload = await kolamRequest<unknown>(
    '/dara-seo/integrations/settings',
    {
      method: 'PATCH',
      body,
    },
  );
  const settings = normalizeKolamDaraSeoIntegrationSettings(payload);
  if (!settings) {
    throw new Error('Gagal menyimpan integrasi SEO');
  }
  return settings;
}

/** POST /dara-seo/integrations/test/:providerId */
export async function testKolamDaraSeoIntegration(
  providerId: string,
  keyword?: string,
  url?: string,
): Promise<{message: string; count?: number; fallback?: boolean}> {
  const payload = await kolamRequest<unknown>(
    `/dara-seo/integrations/test/${encodeURIComponent(providerId)}`,
    {
      method: 'POST',
      body: {keyword, url},
    },
  );
  const data = unwrapPayloadData(payload);
  return {
    message: String(data.message || 'OK').trim() || 'OK',
    count:
      data.count == null || data.count === ''
        ? undefined
        : Number(data.count),
    fallback: data.fallback === true,
  };
}

/** POST /dara-seo/integrations/report-preview */
export async function previewKolamDaraSeoIntegrationReport(
  keyword: string,
): Promise<KolamDaraSeoIntegrationReport> {
  const payload = await kolamRequest<unknown>(
    '/dara-seo/integrations/report-preview',
    {
      method: 'POST',
      body: {keyword},
    },
  );
  const report = normalizeKolamDaraSeoIntegrationReport(payload);
  if (!report) {
    throw new Error('Preview laporan kosong');
  }
  return report;
}

/** GET /dara-seo/social/insights */
export async function fetchKolamDaraSeoSocialInsights(params?: {
  platform?: string;
  page?: number;
  limit?: number;
}): Promise<{rows: KolamDaraSeoSocialSnapshot[]; total: number}> {
  const payload = await kolamRequest<unknown>('/dara-seo/social/insights', {
    query: {
      platform: params?.platform,
      page: params?.page,
      limit: params?.limit ?? 30,
    },
  });
  return normalizeKolamDaraSeoSocialInsights(payload);
}

/** POST /dara-seo/social/sync */
export async function syncKolamDaraSeoSocialInsights(body: {
  platform: KolamDaraSeoSocialPlatform;
  periodDays: 7 | 28;
}): Promise<string> {
  const payload = await kolamRequest<unknown>('/dara-seo/social/sync', {
    method: 'POST',
    body,
  });
  const root = asRecord(payload);
  return (
    String(root.message || '').trim() || `Sync ${body.platform} dikirim ke AM`
  );
}

/** Lightweight flag read for sentiment Llama toggle (Settings AI-Tools). */
export async function fetchKolamDaraSeoSentimentLlmEnabled(): Promise<boolean> {
  try {
    const payload = await kolamRequest<unknown>('/websetting');
    const data = unwrapPayloadData(payload);
    return data.daraSeoSentimentLlmEnabled === true;
  } catch {
    return false;
  }
}

function unwrapPayloadData(payload: unknown): Record<string, unknown> {
  const root = asRecord(payload);
  if (root.data && typeof root.data === 'object' && !Array.isArray(root.data)) {
    return asRecord(root.data);
  }
  return root;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
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

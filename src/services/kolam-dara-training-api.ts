import {appConfig} from '../config/app';
import {
  normalizeKolamDaraTrainingConversationReviewList,
  normalizeKolamDaraTrainingFeedbackList,
  normalizeKolamDaraTrainingFineTuneBenchmark,
  normalizeKolamDaraTrainingFineTuneDatasetItem,
  normalizeKolamDaraTrainingFineTuneDatasetList,
  normalizeKolamDaraTrainingFineTuneExportResult,
  normalizeKolamDaraTrainingFineTuneImportResult,
  normalizeKolamDaraTrainingFineTuneRunList,
  normalizeKolamDaraTrainingFineTuneSummary,
  normalizeKolamDaraTrainingPhrase,
  normalizeKolamDaraTrainingPhraseList,
  normalizeKolamDaraTrainingRerankResult,
  normalizeKolamDaraTrainingStats,
  type KolamDaraTrainingConversationReviewList,
  type KolamDaraTrainingConversationReviewStatus,
  type KolamDaraTrainingFeedback,
  type KolamDaraTrainingFineTuneBenchmark,
  type KolamDaraTrainingFineTuneDatasetFilter,
  type KolamDaraTrainingFineTuneDatasetItem,
  type KolamDaraTrainingFineTuneDatasetStatus,
  type KolamDaraTrainingFineTuneExportResult,
  type KolamDaraTrainingFineTuneImportResult,
  type KolamDaraTrainingFineTuneRun,
  type KolamDaraTrainingFineTuneSummary,
  type KolamDaraTrainingPhrase,
  type KolamDaraTrainingPhraseCategory,
  type KolamDaraTrainingPhraseScope,
  type KolamDaraTrainingRerankResult,
  type KolamDaraTrainingStats,
} from '../domain/kolam-dara-training';
import {apiRequest} from '../lib/api-client';

type QueryValue = string | number | boolean | undefined | null;

interface DataResponse<T> {
  data: T;
}

/** GET /dara-training/stats */
export async function fetchKolamDaraTrainingStats(): Promise<KolamDaraTrainingStats> {
  const payload = await kolamRequest<unknown>('/dara-training/stats');
  return normalizeKolamDaraTrainingStats(payload);
}

/** GET /dara-training/phrases */
export async function listKolamDaraTrainingPhrases(opts?: {
  page?: number;
  limit?: number;
  scope?: KolamDaraTrainingPhraseScope;
}): Promise<KolamDaraTrainingPhrase[]> {
  const payload = await kolamRequest<unknown>('/dara-training/phrases', {
    query: {
      page: opts?.page ?? 1,
      limit: opts?.limit ?? 50,
      scope: opts?.scope ?? 'reply',
    },
  });
  return normalizeKolamDaraTrainingPhraseList(payload);
}

/** POST /dara-training/phrases */
export async function createKolamDaraTrainingPhrase(body: {
  phrase: string;
  category: KolamDaraTrainingPhraseCategory;
  customReply?: string;
  enabled?: boolean;
  priority?: number;
  notes?: string;
}): Promise<KolamDaraTrainingPhrase | null> {
  const payload = await kolamRequest<unknown>('/dara-training/phrases', {
    method: 'POST',
    body,
  });
  return normalizeKolamDaraTrainingPhrase(unwrapData(payload));
}

/** PUT /dara-training/phrases/:id */
export async function updateKolamDaraTrainingPhrase(
  id: string,
  body: Partial<{
    phrase: string;
    category: KolamDaraTrainingPhraseCategory;
    customReply: string;
    enabled: boolean;
    priority: number;
    notes: string;
  }>,
): Promise<KolamDaraTrainingPhrase | null> {
  const payload = await kolamRequest<unknown>(
    `/dara-training/phrases/${encodeURIComponent(id)}`,
    {method: 'PUT', body},
  );
  return normalizeKolamDaraTrainingPhrase(unwrapData(payload));
}

/** DELETE /dara-training/phrases/:id */
export async function deleteKolamDaraTrainingPhrase(id: string): Promise<void> {
  await kolamRequest(`/dara-training/phrases/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

/** GET /dara-training/feedback — FE `listFeedback(1, 20)`. */
export async function listKolamDaraTrainingFeedback(opts?: {
  page?: number;
  limit?: number;
}): Promise<KolamDaraTrainingFeedback[]> {
  const payload = await kolamRequest<unknown>('/dara-training/feedback', {
    query: {
      page: opts?.page ?? 1,
      limit: opts?.limit ?? 20,
    },
  });
  return normalizeKolamDaraTrainingFeedbackList(payload);
}

/** POST /dara-training/run-product-rerank */
export async function runKolamDaraTrainingProductRerank(opts?: {
  poc?: boolean;
  minSamples?: number;
}): Promise<KolamDaraTrainingRerankResult> {
  const payload = await kolamRequest<unknown>(
    '/dara-training/run-product-rerank',
    {method: 'POST', body: opts ?? {}},
  );
  return normalizeKolamDaraTrainingRerankResult(payload);
}

/** GET /dara-training/conversation-reviews — FE `listConversationReviews`. */
export async function listKolamDaraTrainingConversationReviews(opts: {
  status: KolamDaraTrainingConversationReviewStatus;
  page?: number;
  limit?: number;
}): Promise<KolamDaraTrainingConversationReviewList> {
  const payload = await kolamRequest<unknown>(
    '/dara-training/conversation-reviews',
    {
      query: {
        status: opts.status,
        page: opts.page ?? 1,
        limit: opts.limit ?? 20,
      },
    },
  );
  return normalizeKolamDaraTrainingConversationReviewList(payload);
}

/** POST /chat/conversations/:id/review-complete — FE `completeConversationReview`. */
export async function completeKolamDaraTrainingConversationReview(
  conversationId: string,
  notes: string,
): Promise<void> {
  await kolamRequest(
    `/chat/conversations/${encodeURIComponent(conversationId)}/review-complete`,
    {method: 'POST', body: {notes}},
  );
}

/** GET /dara-training/fine-tune/summary */
export async function fetchKolamDaraTrainingFineTuneSummary(): Promise<KolamDaraTrainingFineTuneSummary> {
  const payload = await kolamRequest<unknown>('/dara-training/fine-tune/summary');
  return normalizeKolamDaraTrainingFineTuneSummary(payload);
}

/** GET /dara-training/fine-tune/candidates */
export async function listKolamDaraTrainingFineTuneCandidates(opts?: {
  limit?: number;
  sourceType?: string;
}): Promise<KolamDaraTrainingFineTuneDatasetItem[]> {
  const payload = await kolamRequest<unknown>(
    '/dara-training/fine-tune/candidates',
    {
      query: {
        limit: opts?.limit ?? 80,
        sourceType: opts?.sourceType ?? 'all',
      },
    },
  );
  return normalizeKolamDaraTrainingFineTuneDatasetList(payload);
}

/** POST /dara-training/fine-tune/import-candidates */
export async function importKolamDaraTrainingFineTuneCandidates(opts?: {
  limit?: number;
  sourceType?: string;
}): Promise<KolamDaraTrainingFineTuneImportResult> {
  const payload = await kolamRequest<unknown>(
    '/dara-training/fine-tune/import-candidates',
    {method: 'POST', body: opts ?? {limit: 120}},
  );
  return normalizeKolamDaraTrainingFineTuneImportResult(payload);
}

/** GET /dara-training/fine-tune/dataset */
export async function listKolamDaraTrainingFineTuneDataset(opts?: {
  page?: number;
  limit?: number;
  status?: KolamDaraTrainingFineTuneDatasetFilter;
}): Promise<KolamDaraTrainingFineTuneDatasetItem[]> {
  const payload = await kolamRequest<unknown>(
    '/dara-training/fine-tune/dataset',
    {
      query: {
        page: opts?.page ?? 1,
        limit: opts?.limit ?? 30,
        status: opts?.status ?? 'all',
      },
    },
  );
  return normalizeKolamDaraTrainingFineTuneDatasetList(payload);
}

/** PUT /dara-training/fine-tune/dataset/:id */
export async function updateKolamDaraTrainingFineTuneDatasetItem(
  id: string,
  body: Partial<{
    status: KolamDaraTrainingFineTuneDatasetStatus;
    notes: string;
  }>,
): Promise<KolamDaraTrainingFineTuneDatasetItem | null> {
  const payload = await kolamRequest<unknown>(
    `/dara-training/fine-tune/dataset/${encodeURIComponent(id)}`,
    {method: 'PUT', body},
  );
  return normalizeKolamDaraTrainingFineTuneDatasetItem(unwrapData(payload));
}

/** POST /dara-training/fine-tune/export-jsonl */
export async function exportKolamDaraTrainingFineTuneJsonl(opts?: {
  minItems?: number;
  purpose?: string;
}): Promise<KolamDaraTrainingFineTuneExportResult> {
  const payload = await kolamRequest<unknown>(
    '/dara-training/fine-tune/export-jsonl',
    {method: 'POST', body: opts ?? {minItems: 1}},
  );
  return normalizeKolamDaraTrainingFineTuneExportResult(payload);
}

/** GET /dara-training/fine-tune/benchmark */
export async function fetchKolamDaraTrainingFineTuneBenchmark(): Promise<KolamDaraTrainingFineTuneBenchmark> {
  const payload = await kolamRequest<unknown>(
    '/dara-training/fine-tune/benchmark',
  );
  return normalizeKolamDaraTrainingFineTuneBenchmark(payload);
}

/** GET /dara-training/fine-tune/runs */
export async function listKolamDaraTrainingFineTuneRuns(): Promise<
  KolamDaraTrainingFineTuneRun[]
> {
  const payload = await kolamRequest<unknown>('/dara-training/fine-tune/runs');
  return normalizeKolamDaraTrainingFineTuneRunList(payload);
}

function unwrapData(payload: unknown): unknown {
  const root =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {};
  return root.data ?? payload;
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

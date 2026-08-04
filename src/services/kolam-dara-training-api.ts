import {appConfig} from '../config/app';
import {
  normalizeKolamDaraTrainingPhrase,
  normalizeKolamDaraTrainingPhraseList,
  normalizeKolamDaraTrainingStats,
  type KolamDaraTrainingPhrase,
  type KolamDaraTrainingPhraseCategory,
  type KolamDaraTrainingPhraseScope,
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

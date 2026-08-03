import {appConfig} from '../config/app';
import {
  normalizeKolamDaraJobList,
  type KolamDaraAsyncJob,
  type KolamDaraJobModule,
} from '../domain/kolam-pusat-ai-jobs';
import {apiRequest} from '../lib/api-client';

type QueryValue = string | number | boolean | undefined | null;

interface DataResponse<T> {
  data: T;
}

/** GET /dara-jobs/list — FE `fetchDaraJobsList`. */
export async function fetchKolamDaraJobsList(opts?: {
  module?: KolamDaraJobModule;
  active?: boolean;
  hours?: number;
}): Promise<KolamDaraAsyncJob[]> {
  const payload = await kolamRequest<unknown>('/dara-jobs/list', {
    query: {
      module: opts?.module,
      active: opts?.active ? '1' : undefined,
      hours: opts?.hours ?? 72,
    },
  });
  return normalizeKolamDaraJobList(payload);
}

/** GET /dara-jobs/:id — FE `fetchDaraJob`. */
export async function fetchKolamDaraJob(
  jobId: string,
): Promise<KolamDaraAsyncJob> {
  const payload = await kolamRequest<unknown>(
    `/dara-jobs/${encodeURIComponent(jobId)}`,
  );
  const jobs = normalizeKolamDaraJobList({data: {jobs: [unwrapJob(payload)]}});
  if (!jobs[0]) {
    throw new Error('Job tidak ditemukan');
  }
  return jobs[0];
}

function unwrapJob(payload: unknown): unknown {
  const root =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : null;
  if (root && 'data' in root && root.data != null) {
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
    sourceHeader: appConfig.kolamSourceHeader,
  }) as Promise<T>;
}

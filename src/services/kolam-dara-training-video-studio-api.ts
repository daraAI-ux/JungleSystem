import {appConfig} from '../config/app';
import {
  normalizeKolamDaraTrainingVideoStudioConfig,
  normalizeKolamDaraTrainingVideoStudioJob,
  normalizeKolamDaraTrainingVideoStudioJobList,
  normalizeKolamDaraTrainingVideoStudioUpload,
  type KolamDaraTrainingVideoStudioConfig,
  type KolamDaraTrainingVideoStudioCreateInput,
  type KolamDaraTrainingVideoStudioJob,
  type KolamDaraTrainingVideoStudioUpload,
} from '../domain/kolam-dara-training-video-studio';
import {apiRequest} from '../lib/api-client';

type QueryValue = string | number | boolean | undefined | null;

/** GET /dara-training/video-studio/config */
export async function fetchKolamDaraTrainingVideoStudioConfig(): Promise<KolamDaraTrainingVideoStudioConfig> {
  const payload = await kolamRequest<unknown>('/dara-training/video-studio/config');
  return normalizeKolamDaraTrainingVideoStudioConfig(payload);
}

/** POST /dara-training/video-studio/upload (raw video body) */
export async function uploadKolamDaraTrainingVideoStudioRaw(
  buffer: ArrayBuffer,
  opts: {filename: string; mimeType?: string},
): Promise<KolamDaraTrainingVideoStudioUpload> {
  const payload = await apiRequest<unknown>({
    method: 'POST',
    path: '/dara-training/video-studio/upload',
    baseUrl: appConfig.kolamApiBaseUrl,
    body: buffer,
    headers: {
      'Content-Type': opts.mimeType || 'video/mp4',
      'X-File-Name': opts.filename,
    },
  });
  return normalizeKolamDaraTrainingVideoStudioUpload(payload);
}

/** GET /dara-training/video-studio/jobs */
export async function listKolamDaraTrainingVideoStudioJobs(
  limit = 30,
): Promise<KolamDaraTrainingVideoStudioJob[]> {
  const payload = await kolamRequest<unknown>('/dara-training/video-studio/jobs', {
    query: {limit},
  });
  return normalizeKolamDaraTrainingVideoStudioJobList(payload);
}

/** POST /dara-training/video-studio/jobs */
export async function createKolamDaraTrainingVideoStudioJob(
  body: KolamDaraTrainingVideoStudioCreateInput,
): Promise<KolamDaraTrainingVideoStudioJob> {
  const payload = await kolamRequest<unknown>('/dara-training/video-studio/jobs', {
    method: 'POST',
    body,
  });
  const job = normalizeKolamDaraTrainingVideoStudioJob(unwrapData(payload));
  if (!job) {
    throw new Error('Respons job Video Studio tidak valid');
  }
  return job;
}

/** POST /dara-training/video-studio/jobs/:id/status */
export async function refreshKolamDaraTrainingVideoStudioJob(
  id: string,
): Promise<KolamDaraTrainingVideoStudioJob> {
  const payload = await kolamRequest<unknown>(
    `/dara-training/video-studio/jobs/${encodeURIComponent(id)}/status`,
    {method: 'POST'},
  );
  const job = normalizeKolamDaraTrainingVideoStudioJob(unwrapData(payload));
  if (!job) {
    throw new Error('Respons job Video Studio tidak valid');
  }
  return job;
}

/** POST /dara-training/video-studio/jobs/:id/poll */
export async function pollKolamDaraTrainingVideoStudioJob(
  id: string,
): Promise<KolamDaraTrainingVideoStudioJob> {
  const payload = await kolamRequest<unknown>(
    `/dara-training/video-studio/jobs/${encodeURIComponent(id)}/poll`,
    {
      method: 'POST',
      body: {attempts: 8, delayMs: 1500},
    },
  );
  const job = normalizeKolamDaraTrainingVideoStudioJob(unwrapData(payload));
  if (!job) {
    throw new Error('Respons job Video Studio tidak valid');
  }
  return job;
}

/** POST /dara-training/video-studio/jobs/:id/cancel */
export async function cancelKolamDaraTrainingVideoStudioJob(
  id: string,
): Promise<KolamDaraTrainingVideoStudioJob> {
  const payload = await kolamRequest<unknown>(
    `/dara-training/video-studio/jobs/${encodeURIComponent(id)}/cancel`,
    {method: 'POST'},
  );
  const job = normalizeKolamDaraTrainingVideoStudioJob(unwrapData(payload));
  if (!job) {
    throw new Error('Respons job Video Studio tidak valid');
  }
  return job;
}

/** POST /dara-training/video-studio/jobs/:id/overlay-logo */
export async function overlayKolamDaraTrainingVideoStudioLogo(
  id: string,
): Promise<KolamDaraTrainingVideoStudioJob> {
  const payload = await kolamRequest<unknown>(
    `/dara-training/video-studio/jobs/${encodeURIComponent(id)}/overlay-logo`,
    {method: 'POST', body: {}},
  );
  const job = normalizeKolamDaraTrainingVideoStudioJob(unwrapData(payload));
  if (!job) {
    throw new Error('Respons job Video Studio tidak valid');
  }
  return job;
}

/** Download URL for completed job output. */
export function buildKolamDaraTrainingVideoStudioDownloadUrl(id: string): string {
  const base = appConfig.kolamApiBaseUrl.replace(/\/$/, '');
  return `${base}/dara-training/video-studio/jobs/${encodeURIComponent(id)}/download`;
}

function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    query?: Record<string, QueryValue>;
    body?: unknown;
  } = {},
) {
  return apiRequest<T>({
    method: options.method ?? 'GET',
    path,
    query: options.query,
    body: options.body,
    baseUrl: appConfig.kolamApiBaseUrl,
  });
}

function unwrapData(payload: unknown): unknown {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const record = payload as Record<string, unknown>;
    if (record.data != null) {
      return record.data;
    }
  }
  return payload;
}

import {appConfig} from '../config/app';
import {
  normalizeKolamDaraStaffNotifyLog,
  type KolamDaraStaffNotifyLog,
} from '../domain/kolam-pusat-ai-log-dara';
import {apiRequest} from '../lib/api-client';

type QueryValue = string | number | boolean | undefined | null;

interface DataResponse<T> {
  data: T;
}

/** GET /dara/staff-notify/log — FE `fetchDaraStaffNotifyLog`. */
export async function fetchKolamDaraStaffNotifyLog(
  lookbackHours = 72,
  limit = 80,
): Promise<KolamDaraStaffNotifyLog> {
  const payload = await kolamRequest<unknown>('/dara/staff-notify/log', {
    query: {lookbackHours, limit},
  });
  const log = normalizeKolamDaraStaffNotifyLog(payload);
  if (!log) {
    throw new Error('Log DARA kosong');
  }
  return log;
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

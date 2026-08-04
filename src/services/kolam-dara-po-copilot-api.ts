import {appConfig} from '../config/app';
import {
  normalizeKolamPoCopilotStats,
  normalizeKolamPoOpsLog,
  normalizeKolamRajaAnemonHealth,
  type KolamPoCopilotRange,
  type KolamPoCopilotStats,
  type KolamPoOpsLog,
  type KolamRajaAnemonHealth,
} from '../domain/kolam-pusat-ai-po-copilot';
import {apiRequest} from '../lib/api-client';

type QueryValue = string | number | boolean | undefined | null;

interface DataResponse<T> {
  data: T;
}

/** GET /dara/po-copilot/stats */
export async function fetchKolamPoCopilotStats(
  range: KolamPoCopilotRange = 'month',
): Promise<KolamPoCopilotStats> {
  const payload = await kolamRequest<unknown>('/dara/po-copilot/stats', {
    query: {range},
  });
  const stats = normalizeKolamPoCopilotStats(payload);
  if (!stats) {
    throw new Error('Statistik PO Copilot kosong');
  }
  return stats;
}

/** GET /dara/po-copilot/ops-log */
export async function fetchKolamPoOpsLog(): Promise<KolamPoOpsLog> {
  const payload = await kolamRequest<unknown>('/dara/po-copilot/ops-log');
  const log = normalizeKolamPoOpsLog(payload);
  if (!log) {
    throw new Error('Ops log PO Copilot kosong');
  }
  return log;
}

/** GET /dara/po-copilot/raja-anemon-health */
export async function fetchKolamRajaAnemonHealth(): Promise<KolamRajaAnemonHealth> {
  const payload = await kolamRequest<unknown>(
    '/dara/po-copilot/raja-anemon-health',
  );
  const health = normalizeKolamRajaAnemonHealth(payload);
  if (!health) {
    throw new Error('Kesehatan Raja Anemon kosong');
  }
  return health;
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

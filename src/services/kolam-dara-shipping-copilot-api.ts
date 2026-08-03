import {appConfig} from '../config/app';
import {
  normalizeKolamKatakTerbangHealth,
  normalizeKolamShippingDeliveryStats,
  normalizeKolamShippingOpsLog,
  type KolamKatakTerbangHealth,
  type KolamShippingDeliveryStats,
  type KolamShippingOpsLog,
  type KolamTransaksiCopilotRange,
} from '../domain/kolam-pusat-ai-transaksi-copilot';
import {apiRequest} from '../lib/api-client';

type QueryValue = string | number | boolean | undefined | null;

interface DataResponse<T> {
  data: T;
}

/** GET /dara/shipping-copilot/delivery-stats */
export async function fetchKolamShippingDeliveryStats(
  range: KolamTransaksiCopilotRange = 'month',
): Promise<KolamShippingDeliveryStats> {
  const payload = await kolamRequest<unknown>(
    '/dara/shipping-copilot/delivery-stats',
    {query: {range}},
  );
  const stats = normalizeKolamShippingDeliveryStats(payload);
  if (!stats) {
    throw new Error('Statistik Transaksi Copilot kosong');
  }
  return stats;
}

/** GET /dara/shipping-copilot/ops-log */
export async function fetchKolamShippingOpsLog(
  lookbackHours = 72,
  limit = 80,
): Promise<KolamShippingOpsLog> {
  const payload = await kolamRequest<unknown>(
    '/dara/shipping-copilot/ops-log',
    {query: {lookbackHours, limit}},
  );
  const log = normalizeKolamShippingOpsLog(payload);
  if (!log) {
    throw new Error('Ops log Transaksi Copilot kosong');
  }
  return log;
}

/** GET /dara/shipping-copilot/katak-terbang-health */
export async function fetchKolamKatakTerbangHealth(): Promise<KolamKatakTerbangHealth> {
  const payload = await kolamRequest<unknown>(
    '/dara/shipping-copilot/katak-terbang-health',
  );
  const health = normalizeKolamKatakTerbangHealth(payload);
  if (!health) {
    throw new Error('Kesehatan bot kosong');
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

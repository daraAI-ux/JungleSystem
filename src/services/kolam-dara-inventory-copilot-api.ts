import {appConfig} from '../config/app';
import {
  normalizeKolamInventoryCopilotDashboard,
  normalizeKolamInventoryOpsLog,
  normalizeKolamPangeranIsopodHealth,
  type KolamInventoryCopilotDashboard,
  type KolamInventoryOpsLog,
  type KolamPangeranIsopodHealth,
} from '../domain/kolam-pusat-ai-inventory-copilot';
import {apiRequest} from '../lib/api-client';

type QueryValue = string | number | boolean | undefined | null;

interface DataResponse<T> {
  data: T;
}

/** GET /dara/inventory-copilot/dashboard */
export async function fetchKolamInventoryCopilotDashboard(
  lookbackHours = 24,
  limit = 12,
): Promise<KolamInventoryCopilotDashboard> {
  const payload = await kolamRequest<unknown>(
    '/dara/inventory-copilot/dashboard',
    {query: {lookbackHours, limit}},
  );
  const dash = normalizeKolamInventoryCopilotDashboard(payload);
  if (!dash) {
    throw new Error('Dashboard Inventory Copilot kosong');
  }
  return dash;
}

/** GET /dara/inventory-copilot/ops-log */
export async function fetchKolamInventoryOpsLog(): Promise<KolamInventoryOpsLog> {
  const payload = await kolamRequest<unknown>(
    '/dara/inventory-copilot/ops-log',
  );
  const log = normalizeKolamInventoryOpsLog(payload);
  if (!log) {
    throw new Error('Ops log Inventory Copilot kosong');
  }
  return log;
}

/** GET /dara/inventory-copilot/pangeran-isopod-health */
export async function fetchKolamPangeranIsopodHealth(): Promise<KolamPangeranIsopodHealth> {
  const payload = await kolamRequest<unknown>(
    '/dara/inventory-copilot/pangeran-isopod-health',
  );
  const health = normalizeKolamPangeranIsopodHealth(payload);
  if (!health) {
    throw new Error('Kesehatan Pangeran Isopod kosong');
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

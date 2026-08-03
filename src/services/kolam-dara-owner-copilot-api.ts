import {appConfig} from '../config/app';
import {
  normalizeKolamOwnerCopilotDashboard,
  type KolamOwnerCopilotDashboard,
} from '../domain/kolam-pusat-ai-owner-copilot';
import {apiRequest} from '../lib/api-client';

type QueryValue = string | number | boolean | undefined | null;

interface DataResponse<T> {
  data: T;
}

/** GET /dara/owner-copilot/dashboard — FE `fetchOwnerCopilotDashboard`. */
export async function fetchKolamOwnerCopilotDashboard(
  lookbackHours = 24,
): Promise<KolamOwnerCopilotDashboard> {
  const payload = await kolamRequest<unknown>('/dara/owner-copilot/dashboard', {
    query: {lookbackHours},
  });
  const dash = normalizeKolamOwnerCopilotDashboard(payload);
  if (!dash) {
    throw new Error('Owner Copilot kosong');
  }
  return dash;
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

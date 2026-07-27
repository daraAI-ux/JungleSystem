import { appConfig } from '../config/app';
import {
  normalizeKolamCrossSyncObservabilityReport,
  type KolamCrossSyncObservabilityReport,
} from '../domain/kolam-cross-sync-observability';
import { apiRequest } from '../lib/api-client';

export async function getKolamCrossSyncObservability(options?: {
  windowHours?: number;
  stuckPendingMinutes?: number;
}): Promise<KolamCrossSyncObservabilityReport> {
  const response = await apiRequest<unknown>({
    path: '/marketplace/cross-sync-observability',
    query: {
      windowHours: options?.windowHours ?? 48,
      stuckPendingMinutes: options?.stuckPendingMinutes ?? 15,
    },
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  return normalizeKolamCrossSyncObservabilityReport(response);
}

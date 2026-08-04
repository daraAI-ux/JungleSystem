import {appConfig} from '../config/app';
import {
  normalizeKolamDaraTrainingStats,
  type KolamDaraTrainingStats,
} from '../domain/kolam-dara-training';
import {apiRequest} from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

/** GET /dara-training/stats */
export async function fetchKolamDaraTrainingStats(): Promise<KolamDaraTrainingStats> {
  const payload = await apiRequest<unknown | DataResponse<unknown>>({
    path: '/dara-training/stats',
    baseUrl: appConfig.kolamApiBaseUrl,
  });
  return normalizeKolamDaraTrainingStats(payload);
}

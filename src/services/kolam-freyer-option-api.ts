import { appConfig } from '../config/app';
import {
  normalizeKolamFreyerOptionList,
  type KolamFreyerOption,
} from '../domain/kolam-freyer-option';
import { apiRequest } from '../lib/api-client';

export async function getKolamFreyerOptions(options?: {
  limit?: number;
  page?: number;
}): Promise<KolamFreyerOption[]> {
  const response = await apiRequest<unknown>({
    path: '/freyer',
    query: {
      page: options?.page ?? 1,
      limit: options?.limit ?? 1000,
    },
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  return normalizeKolamFreyerOptionList(response);
}

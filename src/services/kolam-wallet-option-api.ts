import { appConfig } from '../config/app';
import {
  normalizeKolamWalletOptionList,
  type KolamWalletOption,
} from '../domain/kolam-wallet-option';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export async function getKolamWalletOptions(): Promise<KolamWalletOption[]> {
  const response = await apiRequest<unknown>({
    path: '/wallet',
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  return normalizeKolamWalletOptionList(response);
}

export async function getKolamWalletOptionsPaginated(options?: {
  limit?: number;
  page?: number;
}): Promise<KolamWalletOption[]> {
  const response = await apiRequest<unknown | DataResponse<unknown>>({
    path: '/wallet',
    query: {
      page: options?.page ?? 1,
      limit: options?.limit ?? 100,
    },
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  return normalizeKolamWalletOptionList(response);
}

import { appConfig } from '../config/app';
import {
  normalizeKolamFreyerIotDeviceList,
  type KolamFreyerIotDeviceListResult,
} from '../domain/kolam-freyer-iot-device';
import { apiRequest } from '../lib/api-client';

type QueryValue = string | number | boolean | undefined | null;

interface DataResponse<T> {
  data: T;
}

/** GET /freyer/devices — FE Freyr plugin `getIotFreyerDevices`. */
export async function getKolamFreyerIotDevices(options: {
  page?: number;
  limit?: number;
  search?: string;
  teranuraProductId?: string;
} = {}): Promise<KolamFreyerIotDeviceListResult> {
  const response = await kolamRequest<unknown>('/freyer/devices', {
    query: {
      page: options.page ?? 1,
      limit: options.limit ?? 50,
      search: options.search?.trim() || undefined,
      teranuraProductId: options.teranuraProductId?.trim() || undefined,
    },
  });

  return normalizeKolamFreyerIotDeviceList(response);
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

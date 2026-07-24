import { appConfig } from '../config/app';
import {
  normalizeKolamShippingMethodList,
  type KolamShippingMethod,
} from '../domain/kolam-shipping-method';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export async function getKolamActiveShippingMethods(): Promise<KolamShippingMethod[]> {
  const response = await kolamRequest<unknown>('/shipping-method/active');
  return normalizeKolamShippingMethodList(response);
}

function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    query?: Record<string, string | number | boolean | undefined | null>;
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

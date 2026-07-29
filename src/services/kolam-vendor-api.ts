import { appConfig } from '../config/app';
import {
  createKolamVendorSavePayload,
  normalizeKolamVendorDetail,
  normalizeKolamVendorList,
  type KolamVendor,
  type KolamVendorFormState,
} from '../domain/kolam-vendor';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

/** Picker-grade list (product/species HPP). */
export async function getKolamVendors(): Promise<KolamVendor[]> {
  const response = await kolamRequest<unknown>('/vendor', {
    query: {
      limit: 1000,
      page: 1,
    },
  });

  return normalizeKolamVendorList(response);
}

export async function getKolamVendor(id: string): Promise<KolamVendor> {
  const response = await kolamRequest<unknown>(
    `/vendor/${encodeURIComponent(id)}`,
  );
  return normalizeKolamVendorDetail(response);
}

export async function createKolamVendor(
  form: KolamVendorFormState,
): Promise<KolamVendor> {
  const response = await kolamRequest<unknown>('/vendor', {
    method: 'POST',
    body: createKolamVendorSavePayload(form),
  });
  return normalizeKolamVendorDetail(response);
}

export async function updateKolamVendor(
  id: string,
  form: KolamVendorFormState,
): Promise<KolamVendor> {
  const response = await kolamRequest<unknown>(
    `/vendor/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: createKolamVendorSavePayload(form),
    },
  );
  return normalizeKolamVendorDetail(response);
}

export async function deleteKolamVendor(id: string): Promise<void> {
  await kolamRequest<unknown>(`/vendor/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
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

import {appConfig} from '../config/app';
import {
  normalizeKolamCustomerDetail,
  normalizeKolamCustomerListResult,
  type KolamCustomer,
  type KolamCustomerListQuery,
  type KolamCustomerListResult,
  type KolamCustomerSavePayload,
} from '../domain/kolam-customer';
import {apiRequest} from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export async function getKolamCustomerList({
  limit = 10,
  page = 1,
  search,
}: KolamCustomerListQuery = {}): Promise<KolamCustomerListResult> {
  const response = await kolamRequest<unknown>('/customer', {
    query: {
      limit,
      page,
      ...(search?.trim() ? {search: search.trim()} : {}),
    },
  });

  return normalizeKolamCustomerListResult(response, {limit, page});
}

export async function getKolamCustomerDetail(
  id: string,
): Promise<KolamCustomer> {
  const response = await kolamRequest<unknown>(
    `/customer/${encodeURIComponent(id)}`,
  );
  const customer = normalizeKolamCustomerDetail(response);

  if (!customer) {
    throw new Error('Detail pelanggan tidak ditemukan.');
  }

  return customer;
}

export async function createKolamCustomer(
  payload: KolamCustomerSavePayload,
): Promise<KolamCustomer> {
  const response = await kolamRequest<unknown>('/customer', {
    method: 'POST',
    body: payload,
  });
  const customer = normalizeKolamCustomerDetail(response);

  if (!customer) {
    throw new Error('Pelanggan berhasil dibuat, tetapi respons tidak valid.');
  }

  return customer;
}

export async function updateKolamCustomer(
  id: string,
  payload: KolamCustomerSavePayload,
): Promise<KolamCustomer> {
  const response = await kolamRequest<unknown>(
    `/customer/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: payload,
    },
  );
  const customer = normalizeKolamCustomerDetail(response);

  if (!customer) {
    throw new Error('Pelanggan berhasil diperbarui, tetapi respons tidak valid.');
  }

  return customer;
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

import { appConfig } from '../config/app';
import {
  normalizeKolamVoucher,
  normalizeKolamVoucherList,
  type KolamVoucher,
  type KolamVoucherListQuery,
  type KolamVoucherListResult,
  type KolamVoucherStatus,
} from '../domain/kolam-voucher';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

/** GET /vouchers — FE `useGetVouchers`. */
export async function getKolamVouchers(
  query: KolamVoucherListQuery = {},
): Promise<KolamVoucherListResult> {
  const payload = await kolamRequest<unknown>('/vouchers', {
    query: {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      ...(query.search?.trim() ? { search: query.search.trim() } : {}),
      ...(query.status ? { status: query.status } : {}),
    },
  });
  return normalizeKolamVoucherList(payload, query);
}

/** PUT /vouchers/:id — FE toggle status (active ↔ inactive). */
export async function updateKolamVoucherStatus(
  id: string,
  status: Extract<KolamVoucherStatus, 'active' | 'inactive'>,
): Promise<KolamVoucher> {
  const payload = await kolamRequest<unknown>(
    `/vouchers/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: { status },
    },
  );
  return normalizeKolamVoucher(unwrapData(payload));
}

/** DELETE /vouchers/:id — FE `useDeleteVoucher`. */
export async function deleteKolamVoucher(id: string): Promise<void> {
  await kolamRequest<unknown>(`/vouchers/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

function unwrapData(payload: unknown): unknown {
  const record =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : null;
  if (record && 'data' in record && record.data != null) {
    return record.data;
  }
  return payload;
}

function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    query?: Record<string, string | number | boolean | undefined>;
  } = {},
) {
  return apiRequest<T | DataResponse<T>>({
    method: options.method ?? 'GET',
    path,
    body: options.body,
    query: options.query,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  }) as Promise<T>;
}

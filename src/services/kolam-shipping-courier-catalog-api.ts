import { appConfig } from '../config/app';
import {
  normalizeKolamShippingCourierCatalogItem,
  normalizeKolamShippingCourierCatalogList,
  type KolamShippingCourierCatalogItem,
} from '../domain/kolam-shipping-courier-catalog';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export type GetKolamShippingCourierCatalogParams = {
  search?: string;
  isActive?: boolean;
  provider?: 'biteship';
  limit?: number;
};

export type KolamSyncBiteshipCourierCatalogResult = {
  message: string;
  received: number;
  upserted: number;
};

export async function getKolamShippingCourierCatalog(
  params: GetKolamShippingCourierCatalogParams = {},
): Promise<KolamShippingCourierCatalogItem[]> {
  const response = await kolamRequest<unknown>('/shipping-courier-catalog', {
    query: {
      provider: params.provider ?? 'biteship',
      limit: params.limit ?? 2000,
      search: params.search?.trim() || undefined,
      isActive: params.isActive,
    },
  });
  return normalizeKolamShippingCourierCatalogList(response);
}

export async function syncKolamBiteshipCourierCatalog(): Promise<KolamSyncBiteshipCourierCatalogResult> {
  const response = await kolamRequest<unknown>(
    '/shipping-courier-catalog/sync-biteship',
    { method: 'POST' },
  );
  const record = asRecord(unwrapData(response));
  return {
    message: getString(record, 'message') || 'Sinkronisasi selesai',
    received: Math.max(0, getNumber(record, 'received') ?? 0),
    upserted: Math.max(0, getNumber(record, 'upserted') ?? 0),
  };
}

export async function patchKolamShippingCourierCatalogItem(
  id: string,
  patch: Pick<KolamShippingCourierCatalogItem, 'isActive'>,
): Promise<KolamShippingCourierCatalogItem> {
  const response = await kolamRequest<unknown>(
    `/shipping-courier-catalog/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: patch,
    },
  );
  return normalizeKolamShippingCourierCatalogItem(response);
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

function unwrapData(payload: unknown): unknown {
  const record = asRecord(payload);
  if ('data' in record && !Array.isArray(payload)) {
    return record.data;
  }
  return payload;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

function getNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

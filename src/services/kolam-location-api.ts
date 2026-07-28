import { appConfig } from '../config/app';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export interface KolamLocationOption {
  id: string;
  name: string;
  label: string;
  type: string;
  tier: string;
}

export type KolamLocationListTypeFilter =
  | 'warehouse'
  | 'floor'
  | 'rack'
  | 'store'
  | 'area';

export interface KolamLocationParentRef {
  id: string;
  name: string;
  type: string;
  tier: string;
}

export interface KolamLocationListItem {
  id: string;
  name: string;
  type: string;
  tier: string;
  parent: KolamLocationParentRef | null;
  description: string;
  address: string;
  mapsUrl: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface KolamLocationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface KolamLocationListQuery {
  limit?: number;
  name?: string;
  page?: number;
  type?: KolamLocationListTypeFilter | '';
}

export interface KolamLocationListResult {
  items: KolamLocationListItem[];
  pagination: KolamLocationPagination;
}

export async function getKolamLocations(): Promise<KolamLocationOption[]> {
  const response = await kolamRequest<unknown>('/location', {
    query: {
      limit: 1000,
      page: 1,
    },
  });

  return normalizeKolamLocationList(response);
}

export async function getKolamLocationList({
  limit = 20,
  name,
  page = 1,
  type,
}: KolamLocationListQuery = {}): Promise<KolamLocationListResult> {
  const response = await kolamRequest<unknown>('/location', {
    query: {
      limit,
      page,
      ...(name?.trim() ? {name: name.trim()} : {}),
      ...(type ? {type} : {}),
    },
  });

  return normalizeKolamLocationListResult(response, {limit, page});
}

function normalizeKolamLocationListResult(
  payload: unknown,
  fallback: Required<Pick<KolamLocationListQuery, 'limit' | 'page'>>,
): KolamLocationListResult {
  const record = asRecord(payload);
  const rows = Array.isArray(record.data)
    ? record.data
    : Array.isArray(payload)
      ? payload
      : [];

  return {
    items: rows
      .map(normalizeKolamLocationListItem)
      .filter((item): item is KolamLocationListItem => Boolean(item)),
    pagination: normalizeKolamLocationPagination(
      record.pagination,
      rows.length,
      fallback,
    ),
  };
}

function normalizeKolamLocationListItem(
  value: unknown,
): KolamLocationListItem | null {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  const name = getString(record, 'name');

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    type: getString(record, 'type'),
    tier: getString(record, 'tier'),
    parent: normalizeKolamLocationParent(record.parent),
    description: getString(record, 'description'),
    address: getString(record, 'address'),
    mapsUrl: getString(record, 'mapsUrl'),
    phoneNumber: getString(record, 'phoneNumber'),
    createdAt: getString(record, 'createdAt'),
    updatedAt: getString(record, 'updatedAt'),
  };
}

function normalizeKolamLocationParent(
  value: unknown,
): KolamLocationParentRef | null {
  if (typeof value === 'string') {
    return value.trim()
      ? {id: value.trim(), name: '', type: '', tier: ''}
      : null;
  }

  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');

  if (!id) {
    return null;
  }

  return {
    id,
    name: getString(record, 'name'),
    type: getString(record, 'type'),
    tier: getString(record, 'tier'),
  };
}

function normalizeKolamLocationPagination(
  value: unknown,
  itemCount: number,
  fallback: Required<Pick<KolamLocationListQuery, 'limit' | 'page'>>,
): KolamLocationPagination {
  const record = asRecord(value);
  const page = Math.max(1, getNumber(record, 'page') ?? fallback.page);
  const limit = Math.max(1, getNumber(record, 'limit') ?? fallback.limit);
  const total = Math.max(0, getNumber(record, 'total') ?? itemCount);
  const totalPages =
    getNumber(record, 'totalPages') ?? Math.max(1, Math.ceil(total / limit));

  return {limit, page, total, totalPages: Math.max(1, totalPages)};
}

function normalizeKolamLocationList(payload: unknown): KolamLocationOption[] {
  const record = asRecord(payload);
  const rows = Array.isArray(record.data)
    ? record.data
    : Array.isArray(payload)
      ? payload
      : [];

  return rows
    .map(normalizeKolamLocationOption)
    .filter((location): location is KolamLocationOption => Boolean(location));
}

function normalizeKolamLocationOption(value: unknown): KolamLocationOption | null {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  const name = getString(record, 'name');

  if (!id || !name) {
    return null;
  }

  const type = getString(record, 'type');
  const tier = getString(record, 'tier');
  const parent = asRecord(record.parent);
  const parentName = getString(parent, 'name');
  const label = [name, parentName, type].filter(Boolean).join(' - ');

  return {
    id,
    name,
    label: label || name,
    type,
    tier,
  };
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

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
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

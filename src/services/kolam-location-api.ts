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

export async function getKolamLocations(): Promise<KolamLocationOption[]> {
  const response = await kolamRequest<unknown>('/location', {
    query: {
      limit: 1000,
      page: 1,
    },
  });

  return normalizeKolamLocationList(response);
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

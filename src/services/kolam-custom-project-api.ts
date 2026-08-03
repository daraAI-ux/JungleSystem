import { appConfig } from '../config/app';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export interface KolamCustomProjectOption {
  id: string;
  label: string;
  quotationNumber: string;
}

export async function getKolamCustomProjectOptions({
  limit = 200,
  page = 1,
}: {
  limit?: number;
  page?: number;
} = {}): Promise<KolamCustomProjectOption[]> {
  const response = await kolamRequest<unknown>('/custom-project', {
    query: { limit, page },
  });
  return normalizeKolamCustomProjectOptions(response);
}

function normalizeKolamCustomProjectOptions(
  payload: unknown,
): KolamCustomProjectOption[] {
  const record = asRecord(payload);
  const data = asRecord(record.data);
  const rows = Array.isArray(data.data)
    ? data.data
    : Array.isArray(record.data)
      ? record.data
      : Array.isArray(record.items)
        ? record.items
        : Array.isArray(payload)
          ? payload
          : [];

  return rows
    .map(row => {
      const item = asRecord(row);
      const id = getString(item, '_id') || getString(item, 'id');
      if (!id) return null;
      const quotationNumber = getString(item, 'quotationNumber');
      const label =
        quotationNumber ||
        getString(item, 'title') ||
        getString(item, 'name') ||
        id;
      return { id, label, quotationNumber };
    })
    .filter((item): item is KolamCustomProjectOption => Boolean(item));
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

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

import { appConfig } from '../config/app';
import {
  createKolamUnitSavePayload,
  normalizeKolamUnitDetail,
  normalizeKolamUnitList,
  type KolamUnit,
  type KolamUnitFormState,
} from '../domain/kolam-unit';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export async function getKolamUnits(): Promise<KolamUnit[]> {
  const response = await kolamRequest<unknown>('/all-units', {
    query: {
      limit: 1000,
      page: 1,
    },
  });

  return normalizeKolamUnitList(response);
}

export async function getKolamUnit(id: string): Promise<KolamUnit> {
  const response = await kolamRequest<unknown>(`/units/${encodeURIComponent(id)}`);
  return normalizeKolamUnitDetail(response);
}

export async function createKolamUnit(
  form: KolamUnitFormState,
): Promise<KolamUnit> {
  const response = await kolamRequest<unknown>('/units', {
    method: 'POST',
    body: createKolamUnitSavePayload(form),
  });

  return normalizeKolamUnitDetail(response);
}

export async function updateKolamUnit(
  id: string,
  form: KolamUnitFormState,
): Promise<KolamUnit> {
  const response = await kolamRequest<unknown>(`/units/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: createKolamUnitSavePayload(form),
  });

  return normalizeKolamUnitDetail(response);
}

export async function deleteKolamUnit(id: string): Promise<void> {
  await kolamRequest<unknown>(`/units/${encodeURIComponent(id)}`, {
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

import { appConfig } from '../config/app';
import {
  createKolamTagSavePayload,
  normalizeKolamTagDetail,
  normalizeKolamTagList,
  type KolamTag,
  type KolamTagFormState,
} from '../domain/kolam-tag';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export async function getKolamTags(): Promise<KolamTag[]> {
  const response = await kolamRequest<unknown>('/tag', {
    query: {
      limit: 1000,
      page: 1,
    },
  });

  return normalizeKolamTagList(response);
}

export async function getKolamTag(id: string): Promise<KolamTag> {
  const response = await kolamRequest<unknown>(
    `/tag/${encodeURIComponent(id)}`,
  );

  return normalizeKolamTagDetail(response);
}

export async function createKolamTag(
  form: KolamTagFormState,
): Promise<KolamTag> {
  const response = await kolamRequest<unknown>('/tag', {
    method: 'POST',
    body: createKolamTagSavePayload(form),
  });

  return normalizeKolamTagDetail(response);
}

export async function updateKolamTag(
  id: string,
  form: KolamTagFormState,
): Promise<KolamTag> {
  const response = await kolamRequest<unknown>(
    `/tag/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: createKolamTagSavePayload(form),
    },
  );

  return normalizeKolamTagDetail(response);
}

export async function deleteKolamTag(id: string): Promise<void> {
  await kolamRequest<unknown>(`/tag/${encodeURIComponent(id)}`, {
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

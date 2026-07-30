import { appConfig } from '../config/app';
import {
  createKolamSourceSavePayload,
  normalizeKolamActiveSourceOptions,
  normalizeKolamSourceDetail,
  normalizeKolamSourceList,
  type KolamSource,
  type KolamSourceActiveOption,
  type KolamSourceFormState,
  type KolamSourceListQuery,
  type KolamSourceListResult,
} from '../domain/kolam-source';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export async function getKolamSources(
  query: KolamSourceListQuery = {},
): Promise<KolamSourceListResult> {
  const payload = await kolamRequest<unknown>('/source', {
    query: {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      ...(query.search?.trim() ? { search: query.search.trim() } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(typeof query.isActive === 'boolean'
        ? { isActive: query.isActive }
        : {}),
    },
  });
  return normalizeKolamSourceList(payload, query);
}

export async function getKolamSource(id: string): Promise<KolamSource> {
  const payload = await kolamRequest<unknown>(
    `/source/${encodeURIComponent(id)}`,
  );
  return normalizeKolamSourceDetail(payload);
}

export async function getKolamActiveSources(options?: {
  type?: 'online' | 'offline';
}): Promise<KolamSourceActiveOption[]> {
  const payload = await kolamRequest<unknown>('/source/active', {
    query: {
      isActive: true,
      ...(options?.type ? { type: options.type } : {}),
    },
  });
  return normalizeKolamActiveSourceOptions(payload);
}

export async function createKolamSource(
  form: KolamSourceFormState,
): Promise<KolamSource> {
  const payload = await kolamRequest<unknown>('/source', {
    method: 'POST',
    body: createKolamSourceSavePayload(form),
  });
  return normalizeKolamSourceDetail(payload);
}

export async function updateKolamSource(
  id: string,
  form: KolamSourceFormState,
): Promise<KolamSource> {
  const payload = await kolamRequest<unknown>(
    `/source/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: createKolamSourceSavePayload(form),
    },
  );
  return normalizeKolamSourceDetail(payload);
}

export async function patchKolamSource(
  id: string,
  body: Record<string, unknown>,
): Promise<KolamSource> {
  const payload = await kolamRequest<unknown>(
    `/source/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body,
    },
  );
  return normalizeKolamSourceDetail(payload);
}

export async function deleteKolamSource(id: string): Promise<void> {
  await kolamRequest<unknown>(`/source/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function uploadKolamSourceLogo(
  id: string,
  localUri: string,
): Promise<KolamSource> {
  const body = new FormData();
  body.append('logo', createReactNativeFilePart(localUri) as unknown as Blob);

  const payload = await kolamRequest<unknown>(
    `/source/${encodeURIComponent(id)}/upload-logo`,
    {
      method: 'POST',
      body,
    },
  );
  return normalizeKolamSourceDetail(payload);
}

export async function deleteKolamSourceLogo(id: string): Promise<KolamSource> {
  const payload = await kolamRequest<unknown>(
    `/source/${encodeURIComponent(id)}/delete-logo`,
    {
      method: 'DELETE',
    },
  );
  return normalizeKolamSourceDetail(payload);
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

function createReactNativeFilePart(localUri: string) {
  const normalizedUri = localUri.startsWith('file://')
    ? localUri
    : `file:///${localUri.replace(/\\/g, '/')}`;
  const name = normalizedUri.split('/').pop() || 'source-logo.jpg';

  return {
    uri: normalizedUri,
    name,
    type: inferLogoMimeType(name),
  };
}

function inferLogoMimeType(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
}

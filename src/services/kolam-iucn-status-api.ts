import { appConfig } from '../config/app';
import {
  createKolamIucnStatusSavePayload,
  normalizeKolamIucnStatusDetail,
  normalizeKolamIucnStatusList,
  type KolamIucnStatus,
  type KolamIucnStatusFormState,
} from '../domain/kolam-iucn-status';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export async function getKolamIucnStatuses(options: {
  limit?: number;
  page?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
} = {}): Promise<KolamIucnStatus[]> {
  const response = await kolamRequest<unknown>('/iucn-status', {
    query: {
      limit: options.limit ?? 1000,
      page: options.page ?? 1,
      search: options.search,
      sortBy: options.sortBy ?? 'order',
      sortOrder: options.sortOrder ?? 'asc',
      status: options.status,
    },
  });

  return normalizeKolamIucnStatusList(response);
}

export async function getKolamIucnStatus(id: string): Promise<KolamIucnStatus> {
  const response = await kolamRequest<unknown>(
    `/iucn-status/${encodeURIComponent(id)}`,
  );
  return normalizeKolamIucnStatusDetail(response);
}

export async function createKolamIucnStatus(
  form: KolamIucnStatusFormState,
): Promise<KolamIucnStatus> {
  const response = await kolamRequest<unknown>('/iucn-status', {
    method: 'POST',
    body: createKolamIucnStatusSavePayload(form),
  });

  return normalizeKolamIucnStatusDetail(response);
}

export async function updateKolamIucnStatus(
  id: string,
  form: KolamIucnStatusFormState,
): Promise<KolamIucnStatus> {
  const response = await kolamRequest<unknown>(
    `/iucn-status/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: createKolamIucnStatusSavePayload(form),
    },
  );

  return normalizeKolamIucnStatusDetail(response);
}

export async function uploadKolamIucnStatusImage(
  id: string,
  localUri: string,
): Promise<KolamIucnStatus> {
  const body = new FormData();
  body.append('image', createReactNativeFilePart(localUri) as unknown as Blob);
  const response = await kolamRequest<unknown>(
    `/iucn-status/${encodeURIComponent(id)}/image`,
    {
      method: 'POST',
      body,
    },
  );

  return normalizeKolamIucnStatusDetail(response);
}

export async function deleteKolamIucnStatus(id: string): Promise<void> {
  await kolamRequest<unknown>(`/iucn-status/${encodeURIComponent(id)}`, {
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

function createReactNativeFilePart(localUri: string) {
  const normalizedUri = localUri.startsWith('file://')
    ? localUri
    : `file:///${localUri.replace(/\\/g, '/')}`;
  const name = normalizedUri.split('/').pop() || 'iucn-status.jpg';

  return {
    uri: normalizedUri,
    name,
    type: inferImageMimeType(name),
  };
}

function inferImageMimeType(fileName: string) {
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

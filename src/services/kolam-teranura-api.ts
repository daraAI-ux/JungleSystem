import { appConfig } from '../config/app';
import {
  normalizeKolamTeranuraDetail,
  normalizeKolamTeranuraList,
  type KolamTeranura,
  type KolamTeranuraListResult,
  type KolamTeranuraSortBy,
  type KolamTeranuraSortOrder,
} from '../domain/kolam-teranura';
import { apiRequest } from '../lib/api-client';

type QueryValue = string | number | boolean | string[] | undefined | null;

interface DataResponse<T> {
  data: T;
}

export interface GetKolamTeranurasOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string | string[];
  brand?: string | string[];
  sellable?: boolean | string;
  sortBy?: KolamTeranuraSortBy | string;
  sortOrder?: KolamTeranuraSortOrder;
  includeAllLines?: boolean;
}

export async function getKolamTeranuras(
  options: GetKolamTeranurasOptions = {},
): Promise<KolamTeranuraListResult> {
  const response = await kolamRequest<unknown>('/teranura', {
    query: createTeranuraQuery(options),
  });

  return normalizeKolamTeranuraList(response);
}

export async function getKolamTeranuraDetail(
  teranuraId: string,
): Promise<KolamTeranura> {
  const response = await kolamRequest<unknown>(
    `/teranura/${encodeURIComponent(teranuraId)}`,
  );

  return normalizeKolamTeranuraDetail(response);
}

export async function createKolamTeranura(
  body: Record<string, unknown>,
): Promise<KolamTeranura> {
  const response = await kolamRequest<unknown>('/teranura', {
    method: 'POST',
    body,
  });

  return normalizeKolamTeranuraDetail(response);
}

export async function updateKolamTeranura(
  teranuraId: string,
  body: Record<string, unknown>,
): Promise<KolamTeranura> {
  const response = await kolamRequest<unknown>(
    `/teranura/${encodeURIComponent(teranuraId)}`,
    {
      method: 'PUT',
      body,
    },
  );

  return normalizeKolamTeranuraDetail(response);
}

export async function uploadKolamTeranuraPhoto(
  teranuraId: string,
  localUri: string,
  variantId?: string,
): Promise<KolamTeranura> {
  const body = new FormData();
  body.append(
    'photos',
    createReactNativeFilePart(localUri, 'teranura-photo') as unknown as Blob,
  );
  if (variantId) {
    body.append('variant', variantId);
  }

  const response = await kolamRequest<unknown>(
    `/teranura/${encodeURIComponent(teranuraId)}/photos`,
    {
      method: 'POST',
      body,
    },
  );

  return normalizeKolamTeranuraDetail(response);
}

export async function deleteKolamTeranuraPhoto(
  teranuraId: string,
  index: number,
  variantId?: string,
): Promise<KolamTeranura> {
  const response = await kolamRequest<unknown>(
    `/teranura/${encodeURIComponent(teranuraId)}/photos/${index}`,
    {
      method: 'DELETE',
      query: variantId ? { variant: variantId } : undefined,
    },
  );

  return normalizeKolamTeranuraDetail(response);
}

export async function uploadKolamTeranuraVideo(
  teranuraId: string,
  localUri: string,
): Promise<KolamTeranura> {
  const body = new FormData();
  body.append(
    'videos',
    createReactNativeFilePart(localUri, 'teranura-video') as unknown as Blob,
  );

  const response = await kolamRequest<unknown>(
    `/teranura/${encodeURIComponent(teranuraId)}/videos`,
    {
      method: 'POST',
      body,
    },
  );

  return normalizeKolamTeranuraDetail(response);
}

export async function deleteKolamTeranuraVideo(
  teranuraId: string,
  index: number,
): Promise<KolamTeranura> {
  const response = await kolamRequest<unknown>(
    `/teranura/${encodeURIComponent(teranuraId)}/videos/${index}`,
    {
      method: 'DELETE',
    },
  );

  return normalizeKolamTeranuraDetail(response);
}

function createTeranuraQuery(
  options: GetKolamTeranurasOptions,
): Record<string, QueryValue> {
  return {
    page: options.page,
    limit: options.limit,
    search: options.search || undefined,
    category: options.category,
    brand: options.brand,
    sellable: options.sellable,
    sortBy: options.sortBy,
    sortOrder: options.sortOrder,
    includeAllLines: options.includeAllLines ?? true,
  };
}

function createReactNativeFilePart(
  localUri: string,
  fallbackName = 'teranura-media',
) {
  const normalizedUri = localUri.startsWith('file://')
    ? localUri
    : `file:///${localUri.replace(/\\/g, '/')}`;
  const name = normalizedUri.split('/').pop() || fallbackName;

  return {
    uri: normalizedUri,
    name,
    type: inferFileMimeType(name),
  };
}

function inferFileMimeType(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'mp4':
      return 'video/mp4';
    case 'mov':
      return 'video/quicktime';
    case 'webm':
      return 'video/webm';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    default:
      return 'application/octet-stream';
  }
}

function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    query?: Record<string, QueryValue>;
    body?: unknown;
    headers?: Record<string, string>;
  } = {},
) {
  return apiRequest<T | DataResponse<T>>({
    method: options.method ?? 'GET',
    path,
    query: options.query,
    body: options.body,
    headers: options.headers,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  }) as Promise<T>;
}

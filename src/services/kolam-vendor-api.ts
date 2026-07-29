import { appConfig } from '../config/app';
import {
  createKolamVendorSavePayload,
  normalizeKolamVendorDetail,
  normalizeKolamVendorList,
  type KolamVendor,
  type KolamVendorFormState,
} from '../domain/kolam-vendor';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

/** Picker-grade list (product/species HPP). */
export async function getKolamVendors(): Promise<KolamVendor[]> {
  const response = await kolamRequest<unknown>('/vendor', {
    query: {
      limit: 1000,
      page: 1,
    },
  });

  return normalizeKolamVendorList(response);
}

export async function getKolamVendor(id: string): Promise<KolamVendor> {
  const response = await kolamRequest<unknown>(
    `/vendor/${encodeURIComponent(id)}`,
  );
  return normalizeKolamVendorDetail(response);
}

export async function createKolamVendor(
  form: KolamVendorFormState,
): Promise<KolamVendor> {
  const response = await kolamRequest<unknown>('/vendor', {
    method: 'POST',
    body: createKolamVendorSavePayload(form),
  });
  return normalizeKolamVendorDetail(response);
}

export async function updateKolamVendor(
  id: string,
  form: KolamVendorFormState,
): Promise<KolamVendor> {
  const response = await kolamRequest<unknown>(
    `/vendor/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: createKolamVendorSavePayload(form),
    },
  );
  return normalizeKolamVendorDetail(response);
}

export async function deleteKolamVendor(id: string): Promise<void> {
  await kolamRequest<unknown>(`/vendor/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

/** Multipart field name matches FE/BE: `photos` (max 5 per request). */
export async function uploadKolamVendorPhotos(
  id: string,
  localUris: string[],
): Promise<KolamVendor> {
  const uris = localUris.map(uri => uri.trim()).filter(Boolean);
  if (!uris.length) {
    return getKolamVendor(id);
  }

  const body = new FormData();
  uris.slice(0, 5).forEach((localUri, index) => {
    body.append(
      'photos',
      createReactNativeFilePart(localUri, `vendor-photo-${index + 1}`) as unknown as Blob,
    );
  });

  await kolamRequest<unknown>(`/vendor/${encodeURIComponent(id)}/photos`, {
    method: 'POST',
    body,
  });

  // BE returns { photos } only — refresh full vendor for caches/UI.
  return getKolamVendor(id);
}

export async function deleteKolamVendorPhoto(
  id: string,
  index: number,
): Promise<KolamVendor> {
  await kolamRequest<unknown>(
    `/vendor/${encodeURIComponent(id)}/photos/${index}`,
    {
      method: 'DELETE',
    },
  );
  return getKolamVendor(id);
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

function createReactNativeFilePart(localUri: string, fallbackName: string) {
  const normalizedUri = localUri.startsWith('file://')
    ? localUri
    : `file:///${localUri.replace(/\\/g, '/')}`;
  const name = normalizedUri.split('/').pop() || `${fallbackName}.jpg`;

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

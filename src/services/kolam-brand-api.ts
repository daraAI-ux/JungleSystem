import { appConfig } from '../config/app';
import {
  createKolamBrandSavePayload,
  normalizeKolamBrandDetail,
  normalizeKolamBrandList,
  type KolamBrand,
  type KolamBrandFormState,
} from '../domain/kolam-brand';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export async function getKolamBrands(): Promise<KolamBrand[]> {
  const response = await kolamRequest<unknown>('/brand');
  return normalizeKolamBrandList(response);
}

export async function getKolamBrand(id: string): Promise<KolamBrand> {
  const response = await kolamRequest<unknown>(
    `/brand/${encodeURIComponent(id)}`,
  );
  return normalizeKolamBrandDetail(response);
}

export async function createKolamBrand(
  form: KolamBrandFormState,
): Promise<KolamBrand> {
  const response = await kolamRequest<unknown>('/brand', {
    method: 'POST',
    body: createKolamBrandSavePayload(form),
  });

  return normalizeKolamBrandDetail(response);
}

export async function updateKolamBrand(
  id: string,
  form: KolamBrandFormState,
): Promise<KolamBrand> {
  const response = await kolamRequest<unknown>(
    `/brand/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: createKolamBrandSavePayload(form),
    },
  );

  return normalizeKolamBrandDetail(response);
}

export async function deleteKolamBrand(id: string): Promise<void> {
  await kolamRequest<unknown>(`/brand/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function uploadKolamBrandLogo(
  id: string,
  localUri: string,
): Promise<KolamBrand> {
  const body = new FormData();
  body.append('photos', createReactNativeFilePart(localUri) as unknown as Blob);

  const response = await kolamRequest<unknown>(
    `/brand/${encodeURIComponent(id)}/upload-photos`,
    {
      method: 'POST',
      body,
    },
  );

  return normalizeKolamBrandDetail(response);
}

function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
  } = {},
) {
  return apiRequest<T | DataResponse<T>>({
    method: options.method ?? 'GET',
    path,
    body: options.body,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  }) as Promise<T>;
}

function createReactNativeFilePart(localUri: string) {
  const normalizedUri = localUri.startsWith('file://')
    ? localUri
    : `file:///${localUri.replace(/\\/g, '/')}`;
  const name = normalizedUri.split('/').pop() || 'brand-logo.jpg';

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

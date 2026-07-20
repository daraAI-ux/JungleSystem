import { appConfig } from '../config/app';
import {
  createKolamCustomFieldSavePayload,
  normalizeKolamCustomFieldDetail,
  normalizeKolamCustomFieldList,
  normalizeKolamCustomFieldUnits,
  type KolamCustomField,
  type KolamCustomFieldFormState,
  type KolamCustomFieldUnit,
} from '../domain/kolam-custom-field';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export async function getKolamCustomFields(): Promise<KolamCustomField[]> {
  const response = await kolamRequest<unknown>('/custom-fields', {
    query: {
      limit: 1000,
      page: 1,
    },
  });

  return normalizeKolamCustomFieldList(response);
}

export async function getKolamCustomField(
  id: string,
): Promise<KolamCustomField> {
  const response = await kolamRequest<unknown>(
    `/custom-fields/${encodeURIComponent(id)}`,
  );

  return normalizeKolamCustomFieldDetail(response);
}

export async function getKolamCustomFieldUnits(): Promise<
  KolamCustomFieldUnit[]
> {
  const response = await kolamRequest<unknown>('/all-units', {
    query: {
      limit: 1000,
      page: 1,
    },
  });

  return normalizeKolamCustomFieldUnits(response);
}

export async function createKolamCustomField(
  form: KolamCustomFieldFormState,
): Promise<KolamCustomField> {
  const response = await kolamRequest<unknown>('/custom-fields', {
    method: 'POST',
    body: createKolamCustomFieldSavePayload(form),
  });

  return normalizeKolamCustomFieldDetail(response);
}

export async function updateKolamCustomField(
  id: string,
  form: KolamCustomFieldFormState,
): Promise<KolamCustomField> {
  const response = await kolamRequest<unknown>(
    `/custom-fields/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: createKolamCustomFieldSavePayload(form),
    },
  );

  return normalizeKolamCustomFieldDetail(response);
}

export async function updateKolamCustomFieldStatus(
  id: string,
  status: 'active' | 'inactive',
): Promise<KolamCustomField> {
  const response =
    status === 'inactive'
      ? await kolamRequest<unknown>(
          `/custom-fields/${encodeURIComponent(id)}/deactivate`,
          { method: 'POST' },
        )
      : await kolamRequest<unknown>(`/custom-fields/${encodeURIComponent(id)}`, {
          method: 'PUT',
          body: { status: 'active' },
        });

  return normalizeKolamCustomFieldDetail(response);
}

export async function deleteKolamCustomField(id: string): Promise<void> {
  await kolamRequest<unknown>(`/custom-fields/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function uploadKolamCustomFieldIcon(
  id: string,
  localUri: string,
): Promise<KolamCustomField> {
  const body = new FormData();
  body.append('icon', createReactNativeFilePart(localUri) as unknown as Blob);

  await kolamRequest<unknown>(
    `/custom-fields/${encodeURIComponent(id)}/icon`,
    {
      method: 'POST',
      body,
    },
  );

  return getKolamCustomField(id);
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
  const name = normalizedUri.split('/').pop() || 'custom-field-icon.jpg';

  return {
    uri: normalizedUri,
    name,
    type: inferIconMimeType(name),
  };
}

function inferIconMimeType(fileName: string) {
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

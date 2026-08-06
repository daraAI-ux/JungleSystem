import { appConfig } from '../config/app';
import {
  createKolamPackingMaterialSavePayload,
  normalizeKolamPackingCatalogUsageList,
  normalizeKolamPackingMaterialDetail,
  normalizeKolamPackingMaterialList,
  normalizeKolamPackingOptionList,
  type KolamPackingCatalogUsageRow,
  type KolamPackingMaterial,
  type KolamPackingMaterialFormState,
  type KolamPackingOption,
} from '../domain/kolam-packing-option';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export async function getKolamPackingOptions(): Promise<KolamPackingOption[]> {
  const response = await kolamRequest<unknown>('/packing', {
    query: { enabled: true, limit: 1000, page: 1 },
  });
  return normalizeKolamPackingOptionList(response);
}

export async function getKolamPackingMaterials(options: {
  category?: string;
  enabled?: boolean;
  limit?: number;
  page?: number;
} = {}): Promise<KolamPackingMaterial[]> {
  const response = await kolamRequest<unknown>('/packing', {
    query: {
      category: options.category,
      enabled: options.enabled,
      limit: options.limit ?? 1000,
      page: options.page ?? 1,
    },
  });

  return normalizeKolamPackingMaterialList(response);
}

export async function getKolamPackingMaterial(id: string): Promise<KolamPackingMaterial> {
  const response = await kolamRequest<unknown>(`/packing/${encodeURIComponent(id)}`);
  return normalizeKolamPackingMaterialDetail(response);
}

export async function createKolamPackingMaterial(
  form: KolamPackingMaterialFormState,
): Promise<KolamPackingMaterial> {
  const response = await kolamRequest<unknown>('/packing', {
    method: 'POST',
    body: createKolamPackingMaterialSavePayload(form),
  });

  return normalizeKolamPackingMaterialDetail(response);
}

export async function updateKolamPackingMaterial(
  id: string,
  form: KolamPackingMaterialFormState,
): Promise<KolamPackingMaterial> {
  const response = await kolamRequest<unknown>(`/packing/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: createKolamPackingMaterialSavePayload(form),
  });

  return normalizeKolamPackingMaterialDetail(response);
}

export async function getKolamPackingMaterialUsedIn(
  id: string,
): Promise<KolamPackingCatalogUsageRow[]> {
  const response = await kolamRequest<unknown>(
    `/packing/${encodeURIComponent(id)}/used-in`,
  );

  return normalizeKolamPackingCatalogUsageList(response);
}

export async function uploadKolamPackingMaterialAsset(
  id: string,
  title: string,
  localUri: string,
): Promise<KolamPackingMaterial> {
  const body = new FormData();
  body.append('title', title.trim());
  body.append('file', createReactNativeFilePart(localUri, 'packing-asset') as unknown as Blob);

  await kolamRequest<unknown>(`/packing/${encodeURIComponent(id)}/assets`, {
    method: 'POST',
    body,
  });

  return getKolamPackingMaterial(id);
}

export async function uploadKolamPackingMaterialPhotos(
  id: string,
  localUris: string[],
): Promise<KolamPackingMaterial> {
  const body = new FormData();
  localUris.forEach((localUri, index) => {
    body.append(
      'photos',
      createReactNativeFilePart(
        localUri,
        `packing-photo-${index + 1}`,
      ) as unknown as Blob,
    );
  });

  await kolamRequest<unknown>(`/packing/${encodeURIComponent(id)}/photos`, {
    method: 'POST',
    body,
  });

  return getKolamPackingMaterial(id);
}

export async function deleteKolamPackingMaterialAsset(
  id: string,
  assetId: string,
): Promise<KolamPackingMaterial> {
  await kolamRequest<unknown>(
    `/packing/${encodeURIComponent(id)}/assets/${encodeURIComponent(assetId)}`,
    { method: 'DELETE' },
  );

  return getKolamPackingMaterial(id);
}

export async function deleteKolamPackingMaterialPhoto(
  id: string,
  index: number,
): Promise<KolamPackingMaterial> {
  await kolamRequest<unknown>(
    `/packing/${encodeURIComponent(id)}/photos/${encodeURIComponent(String(index))}`,
    { method: 'DELETE' },
  );

  return getKolamPackingMaterial(id);
}
export async function deleteKolamPackingMaterial(id: string): Promise<void> {
  await kolamRequest<unknown>(`/packing/${encodeURIComponent(id)}`, {
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

function createReactNativeFilePart(localUri: string, fallbackName = 'packing-asset') {
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
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
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

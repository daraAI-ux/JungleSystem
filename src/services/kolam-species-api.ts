import { appConfig } from '../config/app';
import {
  createKolamSpeciesSavePayload,
  normalizeKolamSpeciesDetail,
  normalizeKolamSpeciesList,
  type KolamSpecies,
  type KolamSpeciesFormState,
  type KolamSpeciesSellableFilter,
  type KolamSpeciesStockStatus,
  type KolamSpeciesStatus,
} from '../domain/kolam-species';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export async function getKolamSpeciesList(options: {
  category?: string;
  limit?: number;
  page?: number;
  search?: string;
  sellable?: KolamSpeciesSellableFilter;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: 'all' | KolamSpeciesStatus;
  stockStatus?: KolamSpeciesStockStatus;
  taxonomyId?: string;
} = {}): Promise<KolamSpecies[]> {
  const response = await kolamRequest<unknown>('/species', {
    query: {
      category: options.category,
      limit: options.limit ?? 1000,
      page: options.page ?? 1,
      search: options.search,
      sellable:
        options.sellable === 'all'
          ? undefined
          : options.sellable === 'sellable'
          ? true
          : options.sellable === 'not-sellable'
          ? false
          : undefined,
      sortBy: options.sortBy,
      sortOrder: options.sortOrder,
      status: options.status === 'all' ? undefined : options.status,
      stockStatus:
        options.stockStatus === 'all' ? undefined : options.stockStatus,
      taxonomyId: options.taxonomyId,
      view: 'list',
    },
  });

  return normalizeKolamSpeciesList(response);
}

export async function getKolamSpecies(id: string): Promise<KolamSpecies> {
  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(id)}`,
  );
  return normalizeKolamSpeciesDetail(response);
}

export async function createKolamSpecies(
  form: KolamSpeciesFormState,
): Promise<KolamSpecies> {
  const response = await kolamRequest<unknown>('/species', {
    method: 'POST',
    body: createKolamSpeciesSavePayload(form),
  });

  return normalizeKolamSpeciesDetail(response);
}

export async function updateKolamSpecies(
  id: string,
  form: KolamSpeciesFormState,
): Promise<KolamSpecies> {
  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: createKolamSpeciesSavePayload(form),
    },
  );

  return normalizeKolamSpeciesDetail(response);
}
export async function uploadKolamSpeciesPhoto(
  id: string,
  localUri: string,
  variantId?: string,
): Promise<KolamSpecies> {
  const body = new FormData();
  body.append('photos', createReactNativeFilePart(localUri) as unknown as Blob);
  if (variantId) {
    body.append('variant', variantId);
  }

  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(id)}/photos`,
    {
      method: 'POST',
      body,
    },
  );

  return normalizeKolamSpeciesDetail(response);
}

export async function uploadKolamSpeciesThumbnail(
  id: string,
  localUri: string,
): Promise<KolamSpecies> {
  const body = new FormData();
  body.append('thumbnail', createReactNativeFilePart(localUri) as unknown as Blob);

  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(id)}/thumbnail`,
    {
      method: 'POST',
      body,
    },
  );

  return normalizeKolamSpeciesDetail(response);
}
export async function uploadKolamSpeciesVideo(
  id: string,
  localUri: string,
  variantId?: string,
): Promise<KolamSpecies> {
  const body = new FormData();
  body.append('videos', createReactNativeFilePart(localUri) as unknown as Blob);
  if (variantId) {
    body.append('variant', variantId);
  }

  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(id)}/videos`,
    {
      method: 'POST',
      body,
    },
  );

  return normalizeKolamSpeciesDetail(response);
}

export async function uploadKolamSpeciesVoice(
  id: string,
  localUri: string,
): Promise<KolamSpecies> {
  const body = new FormData();
  body.append('voice', createReactNativeFilePart(localUri) as unknown as Blob);

  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(id)}/voice`,
    {
      method: 'POST',
      body,
    },
  );

  return normalizeKolamSpeciesDetail(response);
}

export async function deleteKolamSpeciesVideo(
  id: string,
  index: number,
  variantId?: string,
): Promise<KolamSpecies> {
  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(id)}/videos/${index}`,
    {
      method: 'DELETE',
      query: { variant: variantId },
    },
  );

  return normalizeKolamSpeciesDetail(response);
}

export async function deleteKolamSpeciesVoice(id: string): Promise<KolamSpecies> {
  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(id)}/voice`,
    {
      method: 'DELETE',
    },
  );

  return normalizeKolamSpeciesDetail(response);
}

export async function reorderKolamSpeciesMedia(
  id: string,
  media: { photos?: string[]; videos?: string[]; variant?: string },
): Promise<KolamSpecies> {
  await kolamRequest<unknown>(`/species/${encodeURIComponent(id)}/media/reorder`, {
    method: 'PUT',
    body: media,
  });

  return getKolamSpecies(id);
}
export async function deleteKolamSpeciesPhoto(
  id: string,
  index: number,
  variantId?: string,
): Promise<KolamSpecies> {
  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(id)}/photos/${index}`,
    {
      method: 'DELETE',
      query: { variant: variantId },
    },
  );

  return normalizeKolamSpeciesDetail(response);
}

export async function deleteKolamSpeciesThumbnail(
  id: string,
): Promise<KolamSpecies> {
  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(id)}/thumbnail`,
    {
      method: 'DELETE',
    },
  );

  return normalizeKolamSpeciesDetail(response);
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
  const name = normalizedUri.split('/').pop() || 'species-media.jpg';

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
    case 'mp4':
      return 'video/mp4';
    case 'mov':
      return 'video/quicktime';
    case 'webm':
      return 'video/webm';
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'm4a':
      return 'audio/mp4';
    case 'aac':
      return 'audio/aac';
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
}





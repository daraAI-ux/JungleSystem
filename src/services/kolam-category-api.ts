import { appConfig } from '../config/app';
import {
  buildKolamCategoryTree,
  createKolamCategorySavePayload,
  normalizeKolamCategoryDetail,
  normalizeKolamCategoryList,
  type KolamCategory,
  type KolamCategoryFormState,
} from '../domain/kolam-category';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export async function getKolamCategories(): Promise<KolamCategory[]> {
  const treeCategories = await getKolamCategoriesFromEndpoint(
    '/category/tree',
    {
      maxDepth: 3,
    },
  ).catch(() => []);
  if (treeCategories.length) {
    return treeCategories;
  }

  const queryTreeCategories = await getKolamCategoriesFromEndpoint(
    '/category',
    {
      limit: 1000,
      tree: true,
    },
  ).catch(() => []);
  if (queryTreeCategories.length) {
    return buildKolamCategoryTree(queryTreeCategories);
  }

  const flatCategories = await getKolamCategoriesFromEndpoint('/category', {
    limit: 1000,
  });
  return buildKolamCategoryTree(flatCategories);
}

export async function getKolamCategory(id: string): Promise<KolamCategory> {
  const response = await kolamRequest<unknown>(
    `/category/${encodeURIComponent(id)}`,
  );
  return normalizeKolamCategoryDetail(response);
}

export async function createKolamCategory(
  form: KolamCategoryFormState,
): Promise<KolamCategory> {
  const response = await kolamRequest<unknown>('/category', {
    method: 'POST',
    body: createKolamCategorySavePayload(form),
  });

  return normalizeKolamCategoryDetail(response);
}

export async function updateKolamCategory(
  id: string,
  form: KolamCategoryFormState,
): Promise<KolamCategory> {
  const response = await kolamRequest<unknown>(
    `/category/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: createKolamCategorySavePayload(form),
    },
  );

  return normalizeKolamCategoryDetail(response);
}

export async function deleteKolamCategory(id: string): Promise<void> {
  await kolamRequest<unknown>(`/category/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function uploadKolamCategoryIcon(
  id: string,
  localUri: string,
): Promise<KolamCategory> {
  const body = new FormData();
  body.append('photos', createReactNativeFilePart(localUri) as unknown as Blob);

  const response = await kolamRequest<unknown>(
    `/category/${encodeURIComponent(id)}/photos`,
    {
      method: 'POST',
      body,
    },
  );

  if (
    response &&
    typeof response === 'object' &&
    (typeof (response as { icon?: unknown }).icon === 'string' ||
      Array.isArray((response as { photos?: unknown }).photos))
  ) {
    return getKolamCategory(id);
  }

  return normalizeKolamCategoryDetail(response);
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

async function getKolamCategoriesFromEndpoint(
  path: string,
  query: Record<string, string | number | boolean | undefined | null>,
) {
  const response = await kolamRequest<unknown>(path, { query });
  return normalizeKolamCategoryList(response);
}

function createReactNativeFilePart(localUri: string) {
  const normalizedUri = localUri.startsWith('file://')
    ? localUri
    : `file:///${localUri.replace(/\\/g, '/')}`;
  const name = normalizedUri.split('/').pop() || 'category-icon.jpg';

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

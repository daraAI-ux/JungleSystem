import { appConfig } from '../config/app';
import {
  createKolamProductPackingLinkPayload,
  normalizeKolamProductDetail,
  normalizeKolamProductList,
  type KolamProduct,
  type KolamProductFormState,
  type KolamProductListResult,
} from '../domain/kolam-product';
import { apiRequest } from '../lib/api-client';

type QueryValue = string | number | boolean | string[] | undefined | null;

interface DataResponse<T> {
  data: T;
}

const DETAIL_EDIT_HEADER = 'X-Detail-Edit';
const DETAIL_EDIT_HEADER_VALUE = '1';

export interface GetKolamProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'product' | 'raw' | string;
  category?: string | string[];
  brand?: string | string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  stockStatus?: string;
  view?: 'list' | 'grid' | string;
  archived?: boolean;
}

export interface GetKolamProductDetailOptions {
  forEdit?: boolean;
}

export async function getKolamProducts(
  options: GetKolamProductsOptions = {},
): Promise<KolamProductListResult> {
  const response = await kolamRequest<unknown>('/products', {
    query: createProductsQuery(options),
  });

  return normalizeKolamProductList(response);
}

export async function getKolamProductDetail(
  productId: string,
  options: GetKolamProductDetailOptions = {},
): Promise<KolamProduct> {
  const response = await kolamRequest<unknown>(`/products/${productId}`, {
    headers: options.forEdit
      ? { [DETAIL_EDIT_HEADER]: DETAIL_EDIT_HEADER_VALUE }
      : undefined,
  });

  return normalizeKolamProductDetail(response);
}

export async function createKolamProduct(
  body: Record<string, unknown>,
): Promise<KolamProduct> {
  const response = await kolamRequest<unknown>('/products', {
    method: 'POST',
    body,
  });

  return normalizeKolamProductDetail(response);
}

export async function updateKolamProduct(
  productId: string,
  body: Record<string, unknown>,
): Promise<KolamProduct> {
  const response = await kolamRequest<unknown>(`/products/${productId}`, {
    method: 'PUT',
    body,
    headers: { [DETAIL_EDIT_HEADER]: DETAIL_EDIT_HEADER_VALUE },
  });

  return normalizeKolamProductDetail(response);
}

export async function updateKolamProductPartial(
  productId: string,
  body: Record<string, unknown>,
): Promise<KolamProduct> {
  const response = await kolamRequest<unknown>(`/products/${productId}`, {
    method: 'PUT',
    body,
  });

  return normalizeKolamProductDetail(response);
}

export interface KolamProductSeoFormPayload {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}

export async function updateKolamProductSeo(
  productId: string,
  form: KolamProductSeoFormPayload,
): Promise<KolamProduct> {
  await kolamRequest<unknown>(
    `/dara-seo/products/${encodeURIComponent(productId)}/seo`,
    {
      method: 'PUT',
      body: {
        metaTitle: form.metaTitle.trim(),
        metaDescription: form.metaDescription.trim(),
        keywords: form.keywords
          .split(',')
          .map(keyword => keyword.trim())
          .filter(Boolean),
      },
    },
  );

  return getKolamProductDetail(productId, { forEdit: true });
}

export interface KolamProductAttachedItemPayload {
  itemType: 'product' | 'species';
  product?: string;
  species?: string;
  type: string;
  note?: string;
}

export async function addKolamProductAttachedItem(
  productId: string,
  body: KolamProductAttachedItemPayload,
): Promise<KolamProduct> {
  const response = await kolamRequest<unknown>(
    `/products/${encodeURIComponent(productId)}/attached-items`,
    {
      method: 'POST',
      body,
      headers: { [DETAIL_EDIT_HEADER]: DETAIL_EDIT_HEADER_VALUE },
    },
  );

  return normalizeKolamProductDetail(response);
}

export async function removeKolamProductAttachedItem(
  productId: string,
  itemId: string,
): Promise<KolamProduct> {
  const response = await kolamRequest<unknown>(
    `/products/${encodeURIComponent(productId)}/attached-items/${encodeURIComponent(itemId)}`,
    {
      method: 'DELETE',
      headers: { [DETAIL_EDIT_HEADER]: DETAIL_EDIT_HEADER_VALUE },
    },
  );

  return normalizeKolamProductDetail(response);
}

export async function deleteKolamProduct(productId: string): Promise<void> {
  await kolamRequest<unknown>(`/products/${productId}`, {
    method: 'DELETE',
  });
}

export async function duplicateKolamProduct(productId: string): Promise<KolamProduct> {
  const response = await kolamRequest<unknown>(`/products/copy/${productId}`, {
    method: 'POST',
  });

  return normalizeKolamProductDetail(response);
}

export async function archiveKolamProduct(productId: string): Promise<KolamProduct> {
  const response = await kolamRequest<unknown>(`/products/${productId}/archive`, {
    method: 'POST',
  });

  return normalizeKolamProductDetail(response);
}

export async function restoreKolamProduct(productId: string): Promise<KolamProduct> {
  const response = await kolamRequest<unknown>(`/products/${productId}/restore`, {
    method: 'POST',
  });

  return normalizeKolamProductDetail(response);
}

export async function uploadKolamProductPhoto(
  productId: string,
  localUri: string,
  variantId?: string,
): Promise<KolamProduct> {
  const body = new FormData();
  body.append('photos', createReactNativeFilePart(localUri, 'product-photo') as unknown as Blob);
  if (variantId) {
    body.append('variant', variantId);
  }

  const response = await kolamRequest<unknown>(
    `/products/${encodeURIComponent(productId)}/photos`,
    {
      method: 'POST',
      body,
      headers: { [DETAIL_EDIT_HEADER]: DETAIL_EDIT_HEADER_VALUE },
    },
  );

  return normalizeKolamProductDetail(response);
}

export async function deleteKolamProductPhoto(
  productId: string,
  index: number,
  variantId?: string,
): Promise<KolamProduct> {
  const response = await kolamRequest<unknown>(
    `/products/${encodeURIComponent(productId)}/photos/${index}`,
    {
      method: 'DELETE',
      query: { variant: variantId },
      headers: { [DETAIL_EDIT_HEADER]: DETAIL_EDIT_HEADER_VALUE },
    },
  );

  return normalizeKolamProductDetail(response);
}

export async function uploadKolamProductThumbnail(
  productId: string,
  localUri: string,
): Promise<KolamProduct> {
  const body = new FormData();
  body.append('thumbnail', createReactNativeFilePart(localUri, 'product-thumbnail') as unknown as Blob);

  const response = await kolamRequest<unknown>(
    `/products/${encodeURIComponent(productId)}/thumbnail`,
    {
      method: 'POST',
      body,
      headers: { [DETAIL_EDIT_HEADER]: DETAIL_EDIT_HEADER_VALUE },
    },
  );

  return normalizeKolamProductDetail(response);
}

export async function deleteKolamProductThumbnail(
  productId: string,
): Promise<KolamProduct> {
  const response = await kolamRequest<unknown>(
    `/products/${encodeURIComponent(productId)}/thumbnail`,
    {
      method: 'DELETE',
      headers: { [DETAIL_EDIT_HEADER]: DETAIL_EDIT_HEADER_VALUE },
    },
  );

  return normalizeKolamProductDetail(response);
}

export async function uploadKolamProductVideo(
  productId: string,
  localUri: string,
): Promise<KolamProduct> {
  const body = new FormData();
  body.append('videos', createReactNativeFilePart(localUri, 'product-video') as unknown as Blob);

  const response = await kolamRequest<unknown>(
    `/products/${encodeURIComponent(productId)}/videos`,
    {
      method: 'POST',
      body,
      headers: { [DETAIL_EDIT_HEADER]: DETAIL_EDIT_HEADER_VALUE },
    },
  );

  return normalizeKolamProductDetail(response);
}

export async function deleteKolamProductVideo(
  productId: string,
  index: number,
): Promise<KolamProduct> {
  const response = await kolamRequest<unknown>(
    `/products/${encodeURIComponent(productId)}/videos/${index}`,
    {
      method: 'DELETE',
      headers: { [DETAIL_EDIT_HEADER]: DETAIL_EDIT_HEADER_VALUE },
    },
  );

  return normalizeKolamProductDetail(response);
}

export async function reorderKolamProductMedia(
  productId: string,
  media: { photos?: string[]; videos?: string[]; variant?: string },
): Promise<KolamProduct> {
  const response = await kolamRequest<unknown>(
    `/products/${encodeURIComponent(productId)}/media/reorder`,
    {
      method: 'PUT',
      body: media,
      headers: { [DETAIL_EDIT_HEADER]: DETAIL_EDIT_HEADER_VALUE },
    },
  );

  return normalizeKolamProductDetail(response);
}

export async function linkKolamProductPackings(
  product: KolamProduct,
  form: KolamProductFormState,
): Promise<KolamProduct> {
  await kolamRequest<unknown>(
    `/products/${encodeURIComponent(product.id)}/link-packings`,
    {
      method: 'POST',
      body: {
        packings: createKolamProductPackingLinkPayload(form, product),
      },
      headers: { [DETAIL_EDIT_HEADER]: DETAIL_EDIT_HEADER_VALUE },
    },
  );

  return getKolamProductDetail(product.id, { forEdit: true });
}

export async function uploadKolamProductAsset(
  productId: string,
  title: string,
  localUri: string,
): Promise<KolamProduct> {
  const body = new FormData();
  body.append('title', title.trim());
  body.append('file', createReactNativeFilePart(localUri, 'product-asset') as unknown as Blob);

  await kolamRequest<unknown>(
    `/products/${encodeURIComponent(productId)}/assets`,
    {
      method: 'POST',
      body,
    },
  );

  return getKolamProductDetail(productId);
}

export async function deleteKolamProductAsset(
  productId: string,
  assetId: string,
): Promise<KolamProduct> {
  const response = await kolamRequest<unknown>(
    `/products/${encodeURIComponent(productId)}/assets/${encodeURIComponent(assetId)}`,
    { method: 'DELETE' },
  );

  return normalizeKolamProductDetail(response);
}
function createProductsQuery(options: GetKolamProductsOptions) {
  const query: Record<string, QueryValue> = {
    page: options.page ?? 1,
    limit: options.limit ?? 10,
    search: options.search,
    type: options.type ?? 'product',
    sortBy: options.sortBy,
    sortOrder: options.sortOrder,
    stockStatus: options.stockStatus,
    view: options.view ?? 'list',
    archived: options.archived,
  };

  applySingleOrArrayQuery(query, 'category', options.category);
  applySingleOrArrayQuery(query, 'brand', options.brand);

  return query;
}

function applySingleOrArrayQuery(
  query: Record<string, QueryValue>,
  key: 'category' | 'brand',
  value: string | string[] | undefined,
) {
  if (!value) {
    return;
  }

  if (Array.isArray(value)) {
    query[`${key}[]`] = value;
    return;
  }

  query[key] = value;
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

function createReactNativeFilePart(localUri: string, fallbackName = 'product-asset') {
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



import { appConfig } from '../config/app';
import {
  createKolamShippingMethodSavePayload,
  normalizeKolamShippingMethod,
  normalizeKolamShippingMethodInitializeDefaults,
  normalizeKolamShippingMethodList,
  normalizeKolamShippingMethodListResult,
  type KolamShippingMethod,
  type KolamShippingMethodFormState,
  type KolamShippingMethodInitializeDefaultsResult,
  type KolamShippingMethodListResult,
} from '../domain/kolam-shipping-method';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export type GetKolamShippingMethodsParams = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
};

export async function getKolamActiveShippingMethods(): Promise<
  KolamShippingMethod[]
> {
  const response = await kolamRequest<unknown>('/shipping-method/active');
  return normalizeKolamShippingMethodList(response);
}

export async function getKolamShippingMethods(
  params: GetKolamShippingMethodsParams = {},
): Promise<KolamShippingMethodListResult> {
  const response = await kolamRequest<unknown>('/shipping-method', {
    query: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search?.trim() || undefined,
      isActive: params.isActive,
    },
  });
  return normalizeKolamShippingMethodListResult(response, params.limit ?? 10);
}

export async function getKolamShippingMethod(
  id: string,
): Promise<KolamShippingMethod> {
  const response = await kolamRequest<unknown>(
    `/shipping-method/${encodeURIComponent(id)}`,
  );
  return normalizeKolamShippingMethod(response);
}

export async function createKolamShippingMethod(
  form: KolamShippingMethodFormState,
): Promise<KolamShippingMethod> {
  const response = await kolamRequest<unknown>('/shipping-method', {
    method: 'POST',
    body: createKolamShippingMethodSavePayload(form),
  });
  return normalizeKolamShippingMethod(response);
}

export async function updateKolamShippingMethod(
  id: string,
  form: KolamShippingMethodFormState,
): Promise<KolamShippingMethod> {
  const response = await kolamRequest<unknown>(
    `/shipping-method/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: createKolamShippingMethodSavePayload(form),
    },
  );
  return normalizeKolamShippingMethod(response);
}

export async function patchKolamShippingMethodFlags(
  id: string,
  patch: Partial<
    Pick<KolamShippingMethod, 'isActive' | 'isAvailableOnWebstore'>
  >,
): Promise<KolamShippingMethod> {
  const response = await kolamRequest<unknown>(
    `/shipping-method/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: patch,
    },
  );
  return normalizeKolamShippingMethod(response);
}

export async function deleteKolamShippingMethod(id: string): Promise<void> {
  await kolamRequest<unknown>(`/shipping-method/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function initializeKolamShippingMethodDefaults(): Promise<KolamShippingMethodInitializeDefaultsResult> {
  const response = await kolamRequest<unknown>(
    '/shipping-method/initialize-defaults',
    { method: 'POST' },
  );
  return normalizeKolamShippingMethodInitializeDefaults(response);
}

export async function uploadKolamShippingMethodIcon(
  id: string,
  localUri: string,
): Promise<KolamShippingMethod> {
  const body = new FormData();
  body.append('icon', createReactNativeFilePart(localUri) as unknown as Blob);

  const response = await kolamRequest<unknown>(
    `/shipping-method/${encodeURIComponent(id)}/upload-icon`,
    {
      method: 'POST',
      body,
    },
  );

  if (
    response &&
    typeof response === 'object' &&
    (typeof (response as { icon?: unknown }).icon === 'string' ||
      typeof (response as { _id?: unknown })._id === 'string')
  ) {
    try {
      return normalizeKolamShippingMethod(response);
    } catch {
      // fall through to refetch
    }
  }

  return getKolamShippingMethod(id);
}

export async function deleteKolamShippingMethodIcon(
  id: string,
): Promise<KolamShippingMethod> {
  await kolamRequest<unknown>(
    `/shipping-method/${encodeURIComponent(id)}/delete-icon`,
    { method: 'DELETE' },
  );
  return getKolamShippingMethod(id);
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
  const name = normalizedUri.split('/').pop() || 'shipping-method-icon.jpg';

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

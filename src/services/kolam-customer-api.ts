import {appConfig} from '../config/app';
import {
  normalizeKolamCustomerDetail,
  normalizeKolamCustomerListResult,
  normalizeKolamCustomerPointTransactionsResult,
  normalizeKolamCustomerStorageResult,
  type KolamCustomer,
  type KolamCustomerListQuery,
  type KolamCustomerListResult,
  type KolamCustomerPointTransactionsResult,
  type KolamCustomerPointTransactionType,
  type KolamCustomerSavePayload,
  type KolamCustomerStorageResult,
} from '../domain/kolam-customer';
import {
  normalizeKolamFreyerIotDevice,
  type KolamFreyerIotDevice,
} from '../domain/kolam-freyer-iot-device';
import {apiRequest} from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export async function getKolamCustomerList({
  limit = 10,
  page = 1,
  search,
}: KolamCustomerListQuery = {}): Promise<KolamCustomerListResult> {
  const response = await kolamRequest<unknown>('/customer', {
    query: {
      limit,
      page,
      ...(search?.trim() ? {search: search.trim()} : {}),
    },
  });

  return normalizeKolamCustomerListResult(response, {limit, page});
}

export async function getKolamCustomerDetail(
  id: string,
): Promise<KolamCustomer> {
  const response = await kolamRequest<unknown>(
    `/customer/${encodeURIComponent(id)}`,
  );
  const customer = normalizeKolamCustomerDetail(response);

  if (!customer) {
    throw new Error('Detail pelanggan tidak ditemukan.');
  }

  return customer;
}

export async function createKolamCustomer(
  payload: KolamCustomerSavePayload,
): Promise<KolamCustomer> {
  const response = await kolamRequest<unknown>('/customer', {
    method: 'POST',
    body: payload,
  });
  const customer = normalizeKolamCustomerDetail(response);

  if (!customer) {
    throw new Error('Pelanggan berhasil dibuat, tetapi respons tidak valid.');
  }

  return customer;
}

export async function updateKolamCustomer(
  id: string,
  payload: KolamCustomerSavePayload,
): Promise<KolamCustomer> {
  const response = await kolamRequest<unknown>(
    `/customer/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: payload,
    },
  );
  const customer = normalizeKolamCustomerDetail(response);

  if (!customer) {
    throw new Error('Pelanggan berhasil diperbarui, tetapi respons tidak valid.');
  }

  return customer;
}

export async function deleteKolamCustomer(id: string): Promise<void> {
  await kolamRequest<unknown>(`/customer/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function uploadKolamCustomerPhoto(
  id: string,
  localUri: string,
): Promise<string[]> {
  const body = new FormData();
  body.append(
    'photos',
    createReactNativeFilePart(localUri, 'customer-photo') as unknown as Blob,
  );

  const response = await kolamRequest<unknown>(
    `/customer/${encodeURIComponent(id)}/photos`,
    {
      method: 'POST',
      body,
    },
  );

  return normalizeCustomerPhotoResponse(response, 'photos');
}

export async function deleteKolamCustomerPhoto(
  id: string,
  index: number,
): Promise<string[]> {
  const response = await kolamRequest<unknown>(
    `/customer/${encodeURIComponent(id)}/photos/${index}`,
    {
      method: 'DELETE',
    },
  );

  return normalizeCustomerPhotoResponse(response, 'remaining');
}

export async function getKolamCustomerPointTransactions({
  id,
  limit = 10,
  page = 1,
  type,
}: {
  id: string;
  limit?: number;
  page?: number;
  type?: KolamCustomerPointTransactionType;
}): Promise<KolamCustomerPointTransactionsResult> {
  const response = await kolamRequest<unknown>(
    `/customer/${encodeURIComponent(id)}/point-transactions`,
    {
      query: {
        limit,
        page,
        ...(type?.trim() ? {type: type.trim()} : {}),
      },
    },
  );

  return normalizeKolamCustomerPointTransactionsResult(response, {limit, page});
}

export async function getKolamCustomerStorage({
  customerId,
  limit = 50,
  page = 1,
}: {
  customerId: string;
  limit?: number;
  page?: number;
}): Promise<KolamCustomerStorageResult> {
  const response = await kolamRequest<unknown>('/customer-storage', {
    query: {
      forCustomer: customerId,
      limit,
      page,
    },
  });

  return normalizeKolamCustomerStorageResult(response, {limit, page});
}

export async function getKolamCustomerFreyerDevices(
  id: string,
): Promise<KolamFreyerIotDevice[]> {
  const response = await kolamRequest<unknown>(
    `/customer/${encodeURIComponent(id)}/freyer-devices`,
  );

  return normalizeCustomerFreyerDeviceList(response);
}

export async function getKolamUnattachedCustomerFreyerDevices(): Promise<
  KolamFreyerIotDevice[]
> {
  const response = await kolamRequest<unknown>(
    '/customer/freyer-devices/unattached',
  );

  return normalizeCustomerFreyerDeviceList(response);
}

export async function attachKolamFreyerToCustomer(
  customerId: string,
  freyerId: string,
): Promise<void> {
  await kolamRequest<unknown>(
    `/customer/${encodeURIComponent(customerId)}/freyer-devices`,
    {
      body: {freyerId},
      method: 'POST',
    },
  );
}

export async function detachKolamFreyerFromCustomer(
  customerId: string,
  freyerId: string,
): Promise<void> {
  await kolamRequest<unknown>(
    `/customer/${encodeURIComponent(customerId)}/freyer-devices/${encodeURIComponent(freyerId)}`,
    {
      method: 'DELETE',
    },
  );
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

function normalizeCustomerPhotoResponse(payload: unknown, key: string) {
  const record = asRecord(payload);
  const data = asRecord(record.data);
  const value = record[key] ?? data[key];

  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  throw new Error('Respons foto pelanggan tidak valid.');
}

function normalizeCustomerFreyerDeviceList(payload: unknown) {
  const record = asRecord(payload);
  const dataRecord = asRecord(record.data);
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(record.data)
      ? record.data
      : Array.isArray(dataRecord.data)
        ? dataRecord.data
        : [];

  return rows.map(normalizeKolamFreyerIotDevice);
}

function createReactNativeFilePart(
  localUri: string,
  fallbackName = 'customer-photo',
) {
  const normalizedUri = localUri.startsWith('file://')
    ? localUri
    : `file:///${localUri.replace(/\\/g, '/')}`;
  const name = normalizedUri.split('/').pop() || fallbackName;

  return {
    name,
    type: inferFileMimeType(name),
    uri: normalizedUri,
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
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    default:
      return 'application/octet-stream';
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

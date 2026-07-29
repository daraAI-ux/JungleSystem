import { appConfig } from '../config/app';
import { apiRequest } from '../lib/api-client';

export type KolamPayableInstallmentStatus =
  | 'pending'
  | 'paid'
  | 'overdue'
  | string;

export interface KolamPayableInstallment {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: KolamPayableInstallmentStatus;
  paidAt: string;
}

interface DataResponse<T> {
  data: T;
}

export async function getKolamPayableInstallments(
  payableId: string,
): Promise<KolamPayableInstallment[]> {
  if (!payableId) {
    return [];
  }
  const response = await kolamRequest<unknown>(
    `/payable/${encodeURIComponent(payableId)}/installments`,
  );
  return normalizeKolamPayableInstallmentList(response);
}

export async function payKolamPayableInstallment(
  payableId: string,
  installmentId: string,
  proofUris: string[],
): Promise<KolamPayableInstallment[]> {
  const body = new FormData();
  proofUris
    .map(uri => uri.trim())
    .filter(Boolean)
    .slice(0, 5)
    .forEach((localUri, index) => {
      body.append(
        'proofs',
        createReactNativeFilePart(
          localUri,
          `installment-proof-${index + 1}.jpg`,
        ) as unknown as Blob,
      );
    });

  const response = await kolamRequest<unknown>(
    `/payable/${encodeURIComponent(payableId)}/installments/${encodeURIComponent(
      installmentId,
    )}/pay`,
    {
      method: 'PUT',
      body,
    },
  );
  return normalizeKolamPayableInstallmentList(response);
}

export function normalizeKolamPayableInstallmentList(
  payload: unknown,
): KolamPayableInstallment[] {
  const root = asRecord(payload);
  const list: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray(root.data)
    ? root.data
    : Array.isArray(root.installments)
    ? root.installments
    : Array.isArray(asRecord(root.data).installments)
    ? (asRecord(root.data).installments as unknown[])
    : [];

  return list.map(normalizeKolamPayableInstallment);
}

function normalizeKolamPayableInstallment(value: unknown): KolamPayableInstallment {
  const record = asRecord(value);
  return {
    id: getString(record, '_id') || getString(record, 'id'),
    installmentNumber: getNumber(record, 'installmentNumber'),
    amount: getNumber(record, 'amount'),
    dueDate: getString(record, 'dueDate'),
    status: getString(record, 'status') || 'pending',
    paidAt: getString(record, 'paidAt'),
  };
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
  const name = normalizedUri.split('/').pop() || fallbackName;

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

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

function getNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (value && typeof value === 'object' && '$numberDecimal' in (value as Record<string, unknown>)) {
    const parsed = Number((value as Record<string, unknown>).$numberDecimal);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

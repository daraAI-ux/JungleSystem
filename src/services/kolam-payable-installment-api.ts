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
  paidAmount: number;
  paidAt: string;
  paidByName: string;
  walletName: string;
  walletNote: string;
  proofs: Array<{
    path: string;
    uploadedAt: string;
  }>;
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
  const cleanedProofUris = proofUris.map(uri => uri.trim()).filter(Boolean);
  const body = new FormData();
  cleanedProofUris
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
      body: cleanedProofUris.length ? body : undefined,
    },
  );
  return normalizeKolamPayableInstallmentList(response);
}

export async function uploadKolamPayableInstallmentProof(
  payableId: string,
  installmentId: string,
  localUri: string,
): Promise<KolamPayableInstallment[]> {
  const body = new FormData();
  body.append(
    'proofs',
    createReactNativeFilePart(localUri, 'installment-proof.jpg') as unknown as Blob,
  );

  const response = await kolamRequest<unknown>(
    `/payable/${encodeURIComponent(payableId)}/installments/${encodeURIComponent(
      installmentId,
    )}/proofs`,
    {
      method: 'POST',
      body,
    },
  );
  return normalizeKolamPayableInstallmentList(response);
}

export function normalizeKolamPayableInstallmentList(
  payload: unknown,
): KolamPayableInstallment[] {
  const root = asRecord(payload);
  const data = root.data;
  const list: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray(data)
    ? data
    : Array.isArray(root.installments)
    ? root.installments
    : Array.isArray(asRecord(data).installments)
    ? (asRecord(data).installments as unknown[])
    : data && typeof data === 'object'
    ? [data]
    : [];

  return list.map(normalizeKolamPayableInstallment);
}

function normalizeKolamPayableInstallment(value: unknown): KolamPayableInstallment {
  const record = asRecord(value);
  const walletTransaction = asRecord(record.walletTransaction);
  const wallet = asRecord(walletTransaction.wallet);
  return {
    id: getString(record, '_id') || getString(record, 'id'),
    installmentNumber: getNumber(record, 'installmentNumber'),
    amount: getNumber(record, 'amount'),
    dueDate: getString(record, 'dueDate'),
    status: getString(record, 'status') || 'pending',
    paidAmount:
      getNumber(record, 'paidAmount') || getNumber(walletTransaction, 'amount'),
    paidAt: getString(record, 'paidAt'),
    paidByName: getUserName(record.paidBy),
    walletName: getString(wallet, 'name'),
    walletNote: getString(walletTransaction, 'note'),
    proofs: normalizeProofs(walletTransaction.proofs),
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
    case 'pdf':
      return 'application/pdf';
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

function normalizeProofs(value: unknown): Array<{ path: string; uploadedAt: string }> {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const record = asRecord(item);
      const path = getString(record, 'path');
      if (!path) {
        return null;
      }
      return {
        path,
        uploadedAt: getString(record, 'uploadedAt'),
      };
    })
    .filter((item): item is { path: string; uploadedAt: string } => Boolean(item));
}

function getUserName(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  const record = asRecord(value);
  const directName = getString(record, 'name');
  if (directName) {
    return directName;
  }
  const firstName = getString(record, 'first_name');
  const lastName = getString(record, 'last_name');
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || getString(record, 'email');
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

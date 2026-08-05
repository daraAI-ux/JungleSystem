import { appConfig } from '../config/app';
import {
  normalizeKolamCommissionRecipientSummary,
  normalizeKolamCommissionList,
  type KolamCommissionRecipientSummaryResult,
  type KolamCommissionListFilters,
  type KolamCommissionListResult,
} from '../domain/kolam-commission';
import { apiRequest } from '../lib/api-client';

export async function fetchKolamCommissionList(
  filters: Pick<
    KolamCommissionListFilters,
    'recipientUser' | 'search' | 'status' | 'page' | 'limit'
  >,
): Promise<KolamCommissionListResult> {
  const query: Record<string, string | number> = {
    page: filters.page,
    limit: filters.limit,
  };
  if (filters.search.trim()) {
    query.search = filters.search.trim();
  }
  if (filters.recipientUser.trim()) {
    query.recipientUser = filters.recipientUser.trim();
  }
  if (filters.status !== 'all') {
    query.status = filters.status;
  }

  const payload = await kolamRequest<unknown>('/commission', { query });
  return normalizeKolamCommissionList(payload);
}

export async function fetchKolamCommissionRecipientSummary(): Promise<KolamCommissionRecipientSummaryResult> {
  const payload = await kolamRequest<unknown>('/commission/recipient-summary');
  return normalizeKolamCommissionRecipientSummary(payload);
}

export async function releaseKolamCommission(
  id: string,
  walletFrom: string,
  note?: string,
): Promise<void> {
  await kolamRequest(`/commission/${encodeURIComponent(id)}/release`, {
    method: 'POST',
    body: {
      walletFrom,
      ...(note?.trim() ? { note: note.trim() } : {}),
    },
  });
}

export async function uploadKolamCommissionTransferProof(
  id: string,
  localUri: string,
): Promise<void> {
  const body = new FormData();
  body.append(
    'proof',
    createReactNativeFilePart(
      localUri,
      'commission-transfer-proof.jpg',
    ) as unknown as Blob,
  );

  await kolamRequest(`/commission/${encodeURIComponent(id)}/transfer-proof`, {
    method: 'POST',
    body,
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
  return apiRequest<T>({
    method: options.method ?? 'GET',
    path,
    query: options.query,
    body: options.body,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });
}

function createReactNativeFilePart(localUri: string, fallbackName: string) {
  const normalizedUri = localUri.startsWith('file://')
    ? localUri
    : `file:///${localUri.replace(/\\/g, '/')}`;
  const name = normalizedUri.split('/').pop() || fallbackName;
  const extension = name.split('.').pop()?.toLowerCase();
  let type = 'image/jpeg';
  switch (extension) {
    case 'png':
      type = 'image/png';
      break;
    case 'webp':
      type = 'image/webp';
      break;
    case 'gif':
      type = 'image/gif';
      break;
    case 'pdf':
      type = 'application/pdf';
      break;
    default:
      break;
  }
  return {
    uri: normalizedUri,
    name,
    type,
  };
}

import { appConfig } from '../config/app';
import {
  normalizeKolamPayable,
  normalizeKolamPayableList,
  normalizeKolamPayableSummary,
  type KolamPayable,
  type KolamPayableListFilters,
  type KolamPayableListResult,
  type KolamPayableSummaryData,
  type KolamPayableWritePayload,
} from '../domain/kolam-payable';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export type KolamPayableListQuery = Pick<
  KolamPayableListFilters,
  | 'page'
  | 'limit'
  | 'search'
  | 'status'
  | 'sourceModel'
  | 'overdue'
  | 'period'
  | 'startDate'
  | 'endDate'
  | 'sort'
>;

export async function fetchKolamPayables(
  query: Partial<KolamPayableListQuery> = {},
): Promise<KolamPayableListResult> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const backendSort =
    query.sort === 'next_installment_due_asc' ? 'newest' : query.sort;
  const payload = await kolamRequest<unknown>('/payable', {
    query: {
      page,
      limit,
      ...(query.search?.trim() ? { search: query.search.trim() } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.sourceModel ? { sourceModel: query.sourceModel } : {}),
      ...(query.overdue ? { overdue: 'true' } : {}),
      ...(query.period && query.period !== 'all'
        ? { period: query.period }
        : {}),
      ...(query.period === 'custom' && query.startDate?.trim()
        ? { startDate: query.startDate.trim() }
        : {}),
      ...(query.period === 'custom' && query.endDate?.trim()
        ? { endDate: query.endDate.trim() }
        : {}),
      ...(backendSort ? { sort: backendSort } : {}),
    },
  });
  return normalizeKolamPayableList(payload, { page, limit });
}

export async function fetchKolamPayableSummary(): Promise<KolamPayableSummaryData> {
  const payload = await kolamRequest<unknown>('/payable/summary');
  return normalizeKolamPayableSummary(payload);
}

export async function fetchKolamPayableDetail(
  id: string,
): Promise<KolamPayable> {
  const payload = await kolamRequest<unknown>(
    `/payable/${encodeURIComponent(id)}`,
  );
  return normalizeKolamPayable(unwrapData(payload));
}

export async function createKolamPayable(
  body: KolamPayableWritePayload,
): Promise<KolamPayable> {
  const payload = await kolamRequest<unknown>('/payable', {
    method: 'POST',
    body,
  });
  return normalizeKolamPayable(unwrapData(payload));
}

export async function payKolamPayableFull(id: string): Promise<KolamPayable> {
  const payload = await kolamRequest<unknown>(
    `/payable/${encodeURIComponent(id)}/pay-full`,
    { method: 'PUT' },
  );
  return normalizeKolamPayable(unwrapData(payload));
}

export async function uploadKolamPayableProof(
  id: string,
  localUri: string,
): Promise<KolamPayable> {
  const body = new FormData();
  body.append(
    'proofs',
    createReactNativeFilePart(localUri, 'payable-proof.jpg') as unknown as Blob,
  );
  const payload = await kolamRequest<unknown>(
    `/payable/${encodeURIComponent(id)}/proofs`,
    {
      method: 'POST',
      body,
    },
  );
  return normalizeKolamPayable(unwrapData(payload));
}

function unwrapData(payload: unknown): unknown {
  const record =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : null;
  if (record && 'data' in record && record.data != null) {
    return record.data;
  }
  return payload;
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

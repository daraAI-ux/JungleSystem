import { appConfig } from '../config/app';
import {
  getKolamFinanceExpenseApiSegment,
  normalizeKolamAssetPurchaseDetail,
  normalizeKolamFinanceExpenseList,
  normalizeKolamUnexpectedExpenseDetail,
  normalizeKolamUnexpectedIncomeDetail,
  normalizeKolamRoutineExpenseCreateResult,
  type KolamAssetPurchaseDetail,
  type KolamAssetPurchaseWritePayload,
  type KolamFinanceExpenseKind,
  type KolamFinanceExpenseListFilters,
  type KolamFinanceExpenseListResult,
  type KolamRoutineExpenseCreateResult,
  type KolamRoutineExpenseWritePayload,
  type KolamUnexpectedExpenseDetail,
  type KolamUnexpectedExpenseWritePayload,
  type KolamUnexpectedIncomeDetail,
  type KolamUnexpectedIncomeWritePayload,
} from '../domain/kolam-finance-expense';
import { apiRequest } from '../lib/api-client';

export async function fetchKolamFinanceExpenseList(
  kind: KolamFinanceExpenseKind,
  filters: Pick<
    KolamFinanceExpenseListFilters,
    | 'search'
    | 'status'
    | 'period'
    | 'startDate'
    | 'endDate'
    | 'locationId'
    | 'page'
    | 'limit'
  >,
): Promise<KolamFinanceExpenseListResult> {
  const segment = getKolamFinanceExpenseApiSegment(kind);
  const query: Record<string, string | number> = {
    page: filters.page,
    limit: filters.limit,
  };
  if (filters.search.trim()) {
    query.search = filters.search.trim();
  }
  if (filters.status !== 'all') {
    query.status = filters.status;
  }
  if (filters.period !== 'all') {
    query.period = filters.period;
  }
  if (filters.period === 'custom' && filters.startDate.trim()) {
    query.startDate = filters.startDate.trim();
  }
  if (filters.period === 'custom' && filters.endDate.trim()) {
    query.endDate = filters.endDate.trim();
  }
  if (filters.locationId.trim()) {
    query.locationId = filters.locationId.trim();
  }

  const payload = await kolamRequest<unknown>(`/${segment}`, { query });
  return normalizeKolamFinanceExpenseList(payload, kind);
}

export async function verifyKolamFinanceExpense(
  kind: KolamFinanceExpenseKind,
  id: string,
): Promise<void> {
  const segment = getKolamFinanceExpenseApiSegment(kind);
  await kolamRequest(`/${segment}/${encodeURIComponent(id)}/verify`, {
    method: 'PUT',
  });
}

export async function deleteKolamFinanceExpense(
  kind: KolamFinanceExpenseKind,
  id: string,
): Promise<void> {
  const segment = getKolamFinanceExpenseApiSegment(kind);
  await kolamRequest(`/${segment}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function fetchKolamAssetPurchaseById(
  id: string,
): Promise<KolamAssetPurchaseDetail> {
  const payload = await kolamRequest<unknown>(
    `/asset-purchase/${encodeURIComponent(id)}`,
  );
  return normalizeKolamAssetPurchaseDetail(payload);
}

export async function createKolamAssetPurchase(
  body: KolamAssetPurchaseWritePayload,
): Promise<KolamAssetPurchaseDetail> {
  const payload = await kolamRequest<unknown>('/asset-purchase', {
    method: 'POST',
    body,
  });
  return normalizeKolamAssetPurchaseDetail(payload);
}

export async function updateKolamAssetPurchase(
  id: string,
  body: KolamAssetPurchaseWritePayload,
): Promise<KolamAssetPurchaseDetail> {
  const payload = await kolamRequest<unknown>(
    `/asset-purchase/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body,
    },
  );
  return normalizeKolamAssetPurchaseDetail(payload);
}

export async function fetchKolamUnexpectedIncomeById(
  id: string,
): Promise<KolamUnexpectedIncomeDetail> {
  const payload = await kolamRequest<unknown>(
    `/unexpected-income/${encodeURIComponent(id)}`,
  );
  return normalizeKolamUnexpectedIncomeDetail(payload);
}

export async function createKolamUnexpectedIncome(
  body: KolamUnexpectedIncomeWritePayload,
): Promise<KolamUnexpectedIncomeDetail> {
  const payload = await kolamRequest<unknown>('/unexpected-income', {
    method: 'POST',
    body,
  });
  return normalizeKolamUnexpectedIncomeDetail(payload);
}

export async function updateKolamUnexpectedIncome(
  id: string,
  body: KolamUnexpectedIncomeWritePayload,
): Promise<KolamUnexpectedIncomeDetail> {
  const payload = await kolamRequest<unknown>(
    `/unexpected-income/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body,
    },
  );
  return normalizeKolamUnexpectedIncomeDetail(payload);
}

export async function fetchKolamUnexpectedExpenseById(
  id: string,
): Promise<KolamUnexpectedExpenseDetail> {
  const payload = await kolamRequest<unknown>(
    `/unexpected-expense/${encodeURIComponent(id)}`,
  );
  return normalizeKolamUnexpectedExpenseDetail(payload);
}

export async function createKolamUnexpectedExpense(
  body: KolamUnexpectedExpenseWritePayload,
): Promise<KolamUnexpectedExpenseDetail> {
  const payload = await kolamRequest<unknown>('/unexpected-expense', {
    method: 'POST',
    body,
  });
  return normalizeKolamUnexpectedExpenseDetail(payload);
}

export async function updateKolamUnexpectedExpense(
  id: string,
  body: KolamUnexpectedExpenseWritePayload,
): Promise<KolamUnexpectedExpenseDetail> {
  const payload = await kolamRequest<unknown>(
    `/unexpected-expense/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body,
    },
  );
  return normalizeKolamUnexpectedExpenseDetail(payload);
}

export async function createKolamRoutineExpense(
  body: KolamRoutineExpenseWritePayload,
): Promise<KolamRoutineExpenseCreateResult> {
  const payload = await kolamRequest<unknown>('/routine-expense', {
    method: 'POST',
    body,
  });
  return normalizeKolamRoutineExpenseCreateResult(payload);
}

export async function uploadKolamAssetPurchasePhotos(
  localUris: string[],
): Promise<string[]> {
  if (localUris.length === 0) {
    return [];
  }
  const body = new FormData();
  localUris.forEach((localUri, index) => {
    body.append(
      'photos',
      createReactNativeFilePart(
        localUri,
        `asset-photo-${index + 1}.jpg`,
      ) as unknown as Blob,
    );
  });
  const payload = await kolamRequest<unknown>('/asset-purchase/upload-photos', {
    method: 'POST',
    body,
  });
  const record =
    payload && typeof payload === 'object'
      ? (payload as Record<string, unknown>)
      : {};
  const rows = Array.isArray(record.data)
    ? record.data
    : Array.isArray(payload)
      ? payload
      : [];
  return rows.map(item => String(item ?? '').trim()).filter(Boolean);
}

export async function deleteKolamAssetPurchasePhoto(
  path: string,
): Promise<void> {
  await kolamRequest('/asset-purchase/photo', {
    method: 'DELETE',
    body: { path },
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
    default:
      break;
  }
  return {
    uri: normalizedUri,
    name,
    type,
  };
}

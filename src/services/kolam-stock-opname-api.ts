import { appConfig } from '../config/app';
import { getRuntimeClientHeaders } from '../domain/runtime-client-contract';
import type {
  KolamStockOpname,
  KolamStockOpnameCreateBody,
  KolamStockOpnameImportResult,
  KolamStockOpnameLine,
  KolamStockOpnameLineTargetType,
  KolamStockOpnameLinesResult,
  KolamStockOpnameListFilters,
  KolamStockOpnameListResult,
  KolamStockOpnameStaffAssignee,
  KolamOpnameMinusReason,
} from '../domain/kolam-stock-opname';
import {
  normalizeKolamStockOpname,
  normalizeKolamStockOpnameImportResult,
  normalizeKolamStockOpnameLine,
  normalizeKolamStockOpnameLines,
  normalizeKolamStockOpnameList,
  normalizeKolamStockOpnameStaffAssignees,
} from '../domain/kolam-stock-opname';
import {
  apiRequest,
  getAccessToken,
  getNativeDeviceIdentity,
} from '../lib/api-client';
import { ApiError, type ApiErrorPayload } from '../lib/api-error';
import { saveNativeBase64File } from './native-file-saver';

const BASE = '/stock-opnames';

export async function getKolamStockOpnameList(
  filters: KolamStockOpnameListFilters,
): Promise<KolamStockOpnameListResult> {
  const query: Record<string, string | number | undefined> = {
    page: filters.page,
    limit: filters.limit,
    sort: filters.sort || 'createdAt:desc',
  };

  if (filters.search.trim()) {
    query.search = filters.search.trim();
  }
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.startDate.trim()) {
    query.startDate = filters.startDate.trim();
  }
  if (filters.endDate.trim()) {
    query.endDate = filters.endDate.trim();
  }

  const response = await apiRequest<unknown>({
    path: BASE,
    query,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  return normalizeKolamStockOpnameList(response);
}

export async function getKolamStockOpname(
  id: string,
): Promise<KolamStockOpname> {
  const response = await apiRequest<unknown>({
    path: `${BASE}/${encodeURIComponent(id)}`,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  return normalizeKolamStockOpname(response);
}

export async function getKolamStockOpnameLines(
  id: string,
  params: { page?: number; limit?: number } = {},
): Promise<KolamStockOpnameLinesResult> {
  const response = await apiRequest<unknown>({
    path: `${BASE}/${encodeURIComponent(id)}/lines`,
    query: {
      page: params.page ?? 1,
      limit: params.limit ?? 500,
    },
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  return normalizeKolamStockOpnameLines(response);
}

export async function getKolamStockOpnameStaffAssignees(params: {
  search?: string;
  limit?: number;
} = {}): Promise<KolamStockOpnameStaffAssignee[]> {
  const response = await apiRequest<unknown>({
    path: `${BASE}/staff-assignees`,
    query: {
      search: params.search?.trim() || undefined,
      limit: params.limit ?? 500,
    },
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  return normalizeKolamStockOpnameStaffAssignees(response);
}

export async function createKolamStockOpnameDocument(
  body: KolamStockOpnameCreateBody = {},
): Promise<KolamStockOpname> {
  const response = await apiRequest<unknown>({
    method: 'POST',
    path: BASE,
    body,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  return normalizeKolamStockOpname(response);
}

export async function updateKolamStockOpnameHeader(
  id: string,
  body: Partial<KolamStockOpnameCreateBody> & { note?: string },
): Promise<KolamStockOpname> {
  const response = await apiRequest<unknown>({
    method: 'PATCH',
    path: `${BASE}/${encodeURIComponent(id)}`,
    body,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  return normalizeKolamStockOpname(response);
}

export async function addKolamStockOpnameLine(
  id: string,
  input: {
    targetType: KolamStockOpnameLineTargetType;
    productId?: string;
    speciesId?: string;
    packingId?: string;
    variant?: string | null;
    physicalQty: number;
    minusReason?: KolamOpnameMinusReason;
    lineNote?: string;
    photoUris?: string[];
  },
): Promise<KolamStockOpnameLine> {
  const body = new FormData();
  body.append('targetType', input.targetType);
  body.append('physicalQty', String(input.physicalQty));
  if (input.productId) {
    body.append('productId', input.productId);
  }
  if (input.speciesId) {
    body.append('speciesId', input.speciesId);
  }
  if (input.packingId) {
    body.append('packingId', input.packingId);
  }
  if (input.variant?.trim()) {
    body.append('variant', input.variant.trim());
  }
  if (input.lineNote?.trim()) {
    body.append('lineNote', input.lineNote.trim());
  }
  if (input.minusReason) {
    body.append('minusReason', input.minusReason);
  }
  appendPhotoParts(body, input.photoUris);

  const response = await apiRequest<unknown>({
    method: 'POST',
    path: `${BASE}/${encodeURIComponent(id)}/lines`,
    body,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  return normalizeKolamStockOpnameLine(response);
}

export async function updateKolamStockOpnameLine(
  opnameId: string,
  input: {
    lineId: string;
    physicalQty?: number;
    minusReason?: KolamOpnameMinusReason | null;
    lineNote?: string;
    photoUris?: string[];
    keepPhotos?: string[];
  },
): Promise<KolamStockOpnameLine> {
  const body = new FormData();
  if (input.physicalQty !== undefined) {
    body.append('physicalQty', String(input.physicalQty));
  }
  if (input.lineNote !== undefined) {
    body.append('lineNote', input.lineNote);
  }
  if (input.minusReason !== undefined) {
    body.append('minusReason', input.minusReason ?? '');
  }
  if (input.keepPhotos !== undefined) {
    body.append('keepPhotos', JSON.stringify(input.keepPhotos));
  }
  appendPhotoParts(body, input.photoUris);

  const response = await apiRequest<unknown>({
    method: 'PATCH',
    path: `${BASE}/${encodeURIComponent(opnameId)}/lines/${encodeURIComponent(
      input.lineId,
    )}`,
    body,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  return normalizeKolamStockOpnameLine(response);
}

export async function deleteKolamStockOpnameLine(
  opnameId: string,
  lineId: string,
): Promise<void> {
  await apiRequest<unknown>({
    method: 'DELETE',
    path: `${BASE}/${encodeURIComponent(opnameId)}/lines/${encodeURIComponent(
      lineId,
    )}`,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });
}

export async function submitKolamStockOpnameForReview(
  id: string,
): Promise<KolamStockOpname> {
  const response = await apiRequest<unknown>({
    method: 'POST',
    path: `${BASE}/${encodeURIComponent(id)}/submit-for-review`,
    body: {},
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  return normalizeKolamStockOpname(response);
}

export async function reviewKolamStockOpnameLine(
  opnameId: string,
  input: {
    lineId: string;
    decision: 'approved' | 'rejected' | 'revision';
    reason?: string;
  },
): Promise<{ line: KolamStockOpnameLine; headerStatus: string }> {
  const response = await apiRequest<unknown>({
    method: 'PATCH',
    path: `${BASE}/${encodeURIComponent(opnameId)}/lines/${encodeURIComponent(
      input.lineId,
    )}/review`,
    body: {
      decision: input.decision,
      reason: input.reason,
    },
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  const root =
    response && typeof response === 'object'
      ? (response as { data?: unknown })
      : {};
  const data =
    root.data && typeof root.data === 'object'
      ? (root.data as { line?: unknown; headerStatus?: unknown })
      : (response as { line?: unknown; headerStatus?: unknown });

  return {
    line: normalizeKolamStockOpnameLine(data.line ?? response),
    headerStatus:
      typeof data.headerStatus === 'string' ? data.headerStatus : '',
  };
}

export async function resubmitKolamStockOpnameLineForReview(
  opnameId: string,
  lineId: string,
): Promise<{ line: KolamStockOpnameLine; headerStatus: string }> {
  const response = await apiRequest<unknown>({
    method: 'POST',
    path: `${BASE}/${encodeURIComponent(opnameId)}/lines/${encodeURIComponent(
      lineId,
    )}/resubmit-for-review`,
    body: {},
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  const root =
    response && typeof response === 'object'
      ? (response as { data?: unknown })
      : {};
  const data =
    root.data && typeof root.data === 'object'
      ? (root.data as { line?: unknown; headerStatus?: unknown })
      : (response as { line?: unknown; headerStatus?: unknown });

  return {
    line: normalizeKolamStockOpnameLine(data.line ?? response),
    headerStatus:
      typeof data.headerStatus === 'string' ? data.headerStatus : '',
  };
}

export async function cancelKolamStockOpname(
  id: string,
  cancelReason?: string,
): Promise<KolamStockOpname> {
  const response = await apiRequest<unknown>({
    method: 'POST',
    path: `${BASE}/${encodeURIComponent(id)}/cancel`,
    body: cancelReason ? { cancelReason } : {},
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  return normalizeKolamStockOpname(response);
}

export async function deleteKolamStockOpname(id: string): Promise<{
  ok: boolean;
  deletedLines: number;
  deletedHeader: number;
  documentNumber: string;
}> {
  const response = await apiRequest<unknown>({
    method: 'DELETE',
    path: `${BASE}/${encodeURIComponent(id)}`,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  const root =
    response && typeof response === 'object'
      ? (response as Record<string, unknown>)
      : {};
  const data =
    root.data && typeof root.data === 'object'
      ? (root.data as Record<string, unknown>)
      : root;

  return {
    ok: Boolean(data.ok ?? true),
    deletedLines: Number(data.deletedLines ?? 0) || 0,
    deletedHeader: Number(data.deletedHeader ?? 0) || 0,
    documentNumber:
      typeof data.documentNumber === 'string' ? data.documentNumber : '',
  };
}

export async function postKolamStockOpname(id: string): Promise<{
  header: KolamStockOpname;
  postedCount: number;
  continuation: { id: string; documentNumber: string } | null;
}> {
  const response = await apiRequest<unknown>({
    method: 'POST',
    path: `${BASE}/${encodeURIComponent(id)}/post`,
    body: {},
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  const root =
    response && typeof response === 'object'
      ? (response as { data?: unknown })
      : {};
  const data =
    root.data && typeof root.data === 'object'
      ? (root.data as Record<string, unknown>)
      : (response as Record<string, unknown>);

  const continuationRaw = data.continuation;
  let continuation: { id: string; documentNumber: string } | null = null;
  if (continuationRaw && typeof continuationRaw === 'object') {
    const c = continuationRaw as Record<string, unknown>;
    const cid =
      typeof c._id === 'string'
        ? c._id
        : typeof c.id === 'string'
        ? c.id
        : '';
    if (cid) {
      continuation = {
        id: cid,
        documentNumber:
          typeof c.documentNumber === 'string' ? c.documentNumber : cid,
      };
    }
  }

  return {
    header: normalizeKolamStockOpname(data.header ?? response),
    postedCount: Number(data.postedCount ?? 0) || 0,
    continuation,
  };
}

export async function expandKolamStockOpnameVariants(id: string): Promise<{
  totalLines: number;
  parentsExpanded: number;
  variantLinesAdded: number;
  withVariant: number;
}> {
  const response = await apiRequest<unknown>({
    method: 'POST',
    path: `${BASE}/${encodeURIComponent(id)}/lines/expand-variants`,
    body: {},
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  const root =
    response && typeof response === 'object'
      ? (response as { data?: unknown })
      : {};
  const data =
    root.data && typeof root.data === 'object'
      ? (root.data as Record<string, unknown>)
      : (response as Record<string, unknown>);

  return {
    totalLines: Number(data.totalLines ?? 0) || 0,
    parentsExpanded: Number(data.parentsExpanded ?? 0) || 0,
    variantLinesAdded: Number(data.variantLinesAdded ?? 0) || 0,
    withVariant: Number(data.withVariant ?? 0) || 0,
  };
}

export async function importKolamStockOpname(input: {
  fileUri: string;
  fileName?: string;
  targetType: KolamStockOpnameLineTargetType;
  note?: string;
}): Promise<KolamStockOpnameImportResult> {
  const body = new FormData();
  body.append(
    'file',
    createReactNativeFilePart(
      input.fileUri,
      input.fileName || 'stock-opname-import.xlsx',
    ) as unknown as Blob,
  );
  body.append('targetType', input.targetType);
  if (input.note?.trim()) {
    body.append('note', input.note.trim());
  }

  const response = await apiRequest<unknown>({
    method: 'POST',
    path: `${BASE}/import`,
    body,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  return normalizeKolamStockOpnameImportResult(response);
}

export async function exportKolamStockOpnameList(
  filters: Partial<KolamStockOpnameListFilters>,
): Promise<{ path?: string; name: string }> {
  const params = new URLSearchParams();
  if (filters.search?.trim()) {
    params.set('search', filters.search.trim());
  }
  if (filters.status) {
    params.set('status', filters.status);
  }
  if (filters.startDate?.trim()) {
    params.set('startDate', filters.startDate.trim());
  }
  if (filters.endDate?.trim()) {
    params.set('endDate', filters.endDate.trim());
  }
  if (filters.sort?.trim()) {
    params.set('sort', filters.sort.trim());
  }

  const fileName = `StockOpname-List-Audit-${new Date()
    .toISOString()
    .slice(0, 10)}.xlsx`;
  return downloadBinaryExport(`${BASE}/export`, params, fileName);
}

export async function exportKolamStockOpnameXlsx(
  id: string,
  documentNumber: string,
): Promise<{ path?: string; name: string }> {
  const safe = String(documentNumber || 'export').replace(/[^\w.-]+/g, '_');
  return downloadBinaryExport(
    `${BASE}/${encodeURIComponent(id)}/export`,
    undefined,
    `StockOpname-${safe}.xlsx`,
  );
}

export async function exportKolamStockOpnamePdf(
  id: string,
  documentNumber: string,
): Promise<{ path?: string; name: string }> {
  const safe = String(documentNumber || 'export').replace(/[^\w.-]+/g, '_');
  return downloadBinaryExport(
    `${BASE}/${encodeURIComponent(id)}/export-pdf`,
    undefined,
    `StockOpname-${safe}.pdf`,
  );
}

function appendPhotoParts(body: FormData, photoUris?: string[]) {
  for (const uri of photoUris ?? []) {
    if (uri.trim()) {
      body.append(
        'photos',
        createReactNativeFilePart(
          uri.trim(),
          'stock-opname-line-photo.jpg',
        ) as unknown as Blob,
      );
    }
  }
}

function createReactNativeFilePart(localUri: string, fallbackName: string) {
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
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'image/jpeg';
  }
}

async function downloadBinaryExport(
  path: string,
  params: URLSearchParams | undefined,
  fallbackName: string,
): Promise<{ path?: string; name: string }> {
  const base = appConfig.kolamApiBaseUrl.replace(/\/+$/, '');
  const query = params?.toString();
  const url = `${base}${path}${query ? `?${query}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: buildBinaryHeaders(),
  });

  if (!response.ok) {
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = { message: await response.text() };
    }
    throw new ApiError(
      response.status,
      (payload && typeof payload === 'object'
        ? (payload as ApiErrorPayload)
        : { message: String(payload ?? '') }),
    );
  }

  const filename =
    deriveFilenameFromDisposition(
      response.headers.get('content-disposition') ?? undefined,
    ) ?? fallbackName;
  const buffer = await response.arrayBuffer();
  const saveResult = await saveNativeBase64File(
    filename,
    arrayBufferToBase64(buffer),
  );

  if (saveResult.cancelled) {
    throw new Error('Export dibatalkan.');
  }

  return {
    name: saveResult.name ?? filename,
    path: saveResult.path,
  };
}

function buildBinaryHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf,application/octet-stream,*/*',
    ...getRuntimeClientHeaders({ sourceHeader: appConfig.kolamSourceHeader }),
  };
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const nativeIdentity = getNativeDeviceIdentity();
  const macHeader = nativeIdentity.macAddresses?.join(',');
  if (macHeader) {
    headers['x-device-mac'] = macHeader;
  }
  if (nativeIdentity.macSignature) {
    headers['x-device-mac-signature'] = nativeIdentity.macSignature;
  }

  return headers;
}

function deriveFilenameFromDisposition(value?: string) {
  if (!value) {
    return undefined;
  }
  const utfMatch = /filename\*=UTF-8''([^;]+)/i.exec(value);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1]);
    } catch {
      return utfMatch[1];
    }
  }
  const plainMatch = /filename="?([^";]+)"?/i.exec(value);
  return plainMatch?.[1]?.trim() || undefined;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Buffer } = require('buffer') as typeof import('buffer');
  return Buffer.from(bytes).toString('base64');
}

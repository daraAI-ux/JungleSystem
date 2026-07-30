import { appConfig } from '../config/app';
import { getRuntimeClientHeaders } from '../domain/runtime-client-contract';
import type {
  KolamCreateProductionBody,
  KolamCreateProductionWithPOBody,
  KolamFinalizeProductionBody,
  KolamProduction,
  KolamProductionListFilters,
  KolamProductionListResult,
  KolamProductionSerial,
  KolamProductionStaffAssignee,
  KolamProductForProduction,
  KolamSubmitCheckBody,
  KolamUpdateProductionBody,
} from '../domain/kolam-production';
import {
  normalizeKolamProduction,
  normalizeKolamProductionList,
  normalizeKolamProductionSerials,
  normalizeKolamProductionStaffAssignees,
  normalizeKolamProductsForProduction,
} from '../domain/kolam-production';
import {
  apiRequest,
  getAccessToken,
  getNativeDeviceIdentity,
} from '../lib/api-client';
import { ApiError } from '../lib/api-error';
import { saveNativeBase64File } from './native-file-saver';

interface DataResponse<T> {
  data: T;
}

export interface KolamRecalculateProductionResult {
  production: KolamProduction;
  stockReport: Array<{
    productId: string;
    productName: string;
    required: number;
    available: number;
    sufficient: boolean;
    shortage: number;
  }>;
  costDelta: { before: number; after: number; diff: number } | null;
  statusTransition: { from: string; to: string } | null;
}

export interface KolamRestoreProductionResult {
  message: string;
  production: KolamProduction;
  restoreReport: {
    newStatus: 'pending' | 'waiting_for_po';
    restoredItems: string[];
    shortages: Array<{
      productId: string;
      productName: string;
      required: number;
      available: number;
      shortage: number;
      unit: string | null;
    }>;
  };
}

export interface KolamCreateProductionWithPOResult {
  message: string;
  production: KolamProduction;
  createdPOs: Array<{ id: string; poCode: string; vendorId: string; vendorName: string }>;
  failedPOs: Array<{
    vendorId: string;
    vendorName: string;
    reason: string;
    items: Array<{
      productId: string;
      productName: string;
      sku: string;
      quantity: number;
      reason: string;
    }>;
  }>;
  shortfallNoVendor: Array<{
    productId: string;
    productName: string;
    quantity: number;
  }>;
}

export async function getKolamProductionList(
  filters: KolamProductionListFilters,
): Promise<KolamProductionListResult> {
  const response = await kolamRequest<unknown>('/production', {
    query: {
      page: filters.page,
      limit: filters.limit,
      sort: 'createdAt:desc',
      search: filters.search.trim() || undefined,
      status: filters.status || undefined,
      startDate: filters.startDate.trim() || undefined,
      endDate: filters.endDate.trim() || undefined,
    },
  });
  return normalizeKolamProductionList(response);
}

export async function getKolamProduction(id: string): Promise<KolamProduction> {
  const response = await kolamRequest<unknown>(
    `/production/${encodeURIComponent(id)}`,
  );
  return normalizeKolamProduction(response);
}

export async function createKolamProduction(
  body: KolamCreateProductionBody,
): Promise<KolamProduction> {
  const response = await kolamRequest<unknown>('/production', {
    method: 'POST',
    body,
  });
  return normalizeKolamProduction(response);
}

export async function createKolamProductionWithPO(
  body: KolamCreateProductionWithPOBody,
): Promise<KolamCreateProductionWithPOResult> {
  const response = await kolamRequest<{
    message?: string;
    data?: unknown;
    createdPOs?: Array<{
      _id?: string;
      poCode?: string;
      vendorId?: string;
      vendorName?: string;
    }>;
    failedPOs?: KolamCreateProductionWithPOResult['failedPOs'];
    shortfallNoVendor?: KolamCreateProductionWithPOResult['shortfallNoVendor'];
  }>('/production/create-with-po', {
    method: 'POST',
    body,
  });

  return {
    message: response.message ?? '',
    production: normalizeKolamProduction(response.data ?? response),
    createdPOs: (response.createdPOs ?? []).map(po => ({
      id: po._id ?? '',
      poCode: po.poCode ?? '',
      vendorId: po.vendorId ?? '',
      vendorName: po.vendorName ?? '',
    })),
    failedPOs: response.failedPOs ?? [],
    shortfallNoVendor: response.shortfallNoVendor ?? [],
  };
}

export async function updateKolamProduction(
  id: string,
  body: KolamUpdateProductionBody,
): Promise<KolamProduction> {
  const response = await kolamRequest<unknown>(
    `/production/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body,
    },
  );
  return normalizeKolamProduction(response);
}

export async function cancelKolamProduction(
  id: string,
  note?: string,
): Promise<KolamProduction> {
  const response = await kolamRequest<unknown>(
    `/production/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: {
        status: 'cancelled',
        note: note?.trim() || undefined,
      },
    },
  );
  return normalizeKolamProduction(response);
}

export async function restoreKolamProduction(
  id: string,
  note?: string,
): Promise<KolamRestoreProductionResult> {
  const response = await kolamRequest<{
    message?: string;
    data?: unknown;
    restoreReport?: KolamRestoreProductionResult['restoreReport'];
  }>(`/production/${encodeURIComponent(id)}/restore`, {
    method: 'POST',
    body: { note: note?.trim() || undefined },
  });

  return {
    message: response.message ?? '',
    production: normalizeKolamProduction(response.data ?? response),
    restoreReport: response.restoreReport ?? {
      newStatus: 'pending',
      restoredItems: [],
      shortages: [],
    },
  };
}

export async function deleteKolamProduction(id: string): Promise<void> {
  await kolamRequest<unknown>(`/production/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function submitKolamProductionCheck(
  id: string,
  body: KolamSubmitCheckBody,
): Promise<KolamProduction> {
  const formData = new FormData();
  formData.append('completedQuantity', String(body.completedQuantity));
  formData.append(
    'componentsBreakdown',
    JSON.stringify(body.componentsBreakdown),
  );
  if (body.note?.trim()) {
    formData.append('note', body.note.trim());
  }
  if (body.completedProofLocalUri?.trim()) {
    formData.append(
      'completedProof',
      createReactNativeFilePart(
        body.completedProofLocalUri,
        'completed-proof.jpg',
      ) as unknown as Blob,
    );
  }

  const response = await kolamRequest<unknown>(
    `/production/${encodeURIComponent(id)}/submit-check`,
    {
      method: 'POST',
      body: formData,
    },
  );

  const root = asRecord(response);
  const productionPayload =
    asRecord(root.production).id || asRecord(root.production)._id
      ? root.production
      : root.data ?? response;
  return normalizeKolamProduction(productionPayload);
}

export async function finalizeKolamProduction(
  id: string,
  body: KolamFinalizeProductionBody,
): Promise<KolamProduction> {
  const response = await kolamRequest<unknown>(
    `/production/${encodeURIComponent(id)}/finalize`,
    {
      method: 'POST',
      body,
    },
  );
  const root = asRecord(response);
  const productionPayload =
    asRecord(root.production).id || asRecord(root.production)._id
      ? root.production
      : root.data ?? response;
  return normalizeKolamProduction(productionPayload);
}

export async function recalculateKolamProduction(
  id: string,
): Promise<KolamRecalculateProductionResult> {
  const response = await kolamRequest<unknown>(
    `/production/${encodeURIComponent(id)}/recalculate`,
    {
      method: 'POST',
    },
  );
  const root = asRecord(response);
  const payload = Object.keys(asRecord(root.data)).length ? root.data : response;
  const record = asRecord(payload);
  const stockReport = Array.isArray(record.stockReport)
    ? record.stockReport.map(item => {
        const row = asRecord(item);
        return {
          productId: getString(row, 'productId'),
          productName: getString(row, 'productName'),
          required: getNumber(row, 'required') ?? 0,
          available: getNumber(row, 'available') ?? 0,
          sufficient: row.sufficient === true,
          shortage: getNumber(row, 'shortage') ?? 0,
        };
      })
    : [];

  const costDeltaRecord = asRecord(record.costDelta);
  const statusTransitionRecord = asRecord(record.statusTransition);

  return {
    production: normalizeKolamProduction(record.production ?? record),
    stockReport,
    costDelta: Object.keys(costDeltaRecord).length
      ? {
          before: getNumber(costDeltaRecord, 'before') ?? 0,
          after: getNumber(costDeltaRecord, 'after') ?? 0,
          diff: getNumber(costDeltaRecord, 'diff') ?? 0,
        }
      : null,
    statusTransition: Object.keys(statusTransitionRecord).length
      ? {
          from: getString(statusTransitionRecord, 'from'),
          to: getString(statusTransitionRecord, 'to'),
        }
      : null,
  };
}

export async function uploadKolamProductionPhotos(
  id: string,
  localUris: string[],
): Promise<KolamProduction> {
  const uris = localUris.map(uri => uri.trim()).filter(Boolean);
  if (!uris.length) {
    return getKolamProduction(id);
  }
  const body = new FormData();
  uris.slice(0, 5).forEach((localUri, index) => {
    body.append(
      'photos',
      createReactNativeFilePart(localUri, `photo-${index + 1}.jpg`) as unknown as Blob,
    );
  });
  const response = await kolamRequest<unknown>(
    `/production/${encodeURIComponent(id)}/photos`,
    {
      method: 'POST',
      body,
    },
  );
  return normalizeKolamProduction(response);
}

export async function deleteKolamProductionPhoto(
  id: string,
  index: number,
): Promise<KolamProduction> {
  const response = await kolamRequest<unknown>(
    `/production/${encodeURIComponent(id)}/photos/${index}`,
    {
      method: 'DELETE',
    },
  );
  return normalizeKolamProduction(response);
}

export async function getKolamProductsForProduction(params: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<KolamProductForProduction[]> {
  const response = await kolamRequest<unknown>('/production/products-for-production', {
    query: {
      page: params.page ?? 1,
      limit: params.limit ?? 100,
      search: params.search?.trim() || undefined,
    },
  });
  return normalizeKolamProductsForProduction(response);
}

export async function getKolamFreyersForProduction(params: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<KolamProductForProduction[]> {
  const response = await kolamRequest<unknown>('/production/freyers-for-production', {
    query: {
      page: params.page ?? 1,
      limit: params.limit ?? 100,
      search: params.search?.trim() || undefined,
    },
  });
  return normalizeKolamProductsForProduction(response);
}

export async function getKolamProductionStaffAssignees(params: {
  search?: string;
  limit?: number;
}): Promise<KolamProductionStaffAssignee[]> {
  const response = await kolamRequest<unknown>('/production/staff-assignees', {
    query: {
      limit: params.limit ?? 200,
      search: params.search?.trim() || undefined,
    },
  });
  return normalizeKolamProductionStaffAssignees(response);
}

export async function getKolamSerialsByProduction(
  productionId: string,
): Promise<{ data: KolamProductionSerial[]; total: number }> {
  const response = await kolamRequest<unknown>(
    `/product-serials/by-production/${encodeURIComponent(productionId)}`,
  );
  return normalizeKolamProductionSerials(response);
}

export async function downloadKolamProductionPdf(
  id: string,
  batchId: string,
): Promise<{ path?: string; name: string }> {
  const base = appConfig.kolamApiBaseUrl.replace(/\/+$/, '');
  const url = `${base}/production/${encodeURIComponent(id)}/export-pdf`;
  const safe = String(batchId || 'export').replace(/[^\w.-]+/g, '_');
  return downloadKolamProductionBinary(url, `Production-${safe}.pdf`, 'application/pdf,*/*');
}

export async function downloadKolamProductionDetailPdf(
  id: string,
  batchId: string,
): Promise<{ path?: string; name: string }> {
  const base = appConfig.kolamApiBaseUrl.replace(/\/+$/, '');
  const url = `${base}/production/${encodeURIComponent(id)}/export-detail-pdf`;
  const safe = String(batchId || 'export').replace(/[^\w.-]+/g, '_');
  return downloadKolamProductionBinary(
    url,
    `Production-Detail-${safe}.pdf`,
    'application/pdf,*/*',
  );
}

export async function downloadKolamProductionListExport(
  filters: Pick<KolamProductionListFilters, 'search' | 'status' | 'startDate' | 'endDate'>,
): Promise<{ path?: string; name: string }> {
  const params = new URLSearchParams();
  params.set('sort', 'createdAt:desc');
  if (filters.search.trim()) {
    params.set('search', filters.search.trim());
  }
  if (filters.status) {
    params.set('status', filters.status);
  }
  if (filters.startDate.trim()) {
    params.set('startDate', filters.startDate.trim());
  }
  if (filters.endDate.trim()) {
    params.set('endDate', filters.endDate.trim());
  }

  const base = appConfig.kolamApiBaseUrl.replace(/\/+$/, '');
  const url = `${base}/production/export?${params.toString()}`;
  const fallbackName = `Production-Audit-${new Date().toISOString().slice(0, 10)}.xlsx`;
  return downloadKolamProductionBinary(
    url,
    fallbackName,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream,*/*',
  );
}

async function downloadKolamProductionBinary(
  url: string,
  fallbackName: string,
  accept: string,
): Promise<{ path?: string; name: string }> {
  const headers = buildKolamProductionBinaryHeaders(accept);
  const response = await fetch(url, { method: 'GET', headers });

  if (!response.ok) {
    let message: string | undefined;
    try {
      const body: unknown = await response.json();
      const record =
        body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
      message = typeof record.message === 'string' ? record.message : undefined;
    } catch {
      message = await response.text();
    }
    throw new ApiError(response.status, { message });
  }

  const filename =
    deriveKolamProductionFilenameFromDisposition(
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

function buildKolamProductionBinaryHeaders(accept: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: accept,
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

function deriveKolamProductionFilenameFromDisposition(value?: string) {
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
  const globalBtoa = (globalThis as { btoa?: (data: string) => string }).btoa;
  if (typeof globalBtoa === 'function') {
    return globalBtoa(binary);
  }
  const { Buffer } = require('buffer') as typeof import('buffer');
  return Buffer.from(bytes).toString('base64');
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
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

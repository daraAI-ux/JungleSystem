import { appConfig } from '../config/app';
import { getRuntimeClientHeaders } from '../domain/runtime-client-contract';
import type {
  KolamCreatePOBody,
  KolamEditPOCheckItemsBody,
  KolamPurchaseOrder,
  KolamPurchaseOrderListFilters,
  KolamPurchaseOrderListResult,
  KolamUpdatePOContentBody,
  KolamUpdatePOStatusBody,
} from '../domain/kolam-purchase-order';
import {
  normalizeKolamPurchaseOrder,
  normalizeKolamPurchaseOrderList,
} from '../domain/kolam-purchase-order';
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

export interface KolamPOItemForSelectionVariant {
  id: string;
  tier1Value: string;
  tier2Value: string;
  sku: string;
  stock: number;
  price: number;
}

export interface KolamPOItemForSelection {
  id: string;
  itemType: 'product' | 'species' | 'packing';
  title: string;
  commonName: string;
  sku: string;
  productCode: string;
  stock: number;
  price: number;
  unitLabel: string;
  variants: KolamPOItemForSelectionVariant[];
}

export interface KolamGetItemsForPOParams {
  vendor?: string;
  search?: string;
  type?: 'all' | 'product' | 'species' | 'packing';
}

export interface KolamGetItemsForPOResult {
  products: KolamPOItemForSelection[];
  species: KolamPOItemForSelection[];
  packings: KolamPOItemForSelection[];
}

export interface KolamGetVendorsForPOItemParams {
  product?: string;
  species?: string;
}

export interface KolamVendorForPOItem {
  id: string;
  name: string;
  email: string;
}

export async function getKolamPurchaseOrderList(
  filters: KolamPurchaseOrderListFilters,
): Promise<KolamPurchaseOrderListResult> {
  const response = await kolamRequest<unknown>('/po', {
    query: {
      page: filters.page,
      limit: filters.limit,
      sort: 'createdAt:desc',
      search: filters.search.trim() || undefined,
      searchByItem: filters.searchByItem.trim() || undefined,
      status: filters.status || undefined,
      paymentStatus: filters.paymentStatus || undefined,
      startDate: filters.startDate.trim() || undefined,
      endDate: filters.endDate.trim() || undefined,
    },
  });

  return normalizeKolamPurchaseOrderList(response);
}

export async function getKolamPurchaseOrder(
  id: string,
): Promise<KolamPurchaseOrder> {
  const response = await kolamRequest<unknown>(
    `/po/${encodeURIComponent(id)}`,
  );
  return normalizeKolamPurchaseOrder(response);
}

export async function createKolamPurchaseOrder(
  body: KolamCreatePOBody,
): Promise<KolamPurchaseOrder> {
  const response = await kolamRequest<unknown>('/po', {
    method: 'POST',
    body,
  });
  return normalizeKolamPurchaseOrder(response);
}

export async function updateKolamPurchaseOrder(
  id: string,
  body: KolamUpdatePOContentBody,
): Promise<KolamPurchaseOrder> {
  const response = await kolamRequest<unknown>(
    `/po/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body,
    },
  );
  return normalizeKolamPurchaseOrder(response);
}

export async function updateKolamPurchaseOrderFakturPajak(
  id: string,
  body: {
    serialNumber?: string;
    status?: 'none' | 'draft' | 'issued' | 'cancelled';
    vendorNpwp?: string;
    vendorName?: string;
    notes?: string;
  },
): Promise<KolamPurchaseOrder> {
  await kolamRequest<unknown>(
    `/dara-tax/faktur-pajak/po/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body,
    },
  );
  return getKolamPurchaseOrder(id);
}

export async function deleteKolamPurchaseOrder(id: string): Promise<void> {
  await kolamRequest<unknown>(`/po/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function updateKolamPurchaseOrderStatus(
  id: string,
  body: KolamUpdatePOStatusBody,
): Promise<KolamPurchaseOrder> {
  const response = await kolamRequest<unknown>(
    `/po/${encodeURIComponent(id)}/status`,
    {
      method: 'PUT',
      body,
    },
  );
  return normalizeKolamPurchaseOrder(response);
}

export async function editKolamPurchaseOrderCheckItems(
  id: string,
  body: KolamEditPOCheckItemsBody,
): Promise<KolamPurchaseOrder> {
  const response = await kolamRequest<unknown>(
    `/po/${encodeURIComponent(id)}/check-items`,
    {
      method: 'PUT',
      body,
    },
  );
  return normalizeKolamPurchaseOrder(response);
}

export async function updateKolamPurchaseOrderPayment(
  id: string,
  body: { paymentStatus: 'paid'; paymentProof: string },
): Promise<KolamPurchaseOrder> {
  const response = await kolamRequest<unknown>(
    `/po/${encodeURIComponent(id)}/payment`,
    {
      method: 'PUT',
      body,
    },
  );
  return normalizeKolamPurchaseOrder(response);
}

export async function payKolamPurchaseOrderDP(
  id: string,
  body: { paymentProof: string },
): Promise<{
  message: string;
  dpAmount: number;
  paymentAmount: number;
  paymentStatus: string;
}> {
  return kolamRequest(`/po/${encodeURIComponent(id)}/pay-dp`, {
    method: 'POST',
    body,
  });
}

export async function confirmKolamPurchaseOrderRefund(
  id: string,
  body: { refundProof: string },
): Promise<KolamPurchaseOrder> {
  const response = await kolamRequest<unknown>(
    `/po/${encodeURIComponent(id)}/refund/confirm`,
    {
      method: 'PUT',
      body,
    },
  );
  return normalizeKolamPurchaseOrder(response);
}

export async function replaceKolamPurchaseOrderPaymentProof(
  id: string,
  paymentProof: string,
): Promise<KolamPurchaseOrder> {
  const response = await kolamRequest<unknown>(
    `/po/${encodeURIComponent(id)}/payment-proof`,
    {
      method: 'PATCH',
      body: { paymentProof },
    },
  );
  return normalizeKolamPurchaseOrder(response);
}

export async function replaceKolamPurchaseOrderRefundProof(
  id: string,
  refundProof: string,
): Promise<KolamPurchaseOrder> {
  const response = await kolamRequest<unknown>(
    `/po/${encodeURIComponent(id)}/refund-proof`,
    {
      method: 'PATCH',
      body: { refundProof },
    },
  );
  return normalizeKolamPurchaseOrder(response);
}

export async function uploadKolamPurchaseOrderPaymentProof(
  id: string,
  localUri: string,
): Promise<{ path: string }> {
  return uploadSingleKolamPOProof(id, 'upload-payment-proof', localUri);
}

export async function uploadKolamPurchaseOrderRefundProof(
  id: string,
  localUri: string,
): Promise<{ path: string }> {
  return uploadSingleKolamPOProof(id, 'upload-refund-proof', localUri);
}

export async function uploadKolamPurchaseOrderVendorInvoice(
  id: string,
  localUri: string,
): Promise<{ path: string }> {
  return uploadSingleKolamPOProof(id, 'upload-vendor-invoice', localUri);
}

export async function uploadKolamPurchaseOrderReceiveProof(
  id: string,
  localUris: string[],
): Promise<{ paths: string[] }> {
  return uploadMultiKolamPOProof(id, 'upload-receive-proof', localUris);
}

export async function uploadKolamPurchaseOrderCheckProof(
  id: string,
  localUris: string[],
): Promise<{ paths: string[] }> {
  return uploadMultiKolamPOProof(id, 'upload-check-proof', localUris);
}

export async function uploadKolamPurchaseOrderPartialProof(
  id: string,
  localUris: string[],
): Promise<{ paths: string[] }> {
  return uploadMultiKolamPOProof(id, 'upload-partial-proof', localUris);
}

async function uploadSingleKolamPOProof(
  id: string,
  action: string,
  localUri: string,
): Promise<{ path: string }> {
  const body = new FormData();
  body.append(
    'file',
    createReactNativeFilePart(localUri, `${action}.jpg`) as unknown as Blob,
  );

  return kolamRequest<{ path: string }>(
    `/po/${encodeURIComponent(id)}/${action}`,
    {
      method: 'POST',
      body,
    },
  );
}

async function uploadMultiKolamPOProof(
  id: string,
  action: string,
  localUris: string[],
): Promise<{ paths: string[] }> {
  const uris = localUris.map(uri => uri.trim()).filter(Boolean);
  if (!uris.length) {
    return { paths: [] };
  }

  const body = new FormData();
  uris.slice(0, 5).forEach((localUri, index) => {
    body.append(
      'file',
      createReactNativeFilePart(localUri, `${action}-${index + 1}.jpg`) as unknown as Blob,
    );
  });

  const response = await kolamRequest<{ paths?: string[] }>(
    `/po/${encodeURIComponent(id)}/${action}`,
    {
      method: 'POST',
      body,
    },
  );
  return { paths: response.paths ?? [] };
}

export async function getKolamItemsForPO(
  params: KolamGetItemsForPOParams,
): Promise<KolamGetItemsForPOResult> {
  const response = await kolamRequest<unknown>('/po/items-for-po', {
    query: {
      vendor: params.vendor || undefined,
      search: params.search?.trim() || undefined,
      type: params.type ?? 'all',
    },
  });

  return normalizeKolamItemsForPO(response);
}

export async function getKolamVendorsForPOItem(
  params: KolamGetVendorsForPOItemParams,
): Promise<KolamVendorForPOItem[]> {
  const response = await kolamRequest<{
    vendors?: Array<{ _id?: string; name?: string; email?: string }>;
  }>('/po/vendors-for-item', {
    query: {
      product: params.product || undefined,
      species: params.species || undefined,
    },
  });

  return (response.vendors ?? [])
    .map(vendor => ({
      id: vendor._id ?? '',
      name: vendor.name ?? '',
      email: vendor.email ?? '',
    }))
    .filter(vendor => vendor.id);
}

export async function downloadKolamPurchaseOrderPdf(
  id: string,
  poCode: string,
): Promise<{ path?: string; name: string }> {
  const base = appConfig.kolamApiBaseUrl.replace(/\/+$/, '');
  const url = `${base}/po/${encodeURIComponent(id)}/export-pdf`;
  const safe = String(poCode || 'export').replace(/[^\w.-]+/g, '_');
  return downloadKolamPOBinary(url, `PO-${safe}.pdf`, 'application/pdf,*/*');
}

export async function downloadKolamPurchaseOrderListExport(
  filters: Pick<KolamPurchaseOrderListFilters, 'search' | 'status' | 'startDate' | 'endDate'>,
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
  const url = `${base}/po/export?${params.toString()}`;
  const fallbackName = `PO-Audit-${new Date().toISOString().slice(0, 10)}.xlsx`;
  return downloadKolamPOBinary(
    url,
    fallbackName,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream,*/*',
  );
}

async function downloadKolamPOBinary(
  url: string,
  fallbackName: string,
  accept: string,
): Promise<{ path?: string; name: string }> {
  const headers = buildKolamPOBinaryHeaders(accept);
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
    deriveKolamPOFilenameFromDisposition(
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

function normalizeKolamItemsForPO(payload: unknown): KolamGetItemsForPOResult {
  const root = asRecord(payload);
  const data = asRecord(root.data);
  return {
    products: normalizeKolamPOSelectionList(data.products, 'product'),
    species: normalizeKolamPOSelectionList(data.species, 'species'),
    packings: normalizeKolamPOSelectionList(data.packings, 'packing'),
  };
}

function normalizeKolamPOSelectionList(
  value: unknown,
  itemType: KolamPOItemForSelection['itemType'],
): KolamPOItemForSelection[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => normalizeKolamPOSelectionItem(item, itemType))
    .filter((item): item is KolamPOItemForSelection => Boolean(item));
}

function normalizeKolamPOSelectionItem(
  value: unknown,
  itemType: KolamPOItemForSelection['itemType'],
): KolamPOItemForSelection | null {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  const title =
    itemType === 'species'
      ? getString(record, 'scientificName')
      : getString(record, 'name');
  if (!id || !title) {
    return null;
  }

  const unitRecord = asRecord(record.units);

  return {
    id,
    itemType,
    title,
    commonName: getString(record, 'commonName') || getString(record, 'localName'),
    sku: getString(record, 'sku'),
    productCode: getString(record, 'productCode'),
    stock: getNumber(record, 'stock'),
    price: getNumber(record, 'price') || getNumber(record, 'cost'),
    unitLabel: getString(unitRecord, 'initial') || getString(unitRecord, 'name'),
    variants: normalizeKolamPOSelectionVariants(record.variants),
  };
}

function normalizeKolamPOSelectionVariants(
  value: unknown,
): KolamPOItemForSelectionVariant[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const record = asRecord(item);
      const id = getString(record, '_id') || getString(record, 'id');
      if (!id) {
        return null;
      }
      return {
        id,
        tier1Value: getString(record, 'tier1Value'),
        tier2Value: getString(record, 'tier2Value'),
        sku: getString(record, 'sku'),
        stock: getNumber(record, 'stock'),
        price: getNumber(record, 'price'),
      };
    })
    .filter((item): item is KolamPOItemForSelectionVariant => Boolean(item));
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

function buildKolamPOBinaryHeaders(accept: string): Record<string, string> {
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

function deriveKolamPOFilenameFromDisposition(value?: string) {
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
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

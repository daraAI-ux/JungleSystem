import { appConfig } from '../config/app';
import { getRuntimeClientHeaders } from '../domain/runtime-client-contract';
import type {
  KolamStockTransactionListFilters,
  KolamStockTransactionListResult,
} from '../domain/kolam-stock-transaction';
import { normalizeKolamStockTransactionList } from '../domain/kolam-stock-transaction';
import {
  apiRequest,
  getAccessToken,
  getNativeDeviceIdentity,
} from '../lib/api-client';
import { ApiError } from '../lib/api-error';
import { saveNativeBase64File } from './native-file-saver';

export async function getKolamStockTransactionList(
  filters: KolamStockTransactionListFilters,
): Promise<KolamStockTransactionListResult> {
  const query: Record<string, string | number | undefined> = {
    page: filters.page,
    limit: filters.limit,
    sort: 'createdAt:desc',
  };

  if (filters.search.trim()) {
    query.search = filters.search.trim();
  }
  if (filters.productId && !filters.speciesId) {
    query.productId = filters.productId;
  }
  if (filters.speciesId && !filters.productId) {
    query.speciesId = filters.speciesId;
  }
  if (filters.stockOpnameId.trim()) {
    query.stockOpnameId = filters.stockOpnameId.trim();
  }
  if (filters.status === 'verified' || filters.status === 'unverified') {
    query.status = filters.status;
  }
  if (filters.startDate.trim()) {
    query.startDate = filters.startDate.trim();
  }
  if (filters.endDate.trim()) {
    query.endDate = filters.endDate.trim();
  }

  const response = await apiRequest<unknown>({
    path: '/stock-transactions',
    query,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  return normalizeKolamStockTransactionList(response);
}

export async function downloadKolamStockTransactionExport(
  filters: KolamStockTransactionListFilters,
): Promise<{ path?: string; name: string }> {
  const params = new URLSearchParams();
  params.set('sort', 'createdAt:desc');
  if (filters.search.trim()) {
    params.set('search', filters.search.trim());
  }
  if (filters.productId && !filters.speciesId) {
    params.set('productId', filters.productId);
  }
  if (filters.speciesId && !filters.productId) {
    params.set('speciesId', filters.speciesId);
  }
  if (filters.stockOpnameId.trim()) {
    params.set('stockOpnameId', filters.stockOpnameId.trim());
  }
  if (filters.status === 'verified' || filters.status === 'unverified') {
    params.set('status', filters.status);
  }
  if (filters.startDate.trim()) {
    params.set('startDate', filters.startDate.trim());
  }
  if (filters.endDate.trim()) {
    params.set('endDate', filters.endDate.trim());
  }

  const base = appConfig.kolamApiBaseUrl.replace(/\/+$/, '');
  const url = `${base}/stock-transactions/export?${params.toString()}`;
  const headers = buildBinaryHeaders();
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = { message: await response.text() };
    }
    throw new ApiError(response.status, payload);
  }

  const filename =
    deriveFilenameFromDisposition(
      response.headers.get('content-disposition') ?? undefined,
    ) ??
    `StockTransactions-Audit-${new Date().toISOString().slice(0, 10)}.xlsx`;
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
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream,*/*',
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
  if (typeof btoa === 'function') {
    return btoa(binary);
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Buffer } = require('buffer') as typeof import('buffer');
  return Buffer.from(bytes).toString('base64');
}

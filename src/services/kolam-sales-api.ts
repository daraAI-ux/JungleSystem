import { appConfig } from '../config/app';
import { getRuntimeClientHeaders } from '../domain/runtime-client-contract';
import type {
  KolamSale,
  KolamSaleCreateBody,
  KolamSaleListFilters,
  KolamSaleListResult,
  KolamSaleSourceOption,
  KolamSaleStatusTransitionTarget,
} from '../domain/kolam-sales';
import {
  normalizeKolamSale,
  normalizeKolamSaleList,
} from '../domain/kolam-sales';
import {
  apiRequest,
  getAccessToken,
  getNativeDeviceIdentity,
} from '../lib/api-client';
import { ApiError } from '../lib/api-error';
import { saveNativeBase64File } from './native-file-saver';

/**
 * Staff Kolam sales API (`/api/sales`).
 * P0: list/detail + status/proof/invoice.
 * P1: create sale + active sources for create form.
 */
export async function getKolamSalesList(
  filters: KolamSaleListFilters,
): Promise<KolamSaleListResult> {
  const query: Record<string, string | number | boolean | undefined> = {
    page: filters.page,
    limit: filters.limit,
  };

  if (filters.search.trim()) {
    query.search = filters.search.trim();
  }
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.deliveryStatus) {
    query.deliveryStatus = filters.deliveryStatus;
  }
  if (filters.needsAction) {
    query.needsAction = true;
  } else if (filters.lifecycle) {
    query.lifecycle = filters.lifecycle;
  }
  if (filters.startDate.trim()) {
    query.startDate = filters.startDate.trim();
  }
  if (filters.endDate.trim()) {
    query.endDate = filters.endDate.trim();
  }

  const payload = await kolamRequest<unknown>('/sales', { query });
  return normalizeKolamSaleList(payload);
}

export async function getKolamSale(id: string): Promise<KolamSale> {
  const payload = await kolamRequest<unknown>(
    `/sales/${encodeURIComponent(id)}`,
  );
  return unwrapSale(payload);
}

/** Active sales sources (online + offline). Not the pricing helper (online-only). */
export async function getKolamSalesActiveSources(): Promise<
  KolamSaleSourceOption[]
> {
  const payload = await kolamRequest<unknown>('/source/active', {
    query: { isActive: true },
  });
  const data =
    payload && typeof payload === 'object' && 'data' in (payload as object)
      ? (payload as { data: unknown }).data
      : payload;
  const list = Array.isArray(data) ? data : [];
  return list
    .map(row => {
      if (!row || typeof row !== 'object') {
        return null;
      }
      const record = row as Record<string, unknown>;
      const id = String(record._id ?? record.id ?? '').trim();
      if (!id) {
        return null;
      }
      const typeRaw = String(record.type ?? '').trim().toLowerCase();
      return {
        id,
        name: String(record.name ?? '').trim() || id,
        type: typeRaw === 'online' || typeRaw === 'offline' ? typeRaw : typeRaw,
      } satisfies KolamSaleSourceOption;
    })
    .filter((row): row is KolamSaleSourceOption => Boolean(row));
}

export async function createKolamSale(
  body: KolamSaleCreateBody,
): Promise<KolamSale> {
  const payload = await kolamRequest<unknown>('/sales', {
    method: 'POST',
    body,
  });
  return unwrapSale(payload);
}

export async function updateKolamSaleStatus(
  id: string,
  status: KolamSaleStatusTransitionTarget | string,
): Promise<KolamSale> {
  const payload = await kolamRequest<unknown>(
    `/sales/${encodeURIComponent(id)}/status`,
    {
      method: 'PUT',
      body: { status },
    },
  );
  return unwrapSale(payload);
}

export async function uploadKolamSalePaymentProofs(
  id: string,
  localUris: string[],
  note?: string,
): Promise<KolamSale> {
  const uris = localUris.map(uri => uri.trim()).filter(Boolean);
  if (!uris.length) {
    throw new Error('Pilih minimal satu file bukti pembayaran.');
  }

  const body = new FormData();
  uris.slice(0, 5).forEach((localUri, index) => {
    body.append(
      'proofs',
      createReactNativeFilePart(
        localUri,
        `sale-payment-proof-${index + 1}.jpg`,
      ) as unknown as Blob,
    );
  });
  if (note?.trim()) {
    body.append('note', note.trim());
  }

  const payload = await kolamRequest<unknown>(
    `/sales/${encodeURIComponent(id)}/payment-proofs`,
    {
      method: 'POST',
      body,
    },
  );
  return unwrapSale(payload);
}

export async function downloadKolamSaleInvoice(
  id: string,
  invoiceCode: string,
): Promise<{ path?: string; name: string }> {
  const base = appConfig.kolamApiBaseUrl.replace(/\/+$/, '');
  const url = `${base}/sales/${encodeURIComponent(id)}/invoice`;
  const safe = String(invoiceCode || 'invoice').replace(/[^\w.-]+/g, '_');
  return downloadKolamSaleBinary(url, `${safe}.pdf`, 'application/pdf,*/*');
}

function unwrapSale(payload: unknown): KolamSale {
  const row =
    payload && typeof payload === 'object' && 'data' in (payload as object)
      ? (payload as { data: unknown }).data
      : payload;
  return normalizeKolamSale(row);
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

async function downloadKolamSaleBinary(
  url: string,
  fallbackName: string,
  accept: string,
): Promise<{ path?: string; name: string }> {
  const headers = buildKolamSaleBinaryHeaders(accept);
  const response = await fetch(url, { method: 'GET', headers });

  if (!response.ok) {
    let message: string | undefined;
    let code: string | undefined;
    try {
      const body: unknown = await response.json();
      const record =
        body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
      message = typeof record.message === 'string' ? record.message : undefined;
      code =
        typeof record.errorCode === 'string'
          ? record.errorCode
          : typeof record.code === 'string'
            ? record.code
            : undefined;
    } catch {
      message = await response.text();
    }
    throw new ApiError(response.status, { message, code });
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
    throw new Error('Unduhan dibatalkan.');
  }

  return {
    name: saveResult.name ?? filename,
    path: saveResult.path,
  };
}

function buildKolamSaleBinaryHeaders(accept: string): Record<string, string> {
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

import { appConfig } from '../config/app';
import { getRuntimeClientHeaders } from '../domain/runtime-client-contract';
import type {
  KolamSale,
  KolamSaleAddItemsBody,
  KolamSaleAnalyticsOverview,
  KolamSaleAnalyticsRange,
  KolamSaleCatalogOption,
  KolamSaleCreateBody,
  KolamSaleDeliveryTransitionTarget,
  KolamSaleListFilters,
  KolamSaleListResult,
  KolamSaleLivestockAllocationRow,
  KolamSaleNotificationSummary,
  KolamSaleSpeciesEnclosureAllocation,
  KolamSaleSpeciesEnclosurePlacement,
  KolamSaleSourceOption,
  KolamSaleStatusTransitionTarget,
  KolamSaleUpdateBody,
} from '../domain/kolam-sales';
import {
  normalizeKolamSale,
  normalizeKolamSaleAnalyticsOverview,
  normalizeKolamSaleList,
} from '../domain/kolam-sales';
import { getKolamActiveSources, getKolamSources } from './kolam-source-api';
import {
  apiRequest,
  getAccessToken,
  getNativeDeviceIdentity,
} from '../lib/api-client';
import { ApiError } from '../lib/api-error';
import { saveNativeBase64File } from './native-file-saver';

/**
 * Staff Kolam sales API (`/api/sales`).
 * Ops: list/detail/create/edit/approval/delivery/export/fulfillment helpers.
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
  const rows = await getKolamActiveSources();
  if (rows.length > 0) {
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      logoUri: row.logoUri,
    }));
  }

  // Fallback when /source/active returns [] but master list still has actives.
  const listed = await getKolamSources({
    isActive: true,
    limit: 1000,
    page: 1,
  });
  return listed.items
    .filter(item => item.isActive)
    .map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      logoUri: item.logoUri,
    }));
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

export async function updateKolamSale(
  id: string,
  body: KolamSaleUpdateBody,
): Promise<KolamSale> {
  const payload = await kolamRequest<unknown>(
    `/sales/${encodeURIComponent(id)}`,
    { method: 'PUT', body },
  );
  return unwrapSale(payload);
}

export async function addItemsToKolamSale(
  id: string,
  body: KolamSaleAddItemsBody,
  idempotencyKey: string,
): Promise<KolamSale> {
  const payload = await kolamRequest<unknown>(
    `/sales/${encodeURIComponent(id)}/add-items`,
    {
      method: 'POST',
      body,
      headers: { 'Idempotency-Key': idempotencyKey },
    },
  );
  return unwrapSale(payload);
}

export async function deleteKolamSale(id: string): Promise<void> {
  await kolamRequest<unknown>(`/sales/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function getKolamSalesServices(): Promise<KolamSaleCatalogOption[]> {
  const payload = await kolamRequest<unknown>('/service', {
    query: { page: 1, limit: 200 },
  });
  return normalizeCatalogOptions(payload);
}

export async function getKolamSalesEnclosuresForSale(): Promise<
  KolamSaleCatalogOption[]
> {
  const payload = await kolamRequest<unknown>('/enclosures/for-sale', {
    query: { page: 1, limit: 200 },
  });
  return normalizeCatalogOptions(payload, ['name', 'code']);
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

export async function updateKolamSaleDelivery(
  id: string,
  target: KolamSaleDeliveryTransitionTarget,
): Promise<KolamSale> {
  if (target === 'packing') {
    const payload = await kolamRequest<unknown>(
      `/sales/${encodeURIComponent(id)}/delivery/status`,
      { method: 'PUT', body: { status: 'packing' } },
    );
    return unwrapSale(payload);
  }
  const pathSuffix =
    target === 'on_delivery'
      ? 'on-delivery'
      : target === 'delivered'
        ? 'delivered'
        : 'success';
  const payload = await kolamRequest<unknown>(
    `/sales/${encodeURIComponent(id)}/delivery/${pathSuffix}`,
    { method: 'PUT' },
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

export async function deleteKolamSalePaymentProof(
  id: string,
  proofId: string,
): Promise<KolamSale> {
  const payload = await kolamRequest<unknown>(
    `/sales/${encodeURIComponent(id)}/payment-proofs/${encodeURIComponent(proofId)}`,
    { method: 'DELETE' },
  );
  return unwrapSale(payload);
}

export async function replaceKolamSalePaymentProof(
  id: string,
  proofId: string,
  localUri: string,
): Promise<KolamSale> {
  const body = new FormData();
  body.append(
    'proof',
    createReactNativeFilePart(localUri, 'sale-payment-proof.jpg') as unknown as Blob,
  );
  const payload = await kolamRequest<unknown>(
    `/sales/${encodeURIComponent(id)}/payment-proofs/${encodeURIComponent(proofId)}`,
    { method: 'PATCH', body },
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

export async function downloadKolamSaleResi(
  id: string,
  invoiceCode: string,
): Promise<{ path?: string; name: string }> {
  const base = appConfig.kolamApiBaseUrl.replace(/\/+$/, '');
  const url = `${base}/sales/${encodeURIComponent(id)}/resi`;
  const safe = String(invoiceCode || 'resi').replace(/[^\w.-]+/g, '_');
  return downloadKolamSaleBinary(url, `${safe}-resi.pdf`, 'application/pdf,*/*');
}

export async function exportKolamSalesListXlsx(
  filters: KolamSaleListFilters,
): Promise<{ path?: string; name: string }> {
  const base = appConfig.kolamApiBaseUrl.replace(/\/+$/, '');
  const params = new URLSearchParams();
  if (filters.search.trim()) {
    params.set('search', filters.search.trim());
  }
  if (filters.status) {
    params.set('status', filters.status);
  }
  if (filters.deliveryStatus) {
    params.set('deliveryStatus', filters.deliveryStatus);
  }
  if (filters.needsAction) {
    params.set('needsAction', 'true');
  } else if (filters.lifecycle) {
    params.set('lifecycle', filters.lifecycle);
  }
  if (filters.startDate.trim()) {
    params.set('startDate', filters.startDate.trim());
  }
  if (filters.endDate.trim()) {
    params.set('endDate', filters.endDate.trim());
  }
  const qs = params.toString();
  const url = `${base}/sales/export${qs ? `?${qs}` : ''}`;
  return downloadKolamSaleBinary(
    url,
    'sales-export.xlsx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,*/*',
  );
}

export async function getKolamSalesAnalyticsOverview(
  range: KolamSaleAnalyticsRange = 'month',
): Promise<KolamSaleAnalyticsOverview> {
  const payload = await kolamRequest<unknown>('/sales/analytics/overview', {
    query: { range },
  });
  return normalizeKolamSaleAnalyticsOverview(payload, range);
}

export async function getKolamSalesNotificationSummary(): Promise<KolamSaleNotificationSummary> {
  const payload = await kolamRequest<unknown>('/sales/notification-summary');
  const root =
    payload && typeof payload === 'object' && 'data' in (payload as object)
      ? (payload as { data: unknown }).data
      : payload;
  const record =
    root && typeof root === 'object' ? (root as Record<string, unknown>) : {};
  return {
    pendingApproval:
      Number(
        record.pendingDiscount ??
          record.pendingApproval ??
          record.pending ??
          0,
      ) || 0,
    needsAction: Number(record.needsAction ?? 0) || 0,
    needDelivery: Number(record.needDelivery ?? record.needsDelivery ?? 0) || 0,
  };
}

export async function requestKolamSaleBiteshipPickup(
  saleId: string,
): Promise<unknown> {
  return kolamRequest<unknown>(
    `/biteship/sales/${encodeURIComponent(saleId)}/request-pickup`,
    { method: 'POST', body: {} },
  );
}

export async function setKolamSaleBiteshipWaybill(
  saleId: string,
  itemId: string,
  waybillId: string,
): Promise<unknown> {
  return kolamRequest<unknown>(
    `/biteship/sales/${encodeURIComponent(saleId)}/items/${encodeURIComponent(
      itemId,
    )}/waybill`,
    { method: 'PUT', body: { waybillId } },
  );
}

export async function getKolamSaleMarketplacePickupOptions(
  saleId: string,
): Promise<unknown> {
  return kolamRequest<unknown>(
    `/marketplace/sales/${encodeURIComponent(saleId)}/pickup-options`,
  );
}

export async function requestKolamSaleMarketplacePickup(
  saleId: string,
  body: Record<string, unknown> = {},
): Promise<unknown> {
  return kolamRequest<unknown>(
    `/marketplace/sales/${encodeURIComponent(saleId)}/request-pickup`,
    { method: 'POST', body },
  );
}

export async function getKolamSalePendingLivestockAllocations(
  saleId: string,
): Promise<KolamSaleLivestockAllocationRow[]> {
  const payload = await kolamRequest<unknown>(
    '/enclosures/pending-livestock-allocations',
    {
      query: { saleId, status: 'pending' },
    },
  );
  const data =
    payload && typeof payload === 'object' && 'data' in (payload as object)
      ? (payload as { data: unknown }).data
      : payload;
  const list = Array.isArray(data) ? data : [];
  return list
    .map((row, index) => normalizeSaleLivestockAllocationRow(row, index))
    .filter((row): row is KolamSaleLivestockAllocationRow => Boolean(row));
}

export async function getKolamSaleSpeciesEnclosureAllocation(
  speciesId: string,
): Promise<KolamSaleSpeciesEnclosureAllocation> {
  const payload = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(speciesId)}/enclosure-allocation`,
  );
  const data =
    payload && typeof payload === 'object' && 'data' in (payload as object)
      ? (payload as { data: unknown }).data
      : payload;
  const record =
    data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const placementsRaw = Array.isArray(record.placements)
    ? record.placements
    : [];

  return {
    speciesId: getRecordId(record.speciesId) || speciesId,
    placements: placementsRaw
      .map(normalizeSaleSpeciesEnclosurePlacement)
      .filter(
        (row): row is KolamSaleSpeciesEnclosurePlacement => Boolean(row),
      ),
  };
}

export async function resolveKolamSaleLivestockAllocation({
  allocations,
  pendingId,
}: {
  allocations: { enclosureId: string; qty: number }[];
  pendingId: string;
}): Promise<unknown> {
  return kolamRequest<unknown>('/enclosures/resolve-livestock-allocation', {
    method: 'POST',
    body: { pendingId, allocations },
  });
}

function normalizeSaleLivestockAllocationRow(
  row: unknown,
  index: number,
): KolamSaleLivestockAllocationRow | null {
  if (!row || typeof row !== 'object') {
    return null;
  }
  const record = row as Record<string, unknown>;
  const id = getRecordId(record._id) || getRecordId(record.id) || `alloc-${index}`;
  const speciesName =
    getRecordString(record.speciesName) ||
    getRecordString(record.name) ||
    getRecordString(record.displayLine) ||
    'Species';
  const displayLine = getRecordString(record.displayLine);
  const variantLabel = getRecordString(record.variantLabel);
  const qtyRemaining = getRecordNumber(record.qtyRemaining) ?? 0;
  const unitLabel = getRecordString(record.unitLabel) || 'ekor';
  const label =
    getRecordString(record.label) ||
    [speciesName, variantLabel].filter(Boolean).join(' · ') ||
    id;

  return {
    id,
    label,
    saleId: getRecordId(record.saleId),
    saleItemIndex: getRecordNumber(record.saleItemIndex) ?? index,
    invoiceCode: getRecordString(record.invoiceCode),
    speciesId: getRecordId(record.speciesId),
    variantId: getRecordId(record.variantId),
    variantLabel,
    qtyTotal: getRecordNumber(record.qtyTotal) ?? qtyRemaining,
    qtyRemaining,
    unitLabel,
    displayLine,
    speciesName,
    status: getRecordString(record.status) || 'pending',
    createdAt: getRecordString(record.createdAt),
  };
}

function normalizeSaleSpeciesEnclosurePlacement(
  row: unknown,
): KolamSaleSpeciesEnclosurePlacement | null {
  if (!row || typeof row !== 'object') {
    return null;
  }
  const record = row as Record<string, unknown>;
  const enclosure =
    record.enclosure && typeof record.enclosure === 'object'
      ? (record.enclosure as Record<string, unknown>)
      : {};
  const enclosureId = getRecordId(enclosure._id) || getRecordId(enclosure.id);
  if (!enclosureId) {
    return null;
  }
  const code = getRecordString(enclosure.enclosure_code);
  const name = getRecordString(enclosure.enclosure_name);
  const quantity = getRecordNumber(record.quantity) ?? 0;
  return {
    enclosureId,
    label: `${code || name || enclosureId} (${quantity})`,
    quantity,
    variantId: getRecordId(record.variantId),
    variantLabel: getRecordString(record.variantLabel),
  };
}

function getRecordString(value: unknown) {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return '';
}

function getRecordNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getRecordId(value: unknown) {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return getRecordString(record._id) || getRecordString(record.id);
  }
  return '';
}

function normalizeCatalogOptions(
  payload: unknown,
  nameKeys: string[] = ['name'],
): KolamSaleCatalogOption[] {
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
      let name = '';
      for (const key of nameKeys) {
        const value = record[key];
        if (typeof value === 'string' && value.trim()) {
          name = value.trim();
          break;
        }
      }
      return { id, name: name || id } satisfies KolamSaleCatalogOption;
    })
    .filter((row): row is KolamSaleCatalogOption => Boolean(row));
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
    headers?: Record<string, string>;
  } = {},
) {
  return apiRequest<T>({
    method: options.method ?? 'GET',
    path,
    query: options.query,
    body: options.body,
    headers: options.headers,
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

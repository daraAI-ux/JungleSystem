/**
 * Commission list (`/commissions`) — Pengeluaran & Pemasukan.
 * Source of truth: FE `api/commission/get.tsx`, `types/commission.ts`.
 */

import type { KolamBadgeIntent } from './kolam-badge';

export const KOLAM_COMMISSION_ROOT = '/commissions';

export type KolamCommissionStatus = 'accrued' | 'released' | 'revoked';

export type KolamCommissionStatusFilter = 'all' | KolamCommissionStatus;

export type KolamCommissionPermissionAction = 'view' | 'confirm';

export type KolamCommissionPermissionEntry = {
  resource?: string;
  actions?: string[];
};

export type KolamCommissionListFilters = {
  search: string;
  status: KolamCommissionStatusFilter;
  page: number;
  limit: number;
};

export type KolamCommissionPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type KolamCommissionListRow = {
  id: string;
  invoiceLabel: string;
  recipientLabel: string;
  itemLabel: string;
  itemSku: string;
  itemType: string;
  quantity: number;
  commissionAmount: number;
  commissionRateLabel: string;
  status: KolamCommissionStatus;
  statusLabel: string;
  deliveryStatusLabel: string;
  releasedAtLabel: string;
  canRelease: boolean;
  saleId: string;
};

export type KolamCommissionListResult = {
  data: KolamCommissionListRow[];
  pagination: KolamCommissionPagination;
};

export const KOLAM_COMMISSION_STATUS_FILTER_OPTIONS: Array<{
  label: string;
  value: KolamCommissionStatusFilter;
}> = [
  { label: 'Semua status', value: 'all' },
  { label: 'Terakru', value: 'accrued' },
  { label: 'Dibayar', value: 'released' },
  { label: 'Dicabut', value: 'revoked' },
];

export function isKolamCommissionRoute(route: string): boolean {
  const path = normalizeCommissionPath(route);
  return path === KOLAM_COMMISSION_ROOT || path.startsWith(`${KOLAM_COMMISSION_ROOT}/`);
}

export function isKolamCommissionListRoute(route: string): boolean {
  return normalizeCommissionPath(route) === KOLAM_COMMISSION_ROOT;
}

export function getKolamCommissionSurfaceMode(route: string): 'list' | 'unsupported' {
  return isKolamCommissionListRoute(route) ? 'list' : 'unsupported';
}

export function createInitialCommissionListFilters(
  route: string,
): KolamCommissionListFilters {
  const query = parseCommissionRouteQuery(route);
  const statusRaw = String(query.status ?? '').trim().toLowerCase();
  const status: KolamCommissionStatusFilter =
    statusRaw === 'accrued' ||
    statusRaw === 'released' ||
    statusRaw === 'revoked'
      ? statusRaw
      : 'all';

  return {
    search: query.search?.trim() ?? '',
    status,
    page: Math.max(1, Number(query.page || '1') || 1),
    limit: Math.max(1, Number(query.limit || '20') || 20),
  };
}

export function buildCommissionListRoute(
  filters: KolamCommissionListFilters,
): string {
  const params = new URLSearchParams();
  if (filters.search.trim()) {
    params.set('search', filters.search.trim());
  }
  if (filters.status !== 'all') {
    params.set('status', filters.status);
  }
  if (filters.page > 1) {
    params.set('page', String(filters.page));
  }
  if (filters.limit !== 20) {
    params.set('limit', String(filters.limit));
  }
  const query = params.toString();
  return query ? `${KOLAM_COMMISSION_ROOT}?${query}` : KOLAM_COMMISSION_ROOT;
}

export function hasKolamCommissionPermission(
  permissions: KolamCommissionPermissionEntry[] | null | undefined,
  action: KolamCommissionPermissionAction,
  roleKey?: string | null,
): boolean {
  const normalizedRole = String(roleKey ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  if (
    normalizedRole === 'super_administrator' ||
    normalizedRole === 'super_admin' ||
    normalizedRole === 'superadmin'
  ) {
    return true;
  }

  if (permissions == null) {
    return true;
  }

  const wanted = action.toLowerCase();
  if (permissionMatchesResource(permissions, 'commission', wanted)) {
    return true;
  }
  return permissionMatchesResource(permissions, 'wallet', wanted);
}

export function formatCommissionStatusLabel(status?: string | null): string {
  switch (String(status || '').toLowerCase()) {
    case 'accrued':
      return 'Terakru';
    case 'released':
      return 'Dibayar';
    case 'revoked':
      return 'Dicabut';
    default:
      return status || '—';
  }
}

export function getCommissionStatusIntent(status?: string | null): KolamBadgeIntent {
  switch (String(status || '').toLowerCase()) {
    case 'released':
      return 'success';
    case 'revoked':
      return 'danger';
    case 'accrued':
      return 'warning';
    default:
      return 'secondary';
  }
}

export function formatCommissionDeliveryStatusLabel(status?: string | null): string {
  switch (String(status || '').toLowerCase()) {
    case 'success':
      return 'Pengiriman selesai';
    case 'delivered':
      return 'Terkirim';
    case 'on_delivery':
      return 'Dalam pengiriman';
    case 'none':
      return 'Belum dikirim';
    default:
      return status || '—';
  }
}

export function normalizeKolamCommissionList(payload: unknown): KolamCommissionListResult {
  const record = asRecord(payload);
  const rows = Array.isArray(record.data)
    ? record.data
    : Array.isArray(payload)
      ? payload
      : [];

  const paginationRecord = asRecord(record.pagination);
  const pagination: KolamCommissionPagination = {
    page: Math.max(1, Number(paginationRecord.page || 1) || 1),
    limit: Math.max(1, Number(paginationRecord.limit || 20) || 20),
    total: Math.max(0, Number(paginationRecord.total || rows.length) || 0),
    totalPages: Math.max(
      1,
      Number(paginationRecord.totalPages || 1) || 1,
    ),
  };

  return {
    data: rows.map(normalizeCommissionRow),
    pagination,
  };
}

function normalizeCommissionRow(value: unknown): KolamCommissionListRow {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  const sale = asRecord(record.sale);
  const customProject = asRecord(record.customProject);
  const status = String(record.status ?? 'accrued').toLowerCase() as KolamCommissionStatus;
  const commissionType = getString(record, 'commissionType');
  const commissionValue = Number(record.commissionValue || 0) || 0;

  return {
    id,
    invoiceLabel:
      getString(sale, 'invoiceCode') ||
      (getString(customProject, 'quotationNumber')
        ? `Proyek ${getString(customProject, 'quotationNumber')}`
        : '—'),
    recipientLabel: resolveRecipientLabel(record.recipientUser),
    itemLabel: resolveCommissionItemLabel(record),
    itemSku: resolveCommissionItemSku(record),
    itemType: getString(record, 'itemType') || '—',
    quantity: Number(record.quantity || 0) || 0,
    commissionAmount: Number(record.commissionAmount || 0) || 0,
    commissionRateLabel:
      commissionType === 'percentage'
        ? `${commissionValue}%`
        : String(commissionValue),
    status,
    statusLabel: formatCommissionStatusLabel(status),
    deliveryStatusLabel: formatCommissionDeliveryStatusLabel(
      getString(sale, 'deliveryStatus'),
    ),
    releasedAtLabel: formatCommissionReleasedAt(getString(record, 'releasedAt')),
    canRelease: canReleaseCommissionRow(record),
    saleId: getString(sale, '_id'),
  };
}

export function canReleaseCommissionRowFromNormalized(
  row: Pick<KolamCommissionListRow, 'status' | 'canRelease'>,
): boolean {
  return row.status === 'accrued' && row.canRelease;
}

function canReleaseCommissionRow(record: Record<string, unknown>): boolean {
  const status = getString(record, 'status');
  if (status !== 'accrued') {
    return false;
  }
  const itemType = getString(record, 'itemType');
  if (itemType === 'custom_project' || record.customProject) {
    return true;
  }
  const sale = asRecord(record.sale);
  return getString(sale, 'status') === 'paid';
}

function resolveRecipientLabel(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim() || '—';
  }
  const record = asRecord(value);
  const name = getString(record, 'name');
  if (name) {
    return name;
  }
  const first = getString(record, 'first_name');
  const last = getString(record, 'last_name');
  const combined = `${first} ${last}`.trim();
  return combined || getString(record, 'email') || '—';
}

function resolveCommissionItemLabel(record: Record<string, unknown>): string {
  const itemType = getString(record, 'itemType');
  const product = asRecord(record.product);
  const species = asRecord(record.species);
  const service = asRecord(record.service);
  const enclosure = asRecord(record.enclosure);
  const customProject = asRecord(record.customProject);

  if (itemType === 'product' && getString(product, 'name')) {
    return getString(product, 'name');
  }
  if (itemType === 'species' && species) {
    return (
      getString(species, 'scientificName') ||
      getString(species, 'commonName') ||
      getString(species, 'localName') ||
      getString(species, 'sku') ||
      getString(species, 'productCode') ||
      '—'
    );
  }
  if (itemType === 'service' && getString(service, 'name')) {
    return getString(service, 'name');
  }
  if (itemType === 'enclosure' && enclosure) {
    const code = getString(enclosure, 'enclosure_code');
    const name = getString(enclosure, 'enclosure_name');
    if (code && name) {
      return `${code} — ${name}`;
    }
    return code || name || 'Kandang';
  }
  if (itemType === 'custom_project') {
    const q = getString(customProject, 'quotationNumber');
    return q ? `Proyek ${q}` : 'Proyek kustom';
  }
  return '—';
}

function resolveCommissionItemSku(record: Record<string, unknown>): string {
  const itemType = getString(record, 'itemType');
  const product = asRecord(record.product);
  const species = asRecord(record.species);
  const service = asRecord(record.service);
  const enclosure = asRecord(record.enclosure);

  if (itemType === 'product') {
    return getString(product, 'sku') || '—';
  }
  if (itemType === 'species') {
    return getString(species, 'sku') || getString(species, 'productCode') || '—';
  }
  if (itemType === 'service') {
    return getString(service, 'sku') || '—';
  }
  if (itemType === 'enclosure') {
    return getString(enclosure, 'enclosure_code') || '—';
  }
  return '—';
}

function formatCommissionReleasedAt(value: string): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function normalizeCommissionPath(route: string): string {
  const path = String(route || '').split('?')[0].replace(/\/+$/, '') || '/';
  return path.startsWith('/') ? path : `/${path}`;
}

function parseCommissionRouteQuery(route: string) {
  const queryIndex = route.indexOf('?');
  if (queryIndex < 0) {
    return {} as Record<string, string>;
  }
  const params = new URLSearchParams(route.slice(queryIndex + 1));
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

function permissionMatchesResource(
  permissions: KolamCommissionPermissionEntry[],
  resource: string,
  action: string,
): boolean {
  const wantedResource = resource.toLowerCase();
  const wantedAction = action.toLowerCase();
  return permissions.some(permission => {
    const entryResource = String(permission.resource ?? '')
      .trim()
      .toLowerCase();
    const actions = (permission.actions ?? []).map(item =>
      String(item).trim().toLowerCase(),
    );
    return (
      (entryResource === wantedResource || entryResource === '*') &&
      (actions.includes(wantedAction) || actions.includes('*'))
    );
  });
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function getString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (value == null) {
    return '';
  }
  return String(value).trim();
}

/**
 * Kolam backoffice Voucher (`/vouchers`) — Campaign discount codes.
 * Source of truth: FE `types/voucher.ts` + list + BE `/api/vouchers`.
 * VA-1A: list (+ toggle status / delete). Create/detail/edit surface later.
 */

import type { KolamBadgeIntent } from './kolam-badge';
import { formatRupiah } from '../lib/money';

export const KOLAM_VOUCHER_ROOT = '/vouchers';
export const KOLAM_VOUCHER_CREATE_ROUTE = `${KOLAM_VOUCHER_ROOT}/create`;

export type KolamVoucherDiscountType = 'fixed' | 'percentage';
export type KolamVoucherStatus = 'active' | 'inactive' | 'expired';
export type KolamVoucherApplicableTo = 'all' | 'products' | 'species';
export type KolamVoucherRouteMode = 'list' | 'detail' | 'edit' | 'new';
export type KolamVoucherPermissionAction =
  | 'view'
  | 'create'
  | 'update'
  | 'delete';

export type KolamVoucherPermissionEntry = {
  resource?: string;
  actions?: string[];
};

export interface KolamVoucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: KolamVoucherDiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minPurchaseAmount: number;
  startDate: string;
  endDate: string;
  usageLimit: number | null;
  usageLimitPerUser: number | null;
  usedCount: number;
  status: KolamVoucherStatus;
  applicableTo: KolamVoucherApplicableTo;
  firstOrderOnly: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KolamVoucherListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: KolamVoucherStatus | '';
}

export interface KolamVoucherListResult {
  items: KolamVoucher[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const KOLAM_VOUCHER_STATUS_FILTER_OPTIONS: Array<{
  label: string;
  value: '' | KolamVoucherStatus;
}> = [
  { label: 'Status', value: '' },
  { label: 'Aktif', value: 'active' },
  { label: 'Nonaktif', value: 'inactive' },
  { label: 'Kedaluwarsa', value: 'expired' },
];

export function isKolamVoucherRoute(route: string): boolean {
  let path = route.split('?')[0].replace(/\/+$/, '') || '/';
  if (path && !path.startsWith('/')) {
    path = `/${path}`;
  }
  if (path === KOLAM_VOUCHER_ROOT || path === KOLAM_VOUCHER_CREATE_ROUTE) {
    return true;
  }
  if (/^\/vouchers\/[^/]+\/edit$/.test(path)) {
    return true;
  }
  if (/^\/vouchers\/[^/]+$/.test(path) && path !== KOLAM_VOUCHER_CREATE_ROUTE) {
    return true;
  }
  return false;
}

export function getKolamVoucherRouteMode(route: string): KolamVoucherRouteMode {
  const path = route.split('?')[0].replace(/\/+$/, '') || '/';
  if (path === KOLAM_VOUCHER_CREATE_ROUTE) {
    return 'new';
  }
  if (/^\/vouchers\/[^/]+\/edit$/.test(path)) {
    return 'edit';
  }
  if (
    /^\/vouchers\/[^/]+$/.test(path) &&
    path !== KOLAM_VOUCHER_ROOT &&
    path !== KOLAM_VOUCHER_CREATE_ROUTE
  ) {
    return 'detail';
  }
  return 'list';
}

export function getKolamVoucherIdFromRoute(route: string): string | null {
  const path = route.split('?')[0];
  const editMatch = /^\/vouchers\/([^/]+)\/edit$/.exec(path);
  if (editMatch?.[1]) {
    return decodeURIComponent(editMatch[1]);
  }
  const detailMatch = /^\/vouchers\/([^/]+)$/.exec(path);
  if (detailMatch?.[1] && detailMatch[1] !== 'create') {
    return decodeURIComponent(detailMatch[1]);
  }
  return null;
}

export function buildKolamVoucherDetailRoute(id: string): string {
  return `${KOLAM_VOUCHER_ROOT}/${encodeURIComponent(id)}`;
}

export function buildKolamVoucherEditRoute(id: string): string {
  return `${KOLAM_VOUCHER_ROOT}/${encodeURIComponent(id)}/edit`;
}

/** Mirror FE `hasPermission("voucher", action)` + super-admin. */
export function hasKolamVoucherPermission(
  permissions: KolamVoucherPermissionEntry[] | null | undefined,
  action: KolamVoucherPermissionAction,
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
  return permissions.some(permission => {
    const resource = String(permission.resource ?? '')
      .trim()
      .toLowerCase();
    const actions = (permission.actions ?? []).map(item =>
      String(item).trim().toLowerCase(),
    );
    return (
      (resource === 'voucher' || resource === '*') &&
      (actions.includes(wanted) || actions.includes('*'))
    );
  });
}

export function formatKolamVoucherStatusLabel(
  status?: string | null,
): string {
  switch (String(status || '').toLowerCase()) {
    case 'active':
      return 'Aktif';
    case 'inactive':
      return 'Nonaktif';
    case 'expired':
      return 'Kedaluwarsa';
    default:
      return status || '—';
  }
}

export function getKolamVoucherStatusIntent(
  status?: string | null,
): KolamBadgeIntent {
  switch (String(status || '').toLowerCase()) {
    case 'active':
      return 'success';
    case 'expired':
      return 'secondary';
    case 'inactive':
      return 'warning';
    default:
      return 'secondary';
  }
}

export function formatKolamVoucherDiscountLabel(voucher: {
  discountType?: string | null;
  discountValue?: number | null;
  maxDiscountAmount?: number | null;
}): string {
  const value = Number(voucher.discountValue);
  const amount = Number.isFinite(value) ? value : 0;
  if (String(voucher.discountType || '').toLowerCase() === 'percentage') {
    const max =
      voucher.maxDiscountAmount != null && voucher.maxDiscountAmount > 0
        ? ` (maks ${formatRupiah(voucher.maxDiscountAmount)})`
        : '';
    return `${amount}%${max}`;
  }
  return formatRupiah(amount);
}

export function formatKolamVoucherUsageLabel(voucher: {
  usedCount?: number | null;
  usageLimit?: number | null;
}): string {
  const used = Math.max(0, Number(voucher.usedCount) || 0);
  const limit = voucher.usageLimit;
  if (limit == null || !(Number(limit) > 0)) {
    return `${used} / ∞`;
  }
  return `${used} / ${limit}`;
}

export function formatKolamVoucherPeriodLabel(voucher: {
  startDate?: string | null;
  endDate?: string | null;
}): string {
  const start = formatKolamVoucherDate(voucher.startDate);
  const end = formatKolamVoucherDate(voucher.endDate);
  if (start === '—' && end === '—') {
    return '—';
  }
  return `${start} → ${end}`;
}

export function formatKolamVoucherRemainingLabel(voucher: {
  startDate?: string | null;
  endDate?: string | null;
}): { label: string; intent: KolamBadgeIntent } {
  const startMs = Date.parse(String(voucher.startDate ?? ''));
  const endMs = Date.parse(String(voucher.endDate ?? ''));
  const now = Date.now();
  const msPerDay = 1000 * 60 * 60 * 24;

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
    return { label: '—', intent: 'secondary' };
  }
  if (now < startMs) {
    const days = Math.max(1, Math.ceil((startMs - now) / msPerDay));
    return { label: `mulai dalam ${days}h`, intent: 'warning' };
  }
  if (now > endMs) {
    return { label: 'kedaluwarsa', intent: 'danger' };
  }
  const days = Math.max(1, Math.ceil((endMs - now) / msPerDay));
  return {
    label: `${days}h tersisa`,
    intent: days <= 3 ? 'warning' : 'success',
  };
}

function formatKolamVoucherDate(value?: string | null): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function normalizeKolamVoucher(payload: unknown): KolamVoucher {
  const record = asRecord(payload);
  const id =
    getMongoId(record, '_id') ||
    getMongoId(record, 'id') ||
    String(record.code ?? '').trim();
  if (!id) {
    throw new Error('Voucher tanpa id');
  }

  const discountTypeRaw = String(record.discountType ?? 'fixed')
    .trim()
    .toLowerCase();
  const discountType: KolamVoucherDiscountType =
    discountTypeRaw === 'percentage' ? 'percentage' : 'fixed';

  const statusRaw = String(record.status ?? 'inactive')
    .trim()
    .toLowerCase();
  const status: KolamVoucherStatus =
    statusRaw === 'active' || statusRaw === 'expired' || statusRaw === 'inactive'
      ? statusRaw
      : 'inactive';

  const applicableRaw = String(record.applicableTo ?? 'all')
    .trim()
    .toLowerCase();
  const applicableTo: KolamVoucherApplicableTo =
    applicableRaw === 'products' || applicableRaw === 'species'
      ? applicableRaw
      : 'all';

  return {
    id,
    code: String(record.code ?? '').trim().toUpperCase(),
    title: String(record.title ?? '').trim(),
    description: String(record.description ?? '').trim(),
    discountType,
    discountValue: Math.max(0, Number(record.discountValue) || 0),
    maxDiscountAmount: getNumber(record, 'maxDiscountAmount'),
    minPurchaseAmount: Math.max(0, Number(record.minPurchaseAmount) || 0),
    startDate: String(record.startDate ?? '').trim(),
    endDate: String(record.endDate ?? '').trim(),
    usageLimit: getNumber(record, 'usageLimit'),
    usageLimitPerUser: getNumber(record, 'usageLimitPerUser'),
    usedCount: Math.max(0, Number(record.usedCount) || 0),
    status,
    applicableTo,
    firstOrderOnly: Boolean(record.firstOrderOnly),
    createdAt: String(record.createdAt ?? '').trim(),
    updatedAt: String(record.updatedAt ?? '').trim(),
  };
}

export function normalizeKolamVoucherList(
  payload: unknown,
  query: KolamVoucherListQuery = {},
): KolamVoucherListResult {
  const root = asRecord(payload);
  const pagination = asRecord(root.pagination);
  const list: unknown[] = Array.isArray(root.data)
    ? root.data
    : Array.isArray(root.vouchers)
      ? root.vouchers
      : Array.isArray(payload)
        ? payload
        : [];

  const limit =
    query.limit ??
    getNumber(pagination, 'limit') ??
    getNumber(root, 'limit') ??
    20;
  const page =
    query.page ??
    getNumber(pagination, 'page') ??
    getNumber(root, 'page') ??
    1;
  const total =
    getNumber(pagination, 'total') ??
    getNumber(root, 'total') ??
    list.length;
  const totalPages =
    getNumber(pagination, 'totalPages') ??
    Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return {
    items: list
      .map(row => {
        try {
          return normalizeKolamVoucher(row);
        } catch {
          return null;
        }
      })
      .filter((item): item is KolamVoucher => Boolean(item?.id)),
    page,
    limit,
    total,
    totalPages,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function getMongoId(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  if (value && typeof value === 'object') {
    const nested = value as Record<string, unknown>;
    if (typeof nested.$oid === 'string' && nested.$oid.trim()) {
      return nested.$oid.trim();
    }
    if (typeof nested._id === 'string' && nested._id.trim()) {
      return nested._id.trim();
    }
  }
  return '';
}

function getNumber(
  record: Record<string, unknown>,
  key: string,
): number | null {
  const value = record[key];
  if (value == null || value === '') {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

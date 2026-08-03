/**
 * Kolam backoffice Voucher (`/vouchers`) — Campaign discount codes.
 * Source of truth: FE `types/voucher.ts` + form/detail + BE `/api/vouchers`.
 */

import type { KolamBadgeIntent } from './kolam-badge';
import { formatRupiah } from '../lib/money';
import {
  formatKolamIsoDate,
  isKolamIsoDate,
  parseKolamIsoDate,
} from './kolam-date';

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

/** Populated ref from detail endpoint (or bare id from list). */
export type KolamVoucherRef = {
  id: string;
  label: string;
  sublabel?: string;
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
  applicableProducts: KolamVoucherRef[];
  applicableSpecies: KolamVoucherRef[];
  applicableCustomers: KolamVoucherRef[];
  firstOrderOnly: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Form uses YYYY-MM-DD for dates (KolamDateField) and strings for numeric inputs. */
export type KolamVoucherFormState = {
  code: string;
  title: string;
  description: string;
  discountType: KolamVoucherDiscountType;
  discountValue: string;
  maxDiscountAmount: string;
  minPurchaseAmount: string;
  startDate: string;
  endDate: string;
  usageLimit: string;
  usageLimitPerUser: string;
  status: Extract<KolamVoucherStatus, 'active' | 'inactive'>;
  applicableTo: KolamVoucherApplicableTo;
  applicableProductIds: string[];
  applicableSpeciesIds: string[];
  applicableCustomerIds: string[];
  firstOrderOnly: boolean;
};

export type KolamVoucherSaveBody = {
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
  status: Extract<KolamVoucherStatus, 'active' | 'inactive'>;
  applicableTo: KolamVoucherApplicableTo;
  applicableProducts: string[];
  applicableSpecies: string[];
  applicableCustomers: string[];
  firstOrderOnly: boolean;
};

export type KolamVoucherPickerOption = {
  id: string;
  label: string;
  sublabel?: string;
};

export type KolamVoucherRedemption = {
  id: string;
  code: string;
  discountApplied: number;
  cancelled: boolean;
  cancelledAt: string | null;
  createdAt: string;
  customerLabel: string;
  saleLabel: string;
  saleId: string | null;
};

export type KolamVoucherRedemptionListResult = {
  items: KolamVoucherRedemption[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

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

export const KOLAM_VOUCHER_DISCOUNT_TYPE_OPTIONS: Array<{
  label: string;
  value: KolamVoucherDiscountType;
}> = [
  { label: 'Nominal Tetap (Rp)', value: 'fixed' },
  { label: 'Persentase (%)', value: 'percentage' },
];

export const KOLAM_VOUCHER_APPLICABLE_TO_OPTIONS: Array<{
  label: string;
  value: KolamVoucherApplicableTo;
}> = [
  { label: 'Semua Item', value: 'all' },
  { label: 'Produk Tertentu', value: 'products' },
  { label: 'Spesies Tertentu', value: 'species' },
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

export function formatKolamVoucherApplicableToLabel(
  value?: string | null,
): string {
  switch (String(value || '').toLowerCase()) {
    case 'products':
      return 'Produk Tertentu';
    case 'species':
      return 'Spesies Tertentu';
    case 'all':
      return 'Semua Item';
    default:
      return value || '—';
  }
}

/** FE: calendar date → UTC midnight ISO (no local TZ shift). */
export function kolamVoucherFormDateToApiIso(dateOnly: string): string {
  const trimmed = dateOnly.trim();
  if (!isKolamIsoDate(trimmed)) {
    return '';
  }
  return `${trimmed}T00:00:00.000Z`;
}

export function kolamVoucherApiDateToFormDate(iso?: string | null): string {
  const raw = String(iso ?? '').trim();
  if (!raw) {
    return '';
  }
  if (isKolamIsoDate(raw.slice(0, 10))) {
    return raw.slice(0, 10);
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return formatKolamIsoDate(date);
}

export function createEmptyKolamVoucherFormState(): KolamVoucherFormState {
  return {
    code: '',
    title: '',
    description: '',
    discountType: 'fixed',
    discountValue: '0',
    maxDiscountAmount: '0',
    minPurchaseAmount: '0',
    startDate: '',
    endDate: '',
    usageLimit: '0',
    usageLimitPerUser: '0',
    status: 'active',
    applicableTo: 'all',
    applicableProductIds: [],
    applicableSpeciesIds: [],
    applicableCustomerIds: [],
    firstOrderOnly: false,
  };
}

export function createKolamVoucherFormState(
  voucher: KolamVoucher,
): KolamVoucherFormState {
  const status: Extract<KolamVoucherStatus, 'active' | 'inactive'> =
    voucher.status === 'active' ? 'active' : 'inactive';
  return {
    code: voucher.code,
    title: voucher.title,
    description: voucher.description,
    discountType: voucher.discountType,
    discountValue: String(voucher.discountValue ?? 0),
    maxDiscountAmount: String(voucher.maxDiscountAmount ?? 0),
    minPurchaseAmount: String(voucher.minPurchaseAmount ?? 0),
    startDate: kolamVoucherApiDateToFormDate(voucher.startDate),
    endDate: kolamVoucherApiDateToFormDate(voucher.endDate),
    usageLimit: String(voucher.usageLimit ?? 0),
    usageLimitPerUser: String(voucher.usageLimitPerUser ?? 0),
    status,
    applicableTo: voucher.applicableTo,
    applicableProductIds: voucher.applicableProducts.map(item => item.id),
    applicableSpeciesIds: voucher.applicableSpecies.map(item => item.id),
    applicableCustomerIds: voucher.applicableCustomers.map(item => item.id),
    firstOrderOnly: voucher.firstOrderOnly,
  };
}

export function validateKolamVoucherForm(
  form: KolamVoucherFormState,
  options: { isEdit?: boolean } = {},
): string | null {
  if (!form.code.trim()) {
    return 'Kode voucher wajib diisi';
  }
  if (!form.title.trim()) {
    return 'Judul voucher wajib diisi (ditampilkan ke pelanggan)';
  }
  if (!form.startDate || !isKolamIsoDate(form.startDate)) {
    return 'Tanggal mulai wajib diisi';
  }
  if (!form.endDate || !isKolamIsoDate(form.endDate)) {
    return 'Tanggal akhir wajib diisi';
  }
  const start = parseKolamIsoDate(form.startDate);
  const end = parseKolamIsoDate(form.endDate);
  if (!start || !end || start.getTime() >= end.getTime()) {
    return 'Tanggal akhir harus setelah tanggal mulai';
  }
  if (!options.isEdit) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (end.getTime() < today.getTime()) {
      return 'Tanggal akhir sudah lewat. Voucher akan langsung kedaluwarsa.';
    }
  }
  const discountValue = Number(form.discountValue);
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    return 'Nilai diskon harus lebih dari 0';
  }
  if (form.discountType === 'percentage' && discountValue > 100) {
    return 'Diskon persentase tidak boleh melebihi 100%';
  }
  if (
    form.applicableTo === 'products' &&
    form.applicableProductIds.length === 0
  ) {
    return 'Pilih minimal satu produk untuk cakupan produk';
  }
  if (
    form.applicableTo === 'species' &&
    form.applicableSpeciesIds.length === 0
  ) {
    return 'Pilih minimal satu spesies untuk cakupan spesies';
  }
  return null;
}

export function createKolamVoucherSavePayload(
  form: KolamVoucherFormState,
): KolamVoucherSaveBody {
  const maxDiscount = Number(form.maxDiscountAmount) || 0;
  const minPurchase = Number(form.minPurchaseAmount) || 0;
  const usageLimit = Number(form.usageLimit) || 0;
  const usageLimitPerUser = Number(form.usageLimitPerUser) || 0;

  return {
    code: form.code.trim().toUpperCase(),
    title: form.title.trim(),
    description: form.description.trim(),
    discountType: form.discountType,
    discountValue: Number(form.discountValue) || 0,
    maxDiscountAmount: maxDiscount > 0 ? maxDiscount : null,
    minPurchaseAmount: minPurchase > 0 ? minPurchase : 0,
    startDate: kolamVoucherFormDateToApiIso(form.startDate),
    endDate: kolamVoucherFormDateToApiIso(form.endDate),
    usageLimit: usageLimit > 0 ? usageLimit : null,
    usageLimitPerUser: usageLimitPerUser > 0 ? usageLimitPerUser : null,
    status: form.status,
    applicableTo: form.applicableTo,
    applicableProducts:
      form.applicableTo === 'products' ? form.applicableProductIds : [],
    applicableSpecies:
      form.applicableTo === 'species' ? form.applicableSpeciesIds : [],
    applicableCustomers: form.applicableCustomerIds,
    firstOrderOnly: form.firstOrderOnly,
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

export function formatKolamVoucherDateTime(value?: string | null): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
    applicableProducts: normalizeKolamVoucherRefList(
      record.applicableProducts,
      'product',
    ),
    applicableSpecies: normalizeKolamVoucherRefList(
      record.applicableSpecies,
      'species',
    ),
    applicableCustomers: normalizeKolamVoucherRefList(
      record.applicableCustomers,
      'customer',
    ),
    firstOrderOnly: Boolean(record.firstOrderOnly),
    createdAt: String(record.createdAt ?? '').trim(),
    updatedAt: String(record.updatedAt ?? '').trim(),
  };
}

export function normalizeKolamVoucherRedemptionList(
  payload: unknown,
  query: { page?: number; limit?: number } = {},
): KolamVoucherRedemptionListResult {
  const root = asRecord(payload);
  const pagination = asRecord(root.pagination);
  const list: unknown[] = Array.isArray(root.data)
    ? root.data
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
          return normalizeKolamVoucherRedemption(row);
        } catch {
          return null;
        }
      })
      .filter((item): item is KolamVoucherRedemption => Boolean(item?.id)),
    page,
    limit,
    total,
    totalPages,
  };
}

function normalizeKolamVoucherRedemption(
  payload: unknown,
): KolamVoucherRedemption {
  const record = asRecord(payload);
  const id =
    getMongoId(record, '_id') ||
    getMongoId(record, 'id') ||
    `${String(record.code ?? '')}-${String(record.createdAt ?? '')}`;
  if (!id) {
    throw new Error('Redemption tanpa id');
  }

  const customer = asRecord(record.customer);
  const sale = asRecord(record.sale);
  const customerName = [
    String(customer.first_name ?? customer.firstName ?? '').trim(),
    String(customer.last_name ?? customer.lastName ?? '').trim(),
  ]
    .filter(Boolean)
    .join(' ');
  const customerLabel =
    customerName ||
    String(customer.name ?? '').trim() ||
    String(customer.email ?? '').trim() ||
    '—';
  const saleId =
    getMongoId(sale, '_id') || getMongoId(sale, 'id') || null;
  const saleLabel =
    String(sale.invoiceCode ?? sale.invoice_code ?? '').trim() ||
    (saleId ? `#${saleId.slice(-6)}` : '—');

  return {
    id,
    code: String(record.code ?? '').trim().toUpperCase(),
    discountApplied: Math.max(0, Number(record.discountApplied) || 0),
    cancelled: Boolean(record.cancelled),
    cancelledAt: String(record.cancelledAt ?? '').trim() || null,
    createdAt: String(record.createdAt ?? '').trim(),
    customerLabel,
    saleLabel,
    saleId,
  };
}

function normalizeKolamVoucherRefList(
  value: unknown,
  kind: 'product' | 'species' | 'customer',
): KolamVoucherRef[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const items: KolamVoucherRef[] = [];
  for (const entry of value) {
    if (typeof entry === 'string' || typeof entry === 'number') {
      const id = String(entry).trim();
      if (id) {
        items.push({ id, label: id });
      }
      continue;
    }
    const record = asRecord(entry);
    const id = getMongoId(record, '_id') || getMongoId(record, 'id');
    if (!id) {
      continue;
    }
    let label = id;
    let sublabel: string | undefined;
    if (kind === 'product') {
      label = String(record.name ?? '').trim() || id;
    } else if (kind === 'species') {
      label =
        String(record.displayName ?? '').trim() ||
        String(record.scientificName ?? '').trim() ||
        String(record.commonName ?? '').trim() ||
        String(record.localName ?? '').trim() ||
        id;
    } else {
      label =
        String(record.name ?? '').trim() ||
        String(record.email ?? '').trim() ||
        id;
      const email = String(record.email ?? '').trim();
      const phone = String(record.phone ?? '').trim();
      sublabel = email || phone || undefined;
    }
    items.push({ id, label, sublabel });
  }
  return items;
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

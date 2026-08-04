/**
 * Finance expense/income list routes — Pengeluaran & Pemasukan (Fase 4).
 * Source of truth: FE `api/expenses/api.tsx`, `api/income/api.tsx`, `types/expenses.ts`.
 */

import type { KolamBadgeIntent } from './kolam-badge';

export const KOLAM_ROUTINE_EXPENSE_ROOT = '/routine-expenses';
export const KOLAM_UNEXPECTED_EXPENSE_ROOT = '/unexpected-expense';
export const KOLAM_UNEXPECTED_INCOME_ROOT = '/unexpected-income';
export const KOLAM_ASSET_PURCHASE_ROOT = '/asset-purchase';

export type KolamFinanceExpenseKind =
  | 'routine-expense'
  | 'unexpected-expense'
  | 'unexpected-income'
  | 'asset-purchase';

export type KolamFinanceExpenseVerifyStatus = 'verified' | 'unverified';

export type KolamFinanceExpenseStatusFilter =
  | 'all'
  | KolamFinanceExpenseVerifyStatus;

export type KolamFinanceExpensePermissionAction =
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'verify';

export type KolamFinanceExpensePermissionEntry = {
  resource?: string;
  actions?: string[];
};

export type KolamFinanceExpensePeriodFilter =
  | 'all'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'custom';

export type KolamFinanceExpenseListFilters = {
  search: string;
  status: KolamFinanceExpenseStatusFilter;
  period: KolamFinanceExpensePeriodFilter;
  startDate: string;
  endDate: string;
  locationId: string;
  page: number;
  limit: number;
};

export type KolamFinanceExpensePagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type KolamFinanceExpenseListRow = {
  id: string;
  code: string;
  name: string;
  amount: number;
  price: number;
  total: number;
  walletLabel: string;
  executedAt: string;
  executedAtLabel: string;
  status: KolamFinanceExpenseVerifyStatus | '';
  statusLabel: string;
  note: string;
  reason: string;
  categoryLabel: string;
  createdByLabel: string;
  locationLabel: string;
  shippingCost: number;
  bookValue: number | null;
};

export type KolamFinanceExpenseListResult = {
  data: KolamFinanceExpenseListRow[];
  pagination: KolamFinanceExpensePagination;
  totals: {
    totalAmount: number;
    totalCount: number;
  } | null;
};

export const KOLAM_FINANCE_EXPENSE_STATUS_FILTER_OPTIONS: Array<{
  label: string;
  value: KolamFinanceExpenseStatusFilter;
}> = [
  { label: 'Semua status', value: 'all' },
  { label: 'Terverifikasi', value: 'verified' },
  { label: 'Belum terverifikasi', value: 'unverified' },
];

export const KOLAM_FINANCE_EXPENSE_PERIOD_FILTER_OPTIONS: Array<{
  label: string;
  value: KolamFinanceExpensePeriodFilter;
}> = [
  { label: 'Semua waktu', value: 'all' },
  { label: 'Minggu ini', value: 'weekly' },
  { label: 'Bulan ini', value: 'monthly' },
  { label: 'Tahun ini', value: 'yearly' },
  { label: 'Kustom', value: 'custom' },
];

const WALLET_FALLBACK_RESOURCES = new Set([
  'routine-expense',
  'unexpected-expense',
  'unexpected-income',
]);

const ROOT_BY_KIND: Record<KolamFinanceExpenseKind, string> = {
  'routine-expense': KOLAM_ROUTINE_EXPENSE_ROOT,
  'unexpected-expense': KOLAM_UNEXPECTED_EXPENSE_ROOT,
  'unexpected-income': KOLAM_UNEXPECTED_INCOME_ROOT,
  'asset-purchase': KOLAM_ASSET_PURCHASE_ROOT,
};

const API_SEGMENT_BY_KIND: Record<KolamFinanceExpenseKind, string> = {
  'routine-expense': 'routine-expense',
  'unexpected-expense': 'unexpected-expense',
  'unexpected-income': 'unexpected-income',
  'asset-purchase': 'asset-purchase',
};

const PERMISSION_RESOURCE_BY_KIND: Record<KolamFinanceExpenseKind, string> = {
  'routine-expense': 'routine-expense',
  'unexpected-expense': 'unexpected-expense',
  'unexpected-income': 'unexpected-income',
  'asset-purchase': 'wallet',
};

export function getKolamFinanceExpenseApiSegment(
  kind: KolamFinanceExpenseKind,
): string {
  return API_SEGMENT_BY_KIND[kind];
}

export function getKolamFinanceExpenseRoot(kind: KolamFinanceExpenseKind): string {
  return ROOT_BY_KIND[kind];
}

export function getKolamFinanceExpenseKindFromRoute(
  route: string,
): KolamFinanceExpenseKind | null {
  if (isKolamRoutineExpenseRoute(route)) {
    return 'routine-expense';
  }
  if (isKolamUnexpectedExpenseRoute(route)) {
    return 'unexpected-expense';
  }
  if (isKolamUnexpectedIncomeRoute(route)) {
    return 'unexpected-income';
  }
  if (isKolamAssetPurchaseRoute(route)) {
    return 'asset-purchase';
  }
  return null;
}

export function isKolamRoutineExpenseRoute(route: string): boolean {
  return matchesFinanceExpenseRoot(route, KOLAM_ROUTINE_EXPENSE_ROOT);
}

export function isKolamUnexpectedExpenseRoute(route: string): boolean {
  return matchesFinanceExpenseRoot(route, KOLAM_UNEXPECTED_EXPENSE_ROOT);
}

export function isKolamUnexpectedIncomeRoute(route: string): boolean {
  return matchesFinanceExpenseRoot(route, KOLAM_UNEXPECTED_INCOME_ROOT);
}

export function isKolamAssetPurchaseRoute(route: string): boolean {
  return matchesFinanceExpenseRoot(route, KOLAM_ASSET_PURCHASE_ROOT);
}

export function isKolamFinanceExpenseRoute(route: string): boolean {
  return getKolamFinanceExpenseKindFromRoute(route) != null;
}

export function isKolamFinanceExpenseListRoute(route: string): boolean {
  const kind = getKolamFinanceExpenseKindFromRoute(route);
  if (!kind) {
    return false;
  }
  const path = normalizeFinanceExpensePath(route);
  return path === getKolamFinanceExpenseRoot(kind);
}

export function getKolamFinanceExpenseSurfaceMode(
  route: string,
): 'list' | 'unsupported' {
  return isKolamFinanceExpenseListRoute(route) ? 'list' : 'unsupported';
}

export function createInitialFinanceExpenseListFilters(
  route: string,
): KolamFinanceExpenseListFilters {
  const query = parseFinanceExpenseRouteQuery(route);
  const statusRaw = String(query.status ?? '').trim().toLowerCase();
  const status: KolamFinanceExpenseStatusFilter =
    statusRaw === 'verified' || statusRaw === 'unverified'
      ? statusRaw
      : 'all';
  const periodRaw = String(query.period ?? '').trim().toLowerCase();
  const period: KolamFinanceExpensePeriodFilter =
    periodRaw === 'weekly' ||
    periodRaw === 'monthly' ||
    periodRaw === 'yearly' ||
    periodRaw === 'custom'
      ? periodRaw
      : 'all';

  return {
    search: query.search?.trim() ?? '',
    status,
    period,
    startDate: query.startDate?.trim() ?? '',
    endDate: query.endDate?.trim() ?? '',
    locationId: query.locationId?.trim() ?? '',
    page: Math.max(1, Number(query.page || '1') || 1),
    limit: Math.max(1, Number(query.limit || '10') || 10),
  };
}

export function buildFinanceExpenseListRoute(
  kind: KolamFinanceExpenseKind,
  filters: KolamFinanceExpenseListFilters,
): string {
  const params = new URLSearchParams();
  if (filters.search.trim()) {
    params.set('search', filters.search.trim());
  }
  if (filters.status !== 'all') {
    params.set('status', filters.status);
  }
  if (filters.period !== 'all') {
    params.set('period', filters.period);
  }
  if (filters.period === 'custom' && filters.startDate.trim()) {
    params.set('startDate', filters.startDate.trim());
  }
  if (filters.period === 'custom' && filters.endDate.trim()) {
    params.set('endDate', filters.endDate.trim());
  }
  if (filters.locationId.trim()) {
    params.set('locationId', filters.locationId.trim());
  }
  if (filters.page > 1) {
    params.set('page', String(filters.page));
  }
  if (filters.limit !== 10) {
    params.set('limit', String(filters.limit));
  }
  const query = params.toString();
  const root = getKolamFinanceExpenseRoot(kind);
  return query ? `${root}?${query}` : root;
}

export function getKolamAssetPurchaseDetailRoute(id: string): string {
  return `${KOLAM_ASSET_PURCHASE_ROOT}/${encodeURIComponent(id)}`;
}

export function getKolamAssetPurchaseCreateRoute(): string {
  return `${KOLAM_ASSET_PURCHASE_ROOT}/create`;
}

export function hasKolamFinanceExpensePermission(
  permissions: KolamFinanceExpensePermissionEntry[] | null | undefined,
  kind: KolamFinanceExpenseKind,
  action: KolamFinanceExpensePermissionAction,
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
  const resource = PERMISSION_RESOURCE_BY_KIND[kind];

  if (permissionMatchesResource(permissions, resource, wanted)) {
    return true;
  }

  if (
    WALLET_FALLBACK_RESOURCES.has(resource) &&
    permissionMatchesResource(permissions, 'wallet', wanted)
  ) {
    return true;
  }

  return permissionMatchesResource(permissions, '*', wanted);
}

export function formatFinanceExpenseStatusLabel(
  status?: string | null,
): string {
  switch (String(status || '').toLowerCase()) {
    case 'verified':
      return 'Terverifikasi';
    case 'unverified':
      return 'Belum terverifikasi';
    default:
      return status || '—';
  }
}

export function getFinanceExpenseStatusIntent(
  status?: string | null,
): KolamBadgeIntent {
  switch (String(status || '').toLowerCase()) {
    case 'verified':
      return 'success';
    case 'unverified':
      return 'warning';
    default:
      return 'secondary';
  }
}

export function formatRoutineExpenseCategoryLabel(
  category?: string | null,
): string {
  if (category === 'salary_payment') {
    return 'Bayar Gaji';
  }
  return 'Umum';
}

export function normalizeKolamFinanceExpenseList(
  payload: unknown,
  kind: KolamFinanceExpenseKind,
): KolamFinanceExpenseListResult {
  const record = asRecord(payload);
  const rows = Array.isArray(record.data)
    ? record.data
    : Array.isArray(payload)
      ? payload
      : [];

  const paginationRecord = asRecord(record.pagination);
  const pagination: KolamFinanceExpensePagination = {
    page: Math.max(1, Number(paginationRecord.page || 1) || 1),
    limit: Math.max(1, Number(paginationRecord.limit || 10) || 10),
    total: Math.max(0, Number(paginationRecord.total || rows.length) || 0),
    totalPages: Math.max(
      1,
      Number(paginationRecord.totalPages || 1) || 1,
    ),
  };

  const totalsRecord = asRecord(record.totals);
  const totals =
    totalsRecord.totalAmount != null || totalsRecord.totalCount != null
      ? {
          totalAmount: Number(totalsRecord.totalAmount || 0) || 0,
          totalCount: Number(totalsRecord.totalCount || 0) || 0,
        }
      : null;

  return {
    data: rows.map(row => normalizeFinanceExpenseRow(row, kind)),
    pagination,
    totals,
  };
}

function normalizeFinanceExpenseRow(
  value: unknown,
  kind: KolamFinanceExpenseKind,
): KolamFinanceExpenseListRow {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  const status = String(record.status ?? 'unverified').toLowerCase() as
    | KolamFinanceExpenseVerifyStatus
    | '';
  const amount = Number(record.amount ?? record.total ?? 0) || 0;
  const price = Number(record.price ?? amount) || 0;
  const total = Number(record.total ?? record.amount ?? 0) || 0;
  const executedAt = getString(record, 'executedAt') || getString(record, 'createdAt');
  const asset = asRecord(record.asset);

  return {
    id,
    code: getString(record, 'code'),
    name: getString(record, 'name') || '—',
    amount,
    price,
    total,
    walletLabel: resolveWalletLabel(record.wallet),
    executedAt,
    executedAtLabel: formatFinanceExpenseDate(executedAt),
    status: status === 'verified' || status === 'unverified' ? status : '',
    statusLabel: formatFinanceExpenseStatusLabel(status),
    note: getString(record, 'note'),
    reason: getString(record, 'reason'),
    categoryLabel:
      kind === 'routine-expense'
        ? formatRoutineExpenseCategoryLabel(getString(record, 'category'))
        : '',
    createdByLabel: resolveUserLabel(record.createdBy),
    locationLabel: resolveLocationLabel(record.location),
    shippingCost: Number(record.shippingCost || 0) || 0,
    bookValue:
      asset.currentBookValue != null
        ? Number(asset.currentBookValue) || 0
        : null,
  };
}

function resolveWalletLabel(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim() || '—';
  }
  const record = asRecord(value);
  return getString(record, 'name') || getString(record, '_id') || '—';
}

function resolveUserLabel(value: unknown): string {
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
  if (combined) {
    return combined;
  }
  return getString(record, 'email') || '—';
}

function resolveLocationLabel(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim() || '—';
  }
  const record = asRecord(value);
  return getString(record, 'name') || getString(record, 'code') || '—';
}

export function formatFinanceExpenseDate(value: string): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function matchesFinanceExpenseRoot(route: string, root: string): boolean {
  const path = normalizeFinanceExpensePath(route);
  return path === root || path.startsWith(`${root}/`);
}

function normalizeFinanceExpensePath(route: string): string {
  const path = String(route || '').split('?')[0].replace(/\/+$/, '') || '/';
  return path.startsWith('/') ? path : `/${path}`;
}

function parseFinanceExpenseRouteQuery(route: string) {
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
  permissions: KolamFinanceExpensePermissionEntry[],
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

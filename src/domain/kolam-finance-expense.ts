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

export type KolamAssetPurchaseSurfaceMode =
  | 'list'
  | 'create'
  | 'edit'
  | 'detail'
  | 'unsupported';

export type KolamAssetPurchaseCustomField = {
  label: string;
  value: string;
};

export type KolamAssetPurchaseFormState = {
  name: string;
  series: string;
  photos: string[];
  customFieldValues: KolamAssetPurchaseCustomField[];
  priceText: string;
  shippingCostText: string;
  walletId: string;
  locationId: string;
  executedAt: string;
  reason: string;
};

export type KolamAssetPurchaseDetail = {
  id: string;
  code: string;
  name: string;
  series: string;
  photos: string[];
  customFieldValues: KolamAssetPurchaseCustomField[];
  price: number;
  shippingCost: number;
  total: number;
  walletId: string;
  walletLabel: string;
  locationId: string;
  locationLabel: string;
  locationType: string;
  executedAt: string;
  reason: string;
  status: KolamFinanceExpenseVerifyStatus | '';
  createdAt: string;
  updatedAt: string;
  hasLinkedAsset: boolean;
};

export type KolamAssetPurchaseDetailTab =
  | 'details'
  | 'pricing'
  | 'depreciation'
  | 'history';

export type KolamAssetPurchaseHistoryItem = {
  id: string;
  title: string;
  at: string;
  atLabel: string;
  lines: string[];
};

export const KOLAM_ASSET_PURCHASE_DETAIL_TABS: Array<{
  id: KolamAssetPurchaseDetailTab;
  label: string;
}> = [
  { id: 'details', label: 'Detail' },
  { id: 'pricing', label: 'Rincian Harga' },
  { id: 'depreciation', label: 'Penyusutan' },
  { id: 'history', label: 'Riwayat' },
];

export type KolamAssetPurchaseWritePayload = {
  name: string;
  price: number;
  shippingCost: number;
  total: number;
  wallet: string;
  location?: string | null;
  photos: string[];
  series: string | null;
  customFieldValues: KolamAssetPurchaseCustomField[];
  executedAt: string;
  reason?: string;
};

export function getKolamAssetPurchaseSurfaceMode(
  route: string,
): KolamAssetPurchaseSurfaceMode {
  if (!isKolamAssetPurchaseRoute(route)) {
    return 'unsupported';
  }
  const path = normalizeFinanceExpensePath(route);
  if (path === KOLAM_ASSET_PURCHASE_ROOT) {
    return 'list';
  }
  if (path === `${KOLAM_ASSET_PURCHASE_ROOT}/create`) {
    return 'create';
  }
  if (/^\/asset-purchase\/[^/]+\/edit$/.test(path)) {
    return 'edit';
  }
  if (/^\/asset-purchase\/[^/]+$/.test(path)) {
    return 'detail';
  }
  return 'unsupported';
}

export function getKolamAssetPurchaseIdFromRoute(route: string): string | null {
  const path = normalizeFinanceExpensePath(route);
  const editMatch = /^\/asset-purchase\/([^/]+)\/edit$/.exec(path);
  if (editMatch?.[1]) {
    return decodeURIComponent(editMatch[1]);
  }
  const detailMatch = /^\/asset-purchase\/([^/]+)$/.exec(path);
  if (detailMatch?.[1] && detailMatch[1] !== 'create') {
    return decodeURIComponent(detailMatch[1]);
  }
  return null;
}

export function getKolamAssetPurchaseEditRoute(id: string): string {
  return `${KOLAM_ASSET_PURCHASE_ROOT}/${encodeURIComponent(id)}/edit`;
}

export function getKolamAssetPurchaseDetailTab(
  route: string,
): KolamAssetPurchaseDetailTab {
  const query = parseFinanceExpenseRouteQuery(route);
  const tab = String(query.tab ?? '')
    .trim()
    .toLowerCase();
  if (
    tab === 'pricing' ||
    tab === 'depreciation' ||
    tab === 'history' ||
    tab === 'details'
  ) {
    return tab;
  }
  return 'details';
}

export function buildKolamAssetPurchaseDetailRoute(
  id: string,
  tab: KolamAssetPurchaseDetailTab = 'details',
): string {
  const base = `${KOLAM_ASSET_PURCHASE_ROOT}/${encodeURIComponent(id)}`;
  if (tab === 'details') {
    return base;
  }
  return `${base}?tab=${tab}`;
}

export function formatFinanceExpenseDateTime(value: string): string {
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

export function buildKolamAssetPurchaseHistoryItems(
  detail: KolamAssetPurchaseDetail,
): KolamAssetPurchaseHistoryItem[] {
  const items: KolamAssetPurchaseHistoryItem[] = [];
  const createdAt = detail.createdAt || detail.executedAt;
  const updatedAt = detail.updatedAt || createdAt;

  if (createdAt && updatedAt && createdAt !== updatedAt) {
    items.push({
      id: 'updated',
      title: 'Pembelian Diperbarui',
      at: updatedAt,
      atLabel: formatFinanceExpenseDateTime(updatedAt),
      lines: [],
    });
  }

  const createLines = [
    `Aset: ${detail.name || '—'}`,
    `Total Investasi: ${formatAssetPurchaseHistoryMoney(detail.total)}`,
  ];
  if (detail.reason.trim()) {
    const reason =
      detail.reason.length > 100
        ? `${detail.reason.slice(0, 100)}...`
        : detail.reason;
    createLines.push(`Alasan: ${reason}`);
  }

  items.push({
    id: 'created',
    title: 'Pembelian Aset Dibuat',
    at: createdAt,
    atLabel: formatFinanceExpenseDateTime(createdAt),
    lines: createLines,
  });

  return items;
}

function formatAssetPurchaseHistoryMoney(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function createEmptyKolamAssetPurchaseForm(
  executedAt = formatFinanceExpenseIsoDate(new Date()),
): KolamAssetPurchaseFormState {
  return {
    name: '',
    series: '',
    photos: [],
    customFieldValues: [],
    priceText: '',
    shippingCostText: '',
    walletId: '',
    locationId: '',
    executedAt,
    reason: '',
  };
}

export function createKolamAssetPurchaseFormFromDetail(
  detail: KolamAssetPurchaseDetail,
): KolamAssetPurchaseFormState {
  return {
    name: detail.name,
    series: detail.series,
    photos: [...detail.photos],
    customFieldValues: detail.customFieldValues.map(field => ({
      label: field.label,
      value: field.value,
    })),
    priceText: detail.price > 0 ? String(detail.price) : '',
    shippingCostText:
      detail.shippingCost > 0 ? String(detail.shippingCost) : '',
    walletId: detail.walletId,
    locationId: detail.locationId,
    executedAt: toFinanceExpenseIsoDate(detail.executedAt),
    reason: detail.reason,
  };
}

export function parseAssetPurchaseMoneyText(value: string): number {
  const digits = String(value || '').replace(/[^\d]/g, '');
  if (!digits) {
    return 0;
  }
  return Number(digits) || 0;
}

export function getAssetPurchaseFormTotal(
  form: Pick<KolamAssetPurchaseFormState, 'priceText' | 'shippingCostText'>,
): number {
  return (
    parseAssetPurchaseMoneyText(form.priceText) +
    parseAssetPurchaseMoneyText(form.shippingCostText)
  );
}

export function buildKolamAssetPurchaseCreatePayload(
  form: KolamAssetPurchaseFormState,
): KolamAssetPurchaseWritePayload {
  const price = parseAssetPurchaseMoneyText(form.priceText);
  const shippingCost = parseAssetPurchaseMoneyText(form.shippingCostText);
  return {
    name: form.name.trim(),
    price,
    shippingCost,
    total: price + shippingCost,
    wallet: form.walletId.trim(),
    location: form.locationId.trim() || undefined,
    photos: form.photos,
    series: form.series.trim() || null,
    customFieldValues: form.customFieldValues.filter(field =>
      field.label.trim(),
    ),
    executedAt: financeExpenseIsoDateToUtcIso(form.executedAt),
    reason: form.reason.trim(),
  };
}

export function buildKolamAssetPurchaseUpdatePayload(
  form: KolamAssetPurchaseFormState,
): KolamAssetPurchaseWritePayload {
  const price = parseAssetPurchaseMoneyText(form.priceText);
  const shippingCost = parseAssetPurchaseMoneyText(form.shippingCostText);
  const reason = form.reason.trim();
  return {
    name: form.name.trim(),
    price,
    shippingCost,
    total: price + shippingCost,
    wallet: form.walletId.trim(),
    location: form.locationId.trim() || null,
    photos: form.photos,
    series: form.series.trim() || null,
    customFieldValues: form.customFieldValues.filter(field =>
      field.label.trim(),
    ),
    executedAt: financeExpenseIsoDateToUtcIso(form.executedAt),
    reason: reason || undefined,
  };
}

export function validateKolamAssetPurchaseForm(
  form: KolamAssetPurchaseFormState,
  mode: 'create' | 'edit',
): string | null {
  if (!form.name.trim()) {
    return 'Masukkan nama aset';
  }
  if (parseAssetPurchaseMoneyText(form.priceText) <= 0) {
    return 'Masukkan harga yang valid';
  }
  if (mode === 'create' && !form.executedAt.trim()) {
    return 'Pilih tanggal eksekusi';
  }
  return null;
}

export function normalizeKolamAssetPurchaseDetail(
  payload: unknown,
): KolamAssetPurchaseDetail {
  const root = asRecord(payload);
  const record =
    root.data && typeof root.data === 'object'
      ? asRecord(root.data)
      : root;
  const status = String(record.status ?? 'unverified').toLowerCase() as
    | KolamFinanceExpenseVerifyStatus
    | '';
  const customFieldValues = Array.isArray(record.customFieldValues)
    ? record.customFieldValues.map(normalizeAssetPurchaseCustomField)
    : [];
  const photos = Array.isArray(record.photos)
    ? record.photos
        .map(item => String(item ?? '').trim())
        .filter(Boolean)
    : [];
  const executedAt =
    getString(record, 'executedAt') || getString(record, 'createdAt');
  const createdAt = getString(record, 'createdAt') || executedAt;
  const updatedAt = getString(record, 'updatedAt') || createdAt;
  const assetId = resolveEntityId(record.asset);

  return {
    id: getString(record, '_id') || getString(record, 'id'),
    code: getString(record, 'code'),
    name: getString(record, 'name'),
    series: getString(record, 'series'),
    photos,
    customFieldValues,
    price: Number(record.price || 0) || 0,
    shippingCost: Number(record.shippingCost || 0) || 0,
    total: Number(record.total || 0) || 0,
    walletId: resolveEntityId(record.wallet),
    walletLabel: resolveWalletLabel(record.wallet),
    locationId: resolveEntityId(record.location),
    locationLabel: resolveLocationLabel(record.location),
    locationType: resolveLocationType(record.location),
    executedAt,
    reason: getString(record, 'reason'),
    status: status === 'verified' || status === 'unverified' ? status : '',
    createdAt,
    updatedAt,
    hasLinkedAsset: Boolean(assetId),
  };
}

function normalizeAssetPurchaseCustomField(
  value: unknown,
): KolamAssetPurchaseCustomField {
  const record = asRecord(value);
  return {
    label: getString(record, 'label'),
    value: getString(record, 'value'),
  };
}

function resolveEntityId(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  const record = asRecord(value);
  return getString(record, '_id') || getString(record, 'id');
}

function resolveLocationType(value: unknown): string {
  if (typeof value === 'string') {
    return '';
  }
  return getString(asRecord(value), 'type');
}

function formatFinanceExpenseIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toFinanceExpenseIsoDate(value: string): string {
  if (!value) {
    return formatFinanceExpenseIsoDate(new Date());
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return formatFinanceExpenseIsoDate(new Date());
  }
  return formatFinanceExpenseIsoDate(date);
}

function financeExpenseIsoDateToUtcIso(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) {
    const fallback = new Date(isoDate);
    if (!Number.isNaN(fallback.getTime())) {
      return fallback.toISOString();
    }
    return new Date().toISOString();
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(year, month - 1, day, 12, 0, 0, 0).toISOString();
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

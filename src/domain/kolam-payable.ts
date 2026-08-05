/**
 * Payable (`/payable`) — ops list + summary + pay-full.
 * Source of truth: FE `types/payable.ts` + BE `/api/payable`.
 */

import type { KolamBadgeIntent } from './kolam-badge';

export const KOLAM_PAYABLE_ROOT = '/payable';

export type KolamPayableStatus = 'open' | 'paid' | 'cancelled';
export type KolamPayableSourceModel =
  | 'PurchaseOrder'
  | 'Loan'
  | 'FuturePayable';
export type KolamPayableSortOption =
  | 'newest'
  | 'oldest'
  | 'due_date_asc'
  | 'due_date_desc'
  | 'next_installment_due_asc';
export type KolamPayableInstallmentDueFilter = 'all' | 'due_7' | 'overdue';
export type KolamPayablePeriodFilter =
  | 'all'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'custom';

export type KolamPayablePermissionAction =
  | 'view'
  | 'create'
  | 'update'
  | 'delete';

export type KolamPayablePermissionEntry = {
  resource?: string;
  actions?: string[];
};

export type KolamPayableWalletRef = {
  id: string;
  name: string;
};

export type KolamPayableInstallmentSummary = {
  totalCount: number;
  paidCount: number;
  pendingCount: number;
  paidAmountTotal: number;
  remainingAmountTotal: number;
  nextDueDate: string;
  nextInstallment: {
    id: string;
    installmentNumber: number;
    dueDate: string;
    amount: number;
  } | null;
};

export type KolamPayablePaymentProof = {
  path: string;
  uploadedAt: string;
};

export type KolamPayablePaymentTransaction = {
  id: string;
  walletName: string;
  note: string;
  createdAt: string;
  createdByName: string;
  proofs: KolamPayablePaymentProof[];
};

export type KolamPayable = {
  id: string;
  code: string;
  name: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  walletName: string;
  dueDate: string;
  sourceModel: KolamPayableSourceModel | '';
  sourceLabel: string;
  vendorName: string;
  status: KolamPayableStatus | '';
  paidAt: string;
  paidByName: string;
  notes: string;
  installmentSummary: KolamPayableInstallmentSummary | null;
  paymentTransaction: KolamPayablePaymentTransaction | null;
  createdAt: string;
  updatedAt: string;
};

export type KolamPayableSummaryBucket = {
  count: number;
  totalAmount: number;
  outstanding: number;
};

export type KolamPayableSummaryData = {
  open: KolamPayableSummaryBucket;
  overdue: {
    count: number;
    totalAmount: number;
  };
};

export type KolamPayableListFilters = {
  page: number;
  limit: number;
  search: string;
  status: '' | KolamPayableStatus;
  sourceModel: '' | KolamPayableSourceModel;
  overdue: boolean;
  installmentDue: KolamPayableInstallmentDueFilter;
  period: KolamPayablePeriodFilter;
  startDate: string;
  endDate: string;
  sort: KolamPayableSortOption;
};

export type KolamPayableListResult = {
  items: KolamPayable[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type KolamPayableSurfaceMode = 'list' | 'detail';

export const KOLAM_PAYABLE_STATUS_OPTIONS: Array<{
  label: string;
  value: '' | KolamPayableStatus;
}> = [
  { label: 'Semua status', value: '' },
  { label: 'Belum lunas', value: 'open' },
  { label: 'Lunas', value: 'paid' },
  { label: 'Dibatalkan', value: 'cancelled' },
];

export const KOLAM_PAYABLE_SOURCE_OPTIONS: Array<{
  label: string;
  value: '' | KolamPayableSourceModel;
}> = [
  { label: 'Semua sumber', value: '' },
  { label: 'PO', value: 'PurchaseOrder' },
  { label: 'Loan', value: 'Loan' },
  { label: 'Manual', value: 'FuturePayable' },
];

export const KOLAM_PAYABLE_INSTALLMENT_DUE_OPTIONS: Array<{
  label: string;
  value: KolamPayableInstallmentDueFilter;
}> = [
  { label: 'Semua cicilan', value: 'all' },
  { label: 'Jatuh tempo <=7 hari', value: 'due_7' },
  { label: 'Ada cicilan terlambat', value: 'overdue' },
];

export const KOLAM_PAYABLE_PERIOD_OPTIONS: Array<{
  label: string;
  value: KolamPayablePeriodFilter;
}> = [
  { label: 'Semua periode', value: 'all' },
  { label: 'Mingguan', value: 'weekly' },
  { label: 'Bulanan', value: 'monthly' },
  { label: 'Tahunan', value: 'yearly' },
  { label: 'Kustom', value: 'custom' },
];

export const KOLAM_PAYABLE_SORT_OPTIONS: Array<{
  label: string;
  value: KolamPayableSortOption;
}> = [
  { label: 'Terbaru', value: 'newest' },
  { label: 'Terlama', value: 'oldest' },
  { label: 'Jatuh tempo terdekat', value: 'due_date_asc' },
  { label: 'Jatuh tempo terjauh', value: 'due_date_desc' },
  { label: 'Cicilan berikutnya', value: 'next_installment_due_asc' },
];

export function isKolamPayableRoute(route: string): boolean {
  const path = normalizePayableRoutePath(route);
  return path === KOLAM_PAYABLE_ROOT || path.startsWith(`${KOLAM_PAYABLE_ROOT}/`);
}

export function isKolamPayableListRoute(route: string): boolean {
  return normalizePayableRoutePath(route) === KOLAM_PAYABLE_ROOT;
}

export function getKolamPayableRouteId(route: string): string | null {
  const path = normalizePayableRoutePath(route);
  if (
    path === KOLAM_PAYABLE_ROOT ||
    path.endsWith('/create') ||
    path.endsWith('/edit') ||
    path.endsWith('/ap')
  ) {
    return null;
  }
  const match = /^\/payable\/([^/]+)$/.exec(path);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function getKolamPayableSurfaceMode(route: string): KolamPayableSurfaceMode {
  return getKolamPayableRouteId(route) ? 'detail' : 'list';
}

export function createInitialPayableListFilters(): KolamPayableListFilters {
  return {
    page: 1,
    limit: 10,
    search: '',
    status: '',
    sourceModel: '',
    overdue: false,
    installmentDue: 'all',
    period: 'all',
    startDate: '',
    endDate: '',
    sort: 'newest',
  };
}

export function hasKolamPayablePermission(
  permissions: KolamPayablePermissionEntry[] | null | undefined,
  action: KolamPayablePermissionAction,
  roleKey?: string | null,
): boolean {
  if (isSuperAdminRole(roleKey)) {
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
    const resourceMatch =
      resource === 'payable' || resource === 'wallet' || resource === '*';
    const actionMatch =
      actions.includes(wanted) || actions.includes('*');
    return resourceMatch && actionMatch;
  });
}

export function formatKolamPayableStatusLabel(
  status?: string | null,
): string {
  switch (String(status || '').toLowerCase()) {
    case 'paid':
      return 'Lunas';
    case 'open':
      return 'Belum lunas';
    case 'cancelled':
      return 'Dibatalkan';
    default:
      return status || '—';
  }
}

export function getKolamPayableStatusIntent(
  status?: string | null,
): KolamBadgeIntent {
  switch (String(status || '').toLowerCase()) {
    case 'paid':
      return 'success';
    case 'open':
      return 'warning';
    case 'cancelled':
      return 'secondary';
    default:
      return 'secondary';
  }
}

export function formatKolamPayableSourceLabel(
  source?: string | null,
): string {
  switch (String(source || '')) {
    case 'PurchaseOrder':
      return 'PO';
    case 'Loan':
      return 'Loan';
    case 'FuturePayable':
      return 'Manual';
    default:
      return source || '—';
  }
}

export function normalizeKolamPayableList(
  payload: unknown,
  query: Pick<KolamPayableListFilters, 'page' | 'limit'> = { page: 1, limit: 10 },
): KolamPayableListResult {
  const root = asRecord(payload);
  const dataRecord = asRecord(root.data);
  const dataRaw = Array.isArray(payload)
    ? payload
    : Array.isArray(root.data)
      ? root.data
      : Array.isArray(dataRecord.items)
        ? dataRecord.items
        : Array.isArray(dataRecord.payables)
          ? dataRecord.payables
          : Array.isArray(root.items)
            ? root.items
            : Array.isArray(root.payables)
              ? root.payables
              : [];
  const meta = Object.keys(asRecord(root.meta)).length
    ? asRecord(root.meta)
    : Object.keys(asRecord(dataRecord.meta)).length
      ? asRecord(dataRecord.meta)
      : Object.keys(asRecord(dataRecord.pagination)).length
        ? asRecord(dataRecord.pagination)
        : asRecord(root.pagination);
  const page = toNumber(meta.page) ?? query.page ?? 1;
  const limit =
    toNumber(meta.limit) ?? toNumber(meta.pageSize) ?? query.limit ?? 10;
  const total =
    toNumber(meta.total) ?? toNumber(meta.totalItems) ?? dataRaw.length;
  const totalPages =
    toNumber(meta.totalPages) ??
    toNumber(meta.pages) ??
    Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return {
    items: dataRaw.map(normalizeKolamPayable).filter(item => item.id),
    page,
    limit,
    total,
    totalPages,
  };
}

export function normalizeKolamPayableSummary(
  payload: unknown,
): KolamPayableSummaryData {
  const root = unwrapData(payload);
  const record = asRecord(root);
  const open = asRecord(record.open);
  const overdue = asRecord(record.overdue);
  return {
    open: {
      count: toNumber(open.count) ?? 0,
      totalAmount: toNumber(open.totalAmount) ?? 0,
      outstanding: toNumber(open.outstanding) ?? 0,
    },
    overdue: {
      count: toNumber(overdue.count) ?? 0,
      totalAmount: toNumber(overdue.totalAmount) ?? 0,
    },
  };
}

export function normalizeKolamPayable(payload: unknown): KolamPayable {
  const record = asRecord(payload);
  const wallet = record.wallet;
  const walletRecord =
    wallet && typeof wallet === 'object' && !Array.isArray(wallet)
      ? asRecord(wallet)
      : null;
  const walletName =
    walletRecord?.name && typeof walletRecord.name === 'string'
      ? walletRecord.name.trim()
      : typeof wallet === 'string'
        ? wallet.trim()
        : '';
  const amount = toNumber(record.amount) ?? 0;
  const paidAmount = toNumber(record.paidAmount) ?? 0;
  const remainingAmount =
    toNumber(record.remainingAmount) ?? Math.max(0, amount - paidAmount);
  const installmentSummary = normalizePayableInstallmentSummary(
    record.installmentSummary,
  );
  const statusRaw = getString(record, 'status').toLowerCase();
  const status: KolamPayableStatus | '' =
    statusRaw === 'open' || statusRaw === 'paid' || statusRaw === 'cancelled'
      ? statusRaw
      : '';
  const sourceModelRaw = getString(record, 'sourceModel');
  const sourceModel: KolamPayableSourceModel | '' =
    sourceModelRaw === 'PurchaseOrder' ||
    sourceModelRaw === 'Loan' ||
    sourceModelRaw === 'FuturePayable'
      ? sourceModelRaw
      : '';

  return {
    id: getString(record, '_id') || getString(record, 'id'),
    code: getString(record, 'code'),
    name: getString(record, 'name'),
    amount,
    paidAmount,
    remainingAmount,
    walletName,
    dueDate: getString(record, 'dueDate'),
    sourceModel,
    sourceLabel: resolvePayableSourceLabel(record, sourceModel),
    vendorName: resolvePayableVendorName(record),
    status,
    paidAt: getString(record, 'paidAt'),
    paidByName: resolvePersonName(record.paidBy),
    notes: getString(record, 'notes'),
    installmentSummary,
    paymentTransaction: normalizePayablePaymentTransaction(
      record.paymentTransaction,
    ),
    createdAt: getString(record, 'createdAt'),
    updatedAt: getString(record, 'updatedAt'),
  };
}

function normalizePayableInstallmentSummary(
  payload: unknown,
): KolamPayableInstallmentSummary | null {
  const record = asRecord(payload);
  if (!Object.keys(record).length) {
    return null;
  }
  const totalCount = toNumber(record.totalCount) ?? 0;
  if (totalCount <= 0) {
    return null;
  }
  return {
    totalCount,
    paidCount: toNumber(record.paidCount) ?? 0,
    pendingCount: toNumber(record.pendingCount) ?? 0,
    paidAmountTotal: toNumber(record.paidAmountTotal) ?? 0,
    remainingAmountTotal: toNumber(record.remainingAmountTotal) ?? 0,
    nextDueDate:
      getString(record, 'nextDueDate') ||
      getString(asRecord(record.nextInstallment), 'dueDate'),
    nextInstallment: normalizeNextPayableInstallment(record.nextInstallment),
  };
}

function normalizeNextPayableInstallment(payload: unknown) {
  const record = asRecord(payload);
  if (!Object.keys(record).length) {
    return null;
  }
  const installmentNumber = toNumber(record.installmentNumber) ?? 0;
  const dueDate = getString(record, 'dueDate');
  if (!installmentNumber && !dueDate) {
    return null;
  }
  return {
    id: getString(record, '_id') || getString(record, 'id'),
    installmentNumber,
    dueDate,
    amount: toNumber(record.amount) ?? 0,
  };
}

function normalizePayablePaymentTransaction(
  payload: unknown,
): KolamPayablePaymentTransaction | null {
  const record = asRecord(payload);
  if (!Object.keys(record).length) {
    return null;
  }
  const wallet = asRecord(record.wallet);
  return {
    id: getString(record, '_id') || getString(record, 'id'),
    walletName: getString(wallet, 'name'),
    note: getString(record, 'note'),
    createdAt: getString(record, 'createdAt'),
    createdByName: resolvePersonName(record.createdBy),
    proofs: normalizePayablePaymentProofs(record.proofs),
  };
}

function normalizePayablePaymentProofs(
  payload: unknown,
): KolamPayablePaymentProof[] {
  if (!Array.isArray(payload)) {
    return [];
  }
  return payload
    .map(item => {
      const record = asRecord(item);
      return {
        path: getString(record, 'path'),
        uploadedAt: getString(record, 'uploadedAt'),
      };
    })
    .filter(item => item.path);
}

function resolvePayableSourceLabel(
  record: Record<string, unknown>,
  sourceModel: KolamPayableSourceModel | '',
): string {
  if (sourceModel === 'PurchaseOrder') {
    const ref = record.sourceRef;
    if (ref && typeof ref === 'object' && !Array.isArray(ref)) {
      const poCode = getString(asRecord(ref), 'poCode');
      if (poCode) {
        return poCode;
      }
    }
  }
  return formatKolamPayableSourceLabel(sourceModel);
}

function resolvePayableVendorName(record: Record<string, unknown>): string {
  const vendor = record.vendor;
  if (vendor && typeof vendor === 'object' && !Array.isArray(vendor)) {
    const name = getString(asRecord(vendor), 'name');
    if (name) {
      return name;
    }
  }
  const sourceRef = record.sourceRef;
  if (sourceRef && typeof sourceRef === 'object' && !Array.isArray(sourceRef)) {
    const nestedVendor = asRecord(sourceRef).vendor;
    if (nestedVendor && typeof nestedVendor === 'object') {
      const name = getString(asRecord(nestedVendor), 'name');
      if (name) {
        return name;
      }
    }
  }
  return '—';
}

function resolvePersonName(value: unknown): string {
  if (!value || typeof value === 'string') {
    return '';
  }
  const record = asRecord(value);
  const name = getString(record, 'name');
  if (name) {
    return name;
  }
  return `${getString(record, 'first_name')} ${getString(
    record,
    'last_name',
  )}`.trim();
}

function normalizePayableRoutePath(route: string): string {
  let path = String(route || '').split('?')[0].replace(/\/+$/, '') || '/';
  if (path && !path.startsWith('/')) {
    path = `/${path}`;
  }
  return path;
}

function isSuperAdminRole(roleKey?: string | null): boolean {
  const normalizedRole = String(roleKey ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  return (
    normalizedRole === 'super_administrator' ||
    normalizedRole === 'super_admin' ||
    normalizedRole === 'superadmin'
  );
}

function unwrapData(payload: unknown): unknown {
  const record = asRecord(payload);
  if ('data' in record && !Array.isArray(payload)) {
    return record.data;
  }
  return payload;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function getString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return '';
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  if (
    value &&
    typeof value === 'object' &&
    '$numberDecimal' in (value as Record<string, unknown>)
  ) {
    const parsed = Number((value as Record<string, unknown>).$numberDecimal);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

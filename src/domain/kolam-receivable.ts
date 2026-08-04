/**
 * Receivable (`/receivable`) — ops list + summary + mark-paid.
 * Source of truth: FE `types/receivable.ts` + BE `/api/receivable`.
 */

import type { KolamBadgeIntent } from './kolam-badge';

export const KOLAM_RECEIVABLE_ROOT = '/receivable';

export type KolamReceivableStatus = 'open' | 'paid' | 'cancelled';
export type KolamReceivableSourceModel = 'Sale' | 'Loan' | 'FutureReceivable';

export type KolamReceivablePermissionAction =
  | 'view'
  | 'create'
  | 'update'
  | 'delete';

export type KolamReceivablePermissionEntry = {
  resource?: string;
  actions?: string[];
};

export type KolamReceivable = {
  id: string;
  code: string;
  name: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  walletName: string;
  dueDate: string;
  sourceModel: KolamReceivableSourceModel | '';
  customerName: string;
  status: KolamReceivableStatus | '';
  paidAt: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type KolamReceivableSummaryBucket = {
  count: number;
  totalAmount: number;
  outstanding: number;
};

export type KolamReceivableSummaryData = {
  open: KolamReceivableSummaryBucket;
  overdue: {
    count: number;
    totalAmount: number;
  };
};

export type KolamReceivableListFilters = {
  page: number;
  limit: number;
  search: string;
  status: '' | KolamReceivableStatus;
  sourceModel: '' | KolamReceivableSourceModel;
  overdue: boolean;
};

export type KolamReceivableListResult = {
  items: KolamReceivable[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const KOLAM_RECEIVABLE_STATUS_OPTIONS: Array<{
  label: string;
  value: '' | KolamReceivableStatus;
}> = [
  { label: 'Semua status', value: '' },
  { label: 'Belum dibayar', value: 'open' },
  { label: 'Sudah dibayar', value: 'paid' },
  { label: 'Dibatalkan', value: 'cancelled' },
];

export const KOLAM_RECEIVABLE_SOURCE_OPTIONS: Array<{
  label: string;
  value: '' | KolamReceivableSourceModel;
}> = [
  { label: 'Semua sumber', value: '' },
  { label: 'Penjualan', value: 'Sale' },
  { label: 'Pinjaman', value: 'Loan' },
  { label: 'Manual', value: 'FutureReceivable' },
];

export function isKolamReceivableRoute(route: string): boolean {
  const path = normalizeReceivableRoutePath(route);
  return (
    path === KOLAM_RECEIVABLE_ROOT ||
    path.startsWith(`${KOLAM_RECEIVABLE_ROOT}/`)
  );
}

export function isKolamReceivableListRoute(route: string): boolean {
  return normalizeReceivableRoutePath(route) === KOLAM_RECEIVABLE_ROOT;
}

export function createInitialReceivableListFilters(): KolamReceivableListFilters {
  return {
    page: 1,
    limit: 10,
    search: '',
    status: '',
    sourceModel: '',
    overdue: false,
  };
}

export function hasKolamReceivablePermission(
  permissions: KolamReceivablePermissionEntry[] | null | undefined,
  action: KolamReceivablePermissionAction,
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
      resource === 'receivable' ||
      resource === 'wallet' ||
      resource === '*';
    const actionMatch =
      actions.includes(wanted) || actions.includes('*');
    return resourceMatch && actionMatch;
  });
}

export function formatKolamReceivableStatusLabel(
  status?: string | null,
): string {
  switch (String(status || '').toLowerCase()) {
    case 'paid':
      return 'Sudah dibayar';
    case 'open':
      return 'Belum dibayar';
    case 'cancelled':
      return 'Dibatalkan';
    default:
      return status || '—';
  }
}

export function getKolamReceivableStatusIntent(
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

export function formatKolamReceivableSourceLabel(
  source?: string | null,
): string {
  switch (String(source || '')) {
    case 'Sale':
      return 'Penjualan';
    case 'Loan':
      return 'Pinjaman';
    case 'FutureReceivable':
      return 'Manual';
    default:
      return source || '—';
  }
}

export function normalizeKolamReceivableList(
  payload: unknown,
  query: Pick<KolamReceivableListFilters, 'page' | 'limit'> = {
    page: 1,
    limit: 10,
  },
): KolamReceivableListResult {
  const root = asRecord(payload);
  const dataRaw = Array.isArray(payload)
    ? payload
    : Array.isArray(root.data)
      ? root.data
      : [];
  const meta = asRecord(root.meta);
  const page = toNumber(meta.page) ?? query.page ?? 1;
  const limit = toNumber(meta.limit) ?? query.limit ?? 10;
  const total = toNumber(meta.total) ?? dataRaw.length;
  const totalPages =
    toNumber(meta.totalPages) ??
    Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return {
    items: dataRaw.map(normalizeKolamReceivable).filter(item => item.id),
    page,
    limit,
    total,
    totalPages,
  };
}

export function normalizeKolamReceivableSummary(
  payload: unknown,
): KolamReceivableSummaryData {
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

export function normalizeKolamReceivable(payload: unknown): KolamReceivable {
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
  const statusRaw = getString(record, 'status').toLowerCase();
  const status: KolamReceivableStatus | '' =
    statusRaw === 'open' || statusRaw === 'paid' || statusRaw === 'cancelled'
      ? statusRaw
      : '';
  const sourceModelRaw = getString(record, 'sourceModel');
  const sourceModel: KolamReceivableSourceModel | '' =
    sourceModelRaw === 'Sale' ||
    sourceModelRaw === 'Loan' ||
    sourceModelRaw === 'FutureReceivable'
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
    customerName: resolveReceivableCustomerName(record),
    status,
    paidAt: getString(record, 'paidAt'),
    notes: getString(record, 'notes'),
    createdAt: getString(record, 'createdAt'),
    updatedAt: getString(record, 'updatedAt'),
  };
}

function resolveReceivableCustomerName(
  record: Record<string, unknown>,
): string {
  const customer = record.customer;
  if (customer && typeof customer === 'object' && !Array.isArray(customer)) {
    const name = getString(asRecord(customer), 'name');
    if (name) {
      return name;
    }
  }
  if (typeof customer === 'string' && customer.trim()) {
    return customer.trim();
  }
  return '—';
}

function normalizeReceivableRoutePath(route: string): string {
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

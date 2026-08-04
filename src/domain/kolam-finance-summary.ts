/**
 * Finance Summary (`/finance`) — ops P&L / cash hub.
 * Source of truth: FE `types/finance.ts` + `finance-summary.tsx`, BE `/api/finance-summary`.
 */

import type { KolamBadgeIntent } from './kolam-badge';

export const KOLAM_FINANCE_SUMMARY_ROOT = '/finance';

export type KolamFinanceRange = 'today' | 'week' | 'month' | 'year' | 'custom';

export type KolamFinanceConfirmStatus =
  | 'unconfirmed'
  | 'confirmed'
  | 'rejected';

export type KolamFinanceConfirmStatusFilter =
  | 'all'
  | KolamFinanceConfirmStatus;

export type KolamFinancePermissionAction =
  | 'view'
  | 'confirm'
  | 'create'
  | 'update'
  | 'delete';

export type KolamFinancePermissionEntry = {
  resource?: string;
  actions?: string[];
};

export type KolamFinanceWalletRow = {
  name: string;
  balance: number;
};

export type KolamFinanceTransaction = {
  id: string;
  date: string;
  wallet: string;
  type: 'credit' | 'debit';
  source: string;
  amount: number;
  note: string;
  confirmStatus: KolamFinanceConfirmStatus | '';
  cashflowSessionId: string | null;
  sourceModel: string;
  createdByName: string;
  confirmedByName: string;
};

export type KolamFinanceSummaryData = {
  totalIncome: number;
  totalExpense: number;
  profitLoss: number;
  cashMovement: {
    totalInflow: number;
    totalOutflow: number;
    netMovement: number;
  } | null;
  profitAndLoss: {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
  } | null;
  details: Record<string, number>;
  wallets: KolamFinanceWalletRow[];
  transactions: KolamFinanceTransaction[];
  liabilitiesPayableOpen: number;
  liabilitiesPayableOverdue: number;
  filter: {
    startDate: string;
    endDate: string;
    range: string;
  };
};

export type KolamFinanceSummaryFilters = {
  range: KolamFinanceRange;
  startDate: string;
  endDate: string;
  confirmStatus: KolamFinanceConfirmStatusFilter;
  page: number;
  limit: number;
};

/** Sources NOT acted upon by cashflow session confirm (mirror BE/FE). */
export const KOLAM_FINANCE_EXCLUDED_CONFIRM_SOURCES = ['commission'] as const;

export const KOLAM_FINANCE_RANGE_OPTIONS: Array<{
  label: string;
  value: KolamFinanceRange;
}> = [
  { label: 'Hari ini', value: 'today' },
  { label: 'Minggu', value: 'week' },
  { label: 'Bulan', value: 'month' },
  { label: 'Tahun', value: 'year' },
  { label: 'Kustom', value: 'custom' },
];

export const KOLAM_FINANCE_CONFIRM_STATUS_OPTIONS: Array<{
  label: string;
  value: KolamFinanceConfirmStatusFilter;
}> = [
  { label: 'Semua status', value: 'all' },
  { label: 'Dikonfirmasi', value: 'confirmed' },
  { label: 'Belum dikonfirmasi', value: 'unconfirmed' },
  { label: 'Ditolak', value: 'rejected' },
];

export function isKolamFinanceSummaryRoute(route: string): boolean {
  const path = String(route || '').split('?')[0].replace(/\/+$/, '') || '/';
  if (path === KOLAM_FINANCE_SUMMARY_ROOT) {
    return true;
  }
  // `/finance/:txId` deep-link — not payroll/bonus/tax/settings
  if (!path.startsWith(`${KOLAM_FINANCE_SUMMARY_ROOT}/`)) {
    return false;
  }
  const rest = path.slice(KOLAM_FINANCE_SUMMARY_ROOT.length + 1);
  if (!rest || rest.includes('/')) {
    return false;
  }
  const blocked = new Set([
    'payroll',
    'bonus',
    'tax',
    'settings',
  ]);
  return !blocked.has(rest.toLowerCase());
}

export function getKolamFinanceFocusTxId(route: string): string | null {
  const path = String(route || '').split('?')[0].replace(/\/+$/, '') || '/';
  if (!path.startsWith(`${KOLAM_FINANCE_SUMMARY_ROOT}/`)) {
    return null;
  }
  const rest = path.slice(KOLAM_FINANCE_SUMMARY_ROOT.length + 1);
  if (!rest || rest.includes('/')) {
    return null;
  }
  if (
    rest === 'payroll' ||
    rest === 'bonus' ||
    rest === 'tax' ||
    rest === 'settings'
  ) {
    return null;
  }
  try {
    return decodeURIComponent(rest);
  } catch {
    return rest;
  }
}

export function createInitialFinanceSummaryFilters(): KolamFinanceSummaryFilters {
  return {
    range: 'month',
    startDate: '',
    endDate: '',
    confirmStatus: 'all',
    page: 1,
    limit: 10,
  };
}

export function isKolamFinanceConfirmableSource(source: string): boolean {
  return !(KOLAM_FINANCE_EXCLUDED_CONFIRM_SOURCES as readonly string[]).includes(
    source,
  );
}

export function hasKolamWalletPermission(
  permissions: KolamFinancePermissionEntry[] | null | undefined,
  action: KolamFinancePermissionAction,
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
      (resource === 'wallet' || resource === '*') &&
      (actions.includes(wanted) || actions.includes('*'))
    );
  });
}

export function formatKolamFinanceConfirmStatusLabel(
  status?: string | null,
): string {
  switch (String(status || '').toLowerCase()) {
    case 'confirmed':
      return 'Dikonfirmasi';
    case 'unconfirmed':
      return 'Belum dikonfirmasi';
    case 'rejected':
      return 'Ditolak';
    default:
      return status || '—';
  }
}

export function getKolamFinanceConfirmStatusIntent(
  status?: string | null,
): KolamBadgeIntent {
  switch (String(status || '').toLowerCase()) {
    case 'confirmed':
      return 'success';
    case 'unconfirmed':
      return 'warning';
    case 'rejected':
      return 'danger';
    default:
      return 'secondary';
  }
}

export function formatKolamFinanceTxTypeLabel(type: string): string {
  return type === 'credit' ? 'Kredit' : type === 'debit' ? 'Debit' : type || '—';
}

export function resolveKolamFinanceCashflowSessionId(
  cashflowSession: unknown,
): string | null {
  if (!cashflowSession) {
    return null;
  }
  if (typeof cashflowSession === 'string') {
    const trimmed = cashflowSession.trim();
    return trimmed || null;
  }
  if (typeof cashflowSession === 'object' && cashflowSession !== null) {
    const record = cashflowSession as Record<string, unknown>;
    const id = record._id ?? record.id;
    if (typeof id === 'string' && id.trim()) {
      return id.trim();
    }
  }
  return null;
}

export function txMatchesFinanceFocusId(
  tx: KolamFinanceTransaction,
  txId: string | undefined | null,
): boolean {
  if (!txId || !tx.id) {
    return false;
  }
  const full = tx.id.toLowerCase();
  const q = txId.toLowerCase();
  return full === q || full.endsWith(q) || full.includes(q);
}

export function normalizeKolamFinanceSummary(
  payload: unknown,
): KolamFinanceSummaryData {
  const root = unwrapData(payload);
  const record = asRecord(root);
  const cashMovement = asRecord(record.cashMovement);
  const profitAndLoss = asRecord(record.profitAndLoss);
  const details = asRecord(record.details);
  const filter = asRecord(record.filter);
  const liabilities = asRecord(record.liabilities);
  const payable = asRecord(liabilities.payable);
  const open = asRecord(payable.open);
  const overdue = asRecord(payable.overdue);

  const detailNumbers: Record<string, number> = {};
  for (const [key, value] of Object.entries(details)) {
    const num = toNumber(value);
    if (num !== undefined) {
      detailNumbers[key] = num;
    }
  }

  const walletsRaw = Array.isArray(record.wallets) ? record.wallets : [];
  const wallets = walletsRaw
    .map(item => {
      const row = asRecord(item);
      return {
        name: getString(row, 'name') || 'Dompet',
        balance: toNumber(row.balance) ?? toNumber(row.currentBalance) ?? 0,
      };
    })
    .filter(row => row.name);

  const txsRaw = Array.isArray(record.transactions) ? record.transactions : [];
  const transactions = txsRaw
    .map(normalizeFinanceTransaction)
    .filter(tx => tx.id);

  return {
    totalIncome: toNumber(record.totalIncome) ?? 0,
    totalExpense: toNumber(record.totalExpense) ?? 0,
    profitLoss: toNumber(record.profitLoss) ?? 0,
    cashMovement:
      Object.keys(cashMovement).length > 0
        ? {
            totalInflow: toNumber(cashMovement.totalInflow) ?? 0,
            totalOutflow: toNumber(cashMovement.totalOutflow) ?? 0,
            netMovement: toNumber(cashMovement.netMovement) ?? 0,
          }
        : null,
    profitAndLoss:
      Object.keys(profitAndLoss).length > 0
        ? {
            totalIncome: toNumber(profitAndLoss.totalIncome) ?? 0,
            totalExpense: toNumber(profitAndLoss.totalExpense) ?? 0,
            netProfit: toNumber(profitAndLoss.netProfit) ?? 0,
          }
        : null,
    details: detailNumbers,
    wallets,
    transactions,
    liabilitiesPayableOpen: toNumber(open.outstanding) ?? toNumber(open.totalAmount) ?? 0,
    liabilitiesPayableOverdue: toNumber(overdue.totalAmount) ?? 0,
    filter: {
      startDate: getString(filter, 'startDate'),
      endDate: getString(filter, 'endDate'),
      range: getString(filter, 'range') || 'month',
    },
  };
}

function normalizeFinanceTransaction(payload: unknown): KolamFinanceTransaction {
  const record = asRecord(payload);
  const confirmRaw = getString(record, 'confirmStatus').toLowerCase();
  const confirmStatus: KolamFinanceConfirmStatus | '' =
    confirmRaw === 'confirmed' ||
    confirmRaw === 'unconfirmed' ||
    confirmRaw === 'rejected'
      ? confirmRaw
      : '';
  const typeRaw = getString(record, 'type').toLowerCase();
  return {
    id: getString(record, '_id') || getString(record, 'id'),
    date: getString(record, 'date') || getString(record, 'createdAt'),
    wallet: getString(record, 'wallet') || '—',
    type: typeRaw === 'credit' ? 'credit' : 'debit',
    source: getString(record, 'source'),
    amount: toNumber(record.amount) ?? 0,
    note: getString(record, 'note'),
    confirmStatus,
    cashflowSessionId: resolveKolamFinanceCashflowSessionId(
      record.cashflowSession,
    ),
    sourceModel: getString(record, 'sourceModel'),
    createdByName: getString(record, 'createdByName'),
    confirmedByName: getString(record, 'confirmedByName'),
  };
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
  return undefined;
}

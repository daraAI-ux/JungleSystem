/**
 * Wallet ops (`/wallet`) — list, balances, WTX, deposit/withdraw/transfer.
 * Source of truth: FE `types/wallet.ts` + `wallet/list.tsx`, BE `/api/wallet*`.
 */

import type { KolamBadgeIntent } from './kolam-badge';
import { getKolamFileUrl } from '../lib/file-url';
import {
  formatKolamFinanceConfirmStatusLabel,
  getKolamFinanceConfirmStatusIntent,
  hasKolamWalletPermission,
  type KolamFinancePermissionAction,
  type KolamFinancePermissionEntry,
} from './kolam-finance-summary';

export { hasKolamWalletPermission };
export type { KolamFinancePermissionAction as KolamWalletPermissionAction };
export type { KolamFinancePermissionEntry as KolamWalletPermissionEntry };

export const KOLAM_WALLET_ROOT = '/wallet';

export type KolamWalletSurfaceMode = 'list' | 'detail' | 'create' | 'edit';

export type KolamWalletType = 'main' | 'regular' | 'virtual' | 'cash';

export type KolamWalletTxType = 'credit' | 'debit';

export type KolamWalletConfirmStatus =
  | 'unconfirmed'
  | 'confirmed'
  | 'rejected';

export type KolamWalletConfirmStatusFilter = 'all' | KolamWalletConfirmStatus;

export type KolamWalletTypeFilter = 'all' | KolamWalletType;

export type KolamWalletTxTypeFilter = 'all' | KolamWalletTxType;

export type KolamWalletTxSourceFilter = 'all' | string;

export type KolamWalletTab = 'wallets' | 'transactions';

export type KolamWallet = {
  id: string;
  name: string;
  type: KolamWalletType;
  initialBalance: number;
  currentBalance: number;
  note: string;
  provider: string;
  requireDepositProof: boolean;
  accountNumber: string;
  accountName: string;
  createdAt: string;
  updatedAt: string;
};

export type KolamWalletTransactionProof = {
  path: string;
  uri: string | null;
  uploadedAt: string;
};

export type KolamWalletTransaction = {
  id: string;
  walletId: string;
  walletName: string;
  type: KolamWalletTxType;
  source: string;
  amount: number;
  note: string;
  confirmStatus: KolamWalletConfirmStatus | '';
  confirmedAt: string;
  confirmNote: string;
  createdAt: string;
  updatedAt: string;
  proofs: KolamWalletTransactionProof[];
};

export type KolamWalletPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type KolamWalletListFilters = {
  page: number;
  limit: number;
  search: string;
  type: KolamWalletTypeFilter;
};

export type KolamWalletTxFilters = {
  page: number;
  limit: number;
  walletId: string;
  type: KolamWalletTxTypeFilter;
  source: KolamWalletTxSourceFilter;
  confirmStatus: KolamWalletConfirmStatusFilter;
  startDate: string;
  endDate: string;
};

export const KOLAM_WALLET_TYPE_OPTIONS: Array<{
  label: string;
  value: KolamWalletTypeFilter;
}> = [
  { label: 'Semua tipe', value: 'all' },
  { label: 'Dompet Utama', value: 'main' },
  { label: 'Dompet Reguler', value: 'regular' },
  { label: 'Dompet Virtual', value: 'virtual' },
  { label: 'Dompet Tunai', value: 'cash' },
];

export const KOLAM_WALLET_TX_TYPE_OPTIONS: Array<{
  label: string;
  value: KolamWalletTxTypeFilter;
}> = [
  { label: 'Semua tipe', value: 'all' },
  { label: 'Kredit', value: 'credit' },
  { label: 'Debit', value: 'debit' },
];

export const KOLAM_WALLET_TX_SOURCE_OPTIONS: Array<{
  label: string;
  value: KolamWalletTxSourceFilter;
}> = [
  { label: 'Semua sumber', value: 'all' },
  { label: 'Drop Dana', value: 'deposit' },
  { label: 'Tarik Dana', value: 'withdraw' },
  { label: 'Transfer', value: 'transfer' },
  { label: 'Saldo Awal', value: 'initial_deposit' },
  { label: 'Penjualan', value: 'sale' },
  { label: 'Pembelian', value: 'purchase' },
  { label: 'Pengeluaran Rutin', value: 'routine_expense' },
  { label: 'Pengeluaran Tidak Terduga', value: 'unexpected_expense' },
  { label: 'Penyesuaian', value: 'adjustment' },
  { label: 'Komisi', value: 'commission' },
  { label: 'Pendapatan Lain', value: 'unexpected_income' },
  { label: 'Hutang', value: 'payable' },
  { label: 'Bayar Hutang', value: 'payable_payment' },
  { label: 'Terima Piutang', value: 'receivable_payment' },
];

export const KOLAM_WALLET_CONFIRM_STATUS_OPTIONS: Array<{
  label: string;
  value: KolamWalletConfirmStatusFilter;
}> = [
  { label: 'Semua status', value: 'all' },
  { label: 'Dikonfirmasi', value: 'confirmed' },
  { label: 'Belum dikonfirmasi', value: 'unconfirmed' },
  { label: 'Ditolak', value: 'rejected' },
];

export function isKolamWalletRoute(route: string): boolean {
  const path = normalizeWalletRoutePath(route);
  return (
    path === KOLAM_WALLET_ROOT || path.startsWith(`${KOLAM_WALLET_ROOT}/`)
  );
}

export function getKolamWalletRouteId(route: string): string | null {
  const path = normalizeWalletRoutePath(route);
  if (path === KOLAM_WALLET_ROOT || path === `${KOLAM_WALLET_ROOT}/create`) {
    return null;
  }
  const editMatch = /^\/wallet\/([^/]+)\/edit$/.exec(path);
  if (editMatch?.[1]) {
    const segment = decodeURIComponent(editMatch[1]);
    return segment === 'create' ? null : segment;
  }
  const match = /^\/wallet\/([^/]+)$/.exec(path);
  if (!match?.[1]) {
    return null;
  }
  const segment = decodeURIComponent(match[1]);
  if (segment === 'create') {
    return null;
  }
  return segment;
}

export function getKolamWalletSurfaceMode(route: string): KolamWalletSurfaceMode {
  const path = normalizeWalletRoutePath(route);
  if (path === `${KOLAM_WALLET_ROOT}/create`) {
    return 'create';
  }
  if (/^\/wallet\/[^/]+\/edit$/.test(path)) {
    return 'edit';
  }
  if (getKolamWalletRouteId(route)) {
    return 'detail';
  }
  return 'list';
}

export function getKolamWalletCreateRoute(): string {
  return `${KOLAM_WALLET_ROOT}/create`;
}

export function getKolamWalletDetailRoute(id: string): string {
  return `${KOLAM_WALLET_ROOT}/${encodeURIComponent(id)}`;
}

export function getKolamWalletEditRoute(id: string): string {
  return `${KOLAM_WALLET_ROOT}/${encodeURIComponent(id)}/edit`;
}

export type KolamWalletWriteBody = {
  name: string;
  type?: KolamWalletType;
  initialBalance?: number;
  currentBalance?: number;
  note?: string;
  provider?: string;
  requireDepositProof?: boolean;
  accountNumber?: string;
  accountName?: string;
};

export const KOLAM_WALLET_CREATE_TYPE_OPTIONS: Array<{
  label: string;
  value: KolamWalletType;
}> = [
  { label: 'Dompet Utama', value: 'main' },
  { label: 'Dompet Reguler', value: 'regular' },
  { label: 'Dompet Virtual', value: 'virtual' },
  { label: 'Dompet Tunai', value: 'cash' },
];

export function createInitialWalletListFilters(): KolamWalletListFilters {
  return {
    page: 1,
    limit: 10,
    search: '',
    type: 'all',
  };
}

export function createInitialWalletTxFilters(
  walletId = '',
): KolamWalletTxFilters {
  return {
    page: 1,
    limit: 10,
    walletId,
    type: 'all',
    source: 'all',
    confirmStatus: 'all',
    startDate: '',
    endDate: '',
  };
}

export function formatKolamWalletTypeLabel(type: string): string {
  switch (type) {
    case 'main':
      return 'Dompet Utama';
    case 'regular':
      return 'Dompet Reguler';
    case 'virtual':
      return 'Dompet Virtual';
    case 'cash':
      return 'Dompet Tunai';
    default:
      return type || '—';
  }
}

export function getKolamWalletTypeIntent(type: string): KolamBadgeIntent {
  switch (type) {
    case 'main':
      return 'primary';
    case 'cash':
      return 'success';
    case 'virtual':
      return 'info';
    default:
      return 'secondary';
  }
}

export function formatKolamWalletTxTypeLabel(type: string): string {
  return type === 'credit' ? 'Kredit' : type === 'debit' ? 'Debit' : type || '—';
}

export function formatKolamWalletTxSourceLabel(source: string): string {
  const match = KOLAM_WALLET_TX_SOURCE_OPTIONS.find(
    option => option.value === source,
  );
  if (match) {
    return match.label;
  }
  switch (source) {
    case 'sale_revenue':
      return 'Pendapatan penjualan';
    case 'shipping_collected':
      return 'Titipan pass-through';
    case 'shipping_passthrough':
      return 'Auto-passthrough ongkir';
    case 'shipping_settlement':
      return 'Settlement pass-through';
    case 'cost_of_sale':
      return 'HPP / COGS';
    default:
      return source ? source.replace(/_/g, ' ') : '—';
  }
}

export type KolamWalletSummaryStats = {
  totalBalance: number;
  positiveBalance: number;
  negativeBalance: number;
  walletCount: number;
  virtualCount: number;
  cashCount: number;
  mainWallet: KolamWallet | null;
};

export function buildKolamWalletSummaryStats(
  wallets: KolamWallet[],
): KolamWalletSummaryStats {
  let totalBalance = 0;
  let positiveBalance = 0;
  let negativeBalance = 0;
  let virtualCount = 0;
  let cashCount = 0;
  let mainWallet: KolamWallet | null = null;

  for (const wallet of wallets) {
    const balance = wallet.currentBalance;
    totalBalance += balance;
    positiveBalance += Math.max(balance, 0);
    negativeBalance += Math.min(balance, 0);
    if (wallet.type === 'virtual') {
      virtualCount += 1;
    }
    if (wallet.type === 'cash') {
      cashCount += 1;
    }
    if (wallet.type === 'main' && !mainWallet) {
      mainWallet = wallet;
    }
  }

  return {
    totalBalance,
    positiveBalance,
    negativeBalance,
    walletCount: wallets.length,
    virtualCount,
    cashCount,
    mainWallet,
  };
}

export function countKolamWalletTxByType(transactions: KolamWalletTransaction[]): {
  credit: number;
  debit: number;
} {
  let credit = 0;
  let debit = 0;
  for (const tx of transactions) {
    if (tx.type === 'credit') {
      credit += 1;
    } else if (tx.type === 'debit') {
      debit += 1;
    }
  }
  return { credit, debit };
}

export function formatKolamWalletConfirmStatusLabel(
  status?: string | null,
): string {
  return formatKolamFinanceConfirmStatusLabel(status);
}

export function getKolamWalletConfirmStatusIntent(
  status?: string | null,
): KolamBadgeIntent {
  return getKolamFinanceConfirmStatusIntent(status);
}

export function normalizeKolamWallet(raw: unknown): KolamWallet {
  const row = asRecord(raw);
  const typeRaw = getString(row, 'type').toLowerCase();
  const type: KolamWalletType =
    typeRaw === 'main' ||
    typeRaw === 'regular' ||
    typeRaw === 'virtual' ||
    typeRaw === 'cash'
      ? typeRaw
      : 'regular';

  return {
    id: getString(row, '_id') || getString(row, 'id'),
    name: getString(row, 'name') || 'Dompet',
    type,
    initialBalance: toNumber(row.initialBalance) ?? 0,
    currentBalance: toNumber(row.currentBalance) ?? 0,
    note: getString(row, 'note'),
    provider: getString(row, 'provider'),
    requireDepositProof: Boolean(row.requireDepositProof),
    accountNumber: getString(row, 'accountNumber'),
    accountName: getString(row, 'accountName'),
    createdAt: getString(row, 'createdAt'),
    updatedAt: getString(row, 'updatedAt'),
  };
}

export function normalizeKolamWalletList(raw: unknown) {
  const payload = asRecord(raw);
  const rows = Array.isArray(raw)
    ? raw
    : Array.isArray(payload.data)
      ? payload.data
      : [];
  const paginationRaw = asRecord(payload.pagination);
  const items = rows
    .map(normalizeKolamWallet)
    .filter(item => Boolean(item.id));

  return {
    items,
    pagination: normalizeWalletPagination(paginationRaw, items.length),
  };
}

export function isKolamWalletProofPdf(path: string): boolean {
  return /\.pdf($|\?)/i.test(path);
}

export function formatKolamWalletShortDate(value: string): string {
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

export function normalizeKolamWalletTransaction(
  raw: unknown,
): KolamWalletTransaction {
  const row = asRecord(raw);
  const walletRaw = row.wallet;
  const walletRecord = asRecord(walletRaw);
  const walletId =
    typeof walletRaw === 'string'
      ? walletRaw.trim()
      : getString(walletRecord, '_id') || getString(walletRecord, 'id');
  const walletName =
    typeof walletRaw === 'string'
      ? ''
      : getString(walletRecord, 'name') || 'Dompet';
  const typeRaw = getString(row, 'type').toLowerCase();
  const confirmRaw = getString(row, 'confirmStatus').toLowerCase();
  const confirmStatus: KolamWalletConfirmStatus | '' =
    confirmRaw === 'confirmed' ||
    confirmRaw === 'unconfirmed' ||
    confirmRaw === 'rejected'
      ? confirmRaw
      : '';

  return {
    id: getString(row, '_id') || getString(row, 'id'),
    walletId,
    walletName,
    type: typeRaw === 'credit' ? 'credit' : 'debit',
    source: getString(row, 'source'),
    amount: toNumber(row.amount) ?? 0,
    note: getString(row, 'note'),
    confirmStatus,
    confirmedAt: getString(row, 'confirmedAt'),
    confirmNote: getString(row, 'confirmNote'),
    createdAt: getString(row, 'createdAt'),
    updatedAt: getString(row, 'updatedAt'),
    proofs: normalizeWalletProofs(row.proofs),
  };
}

function normalizeWalletProofs(value: unknown): KolamWalletTransactionProof[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const record = asRecord(item);
      const path = getString(record, 'path');
      if (!path) {
        return null;
      }
      return {
        path,
        uri: getKolamFileUrl(path),
        uploadedAt: getString(record, 'uploadedAt'),
      } satisfies KolamWalletTransactionProof;
    })
    .filter((row): row is KolamWalletTransactionProof => Boolean(row));
}

export function normalizeKolamWalletTransactionList(raw: unknown) {
  const payload = asRecord(raw);
  const rows = Array.isArray(raw)
    ? raw
    : Array.isArray(payload.data)
      ? payload.data
      : [];
  const paginationRaw = asRecord(payload.pagination);
  const items = rows
    .map(normalizeKolamWalletTransaction)
    .filter(item => Boolean(item.id));

  return {
    items,
    pagination: normalizeWalletPagination(paginationRaw, items.length),
  };
}

function normalizeWalletPagination(
  paginationRaw: Record<string, unknown>,
  fallbackTotal: number,
): KolamWalletPagination {
  const total =
    toNumber(paginationRaw.total) ??
    toNumber(paginationRaw.count) ??
    fallbackTotal;
  const limit = toNumber(paginationRaw.limit) ?? 10;
  const page = toNumber(paginationRaw.page) ?? 1;
  const totalPages =
    toNumber(paginationRaw.totalPages) ??
    toNumber(paginationRaw.pages) ??
    Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, totalPages),
  };
}

function normalizeWalletRoutePath(route: string): string {
  return String(route || '').split('?')[0].replace(/\/+$/, '') || '/';
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

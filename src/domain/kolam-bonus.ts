/**
 * Bonus list (`/finance/bonus`) — FE `api/salary/salary.ts`.
 */

import type { KolamBadgeIntent } from './kolam-badge';

export const KOLAM_BONUS_ROOT = '/finance/bonus';

export type KolamBonusListFilters = {
  year: number;
  month: number;
  status: string;
};

export type KolamBonusListRow = {
  id: string;
  code: string;
  name: string;
  amount: number;
  reason: string;
  status: string;
  statusLabel: string;
  employeeLabel: string;
  executedAt: string;
  createdAt: string;
};

export const KOLAM_BONUS_MONTH_OPTIONS: Array<{ label: string; value: number }> = [
  { label: 'Januari', value: 1 },
  { label: 'Februari', value: 2 },
  { label: 'Maret', value: 3 },
  { label: 'April', value: 4 },
  { label: 'Mei', value: 5 },
  { label: 'Juni', value: 6 },
  { label: 'Juli', value: 7 },
  { label: 'Agustus', value: 8 },
  { label: 'September', value: 9 },
  { label: 'Oktober', value: 10 },
  { label: 'November', value: 11 },
  { label: 'Desember', value: 12 },
];

export function isKolamBonusRoute(route: string): boolean {
  const path = normalizeBonusPath(route);
  return path === KOLAM_BONUS_ROOT;
}

export function createInitialBonusListFilters(
  route?: string,
): KolamBonusListFilters {
  const now = new Date();
  const query = parseBonusRouteQuery(route ?? '');
  const year = Math.max(1, Number(query.year || now.getFullYear()) || now.getFullYear());
  const month = Math.min(
    12,
    Math.max(1, Number(query.month || now.getMonth() + 1) || now.getMonth() + 1),
  );
  return {
    year,
    month,
    status: query.status?.trim() ?? '',
  };
}

export function buildBonusListRoute(filters: KolamBonusListFilters): string {
  const params = new URLSearchParams();
  if (filters.year) {
    params.set('year', String(filters.year));
  }
  if (filters.month) {
    params.set('month', String(filters.month));
  }
  if (filters.status.trim()) {
    params.set('status', filters.status.trim());
  }
  const query = params.toString();
  return query ? `${KOLAM_BONUS_ROOT}?${query}` : KOLAM_BONUS_ROOT;
}

export function formatKolamBonusStatusLabel(status?: string | null): string {
  const raw = String(status || '').trim();
  if (!raw) {
    return '—';
  }
  switch (raw.toLowerCase()) {
    case 'verified':
      return 'Terverifikasi';
    case 'pending':
      return 'Menunggu';
    case 'rejected':
      return 'Ditolak';
    default:
      return raw;
  }
}

export function getKolamBonusStatusIntent(status?: string | null): KolamBadgeIntent {
  switch (String(status || '').toLowerCase()) {
    case 'verified':
      return 'success';
    case 'rejected':
      return 'danger';
    case 'pending':
      return 'warning';
    default:
      return 'secondary';
  }
}

export function normalizeKolamBonusList(payload: unknown): KolamBonusListRow[] {
  const root = unwrapData(payload);
  const rows = Array.isArray(root) ? root : [];
  return rows.map(normalizeBonusRow).filter(row => row.id);
}

function normalizeBonusRow(payload: unknown): KolamBonusListRow {
  const record = asRecord(payload);
  const employee = asRecord(record.employeeUser);
  const first = getString(employee, 'first_name');
  const last = getString(employee, 'last_name');
  const employeeLabel = `${first} ${last}`.trim() || getString(record, 'name');
  const status = getString(record, 'status');
  return {
    id: getString(record, '_id') || getString(record, 'id'),
    code: getString(record, 'code'),
    name: getString(record, 'name'),
    amount: Number(record.amount) || 0,
    reason: getString(record, 'reason'),
    status,
    statusLabel: formatKolamBonusStatusLabel(status),
    employeeLabel: employeeLabel || '—',
    executedAt: getString(record, 'executedAt'),
    createdAt: getString(record, 'createdAt'),
  };
}

function normalizeBonusPath(route: string): string {
  const path = String(route || '').split('?')[0].replace(/\/+$/, '') || '/';
  return path.startsWith('/') ? path : `/${path}`;
}

function parseBonusRouteQuery(route: string) {
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

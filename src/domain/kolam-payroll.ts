/**
 * Payroll (`/finance/payroll`) — FE `api/payroll/payroll.ts`, `types/payroll.ts`.
 */

import type { KolamBadgeIntent } from './kolam-badge';

export const KOLAM_PAYROLL_ROOT = '/finance/payroll';

export type KolamPayrollPeriodStatus = 'draft' | 'finalized';
export type KolamPayrollSlipStatus = 'draft' | 'finalized';
export type KolamPayrollWarningSeverity = 'info' | 'warning' | 'error';

export type KolamPayrollPermissionAction = 'view' | 'create' | 'update' | 'confirm';

export type KolamPayrollPermissionEntry = {
  resource?: string;
  actions?: string[];
};

export type KolamPayrollTaxSettlement = {
  id: string;
  code: string;
  status: string;
  amount: number;
};

export type KolamPayrollWarning = {
  code: string;
  message: string;
  severity: KolamPayrollWarningSeverity;
};

export type KolamPayrollPph21Line = {
  applicable: boolean;
  rate: number;
  taxableBase: number;
  amount: number;
};

export type KolamPayrollEmployeeSnapshot = {
  firstName: string;
  lastName: string;
  employeeNumber: string;
  position: string;
  department: string;
  taxNumber: string;
  isPkp: boolean;
  salaryDate: number | null;
};

export type KolamPayrollPeriod = {
  id: string;
  periodKey: string;
  year: number;
  month: number;
  periodStart: string;
  periodEnd: string;
  status: KolamPayrollPeriodStatus;
  slipCount: number;
  totalTakeHome: number;
  totalGross: number;
  totalPph21Payroll: number;
  walletId: string;
  walletName: string;
  walletBalance: number | null;
  taxSettlement: KolamPayrollTaxSettlement | null;
  finalizedAt: string;
  createdAt: string;
};

export type KolamPayrollSlip = {
  id: string;
  slipCode: string;
  periodKey: string;
  userId: string;
  userLabel: string;
  employeeNumber: string;
  status: KolamPayrollSlipStatus;
  warnings: KolamPayrollWarning[];
  employeeSnapshot: KolamPayrollEmployeeSnapshot;
  baseSalary: number;
  bonusTotal: number;
  commissionGross: number;
  commissionPph21Withheld: number;
  commissionNet: number;
  kasbonTotal: number;
  salaryDeductionTotal: number;
  takeHomePay: number;
  grossBruto: number;
  totalDeductions: number;
  pph21Payroll: KolamPayrollPph21Line;
  /** Convenience mirror of `pph21Payroll.amount` for existing UI. */
  pph21Amount: number;
  pph21AiNote: string;
  generatedAt: string;
};

export type KolamPayrollPendingEmployee = {
  userId: string;
  name: string;
  salary: number | null;
  isPkp: boolean;
};

export type KolamPayrollPeriodDetail = {
  period: KolamPayrollPeriod;
  slips: KolamPayrollSlip[];
  pendingEmployees: KolamPayrollPendingEmployee[];
};

export const KOLAM_PAYROLL_MONTH_OPTIONS: Array<{ label: string; value: number }> = [
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

export function isKolamPayrollRoute(route: string): boolean {
  const path = normalizePayrollPath(route);
  if (path === KOLAM_PAYROLL_ROOT) {
    return true;
  }
  if (!path.startsWith(`${KOLAM_PAYROLL_ROOT}/`)) {
    return false;
  }
  const rest = path.slice(KOLAM_PAYROLL_ROOT.length + 1);
  return Boolean(rest);
}

export function getKolamPayrollSurfaceMode(
  route: string,
): 'list' | 'detail' | 'slip' | 'unsupported' {
  const path = normalizePayrollPath(route);
  if (path === KOLAM_PAYROLL_ROOT) {
    return 'list';
  }
  if (!path.startsWith(`${KOLAM_PAYROLL_ROOT}/`)) {
    return 'unsupported';
  }
  const rest = path.slice(KOLAM_PAYROLL_ROOT.length + 1);
  if (!rest) {
    return 'list';
  }
  if (rest.startsWith('slip/')) {
    const slipId = decodeRouteSegment(rest.slice('slip/'.length));
    return slipId ? 'slip' : 'unsupported';
  }
  if (rest.includes('/')) {
    return 'unsupported';
  }
  return 'detail';
}

export function getKolamPayrollPeriodKey(route: string): string | null {
  if (getKolamPayrollSurfaceMode(route) !== 'detail') {
    return null;
  }
  const path = normalizePayrollPath(route);
  const rest = path.slice(KOLAM_PAYROLL_ROOT.length + 1);
  return decodeRouteSegment(rest);
}

export function getKolamPayrollSlipId(route: string): string | null {
  if (getKolamPayrollSurfaceMode(route) !== 'slip') {
    return null;
  }
  const path = normalizePayrollPath(route);
  const rest = path.slice(KOLAM_PAYROLL_ROOT.length + 1);
  return decodeRouteSegment(rest.slice('slip/'.length));
}

export function buildKolamPayrollPeriodRoute(periodKey: string): string {
  return `${KOLAM_PAYROLL_ROOT}/${encodeURIComponent(periodKey)}`;
}

export function buildKolamPayrollSlipRoute(slipId: string): string {
  return `${KOLAM_PAYROLL_ROOT}/slip/${encodeURIComponent(slipId)}`;
}

export function buildPayrollPeriodKey(year: number, month: number): string | null {
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return null;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function formatKolamPayrollPeriodStatusLabel(
  status?: string | null,
): string {
  switch (String(status || '').toLowerCase()) {
    case 'finalized':
      return 'Final';
    case 'draft':
      return 'Draft';
    default:
      return status || '—';
  }
}

export function getKolamPayrollPeriodStatusIntent(
  status?: string | null,
): KolamBadgeIntent {
  switch (String(status || '').toLowerCase()) {
    case 'finalized':
      return 'success';
    case 'draft':
      return 'warning';
    default:
      return 'secondary';
  }
}

export function hasKolamPayrollPermission(
  permissions: KolamPayrollPermissionEntry[] | null | undefined,
  action: KolamPayrollPermissionAction,
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
      (resource === 'payroll' || resource === '*') &&
      (actions.includes(wanted) || actions.includes('*'))
    );
  });
}

export function normalizeKolamPayrollPeriodList(payload: unknown): KolamPayrollPeriod[] {
  const root = unwrapData(payload);
  const rows = Array.isArray(root) ? root : [];
  return rows.map(normalizePayrollPeriod).filter(row => row.periodKey);
}

export function normalizeKolamPayrollPeriodDetail(
  payload: unknown,
): KolamPayrollPeriodDetail | null {
  const root = unwrapData(payload);
  const record = asRecord(root);
  const periodRaw = record.period ?? root;
  const period = normalizePayrollPeriod(periodRaw);
  if (!period.periodKey) {
    return null;
  }
  const slipsRaw = Array.isArray(record.slips) ? record.slips : [];
  const pendingRaw = Array.isArray(record.pendingEmployees)
    ? record.pendingEmployees
    : [];
  return {
    period,
    slips: slipsRaw.map(normalizePayrollSlip).filter(row => row.id),
    pendingEmployees: pendingRaw
      .map(normalizePendingEmployee)
      .filter(row => row.userId),
  };
}

export function normalizeKolamPayrollSlip(payload: unknown): KolamPayrollSlip | null {
  const slip = normalizePayrollSlip(unwrapData(payload));
  return slip.id ? slip : null;
}

function normalizePayrollPeriod(payload: unknown): KolamPayrollPeriod {
  const record = asRecord(payload);
  const wallet = record.wallet;
  let walletId = '';
  let walletName = '';
  let walletBalance: number | null = null;
  if (typeof wallet === 'string') {
    walletId = wallet.trim();
  } else {
    const walletRecord = asRecord(wallet);
    walletId = getString(walletRecord, '_id') || getString(walletRecord, 'id');
    walletName = getString(walletRecord, 'name');
    walletBalance = getOptionalNumber(walletRecord, 'currentBalance');
    if (walletBalance == null) {
      walletBalance = getOptionalNumber(walletRecord, 'balance');
    }
  }
  return {
    id: getString(record, '_id') || getString(record, 'id'),
    periodKey: getString(record, 'periodKey'),
    year: Number(record.year) || 0,
    month: Number(record.month) || 0,
    periodStart: getString(record, 'periodStart'),
    periodEnd: getString(record, 'periodEnd'),
    status:
      getString(record, 'status').toLowerCase() === 'finalized'
        ? 'finalized'
        : 'draft',
    slipCount: Number(record.slipCount) || 0,
    totalTakeHome: Number(record.totalTakeHome) || 0,
    totalGross: Number(record.totalGross) || 0,
    totalPph21Payroll: Number(record.totalPph21Payroll) || 0,
    walletId,
    walletName,
    walletBalance,
    taxSettlement: normalizeTaxSettlement(record.taxSettlement),
    finalizedAt: getString(record, 'finalizedAt'),
    createdAt: getString(record, 'createdAt'),
  };
}

function normalizeTaxSettlement(
  payload: unknown,
): KolamPayrollTaxSettlement | null {
  if (payload == null || payload === '') {
    return null;
  }
  if (typeof payload === 'string') {
    const id = payload.trim();
    return id
      ? {id, code: '', status: '', amount: 0}
      : null;
  }
  const record = asRecord(payload);
  const id = getString(record, '_id') || getString(record, 'id');
  if (!id) {
    return null;
  }
  return {
    id,
    code: getString(record, 'code'),
    status: getString(record, 'status'),
    amount: Number(record.amount) || 0,
  };
}

function normalizePayrollSlip(payload: unknown): KolamPayrollSlip {
  const record = asRecord(payload);
  const user = record.user;
  const snapshot = asRecord(record.employeeSnapshot);
  const pph21 = asRecord(record.pph21Payroll);
  let userId = '';
  let userLabel = '';
  if (typeof user === 'string') {
    userId = user.trim();
  } else if (typeof user === 'object' && user) {
    const userRecord = asRecord(user);
    userId = getString(userRecord, '_id') || getString(userRecord, 'id');
    userLabel = `${getString(userRecord, 'first_name')} ${getString(
      userRecord,
      'last_name',
    )}`.trim();
  }
  if (!userId) {
    userId = getString(record, 'userId');
  }
  const firstName = getString(snapshot, 'firstName');
  const lastName = getString(snapshot, 'lastName');
  if (!userLabel) {
    userLabel = `${firstName} ${lastName}`.trim();
  }
  const employeeNumber =
    getString(snapshot, 'employeeNumber') ||
    getString(snapshot, 'employee_number');
  const pph21Payroll: KolamPayrollPph21Line = {
    applicable: pph21.applicable === true,
    rate: Number(pph21.rate) || 0,
    taxableBase: Number(pph21.taxableBase) || 0,
    amount: Number(pph21.amount) || 0,
  };
  const salaryDateRaw = snapshot.salaryDate;
  const salaryDate =
    salaryDateRaw == null || salaryDateRaw === ''
      ? null
      : Number.isFinite(Number(salaryDateRaw))
        ? Number(salaryDateRaw)
        : null;
  return {
    id: getString(record, '_id') || getString(record, 'id'),
    slipCode: getString(record, 'slipCode'),
    periodKey: getString(record, 'periodKey'),
    userId,
    userLabel: userLabel || '—',
    employeeNumber,
    status:
      getString(record, 'status').toLowerCase() === 'finalized'
        ? 'finalized'
        : 'draft',
    warnings: normalizeWarnings(record.warnings),
    employeeSnapshot: {
      firstName,
      lastName,
      employeeNumber,
      position: getString(snapshot, 'position'),
      department: getString(snapshot, 'department'),
      taxNumber:
        getString(snapshot, 'taxNumber') || getString(snapshot, 'tax_number'),
      isPkp: snapshot.isPkp === true,
      salaryDate,
    },
    baseSalary: Number(record.baseSalary) || 0,
    bonusTotal: Number(record.bonusTotal) || 0,
    commissionGross: Number(record.commissionGross) || 0,
    commissionPph21Withheld: Number(record.commissionPph21Withheld) || 0,
    commissionNet: Number(record.commissionNet) || 0,
    kasbonTotal: Number(record.kasbonTotal) || 0,
    salaryDeductionTotal: Number(record.salaryDeductionTotal) || 0,
    takeHomePay: Number(record.takeHomePay) || 0,
    grossBruto: Number(record.grossBruto) || 0,
    totalDeductions: Number(record.totalDeductions) || 0,
    pph21Payroll,
    pph21Amount: pph21Payroll.amount,
    pph21AiNote: getString(record, 'pph21AiNote'),
    generatedAt: getString(record, 'generatedAt'),
  };
}

function normalizeWarnings(payload: unknown): KolamPayrollWarning[] {
  if (!Array.isArray(payload)) {
    return [];
  }
  return payload
    .map(item => {
      const record = asRecord(item);
      const code = getString(record, 'code');
      if (!code) {
        return null;
      }
      const severityRaw = getString(record, 'severity').toLowerCase();
      const severity: KolamPayrollWarningSeverity =
        severityRaw === 'error' || severityRaw === 'info'
          ? severityRaw
          : 'warning';
      return {
        code,
        message: getString(record, 'message'),
        severity,
      };
    })
    .filter((row): row is KolamPayrollWarning => row != null);
}

function getOptionalNumber(
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

function normalizePendingEmployee(payload: unknown): KolamPayrollPendingEmployee {
  const record = asRecord(payload);
  const salaryRaw = record.salary;
  return {
    userId: getString(record, 'userId') || getString(record, '_id'),
    name: getString(record, 'name'),
    salary:
      salaryRaw == null || salaryRaw === ''
        ? null
        : Number.isFinite(Number(salaryRaw))
          ? Number(salaryRaw)
          : null,
    isPkp: record.isPkp === true,
  };
}

function normalizePayrollPath(route: string): string {
  const path = String(route || '').split('?')[0].replace(/\/+$/, '') || '/';
  return path.startsWith('/') ? path : `/${path}`;
}

function decodeRouteSegment(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
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

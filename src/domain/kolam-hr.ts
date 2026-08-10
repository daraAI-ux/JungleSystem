/**
 * Pengaturan Karyawan — FE `/list-of-users/hr` (HR Sistem hub).
 * SoT: da-inventory-frontend `list-of-users/hr/page.tsx` + `hr-system/hr-panels.tsx`.
 */

import {
  hasSettingsPermission,
  isSettingsSuperAdminRoleKey,
  type SettingsTabVisibilityContext,
} from './settings-surface';
import {getKolamFileUrl} from '../lib/file-url';

export const KOLAM_HR_ROOT = '/list-of-users/hr';

/** FE redirects into hub tabs. */
export const KOLAM_HR_LEGACY_ABSENSI_ROUTE = '/staff-attendance';
export const KOLAM_HR_LEGACY_CUTI_ROUTE = '/staff-attendance/leaves';
export const KOLAM_HR_LEGACY_LEMBUR_ROUTE = '/list-of-users/overtime';

/** Settings web config (operasional hosts absensi). */
export const KOLAM_HR_ATTENDANCE_SETTINGS_ROUTE = '/pengaturan';

export type KolamHrTabId = 'absensi' | 'cuti' | 'lembur';

export const KOLAM_HR_TABS: Array<{id: KolamHrTabId; label: string}> = [
  {id: 'absensi', label: 'Absensi harian'},
  {id: 'cuti', label: 'Cuti & absensi'},
  {id: 'lembur', label: 'Lembur'},
];

export const KOLAM_HR_DEFAULT_TAB: KolamHrTabId = 'absensi';

export const KOLAM_HR_ACCESS_UNAVAILABLE = 'Akses HR tidak tersedia.';

/** FE `ATTENDANCE_STATUS_LABEL`. */
export const KOLAM_HR_ATTENDANCE_STATUS_LABEL: Record<string, string> = {
  pending: 'Belum absen',
  present: 'Hadir',
  late_tier2: 'Telat (Rp 50rb)',
  late_tier3: 'Telat ≥2j (Rp 100rb)',
  absent: 'Absen',
  holiday: 'Libur',
  leave: 'Cuti/Ijin',
  sick: 'Sakit',
};

export type KolamHrStatusIntent =
  | 'success'
  | 'danger'
  | 'secondary'
  | 'warning'
  | 'primary';

/** FE `attendanceStatusIntent`. */
export function kolamHrAttendanceStatusIntent(
  status: string,
): KolamHrStatusIntent {
  if (status === 'present') {
    return 'success';
  }
  if (status === 'absent' || status === 'late_tier3') {
    return 'danger';
  }
  if (status === 'late_tier2') {
    return 'warning';
  }
  return 'secondary';
}

export type KolamHrOvertimeStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'paid'
  | 'failed'
  | 'invalidated';

export const KOLAM_HR_OVERTIME_STATUS_LABEL: Record<
  KolamHrOvertimeStatus,
  string
> = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  paid: 'Sudah cair',
  failed: 'Gagal',
  invalidated: 'Batal',
};

export const KOLAM_HR_OVERTIME_FILTERS: Array<{id: string; label: string}> = [
  {id: 'pending', label: 'Menunggu'},
  {id: 'approved', label: 'Disetujui'},
  {id: 'paid', label: 'Sudah cair'},
  {id: 'failed', label: 'Gagal'},
  {id: 'all', label: 'Semua'},
];

export function kolamHrOvertimeStatusIntent(
  status: string,
): KolamHrStatusIntent {
  if (status === 'paid') {
    return 'success';
  }
  if (status === 'approved') {
    return 'primary';
  }
  if (status === 'pending') {
    return 'warning';
  }
  if (status === 'rejected' || status === 'failed') {
    return 'danger';
  }
  return 'secondary';
}

export type KolamHrLeaveStatus = 'pending' | 'approved' | 'rejected';

export type KolamHrLeaveType = 'ijin' | 'cuti' | 'sakit';

export const KOLAM_HR_LEAVE_TYPE_OPTIONS: Array<{
  id: KolamHrLeaveType;
  label: string;
}> = [
  {id: 'ijin', label: 'Ijin'},
  {id: 'cuti', label: 'Cuti'},
  {id: 'sakit', label: 'Sakit'},
];

export type KolamHrAccess = {
  canAbsensi: boolean;
  canCuti: boolean;
  canLembur: boolean;
  canLemburUpdate: boolean;
  canSee: boolean;
  visibleTabs: Array<{id: KolamHrTabId; label: string}>;
};

export function resolveKolamHrAccess(
  context: SettingsTabVisibilityContext | null | undefined,
): KolamHrAccess {
  const isSuperAdmin = isSettingsSuperAdminRoleKey(
    String(context?.roleKey ?? ''),
  );
  const canAbsensi =
    isSuperAdmin ||
    hasSettingsPermission(context, 'staff_attendance', 'view') ||
    hasSettingsPermission(context, 'salary', 'view');
  const canCuti =
    isSuperAdmin ||
    hasSettingsPermission(context, 'staff_attendance', 'update') ||
    hasSettingsPermission(context, 'salary', 'update');
  const canLembur =
    isSuperAdmin || hasSettingsPermission(context, 'payroll', 'view');
  const canLemburUpdate =
    isSuperAdmin || hasSettingsPermission(context, 'payroll', 'update');

  const visibleTabs = KOLAM_HR_TABS.filter(tab => {
    if (tab.id === 'absensi') {
      return canAbsensi;
    }
    if (tab.id === 'cuti') {
      return canCuti;
    }
    return canLembur;
  });

  return {
    canAbsensi,
    canCuti,
    canLembur,
    canLemburUpdate,
    canSee: visibleTabs.length > 0,
    visibleTabs,
  };
}

function normalizeHrPath(route: string): string {
  const raw = String(route ?? '').trim();
  const withoutQuery = raw.includes('?') ? raw.split('?')[0] : raw;
  if (!withoutQuery) {
    return '';
  }
  const withSlash = withoutQuery.startsWith('/')
    ? withoutQuery
    : `/${withoutQuery}`;
  return withSlash.replace(/\/+$/, '') || '/';
}

export function isKolamHrRoute(route: string): boolean {
  const path = normalizeHrPath(route);
  return (
    path === KOLAM_HR_ROOT ||
    path.startsWith(`${KOLAM_HR_ROOT}/`) ||
    path === KOLAM_HR_LEGACY_ABSENSI_ROUTE ||
    path === KOLAM_HR_LEGACY_CUTI_ROUTE ||
    path === KOLAM_HR_LEGACY_LEMBUR_ROUTE
  );
}

/** Map legacy FE paths to hub `?tab=`. */
export function canonicalizeKolamHrRoute(route: string): string {
  const path = normalizeHrPath(route);
  if (path === KOLAM_HR_LEGACY_ABSENSI_ROUTE) {
    return buildKolamHrRoute('absensi');
  }
  if (path === KOLAM_HR_LEGACY_CUTI_ROUTE) {
    return buildKolamHrRoute('cuti');
  }
  if (path === KOLAM_HR_LEGACY_LEMBUR_ROUTE) {
    return buildKolamHrRoute('lembur');
  }
  if (path === KOLAM_HR_ROOT || path.startsWith(`${KOLAM_HR_ROOT}/`)) {
    const tab = getKolamHrTab(route);
    return buildKolamHrRoute(tab);
  }
  return route;
}

export function getKolamHrTab(route: string): KolamHrTabId {
  const path = normalizeHrPath(route);
  if (path === KOLAM_HR_LEGACY_ABSENSI_ROUTE) {
    return 'absensi';
  }
  if (path === KOLAM_HR_LEGACY_CUTI_ROUTE) {
    return 'cuti';
  }
  if (path === KOLAM_HR_LEGACY_LEMBUR_ROUTE) {
    return 'lembur';
  }

  const query = route.includes('?') ? route.split('?')[1] || '' : '';
  const raw = String(new URLSearchParams(query).get('tab') || '')
    .trim()
    .toLowerCase();
  const match = KOLAM_HR_TABS.find(tab => tab.id === raw);
  return match?.id ?? KOLAM_HR_DEFAULT_TAB;
}

export function buildKolamHrRoute(
  tab: KolamHrTabId = KOLAM_HR_DEFAULT_TAB,
): string {
  if (tab === KOLAM_HR_DEFAULT_TAB) {
    return KOLAM_HR_ROOT;
  }
  return `${KOLAM_HR_ROOT}?tab=${tab}`;
}

export function pickKolamHrVisibleTab(
  route: string,
  visibleTabs: Array<{id: KolamHrTabId}>,
): KolamHrTabId {
  const requested = getKolamHrTab(route);
  if (visibleTabs.some(tab => tab.id === requested)) {
    return requested;
  }
  return visibleTabs[0]?.id ?? KOLAM_HR_DEFAULT_TAB;
}

export function buildKolamHrUserDetailRoute(userId: string): string {
  return `/list-of-users/users/${encodeURIComponent(userId)}`;
}

/** Asia/Jakarta date key YYYY-MM-DD (FE `todayDateKey`). */
export function kolamHrTodayDateKey(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
  }).format(now);
}

export type KolamHrDailyAttendanceRow = {
  userId: string;
  userName: string;
  userPhoto: string | null;
  status: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  lateMinutes: number;
  fineAmount: number;
};

export type KolamHrDailyAttendanceSummary = {
  dateKey: string;
  holiday: boolean;
  workStartTime: string;
  timezone: string;
  stats: Record<string, number>;
  rows: KolamHrDailyAttendanceRow[];
};

export type KolamHrLeaveRequest = {
  id: string;
  userId: string;
  userName: string;
  type: string;
  startDateKey: string;
  endDateKey: string;
  reason: string;
  status: KolamHrLeaveStatus;
};

export type KolamHrOvertimeRow = {
  id: string;
  userName: string;
  taskTitle: string;
  taskDueDate: string | null;
  reason: string;
  invalidatedReason: string;
  amount: number;
  overtimeUnits: number;
  unitLabel: string;
  status: KolamHrOvertimeStatus;
  transferProofPath: string | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function getString(record: Record<string, unknown> | null, key: string) {
  if (!record) {
    return '';
  }
  const value = record[key];
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return '';
}

function getNumber(record: Record<string, unknown> | null, key: string) {
  if (!record) {
    return 0;
  }
  const value = record[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function unwrapData(payload: unknown): unknown {
  const record = asRecord(payload);
  if (record && 'data' in record) {
    return record.data;
  }
  return payload;
}

function staffDisplayName(user: unknown): string {
  if (typeof user === 'string') {
    return user.trim() || '—';
  }
  const record = asRecord(user);
  if (!record) {
    return '—';
  }
  const first = getString(record, 'first_name') || getString(record, 'firstName');
  const last = getString(record, 'last_name') || getString(record, 'lastName');
  const full = `${first} ${last}`.trim();
  if (full) {
    return full;
  }
  return (
    getString(record, 'username') ||
    getString(record, 'email') ||
    getString(record, '_id') ||
    getString(record, 'id') ||
    '—'
  );
}

function staffId(user: unknown): string {
  if (typeof user === 'string') {
    return user.trim();
  }
  const record = asRecord(user);
  return getString(record, '_id') || getString(record, 'id');
}

function staffPhoto(user: unknown): string | null {
  const record = asRecord(user);
  if (!record) {
    return null;
  }
  const hr = asRecord(record.hr);
  const employee = asRecord(record.employee);
  const photo =
    getString(record, 'profilePicture') ||
    getString(record, 'profile_picture') ||
    getString(record, 'employeePhoto') ||
    getString(record, 'photo') ||
    getString(hr, 'photo') ||
    getString(employee, 'photo');
  return photo ? getKolamFileUrl(photo) ?? photo : null;
}

export function normalizeKolamHrDailyAttendanceSummary(
  payload: unknown,
): KolamHrDailyAttendanceSummary | null {
  const data = asRecord(unwrapData(payload));
  if (!data) {
    return null;
  }

  const statsRecord = asRecord(data.stats) ?? {};
  const stats: Record<string, number> = {};
  for (const [key, value] of Object.entries(statsRecord)) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      stats[key] = value;
    } else if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        stats[key] = parsed;
      }
    }
  }

  const rawRows = Array.isArray(data.rows) ? data.rows : [];
  const rows: KolamHrDailyAttendanceRow[] = rawRows
    .map(item => {
      const row = asRecord(item);
      if (!row) {
        return null;
      }
      const user = row.user;
      const userId = staffId(user);
      if (!userId) {
        return null;
      }
      return {
        userId,
        userName: staffDisplayName(user),
        userPhoto: staffPhoto(user),
        status: getString(row, 'status') || 'pending',
        checkInAt: getString(row, 'checkInAt') || null,
        checkOutAt: getString(row, 'checkOutAt') || null,
        lateMinutes: getNumber(row, 'lateMinutes'),
        fineAmount: getNumber(row, 'fineAmount'),
      };
    })
    .filter((row): row is KolamHrDailyAttendanceRow => row != null);

  return {
    dateKey: getString(data, 'dateKey') || kolamHrTodayDateKey(),
    holiday: data.holiday === true,
    workStartTime: getString(data, 'workStartTime') || '—',
    timezone: getString(data, 'timezone') || 'Asia/Jakarta',
    stats,
    rows,
  };
}

export function normalizeKolamHrLeaveRequestList(
  payload: unknown,
): KolamHrLeaveRequest[] {
  const data = unwrapData(payload);
  const list = Array.isArray(data)
    ? data
    : Array.isArray(asRecord(data)?.data)
      ? (asRecord(data)?.data as unknown[])
      : [];

  return list
    .map(item => {
      const row = asRecord(item);
      if (!row) {
        return null;
      }
      const id = getString(row, '_id') || getString(row, 'id');
      if (!id) {
        return null;
      }
      const statusRaw = getString(row, 'status').toLowerCase();
      const status: KolamHrLeaveStatus =
        statusRaw === 'approved' || statusRaw === 'rejected'
          ? statusRaw
          : 'pending';
      return {
        id,
        userId: staffId(row.user),
        userName: staffDisplayName(row.user),
        type: getString(row, 'type') || 'ijin',
        startDateKey: getString(row, 'startDateKey'),
        endDateKey: getString(row, 'endDateKey'),
        reason: getString(row, 'reason'),
        status,
      };
    })
    .filter((row): row is KolamHrLeaveRequest => row != null);
}

function normalizeOvertimeStatus(raw: string): KolamHrOvertimeStatus {
  const value = raw.toLowerCase();
  if (
    value === 'approved' ||
    value === 'rejected' ||
    value === 'paid' ||
    value === 'failed' ||
    value === 'invalidated'
  ) {
    return value;
  }
  return 'pending';
}

export function normalizeKolamHrOvertimeList(
  payload: unknown,
): KolamHrOvertimeRow[] {
  const data = unwrapData(payload);
  const list = Array.isArray(data) ? data : [];

  return list
    .map(item => {
      const row = asRecord(item);
      if (!row) {
        return null;
      }
      const id = getString(row, '_id') || getString(row, 'id');
      if (!id) {
        return null;
      }
      const proof = asRecord(row.transferProof);
      return {
        id,
        userName: staffDisplayName(row.user),
        taskTitle: getString(row, 'taskTitle') || '—',
        taskDueDate: getString(row, 'taskDueDate') || null,
        reason: getString(row, 'reason'),
        invalidatedReason: getString(row, 'invalidatedReason'),
        amount: getNumber(row, 'amount'),
        overtimeUnits: getNumber(row, 'overtimeUnits'),
        unitLabel: getString(row, 'unitLabel') || 'jam',
        status: normalizeOvertimeStatus(getString(row, 'status')),
        transferProofPath: getString(proof, 'path') || null,
      };
    })
    .filter((row): row is KolamHrOvertimeRow => row != null);
}

export function formatKolamHrDatetime(value: string | null | undefined): string {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(date);
}

export function formatKolamHrFine(amount: number): string {
  if (!amount) {
    return '-';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

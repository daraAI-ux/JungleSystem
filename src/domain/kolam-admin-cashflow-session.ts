/**
 * Admin cashflow sessions (`/cashflow-session`) — daily Kolam window.
 * Bukan POS shift (`/pos/cashflow` → shell module `cashflow`).
 *
 * Source of truth: FE `types/cashflow.ts` + BE `/api/cashflow`.
 */

export const KOLAM_ADMIN_CASHFLOW_SESSION_ROOT = '/cashflow-session';
export const KOLAM_POS_CASHFLOW_SHIFT_ROOT = '/pos/cashflow';

export type KolamAdminCashflowSessionStatus =
  | 'open'
  | 'locked'
  | 'in-review'
  | 'verified';

export type KolamAdminCashflowSessionSource = 'admin' | 'pos';

export type KolamAdminCashflowSurfaceMode = 'list' | 'create' | 'detail';

/** Compact probe shape used by the top-nav cashflow icon. */
export type ActiveAdminCashflowSession = {
  id: string;
  name?: string;
  source?: KolamAdminCashflowSessionSource;
  status: KolamAdminCashflowSessionStatus;
};

export type KolamAdminCashflowUserRef = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  username: string;
};

export type KolamAdminCashflowSessionSnapshot = {
  totalSalesCount: number;
  totalSalesAmount: number;
};

export type KolamAdminCashflowSession = {
  id: string;
  name: string;
  source: KolamAdminCashflowSessionSource;
  status: KolamAdminCashflowSessionStatus;
  windowStart: string;
  windowEnd: string;
  openedAt: string;
  closedAt: string;
  openedBy: KolamAdminCashflowUserRef | null;
  snapshot: KolamAdminCashflowSessionSnapshot | null;
  createdAt: string;
  updatedAt: string;
  raw: unknown;
};

export type KolamAdminCashflowTodaySession = {
  id: string;
  name: string;
  status: KolamAdminCashflowSessionStatus;
  windowStart: string;
  windowEnd: string;
};

export type KolamAdminCashflowActiveProbe = {
  active: KolamAdminCashflowSession | null;
  todaySession: KolamAdminCashflowTodaySession | null;
};

export type KolamAdminCashflowListFilters = {
  page: number;
  limit: number;
  status: '' | KolamAdminCashflowSessionStatus;
  source: '' | KolamAdminCashflowSessionSource;
  search: string;
};

export type KolamAdminCashflowPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type KolamAdminCashflowOpenBody = {
  name?: string;
  windowStart?: string;
  windowEnd?: string;
};

export const KOLAM_ADMIN_CASHFLOW_STATUS_OPTIONS: Array<{
  label: string;
  value: '' | KolamAdminCashflowSessionStatus;
}> = [
  { label: 'Semua status', value: '' },
  { label: 'Open', value: 'open' },
  { label: 'Locked', value: 'locked' },
  { label: 'In Review', value: 'in-review' },
  { label: 'Verified', value: 'verified' },
];

export const KOLAM_ADMIN_CASHFLOW_SOURCE_OPTIONS: Array<{
  label: string;
  value: '' | KolamAdminCashflowSessionSource;
}> = [
  { label: 'Semua sumber', value: '' },
  { label: 'Admin', value: 'admin' },
  { label: 'POS', value: 'pos' },
];

export function isKolamAdminCashflowSessionRoute(route: string) {
  const path = normalizeAdminCashflowRoutePath(route);
  return (
    path === KOLAM_ADMIN_CASHFLOW_SESSION_ROOT ||
    path.startsWith(`${KOLAM_ADMIN_CASHFLOW_SESSION_ROOT}/`)
  );
}

export function isKolamPosCashflowShiftRoute(route: string) {
  const path = normalizeAdminCashflowRoutePath(route);
  return (
    path === KOLAM_POS_CASHFLOW_SHIFT_ROOT ||
    path.startsWith(`${KOLAM_POS_CASHFLOW_SHIFT_ROOT}/`)
  );
}

export function isKolamAdminCashflowListRoute(route: string) {
  return (
    normalizeAdminCashflowRoutePath(route) === KOLAM_ADMIN_CASHFLOW_SESSION_ROOT
  );
}

export function isKolamAdminCashflowCreateRoute(route: string) {
  return (
    normalizeAdminCashflowRoutePath(route) ===
    `${KOLAM_ADMIN_CASHFLOW_SESSION_ROOT}/create`
  );
}

export function getKolamAdminCashflowRouteId(route: string) {
  const path = normalizeAdminCashflowRoutePath(route);
  if (
    path === KOLAM_ADMIN_CASHFLOW_SESSION_ROOT ||
    path.endsWith('/create')
  ) {
    return null;
  }
  const match = /^\/cashflow-session\/([^/]+)$/.exec(path);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function getKolamAdminCashflowSurfaceMode(
  route: string,
): KolamAdminCashflowSurfaceMode {
  if (isKolamAdminCashflowCreateRoute(route)) {
    return 'create';
  }
  if (getKolamAdminCashflowRouteId(route)) {
    return 'detail';
  }
  return 'list';
}

export function createInitialAdminCashflowListFilters(): KolamAdminCashflowListFilters {
  return {
    page: 1,
    limit: 10,
    status: '',
    source: '',
    search: '',
  };
}

export function normalizeKolamAdminCashflowSession(
  raw: unknown,
): KolamAdminCashflowSession {
  const row = asRecord(raw) ?? {};
  const openedBy = normalizeUserRef(row.openedBy);
  const snapshot = asRecord(row.snapshot);

  return {
    id: String(row.id || row._id || '').trim(),
    name: String(row.name || '').trim() || 'Sesi tunai',
    source: row.source === 'pos' ? 'pos' : 'admin',
    status: normalizeStatus(row.status),
    windowStart: stringifyDate(row.windowStart),
    windowEnd: stringifyDate(row.windowEnd),
    openedAt: stringifyDate(row.openedAt),
    closedAt: stringifyDate(row.closedAt),
    openedBy,
    snapshot: snapshot
      ? {
          totalSalesCount: Number(snapshot.totalSalesCount) || 0,
          totalSalesAmount: Number(snapshot.totalSalesAmount) || 0,
        }
      : null,
    createdAt: stringifyDate(row.createdAt),
    updatedAt: stringifyDate(row.updatedAt),
    raw,
  };
}

export function normalizeKolamAdminCashflowSessionList(raw: unknown) {
  const payload = asRecord(raw);
  const rows = Array.isArray(raw)
    ? raw
    : Array.isArray(payload?.data)
      ? payload.data
      : [];
  const paginationRaw = asRecord(payload?.pagination);
  const items = rows
    .map(normalizeKolamAdminCashflowSession)
    .filter(item => Boolean(item.id));

  return {
    items,
    pagination: {
      page: Number(paginationRaw?.page) || 1,
      limit: Number(paginationRaw?.limit) || 10,
      total: Number(paginationRaw?.total) || items.length,
      totalPages: Math.max(1, Number(paginationRaw?.totalPages) || 1),
    } satisfies KolamAdminCashflowPagination,
  };
}

export function normalizeKolamAdminCashflowActiveProbe(
  raw: unknown,
): KolamAdminCashflowActiveProbe {
  const payload = asRecord(raw);
  const activeRaw = payload?.data ?? null;
  const todayRaw = asRecord(payload?.todaySession);

  let active: KolamAdminCashflowSession | null = null;
  if (activeRaw) {
    const session = normalizeKolamAdminCashflowSession(activeRaw);
    active =
      session.id && (!session.source || session.source === 'admin')
        ? session
        : null;
  }

  const todayId = String(todayRaw?.id || todayRaw?._id || '').trim();
  const todaySession: KolamAdminCashflowTodaySession | null = todayId
    ? {
        id: todayId,
        name: String(todayRaw?.name || '').trim() || 'Sesi hari ini',
        status: normalizeStatus(todayRaw?.status),
        windowStart: stringifyDate(todayRaw?.windowStart),
        windowEnd: stringifyDate(todayRaw?.windowEnd),
      }
    : null;

  return { active, todaySession };
}

export function formatAdminCashflowOpenedBy(
  user: KolamAdminCashflowUserRef | null,
  source: KolamAdminCashflowSessionSource,
): string {
  if (user?.name) {
    return user.name;
  }
  if (source === 'admin') {
    return 'System';
  }
  return '—';
}

export function formatAdminCashflowWindowLabel(session: KolamAdminCashflowSession) {
  if (session.source === 'pos') {
    return session.openedAt ? formatShortDateTime(session.openedAt) : '—';
  }
  if (session.windowStart && session.windowEnd) {
    return `${formatShortDateTime(session.windowStart)} – ${formatShortDateTime(
      session.windowEnd,
    )}`;
  }
  return session.createdAt ? formatShortDateTime(session.createdAt) : '—';
}

export function getAdminCashflowStatusIntent(
  status: KolamAdminCashflowSessionStatus,
): 'success' | 'warning' | 'primary' | 'muted' {
  switch (status) {
    case 'open':
      return 'success';
    case 'locked':
    case 'in-review':
      return 'warning';
    case 'verified':
      return 'primary';
    default:
      return 'muted';
  }
}

function normalizeAdminCashflowRoutePath(route: string) {
  const path = (route.split('?')[0] || '/').trim();
  return ('/' + path.replace(/^\/+/, '')).replace(/\/+$/, '') || '/';
}

function normalizeStatus(value: unknown): KolamAdminCashflowSessionStatus {
  if (
    value === 'open' ||
    value === 'locked' ||
    value === 'in-review' ||
    value === 'verified'
  ) {
    return value;
  }
  return 'open';
}

function normalizeUserRef(raw: unknown): KolamAdminCashflowUserRef | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const row = raw as Record<string, unknown>;
  const firstName = String(row.first_name || row.firstName || '').trim();
  const lastName = String(row.last_name || row.lastName || '').trim();
  const username = String(row.username || '').trim();
  const email = String(row.email || '').trim();
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const name =
    fullName ||
    username ||
    email ||
    String(row.name || '').trim();
  const id = String(row.id || row._id || '').trim();
  if (!id && !name) {
    return null;
  }
  return {
    id,
    firstName,
    lastName,
    name: name || id,
    email,
    username,
  };
}

function stringifyDate(value: unknown) {
  if (!value) {
    return '';
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return String(value);
}

function formatShortDateTime(value: string) {
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

function asRecord(value: unknown): Record<string, any> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, any>;
}

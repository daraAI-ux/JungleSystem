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

/* ─── Detail: review / by-invoice / deposits ─── */

export const EXCLUDED_FROM_INVOICE_CONFIRM_SOURCES = ['commission'] as const;

export type KolamAdminCashflowDetailTab =
  | 'overview'
  | 'review'
  | 'deposits';

export type KolamAdminCashflowInvoiceConfirmStatus =
  | 'unconfirmed'
  | 'confirmed'
  | 'rejected'
  | 'auto_confirmed'
  | 'partial'
  | 'unknown';

export type KolamAdminCashflowEntryConfirmStatus =
  | 'unconfirmed'
  | 'confirmed'
  | 'rejected'
  | 'auto_confirmed'
  | 'voided';

export type KolamAdminCashflowInvoiceGroupEntry = {
  id: string;
  type: 'credit' | 'debit';
  source: string;
  amount: number;
  note: string;
  confirmStatus: KolamAdminCashflowEntryConfirmStatus;
  walletId: string;
  walletName: string;
  walletType: string;
  walletProvider: string;
  paymentMethodType: string;
  createdAt: string;
};

export type KolamAdminCashflowInvoiceGroup = {
  saleId: string | null;
  invoiceCode: string | null;
  entries: KolamAdminCashflowInvoiceGroupEntry[];
  confirmableEntries: KolamAdminCashflowInvoiceGroupEntry[];
  excludedCount: number;
  netAmount: number;
  confirmStatus: KolamAdminCashflowInvoiceConfirmStatus;
  firstAt: string | null;
};

export type KolamAdminCashflowReviewEntry = {
  id: string;
  type: 'credit' | 'debit';
  source: string;
  amount: number;
  confirmStatus: string;
  walletType: string;
  walletProvider: string;
  paymentMethodType: string;
  sourceModel: string;
};

export type KolamAdminCashflowReviewSummary = {
  unconfirmedCount: number;
  cashTotal: number;
  nonCashTotal: number;
  totalUnconfirmed: number;
};

export type KolamAdminCashflowDepositStatus =
  | 'draft'
  | 'submitted'
  | 'in-review'
  | 'verified'
  | 'rejected'
  | 'voided';

export type KolamAdminCashflowDeposit = {
  id: string;
  sessionId: string;
  fromWalletId: string;
  fromWalletName: string;
  toWalletId: string;
  toWalletName: string;
  amount: number;
  headlineAmount: number;
  status: KolamAdminCashflowDepositStatus;
  note: string;
  source: KolamAdminCashflowSessionSource;
  allocationCount: number;
  totalExpectedIdr: number;
  totalActualIdr: number;
  totalShortageIdr: number;
  expectedAmount: number | null;
  shortageIdr: number | null;
  overageIdr: number | null;
  verifiedAt: string;
  createdAt: string;
  raw: unknown;
};

export type KolamAdminCashflowRecheckResult = {
  sessionId: string;
  previousStatus: string;
  sessionStatus: KolamAdminCashflowSessionStatus;
  transitioned: boolean;
  remainingUnconfirmed: number;
  remainingConfirmable: number;
  remainingExcluded: number;
};

export type KolamAdminCashflowConfirmAllResult = {
  confirmedCount: number;
  remainingUnconfirmed: number;
  sessionStatus: KolamAdminCashflowSessionStatus;
};

export type KolamAdminCashflowSubmitDirectAllocation = {
  saleId: string;
  actualAmountIdr: number;
  note?: string;
};

export type KolamAdminCashflowInvoiceReviewFilter =
  | 'pending'
  | 'confirmed'
  | 'rejected'
  | 'all';

export function isConfirmableCashflowSource(source: string) {
  return !(EXCLUDED_FROM_INVOICE_CONFIRM_SOURCES as readonly string[]).includes(
    source,
  );
}

export function isCashInvoiceGroup(group: KolamAdminCashflowInvoiceGroup) {
  const candidates =
    group.confirmableEntries.length > 0
      ? group.confirmableEntries
      : group.entries;
  return candidates.some(isCashReviewEntryLike);
}

export function getGrossCashFromInvoiceGroup(
  group: KolamAdminCashflowInvoiceGroup,
) {
  const entries =
    group.confirmableEntries.length > 0
      ? group.confirmableEntries
      : group.entries;
  let total = 0;
  for (const entry of entries) {
    if (entry.type !== 'credit') {
      continue;
    }
    if (!isCashWalletFields(entry.walletType, entry.walletProvider)) {
      continue;
    }
    total += entry.amount;
  }
  return total;
}

export function computeAdminCashflowReviewSummary(
  entries: KolamAdminCashflowReviewEntry[],
): KolamAdminCashflowReviewSummary {
  let cashTotal = 0;
  let nonCashTotal = 0;
  let totalUnconfirmed = 0;

  for (const entry of entries) {
    const delta = entry.type === 'credit' ? entry.amount : -entry.amount;
    const positive = Math.max(delta, 0);
    totalUnconfirmed += positive;
    if (isCashReviewEntryLike(entry)) {
      cashTotal += positive;
    } else {
      nonCashTotal += positive;
    }
  }

  return {
    unconfirmedCount: entries.length,
    cashTotal,
    nonCashTotal,
    totalUnconfirmed,
  };
}

export function invoiceReviewFilterMatches(
  group: KolamAdminCashflowInvoiceGroup,
  filter: KolamAdminCashflowInvoiceReviewFilter,
) {
  if (filter === 'all') {
    return true;
  }
  if (filter === 'pending') {
    return (
      group.confirmStatus === 'unconfirmed' ||
      group.confirmStatus === 'partial'
    );
  }
  if (filter === 'confirmed') {
    return (
      group.confirmStatus === 'confirmed' ||
      group.confirmStatus === 'auto_confirmed'
    );
  }
  if (filter === 'rejected') {
    return group.confirmStatus === 'rejected';
  }
  return true;
}

export function getInvoiceConfirmStatusIntent(
  status: KolamAdminCashflowInvoiceConfirmStatus,
): 'success' | 'warning' | 'danger' | 'primary' | 'muted' {
  switch (status) {
    case 'confirmed':
    case 'auto_confirmed':
      return 'success';
    case 'rejected':
      return 'danger';
    case 'unconfirmed':
    case 'partial':
      return 'warning';
    case 'unknown':
      return 'muted';
    default:
      return 'primary';
  }
}

export function getDepositStatusIntent(
  status: KolamAdminCashflowDepositStatus,
): 'success' | 'warning' | 'danger' | 'muted' {
  switch (status) {
    case 'verified':
      return 'success';
    case 'rejected':
    case 'voided':
      return 'danger';
    case 'submitted':
    case 'in-review':
      return 'warning';
    default:
      return 'muted';
  }
}

export function normalizeKolamAdminCashflowReviewEntries(
  raw: unknown,
): KolamAdminCashflowReviewEntry[] {
  const payload = asRecord(raw);
  const rows = Array.isArray(raw)
    ? raw
    : Array.isArray(payload?.data)
      ? payload.data
      : [];
  return rows
    .map(normalizeReviewEntry)
    .filter(entry => Boolean(entry.id));
}

export function normalizeKolamAdminCashflowInvoiceGroups(
  raw: unknown,
): KolamAdminCashflowInvoiceGroup[] {
  const payload = asRecord(raw);
  const rows = Array.isArray(raw)
    ? raw
    : Array.isArray(payload?.data)
      ? payload.data
      : [];
  return rows.map(normalizeInvoiceGroup);
}

export function normalizeKolamAdminCashflowDeposits(
  raw: unknown,
): KolamAdminCashflowDeposit[] {
  const payload = asRecord(raw);
  const rows = Array.isArray(raw)
    ? raw
    : Array.isArray(payload?.data)
      ? payload.data
      : [];
  return rows
    .map(normalizeDeposit)
    .filter(item => Boolean(item.id) && item.status !== 'draft');
}

export function normalizeKolamAdminCashflowRecheckResult(
  raw: unknown,
): KolamAdminCashflowRecheckResult {
  const payload = asRecord(raw);
  const data = asRecord(payload?.data) ?? payload ?? {};
  const remaining = asRecord(data.remainingByExclusion);
  return {
    sessionId: String(data.sessionId || '').trim(),
    previousStatus: String(data.previousStatus || '').trim(),
    sessionStatus: normalizeStatus(data.sessionStatus),
    transitioned: Boolean(data.transitioned),
    remainingUnconfirmed: Number(data.remainingUnconfirmed) || 0,
    remainingConfirmable: Number(remaining?.confirmable) || 0,
    remainingExcluded: Number(remaining?.excluded) || 0,
  };
}

export function normalizeKolamAdminCashflowConfirmAllResult(
  raw: unknown,
): KolamAdminCashflowConfirmAllResult {
  const payload = asRecord(raw) ?? {};
  return {
    confirmedCount: Number(payload.confirmedCount) || 0,
    remainingUnconfirmed: Number(payload.remainingUnconfirmed) || 0,
    sessionStatus: normalizeStatus(payload.sessionStatus),
  };
}

function isCashWalletFields(type: string, provider: string) {
  return (
    type.toLowerCase() === 'cash' || provider.toUpperCase() === 'CASH'
  );
}

function isCashReviewEntryLike(entry: {
  walletType: string;
  walletProvider: string;
  paymentMethodType: string;
  source?: string;
}) {
  return (
    isCashWalletFields(entry.walletType, entry.walletProvider) ||
    entry.paymentMethodType === 'cash'
  );
}

function normalizeReviewEntry(raw: unknown): KolamAdminCashflowReviewEntry {
  const row = asRecord(raw) ?? {};
  const wallet = asRecord(row.wallet);
  const reference = asRecord(row.reference);
  const paymentMethod = asRecord(reference?.paymentMethod);
  return {
    id: String(row.id || row._id || '').trim(),
    type: row.type === 'debit' ? 'debit' : 'credit',
    source: String(row.source || '').trim(),
    amount: Number(row.amount) || 0,
    confirmStatus: String(row.confirmStatus || '').trim(),
    walletType: String(wallet?.type || '').trim(),
    walletProvider: String(wallet?.provider || '').trim(),
    paymentMethodType: String(paymentMethod?.type || '').trim(),
    sourceModel: String(row.sourceModel || '').trim(),
  };
}

function normalizeInvoiceGroupEntry(
  raw: unknown,
): KolamAdminCashflowInvoiceGroupEntry {
  const row = asRecord(raw) ?? {};
  const wallet = asRecord(row.wallet);
  const reference = asRecord(row.reference);
  const paymentMethod = asRecord(reference?.paymentMethod);
  const confirmStatus = normalizeEntryConfirmStatus(row.confirmStatus);
  return {
    id: String(row.id || row._id || '').trim(),
    type: row.type === 'debit' ? 'debit' : 'credit',
    source: String(row.source || '').trim(),
    amount: Number(row.amount) || 0,
    note: String(row.note || '').trim(),
    confirmStatus,
    walletId: String(wallet?.id || wallet?._id || row.wallet || '').trim(),
    walletName: String(wallet?.name || '').trim() || '—',
    walletType: String(wallet?.type || '').trim(),
    walletProvider: String(wallet?.provider || '').trim(),
    paymentMethodType: String(paymentMethod?.type || '').trim(),
    createdAt: stringifyDate(row.createdAt),
  };
}

function normalizeInvoiceGroup(raw: unknown): KolamAdminCashflowInvoiceGroup {
  const row = asRecord(raw) ?? {};
  const entries = Array.isArray(row.entries)
    ? row.entries.map(normalizeInvoiceGroupEntry)
    : [];
  const confirmableEntries = Array.isArray(row.confirmableEntries)
    ? row.confirmableEntries.map(normalizeInvoiceGroupEntry)
    : entries.filter(entry => isConfirmableCashflowSource(entry.source));
  return {
    saleId: row.saleId ? String(row.saleId).trim() : null,
    invoiceCode: row.invoiceCode ? String(row.invoiceCode).trim() : null,
    entries,
    confirmableEntries,
    excludedCount: Number(row.excludedCount) || 0,
    netAmount: Number(row.netAmount) || 0,
    confirmStatus: normalizeInvoiceConfirmStatus(row.confirmStatus),
    firstAt: row.firstAt ? stringifyDate(row.firstAt) : null,
  };
}

function normalizeDeposit(raw: unknown): KolamAdminCashflowDeposit {
  const row = asRecord(raw) ?? {};
  const fromWallet = asRecord(row.fromWallet);
  const toWallet = asRecord(row.toWallet);
  const allocations = Array.isArray(row.invoiceAllocations)
    ? row.invoiceAllocations
    : [];
  const amount = Number(row.amount) || 0;
  const totalActualIdr = parseMoneyish(row.totalActualIdr);
  const headlineAmount =
    allocations.length > 0 ? totalActualIdr || amount : amount;
  return {
    id: String(row.id || row._id || '').trim(),
    sessionId: String(
      asRecord(row.session)?.id ||
        asRecord(row.session)?._id ||
        row.session ||
        '',
    ).trim(),
    fromWalletId: String(
      fromWallet?.id || fromWallet?._id || row.fromWallet || '',
    ).trim(),
    fromWalletName: String(fromWallet?.name || '').trim(),
    toWalletId: String(
      toWallet?.id || toWallet?._id || row.toWallet || '',
    ).trim(),
    toWalletName: String(toWallet?.name || '').trim(),
    amount,
    headlineAmount,
    status: normalizeDepositStatus(row.status),
    note: String(row.note || '').trim(),
    source: row.source === 'pos' ? 'pos' : 'admin',
    allocationCount: allocations.length,
    totalExpectedIdr: parseMoneyish(row.totalExpectedIdr),
    totalActualIdr,
    totalShortageIdr: parseMoneyish(row.totalShortageIdr),
    expectedAmount:
      row.expectedAmount == null ? null : Number(row.expectedAmount) || 0,
    shortageIdr:
      row.shortageIdr == null ? null : Number(row.shortageIdr) || 0,
    overageIdr: row.overageIdr == null ? null : Number(row.overageIdr) || 0,
    verifiedAt: stringifyDate(row.verifiedAt),
    createdAt: stringifyDate(row.createdAt),
    raw,
  };
}

function normalizeEntryConfirmStatus(
  value: unknown,
): KolamAdminCashflowEntryConfirmStatus {
  if (
    value === 'unconfirmed' ||
    value === 'confirmed' ||
    value === 'rejected' ||
    value === 'auto_confirmed' ||
    value === 'voided'
  ) {
    return value;
  }
  return 'unconfirmed';
}

function normalizeInvoiceConfirmStatus(
  value: unknown,
): KolamAdminCashflowInvoiceConfirmStatus {
  if (
    value === 'unconfirmed' ||
    value === 'confirmed' ||
    value === 'rejected' ||
    value === 'auto_confirmed' ||
    value === 'partial' ||
    value === 'unknown'
  ) {
    return value;
  }
  return 'unknown';
}

function normalizeDepositStatus(
  value: unknown,
): KolamAdminCashflowDepositStatus {
  if (
    value === 'draft' ||
    value === 'submitted' ||
    value === 'in-review' ||
    value === 'verified' ||
    value === 'rejected' ||
    value === 'voided'
  ) {
    return value;
  }
  return 'submitted';
}

function parseMoneyish(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const record = asRecord(value);
  if (record?.$numberDecimal != null) {
    const parsed = Number(record.$numberDecimal);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
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

/**
 * KPI Tim — FE `/list-of-users/kpi` (plugin `KpiTeamPage`).
 * SoT: DA-KPI-Plugin `pages/team.tsx` + BE `/api/kpi/team/*`.
 */

import {KOLAM_ACTIVE_STAFF_ICON_SVG} from '../assets/icons/active-staff-icon-svg';
import {KOLAM_EVENT_KPI_ICON_SVG} from '../assets/icons/event-kpi-icon-svg';
import {
  hasSettingsPermission,
  isSettingsSuperAdminRoleKey,
  type SettingsTabVisibilityContext,
} from './settings-surface';

export type KolamKpiStatsCardItem = {
  detail: string;
  iconSvg?: string;
  id: string;
  label: string;
  tone: 'default' | 'success' | 'warning' | 'muted';
  value: string;
};

export const KOLAM_KPI_ROOT = '/list-of-users/kpi';

export type KolamKpiTabId = 'ringkasan' | 'review-chat';

export const KOLAM_KPI_TABS: Array<{id: KolamKpiTabId; label: string}> = [
  {id: 'ringkasan', label: 'Ringkasan'},
  {id: 'review-chat', label: 'Review Chat'},
];

export const KOLAM_KPI_DEFAULT_TAB: KolamKpiTabId = 'ringkasan';

export const KOLAM_KPI_PLUGIN_DISABLED = 'Plugin KPI tidak aktif.';
export const KOLAM_KPI_ACCESS_DENIED =
  'Gagal memuat data KPI tim. Periksa izin user:view_by_admin lalu refresh halaman.';

export type KolamKpiPeriodView = 'week' | 'prev_week' | 'month';

export const KOLAM_KPI_PERIOD_OPTIONS: Array<{
  id: KolamKpiPeriodView;
  label: string;
}> = [
  {id: 'week', label: 'Minggu ini'},
  {id: 'prev_week', label: 'Minggu lalu'},
  {id: 'month', label: 'Bulan ini'},
];

export type KolamKpiChartGranularity = 'day' | 'week' | 'month';

export const KOLAM_KPI_GRANULARITY_OPTIONS: Array<{
  id: KolamKpiChartGranularity;
  label: string;
}> = [
  {id: 'day', label: 'Harian'},
  {id: 'week', label: 'Mingguan'},
  {id: 'month', label: 'Bulanan'},
];

export type KolamKpiAccess = {
  canSee: boolean;
  canViewTeam: boolean;
};

export function resolveKolamKpiAccess(
  context: SettingsTabVisibilityContext | null | undefined,
): KolamKpiAccess {
  const isSuperAdmin = isSettingsSuperAdminRoleKey(
    String(context?.roleKey ?? ''),
  );
  const canViewTeam =
    isSuperAdmin ||
    hasSettingsPermission(context, 'user', 'view_by_admin');
  return {
    canSee: canViewTeam,
    canViewTeam,
  };
}

function normalizeKpiPath(route: string): string {
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

export function isKolamKpiRoute(route: string): boolean {
  const path = normalizeKpiPath(route);
  return path === KOLAM_KPI_ROOT || path.startsWith(`${KOLAM_KPI_ROOT}/`);
}

export function getKolamKpiTab(route: string): KolamKpiTabId {
  const query = route.includes('?') ? route.split('?')[1] || '' : '';
  const raw = String(new URLSearchParams(query).get('tab') || '')
    .trim()
    .toLowerCase();
  if (raw === 'review-chat' || raw === 'chatreviews' || raw === 'chat-reviews') {
    return 'review-chat';
  }
  return KOLAM_KPI_DEFAULT_TAB;
}

export function buildKolamKpiRoute(
  tab: KolamKpiTabId = KOLAM_KPI_DEFAULT_TAB,
): string {
  if (tab === KOLAM_KPI_DEFAULT_TAB) {
    return KOLAM_KPI_ROOT;
  }
  return `${KOLAM_KPI_ROOT}?tab=${tab}`;
}

export function buildKolamKpiUserDetailRoute(userId: string): string {
  return `/list-of-users/users/${encodeURIComponent(userId)}`;
}

/** Aligned with BE `kpi-period.utils` / plugin `periodKeysForDate`. */
export function kolamKpiPeriodKeysForDate(date: Date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const start = new Date(Date.UTC(y, d.getUTCMonth(), d.getUTCDate()));
  const dayNum = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - dayNum);
  const wy = start.getUTCFullYear();
  const onejan = new Date(Date.UTC(wy, 0, 1));
  const week = Math.ceil(
    ((start.getTime() - onejan.getTime()) / 86400000 + onejan.getUTCDay() + 1) /
      7,
  );
  return {
    day: `${y}-${m}-${day}`,
    week: `${wy}-W${String(week).padStart(2, '0')}`,
    month: `${y}-${m}`,
    year: String(y),
  };
}

export function kolamKpiPreviousWeekKey(weekKey: string): string {
  const match = String(weekKey || '').match(/^(\d{4})-W(\d{2})$/);
  if (!match) {
    return weekKey;
  }
  const y = Number(match[1]);
  const w = Number(match[2]);
  const anchor = new Date(Date.UTC(y, 0, 4));
  anchor.setUTCDate(anchor.getUTCDate() + (w - 1) * 7 - 7);
  return kolamKpiPeriodKeysForDate(anchor).week;
}

export type KolamKpiTeamQueryParams = {
  period?: 'week' | 'month';
  week?: string;
  month?: string;
};

export function buildKolamKpiTeamPeriodQuery(
  view: KolamKpiPeriodView,
  now: Date = new Date(),
): KolamKpiTeamQueryParams {
  const keys = kolamKpiPeriodKeysForDate(now);
  if (view === 'month') {
    return {period: 'month', month: keys.month};
  }
  if (view === 'prev_week') {
    return {period: 'week', week: kolamKpiPreviousWeekKey(keys.week)};
  }
  return {period: 'week', week: keys.week};
}

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;
const NUMERIC_RE = /^-?\d+(\.\d+)?$/;

export function isKolamKpiObjectIdLike(value?: string | null): boolean {
  const v = value?.trim();
  return Boolean(v && OBJECT_ID_RE.test(v));
}

export function coerceKolamKpiPoints(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.round(value);
  }
  if (typeof value === 'string') {
    const v = value.trim();
    if (isKolamKpiObjectIdLike(v)) {
      return 0;
    }
    if (NUMERIC_RE.test(v)) {
      return Math.round(Number(v));
    }
  }
  return 0;
}

export function formatKolamKpiPoints(value: unknown): string {
  return String(coerceKolamKpiPoints(value));
}

function cleanLabel(value?: string | null): string | undefined {
  const v = value?.trim();
  if (!v || isKolamKpiObjectIdLike(v)) {
    return undefined;
  }
  return v;
}

export type KolamKpiLeaderboardRow = {
  rank: number;
  userId: string;
  name: string;
  displayName: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  employeeNumber: string;
  points: number;
};

export function kolamKpiLeaderboardRowLabel(
  row: Pick<
    KolamKpiLeaderboardRow,
    | 'userId'
    | 'name'
    | 'displayName'
    | 'firstName'
    | 'lastName'
    | 'username'
    | 'email'
    | 'employeeNumber'
  >,
): string {
  const displayName = cleanLabel(row.displayName);
  if (displayName) {
    return displayName;
  }
  const full = `${cleanLabel(row.firstName) ?? ''} ${cleanLabel(row.lastName) ?? ''}`.trim();
  if (full) {
    return full;
  }
  const name = cleanLabel(row.name);
  if (name) {
    return name;
  }
  const username = cleanLabel(row.username);
  if (username) {
    return username;
  }
  const email = cleanLabel(row.email);
  if (email) {
    return email;
  }
  const empNo = row.employeeNumber?.trim();
  if (empNo && !isKolamKpiObjectIdLike(empNo)) {
    return `Staff #${empNo}`;
  }
  return 'Staff';
}

export type KolamKpiTeamSummary = {
  period: 'week' | 'month' | string;
  periodKey: string;
  totalPoints: number;
  weekPoints: number;
  prevWeekPoints: number;
  weekDelta: number;
  activeStaffCount: number;
  eventCount: number;
  topPerformer: KolamKpiLeaderboardRow | null;
};

export type KolamKpiTeamLeaderboard = {
  period: string;
  periodKey: string;
  limit: number;
  rows: KolamKpiLeaderboardRow[];
};

export type KolamKpiChartsData = {
  granularity: KolamKpiChartGranularity | string;
  count: number;
  series: Array<{key: string; label: string; points: number}>;
  breakdown: Array<{ruleKey: string; points: number; count: number}>;
  totalPoints: number;
};

export type KolamKpiChatReviewRow = {
  id: string;
  reviewedAt: string;
  contactLabel: string;
  platform: string;
  conversationStartedAt: string | null;
  rating: number;
  reviewNotes: string;
};

export type KolamKpiChatReviewPage = {
  rows: KolamKpiChatReviewRow[];
  total: number;
  page: number;
  limit: number;
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

function unwrapData(payload: unknown): unknown {
  const record = asRecord(payload);
  if (record && 'data' in record) {
    return record.data;
  }
  return payload;
}

function normalizeLeaderboardRow(raw: unknown): KolamKpiLeaderboardRow | null {
  const row = asRecord(raw);
  if (!row) {
    return null;
  }
  const userId = getString(row, 'userId') || getString(row, '_id');
  if (!userId) {
    return null;
  }
  return {
    rank: coerceKolamKpiPoints(row.rank),
    userId,
    name: getString(row, 'name'),
    displayName: getString(row, 'displayName'),
    firstName: getString(row, 'firstName') || getString(row, 'first_name'),
    lastName: getString(row, 'lastName') || getString(row, 'last_name'),
    username: getString(row, 'username'),
    email: getString(row, 'email'),
    employeeNumber: getString(row, 'employeeNumber'),
    points: coerceKolamKpiPoints(row.points),
  };
}

export function normalizeKolamKpiTeamSummary(
  payload: unknown,
): KolamKpiTeamSummary | null {
  const data = asRecord(unwrapData(payload));
  if (!data) {
    return null;
  }
  return {
    period: getString(data, 'period') || 'week',
    periodKey: getString(data, 'periodKey'),
    totalPoints: coerceKolamKpiPoints(data.totalPoints),
    weekPoints: coerceKolamKpiPoints(data.weekPoints),
    prevWeekPoints: coerceKolamKpiPoints(data.prevWeekPoints),
    weekDelta: coerceKolamKpiPoints(data.weekDelta),
    activeStaffCount: coerceKolamKpiPoints(data.activeStaffCount),
    eventCount: coerceKolamKpiPoints(data.eventCount),
    topPerformer: normalizeLeaderboardRow(data.topPerformer),
  };
}

export function normalizeKolamKpiTeamLeaderboard(
  payload: unknown,
): KolamKpiTeamLeaderboard {
  const data = asRecord(unwrapData(payload));
  const rowsRaw = Array.isArray(data?.rows) ? data!.rows : [];
  return {
    period: getString(data, 'period'),
    periodKey: getString(data, 'periodKey'),
    limit: coerceKolamKpiPoints(data?.limit) || 20,
    rows: rowsRaw
      .map(normalizeLeaderboardRow)
      .filter((row): row is KolamKpiLeaderboardRow => row != null),
  };
}

export function normalizeKolamKpiCharts(
  payload: unknown,
): KolamKpiChartsData | null {
  const data = asRecord(unwrapData(payload));
  if (!data) {
    return null;
  }
  const seriesRaw = Array.isArray(data.series) ? data.series : [];
  const breakdownRaw = Array.isArray(data.breakdown) ? data.breakdown : [];
  return {
    granularity: getString(data, 'granularity') || 'week',
    count: coerceKolamKpiPoints(data.count),
    totalPoints: coerceKolamKpiPoints(data.totalPoints),
    series: seriesRaw
      .map(item => {
        const row = asRecord(item);
        if (!row) {
          return null;
        }
        return {
          key: getString(row, 'key'),
          label: getString(row, 'label'),
          points: coerceKolamKpiPoints(row.points),
        };
      })
      .filter(
        (row): row is {key: string; label: string; points: number} =>
          row != null,
      ),
    breakdown: breakdownRaw
      .map(item => {
        const row = asRecord(item);
        if (!row) {
          return null;
        }
        return {
          ruleKey: getString(row, 'ruleKey'),
          points: coerceKolamKpiPoints(row.points),
          count: coerceKolamKpiPoints(row.count),
        };
      })
      .filter(
        (
          row,
        ): row is {ruleKey: string; points: number; count: number} =>
          row != null,
      ),
  };
}

export function normalizeKolamKpiChatReviewPage(
  payload: unknown,
): KolamKpiChatReviewPage {
  const root = asRecord(payload);
  const list = Array.isArray(root?.data)
    ? root!.data
    : Array.isArray(unwrapData(payload))
      ? (unwrapData(payload) as unknown[])
      : [];

  return {
    page: coerceKolamKpiPoints(root?.page) || 1,
    limit: coerceKolamKpiPoints(root?.limit) || 20,
    total: coerceKolamKpiPoints(root?.total),
    rows: list
      .map(item => {
        const row = asRecord(item);
        if (!row) {
          return null;
        }
        const id = getString(row, 'id') || getString(row, '_id');
        if (!id) {
          return null;
        }
        return {
          id,
          reviewedAt: getString(row, 'reviewedAt'),
          contactLabel: getString(row, 'contactLabel'),
          platform: getString(row, 'platform'),
          conversationStartedAt:
            getString(row, 'conversationStartedAt') || null,
          rating: coerceKolamKpiPoints(row.rating),
          reviewNotes: getString(row, 'reviewNotes'),
        };
      })
      .filter((row): row is KolamKpiChatReviewRow => row != null),
  };
}

export function buildKolamKpiSummaryCards(
  summary: KolamKpiTeamSummary,
): KolamKpiStatsCardItem[] {
  const delta = summary.weekDelta;
  const deltaTone: KolamKpiStatsCardItem['tone'] =
    delta < 0 ? 'warning' : delta > 0 ? 'success' : 'default';
  return [
    {
      id: 'total',
      label: 'Total poin',
      value: formatKolamKpiPoints(summary.totalPoints),
      detail: summary.periodKey || '—',
      tone: 'default',
    },
    {
      id: 'staff',
      label: 'Staff aktif',
      value: formatKolamKpiPoints(summary.activeStaffCount),
      detail: 'Punya poin ≠ 0',
      iconSvg: KOLAM_ACTIVE_STAFF_ICON_SVG,
      tone: 'default',
    },
    {
      id: 'events',
      label: 'Event KPI',
      value: formatKolamKpiPoints(summary.eventCount),
      detail: 'Jumlah baris ledger',
      iconSvg: KOLAM_EVENT_KPI_ICON_SVG,
      tone: 'default',
    },
    {
      id: 'delta',
      label: 'Δ minggu ini',
      value: `${delta > 0 ? '+' : ''}${formatKolamKpiPoints(delta)}`,
      detail: `vs minggu lalu (${formatKolamKpiPoints(summary.prevWeekPoints)})`,
      tone: deltaTone,
    },
  ];
}

export function formatKolamKpiDatetime(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

/** Plugin enabled unless explicitly `enabled === false` (FE opt-out). */
export function isKolamKpiPluginEnabled(
  kolamPlugins: {kpi?: {enabled?: boolean} | null} | null | undefined,
): boolean {
  return kolamPlugins?.kpi?.enabled !== false;
}

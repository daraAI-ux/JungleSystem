import { appConfig } from '../config/app';
import {
  normalizeKolamAdminCashflowActiveProbe,
  normalizeKolamAdminCashflowSession,
  normalizeKolamAdminCashflowSessionList,
  type ActiveAdminCashflowSession,
  type KolamAdminCashflowActiveProbe,
  type KolamAdminCashflowListFilters,
  type KolamAdminCashflowOpenBody,
  type KolamAdminCashflowSession,
} from '../domain/kolam-admin-cashflow-session';
import { apiRequest } from '../lib/api-client';

export type { ActiveAdminCashflowSession };

type ActiveCashflowApiPayload = {
  data?: {
    _id?: string;
    id?: string;
    name?: string;
    source?: 'admin' | 'pos';
    status?: ActiveAdminCashflowSession['status'];
  } | null;
  todaySession?: unknown;
};

/**
 * Admin cashflow window probe — same contract as FE `GET /cashflow/active`.
 * POS shifts are ignored by the header icon (match FE CashflowHeaderIcon).
 */
export async function getActiveAdminCashflowSession(): Promise<ActiveAdminCashflowSession | null> {
  const probe = await getKolamAdminCashflowActiveProbe();
  const active = probe.active;
  if (!active) {
    return null;
  }
  return {
    id: active.id,
    name: active.name,
    source: active.source,
    status: active.status,
  };
}

export async function getKolamAdminCashflowActiveProbe(): Promise<KolamAdminCashflowActiveProbe> {
  const payload = await kolamRequest<ActiveCashflowApiPayload>('/cashflow/active');
  return normalizeKolamAdminCashflowActiveProbe(payload);
}

export async function getKolamAdminCashflowSessions(
  filters: Pick<
    KolamAdminCashflowListFilters,
    'page' | 'limit' | 'status' | 'source'
  >,
) {
  const payload = await kolamRequest<unknown>('/cashflow', {
    query: {
      page: filters.page,
      limit: filters.limit,
      status: filters.status || undefined,
      source: filters.source || undefined,
    },
  });
  return normalizeKolamAdminCashflowSessionList(payload);
}

export async function getKolamAdminCashflowSession(
  id: string,
): Promise<KolamAdminCashflowSession> {
  const payload = await kolamRequest<unknown>(
    `/cashflow/${encodeURIComponent(id)}`,
  );
  const row =
    payload && typeof payload === 'object' && 'data' in (payload as object)
      ? (payload as { data: unknown }).data
      : payload;
  return normalizeKolamAdminCashflowSession(row);
}

export async function openKolamAdminCashflowSession(
  body: KolamAdminCashflowOpenBody,
): Promise<KolamAdminCashflowSession> {
  const payload: Record<string, string> = {};
  if (body.name?.trim()) {
    payload.name = body.name.trim();
  }
  if (body.windowStart?.trim()) {
    payload.windowStart = body.windowStart.trim();
  }
  if (body.windowEnd?.trim()) {
    payload.windowEnd = body.windowEnd.trim();
  }

  const response = await kolamRequest<{ data?: unknown; message?: string }>(
    '/cashflow/session/open',
    {
      method: 'POST',
      body: payload,
    },
  );

  return normalizeKolamAdminCashflowSession(response?.data ?? response);
}

export function getAdminCashflowHeaderRoute(
  session: ActiveAdminCashflowSession | null,
): string {
  if (!session) {
    return '/cashflow-session/create';
  }

  if (session.status === 'open' || session.status === 'locked') {
    return `/cashflow-session/${encodeURIComponent(session.id)}`;
  }

  return '/cashflow-session/create';
}

function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    query?: Record<string, string | number | boolean | undefined | null>;
    body?: unknown;
  } = {},
) {
  return apiRequest<T>({
    method: options.method ?? 'GET',
    path,
    query: options.query,
    body: options.body,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });
}

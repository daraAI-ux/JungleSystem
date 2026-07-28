import { appConfig } from '../config/app';
import {
  normalizeKolamAdminCashflowActiveProbe,
  normalizeKolamAdminCashflowConfirmAllResult,
  normalizeKolamAdminCashflowDeposits,
  normalizeKolamAdminCashflowInvoiceGroups,
  normalizeKolamAdminCashflowRecheckResult,
  normalizeKolamAdminCashflowReviewEntries,
  normalizeKolamAdminCashflowSession,
  normalizeKolamAdminCashflowSessionList,
  type ActiveAdminCashflowSession,
  type KolamAdminCashflowActiveProbe,
  type KolamAdminCashflowConfirmAllResult,
  type KolamAdminCashflowDeposit,
  type KolamAdminCashflowInvoiceGroup,
  type KolamAdminCashflowListFilters,
  type KolamAdminCashflowOpenBody,
  type KolamAdminCashflowRecheckResult,
  type KolamAdminCashflowReviewEntry,
  type KolamAdminCashflowSession,
  type KolamAdminCashflowSubmitDirectAllocation,
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

export async function closeKolamAdminCashflowSession(
  id: string,
): Promise<KolamAdminCashflowSession> {
  const response = await kolamRequest<{ data?: unknown }>(
    `/cashflow/session/${encodeURIComponent(id)}/close`,
    { method: 'POST' },
  );
  return normalizeKolamAdminCashflowSession(response?.data ?? response);
}

export async function voidKolamAdminCashflowSession(
  id: string,
  reason: string,
): Promise<{ rejectedTransactionsCount: number; session: KolamAdminCashflowSession | null }> {
  const response = await kolamRequest<{
    data?: {
      _id?: string;
      status?: string;
      rejectedTransactionsCount?: number;
    };
  }>(`/cashflow/session/${encodeURIComponent(id)}/void`, {
    method: 'POST',
    body: { reason },
  });
  const data = response?.data;
  return {
    rejectedTransactionsCount: Number(data?.rejectedTransactionsCount) || 0,
    session: data ? normalizeKolamAdminCashflowSession(data) : null,
  };
}

export async function recheckKolamAdminCashflowSession(
  id: string,
): Promise<KolamAdminCashflowRecheckResult> {
  const response = await kolamRequest<unknown>(
    `/cashflow/session/${encodeURIComponent(id)}/recheck`,
    { method: 'POST' },
  );
  return normalizeKolamAdminCashflowRecheckResult(response);
}

export async function getKolamAdminCashflowReview(
  id: string,
): Promise<KolamAdminCashflowReviewEntry[]> {
  const payload = await kolamRequest<unknown>(
    `/cashflow/${encodeURIComponent(id)}/review`,
  );
  return normalizeKolamAdminCashflowReviewEntries(payload);
}

export async function getKolamAdminCashflowByInvoice(
  id: string,
): Promise<KolamAdminCashflowInvoiceGroup[]> {
  const payload = await kolamRequest<unknown>(
    `/cashflow/${encodeURIComponent(id)}/by-invoice`,
  );
  return normalizeKolamAdminCashflowInvoiceGroups(payload);
}

export async function confirmKolamAdminCashflowInvoice(
  sessionId: string,
  saleId: string,
): Promise<{ confirmedCount: number }> {
  const response = await kolamRequest<{
    data?: { confirmedCount?: number };
  }>(
    `/cashflow/${encodeURIComponent(sessionId)}/invoices/${encodeURIComponent(
      saleId,
    )}/confirm`,
    { method: 'POST' },
  );
  return {
    confirmedCount: Number(response?.data?.confirmedCount) || 0,
  };
}

export async function rejectKolamAdminCashflowInvoice(
  sessionId: string,
  saleId: string,
  note: string,
): Promise<{ rejectedCount: number }> {
  const response = await kolamRequest<{
    data?: { rejectedCount?: number };
  }>(
    `/cashflow/${encodeURIComponent(sessionId)}/invoices/${encodeURIComponent(
      saleId,
    )}/reject`,
    {
      method: 'POST',
      body: { note },
    },
  );
  return {
    rejectedCount: Number(response?.data?.rejectedCount) || 0,
  };
}

export async function confirmAllKolamAdminCashflowTransactions(
  sessionId: string,
): Promise<KolamAdminCashflowConfirmAllResult> {
  const response = await kolamRequest<unknown>(
    `/cashflow/${encodeURIComponent(sessionId)}/confirm-all`,
    { method: 'POST' },
  );
  return normalizeKolamAdminCashflowConfirmAllResult(response);
}

export async function getKolamAdminCashflowDeposits(
  sessionId: string,
): Promise<KolamAdminCashflowDeposit[]> {
  const payload = await kolamRequest<unknown>('/cashflow/deposits', {
    query: {
      session: sessionId,
      limit: 100,
      page: 1,
    },
  });
  return normalizeKolamAdminCashflowDeposits(payload);
}

export async function submitKolamAdminCashflowDirectDeposit(input: {
  sessionId: string;
  fromWallet: string;
  toWallet: string;
  allocations: KolamAdminCashflowSubmitDirectAllocation[];
  note?: string;
}): Promise<KolamAdminCashflowDeposit | null> {
  const formData = new FormData();
  formData.append('fromWallet', input.fromWallet);
  formData.append('toWallet', input.toWallet);
  formData.append('allocations', JSON.stringify(input.allocations));
  if (input.note?.trim()) {
    formData.append('note', input.note.trim());
  }

  const response = await kolamRequest<{ data?: unknown }>(
    `/cashflow/${encodeURIComponent(input.sessionId)}/deposits/submit-direct`,
    {
      method: 'POST',
      body: formData,
    },
  );
  const row = response?.data;
  if (!row) {
    return null;
  }
  const deposits = normalizeKolamAdminCashflowDeposits({ data: [row] });
  return deposits[0] ?? null;
}

export async function verifyKolamAdminCashflowDeposit(input: {
  sessionId: string;
  depositId: string;
  source?: 'admin' | 'pos';
  shortageResponsibility?: string | null;
  shortageNote?: string | null;
}): Promise<KolamAdminCashflowDeposit | null> {
  if (input.source === 'pos') {
    const response = await kolamRequest<{ data?: unknown }>(
      `/pos/cashflow/deposits/${encodeURIComponent(input.depositId)}/verify`,
      { method: 'POST' },
    );
    const deposits = normalizeKolamAdminCashflowDeposits({
      data: [response?.data],
    });
    return deposits[0] ?? null;
  }

  const body: Record<string, string | null> = {};
  if (input.shortageResponsibility !== undefined) {
    body.shortageResponsibility = input.shortageResponsibility;
  }
  if (input.shortageNote !== undefined) {
    body.shortageNote = input.shortageNote;
  }

  const response = await kolamRequest<{ data?: unknown }>(
    `/cashflow/${encodeURIComponent(input.sessionId)}/deposits/${encodeURIComponent(
      input.depositId,
    )}/verify`,
    {
      method: 'POST',
      body: Object.keys(body).length > 0 ? body : undefined,
    },
  );
  const deposits = normalizeKolamAdminCashflowDeposits({
    data: [response?.data],
  });
  return deposits[0] ?? null;
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

import { appConfig } from '../config/app';
import { apiRequest } from '../lib/api-client';

export type AdminCashflowSessionStatus =
  | 'open'
  | 'locked'
  | 'in-review'
  | 'verified';

export type ActiveAdminCashflowSession = {
  id: string;
  name?: string;
  source?: 'admin' | 'pos';
  status: AdminCashflowSessionStatus;
};

type ActiveCashflowApiPayload = {
  data?: {
    _id?: string;
    id?: string;
    name?: string;
    source?: 'admin' | 'pos';
    status?: AdminCashflowSessionStatus;
  } | null;
  todaySession?: unknown;
};

/**
 * Admin cashflow window probe — same contract as FE `GET /cashflow/active`.
 * POS shifts are ignored by the header icon (match FE CashflowHeaderIcon).
 */
export async function getActiveAdminCashflowSession(): Promise<ActiveAdminCashflowSession | null> {
  const payload = await apiRequest<ActiveCashflowApiPayload>({
    method: 'GET',
    path: '/cashflow/active',
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  const raw = payload?.data;
  if (!raw) {
    return null;
  }

  const id = String(raw.id || raw._id || '').trim();
  if (!id || !raw.status) {
    return null;
  }

  if (raw.source && raw.source !== 'admin') {
    return null;
  }

  return {
    id,
    name: raw.name,
    source: raw.source ?? 'admin',
    status: raw.status,
  };
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

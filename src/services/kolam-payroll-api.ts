import { appConfig } from '../config/app';
import {
  normalizeKolamPayrollPeriodDetail,
  normalizeKolamPayrollPeriodList,
  normalizeKolamPayrollSlip,
  type KolamPayrollPeriod,
  type KolamPayrollPeriodDetail,
  type KolamPayrollSlip,
} from '../domain/kolam-payroll';
import { apiRequest } from '../lib/api-client';

export async function fetchKolamPayrollPeriods(): Promise<KolamPayrollPeriod[]> {
  const payload = await kolamRequest<unknown>('/payroll/periods');
  return normalizeKolamPayrollPeriodList(payload);
}

export async function fetchKolamPayrollPeriod(
  periodKey: string,
): Promise<KolamPayrollPeriodDetail | null> {
  const payload = await kolamRequest<unknown>(
    `/payroll/periods/${encodeURIComponent(periodKey)}`,
  );
  return normalizeKolamPayrollPeriodDetail(payload);
}

export async function createKolamPayrollPeriod(body: {
  year: number;
  month: number;
  walletId?: string;
}): Promise<KolamPayrollPeriod | null> {
  const payload = await kolamRequest<unknown>('/payroll/periods', {
    method: 'POST',
    body,
  });
  const rows = normalizeKolamPayrollPeriodList({ data: [unwrapRow(payload)] });
  return rows[0] ?? null;
}

export async function setKolamPayrollPeriodWallet(input: {
  periodKey: string;
  walletId: string;
}): Promise<KolamPayrollPeriod | null> {
  const payload = await kolamRequest<unknown>(
    `/payroll/periods/${encodeURIComponent(input.periodKey)}/wallet`,
    {
      method: 'PUT',
      body: { walletId: input.walletId },
    },
  );
  const rows = normalizeKolamPayrollPeriodList({ data: [unwrapRow(payload)] });
  return rows[0] ?? null;
}

export async function generateAllKolamPayrollSlips(input: {
  periodKey: string;
  withAi?: boolean;
}): Promise<void> {
  await kolamRequest(
    `/payroll/periods/${encodeURIComponent(input.periodKey)}/generate-all`,
    {
      method: 'POST',
      body: { withAi: Boolean(input.withAi) },
    },
  );
}

export async function generateKolamPayrollSlip(input: {
  periodKey: string;
  userId: string;
  withAi?: boolean;
}): Promise<KolamPayrollSlip | null> {
  const payload = await kolamRequest<unknown>(
    `/payroll/periods/${encodeURIComponent(input.periodKey)}/generate/${encodeURIComponent(input.userId)}`,
    {
      method: 'POST',
      body: { withAi: Boolean(input.withAi) },
    },
  );
  return normalizeKolamPayrollSlip(unwrapRow(payload));
}

export async function finalizeKolamPayrollPeriod(input: {
  periodKey: string;
  walletId?: string;
}): Promise<void> {
  await kolamRequest(
    `/payroll/periods/${encodeURIComponent(input.periodKey)}/finalize`,
    {
      method: 'POST',
      body: input.walletId ? { walletId: input.walletId } : {},
    },
  );
}

export async function fetchKolamPayrollSlip(
  slipId: string,
): Promise<KolamPayrollSlip | null> {
  const payload = await kolamRequest<unknown>(
    `/payroll/slips/${encodeURIComponent(slipId)}`,
  );
  return normalizeKolamPayrollSlip(unwrapRow(payload));
}

export async function refreshKolamPayrollPph21Ai(
  slipId: string,
): Promise<KolamPayrollSlip | null> {
  const payload = await kolamRequest<unknown>(
    `/payroll/slips/${encodeURIComponent(slipId)}/pph21-ai`,
    { method: 'POST' },
  );
  return normalizeKolamPayrollSlip(unwrapRow(payload));
}

function unwrapRow(payload: unknown): unknown {
  if (payload && typeof payload === 'object' && 'data' in (payload as object)) {
    return (payload as { data: unknown }).data;
  }
  return payload;
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

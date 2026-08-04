import { appConfig } from '../config/app';
import {
  normalizeKolamFinanceSummary,
  type KolamFinanceRange,
  type KolamFinanceSummaryData,
} from '../domain/kolam-finance-summary';
import { apiRequest } from '../lib/api-client';

export type KolamFinanceSummaryQuery = {
  range?: KolamFinanceRange;
  startDate?: string;
  endDate?: string;
};

export async function fetchKolamFinanceSummary(
  query: KolamFinanceSummaryQuery = { range: 'month' },
): Promise<KolamFinanceSummaryData> {
  const params: Record<string, string> = {};
  if (query.range && query.range !== 'custom') {
    params.range = query.range;
  }
  if (query.range === 'custom') {
    params.range = 'custom';
    if (query.startDate?.trim()) {
      params.startDate = query.startDate.trim();
    }
    if (query.endDate?.trim()) {
      params.endDate = query.endDate.trim();
    }
  }

  const payload = await kolamRequest<unknown>('/finance-summary', {
    query: params,
  });
  return normalizeKolamFinanceSummary(payload);
}

export async function confirmKolamFinanceCashflowTransaction(
  sessionId: string,
  trxId: string,
): Promise<void> {
  await kolamRequest(
    `/cashflow/${encodeURIComponent(sessionId)}/transactions/${encodeURIComponent(
      trxId,
    )}/confirm`,
    { method: 'POST' },
  );
}

export async function confirmKolamFinanceWalletTransaction(
  trxId: string,
  confirmNote?: string,
): Promise<void> {
  await kolamRequest(
    `/wallet-transaction/${encodeURIComponent(trxId)}/confirm`,
    {
      method: 'PUT',
      body: confirmNote ? { confirmNote } : {},
    },
  );
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

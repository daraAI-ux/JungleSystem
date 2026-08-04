import {appConfig} from '../config/app';
import {
  normalizeKolamDaraTaxSettlement,
  normalizeKolamDaraTaxSettlementList,
  type KolamDaraTaxSettlement,
  type KolamDaraTaxSettlementType,
} from '../domain/kolam-dara-tax-settlement';
import {apiRequest} from '../lib/api-client';
import {getKolamWalletOptions} from './kolam-wallet-option-api';

type QueryValue = string | number | boolean | undefined | null;

interface DataResponse<T> {
  data: T;
}

/** GET /tax-settlement */
export async function listKolamDaraTaxSettlements(params?: {
  limit?: number;
}): Promise<KolamDaraTaxSettlement[]> {
  const payload = await kolamRequest<unknown>('/tax-settlement', {
    query: {limit: params?.limit ?? 50},
  });
  return normalizeKolamDaraTaxSettlementList(payload);
}

/** POST /tax-settlement */
export async function createKolamDaraTaxSettlement(body: {
  taxType: KolamDaraTaxSettlementType;
  title: string;
  amount: number;
  walletId: string;
  periodKey?: string;
  note?: string;
}): Promise<KolamDaraTaxSettlement | null> {
  const payload = await kolamRequest<unknown>('/tax-settlement', {
    method: 'POST',
    body,
  });
  const root =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {};
  const data =
    root.data && typeof root.data === 'object' && !Array.isArray(root.data)
      ? root.data
      : payload;
  return normalizeKolamDaraTaxSettlement(data);
}

/** PUT /tax-settlement/:id/verify */
export async function verifyKolamDaraTaxSettlement(id: string): Promise<void> {
  await kolamRequest(`/tax-settlement/${encodeURIComponent(id)}/verify`, {
    method: 'PUT',
  });
}

/** GET /wallet — FE `listWalletsForSettlement`. */
export async function listKolamDaraTaxSettlementWallets(): Promise<
  Array<{id: string; name: string}>
> {
  const rows = await getKolamWalletOptions();
  return rows.map(row => ({id: row.id, name: row.name}));
}

function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    query?: Record<string, QueryValue>;
    body?: unknown;
  } = {},
) {
  return apiRequest<T | DataResponse<T>>({
    method: options.method ?? 'GET',
    path,
    query: options.query,
    body: options.body,
    baseUrl: appConfig.kolamApiBaseUrl,
  });
}

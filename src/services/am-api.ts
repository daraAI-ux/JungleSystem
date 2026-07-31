import {appConfig} from '../config/app';
import {apiRequest} from '../lib/api-client';

type AmQueryValue = string | number | boolean | string[] | undefined | null;

export interface AmDashboardSummary {
  totalBalance: number;
  totalAccounts: number;
  todayIncoming: {total: number; count: number};
  todayOutgoing: {total: number; count: number};
  activeDevices: number;
}

export interface AmTransferStats {
  pending: number;
  processing: number;
  success: number;
  failed: number;
  totalAmount: number;
}

export interface AmDashboardChartPoint {
  date: string;
  incoming: number;
  outgoing: number;
}

export interface AmDashboardDevice {
  _id: string;
  name: string;
  udid: string;
  brand: string;
  model: string;
  boxName: string | null;
  rackName: string | null;
  accountCount: number;
  activeAccountCount: number;
  accountTypes: string[];
}

export interface AmDashboardData {
  summary: AmDashboardSummary;
  transfers: AmTransferStats;
  recentTransfers: unknown[];
  recentMutasi: unknown[];
  chartData: AmDashboardChartPoint[];
  devices: AmDashboardDevice[];
}

export type AmTaskType =
  | 'stock_sync'
  | 'process_sale'
  | 'send_message'
  | 'bank_transfer';

export type AmTaskStatus =
  | 'pending'
  | 'queued'
  | 'processing'
  | 'success'
  | 'failed'
  | 'cancelled';

export interface AmTaskRef {
  _id: string;
  name?: string;
  label?: string;
  username?: string;
  platform?: string;
  connectionType?: string;
}

export interface AmTask {
  _id: string;
  type: AmTaskType | string;
  status: AmTaskStatus | string;
  priority: number;
  deviceId: AmTaskRef | null;
  serviceAccountId: AmTaskRef | null;
  payload: Record<string, unknown>;
  result: Record<string, unknown>;
  error: string;
  logs: string[];
  retryCount: number;
  maxRetries: number;
  startedAt: string | null;
  completedAt: string | null;
  createdBy: AmTaskRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface AmListMeta {
  total: number;
  page?: number;
  limit: number;
  totalPages?: number;
}

export interface AmListResponse<T> {
  data: T[];
  meta: AmListMeta;
}

export interface AmTaskQuery extends Record<string, AmQueryValue> {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  deviceId?: string;
  serviceAccountId?: string;
  search?: string;
}

interface AmEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: AmListMeta;
}

export async function getAmDashboard(
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmDashboardData> {
  return amGet<AmDashboardData>('/dashboard', undefined, baseUrl);
}

export async function getAmTasks(
  query?: AmTaskQuery,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmListResponse<AmTask>> {
  const response = await amGet<AmTask[] | AmListResponse<AmTask>>(
    '/task',
    query,
    baseUrl,
  );

  if (Array.isArray(response)) {
    return {
      data: response,
      meta: {
        total: response.length,
        limit: query?.limit ?? response.length,
        page: query?.page ?? 1,
      },
    };
  }

  return response;
}

async function amGet<T>(
  path: string,
  query?: Record<string, AmQueryValue>,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<T> {
  if (!baseUrl) {
    throw new Error('URL server AM existing belum dikonfigurasi.');
  }

  const response = await apiRequest<AmEnvelope<T> | T>({
    method: 'GET',
    path,
    query,
    baseUrl,
    sourceHeader: appConfig.amSourceHeader,
    cookieJar: true,
    credentials: 'include',
  });

  return unwrapAmResponse(response);
}

function unwrapAmResponse<T>(response: AmEnvelope<T> | T): T {
  if (response === null) {
    throw new Error('AM API mengembalikan payload kosong.');
  }

  if (isAmEnvelope(response)) {
    if (!response.success) {
      throw new Error(response.message ?? 'AM API mengembalikan status gagal.');
    }

    const data = response.data;

    if (
      response.meta &&
      Array.isArray(data) &&
      !('meta' in (data as unknown as Record<string, unknown>))
    ) {
      return {
        data,
        meta: response.meta,
      } as T;
    }

    return data;
  }

  return response;
}

function isAmEnvelope<T>(
  response: AmEnvelope<T> | T | null,
): response is AmEnvelope<T> {
  if (!response || typeof response !== 'object') {
    return false;
  }

  return 'success' in response && 'data' in response;
}

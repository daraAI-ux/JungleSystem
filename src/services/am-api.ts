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

export type AmPlatform =
  | 'whatsapp'
  | 'tokopedia'
  | 'shopee'
  | 'bca'
  | 'brimo'
  | 'dana'
  | 'tiktok'
  | 'instagram';

export type AmServiceAccountStatus = 'active' | 'inactive' | 'blocked';

export interface AmServiceAccountDeviceRef {
  _id: string;
  name: string;
  connectionType?: string;
  tcpAddress?: string | null;
  udid?: string | null;
  boxId?: AmBoxRef | null;
}

export interface AmServiceAccount {
  _id: string;
  platform: AmPlatform | string;
  label: string;
  deviceId: AmServiceAccountDeviceRef | string | null;
  status: AmServiceAccountStatus | string;
  username?: string;
  accountNumber?: string;
  balance?: number;
  credentials: Record<string, unknown>;
  meta: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AmRack {
  _id: string;
  name: string;
  slug: string;
  location: string;
  description: string;
  status: 'active' | 'inactive' | string;
  serverIp: string;
  boxCount?: number;
  deviceCount?: number;
  addedBy?: {_id: string; fullName: string} | string;
  createdAt: string;
  updatedAt: string;
}

export interface AmRackRef {
  _id: string;
  name: string;
}

export interface AmBoxRef {
  _id: string;
  name: string;
  rackId?: AmRackRef | null;
}

export interface AmBox {
  _id: string;
  name: string;
  slug: string;
  rackId: string | AmRackRef;
  description: string;
  status: 'active' | 'inactive' | string;
  deviceCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AmDevice {
  _id: string;
  name: string;
  slug: string;
  boxId: string | AmBoxRef;
  connectionType?: 'usb' | 'tcp' | 'browser' | string;
  udid?: string | null;
  tcpAddress?: string | null;
  brand: string;
  model: string;
  systemPort?: number;
  appiumPort?: number;
  adbPort?: number;
  adbStatus?: 'connected' | 'disconnected' | 'unauthorized' | string;
  adbCheckedAt?: string;
  createdAt: string;
  updatedAt: string;
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

export interface AmServiceAccountQuery extends Record<string, AmQueryValue> {
  page?: number;
  limit?: number;
  platform?: string;
  status?: string;
  deviceId?: string;
  search?: string;
}

export interface AmRackQuery extends Record<string, AmQueryValue> {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  status?: string;
}

export interface AmBoxQuery extends Record<string, AmQueryValue> {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  rackId?: string;
  status?: string;
}

export interface AmDeviceQuery extends Record<string, AmQueryValue> {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  boxId?: string;
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

export async function getAmServiceAccounts(
  query?: AmServiceAccountQuery,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmListResponse<AmServiceAccount>> {
  return getAmList<AmServiceAccount>('/service-account', query, baseUrl);
}

export async function getAmRacks(
  query?: AmRackQuery,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmListResponse<AmRack>> {
  return getAmList<AmRack>('/rack', query, baseUrl);
}

export async function getAmBoxes(
  query?: AmBoxQuery,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmListResponse<AmBox>> {
  return getAmList<AmBox>('/box', query, baseUrl);
}

export async function getAmDevices(
  query?: AmDeviceQuery,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmListResponse<AmDevice>> {
  return getAmList<AmDevice>('/device', query, baseUrl);
}

async function getAmList<T>(
  path: string,
  query?: Record<string, AmQueryValue>,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmListResponse<T>> {
  const response = await amGet<T[] | AmListResponse<T>>(path, query, baseUrl);

  if (Array.isArray(response)) {
    return {
      data: response,
      meta: {
        total: response.length,
        limit: typeof query?.limit === 'number' ? query.limit : response.length,
        page: typeof query?.page === 'number' ? query.page : 1,
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

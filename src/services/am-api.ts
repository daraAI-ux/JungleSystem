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

export interface AmDeviceServiceLog {
  ts: string;
  level: string;
  message: string;
}

export interface AmDeviceServiceLogsResponse {
  logs: AmDeviceServiceLog[];
  processRunning: boolean;
  total?: number;
  page?: number;
}

export type AmTransferStatus = 'pending' | 'processing' | 'success' | 'failed';
export type AmTransferType = 'transfer' | 'virtual-account';
export type AmMutasiType = 'masuk' | 'keluar';
export type AmActivityLogType = 'api' | 'page';
export type AmActivityLogStatus = 'success' | 'failed';

export interface AmBankAccountRef {
  _id: string;
  label: string;
  platform: 'bca' | 'brimo' | string;
  accountNumber?: string;
  username?: string;
}

export interface AmTransfer {
  _id: string;
  accountId: AmBankAccountRef | string;
  deviceId: AmServiceAccountDeviceRef | string;
  transferType: AmTransferType | string;
  transferMethod: string | null;
  transactionPurpose: string | null;
  fee: number;
  recipientAccount: string;
  recipientName: string;
  recipientBank: string | null;
  amount: number;
  status: AmTransferStatus | string;
  startedAt: string | null;
  completedAt: string | null;
  error: string;
  screenshot: string;
  logs: string[];
  createdBy: {_id: string; fullName: string; username: string} | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AmMutasi {
  _id: string;
  accountId: AmBankAccountRef | string;
  deviceId: AmServiceAccountDeviceRef | string;
  type: AmMutasiType | string;
  amount: number;
  description: string;
  transferId:
    | {
        _id: string;
        recipientAccount: string;
        recipientName: string;
        recipientBank: string;
        amount: number;
        status: string;
      }
    | string
    | null;
  notificationHash: string | null;
  detectedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AmMutasiSummary {
  masuk: {total: number; count: number};
  keluar: {total: number; count: number};
}

export interface AmRole {
  _id: string;
  name: string;
  permissions: string[];
  description: string;
}

export interface AmUser {
  _id: string;
  fullName: string;
  username: string;
  role?: AmRole;
}

export interface AmActivityLog {
  _id: string;
  timestamp: string;
  userId: {_id: string; username: string; fullName: string} | null;
  username: string | null;
  type: AmActivityLogType | string;
  action: string;
  method: string;
  path: string;
  ip: string;
  userAgent: string;
  status: AmActivityLogStatus | string;
  statusCode: number;
  duration: number;
  metadata: Record<string, unknown>;
  error: string;
}

export interface AmActivityLogStats {
  since: string;
  days: number;
  byType: Array<{_id: AmActivityLogType | string; count: number}>;
  byStatus: Array<{_id: AmActivityLogStatus | string; count: number}>;
  topUsers: Array<{_id: string; count: number}>;
  topPaths: Array<{_id: string; count: number}>;
}

export interface AmWebhookConfig {
  _id: string;
  url: string;
  events: string[];
  hasSecret?: boolean;
  secretMasked?: string;
  status: 'active' | 'inactive' | string;
  description: string;
  lastDeliveredAt: string | null;
  failCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AmWebhookLog {
  _id: string;
  configId: {_id: string; url: string; description: string} | null;
  direction: 'incoming' | 'outgoing' | string;
  event: string;
  url: string;
  requestBody: Record<string, unknown>;
  responseStatus: number | null;
  responseBody: unknown;
  success: boolean;
  error: string;
  duration: number;
  createdAt: string;
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

export interface AmDeviceServiceLogsQuery extends Record<string, AmQueryValue> {
  limit?: number;
  source?: 'realtime' | 'history';
  page?: number;
}

export interface AmTransferQuery extends Record<string, AmQueryValue> {
  accountId?: string;
  serviceAccountId?: string;
  deviceId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface AmMutasiQuery extends Record<string, AmQueryValue> {
  accountId?: string;
  deviceId?: string;
  type?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface AmUserQuery extends Record<string, AmQueryValue> {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface AmActivityLogQuery extends Record<string, AmQueryValue> {
  page?: number;
  limit?: number;
  userId?: string;
  type?: string;
  action?: string;
  method?: string;
  status?: string;
  from?: string;
  to?: string;
  search?: string;
}

export interface AmWebhookLogQuery extends Record<string, AmQueryValue> {
  direction?: string;
  event?: string;
  configId?: string;
  page?: number;
  limit?: number;
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

export async function getAmDeviceServiceLogs(
  deviceId: string,
  query?: AmDeviceServiceLogsQuery,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmDeviceServiceLogsResponse> {
  return amGet<AmDeviceServiceLogsResponse>(
    `/device/${deviceId}/service/logs`,
    query,
    baseUrl,
  );
}

export async function getAmTransfers(
  query?: AmTransferQuery,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmListResponse<AmTransfer>> {
  return getAmList<AmTransfer>('/transfer', query, baseUrl);
}

export async function getAmMutasi(
  query?: AmMutasiQuery,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmListResponse<AmMutasi>> {
  return getAmList<AmMutasi>('/mutasi', query, baseUrl);
}

export async function getAmMutasiSummary(
  accountId?: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmMutasiSummary> {
  return amGet<AmMutasiSummary>(
    '/mutasi/summary',
    accountId ? {accountId} : undefined,
    baseUrl,
  );
}

export async function getAmUsers(
  query?: AmUserQuery,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmListResponse<AmUser>> {
  return getAmList<AmUser>('/users', query, baseUrl);
}

export async function getAmRoles(
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmRole[]> {
  return amGet<AmRole[]>('/roles', undefined, baseUrl);
}

export async function getAmActivityLogs(
  query?: AmActivityLogQuery,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmListResponse<AmActivityLog>> {
  return getAmList<AmActivityLog>('/activity-log', query, baseUrl);
}

export async function getAmActivityLogStats(
  days = 7,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmActivityLogStats> {
  return amGet<AmActivityLogStats>('/activity-log/stats', {days}, baseUrl);
}

export async function getAmWebhookConfigs(
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmListResponse<AmWebhookConfig>> {
  return getAmList<AmWebhookConfig>('/webhook/config', undefined, baseUrl);
}

export async function getAmWebhookLogs(
  query?: AmWebhookLogQuery,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmListResponse<AmWebhookLog>> {
  return getAmList<AmWebhookLog>('/webhook/logs', query, baseUrl);
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

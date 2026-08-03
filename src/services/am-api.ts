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
  recentTransfers: AmTransfer[];
  recentMutasi: AmMutasi[];
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
  email?: string;
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

export interface AmTaskPayload {
  type: AmTaskType | string;
  deviceId?: string;
  serviceAccountId?: string;
  payload?: Record<string, unknown>;
  priority?: number;
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

export interface AmServiceAccountPayload {
  platform?: AmPlatform | string;
  label?: string;
  deviceId?: string | null;
  username?: string;
  password?: string;
  pin?: string;
  accountNumber?: string;
  credentials?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  status?: AmServiceAccountStatus | string;
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

export interface AmRackPayload {
  location?: string;
  description?: string;
  serverIp?: string;
  status?: 'active' | 'inactive';
}

export interface AmRackRef {
  _id: string;
  name: string;
  serverIp?: string | null;
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

export interface AmBoxPayload {
  rackId?: string;
  description?: string;
  status?: 'active' | 'inactive';
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
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AmDevicePayload {
  boxId?: string;
  connectionType?: 'usb' | 'tcp' | 'browser';
  udid?: string;
  tcpAddress?: string;
  adbPort?: number;
  appiumPort?: number;
  brand?: string;
  model?: string;
  tags?: string[];
}

export type AmDeviceAdbStatusMap = Record<string, AmDevice['adbStatus']>;

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
  limit?: number;
}

export interface AmDeviceServiceStatus {
  serviceAccountId: string;
  label: string;
  platform: string;
  accountNumber: string;
  serviceStatus: string;
  taskStatus: string;
  processRunning: boolean | null;
  isBanking: boolean;
}

export type AmServiceInputType = 'otp' | 'password' | string;

export interface AmClearServiceAccountSessionResult {
  stopped: boolean;
  deleted: string[];
  missing: string[];
}

export type AmTokopediaSessionStatus = 'missing' | 'empty' | 'ready' | 'expired';

export interface AmTokopediaSessionInfo {
  status: AmTokopediaSessionStatus;
  cookieCount: number;
  expiredCount: number;
  sessionCookieCount: number;
  updatedAt: string | null;
  hasFingerprint: boolean;
  serviceStatus: string;
  hasDevice: boolean;
  captchaAutoSolve: boolean;
  hasAnthropicApiKey: boolean;
  anthropicApiKeyPreview: string | null;
  envFallbackAvailable: boolean;
  qrTiktokLogin: boolean;
  loginFillOnly: boolean;
}

export interface AmTokopediaVerifyResult {
  loggedIn: boolean;
  reason: string | null;
  cookieCount: number;
  url: string;
}

export type AmTokopediaApiMonitorStatus =
  | 'idle'
  | 'running'
  | 'success'
  | 'failed'
  | 'needs_manual';

export interface AmTokopediaApiMonitorJob {
  status: AmTokopediaApiMonitorStatus;
  message: string;
  startedAt?: string;
  finishedAt?: string | null;
  loggedIn?: boolean;
  cookieCount?: number;
  apiCallCount?: number;
  fillLogin?: boolean;
  needsManual?: boolean;
  restarted?: boolean;
  wasRunning?: boolean;
}

export type AmTransferStatus = 'pending' | 'processing' | 'success' | 'failed';
export type AmTransferType = 'transfer' | 'virtual-account';
export type AmMutasiType = 'masuk' | 'keluar';
export type AmActivityLogType = 'api' | 'page';
export type AmActivityLogStatus = 'success' | 'failed';
export type AmChatPlatform =
  | 'whatsapp'
  | 'tokopedia'
  | 'shopee'
  | 'tiktok'
  | 'instagram';

export interface AmBankAccountRef {
  _id: string;
  label: string;
  platform: 'bca' | 'brimo' | string;
  accountNumber?: string;
  username?: string;
  name?: string;
  type?: string;
  account_number?: string;
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

export interface AmTransferPayload {
  accountId?: string;
  transferType?: AmTransferType;
  transferMethod?: string;
  transactionPurpose?: string;
  recipientAccount: string;
  recipientName?: string;
  recipientBank?: string;
  amount?: number;
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
  receiptFile?: string | null;
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
  createdAt?: string;
  updatedAt?: string;
}

export type AmCurrentUser = AmUser;

export interface AmUserPayload {
  fullName?: string;
  username?: string;
  password?: string;
  role?: string;
}

export interface AmLoginPayload {
  username: string;
  password: string;
}

export interface AmLoginResponse {
  user: AmCurrentUser;
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

export interface AmActivityLogBulkDeletePayload {
  confirm: true;
  ids?: string[];
  filter?: Omit<AmActivityLogQuery, 'page' | 'limit'>;
}

export interface AmActivityLogBulkDeleteResult {
  deletedCount: number;
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

export interface AmWebhookTestPingResult {
  success: boolean;
  message: string;
}

export interface AmChatContact {
  _id: string;
  platform: AmChatPlatform | string;
  serviceAccountId: {
    _id: string;
    label: string;
    platform: string;
  } | null;
  externalId: string;
  name: string;
  meta: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AmChatMessage {
  _id: string;
  platform: AmChatPlatform | string;
  direction: 'incoming' | 'outgoing' | string;
  serviceAccountId: string;
  contactId: {
    _id: string;
    name: string;
    externalId: string;
    platform: string;
  } | null;
  body: string;
  mediaUrl: string;
  externalId: string;
  relayedAt: string | null;
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

export interface AmChatMessageQuery extends Record<string, AmQueryValue> {
  page?: number;
  limit?: number;
  platform?: string;
  serviceAccountId?: string;
  contactId?: string;
  direction?: string;
}

export interface AmChatContactQuery extends Record<string, AmQueryValue> {
  page?: number;
  limit?: number;
  platform?: string;
  serviceAccountId?: string;
  search?: string;
}

export interface AmChatMessagePayload {
  serviceAccountId: string;
  contactId: string;
  body: string;
  platform?: string;
}

export interface AmChatSendMessageResult {
  message: AmChatMessage;
  taskId?: string;
}

export interface AmChatContactPayload {
  platform: string;
  serviceAccountId: string;
  externalId: string;
  name?: string;
}

export interface AmWebhookConfigPayload {
  url: string;
  events: string[];
  secret?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

interface AmEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
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

export async function getAmTaskById(
  id: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmTask> {
  return amGet<AmTask>(`/task/${id}`, undefined, baseUrl);
}

export async function createAmTask(
  payload: AmTaskPayload,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmTask> {
  return amPost<AmTask>('/task', payload, baseUrl);
}

export async function cancelAmTask(
  id: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmTask> {
  return amPost<AmTask>(`/task/${id}/cancel`, undefined, baseUrl);
}

export async function retryAmTask(
  id: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmTask> {
  return amPost<AmTask>(`/task/${id}/retry`, undefined, baseUrl);
}

export async function forceFailAmTask(
  id: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmTask> {
  return amPost<AmTask>(`/task/${id}/force-fail`, undefined, baseUrl);
}

export async function getAmServiceAccounts(
  query?: AmServiceAccountQuery,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmListResponse<AmServiceAccount>> {
  return getAmList<AmServiceAccount>('/service-account', query, baseUrl);
}

export async function getAmServiceAccountById(
  id: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmServiceAccount> {
  return amGet<AmServiceAccount>(`/service-account/${id}`, undefined, baseUrl);
}

export async function createAmServiceAccount(
  payload: AmServiceAccountPayload & {platform: string; label: string},
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmServiceAccount> {
  return amPost<AmServiceAccount>('/service-account', payload, baseUrl);
}

export async function updateAmServiceAccount(
  id: string,
  payload: AmServiceAccountPayload,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmServiceAccount> {
  return amPut<AmServiceAccount>(`/service-account/${id}`, payload, baseUrl);
}

export async function deleteAmServiceAccount(
  id: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<void> {
  await amDelete<unknown>(`/service-account/${id}`, baseUrl);
}

export async function getAmRacks(
  query?: AmRackQuery,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmListResponse<AmRack>> {
  return getAmList<AmRack>('/rack', query, baseUrl);
}

export async function getAmRackById(
  id: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmRack> {
  return amGet<AmRack>(`/rack/${id}`, undefined, baseUrl);
}

export async function getAmBoxes(
  query?: AmBoxQuery,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmListResponse<AmBox>> {
  return getAmList<AmBox>('/box', query, baseUrl);
}

export async function getAmBoxById(
  id: string,
  query?: Pick<AmBoxQuery, 'rackId'>,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmBox> {
  return amGet<AmBox>(`/box/${id}`, query, baseUrl);
}

export async function getAmDevices(
  query?: AmDeviceQuery,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmListResponse<AmDevice>> {
  return getAmList<AmDevice>('/device', query, baseUrl);
}

export async function getAmDeviceById(
  id: string,
  query?: Pick<AmDeviceQuery, 'boxId'>,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmDevice> {
  return amGet<AmDevice>(`/device/${id}`, query, baseUrl);
}

export async function getAmDevicesAdbStatus(
  boxId: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmDeviceAdbStatusMap> {
  return amGet<AmDeviceAdbStatusMap>('/device/adb-status', {boxId}, baseUrl);
}

export async function createAmRack(
  payload: Pick<AmRackPayload, 'location' | 'description' | 'serverIp'>,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmRack> {
  return amPost<AmRack>('/rack', payload, baseUrl);
}

export async function updateAmRack(
  id: string,
  payload: AmRackPayload,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmRack> {
  return amPut<AmRack>(`/rack/${id}`, payload, baseUrl);
}

export async function deleteAmRacks(
  ids: string[],
  baseUrl = appConfig.amApiBaseUrl,
): Promise<void> {
  await amDeleteWithBody<unknown>('/racks', {ids}, baseUrl);
}

export async function createAmBox(
  payload: Required<Pick<AmBoxPayload, 'rackId'>> & Pick<AmBoxPayload, 'description'>,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmBox> {
  return amPost<AmBox>('/box', payload, baseUrl);
}

export async function updateAmBox(
  id: string,
  payload: Omit<AmBoxPayload, 'rackId'>,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmBox> {
  return amPut<AmBox>(`/box/${id}`, payload, baseUrl);
}

export async function deleteAmBoxes(
  ids: string[],
  baseUrl = appConfig.amApiBaseUrl,
): Promise<void> {
  await amDeleteWithBody<unknown>('/boxes', {ids}, baseUrl);
}

export async function createAmDevice(
  payload: Required<Pick<AmDevicePayload, 'boxId'>> & Omit<AmDevicePayload, 'boxId'>,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmDevice> {
  return amPost<AmDevice>('/device', payload, baseUrl);
}

export async function updateAmDevice(
  id: string,
  payload: Omit<AmDevicePayload, 'boxId'>,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmDevice> {
  return amPut<AmDevice>(`/device/${id}`, payload, baseUrl);
}

export async function deleteAmDevices(
  ids: string[],
  baseUrl = appConfig.amApiBaseUrl,
): Promise<void> {
  await amDeleteWithBody<unknown>('/devices', {ids}, baseUrl);
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

export async function getAmDeviceServices(
  deviceId: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmDeviceServiceStatus[]> {
  return amGet<AmDeviceServiceStatus[]>(
    `/device/${deviceId}/services`,
    undefined,
    baseUrl,
  );
}

export async function sendAmDeviceServiceInput(
  deviceId: string,
  type: AmServiceInputType,
  value: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<unknown> {
  return amPost(
    `/device/${deviceId}/service/input`,
    {type, value},
    baseUrl,
  );
}

export function getAmDeviceServiceQrUrl(
  deviceId: string,
  platform: string,
  qrcodeId?: string,
  baseUrl = appConfig.amApiBaseUrl,
): string | null {
  const endpoint = platform === 'whatsapp'
    ? 'whatsapp-qr'
    : platform === 'shopee'
      ? 'shopee-qr'
      : null;
  if (!endpoint || !baseUrl) return null;
  const trimmedBase = baseUrl.replace(/\/+$/, '');
  const suffix = qrcodeId ? `?t=${encodeURIComponent(qrcodeId)}` : '';
  return `${trimmedBase}/device/${encodeURIComponent(deviceId)}/service/${endpoint}${suffix}`;
}

export async function startAmDeviceService(
  deviceId: string,
  serviceAccountId: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<unknown> {
  return amPost(
    `/device/${deviceId}/service/start`,
    {serviceAccountId},
    baseUrl,
  );
}

export async function stopAmDeviceService(
  deviceId: string,
  serviceAccountId: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<unknown> {
  return amPost(
    `/device/${deviceId}/service/stop`,
    {serviceAccountId},
    baseUrl,
  );
}

export async function clearAmServiceAccountSession(
  serviceAccountId: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmClearServiceAccountSessionResult> {
  return amDelete<AmClearServiceAccountSessionResult>(
    `/service-account/${serviceAccountId}/session`,
    baseUrl,
  );
}

export async function getAmTokopediaSession(
  serviceAccountId: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmTokopediaSessionInfo> {
  return amGet<AmTokopediaSessionInfo>(
    `/service-account/${serviceAccountId}/tokopedia-session`,
    undefined,
    baseUrl,
  );
}

export async function verifyAmTokopediaSession(
  serviceAccountId: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmTokopediaVerifyResult> {
  return amPost<AmTokopediaVerifyResult>(
    `/service-account/${serviceAccountId}/tokopedia-session/verify`,
    undefined,
    baseUrl,
  );
}

export async function uploadAmTokopediaSession(
  serviceAccountId: string,
  cookies: unknown[],
  baseUrl = appConfig.amApiBaseUrl,
): Promise<{cookieCount: number; updatedAt: string}> {
  return amPost<{cookieCount: number; updatedAt: string}>(
    `/service-account/${serviceAccountId}/tokopedia-session`,
    {cookies},
    baseUrl,
  );
}

export async function restartAmTokopediaSession(
  serviceAccountId: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<{restarted: boolean; wasRunning: boolean}> {
  return amPost<{restarted: boolean; wasRunning: boolean}>(
    `/service-account/${serviceAccountId}/tokopedia-session/restart`,
    undefined,
    baseUrl,
  );
}

export async function updateAmTokopediaLoginMethod(
  serviceAccountId: string,
  body: {qrTiktokLogin?: boolean; loginFillOnly?: boolean},
  baseUrl = appConfig.amApiBaseUrl,
): Promise<{qrTiktokLogin: boolean; loginFillOnly: boolean}> {
  return amPut<{qrTiktokLogin: boolean; loginFillOnly: boolean}>(
    `/service-account/${serviceAccountId}/tokopedia-session/login-method`,
    body,
    baseUrl,
  );
}

export async function updateAmTokopediaCaptchaSettings(
  serviceAccountId: string,
  body: {captchaAutoSolve: boolean; anthropicApiKey?: string; clearAnthropicApiKey?: boolean},
  baseUrl = appConfig.amApiBaseUrl,
): Promise<Pick<AmTokopediaSessionInfo, 'captchaAutoSolve' | 'hasAnthropicApiKey' | 'anthropicApiKeyPreview' | 'envFallbackAvailable'>> {
  return amPut<Pick<AmTokopediaSessionInfo, 'captchaAutoSolve' | 'hasAnthropicApiKey' | 'anthropicApiKeyPreview' | 'envFallbackAvailable'>>(
    `/service-account/${serviceAccountId}/tokopedia-session/captcha`,
    body,
    baseUrl,
  );
}

export async function startAmTokopediaQrLogin(
  serviceAccountId: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<{started: boolean}> {
  return amPost<{started: boolean}>(
    `/service-account/${serviceAccountId}/tokopedia-session/qr-start`,
    undefined,
    baseUrl,
  );
}

export async function runAmTokopediaApiMonitor(
  serviceAccountId: string,
  body?: {autoRestart?: boolean; fillLogin?: boolean},
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmTokopediaApiMonitorJob> {
  return amPost<AmTokopediaApiMonitorJob>(
    `/service-account/${serviceAccountId}/tokopedia-session/api-monitor`,
    body ?? {},
    baseUrl,
  );
}

export async function getAmTokopediaApiMonitorStatus(
  serviceAccountId: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmTokopediaApiMonitorJob> {
  return amGet<AmTokopediaApiMonitorJob>(
    `/service-account/${serviceAccountId}/tokopedia-session/api-monitor`,
    undefined,
    baseUrl,
  );
}

export async function getAmTransfers(
  query?: AmTransferQuery,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmListResponse<AmTransfer>> {
  return getAmList<AmTransfer>('/transfer', query, baseUrl);
}

export async function createAmTransfer(
  payload: AmTransferPayload,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmTransfer> {
  return amPost<AmTransfer>('/transfer', payload, baseUrl);
}

export async function getAmTransferById(
  id: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmTransfer> {
  return amGet<AmTransfer>(`/transfer/${id}`, undefined, baseUrl);
}

export async function cancelAmTransfer(
  id: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmTransfer> {
  return amPost<AmTransfer>(`/transfer/${id}/cancel`, undefined, baseUrl);
}

export async function retryAmTransfer(
  id: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmTransfer> {
  return amPost<AmTransfer>(`/transfer/${id}/retry`, undefined, baseUrl);
}

export async function forceFailAmTransfer(
  id: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmTransfer> {
  return amPost<AmTransfer>(`/transfer/${id}/force-fail`, undefined, baseUrl);
}

export async function getAmMutasi(
  query?: AmMutasiQuery,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmListResponse<AmMutasi>> {
  return getAmList<AmMutasi>('/mutasi', query, baseUrl);
}

export async function getAmMutasiById(
  id: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmMutasi> {
  return amGet<AmMutasi>(`/mutasi/${id}`, undefined, baseUrl);
}

export function getAmMutasiReceiptUrl(
  id: string,
  baseUrl = appConfig.amApiBaseUrl,
): string {
  if (!baseUrl) {
    throw new Error('URL server AM existing belum dikonfigurasi.');
  }

  return `${baseUrl.replace(/\/+$/, '')}/mutasi/${encodeURIComponent(id)}/receipt`;
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

export async function getAmUserById(
  id: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmUser> {
  return amGet<AmUser>(`/users/${id}`, undefined, baseUrl);
}

export async function getAmCurrentUser(
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmCurrentUser> {
  return amGet<AmCurrentUser>('/auth/me', undefined, baseUrl);
}

export async function loginAmSession(
  payload: AmLoginPayload,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmLoginResponse> {
  return amPost<AmLoginResponse>('/auth/login', payload, baseUrl);
}

export async function logoutAmSession(
  baseUrl = appConfig.amApiBaseUrl,
): Promise<void> {
  if (!baseUrl) {
    throw new Error('URL server AM existing belum dikonfigurasi.');
  }

  await apiRequest<unknown>({
    method: 'POST',
    path: '/auth/logout',
    baseUrl,
    sourceHeader: appConfig.amSourceHeader,
    cookieJar: true,
    credentials: 'include',
  });
}

export async function getAmRoles(
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmRole[]> {
  return amGet<AmRole[]>('/roles', undefined, baseUrl);
}

export async function createAmUser(
  payload: Required<Pick<AmUserPayload, 'fullName' | 'username' | 'password'>> & Pick<AmUserPayload, 'role'>,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmUser> {
  return amPost<AmUser>('/users', payload, baseUrl);
}

export async function updateAmUser(
  id: string,
  payload: AmUserPayload,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmUser> {
  return amPut<AmUser>(`/users/${id}`, payload, baseUrl);
}

export async function deleteAmUser(
  id: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<void> {
  await amDelete<unknown>(`/users/${id}`, baseUrl);
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

export async function bulkDeleteAmActivityLogs(
  payload: AmActivityLogBulkDeletePayload,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmActivityLogBulkDeleteResult> {
  return amPost<AmActivityLogBulkDeleteResult>(
    '/activity-log/bulk-delete',
    payload,
    baseUrl,
  );
}

export async function recordAmPageView(
  path: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<void> {
  if (!baseUrl) {
    throw new Error('URL server AM existing belum dikonfigurasi.');
  }

  await apiRequest<unknown>({
    method: 'POST',
    path: '/activity-log/page-view',
    body: {
      path,
      userAgent: 'KolamWindows',
    },
    baseUrl,
    sourceHeader: appConfig.amSourceHeader,
    cookieJar: true,
    credentials: 'include',
  });
}

export async function getAmWebhookConfigs(
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmListResponse<AmWebhookConfig>> {
  return getAmList<AmWebhookConfig>('/webhook/config', undefined, baseUrl);
}

export async function getAmWebhookEvents(
  baseUrl = appConfig.amApiBaseUrl,
): Promise<string[]> {
  return amGet<string[]>('/webhook/events', undefined, baseUrl);
}

export async function createAmWebhookConfig(
  payload: AmWebhookConfigPayload,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmWebhookConfig> {
  return amPost<AmWebhookConfig>('/webhook/config', payload, baseUrl);
}

export async function updateAmWebhookConfig(
  id: string,
  payload: Partial<AmWebhookConfigPayload>,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmWebhookConfig> {
  return amPut<AmWebhookConfig>(`/webhook/config/${id}`, payload, baseUrl);
}

export async function deleteAmWebhookConfig(
  id: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<unknown> {
  return amDelete(`/webhook/config/${id}`, baseUrl);
}

export async function testAmWebhookPing(
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmWebhookTestPingResult> {
  return amPost<AmWebhookTestPingResult>('/webhook/test-ping', undefined, baseUrl);
}

export async function getAmWebhookLogs(
  query?: AmWebhookLogQuery,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmListResponse<AmWebhookLog>> {
  return getAmList<AmWebhookLog>('/webhook/logs', query, baseUrl);
}

export async function getAmChatMessages(
  query?: AmChatMessageQuery,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmListResponse<AmChatMessage>> {
  return getAmList<AmChatMessage>('/chat/message', query, baseUrl);
}

export async function getAmChatMessageById(
  id: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmChatMessage> {
  return amGet<AmChatMessage>(`/chat/message/${id}`, undefined, baseUrl);
}

export async function sendAmChatMessage(
  payload: AmChatMessagePayload,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmChatSendMessageResult> {
  if (!baseUrl) {
    throw new Error('URL server AM existing belum dikonfigurasi.');
  }

  const response = await apiRequest<(AmEnvelope<AmChatMessage> & {taskId?: string}) | AmChatMessage>({
    method: 'POST',
    path: '/chat/message/send',
    body: payload,
    baseUrl,
    sourceHeader: appConfig.amSourceHeader,
    cookieJar: true,
    credentials: 'include',
  });

  if (isAmEnvelope(response)) {
    if (!response.success) {
      throw new Error(response.message ?? 'AM API mengembalikan status gagal.');
    }

    return {
      message: response.data,
      taskId: response.taskId,
    };
  }

  return {message: response};
}

export async function getAmChatContacts(
  query?: AmChatContactQuery,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmListResponse<AmChatContact>> {
  return getAmList<AmChatContact>('/chat/contact', query, baseUrl);
}

export async function getAmChatContactById(
  id: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmChatContact> {
  return amGet<AmChatContact>(`/chat/contact/${id}`, undefined, baseUrl);
}

export async function createAmChatContact(
  payload: AmChatContactPayload,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmChatContact> {
  return amPost<AmChatContact>('/chat/contact', payload, baseUrl);
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

async function amPost<T>(
  path: string,
  body?: unknown,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<T> {
  if (!baseUrl) {
    throw new Error('URL server AM existing belum dikonfigurasi.');
  }

  const response = await apiRequest<AmEnvelope<T> | T>({
    method: 'POST',
    path,
    body,
    baseUrl,
    sourceHeader: appConfig.amSourceHeader,
    cookieJar: true,
    credentials: 'include',
  });

  return unwrapAmResponse(response);
}

async function amPut<T>(
  path: string,
  body?: unknown,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<T> {
  if (!baseUrl) {
    throw new Error('URL server AM existing belum dikonfigurasi.');
  }

  const response = await apiRequest<AmEnvelope<T> | T>({
    method: 'PUT',
    path,
    body,
    baseUrl,
    sourceHeader: appConfig.amSourceHeader,
    cookieJar: true,
    credentials: 'include',
  });

  return unwrapAmResponse(response);
}

async function amDelete<T>(
  path: string,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<T> {
  if (!baseUrl) {
    throw new Error('URL server AM existing belum dikonfigurasi.');
  }

  const response = await apiRequest<AmEnvelope<T> | T>({
    method: 'DELETE',
    path,
    baseUrl,
    sourceHeader: appConfig.amSourceHeader,
    cookieJar: true,
    credentials: 'include',
  });

  return unwrapAmResponse(response);
}

async function amDeleteWithBody<T>(
  path: string,
  body: unknown,
  baseUrl = appConfig.amApiBaseUrl,
): Promise<T> {
  if (!baseUrl) {
    throw new Error('URL server AM existing belum dikonfigurasi.');
  }

  const response = await apiRequest<AmEnvelope<T> | T>({
    method: 'DELETE',
    path,
    body,
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

  return 'success' in response && (response.success === false || 'data' in response);
}

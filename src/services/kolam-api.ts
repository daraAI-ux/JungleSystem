import {appConfig} from '../config/app';
import {apiRequest} from '../lib/api-client';

export type KolamSummaryRange =
  | 'today'
  | 'week'
  | 'month'
  | 'year'
  | 'custom'
  | 'all';

export interface KolamWalletSummary {
  name: string;
  balance: number;
}

export interface KolamFinanceSummary {
  totalIncome: number;
  totalExpense: number;
  profitLoss: number;
  details: {
    sales: number;
    unexpectedIncome: number;
    shippingCollected: number;
    purchaseOrder: number;
    production: number;
    routineExpense: number;
    unexpectedExpense: number;
    assetPurchase: number;
    costOfSale: number;
    commissionReleased: number;
  };
  wallets: KolamWalletSummary[];
  transactions: unknown[];
  filter: {
    startDate: string | null;
    endDate: string | null;
    range: string;
  };
}

export interface KolamSaleCostSummary {
  revenue: number;
  totalHpp: number;
  totalCommissionAccrued: number;
  grossMargin: number;
  saleCount: number;
  filter: {
    startDate: string | null;
    endDate: string | null;
    range: string;
  };
}

export interface KolamSalesGraphPoint {
  timestamp: string;
  value: number;
}

export interface KolamDashboardCounts {
  products: number;
  rawProducts: number;
  species: number;
  services: number;
}

export type KolamDashboardSummaryRange = 'today' | 'month' | 'year' | 'all';
export type KolamDashboardSummaryMetric =
  | 'revenue'
  | 'margin'
  | 'order_count';

export interface KolamDashboardSummaryPoint {
  timestamp: string;
  value: number;
}

export interface KolamDashboardSourceBreakdownEntry {
  value: number;
  count: number;
}

export type KolamDashboardSourceBreakdown = Record<
  string,
  KolamDashboardSourceBreakdownEntry
>;

export interface KolamDashboardSummary {
  range: KolamDashboardSummaryRange;
  metric?: KolamDashboardSummaryMetric;
  value: number;
  change: number;
  data: KolamDashboardSummaryPoint[];
  bySource?: KolamDashboardSourceBreakdown;
  bySourcePending?: KolamDashboardSourceBreakdown;
}

export interface KolamDashboardStockProduct {
  _id: string;
  name: string;
  stock: number;
  photos?: string[];
}

export interface KolamDashboardTopSellingProduct {
  productId: string;
  totalSold: number;
  name: string;
  stock: number;
  photo?: string | null;
}

export interface KolamDashboardLatest {
  lowStockProducts: KolamDashboardStockProduct[];
  topSellingProducts: KolamDashboardTopSellingProduct[];
  outOfStockProducts: KolamDashboardStockProduct[];
}

export interface KolamPendingCustomerVerificationRow {
  pendingServiceId: string;
  serviceSerial?: string | null;
  subscriptionId?: string | null;
  subscriptionNumber?: string | null;
  taskKind: 'dosing' | 'maintenance';
  taskId: string;
  executionId: string;
  visitTitle?: string | null;
  packageTaskCode?: string | null;
  scheduledTime?: string | null;
  supervisorVerifiedAt?: string | null;
  status?: string;
}


export type KolamDashboardActionRequiredReason =
  | 'belum_bayar'
  | 'belum_kirim'
  | 'proyek_kustom'
  | 'cp_penawaran'
  | 'cp_dp'
  | 'cp_desain';

export interface KolamDashboardActionRequiredCustomProject {
  quotationNumber?: string;
  lifecycleStatus: string;
  lifecycleLabel: string;
  progressPercent?: number;
  quotationDecision?: string;
}

export interface KolamDashboardActionRequiredSale {
  id: string;
  kind: 'standard' | 'custom';
  invoiceCode: string;
  status: string;
  deliveryStatus: string;
  finalTotal: number;
  createdAt: string;
  sourceName: string;
  reasons: KolamDashboardActionRequiredReason[];
  customProject?: KolamDashboardActionRequiredCustomProject | null;
}

export interface KolamDashboardActionRequired {
  total: number;
  items: KolamDashboardActionRequiredSale[];
  capped?: boolean;
  counts?: {
    standard: number;
    custom: number;
  };
}

export interface KolamDashboardData {
  summary: KolamDashboardSummary[];
  salesGraph: {
    range: string;
    data: KolamSalesGraphPoint[];
  };
  latest: KolamDashboardLatest;
  counts: KolamDashboardCounts;
  actionRequired?: KolamDashboardActionRequired;
}

export type KolamAppKey =
  | 'kolam'
  | 'kolam-da'
  | 'enclonura'
  | 'pos'
  | 'pos-da'
  | 'marketplace';

export interface KolamWebSetting {
  _id?: string;
  version?: string;
  versions?: Partial<Record<KolamAppKey, string>>;
  companyName?: string;
  companyTagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  livechatOnline?: boolean;
  maintenance?: {
    pos?: boolean;
    marketplace?: boolean;
    [key: string]: boolean | undefined;
  };
  staffDesktopOnly?: {
    enabled?: boolean;
    redirectUrl?: string;
  };
  updatedAt?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface KolamWebSettingVersion {
  version: string;
  app: KolamAppKey;
  updatedAt?: string;
  createdAt?: string;
}

export interface KolamWebSettingVersions {
  versions: Partial<Record<KolamAppKey, string>>;
  updatedAt?: string;
  createdAt?: string;
}

export interface UpdateKolamWebSettingBody
  extends Partial<
    Pick<
      KolamWebSetting,
      | 'companyName'
      | 'companyTagline'
      | 'address'
      | 'phone'
      | 'email'
      | 'logo'
      | 'livechatOnline'
      | 'maintenance'
      | 'staffDesktopOnly'
    >
  > {
  [key: string]: unknown;
}

export interface UpdateKolamWebSettingVersionBody {
  version: string;
  app?: KolamAppKey;
}

export interface KolamRole {
  _id: string;
  name: string;
  key: string;
  description?: string;
  permissions?: unknown[];
}

export type KolamActivityLogType = 'api' | 'page';
export type KolamActivityLogStatus = 'success' | 'failed';
export type KolamActivityLogSource = 'Kolam' | 'pos' | 'store' | '';

export interface KolamActivityLog {
  _id: string;
  timestamp: string;
  userId: {
    _id: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    email?: string;
  } | null;
  source: KolamActivityLogSource;
  type: KolamActivityLogType;
  action: string;
  method: string;
  path: string;
  ip: string;
  userAgent: string;
  status: KolamActivityLogStatus;
  statusCode: number;
  duration: number;
  metadata: Record<string, unknown>;
  error: string;
  suspicious: string[];
}

export interface KolamActivityLogListParams
  extends Record<string, string | number | boolean | undefined | null> {
  page?: number;
  limit?: number;
  userId?: string;
  type?: KolamActivityLogType | '';
  action?: string;
  method?: string;
  status?: KolamActivityLogStatus | '';
  source?: KolamActivityLogSource;
  suspicious?: 'true' | string;
  from?: string;
  to?: string;
  search?: string;
}

export interface KolamActivityLogListResponse {
  success: boolean;
  data: KolamActivityLog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface KolamActivityLogStatsResponse {
  success: boolean;
  data: {
    since: string;
    days: number;
    byType: Array<{_id: KolamActivityLogType; count: number}>;
    byStatus: Array<{_id: KolamActivityLogStatus; count: number}>;
    topUsers: unknown[];
    topPaths: Array<{_id: string; count: number}>;
  };
}

interface DataResponse<T> {
  data: T;
}

interface MessageDataResponse<T> extends DataResponse<T> {
  message?: string;
}

interface KolamSummaryQuery
  extends Record<string, string | number | boolean | undefined | null> {
  range?: KolamSummaryRange;
  startDate?: string;
  endDate?: string;
}

export function getKolamFinanceSummary(
  query: KolamSummaryQuery = {range: 'month'},
): Promise<KolamFinanceSummary> {
  return kolamGet<KolamFinanceSummary>('/finance-summary', query);
}

export function getKolamSaleCostSummary(
  query: KolamSummaryQuery = {range: 'month'},
): Promise<KolamSaleCostSummary> {
  return kolamGet<KolamSaleCostSummary>('/finance-summary/sale-cost', query);
}

export async function getKolamSalesGraph(
  range: Extract<KolamSummaryRange, 'today' | 'month' | 'year'> = 'month',
): Promise<KolamSalesGraphPoint[]> {
  const response = await kolamGet<DataResponse<KolamSalesGraphPoint[]>>(
    '/dashboard/sales-graph',
    {range},
  );

  return response.data;
}

export async function getKolamDashboard(
  range: Extract<KolamSummaryRange, 'week' | 'month' | 'year' | 'all'> = 'month',
): Promise<KolamDashboardData> {
  const response = await kolamGet<DataResponse<KolamDashboardData> | KolamDashboardData>(
    '/dashboard',
    {range},
  );

  return 'data' in response ? response.data : response;
}

export async function getKolamPendingCustomerVerifications(): Promise<
  KolamPendingCustomerVerificationRow[]
> {
  const response = await kolamGet<
    DataResponse<KolamPendingCustomerVerificationRow[]>
  >('/subscriptions/my/pending-customer-verifications');

  return response.data ?? [];
}

export async function getKolamWebSetting(): Promise<KolamWebSetting> {
  const response = await kolamGet<
    KolamWebSetting | DataResponse<KolamWebSetting>
  >('/websetting');

  return unwrapData(response);
}

export function getKolamWebSettingVersion(
  app: KolamAppKey = 'kolam',
): Promise<KolamWebSettingVersion> {
  return kolamGet<KolamWebSettingVersion>('/websetting/version', {app});
}

export function getKolamWebSettingVersions(): Promise<KolamWebSettingVersions> {
  return kolamGet<KolamWebSettingVersions>('/websetting/version/all');
}

export async function updateKolamWebSetting(
  body: UpdateKolamWebSettingBody,
): Promise<KolamWebSetting> {
  const response = await kolamPut<
    KolamWebSetting | DataResponse<KolamWebSetting>
  >('/websetting', body);

  return unwrapData(response);
}

export function updateKolamWebSettingVersion(
  body: UpdateKolamWebSettingVersionBody,
): Promise<KolamWebSettingVersion & {message: string}> {
  return kolamPut<KolamWebSettingVersion & {message: string}>(
    '/websetting/version',
    body,
  );
}

export async function getKolamRoles(): Promise<KolamRole[]> {
  const response = await kolamGet<MessageDataResponse<KolamRole[]>>('/roles');

  return response.data;
}

export function getKolamActivityLogs(
  params: KolamActivityLogListParams = {page: 1, limit: 50},
): Promise<KolamActivityLogListResponse> {
  return kolamGet<KolamActivityLogListResponse>('/activity-log', params);
}

export function getKolamActivityLogStats(
  days = 7,
): Promise<KolamActivityLogStatsResponse> {
  return kolamGet<KolamActivityLogStatsResponse>('/activity-log/stats', {days});
}

function kolamGet<T>(
  path: string,
  query?: Record<string, string | number | boolean | undefined | null>,
) {
  return apiRequest<T>({
    method: 'GET',
    path,
    query,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });
}

function kolamPut<T>(path: string, body: unknown) {
  return apiRequest<T>({
    method: 'PUT',
    path,
    body,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });
}

function unwrapData<T>(response: T | DataResponse<T>): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as DataResponse<T>).data;
  }

  return response as T;
}




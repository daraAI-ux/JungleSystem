import {appConfig} from '../config/app';
import {apiRequest} from '../lib/api-client';

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

interface AmEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function getAmDashboard(
  baseUrl = appConfig.amApiBaseUrl,
): Promise<AmDashboardData> {
  if (!baseUrl) {
    throw new Error('URL server AM existing belum dikonfigurasi.');
  }

  const response = await apiRequest<AmEnvelope<AmDashboardData> | AmDashboardData>({
    method: 'GET',
    path: '/dashboard',
    baseUrl,
    sourceHeader: appConfig.amSourceHeader,
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

    return response.data;
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

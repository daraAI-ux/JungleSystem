import {appConfig} from '../config/app';
import type {ServerMetricsSnapshot} from '../domain/server-metrics';
import {apiRequest} from '../lib/api-client';

interface HostMetricsApiResponse {
  success?: boolean;
  data?: {
    checkedAt?: string;
    hostname?: string;
    cpu?: {
      percent?: number;
    };
    memory?: {
      usedPercent?: number;
    };
    disk?: {
      usedPercent?: number;
    };
  };
}

export async function fetchServerMetrics(): Promise<ServerMetricsSnapshot> {
  const response = await apiRequest<HostMetricsApiResponse>({
    method: 'GET',
    path: '/system/host-metrics',
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  if (!response.data) {
    throw new Error('Metrik server tidak tersedia dari Kolam BE.');
  }

  return {
    checkedAt: response.data.checkedAt ?? new Date().toISOString(),
    hostname: response.data.hostname,
    cpuPercent: normalizePercent(response.data.cpu?.percent),
    memoryPercent: normalizePercent(response.data.memory?.usedPercent),
    diskPercent: normalizePercent(response.data.disk?.usedPercent),
  };
}

function normalizePercent(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.min(100, value));
}


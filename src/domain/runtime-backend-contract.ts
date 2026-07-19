import {appConfig} from '../config/app';
import type {RuntimeIdentityStatus} from './runtime-identity';

export type RuntimeBackendEndpointId = 'api' | 'kolam-api' | 'am-api';

export type RuntimeBackendConfig = {
  apiBaseUrl: string;
  amApiBaseUrl: string;
  kolamApiBaseUrl: string;
};

export type RuntimeBackendEndpointContract = {
  detail: string;
  id: RuntimeBackendEndpointId;
  label: string;
  status: RuntimeIdentityStatus;
  value: string;
};

const runtimeBackendLabels: Record<RuntimeBackendEndpointId, string> = {
  api: 'POS/Auth API',
  'kolam-api': 'Kolam API',
  'am-api': 'AM API',
};

export function getRuntimeBackendEndpointContracts(
  config: RuntimeBackendConfig = appConfig,
): RuntimeBackendEndpointContract[] {
  return [
    getRuntimeBackendEndpointContract('api', config.apiBaseUrl),
    getRuntimeBackendEndpointContract('kolam-api', config.kolamApiBaseUrl),
    getRuntimeBackendEndpointContract('am-api', config.amApiBaseUrl),
  ];
}

export function getRuntimeBackendEndpointContract(
  id: RuntimeBackendEndpointId,
  url: string,
): RuntimeBackendEndpointContract {
  const normalizedUrl = url.trim();

  if (!normalizedUrl) {
    return {
      id,
      label: runtimeBackendLabels[id],
      value: 'Not configured',
      detail: 'Server URL belum dikonfigurasi.',
      status: 'blocked',
    };
  }

  if (isLocalBackendUrl(normalizedUrl)) {
    return {
      id,
      label: runtimeBackendLabels[id],
      value: compactRuntimeUrl(normalizedUrl),
      detail: 'Backend lokal tidak boleh menjadi runtime KolamWindows.',
      status: 'blocked',
    };
  }

  if (!isHttpsRuntimeUrl(normalizedUrl)) {
    return {
      id,
      label: runtimeBackendLabels[id],
      value: compactRuntimeUrl(normalizedUrl),
      detail: 'Server non-HTTPS hanya boleh dipakai bila production gate sudah diaudit.',
      status: 'partial',
    };
  }

  return {
    id,
    label: runtimeBackendLabels[id],
    value: compactRuntimeUrl(normalizedUrl),
    detail: 'Existing backend server',
    status: 'ready',
  };
}

export function isLocalBackendUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();

    return (
      hostname === 'localhost' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname.startsWith('127.') ||
      hostname.endsWith('.localhost')
    );
  } catch {
    return false;
  }
}

export function compactRuntimeUrl(value: string): string {
  return value.replace(/^https?:\/\//, '').replace(/\/api\/?$/, '/api');
}

function isHttpsRuntimeUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}
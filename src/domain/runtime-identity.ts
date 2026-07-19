import {appConfig} from '../config/app';
import {getRuntimeClientHeaderContracts} from './runtime-client-contract';
import {
  getRuntimeBackendEndpointContracts,
  type RuntimeBackendConfig,
} from './runtime-backend-contract';

export type RuntimeIdentityStatus = 'ready' | 'partial' | 'blocked';
export type RuntimeDeviceIdentityStatus = 'missing' | 'mac-only' | 'signed';

export type RuntimeIdentityItem = {
  id: string;
  label: string;
  value: string;
  detail: string;
  status: RuntimeIdentityStatus;
};

export type RuntimeIdentitySummary = {
  ready: number;
  partial: number;
  blocked: number;
};

export type RuntimeIdentityOptions = {
  backendConfig?: RuntimeBackendConfig;
  deviceIdentityAttached?: boolean;
  deviceIdentityStatus?: RuntimeDeviceIdentityStatus;
};

export function getRuntimeIdentityItems(
  options: RuntimeIdentityOptions = {},
): RuntimeIdentityItem[] {
  const deviceIdentityAttached = options.deviceIdentityAttached ?? false;
  const deviceIdentityStatus =
    options.deviceIdentityStatus ??
    (deviceIdentityAttached ? 'signed' : 'missing');
  const backendEndpoints = getRuntimeBackendEndpointContracts(
    options.backendConfig ?? appConfig,
  );
  const kolamApi = backendEndpoints.find(endpoint => endpoint.id === 'kolam-api')!;
  const amApi = backendEndpoints.find(endpoint => endpoint.id === 'am-api')!;
  const clientHeaders = getRuntimeClientHeaderContracts();

  return [
    {
      id: 'native-client',
      label: 'Client',
      value: appConfig.nativeUserAgent,
      detail: clientHeaders
        .map(header => `${header.id}: ${header.value}`)
        .join(' / '),
      status: 'ready',
    },
    {
      id: 'kolam-api',
      label: kolamApi.label,
      value: kolamApi.value,
      detail: kolamApi.detail,
      status:
        kolamApi.status === 'ready' && !appConfig.preferLiveApi
          ? 'partial'
          : kolamApi.status,
    },
    {
      id: 'am-api',
      label: amApi.label,
      value: amApi.value,
      detail: amApi.detail,
      status: amApi.status,
    },
    {
      id: 'device-identity',
      label: 'Device',
      value: getDeviceIdentityValue(deviceIdentityStatus),
      detail: getDeviceIdentityDetail(deviceIdentityStatus),
      status: deviceIdentityStatus === 'signed' ? 'ready' : 'partial',
    },
  ];
}

export function getRuntimeIdentitySummary(
  items: RuntimeIdentityItem[],
): RuntimeIdentitySummary {
  return items.reduce<RuntimeIdentitySummary>(
    (summary, item) => ({
      ...summary,
      [item.status]: summary[item.status] + 1,
    }),
    {ready: 0, partial: 0, blocked: 0},
  );
}

function getDeviceIdentityValue(status: RuntimeDeviceIdentityStatus): string {
  if (status === 'signed') {
    return 'MAC signed';
  }

  if (status === 'mac-only') {
    return 'MAC attached';
  }

  return 'Pending native MAC';
}

function getDeviceIdentityDetail(status: RuntimeDeviceIdentityStatus): string {
  if (status === 'signed') {
    return 'x-device-mac + x-device-mac-signature';
  }

  if (status === 'mac-only') {
    return 'x-device-mac attached; signature pending';
  }

  return 'x-device-mac + signature slot';
}

import {appConfig} from '../config/app';

export type RuntimeClientHeaderName =
  | 'Origin'
  | 'User-Agent'
  | 'x-da-client'
  | 'x-da-client-version'
  | 'x-source';

export type RuntimeClientHeaderContract = {
  id: RuntimeClientHeaderName;
  label: string;
  value: string;
  requiredForServerGate: boolean;
};

export type RuntimeClientHeaderOptions = {
  sourceHeader?: string;
};

export function getRuntimeClientHeaderContracts(
  options: RuntimeClientHeaderOptions = {},
): RuntimeClientHeaderContract[] {
  const sourceHeader = options.sourceHeader ?? appConfig.sourceHeader;

  return [
    {
      id: 'Origin',
      label: 'Native Origin',
      value: appConfig.nativeOrigin,
      requiredForServerGate: true,
    },
    {
      id: 'User-Agent',
      label: 'Native User Agent',
      value: appConfig.nativeUserAgent,
      requiredForServerGate: true,
    },
    {
      id: 'x-da-client',
      label: 'Client Id',
      value: appConfig.nativeClientId,
      requiredForServerGate: true,
    },
    {
      id: 'x-da-client-version',
      label: 'Client Version',
      value: appConfig.nativeClientVersion,
      requiredForServerGate: true,
    },
    {
      id: 'x-source',
      label: 'Source',
      value: sourceHeader,
      requiredForServerGate: true,
    },
  ];
}

export function getRuntimeClientHeaders(
  options: RuntimeClientHeaderOptions = {},
): Record<RuntimeClientHeaderName, string> {
  return Object.fromEntries(
    getRuntimeClientHeaderContracts(options).map(header => [
      header.id,
      header.value,
    ]),
  ) as Record<RuntimeClientHeaderName, string>;
}

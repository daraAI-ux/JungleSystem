import {NativeModules, Platform} from 'react-native';
import type {RuntimeDeviceIdentityStatus} from '../domain/runtime-identity';
import {
  clearNativeDeviceIdentity,
  setNativeDeviceIdentity,
  type NativeDeviceIdentity,
} from '../lib/api-client';

type NativeDeviceIdentityModule = {
  getAppInfo?: () => NativeDeviceIdentityPayload | Promise<NativeDeviceIdentityPayload>;
  getDeviceIdentity?: () =>
    | NativeDeviceIdentityPayload
    | Promise<NativeDeviceIdentityPayload>;
};

type NativeDeviceIdentityPayload = {
  deviceMac?: unknown;
  deviceMacAddresses?: unknown;
  deviceMacSignature?: unknown;
  macAddress?: unknown;
  macAddresses?: unknown;
  macSignature?: unknown;
} | null | undefined;

export type NativeDeviceIdentityBootstrapOptions = {
  nativeModules?: Record<string, NativeDeviceIdentityModule | undefined>;
  platformOS?: string;
};

export async function bootstrapNativeDeviceIdentity({
  nativeModules = NativeModules as Record<
    string,
    NativeDeviceIdentityModule | undefined
  >,
  platformOS = Platform.OS,
}: NativeDeviceIdentityBootstrapOptions = {}): Promise<RuntimeDeviceIdentityStatus> {
  const identity = await readNativeDeviceIdentity({nativeModules, platformOS});

  if (!identity?.macAddresses?.length) {
    clearNativeDeviceIdentity();
    return 'missing';
  }

  setNativeDeviceIdentity(identity);
  return identity.macSignature ? 'signed' : 'mac-only';
}

export async function readNativeDeviceIdentity({
  nativeModules = NativeModules as Record<
    string,
    NativeDeviceIdentityModule | undefined
  >,
  platformOS = Platform.OS,
}: NativeDeviceIdentityBootstrapOptions = {}): Promise<NativeDeviceIdentity | null> {
  if (platformOS !== 'windows') {
    return null;
  }

  const bridge =
    nativeModules.KolamWindowsDeviceIdentity ??
    nativeModules.KolamDeviceIdentity;

  try {
    const payload =
      (await bridge?.getDeviceIdentity?.()) ?? (await bridge?.getAppInfo?.());

    return normalizeNativeDeviceIdentity(payload);
  } catch {
    return null;
  }
}

export function normalizeNativeDeviceIdentity(
  payload: NativeDeviceIdentityPayload,
): NativeDeviceIdentity | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const macAddresses = normalizeMacValues(
    payload.macAddresses ??
      payload.deviceMacAddresses ??
      payload.macAddress ??
      payload.deviceMac,
  );
  const macSignature = normalizeOptionalString(
    payload.macSignature ?? payload.deviceMacSignature,
  );

  if (!macAddresses.length) {
    return null;
  }

  return {
    macAddresses,
    macSignature,
  };
}

function normalizeMacValues(value: unknown): string[] {
  const values = Array.isArray(value) ? value : [value];

  return values
    .flatMap(item => String(item ?? '').split(/[,;]/))
    .map(item => item.trim().toUpperCase())
    .filter(Boolean);
}

function normalizeOptionalString(value: unknown): string | undefined {
  const text = String(value ?? '').trim();
  return text || undefined;
}

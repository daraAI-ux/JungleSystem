import {
  NativeEventEmitter,
  NativeModules,
  Platform,
  TurboModuleRegistry,
  type TurboModule,
} from 'react-native';
import type {KolamPackageInfo} from '../domain/kolam-package-update';

export type KolamPackageDownloadProgress = {
  percent: number;
  received: number;
  total: number;
};

export type KolamPackageInstallProgress = {
  percent: number;
};

type KolamWindowsPackageUpdateNativeBridge = TurboModule & {
  addListener?: (eventName: string) => void;
  downloadMsix?: (options: {
    authorization?: string;
    fileName?: string;
    sha256?: string;
    sha512?: string;
    size?: number;
    url: string;
  }) => Promise<{path?: string; sha256?: string; sha512?: string; size?: number}>;
  getPackageInfo?: () => KolamPackageInfo;
  installMsix?: (options?: {
    path?: string;
  }) => Promise<{fallback?: boolean; ok?: boolean}>;
  removeListeners?: (count: number) => void;
  restartApp?: () => Promise<{ok?: boolean; restarted?: boolean}>;
};

const EMPTY_PACKAGE_INFO: KolamPackageInfo = {
  familyName: '',
  name: 'JungleSystem',
  packaged: false,
  publicVersion: '',
  publisher: '',
  version: '',
};

export function getKolamWindowsPackageUpdateBridge():
  | KolamWindowsPackageUpdateNativeBridge
  | null {
  if (Platform.OS !== 'windows') {
    return null;
  }

  const fromNativeModules = (
    NativeModules as Record<string, KolamWindowsPackageUpdateNativeBridge | undefined>
  ).KolamWindowsPackageUpdate;
  if (typeof fromNativeModules?.getPackageInfo === 'function') {
    return fromNativeModules;
  }

  try {
    const fromTurbo = TurboModuleRegistry.get<KolamWindowsPackageUpdateNativeBridge>(
      'KolamWindowsPackageUpdate',
    );
    if (typeof fromTurbo?.getPackageInfo === 'function') {
      return fromTurbo;
    }
  } catch {
    // Classic native module lookup is enough when TurboModuleRegistry is empty.
  }

  return null;
}

export function getKolamWindowsPackageInfo(): KolamPackageInfo {
  try {
    const info = getKolamWindowsPackageUpdateBridge()?.getPackageInfo?.();
    if (!info) {
      return EMPTY_PACKAGE_INFO;
    }

    return {
      familyName: typeof info.familyName === 'string' ? info.familyName : '',
      name:
        typeof info.name === 'string' && info.name.trim()
          ? info.name
          : 'JungleSystem',
      packaged: Boolean(info.packaged),
      publicVersion:
        typeof info.publicVersion === 'string' ? info.publicVersion : '',
      publisher: typeof info.publisher === 'string' ? info.publisher : '',
      version: typeof info.version === 'string' ? info.version : '',
    };
  } catch {
    return EMPTY_PACKAGE_INFO;
  }
}

export async function downloadKolamWindowsMsix(options: {
  authorization?: string;
  fileName?: string;
  sha256?: string;
  sha512?: string;
  size?: number;
  url: string;
}): Promise<{path: string}> {
  const bridge = getKolamWindowsPackageUpdateBridge();
  if (!bridge?.downloadMsix) {
    throw new Error('Gagal unduh');
  }

  const authorization = options.authorization?.trim();
  if (!authorization) {
    throw new Error('Login dulu');
  }

  const result = await bridge.downloadMsix({
    ...options,
    authorization,
  });
  const path = typeof result?.path === 'string' ? result.path.trim() : '';
  if (!path) {
    throw new Error('Gagal unduh');
  }

  return {path};
}

export async function installKolamWindowsMsix(
  path?: string,
): Promise<{fallback?: boolean}> {
  const bridge = getKolamWindowsPackageUpdateBridge();
  if (!bridge?.installMsix) {
    throw new Error('Gagal pasang');
  }

  const result = await bridge.installMsix(path ? {path} : {});
  return {
    fallback: Boolean(result && typeof result === 'object' && result.fallback),
  };
}

export async function restartKolamWindowsApp(): Promise<void> {
  const bridge = getKolamWindowsPackageUpdateBridge();
  if (!bridge?.restartApp) {
    return;
  }

  await bridge.restartApp();
}

export function subscribeKolamWindowsPackageUpdateProgress(handlers: {
  onDownload?: (progress: KolamPackageDownloadProgress) => void;
  onInstall?: (progress: KolamPackageInstallProgress) => void;
}): () => void {
  const bridge = getKolamWindowsPackageUpdateBridge();
  if (!bridge) {
    return () => undefined;
  }

  try {
    const emitter = new NativeEventEmitter(
      bridge as unknown as ConstructorParameters<typeof NativeEventEmitter>[0],
    );
    const download = emitter.addListener(
      'DownloadProgress',
      (payload: {percent?: number; received?: number; total?: number}) => {
        handlers.onDownload?.({
          percent: Number(payload?.percent) || 0,
          received: Number(payload?.received) || 0,
          total: Number(payload?.total) || 0,
        });
      },
    );
    const install = emitter.addListener(
      'InstallProgress',
      (payload: {percent?: number}) => {
        handlers.onInstall?.({
          percent: Number(payload?.percent) || 0,
        });
      },
    );

    return () => {
      download.remove();
      install.remove();
    };
  } catch {
    return () => undefined;
  }
}

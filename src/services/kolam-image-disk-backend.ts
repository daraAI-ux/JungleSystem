import { NativeModules } from 'react-native';

export interface KolamImageDiskWriteResult {
  path: string;
  relativePath: string;
  uri: string;
}

export interface KolamImageDiskExistsResult {
  exists: boolean;
  path?: string;
  uri?: string;
}

export interface KolamImageDiskBackend {
  cacheFileExists(relativePath: string): Promise<KolamImageDiskExistsResult>;
  writeCacheFileBase64(
    relativePath: string,
    base64Content: string,
    mimeType: string,
  ): Promise<KolamImageDiskWriteResult>;
}

interface NativeImageDiskBridge {
  cacheFileExists(relativePath: string): Promise<KolamImageDiskExistsResult>;
  writeCacheFileBase64(
    relativePath: string,
    base64Content: string,
  ): Promise<KolamImageDiskWriteResult>;
}

class MemoryKolamImageDiskBackend implements KolamImageDiskBackend {
  private readonly files = new Map<string, { base64: string; mimeType: string }>();

  async writeCacheFileBase64(
    relativePath: string,
    base64Content: string,
    mimeType: string,
  ): Promise<KolamImageDiskWriteResult> {
    this.files.set(relativePath, { base64: base64Content, mimeType });
    return {
      path: `memory://${relativePath}`,
      relativePath,
      // Jest/Image can render data URIs; production uses native file:// URIs.
      uri: `data:${mimeType};base64,${base64Content}`,
    };
  }

  async cacheFileExists(relativePath: string): Promise<KolamImageDiskExistsResult> {
    const file = this.files.get(relativePath);
    if (!file) {
      return { exists: false };
    }

    return {
      exists: true,
      path: `memory://${relativePath}`,
      uri: `data:${file.mimeType};base64,${file.base64}`,
    };
  }

  clear() {
    this.files.clear();
  }
}

class NativeKolamImageDiskBackend implements KolamImageDiskBackend {
  constructor(private readonly bridge: NativeImageDiskBridge) {}

  writeCacheFileBase64(
    relativePath: string,
    base64Content: string,
    _mimeType: string,
  ) {
    return this.bridge.writeCacheFileBase64(relativePath, base64Content);
  }

  cacheFileExists(relativePath: string) {
    return this.bridge.cacheFileExists(relativePath);
  }
}

const memoryBackend = new MemoryKolamImageDiskBackend();
let activeBackend: KolamImageDiskBackend | null = null;

export function getKolamImageDiskBackend(): KolamImageDiskBackend {
  if (activeBackend) {
    return activeBackend;
  }

  const bridge = NativeModules.KolamWindowsFilePicker as
    | NativeImageDiskBridge
    | undefined;
  if (
    bridge &&
    typeof bridge.writeCacheFileBase64 === 'function' &&
    typeof bridge.cacheFileExists === 'function'
  ) {
    activeBackend = new NativeKolamImageDiskBackend(bridge);
    return activeBackend;
  }

  return memoryBackend;
}

export function setKolamImageDiskBackend(backend: KolamImageDiskBackend | null) {
  activeBackend = backend;
}

export function resetKolamImageDiskBackend() {
  activeBackend = null;
  memoryBackend.clear();
}

export function getMemoryKolamImageDiskBackend() {
  return memoryBackend;
}

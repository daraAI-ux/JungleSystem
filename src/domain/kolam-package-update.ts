export const KOLAM_PACKAGE_UPDATE_APP_ID = 'JungleSystem';
export const KOLAM_PACKAGE_UPDATE_LATEST_PATH =
  '/desktop/jungle-system/latest.json';

export type KolamPackageUpdatePhase =
  | 'idle'
  | 'checking'
  | 'available'
  | 'downloading'
  | 'installing'
  | 'error';

export type KolamPackageInfo = {
  familyName: string;
  name: string;
  packaged: boolean;
  publicVersion: string;
  publisher: string;
  version: string;
};

export type KolamPackageReleaseManifest = {
  appId: string;
  appinstallerUrl?: string;
  artifact?: string;
  releaseNotes?: string;
  sha256?: string;
  sha512?: string;
  size?: number;
  url: string;
  version: string;
};

export type KolamPackageVersionParts = [number, number, number];

export function parseKolamPublicVersion(value: string): KolamPackageVersionParts | null {
  const match = String(value ?? '')
    .trim()
    .match(/^(\d+)\.(\d+)\.(\d+)(?:\.\d+)?$/);
  if (!match) {
    return null;
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function compareKolamPublicVersion(left: string, right: string): number {
  const a = parseKolamPublicVersion(left);
  const b = parseKolamPublicVersion(right);
  if (!a || !b) {
    return 0;
  }

  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) {
      return a[index] - b[index];
    }
  }

  return 0;
}

export function isKolamPackageUpdateNewer(
  currentVersion: string,
  releaseVersion: string,
): boolean {
  return compareKolamPublicVersion(releaseVersion, currentVersion) > 0;
}

export function parseKolamPackageReleaseManifest(
  value: unknown,
): KolamPackageReleaseManifest | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const appId = typeof record.appId === 'string' ? record.appId.trim() : '';
  const version = typeof record.version === 'string' ? record.version.trim() : '';
  const url = typeof record.url === 'string' ? record.url.trim() : '';
  if (
    appId !== KOLAM_PACKAGE_UPDATE_APP_ID ||
    !parseKolamPublicVersion(version) ||
    !isKolamPackageHttpsUrl(url)
  ) {
    return null;
  }

  const sha512 = readOptionalHash(record.sha512);
  const sha256 = readOptionalHash(record.sha256);
  if (!sha512 && !sha256) {
    return null;
  }

  return {
    appId,
    version,
    url,
    sha512,
    sha256,
    size: readOptionalSize(record.size),
    artifact: readOptionalString(record.artifact),
    appinstallerUrl: readOptionalString(record.appinstallerUrl),
    releaseNotes: readOptionalString(record.releaseNotes),
  };
}

export function isKolamPackageHttpsUrl(value: string): boolean {
  return /^https:\/\//i.test(value.trim());
}

export function isKolamPackageUpdateEmptyRelease(message: string): boolean {
  const trimmed = message.trim();
  return (
    trimmed === 'Tidak ada rilis' ||
    trimmed === 'Terbaru' ||
    trimmed === 'Lanjut di App Installer'
  );
}

export function kolamPackageUpdateErrorMessage(
  error: unknown,
  fallback = 'Gagal cek',
): string {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = Number((error as {status?: number}).status);
    if (status === 404) {
      return 'Tidak ada rilis';
    }
    if (status === 401 || status === 403) {
      return 'Akses ditolak';
    }
  }

  if (error instanceof Error) {
    const message = error.message.trim();
    if (
      message === 'Tidak ada rilis' ||
      /release not found/i.test(message) ||
      /\b404\b/.test(message)
    ) {
      return 'Tidak ada rilis';
    }
    if (
      message === 'Login dulu' ||
      message === 'Akses ditolak' ||
      /\b401\b/.test(message) ||
      /\b403\b/.test(message) ||
      /unauthorized|forbidden|restricted|resign/i.test(message)
    ) {
      return message === 'Login dulu' ? 'Login dulu' : 'Akses ditolak';
    }
    if (/hash/i.test(message)) {
      return 'Hash tidak cocok';
    }
    if (/unduh|download/i.test(message)) {
      return 'Gagal unduh';
    }
    if (/pasang|install|deploy/i.test(message)) {
      return 'Gagal pasang';
    }
    if (/update manifest error|^error$/i.test(message)) {
      return fallback;
    }
    if (message && message.length <= 48 && !/^error\b/i.test(message)) {
      return message;
    }
  }

  return fallback;
}

function readOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed || undefined;
}

function readOptionalHash(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const hex = value.replace(/[^0-9a-fA-F]/g, '').toLowerCase();
  if (hex.length !== 64 && hex.length !== 128) {
    return undefined;
  }

  return hex;
}

function readOptionalSize(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }

  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    return Number(value.trim());
  }

  return undefined;
}

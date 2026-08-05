export type KolamAppDownloadPlatform =
  | 'windows'
  | 'debian'
  | 'android'
  | 'ios'
  | 'mac'
  | 'other';

export interface KolamAppDownloadArtifact {
  id: string;
  platform: KolamAppDownloadPlatform;
  platformLabel: string;
  fileKind?: string;
  originalName: string;
  fileSize: number;
  extension?: string;
  md5: string;
  downloadUrl?: string;
}

export interface KolamAppDownloadVersion {
  id: string;
  version: string;
  releaseNotes?: string;
  createdAt?: string;
  artifacts: KolamAppDownloadArtifact[];
}

export interface KolamSupportingApp {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  versionCount: number;
  latestVersion?: string | null;
  versions: KolamAppDownloadVersion[];
}

export function isKolamAppDownloadRoute(route: string): boolean {
  return route.split('?')[0] === '/app-downloads';
}

export function formatKolamAppDownloadFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) {
    return '-';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function getKolamAppDownloadPlatformLabel(
  platform: KolamAppDownloadPlatform | string,
): string {
  switch (platform) {
    case 'windows':
      return 'Windows';
    case 'debian':
      return 'Debian';
    case 'android':
      return 'Android';
    case 'ios':
      return 'iOS';
    case 'mac':
      return 'macOS';
    default:
      return 'Lainnya';
  }
}

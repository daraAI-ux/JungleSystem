import {appConfig} from '../config/app';
import {
  KOLAM_PACKAGE_UPDATE_LATEST_PATH,
  parseKolamPackageReleaseManifest,
  type KolamPackageReleaseManifest,
} from '../domain/kolam-package-update';

export class KolamPackageUpdateRequestError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'KolamPackageUpdateRequestError';
    this.status = status;
  }
}

export function getKolamPackageUpdateLatestUrl(
  baseUrl = appConfig.fileBaseUrl,
): string {
  return `${baseUrl.replace(/\/$/, '')}${KOLAM_PACKAGE_UPDATE_LATEST_PATH}`;
}

export async function fetchKolamPackageLatestRelease(
  baseUrl = appConfig.fileBaseUrl,
): Promise<KolamPackageReleaseManifest> {
  const response = await fetch(getKolamPackageUpdateLatestUrl(baseUrl), {
    headers: {Accept: 'application/json'},
  });

  if (response.status === 404) {
    throw new KolamPackageUpdateRequestError(404, 'Tidak ada rilis');
  }

  if (!response.ok) {
    throw new KolamPackageUpdateRequestError(response.status, 'Gagal cek');
  }

  const payload = (await response.json()) as unknown;
  const manifest = parseKolamPackageReleaseManifest(payload);
  if (!manifest) {
    throw new KolamPackageUpdateRequestError(200, 'Rilis tidak valid');
  }

  return manifest;
}

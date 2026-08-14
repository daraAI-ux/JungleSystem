import {appConfig} from '../config/app';
import {getAccessToken} from '../lib/api-client';
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
  const token = getAccessToken()?.trim();
  if (!token) {
    throw new KolamPackageUpdateRequestError(401, 'Login dulu');
  }

  const response = await fetch(getKolamPackageUpdateLatestUrl(baseUrl), {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const status = Number(response.status);
  if (status === 404) {
    throw new KolamPackageUpdateRequestError(404, 'Tidak ada rilis');
  }
  if (status === 401 || status === 403) {
    throw new KolamPackageUpdateRequestError(status, 'Akses ditolak');
  }

  if (!response.ok) {
    throw new KolamPackageUpdateRequestError(status, 'Gagal cek');
  }

  const payload = (await response.json()) as unknown;
  const manifest = parseKolamPackageReleaseManifest(payload);
  if (!manifest) {
    throw new KolamPackageUpdateRequestError(200, 'Rilis tidak valid');
  }

  return manifest;
}

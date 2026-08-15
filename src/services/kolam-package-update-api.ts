import {appConfig} from '../config/app';
import {canonicalKolamDeviceMacPayload} from '../domain/kolam-device-mac';
import {getRuntimeClientHeaders} from '../domain/runtime-client-contract';
import {
  KOLAM_PACKAGE_UPDATE_LATEST_PATH,
  parseKolamPackageReleaseManifest,
  type KolamPackageReleaseManifest,
} from '../domain/kolam-package-update';
import {getAccessToken, getNativeDeviceIdentity} from '../lib/api-client';

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

  const identity = getNativeDeviceIdentity();
  const macHeader = identity.macAddresses?.length
    ? canonicalKolamDeviceMacPayload(identity.macAddresses)
    : '';
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...getRuntimeClientHeaders({sourceHeader: appConfig.kolamSourceHeader}),
    Authorization: `Bearer ${token}`,
  };

  if (macHeader && identity.macSignature) {
    headers['x-device-mac'] = macHeader;
    headers['x-device-mac-signature'] = identity.macSignature;
  }

  const response = await fetch(getKolamPackageUpdateLatestUrl(baseUrl), {
    headers,
  });

  const status = Number(response.status);
  if (status === 404) {
    throw new KolamPackageUpdateRequestError(404, 'Tidak ada rilis');
  }
  if (status === 401 || status === 403) {
    throw new KolamPackageUpdateRequestError(status, 'Akses ditolak');
  }
  if (status === 429) {
    throw new KolamPackageUpdateRequestError(status, 'Terlalu banyak permintaan');
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

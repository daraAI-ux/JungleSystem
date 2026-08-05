import {appConfig} from '../config/app';
import {
  getKolamAppDownloadPlatformLabel,
  type KolamAppDownloadArtifact,
  type KolamAppDownloadPlatform,
  type KolamAppDownloadVersion,
  type KolamSupportingApp,
} from '../domain/kolam-app-download';
import {apiRequest, buildUrl} from '../lib/api-client';

export async function getKolamAppDownloads(): Promise<KolamSupportingApp[]> {
  const response = await apiRequest<unknown>({
    method: 'GET',
    path: '/app-downloads',
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  return normalizeKolamAppDownloads(response);
}

export function getKolamAppDownloadArtifactUrl({
  appId,
  artifact,
  versionId,
}: {
  appId: string;
  artifact: KolamAppDownloadArtifact;
  versionId: string;
}): string {
  if (artifact.downloadUrl) {
    return artifact.downloadUrl;
  }

  return buildUrl(
    `/app-downloads/${encodeURIComponent(appId)}/versions/${encodeURIComponent(
      versionId,
    )}/artifacts/${encodeURIComponent(artifact.id)}/download`,
    undefined,
    appConfig.kolamApiBaseUrl,
  );
}

function normalizeKolamAppDownloads(response: unknown): KolamSupportingApp[] {
  const value = unwrapData(response);

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeKolamSupportingApp)
    .filter((app): app is KolamSupportingApp => app !== null);
}

function normalizeKolamSupportingApp(value: unknown): KolamSupportingApp | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = getString(value._id ?? value.id);
  const name = getString(value.name);

  if (!id || !name) {
    return null;
  }

  const versions = Array.isArray(value.versions)
    ? value.versions
        .map(normalizeKolamAppDownloadVersion)
        .filter(
          (version): version is KolamAppDownloadVersion => version !== null,
        )
    : [];

  versions.sort(
    (left, right) =>
      new Date(right.createdAt ?? 0).getTime() -
      new Date(left.createdAt ?? 0).getTime(),
  );

  return {
    id,
    name,
    slug: getString(value.slug),
    description: getOptionalString(value.description),
    sortOrder: getNumber(value.sortOrder, 0),
    isActive: value.isActive !== false,
    versionCount: getNumber(value.versionCount, versions.length),
    latestVersion: getOptionalString(value.latestVersion) ?? null,
    versions,
  };
}

function normalizeKolamAppDownloadVersion(
  value: unknown,
): KolamAppDownloadVersion | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = getString(value._id ?? value.id);
  const version = getString(value.version);

  if (!id || !version) {
    return null;
  }

  const artifacts = Array.isArray(value.artifacts)
    ? value.artifacts
        .map(normalizeKolamAppDownloadArtifact)
        .filter(
          (artifact): artifact is KolamAppDownloadArtifact =>
            artifact !== null,
        )
    : [];

  return {
    id,
    version,
    releaseNotes: getOptionalString(value.releaseNotes),
    createdAt: getOptionalString(value.createdAt),
    artifacts,
  };
}

function normalizeKolamAppDownloadArtifact(
  value: unknown,
): KolamAppDownloadArtifact | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = getString(value._id ?? value.id);
  const originalName = getString(value.originalName);
  const md5 = getString(value.md5);

  if (!id || !originalName || !md5) {
    return null;
  }

  const platform = normalizePlatform(value.platform);

  return {
    id,
    platform,
    platformLabel:
      getOptionalString(value.platformLabel) ??
      getKolamAppDownloadPlatformLabel(platform),
    fileKind: getOptionalString(value.fileKind),
    originalName,
    fileSize: getNumber(value.fileSize, 0),
    extension: getOptionalString(value.extension),
    md5,
    downloadUrl: getOptionalString(value.downloadUrl),
  };
}

function normalizePlatform(value: unknown): KolamAppDownloadPlatform {
  return value === 'windows' ||
    value === 'debian' ||
    value === 'android' ||
    value === 'ios' ||
    value === 'mac'
    ? value
    : 'other';
}

function unwrapData(value: unknown): unknown {
  if (isRecord(value) && 'data' in value) {
    return value.data;
  }

  return value;
}

function getNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function getString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getOptionalString(value: unknown): string | undefined {
  const text = getString(value);
  return text || undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

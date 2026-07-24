import { appConfig } from '../config/app';
import { getRuntimeClientHeaders } from '../domain/runtime-client-contract';
import { getAccessToken, getNativeDeviceIdentity } from '../lib/api-client';
import { getLocalDataStore } from './local-data-store';

export type KolamMediaManifestKind = 'image' | 'video' | 'voice';
export type KolamMediaManifestStatus =
  | 'indexed'
  | 'local-file'
  | 'skipped'
  | 'error';

export interface KolamMediaManifestAsset {
  kind: KolamMediaManifestKind;
  label?: string;
  revision?: string;
  scope: string;
  sourceUri: string | null | undefined;
}

interface NormalizedKolamMediaManifestAsset {
  kind: KolamMediaManifestKind;
  label: string;
  revision: string;
  scope: string;
  sourceUri: string;
}

export interface KolamMediaManifestEntry {
  byteLength?: number;
  checkedAt: string;
  id: string;
  kind: KolamMediaManifestKind;
  label?: string;
  mimeType?: string;
  reason?: string;
  revision: string;
  scope: string;
  sourceUri: string;
  status: KolamMediaManifestStatus;
}

export interface KolamMediaManifest {
  entries: KolamMediaManifestEntry[];
  ownerId: string;
  revision: string;
  updatedAt: string;
}

export interface KolamMediaManifestSummary {
  byteLength: number;
  errors: number;
  images: number;
  indexed: number;
  total: number;
  updatedAt: string | null;
  videos: number;
  voices: number;
}

export function getKolamMediaManifestCacheKey(ownerId: string) {
  return `media:manifest:${ownerId}`;
}

export async function readKolamMediaManifest(ownerId: string) {
  return getLocalDataStore().read<KolamMediaManifest>(
    getKolamMediaManifestCacheKey(ownerId),
  );
}

export async function syncKolamMediaManifest({
  assets,
  fetcher = fetch,
  ownerId,
  revision,
  sourceHeader = appConfig.kolamSourceHeader,
}: {
  assets: KolamMediaManifestAsset[];
  fetcher?: typeof fetch;
  ownerId: string;
  revision: string;
  sourceHeader?: string;
}) {
  const key = getKolamMediaManifestCacheKey(ownerId);
  const current = await readKolamMediaManifest(ownerId);
  const uniqueAssets = getUniqueManifestAssets(assets);

  if (current?.revision === revision && manifestMatchesAssets(current.value, uniqueAssets)) {
    return current.value;
  }

  const currentEntries = new Map(
    (current?.value.entries ?? []).map(entry => [
      getManifestEntryCacheKey(entry),
      entry,
    ]),
  );
  const entries = await Promise.all(
    uniqueAssets.map(asset =>
      syncKolamMediaManifestEntry({
        asset,
        currentEntry: currentEntries.get(getManifestAssetCacheKey(asset)),
        fetcher,
        sourceHeader,
      }),
    ),
  );
  const manifest = {
    entries,
    ownerId,
    revision,
    updatedAt: new Date().toISOString(),
  };

  await getLocalDataStore().write({
    key,
    value: manifest,
    revision,
    updatedAt: manifest.updatedAt,
  });

  return manifest;
}

export function summarizeKolamMediaManifest(
  manifest: KolamMediaManifest | null | undefined,
): KolamMediaManifestSummary {
  const entries = manifest?.entries ?? [];

  return {
    byteLength: entries.reduce(
      (total, entry) => total + Math.max(0, entry.byteLength ?? 0),
      0,
    ),
    errors: entries.filter(entry => entry.status === 'error').length,
    images: entries.filter(entry => entry.kind === 'image').length,
    indexed: entries.filter(entry => entry.status === 'indexed').length,
    total: entries.length,
    updatedAt: manifest?.updatedAt ?? null,
    videos: entries.filter(entry => entry.kind === 'video').length,
    voices: entries.filter(entry => entry.kind === 'voice').length,
  };
}

async function syncKolamMediaManifestEntry({
  asset,
  currentEntry,
}: {
  asset: NormalizedKolamMediaManifestAsset;
  currentEntry?: KolamMediaManifestEntry;
  fetcher: typeof fetch;
  sourceHeader: string;
}) {
  if (currentEntry?.revision === asset.revision) {
    return currentEntry;
  }

  const checkedAt = new Date().toISOString();

  if (!isRemoteHttpUri(asset.sourceUri)) {
    return createManifestEntry(asset, {
      checkedAt,
      reason: 'Media belum menjadi URL backend.',
      status: 'local-file',
    });
  }

  return createManifestEntry(asset, {
    checkedAt,
    reason: 'URL backend sudah diindeks lokal; blob besar tidak diunduh otomatis.',
    status: 'indexed',
  });
}

function createManifestEntry(
  asset: NormalizedKolamMediaManifestAsset,
  patch: {
    byteLength?: number;
    checkedAt: string;
    mimeType?: string;
    reason?: string;
    status: KolamMediaManifestStatus;
  },
): KolamMediaManifestEntry {
  return {
    byteLength: patch.byteLength,
    checkedAt: patch.checkedAt,
    id: createStableHash(getManifestAssetCacheKey(asset)),
    kind: asset.kind,
    label: asset.label,
    mimeType: patch.mimeType,
    reason: patch.reason,
    revision: asset.revision,
    scope: asset.scope,
    sourceUri: asset.sourceUri,
    status: patch.status,
  };
}

function getUniqueManifestAssets(assets: KolamMediaManifestAsset[]) {
  return Array.from(
    new Map(
      assets
        .filter(asset => Boolean(asset.sourceUri))
        .map(asset => {
          const sourceUri = asset.sourceUri?.trim() ?? '';
          const normalized: NormalizedKolamMediaManifestAsset = {
            kind: asset.kind,
            label: asset.label ?? '',
            revision: asset.revision ?? sourceUri,
            scope: asset.scope,
            sourceUri,
          };

          return [getManifestAssetCacheKey(normalized), normalized];
        }),
    ).values(),
  );
}

function manifestMatchesAssets(
  manifest: KolamMediaManifest,
  assets: NormalizedKolamMediaManifestAsset[],
) {
  if (manifest.entries.length !== assets.length) {
    return false;
  }

  const entryMap = new Map(
    manifest.entries.map(entry => [getManifestEntryCacheKey(entry), entry]),
  );

  return assets.every(asset => {
    const entry = entryMap.get(getManifestAssetCacheKey(asset));
    return entry?.revision === asset.revision;
  });
}

function getManifestAssetCacheKey(asset: {
  kind: KolamMediaManifestKind;
  scope: string;
  sourceUri: string;
}) {
  return `${asset.kind}:${asset.scope}:${asset.sourceUri}`;
}

function getManifestEntryCacheKey(entry: KolamMediaManifestEntry) {
  return getManifestAssetCacheKey(entry);
}

function createKolamMediaManifestRequestHeaders(
  sourceHeader: string,
  kind: KolamMediaManifestKind,
) {
  const headers: Record<string, string> = {
    Accept:
      kind === 'voice'
        ? 'audio/*,*/*;q=0.8'
        : kind === 'video'
          ? 'video/*,*/*;q=0.8'
          : 'image/*,*/*;q=0.8',
    ...getRuntimeClientHeaders({ sourceHeader }),
  };
  const bearerToken = getAccessToken();
  const nativeIdentity = getNativeDeviceIdentity();
  const macHeader = nativeIdentity.macAddresses?.join(',');

  if (bearerToken) {
    headers.Authorization = `Bearer ${bearerToken}`;
  }

  if (macHeader) {
    headers['x-device-mac'] = macHeader;
  }

  if (nativeIdentity.macSignature) {
    headers['x-device-mac-signature'] = nativeIdentity.macSignature;
  }

  return headers;
}

function isRemoteHttpUri(uri: string) {
  return /^https?:\/\//i.test(uri);
}

function parseHeaderNumber(value: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function createStableHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return `h${Math.abs(hash)}`;
}



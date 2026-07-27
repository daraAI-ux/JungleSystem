import { appConfig } from '../config/app';
import { getRuntimeClientHeaders } from '../domain/runtime-client-contract';
import { getAccessToken, getNativeDeviceIdentity } from '../lib/api-client';
import { getKolamImageDiskBackend } from './kolam-image-disk-backend';
import { getLocalDataStore } from './local-data-store';

/** Metadata only — binary lives on disk (LocalCacheFolder/kolam-images). */
export interface KolamLocalAssetRecord {
  fetchedAt?: string;
  localPath?: string;
  localUri?: string;
  mimeType: string;
  sourceUri: string;
  /** Legacy/test-only fallback. Never write large remote blobs here in production. */
  dataUri?: string;
}

export type KolamLocalAssetWriteInput = KolamLocalAssetRecord & {
  revision?: string;
  scope?: string;
  updatedAt?: string;
};

const MAX_IMAGE_CACHE_BYTES = 8 * 1024 * 1024;
const pendingAssetSyncs = new Map<string, Promise<KolamLocalAssetRecord | null>>();

export function getKolamLocalAssetCacheKey(scope: string, sourceUri: string) {
  return `asset:${scope}:${createStableHash(sourceUri)}`;
}

export function getRenderableKolamLocalAssetUri(
  asset: KolamLocalAssetRecord | null | undefined,
) {
  if (!asset) {
    return null;
  }

  return asset.localUri || asset.dataUri || null;
}

export function createKolamLocalAssetRequestHeaders(
  sourceHeader = appConfig.kolamSourceHeader,
) {
  const headers: Record<string, string> = {
    Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    ...getRuntimeClientHeaders({ sourceHeader }),
  };
  const token = getAccessToken();
  const identity = getNativeDeviceIdentity();
  const macHeader = identity.macAddresses?.join(',');

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (macHeader) {
    headers['x-device-mac'] = macHeader;
  }

  if (identity.macSignature) {
    headers['x-device-mac-signature'] = identity.macSignature;
  }

  return headers;
}

export async function readKolamLocalAsset(
  scope: string,
  sourceUri: string | null | undefined,
) {
  if (!sourceUri) {
    return null;
  }

  const key = getKolamLocalAssetCacheKey(scope, sourceUri);
  const record = await getLocalDataStore().read<KolamLocalAssetRecord>(key);
  if (!record) {
    return null;
  }

  const value = await hydrateLocalAssetFromDisk(record.value);
  return {
    ...record,
    value,
  };
}

export async function writeKolamLocalAsset(
  scope: string,
  asset: KolamLocalAssetWriteInput,
) {
  // Never persist raw image blobs in SQLite. Disk cache must provide localPath/localUri.
  if (!asset.localPath && !asset.localUri) {
    return false;
  }

  const key = getKolamLocalAssetCacheKey(scope, asset.sourceUri);
  const current = await getLocalDataStore().read<KolamLocalAssetRecord>(key);
  const revision = asset.revision ?? asset.sourceUri;
  const nextValue = stripInlineBlobForStore(asset);

  if (
    current?.revision === revision &&
    current.value.localUri === nextValue.localUri &&
    current.value.localPath === nextValue.localPath
  ) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: nextValue,
    revision,
    updatedAt: asset.updatedAt ?? new Date().toISOString(),
  });

  return true;
}

export async function syncKolamLocalAsset({
  fetcher = fetch,
  revision,
  scope,
  sourceHeader = appConfig.kolamSourceHeader,
  sourceUri,
}: {
  fetcher?: typeof fetch;
  revision?: string;
  scope: string;
  sourceHeader?: string;
  sourceUri: string | null | undefined;
}) {
  if (!sourceUri) {
    return null;
  }

  if (isInlineOrLocalUri(sourceUri)) {
    return {
      sourceUri,
      mimeType: guessMimeTypeFromUri(sourceUri),
      localUri: sourceUri,
      fetchedAt: new Date().toISOString(),
    } satisfies KolamLocalAssetRecord;
  }

  const assetRevision = revision ?? sourceUri;
  const key = getKolamLocalAssetCacheKey(scope, sourceUri);
  const cached = await readKolamLocalAsset(scope, sourceUri);
  if (
    cached?.revision === assetRevision &&
    getRenderableKolamLocalAssetUri(cached.value)
  ) {
    return cached.value;
  }

  const pendingKey = `${key}:${assetRevision}`;
  const pending = pendingAssetSyncs.get(pendingKey);
  if (pending) {
    return pending;
  }

  const syncPromise = fetchAndWriteKolamLocalAsset({
    fetcher,
    revision: assetRevision,
    scope,
    sourceHeader,
    sourceUri,
  }).finally(() => {
    pendingAssetSyncs.delete(pendingKey);
  });

  pendingAssetSyncs.set(pendingKey, syncPromise);
  return syncPromise;
}

export async function syncKolamLocalAssetBatch({
  assets,
  fetcher = fetch,
  scope,
  sourceHeader = appConfig.kolamSourceHeader,
}: {
  assets: { revision?: string; sourceUri: string | null | undefined }[];
  fetcher?: typeof fetch;
  scope: string;
  sourceHeader?: string;
}) {
  const uniqueAssets = Array.from(
    new Map(
      assets
        .filter(asset => Boolean(asset.sourceUri))
        .map(asset => [asset.sourceUri as string, asset]),
    ).values(),
  );

  const results = await Promise.allSettled(
    uniqueAssets.map(asset =>
      syncKolamLocalAsset({
        fetcher,
        revision: asset.revision,
        scope,
        sourceHeader,
        sourceUri: asset.sourceUri,
      }),
    ),
  );

  return results.reduce(
    (summary, result) => {
      if (result.status === 'fulfilled' && result.value) {
        summary.synced += 1;
        return summary;
      }

      if (result.status === 'rejected') {
        summary.failed += 1;
      }

      return summary;
    },
    { failed: 0, synced: 0 },
  );
}

async function fetchAndWriteKolamLocalAsset({
  fetcher,
  revision,
  scope,
  sourceHeader,
  sourceUri,
}: {
  fetcher: typeof fetch;
  revision: string;
  scope: string;
  sourceHeader: string;
  sourceUri: string;
}): Promise<KolamLocalAssetRecord | null> {
  const response = await fetcher(sourceUri, {
    headers: createKolamLocalAssetRequestHeaders(sourceHeader),
  });
  if (!response.ok) {
    throw new Error(`Asset fetch failed: ${response.status}`);
  }

  const blob = await response.blob();
  if (typeof blob.size === 'number' && blob.size > MAX_IMAGE_CACHE_BYTES) {
    return null;
  }

  const responseMimeType = response.headers.get('content-type') ?? blob.type;
  const base64 = await readBlobAsBase64(blob);
  const mimeType = getFetchedAssetMimeTypeFromParts(
    sourceUri,
    responseMimeType,
  );
  const normalizedMimeType = isLikelySvgSource(sourceUri, responseMimeType)
    ? 'image/svg+xml'
    : mimeType;
  if (!base64) {
    return null;
  }

  const relativePath = createCacheRelativePath(
    scope,
    sourceUri,
    normalizedMimeType,
  );
  const disk = await getKolamImageDiskBackend().writeCacheFileBase64(
    relativePath,
    base64,
    normalizedMimeType,
  );
  const asset: KolamLocalAssetRecord = {
    sourceUri,
    mimeType: normalizedMimeType,
    localPath: relativePath,
    localUri: disk.uri,
    fetchedAt: new Date().toISOString(),
  };

  await writeKolamLocalAsset(scope, {
    ...asset,
    revision,
    scope,
    updatedAt: asset.fetchedAt,
  });

  return asset;
}

async function hydrateLocalAssetFromDisk(asset: KolamLocalAssetRecord) {
  if (!asset.localPath) {
    return asset;
  }

  const exists = await getKolamImageDiskBackend().cacheFileExists(asset.localPath);
  if (!exists.exists || !exists.uri) {
    return {
      ...asset,
      localUri: undefined,
      localPath: undefined,
    };
  }

  return {
    ...asset,
    localUri: exists.uri,
    localPath: asset.localPath,
  };
}

function stripInlineBlobForStore(
  asset: KolamLocalAssetWriteInput,
): KolamLocalAssetRecord {
  return {
    sourceUri: asset.sourceUri,
    mimeType: asset.mimeType,
    localPath: asset.localPath,
    localUri: asset.localUri,
    fetchedAt: asset.fetchedAt,
    // Keep tiny inline SVGs only when no disk URI exists (legacy callers / tests).
    dataUri:
      !asset.localUri && asset.dataUri && asset.dataUri.length < 64_000
        ? asset.dataUri
        : undefined,
  };
}

function createCacheRelativePath(
  scope: string,
  sourceUri: string,
  mimeType: string,
) {
  const safeScope = scope.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40) || 'general';
  const extension = extensionForMimeType(mimeType, sourceUri);
  return `${safeScope}-${createStableHash(sourceUri)}.${extension}`;
}

function extensionForMimeType(mimeType: string, sourceUri: string) {
  const mime = mimeType.toLowerCase();
  if (mime.includes('jpeg')) return 'jpg';
  if (mime.includes('png')) return 'png';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('gif')) return 'gif';
  if (mime.includes('svg')) return 'svg';
  if (mime.includes('avif')) return 'avif';

  try {
    const pathname = new URL(sourceUri).pathname.toLowerCase();
    const match = pathname.match(/\.([a-z0-9]+)$/);
    if (match?.[1]) {
      return match[1];
    }
  } catch {
    // ignore
  }

  return 'bin';
}

function getFetchedAssetMimeTypeFromParts(
  sourceUri: string,
  responseMimeType: string | null,
) {
  if (isLikelySvgSource(sourceUri, responseMimeType)) {
    return 'image/svg+xml';
  }

  if (responseMimeType?.trim()) {
    return responseMimeType.split(';', 1)[0] || 'image/png';
  }

  return 'image/png';
}

function isLikelySvgSource(sourceUri: string, responseMimeType?: string | null) {
  const mime = responseMimeType?.toLowerCase() ?? '';
  if (mime.includes('svg')) {
    return true;
  }

  try {
    return new URL(sourceUri).pathname.toLowerCase().endsWith('.svg');
  } catch {
    return sourceUri.split('?', 1)[0].toLowerCase().endsWith('.svg');
  }
}

function isInlineOrLocalUri(uri: string) {
  return /^(data:|file:|memory:)/i.test(uri);
}

function guessMimeTypeFromUri(uri: string) {
  if (uri.startsWith('data:')) {
    const match = uri.match(/^data:([^;,]+)/i);
    return match?.[1] || 'image/png';
  }

  return 'image/png';
}

async function readBlobAsBase64(blob: Blob) {
  const blobWithArrayBuffer = blob as Blob & {
    arrayBuffer?: () => Promise<ArrayBuffer>;
  };

  if (typeof blobWithArrayBuffer.arrayBuffer === 'function') {
    const bytes = new Uint8Array(await blobWithArrayBuffer.arrayBuffer());
    return encodeBase64(bytes);
  }

  return readBlobAsBase64ViaDataUrl(blob);
}

function readBlobAsBase64ViaDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const Reader = (globalThis as { FileReader?: typeof FileReader }).FileReader;
    if (!Reader) {
      reject(new Error('FileReader tidak tersedia untuk membaca blob gambar.'));
      return;
    }

    const reader = new Reader();
    reader.onerror = () => reject(reader.error);
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Asset data is not readable as a data URI.'));
        return;
      }

      const payload = reader.result.split(',', 2)[1];
      if (!payload) {
        reject(new Error('Asset data URI tidak memiliki payload base64.'));
        return;
      }

      resolve(payload);
    };
    reader.readAsDataURL(blob);
  });
}

function encodeBase64(bytes: Uint8Array) {
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';

  for (let index = 0; index < bytes.length; index += 3) {
    const remaining = bytes.length - index;
    const a = bytes[index] ?? 0;
    const b = remaining > 1 ? bytes[index + 1] ?? 0 : 0;
    const c = remaining > 2 ? bytes[index + 2] ?? 0 : 0;
    const triplet = (a << 16) | (b << 8) | c;

    output += alphabet[(triplet >> 18) & 63];
    output += alphabet[(triplet >> 12) & 63];
    output += remaining > 1 ? alphabet[(triplet >> 6) & 63] : '=';
    output += remaining > 2 ? alphabet[triplet & 63] : '=';
  }

  return output;
}

function createStableHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return `h${Math.abs(hash)}`;
}

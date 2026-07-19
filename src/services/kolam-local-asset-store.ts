import { appConfig } from '../config/app';
import { getRuntimeClientHeaders } from '../domain/runtime-client-contract';
import { getAccessToken, getNativeDeviceIdentity } from '../lib/api-client';
import { getLocalDataStore } from './local-data-store';

export interface KolamLocalAsset {
  dataUri: string;
  mimeType: string;
  revision: string;
  scope: string;
  sourceUri: string;
  updatedAt: string;
}

const pendingAssetSyncs = new Map<string, Promise<KolamLocalAsset | null>>();

export function getKolamLocalAssetKey(scope: string, sourceUri: string) {
  return `asset:${scope}:${createStableHash(sourceUri)}`;
}

export async function readKolamLocalAsset(scope: string, sourceUri: string) {
  const store = getLocalDataStore();
  const key = getKolamLocalAssetKey(scope, sourceUri);
  const record = await store.read<KolamLocalAsset>(key);
  if (!record) {
    return null;
  }

  const migratedAsset = migrateLegacyLocalAsset(record.value);
  if (migratedAsset !== record.value) {
    await store.write({
      key: record.key,
      value: migratedAsset,
      revision: record.revision,
      updatedAt: new Date().toISOString(),
    });
  }

  return {
    ...record,
    value: migratedAsset,
  };
}

export async function writeKolamLocalAsset(
  scope: string,
  asset: KolamLocalAsset,
) {
  const key = getKolamLocalAssetKey(scope, asset.sourceUri);
  const current = await getLocalDataStore().read<KolamLocalAsset>(key);

  if (current?.revision === asset.revision && current.value.dataUri) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: asset,
    revision: asset.revision,
    updatedAt: asset.updatedAt,
  });

  return true;
}

export async function removeKolamLocalAsset(scope: string, sourceUri: string) {
  await getLocalDataStore().remove(getKolamLocalAssetKey(scope, sourceUri));
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

  const assetRevision = revision ?? sourceUri;
  const key = getKolamLocalAssetKey(scope, sourceUri);
  const cached = await readKolamLocalAsset(scope, sourceUri);
  if (
    cached?.revision === assetRevision &&
    cached.value.dataUri &&
    isUsableCachedAsset(cached.value, sourceUri)
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
  fetcher = fetch,
  assets,
  scope,
  sourceHeader = appConfig.kolamSourceHeader,
}: {
  fetcher?: typeof fetch;
  assets: Array<{
    revision?: string;
    sourceUri: string | null | undefined;
  }>;
  scope: string;
  sourceHeader?: string;
}) {
  const uniqueAssets = Array.from(
    new Map(
      assets
        .filter(asset => Boolean(asset.sourceUri))
        .map(asset => [asset.sourceUri, asset]),
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
}) {
  const response = await fetcher(sourceUri, {
    headers: createKolamLocalAssetRequestHeaders(sourceHeader),
  });
  if (!response.ok) {
    throw new Error(`Asset fetch failed: ${response.status}`);
  }

  const blob = await response.blob();
  const responseMimeType = response.headers.get('content-type') ?? blob.type;
  const dataUri = normalizeFetchedAssetDataUri(
    await readBlobAsDataUri(blob),
    sourceUri,
    responseMimeType,
  );
  const asset = {
    dataUri,
    mimeType: getFetchedAssetMimeType(dataUri, responseMimeType),
    revision,
    scope,
    sourceUri,
    updatedAt: new Date().toISOString(),
  };

  await writeKolamLocalAsset(scope, asset);
  return asset;
}

export function createKolamLocalAssetRequestHeaders(
  sourceHeader = appConfig.kolamSourceHeader,
) {
  const headers: Record<string, string> = {
    Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
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

function isUsableCachedAsset(asset: KolamLocalAsset, sourceUri: string) {
  if (!isLikelySvgSource(sourceUri)) {
    return true;
  }

  return asset.dataUri.startsWith('data:image/svg+xml');
}

function migrateLegacyLocalAsset(asset: KolamLocalAsset): KolamLocalAsset {
  if (
    !isLikelySvgSource(asset.sourceUri, asset.mimeType) ||
    asset.dataUri.startsWith('data:image/svg+xml')
  ) {
    return asset;
  }

  const payload = asset.dataUri.split(',', 2)[1];
  if (!payload) {
    return asset;
  }

  return {
    ...asset,
    dataUri: `data:image/svg+xml;base64,${payload}`,
    mimeType: 'image/svg+xml',
    updatedAt: new Date().toISOString(),
  };
}

function normalizeFetchedAssetDataUri(
  dataUri: string,
  sourceUri: string,
  responseMimeType: string | null,
) {
  if (!isLikelySvgSource(sourceUri, responseMimeType)) {
    return dataUri;
  }

  const payload = dataUri.split(',', 2)[1];
  if (!payload) {
    return dataUri;
  }

  return `data:image/svg+xml;base64,${payload}`;
}

function getFetchedAssetMimeType(
  dataUri: string,
  responseMimeType: string | null,
) {
  if (dataUri.startsWith('data:image/svg+xml')) {
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

function readBlobAsDataUri(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(reader.error);
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Asset data is not readable as a data URI.'));
    };
    reader.readAsDataURL(blob);
  });
}

function createStableHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return `h${Math.abs(hash)}`;
}

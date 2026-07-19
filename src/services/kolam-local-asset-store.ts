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
  return getLocalDataStore().read<KolamLocalAsset>(
    getKolamLocalAssetKey(scope, sourceUri),
  );
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
  sourceUri,
}: {
  fetcher?: typeof fetch;
  revision?: string;
  scope: string;
  sourceUri: string | null | undefined;
}) {
  if (!sourceUri) {
    return null;
  }

  const assetRevision = revision ?? sourceUri;
  const key = getKolamLocalAssetKey(scope, sourceUri);
  const cached = await readKolamLocalAsset(scope, sourceUri);
  if (cached?.revision === assetRevision && cached.value.dataUri) {
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
}: {
  fetcher?: typeof fetch;
  assets: Array<{
    revision?: string;
    sourceUri: string | null | undefined;
  }>;
  scope: string;
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
  sourceUri,
}: {
  fetcher: typeof fetch;
  revision: string;
  scope: string;
  sourceUri: string;
}) {
  const response = await fetcher(sourceUri);
  if (!response.ok) {
    throw new Error(`Asset fetch failed: ${response.status}`);
  }

  const blob = await response.blob();
  const dataUri = await readBlobAsDataUri(blob);
  const asset = {
    dataUri,
    mimeType: blob.type || 'image/png',
    revision,
    scope,
    sourceUri,
    updatedAt: new Date().toISOString(),
  };

  await writeKolamLocalAsset(scope, asset);
  return asset;
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

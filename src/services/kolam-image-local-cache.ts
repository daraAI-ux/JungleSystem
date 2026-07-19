import {
  getKolamLocalAssetKey,
  readKolamLocalAsset,
  syncKolamLocalAsset,
  syncKolamLocalAssetBatch,
  writeKolamLocalAsset,
  type KolamLocalAsset,
} from './kolam-local-asset-store';

export type KolamCachedImage = KolamLocalAsset;

export function getKolamImageCacheKey(scope: string, sourceUri: string) {
  return getKolamLocalAssetKey(scope, sourceUri);
}

export async function readKolamImageCache(scope: string, sourceUri: string) {
  return readKolamLocalAsset(scope, sourceUri);
}

export async function writeKolamImageCache(
  scope: string,
  image: KolamCachedImage,
) {
  return writeKolamLocalAsset(scope, {
    ...image,
    scope,
  });
}

export async function syncKolamImageCache({
  fetcher = fetch,
  revision,
  scope,
  sourceHeader,
  sourceUri,
}: {
  fetcher?: typeof fetch;
  revision?: string;
  scope: string;
  sourceHeader?: string;
  sourceUri: string | null | undefined;
}) {
  return syncKolamLocalAsset({
    fetcher,
    revision,
    scope,
    sourceHeader,
    sourceUri,
  });
}

export async function syncKolamImageCacheBatch({
  fetcher = fetch,
  images,
  scope,
  sourceHeader,
}: {
  fetcher?: typeof fetch;
  images: Array<{
    revision?: string;
    sourceUri: string | null | undefined;
  }>;
  scope: string;
  sourceHeader?: string;
}) {
  return syncKolamLocalAssetBatch({
    assets: images,
    fetcher,
    scope,
    sourceHeader,
  });
}

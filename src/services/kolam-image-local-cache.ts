import {
  getKolamLocalAssetCacheKey,
  getRenderableKolamLocalAssetUri,
  readKolamLocalAsset,
  syncKolamLocalAsset,
  syncKolamLocalAssetBatch,
  writeKolamLocalAsset,
  type KolamLocalAssetRecord,
  type KolamLocalAssetWriteInput,
} from './kolam-local-asset-store';

export type KolamImageCacheRecord = KolamLocalAssetRecord & {
  revision?: string;
  scope: string;
  updatedAt?: string;
};

export function getKolamImageCacheKey(scope: string, sourceUri: string) {
  return getKolamLocalAssetCacheKey(scope, sourceUri);
}

export function getRenderableKolamImageUri(
  image: KolamImageCacheRecord | KolamLocalAssetRecord | null | undefined,
) {
  return getRenderableKolamLocalAssetUri(image);
}

export async function readKolamImageCache(
  scope: string,
  sourceUri: string | null | undefined,
) {
  return readKolamLocalAsset(scope, sourceUri);
}

export function readCachedKolamImage(
  scope: string,
  sourceUri: string | null | undefined,
) {
  return readKolamImageCache(scope, sourceUri);
}

export async function writeKolamImageCache(
  scope: string,
  image: KolamLocalAssetWriteInput & { scope?: string },
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
  images: { revision?: string; sourceUri: string | null | undefined }[];
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

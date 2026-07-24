import type { KolamLocalAssetRecord } from './kolam-local-asset-store';

export type KolamImageCacheRecord = KolamLocalAssetRecord & {
  revision?: string;
  scope: string;
  updatedAt?: string;
};

export function readKolamImageCache(
  _scope: string,
  _sourceUri: string | null | undefined,
) {
  return Promise.resolve<{
    key: string;
    revision?: string;
    updatedAt?: string;
    value: KolamImageCacheRecord;
  } | null>(null);
}

export function readCachedKolamImage(
  scope: string,
  sourceUri: string | null | undefined,
) {
  return readKolamImageCache(scope, sourceUri);
}

export function writeKolamImageCache(
  _scope: string,
  _image: KolamImageCacheRecord,
) {
  return Promise.resolve(false);
}

export async function syncKolamImageCache({
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

  return null;
}

export function syncKolamImageCacheBatch({
  images,
}: {
  fetcher?: typeof fetch;
  images: { revision?: string; sourceUri: string | null | undefined }[];
  scope: string;
}) {
  return Promise.resolve({
    failed: 0,
    synced: images.filter(image => Boolean(image.sourceUri)).length,
  });
}

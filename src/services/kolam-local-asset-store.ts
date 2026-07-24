import { appConfig } from '../config/app';
import { getRuntimeClientHeaders } from '../domain/runtime-client-contract';
import { getAccessToken, getNativeDeviceIdentity } from '../lib/api-client';

export interface KolamLocalAssetRecord {
  dataUri: string;
  fetchedAt?: string;
  mimeType: string;
  sourceUri: string;
}

export type KolamLocalAssetWriteInput = KolamLocalAssetRecord & {
  revision?: string;
  scope?: string;
  updatedAt?: string;
};

export function getKolamLocalAssetCacheKey(scope: string, sourceUri: string) {
  return `asset:${scope}:${sourceUri}`;
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

export function readKolamLocalAsset(
  _scope: string,
  _sourceUri: string | null | undefined,
) {
  return Promise.resolve<{
    key: string;
    revision?: string;
    updatedAt?: string;
    value: KolamLocalAssetRecord;
  } | null>(null);
}

export function writeKolamLocalAsset(
  _scope: string,
  _asset: KolamLocalAssetWriteInput,
) {
  return Promise.resolve(false);
}

export async function syncKolamLocalAsset({
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

  return null;
}

export function syncKolamLocalAssetBatch({
  assets,
}: {
  assets: { revision?: string; sourceUri: string | null | undefined }[];
  fetcher?: typeof fetch;
  scope: string;
  sourceHeader?: string;
}) {
  return Promise.resolve({
    failed: 0,
    synced: assets.filter(asset => Boolean(asset.sourceUri)).length,
  });
}


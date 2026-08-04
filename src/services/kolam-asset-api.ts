import { appConfig } from '../config/app';
import {
  normalizeKolamAssetDepreciationDetail,
  type KolamAssetCreateFromPurchasePayload,
  type KolamAssetDepreciationDetail,
} from '../domain/kolam-asset-depreciation';
import { apiRequest } from '../lib/api-client';

export async function fetchKolamAssetById(
  id: string,
): Promise<KolamAssetDepreciationDetail> {
  const payload = await kolamRequest<unknown>(
    `/assets/${encodeURIComponent(id)}`,
  );
  return normalizeKolamAssetDepreciationDetail(payload);
}

export async function createKolamAssetFromPurchase(
  body: KolamAssetCreateFromPurchasePayload,
): Promise<KolamAssetDepreciationDetail> {
  const payload = await kolamRequest<unknown>('/assets', {
    method: 'POST',
    body,
  });
  return normalizeKolamAssetDepreciationDetail(payload);
}

function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
  } = {},
) {
  return apiRequest<T>({
    method: options.method ?? 'GET',
    path,
    body: options.body,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });
}

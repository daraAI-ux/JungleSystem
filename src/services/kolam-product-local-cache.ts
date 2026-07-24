import {
  createKolamProductDetailRevision,
  createKolamProductListRevision,
  slugifyProductName,
  type KolamProduct,
  type KolamProductListResult,
} from '../domain/kolam-product';
import { getLocalDataStore } from './local-data-store';

const PRODUCT_OWNER = 'kolam';

export function getKolamProductListCacheKey(ownerId = PRODUCT_OWNER) {
  return `products:list:${ownerId}`;
}

export function getKolamProductDetailCacheKey(
  productId: string,
  ownerId = PRODUCT_OWNER,
) {
  return `products:detail:${ownerId}:${productId}`;
}

export async function readKolamProductListCache(ownerId = PRODUCT_OWNER) {
  return getLocalDataStore().read<KolamProductListResult>(
    getKolamProductListCacheKey(ownerId),
  );
}

export async function writeKolamProductListCache(
  result: KolamProductListResult,
  ownerId = PRODUCT_OWNER,
) {
  const key = getKolamProductListCacheKey(ownerId);
  const revision = createKolamProductListRevision(result);
  const cacheValue = createKolamProductListLocalCacheValue(result);
  const current = await getLocalDataStore().read<KolamProductListResult>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: cacheValue,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function readKolamProductDetailCache(
  productId: string,
  ownerId = PRODUCT_OWNER,
) {
  return getLocalDataStore().read<KolamProduct>(
    getKolamProductDetailCacheKey(productId, ownerId),
  );
}

export async function writeKolamProductDetailCache(
  product: KolamProduct,
  ownerId = PRODUCT_OWNER,
) {
  const key = getKolamProductDetailCacheKey(product.id, ownerId);
  const revision = createKolamProductDetailRevision(product);
  const cacheValue = createKolamProductLocalCacheValue(product);
  const current = await getLocalDataStore().read<KolamProduct>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: cacheValue,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function removeKolamProductDetailCache(
  productId: string,
  ownerId = PRODUCT_OWNER,
) {
  await getLocalDataStore().remove(
    getKolamProductDetailCacheKey(productId, ownerId),
  );
}
export async function readKolamProductFromListCacheByRouteKey(
  routeKey: string,
  ownerId = PRODUCT_OWNER,
) {
  const cached = await readKolamProductListCache(ownerId);
  const routeKeySlug = slugifyProductName(routeKey);
  const routeKeyLower = routeKey.toLowerCase();
  const products = cached?.value.data ?? [];

  return (
    products.find(item => {
      const nameSlug = slugifyProductName(item.name);

      return (
        item.id === routeKey ||
        item.id.toLowerCase() === routeKeyLower ||
        item.slug.toLowerCase() === routeKeyLower ||
        nameSlug === routeKeySlug ||
        item.sku.toLowerCase() === routeKeyLower ||
        item.productCode.toLowerCase() === routeKeyLower ||
        item.name.toLowerCase() === routeKeyLower
      );
    }) ?? null
  );
}

function createKolamProductListLocalCacheValue(
  result: KolamProductListResult,
): KolamProductListResult {
  return {
    pagination: result.pagination,
    data: result.data.map(createKolamProductLocalCacheValue),
  };
}

function createKolamProductLocalCacheValue(product: KolamProduct): KolamProduct {
  return stripInlineMediaPayloads(product) as KolamProduct;
}

function stripInlineMediaPayloads(value: unknown, key = ''): unknown {
  if (typeof value === 'string') {
    if (isInlineMediaPayload(value) || isLikelyBinaryMediaField(key, value)) {
      return '';
    }

    return value;
  }

  if (Array.isArray(value)) {
    return value.map(entry => stripInlineMediaPayloads(entry, key));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([entryKey, entry]) => [
      entryKey,
      stripInlineMediaPayloads(entry, entryKey),
    ]),
  );
}

function isInlineMediaPayload(value: string) {
  return /^data:(image|video|audio)\//i.test(value.trim());
}

function isLikelyBinaryMediaField(key: string, value: string) {
  if (value.length < 120000) {
    return false;
  }

  return /^(base64|buffer|blob|bytes|file)$/i.test(key);
}


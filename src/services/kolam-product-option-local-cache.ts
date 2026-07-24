import {
  createKolamProductOptionListRevision,
  type KolamProductOption,
} from '../domain/kolam-product-option';
import { getLocalDataStore } from './local-data-store';

const PRODUCT_OPTION_OWNER = 'kolam';

export function getKolamProductOptionListCacheKey(
  ownerId = PRODUCT_OPTION_OWNER,
) {
  return `product-option:list:${ownerId}`;
}

export async function readKolamProductOptionListCache(
  ownerId = PRODUCT_OPTION_OWNER,
) {
  return getLocalDataStore().read<KolamProductOption[]>(
    getKolamProductOptionListCacheKey(ownerId),
  );
}

export async function writeKolamProductOptionListCache(
  products: KolamProductOption[],
  ownerId = PRODUCT_OPTION_OWNER,
) {
  const key = getKolamProductOptionListCacheKey(ownerId);
  const revision = createKolamProductOptionListRevision(products);
  const current = await getLocalDataStore().read<KolamProductOption[]>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: products,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}
export function getKolamRawProductOptionListCacheKey(
  ownerId = PRODUCT_OPTION_OWNER,
) {
  return `product-option:raw:list:${ownerId}`;
}

export async function readKolamRawProductOptionListCache(
  ownerId = PRODUCT_OPTION_OWNER,
) {
  return getLocalDataStore().read<KolamProductOption[]>(
    getKolamRawProductOptionListCacheKey(ownerId),
  );
}

export async function writeKolamRawProductOptionListCache(
  products: KolamProductOption[],
  ownerId = PRODUCT_OPTION_OWNER,
) {
  const key = getKolamRawProductOptionListCacheKey(ownerId);
  const revision = createKolamProductOptionListRevision(products);
  const current = await getLocalDataStore().read<KolamProductOption[]>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: products,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

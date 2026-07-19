import {
  createKolamBrandDetailRevision,
  createKolamBrandListRevision,
  createKolamBrandLogoRevision,
  slugifyBrandName,
  type KolamBrand,
  type KolamBrandLogoDraft,
} from '../domain/kolam-brand';
import { getLocalDataStore } from './local-data-store';

const BRAND_OWNER = 'kolam';

export function getKolamBrandListCacheKey(ownerId = BRAND_OWNER) {
  return `brand:list:${ownerId}`;
}

export function getKolamBrandDetailCacheKey(
  brandId: string,
  ownerId = BRAND_OWNER,
) {
  return `brand:detail:${ownerId}:${brandId}`;
}

export function getKolamBrandLogoCacheKey(
  brandId: string,
  ownerId = BRAND_OWNER,
) {
  return `brand:logo-meta:${ownerId}:${brandId}`;
}

export async function readKolamBrandListCache(ownerId = BRAND_OWNER) {
  return getLocalDataStore().read<KolamBrand[]>(
    getKolamBrandListCacheKey(ownerId),
  );
}

export async function readKolamBrandFromListCacheByRouteKey(
  routeKey: string,
  ownerId = BRAND_OWNER,
) {
  const cached = await readKolamBrandListCache(ownerId);
  const routeKeySlug = slugifyBrandName(routeKey);
  const routeKeyLower = routeKey.toLowerCase();

  return (
    cached?.value.find(brand => {
      const brandSlug = brand.slug || slugifyBrandName(brand.name);

      return (
        brand.id === routeKey ||
        brand.id.toLowerCase() === routeKeyLower ||
        brand.slug === routeKey ||
        brandSlug === routeKeySlug ||
        brand.name.toLowerCase() === routeKeyLower
      );
    }) ?? null
  );
}

export async function writeKolamBrandListCache(
  brands: KolamBrand[],
  ownerId = BRAND_OWNER,
) {
  const key = getKolamBrandListCacheKey(ownerId);
  const revision = createKolamBrandListRevision(brands);
  const current = await getLocalDataStore().read<KolamBrand[]>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: brands,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function readKolamBrandDetailCache(
  brandId: string,
  ownerId = BRAND_OWNER,
) {
  return getLocalDataStore().read<KolamBrand>(
    getKolamBrandDetailCacheKey(brandId, ownerId),
  );
}

export async function writeKolamBrandDetailCache(
  brand: KolamBrand,
  ownerId = BRAND_OWNER,
) {
  const key = getKolamBrandDetailCacheKey(brand.id, ownerId);
  const revision = createKolamBrandDetailRevision(brand);
  const current = await getLocalDataStore().read<KolamBrand>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: brand,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function removeKolamBrandDetailCache(
  brandId: string,
  ownerId = BRAND_OWNER,
) {
  await getLocalDataStore().remove(
    getKolamBrandDetailCacheKey(brandId, ownerId),
  );
  await getLocalDataStore().remove(getKolamBrandLogoCacheKey(brandId, ownerId));
}

export async function readKolamBrandLogoDraft(
  brandId: string,
  ownerId = BRAND_OWNER,
) {
  return getLocalDataStore().read<KolamBrandLogoDraft>(
    getKolamBrandLogoCacheKey(brandId, ownerId),
  );
}

export async function writeKolamBrandLogoDraft(
  draft: KolamBrandLogoDraft,
  ownerId = BRAND_OWNER,
) {
  const key = getKolamBrandLogoCacheKey(draft.brandId, ownerId);
  const revision = createKolamBrandLogoRevision(draft);
  const current = await getLocalDataStore().read<KolamBrandLogoDraft>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: draft,
    revision,
    updatedAt: draft.updatedAt,
  });

  return true;
}

import {
  createKolamPackingMaterialDetailRevision,
  createKolamPackingMaterialListRevision,
  createKolamPackingOptionListRevision,
  slugifyPackingMaterialName,
  type KolamPackingMaterial,
  type KolamPackingOption,
} from '../domain/kolam-packing-option';
import { getLocalDataStore } from './local-data-store';

const PACKING_OWNER = 'kolam';

export function getKolamPackingOptionListCacheKey(ownerId = PACKING_OWNER) {
  return `packing-option:list:${ownerId}`;
}

export function getKolamPackingMaterialListCacheKey(ownerId = PACKING_OWNER) {
  return `packing-material:list:${ownerId}`;
}

export function getKolamPackingMaterialDetailCacheKey(
  materialId: string,
  ownerId = PACKING_OWNER,
) {
  return `packing-material:detail:${ownerId}:${materialId}`;
}

export async function readKolamPackingOptionListCache(ownerId = PACKING_OWNER) {
  return getLocalDataStore().read<KolamPackingOption[]>(
    getKolamPackingOptionListCacheKey(ownerId),
  );
}

export async function writeKolamPackingOptionListCache(
  items: KolamPackingOption[],
  ownerId = PACKING_OWNER,
) {
  const key = getKolamPackingOptionListCacheKey(ownerId);
  const revision = createKolamPackingOptionListRevision(items);
  const current = await getLocalDataStore().read<KolamPackingOption[]>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: items,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function readKolamPackingMaterialListCache(ownerId = PACKING_OWNER) {
  return getLocalDataStore().read<KolamPackingMaterial[]>(
    getKolamPackingMaterialListCacheKey(ownerId),
  );
}

export async function writeKolamPackingMaterialListCache(
  items: KolamPackingMaterial[],
  ownerId = PACKING_OWNER,
) {
  const key = getKolamPackingMaterialListCacheKey(ownerId);
  const revision = createKolamPackingMaterialListRevision(items);
  const current = await getLocalDataStore().read<KolamPackingMaterial[]>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: items,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function readKolamPackingMaterialDetailCache(
  materialId: string,
  ownerId = PACKING_OWNER,
) {
  return getLocalDataStore().read<KolamPackingMaterial>(
    getKolamPackingMaterialDetailCacheKey(materialId, ownerId),
  );
}

export async function writeKolamPackingMaterialDetailCache(
  item: KolamPackingMaterial,
  ownerId = PACKING_OWNER,
) {
  const key = getKolamPackingMaterialDetailCacheKey(item.id, ownerId);
  const revision = createKolamPackingMaterialDetailRevision(item);
  const current = await getLocalDataStore().read<KolamPackingMaterial>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: item,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function readKolamPackingMaterialFromListCacheByRouteKey(
  routeKey: string,
  ownerId = PACKING_OWNER,
) {
  const cached = await readKolamPackingMaterialListCache(ownerId);
  const routeKeySlug = slugifyPackingMaterialName(routeKey);
  const routeKeyLower = routeKey.toLowerCase();
  const items = cached?.value ?? [];

  return (
    items.find(item => {
      const itemSlug = slugifyPackingMaterialName(item.name);

      return (
        item.id === routeKey ||
        item.id.toLowerCase() === routeKeyLower ||
        itemSlug === routeKeySlug ||
        item.name.toLowerCase() === routeKeyLower
      );
    }) ?? null
  );
}

export async function removeKolamPackingMaterialDetailCache(
  materialId: string,
  ownerId = PACKING_OWNER,
) {
  await getLocalDataStore().remove(
    getKolamPackingMaterialDetailCacheKey(materialId, ownerId),
  );
}

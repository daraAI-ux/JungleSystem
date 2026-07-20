import {
  createKolamIucnStatusDetailRevision,
  createKolamIucnStatusListRevision,
  slugifyIucnStatusName,
  type KolamIucnStatus,
} from '../domain/kolam-iucn-status';
import { getLocalDataStore } from './local-data-store';

const IUCN_OWNER = 'kolam';

export function getKolamIucnStatusListCacheKey(ownerId = IUCN_OWNER) {
  return `iucn-status:list:${ownerId}`;
}

export function getKolamIucnStatusDetailCacheKey(
  id: string,
  ownerId = IUCN_OWNER,
) {
  return `iucn-status:detail:${ownerId}:${id}`;
}

export async function readKolamIucnStatusListCache(ownerId = IUCN_OWNER) {
  return getLocalDataStore().read<KolamIucnStatus[]>(
    getKolamIucnStatusListCacheKey(ownerId),
  );
}

export async function writeKolamIucnStatusListCache(
  items: KolamIucnStatus[],
  ownerId = IUCN_OWNER,
) {
  const key = getKolamIucnStatusListCacheKey(ownerId);
  const revision = createKolamIucnStatusListRevision(items);
  const current = await getLocalDataStore().read<KolamIucnStatus[]>(key);

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

export async function readKolamIucnStatusDetailCache(
  id: string,
  ownerId = IUCN_OWNER,
) {
  return getLocalDataStore().read<KolamIucnStatus>(
    getKolamIucnStatusDetailCacheKey(id, ownerId),
  );
}

export async function writeKolamIucnStatusDetailCache(
  item: KolamIucnStatus,
  ownerId = IUCN_OWNER,
) {
  const key = getKolamIucnStatusDetailCacheKey(item.id, ownerId);
  const revision = createKolamIucnStatusDetailRevision(item);
  const current = await getLocalDataStore().read<KolamIucnStatus>(key);

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

export async function readKolamIucnStatusFromListCacheByRouteKey(
  routeKey: string,
  ownerId = IUCN_OWNER,
) {
  const cached = await readKolamIucnStatusListCache(ownerId);
  const routeKeySlug = slugifyIucnStatusName(routeKey);
  const routeKeyLower = routeKey.toLowerCase();
  const items = cached?.value ?? [];

  return (
    items.find(item => {
      const itemSlug = slugifyIucnStatusName(item.name);

      return (
        item.id === routeKey ||
        item.id.toLowerCase() === routeKeyLower ||
        item.abbreviation.toLowerCase() === routeKeyLower ||
        itemSlug === routeKeySlug ||
        item.name.toLowerCase() === routeKeyLower
      );
    }) ?? null
  );
}

export async function removeKolamIucnStatusDetailCache(
  id: string,
  ownerId = IUCN_OWNER,
) {
  await getLocalDataStore().remove(getKolamIucnStatusDetailCacheKey(id, ownerId));
}

import {
  createKolamUnitDetailRevision,
  createKolamUnitListRevision,
  slugifyUnitName,
  type KolamUnit,
} from '../domain/kolam-unit';
import { getLocalDataStore } from './local-data-store';

const UNIT_OWNER = 'kolam';

export function getKolamUnitListCacheKey(ownerId = UNIT_OWNER) {
  return `unit:list:${ownerId}`;
}

export function getKolamUnitDetailCacheKey(
  unitId: string,
  ownerId = UNIT_OWNER,
) {
  return `unit:detail:${ownerId}:${unitId}`;
}

export async function readKolamUnitListCache(ownerId = UNIT_OWNER) {
  return getLocalDataStore().read<KolamUnit[]>(
    getKolamUnitListCacheKey(ownerId),
  );
}

export async function writeKolamUnitListCache(
  units: KolamUnit[],
  ownerId = UNIT_OWNER,
) {
  const key = getKolamUnitListCacheKey(ownerId);
  const revision = createKolamUnitListRevision(units);
  const current = await getLocalDataStore().read<KolamUnit[]>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: units,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function readKolamUnitDetailCache(
  unitId: string,
  ownerId = UNIT_OWNER,
) {
  return getLocalDataStore().read<KolamUnit>(
    getKolamUnitDetailCacheKey(unitId, ownerId),
  );
}

export async function writeKolamUnitDetailCache(
  unit: KolamUnit,
  ownerId = UNIT_OWNER,
) {
  const key = getKolamUnitDetailCacheKey(unit.id, ownerId);
  const revision = createKolamUnitDetailRevision(unit);
  const current = await getLocalDataStore().read<KolamUnit>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: unit,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function readKolamUnitFromListCacheByRouteKey(
  routeKey: string,
  ownerId = UNIT_OWNER,
) {
  const cached = await readKolamUnitListCache(ownerId);
  const routeKeySlug = slugifyUnitName(routeKey);
  const routeKeyLower = routeKey.toLowerCase();
  const units = cached?.value ?? [];

  return (
    units.find(unit => {
      const unitSlug = slugifyUnitName(unit.name);

      return (
        unit.id === routeKey ||
        unit.id.toLowerCase() === routeKeyLower ||
        unit.initial.toLowerCase() === routeKeyLower ||
        unitSlug === routeKeySlug ||
        unit.name.toLowerCase() === routeKeyLower
      );
    }) ?? null
  );
}

export async function removeKolamUnitDetailCache(
  unitId: string,
  ownerId = UNIT_OWNER,
) {
  await getLocalDataStore().remove(getKolamUnitDetailCacheKey(unitId, ownerId));
}

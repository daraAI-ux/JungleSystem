import {
  createKolamSpeciesDetailRevision,
  createKolamSpeciesListRevision,
  slugifySpeciesName,
  type KolamSpecies,
} from '../domain/kolam-species';
import { getLocalDataStore } from './local-data-store';

const SPECIES_OWNER = 'kolam';

export function getKolamSpeciesListCacheKey(ownerId = SPECIES_OWNER) {
  return `species:list:${ownerId}`;
}

export function getKolamSpeciesDetailCacheKey(
  speciesId: string,
  ownerId = SPECIES_OWNER,
) {
  return `species:detail:${ownerId}:${speciesId}`;
}

export async function readKolamSpeciesListCache(ownerId = SPECIES_OWNER) {
  return getLocalDataStore().read<KolamSpecies[]>(
    getKolamSpeciesListCacheKey(ownerId),
  );
}

export async function writeKolamSpeciesListCache(
  species: KolamSpecies[],
  ownerId = SPECIES_OWNER,
) {
  const key = getKolamSpeciesListCacheKey(ownerId);
  const revision = createKolamSpeciesListRevision(species);
  const current = await getLocalDataStore().read<KolamSpecies[]>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: species,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function readKolamSpeciesDetailCache(
  speciesId: string,
  ownerId = SPECIES_OWNER,
) {
  return getLocalDataStore().read<KolamSpecies>(
    getKolamSpeciesDetailCacheKey(speciesId, ownerId),
  );
}

export async function writeKolamSpeciesDetailCache(
  species: KolamSpecies,
  ownerId = SPECIES_OWNER,
) {
  const key = getKolamSpeciesDetailCacheKey(species.id, ownerId);
  const revision = createKolamSpeciesDetailRevision(species);
  const current = await getLocalDataStore().read<KolamSpecies>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: species,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function readKolamSpeciesFromListCacheByRouteKey(
  routeKey: string,
  ownerId = SPECIES_OWNER,
) {
  const cached = await readKolamSpeciesListCache(ownerId);
  const routeKeySlug = slugifySpeciesName(routeKey);
  const routeKeyLower = routeKey.toLowerCase();
  const species = cached?.value ?? [];

  return (
    species.find(item => {
      const scientificSlug = slugifySpeciesName(item.scientificName);
      const displaySlug = slugifySpeciesName(item.displayName);

      return (
        item.id === routeKey ||
        item.id.toLowerCase() === routeKeyLower ||
        item.slug.toLowerCase() === routeKeyLower ||
        scientificSlug === routeKeySlug ||
        displaySlug === routeKeySlug ||
        item.scientificName.toLowerCase() === routeKeyLower ||
        item.displayName.toLowerCase() === routeKeyLower
      );
    }) ?? null
  );
}

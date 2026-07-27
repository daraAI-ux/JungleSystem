import {
  createKolamSpeciesDetailRevision,
  createKolamSpeciesListRevision,
  slugifySpeciesName,
  type KolamSpecies,
  type KolamSpeciesListResult,
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
  return getLocalDataStore().read<KolamSpeciesListResult>(
    getKolamSpeciesListCacheKey(ownerId),
  );
}

export async function writeKolamSpeciesListCache(
  result: KolamSpeciesListResult,
  ownerId = SPECIES_OWNER,
) {
  const key = getKolamSpeciesListCacheKey(ownerId);
  const revision = createKolamSpeciesListRevision(result);
  const cacheValue = createKolamSpeciesListLocalCacheValue(result);
  const current = await getLocalDataStore().read<KolamSpeciesListResult>(key);

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
  const cacheSpecies = createKolamSpeciesLocalCacheValue(species);
  const current = await getLocalDataStore().read<KolamSpecies>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: cacheSpecies,
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
  const species = cached?.value.data ?? [];

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

function createKolamSpeciesListLocalCacheValue(
  result: KolamSpeciesListResult,
): KolamSpeciesListResult {
  return {
    pagination: result.pagination,
    data: result.data.map(createKolamSpeciesLocalCacheValue),
  };
}

function createKolamSpeciesLocalCacheValue(species: KolamSpecies): KolamSpecies {
  return stripInlineMediaPayloads(species) as KolamSpecies;
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

import {
  createKolamTaxonomyDetailRevision,
  createKolamTaxonomyListRevision,
  slugifyTaxonomyName,
  type KolamTaxonomy,
} from '../domain/kolam-taxonomy';
import { getLocalDataStore } from './local-data-store';

const TAXONOMY_OWNER = 'kolam';

export function getKolamTaxonomyListCacheKey(ownerId = TAXONOMY_OWNER) {
  return `taxonomy:list:${ownerId}`;
}

export function getKolamTaxonomyDetailCacheKey(
  taxonomyId: string,
  ownerId = TAXONOMY_OWNER,
) {
  return `taxonomy:detail:${ownerId}:${taxonomyId}`;
}

export async function readKolamTaxonomyListCache(ownerId = TAXONOMY_OWNER) {
  return getLocalDataStore().read<KolamTaxonomy[]>(
    getKolamTaxonomyListCacheKey(ownerId),
  );
}

export async function writeKolamTaxonomyListCache(
  taxonomies: KolamTaxonomy[],
  ownerId = TAXONOMY_OWNER,
) {
  const key = getKolamTaxonomyListCacheKey(ownerId);
  const revision = createKolamTaxonomyListRevision(taxonomies);
  const current = await getLocalDataStore().read<KolamTaxonomy[]>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: taxonomies,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function readKolamTaxonomyDetailCache(
  taxonomyId: string,
  ownerId = TAXONOMY_OWNER,
) {
  return getLocalDataStore().read<KolamTaxonomy>(
    getKolamTaxonomyDetailCacheKey(taxonomyId, ownerId),
  );
}

export async function writeKolamTaxonomyDetailCache(
  taxonomy: KolamTaxonomy,
  ownerId = TAXONOMY_OWNER,
) {
  const key = getKolamTaxonomyDetailCacheKey(taxonomy.id, ownerId);
  const revision = createKolamTaxonomyDetailRevision(taxonomy);
  const current = await getLocalDataStore().read<KolamTaxonomy>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: taxonomy,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function readKolamTaxonomyFromListCacheByRouteKey(
  routeKey: string,
  ownerId = TAXONOMY_OWNER,
) {
  const cached = await readKolamTaxonomyListCache(ownerId);
  const routeKeySlug = slugifyTaxonomyName(routeKey);
  const routeKeyLower = routeKey.toLowerCase();
  const taxonomies = cached?.value ?? [];

  return (
    taxonomies.find(taxonomy => {
      const taxonomySlug = slugifyTaxonomyName(taxonomy.name);

      return (
        taxonomy.id === routeKey ||
        taxonomy.id.toLowerCase() === routeKeyLower ||
        taxonomy.slug.toLowerCase() === routeKeyLower ||
        taxonomySlug === routeKeySlug ||
        taxonomy.name.toLowerCase() === routeKeyLower
      );
    }) ?? null
  );
}

export async function removeKolamTaxonomyDetailCache(
  taxonomyId: string,
  ownerId = TAXONOMY_OWNER,
) {
  await getLocalDataStore().remove(
    getKolamTaxonomyDetailCacheKey(taxonomyId, ownerId),
  );
}

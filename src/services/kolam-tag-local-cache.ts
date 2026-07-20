import {
  createKolamTagDetailRevision,
  createKolamTagListRevision,
  slugifyTagName,
  type KolamTag,
} from '../domain/kolam-tag';
import { getLocalDataStore } from './local-data-store';

const TAG_OWNER = 'kolam';

export function getKolamTagListCacheKey(ownerId = TAG_OWNER) {
  return `tag:list:${ownerId}`;
}

export function getKolamTagDetailCacheKey(
  tagId: string,
  ownerId = TAG_OWNER,
) {
  return `tag:detail:${ownerId}:${tagId}`;
}

export async function readKolamTagListCache(ownerId = TAG_OWNER) {
  return getLocalDataStore().read<KolamTag[]>(getKolamTagListCacheKey(ownerId));
}

export async function writeKolamTagListCache(
  tags: KolamTag[],
  ownerId = TAG_OWNER,
) {
  const key = getKolamTagListCacheKey(ownerId);
  const revision = createKolamTagListRevision(tags);
  const current = await getLocalDataStore().read<KolamTag[]>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: tags,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function readKolamTagDetailCache(
  tagId: string,
  ownerId = TAG_OWNER,
) {
  return getLocalDataStore().read<KolamTag>(
    getKolamTagDetailCacheKey(tagId, ownerId),
  );
}

export async function writeKolamTagDetailCache(
  tag: KolamTag,
  ownerId = TAG_OWNER,
) {
  const key = getKolamTagDetailCacheKey(tag.id, ownerId);
  const revision = createKolamTagDetailRevision(tag);
  const current = await getLocalDataStore().read<KolamTag>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: tag,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function readKolamTagFromListCacheByRouteKey(
  routeKey: string,
  ownerId = TAG_OWNER,
) {
  const cached = await readKolamTagListCache(ownerId);
  const routeKeySlug = slugifyTagName(routeKey);
  const routeKeyLower = routeKey.toLowerCase();
  const tags = cached?.value ?? [];

  return (
    tags.find(tag => {
      const tagSlug = tag.slug || slugifyTagName(tag.name);

      return (
        tag.id === routeKey ||
        tag.id.toLowerCase() === routeKeyLower ||
        tag.slug === routeKey ||
        tagSlug === routeKeySlug ||
        tag.name.toLowerCase() === routeKeyLower
      );
    }) ?? null
  );
}

export async function removeKolamTagDetailCache(
  tagId: string,
  ownerId = TAG_OWNER,
) {
  await getLocalDataStore().remove(getKolamTagDetailCacheKey(tagId, ownerId));
}

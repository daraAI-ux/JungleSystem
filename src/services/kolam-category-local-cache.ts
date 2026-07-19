import {
  createKolamCategoryDetailRevision,
  createKolamCategoryIconRevision,
  createKolamCategoryListRevision,
  flattenAllCategories,
  slugifyCategoryName,
  type KolamCategory,
  type KolamCategoryIconDraft,
} from '../domain/kolam-category';
import { getLocalDataStore } from './local-data-store';

const CATEGORY_OWNER = 'kolam';

export function getKolamCategoryListCacheKey(ownerId = CATEGORY_OWNER) {
  return `category:list:${ownerId}`;
}

export function getKolamCategoryDetailCacheKey(
  categoryId: string,
  ownerId = CATEGORY_OWNER,
) {
  return `category:detail:${ownerId}:${categoryId}`;
}

export function getKolamCategoryIconCacheKey(
  categoryId: string,
  ownerId = CATEGORY_OWNER,
) {
  return `category:icon-meta:${ownerId}:${categoryId}`;
}

export async function readKolamCategoryListCache(ownerId = CATEGORY_OWNER) {
  return getLocalDataStore().read<KolamCategory[]>(
    getKolamCategoryListCacheKey(ownerId),
  );
}

export async function writeKolamCategoryListCache(
  categories: KolamCategory[],
  ownerId = CATEGORY_OWNER,
) {
  const key = getKolamCategoryListCacheKey(ownerId);
  const revision = createKolamCategoryListRevision(categories);
  const current = await getLocalDataStore().read<KolamCategory[]>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: categories,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function readKolamCategoryDetailCache(
  categoryId: string,
  ownerId = CATEGORY_OWNER,
) {
  return getLocalDataStore().read<KolamCategory>(
    getKolamCategoryDetailCacheKey(categoryId, ownerId),
  );
}

export async function writeKolamCategoryDetailCache(
  category: KolamCategory,
  ownerId = CATEGORY_OWNER,
) {
  const key = getKolamCategoryDetailCacheKey(category.id, ownerId);
  const revision = createKolamCategoryDetailRevision(category);
  const current = await getLocalDataStore().read<KolamCategory>(key);

  if (current?.revision === revision) {
    return false;
  }

  await getLocalDataStore().write({
    key,
    value: category,
    revision,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

export async function readKolamCategoryFromListCacheByRouteKey(
  routeKey: string,
  ownerId = CATEGORY_OWNER,
) {
  const cached = await readKolamCategoryListCache(ownerId);
  const routeKeySlug = slugifyCategoryName(routeKey);
  const routeKeyLower = routeKey.toLowerCase();
  const categories = cached?.value ? flattenAllCategories(cached.value) : [];

  return (
    categories.find(category => {
      const categorySlug = category.slug || slugifyCategoryName(category.name);

      return (
        category.id === routeKey ||
        category.id.toLowerCase() === routeKeyLower ||
        category.slug === routeKey ||
        categorySlug === routeKeySlug ||
        category.name.toLowerCase() === routeKeyLower
      );
    }) ?? null
  );
}

export async function removeKolamCategoryDetailCache(
  categoryId: string,
  ownerId = CATEGORY_OWNER,
) {
  await getLocalDataStore().remove(
    getKolamCategoryDetailCacheKey(categoryId, ownerId),
  );
  await getLocalDataStore().remove(
    getKolamCategoryIconCacheKey(categoryId, ownerId),
  );
}

export async function readKolamCategoryIconDraft(
  categoryId: string,
  ownerId = CATEGORY_OWNER,
) {
  return getLocalDataStore().read<KolamCategoryIconDraft>(
    getKolamCategoryIconCacheKey(categoryId, ownerId),
  );
}

export async function writeKolamCategoryIconDraft(
  draft: KolamCategoryIconDraft,
  ownerId = CATEGORY_OWNER,
) {
  const key = getKolamCategoryIconCacheKey(draft.categoryId, ownerId);
  const revision = createKolamCategoryIconRevision(draft);
  const current = await getLocalDataStore().read<KolamCategoryIconDraft>(key);

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

import { getKolamFileUrl } from '../lib/file-url';

export type KolamCategoryStatus = 'active' | 'inactive';

export interface KolamCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconUrl: string | null;
  photos: string[];
  productCount: number;
  serviceCount: number;
  speciesCount: number;
  customFieldCount: number;
  childrenCount: number;
  parentId: string | null;
  parentName: string | null;
  level: number;
  showInMarketplace: boolean;
  marketplaceOrder: number;
  status: KolamCategoryStatus;
  children: KolamCategory[];
  createdAt?: string;
  updatedAt?: string;
  raw: unknown;
}

export interface KolamCategoryFormState {
  id?: string;
  name: string;
  description: string;
  parentId: string;
  iconLocalUri: string;
  iconRemoteUrl: string;
  showInMarketplace: boolean;
  marketplaceOrder: string;
}

export interface KolamCategoryIconDraft {
  categoryId: string;
  categorySlug: string;
  localUri: string;
  remoteUrl: string | null;
  contentHash: string;
  serverHash: string | null;
  dirty: boolean;
  syncState: 'pending' | 'synced' | 'conflict' | 'failed';
  lastSyncedAt: string | null;
  lastAttemptHash: string | null;
  updatedAt: string;
}

export const KOLAM_CATEGORY_BREADCRUMB_ROOT = '/label-dan-field/kategori';

export function isKolamCategoryRoute(route: string) {
  return (
    route === '/category' ||
    route === '/category/create' ||
    route === KOLAM_CATEGORY_BREADCRUMB_ROOT ||
    route === `${KOLAM_CATEGORY_BREADCRUMB_ROOT}/baru` ||
    route.startsWith('/category/') ||
    route.startsWith(`${KOLAM_CATEGORY_BREADCRUMB_ROOT}/`)
  );
}

export function getKolamCategoryBreadcrumbPath(
  mode: 'list' | 'detail' | 'edit' | 'new',
  category?: Pick<KolamCategory, 'name' | 'slug'> | null,
) {
  if (mode === 'new') {
    return `${KOLAM_CATEGORY_BREADCRUMB_ROOT}/baru`;
  }

  if ((mode === 'detail' || mode === 'edit') && category) {
    return `${KOLAM_CATEGORY_BREADCRUMB_ROOT}/${category.name}`;
  }

  return KOLAM_CATEGORY_BREADCRUMB_ROOT;
}

export function createEmptyKolamCategoryFormState(): KolamCategoryFormState {
  return {
    name: '',
    description: '',
    parentId: '',
    iconLocalUri: '',
    iconRemoteUrl: '',
    showInMarketplace: false,
    marketplaceOrder: '0',
  };
}

export function createKolamCategoryFormState(
  category: KolamCategory,
): KolamCategoryFormState {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    parentId: category.parentId ?? '',
    iconLocalUri: '',
    iconRemoteUrl: category.iconUrl ?? '',
    showInMarketplace: category.showInMarketplace,
    marketplaceOrder: String(category.marketplaceOrder),
  };
}

export function createKolamCategorySavePayload(form: KolamCategoryFormState) {
  const marketplaceOrder = Number(form.marketplaceOrder);

  return {
    name: form.name.trim(),
    description: form.description.trim(),
    parent: form.parentId.trim() || null,
    showInMarketplace: form.showInMarketplace,
    marketplaceOrder: Number.isFinite(marketplaceOrder)
      ? Math.max(0, Math.floor(marketplaceOrder))
      : 0,
  };
}

export function normalizeKolamCategory(payload: unknown): KolamCategory {
  const record = asRecord(payload);
  const id = getString(record, '_id') || getString(record, 'id');
  const name = getString(record, 'name') || 'Kategori tanpa nama';
  const photos = getStringArray(record.photos);
  const iconPath = getString(record, 'icon') || photos[0] || null;
  const parent = normalizeParent(record.parent);
  const children = getArray(record.children).map(normalizeKolamCategory);

  return {
    id: id || slugifyCategoryName(name),
    name,
    slug: slugifyCategoryName(name),
    description: cleanCategoryDescription(getString(record, 'description')),
    iconUrl: getKolamFileUrl(iconPath),
    photos,
    productCount:
      getNumber(record, 'totalProducts') ??
      getNumber(record, 'productCount') ??
      getArray(record.products).length,
    serviceCount:
      getNumber(record, 'totalServices') ??
      getNumber(record, 'serviceCount') ??
      getArray(record.services).length,
    speciesCount:
      getNumber(record, 'totalLifeStock') ??
      getNumber(record, 'totalSpecies') ??
      getNumber(record, 'speciesCount') ??
      getArray(record.species).length,
    customFieldCount: getArray(record.customFields).length,
    childrenCount:
      getNumber(record, 'childrenCount') ?? getArray(record.children).length,
    parentId: parent.id,
    parentName: parent.name,
    level: getNumber(record, 'level') ?? 0,
    showInMarketplace:
      getBoolean(record, 'showInMarketplace') ??
      getBoolean(record, 'show_in_marketplace') ??
      false,
    marketplaceOrder:
      getNumber(record, 'marketplaceOrder') ??
      getNumber(record, 'marketplace_order') ??
      0,
    status: record.status === 'inactive' ? 'inactive' : 'active',
    children,
    createdAt: getString(record, 'createdAt') || undefined,
    updatedAt: getString(record, 'updatedAt') || undefined,
    raw: payload,
  };
}

export function normalizeKolamCategoryList(payload: unknown): KolamCategory[] {
  const root = unwrapData(payload);
  const rootRecord = asRecord(root);
  const list: unknown[] = Array.isArray(root)
    ? root
    : Array.isArray(rootRecord.categories)
    ? rootRecord.categories
    : Array.isArray(rootRecord.items)
    ? rootRecord.items
    : [];

  return list.map(normalizeKolamCategory);
}

export function normalizeKolamCategoryDetail(payload: unknown): KolamCategory {
  return normalizeKolamCategory(unwrapData(payload));
}

export function flattenKolamCategoryTree(
  categories: KolamCategory[],
  expandedIds: Set<string>,
  level = 0,
): KolamCategory[] {
  return categories.flatMap(category => {
    const normalized = { ...category, level };
    if (!expandedIds.has(category.id) || !category.children.length) {
      return [normalized];
    }

    return [
      normalized,
      ...flattenKolamCategoryTree(category.children, expandedIds, level + 1),
    ];
  });
}

export function buildKolamCategoryTree(
  categories: KolamCategory[],
): KolamCategory[] {
  if (categories.some(category => category.children.length)) {
    return categories;
  }

  const byId = new Map(
    categories.map(category => [
      category.id,
      { ...category, children: [] as KolamCategory[] },
    ]),
  );
  const roots: KolamCategory[] = [];

  byId.forEach(category => {
    if (category.parentId) {
      const parent = byId.get(category.parentId);
      if (parent) {
        parent.children.push({
          ...category,
          level: parent.level + 1,
          parentName: parent.name,
        });
        parent.childrenCount = Math.max(
          parent.childrenCount,
          parent.children.length,
        );
        return;
      }
    }

    roots.push(category);
  });

  return roots;
}

export function getKolamCategoryTreeIds(categories: KolamCategory[]) {
  const ids: string[] = [];
  const visit = (items: KolamCategory[]) => {
    items.forEach(category => {
      if (category.children.length) {
        ids.push(category.id);
        visit(category.children);
      }
    });
  };

  visit(categories);
  return ids;
}

export function filterKolamCategoryTree(
  categories: KolamCategory[],
  search: string,
): KolamCategory[] {
  const query = search.trim().toLowerCase();
  if (!query) {
    return categories;
  }

  return categories
    .map(category => {
      const children = filterKolamCategoryTree(category.children, search);
      const matched =
        category.name.toLowerCase().includes(query) ||
        category.description.toLowerCase().includes(query);

      return matched || children.length ? { ...category, children } : null;
    })
    .filter((category): category is KolamCategory => Boolean(category));
}

export function createKolamCategoryIconDraft(params: {
  category: Pick<KolamCategory, 'id' | 'slug' | 'iconUrl'>;
  localUri: string;
  remoteUrl?: string | null;
  previous?: KolamCategoryIconDraft | null;
  now?: string;
}): KolamCategoryIconDraft {
  const contentHash = createStableHash(params.localUri.trim());
  const previous = params.previous;
  const remoteUrl = params.remoteUrl ?? params.category.iconUrl ?? null;
  const serverHash = remoteUrl ? createStableHash(remoteUrl) : null;
  const alreadySynced =
    previous?.syncState === 'synced' &&
    previous.contentHash === contentHash &&
    previous.serverHash === serverHash;

  return {
    categoryId: params.category.id,
    categorySlug: params.category.slug,
    localUri: params.localUri.trim(),
    remoteUrl,
    contentHash,
    serverHash,
    dirty: !alreadySynced,
    syncState: alreadySynced ? 'synced' : 'pending',
    lastSyncedAt: alreadySynced ? previous.lastSyncedAt : null,
    lastAttemptHash:
      previous?.lastAttemptHash === contentHash
        ? previous.lastAttemptHash
        : null,
    updatedAt: params.now ?? new Date().toISOString(),
  };
}

export function shouldSyncKolamCategoryIcon(
  draft: KolamCategoryIconDraft | null,
  remoteUrl?: string | null,
) {
  if (!draft || !draft.dirty || draft.syncState === 'synced') {
    return false;
  }

  const remoteHash = remoteUrl ? createStableHash(remoteUrl) : draft.serverHash;

  if (draft.lastAttemptHash === draft.contentHash) {
    return false;
  }

  return draft.contentHash !== remoteHash;
}

export function createKolamCategoryIconRevision(
  draft: Pick<
    KolamCategoryIconDraft,
    'categoryId' | 'contentHash' | 'dirty' | 'serverHash' | 'syncState'
  >,
) {
  return createStableHash({
    categoryId: draft.categoryId,
    contentHash: draft.contentHash,
    dirty: draft.dirty,
    serverHash: draft.serverHash,
    syncState: draft.syncState,
  });
}

export function createKolamCategoryListRevision(categories: KolamCategory[]) {
  return createStableHash(
    flattenAllCategories(categories).map(category => ({
      id: category.id,
      name: category.name,
      productCount: category.productCount,
      serviceCount: category.serviceCount,
      speciesCount: category.speciesCount,
      childrenCount: category.childrenCount,
      iconUrl: category.iconUrl,
      marketplaceOrder: category.marketplaceOrder,
      showInMarketplace: category.showInMarketplace,
      updatedAt: category.updatedAt,
    })),
  );
}

export function createKolamCategoryDetailRevision(category: KolamCategory) {
  return createStableHash({
    id: category.id,
    name: category.name,
    description: category.description,
    parentId: category.parentId,
    productCount: category.productCount,
    serviceCount: category.serviceCount,
    speciesCount: category.speciesCount,
    iconUrl: category.iconUrl,
    marketplaceOrder: category.marketplaceOrder,
    showInMarketplace: category.showInMarketplace,
    updatedAt: category.updatedAt,
  });
}

export function flattenAllCategories(
  categories: KolamCategory[],
): KolamCategory[] {
  return categories.flatMap(category => [
    category,
    ...flattenAllCategories(category.children),
  ]);
}

export function slugifyCategoryName(name: string) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'kategori'
  );
}

function cleanCategoryDescription(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeParent(value: unknown) {
  if (typeof value === 'string') {
    return { id: value, name: null };
  }

  const parent = asRecord(value);
  const id = getString(parent, '_id') || getString(parent, 'id');
  return {
    id: id || null,
    name: getString(parent, 'name') || null,
  };
}

function unwrapData(payload: unknown) {
  const record = asRecord(payload);
  return Object.prototype.hasOwnProperty.call(record, 'data')
    ? record.data
    : payload;
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value : '';
}

function getNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
}

function getBoolean(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') {
      return true;
    }

    if (value.toLowerCase() === 'false') {
      return false;
    }
  }

  return undefined;
}

function getArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function getStringArray(value: unknown): string[] {
  return getArray(value).filter(
    (entry): entry is string => typeof entry === 'string',
  );
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function createStableHash(value: unknown) {
  const input = typeof value === 'string' ? value : JSON.stringify(value);
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }

  return `h${Math.abs(hash)}`;
}



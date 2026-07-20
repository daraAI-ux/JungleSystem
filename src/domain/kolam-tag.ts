export type KolamTagStatus = 'active' | 'inactive';

export interface KolamTagUsageItem {
  id: string;
  name: string;
  sku: string;
  slug: string;
  type: string;
  raw: unknown;
}

export interface KolamTagUsageGroups {
  products: KolamTagUsageItem[];
  rawMaterials: KolamTagUsageItem[];
  services: KolamTagUsageItem[];
  freyer: KolamTagUsageItem[];
  teranura: KolamTagUsageItem[];
  species: KolamTagUsageItem[];
}

export interface KolamTag {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  status: KolamTagStatus;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  usage: KolamTagUsageGroups;
  usageTotal: number;
  raw: unknown;
}

export interface KolamTagFormState {
  id?: string;
  name: string;
  description: string;
  color: string;
  status: KolamTagStatus;
}

export const KOLAM_TAG_BREADCRUMB_ROOT = '/tags';

export function isKolamTagRoute(route: string) {
  return (
    route === KOLAM_TAG_BREADCRUMB_ROOT ||
    route === `${KOLAM_TAG_BREADCRUMB_ROOT}/baru` ||
    route === `${KOLAM_TAG_BREADCRUMB_ROOT}/create` ||
    route.startsWith(`${KOLAM_TAG_BREADCRUMB_ROOT}/`)
  );
}

export function getKolamTagBreadcrumbPath(
  mode: 'list' | 'detail' | 'edit' | 'new',
  tag?: Pick<KolamTag, 'name' | 'slug'> | null,
) {
  if (mode === 'new') {
    return `${KOLAM_TAG_BREADCRUMB_ROOT}/baru`;
  }

  if ((mode === 'detail' || mode === 'edit') && tag) {
    return `${KOLAM_TAG_BREADCRUMB_ROOT}/${tag.name}`;
  }

  return KOLAM_TAG_BREADCRUMB_ROOT;
}

export function createEmptyKolamTagFormState(): KolamTagFormState {
  return {
    name: '',
    description: '',
    color: '#10b981',
    status: 'active',
  };
}

export function createKolamTagFormState(tag: KolamTag): KolamTagFormState {
  return {
    id: tag.id,
    name: tag.name,
    description: tag.description,
    color: tag.color,
    status: tag.status,
  };
}

export function createKolamTagSavePayload(form: KolamTagFormState) {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    color: normalizeTagColor(form.color),
    status: form.status,
  };
}

export function normalizeKolamTag(payload: unknown): KolamTag {
  const record = asRecord(payload);
  const id = getString(record, '_id') || getString(record, 'id');
  const name = getString(record, 'name') || 'Tag tanpa nama';
  const usage = normalizeKolamTagUsage(record);
  const usageTotal = Object.values(usage).reduce(
    (total, items) => total + items.length,
    0,
  );

  return {
    id: id || slugifyTagName(name),
    name,
    slug: slugifyTagName(name),
    description: getString(record, 'description'),
    color: normalizeTagColor(getString(record, 'color') || '#10b981'),
    status: record.status === 'inactive' ? 'inactive' : 'active',
    createdBy: getCreatedByName(record.createdBy),
    createdAt: getString(record, 'createdAt') || undefined,
    updatedAt: getString(record, 'updatedAt') || undefined,
    usage,
    usageTotal:
      getNumber(record, 'usageTotal') ??
      getNumber(record, 'totalUsage') ??
      usageTotal,
    raw: payload,
  };
}

export function normalizeKolamTagList(payload: unknown): KolamTag[] {
  const root = unwrapData(payload);
  const rootRecord = asRecord(root);
  const list: unknown[] = Array.isArray(root)
    ? root
    : Array.isArray(rootRecord.data)
    ? rootRecord.data
    : Array.isArray(rootRecord.tags)
    ? rootRecord.tags
    : Array.isArray(rootRecord.items)
    ? rootRecord.items
    : [];

  return list.map(normalizeKolamTag);
}

export function normalizeKolamTagDetail(payload: unknown): KolamTag {
  return normalizeKolamTag(unwrapData(payload));
}

export function createKolamTagListRevision(tags: KolamTag[]) {
  return createStableHash(
    tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      status: tag.status,
      usageTotal: tag.usageTotal,
      updatedAt: tag.updatedAt,
    })),
  );
}

export function createKolamTagDetailRevision(tag: KolamTag) {
  const usageRevision = (
    Object.keys(tag.usage) as Array<keyof KolamTagUsageGroups>
  ).reduce<Record<string, string[]>>((revision, key) => {
    revision[key] = tag.usage[key].map(item => item.id);
    return revision;
  }, {});

  return createStableHash({
    id: tag.id,
    name: tag.name,
    color: tag.color,
    status: tag.status,
    description: tag.description,
    usageTotal: tag.usageTotal,
    usage: usageRevision,
    updatedAt: tag.updatedAt,
  });
}

export function slugifyTagName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeTagColor(value: string) {
  const color = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    return color.toLowerCase();
  }

  if (/^[0-9a-f]{6}$/i.test(color)) {
    return `#${color.toLowerCase()}`;
  }

  return '#10b981';
}

function normalizeKolamTagUsage(
  record: Record<string, unknown>,
): KolamTagUsageGroups {
  return {
    products: getArray(record.products).map(normalizeKolamTagUsageItem),
    rawMaterials: getArray(
      record.rawMaterials ?? record.raws ?? record.raw_materials,
    ).map(normalizeKolamTagUsageItem),
    services: getArray(record.services).map(normalizeKolamTagUsageItem),
    freyer: getArray(record.freyer).map(normalizeKolamTagUsageItem),
    teranura: getArray(record.teranura).map(normalizeKolamTagUsageItem),
    species: getArray(record.species).map(normalizeKolamTagUsageItem),
  };
}

function normalizeKolamTagUsageItem(payload: unknown): KolamTagUsageItem {
  const record = asRecord(payload);
  const id = getString(record, '_id') || getString(record, 'id');
  const name =
    getString(record, 'name') ||
    getString(record, 'commonName') ||
    getString(record, 'scientificName') ||
    getString(record, 'title') ||
    getString(record, 'sku') ||
    'Item tanpa nama';

  return {
    id: id || slugifyTagName(name),
    name,
    sku: getString(record, 'sku'),
    slug: getString(record, 'slug') || slugifyTagName(name),
    type: getString(record, 'type'),
    raw: payload,
  };
}

function getCreatedByName(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  const record = asRecord(value);
  return (
    getString(record, 'username') ||
    getString(record, 'name') ||
    getString(record, 'email') ||
    '-'
  );
}

function unwrapData(payload: unknown): unknown {
  const record = asRecord(payload);
  if ('data' in record && !Array.isArray(payload)) {
    return record.data;
  }

  return payload;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

function getNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function createStableHash(value: unknown) {
  const json = JSON.stringify(value);
  let hash = 0;

  for (let index = 0; index < json.length; index += 1) {
    hash = (hash << 5) - hash + json.charCodeAt(index);
    hash |= 0;
  }

  return String(hash);
}

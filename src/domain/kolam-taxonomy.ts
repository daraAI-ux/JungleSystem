import {
  normalizeKolamTranslationsForSave,
  normalizeKolamTranslationsFromRecord,
  type KolamCatalogTranslationsMap,
  type KolamTaxonomyLocaleFields,
} from './kolam-catalog-locale';

export type KolamTaxonomyLevel =
  | 'Kingdom'
  | 'Phylum'
  | 'Class'
  | 'Order'
  | 'Family'
  | 'Genus';

export type KolamTaxonomyStatus = 'active' | 'inactive';

export interface KolamTaxonomy {
  id: string;
  name: string;
  level: KolamTaxonomyLevel;
  parentId: string | null;
  parentName: string | null;
  path: string;
  slug: string;
  ancestors: KolamTaxonomy[];
  children: KolamTaxonomy[];
  fullPath: KolamTaxonomy[];
  description: string;
  scientificName: string;
  commonName: string;
  photos: string[];
  status: KolamTaxonomyStatus;
  translations: KolamCatalogTranslationsMap<KolamTaxonomyLocaleFields>;
  createdAt?: string;
  updatedAt?: string;
  raw: unknown;
}

export interface KolamTaxonomyFormState {
  id?: string;
  name: string;
  level: KolamTaxonomyLevel;
  parentId: string;
  description: string;
  scientificName: string;
  commonName: string;
  status: KolamTaxonomyStatus;
  translations: KolamCatalogTranslationsMap<KolamTaxonomyLocaleFields>;
}

export const KOLAM_TAXONOMY_BREADCRUMB_ROOT = '/taxonomy';

export const KOLAM_TAXONOMY_LEVELS: KolamTaxonomyLevel[] = [
  'Kingdom',
  'Phylum',
  'Class',
  'Order',
  'Family',
  'Genus',
];

export const KOLAM_TAXONOMY_PARENT_LEVEL: Record<
  KolamTaxonomyLevel,
  KolamTaxonomyLevel | null
> = {
  Kingdom: null,
  Phylum: 'Kingdom',
  Class: 'Phylum',
  Order: 'Class',
  Family: 'Order',
  Genus: 'Family',
};

export function isKolamTaxonomyRoute(route: string) {
  return (
    route === KOLAM_TAXONOMY_BREADCRUMB_ROOT ||
    route === `${KOLAM_TAXONOMY_BREADCRUMB_ROOT}/create` ||
    route === `${KOLAM_TAXONOMY_BREADCRUMB_ROOT}/baru` ||
    route.startsWith(`${KOLAM_TAXONOMY_BREADCRUMB_ROOT}/`)
  );
}

export function getKolamTaxonomyBreadcrumbPath(
  mode: 'list' | 'detail' | 'edit' | 'new',
  taxonomy?: Pick<KolamTaxonomy, 'name'> | null,
) {
  if (mode === 'new') {
    return `${KOLAM_TAXONOMY_BREADCRUMB_ROOT}/baru`;
  }

  if ((mode === 'detail' || mode === 'edit') && taxonomy) {
    return `${KOLAM_TAXONOMY_BREADCRUMB_ROOT}/${taxonomy.name}`;
  }

  return KOLAM_TAXONOMY_BREADCRUMB_ROOT;
}

export function createEmptyKolamTaxonomyFormState(): KolamTaxonomyFormState {
  return {
    name: '',
    level: 'Kingdom',
    parentId: '',
    description: '',
    scientificName: '',
    commonName: '',
    status: 'active',
    translations: {},
  };
}

export function createKolamTaxonomyFormState(
  taxonomy: KolamTaxonomy,
): KolamTaxonomyFormState {
  return {
    id: taxonomy.id,
    name: taxonomy.name,
    level: taxonomy.level,
    parentId: taxonomy.parentId ?? '',
    description: taxonomy.description,
    scientificName: taxonomy.scientificName,
    commonName: taxonomy.commonName,
    status: taxonomy.status,
    translations: taxonomy.translations,
  };
}

export function createKolamTaxonomyCreatePayload(
  form: KolamTaxonomyFormState,
) {
  const payload: Record<string, unknown> = {
    name: form.name.trim(),
    level: form.level,
    description: form.description.trim() || undefined,
    scientificName: form.scientificName.trim() || undefined,
    commonName: form.commonName.trim() || undefined,
    status: form.status,
    translations: normalizeKolamTranslationsForSave(form.translations),
  };

  if (form.parentId.trim()) {
    payload.parent = form.parentId.trim();
  }

  return compactPayload(payload);
}

export function createKolamTaxonomyUpdatePayload(
  form: KolamTaxonomyFormState,
) {
  return compactPayload({
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    scientificName: form.scientificName.trim() || undefined,
    commonName: form.commonName.trim() || undefined,
    status: form.status,
    translations: normalizeKolamTranslationsForSave(form.translations),
  });
}

export function normalizeKolamTaxonomy(payload: unknown): KolamTaxonomy {
  const record = asRecord(payload);
  const name = getString(record, 'name') || 'Taksonomi tanpa nama';
  const id = getString(record, '_id') || getString(record, 'id');
  const parent = record.parent;
  const parentRecord = asRecord(parent);

  return {
    id: id || slugifyTaxonomyName(name),
    name,
    level: normalizeTaxonomyLevel(record.level),
    parentId:
      getString(parentRecord, '_id') || getString(parentRecord, 'id') ||
      (typeof parent === 'string' ? parent : null),
    parentName: getString(parentRecord, 'name') || null,
    path: getString(record, 'path'),
    slug: getString(record, 'slug'),
    ancestors: normalizeTaxonomyArray(record.ancestors),
    children: normalizeTaxonomyArray(record.children),
    fullPath: normalizeTaxonomyArray(record.fullPath),
    description: getString(record, 'description'),
    scientificName: getString(record, 'scientificName'),
    commonName: getString(record, 'commonName'),
    photos: normalizeStringArray(record.photos),
    status: record.status === 'inactive' ? 'inactive' : 'active',
    translations: normalizeKolamTranslationsFromRecord<KolamTaxonomyLocaleFields>(
      record.translations,
    ),
    createdAt: getString(record, 'createdAt') || undefined,
    updatedAt: getString(record, 'updatedAt') || undefined,
    raw: payload,
  };
}

export function normalizeKolamTaxonomyList(payload: unknown) {
  const root = unwrapData(payload);
  const rootRecord = asRecord(root);
  const list: unknown[] = Array.isArray(root)
    ? root
    : Array.isArray(rootRecord.data)
    ? rootRecord.data
    : Array.isArray(rootRecord.items)
    ? rootRecord.items
    : Array.isArray(rootRecord.taxonomies)
    ? rootRecord.taxonomies
    : [];

  return list.map(normalizeKolamTaxonomy);
}

export function normalizeKolamTaxonomyDetail(payload: unknown) {
  return normalizeKolamTaxonomy(unwrapData(payload));
}

export function createKolamTaxonomyListRevision(taxonomies: KolamTaxonomy[]) {
  return createStableHash(
    taxonomies.map(taxonomy => ({
      id: taxonomy.id,
      name: taxonomy.name,
      level: taxonomy.level,
      parentId: taxonomy.parentId,
      path: taxonomy.path,
      scientificName: taxonomy.scientificName,
      commonName: taxonomy.commonName,
      photos: taxonomy.photos,
      status: taxonomy.status,
      updatedAt: taxonomy.updatedAt,
    })),
  );
}

export function createKolamTaxonomyDetailRevision(taxonomy: KolamTaxonomy) {
  return createStableHash({
    id: taxonomy.id,
    name: taxonomy.name,
    level: taxonomy.level,
    parentId: taxonomy.parentId,
    path: taxonomy.path,
    description: taxonomy.description,
    scientificName: taxonomy.scientificName,
    commonName: taxonomy.commonName,
    photos: taxonomy.photos,
    status: taxonomy.status,
    translations: taxonomy.translations,
    children: taxonomy.children.map(child => child.id),
    fullPath: taxonomy.fullPath.map(path => path.id),
    createdAt: taxonomy.createdAt,
    updatedAt: taxonomy.updatedAt,
  });
}

export function slugifyTaxonomyName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getTaxonomyLevelLabel(level: KolamTaxonomyLevel) {
  switch (level) {
    case 'Kingdom':
      return 'Kerajaan';
    case 'Phylum':
      return 'Filum';
    case 'Class':
      return 'Kelas';
    case 'Order':
      return 'Ordo';
    case 'Family':
      return 'Famili';
    case 'Genus':
      return 'Genus';
  }
}

export function getTaxonomyStatusLabel(status: KolamTaxonomyStatus) {
  return status === 'inactive' ? 'Nonaktif' : 'Aktif';
}

function normalizeTaxonomyLevel(value: unknown): KolamTaxonomyLevel {
  return KOLAM_TAXONOMY_LEVELS.includes(value as KolamTaxonomyLevel)
    ? (value as KolamTaxonomyLevel)
    : 'Kingdom';
}

function normalizeTaxonomyArray(value: unknown): KolamTaxonomy[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(item => item && typeof item === 'object')
    .map(item => normalizeKolamTaxonomy(item));
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(item => String(item).trim()).filter(Boolean);
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

function compactPayload(value: Record<string, unknown>) {
  const output: Record<string, unknown> = {};
  Object.entries(value).forEach(([key, entry]) => {
    if (entry == null || entry === '') {
      return;
    }

    output[key] = entry;
  });
  return output;
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

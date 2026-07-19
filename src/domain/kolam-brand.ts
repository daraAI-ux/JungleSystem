import { getKolamFileUrl } from '../lib/file-url';

export {
  getKolamCountryFlagByCountry as getKolamBrandFlagByCountry,
  KOLAM_COUNTRY_FLAG_OPTIONS as KOLAM_BRAND_FLAG_OPTIONS,
  type KolamCountryFlagOption as KolamBrandFlagOption,
} from './kolam-country-flags';

export type KolamBrandStatus = 'active' | 'inactive' | 'blacklisted';

export interface KolamBrand {
  id: string;
  name: string;
  slug: string;
  description: string;
  originCountry: string;
  status: KolamBrandStatus;
  notes: string;
  links: string[];
  photos: string[];
  logoUrl: string | null;
  productCount: number;
  rawMaterialCount: number;
  serviceCount: number;
  speciesCount: number;
  createdAt?: string;
  updatedAt?: string;
  raw: unknown;
}

export interface KolamBrandFormState {
  id?: string;
  name: string;
  description: string;
  originCountry: string;
  status: KolamBrandStatus;
  notes: string;
  linkText: string;
  logoLocalUri: string;
  logoRemoteUrl: string;
}

export interface KolamBrandLogoDraft {
  brandId: string;
  brandSlug: string;
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

export const KOLAM_BRAND_BREADCRUMB_ROOT = '/label-dan-field/merek';

export function isKolamBrandRoute(route: string) {
  return (
    route === '/brands' ||
    route === '/brands/create' ||
    route === KOLAM_BRAND_BREADCRUMB_ROOT ||
    route === `${KOLAM_BRAND_BREADCRUMB_ROOT}/baru` ||
    route.startsWith('/brands/') ||
    route.startsWith(`${KOLAM_BRAND_BREADCRUMB_ROOT}/`)
  );
}

export function getKolamBrandBreadcrumbPath(
  mode: 'list' | 'detail' | 'edit' | 'new',
  brand?: Pick<KolamBrand, 'name' | 'slug'> | null,
) {
  if (mode === 'new') {
    return `${KOLAM_BRAND_BREADCRUMB_ROOT}/baru`;
  }

  if ((mode === 'detail' || mode === 'edit') && brand) {
    return `${KOLAM_BRAND_BREADCRUMB_ROOT}/${brand.name}`;
  }

  return KOLAM_BRAND_BREADCRUMB_ROOT;
}

export function createEmptyKolamBrandFormState(): KolamBrandFormState {
  return {
    name: '',
    description: '',
    originCountry: 'Indonesia',
    status: 'active',
    notes: '',
    linkText: '',
    logoLocalUri: '',
    logoRemoteUrl: '',
  };
}

export function createKolamBrandFormState(
  brand: KolamBrand,
): KolamBrandFormState {
  return {
    id: brand.id,
    name: brand.name,
    description: brand.description,
    originCountry: brand.originCountry,
    status: brand.status,
    notes: brand.notes,
    linkText: brand.links.join('\n'),
    logoLocalUri: '',
    logoRemoteUrl: brand.logoUrl ?? '',
  };
}

export function createKolamBrandSavePayload(form: KolamBrandFormState) {
  const links = form.linkText
    .split(/\r?\n/)
    .map(link => link.trim())
    .filter(Boolean);

  return {
    name: form.name.trim(),
    description: form.description.trim(),
    originCountry: form.originCountry.trim(),
    status: form.status,
    notes: form.notes.trim(),
    link: links,
    photos: form.logoRemoteUrl.trim() ? [form.logoRemoteUrl.trim()] : [],
  };
}

export function normalizeKolamBrand(payload: unknown): KolamBrand {
  const record = asRecord(payload);
  const id = getString(record, '_id') || getString(record, 'id');
  const name = getString(record, 'name') || 'Merek tanpa nama';
  const photos = getStringArray(record.photos);
  const products = getArray(record.products);
  const raws = getArray(record.raws);
  const logoPath = getString(record, 'logo') || photos[0] || null;

  return {
    id: id || slugifyBrandName(name),
    name,
    slug: slugifyBrandName(name),
    description: getString(record, 'description'),
    originCountry:
      getString(record, 'originCountry') ||
      getString(record, 'country') ||
      'Indonesia',
    status: normalizeKolamBrandStatus(record.status),
    notes: getString(record, 'notes'),
    links: getStringArray(record.link ?? record.links),
    photos,
    logoUrl: getKolamFileUrl(logoPath),
    productCount:
      getNumber(record, 'totalProducts') ??
      getNumber(record, 'productCount') ??
      products.length,
    rawMaterialCount:
      getNumber(record, 'totalRaws') ??
      getNumber(record, 'rawMaterialCount') ??
      raws.length,
    serviceCount:
      getNumber(record, 'totalServices') ?? getArray(record.services).length,
    speciesCount:
      getNumber(record, 'totalSpecies') ?? getArray(record.species).length,
    createdAt: getString(record, 'createdAt') || undefined,
    updatedAt: getString(record, 'updatedAt') || undefined,
    raw: payload,
  };
}

export function normalizeKolamBrandList(payload: unknown): KolamBrand[] {
  const root = unwrapData(payload);
  const rootRecord = asRecord(root);
  const list: unknown[] = Array.isArray(root)
    ? root
    : Array.isArray(rootRecord.brands)
    ? rootRecord.brands
    : Array.isArray(rootRecord.items)
    ? rootRecord.items
    : [];

  return list.map(normalizeKolamBrand);
}

export function normalizeKolamBrandDetail(payload: unknown): KolamBrand {
  return normalizeKolamBrand(unwrapData(payload));
}

export function createKolamBrandLogoDraft(params: {
  brand: Pick<KolamBrand, 'id' | 'slug' | 'logoUrl'>;
  localUri: string;
  remoteUrl?: string | null;
  previous?: KolamBrandLogoDraft | null;
  now?: string;
}): KolamBrandLogoDraft {
  const contentHash = createStableHash(params.localUri.trim());
  const previous = params.previous;
  const remoteUrl = params.remoteUrl ?? params.brand.logoUrl ?? null;
  const serverHash = remoteUrl ? createStableHash(remoteUrl) : null;
  const alreadySynced =
    previous?.syncState === 'synced' &&
    previous.contentHash === contentHash &&
    previous.serverHash === serverHash;

  return {
    brandId: params.brand.id,
    brandSlug: params.brand.slug,
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

export function shouldSyncKolamBrandLogo(
  draft: KolamBrandLogoDraft | null,
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

export function createKolamBrandLogoRevision(
  draft: Pick<
    KolamBrandLogoDraft,
    'brandId' | 'contentHash' | 'dirty' | 'serverHash' | 'syncState'
  >,
) {
  return createStableHash({
    brandId: draft.brandId,
    contentHash: draft.contentHash,
    dirty: draft.dirty,
    serverHash: draft.serverHash,
    syncState: draft.syncState,
  });
}

export function createKolamBrandListRevision(brands: KolamBrand[]) {
  return createStableHash(
    brands.map(brand => ({
      id: brand.id,
      name: brand.name,
      status: brand.status,
      productCount: brand.productCount,
      rawMaterialCount: brand.rawMaterialCount,
      logoUrl: brand.logoUrl,
      updatedAt: brand.updatedAt,
    })),
  );
}

export function createKolamBrandDetailRevision(brand: KolamBrand) {
  return createStableHash({
    id: brand.id,
    name: brand.name,
    description: brand.description,
    originCountry: brand.originCountry,
    status: brand.status,
    notes: brand.notes,
    links: brand.links,
    photos: brand.photos,
    productCount: brand.productCount,
    rawMaterialCount: brand.rawMaterialCount,
    updatedAt: brand.updatedAt,
  });
}

function normalizeKolamBrandStatus(value: unknown): KolamBrandStatus {
  if (value === 'inactive' || value === 'blacklisted') {
    return value;
  }

  return 'active';
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
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
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

export function slugifyBrandName(name: string) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'merek'
  );
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

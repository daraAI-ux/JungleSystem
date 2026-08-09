import type { KolamBrand } from './kolam-brand';
import type { KolamCategory } from './kolam-category';

export interface KolamTeranuraVariant {
  id: string;
  label: string;
  productCode: string;
  sku: string;
  priceToSell: number;
  stock: number;
}

export interface KolamTeranura {
  id: string;
  slug: string;
  name: string;
  sku: string;
  productCode: string;
  deviceLine: string;
  brand: Pick<KolamBrand, 'id' | 'logoUrl' | 'name'> | null;
  category: Pick<KolamCategory, 'id' | 'name'> | null;
  photoUrl: string | null;
  priceToSell: number;
  sellable: boolean;
  stock: number;
  unitLabel: string;
  variants: KolamTeranuraVariant[];
  createdAt?: string;
  updatedAt?: string;
  raw: unknown;
}

export interface KolamTeranuraPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface KolamTeranuraListResult {
  data: KolamTeranura[];
  pagination: KolamTeranuraPagination;
}

export type KolamTeranuraSurfaceMode = 'list' | 'detail' | 'unsupported';
export type KolamTeranuraShellTab = 'katalog' | 'perangkat-iot';
export type KolamTeranuraDetailTab = 'overview' | 'perangkat-iot';
export type KolamTeranuraSortBy = 'createdAt' | 'updatedAt' | 'name' | 'stock' | 'price';
export type KolamTeranuraSortOrder = 'asc' | 'desc';

const TERANURA_SHELL_ROOT = '/teranura';

export function isKolamTeranuraRoute(route: string) {
  return (
    route === '/teranura' ||
    route === '/teranura/create' ||
    route.startsWith('/teranura/')
  );
}

export function isKolamTeranuraNativeRoute(route: string) {
  return getKolamTeranuraSurfaceMode(route) !== 'unsupported';
}

export function getKolamTeranuraSurfaceMode(route: string): KolamTeranuraSurfaceMode {
  const routePath = route.split('?')[0].replace(/\/+$/, '') || '/';

  if (routePath === '/teranura') {
    return 'list';
  }

  if (
    routePath.startsWith('/teranura/') &&
    !routePath.endsWith('/edit') &&
    routePath !== '/teranura/create' &&
    routePath !== '/teranura/freyr' &&
    !routePath.startsWith('/teranura/freyr/') &&
    !routePath.endsWith('/statistics')
  ) {
    return 'detail';
  }

  return 'unsupported';
}

export function getKolamTeranuraRouteId(route: string) {
  const routePath = route.split('?')[0].replace(/\/+$/, '');
  const [, , id] = routePath.split('/');
  return id ? decodeURIComponent(id) : '';
}

/** FE shell `?tab=` — `devices` alias → perangkat-iot; else katalog. */
export function getKolamTeranuraShellTab(route: string): KolamTeranuraShellTab {
  const raw = getTeranuraQueryParam(route, 'tab').toLowerCase();
  if (raw === 'perangkat-iot' || raw === 'devices') {
    return 'perangkat-iot';
  }
  return 'katalog';
}

export function getKolamTeranuraProductIdQuery(route: string) {
  return getTeranuraQueryParam(route, 'teranuraProductId');
}

export function buildKolamTeranuraShellRoute(
  tab: KolamTeranuraShellTab = 'katalog',
  teranuraProductId?: string | null,
): string {
  const params = new URLSearchParams();
  if (tab === 'perangkat-iot') {
    params.set('tab', 'perangkat-iot');
  }
  const productId = teranuraProductId?.trim() || '';
  if (productId) {
    params.set('teranuraProductId', productId);
  }
  const query = params.toString();
  return query ? `${TERANURA_SHELL_ROOT}?${query}` : TERANURA_SHELL_ROOT;
}

/** FE detail `?tab=` — only overview | perangkat-iot in this RNW slice. */
export function getKolamTeranuraDetailTab(
  route: string,
  options?: { showPerangkatIot?: boolean },
): KolamTeranuraDetailTab {
  const raw = getTeranuraQueryParam(route, 'tab').toLowerCase();
  if (
    options?.showPerangkatIot !== false &&
    (raw === 'perangkat-iot' || raw === 'devices')
  ) {
    return 'perangkat-iot';
  }
  return 'overview';
}

export function buildKolamTeranuraDetailRoute(
  id: string,
  tab: KolamTeranuraDetailTab = 'overview',
): string {
  const base = `${TERANURA_SHELL_ROOT}/${encodeURIComponent(id)}`;
  if (tab === 'perangkat-iot') {
    return `${base}?tab=perangkat-iot`;
  }
  return base;
}

function getTeranuraQueryParam(route: string, key: string) {
  const query = route.includes('?') ? route.split('?')[1] || '' : '';
  return String(new URLSearchParams(query).get(key) || '').trim();
}

export function normalizeKolamTeranuraList(payload: unknown): KolamTeranuraListResult {
  const root = asRecord(payload);
  const dataRecord = asRecord(root.data);
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(root.data)
    ? root.data
    : Array.isArray(dataRecord.data)
    ? dataRecord.data
    : Array.isArray(root.items)
    ? root.items
    : [];
  const paginationRecord = asRecord(root.pagination);
  const nestedPaginationRecord = asRecord(dataRecord.pagination);
  const paginationSource =
    Object.keys(nestedPaginationRecord).length > 0
      ? nestedPaginationRecord
      : paginationRecord;
  const total =
    getNumber(paginationSource, 'total') ||
    getNumber(paginationSource, 'totalDocs') ||
    getNumber(root, 'total') ||
    getNumber(dataRecord, 'total') ||
    list.length;
  const limit =
    getNumber(paginationSource, 'limit') ||
    getNumber(paginationSource, 'pageSize') ||
    getNumber(root, 'limit') ||
    10;
  const page =
    getNumber(paginationSource, 'page') ||
    getNumber(root, 'page') ||
    1;
  const totalPages =
    getNumber(paginationSource, 'totalPages') ||
    Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return {
    data: list.map(normalizeKolamTeranura),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export function normalizeKolamTeranuraDetail(payload: unknown): KolamTeranura {
  const root = asRecord(payload);
  const data = root.data !== undefined ? root.data : payload;

  return normalizeKolamTeranura(data);
}

export function normalizeKolamTeranura(value: unknown): KolamTeranura {
  const record = asRecord(value);
  const variants = getArray(record, 'variants').map(normalizeKolamTeranuraVariant);
  const units = asRecord(record.units) || asRecord(record.unit);
  const unitLabel =
    getString(units, 'symbol') ||
    getString(units, 'name') ||
    getString(record, 'unitLabel') ||
    getString(record, 'unit');
  const photos = getStringArray(record, 'photos');

  return {
    id: getId(record),
    slug: getString(record, 'slug'),
    name: getString(record, 'name'),
    sku: getString(record, 'sku'),
    productCode: getString(record, 'productCode'),
    deviceLine: getString(record, 'deviceLine') || 'teranura',
    brand: normalizeTeranuraBrand(record.brand),
    category: normalizeTeranuraCategory(record.category),
    photoUrl:
      getString(record, 'thumbnail') ||
      getString(record, 'thumbnailUrl') ||
      photos[0] ||
      null,
    priceToSell:
      getNumber(record, 'price_to_sell') ||
      getNumber(record, 'priceToSell') ||
      getNumber(record, 'price') ||
      getVariantPriceFallback(variants),
    sellable: getBoolean(record, 'sellable'),
    stock: getTeranuraStock(record, variants),
    unitLabel,
    variants,
    createdAt: getString(record, 'createdAt') || undefined,
    updatedAt: getString(record, 'updatedAt') || undefined,
    raw: value,
  };
}

function normalizeKolamTeranuraVariant(value: unknown): KolamTeranuraVariant {
  const record = asRecord(value);

  return {
    id: getId(record),
    label:
      getString(record, 'label') ||
      [getString(record, 'tier1Value'), getString(record, 'tier2Value')]
        .filter(Boolean)
        .join(' / '),
    productCode: getString(record, 'productCode'),
    sku: getString(record, 'sku'),
    priceToSell:
      getNumber(record, 'price_to_sell') ||
      getNumber(record, 'priceToSell') ||
      getNumber(record, 'price'),
    stock: getNumber(record, 'stock'),
  };
}

function normalizeTeranuraBrand(value: unknown): KolamTeranura['brand'] {
  const record = asRecord(value);
  const id = getId(record) || (typeof value === 'string' ? value : '');
  const name = getString(record, 'name');

  if (!id && !name) {
    return null;
  }

  return {
    id,
    logoUrl: getString(record, 'logoUrl') || getString(record, 'logo') || null,
    name: name || '-',
  };
}

function normalizeTeranuraCategory(value: unknown): KolamTeranura['category'] {
  const record = asRecord(value);
  const id = getId(record) || (typeof value === 'string' ? value : '');
  const name = getString(record, 'name');

  if (!id && !name) {
    return null;
  }

  return {
    id,
    name: name || '-',
  };
}

function getTeranuraStock(
  record: Record<string, unknown>,
  variants: KolamTeranuraVariant[],
) {
  if (variants.length) {
    return variants.reduce((total, variant) => total + variant.stock, 0);
  }

  return getNumber(record, 'stock');
}

function getVariantPriceFallback(variants: KolamTeranuraVariant[]) {
  return variants.find(variant => variant.priceToSell > 0)?.priceToSell ?? 0;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function getArray(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return Array.isArray(value) ? value : [];
}

function getStringArray(record: Record<string, unknown>, key: string) {
  return getArray(record, key).filter((item): item is string => typeof item === 'string');
}

function getId(record: Record<string, unknown>) {
  return getString(record, '_id') || getString(record, 'id');
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
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function getBoolean(record: Record<string, unknown>, key: string) {
  const value = record[key];

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }

  return false;
}

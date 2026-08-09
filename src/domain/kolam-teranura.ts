import type { KolamBrand } from './kolam-brand';
import type { KolamCategory } from './kolam-category';

export interface KolamTeranuraVariant {
  id: string;
  label: string;
  productCode: string;
  sku: string;
  price: number;
  priceToSell: number;
  stock: number;
  photos: string[];
  memberPointsEnabled: boolean;
  memberPoints: number;
  weight: number;
  length: number;
  width: number;
  height: number;
}

export interface KolamTeranuraCustomField {
  id: string;
  label: string;
  value: string;
  type: string;
}

export interface KolamTeranuraComponentLine {
  id: string;
  name: string;
  code: string;
  brandLabel: string;
  quantity: number;
  unitLabel: string;
  stock: number;
  price: number;
  totalPrice: number;
  thumbnailUri: string;
}

export interface KolamTeranuraPackingLine {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  variantLabel: string;
  thumbnailUri: string;
}

export interface KolamTeranuraVendorPrice {
  id: string;
  vendorName: string;
  price: number;
  shippingCost: number;
  totalCost: number;
}

export interface KolamTeranuraShippingMethod {
  id: string;
  displayName: string;
  category: string;
  pricingType: string;
  pricingPrice: number;
  priceLabel: string;
  logoUri: string | null;
}

export interface KolamTeranuraAsset {
  id: string;
  title: string;
  filename: string;
  fileSize: number;
  mimeType: string;
}

export interface KolamTeranuraLink {
  id: string;
  label: string;
  url: string;
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
  categories: Array<Pick<KolamCategory, 'id' | 'name'>>;
  photoUrl: string | null;
  photos: string[];
  videos: string[];
  shortDescription: string;
  description: string;
  price: number;
  priceToSell: number;
  marketPrice: number;
  onlinePrice: number;
  minimumPriceToSales: number;
  sellable: boolean;
  stock: number;
  lowStockThreshold: number;
  unitLabel: string;
  unitInitial: string;
  variants: KolamTeranuraVariant[];
  customFields: KolamTeranuraCustomField[];
  components: KolamTeranuraComponentLine[];
  packings: KolamTeranuraPackingLine[];
  vendorPrices: KolamTeranuraVendorPrice[];
  shippingMethods: KolamTeranuraShippingMethod[];
  assets: KolamTeranuraAsset[];
  links: KolamTeranuraLink[];
  tags: string[];
  locationLabel: string;
  linkedProductId: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  memberPointsEnabled: boolean;
  memberPoints: number;
  commissionEnabled: boolean;
  commissionType: string;
  commissionValue: number;
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
export type KolamTeranuraDetailTab =
  | 'overview'
  | 'pricing'
  | 'specifications'
  | 'perangkat-iot'
  | 'logistics'
  | 'materials'
  | 'more'
  | 'assets'
  | 'statistics';
export type KolamTeranuraSortBy = 'createdAt' | 'updatedAt' | 'name' | 'stock' | 'price';
export type KolamTeranuraSortOrder = 'asc' | 'desc';

const TERANURA_SHELL_ROOT = '/teranura';
const TERANURA_DETAIL_TABS: KolamTeranuraDetailTab[] = [
  'overview',
  'pricing',
  'specifications',
  'perangkat-iot',
  'logistics',
  'materials',
  'more',
  'assets',
  'statistics',
];

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

/** FE detail `?tab=` — Product sibling tabs + optional Freyer IoT. */
export function getKolamTeranuraDetailTab(
  route: string,
  options?: { showPerangkatIot?: boolean },
): KolamTeranuraDetailTab {
  const raw = getTeranuraQueryParam(route, 'tab').toLowerCase();
  const candidate =
    raw === 'devices' || raw === 'variants'
      ? raw === 'variants'
        ? 'pricing'
        : 'perangkat-iot'
      : (raw as KolamTeranuraDetailTab);

  if (
    candidate === 'perangkat-iot' &&
    options?.showPerangkatIot === false
  ) {
    return 'overview';
  }

  if (TERANURA_DETAIL_TABS.includes(candidate)) {
    if (candidate === 'perangkat-iot' && options?.showPerangkatIot === false) {
      return 'overview';
    }
    return candidate;
  }

  return 'overview';
}

export function buildKolamTeranuraDetailRoute(
  id: string,
  tab: KolamTeranuraDetailTab = 'overview',
): string {
  const base = `${TERANURA_SHELL_ROOT}/${encodeURIComponent(id)}`;
  if (tab === 'overview') {
    return base;
  }
  return `${base}?tab=${tab}`;
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
  const unitInitial =
    getString(units, 'initial') ||
    getString(units, 'symbol') ||
    unitLabel ||
    'pcs';
  const photos = normalizeUriList(record.photos ?? record.images);
  const videos = normalizeUriList(record.videos);
  const categories = normalizeCategories(record.category ?? record.categories);
  const memberPoints = asRecord(record.memberPoints);
  const dimensions = asRecord(record.dimensions ?? record.dimension);

  return {
    id: getId(record),
    slug: getString(record, 'slug'),
    name: getString(record, 'name'),
    sku: getString(record, 'sku'),
    productCode: getString(record, 'productCode'),
    deviceLine: getString(record, 'deviceLine') || 'teranura',
    brand: normalizeTeranuraBrand(record.brand ?? record.brands),
    category: categories[0] ?? null,
    categories,
    photoUrl:
      normalizeUri(
        getString(record, 'thumbnail') ||
          getString(record, 'thumbnailUrl') ||
          photos[0] ||
          '',
      ) || null,
    photos,
    videos,
    shortDescription: getString(record, 'shortDescription'),
    description: getString(record, 'description'),
    price: getNumber(record, 'price'),
    priceToSell:
      getNumber(record, 'price_to_sell') ||
      getNumber(record, 'priceToSell') ||
      getVariantPriceFallback(variants),
    marketPrice: getNumber(record, 'marketPrice'),
    onlinePrice: getNumber(record, 'onlinePrice'),
    minimumPriceToSales:
      getNumber(record, 'minimum_price_to_sales') ||
      getNumber(record, 'minimumPriceToSales'),
    sellable: getBoolean(record, 'sellable'),
    stock: getTeranuraStock(record, variants),
    lowStockThreshold:
      getNumber(record, 'lowStockThreshold') ||
      getNumber(record, 'low_stock_threshold'),
    unitLabel,
    unitInitial,
    variants,
    customFields: normalizeCustomFields(record.customFieldValues ?? record.customFields),
    components: normalizeComponents(record.components),
    packings: normalizePackings(record.packings ?? record.packingMaterials),
    vendorPrices: normalizeVendorPrices(record.vendorPrices),
    shippingMethods: normalizeShippingMethods(
      record.availableShippingMethods ?? record.shippingMethods,
    ),
    assets: normalizeAssets(record.assets),
    links: normalizeLinks(record.links ?? record.externalLinks),
    tags: normalizeTags(record.tags),
    locationLabel: normalizeLocationLabel(record.location),
    linkedProductId: normalizeLinkedProductId(record.linkedProductId),
    weight: getNumber(record, 'weight'),
    length:
      getNumber(record, 'length') || getNumber(dimensions, 'length'),
    width: getNumber(record, 'width') || getNumber(dimensions, 'width'),
    height:
      getNumber(record, 'height') || getNumber(dimensions, 'height'),
    memberPointsEnabled: getBoolean(memberPoints, 'enabled'),
    memberPoints: getNumber(memberPoints, 'points'),
    commissionEnabled: getBoolean(record, 'commissionEnabled'),
    commissionType: getString(record, 'commissionType') || 'percentage',
    commissionValue: getNumber(record, 'commissionValue'),
    createdAt: getString(record, 'createdAt') || undefined,
    updatedAt: getString(record, 'updatedAt') || undefined,
    raw: value,
  };
}

function normalizeKolamTeranuraVariant(value: unknown): KolamTeranuraVariant {
  const record = asRecord(value);
  const memberPoints = asRecord(record.memberPoints);
  const dimensions = asRecord(record.dimensions ?? record.dimension);

  return {
    id: getId(record),
    label:
      getString(record, 'label') ||
      [getString(record, 'tier1Value'), getString(record, 'tier2Value')]
        .filter(Boolean)
        .join(' / '),
    productCode: getString(record, 'productCode'),
    sku: getString(record, 'sku'),
    price: getNumber(record, 'price'),
    priceToSell:
      getNumber(record, 'price_to_sell') ||
      getNumber(record, 'priceToSell') ||
      getNumber(record, 'price'),
    stock: getNumber(record, 'stock'),
    photos: normalizeUriList(record.photos ?? record.images),
    memberPointsEnabled: getBoolean(memberPoints, 'enabled'),
    memberPoints: getNumber(memberPoints, 'points'),
    weight: getNumber(record, 'weight'),
    length:
      getNumber(record, 'length') || getNumber(dimensions, 'length'),
    width: getNumber(record, 'width') || getNumber(dimensions, 'width'),
    height:
      getNumber(record, 'height') || getNumber(dimensions, 'height'),
  };
}

function normalizeTeranuraBrand(value: unknown): KolamTeranura['brand'] {
  if (Array.isArray(value)) {
    return normalizeTeranuraBrand(value[0]);
  }

  const record = asRecord(value);
  const id = getId(record) || (typeof value === 'string' ? value : '');
  const name = getString(record, 'name');

  if (!id && !name) {
    return null;
  }

  return {
    id,
    logoUrl:
      normalizeUri(
        getString(record, 'logoUrl') || getString(record, 'logo') || '',
      ) || null,
    name: name || '-',
  };
}

function normalizeCategories(
  value: unknown,
): Array<Pick<KolamCategory, 'id' | 'name'>> {
  const list = Array.isArray(value) ? value : value != null ? [value] : [];
  return list
    .map(entry => {
      const record = asRecord(entry);
      const id = getId(record) || (typeof entry === 'string' ? entry : '');
      const name = getString(record, 'name') || (typeof entry === 'string' ? entry : '');
      if (!id && !name) {
        return null;
      }
      return { id, name: name || '-' };
    })
    .filter(Boolean) as Array<Pick<KolamCategory, 'id' | 'name'>>;
}

function normalizeCustomFields(value: unknown): KolamTeranuraCustomField[] {
  const list = Array.isArray(value) ? value : [];
  return list
    .map((entry, index) => {
      const row = asRecord(entry);
      const field = asRecord(row.field);
      const label =
        getString(field, 'fieldLabel') ||
        getString(row, 'fieldLabel') ||
        getString(row, 'fieldKey') ||
        `Field ${index + 1}`;
      const type =
        getString(field, 'fieldType') || getString(row, 'fieldType') || 'string';
      const display = formatCustomFieldValue(row, type);
      if (!display) {
        return null;
      }
      return {
        id:
          getId(field) ||
          getString(row, 'fieldKey') ||
          `${label}-${index}`,
        label,
        type,
        value: display,
      };
    })
    .filter(Boolean) as KolamTeranuraCustomField[];
}

function formatCustomFieldValue(
  row: Record<string, unknown>,
  type: string,
): string {
  if (type === 'boolean') {
    return getBoolean(row, 'value') ? 'Ya' : 'Tidak';
  }
  const value = row.value;
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean).join(', ');
  }
  if (value && typeof value === 'object') {
    const nested = asRecord(value);
    return (
      getString(nested, 'label') ||
      getString(nested, 'name') ||
      getString(nested, 'value')
    );
  }
  return '';
}

function normalizeComponents(value: unknown): KolamTeranuraComponentLine[] {
  const list = Array.isArray(value) ? value : [];
  return list.map((entry, index) => {
    const line = asRecord(entry);
    const product = asRecord(line.product);
    const quantity = getNumber(line, 'quantity');
    const price =
      getNumber(product, 'price') ||
      getNumber(line, 'price') ||
      getNumber(line, 'unitPrice');
    const brand = normalizeTeranuraBrand(product.brand ?? product.brands);
    const photos = normalizeUriList(product.photos ?? line.photos);

    return {
      id: getId(line) || getId(product) || `component-${index + 1}`,
      name:
        getString(product, 'name') ||
        (typeof line.product === 'string' ? line.product : '') ||
        `Komponen ${index + 1}`,
      code:
        getString(product, 'productCode') ||
        getString(product, 'sku') ||
        getString(line, 'code'),
      brandLabel: brand?.name || '',
      quantity,
      unitLabel:
        getString(asRecord(product.units), 'symbol') ||
        getString(product, 'unitLabel') ||
        'unit',
      stock: getNumber(product, 'stock'),
      price,
      totalPrice: price * quantity,
      thumbnailUri:
        normalizeUri(
          getString(product, 'thumbnail') ||
            getString(product, 'thumbnailUrl') ||
            photos[0] ||
            '',
        ) || '',
    };
  });
}

function normalizePackings(value: unknown): KolamTeranuraPackingLine[] {
  const list = Array.isArray(value) ? value : [];
  return list.map((entry, index) => {
    const line = asRecord(entry);
    const packing = asRecord(line.packing ?? line.packingMaterial ?? line.product);
    const photos = normalizeUriList(packing.photos ?? line.photos);

    return {
      id: getId(line) || getId(packing) || `packing-${index + 1}`,
      name:
        getString(packing, 'name') ||
        getString(line, 'name') ||
        `Kemasan ${index + 1}`,
      sku: getString(packing, 'sku') || getString(line, 'sku'),
      quantity: getNumber(line, 'quantity') || 1,
      variantLabel: getString(line, 'variantLabel') || getString(line, 'label'),
      thumbnailUri:
        normalizeUri(
          getString(packing, 'thumbnail') ||
            getString(packing, 'thumbnailUrl') ||
            photos[0] ||
            '',
        ) || '',
    };
  });
}

function normalizeVendorPrices(value: unknown): KolamTeranuraVendorPrice[] {
  const list = Array.isArray(value) ? value : [];
  return list.map((entry, index) => {
    const row = asRecord(entry);
    const vendor = asRecord(row.vendor);
    const price = getNumber(row, 'price');
    const shippingCost = getNumber(row, 'shippingCost');
    const totalCost =
      getNumber(row, 'totalCost') || price + shippingCost;

    return {
      id: getId(row) || `vendor-${index + 1}`,
      vendorName:
        getString(row, 'vendorName') ||
        getString(vendor, 'name') ||
        (typeof row.vendor === 'string' ? row.vendor : '') ||
        'Vendor',
      price,
      shippingCost,
      totalCost,
    };
  });
}

function normalizeShippingMethods(
  value: unknown,
): KolamTeranuraShippingMethod[] {
  const list = Array.isArray(value) ? value : [];
  return list.map((entry, index) => {
    const method = asRecord(entry);
    const pricing = asRecord(method.pricingModel ?? method.pricing);
    const pricingType = getString(pricing, 'type') || 'fixed';
    const pricingPrice = getNumber(pricing, 'price');
    const displayName =
      getString(method, 'displayName') ||
      getString(method, 'name') ||
      `Metode ${index + 1}`;

    return {
      id: getId(method) || `shipping-${index + 1}`,
      displayName,
      category: getString(method, 'category'),
      pricingType,
      pricingPrice,
      priceLabel:
        pricingType === 'per_kg'
          ? `Rp ${pricingPrice.toLocaleString('id-ID')}/kg`
          : `Rp ${pricingPrice.toLocaleString('id-ID')} (fixed)`,
      logoUri:
        normalizeUri(
          getString(method, 'icon') || getString(method, 'logo') || '',
        ) || null,
    };
  });
}

function normalizeAssets(value: unknown): KolamTeranuraAsset[] {
  const list = Array.isArray(value) ? value : [];
  return list.map((entry, index) => {
    const row = asRecord(entry);
    return {
      id: getId(row) || `asset-${index + 1}`,
      title: getString(row, 'title') || getString(row, 'name') || `Aset ${index + 1}`,
      filename:
        getString(row, 'originalFilename') ||
        getString(row, 'filename') ||
        getString(row, 'fileName'),
      fileSize: getNumber(row, 'fileSize') || getNumber(row, 'size'),
      mimeType: getString(row, 'mimeType') || getString(row, 'contentType'),
    };
  });
}

function normalizeLinks(value: unknown): KolamTeranuraLink[] {
  const list = Array.isArray(value) ? value : [];
  return list
    .map((entry, index) => {
      if (typeof entry === 'string') {
        const url = entry.trim();
        return url
          ? { id: `link-${index + 1}`, label: url, url }
          : null;
      }
      const row = asRecord(entry);
      const url =
        getString(row, 'url') ||
        getString(row, 'href') ||
        getString(row, 'link');
      if (!url) {
        return null;
      }
      return {
        id: getId(row) || `link-${index + 1}`,
        label:
          getString(row, 'label') ||
          getString(row, 'name') ||
          getString(row, 'platform') ||
          url,
        url,
      };
    })
    .filter(Boolean) as KolamTeranuraLink[];
}

function normalizeTags(value: unknown): string[] {
  const list = Array.isArray(value) ? value : [];
  return list
    .map(entry => {
      if (typeof entry === 'string') {
        return entry.trim();
      }
      const row = asRecord(entry);
      return getString(row, 'name') || getString(row, 'label');
    })
    .filter(Boolean);
}

function normalizeLocationLabel(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  const location = asRecord(value);
  const parent = asRecord(location.parent);
  const grand = asRecord(parent.parent);
  const parts = [
    getString(grand, 'name'),
    getString(parent, 'name'),
    getString(location, 'name'),
  ].filter(Boolean);
  return parts.join(' › ');
}

function normalizeLinkedProductId(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  const record = asRecord(value);
  return getId(record);
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

function normalizeUriList(value: unknown): string[] {
  const list = Array.isArray(value) ? value : [];
  return list
    .map(entry => {
      if (typeof entry === 'string') {
        return normalizeUri(entry);
      }
      const row = asRecord(entry);
      return normalizeUri(
        getString(row, 'url') ||
          getString(row, 'uri') ||
          getString(row, 'src') ||
          getString(row, 'path'),
      );
    })
    .filter(Boolean);
}

function normalizeUri(value: string) {
  const trimmed = value.trim();
  return trimmed;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function getArray(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return Array.isArray(value) ? value : [];
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

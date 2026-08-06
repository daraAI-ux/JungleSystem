export type KolamPackingMaterialStatus = 'active' | 'inactive';

export interface KolamPackingUnitRef {
  id: string;
  name: string;
  symbol: string;
}

export interface KolamPackingDimension {
  length: number | null;
  width: number | null;
  height: number | null;
  unit: KolamPackingUnitRef | null;
}

export interface KolamPackingWeight {
  value: number | null;
  unit: KolamPackingUnitRef | null;
}

export interface KolamPackingVendorPrice {
  id: string;
  vendorId: string;
  vendorName: string;
  price: number;
  shippingCost: number;
  totalCost: number;
  link: string;
  priceHistoryCount: number;
}

export interface KolamPackingAsset {
  id: string;
  title: string;
  name: string;
  path: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  type: string;
  size: number;
  url: string;
  uploadedAt?: string;
}

export interface KolamPackingCatalogUsageRow {
  entityType: 'product' | 'species';
  entityId: string;
  name: string;
  code: string;
  productType: 'raw' | 'product' | null;
  variantLabel: string;
  quantity: number;
  usageKind: 'component' | 'packing';
}

export interface KolamPackingMaterial {
  id: string;
  name: string;
  description: string;
  category: string;
  dimension: KolamPackingDimension;
  weight: KolamPackingWeight;
  price: number;
  cost: number;
  stock: number;
  vendorPrices: KolamPackingVendorPrice[];
  photos: string[];
  assets: KolamPackingAsset[];
  status: KolamPackingMaterialStatus;
  createdAt?: string;
  updatedAt?: string;
  raw: unknown;
}

export interface KolamPackingMaterialFormState {
  id?: string;
  name: string;
  description: string;
  category: string;
  dimensionLength: string;
  dimensionWidth: string;
  dimensionHeight: string;
  dimensionUnit: string;
  weightValue: string;
  weightUnit: string;
  price: string;
  stock: string;
  enabled: boolean;
  vendorPrices: KolamPackingVendorPriceFormLine[];
}

export interface KolamPackingVendorPriceFormLine {
  id: string;
  vendorId: string;
  vendorName: string;
  price: string;
  shippingCost: string;
  link: string;
}

export const KOLAM_PACKING_MATERIAL_BREADCRUMB_ROOT = '/packing-materials';

export const KOLAM_PACKING_CATEGORY_OPTIONS = [
  { label: 'Kayu', value: 'Wood' },
  { label: 'Bubble Wrap', value: 'Bubble Wrap' },
  { label: 'Foam', value: 'Foam' },
  { label: 'Lainnya', value: 'Other' },
] as const;

export function isKolamPackingMaterialRoute(route: string) {
  return (
    route === KOLAM_PACKING_MATERIAL_BREADCRUMB_ROOT ||
    route === `${KOLAM_PACKING_MATERIAL_BREADCRUMB_ROOT}/create` ||
    route === `${KOLAM_PACKING_MATERIAL_BREADCRUMB_ROOT}/baru` ||
    route.startsWith(`${KOLAM_PACKING_MATERIAL_BREADCRUMB_ROOT}/`)
  );
}

export function getKolamPackingMaterialBreadcrumbPath(
  mode: 'list' | 'detail' | 'edit' | 'new',
  item?: Pick<KolamPackingMaterial, 'id' | 'name'> | null,
) {
  if (mode === 'new') {
    return `${KOLAM_PACKING_MATERIAL_BREADCRUMB_ROOT}/baru`;
  }

  if ((mode === 'detail' || mode === 'edit') && item) {
    return `${KOLAM_PACKING_MATERIAL_BREADCRUMB_ROOT}/${encodeURIComponent(item.id)}`;
  }

  return KOLAM_PACKING_MATERIAL_BREADCRUMB_ROOT;
}

export function createEmptyKolamPackingMaterialFormState(): KolamPackingMaterialFormState {
  return {
    name: '',
    description: '',
    category: 'Wood',
    dimensionLength: '',
    dimensionWidth: '',
    dimensionHeight: '',
    dimensionUnit: '',
    weightValue: '',
    weightUnit: '',
    price: '0',
    stock: '0',
    enabled: true,
    vendorPrices: [],
  };
}

export function createKolamPackingMaterialFormState(
  item: KolamPackingMaterial,
): KolamPackingMaterialFormState {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    category: item.category || 'Wood',
    dimensionLength: stringifyNumber(item.dimension.length),
    dimensionWidth: stringifyNumber(item.dimension.width),
    dimensionHeight: stringifyNumber(item.dimension.height),
    dimensionUnit: item.dimension.unit?.id ?? '',
    weightValue: stringifyNumber(item.weight.value),
    weightUnit: item.weight.unit?.id ?? '',
    price: stringifyNumber(item.price) || '0',
    stock: stringifyNumber(item.stock) || '0',
    enabled: item.status === 'active',
    vendorPrices: item.vendorPrices.map(price => ({
      id: price.id,
      vendorId: price.vendorId,
      vendorName: price.vendorName,
      price: stringifyNumber(price.price) || '0',
      shippingCost: stringifyNumber(price.shippingCost) || '0',
      link: price.link,
    })),
  };
}

export function createKolamPackingMaterialSavePayload(
  form: KolamPackingMaterialFormState,
) {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    category: form.category || 'Other',
    dimension: {
      length: toNumberOrNull(form.dimensionLength),
      width: toNumberOrNull(form.dimensionWidth),
      height: toNumberOrNull(form.dimensionHeight),
      unit: form.dimensionUnit || null,
    },
    weight: {
      value: toNumberOrNull(form.weightValue),
      unit: form.weightUnit || null,
    },
    price: toNumber(form.price),
    stock: Math.max(0, toNumber(form.stock)),
    vendorPrices: form.vendorPrices
      .map(line => ({
        vendor: line.vendorId || undefined,
        price: Math.max(0, toNumber(line.price)),
        shippingCost: Math.max(0, toNumber(line.shippingCost)),
        link: line.link.trim(),
      }))
      .filter(line => line.vendor || line.price > 0 || line.shippingCost > 0 || line.link),
    enabled: form.enabled,
  };
}

export function normalizeKolamPackingOptionList(payload: unknown) {
  return normalizeKolamPackingMaterialList(payload);
}

export type KolamPackingOption = KolamPackingMaterial;

export function normalizeKolamPackingMaterialList(payload: unknown) {
  const root = unwrapData(payload);
  const record = asRecord(root);
  const list: unknown[] = Array.isArray(root)
    ? root
    : Array.isArray(record.data)
    ? record.data
    : Array.isArray(record.items)
    ? record.items
    : Array.isArray(record.packings)
    ? record.packings
    : [];

  return list.map(normalizeKolamPackingMaterial);
}

export function normalizeKolamPackingMaterialDetail(payload: unknown) {
  return normalizeKolamPackingMaterial(unwrapData(payload));
}
export function normalizeKolamPackingCatalogUsageList(
  payload: unknown,
): KolamPackingCatalogUsageRow[] {
  const root = unwrapData(payload);
  const record = asRecord(root);
  const rows: unknown[] = Array.isArray(root)
    ? root
    : Array.isArray(record.data)
    ? record.data
    : [];

  return rows.map(row => {
    const item = asRecord(row);
    const entityType = item.entityType === 'species' ? 'species' : 'product';
    const productType =
      item.productType === 'raw'
        ? 'raw'
        : item.productType === 'product'
        ? 'product'
        : null;

    return {
      entityType,
      entityId: getString(item, 'entityId') || getString(item, 'id'),
      name: getString(item, 'name') || 'Katalog tanpa nama',
      code: getString(item, 'code'),
      productType,
      variantLabel: getString(item, 'variantLabel'),
      quantity: getNumber(item, 'quantity'),
      usageKind: item.usageKind === 'component' ? 'component' : 'packing',
    };
  });
}
export function normalizeKolamPackingMaterial(payload: unknown): KolamPackingMaterial {
  const record = asRecord(payload);
  const id = getString(record, '_id') || getString(record, 'id');
  const name = getString(record, 'name') || 'Kemasan tanpa nama';
  const enabled = getBoolean(record, 'enabled') ?? true;

  return {
    id: id || slugifyPackingMaterialName(name),
    name,
    description: getString(record, 'description'),
    category: getString(record, 'category') || 'Other',
    dimension: normalizeDimension(record.dimension),
    weight: normalizeWeight(record.weight),
    price: getNumber(record, 'price'),
    cost: getNumber(record, 'cost'),
    stock: getNumber(record, 'stock'),
    vendorPrices: normalizeVendorPrices(record.vendorPrices),
    photos: normalizeStringList(record.photos),
    assets: normalizeAssets(record.assets),
    status: enabled ? 'active' : 'inactive',
    createdAt: getString(record, 'createdAt') || undefined,
    updatedAt: getString(record, 'updatedAt') || undefined,
    raw: payload,
  };
}

export function createKolamPackingOptionListRevision(items: KolamPackingOption[]) {
  return createKolamPackingMaterialListRevision(items);
}

export function createKolamPackingMaterialListRevision(items: KolamPackingMaterial[]) {
  return createStableHash(
    items.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      dimension: item.dimension,
      weight: item.weight,
      price: item.price,
      cost: item.cost,
      stock: item.stock,
      status: item.status,
      photos: item.photos,
      updatedAt: item.updatedAt,
      vendorPrices: item.vendorPrices.map(price => ({
        vendorId: price.vendorId,
        price: price.price,
        shippingCost: price.shippingCost,
        totalCost: price.totalCost,
      })),
    })),
  );
}

export function createKolamPackingMaterialDetailRevision(item: KolamPackingMaterial) {
  return createStableHash({
    id: item.id,
    name: item.name,
    description: item.description,
    category: item.category,
    dimension: item.dimension,
    weight: item.weight,
    price: item.price,
    cost: item.cost,
    stock: item.stock,
    status: item.status,
    photos: item.photos,
    assets: item.assets,
    vendorPrices: item.vendorPrices,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  });
}

export function getPackingCategoryLabel(category: string) {
  return (
    KOLAM_PACKING_CATEGORY_OPTIONS.find(option => option.value === category)
      ?.label ?? (category || 'Lainnya')
  );
}

export function getPackingEffectiveHpp(item: Pick<KolamPackingMaterial, 'cost' | 'vendorPrices'>) {
  if (item.cost > 0) {
    return item.cost;
  }

  const totals = item.vendorPrices
    .map(price => price.totalCost || price.price + price.shippingCost)
    .filter(total => total > 0);

  return totals.length ? Math.min(...totals) : 0;
}

export function formatPackingDimension(item: Pick<KolamPackingMaterial, 'dimension'>) {
  const { length, width, height } = item.dimension;
  const hasAny = [length, width, height].some(value => value !== null && value !== 0);

  if (!hasAny) {
    return '-';
  }

  const unit = item.dimension.unit?.symbol || item.dimension.unit?.name || '';
  return `${formatDimensionPart(length)} x ${formatDimensionPart(width)} x ${formatDimensionPart(height)}${unit ? ` ${unit}` : ''}`;
}

export function formatPackingWeight(item: Pick<KolamPackingMaterial, 'weight'>) {
  const value = item.weight.value;
  if (value === null || value === 0) {
    return '-';
  }

  const unit = item.weight.unit?.symbol || item.weight.unit?.name || '';
  return `${value}${unit ? ` ${unit}` : ''}`;
}

export function slugifyPackingMaterialName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeDimension(value: unknown): KolamPackingDimension {
  const record = asRecord(value);
  return {
    length: getNullableNumber(record, 'length'),
    width: getNullableNumber(record, 'width'),
    height: getNullableNumber(record, 'height'),
    unit: normalizeUnitRef(record.unit),
  };
}

function normalizeWeight(value: unknown): KolamPackingWeight {
  const record = asRecord(value);
  return {
    value: getNullableNumber(record, 'value'),
    unit: normalizeUnitRef(record.unit),
  };
}

function normalizeUnitRef(value: unknown): KolamPackingUnitRef | null {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return { id: value, name: value, symbol: '' };
  }

  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  const name = getString(record, 'name') || getString(record, 'initial') || id;
  const symbol = getString(record, 'symbol') || getString(record, 'initial');

  return id || name ? { id: id || name, name, symbol } : null;
}

function normalizeVendorPrices(value: unknown): KolamPackingVendorPrice[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry, index) => {
    const record = asRecord(entry);
    const vendor = asRecord(record.vendor);
    const vendorId =
      typeof record.vendor === 'string'
        ? record.vendor
        : getString(vendor, '_id') || getString(vendor, 'id');
    const price = getNumber(record, 'price');
    const shippingCost = getNumber(record, 'shippingCost');
    const totalCost = getNumber(record, 'totalCost') || price + shippingCost;

    return {
      id: getString(record, '_id') || getString(record, 'id') || `${vendorId || 'vendor'}-${index}`,
      vendorId,
      vendorName: getString(vendor, 'name') || vendorId || 'Vendor tanpa nama',
      price,
      shippingCost,
      totalCost,
      link: getString(record, 'link'),
      priceHistoryCount: Array.isArray(record.priceHistory) ? record.priceHistory.length : 0,
    };
  });
}

function normalizeAssets(value: unknown): KolamPackingAsset[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry, index) => {
    const record = asRecord(entry);
    const title =
      getString(record, 'title') ||
      getString(record, 'name') ||
      `Aset ${index + 1}`;
    const originalFilename =
      getString(record, 'originalFilename') ||
      getString(record, 'originalName');
    const mimeType = getString(record, 'mimeType') || getString(record, 'type');
    const fileSize = getNumber(record, 'fileSize') || getNumber(record, 'size');
    const path = getString(record, 'path') || getString(record, 'url');

    return {
      id: getString(record, '_id') || getString(record, 'id') || `asset-${index}`,
      title,
      name: title || originalFilename || `Aset ${index + 1}`,
      path,
      originalFilename,
      mimeType,
      fileSize,
      type: mimeType || '-',
      size: fileSize,
      url: path,
      uploadedAt: getString(record, 'uploadedAt') || undefined,
    };
  });
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

function getBoolean(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'boolean' ? value : null;
}

function getNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function getNullableNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeStringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    : [];
}

function stringifyNumber(value: number | null | undefined) {
  return value === null || value === undefined ? '' : String(value);
}

function toNumber(value: string) {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toNumberOrNull(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDimensionPart(value: number | null) {
  return value === null || value === 0 ? '-' : String(value);
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


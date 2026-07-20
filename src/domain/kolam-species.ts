import {
  normalizeKolamTranslationsForSave,
  normalizeKolamTranslationsFromRecord,
  type KolamCatalogTranslationsMap,
  type KolamSpeciesLocaleFields,
} from './kolam-catalog-locale';
import { getKolamFileUrl } from '../lib/file-url';

export type KolamSpeciesStatus = 'active' | 'inactive' | 'draft';
export type KolamSpeciesSellableFilter = 'all' | 'sellable' | 'not-sellable';
export type KolamSpeciesStockStatus = 'all' | 'in_stock' | 'out_of_stock';

export interface KolamSpeciesRef {
  id: string;
  name: string;
}

export interface KolamSpeciesLocaleContent {
  code: string;
  commonName: string;
  localName: string;
  shortDescription: string;
  description: string;
  morfologis: string;
  habitat: string;
  distribution: string;
}

export type KolamSpeciesMarketplaceSyncStatus =
  | 'pending'
  | 'synced'
  | 'skipped'
  | 'notFound'
  | 'failed'
  | 'partial'
  | 'unknown';

export interface KolamSpeciesMarketplaceSyncPlatform {
  platform: 'tokopedia' | 'shopee';
  label: string;
  status: KolamSpeciesMarketplaceSyncStatus;
  statusLabel: string;
  lastSyncedAt?: string;
  lastError?: string;
  lastTaskId?: string;
  variantCount: number;
}

export interface KolamSpeciesMarketplaceSync {
  label: string;
  lastSyncedAt?: string;
  platforms: KolamSpeciesMarketplaceSyncPlatform[];
  pricePlatforms: KolamSpeciesMarketplaceSyncPlatform[];
}

export type KolamSpeciesLinkName =
  | 'shopee'
  | 'tokopedia'
  | 'website'
  | 'link_pos'
  | 'other_link';

export interface KolamSpeciesExternalLink {
  name: KolamSpeciesLinkName;
  label: string;
  value: string;
}
export interface KolamSpeciesVendorPriceHistory {
  oldPrice: number;
  newPrice: number;
  oldShippingCost: number;
  newShippingCost: number;
  oldTotalCost: number;
  newTotalCost: number;
  poRef: string;
  poId: string;
  date: string;
  updatedByLabel: string;
}

export interface KolamSpeciesVendorPrice {
  id: string;
  vendorId: string;
  vendorName: string;
  price: number;
  shippingCost: number;
  totalCost: number;
  link: string;
  priceHistory: KolamSpeciesVendorPriceHistory[];
}

export interface KolamSpeciesVendorPriceFormRow {
  id: string;
  vendorId: string;
  price: string;
  shippingCost: string;
  link: string;
  priceHistory: KolamSpeciesVendorPriceHistory[];
}
export interface KolamSpeciesVariantMedia {
  id: string;
  label: string;
  tier1Value: string;
  tier2Value: string;
  sku: string;
  productCode: string;
  stock: number;
  price: number;
  priceToSell: number;
  marketPrice: number;
  onlinePrice: number;
  minimumPriceToSales: number;
  minimumOrderQty: number;
  weightValue: number;
  weightUnitId: string;
  dimensionLength: number;
  dimensionWidth: number;
  dimensionHeight: number;
  dimensionUnitId: string;
  photoUris: string[];
  videoUris: string[];
  vendorPrices: KolamSpeciesVendorPrice[];
  raw: unknown;
}

export interface KolamSpeciesVariantFormRow {
  id: string;
  tier1Value: string;
  tier2Value: string;
  sku: string;
  productCode: string;
  price: string;
  priceToSell: string;
  marketPrice: string;
  onlinePrice: string;
  minimumPriceToSales: string;
  minimumOrderQty: string;
  weightValue: string;
  weightUnitId: string;
  dimensionLength: string;
  dimensionWidth: string;
  dimensionHeight: string;
  dimensionUnitId: string;
  vendorPrices: KolamSpeciesVendorPriceFormRow[];
  raw: unknown;
}

export interface KolamSpecies {
  id: string;
  scientificName: string;
  commonName: string;
  localName: string;
  displayName: string;
  slug: string;
  sku: string;
  thumbnailUri: string | null;
  photoUris: string[];
  videoUris: string[];
  voiceUri: string | null;
  variants: KolamSpeciesVariantMedia[];
  taxonomy: KolamSpeciesRef | null;
  taxonomyPath: string;
  categories: KolamSpeciesRef[];
  tags: KolamSpeciesRef[];
  iucnStatus: KolamSpeciesRef | null;
  iucnLink: string;
  unitLabel: string;
  priceToSell: number;
  stock: number;
  variantCount: number;
  hasVariants: boolean;
  sellable: boolean;
  status: KolamSpeciesStatus;
  isPinned: boolean;
  marketplaceSync: KolamSpeciesMarketplaceSync;
  links: KolamSpeciesExternalLink[];
  locales: KolamSpeciesLocaleContent[];
  translations: KolamCatalogTranslationsMap<KolamSpeciesLocaleFields>;
  description: string;
  shortDescription: string;
  morfologis: string;
  habitat: string;
  distribution: string;
  createdAt?: string;
  updatedAt?: string;
  raw: unknown;
}

export interface KolamSpeciesFormState {
  id?: string;
  scientificName: string;
  commonName: string;
  localName: string;
  sku: string;
  taxonomyId: string;
  categoryIds: string[];
  tagIds: string[];
  iucnStatusId: string;
  iucnLink: string;
  unitId: string;
  priceToSell: string;
  stock: string;
  sellable: boolean;
  status: KolamSpeciesStatus;
  description: string;
  shortDescription: string;
  morfologis: string;
  habitat: string;
  distribution: string;
  translations: KolamCatalogTranslationsMap<KolamSpeciesLocaleFields>;
  thumbnailLocalUri: string;
  photoLocalUri: string;
  videoLocalUri: string;
  voiceLocalUri: string;
  selectedVariantId: string;
  variantPhotoLocalUri: string;
  variantVideoLocalUri: string;
  variantConfigTier1Name: string;
  variantConfigTier2Name: string;
  variants: KolamSpeciesVariantFormRow[];
  variantsTouched: boolean;
  linkWebsite: string;
  linkShopee: string;
  linkTokopedia: string;
  linkPos: string;
  linkOther: string;
}
export const KOLAM_SPECIES_BREADCRUMB_ROOT = '/species';

export function isKolamSpeciesRoute(route: string) {
  const path = normalizeSpeciesRoutePath(route);

  return (
    path === KOLAM_SPECIES_BREADCRUMB_ROOT ||
    path === KOLAM_SPECIES_BREADCRUMB_ROOT + '/create' ||
    path === KOLAM_SPECIES_BREADCRUMB_ROOT + '/baru' ||
    path.startsWith(KOLAM_SPECIES_BREADCRUMB_ROOT + '/')
  );
}

function normalizeSpeciesRoutePath(route: string) {
  const path = route.trim().split('?')[0].replace(/^\/+/, '');
  return ('/' + path).replace(/\/+$/, '') || KOLAM_SPECIES_BREADCRUMB_ROOT;
}

export function getKolamSpeciesBreadcrumbPath(
  mode: 'list' | 'detail' | 'edit' | 'new',
  species?: Pick<KolamSpecies, 'displayName' | 'scientificName'> | null,
) {
  if (mode === 'new') {
    return KOLAM_SPECIES_BREADCRUMB_ROOT + '/baru';
  }

  if (mode === 'detail' && species) {
    return `${KOLAM_SPECIES_BREADCRUMB_ROOT}/${species.displayName || species.scientificName}`;
  }

  if (mode === 'edit' && species) {
    return KOLAM_SPECIES_BREADCRUMB_ROOT + '/' + (species.displayName || species.scientificName) + '/edit';
  }

  return KOLAM_SPECIES_BREADCRUMB_ROOT;
}

export function createEmptyKolamSpeciesFormState(): KolamSpeciesFormState {
  return {
    scientificName: '',
    commonName: '',
    localName: '',
    sku: '',
    taxonomyId: '',
    categoryIds: [],
    tagIds: [],
    iucnStatusId: '',
    iucnLink: '',
    unitId: '',
    priceToSell: '0',
    stock: '0',
    sellable: false,
    status: 'active',
    description: '',
    shortDescription: '',
    morfologis: '',
    habitat: '',
    distribution: '',
    translations: {},
    thumbnailLocalUri: '',
    photoLocalUri: '',
    videoLocalUri: '',
    voiceLocalUri: '',
    selectedVariantId: '',
    variantPhotoLocalUri: '',
    variantVideoLocalUri: '',
    variantConfigTier1Name: 'Varian',
    variantConfigTier2Name: '',
    variants: [],
    variantsTouched: false,
    linkWebsite: '',
    linkShopee: '',
    linkTokopedia: '',
    linkPos: '',
    linkOther: '',
  };
}

export function createKolamSpeciesFormState(
  species: KolamSpecies,
): KolamSpeciesFormState {
  const raw = asRecord(unwrapData(species.raw));
  const idLocale = species.locales.find(locale => locale.code === 'id');
  const variantConfig = asRecord(raw.variantConfig);

  return {
    id: species.id,
    scientificName: species.scientificName,
    commonName: species.commonName,
    localName: species.localName,
    sku: species.sku,
    taxonomyId: species.taxonomy?.id ?? '',
    categoryIds: species.categories.map(category => category.id),
    tagIds: species.tags.map(tag => tag.id),
    iucnStatusId: species.iucnStatus?.id ?? '',
    iucnLink: species.iucnLink,
    unitId:
      getString(asRecord(raw.units), '_id') ||
      getString(asRecord(raw.units), 'id') ||
      getString(asRecord(raw.unit), '_id') ||
      getString(asRecord(raw.unit), 'id'),
    priceToSell: String(species.priceToSell),
    stock: String(species.stock),
    sellable: species.sellable,
    status: species.status,
    description: idLocale?.description || species.description || getString(raw, 'description'),
    shortDescription:
      idLocale?.shortDescription ||
      species.shortDescription ||
      getString(raw, 'shortDescription'),
    morfologis: idLocale?.morfologis || species.morfologis || getString(raw, 'morfologis'),
    habitat: idLocale?.habitat || species.habitat || getString(raw, 'habitat'),
    distribution:
      idLocale?.distribution || species.distribution || getString(raw, 'distribution'),
    translations: species.translations,
    thumbnailLocalUri: '',
    photoLocalUri: '',
    videoLocalUri: '',
    voiceLocalUri: '',
    selectedVariantId: '',
    variantPhotoLocalUri: '',
    variantVideoLocalUri: '',
    variantConfigTier1Name: getString(variantConfig, 'tier1Name') || 'Varian',
    variantConfigTier2Name: getString(variantConfig, 'tier2Name'),
    variants: species.variants.map(createKolamSpeciesVariantFormRow),
    variantsTouched: false,
    linkWebsite: getSpeciesLinkValue(species.links, 'website'),
    linkShopee: getSpeciesLinkValue(species.links, 'shopee'),
    linkTokopedia: getSpeciesLinkValue(species.links, 'tokopedia'),
    linkPos: getSpeciesLinkValue(species.links, 'link_pos'),
    linkOther: getSpeciesLinkValue(species.links, 'other_link'),
  };
}

export function createKolamSpeciesSavePayload(form: KolamSpeciesFormState) {
  const priceToSell = Number(form.priceToSell);
  const stock = Number(form.stock);

  return {
    scientificName: form.scientificName.trim(),
    commonName: form.commonName.trim(),
    localName: form.localName.trim(),
    sku: form.sku.trim(),
    taxonomy: form.taxonomyId.trim(),
    category: form.categoryIds,
    tags: form.tagIds,
    iucnStatus: form.iucnStatusId.trim() || undefined,
    iucnLink: form.iucnLink.trim() || null,
    units: form.unitId.trim() || undefined,
    link: createKolamSpeciesLinkPayload(form),
    priceToSell: Number.isFinite(priceToSell) ? Math.max(0, priceToSell) : 0,
    stock: Number.isFinite(stock) ? Math.max(0, stock) : 0,
    sellable: form.sellable,
    status: form.status,
    shortDescription: form.shortDescription.trim(),
    description: form.description.trim(),
    morfologis: form.morfologis,
    habitat: form.habitat,
    distribution: form.distribution.trim(),
    translations: normalizeKolamTranslationsForSave(form.translations) ?? {},
    ...(form.variantsTouched
      ? {
          variantConfig: createKolamSpeciesVariantConfigPayload(form),
          variants: form.variants.map(createKolamSpeciesVariantPayload),
        }
      : {}),
  };
}

function createKolamSpeciesLinkPayload(form: KolamSpeciesFormState) {
  return [
    { name: 'website', value: form.linkWebsite },
    { name: 'shopee', value: form.linkShopee },
    { name: 'tokopedia', value: form.linkTokopedia },
    { name: 'link_pos', value: form.linkPos },
    { name: 'other_link', value: form.linkOther },
  ]
    .map(item => ({ name: item.name, value: item.value.trim() }))
    .filter(item => item.value);
}

export function createEmptyKolamSpeciesVariantFormRow(): KolamSpeciesVariantFormRow {
  return {
    id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tier1Value: '',
    tier2Value: '',
    sku: '',
    productCode: '',
    price: '0',
    priceToSell: '0',
    marketPrice: '0',
    onlinePrice: '0',
    minimumPriceToSales: '0',
    minimumOrderQty: '1',
    weightValue: '',
    weightUnitId: '',
    dimensionLength: '',
    dimensionWidth: '',
    dimensionHeight: '',
    dimensionUnitId: '',
    vendorPrices: [],
    raw: null,
  };
}

function createKolamSpeciesVariantFormRow(
  variant: KolamSpeciesVariantMedia,
): KolamSpeciesVariantFormRow {
  return {
    id: variant.id,
    tier1Value: variant.tier1Value,
    tier2Value: variant.tier2Value,
    sku: variant.sku,
    productCode: variant.productCode,
    price: String(variant.price),
    priceToSell: String(variant.priceToSell),
    marketPrice: String(variant.marketPrice),
    onlinePrice: String(variant.onlinePrice),
    minimumPriceToSales: String(variant.minimumPriceToSales),
    minimumOrderQty: String(variant.minimumOrderQty || 1),
    weightValue: variant.weightValue ? String(variant.weightValue) : '',
    weightUnitId: variant.weightUnitId,
    dimensionLength: variant.dimensionLength ? String(variant.dimensionLength) : '',
    dimensionWidth: variant.dimensionWidth ? String(variant.dimensionWidth) : '',
    dimensionHeight: variant.dimensionHeight ? String(variant.dimensionHeight) : '',
    dimensionUnitId: variant.dimensionUnitId,
    vendorPrices: variant.vendorPrices.map(createKolamSpeciesVendorPriceFormRow),
    raw: variant.raw,
  };
}

function createKolamSpeciesVariantConfigPayload(form: KolamSpeciesFormState) {
  const tier1Values = uniqueStrings(
    form.variants.map(variant => variant.tier1Value.trim()).filter(Boolean),
  );
  const tier2Values = uniqueStrings(
    form.variants.map(variant => variant.tier2Value.trim()).filter(Boolean),
  );

  return {
    tier1Name: form.variantConfigTier1Name.trim() || 'Varian',
    tier1Values,
    tier2Name: form.variantConfigTier2Name.trim(),
    tier2Values,
  };
}

function createKolamSpeciesVariantPayload(row: KolamSpeciesVariantFormRow) {
  const raw = asRecord(row.raw);
  const payload: Record<string, unknown> = {
    tier1Value: row.tier1Value.trim(),
    tier2Value: row.tier2Value.trim() || undefined,
    sku: row.sku.trim() || undefined,
    productCode: row.productCode.trim() || undefined,
    price: toNonNegativeNumber(row.price),
    price_to_sell: toNonNegativeNumber(row.priceToSell),
    marketPrice: toNonNegativeNumber(row.marketPrice),
    onlinePrice: toNonNegativeNumber(row.onlinePrice),
    minimum_price_to_sales: toNonNegativeNumber(row.minimumPriceToSales),
    minimumOrderQty: Math.max(1, toNonNegativeNumber(row.minimumOrderQty) || 1),
  };

  if (isMongoObjectId(row.id)) {
    payload._id = row.id;
  }

  const weightValue = toOptionalNonNegativeNumber(row.weightValue);
  if (weightValue !== null && row.weightUnitId.trim()) {
    payload.weight = { value: weightValue, unit: row.weightUnitId.trim() };
  } else if (raw.weight) {
    payload.weight = normalizeExistingWeight(raw.weight);
  }

  const dimension = createDimensionPayload(row, raw.dimension);
  if (dimension) {
    payload.dimension = dimension;
  }

  const vendorPrices = createKolamSpeciesVendorPricePayload(row.vendorPrices);
  if (vendorPrices.length) {
    payload.vendorPrices = vendorPrices;
  }

  const grocerPricingTiers = normalizeExistingGrocerPricingTiers(raw.grocerPricingTiers);
  if (grocerPricingTiers.length) {
    payload.grocerPricingTiers = grocerPricingTiers;
  }

  const componentOverrides = normalizeExistingComponentOverrides(raw.componentOverrides);
  if (componentOverrides.length) {
    payload.componentOverrides = componentOverrides;
  }

  return payload;
}

function toNonNegativeNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function toOptionalNonNegativeNumber(value: string) {
  if (!value.trim()) {
    return null;
  }

  return toNonNegativeNumber(value);
}

function isMongoObjectId(value: string) {
  return /^[a-f\d]{24}$/i.test(value.trim());
}

function normalizeExistingWeight(value: unknown) {
  const record = asRecord(value);
  const unit = getObjectIdString(record.unit);
  const weightValue = getNumber(record, 'value');
  return unit && weightValue !== undefined && weightValue >= 0
    ? { unit, value: weightValue }
    : undefined;
}

function createDimensionPayload(
  row: KolamSpeciesVariantFormRow,
  existingValue: unknown,
) {
  const length = toOptionalNonNegativeNumber(row.dimensionLength);
  const width = toOptionalNonNegativeNumber(row.dimensionWidth);
  const height = toOptionalNonNegativeNumber(row.dimensionHeight);
  const unit = row.dimensionUnitId.trim();

  if (length !== null && width !== null && height !== null && unit) {
    return { length, width, height, unit };
  }

  const existing = asRecord(existingValue);
  const existingUnit = getObjectIdString(existing.unit);
  const existingLength = getNumber(existing, 'length');
  const existingWidth = getNumber(existing, 'width');
  const existingHeight = getNumber(existing, 'height');

  return existingUnit && existingLength !== undefined && existingWidth !== undefined && existingHeight !== undefined
    ? {
        length: Math.max(0, existingLength),
        width: Math.max(0, existingWidth),
        height: Math.max(0, existingHeight),
        unit: existingUnit,
      }
    : null;
}

function createKolamSpeciesVendorPricePayload(
  rows: KolamSpeciesVendorPriceFormRow[],
) {
  return rows
    .map(row => {
      const vendor = row.vendorId.trim();
      const price = toNonNegativeNumber(row.price);
      if (!vendor) {
        return null;
      }

      return {
        vendor,
        price,
        shippingCost: toNonNegativeNumber(row.shippingCost),
        link: row.link.trim(),
      };
    })
    .filter(Boolean) as Array<{
    vendor: string;
    price: number;
    shippingCost: number;
    link: string;
  }>;
}

export function createEmptyKolamSpeciesVendorPriceFormRow(): KolamSpeciesVendorPriceFormRow {
  return {
    id: `vendor-draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    vendorId: '',
    price: '0',
    shippingCost: '0',
    link: '',
    priceHistory: [],
  };
}

function createKolamSpeciesVendorPriceFormRow(
  item: KolamSpeciesVendorPrice,
): KolamSpeciesVendorPriceFormRow {
  return {
    id: item.id,
    vendorId: item.vendorId,
    price: String(item.price),
    shippingCost: String(item.shippingCost),
    link: item.link,
    priceHistory: item.priceHistory,
  };
}

function normalizeKolamSpeciesVendorPrices(value: unknown): KolamSpeciesVendorPrice[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      const record = asRecord(item);
      const vendorRecord = asRecord(record.vendor);
      const vendorId = getObjectIdString(record.vendor);
      const price = getNumber(record, 'price');
      if (!vendorId || price === undefined || price < 0) {
        return null;
      }

      const shippingCost = Math.max(0, getNumber(record, 'shippingCost') ?? 0);
      const totalCost = Math.max(
        0,
        getNumber(record, 'totalCost') ?? price + shippingCost,
      );

      return {
        id: getString(record, '_id') || getString(record, 'id') || vendorId || String(index),
        vendorId,
        vendorName:
          getString(vendorRecord, 'name') ||
          getString(vendorRecord, 'companyName') ||
          getString(record, 'vendorName') ||
          'Vendor',
        price,
        shippingCost,
        totalCost,
        link: getString(record, 'link'),
        priceHistory: normalizeKolamSpeciesVendorPriceHistory(record.priceHistory),
      };
    })
    .filter(Boolean) as KolamSpeciesVendorPrice[];
}

function normalizeKolamSpeciesVendorPriceHistory(
  value: unknown,
): KolamSpeciesVendorPriceHistory[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const record = asRecord(item);
    const updatedBy = asRecord(record.updatedBy);

    return {
      oldPrice: getNumber(record, 'oldPrice') ?? 0,
      newPrice: getNumber(record, 'newPrice') ?? 0,
      oldShippingCost: getNumber(record, 'oldShippingCost') ?? 0,
      newShippingCost: getNumber(record, 'newShippingCost') ?? 0,
      oldTotalCost: getNumber(record, 'oldTotalCost') ?? 0,
      newTotalCost: getNumber(record, 'newTotalCost') ?? 0,
      poRef: getString(record, 'poRef'),
      poId: getObjectIdString(record.poId),
      date: getString(record, 'date') || String(index),
      updatedByLabel:
        getString(updatedBy, 'name') ||
        getString(updatedBy, 'email') ||
        getString(record, 'updatedByLabel'),
    };
  });
}

function normalizeExistingGrocerPricingTiers(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => {
      const record = asRecord(item);
      const minQty = getNumber(record, 'minQty');
      const price = getNumber(record, 'price');
      if (minQty === undefined || minQty < 1 || price === undefined || price < 0) {
        return null;
      }

      return {
        minQty,
        price,
        onlinePrice: Math.max(0, getNumber(record, 'onlinePrice') ?? 0),
      };
    })
    .filter(Boolean) as Array<{
    minQty: number;
    price: number;
    onlinePrice: number;
  }>;
}

function normalizeExistingComponentOverrides(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => {
      const record = asRecord(item);
      const product = getObjectIdString(record.product);
      const quantity = getNumber(record, 'quantity');
      if (!product || quantity === undefined || quantity < 0) {
        return null;
      }

      return { product, quantity };
    })
    .filter(Boolean) as Array<{ product: string; quantity: number }>;
}

function getObjectIdString(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  const record = asRecord(value);
  return getString(record, '_id') || getString(record, 'id');
}
export function normalizeKolamSpecies(payload: unknown): KolamSpecies {
  const record = asRecord(unwrapData(payload));
  const id = getString(record, '_id') || getString(record, 'id');
  const scientificName =
    getString(record, 'scientificName') ||
    getString(record, 'name') ||
    'Spesies tanpa nama';
  const commonName = getString(record, 'commonName');
  const localName = getString(record, 'localName');
  const displayName = commonName || localName || scientificName;
  const photos = normalizeMediaList(record.photos);
  const videos = normalizeMediaList(record.videos);
  const variants = normalizeVariantMediaList(record.variants);
  const links = normalizeSpeciesLinks(record.link);
  const thumbnail =
    getKolamFileUrl(getNullableString(record, 'thumbnailImage')) ??
    photos[0] ??
    null;
  const translations = normalizeKolamTranslationsFromRecord<KolamSpeciesLocaleFields>(
    record.translations,
  );
  const categories = normalizeRefList(record.category ?? record.categories);
  const unit = asRecord(record.units ?? record.unit);

  return {
    id: id || slugifySpeciesName(scientificName),
    scientificName,
    commonName,
    localName,
    displayName,
    slug: getString(record, 'slug') || slugifySpeciesName(scientificName),
    sku: getString(record, 'sku'),
    thumbnailUri: thumbnail,
    photoUris: uniqueStrings(photos),
    videoUris: uniqueStrings(videos),
    voiceUri: getKolamFileUrl(getNullableString(record, 'voice')),
    variants,
    taxonomy: normalizeRef(record.taxonomy),
    taxonomyPath: normalizeTaxonomyPath(record.taxonomy),
    categories,
    tags: normalizeRefList(record.tags),
    iucnStatus: normalizeRef(record.iucnStatus ?? record.iucn),
    iucnLink: getString(record, 'iucnLink'),
    unitLabel:
      getString(unit, 'symbol') ||
      getString(unit, 'shortName') ||
      getString(unit, 'name'),
    priceToSell:
      getNumber(record, 'priceToSell') ??
      getNumber(record, 'sellingPrice') ??
      getNumber(record, 'price') ??
      0,
    stock: normalizeStock(record, variants),
    variantCount: variants.length,
    hasVariants: variants.length > 0,
    sellable: getBoolean(record, 'sellable') ?? false,
    status: normalizeSpeciesStatus(record.status),
    isPinned: getBoolean(record, 'isPinned') ?? getBoolean(record, 'pinned') ?? false,
    marketplaceSync: normalizeMarketplaceSync(record),
    links,
    locales: normalizeLocaleContent(record, translations),
    translations,
    description: getString(record, 'description'),
    shortDescription: getString(record, 'shortDescription'),
    morfologis: getString(record, 'morfologis'),
    habitat: getString(record, 'habitat'),
    distribution: getString(record, 'distribution'),
    createdAt: getString(record, 'createdAt') || undefined,
    updatedAt: getString(record, 'updatedAt') || undefined,
    raw: payload,
  };
}

export function normalizeKolamSpeciesList(payload: unknown) {
  const root = unwrapData(payload);
  const rootRecord = asRecord(root);
  const list: unknown[] = Array.isArray(root)
    ? root
    : Array.isArray(rootRecord.data)
    ? rootRecord.data
    : Array.isArray(rootRecord.items)
    ? rootRecord.items
    : Array.isArray(rootRecord.species)
    ? rootRecord.species
    : [];

  return list.map(normalizeKolamSpecies);
}

export function normalizeKolamSpeciesDetail(payload: unknown) {
  return normalizeKolamSpecies(payload);
}

export function createKolamSpeciesListRevision(items: KolamSpecies[]) {
  return createStableHash(
    items.map(item => ({
      id: item.id,
      scientificName: item.scientificName,
      commonName: item.commonName,
      sku: item.sku,
      stock: item.stock,
      priceToSell: item.priceToSell,
      thumbnailUri: item.thumbnailUri,
      videoUris: item.videoUris,
      voiceUri: item.voiceUri,
      variants: item.variants.map(variant => ({
        id: variant.id,
        photoUris: variant.photoUris,
        videoUris: variant.videoUris,
        vendorPrices: variant.vendorPrices.map(price => ({
          vendorId: price.vendorId,
          price: price.price,
          shippingCost: price.shippingCost,
          totalCost: price.totalCost,
        })),
      })),
      tags: item.tags.map(tag => tag.id),
      links: item.links,
      iucnLink: item.iucnLink,
      status: item.status,
      updatedAt: item.updatedAt,
    })),
  );
}

export function createKolamSpeciesDetailRevision(item: KolamSpecies) {
  return createStableHash({
    id: item.id,
    scientificName: item.scientificName,
    commonName: item.commonName,
    localName: item.localName,
    sku: item.sku,
    stock: item.stock,
    priceToSell: item.priceToSell,
    photoUris: item.photoUris,
    videoUris: item.videoUris,
    voiceUri: item.voiceUri,
    variants: item.variants,
    taxonomy: item.taxonomy?.id,
    categories: item.categories.map(category => category.id),
    tags: item.tags.map(tag => tag.id),
    links: item.links,
    iucnLink: item.iucnLink,
    locales: item.locales,
    translations: item.translations,
    description: item.description,
    shortDescription: item.shortDescription,
    morfologis: item.morfologis,
    habitat: item.habitat,
    distribution: item.distribution,
    status: item.status,
    updatedAt: item.updatedAt,
  });
}

export function slugifySpeciesName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getSpeciesStatusLabel(status: KolamSpeciesStatus) {
  switch (status) {
    case 'inactive':
      return 'Nonaktif';
    case 'draft':
      return 'Draft';
    default:
      return 'Aktif';
  }
}

function normalizeSpeciesStatus(value: unknown): KolamSpeciesStatus {
  const status = String(value ?? '').trim().toLowerCase();

  if (status === 'inactive' || status === 'nonactive') {
    return 'inactive';
  }

  if (status === 'draft') {
    return 'draft';
  }

  return 'active';
}

function normalizeRef(value: unknown): KolamSpeciesRef | null {
  if (typeof value === 'string' && value.trim()) {
    return {
      id: value.trim(),
      name: value.trim(),
    };
  }

  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  const name =
    getString(record, 'name') ||
    getString(record, 'scientificName') ||
    getString(record, 'commonName') ||
    getString(record, 'label') ||
    (typeof value === 'string' ? value : '');

  if (!id && !name) {
    return null;
  }

  return {
    id: id || slugifySpeciesName(name),
    name: name || id,
  };
}

function normalizeRefList(value: unknown): KolamSpeciesRef[] {
  if (!Array.isArray(value)) {
    const single = normalizeRef(value);
    return single ? [single] : [];
  }

  return value.map(normalizeRef).filter(Boolean) as KolamSpeciesRef[];
}

function normalizeSpeciesLinks(value: unknown): KolamSpeciesExternalLink[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => {
      const record = asRecord(item);
      const name = getString(record, 'name') as KolamSpeciesLinkName;
      const linkValue = getString(record, 'value');
      if (!isSpeciesLinkName(name) || !linkValue) {
        return null;
      }

      return {
        name,
        label: getSpeciesLinkLabel(name),
        value: linkValue,
      };
    })
    .filter(Boolean) as KolamSpeciesExternalLink[];
}

function isSpeciesLinkName(value: string): value is KolamSpeciesLinkName {
  return (
    value === 'shopee' ||
    value === 'tokopedia' ||
    value === 'website' ||
    value === 'link_pos' ||
    value === 'other_link'
  );
}

function getSpeciesLinkLabel(name: KolamSpeciesLinkName) {
  switch (name) {
    case 'shopee':
      return 'Shopee';
    case 'tokopedia':
      return 'Tokopedia';
    case 'link_pos':
      return 'Link POS';
    case 'other_link':
      return 'Link Lainnya';
    default:
      return 'Website';
  }
}

function getSpeciesLinkValue(
  links: KolamSpeciesExternalLink[],
  name: KolamSpeciesLinkName,
) {
  return links.find(link => link.name === name)?.value ?? '';
}

function normalizeMediaList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item =>
      typeof item === 'string'
        ? getKolamFileUrl(item)
        : getKolamFileUrl(getNullableString(asRecord(item), 'url') ?? getNullableString(asRecord(item), 'path')),
    )
    .filter(Boolean) as string[];
}

function normalizeVariantMediaList(value: unknown): KolamSpeciesVariantMedia[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const record = asRecord(item);
    const id = getString(record, '_id') || getString(record, 'id') || String(index);
    const tier1 = getString(record, 'tier1Value');
    const tier2 = getString(record, 'tier2Value');
    const weight = asRecord(record.weight);
    const dimension = asRecord(record.dimension);
    const label = [tier1, tier2].filter(Boolean).join(' / ') || getString(record, 'label') || `Varian ${index + 1}`;

    return {
      id,
      label,
      tier1Value: tier1,
      tier2Value: tier2,
      sku: getString(record, 'sku'),
      productCode: getString(record, 'productCode'),
      stock: getNumber(record, 'stock') ?? 0,
      price: getNumber(record, 'price') ?? 0,
      priceToSell:
        getNumber(record, 'price_to_sell') ??
        getNumber(record, 'priceToSell') ??
        getNumber(record, 'price') ??
        0,
      marketPrice: getNumber(record, 'marketPrice') ?? 0,
      onlinePrice: getNumber(record, 'onlinePrice') ?? 0,
      minimumPriceToSales: getNumber(record, 'minimum_price_to_sales') ?? 0,
      minimumOrderQty: getNumber(record, 'minimumOrderQty') ?? 1,
      weightValue: getNumber(weight, 'value') ?? 0,
      weightUnitId: getObjectIdString(weight.unit),
      dimensionLength: getNumber(dimension, 'length') ?? 0,
      dimensionWidth: getNumber(dimension, 'width') ?? 0,
      dimensionHeight: getNumber(dimension, 'height') ?? 0,
      dimensionUnitId: getObjectIdString(dimension.unit),
      photoUris: uniqueStrings(normalizeMediaList(record.photos)),
      videoUris: uniqueStrings(normalizeMediaList(record.videos)),
      vendorPrices: normalizeKolamSpeciesVendorPrices(record.vendorPrices),
      raw: item,
    };
  });
}
function normalizeTaxonomyPath(value: unknown) {
  const record = asRecord(value);
  const ancestry = Array.isArray(record.ancestors)
    ? record.ancestors.map(normalizeRef).filter(Boolean)
    : [];
  const current = normalizeRef(record);
  const names = [...(ancestry as KolamSpeciesRef[]), current]
    .filter(Boolean)
    .map(item => item?.name)
    .filter(Boolean);

  return names.length ? names.join(' / ') : '';
}

function normalizeStock(
  record: Record<string, unknown>,
  variants: unknown[],
): number {
  const variantStock = variants.reduce<number>((total, variant) => {
    const variantRecord = asRecord(variant);
    return total + (getNumber(variantRecord, 'stock') ?? 0);
  }, 0);

  if (variants.length) {
    return variantStock;
  }

  return (
    getNumber(record, 'stock') ??
    getNumber(record, 'currentStock') ??
    getNumber(record, 'totalStock') ??
    0
  );
}

function normalizeMarketplaceSync(record: Record<string, unknown>) {
  const stockSync = asRecord(record.marketplaceSync ?? record.marketplace);
  const priceSync = asRecord(record.marketplacePriceSync);
  const platforms = normalizeMarketplaceSyncPlatforms(stockSync);
  const pricePlatforms = normalizeMarketplaceSyncPlatforms(priceSync);
  const lastSyncedAt =
    getLatestMarketplaceSyncDate([...platforms, ...pricePlatforms]) ||
    getString(stockSync, 'lastSyncedAt') ||
    getString(stockSync, 'updatedAt') ||
    getString(record, 'lastMarketplaceSyncAt');
  const status =
    getMarketplaceAggregateLabel(platforms) ||
    getString(stockSync, 'status') ||
    getString(record, 'syncStatus') ||
    (lastSyncedAt ? 'Sinkron' : 'Belum sinkron');

  return {
    label: status || '-',
    lastSyncedAt: lastSyncedAt || undefined,
    platforms,
    pricePlatforms,
  };
}

function normalizeMarketplaceSyncPlatforms(
  sync: Record<string, unknown>,
): KolamSpeciesMarketplaceSyncPlatform[] {
  return (['tokopedia', 'shopee'] as const)
    .map(platform => {
      const source = asRecord(sync[platform]);
      const status = normalizeMarketplaceSyncStatus(
        getString(source, 'lastStatus') || getString(source, 'status'),
      );
      const lastSyncedAt = getString(source, 'lastSyncedAt');
      const lastError = getString(source, 'lastError');
      const lastTaskId = getString(source, 'lastTaskId');
      const variantResults = Array.isArray(source.variantResults)
        ? source.variantResults
        : [];

      if (
        status === 'unknown' &&
        !lastSyncedAt &&
        !lastError &&
        !lastTaskId &&
        !variantResults.length
      ) {
        return null;
      }

      return {
        platform,
        label: platform === 'tokopedia' ? 'Tokopedia' : 'Shopee',
        status,
        statusLabel: getMarketplaceSyncStatusLabel(status),
        lastSyncedAt: lastSyncedAt || undefined,
        lastError: lastError || undefined,
        lastTaskId: lastTaskId || undefined,
        variantCount: variantResults.length,
      };
    })
    .filter(Boolean) as KolamSpeciesMarketplaceSyncPlatform[];
}

function normalizeMarketplaceSyncStatus(
  value: string,
): KolamSpeciesMarketplaceSyncStatus {
  switch (value) {
    case 'pending':
    case 'synced':
    case 'skipped':
    case 'notFound':
    case 'failed':
    case 'partial':
      return value;
    default:
      return 'unknown';
  }
}

function getMarketplaceSyncStatusLabel(
  status: KolamSpeciesMarketplaceSyncStatus,
) {
  switch (status) {
    case 'pending':
      return 'Menunggu';
    case 'synced':
      return 'Sinkron';
    case 'skipped':
      return 'Dilewati';
    case 'notFound':
      return 'Tidak ditemukan';
    case 'failed':
      return 'Gagal';
    case 'partial':
      return 'Sebagian';
    default:
      return 'Belum ada data';
  }
}

function getMarketplaceAggregateLabel(
  platforms: KolamSpeciesMarketplaceSyncPlatform[],
) {
  if (!platforms.length) {
    return '';
  }

  if (platforms.some(platform => platform.status === 'failed')) {
    return 'Ada sync gagal';
  }

  if (platforms.some(platform => platform.status === 'partial')) {
    return 'Sinkron sebagian';
  }

  if (platforms.every(platform => platform.status === 'synced')) {
    return 'Sinkron';
  }

  return platforms.map(platform => platform.statusLabel).join(', ');
}

function getLatestMarketplaceSyncDate(
  platforms: KolamSpeciesMarketplaceSyncPlatform[],
) {
  return platforms
    .map(platform => platform.lastSyncedAt)
    .filter(Boolean)
    .sort()
    .at(-1);
}

function normalizeLocaleContent(
  record: Record<string, unknown>,
  translations: KolamCatalogTranslationsMap<KolamSpeciesLocaleFields>,
) {
  const entries = [
    [
      'id',
      {
        commonName: getString(record, 'commonName'),
        localName: getString(record, 'localName'),
        shortDescription: getString(record, 'shortDescription'),
        description: getString(record, 'description'),
        morfologis: getString(record, 'morfologis'),
        habitat: getString(record, 'habitat'),
        distribution: getString(record, 'distribution'),
      },
    ] as const,
    ...Object.entries(translations),
  ];

  return entries.map(([code, value]) => {
    const item = asRecord(value);
    return {
      code,
      commonName: getString(item, 'commonName'),
      localName: getString(item, 'localName'),
      shortDescription: getString(item, 'shortDescription'),
      description: getString(item, 'description'),
      morfologis: getString(item, 'morfologis'),
      habitat: getString(item, 'habitat'),
      distribution: getString(item, 'distribution'),
    };
  });
}

function unwrapData(payload: unknown): unknown {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: unknown }).data;
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

function getNullableString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function getNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function getBoolean(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'boolean' ? value : undefined;
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values));
}

function createStableHash(value: unknown) {
  return JSON.stringify(value);
}

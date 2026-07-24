import {
  KOLAM_CATALOG_DEFAULT_LOCALE,
  KOLAM_CATALOG_LOCALES,
  normalizeKolamTranslationsForSave,
  normalizeKolamTranslationsFromRecord,
  type KolamCatalogLocale,
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

export interface KolamSpeciesExternalLinkFormRow {
  name: KolamSpeciesLinkName | '';
  value: string;
}

export interface KolamSpeciesShippingMethod {
  id: string;
  displayName: string;
  logoUri: string | null;
  category: string;
  pricingType: string;
  pricingPrice: number;
  estimatedMinDays: number;
  estimatedMaxDays: number;
  restrictedRegions: string[];
  maximumWeight: number;
  maximumDimensionLength: number;
  maximumDimensionWidth: number;
  maximumDimensionHeight: number;
  minimumOrderAmount: number;
}
export interface KolamSpeciesPackingLink {
  packingId: string;
  packingName: string;
  packingCategory: string;
  variantId: string | null;
  quantity: number;
  unitHpp: number;
}

export interface KolamSpeciesPackingLinkFormRow {
  id: string;
  packingId: string;
  variantId: string;
  quantity: string;
}

export interface KolamSpeciesPackingLinkPayloadRow {
  packing: string;
  variant: string | null;
  quantity: number;
}

export interface KolamSpeciesCustomFieldValue {
  fieldId: string;
  fieldLabel: string;
  valueLabel: string;
  unitLabel: string;
  raw: unknown;
}

export interface KolamSpeciesWeight {
  value: number;
  unitId: string;
  unitLabel: string;
}

export interface KolamSpeciesDimension {
  length: number;
  width: number;
  height: number;
  unitId: string;
  unitLabel: string;
}

export interface KolamSpeciesSeo {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  lastAuditedAt: string;
  lastSeoScore: number | null;
}

export interface KolamSpeciesAsset {
  id: string;
  title: string;
  path: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface KolamSpeciesAttachedItem {
  id: string;
  itemType: string;
  type: string;
  typeLabel: string;
  targetId: string;
  targetName: string;
  targetSku: string;
  note: string;
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

export interface KolamSpeciesGrocerPricingTier {
  minQty: number;
  price: number;
  onlinePrice: number;
}

export interface KolamSpeciesGrocerPricingTierFormRow {
  id: string;
  minQty: string;
  price: string;
  onlinePrice: string;
}

export interface KolamSpeciesComponentOverride {
  productId: string;
  productName: string;
  productSku: string;
  productType: string;
  productDescription: string;
  productPhotoUri: string | null;
  unitLabel: string;
  quantity: number;
  totalWeightValue: number;
  totalWeightUnitLabel: string;
  percentage: number;
  stock: number | null;
  lowStockThreshold: number;
  unitPrice: number | null;
}

export interface KolamSpeciesComponentOverrideFormRow {
  id: string;
  productId: string;
  quantity: string;
}

export type KolamSpeciesCommissionType = 'percentage' | 'fixed';

export interface KolamSpeciesMemberPoints {
  enabled: boolean;
  points: number;
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
  lowStockThreshold: number;
  vendorPrices: KolamSpeciesVendorPrice[];
  grocerPricingTiers: KolamSpeciesGrocerPricingTier[];
  commissionEnabled: boolean;
  commissionType: KolamSpeciesCommissionType;
  commissionValue: number;
  memberPoints: KolamSpeciesMemberPoints;
  componentOverrides: KolamSpeciesComponentOverride[];
  weightValue: number;
  weightUnitId: string;
  dimensionLength: number;
  dimensionWidth: number;
  dimensionHeight: number;
  dimensionUnitId: string;
  photoUris: string[];
  videoUris: string[];
  customFieldValues: KolamSpeciesCustomFieldValue[];
  links: KolamSpeciesExternalLink[];
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
  lowStockThreshold: string;
  grocerPricingTiers: KolamSpeciesGrocerPricingTierFormRow[];
  commissionEnabled: boolean;
  commissionType: KolamSpeciesCommissionType;
  commissionValue: string;
  memberPointsEnabled: boolean;
  memberPoints: string;
  componentOverrides: KolamSpeciesComponentOverrideFormRow[];
  weightValue: string;
  weightUnitId: string;
  dimensionLength: string;
  dimensionWidth: string;
  dimensionHeight: string;
  dimensionUnitId: string;
  vendorPrices: KolamSpeciesVendorPriceFormRow[];
  externalLinks: KolamSpeciesExternalLinkFormRow[];
  customFieldValues: KolamSpeciesCustomFieldValue[];
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
  weight: KolamSpeciesWeight | null;
  dimension: KolamSpeciesDimension | null;
  price: number;
  priceToSell: number;
  marketPrice: number;
  onlinePrice: number;
  minimumPriceToSales: number;
  minimumOrderQty: number;
  lowStockThreshold: number;
  vendorPrices: KolamSpeciesVendorPrice[];
  grocerPricingTiers: KolamSpeciesGrocerPricingTier[];
  commissionEnabled: boolean;
  commissionType: KolamSpeciesCommissionType;
  commissionValue: number;
  memberPoints: KolamSpeciesMemberPoints;
  stock: number;
  variantCount: number;
  hasVariants: boolean;
  sellable: boolean;
  status: KolamSpeciesStatus;
  isPinned: boolean;
  marketplaceSync: KolamSpeciesMarketplaceSync;
  links: KolamSpeciesExternalLink[];
  packings: KolamSpeciesPackingLink[];
  availableShippingMethods: KolamSpeciesShippingMethod[];
  customFieldValues: KolamSpeciesCustomFieldValue[];
  rootComponents: KolamSpeciesComponentOverride[];
  attachedItems: KolamSpeciesAttachedItem[];
  assets: KolamSpeciesAsset[];
  seo: KolamSpeciesSeo;
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
  displayName: string;
  sku: string;
  taxonomyId: string;
  categoryIds: string[];
  tagIds: string[];
  iucnStatusId: string;
  iucnLink: string;
  unitId: string;
  priceToSell: string;
  marketPrice: string;
  onlinePrice: string;
  minimumPriceToSales: string;
  minimumOrderQty: string;
  lowStockThreshold: string;
  vendorPrices: KolamSpeciesVendorPriceFormRow[];
  availableShippingMethodIds: string[];
  weightValue: string;
  weightUnitId: string;
  dimensionLength: string;
  dimensionWidth: string;
  dimensionHeight: string;
  dimensionUnitId: string;
  componentRows: KolamSpeciesComponentOverrideFormRow[];
  customFieldValues: KolamSpeciesCustomFieldValue[];
  seoMetaTitle: string;
  seoMetaDescription: string;
  seoKeywords: string;
  grocerPricingTiers: KolamSpeciesGrocerPricingTierFormRow[];
  commissionEnabled: boolean;
  commissionType: KolamSpeciesCommissionType;
  commissionValue: string;
  memberPointsEnabled: boolean;
  memberPoints: string;
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
  externalLinks: KolamSpeciesExternalLinkFormRow[];
  packingLinks: KolamSpeciesPackingLinkFormRow[];
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
    return `${KOLAM_SPECIES_BREADCRUMB_ROOT}/${
      species.displayName || species.scientificName
    }`;
  }

  if (mode === 'edit' && species) {
    return (
      KOLAM_SPECIES_BREADCRUMB_ROOT +
      '/' +
      (species.displayName || species.scientificName) +
      '/edit'
    );
  }

  return KOLAM_SPECIES_BREADCRUMB_ROOT;
}

export function createEmptyKolamSpeciesFormState(): KolamSpeciesFormState {
  return {
    scientificName: '',
    commonName: '',
    localName: '',
    displayName: '',
    sku: '',
    taxonomyId: '',
    categoryIds: [],
    tagIds: [],
    iucnStatusId: '',
    iucnLink: '',
    unitId: '',
    priceToSell: '0',
    marketPrice: '0',
    onlinePrice: '0',
    minimumPriceToSales: '0',
    minimumOrderQty: '1',
    lowStockThreshold: '10',
    vendorPrices: [],
    availableShippingMethodIds: [],
    weightValue: '',
    weightUnitId: '',
    dimensionLength: '',
    dimensionWidth: '',
    dimensionHeight: '',
    dimensionUnitId: '',
    componentRows: [],
    customFieldValues: [],
    seoMetaTitle: '',
    seoMetaDescription: '',
    seoKeywords: '',
    grocerPricingTiers: [],
    commissionEnabled: false,
    commissionType: 'percentage',
    commissionValue: '0',
    memberPointsEnabled: false,
    memberPoints: '0',
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
    externalLinks: [],
    packingLinks: [],
  };
}

export function createKolamSpeciesFormState(
  species: KolamSpecies,
): KolamSpeciesFormState {
  const raw = asRecord(unwrapData(species.raw));
  const locales = Array.isArray(species.locales) ? species.locales : [];
  const categories = Array.isArray(species.categories)
    ? species.categories
    : [];
  const tags = Array.isArray(species.tags) ? species.tags : [];
  const grocerPricingTiers = Array.isArray(species.grocerPricingTiers)
    ? species.grocerPricingTiers
    : [];
  const vendorPrices = Array.isArray(species.vendorPrices)
    ? species.vendorPrices
    : [];
  const availableShippingMethods = Array.isArray(species.availableShippingMethods)
    ? species.availableShippingMethods
    : [];
  const rootComponents = Array.isArray(species.rootComponents)
    ? species.rootComponents
    : [];
  const variants = Array.isArray(species.variants) ? species.variants : [];
  const links = Array.isArray(species.links) ? species.links : [];
  const packings = Array.isArray(species.packings) ? species.packings : [];
  const idLocale = locales.find(locale => locale.code === 'id');
  const memberPoints = species.memberPoints ?? { enabled: false, points: 0 };
  const variantConfig = asRecord(raw.variantConfig);

  return {
    id: species.id,
    scientificName: species.scientificName,
    commonName: species.commonName,
    localName: species.localName,
    displayName: species.displayName,
    sku: species.sku,
    taxonomyId: species.taxonomy?.id ?? '',
    categoryIds: categories.map(category => category.id),
    tagIds: tags.map(tag => tag.id),
    iucnStatusId: species.iucnStatus?.id ?? '',
    iucnLink: species.iucnLink,
    unitId:
      getString(asRecord(raw.units), '_id') ||
      getString(asRecord(raw.units), 'id') ||
      getString(asRecord(raw.unit), '_id') ||
      getString(asRecord(raw.unit), 'id'),
    priceToSell: String(species.priceToSell),
    marketPrice: String(species.marketPrice),
    onlinePrice: String(species.onlinePrice),
    minimumPriceToSales: String(species.minimumPriceToSales),
    minimumOrderQty: String(species.minimumOrderQty || 1),
    lowStockThreshold: String(species.lowStockThreshold ?? 10),
    vendorPrices: vendorPrices.map(createKolamSpeciesVendorPriceFormRow),
    availableShippingMethodIds: availableShippingMethods.map(method => method.id),
    weightValue: species.weight ? String(species.weight.value) : '',
    weightUnitId: species.weight?.unitId ?? '',
    dimensionLength: species.dimension ? String(species.dimension.length) : '',
    dimensionWidth: species.dimension ? String(species.dimension.width) : '',
    dimensionHeight: species.dimension ? String(species.dimension.height) : '',
    dimensionUnitId: species.dimension?.unitId ?? '',
    componentRows: rootComponents.map(createKolamSpeciesComponentOverrideFormRow),
    customFieldValues: species.customFieldValues,
    seoMetaTitle: species.seo.metaTitle,
    seoMetaDescription: species.seo.metaDescription,
    seoKeywords: species.seo.keywords.join(', '),
    grocerPricingTiers: grocerPricingTiers.map(
      createKolamSpeciesGrocerPricingTierFormRow,
    ),
    commissionEnabled: species.commissionEnabled,
    commissionType: species.commissionType,
    commissionValue: String(species.commissionValue),
    memberPointsEnabled: memberPoints.enabled,
    memberPoints: String(memberPoints.points),
    stock: String(species.stock),
    sellable: species.sellable,
    status: species.status,
    description:
      idLocale?.description ||
      species.description ||
      getString(raw, 'description'),
    shortDescription:
      idLocale?.shortDescription ||
      species.shortDescription ||
      getString(raw, 'shortDescription'),
    morfologis:
      idLocale?.morfologis ||
      species.morfologis ||
      getString(raw, 'morfologis'),
    habitat: idLocale?.habitat || species.habitat || getString(raw, 'habitat'),
    distribution:
      idLocale?.distribution ||
      species.distribution ||
      getString(raw, 'distribution'),
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
    variants: variants.map(createKolamSpeciesVariantFormRow),
    variantsTouched: false,
    externalLinks: links.map(link => ({
      name: link.name,
      value: link.value,
    })),
    packingLinks: packings.map(createKolamSpeciesPackingLinkFormRow),
  };
}

export function createKolamSpeciesSavePayload(form: KolamSpeciesFormState) {
  const priceToSell = Number(form.priceToSell);
  const marketPrice = Number(form.marketPrice);
  const onlinePrice = Number(form.onlinePrice);
  const minimumPriceToSales = Number(form.minimumPriceToSales);
  const minimumOrderQty = Number(form.minimumOrderQty);
  const lowStockThreshold = Number(form.lowStockThreshold);
  const stock = Number(form.stock);

  return {
    scientificName: form.scientificName.trim(),
    commonName: form.commonName.trim(),
    localName: form.localName.trim(),
    displayName: form.displayName.trim(),
    sku: form.sku.trim(),
    taxonomy: form.taxonomyId.trim(),
    category: form.categoryIds,
    tags: form.tagIds,
    iucnStatus: form.iucnStatusId.trim() || undefined,
    iucnLink: form.iucnLink.trim() || null,
    units: form.unitId.trim() || undefined,
    link: createKolamSpeciesExternalLinkPayload(form.externalLinks),
    price_to_sell: Number.isFinite(priceToSell) ? Math.max(0, priceToSell) : 0,
    marketPrice: Number.isFinite(marketPrice) ? Math.max(0, marketPrice) : 0,
    onlinePrice: Number.isFinite(onlinePrice) ? Math.max(0, onlinePrice) : 0,
    minimum_price_to_sales: Number.isFinite(minimumPriceToSales)
      ? Math.max(0, minimumPriceToSales)
      : 0,
    minimumOrderQty: Number.isFinite(minimumOrderQty)
      ? Math.max(1, minimumOrderQty)
      : 1,
    lowStockThreshold: Number.isFinite(lowStockThreshold)
      ? Math.max(0, lowStockThreshold)
      : 10,
    availableShippingMethods: form.availableShippingMethodIds,
    vendorPrices: form.variants.length
      ? []
      : createKolamSpeciesVendorPricePayload(form.vendorPrices),
    components: form.variants.length
      ? []
      : createKolamSpeciesComponentOverridePayload(form.componentRows),
    customFieldValues: createKolamSpeciesCustomFieldValuePayload(
      form.customFieldValues,
    ),
    ...createKolamSpeciesRootWeightPayload(form),
    ...createKolamSpeciesRootDimensionPayload(form),
    grocerPricingTiers: form.variants.length
      ? []
      : createKolamSpeciesGrocerPricingTierPayload(form.grocerPricingTiers),
    commissionEnabled: form.commissionEnabled,
    commissionType: normalizeKolamSpeciesCommissionType(form.commissionType),
    commissionValue: toNonNegativeNumber(form.commissionValue),
    memberPoints: form.variants.length
      ? { enabled: false, points: 0 }
      : {
          enabled: form.memberPointsEnabled,
          points: form.memberPointsEnabled
            ? toNonNegativeNumber(form.memberPoints)
            : 0,
        },
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

export function createKolamSpeciesPackingLinkPayload(
  form: KolamSpeciesFormState,
  savedSpecies?: KolamSpecies,
): KolamSpeciesPackingLinkPayloadRow[] {
  return form.packingLinks
    .map(row => {
      const packing = row.packingId.trim();
      if (!packing) {
        return null;
      }

      return {
        packing,
        variant: resolvePackingLinkVariantId(row.variantId, form, savedSpecies),
        quantity: Math.max(0, toNonNegativeNumber(row.quantity)),
      };
    })
    .filter(Boolean) as KolamSpeciesPackingLinkPayloadRow[];
}

function resolvePackingLinkVariantId(
  variantId: string,
  form: KolamSpeciesFormState,
  savedSpecies?: KolamSpecies,
) {
  const cleanVariantId = variantId.trim();
  if (!cleanVariantId) {
    return null;
  }

  if (isMongoObjectId(cleanVariantId)) {
    return cleanVariantId;
  }

  const formIndex = form.variants.findIndex(
    variant => variant.id === cleanVariantId,
  );
  return formIndex >= 0 ? savedSpecies?.variants[formIndex]?.id ?? null : null;
}

function createKolamSpeciesExternalLinkPayload(
  rows: KolamSpeciesExternalLinkFormRow[],
) {
  return rows
    .map(item => ({ name: item.name, value: item.value.trim() }))
    .filter(item => item.name && item.value);
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
    lowStockThreshold: '10',
    grocerPricingTiers: [],
    commissionEnabled: false,
    commissionType: 'percentage',
    commissionValue: '0',
    memberPointsEnabled: false,
    memberPoints: '0',
    componentOverrides: [],
    weightValue: '',
    weightUnitId: '',
    dimensionLength: '',
    dimensionWidth: '',
    dimensionHeight: '',
    dimensionUnitId: '',
    vendorPrices: [],
    externalLinks: [],
    customFieldValues: [],
    raw: null,
  };
}

function createKolamSpeciesVariantFormRow(
  variant: KolamSpeciesVariantMedia,
): KolamSpeciesVariantFormRow {
  const grocerPricingTiers = Array.isArray(variant.grocerPricingTiers)
    ? variant.grocerPricingTiers
    : [];
  const componentOverrides = Array.isArray(variant.componentOverrides)
    ? variant.componentOverrides
    : [];
  const vendorPrices = Array.isArray(variant.vendorPrices)
    ? variant.vendorPrices
    : [];
  const memberPoints = variant.memberPoints ?? { enabled: false, points: 0 };

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
    lowStockThreshold: String(variant.lowStockThreshold ?? 10),
    grocerPricingTiers: grocerPricingTiers.map(
      createKolamSpeciesGrocerPricingTierFormRow,
    ),
    commissionEnabled: variant.commissionEnabled,
    commissionType: variant.commissionType,
    commissionValue: String(variant.commissionValue),
    memberPointsEnabled: memberPoints.enabled,
    memberPoints: String(memberPoints.points),
    componentOverrides: componentOverrides.map(
      createKolamSpeciesComponentOverrideFormRow,
    ),
    weightValue: variant.weightValue ? String(variant.weightValue) : '',
    weightUnitId: variant.weightUnitId,
    dimensionLength: variant.dimensionLength
      ? String(variant.dimensionLength)
      : '',
    dimensionWidth: variant.dimensionWidth
      ? String(variant.dimensionWidth)
      : '',
    dimensionHeight: variant.dimensionHeight
      ? String(variant.dimensionHeight)
      : '',
    dimensionUnitId: variant.dimensionUnitId,
    vendorPrices: vendorPrices.map(createKolamSpeciesVendorPriceFormRow),
    externalLinks: variant.links.map(link => ({
      name: link.name,
      value: link.value,
    })),
    customFieldValues: variant.customFieldValues,
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
    lowStockThreshold: toNonNegativeNumber(row.lowStockThreshold),
    grocerPricingTiers: createKolamSpeciesGrocerPricingTierPayload(
      row.grocerPricingTiers,
    ),
    commissionEnabled: row.commissionEnabled,
    commissionType: normalizeKolamSpeciesCommissionType(row.commissionType),
    commissionValue: toNonNegativeNumber(row.commissionValue),
    memberPoints: {
      enabled: row.memberPointsEnabled,
      points: row.memberPointsEnabled
        ? toNonNegativeNumber(row.memberPoints)
        : 0,
    },
    componentOverrides: createKolamSpeciesComponentOverridePayload(
      row.componentOverrides,
    ),
    link: createKolamSpeciesExternalLinkPayload(row.externalLinks),
    customFieldValues: createKolamSpeciesCustomFieldValuePayload(
      row.customFieldValues,
    ),
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

  return existingUnit &&
    existingLength !== undefined &&
    existingWidth !== undefined &&
    existingHeight !== undefined
    ? {
        length: Math.max(0, existingLength),
        width: Math.max(0, existingWidth),
        height: Math.max(0, existingHeight),
        unit: existingUnit,
      }
    : null;
}

function createKolamSpeciesPackingLinkFormRow(
  item: KolamSpeciesPackingLink,
  index: number,
): KolamSpeciesPackingLinkFormRow {
  return {
    id: `packing-${index}-${item.packingId}-${item.variantId ?? 'root'}`,
    packingId: item.packingId,
    variantId: item.variantId ?? '',
    quantity: String(item.quantity),
  };
}

function createKolamSpeciesComponentOverridePayload(
  rows: KolamSpeciesComponentOverrideFormRow[],
) {
  return rows
    .map(row => {
      const product = row.productId.trim();
      const quantity = toNonNegativeNumber(row.quantity);
      if (!product || quantity <= 0) {
        return null;
      }

      return { product, quantity };
    })
    .filter(Boolean) as Array<{ product: string; quantity: number }>;
}

function createKolamSpeciesCustomFieldValuePayload(
  rows: KolamSpeciesCustomFieldValue[],
) {
  return rows
    .map(row => {
      const record = asRecord(row.raw);
      const field = getObjectIdString(record.field) || row.fieldId.trim();
      if (!field) {
        return null;
      }

      const payload: Record<string, unknown> = { field };
      const unit = getObjectIdString(record.unit);
      if (unit) {
        payload.unit = unit;
      }
      if (record.value !== undefined) {
        payload.value = record.value;
      }
      if (record.minValue !== undefined) {
        payload.minValue = record.minValue;
      }
      if (record.maxValue !== undefined) {
        payload.maxValue = record.maxValue;
      }
      if (record.fieldKey !== undefined) {
        payload.fieldKey = record.fieldKey;
      }

      return payload;
    })
    .filter(Boolean) as Array<Record<string, unknown>>;
}

function createKolamSpeciesRootWeightPayload(form: KolamSpeciesFormState) {
  const value = toOptionalNonNegativeNumber(form.weightValue);
  const unit = form.weightUnitId.trim();
  return !form.variants.length && value !== null && unit
    ? { weight: { value, unit } }
    : {};
}

function createKolamSpeciesRootDimensionPayload(form: KolamSpeciesFormState) {
  const length = toOptionalNonNegativeNumber(form.dimensionLength);
  const width = toOptionalNonNegativeNumber(form.dimensionWidth);
  const height = toOptionalNonNegativeNumber(form.dimensionHeight);
  const unit = form.dimensionUnitId.trim();
  return !form.variants.length &&
    length !== null &&
    width !== null &&
    height !== null &&
    unit
    ? { dimension: { length, width, height, unit } }
    : {};
}

function createKolamSpeciesComponentOverrideFormRow(
  item: KolamSpeciesComponentOverride,
  index: number,
): KolamSpeciesComponentOverrideFormRow {
  return {
    id: `component-${index}-${item.productId}`,
    productId: item.productId,
    quantity: String(item.quantity),
  };
}

function createKolamSpeciesGrocerPricingTierPayload(
  rows: KolamSpeciesGrocerPricingTierFormRow[],
) {
  return rows
    .map(row => {
      const minQty = Math.max(1, toNonNegativeNumber(row.minQty) || 1);
      const price = toNonNegativeNumber(row.price);
      const onlinePrice = toNonNegativeNumber(row.onlinePrice);
      if (price <= 0 && onlinePrice <= 0) {
        return null;
      }

      return {
        minQty,
        price,
        onlinePrice,
      };
    })
    .filter(Boolean) as KolamSpeciesGrocerPricingTier[];
}

function createKolamSpeciesGrocerPricingTierFormRow(
  item: KolamSpeciesGrocerPricingTier,
  index: number,
): KolamSpeciesGrocerPricingTierFormRow {
  return {
    id: `tier-${index}-${item.minQty}`,
    minQty: String(item.minQty),
    price: String(item.price),
    onlinePrice: String(item.onlinePrice),
  };
}

function normalizeKolamSpeciesGrocerPricingTiers(
  value: unknown,
): KolamSpeciesGrocerPricingTier[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => {
      const record = asRecord(item);
      const minQty = getNumber(record, 'minQty');
      const price = getNumber(record, 'price');
      if (
        minQty === undefined ||
        minQty < 1 ||
        price === undefined ||
        price < 0
      ) {
        return null;
      }

      return {
        minQty,
        price,
        onlinePrice: Math.max(0, getNumber(record, 'onlinePrice') ?? 0),
      };
    })
    .filter(Boolean) as KolamSpeciesGrocerPricingTier[];
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

function normalizeKolamSpeciesVendorPrices(
  value: unknown,
): KolamSpeciesVendorPrice[] {
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
        id:
          getString(record, '_id') ||
          getString(record, 'id') ||
          vendorId ||
          String(index),
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
        priceHistory: normalizeKolamSpeciesVendorPriceHistory(
          record.priceHistory,
        ),
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
      if (
        minQty === undefined ||
        minQty < 1 ||
        price === undefined ||
        price < 0
      ) {
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

function normalizeKolamSpeciesComponentOverrides(
  value: unknown,
): KolamSpeciesComponentOverride[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => {
      const record = asRecord(item);
      const productRecord = asRecord(record.product);
      const totalWeight = asRecord(record.totalWeight);
      const productId = getObjectIdString(record.product);
      const quantity = getNumber(record, 'quantity');
      if (!productId || quantity === undefined || quantity < 0) {
        return null;
      }

      const unitPrice = getNumber(productRecord, 'price');
      const stock = getNumber(productRecord, 'stock');

      return {
        productId,
        productName:
          getString(productRecord, 'name') ||
          getString(productRecord, 'commonName') ||
          getString(record, 'productName') ||
          productId,
        productSku:
          getString(productRecord, 'sku') ||
          getString(productRecord, 'productCode') ||
          getString(record, 'sku'),
        productType: getString(productRecord, 'type'),
        productDescription: getString(productRecord, 'description'),
        productPhotoUri: getFirstProductPhotoUri(productRecord),
        unitLabel: getUnitLabel(productRecord.units) || getUnitLabel(productRecord.unit),
        quantity,
        totalWeightValue: Math.max(0, getNumber(totalWeight, 'value') ?? 0),
        totalWeightUnitLabel: getUnitLabel(totalWeight.unit),
        percentage: Math.max(0, getNumber(record, 'percentage') ?? 0),
        stock: stock === undefined ? null : stock,
        lowStockThreshold: Math.max(0, getNumber(productRecord, 'lowStockThreshold') ?? 0),
        unitPrice: unitPrice === undefined ? null : unitPrice,
      };
    })
    .filter(Boolean) as KolamSpeciesComponentOverride[];
}

function getFirstProductPhotoUri(productRecord: Record<string, unknown>) {
  const photos = normalizeMediaList(productRecord.photos);
  if (photos[0]) {
    return photos[0];
  }

  const variants = Array.isArray(productRecord.variants) ? productRecord.variants : [];
  for (const variant of variants) {
    const variantRecord = asRecord(variant);
    const variantPhotos = normalizeMediaList(variantRecord.photos);
    if (variantPhotos[0]) {
      return variantPhotos[0];
    }
  }

  return null;
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
  const translationsFromRecord =
    normalizeKolamTranslationsFromRecord<KolamSpeciesLocaleFields>(
      record.translations,
    );
  const localeRecords = normalizeKolamSpeciesLocaleRecords(
    record.locales ?? record.locale ?? record.localeContents,
  );
  const translations = {
    ...normalizeKolamSpeciesTranslationsFromLocales(localeRecords),
    ...translationsFromRecord,
  };
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
    weight: normalizeKolamSpeciesWeight(record.weight, record),
    dimension: normalizeKolamSpeciesDimension(record.dimension, record),
    price: getNumber(record, 'price') ?? 0,
    priceToSell:
      getNumber(record, 'price_to_sell') ??
      getNumber(record, 'priceToSell') ??
      getNumber(record, 'sellingPrice') ??
      getNumber(record, 'onlinePrice') ??
      getNumber(record, 'price') ??
      0,
    marketPrice: getNumber(record, 'marketPrice') ?? 0,
    onlinePrice: getNumber(record, 'onlinePrice') ?? 0,
    minimumPriceToSales: getNumber(record, 'minimum_price_to_sales') ?? 0,
    minimumOrderQty: getNumber(record, 'minimumOrderQty') ?? 1,
    lowStockThreshold: getNumber(record, 'lowStockThreshold') ?? 10,
    grocerPricingTiers: normalizeKolamSpeciesGrocerPricingTiers(
      record.grocerPricingTiers,
    ),
    commissionEnabled: getBoolean(record, 'commissionEnabled') ?? false,
    commissionType: normalizeKolamSpeciesCommissionType(
      getString(record, 'commissionType'),
    ),
    commissionValue: Math.max(0, getNumber(record, 'commissionValue') ?? 0),
    memberPoints: normalizeKolamSpeciesMemberPoints(record.memberPoints),
    stock: normalizeStock(record, variants),
    variantCount: variants.length,
    hasVariants: variants.length > 0,
    sellable: getBoolean(record, 'sellable') ?? false,
    status: normalizeSpeciesStatus(record.status),
    isPinned:
      getBoolean(record, 'isPinned') ?? getBoolean(record, 'pinned') ?? false,
    marketplaceSync: normalizeMarketplaceSync(record),
    links,
    vendorPrices: normalizeKolamSpeciesVendorPrices(record.vendorPrices),
    packings: normalizeKolamSpeciesPackingLinks(record.packings),
    availableShippingMethods: normalizeKolamSpeciesShippingMethods(
      record.availableShippingMethods,
    ),
    customFieldValues: normalizeKolamSpeciesCustomFieldValues(
      record.customFieldValues,
    ),
    rootComponents: normalizeKolamSpeciesComponentOverrides(record.components),
    attachedItems: normalizeKolamSpeciesAttachedItems(record.attachedItems),
    assets: normalizeKolamSpeciesAssets(record.assets),
    seo: normalizeKolamSpeciesSeo(record.seo),
    locales: normalizeLocaleContent(record, translations, localeRecords),
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
    (Array.isArray(items) ? items : []).map(item => {
      const variants = Array.isArray(item.variants) ? item.variants : [];

      return {
        id: item.id,
        scientificName: item.scientificName,
        commonName: item.commonName,
        sku: item.sku,
        stock: item.stock,
        price: item.price,
        priceToSell: item.priceToSell,
        marketPrice: item.marketPrice,
        onlinePrice: item.onlinePrice,
        minimumPriceToSales: item.minimumPriceToSales,
        minimumOrderQty: item.minimumOrderQty,
        grocerPricingTiers: Array.isArray(item.grocerPricingTiers)
          ? item.grocerPricingTiers
          : [],
        commissionEnabled: item.commissionEnabled,
        commissionType: item.commissionType,
        commissionValue: item.commissionValue,
        memberPoints: item.memberPoints,
        thumbnailUri: item.thumbnailUri,
        videoUris: Array.isArray(item.videoUris) ? item.videoUris : [],
        voiceUri: item.voiceUri,
        variants: variants.map(variant => ({
          id: variant.id,
          photoUris: variant.photoUris,
          videoUris: variant.videoUris,
          vendorPrices: (Array.isArray(variant.vendorPrices)
            ? variant.vendorPrices
            : []
          ).map(price => ({
            vendorId: price.vendorId,
            price: price.price,
            shippingCost: price.shippingCost,
            totalCost: price.totalCost,
          })),
          grocerPricingTiers: Array.isArray(variant.grocerPricingTiers)
            ? variant.grocerPricingTiers
            : [],
          componentOverrides: Array.isArray(variant.componentOverrides)
            ? variant.componentOverrides
            : [],
          commissionEnabled: variant.commissionEnabled,
          commissionType: variant.commissionType,
          commissionValue: variant.commissionValue,
          memberPoints: variant.memberPoints,
        })),
        tags: (Array.isArray(item.tags) ? item.tags : []).map(tag => tag.id),
        links: Array.isArray(item.links) ? item.links : [],
        packings: Array.isArray(item.packings) ? item.packings : [],
        availableShippingMethods: Array.isArray(item.availableShippingMethods)
          ? item.availableShippingMethods
          : [],
        customFieldValues: Array.isArray(item.customFieldValues)
          ? item.customFieldValues
          : [],
        rootComponents: Array.isArray(item.rootComponents)
          ? item.rootComponents
          : [],
        attachedItems: Array.isArray(item.attachedItems)
          ? item.attachedItems
          : [],
        seo: item.seo,
        iucnLink: item.iucnLink,
        status: item.status,
        updatedAt: item.updatedAt,
      };
    }),
  );
}

export function createKolamSpeciesDetailRevision(item: KolamSpecies) {
  const categories = Array.isArray(item.categories) ? item.categories : [];
  const tags = Array.isArray(item.tags) ? item.tags : [];

  return createStableHash({
    id: item.id,
    scientificName: item.scientificName,
    commonName: item.commonName,
    localName: item.localName,
    sku: item.sku,
    stock: item.stock,
    price: item.price,
    priceToSell: item.priceToSell,
    marketPrice: item.marketPrice,
    onlinePrice: item.onlinePrice,
    minimumPriceToSales: item.minimumPriceToSales,
    minimumOrderQty: item.minimumOrderQty,
    grocerPricingTiers: Array.isArray(item.grocerPricingTiers)
      ? item.grocerPricingTiers
      : [],
    commissionEnabled: item.commissionEnabled,
    commissionType: item.commissionType,
    commissionValue: item.commissionValue,
    memberPoints: item.memberPoints,
    photoUris: Array.isArray(item.photoUris) ? item.photoUris : [],
    videoUris: Array.isArray(item.videoUris) ? item.videoUris : [],
    voiceUri: item.voiceUri,
    variants: Array.isArray(item.variants) ? item.variants : [],
    taxonomy: item.taxonomy?.id,
    categories: categories.map(category => category.id),
    tags: tags.map(tag => tag.id),
    links: Array.isArray(item.links) ? item.links : [],
    packings: Array.isArray(item.packings) ? item.packings : [],
    availableShippingMethods: Array.isArray(item.availableShippingMethods)
      ? item.availableShippingMethods
      : [],
    customFieldValues: Array.isArray(item.customFieldValues)
      ? item.customFieldValues
      : [],
    rootComponents: Array.isArray(item.rootComponents)
      ? item.rootComponents
      : [],
    attachedItems: Array.isArray(item.attachedItems)
      ? item.attachedItems
      : [],
    seo: item.seo,
    iucnLink: item.iucnLink,
    locales: Array.isArray(item.locales) ? item.locales : [],
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

function normalizeKolamSpeciesCommissionType(
  value: unknown,
): KolamSpeciesCommissionType {
  return value === 'fixed' ? 'fixed' : 'percentage';
}

function normalizeKolamSpeciesMemberPoints(
  value: unknown,
): KolamSpeciesMemberPoints {
  const record = asRecord(value);
  const enabled = getBoolean(record, 'enabled') ?? false;
  const points = Math.max(0, getNumber(record, 'points') ?? 0);

  return { enabled, points };
}


function normalizeKolamSpeciesWeight(
  value: unknown,
  fallbackRecord: Record<string, unknown>,
): KolamSpeciesWeight | null {
  const record = asRecord(value);
  const weightValue = firstDefinedNumber(
    getNumber(record, 'value'),
    getNumber(fallbackRecord, 'weightValue'),
    getNumber(fallbackRecord, 'weight_value'),
  );
  if (weightValue === undefined || weightValue <= 0) {
    return null;
  }

  return {
    value: weightValue,
    unitId:
      getObjectIdString(record.unit) ||
      getObjectIdString(fallbackRecord.weightUnit) ||
      getObjectIdString(fallbackRecord.weightUnitId),
    unitLabel:
      getUnitLabel(record.unit) ||
      getString(fallbackRecord, 'weightUnitLabel') ||
      getUnitLabel(fallbackRecord.weightUnit) ||
      getUnitLabel(fallbackRecord.weightUnitId) ||
      'g',
  };
}

function normalizeKolamSpeciesDimension(
  value: unknown,
  fallbackRecord: Record<string, unknown>,
): KolamSpeciesDimension | null {
  const record = asRecord(value);
  const length = firstDefinedNumber(
    getNumber(record, 'length'),
    getNumber(fallbackRecord, 'dimensionLength'),
    getNumber(fallbackRecord, 'dimension_length'),
  ) ?? 0;
  const width = firstDefinedNumber(
    getNumber(record, 'width'),
    getNumber(fallbackRecord, 'dimensionWidth'),
    getNumber(fallbackRecord, 'dimension_width'),
  ) ?? 0;
  const height = firstDefinedNumber(
    getNumber(record, 'height'),
    getNumber(fallbackRecord, 'dimensionHeight'),
    getNumber(fallbackRecord, 'dimension_height'),
  ) ?? 0;

  if (length <= 0 && width <= 0 && height <= 0) {
    return null;
  }

  return {
    length,
    width,
    height,
    unitId:
      getObjectIdString(record.unit) ||
      getObjectIdString(fallbackRecord.dimensionUnit) ||
      getObjectIdString(fallbackRecord.dimensionUnitId),
    unitLabel:
      getUnitLabel(record.unit) ||
      getString(fallbackRecord, 'dimensionUnitLabel') ||
      getUnitLabel(fallbackRecord.dimensionUnit) ||
      getUnitLabel(fallbackRecord.dimensionUnitId) ||
      'cm',
  };
}

function normalizeKolamSpeciesAssets(value: unknown): KolamSpeciesAsset[] {
  const list = Array.isArray(value) ? value : [];
  return list
    .map(item => {
      const record = asRecord(item);
      const id = getString(record, '_id') || getString(record, 'id');
      if (!id) {
        return null;
      }
      return {
        id,
        title:
          getString(record, 'title') ||
          getString(record, 'originalFilename') ||
          'Aset',
        path: getString(record, 'path'),
        originalFilename: getString(record, 'originalFilename'),
        mimeType: getString(record, 'mimeType'),
        fileSize: getNumber(record, 'fileSize') ?? 0,
        uploadedAt: getString(record, 'uploadedAt'),
        uploadedBy: getString(record, 'uploadedBy'),
      };
    })
    .filter(Boolean) as KolamSpeciesAsset[];
}
function normalizeKolamSpeciesSeo(value: unknown): KolamSpeciesSeo {
  const record = asRecord(value);
  const score = getNumber(record, 'lastSeoScore');
  return {
    metaTitle: getString(record, 'metaTitle'),
    metaDescription: getString(record, 'metaDescription'),
    keywords: Array.isArray(record.keywords)
      ? record.keywords.map(String).map(item => item.trim()).filter(Boolean)
      : [],
    lastAuditedAt: getString(record, 'lastAuditedAt'),
    lastSeoScore: score === undefined ? null : score,
  };
}

function normalizeKolamSpeciesAttachedItems(value: unknown): KolamSpeciesAttachedItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      const record = asRecord(item);
      const itemType = getString(record, 'itemType') || 'product';
      const target = itemType === 'species' ? record.species : record.product;
      const targetRecord = asRecord(target);
      const targetId = getObjectIdString(target);
      const fallbackName = itemType === 'species' ? 'Spesies' : 'Produk';
      return {
        id: getString(record, '_id') || getString(record, 'id') || `${itemType}-${index}`,
        itemType,
        type: getString(record, 'type'),
        typeLabel: getAttachedItemTypeLabel(getString(record, 'type')),
        targetId,
        targetName:
          getString(targetRecord, 'name') ||
          getString(targetRecord, 'scientificName') ||
          getString(targetRecord, 'commonName') ||
          getString(record, 'name') ||
          fallbackName,
        targetSku: getString(targetRecord, 'sku') || getString(record, 'sku'),
        note: getString(record, 'note'),
      };
    })
    .filter(item => item.targetName) as KolamSpeciesAttachedItem[];
}

function getAttachedItemTypeLabel(type: string) {
  switch (type) {
    case 'feeding':
      return 'Pakan';
    case 'supplements':
      return 'Suplemen';
    case 'medicine':
      return 'Obat';
    case 'compatible_with':
      return 'Kompatibel';
    case 'replacement':
      return 'Pengganti';
    default:
      return type || 'Terlampir';
  }
}

function getUnitLabel(value: unknown) {
  if (typeof value === 'string') {
    return value.trim();
  }
  const record = asRecord(value);
  return (
    getString(record, 'initial') ||
    getString(record, 'symbol') ||
    getString(record, 'shortName') ||
    getString(record, 'name')
  );
}

function firstDefinedNumber(...values: Array<number | undefined>) {
  return values.find(value => value !== undefined);
}
function normalizeSpeciesStatus(value: unknown): KolamSpeciesStatus {
  const status = String(value ?? '')
    .trim()
    .toLowerCase();

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

function normalizeKolamSpeciesCustomFieldValues(
  value: unknown,
): KolamSpeciesCustomFieldValue[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => {
      const record = asRecord(item);
      const fieldRecord = asRecord(record.field);
      const unitRecord = asRecord(record.unit);
      const fieldId =
        getObjectIdString(record.field) || getString(record, 'fieldKey');
      const fieldLabel =
        getString(fieldRecord, 'fieldLabel') ||
        getString(fieldRecord, 'label') ||
        getString(fieldRecord, 'name') ||
        getString(record, 'fieldLabel') ||
        getString(record, 'fieldKey') ||
        'Field';
      const unitLabel =
        getString(unitRecord, 'initial') ||
        getString(unitRecord, 'symbol') ||
        getString(unitRecord, 'name');
      const valueLabel = formatCustomFieldValue(record, unitLabel);

      if (!fieldId && valueLabel === '-') {
        return null;
      }

      return {
        fieldId: fieldId || fieldLabel,
        fieldLabel,
        valueLabel,
        unitLabel,
        raw: item,
      };
    })
    .filter(Boolean) as KolamSpeciesCustomFieldValue[];
}

function formatCustomFieldValue(
  record: Record<string, unknown>,
  unitLabel: string,
) {
  const minValue = getNumber(record, 'minValue');
  const maxValue = getNumber(record, 'maxValue');
  if (minValue !== null || maxValue !== null) {
    const range = [minValue, maxValue]
      .filter(value => value !== null && value !== undefined)
      .map(value => formatRawNumber(value as number))
      .join(' - ');
    return `${range || '-'}${unitLabel ? ` ${unitLabel}` : ''}`;
  }

  const rawValue = record.value;
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return '-';
  }

  if (typeof rawValue === 'boolean') {
    return rawValue ? 'Ya' : 'Tidak';
  }

  if (typeof rawValue === 'number') {
    return `${formatRawNumber(rawValue)}${unitLabel ? ` ${unitLabel}` : ''}`;
  }

  if (typeof rawValue === 'string') {
    return `${rawValue.trim() || '-'}${unitLabel ? ` ${unitLabel}` : ''}`;
  }

  return JSON.stringify(rawValue);
}

function formatRawNumber(value: number) {
  return Number.isInteger(value) ? String(value) : String(value);
}

function normalizeKolamSpeciesPackingLinks(
  value: unknown,
): KolamSpeciesPackingLink[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => {
      const record = asRecord(item);
      const packingRecord = asRecord(record.packing);
      const packingId = getObjectIdString(record.packing);
      if (!packingId) {
        return null;
      }

      return {
        packingId,
        packingName:
          getString(packingRecord, 'name') ||
          getString(record, 'packingName') ||
          packingId,
        packingCategory:
          getString(packingRecord, 'category') ||
          getString(packingRecord, 'packingCategory') ||
          getString(record, 'category'),
        variantId: getObjectIdString(record.variant) || null,
        quantity: Math.max(0, getNumber(record, 'quantity') ?? 1),
        unitHpp: Math.max(
          0,
          getNumber(packingRecord, 'price') ??
            getNumber(packingRecord, 'priceToSell') ??
            getNumber(packingRecord, 'totalCost') ??
            getNumber(record, 'unitHpp') ??
            0,
        ),
      };
    })
    .filter(Boolean) as KolamSpeciesPackingLink[];
}

function normalizeKolamSpeciesShippingMethods(
  value: unknown,
): KolamSpeciesShippingMethod[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => {
      const record = asRecord(item);
      const pricingModel = asRecord(record.pricingModel);
      const estimatedDays = asRecord(record.estimatedDays);
      const specialConditions = asRecord(record.specialConditions);
      const id = getObjectIdString(record) || getString(record, '_id') || getString(record, 'id');
      const displayName =
        getString(record, 'displayName') || getString(record, 'name') || id;
      if (!id || !displayName) {
        return null;
      }

      return {
        id,
        displayName,
        logoUri: getKolamFileUrl(
          getNullableString(record, 'icon') ?? getNullableString(record, 'logo'),
        ),
        category: getString(record, 'category'),
        pricingType: getString(pricingModel, 'type'),
        pricingPrice: Math.max(0, getNumber(pricingModel, 'price') ?? 0),
        estimatedMinDays: Math.max(0, getNumber(estimatedDays, 'min') ?? 0),
        estimatedMaxDays: Math.max(0, getNumber(estimatedDays, 'max') ?? 0),
        restrictedRegions: Array.isArray(specialConditions.restrictedRegions)
          ? specialConditions.restrictedRegions.map(String).filter(Boolean)
          : [],
        maximumWeight: Math.max(0, getNumber(specialConditions, 'maximumWeight') ?? 0),
        maximumDimensionLength: Math.max(
          0,
          getNumber(asRecord(specialConditions.maximumDimension), 'length') ?? 0,
        ),
        maximumDimensionWidth: Math.max(
          0,
          getNumber(asRecord(specialConditions.maximumDimension), 'width') ?? 0,
        ),
        maximumDimensionHeight: Math.max(
          0,
          getNumber(asRecord(specialConditions.maximumDimension), 'height') ?? 0,
        ),
        minimumOrderAmount: Math.max(
          0,
          getNumber(specialConditions, 'minimumOrderAmount') ?? 0,
        ),
      };
    })
    .filter(Boolean) as KolamSpeciesShippingMethod[];
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
        : getKolamFileUrl(
            getNullableString(asRecord(item), 'url') ??
              getNullableString(asRecord(item), 'path'),
          ),
    )
    .filter(Boolean) as string[];
}

function normalizeVariantMediaList(value: unknown): KolamSpeciesVariantMedia[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const record = asRecord(item);
    const id =
      getString(record, '_id') || getString(record, 'id') || String(index);
    const tier1 = getString(record, 'tier1Value');
    const tier2 = getString(record, 'tier2Value');
    const weight = asRecord(record.weight);
    const dimension = asRecord(record.dimension);
    const label =
      [tier1, tier2].filter(Boolean).join(' / ') ||
      getString(record, 'label') ||
      `Varian ${index + 1}`;

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
        getNumber(record, 'sellingPrice') ??
        getNumber(record, 'onlinePrice') ??
        getNumber(record, 'price') ??
        0,
      marketPrice: getNumber(record, 'marketPrice') ?? 0,
      onlinePrice: getNumber(record, 'onlinePrice') ?? 0,
      minimumPriceToSales: getNumber(record, 'minimum_price_to_sales') ?? 0,
      minimumOrderQty: getNumber(record, 'minimumOrderQty') ?? 1,
      lowStockThreshold: getNumber(record, 'lowStockThreshold') ?? 10,
      grocerPricingTiers: normalizeKolamSpeciesGrocerPricingTiers(
        record.grocerPricingTiers,
      ),
      commissionEnabled: getBoolean(record, 'commissionEnabled') ?? false,
      commissionType: normalizeKolamSpeciesCommissionType(
        getString(record, 'commissionType'),
      ),
      commissionValue: Math.max(0, getNumber(record, 'commissionValue') ?? 0),
      memberPoints: normalizeKolamSpeciesMemberPoints(record.memberPoints),
      componentOverrides: normalizeKolamSpeciesComponentOverrides(
        record.componentOverrides,
      ),
      weightValue:
        getNumber(weight, 'value') ??
        getNumber(record, 'weightValue') ??
        getNumber(record, 'weight_value') ??
        0,
      weightUnitId:
        getObjectIdString(weight.unit) ||
        getObjectIdString(record.weightUnitId) ||
        getObjectIdString(record.weightUnit),
      dimensionLength:
        getNumber(dimension, 'length') ??
        getNumber(record, 'dimensionLength') ??
        getNumber(record, 'dimension_length') ??
        0,
      dimensionWidth:
        getNumber(dimension, 'width') ??
        getNumber(record, 'dimensionWidth') ??
        getNumber(record, 'dimension_width') ??
        0,
      dimensionHeight:
        getNumber(dimension, 'height') ??
        getNumber(record, 'dimensionHeight') ??
        getNumber(record, 'dimension_height') ??
        0,
      dimensionUnitId:
        getObjectIdString(dimension.unit) ||
        getObjectIdString(record.dimensionUnitId) ||
        getObjectIdString(record.dimensionUnit),
      photoUris: uniqueStrings(normalizeMediaList(record.photos)),
      videoUris: uniqueStrings(normalizeMediaList(record.videos)),
      vendorPrices: normalizeKolamSpeciesVendorPrices(record.vendorPrices),
      customFieldValues: normalizeKolamSpeciesCustomFieldValues(
        record.customFieldValues,
      ),
      links: normalizeSpeciesLinks(record.link),
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

function normalizeKolamSpeciesLocaleRecords(value: unknown): KolamSpeciesLocaleContent[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(entry => {
      const record = asRecord(entry);
      const code = normalizeKolamSpeciesLocaleCode(record);

      if (!code) {
        return null;
      }

      return {
        code,
        commonName: getFirstString(record, ['commonName', 'common_name']),
        localName: getFirstString(record, ['localName', 'local_name']),
        shortDescription: getFirstString(record, [
          'shortDescription',
          'short_description',
          'summary',
        ]),
        description: getFirstString(record, ['description', 'longDescription']),
        morfologis: getFirstString(record, [
          'morfologis',
          'morfologi',
          'morphology',
        ]),
        habitat: getFirstString(record, ['habitat']),
        distribution: getFirstString(record, ['distribution', 'distribusi']),
      };
    })
    .filter(Boolean) as KolamSpeciesLocaleContent[];
}

function normalizeKolamSpeciesTranslationsFromLocales(
  locales: KolamSpeciesLocaleContent[],
): KolamCatalogTranslationsMap<KolamSpeciesLocaleFields> {
  const output: KolamCatalogTranslationsMap<KolamSpeciesLocaleFields> = {};

  locales.forEach(locale => {
    if (locale.code === KOLAM_CATALOG_DEFAULT_LOCALE) {
      return;
    }

    if (!isKolamCatalogLocale(locale.code)) {
      return;
    }

    const block: KolamSpeciesLocaleFields = {
      commonName: locale.commonName,
      localName: locale.localName,
      shortDescription: locale.shortDescription,
      description: locale.description,
      morfologis: locale.morfologis,
      habitat: locale.habitat,
      distribution: locale.distribution,
    };
    const hasValue = Object.values(block).some(value => Boolean(value?.trim()));

    if (hasValue) {
      output[locale.code] = block;
    }
  });

  return output;
}

function normalizeKolamSpeciesLocaleCode(
  record: Record<string, unknown>,
): KolamCatalogLocale | '' {
  const localeRecord = asRecord(record.locale);
  const rawCode =
    getString(record, 'code') ||
    getString(record, 'locale') ||
    getString(record, 'lang') ||
    getString(record, 'language') ||
    getString(localeRecord, 'code') ||
    getString(localeRecord, 'locale');
  const code = rawCode.toLowerCase().split(/[-_]/)[0];

  return isKolamCatalogLocale(code) ? code : '';
}

function isKolamCatalogLocale(value: string): value is KolamCatalogLocale {
  return (KOLAM_CATALOG_LOCALES as readonly string[]).includes(value);
}
function normalizeLocaleContent(
  record: Record<string, unknown>,
  translations: KolamCatalogTranslationsMap<KolamSpeciesLocaleFields>,
  localeRecords: KolamSpeciesLocaleContent[] = [],
) {
  const entries = [
    [
      'id',
      {
        commonName:
          localeRecords.find(locale => locale.code === KOLAM_CATALOG_DEFAULT_LOCALE)
            ?.commonName || getString(record, 'commonName'),
        localName:
          localeRecords.find(locale => locale.code === KOLAM_CATALOG_DEFAULT_LOCALE)
            ?.localName || getString(record, 'localName'),
        shortDescription:
          localeRecords.find(locale => locale.code === KOLAM_CATALOG_DEFAULT_LOCALE)
            ?.shortDescription || getString(record, 'shortDescription'),
        description:
          localeRecords.find(locale => locale.code === KOLAM_CATALOG_DEFAULT_LOCALE)
            ?.description || getString(record, 'description'),
        morfologis:
          localeRecords.find(locale => locale.code === KOLAM_CATALOG_DEFAULT_LOCALE)
            ?.morfologis || getString(record, 'morfologis'),
        habitat:
          localeRecords.find(locale => locale.code === KOLAM_CATALOG_DEFAULT_LOCALE)
            ?.habitat || getString(record, 'habitat'),
        distribution:
          localeRecords.find(locale => locale.code === KOLAM_CATALOG_DEFAULT_LOCALE)
            ?.distribution || getString(record, 'distribution'),
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


function getFirstString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = getString(record, key);
    if (value) {
      return value;
    }
  }

  return '';
}function getString(record: Record<string, unknown>, key: string) {
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



























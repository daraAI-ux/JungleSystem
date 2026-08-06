import { getKolamFileUrl } from '../lib/file-url';
import {
  KOLAM_CATALOG_DEFAULT_LOCALE,
  KOLAM_CATALOG_LOCALE_LABELS,
  KOLAM_CATALOG_TRANSLATION_LOCALES,
  normalizeKolamTranslationsForSave,
  normalizeKolamTranslationsFromRecord,
  type KolamCatalogLocale,
  type KolamCatalogTranslationsMap,
} from './kolam-catalog-locale';

export type KolamProductSyncStatus =
  | 'pending'
  | 'synced'
  | 'skipped'
  | 'notFound'
  | 'failed'
  | 'partial'
  | 'unknown';

export interface KolamProductMarketplaceSyncPlatform {
  platform: 'tokopedia' | 'shopee';
  label: string;
  status: KolamProductSyncStatus;
  statusLabel: string;
  lastSyncedAt?: string;
  lastError?: string;
  lastTaskId?: string;
  variantCount: number;
}

export interface KolamProductMarketplaceSync {
  label: string;
  lastSyncedAt?: string;
  platforms: KolamProductMarketplaceSyncPlatform[];
  pricePlatforms: KolamProductMarketplaceSyncPlatform[];
}

export interface KolamProductRef {
  id: string;
  logoUri: string;
  name: string;
  slug: string;
  raw: unknown;
}

export interface KolamProductExternalLink {
  label: string;
  url: string;
}

export type KolamProductLinkName =
  | 'shopee'
  | 'tokopedia'
  | 'website'
  | 'link_pos'
  | 'other_link';

export interface KolamProductExternalLinkFormRow {
  name: KolamProductLinkName | '';
  value: string;
}

export type KolamProductLocaleFields = {
  name?: string;
  shortDescription?: string;
  description?: string;
};

export interface KolamProductLocaleBlock {
  description: string;
  locale: KolamCatalogLocale;
  localeLabel: string;
  name: string;
  shortDescription: string;
}

export interface KolamProductLogistics {
  dimensionLabel: string;
  height: number;
  length: number;
  shippingMethods: KolamProductShippingMethod[];
  volume: number;
  weight: number;
  weightLabel: string;
  width: number;
}

export interface KolamProductShippingMethod {
  id: string;
  displayName: string;
  logoUri: string | null;
  label: string;
  category: string;
  pricingType: string;
  pricingPrice: number;
  priceLabel: string;
  etaLabel: string;
  coverageLabel: string;
  estimatedMinDays: number;
  estimatedMaxDays: number;
  restrictedRegions: string[];
  maximumWeight: number;
  maximumDimensionLength: number;
  maximumDimensionWidth: number;
  maximumDimensionHeight: number;
  minimumOrderAmount: number;
  raw: unknown;
}

export interface KolamProductCustomFieldDisplay {
  id: string;
  label: string;
  value: string;
  meta: string;
  type: string;
  required: boolean;
  iconUri: string;
}

export interface KolamProductComponentLine {
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
  raw: unknown;
}

export interface KolamProductPackingLine {
  id: string;
  name: string;
  sku: string;
  variantLabel: string;
  quantity: number;
  thumbnailUri: string;
  raw: unknown;
}

export interface KolamProductAsset {
  id: string;
  title: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  raw: unknown;
}

export interface KolamProductWarranty {
  mode: string;
  label: string;
  days: number;
  vendorName: string;
  termsTitle: string;
  termsExcerpt: string;
}

export interface KolamProductSeo {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  faqCount: number;
  lastAuditedAt: string;
  lastSeoScore: number;
}

export interface KolamProductAttachedItem {
  id: string;
  itemType: string;
  type: string;
  typeLabel: string;
  targetId: string;
  targetName: string;
  targetSku: string;
  note: string;
}

export interface KolamProductVariant {
  id: string;
  label: string;
  sku: string;
  productCode: string;
  tier1Value: string;
  tier2Value: string;
  price: number;
  priceToSell: number;
  marketPrice: number;
  onlinePrice: number;
  minimumPriceToSales: number;
  minimumOrderQty: number;
  stock: number;
  lowStockThreshold: number;
  vendorPrices: KolamProductVendorPriceDisplay[];
  grocerPricingTiers: Array<{ minQty: number; price: number; onlinePrice: number }>;
  memberPoints: { enabled: boolean; points: number };
  commissionEnabled: boolean;
  commissionType: string;
  commissionValue: number;
  weightValue: number;
  weightUnitId: string;
  dimensionLength: number;
  dimensionWidth: number;
  dimensionHeight: number;
  dimensionUnitId: string;
  photoUris: string[];
  videoUris: string[];
  componentOverrides: KolamProductComponentLine[];
  customFields: KolamProductCustomFieldDisplay[];
  externalLinks: KolamProductExternalLink[];
  raw: unknown;
}

export interface KolamProductVendorPriceDisplay {
  id: string;
  link: string;
  price: number;
  priceHistory: Array<{ date?: string; poId?: string; poRef?: string }>;
  shippingCost: number;
  totalCost: number;
  vendorId: string;
  vendorName: string;
  vendorStatus: string;
  raw: unknown;
}

export interface KolamProductVendorPriceFormRow {
  id: string;
  vendorId: string;
  price: string;
  shippingCost: string;
  link: string;
}

export interface KolamProductGrocerPricingTierFormRow {
  id: string;
  minQty: string;
  price: string;
  onlinePrice: string;
}

export interface KolamProductComponentFormRow {
  id: string;
  productId: string;
  quantity: string;
}

export interface KolamProductPackingLinkFormRow {
  id: string;
  packingId: string;
  variantId: string;
  quantity: string;
}

export type KolamProductCommissionType = 'percentage' | 'fixed';
export type KolamProductWarrantyMode = 'none' | 'official_distributor' | 'da' | string;

export interface KolamProductVariantFormRow {
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
  vendorPrices: KolamProductVendorPriceFormRow[];
  componentOverrides: KolamProductComponentFormRow[];
  externalLinks: KolamProductExternalLinkFormRow[];
  grocerPricingTiers: KolamProductGrocerPricingTierFormRow[];
  customFieldValues: unknown[];
  weightValue: string;
  weightUnitId: string;
  dimensionLength: string;
  dimensionWidth: string;
  dimensionHeight: string;
  dimensionUnitId: string;
  memberPointsEnabled: boolean;
  memberPoints: string;
  raw: unknown;
}

export interface KolamProductPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface KolamProductListResult {
  data: KolamProduct[];
  pagination: KolamProductPagination;
}

export interface KolamProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  productCode: string;
  type: string;
  status: string;
  labels: string[];
  thumbnailUri: string;
  photoUris: string[];
  categories: KolamProductRef[];
  brands: KolamProductRef[];
  description: string;
  externalLinks: KolamProductExternalLink[];
  attachedItems: KolamProductAttachedItem[];
  customFields: KolamProductCustomFieldDisplay[];
  components: KolamProductComponentLine[];
  packings: KolamProductPackingLine[];
  assets: KolamProductAsset[];
  warranty: KolamProductWarranty;
  seo: KolamProductSeo;
  logistics: KolamProductLogistics;
  localeBlocks: KolamProductLocaleBlock[];
  shortDescription: string;
  tags: KolamProductRef[];
  locationLabel: string;
  videos: string[];
  variants: KolamProductVariant[];
  variantCount: number;
  hasVariants: boolean;
  unitLabel: string;
  price: number;
  priceToSell: number;
  marketPrice: number;
  onlinePrice: number;
  minimumPriceToSales: number;
  minimumOrderQty: number;
  vendorPriceRangeLabel: string;
  grocerPricingTiers: Array<{ minQty: number; price: number; onlinePrice: number }>;
  memberPoints: { enabled: boolean; points: number };
  commission: { enabled: boolean; type: string; value: number; label: string };
  stock: number;
  lowStockThreshold: number;
  sellable: boolean;
  isPinned: boolean;
  marketplaceSync: KolamProductMarketplaceSync;
  createdAt: string;
  updatedAt: string;
  raw: unknown;
}

export interface KolamProductFormState {
  id: string;
  name: string;
  sku: string;
  productCode: string;
  description: string;
  shortDescription: string;
  translations: KolamCatalogTranslationsMap<KolamProductLocaleFields>;
  brandIds: string[];
  categoryIds: string[];
  tagIds: string[];
  unitId: string;
  productType: 'product' | 'raw' | 'packing';
  sellable: boolean;
  lowStockThreshold: string;
  locationId: string;
  availableShippingMethodIds: string[];
  commissionEnabled: boolean;
  commissionType: KolamProductCommissionType;
  commissionValue: string;
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
  memberPointsEnabled: boolean;
  memberPoints: string;
  warrantyMode: KolamProductWarrantyMode;
  warrantyDays: string;
  warrantyVendorId: string;
  warrantyTermsTemplateId: string;
  seoMetaTitle: string;
  seoMetaDescription: string;
  seoKeywords: string;
  grocerPricingTiers: KolamProductGrocerPricingTierFormRow[];
  customFieldValues: unknown[];
  componentRows: KolamProductComponentFormRow[];
  vendorPrices: KolamProductVendorPriceFormRow[];
  externalLinks: KolamProductExternalLinkFormRow[];
  hasVariants: boolean;
  variantConfigTier1Name: string;
  variantConfigTier2Name: string;
  variants: KolamProductVariantFormRow[];
  variantsTouched: boolean;
  packingLinks: KolamProductPackingLinkFormRow[];
  thumbnailLocalUri: string;
  photoLocalUri: string;
  videoLocalUri: string;
  selectedVariantId: string;
  variantPhotoLocalUri: string;
  variantVideoLocalUri: string;
}

export type KolamProductSurfaceMode = 'list' | 'detail' | 'edit' | 'new';
export type KolamProductCatalogKind = 'product' | 'raw';

export function getKolamProductCatalogKind(route: string): KolamProductCatalogKind {
  const routePath = route.split('?')[0];
  return routePath === '/raw-materials' || routePath.startsWith('/raw-materials/')
    ? 'raw'
    : 'product';
}

export function isKolamProductRoute(route: string) {
  const routePath = route.split('?')[0];
  return (
    routePath === '/products' ||
    routePath.startsWith('/products/') ||
    routePath === '/raw-materials' ||
    routePath.startsWith('/raw-materials/')
  );
}

export function getKolamProductBreadcrumbPath(
  mode: KolamProductSurfaceMode,
  selectedProduct?: KolamProduct | null,
  catalogKind: KolamProductCatalogKind = 'product',
) {
  const basePath = catalogKind === 'raw' ? '/raw-materials' : '/products';

  if (mode === 'new') {
    return `${basePath}/create`;
  }

  if (selectedProduct) {
    const key = selectedProduct.id;
    const detailBasePath = selectedProduct.type === 'raw' ? '/raw-materials' : '/products';
    return mode === 'edit' ? `${detailBasePath}/${key}/edit` : `${detailBasePath}/${key}`;
  }

  return basePath;
}
export function normalizeKolamProductList(payload: unknown): KolamProductListResult {
  const rootRecord = asRecord(payload);
  const dataRecord = asRecord(rootRecord.data);
  const list: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray(rootRecord.data)
    ? rootRecord.data
    : Array.isArray(dataRecord.data)
    ? dataRecord.data
    : Array.isArray(rootRecord.products)
    ? rootRecord.products
    : Array.isArray(rootRecord.items)
    ? rootRecord.items
    : [];

  const products = list
    .map(normalizeKolamProduct)
    .filter(item => item.id && item.name);

  return {
    data: products,
    pagination: normalizePagination(
      rootRecord.pagination ?? dataRecord.pagination,
      products.length,
    ),
  };
}

export function normalizeKolamProductDetail(payload: unknown): KolamProduct {
  const root = unwrapData(payload);
  return normalizeKolamProduct(root);
}

export function createKolamProductListRevision(result: KolamProductListResult) {
  return createStableHash({
    pagination: result.pagination,
    data: result.data.map(item => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      productCode: item.productCode,
      thumbnailUri: item.thumbnailUri,
      price: item.price,
      priceToSell: item.priceToSell,
      marketPrice: item.marketPrice,
      onlinePrice: item.onlinePrice,
      stock: item.stock,
      lowStockThreshold: item.lowStockThreshold,
      variantCount: item.variantCount,
      brands: item.brands.map(brand => brand.id || brand.name),
      categories: item.categories.map(category => category.id || category.name),
      marketplaceSync: item.marketplaceSync,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
  });
}

export function createKolamProductDetailRevision(item: KolamProduct) {
  return createStableHash({
    id: item.id,
    name: item.name,
    sku: item.sku,
    productCode: item.productCode,
    slug: item.slug,
    type: item.type,
    status: item.status,
    labels: item.labels,
    thumbnailUri: item.thumbnailUri,
    photoUris: item.photoUris,
    categories: item.categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    })),
    brands: item.brands.map(brand => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
    })),
    variants: item.variants.map(variant => ({
      id: variant.id,
      label: variant.label,
      sku: variant.sku,
      productCode: variant.productCode,
      tier1Value: variant.tier1Value,
      tier2Value: variant.tier2Value,
      price: variant.price,
      priceToSell: variant.priceToSell,
      marketPrice: variant.marketPrice,
      onlinePrice: variant.onlinePrice,
      stock: variant.stock,
      lowStockThreshold: variant.lowStockThreshold,
      photoUris: variant.photoUris,
      videoUris: variant.videoUris,
    })),
    tags: item.tags.map(tag => tag.id || tag.name),
    locationLabel: item.locationLabel,
    customFields: item.customFields.map(field => ({
      id: field.id,
      label: field.label,
      value: field.value,
    })),
    components: item.components.map(component => ({
      id: component.id,
      name: component.name,
      quantity: component.quantity,
      totalPrice: component.totalPrice,
    })),
    packings: item.packings.map(packing => ({
      id: packing.id,
      name: packing.name,
      quantity: packing.quantity,
      variantLabel: packing.variantLabel,
    })),
    attachedItems: (Array.isArray(item.attachedItems) ? item.attachedItems : []).map(
      attachedItem => ({
        id: attachedItem.id,
        itemType: attachedItem.itemType,
        type: attachedItem.type,
        targetId: attachedItem.targetId,
        targetName: attachedItem.targetName,
        targetSku: attachedItem.targetSku,
      }),
    ),
    assets: item.assets.map(asset => ({
      id: asset.id,
      title: asset.title,
      filename: asset.filename,
    })),
    warranty: item.warranty,
    seo: item.seo,
    logistics: item.logistics,
    localeBlocks: item.localeBlocks,
    minimumPriceToSales: item.minimumPriceToSales,
    minimumOrderQty: item.minimumOrderQty,
    vendorPriceRangeLabel: item.vendorPriceRangeLabel,
    grocerPricingTiers: item.grocerPricingTiers,
    memberPoints: item.memberPoints,
    commission: item.commission,
    price: item.price,
    priceToSell: item.priceToSell,
    marketPrice: item.marketPrice,
    onlinePrice: item.onlinePrice,
    stock: item.stock,
    lowStockThreshold: item.lowStockThreshold,
    sellable: item.sellable,
    isPinned: item.isPinned,
    marketplaceSync: item.marketplaceSync,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  });
}

export function createEmptyKolamProductFormState(
  catalogKind: KolamProductCatalogKind = 'product',
): KolamProductFormState {
  return {
    id: '',
    name: '',
    sku: '',
    productCode: '',
    description: '',
    shortDescription: '',
    translations: {},
    brandIds: [],
    categoryIds: [],
    tagIds: [],
    unitId: '',
    productType: catalogKind,
    sellable: catalogKind !== 'raw',
    lowStockThreshold: '0',
    locationId: '',
    availableShippingMethodIds: [],
    commissionEnabled: false,
    commissionType: 'percentage',
    commissionValue: '0',
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
    memberPointsEnabled: false,
    memberPoints: '0',
    warrantyMode: 'none',
    warrantyDays: '365',
    warrantyVendorId: '',
    warrantyTermsTemplateId: '',
    seoMetaTitle: '',
    seoMetaDescription: '',
    seoKeywords: '',
    grocerPricingTiers: [],
    customFieldValues: [],
    componentRows: [],
    vendorPrices: [],
    externalLinks: [],
    hasVariants: false,
    variantConfigTier1Name: 'Varian',
    variantConfigTier2Name: '',
    variants: [],
    variantsTouched: false,
    packingLinks: [],
    thumbnailLocalUri: '',
    photoLocalUri: '',
    videoLocalUri: '',
    selectedVariantId: '',
    variantPhotoLocalUri: '',
    variantVideoLocalUri: '',
  };
}

export function createKolamProductFormState(product: KolamProduct): KolamProductFormState {
  const raw = asRecord(unwrapData(product.raw));
  const unitRecord = asRecord(raw.units ?? raw.unit);
  const weight = asRecord(raw.weight);
  const dimension = asRecord(raw.dimension);
  const memberPoints = asRecord(raw.memberPoints);
  const warranty = asRecord(raw.productWarranty);
  const variantConfig = asRecord(raw.variantConfig);
  const variants = Array.isArray(raw.variants) ? raw.variants : product.variants.map(variant => variant.raw);
  const links = Array.isArray(raw.link)
    ? raw.link
    : Array.isArray(raw.links)
    ? raw.links
    : Array.isArray(raw.externalLinks)
    ? raw.externalLinks
    : [];

  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    productCode: product.productCode,
    description: product.description,
    shortDescription: product.shortDescription,
    translations: normalizeKolamTranslationsFromRecord<KolamProductLocaleFields>(
      raw.translations,
    ),
    brandIds: product.brands.map(brand => brand.id).filter(Boolean),
    categoryIds: product.categories.map(category => category.id).filter(Boolean),
    tagIds: product.tags.map(tag => tag.id).filter(Boolean),
    unitId:
      getObjectIdString(raw.units) ||
      getObjectIdString(raw.unit) ||
      getString(unitRecord, '_id') ||
      getString(unitRecord, 'id'),
    productType: normalizeProductFormType(product.type),
    sellable: product.sellable,
    lowStockThreshold: String(product.lowStockThreshold),
    locationId: getObjectIdString(raw.location),
    availableShippingMethodIds: normalizeObjectIdList(raw.availableShippingMethods),
    commissionEnabled: product.commission.enabled,
    commissionType: normalizeProductCommissionType(product.commission.type),
    commissionValue: String(product.commission.value),
    priceToSell: String(product.priceToSell),
    marketPrice: String(product.marketPrice),
    onlinePrice: String(product.onlinePrice),
    minimumPriceToSales: String(product.minimumPriceToSales),
    minimumOrderQty: String(product.minimumOrderQty || 1),
    weightValue: getNumber(weight, 'value') ? String(getNumber(weight, 'value')) : '',
    weightUnitId: getObjectIdString(weight.unit),
    dimensionLength: getNumber(dimension, 'length') ? String(getNumber(dimension, 'length')) : '',
    dimensionWidth: getNumber(dimension, 'width') ? String(getNumber(dimension, 'width')) : '',
    dimensionHeight: getNumber(dimension, 'height') ? String(getNumber(dimension, 'height')) : '',
    dimensionUnitId: getObjectIdString(dimension.unit),
    memberPointsEnabled: getBoolean(memberPoints, 'enabled') ?? product.memberPoints.enabled,
    memberPoints: String(getNumber(memberPoints, 'points') ?? product.memberPoints.points),
    warrantyMode: getString(warranty, 'mode') || product.warranty.mode || 'none',
    warrantyDays: String(
      (getNumber(warranty, 'warrantyDays') ?? product.warranty.days) || 365,
    ),
    warrantyVendorId: getObjectIdString(warranty.warrantyVendor),
    warrantyTermsTemplateId: getObjectIdString(warranty.warrantyTermsTemplate),
    seoMetaTitle: product.seo.metaTitle,
    seoMetaDescription: product.seo.metaDescription,
    seoKeywords: product.seo.keywords.join(', '),
    grocerPricingTiers: product.grocerPricingTiers.map(createKolamProductGrocerPricingTierFormRow),
    customFieldValues: Array.isArray(raw.customFieldValues) ? raw.customFieldValues : [],
    componentRows: normalizeProductComponentFormRows(raw.components),
    vendorPrices: normalizeProductVendorPriceFormRows(raw.vendorPrices),
    externalLinks: normalizeProductExternalLinkFormRows(links),
    hasVariants: product.hasVariants || variants.length > 0,
    variantConfigTier1Name: getString(variantConfig, 'tier1Name') || 'Varian',
    variantConfigTier2Name: getString(variantConfig, 'tier2Name'),
    variants: variants.map(createKolamProductVariantFormRow),
    variantsTouched: false,
    packingLinks: normalizeProductPackingLinkFormRows(raw.packings),
    thumbnailLocalUri: '',
    photoLocalUri: '',
    videoLocalUri: '',
    selectedVariantId: '',
    variantPhotoLocalUri: '',
    variantVideoLocalUri: '',
  };
}

export function createKolamProductSavePayload(form: KolamProductFormState) {
  const hasVariants = form.hasVariants || form.variants.length > 0;
  const productType = form.productType === 'raw' ? 'raw' : 'product';
  const cleanProductCode = form.productCode.trim();
  if (productType === 'raw' && !cleanProductCode) {
    throw new Error('Kode produk wajib diisi untuk bahan baku.');
  }

  const grocerPricingTiers = createKolamProductGrocerPricingTierPayload(
    form.grocerPricingTiers,
  );

  return {
    name: form.name.trim(),
    sku: productType === 'product' ? form.sku.trim() : '-',
    description: form.description,
    shortDescription: form.shortDescription.trim() || undefined,
    translations:
      normalizeKolamTranslationsForSave<KolamProductLocaleFields>(form.translations) ??
      {},
    brand: form.brandIds,
    category: form.categoryIds,
    unit: form.unitId.trim() || undefined,
    ...(form.commissionEnabled
      ? {
          commissionEnabled: form.commissionEnabled,
          commissionType: form.commissionType,
          commissionValue: toNonNegativeNumber(form.commissionValue),
        }
      : {}),
    productCode: productType === 'raw' ? cleanProductCode : '-',
    sellable: form.sellable,
    type: productType,
    customFieldValues: form.customFieldValues,
    components:
      !hasVariants && form.componentRows.some(row => row.productId.trim())
        ? createKolamProductComponentPayload(form.componentRows)
        : [],
    vendorPrices: hasVariants ? [] : createKolamProductVendorPricePayload(form.vendorPrices),
    lowStockThreshold: toNonNegativeNumber(form.lowStockThreshold),
    link: createKolamProductExternalLinkPayload(form.externalLinks),
    ...(form.locationId.trim() ? { location: form.locationId.trim() } : {}),
    availableShippingMethods: form.availableShippingMethodIds,
    ...(!hasVariants ? { price_to_sell: toNonNegativeNumber(form.priceToSell) } : {}),
    marketPrice: toNonNegativeNumber(form.marketPrice),
    onlinePrice: toNonNegativeNumber(form.onlinePrice),
    minimum_price_to_sales: toNonNegativeNumber(form.minimumPriceToSales),
    minimumOrderQty: Math.max(1, toNonNegativeNumber(form.minimumOrderQty)),
    ...createKolamProductRootWeightPayload(form, hasVariants),
    ...createKolamProductRootDimensionPayload(form, hasVariants),
    ...(!hasVariants && form.memberPointsEnabled
      ? {
          memberPoints: {
            enabled: true,
            points: toNonNegativeNumber(form.memberPoints),
          },
        }
      : {}),
    productWarranty: {
      mode: form.warrantyMode,
      warrantyDays:
        form.warrantyMode !== 'none'
          ? Math.max(1, toNonNegativeNumber(form.warrantyDays))
          : null,
      warrantyVendor:
        form.warrantyMode === 'official_distributor'
          ? form.warrantyVendorId.trim() || null
          : null,
      warrantyTermsTemplate:
        form.warrantyMode !== 'none'
          ? form.warrantyTermsTemplateId.trim() || null
          : null,
    },
    ...(!hasVariants
      ? { grocerPricingTiers }
      : { grocerPricingTiers: [] }),
    ...(hasVariants
      ? {
          variantConfig: createKolamProductVariantConfigPayload(form),
          variants: form.variants.map(row =>
            createKolamProductVariantPayload(row, productType),
          ),
        }
      : {}),
    tags: form.tagIds,
  };
}

export function createEmptyKolamProductVendorPriceFormRow(): KolamProductVendorPriceFormRow {
  return {
    id: createDraftId('vendor'),
    vendorId: '',
    price: '0',
    shippingCost: '0',
    link: '',
  };
}

function createKolamProductVariantFormRow(value: unknown): KolamProductVariantFormRow {
  const variant = asRecord(value);
  const weight = asRecord(variant.weight);
  const dimension = asRecord(variant.dimension);
  const memberPoints = asRecord(variant.memberPoints);

  return {
    id: getString(variant, '_id') || getString(variant, 'id') || createDraftId('variant'),
    tier1Value: getString(variant, 'tier1Value'),
    tier2Value: getString(variant, 'tier2Value'),
    sku: getString(variant, 'sku'),
    productCode:
      getString(variant, 'productCode') ||
      getString(variant, 'product_code') ||
      getString(variant, 'code'),
    price: String(getNumber(variant, 'price') ?? 0),
    priceToSell: String(
      getNumber(variant, 'priceToSell') ??
        getNumber(variant, 'price_to_sell') ??
        0,
    ),
    marketPrice: String(getNumber(variant, 'marketPrice') ?? 0),
    onlinePrice: String(getNumber(variant, 'onlinePrice') ?? 0),
    minimumPriceToSales: String(
      getNumber(variant, 'minimum_price_to_sales') ??
        getNumber(variant, 'minimumPriceToSales') ??
        0,
    ),
    minimumOrderQty: String(getNumber(variant, 'minimumOrderQty') ?? 1),
    lowStockThreshold: String(getNumber(variant, 'lowStockThreshold') ?? 0),
    vendorPrices: normalizeProductVendorPriceFormRows(variant.vendorPrices),
    componentOverrides: normalizeProductComponentFormRows(variant.componentOverrides),
    externalLinks: normalizeProductExternalLinkFormRows(variant.link ?? variant.links),
    grocerPricingTiers: normalizeProductGrocerPricingTierFormRows(variant.grocerPricingTiers),
    customFieldValues: Array.isArray(variant.customFieldValues)
      ? variant.customFieldValues
      : [],
    weightValue: getNumber(weight, 'value') ? String(getNumber(weight, 'value')) : '',
    weightUnitId: getObjectIdString(weight.unit),
    dimensionLength: getNumber(dimension, 'length') ? String(getNumber(dimension, 'length')) : '',
    dimensionWidth: getNumber(dimension, 'width') ? String(getNumber(dimension, 'width')) : '',
    dimensionHeight: getNumber(dimension, 'height') ? String(getNumber(dimension, 'height')) : '',
    dimensionUnitId: getObjectIdString(dimension.unit),
    memberPointsEnabled: getBoolean(memberPoints, 'enabled') ?? false,
    memberPoints: String(getNumber(memberPoints, 'points') ?? 0),
    raw: value,
  };
}

function createKolamProductVariantPayload(
  row: KolamProductVariantFormRow,
  productType: 'product' | 'raw',
) {
  const cleanProductCode = row.productCode.trim();
  if (productType === 'raw' && !cleanProductCode) {
    const variantLabel =
      [row.tier1Value, row.tier2Value].map(value => value.trim()).filter(Boolean).join(' - ') ||
      'tanpa nama';
    throw new Error(`Kode produk wajib diisi untuk varian: ${variantLabel}.`);
  }

  const payload = {
    ...(row.id && !row.id.startsWith('variant-draft-') ? { _id: row.id } : {}),
    tier1Value: row.tier1Value.trim(),
    tier2Value: row.tier2Value.trim(),
    sku: productType === 'product' ? row.sku.trim() : '',
    productCode: productType === 'raw' ? cleanProductCode : '',
    price: toNonNegativeNumber(row.price),
    price_to_sell: toNonNegativeNumber(row.priceToSell),
    marketPrice: toNonNegativeNumber(row.marketPrice),
    onlinePrice: toNonNegativeNumber(row.onlinePrice),
    minimum_price_to_sales: toNonNegativeNumber(row.minimumPriceToSales),
    minimumOrderQty: Math.max(1, toNonNegativeNumber(row.minimumOrderQty)),
    vendorPrices: createKolamProductVendorPricePayload(row.vendorPrices),
    componentOverrides: createKolamProductComponentPayload(row.componentOverrides),
    lowStockThreshold: toNonNegativeNumber(row.lowStockThreshold),
    link: createKolamProductExternalLinkPayload(row.externalLinks),
    ...createKolamProductVariantWeightPayload(row),
    ...createKolamProductVariantDimensionPayload(row),
    memberPoints: {
      enabled: row.memberPointsEnabled,
      points: row.memberPointsEnabled ? toNonNegativeNumber(row.memberPoints) : 0,
    },
    grocerPricingTiers: createKolamProductGrocerPricingTierPayload(row.grocerPricingTiers),
    customFieldValues: row.customFieldValues,
  };
  const raw = asRecord(row.raw);
  const photos = Array.isArray(raw.photos) ? raw.photos : [];
  if (photos.length) {
    return { ...payload, photos };
  }
  return payload;
}

function createKolamProductVariantConfigPayload(form: KolamProductFormState) {
  return {
    tier1Name: form.variantConfigTier1Name.trim() || 'Varian',
    tier1Options: uniqueStrings(
      form.variants.map(variant => variant.tier1Value.trim()).filter(Boolean),
    ),
    tier2Name: form.variantConfigTier2Name.trim(),
    tier2Options: uniqueStrings(
      form.variants.map(variant => variant.tier2Value.trim()).filter(Boolean),
    ),
  };
}

function normalizeProductVendorPriceFormRows(value: unknown): KolamProductVendorPriceFormRow[] {
  const rows = Array.isArray(value) ? value : [];
  return rows.map((entry, index) => {
    const row = asRecord(entry);
    return {
      id: getString(row, '_id') || getString(row, 'id') || `vendor-${index + 1}`,
      vendorId: getObjectIdString(row.vendor),
      price: String(getNumber(row, 'price') ?? 0),
      shippingCost: String(getNumber(row, 'shippingCost') ?? 0),
      link: getString(row, 'link'),
    };
  });
}

function createKolamProductVendorPricePayload(rows: KolamProductVendorPriceFormRow[]) {
  return rows
    .map(row => {
      const vendor = row.vendorId.trim();
      if (!vendor) {
        return null;
      }

      return {
        vendor,
        price: toNonNegativeNumber(row.price),
        link: row.link.trim(),
      };
    })
    .filter(Boolean) as Array<{
    vendor: string;
    price: number;
    link: string;
  }>;
}

function normalizeProductComponentFormRows(value: unknown): KolamProductComponentFormRow[] {
  const rows = Array.isArray(value) ? value : [];
  return rows.map((entry, index) => {
    const row = asRecord(entry);
    return {
      id: getString(row, '_id') || getString(row, 'id') || `component-${index + 1}`,
      productId: getObjectIdString(row.product),
      quantity: String(getNumber(row, 'quantity') ?? 1),
    };
  });
}

function createKolamProductComponentPayload(rows: KolamProductComponentFormRow[]) {
  return rows
    .map(row => {
      const product = row.productId.trim();
      if (!product) {
        return null;
      }
      return {
        product,
        quantity: toNonNegativeNumber(row.quantity),
        totalWeight: null,
      };
    })
    .filter(Boolean) as Array<{ product: string; quantity: number; totalWeight: null }>;
}

function normalizeProductExternalLinkFormRows(value: unknown): KolamProductExternalLinkFormRow[] {
  const rows = Array.isArray(value) ? value : [];
  return rows.map(entry => {
    const row = asRecord(entry);
    return {
      name: normalizeProductLinkName(getString(row, 'name') || getString(row, 'label')),
      value: getString(row, 'value') || getString(row, 'url') || getString(row, 'href'),
    };
  });
}

function createKolamProductExternalLinkPayload(rows: KolamProductExternalLinkFormRow[]) {
  return rows
    .map(row => ({
      name: row.name,
      value: row.value.trim(),
    }))
    .filter(row => row.name && row.value);
}

function normalizeProductPackingLinkFormRows(value: unknown): KolamProductPackingLinkFormRow[] {
  const rows = Array.isArray(value) ? value : [];
  return rows.map((entry, index) => {
    const row = asRecord(entry);
    return {
      id: getString(row, '_id') || getString(row, 'id') || `packing-${index + 1}`,
      packingId: getObjectIdString(row.packing),
      variantId: getObjectIdString(row.variant),
      quantity: String(getNumber(row, 'quantity') ?? 1),
    };
  });
}

export function createKolamProductPackingLinkPayload(
  form: KolamProductFormState,
  savedProduct?: KolamProduct,
) {
  return form.packingLinks
    .map(row => {
      const packing = row.packingId.trim();
      if (!packing) {
        return null;
      }

      return {
        packing,
        variant: resolveProductPackingLinkVariantId(row.variantId, form, savedProduct),
        quantity: Math.max(0, toNonNegativeNumber(row.quantity)),
      };
    })
    .filter(Boolean) as Array<{ packing: string; variant: string | null; quantity: number }>;
}

function resolveProductPackingLinkVariantId(
  variantId: string,
  form: KolamProductFormState,
  savedProduct?: KolamProduct,
) {
  const cleanVariantId = variantId.trim();
  if (!cleanVariantId) {
    return null;
  }

  if (!cleanVariantId.startsWith('variant-draft-')) {
    return cleanVariantId;
  }

  const formIndex = form.variants.findIndex(variant => variant.id === cleanVariantId);
  return formIndex >= 0 ? savedProduct?.variants[formIndex]?.id ?? null : null;
}

function createKolamProductGrocerPricingTierFormRow(
  tier: { minQty: number; price: number; onlinePrice: number },
  index: number,
): KolamProductGrocerPricingTierFormRow {
  return {
    id: `tier-${index + 1}`,
    minQty: String(tier.minQty),
    price: String(tier.price),
    onlinePrice: String(tier.onlinePrice),
  };
}

function normalizeProductGrocerPricingTierFormRows(value: unknown) {
  return normalizeGrocerPricingTiers(value).map(createKolamProductGrocerPricingTierFormRow);
}

function createKolamProductGrocerPricingTierPayload(
  rows: KolamProductGrocerPricingTierFormRow[],
) {
  return rows
    .map(row => ({
      minQty: toNonNegativeNumber(row.minQty),
      price: toNonNegativeNumber(row.price),
      onlinePrice: toNonNegativeNumber(row.onlinePrice),
    }))
    .filter(row => row.minQty > 0 && (row.price > 0 || row.onlinePrice > 0));
}

function createKolamProductRootWeightPayload(
  form: KolamProductFormState,
  hasVariants: boolean,
) {
  const value = toNonNegativeNumber(form.weightValue);
  const unit = form.weightUnitId.trim();
  return !hasVariants && value > 0 && unit ? { weight: { value, unit } } : {};
}

function createKolamProductRootDimensionPayload(
  form: KolamProductFormState,
  hasVariants: boolean,
) {
  const length = toNonNegativeNumber(form.dimensionLength);
  const width = toNonNegativeNumber(form.dimensionWidth);
  const height = toNonNegativeNumber(form.dimensionHeight);
  const unit = form.dimensionUnitId.trim();
  return !hasVariants && length > 0 && width > 0 && height > 0 && unit
    ? { dimension: { length, width, height, unit } }
    : {};
}

function createKolamProductVariantWeightPayload(row: KolamProductVariantFormRow) {
  const value = toNonNegativeNumber(row.weightValue);
  const unit = row.weightUnitId.trim();
  return value > 0 && unit ? { weight: { value, unit } } : {};
}

function createKolamProductVariantDimensionPayload(row: KolamProductVariantFormRow) {
  const length = toNonNegativeNumber(row.dimensionLength);
  const width = toNonNegativeNumber(row.dimensionWidth);
  const height = toNonNegativeNumber(row.dimensionHeight);
  const unit = row.dimensionUnitId.trim();
  return length > 0 && width > 0 && height > 0 && unit
    ? { dimension: { length, width, height, unit } }
    : {};
}

function normalizeObjectIdList(value: unknown) {
  const rows = Array.isArray(value) ? value : [];
  return rows.map(getObjectIdString).filter(Boolean);
}

function normalizeProductFormType(value: string): KolamProductFormState['productType'] {
  return value === 'raw' || value === 'packing' ? value : 'product';
}

function normalizeProductCommissionType(value: string): KolamProductCommissionType {
  return value === 'fixed' ? 'fixed' : 'percentage';
}

function normalizeProductLinkName(value: string): KolamProductExternalLinkFormRow['name'] {
  switch (value.trim().toLowerCase()) {
    case 'shopee':
      return 'shopee';
    case 'tokopedia':
      return 'tokopedia';
    case 'website':
    case 'webstore':
      return 'website';
    case 'link_pos':
    case 'pos':
      return 'link_pos';
    case 'other_link':
    case 'other':
      return 'other_link';
    default:
      return '';
  }
}

function getObjectIdString(value: unknown): string {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  const record = asRecord(value);
  return (
    getString(record, '_id') ||
    getString(record, 'id') ||
    getString(record, '$oid')
  );
}

function toNonNegativeNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function createDraftId(prefix: string) {
  return `${prefix}-draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function slugifyProductName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeKolamProduct(payload: unknown): KolamProduct {
  const record = asRecord(payload);
  const id = getString(record, '_id') || getString(record, 'id');
  const name =
    getString(record, 'name') ||
    getString(record, 'title') ||
    getString(record, 'displayName') ||
    getString(record, 'sku') ||
    'Produk tanpa nama';
  const sku = getString(record, 'sku');
  const productCode =
    getString(record, 'productCode') ||
    getString(record, 'product_code') ||
    getString(record, 'code');
  const variants = normalizeVariants(record);
  const photoUris = normalizePhotoUris(record, variants);
  const tags = normalizeRefList(record.tags);
  const vendorPrices = Array.isArray(record.vendorPrices) ? record.vendorPrices : [];
  const customFields = normalizeCustomFields(record);
  const components = normalizeProductComponents(record.components);
  const packings = normalizePackings(record.packings);
  const assets = normalizeAssets(record.assets);
  const attachedItems = normalizeKolamProductAttachedItems(record.attachedItems);
  const warranty = normalizeWarranty(record);
  const seo = normalizeSeo(record);
  const logistics = normalizeLogistics(record);
  const minimumPriceToSales =
    getNumber(record, 'minimum_price_to_sales') ??
    getNumber(record, 'minimumPriceToSales') ??
    0;
  const minimumOrderQty =
    getNumber(record, 'minimumOrderQty') ??
    getNumber(record, 'minimum_order_qty') ??
    0;
  const commission = normalizeCommission(record);
  const thumbnailUri =
    getFirstFileUri(record, [
      'thumbnailUri',
      'thumbnailUrl',
      'thumbnail',
      'thumbnailImage',
      'thumbnailPath',
      'image',
      'imageUrl',
      'imagePath',
      'photo',
      'mainPhoto',
      'mainImage',
      'cover',
      'coverImage',
    ]) || photoUris[0] || '';
  const stock =
    getNumber(record, 'stock') ??
    getNumber(record, 'currentStock') ??
    getNumber(record, 'totalStock') ??
    sumNumbers(variants.map(variant => variant.stock));
  const priceToSell =
    getNumber(record, 'priceToSell') ??
    getNumber(record, 'price_to_sell') ??
    getNumber(record, 'sellingPrice') ??
    getNumber(record, 'price') ??
    firstPositiveNumber(variants.map(variant => variant.priceToSell));

  return {
    id,
    name,
    slug: getString(record, 'slug') || slugifyProductName(name || id),
    sku,
    productCode,
    type: getString(record, 'type') || 'product',
    status: normalizeStatus(record),
    labels: normalizeLabels(record),
    thumbnailUri,
    photoUris,
    categories: normalizeRefList(record.categories ?? record.category),
    brands: normalizeRefList(record.brands ?? record.brand),
    description: getFirstString(record, ['description', 'longDescription', 'content']),
    externalLinks: normalizeExternalLinks(record),
    attachedItems,
    customFields,
    components,
    packings,
    assets,
    warranty,
    seo,
    logistics,
    localeBlocks: normalizeLocaleBlocks(record, name),
    shortDescription: getFirstString(record, ['shortDescription', 'short_description', 'summary']),
    tags,
    locationLabel: normalizeLocationLabel(record.location),
    videos: normalizeFileUriList(record.videos ?? record.video),
    variants,
    variantCount:
      getNumber(record, 'variantCount') ??
      getNumber(record, 'variantsCount') ??
      variants.length,
    hasVariants:
      getBoolean(record, 'hasVariants') ??
      variants.length > 0,
    unitLabel: normalizeUnitLabel(record),
    price:
      getNumber(record, 'price') ??
      getNumber(record, 'basePrice') ??
      firstPositiveNumber(variants.map(variant => variant.price)),
    priceToSell,
    marketPrice:
      getNumber(record, 'marketPrice') ??
      getNumber(record, 'market_price') ??
      firstPositiveNumber(variants.map(variant => variant.marketPrice)),
    onlinePrice:
      getNumber(record, 'onlinePrice') ??
      getNumber(record, 'online_price') ??
      getNumber(record, 'marketplacePrice') ??
      firstPositiveNumber(variants.map(variant => variant.onlinePrice)),
    minimumPriceToSales,
    minimumOrderQty,
    vendorPriceRangeLabel: getVendorPriceRangeLabel(vendorPrices),
    grocerPricingTiers: normalizeGrocerPricingTiers(record.grocerPricingTiers),
    memberPoints: normalizeMemberPoints(record.memberPoints),
    commission,
    stock,
    lowStockThreshold:
      getNumber(record, 'lowStockThreshold') ??
      getNumber(record, 'low_stock_threshold') ??
      getNumber(record, 'minimumStock') ??
      0,
    sellable:
      getBoolean(record, 'sellable') ??
      getBoolean(record, 'isSellable') ??
      getBoolean(record, 'forSale') ??
      true,
    isPinned:
      getBoolean(record, 'isPinned') ??
      getBoolean(record, 'pinned') ??
      false,
    marketplaceSync: normalizeMarketplaceSync(record),
    createdAt:
      getString(record, 'createdAt') ||
      getString(record, 'created_at'),
    updatedAt:
      getString(record, 'updatedAt') ||
      getString(record, 'lastModifiedAt') ||
      getString(record, 'createdAt'),
    raw: payload,
  };
}

function normalizeVariants(record: Record<string, unknown>): KolamProductVariant[] {
  const variants = Array.isArray(record.variants) ? record.variants : [];

  return variants.map((entry, index) => {
    const variant = asRecord(entry);
    const tier1Value =
      getString(variant, 'tier1Value') ||
      getString(variant, 'option1') ||
      getString(variant, 'size') ||
      getString(asRecord(variant.tier1), 'value');
    const tier2Value =
      getString(variant, 'tier2Value') ||
      getString(variant, 'option2') ||
      getString(variant, 'color') ||
      getString(asRecord(variant.tier2), 'value');
    const sku = getString(variant, 'sku');
    const productCode =
      getString(variant, 'productCode') ||
      getString(variant, 'product_code') ||
      getString(variant, 'code');
    const label =
      getString(variant, 'name') ||
      [tier1Value, tier2Value].filter(Boolean).join(' / ') ||
      sku ||
      productCode ||
      `Varian ${index + 1}`;
    const weight = asRecord(variant.weight);
    const dimension = asRecord(variant.dimension);

    return {
      id:
        getString(variant, '_id') ||
        getString(variant, 'id') ||
        sku ||
        productCode ||
        `variant-${index + 1}`,
      label,
      sku,
      productCode,
      tier1Value,
      tier2Value,
      price:
        getNumber(variant, 'price') ??
        getNumber(variant, 'basePrice') ??
        0,
      priceToSell:
        getNumber(variant, 'priceToSell') ??
        getNumber(variant, 'price_to_sell') ??
        getNumber(variant, 'sellingPrice') ??
        getNumber(variant, 'price') ??
        0,
      marketPrice:
        getNumber(variant, 'marketPrice') ??
        getNumber(variant, 'market_price') ??
        0,
      onlinePrice:
        getNumber(variant, 'onlinePrice') ??
        getNumber(variant, 'online_price') ??
        getNumber(variant, 'marketplacePrice') ??
        0,
      minimumPriceToSales:
        getNumber(variant, 'minimum_price_to_sales') ??
        getNumber(variant, 'minimumPriceToSales') ??
        0,
      minimumOrderQty:
        getNumber(variant, 'minimumOrderQty') ??
        getNumber(variant, 'minimum_order_qty') ??
        1,
      stock:
        getNumber(variant, 'stock') ??
        getNumber(variant, 'currentStock') ??
        0,
      lowStockThreshold:
        getNumber(variant, 'lowStockThreshold') ??
        getNumber(variant, 'low_stock_threshold') ??
        0,
      vendorPrices: normalizeVendorPriceDisplayList(variant.vendorPrices),
      grocerPricingTiers: normalizeGrocerPricingTiers(variant.grocerPricingTiers),
      memberPoints: normalizeMemberPoints(variant.memberPoints),
      commissionEnabled: getBoolean(variant, 'commissionEnabled') ?? false,
      commissionType: getString(variant, 'commissionType') || 'percentage',
      commissionValue: getNumber(variant, 'commissionValue') ?? 0,
      weightValue:
        getNumber(weight, 'value') ??
        getNumber(variant, 'weightValue') ??
        getNumber(variant, 'weight_value') ??
        0,
      weightUnitId:
        getObjectIdString(weight.unit) ||
        getObjectIdString(variant.weightUnitId) ||
        getObjectIdString(variant.weightUnit),
      dimensionLength:
        getNumber(dimension, 'length') ??
        getNumber(variant, 'dimensionLength') ??
        getNumber(variant, 'dimension_length') ??
        0,
      dimensionWidth:
        getNumber(dimension, 'width') ??
        getNumber(variant, 'dimensionWidth') ??
        getNumber(variant, 'dimension_width') ??
        0,
      dimensionHeight:
        getNumber(dimension, 'height') ??
        getNumber(variant, 'dimensionHeight') ??
        getNumber(variant, 'dimension_height') ??
        0,
      dimensionUnitId:
        getObjectIdString(dimension.unit) ||
        getObjectIdString(variant.dimensionUnitId) ||
        getObjectIdString(variant.dimensionUnit),
      photoUris: normalizeFileUriList(
        variant.photos ?? variant.images ?? variant.media ?? variant.photo,
      ),
      videoUris: normalizeFileUriList(variant.videos ?? variant.video),
      componentOverrides: normalizeProductComponents(variant.componentOverrides),
      customFields: normalizeCustomFieldValueList(variant.customFieldValues ?? variant.customFields),
      externalLinks: normalizeExternalLinks(variant),
      raw: entry,
    };
  });
}

function normalizePhotoUris(
  record: Record<string, unknown>,
  variants: KolamProductVariant[],
) {
  const direct = normalizeFileUriList(
    record.photos ?? record.images ?? record.media ?? record.gallery,
  );
  const variantPhotos = variants.flatMap(variant => variant.photoUris);

  return uniqueStrings([...direct, ...variantPhotos]);
}

function normalizeRefList(value: unknown): KolamProductRef[] {
  const list = Array.isArray(value) ? value : value ? [value] : [];

  return list
    .map(entry => {
      const record = asRecord(entry);
      const fallback = typeof entry === 'string' ? entry.trim() : '';
      const name =
        getString(record, 'name') ||
        getString(record, 'title') ||
        getString(record, 'label') ||
        fallback;
      const id = getString(record, '_id') || getString(record, 'id') || fallback;

      if (!id && !name) {
        return null;
      }

      return {
        id,
        logoUri:
          normalizeFileUri(
            getString(record, 'logo') ||
              getString(record, 'logoUrl') ||
              getString(record, 'icon') ||
              getString(record, 'image'),
          ) ||
          normalizeFileUriList(record.photos ?? record.images)[0] ||
          '',
        name: name || id,
        slug: getString(record, 'slug') || slugifyProductName(name || id),
        raw: entry,
      };
    })
    .filter(Boolean) as KolamProductRef[];
}

function normalizeLogistics(record: Record<string, unknown>): KolamProductLogistics {
  const weight = getNumberFromPath(record.weight, 'value') ?? getNumber(record, 'weight') ?? getNumber(record, 'packageWeight') ?? 0;
  const weightUnit =
    getStringFromPath(record.weight, 'unit.initial') ||
    getStringFromPath(record.weight, 'unit.name') ||
    getString(asRecord(record.weight), 'unit') ||
    'g';
  const length =
    getNumberFromPath(record.dimension, 'length') ??
    getNumber(record, 'length') ??
    getNumber(record, 'packageLength') ??
    0;
  const width =
    getNumberFromPath(record.dimension, 'width') ??
    getNumber(record, 'width') ??
    getNumber(record, 'packageWidth') ??
    0;
  const height =
    getNumberFromPath(record.dimension, 'height') ??
    getNumber(record, 'height') ??
    getNumber(record, 'packageHeight') ??
    0;
  const dimensionUnit =
    getStringFromPath(record.dimension, 'unit.initial') ||
    getStringFromPath(record.dimension, 'unit.name') ||
    getString(asRecord(record.dimension), 'unit') ||
    'cm';

  return {
    dimensionLabel:
      length || width || height
        ? `${length} x ${width} x ${height} ${dimensionUnit}`
        : '-',
    height,
    length,
    shippingMethods: normalizeShippingMethods(record.availableShippingMethods),
    volume: getNumber(record, 'volume') ?? 0,
    weight,
    weightLabel: weight ? `${weight} ${weightUnit}` : '-',
    width,
  };
}
function normalizeExternalLinks(record: Record<string, unknown>): KolamProductExternalLink[] {
  const links = Array.isArray(record.link)
    ? record.link
    : Array.isArray(record.links)
    ? record.links
    : Array.isArray(record.externalLinks)
    ? record.externalLinks
    : [];
  const directLinks = [
    ['Website', getString(record, 'website') || getString(record, 'url')],
    ['Tokopedia', getString(record, 'tokopedia') || getString(record, 'tokopediaUrl')],
    ['Shopee', getString(record, 'shopee') || getString(record, 'shopeeUrl')],
  ] as const;

  return [
    ...links.map(entry => {
      const link = asRecord(entry);
      return {
        label:
          getString(link, 'label') ||
          getString(link, 'name') ||
          getString(link, 'type') ||
          'Tautan',
        url: getString(link, 'url') || getString(link, 'href') || getString(link, 'value'),
      };
    }),
    ...directLinks.map(([label, url]) => ({ label, url })),
  ].filter(link => link.url);
}

function normalizeLocaleBlocks(
  record: Record<string, unknown>,
  fallbackName: string,
): KolamProductLocaleBlock[] {
  const translations = asRecord(record.translations);
  const blocks: KolamProductLocaleBlock[] = [
    {
      description: getFirstString(record, ['description', 'longDescription', 'content']),
      locale: KOLAM_CATALOG_DEFAULT_LOCALE,
      localeLabel: KOLAM_CATALOG_LOCALE_LABELS[KOLAM_CATALOG_DEFAULT_LOCALE],
      name: fallbackName,
      shortDescription: getFirstString(record, ['shortDescription', 'short_description', 'summary']),
    },
  ];

  KOLAM_CATALOG_TRANSLATION_LOCALES.forEach(locale => {
    const block = asRecord(translations[locale]);
    const name = getString(block, 'name');
    const shortDescription = getString(block, 'shortDescription');
    const description = getString(block, 'description');
    if (!name && !shortDescription && !description) {
      return;
    }

    blocks.push({
      description,
      locale,
      localeLabel: KOLAM_CATALOG_LOCALE_LABELS[locale],
      name,
      shortDescription,
    });
  });

  return blocks;
}

function normalizeCustomFields(record: Record<string, unknown>) {
  return normalizeCustomFieldValueList(record.customFieldValues ?? record.customFields);
}

function normalizeCustomFieldValueList(value: unknown): KolamProductCustomFieldDisplay[] {
  const list = Array.isArray(value) ? value : [];
  return list
    .map((entry, index) => {
      const fieldValue = asRecord(entry);
      const field = asRecord(fieldValue.field);
      const label =
        getString(field, 'fieldLabel') ||
        getString(fieldValue, 'fieldLabel') ||
        getString(fieldValue, 'fieldKey') ||
        `Field ${index + 1}`;
      const type =
        getString(field, 'fieldType') ||
        getString(fieldValue, 'fieldType') ||
        (fieldValue.minValue != null || fieldValue.maxValue != null ? 'range' : 'string');
      const displayValue = formatCustomFieldValue(fieldValue, type);

      if (!displayValue) {
        return null;
      }

      return {
        id:
          getString(field, '_id') ||
          getString(field, 'id') ||
          getString(fieldValue, 'fieldKey') ||
          `${label}-${index}`,
        iconUri: normalizeFileUri(getString(field, 'icon')),
        label,
        meta: getString(field, 'description'),
        required: getBoolean(field, 'required') ?? false,
        type,
        value: displayValue,
      };
    })
    .filter(Boolean) as KolamProductCustomFieldDisplay[];
}

function normalizeProductComponents(value: unknown): KolamProductComponentLine[] {
  const list = Array.isArray(value) ? value : [];
  return list.map((entry, index) => {
    const line = asRecord(entry);
    const product = asRecord(line.product);
    const quantity = getNumber(line, 'quantity') ?? 0;
    const price = getNumber(product, 'price') ?? getNumber(line, 'price') ?? 0;
    const brands = normalizeRefList(product.brand ?? product.brands);
    const thumbnailUri =
      getFirstFileUri(product, [
        'thumbnailUri',
        'thumbnailUrl',
        'thumbnail',
        'thumbnailImage',
        'thumbnailPath',
        'image',
        'imageUrl',
        'imagePath',
        'photo',
        'mainPhoto',
        'mainImage',
        'cover',
        'coverImage',
      ]) ||
      getFirstFileUri(line, [
        'thumbnailUri',
        'thumbnailUrl',
        'thumbnail',
        'thumbnailImage',
        'thumbnailPath',
        'image',
        'imageUrl',
        'imagePath',
        'photo',
        'mainPhoto',
        'mainImage',
        'cover',
        'coverImage',
      ]) ||
      normalizeFileUriList(product.photos ?? product.images)[0] ||
      normalizeFileUriList(line.photos ?? line.images)[0] ||
      '';

    return {
      id:
        getString(line, '_id') ||
        getString(line, 'id') ||
        getString(product, '_id') ||
        `component-${index + 1}`,
      brandLabel: brands.map(brand => brand.name).join(', '),
      code: getProductComponentCode(product, line),
      name:
        getString(product, 'name') ||
        (typeof line.product === 'string' ? line.product : '') ||
        `Komponen ${index + 1}`,
      price,
      quantity,
      raw: entry,
      stock: getNumber(product, 'stock') ?? 0,
      thumbnailUri,
      totalPrice: price * quantity,
      unitLabel: normalizeUnitLabel(product),
    };
  });
}

function getProductComponentCode(
  product: Record<string, unknown>,
  line: Record<string, unknown>,
) {
  const productCode =
    getNonPlaceholderString(product, 'productCode') ||
    getNonPlaceholderString(product, 'product_code') ||
    getNonPlaceholderString(product, 'code') ||
    getNonPlaceholderString(line, 'productCode') ||
    getNonPlaceholderString(line, 'product_code') ||
    getNonPlaceholderString(line, 'code');
  const sku = getString(product, 'sku') || getString(line, 'sku');

  if (sku === '-') {
    return productCode;
  }

  return productCode;
}

function normalizePackings(value: unknown): KolamProductPackingLine[] {
  const list = Array.isArray(value) ? value : [];
  return list.map((entry, index) => {
    const row = asRecord(entry);
    const packing = asRecord(row.packing);
    const variant = asRecord(row.variant);
    const photos = normalizeFileUriList(packing.photos ?? packing.images);

    return {
      id:
        getString(row, '_id') ||
        getString(row, 'id') ||
        getString(packing, '_id') ||
        `packing-${index + 1}`,
      name:
        getString(packing, 'name') ||
        getString(packing, 'sku') ||
        (typeof row.packing === 'string' ? row.packing : '') ||
        `Packing ${index + 1}`,
      quantity: getNumber(row, 'quantity') ?? 1,
      raw: entry,
      sku: getString(packing, 'sku'),
      thumbnailUri: photos[0] ?? '',
      variantLabel:
        getString(variant, 'label') ||
        [getString(variant, 'tier1Value'), getString(variant, 'tier2Value')]
          .filter(Boolean)
          .join(' / ') ||
        (typeof row.variant === 'string' ? row.variant : ''),
    };
  });
}

function normalizeAssets(value: unknown): KolamProductAsset[] {
  const list = Array.isArray(value) ? value : [];
  return list.map((entry, index) => {
    const asset = asRecord(entry);
    return {
      id: getString(asset, '_id') || getString(asset, 'id') || `asset-${index + 1}`,
      filename: getString(asset, 'originalFilename') || getString(asset, 'filename'),
      fileSize: getNumber(asset, 'fileSize') ?? getNumber(asset, 'size') ?? 0,
      mimeType: getString(asset, 'mimeType') || getString(asset, 'type'),
      raw: entry,
      title: getString(asset, 'title') || getString(asset, 'name') || `Aset ${index + 1}`,
    };
  });
}

function normalizeKolamProductAttachedItems(value: unknown): KolamProductAttachedItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      const record = asRecord(item);
      const itemType = getString(record, 'itemType') || 'product';
      const target = itemType === 'species' ? record.species : record.product;
      const targetRecord = asRecord(target);
      const fallbackName = itemType === 'species' ? 'Spesies' : 'Produk';
      return {
        id: getString(record, '_id') || getString(record, 'id') || `${itemType}-${index}`,
        itemType,
        note: getString(record, 'note'),
        targetId: getObjectIdString(target),
        targetName:
          getString(targetRecord, 'name') ||
          getString(targetRecord, 'scientificName') ||
          getString(targetRecord, 'commonName') ||
          getString(record, 'name') ||
          fallbackName,
        targetSku: getString(targetRecord, 'sku') || getString(record, 'sku'),
        type: getString(record, 'type'),
        typeLabel: getAttachedItemTypeLabel(getString(record, 'type')),
      };
    })
    .filter(item => item.targetName);
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

function normalizeWarranty(record: Record<string, unknown>): KolamProductWarranty {
  const publicWarranty = asRecord(record.warranty);
  const warranty = asRecord(record.productWarranty);
  const mode = getString(publicWarranty, 'mode') || getString(warranty, 'mode') || 'none';
  const vendor = asRecord(warranty.warrantyVendor);
  const terms = asRecord(warranty.warrantyTermsTemplate);
  return {
    days:
      getNumber(publicWarranty, 'warrantyDays') ??
      getNumber(warranty, 'warrantyDays') ??
      0,
    label: getWarrantyModeLabel(mode),
    mode,
    termsExcerpt: getString(publicWarranty, 'termsExcerpt'),
    termsTitle:
      getString(publicWarranty, 'termsTitle') ||
      getString(terms, 'title'),
    vendorName:
      getString(publicWarranty, 'vendorName') ||
      getString(vendor, 'name'),
  };
}

function normalizeSeo(record: Record<string, unknown>): KolamProductSeo {
  const seo = asRecord(record.seo);
  const faq = Array.isArray(seo.faq) ? seo.faq : [];
  return {
    faqCount: faq.length,
    keywords: Array.isArray(seo.keywords)
      ? seo.keywords.map(value => String(value).trim()).filter(Boolean)
      : [],
    lastAuditedAt: getString(seo, 'lastAuditedAt'),
    lastSeoScore: getNumber(seo, 'lastSeoScore') ?? 0,
    metaDescription: getString(seo, 'metaDescription'),
    metaTitle: getString(seo, 'metaTitle'),
  };
}

function normalizeShippingMethods(value: unknown): KolamProductShippingMethod[] {
  const list = Array.isArray(value) ? value : [];
  return list.map((entry, index) => {
    // List payloads often keep bare ObjectId strings (FE create does the same).
    const stringId = typeof entry === 'string' ? entry.trim() : '';
    const method = asRecord(entry);
    const pricing = asRecord(method.pricingModel);
    const estimatedDays = asRecord(method.estimatedDays);
    const specialConditions = asRecord(method.specialConditions);
    const restrictedRegions = Array.isArray(specialConditions.restrictedRegions)
      ? (specialConditions.restrictedRegions as unknown[])
      : [];
    const displayName =
      getString(method, 'displayName') ||
      getString(method, 'name') ||
      (stringId ? stringId : `Kurir ${index + 1}`);
    const pricingType = getString(pricing, 'type');
    const pricingPrice = Math.max(0, getNumber(pricing, 'price') ?? 0);
    const estimatedMinDays = Math.max(0, getNumber(estimatedDays, 'min') ?? 0);
    const estimatedMaxDays = Math.max(0, getNumber(estimatedDays, 'max') ?? 0);

    return {
      category: getString(method, 'category'),
      coverageLabel: restrictedRegions.length
        ? `Restricted: ${restrictedRegions.slice(0, 3).join(', ')}`
        : 'Coverage: semua region',
      etaLabel:
        getNumber(estimatedDays, 'min') === getNumber(estimatedDays, 'max')
          ? `${getNumber(estimatedDays, 'min') ?? '-'} hari`
          : `${getNumber(estimatedDays, 'min') ?? '-'}-${getNumber(estimatedDays, 'max') ?? '-'} hari`,
      displayName,
      id:
        stringId ||
        getString(method, '_id') ||
        getString(method, 'id') ||
        `shipping-${index + 1}`,
      label: displayName,
      logoUri: normalizeFileUri(getString(method, 'icon') || getString(method, 'logo')) || null,
      pricingType,
      pricingPrice,
      priceLabel: formatShippingPrice(pricing),
      estimatedMinDays,
      estimatedMaxDays,
      restrictedRegions: restrictedRegions.map(String).filter(Boolean),
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
      minimumOrderAmount: Math.max(0, getNumber(specialConditions, 'minimumOrderAmount') ?? 0),
      raw: entry,
    };
  });
}

function normalizeGrocerPricingTiers(value: unknown) {
  const list = Array.isArray(value) ? value : [];
  return list
    .map(entry => {
      const tier = asRecord(entry);
      return {
        minQty: getNumber(tier, 'minQty') ?? 0,
        onlinePrice: getNumber(tier, 'onlinePrice') ?? 0,
        price: getNumber(tier, 'price') ?? 0,
      };
    })
    .filter(tier => tier.minQty > 0);
}

function normalizeVendorPriceDisplayList(value: unknown): KolamProductVendorPriceDisplay[] {
  const list = Array.isArray(value) ? value : [];
  return list.map((entry, index) => {
    const price = asRecord(entry);
    const vendor = asRecord(price.vendor);
    const priceValue = getNumber(price, 'price') ?? 0;
    const shippingCost = getNumber(price, 'shippingCost') ?? 0;
    const totalCost = getNumber(price, 'totalCost') ?? priceValue + shippingCost;

    return {
      id:
        getString(price, '_id') ||
        getString(price, 'id') ||
        `${getString(vendor, '_id') || getString(vendor, 'id') || 'vendor'}-${index + 1}`,
      link: getString(price, 'link'),
      price: priceValue,
      priceHistory: normalizeVendorPriceHistory(price.priceHistory),
      shippingCost,
      totalCost,
      vendorId:
        getString(price, 'vendorId') ||
        getString(vendor, '_id') ||
        getString(vendor, 'id'),
      vendorName:
        getString(price, 'vendorName') ||
        getString(vendor, 'name') ||
        (typeof price.vendor === 'string' ? price.vendor : '-'),
      vendorStatus: getString(vendor, 'status'),
      raw: entry,
    };
  });
}

function normalizeVendorPriceHistory(value: unknown): Array<{ date?: string; poId?: string; poRef?: string }> {
  const list = Array.isArray(value) ? value : [];
  return list.map(entry => {
    const history = asRecord(entry);
    return {
      date: getString(history, 'date'),
      poId: getObjectIdString(history.poId),
      poRef: getString(history, 'poRef'),
    };
  });
}

function normalizeMemberPoints(value: unknown) {
  const record = asRecord(value);
  return {
    enabled: getBoolean(record, 'enabled') ?? false,
    points: getNumber(record, 'points') ?? 0,
  };
}

function normalizeCommission(record: Record<string, unknown>) {
  const enabled = getBoolean(record, 'commissionEnabled') ?? false;
  const type = getString(record, 'commissionType') || 'percentage';
  const value = getNumber(record, 'commissionValue') ?? 0;
  return {
    enabled,
    label: enabled
      ? type === 'percentage'
        ? `${value}%`
        : formatCurrencyPlain(value)
      : 'Nonaktif',
    type,
    value,
  };
}

function normalizeLocationLabel(value: unknown) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  const record = asRecord(value);
  const parent = asRecord(record.parent);
  const grandParent = asRecord(parent.parent);
  return [
    getString(grandParent, 'name'),
    getString(parent, 'name'),
    getString(record, 'name'),
  ]
    .filter(Boolean)
    .join(' > ');
}
function normalizeLabels(record: Record<string, unknown>) {
  const labels = Array.isArray(record.labels)
    ? record.labels
    : Array.isArray(record.tags)
    ? record.tags
    : [];

  return labels
    .map(entry => {
      if (typeof entry === 'string') {
        return entry.trim();
      }

      const label = asRecord(entry);
      return getString(label, 'name') || getString(label, 'label');
    })
    .filter(Boolean);
}

function formatCustomFieldValue(record: Record<string, unknown>, type: string) {
  if (type === 'range') {
    const min = getNumber(record, 'minValue');
    const max = getNumber(record, 'maxValue');
    const unit = getStringFromPath(record.unit, 'initial') || getStringFromPath(record.unit, 'name') || getString(record, 'unit');
    if (min == null && max == null) {
      return '';
    }
    const range = [min ?? '-', max ?? '-'].join(' - ');
    return unit ? `${range} ${unit}` : range;
  }

  if (type === 'boolean') {
    const value = getBoolean(record, 'value');
    return value == null ? '' : value ? 'Ya' : 'Tidak';
  }

  const value = record.value;
  if (value == null) {
    return '';
  }

  const text = Array.isArray(value) ? value.join(', ') : String(value);
  const unit = getStringFromPath(record.unit, 'initial') || getStringFromPath(record.unit, 'name') || getString(record, 'unit');
  return unit && text ? `${text} ${unit}` : text;
}

function getVendorPriceRangeLabel(value: unknown) {
  const list = Array.isArray(value) ? value : [];
  const prices = list
    .map(entry => {
      const record = asRecord(entry);
      return getNumber(record, 'totalCost') ?? getNumber(record, 'price') ?? 0;
    })
    .filter(price => price > 0);

  if (!prices.length) {
    return 'Belum ada harga vendor';
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max
    ? formatCurrencyPlain(min)
    : `${formatCurrencyPlain(min)} - ${formatCurrencyPlain(max)}`;
}

function getWarrantyModeLabel(mode: string) {
  switch (mode) {
    case 'official_distributor':
      return 'Distributor resmi';
    case 'da':
      return 'Garansi DA';
    case 'none':
    default:
      return 'Tanpa garansi';
  }
}

function formatShippingPrice(pricing: Record<string, unknown>) {
  const price = getNumber(pricing, 'price') ?? 0;
  const type = getString(pricing, 'type');
  if (!price) {
    return '-';
  }

  switch (type) {
    case 'per_kg':
      return `${formatCurrencyPlain(price)}/kg`;
    case 'per_km':
      return `${formatCurrencyPlain(price)}/km`;
    case 'per_cubic_meter':
      return `${formatCurrencyPlain(price)}/m3`;
    case 'fixed':
    default:
      return formatCurrencyPlain(price);
  }
}

function formatCurrencyPlain(value: number) {
  if (!value) {
    return '-';
  }

  return `Rp ${value.toLocaleString('id-ID')}`;
}

function normalizeStatus(record: Record<string, unknown>) {
  if (getBoolean(record, 'archived')) {
    return 'Diarsipkan';
  }

  if (getBoolean(record, 'active') === false || getBoolean(record, 'isActive') === false) {
    return 'Nonaktif';
  }

  return getString(record, 'status') || 'Aktif';
}

function normalizeUnitLabel(record: Record<string, unknown>) {
  const unit = asRecord(record.unit ?? record.units ?? record.satuan);

  return (
    getString(record, 'unitLabel') ||
    getString(unit, 'name') ||
    getString(unit, 'label') ||
    getString(unit, 'initial') ||
    getString(unit, 'symbol') ||
    getString(unit, 'code')
  );
}

function normalizePagination(
  value: unknown,
  fallbackTotal: number,
): KolamProductPagination {
  const record = asRecord(value);
  const page = getNumber(record, 'page') ?? getNumber(record, 'currentPage') ?? 1;
  const limit = getNumber(record, 'limit') ?? getNumber(record, 'perPage') ?? fallbackTotal;
  const total = getNumber(record, 'total') ?? getNumber(record, 'totalItems') ?? fallbackTotal;
  const totalPages =
    getNumber(record, 'totalPages') ??
    getNumber(record, 'pages') ??
    (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1);

  return { page, limit, total, totalPages };
}

function normalizeMarketplaceSync(record: Record<string, unknown>): KolamProductMarketplaceSync {
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
): KolamProductMarketplaceSyncPlatform[] {
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
    .filter(Boolean) as KolamProductMarketplaceSyncPlatform[];
}

function normalizeMarketplaceSyncStatus(value: string): KolamProductSyncStatus {
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

function getMarketplaceSyncStatusLabel(status: KolamProductSyncStatus) {
  switch (status) {
    case 'pending':
      return 'Menunggu';
    case 'synced':
    case 'skipped':
      return 'Sinkron';
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

function getMarketplaceAggregateLabel(platforms: KolamProductMarketplaceSyncPlatform[]) {
  if (!platforms.length) {
    return '';
  }

  if (platforms.some(platform => platform.status === 'failed')) {
    return 'Ada sinkron gagal';
  }

  if (platforms.some(platform => platform.status === 'partial')) {
    return 'Sinkron sebagian';
  }

  if (platforms.every(platform => ['synced', 'skipped'].includes(platform.status))) {
    return 'Sinkron';
  }

  return platforms.map(platform => platform.statusLabel).join(', ');
}

function getLatestMarketplaceSyncDate(platforms: KolamProductMarketplaceSyncPlatform[]) {
  return platforms
    .map(platform => platform.lastSyncedAt)
    .filter(Boolean)
    .sort()
    .at(-1);
}

function getFirstFileUri(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const direct = normalizeFileUri(record[key]);
    if (direct) {
      return direct;
    }
  }

  return '';
}

function normalizeFileUriList(value: unknown): string[] {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return uniqueStrings(list.map(normalizeFileUri).filter(Boolean));
}

function normalizeFileUri(value: unknown): string {
  const raw =
    typeof value === 'string'
      ? value.trim()
      : getFirstString(asRecord(value), [
          'url',
          'uri',
          'path',
          'src',
          'fileUrl',
          'publicUrl',
          'secureUrl',
          'location',
        ]);

  return resolveKolamFileUri(raw);
}

function resolveKolamFileUri(uri: string): string {
  if (!uri) {
    return '';
  }

  if (/^(https?:|file:|data:|blob:|ms-appdata:)/i.test(uri)) {
    return uri;
  }

  return getKolamFileUrl(uri) ?? uri;
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

function getFirstString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = getString(record, key);
    if (value) {
      return value;
    }
  }

  return '';
}
function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

function getNonPlaceholderString(record: Record<string, unknown>, key: string) {
  const value = getString(record, key);
  return value && value !== '-' ? value : '';
}

function getNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getStringFromPath(value: unknown, path: string) {
  const result = readPath(value, path);
  return typeof result === 'string' ? result.trim() : '';
}

function getNumberFromPath(value: unknown, path: string) {
  const result = readPath(value, path);
  if (typeof result === 'number' && Number.isFinite(result)) {
    return result;
  }

  if (typeof result === 'string') {
    const parsed = Number(result.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function readPath(value: unknown, path: string) {
  return path.split('.').reduce<unknown>((current, key) => {
    const record = asRecord(current);
    return record[key];
  }, value);
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

  return null;
}

function firstPositiveNumber(values: number[]) {
  return values.find(value => value > 0) ?? 0;
}

function sumNumbers(values: number[]) {
  return values.reduce((total, value) => total + (Number.isFinite(value) ? value : 0), 0);
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map(value => value.trim()).filter(Boolean)));
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










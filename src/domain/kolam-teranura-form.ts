import {
  normalizeKolamTranslationsForSave,
  normalizeKolamTranslationsFromRecord,
  type KolamCatalogTranslationsMap,
} from './kolam-catalog-locale';
import type { KolamProductLocaleFields } from './kolam-product';
import type { KolamTeranura } from './kolam-teranura';

export type KolamTeranuraLinkName =
  | 'shopee'
  | 'tokopedia'
  | 'website'
  | 'link_pos'
  | 'other_link'
  | '';

export type KolamTeranuraCommissionType = 'percentage' | 'fixed';

export interface KolamTeranuraExternalLinkFormRow {
  name: KolamTeranuraLinkName;
  value: string;
}

export interface KolamTeranuraVendorPriceFormRow {
  id: string;
  vendorId: string;
  price: string;
  shippingCost: string;
  link: string;
}

export interface KolamTeranuraComponentFormRow {
  id: string;
  productId: string;
  quantity: string;
}

export interface KolamTeranuraGrocerPricingTierFormRow {
  id: string;
  minQty: string;
  price: string;
  onlinePrice: string;
}

export interface KolamTeranuraPackingLinkFormRow {
  id: string;
  packingId: string;
  variantId: string;
  quantity: string;
}

export interface KolamTeranuraVariantFormRow {
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
  vendorPrices: KolamTeranuraVendorPriceFormRow[];
  componentOverrides: KolamTeranuraComponentFormRow[];
  externalLinks: KolamTeranuraExternalLinkFormRow[];
  grocerPricingTiers: KolamTeranuraGrocerPricingTierFormRow[];
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

export interface KolamTeranuraFormState {
  id: string;
  name: string;
  sku: string;
  productCode: string;
  description: string;
  shortDescription: string;
  brandIds: string[];
  categoryIds: string[];
  tagIds: string[];
  unitId: string;
  sellable: boolean;
  lowStockThreshold: string;
  locationId: string;
  availableShippingMethodIds: string[];
  commissionEnabled: boolean;
  commissionType: KolamTeranuraCommissionType;
  commissionValue: string;
  price: string;
  priceToSell: string;
  marketPrice: string;
  onlinePrice: string;
  minimumPriceToSales: string;
  minimumOrderQty: string;
  grocerPricingTiers: KolamTeranuraGrocerPricingTierFormRow[];
  weightValue: string;
  weightUnitId: string;
  dimensionLength: string;
  dimensionWidth: string;
  dimensionHeight: string;
  dimensionUnitId: string;
  memberPointsEnabled: boolean;
  memberPoints: string;
  seoMetaTitle: string;
  seoMetaDescription: string;
  seoKeywords: string;
  customFieldValues: unknown[];
  componentRows: KolamTeranuraComponentFormRow[];
  vendorPrices: KolamTeranuraVendorPriceFormRow[];
  externalLinks: KolamTeranuraExternalLinkFormRow[];
  packingLinks: KolamTeranuraPackingLinkFormRow[];
  translations: KolamCatalogTranslationsMap<KolamProductLocaleFields>;
  hasVariants: boolean;
  variantConfigTier1Name: string;
  variantConfigTier2Name: string;
  variantConfigTier1Values: string[];
  variantConfigTier2Values: string[];
  variantConfigTier2Enabled: boolean;
  variants: KolamTeranuraVariantFormRow[];
  photoLocalUri: string;
  videoLocalUri: string;
  thumbnailLocalUri: string;
  selectedVariantId: string;
  variantPhotoLocalUri: string;
}

export function createEmptyKolamTeranuraFormState(): KolamTeranuraFormState {
  return {
    id: '',
    name: '',
    sku: '',
    productCode: '',
    description: '',
    shortDescription: '',
    brandIds: [],
    categoryIds: [],
    tagIds: [],
    unitId: '',
    sellable: true,
    lowStockThreshold: '0',
    locationId: '',
    availableShippingMethodIds: [],
    commissionEnabled: false,
    commissionType: 'percentage',
    commissionValue: '0',
    price: '0',
    priceToSell: '0',
    marketPrice: '0',
    onlinePrice: '0',
    minimumPriceToSales: '0',
    minimumOrderQty: '1',
    grocerPricingTiers: [],
    weightValue: '',
    weightUnitId: '',
    dimensionLength: '',
    dimensionWidth: '',
    dimensionHeight: '',
    dimensionUnitId: '',
    memberPointsEnabled: false,
    memberPoints: '0',
    seoMetaTitle: '',
    seoMetaDescription: '',
    seoKeywords: '',
    customFieldValues: [],
    componentRows: [],
    vendorPrices: [],
    externalLinks: [],
    packingLinks: [],
    translations: {},
    hasVariants: false,
    variantConfigTier1Name: 'Varian',
    variantConfigTier2Name: '',
    variantConfigTier1Values: [],
    variantConfigTier2Values: [],
    variantConfigTier2Enabled: false,
    variants: [],
    photoLocalUri: '',
    videoLocalUri: '',
    thumbnailLocalUri: '',
    selectedVariantId: '',
    variantPhotoLocalUri: '',
  };
}

export function createKolamTeranuraFormState(
  item: KolamTeranura,
): KolamTeranuraFormState {
  const raw = asRecord(item.raw);
  const weight = asRecord(raw.weight);
  const dimension = asRecord(raw.dimension ?? raw.dimensions);
  const memberPoints = asRecord(raw.memberPoints);
  const variantConfig = asRecord(raw.variantConfig);
  const seo = asRecord(raw.seo);
  const variants = Array.isArray(raw.variants) ? raw.variants : [];
  const hasVariants = variants.length > 0 || getBoolean(raw, 'hasVariants');
  const variantFormRows = variants.map(createVariantFormRow);
  const configTier1Values = getStringArray(variantConfig.tier1Values);
  const configTier2Values = getStringArray(variantConfig.tier2Values);

  return {
    id: item.id,
    name: item.name,
    sku: item.sku,
    productCode: item.productCode,
    description: item.description,
    shortDescription: item.shortDescription,
    brandIds: normalizeIdList(raw.brand ?? raw.brands, item.brand?.id),
    categoryIds: normalizeIdList(
      raw.category ?? raw.categories,
      item.categories.map(category => category.id),
    ),
    tagIds: normalizeIdList(raw.tags),
    unitId: getObjectIdString(raw.unit),
    sellable: item.sellable,
    lowStockThreshold: String(item.lowStockThreshold || 0),
    locationId: getObjectIdString(raw.location),
    availableShippingMethodIds: normalizeIdList(
      raw.availableShippingMethods ?? raw.shippingMethods,
    ),
    commissionEnabled: item.commissionEnabled,
    commissionType:
      item.commissionType === 'fixed' ? 'fixed' : 'percentage',
    commissionValue: String(item.commissionValue || 0),
    price: String(item.price || 0),
    priceToSell: String(item.priceToSell || 0),
    marketPrice: String(item.marketPrice || 0),
    onlinePrice: String(item.onlinePrice || 0),
    minimumPriceToSales: String(item.minimumPriceToSales || 0),
    minimumOrderQty: String(item.minimumOrderQty || 1),
    grocerPricingTiers: normalizeGrocerPricingTierFormRows(
      raw.grocerPricingTiers,
    ),
    weightValue:
      getNumber(weight, 'value') > 0
        ? String(getNumber(weight, 'value'))
        : item.weight > 0
        ? String(item.weight)
        : '',
    weightUnitId: getObjectIdString(weight.unit),
    dimensionLength:
      getNumber(dimension, 'length') > 0
        ? String(getNumber(dimension, 'length'))
        : item.length > 0
        ? String(item.length)
        : '',
    dimensionWidth:
      getNumber(dimension, 'width') > 0
        ? String(getNumber(dimension, 'width'))
        : item.width > 0
        ? String(item.width)
        : '',
    dimensionHeight:
      getNumber(dimension, 'height') > 0
        ? String(getNumber(dimension, 'height'))
        : item.height > 0
        ? String(item.height)
        : '',
    dimensionUnitId: getObjectIdString(dimension.unit),
    memberPointsEnabled:
      getBoolean(memberPoints, 'enabled') || item.memberPointsEnabled,
    memberPoints: String(
      getNumber(memberPoints, 'points') || item.memberPoints || 0,
    ),
    seoMetaTitle: getString(seo, 'metaTitle') || item.seo.metaTitle,
    seoMetaDescription:
      getString(seo, 'metaDescription') || item.seo.metaDescription,
    seoKeywords: (
      Array.isArray(seo.keywords) ? seo.keywords : item.seo.keywords
    )
      .map(value => String(value).trim())
      .filter(Boolean)
      .join(', '),
    customFieldValues: Array.isArray(raw.customFieldValues)
      ? raw.customFieldValues
      : [],
    componentRows: normalizeComponentRows(raw.components),
    vendorPrices: normalizeVendorRows(raw.vendorPrices),
    externalLinks: normalizeLinkRows(raw.link ?? raw.links ?? raw.externalLinks),
    packingLinks: normalizePackingLinkFormRows(raw.packings ?? raw.packingLinks),
    translations: normalizeKolamTranslationsFromRecord<KolamProductLocaleFields>(
      raw.translations,
    ),
    hasVariants,
    variantConfigTier1Name:
      getString(variantConfig, 'tier1Name') || 'Varian',
    variantConfigTier2Name: getString(variantConfig, 'tier2Name'),
    variantConfigTier1Values: configTier1Values.length
      ? configTier1Values
      : uniqueStrings(variantFormRows.map(variant => variant.tier1Value)),
    variantConfigTier2Values: configTier2Values.length
      ? configTier2Values
      : uniqueStrings(variantFormRows.map(variant => variant.tier2Value)),
    variantConfigTier2Enabled:
      Boolean(getString(variantConfig, 'tier2Name')) ||
      configTier2Values.length > 0 ||
      variantFormRows.some(variant => variant.tier2Value.trim().length > 0),
    variants: variantFormRows,
    photoLocalUri: '',
    videoLocalUri: '',
    thumbnailLocalUri: '',
    selectedVariantId: '',
    variantPhotoLocalUri: '',
  };
}

export function createEmptyKolamTeranuraVendorPriceFormRow(): KolamTeranuraVendorPriceFormRow {
  return {
    id: createDraftId('vendor'),
    vendorId: '',
    price: '0',
    shippingCost: '0',
    link: '',
  };
}

export function createEmptyKolamTeranuraVariantFormRow(): KolamTeranuraVariantFormRow {
  return {
    id: createDraftId('variant'),
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
    lowStockThreshold: '0',
    vendorPrices: [],
    componentOverrides: [],
    externalLinks: [],
    grocerPricingTiers: [],
    customFieldValues: [],
    weightValue: '',
    weightUnitId: '',
    dimensionLength: '',
    dimensionWidth: '',
    dimensionHeight: '',
    dimensionUnitId: '',
    memberPointsEnabled: false,
    memberPoints: '0',
    raw: null,
  };
}

/**
 * Cartesian product of the configurator chip values, mirroring Product's
 * `createProductVariantCombinationRows` SKU scheme (BASE-TIER1-TIER2).
 */
export function createKolamTeranuraVariantCombinationRows(
  baseSku: string,
  tier1Values: string[],
  tier2Enabled: boolean,
  tier2Values: string[],
  existingRows: KolamTeranuraVariantFormRow[],
): KolamTeranuraVariantFormRow[] {
  const cleanTier1 = uniqueStrings(tier1Values);
  const cleanTier2 = tier2Enabled ? uniqueStrings(tier2Values) : [];
  const base = baseSku.trim().toUpperCase().replace(/\s+/g, '-');

  if (!cleanTier1.length) {
    return existingRows;
  }

  const combinations: Array<{ tier1Value: string; tier2Value: string }> = [];
  cleanTier1.forEach(tier1Value => {
    if (cleanTier2.length) {
      cleanTier2.forEach(tier2Value => {
        combinations.push({ tier1Value, tier2Value });
      });
    } else {
      combinations.push({ tier1Value, tier2Value: '' });
    }
  });

  return combinations.map(combo => {
    const existing = existingRows.find(
      row =>
        row.tier1Value.trim() === combo.tier1Value &&
        row.tier2Value.trim() === combo.tier2Value,
    );
    if (existing) {
      return existing;
    }

    const slugParts = [base, slugifyVariantValue(combo.tier1Value)];
    if (combo.tier2Value) {
      slugParts.push(slugifyVariantValue(combo.tier2Value));
    }

    return {
      ...createEmptyKolamTeranuraVariantFormRow(),
      tier1Value: combo.tier1Value,
      tier2Value: combo.tier2Value,
      sku: slugParts.filter(Boolean).join('-'),
    };
  });
}

export function createEmptyKolamTeranuraGrocerPricingTierFormRow(
  rows: KolamTeranuraGrocerPricingTierFormRow[],
): KolamTeranuraGrocerPricingTierFormRow {
  const maxQty = rows.reduce(
    (max, row) => Math.max(max, toNonNegativeNumber(row.minQty)),
    0,
  );

  return {
    id: createDraftId('tier'),
    minQty: String(maxQty + 1),
    price: '0',
    onlinePrice: '0',
  };
}

export function createEmptyKolamTeranuraPackingLinkFormRow(): KolamTeranuraPackingLinkFormRow {
  return {
    id: createDraftId('packing'),
    packingId: '',
    variantId: '',
    quantity: '1',
  };
}

export function createKolamTeranuraSavePayload(form: KolamTeranuraFormState) {
  const name = form.name.trim();
  if (!name) {
    throw new Error('Nama wajib diisi.');
  }
  if (!form.unitId.trim()) {
    throw new Error('Satuan wajib dipilih.');
  }

  const hasVariants = form.hasVariants || form.variants.length > 0;
  const keywords = form.seoKeywords
    .split(',')
    .map(keyword => keyword.trim())
    .filter(Boolean);

  return {
    name,
    sku: form.sku.trim() || undefined,
    productCode: form.productCode.trim() || undefined,
    description: form.description,
    shortDescription: form.shortDescription.trim() || undefined,
    translations:
      normalizeKolamTranslationsForSave<KolamProductLocaleFields>(
        form.translations,
      ) ?? {},
    brand: form.brandIds,
    category: form.categoryIds,
    unit: form.unitId.trim(),
    sellable: form.sellable,
    tags: form.tagIds,
    ...(form.locationId.trim() ? { location: form.locationId.trim() } : {}),
    availableShippingMethods: form.availableShippingMethodIds,
    lowStockThreshold: toNonNegativeNumber(form.lowStockThreshold),
    link: createLinkPayload(form.externalLinks),
    packings: createPackingLinkPayload(form.packingLinks),
    customFieldValues: form.customFieldValues,
    seo: {
      metaTitle: form.seoMetaTitle.trim(),
      metaDescription: form.seoMetaDescription.trim(),
      keywords,
    },
    ...(form.commissionEnabled
      ? {
          commissionEnabled: true,
          commissionType: form.commissionType,
          commissionValue: toNonNegativeNumber(form.commissionValue),
        }
      : { commissionEnabled: false }),
    ...(!hasVariants
      ? {
          price: toNonNegativeNumber(form.price),
          price_to_sell: toNonNegativeNumber(form.priceToSell),
          marketPrice: toNonNegativeNumber(form.marketPrice),
          onlinePrice: toNonNegativeNumber(form.onlinePrice),
          minimum_price_to_sales: toNonNegativeNumber(form.minimumPriceToSales),
          minimumOrderQty: Math.max(1, toNonNegativeNumber(form.minimumOrderQty)),
          grocerPricingTiers: createGrocerPricingTierPayload(
            form.grocerPricingTiers,
          ),
          components: createComponentPayload(form.componentRows),
          vendorPrices: createVendorPayload(form.vendorPrices),
          ...createWeightPayload(form.weightValue, form.weightUnitId),
          ...createDimensionPayload(
            form.dimensionLength,
            form.dimensionWidth,
            form.dimensionHeight,
            form.dimensionUnitId,
          ),
          ...(form.memberPointsEnabled
            ? {
                memberPoints: {
                  enabled: true,
                  points: toNonNegativeNumber(form.memberPoints),
                },
              }
            : { memberPoints: { enabled: false, points: 0 } }),
        }
      : {
          grocerPricingTiers: [],
          variantConfig: {
            tier1Name: form.variantConfigTier1Name.trim() || 'Varian',
            tier1Values: form.variantConfigTier1Values.length
              ? uniqueStrings(form.variantConfigTier1Values)
              : uniqueStrings(
                  form.variants.map(variant => variant.tier1Value.trim()),
                ),
            tier2Name: form.variantConfigTier2Name.trim() || undefined,
            tier2Values: form.variantConfigTier2Enabled
              ? form.variantConfigTier2Values.length
                ? uniqueStrings(form.variantConfigTier2Values)
                : uniqueStrings(
                    form.variants.map(variant => variant.tier2Value.trim()),
                  )
              : [],
          },
          variants: form.variants.map(createVariantPayload),
        }),
  };
}

function createVariantFormRow(value: unknown): KolamTeranuraVariantFormRow {
  const variant = asRecord(value);
  const weight = asRecord(variant.weight);
  const dimension = asRecord(variant.dimension ?? variant.dimensions);
  const memberPoints = asRecord(variant.memberPoints);

  return {
    id:
      getString(variant, '_id') ||
      getString(variant, 'id') ||
      createDraftId('variant'),
    tier1Value: getString(variant, 'tier1Value'),
    tier2Value: getString(variant, 'tier2Value'),
    sku: getString(variant, 'sku'),
    productCode:
      getString(variant, 'productCode') || getString(variant, 'product_code'),
    price: String(getNumber(variant, 'price') || 0),
    priceToSell: String(
      getNumber(variant, 'price_to_sell') ||
        getNumber(variant, 'priceToSell') ||
        0,
    ),
    marketPrice: String(getNumber(variant, 'marketPrice') || 0),
    onlinePrice: String(getNumber(variant, 'onlinePrice') || 0),
    minimumPriceToSales: String(
      getNumber(variant, 'minimum_price_to_sales') ||
        getNumber(variant, 'minimumPriceToSales') ||
        0,
    ),
    minimumOrderQty: String(getNumber(variant, 'minimumOrderQty') || 1),
    lowStockThreshold: String(getNumber(variant, 'lowStockThreshold') || 0),
    vendorPrices: normalizeVendorRows(variant.vendorPrices),
    componentOverrides: normalizeComponentRows(variant.componentOverrides),
    externalLinks: normalizeLinkRows(variant.link ?? variant.links),
    grocerPricingTiers: normalizeGrocerPricingTierFormRows(
      variant.grocerPricingTiers,
    ),
    customFieldValues: Array.isArray(variant.customFieldValues)
      ? variant.customFieldValues
      : [],
    weightValue:
      getNumber(weight, 'value') > 0 ? String(getNumber(weight, 'value')) : '',
    weightUnitId: getObjectIdString(weight.unit),
    dimensionLength:
      getNumber(dimension, 'length') > 0
        ? String(getNumber(dimension, 'length'))
        : '',
    dimensionWidth:
      getNumber(dimension, 'width') > 0
        ? String(getNumber(dimension, 'width'))
        : '',
    dimensionHeight:
      getNumber(dimension, 'height') > 0
        ? String(getNumber(dimension, 'height'))
        : '',
    dimensionUnitId: getObjectIdString(dimension.unit),
    memberPointsEnabled: getBoolean(memberPoints, 'enabled'),
    memberPoints: String(getNumber(memberPoints, 'points') || 0),
    raw: value,
  };
}

function createVariantPayload(row: KolamTeranuraVariantFormRow) {
  return {
    ...(row.id && !row.id.startsWith('variant-draft-') ? { _id: row.id } : {}),
    tier1Value: row.tier1Value.trim(),
    tier2Value: row.tier2Value.trim() || undefined,
    sku: row.sku.trim() || undefined,
    productCode: row.productCode.trim() || undefined,
    price: toNonNegativeNumber(row.price),
    price_to_sell: toNonNegativeNumber(row.priceToSell),
    marketPrice: toNonNegativeNumber(row.marketPrice),
    onlinePrice: toNonNegativeNumber(row.onlinePrice),
    minimum_price_to_sales: toNonNegativeNumber(row.minimumPriceToSales),
    minimumOrderQty: Math.max(1, toNonNegativeNumber(row.minimumOrderQty)),
    lowStockThreshold: toNonNegativeNumber(row.lowStockThreshold),
    vendorPrices: createVendorPayload(row.vendorPrices),
    componentOverrides: createComponentPayload(row.componentOverrides),
    link: createLinkPayload(row.externalLinks),
    grocerPricingTiers: createGrocerPricingTierPayload(row.grocerPricingTiers),
    customFieldValues: row.customFieldValues,
    ...createWeightPayload(row.weightValue, row.weightUnitId),
    ...createDimensionPayload(
      row.dimensionLength,
      row.dimensionWidth,
      row.dimensionHeight,
      row.dimensionUnitId,
    ),
    memberPoints: {
      enabled: row.memberPointsEnabled,
      points: row.memberPointsEnabled
        ? toNonNegativeNumber(row.memberPoints)
        : 0,
    },
  };
}

function normalizeVendorRows(value: unknown): KolamTeranuraVendorPriceFormRow[] {
  const rows = Array.isArray(value) ? value : [];
  return rows.map((entry, index) => {
    const row = asRecord(entry);
    return {
      id: getString(row, '_id') || getString(row, 'id') || `vendor-${index + 1}`,
      vendorId: getObjectIdString(row.vendor),
      price: String(getNumber(row, 'price') || 0),
      shippingCost: String(getNumber(row, 'shippingCost') || 0),
      link: getString(row, 'link'),
    };
  });
}

function createVendorPayload(rows: KolamTeranuraVendorPriceFormRow[]) {
  return rows
    .map(row => {
      const vendor = row.vendorId.trim();
      if (!vendor) {
        return null;
      }
      return {
        vendor,
        price: toNonNegativeNumber(row.price),
        shippingCost: toNonNegativeNumber(row.shippingCost),
        link: row.link.trim() || undefined,
      };
    })
    .filter(Boolean);
}

function normalizeComponentRows(
  value: unknown,
): KolamTeranuraComponentFormRow[] {
  const rows = Array.isArray(value) ? value : [];
  return rows.map((entry, index) => {
    const row = asRecord(entry);
    return {
      id:
        getString(row, '_id') ||
        getString(row, 'id') ||
        `component-${index + 1}`,
      productId: getObjectIdString(row.product),
      quantity: String(getNumber(row, 'quantity') || 1),
    };
  });
}

function createComponentPayload(rows: KolamTeranuraComponentFormRow[]) {
  return rows
    .map(row => {
      const product = row.productId.trim();
      if (!product) {
        return null;
      }
      return {
        product,
        quantity: toNonNegativeNumber(row.quantity),
      };
    })
    .filter(Boolean);
}

function normalizeGrocerPricingTierFormRows(
  value: unknown,
): KolamTeranuraGrocerPricingTierFormRow[] {
  const rows = Array.isArray(value) ? value : [];
  return rows.map((entry, index) => {
    const row = asRecord(entry);
    return {
      id: `tier-${index + 1}`,
      minQty: String(getNumber(row, 'minQty') || 0),
      price: String(getNumber(row, 'price') || 0),
      onlinePrice: String(getNumber(row, 'onlinePrice') || 0),
    };
  });
}

function createGrocerPricingTierPayload(
  rows: KolamTeranuraGrocerPricingTierFormRow[],
) {
  return rows
    .map(row => ({
      minQty: toNonNegativeNumber(row.minQty),
      price: toNonNegativeNumber(row.price),
      onlinePrice: toNonNegativeNumber(row.onlinePrice),
    }))
    .filter(row => row.minQty > 0 && (row.price > 0 || row.onlinePrice > 0));
}

function normalizePackingLinkFormRows(
  value: unknown,
): KolamTeranuraPackingLinkFormRow[] {
  const rows = Array.isArray(value) ? value : [];
  return rows
    .map((entry, index) => {
      const row = asRecord(entry);
      const packingId = getObjectIdString(
        row.packing ?? row.packingMaterial ?? row.product,
      );
      if (!packingId) {
        return null;
      }
      return {
        id: getString(row, '_id') || getString(row, 'id') || `packing-${index + 1}`,
        packingId,
        variantId: getObjectIdString(row.variant),
        quantity: String(getNumber(row, 'quantity') || 1),
      };
    })
    .filter(Boolean) as KolamTeranuraPackingLinkFormRow[];
}

function createPackingLinkPayload(rows: KolamTeranuraPackingLinkFormRow[]) {
  return rows
    .map(row => {
      const packing = row.packingId.trim();
      if (!packing) {
        return null;
      }
      const variantId = row.variantId.trim();
      const variant =
        variantId && !variantId.startsWith('variant-draft-') ? variantId : null;
      return {
        packing,
        variant,
        quantity: Math.max(0, toNonNegativeNumber(row.quantity)),
      };
    })
    .filter(Boolean);
}

function normalizeLinkRows(value: unknown): KolamTeranuraExternalLinkFormRow[] {
  const rows = Array.isArray(value) ? value : [];
  return rows.map(entry => {
    const row = asRecord(entry);
    return {
      name: normalizeLinkName(
        getString(row, 'name') || getString(row, 'label'),
      ),
      value:
        getString(row, 'value') ||
        getString(row, 'url') ||
        getString(row, 'href'),
    };
  });
}

function createLinkPayload(rows: KolamTeranuraExternalLinkFormRow[]) {
  return rows
    .map(row => ({
      name: row.name,
      value: row.value.trim(),
    }))
    .filter(row => row.name && row.value);
}

function createWeightPayload(valueText: string, unitId: string) {
  const value = toNonNegativeNumber(valueText);
  const unit = unitId.trim();
  return value > 0 && unit ? { weight: { value, unit } } : {};
}

function createDimensionPayload(
  lengthText: string,
  widthText: string,
  heightText: string,
  unitId: string,
) {
  const length = toNonNegativeNumber(lengthText);
  const width = toNonNegativeNumber(widthText);
  const height = toNonNegativeNumber(heightText);
  const unit = unitId.trim();
  return length > 0 && width > 0 && height > 0 && unit
    ? { dimension: { length, width, height, unit } }
    : {};
}

function normalizeLinkName(value: string): KolamTeranuraLinkName {
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

function normalizeIdList(
  value: unknown,
  fallback?: string | string[] | null,
): string[] {
  if (Array.isArray(value)) {
    return value.map(getObjectIdString).filter(Boolean);
  }
  const single = getObjectIdString(value);
  if (single) {
    return [single];
  }
  if (Array.isArray(fallback)) {
    return fallback.filter(Boolean);
  }
  return fallback ? [fallback] : [];
}

function getObjectIdString(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  const record = asRecord(value);
  return getString(record, '_id') || getString(record, 'id');
}

function slugifyVariantValue(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map(value => value.trim()).filter(Boolean))];
}

function toNonNegativeNumber(value: string) {
  const parsed = Number(String(value).replace(/[^\d.-]/g, ''));
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

function createDraftId(prefix: string) {
  return `${prefix}-draft-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
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

function getStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map(entry => String(entry).trim()).filter(Boolean)
    : [];
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

function getBoolean(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === 'true' || value === 1 || value === '1') {
    return true;
  }
  return false;
}

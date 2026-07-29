import { getKolamFileUrl } from '../lib/file-url';

export type KolamVendorStatus = 'active' | 'inactive' | 'blacklisted';

export interface KolamVendorBrandRef {
  id: string;
  name: string;
}

export interface KolamVendorPriceRef {
  vendorId: string;
  price: number;
  shippingCost: number;
  link: string;
}

export interface KolamVendorCatalogVariant {
  id: string;
  tier1Value: string;
  tier2Value: string;
  sku: string;
  productCode: string;
  vendorPrices: KolamVendorPriceRef[];
}

export interface KolamVendorCatalogProduct {
  id: string;
  name: string;
  sku: string;
  productCode: string;
  type: string;
  photos: string[];
  photoUrls: string[];
  brandNames: string[];
  price: number;
  vendorPrices: KolamVendorPriceRef[];
  variants: KolamVendorCatalogVariant[];
}

export interface KolamVendorCatalogSpecies {
  id: string;
  scientificName: string;
  commonName: string;
  localName: string;
  sku: string;
  productCode: string;
  photos: string[];
  photoUrls: string[];
  vendorPrices: KolamVendorPriceRef[];
  variants: KolamVendorCatalogVariant[];
}

export interface KolamVendorCatalogPacking {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  enabled: boolean;
}

export type KolamSupplierCatalogTab = 'products' | 'species' | 'packings';

export type KolamSupplierAnalyticsFilterType = 'all_time' | 'yearly' | 'monthly';

export interface KolamSupplierAnalyticsFilters {
  filterType?: 'yearly' | 'monthly';
  year?: number;
  month?: number;
}

export interface KolamVendorPurchaseProductStat {
  id: string;
  productName: string;
  productSku: string;
  totalQuantityOrdered: number;
  totalQuantityReceived: number;
  totalValue: number;
  averagePrice: number;
  orderCount: number;
  lastPurchase: string;
}

export interface KolamVendorPurchaseMonthlyStat {
  month: number;
  monthName: string;
  totalOrders: number;
  totalValue: number;
  averageOrderValue: number;
}

export interface KolamVendorPurchaseStatistics {
  filterApplied: {
    type: KolamSupplierAnalyticsFilterType | string;
    year: number;
    month: number | null;
  };
  overall: {
    totalOrders: number;
    totalValue: number;
    averageOrderValue: number;
  };
  productStats: KolamVendorPurchaseProductStat[];
  summary: {
    totalProductTypes: number;
    totalProductsWithPurchases: number;
    topProduct: KolamVendorPurchaseProductStat | null;
  };
  yearly: {
    year: number;
    monthlyStatistics: KolamVendorPurchaseMonthlyStat[];
    totalOrdersThisYear: number;
    totalValueThisYear: number;
    growthRate: number;
  };
}

export interface KolamSupplierCatalogProductRow {
  key: string;
  productId: string;
  title: string;
  code: string;
  brandLabel: string;
  photoUrl: string;
  vendorPrice: number | null;
  isVariantRow: boolean;
}

export interface KolamSupplierCatalogSpeciesRow {
  key: string;
  speciesId: string;
  title: string;
  commonName: string;
  code: string;
  photoUrl: string;
  vendorPrice: number | null;
  isVariantRow: boolean;
}

export interface KolamVendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: KolamVendorStatus | string;
  isOfficialDistributor: boolean;
  description: string;
  address: string;
  province: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  bankName: string;
  bankAccountNumber: string;
  links: string[];
  photos: string[];
  photoUrls: string[];
  brands: KolamVendorBrandRef[];
  products: KolamVendorCatalogProduct[];
  species: KolamVendorCatalogSpecies[];
  packings: KolamVendorCatalogPacking[];
  purchaseStatistics: KolamVendorPurchaseStatistics | null;
  warrantyContactNote: string;
  poCount: number;
  productCount: number;
  speciesCount: number;
  packingCount: number;
  createdAt: string;
  updatedAt: string;
  createdByName: string;
}

export const KOLAM_SUPPLIER_ROOT = '/suppliers';

export function isKolamSupplierRoute(route: string) {
  const path = normalizeSupplierRoutePath(route);
  return (
    path === KOLAM_SUPPLIER_ROOT ||
    path.startsWith(`${KOLAM_SUPPLIER_ROOT}/`)
  );
}

export function isKolamSupplierListRoute(route: string) {
  return normalizeSupplierRoutePath(route) === KOLAM_SUPPLIER_ROOT;
}

export function getKolamSupplierRouteId(route: string) {
  const path = normalizeSupplierRoutePath(route);
  if (
    path === KOLAM_SUPPLIER_ROOT ||
    path.endsWith('/create') ||
    path.endsWith('/edit')
  ) {
    return null;
  }
  const match = /^\/suppliers\/([^/]+)$/.exec(path);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function getKolamSupplierEditRouteId(route: string) {
  const path = normalizeSupplierRoutePath(route);
  const match = /^\/suppliers\/([^/]+)\/edit$/.exec(path);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function isKolamSupplierCreateRoute(route: string) {
  const path = normalizeSupplierRoutePath(route);
  return path === `${KOLAM_SUPPLIER_ROOT}/create`;
}

export function getKolamSupplierBreadcrumbPath(
  mode: 'list' | 'detail' | 'edit' | 'new',
  vendor?: Pick<KolamVendor, 'name' | 'id'> | null,
) {
  if (mode === 'new') {
    return `${KOLAM_SUPPLIER_ROOT}/create`;
  }
  if ((mode === 'detail' || mode === 'edit') && vendor?.id) {
    return mode === 'edit'
      ? `${KOLAM_SUPPLIER_ROOT}/${vendor.id}/edit`
      : `${KOLAM_SUPPLIER_ROOT}/${vendor.id}`;
  }
  return KOLAM_SUPPLIER_ROOT;
}

export interface KolamVendorFormState {
  id?: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  province: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  bankName: string;
  bankAccountNumber: string;
  status: KolamVendorStatus;
  isOfficialDistributor: boolean;
  warrantyContactNote: string;
  brandIds: string[];
  linkText: string;
}

export function createEmptyKolamVendorFormState(): KolamVendorFormState {
  return {
    name: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    province: '',
    city: '',
    state: '',
    country: 'Indonesia',
    postalCode: '',
    bankName: '',
    bankAccountNumber: '',
    status: 'active',
    isOfficialDistributor: false,
    warrantyContactNote: '',
    brandIds: [],
    linkText: '',
  };
}

export function createKolamVendorFormState(
  vendor: KolamVendor,
): KolamVendorFormState {
  return {
    id: vendor.id,
    name: vendor.name,
    description: vendor.description,
    email: vendor.email === '-' ? '' : vendor.email,
    phone: vendor.phone === '-' ? '' : vendor.phone,
    address: vendor.address,
    province: vendor.province,
    city: vendor.city,
    state: vendor.state,
    country: vendor.country || 'Indonesia',
    postalCode: vendor.postalCode,
    bankName: vendor.bankName,
    bankAccountNumber:
      vendor.bankAccountNumber === '-' ? '' : vendor.bankAccountNumber,
    status: coerceVendorStatus(String(vendor.status)),
    isOfficialDistributor: vendor.isOfficialDistributor,
    warrantyContactNote: vendor.warrantyContactNote,
    brandIds: vendor.brands.map(brand => brand.id).filter(Boolean),
    linkText: vendor.links.join('\n'),
  };
}

export function createKolamVendorSavePayload(form: KolamVendorFormState) {
  const links = form.linkText
    .split(/\r?\n/)
    .map(link => link.trim())
    .filter(Boolean);

  return {
    name: form.name.trim(),
    description: form.description.trim(),
    brands: form.brandIds,
    email: form.email.trim() || '-',
    phone: form.phone.trim() || '-',
    address: form.address.trim(),
    province: form.province.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    country: form.country.trim() || 'Indonesia',
    postalCode: form.postalCode.trim(),
    bankName: form.bankName.trim(),
    bankAccountNumber: form.bankAccountNumber.trim() || '-',
    status: form.status,
    isOfficialDistributor: form.isOfficialDistributor,
    warrantyContactNote: form.warrantyContactNote.trim(),
    link: links,
  };
}

export function normalizeKolamVendorList(payload: unknown): KolamVendor[] {
  const root = asRecord(payload);
  const list: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray(root.data)
    ? root.data
    : Array.isArray(root.items)
    ? root.items
    : Array.isArray(root.vendors)
    ? root.vendors
    : [];

  return list
    .map(normalizeKolamVendor)
    .filter(vendor => vendor.id && vendor.name);
}

export function normalizeKolamVendorDetail(payload: unknown): KolamVendor {
  const root = asRecord(payload);
  const record = Object.keys(asRecord(root.data)).length
    ? asRecord(root.data)
    : root;
  return normalizeKolamVendor(record);
}

export function normalizeKolamVendor(value: unknown): KolamVendor {
  const record = asRecord(value);
  const photos = normalizeStringArray(record.photos);
  const brands = normalizeBrandRefs(record.brands);
  const createdBy = asRecord(record.createdBy);

  return {
    id: getString(record, '_id') || getString(record, 'id'),
    name:
      getString(record, 'name') ||
      getString(record, 'companyName') ||
      getString(record, 'displayName') ||
      'Vendor tanpa nama',
    email: getString(record, 'email'),
    phone: getString(record, 'phone') || getString(record, 'phoneNumber'),
    status: normalizeVendorStatus(getString(record, 'status')),
    isOfficialDistributor: getBoolean(record, 'isOfficialDistributor'),
    description: getString(record, 'description'),
    address: getString(record, 'address'),
    province: getString(record, 'province'),
    city: getString(record, 'city'),
    state: getString(record, 'state'),
    country: getString(record, 'country'),
    postalCode: getString(record, 'postalCode'),
    bankName: getString(record, 'bankName'),
    bankAccountNumber: getString(record, 'bankAccountNumber'),
    links: normalizeStringArray(record.link),
    photos,
    photoUrls: photos
      .map(photo => getKolamFileUrl(photo) ?? photo)
      .filter(Boolean),
    brands,
    products: normalizeCatalogProducts(record.products),
    species: normalizeCatalogSpecies(record.species),
    packings: normalizeCatalogPackings(record.packings),
    purchaseStatistics: normalizePurchaseStatistics(record.purchaseStatistics),
    warrantyContactNote: getString(record, 'warrantyContactNote'),
    poCount: getNumber(record, 'poCount') ?? 0,
    productCount: getNumber(record, 'productCount') ?? 0,
    speciesCount: getNumber(record, 'speciesCount') ?? 0,
    packingCount: getNumber(record, 'packingCount') ?? 0,
    createdAt: getString(record, 'createdAt'),
    updatedAt: getString(record, 'updatedAt'),
    createdByName: resolvePersonName(createdBy),
  };
}

export function createKolamVendorListRevision(vendors: KolamVendor[]) {
  return JSON.stringify(
    vendors.map(vendor => ({
      id: vendor.id,
      isOfficialDistributor: vendor.isOfficialDistributor,
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      status: vendor.status,
      poCount: vendor.poCount,
      productCount: vendor.productCount,
      updatedAt: vendor.updatedAt,
    })),
  );
}

export function getKolamVendorStatusLabel(status?: string) {
  switch (normalizeVendorStatus(status || '')) {
    case 'active':
      return 'Aktif';
    case 'inactive':
      return 'Nonaktif';
    case 'blacklisted':
      return 'Diblacklist';
    default:
      return status?.trim() || '—';
  }
}

export function getKolamVendorStatusIntent(
  status?: string,
): 'success' | 'warning' | 'danger' | 'muted' {
  switch (normalizeVendorStatus(status || '')) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'warning';
    case 'blacklisted':
      return 'danger';
    default:
      return 'muted';
  }
}

export function formatKolamVendorAddress(vendor: KolamVendor) {
  return [
    vendor.address,
    vendor.city,
    vendor.province,
    vendor.state,
    vendor.country,
    vendor.postalCode,
  ]
    .map(part => part.trim())
    .filter(Boolean)
    .join(', ');
}

export function resolveKolamSupplierItemCode(
  item: { productCode?: string; sku?: string; type?: string },
  variant?: { productCode?: string; sku?: string } | null,
) {
  const pick = (...values: Array<string | null | undefined>) => {
    for (const value of values) {
      const trimmed = value?.trim();
      if (trimmed) {
        return trimmed;
      }
    }
    return '';
  };

  if (variant) {
    return pick(variant.productCode, variant.sku, item.productCode, item.sku);
  }

  if (item.type === 'product') {
    return pick(item.productCode, item.sku);
  }

  return pick(item.productCode, item.sku);
}

export function flattenKolamSupplierProductRows(
  products: KolamVendorCatalogProduct[],
  supplierId: string,
): KolamSupplierCatalogProductRow[] {
  const rows: KolamSupplierCatalogProductRow[] = [];

  for (const product of products) {
    const photoUrl = product.photoUrls[0] || '';
    const brandLabel = product.brandNames.filter(Boolean).join(', ');

    if (!product.variants.length) {
      const vp = product.vendorPrices.find(item => item.vendorId === supplierId);
      rows.push({
        key: product.id,
        productId: product.id,
        title: product.name,
        code: resolveKolamSupplierItemCode(product),
        brandLabel,
        photoUrl,
        vendorPrice: vp?.price ?? product.price ?? null,
        isVariantRow: false,
      });
      continue;
    }

    rows.push({
      key: product.id,
      productId: product.id,
      title: product.name,
      code: '',
      brandLabel,
      photoUrl,
      vendorPrice: null,
      isVariantRow: false,
    });

    for (const variant of product.variants) {
      const vp = variant.vendorPrices.find(item => item.vendorId === supplierId);
      if (!vp) {
        continue;
      }
      const variantLabel = variant.tier2Value
        ? `${variant.tier1Value} / ${variant.tier2Value}`
        : variant.tier1Value;
      rows.push({
        key: `${product.id}-${variant.id}`,
        productId: product.id,
        title: variantLabel,
        code: resolveKolamSupplierItemCode(product, variant),
        brandLabel: '',
        photoUrl,
        vendorPrice: vp.price,
        isVariantRow: true,
      });
    }
  }

  return rows;
}

export function flattenKolamSupplierSpeciesRows(
  species: KolamVendorCatalogSpecies[],
  supplierId: string,
): KolamSupplierCatalogSpeciesRow[] {
  const rows: KolamSupplierCatalogSpeciesRow[] = [];

  for (const item of species) {
    const photoUrl = item.photoUrls[0] || '';
    const commonName = item.commonName || item.localName || '';

    if (!item.variants.length) {
      const vp = item.vendorPrices.find(price => price.vendorId === supplierId);
      rows.push({
        key: item.id,
        speciesId: item.id,
        title: item.scientificName,
        commonName,
        code: resolveKolamSupplierItemCode(item),
        photoUrl,
        vendorPrice: vp?.price ?? null,
        isVariantRow: false,
      });
      continue;
    }

    rows.push({
      key: item.id,
      speciesId: item.id,
      title: item.scientificName,
      commonName,
      code: '',
      photoUrl,
      vendorPrice: null,
      isVariantRow: false,
    });

    for (const variant of item.variants) {
      const vp = variant.vendorPrices.find(price => price.vendorId === supplierId);
      const variantLabel = variant.tier2Value
        ? `${variant.tier1Value} / ${variant.tier2Value}`
        : variant.tier1Value;
      rows.push({
        key: `${item.id}-${variant.id}`,
        speciesId: item.id,
        title: variantLabel,
        commonName: '',
        code: resolveKolamSupplierItemCode(item, variant),
        photoUrl,
        vendorPrice: vp?.price ?? null,
        isVariantRow: true,
      });
    }
  }

  return rows;
}

export function hasKolamVendorPurchaseAnalytics(
  stats: KolamVendorPurchaseStatistics | null | undefined,
) {
  return Boolean(stats && stats.overall.totalOrders > 0);
}

export function buildKolamSupplierAnalyticsQuery(
  filters: KolamSupplierAnalyticsFilters,
): Record<string, string | number | undefined> {
  return {
    filterType: filters.filterType,
    year: filters.year,
    month: filters.filterType === 'monthly' ? filters.month : undefined,
  };
}

function normalizeVendorStatus(value: string): KolamVendorStatus | string {
  const normalized = value.trim().toLowerCase();
  if (
    normalized === 'active' ||
    normalized === 'inactive' ||
    normalized === 'blacklisted'
  ) {
    return normalized;
  }
  return value.trim() || 'active';
}

function coerceVendorStatus(value: string): KolamVendorStatus {
  const normalized = normalizeVendorStatus(value);
  return normalized === 'inactive' || normalized === 'blacklisted'
    ? normalized
    : 'active';
}

function normalizeBrandRefs(value: unknown): KolamVendorBrandRef[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      if (typeof item === 'string') {
        return { id: item, name: item };
      }
      const record = asRecord(item);
      const id = getString(record, '_id') || getString(record, 'id');
      const name = getString(record, 'name') || id;
      if (!id && !name) {
        return null;
      }
      return { id: id || name, name: name || id };
    })
    .filter((item): item is KolamVendorBrandRef => Boolean(item));
}

function normalizeCatalogProducts(value: unknown): KolamVendorCatalogProduct[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const record = asRecord(item);
      const id = getString(record, '_id') || getString(record, 'id');
      const name = getString(record, 'name');
      if (!id || !name) {
        return null;
      }
      const photos = normalizeStringArray(record.photos);
      return {
        id,
        name,
        sku: getString(record, 'sku'),
        productCode: getString(record, 'productCode'),
        type: getString(record, 'type'),
        photos,
        photoUrls: photos
          .map(photo => getKolamFileUrl(photo) ?? photo)
          .filter(Boolean),
        brandNames: normalizeBrandNames(record.brand),
        price: getNumber(record, 'price') ?? 0,
        vendorPrices: normalizeVendorPrices(record.vendorPrices),
        variants: normalizeCatalogVariants(record.variants),
      } satisfies KolamVendorCatalogProduct;
    })
    .filter((item): item is KolamVendorCatalogProduct => Boolean(item));
}

function normalizeCatalogSpecies(value: unknown): KolamVendorCatalogSpecies[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const record = asRecord(item);
      const id = getString(record, '_id') || getString(record, 'id');
      const scientificName = getString(record, 'scientificName');
      if (!id || !scientificName) {
        return null;
      }
      const photos = normalizeStringArray(record.photos);
      return {
        id,
        scientificName,
        commonName: getString(record, 'commonName'),
        localName: getString(record, 'localName'),
        sku: getString(record, 'sku'),
        productCode: getString(record, 'productCode'),
        photos,
        photoUrls: photos
          .map(photo => getKolamFileUrl(photo) ?? photo)
          .filter(Boolean),
        vendorPrices: normalizeVendorPrices(record.vendorPrices),
        variants: normalizeCatalogVariants(record.variants),
      } satisfies KolamVendorCatalogSpecies;
    })
    .filter((item): item is KolamVendorCatalogSpecies => Boolean(item));
}

function normalizeCatalogPackings(value: unknown): KolamVendorCatalogPacking[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const record = asRecord(item);
      const id = getString(record, '_id') || getString(record, 'id');
      const name = getString(record, 'name');
      if (!id || !name) {
        return null;
      }
      return {
        id,
        name,
        category: getString(record, 'category'),
        price: getNumber(record, 'price') ?? 0,
        cost: getNumber(record, 'cost') ?? 0,
        stock: getNumber(record, 'stock') ?? 0,
        enabled: record.enabled !== false,
      } satisfies KolamVendorCatalogPacking;
    })
    .filter((item): item is KolamVendorCatalogPacking => Boolean(item));
}

function normalizeCatalogVariants(value: unknown): KolamVendorCatalogVariant[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const record = asRecord(item);
      const id = getString(record, '_id') || getString(record, 'id');
      const tier1Value = getString(record, 'tier1Value');
      if (!id || !tier1Value) {
        return null;
      }
      return {
        id,
        tier1Value,
        tier2Value: getString(record, 'tier2Value'),
        sku: getString(record, 'sku'),
        productCode: getString(record, 'productCode'),
        vendorPrices: normalizeVendorPrices(record.vendorPrices),
      } satisfies KolamVendorCatalogVariant;
    })
    .filter((item): item is KolamVendorCatalogVariant => Boolean(item));
}

function normalizeVendorPrices(value: unknown): KolamVendorPriceRef[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const record = asRecord(item);
      const vendor = record.vendor;
      const vendorId =
        typeof vendor === 'string'
          ? vendor.trim()
          : getString(asRecord(vendor), '_id') ||
            getString(asRecord(vendor), 'id');
      if (!vendorId) {
        return null;
      }
      return {
        vendorId,
        price: getNumber(record, 'price') ?? 0,
        shippingCost: getNumber(record, 'shippingCost') ?? 0,
        link: getString(record, 'link'),
      } satisfies KolamVendorPriceRef;
    })
    .filter((item): item is KolamVendorPriceRef => Boolean(item));
}

function normalizeBrandNames(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map(item => {
        if (typeof item === 'string') {
          return item.trim();
        }
        const record = asRecord(item);
        return getString(record, 'name');
      })
      .filter(Boolean);
  }
  const record = asRecord(value);
  const name = getString(record, 'name');
  return name ? [name] : [];
}

function normalizePurchaseStatistics(
  value: unknown,
): KolamVendorPurchaseStatistics | null {
  const root = asRecord(value);
  if (!Object.keys(root).length) {
    return null;
  }

  const filterApplied = asRecord(root.filterApplied);
  const filteredStats = asRecord(root.filteredStats);
  const overallStats = asRecord(filteredStats.overallStats);
  const summary = asRecord(filteredStats.summary);
  const yearlyAnalysis = asRecord(root.yearlyAnalysis);
  const yearlySummary = asRecord(yearlyAnalysis.summary);
  const productStats = normalizePurchaseProductStats(
    filteredStats.productPurchaseStats,
  );
  const topProductRaw = summary.topProduct;
  const topProduct = topProductRaw
    ? normalizePurchaseProductStat(topProductRaw)
    : productStats[0] ?? null;

  return {
    filterApplied: {
      type: getString(filterApplied, 'type') || 'all_time',
      year: getNumber(filterApplied, 'year') ?? new Date().getFullYear(),
      month: getNumber(filterApplied, 'month'),
    },
    overall: {
      totalOrders: getNumber(overallStats, 'totalOrders') ?? 0,
      totalValue: getNumber(overallStats, 'totalValue') ?? 0,
      averageOrderValue: getNumber(overallStats, 'averageOrderValue') ?? 0,
    },
    productStats,
    summary: {
      totalProductTypes: getNumber(summary, 'totalProductTypes') ?? productStats.length,
      totalProductsWithPurchases:
        getNumber(summary, 'totalProductsWithPurchases') ?? productStats.length,
      topProduct,
    },
    yearly: {
      year:
        getNumber(yearlyAnalysis, 'year') ??
        getNumber(filterApplied, 'year') ??
        new Date().getFullYear(),
      monthlyStatistics: normalizeMonthlyStats(yearlyAnalysis.monthlyStatistics),
      totalOrdersThisYear: getNumber(yearlySummary, 'totalOrdersThisYear') ?? 0,
      totalValueThisYear: getNumber(yearlySummary, 'totalValueThisYear') ?? 0,
      growthRate: getNumber(yearlySummary, 'growthRate') ?? 0,
    },
  };
}

function normalizePurchaseProductStats(
  value: unknown,
): KolamVendorPurchaseProductStat[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(normalizePurchaseProductStat)
    .filter((item): item is KolamVendorPurchaseProductStat => Boolean(item));
}

function normalizePurchaseProductStat(
  value: unknown,
): KolamVendorPurchaseProductStat | null {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  const productName = getString(record, 'productName');
  if (!id && !productName) {
    return null;
  }
  return {
    id: id || productName,
    productName: productName || id,
    productSku: getString(record, 'productSku'),
    totalQuantityOrdered: getNumber(record, 'totalQuantityOrdered') ?? 0,
    totalQuantityReceived: getNumber(record, 'totalQuantityReceived') ?? 0,
    totalValue: getNumber(record, 'totalValue') ?? 0,
    averagePrice: getNumber(record, 'averagePrice') ?? 0,
    orderCount: getNumber(record, 'orderCount') ?? 0,
    lastPurchase: getString(record, 'lastPurchase'),
  };
}

function normalizeMonthlyStats(value: unknown): KolamVendorPurchaseMonthlyStat[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const record = asRecord(item);
      const month = getNumber(record, 'month');
      if (!month) {
        return null;
      }
      return {
        month,
        monthName:
          getString(record, 'monthName') ||
          new Date(2000, month - 1).toLocaleString('id-ID', { month: 'long' }),
        totalOrders: getNumber(record, 'totalOrders') ?? 0,
        totalValue: getNumber(record, 'totalValue') ?? 0,
        averageOrderValue: getNumber(record, 'averageOrderValue') ?? 0,
      } satisfies KolamVendorPurchaseMonthlyStat;
    })
    .filter((item): item is KolamVendorPurchaseMonthlyStat => Boolean(item));
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
}

function resolvePersonName(record: Record<string, unknown>) {
  const fullName = [
    getString(record, 'first_name'),
    getString(record, 'last_name'),
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
  return (
    fullName ||
    getString(record, 'name') ||
    getString(record, 'displayName') ||
    getString(record, 'username') ||
    getString(record, 'email')
  );
}

function normalizeSupplierRoutePath(route: string) {
  const path = route.trim().split('?')[0] || '';
  if (!path) {
    return '';
  }
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

function getBoolean(record: Record<string, unknown>, key: string) {
  return record[key] === true;
}

function getNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

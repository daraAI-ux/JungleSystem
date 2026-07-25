import { appConfig } from '../config/app';
import {
  createKolamSpeciesPackingLinkPayload,
  createKolamSpeciesSavePayload,
  normalizeKolamSpeciesDetail,
  normalizeKolamSpeciesList,
  type KolamSpecies,
  type KolamSpeciesFormState,
  type KolamSpeciesSellableFilter,
  type KolamSpeciesStockStatus,
  type KolamSpeciesStatus,
} from '../domain/kolam-species';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export async function getKolamSpeciesList(options: {
  category?: string;
  limit?: number;
  page?: number;
  search?: string;
  sellable?: KolamSpeciesSellableFilter;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: 'all' | KolamSpeciesStatus;
  stockStatus?: KolamSpeciesStockStatus;
  taxonomyId?: string;
} = {}): Promise<KolamSpecies[]> {
  const response = await kolamRequest<unknown>('/species', {
    query: {
      category: options.category,
      limit: options.limit ?? 1000,
      page: options.page ?? 1,
      search: options.search,
      sellable:
        options.sellable === 'all'
          ? undefined
          : options.sellable === 'sellable'
          ? true
          : options.sellable === 'not-sellable'
          ? false
          : undefined,
      sortBy: options.sortBy,
      sortOrder: options.sortOrder,
      status: options.status === 'all' ? undefined : options.status,
      stockStatus:
        options.stockStatus === 'all' ? undefined : options.stockStatus,
      taxonomyId: options.taxonomyId,
      view: 'list',
    },
  });

  return normalizeKolamSpeciesList(response);
}

export async function getKolamSpecies(id: string): Promise<KolamSpecies> {
  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(id)}`,
  );
  return normalizeKolamSpeciesDetail(response);
}


export type KolamSpeciesStatisticsPeriod = '30d' | '90d' | '1y' | 'all';

export interface KolamSpeciesStatisticsMonthlyPoint {
  year: number;
  month: number;
  monthName: string;
  totalAmount: number;
  totalQuantity: number;
  totalValue: number;
  orderCount: number;
}

export interface KolamSpeciesStatisticsSummary {
  stock: number;
  viewCount: number;
  wishlistCount: number;
  averageRating: number;
  totalReviews: number;
  sales: {
    totalAmount: number;
    totalQuantity: number;
    orderCount: number;
  };
  purchases: {
    totalValue: number;
    totalQuantity: number;
    orderCount: number;
  };
}

export interface KolamSpeciesStatisticsRow {
  id: string;
  primary: string;
  secondary: string;
  meta: string;
  amount: number;
  createdAt: string;
}

export interface KolamSpeciesVariantSaleStat {
  variantId: string;
  variantLabel: string;
  totalAmount: number;
  totalQuantity: number;
  orderCount: number;
}

export interface KolamSpeciesStatistics {
  period: KolamSpeciesStatisticsPeriod;
  summary: KolamSpeciesStatisticsSummary;
  monthlySales: KolamSpeciesStatisticsMonthlyPoint[];
  monthlyPurchases: KolamSpeciesStatisticsMonthlyPoint[];
  recentSales: KolamSpeciesStatisticsRow[];
  recentPurchaseOrders: KolamSpeciesStatisticsRow[];
  variantSales: KolamSpeciesVariantSaleStat[];
}

export async function getKolamSpeciesStatistics(
  speciesId: string,
  period: KolamSpeciesStatisticsPeriod = '90d',
): Promise<KolamSpeciesStatistics | null> {
  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(speciesId)}/statistics`,
    { query: { period } },
  );
  const record = asApiRecord(unwrapApiData(response));
  if (!Object.keys(record).length) {
    return null;
  }
  return normalizeSpeciesStatistics(record);
}

export interface KolamSpeciesTermsTemplate {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  version: number;
  content: string;
  sourceLabel: string;
  sourceKind: 'direct' | 'category';
  sourceCategoryNames: string[];
  updatedAt: string;
}

export type KolamTermsItemType = 'product' | 'species';

export async function getKolamTermsTemplatesForItem(
  itemType: KolamTermsItemType,
  itemId: string,
): Promise<KolamSpeciesTermsTemplate[]> {
  const response = await kolamRequest<unknown>('/terms-templates/for-item', {
    query: {
      itemType,
      itemId,
    },
  });

  return normalizeKolamSpeciesTermsTemplates(response);
}

export async function getKolamSpeciesTermsTemplates(
  speciesId: string,
): Promise<KolamSpeciesTermsTemplate[]> {
  return getKolamTermsTemplatesForItem('species', speciesId);
}
export async function createKolamSpecies(
  form: KolamSpeciesFormState,
): Promise<KolamSpecies> {
  const response = await kolamRequest<unknown>('/species', {
    method: 'POST',
    body: createKolamSpeciesSavePayload(form),
  });

  return normalizeKolamSpeciesDetail(response);
}

export async function updateKolamSpecies(
  id: string,
  form: KolamSpeciesFormState,
): Promise<KolamSpecies> {
  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: createKolamSpeciesSavePayload(form),
      headers: { 'X-Detail-Edit': '1' },
    },
  );

  return normalizeKolamSpeciesDetail(response);
}

export async function updateKolamSpeciesPartial(
  id: string,
  body: Partial<Pick<KolamSpecies, 'isPinned'>>,
): Promise<KolamSpecies> {
  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body,
    },
  );

  return normalizeKolamSpeciesDetail(response);
}

export async function duplicateKolamSpecies(id: string): Promise<KolamSpecies> {
  const response = await kolamRequest<unknown>(
    `/species/copy/${encodeURIComponent(id)}`,
    { method: 'POST' },
  );

  return normalizeKolamSpeciesDetail(response);
}

export async function deleteKolamSpecies(id: string): Promise<void> {
  await kolamRequest<unknown>(`/species/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export interface KolamSpeciesSeoFormPayload {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}

export async function updateKolamSpeciesSeo(
  speciesId: string,
  form: KolamSpeciesSeoFormPayload,
): Promise<KolamSpecies> {
  await kolamRequest<unknown>(
    `/dara-seo/species/${encodeURIComponent(speciesId)}/seo`,
    {
      method: 'PUT',
      body: {
        metaTitle: form.metaTitle.trim(),
        metaDescription: form.metaDescription.trim(),
        keywords: form.keywords
          .split(',')
          .map(keyword => keyword.trim())
          .filter(Boolean),
      },
    },
  );

  return getKolamSpecies(speciesId);
}

export interface KolamSpeciesAttachedItemPayload {
  itemType: 'product' | 'species';
  product?: string;
  species?: string;
  type: string;
  note?: string;
}

export async function addKolamSpeciesAttachedItem(
  speciesId: string,
  body: KolamSpeciesAttachedItemPayload,
): Promise<KolamSpecies> {
  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(speciesId)}/attached-items`,
    {
      method: 'POST',
      body,
    },
  );

  return normalizeKolamSpeciesDetail(response);
}

export async function removeKolamSpeciesAttachedItem(
  speciesId: string,
  itemId: string,
): Promise<KolamSpecies> {
  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(speciesId)}/attached-items/${encodeURIComponent(itemId)}`,
    {
      method: 'DELETE',
    },
  );

  return normalizeKolamSpeciesDetail(response);
}

export async function linkKolamSpeciesPackings(
  species: KolamSpecies,
  form: KolamSpeciesFormState,
): Promise<KolamSpecies> {
  await kolamRequest<unknown>(
    `/species/${encodeURIComponent(species.id)}/link-packings`,
    {
      method: 'POST',
      body: {
        packings: createKolamSpeciesPackingLinkPayload(form, species),
      },
    },
  );

  return getKolamSpecies(species.id);
}

export interface KolamSpeciesEnclosureRow {
  enclosure: {
    id: string;
    code: string;
    name: string;
    status: string;
  };
  speciesId: string;
  variantId: string | null;
  variantLabel: string;
  unit: string;
  quantity: number;
  displayLine: string;
}

export interface KolamSpeciesVariantAllocation {
  variantId: string;
  variantLabel: string;
  totalStock: number;
  allocated: number;
  unallocated: number;
  unit: string;
}

export interface KolamSpeciesEnclosureAllocation {
  speciesId: string;
  unit: string;
  totalStock: number;
  allocated: number;
  unallocated: number;
  pendingAllocations: number;
  hasVariants: boolean;
  variants: KolamSpeciesVariantAllocation[];
  placements: KolamSpeciesEnclosureRow[];
  displaySummary: string;
}

export interface KolamSpeciesPendingLivestockAllocation {
  id: string;
  speciesId: string;
  variantId: string | null;
  saleId: string;
  invoiceCode: string;
  qtyTotal: number;
  qtyRemaining: number;
  status: string;
  speciesName: string;
  variantLabel: string;
  unitLabel: string;
  displayLine: string;
  createdAt: string;
}

export async function getKolamSpeciesEnclosureAllocation(
  speciesId: string,
): Promise<KolamSpeciesEnclosureAllocation | null> {
  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(speciesId)}/enclosure-allocation`,
  );
  const value = unwrapApiData(response);
  if (!value || typeof value !== 'object') {
    return null;
  }

  return normalizeEnclosureAllocation(value);
}

export async function getKolamSpeciesPendingLivestockAllocations(
  speciesId: string,
): Promise<KolamSpeciesPendingLivestockAllocation[]> {
  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(speciesId)}/pending-livestock-allocations`,
  );
  const value = unwrapApiData(response);
  const list = Array.isArray(value) ? value : [];
  return list.map(normalizePendingAllocation).filter(Boolean) as KolamSpeciesPendingLivestockAllocation[];
}

function normalizeSpeciesStatistics(record: Record<string, unknown>): KolamSpeciesStatistics {
  const summary = asApiRecord(record.summary);
  const sales = asApiRecord(summary.sales);
  const purchases = asApiRecord(summary.purchases);
  return {
    period: (record.period === '30d' || record.period === '1y' || record.period === 'all' ? record.period : '90d') as KolamSpeciesStatisticsPeriod,
    summary: {
      stock: getApiNumber(summary, 'stock'),
      viewCount: getApiNumber(summary, 'viewCount'),
      wishlistCount: getApiNumber(summary, 'wishlistCount'),
      averageRating: getApiNumber(summary, 'averageRating'),
      totalReviews: getApiNumber(summary, 'totalReviews'),
      sales: {
        totalAmount: getApiNumber(sales, 'totalAmount'),
        totalQuantity: getApiNumber(sales, 'totalQuantity'),
        orderCount: getApiNumber(sales, 'orderCount'),
      },
      purchases: {
        totalValue: getApiNumber(purchases, 'totalValue'),
        totalQuantity: getApiNumber(purchases, 'totalQuantity'),
        orderCount: getApiNumber(purchases, 'orderCount'),
      },
    },
    monthlySales: normalizeMonthlyStatisticsRows(record.monthlySales),
    monthlyPurchases: normalizeMonthlyStatisticsRows(record.monthlyPurchases),
    recentSales: normalizeStatisticsRows(record.recentSales, 'invoiceCode', 'customerName'),
    recentPurchaseOrders: normalizeStatisticsRows(record.recentPurchaseOrders, 'poCode', 'vendorName'),
    variantSales: Array.isArray(record.variantSales)
      ? record.variantSales.map(normalizeVariantSaleStat).filter(Boolean) as KolamSpeciesVariantSaleStat[]
      : [],
  };
}

function normalizeMonthlyStatisticsRows(value: unknown): KolamSpeciesStatisticsMonthlyPoint[] {
  const list = Array.isArray(value) ? value : [];
  return list.map(item => {
    const record = asApiRecord(item);
    return {
      year: getApiNumber(record, 'year'),
      month: getApiNumber(record, 'month'),
      monthName: getApiString(record, 'monthName'),
      totalAmount: getApiNumber(record, 'totalAmount'),
      totalQuantity: getApiNumber(record, 'totalQuantity'),
      totalValue: getApiNumber(record, 'totalValue'),
      orderCount: getApiNumber(record, 'orderCount'),
    };
  });
}
function normalizeStatisticsRows(value: unknown, primaryKey: string, secondaryKey: string): KolamSpeciesStatisticsRow[] {
  const list = Array.isArray(value) ? value : [];
  return list.map((item, index) => {
    const record = asApiRecord(item);
    return {
      id: getApiString(record, '_id') || String(index),
      primary: getApiString(record, primaryKey) || 'Dokumen',
      secondary: getApiString(record, secondaryKey),
      meta: `${getApiNumber(record, 'quantity')} unit`,
      amount: getApiNumber(record, 'amount'),
      createdAt: getApiString(record, 'createdAt'),
    };
  });
}

function normalizeVariantSaleStat(value: unknown): KolamSpeciesVariantSaleStat | null {
  const record = asApiRecord(value);
  return {
    variantId: getNullableApiString(record, 'variantId') || '',
    variantLabel: getApiString(record, 'variantLabel') || 'Default',
    totalAmount: getApiNumber(record, 'totalAmount'),
    totalQuantity: getApiNumber(record, 'totalQuantity'),
    orderCount: getApiNumber(record, 'orderCount'),
  };
}

function normalizeKolamSpeciesTermsTemplates(value: unknown): KolamSpeciesTermsTemplate[] {
  const first = unwrapApiData(value);
  const second = unwrapApiData(first);
  const list = Array.isArray(first)
    ? first
    : Array.isArray(second)
    ? second
    : [];

  return list
    .map((item, index) => {
      const record = asApiRecord(item);
      const id = getApiString(record, '_id') || getApiString(record, 'id') || String(index);
      return {
        id,
        title: getApiString(record, 'title') || 'Syarat & Ketentuan',
        slug: getApiString(record, 'slug'),
        category: getApiString(record, 'category'),
        status: getApiString(record, 'status') || 'published',
        version: getApiNumber(record, 'version') || 1,
        content: getApiString(record, 'content'),
        sourceLabel: getTermsSourceLabel(record),
        sourceKind: getTermsSourceKind(record),
        sourceCategoryNames: getTermsCategoryNames(record),
        updatedAt: getApiString(record, 'updatedAt'),
      };
    })
    .filter(item => item.id);
}

function getTermsSourceKind(record: Record<string, unknown>): 'direct' | 'category' {
  if (hasTermsDirectLink(record, 'species') || hasTermsDirectLink(record, 'product')) {
    return 'direct';
  }
  return 'category';
}

function getTermsCategoryNames(record: Record<string, unknown>) {
  const categories = Array.isArray(record.catalogCategories) ? record.catalogCategories : [];
  return categories
    .map(item => {
      if (typeof item === 'string') {
        return '';
      }
      const category = asApiRecord(item);
      return getApiString(category, 'name');
    })
    .filter(Boolean);
}
function getTermsSourceLabel(record: Record<string, unknown>) {
  if (hasTermsDirectLink(record, 'species')) {
    return 'Langsung di spesies';
  }
  if (hasTermsDirectLink(record, 'product')) {
    return 'Langsung di produk';
  }
  if (Array.isArray(record.catalogCategories) && record.catalogCategories.length > 0) {
    return 'Dari kategori';
  }
  return 'Aktif';
}

function hasTermsDirectLink(record: Record<string, unknown>, key: 'product' | 'species') {
  const plural = key === 'product' ? 'products' : 'species';
  const direct = record[key];
  if (Array.isArray(direct)) {
    return direct.length > 0;
  }
  if (direct) {
    return true;
  }
  const directList = record[plural];
  return Array.isArray(directList) && directList.length > 0;
}
function normalizeEnclosureAllocation(value: unknown): KolamSpeciesEnclosureAllocation {
  const record = asApiRecord(value);
  const variants = Array.isArray(record.variants)
    ? record.variants.map(normalizeVariantAllocation).filter(Boolean) as KolamSpeciesVariantAllocation[]
    : [];
  const placements = Array.isArray(record.placements)
    ? record.placements.map(normalizeEnclosureRow).filter(Boolean) as KolamSpeciesEnclosureRow[]
    : [];

  return {
    speciesId: getApiString(record, 'speciesId'),
    unit: getApiString(record, 'unit') || 'ekor',
    totalStock: getApiNumber(record, 'totalStock'),
    allocated: getApiNumber(record, 'allocated'),
    unallocated: getApiNumber(record, 'unallocated'),
    pendingAllocations: getApiNumber(record, 'pendingAllocations'),
    hasVariants: Boolean(record.hasVariants),
    variants,
    placements,
    displaySummary: getApiString(record, 'displaySummary'),
  };
}

function normalizeVariantAllocation(value: unknown): KolamSpeciesVariantAllocation | null {
  const record = asApiRecord(value);
  const variantId = getApiString(record, 'variantId');
  if (!variantId) {
    return null;
  }
  return {
    variantId,
    variantLabel: getApiString(record, 'variantLabel'),
    totalStock: getApiNumber(record, 'totalStock'),
    allocated: getApiNumber(record, 'allocated'),
    unallocated: getApiNumber(record, 'unallocated'),
    unit: getApiString(record, 'unit') || 'ekor',
  };
}

function normalizeEnclosureRow(value: unknown): KolamSpeciesEnclosureRow | null {
  const record = asApiRecord(value);
  const enclosure = asApiRecord(record.enclosure);
  const enclosureId = getApiString(enclosure, '_id') || getApiString(enclosure, 'id');
  if (!enclosureId) {
    return null;
  }
  return {
    enclosure: {
      id: enclosureId,
      code: getApiString(enclosure, 'enclosure_code'),
      name: getApiString(enclosure, 'enclosure_name'),
      status: getApiString(enclosure, 'status'),
    },
    speciesId: getApiString(record, 'speciesId'),
    variantId: getNullableApiString(record, 'variantId'),
    variantLabel: getApiString(record, 'variantLabel'),
    unit: getApiString(record, 'unit') || 'ekor',
    quantity: getApiNumber(record, 'quantity'),
    displayLine: getApiString(record, 'displayLine'),
  };
}

function normalizePendingAllocation(value: unknown): KolamSpeciesPendingLivestockAllocation | null {
  const record = asApiRecord(value);
  const id = getApiString(record, '_id') || getApiString(record, 'id');
  if (!id) {
    return null;
  }
  return {
    id,
    speciesId: getApiString(record, 'speciesId'),
    variantId: getNullableApiString(record, 'variantId'),
    saleId: getApiString(record, 'saleId'),
    invoiceCode: getApiString(record, 'invoiceCode'),
    qtyTotal: getApiNumber(record, 'qtyTotal'),
    qtyRemaining: getApiNumber(record, 'qtyRemaining'),
    status: getApiString(record, 'status'),
    speciesName: getApiString(record, 'speciesName'),
    variantLabel: getApiString(record, 'variantLabel'),
    unitLabel: getApiString(record, 'unitLabel'),
    displayLine: getApiString(record, 'displayLine'),
    createdAt: getApiString(record, 'createdAt'),
  };
}

function unwrapApiData(value: unknown): unknown {
  if (value && typeof value === 'object' && 'data' in value) {
    return (value as { data?: unknown }).data;
  }
  return value;
}

function asApiRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function getApiString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

function getNullableApiString(record: Record<string, unknown>, key: string) {
  const value = getApiString(record, key);
  return value || null;
}

function getApiNumber(record: Record<string, unknown>, key: string) {
  const parsed = Number(record[key]);
  return Number.isFinite(parsed) ? parsed : 0;
}
export async function uploadKolamSpeciesPhoto(
  id: string,
  localUri: string,
  variantId?: string,
): Promise<KolamSpecies> {
  const body = new FormData();
  body.append('photos', createReactNativeFilePart(localUri) as unknown as Blob);
  if (variantId) {
    body.append('variant', variantId);
  }

  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(id)}/photos`,
    {
      method: 'POST',
      body,
    },
  );

  return normalizeKolamSpeciesDetail(response);
}

export async function uploadKolamSpeciesThumbnail(
  id: string,
  localUri: string,
): Promise<KolamSpecies> {
  const body = new FormData();
  body.append('thumbnail', createReactNativeFilePart(localUri) as unknown as Blob);

  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(id)}/thumbnail`,
    {
      method: 'POST',
      body,
    },
  );

  return normalizeKolamSpeciesDetail(response);
}
export async function uploadKolamSpeciesVideo(
  id: string,
  localUri: string,
  variantId?: string,
): Promise<KolamSpecies> {
  const body = new FormData();
  body.append('videos', createReactNativeFilePart(localUri) as unknown as Blob);
  if (variantId) {
    body.append('variant', variantId);
  }

  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(id)}/videos`,
    {
      method: 'POST',
      body,
    },
  );

  return normalizeKolamSpeciesDetail(response);
}

export async function uploadKolamSpeciesVoice(
  id: string,
  localUri: string,
): Promise<KolamSpecies> {
  const body = new FormData();
  body.append('voice', createReactNativeFilePart(localUri) as unknown as Blob);

  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(id)}/voice`,
    {
      method: 'POST',
      body,
    },
  );

  return normalizeKolamSpeciesDetail(response);
}

export async function uploadKolamSpeciesAsset(
  id: string,
  title: string,
  localUri: string,
): Promise<KolamSpecies> {
  const body = new FormData();
  body.append('title', title.trim());
  body.append('file', createReactNativeFilePart(localUri, 'species-asset') as unknown as Blob);

  await kolamRequest<unknown>(
    `/species/${encodeURIComponent(id)}/assets`,
    {
      method: 'POST',
      body,
    },
  );

  return getKolamSpecies(id);
}
export async function deleteKolamSpeciesAsset(
  id: string,
  assetId: string,
): Promise<KolamSpecies> {
  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(id)}/assets/${encodeURIComponent(assetId)}`,
    { method: 'DELETE' },
  );

  return normalizeKolamSpeciesDetail(response);
}
export async function deleteKolamSpeciesVideo(
  id: string,
  index: number,
  variantId?: string,
): Promise<KolamSpecies> {
  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(id)}/videos/${index}`,
    {
      method: 'DELETE',
      query: { variant: variantId },
    },
  );

  return normalizeKolamSpeciesDetail(response);
}

export async function deleteKolamSpeciesVoice(id: string): Promise<KolamSpecies> {
  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(id)}/voice`,
    {
      method: 'DELETE',
    },
  );

  return normalizeKolamSpeciesDetail(response);
}

export async function reorderKolamSpeciesMedia(
  id: string,
  media: { photos?: string[]; videos?: string[]; variant?: string },
): Promise<KolamSpecies> {
  await kolamRequest<unknown>(`/species/${encodeURIComponent(id)}/media/reorder`, {
    method: 'PUT',
    body: media,
  });

  return getKolamSpecies(id);
}
export async function deleteKolamSpeciesPhoto(
  id: string,
  index: number,
  variantId?: string,
): Promise<KolamSpecies> {
  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(id)}/photos/${index}`,
    {
      method: 'DELETE',
      query: { variant: variantId },
    },
  );

  return normalizeKolamSpeciesDetail(response);
}

export async function deleteKolamSpeciesThumbnail(
  id: string,
): Promise<KolamSpecies> {
  const response = await kolamRequest<unknown>(
    `/species/${encodeURIComponent(id)}/thumbnail`,
    {
      method: 'DELETE',
    },
  );

  return normalizeKolamSpeciesDetail(response);
}
function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    query?: Record<string, string | number | boolean | undefined | null>;
    body?: unknown;
    headers?: Record<string, string>;
  } = {},
) {
  return apiRequest<T | DataResponse<T>>({
    method: options.method ?? 'GET',
    path,
    query: options.query,
    body: options.body,
    headers: options.headers,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  }) as Promise<T>;
}
function createReactNativeFilePart(localUri: string, fallbackName = 'species-media.jpg') {
  const normalizedUri = localUri.startsWith('file://')
    ? localUri
    : `file:///${localUri.replace(/\\/g, '/')}`;
  const name = normalizedUri.split('/').pop() || fallbackName;

  return {
    uri: normalizedUri,
    name,
    type: inferFileMimeType(name),
  };
}

function inferFileMimeType(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'mp4':
      return 'video/mp4';
    case 'mov':
      return 'video/quicktime';
    case 'webm':
      return 'video/webm';
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'm4a':
      return 'audio/mp4';
    case 'aac':
      return 'audio/aac';
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
}

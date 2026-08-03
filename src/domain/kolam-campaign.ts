/**
 * Kolam backoffice Campaign (`/campaign`) — FE Kampanye list/create/detail/edit.
 * Source of truth: FE `types/campaign.ts` + create form (ID copy) + BE `/api/campaign`.
 * DARA SEO / Market Intel under `/campaign/dara-*` are separate modules.
 */

import type { KolamBadgeIntent } from './kolam-badge';
import { formatKolamIsoDate, isKolamIsoDate, parseKolamIsoDate } from './kolam-date';

export const KOLAM_CAMPAIGN_ROOT = '/campaign';
export const KOLAM_CAMPAIGN_CREATE_ROUTE = `${KOLAM_CAMPAIGN_ROOT}/create`;

export type KolamCampaignStatus = 'on_planning' | 'on_going' | 'ended';
export type KolamCampaignDiscountType = 'fixed' | 'percentage';

export type KolamCampaignProductRef = {
  productId: string;
  variantIds: string[];
};

/** Enrichment from GET /campaign/:id (display + edit seed). */
export type KolamCampaignProductSnapshot = {
  id: string;
  name: string;
  sku: string;
  thumbnailUri: string;
  price: number;
  priceToSell: number;
  onlinePrice: number;
  variants: KolamCampaignVariantSnapshot[];
};

export type KolamCampaignVariantSnapshot = {
  id: string;
  label: string;
  sku: string;
  tier1Value: string;
  tier2Value: string;
  price: number;
  priceToSell: number;
  onlinePrice: number;
};

export type KolamCampaignProductEntry = KolamCampaignProductRef & {
  product?: KolamCampaignProductSnapshot | null;
  variantDetails?: KolamCampaignVariantSnapshot[];
};

export type KolamCampaign = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  discountType: KolamCampaignDiscountType;
  discountValue: number;
  products: KolamCampaignProductEntry[];
  status: KolamCampaignStatus;
  createdAt?: string;
  updatedAt?: string;
  raw: unknown;
};

export type KolamCampaignListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: KolamCampaignStatus | '';
};

export type KolamCampaignListResult = {
  items: KolamCampaign[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/** Form uses YYYY-MM-DD for dates (KolamDateField) and string for discount input. */
export type KolamCampaignFormState = {
  title: string;
  startDate: string;
  endDate: string;
  discountType: KolamCampaignDiscountType;
  discountValue: string;
  status: KolamCampaignStatus;
  products: KolamCampaignProductRef[];
};

export type KolamCampaignSaveBody = {
  title: string;
  startDate: string;
  endDate: string;
  discountType: KolamCampaignDiscountType;
  discountValue: number;
  products: KolamCampaignProductRef[];
  status: KolamCampaignStatus;
};

/** Slim catalog row for product picker (from GET /products). */
export type KolamCampaignProductOption = {
  id: string;
  name: string;
  sku: string;
  thumbnailUri: string;
  priceLabel: string;
  variants: Array<{
    id: string;
    label: string;
    sku: string;
  }>;
};

export const KOLAM_CAMPAIGN_STATUS_FILTER_OPTIONS: Array<{
  label: string;
  value: '' | KolamCampaignStatus;
}> = [
  { label: 'Semua Status', value: '' },
  { label: 'Perencanaan', value: 'on_planning' },
  { label: 'Berlangsung', value: 'on_going' },
  { label: 'Berakhir', value: 'ended' },
];

export const KOLAM_CAMPAIGN_STATUS_FORM_OPTIONS: Array<{
  label: string;
  value: KolamCampaignStatus;
}> = [
  { label: 'Perencanaan', value: 'on_planning' },
  { label: 'Berlangsung', value: 'on_going' },
  { label: 'Berakhir', value: 'ended' },
];

export const KOLAM_CAMPAIGN_DISCOUNT_TYPE_OPTIONS: Array<{
  label: string;
  value: KolamCampaignDiscountType;
}> = [
  { label: 'Nominal Tetap', value: 'fixed' },
  { label: 'Persentase', value: 'percentage' },
];

export type KolamCampaignRouteMode = 'list' | 'detail' | 'edit' | 'new';

function isKolamCampaignDaraSegment(segment: string): boolean {
  return segment.startsWith('dara-');
}

export function isKolamCampaignRoute(route: string): boolean {
  const path = route.split('?')[0].replace(/\/+$/, '') || '/';
  if (path === KOLAM_CAMPAIGN_ROOT || path === KOLAM_CAMPAIGN_CREATE_ROUTE) {
    return true;
  }
  const editMatch = /^\/campaign\/([^/]+)\/edit$/.exec(path);
  if (editMatch?.[1] && !isKolamCampaignDaraSegment(editMatch[1])) {
    return true;
  }
  const detailMatch = /^\/campaign\/([^/]+)$/.exec(path);
  if (detailMatch?.[1] && !isKolamCampaignDaraSegment(detailMatch[1])) {
    return true;
  }
  return false;
}

export function getKolamCampaignRouteMode(route: string): KolamCampaignRouteMode {
  const path = route.split('?')[0].replace(/\/+$/, '') || '/';
  if (path === KOLAM_CAMPAIGN_CREATE_ROUTE) {
    return 'new';
  }
  if (/^\/campaign\/[^/]+\/edit$/.test(path)) {
    return 'edit';
  }
  if (
    /^\/campaign\/[^/]+$/.test(path) &&
    path !== KOLAM_CAMPAIGN_ROOT &&
    path !== KOLAM_CAMPAIGN_CREATE_ROUTE
  ) {
    return 'detail';
  }
  return 'list';
}

export function getKolamCampaignIdFromRoute(route: string): string | null {
  const path = route.split('?')[0];
  const editMatch = /^\/campaign\/([^/]+)\/edit$/.exec(path);
  if (editMatch?.[1] && !isKolamCampaignDaraSegment(editMatch[1])) {
    return decodeURIComponent(editMatch[1]);
  }
  const detailMatch = /^\/campaign\/([^/]+)$/.exec(path);
  if (
    detailMatch?.[1] &&
    detailMatch[1] !== 'create' &&
    !isKolamCampaignDaraSegment(detailMatch[1])
  ) {
    return decodeURIComponent(detailMatch[1]);
  }
  return null;
}

export function buildKolamCampaignDetailRoute(id: string): string {
  return `${KOLAM_CAMPAIGN_ROOT}/${encodeURIComponent(id)}`;
}

export function buildKolamCampaignEditRoute(id: string): string {
  return `${KOLAM_CAMPAIGN_ROOT}/${encodeURIComponent(id)}/edit`;
}

/** FE list status badge label. */
export function formatKolamCampaignStatusLabel(
  status?: string | null,
): string {
  switch (String(status || '').toLowerCase()) {
    case 'on_going':
      return 'Berlangsung';
    case 'on_planning':
      return 'Perencanaan';
    case 'ended':
      return 'Berakhir';
    default:
      return status || '—';
  }
}

export function getKolamCampaignStatusIntent(
  status?: string | null,
): KolamBadgeIntent {
  switch (String(status || '').toLowerCase()) {
    case 'on_going':
      return 'success';
    case 'on_planning':
      return 'warning';
    case 'ended':
      return 'secondary';
    default:
      return 'secondary';
  }
}

export function formatKolamCampaignDiscountTypeLabel(
  type?: string | null,
): string {
  switch (String(type || '').toLowerCase()) {
    case 'percentage':
      return 'persentase';
    case 'fixed':
      return 'nominal tetap';
    default:
      return type || '—';
  }
}

/** FE list Diskon cell. */
export function formatKolamCampaignDiscountLabel(campaign: {
  discountType?: string | null;
  discountValue?: number | null;
}): string {
  const value = Number(campaign.discountValue);
  const amount = Number.isFinite(value) ? value : 0;
  if (String(campaign.discountType || '').toLowerCase() === 'percentage') {
    return `${amount}% diskon`;
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Compact discount for detail header (FE notation compact for fixed). */
export function formatKolamCampaignDiscountCompact(campaign: {
  discountType?: string | null;
  discountValue?: number | null;
}): string {
  const value = Number(campaign.discountValue);
  const amount = Number.isFinite(value) ? value : 0;
  if (String(campaign.discountType || '').toLowerCase() === 'percentage') {
    return `${amount}%`;
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    notation: 'compact',
  }).format(amount);
}

/** FE list Durasi — ceil(|end−start| / day). */
export function formatKolamCampaignDurationLabel(campaign: {
  startDate?: string | null;
  endDate?: string | null;
}): string {
  const days = getKolamCampaignDurationDays(campaign);
  return days == null ? '—' : `${days} hari`;
}

export function getKolamCampaignDurationDays(campaign: {
  startDate?: string | null;
  endDate?: string | null;
}): number | null {
  const start = Date.parse(String(campaign.startDate || ''));
  const end = Date.parse(String(campaign.endDate || ''));
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return null;
  }
  return Math.ceil(Math.abs(end - start) / 86_400_000);
}

export function getKolamCampaignDaysLeft(campaign: {
  endDate?: string | null;
  status?: string | null;
}): number | null {
  if (String(campaign.status || '').toLowerCase() !== 'on_going') {
    return null;
  }
  const end = Date.parse(String(campaign.endDate || ''));
  if (!Number.isFinite(end)) {
    return null;
  }
  return Math.ceil((end - Date.now()) / 86_400_000);
}

export function countKolamCampaignVariants(campaign: {
  products?: Array<{ variantIds?: string[] | null }> | null;
}): number {
  const products = campaign.products ?? [];
  return products.reduce(
    (sum, product) =>
      sum + (Array.isArray(product.variantIds) ? product.variantIds.length : 0),
    0,
  );
}

export function formatKolamCampaignDateTimeParts(value?: string | null): {
  date: string;
  time: string;
} {
  const parsed = Date.parse(String(value || ''));
  if (!Number.isFinite(parsed)) {
    return { date: '—', time: '' };
  }
  const date = new Date(parsed);
  return {
    date: date.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

export function formatKolamCampaignCreatedAt(value?: string | null): string {
  const parsed = Date.parse(String(value || ''));
  if (!Number.isFinite(parsed)) {
    return '—';
  }
  return new Date(parsed).toLocaleDateString();
}

export function formatKolamCampaignFullDatetime(value?: string | null): string {
  const parsed = Date.parse(String(value || ''));
  if (!Number.isFinite(parsed)) {
    return '—';
  }
  return new Date(parsed).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Seed form date from stored Instant.
 * Prefer local calendar day (matches FE detail `toLocaleDateString` and create
 * `getLocalTimeZone()` midnight), not UTC `split('T')[0]` which shifts WIB dates.
 */
export function kolamCampaignApiDateToFormDate(value?: string | null): string {
  if (!value) {
    return '';
  }
  const trimmed = String(value).trim();
  const parsed = Date.parse(trimmed);
  if (Number.isFinite(parsed)) {
    return formatKolamIsoDate(new Date(parsed));
  }
  const part = trimmed.split('T')[0] ?? '';
  return isKolamIsoDate(part) ? part : '';
}

/**
 * FE: CalendarDate → local midnight → toISOString().
 * `parseKolamIsoDate` builds local midnight; toISOString matches FE getLocalTimeZone().
 */
export function kolamCampaignFormDateToApiIso(dateOnly: string): string {
  const date = parseKolamIsoDate(dateOnly);
  if (!date) {
    return '';
  }
  return date.toISOString();
}

export function createEmptyKolamCampaignFormState(): KolamCampaignFormState {
  return {
    title: '',
    startDate: '',
    endDate: '',
    discountType: 'fixed',
    discountValue: '0',
    status: 'on_planning',
    products: [{ productId: '', variantIds: [] }],
  };
}

export function createKolamCampaignFormState(
  campaign: KolamCampaign,
): KolamCampaignFormState {
  const products =
    campaign.products.length > 0
      ? campaign.products.map(product => ({
          productId: product.productId,
          variantIds: [...product.variantIds],
        }))
      : [{ productId: '', variantIds: [] }];

  return {
    title: campaign.title === '—' ? '' : campaign.title,
    startDate: kolamCampaignApiDateToFormDate(campaign.startDate),
    endDate: kolamCampaignApiDateToFormDate(campaign.endDate),
    discountType: campaign.discountType,
    discountValue: String(campaign.discountValue ?? 0),
    status: campaign.status,
    products,
  };
}

export function validateKolamCampaignForm(
  form: KolamCampaignFormState,
): string | null {
  if (!form.title.trim()) {
    return 'Judul kampanye wajib diisi';
  }
  if (!form.startDate || !isKolamIsoDate(form.startDate)) {
    return 'Tanggal mulai wajib diisi';
  }
  if (!form.endDate || !isKolamIsoDate(form.endDate)) {
    return 'Tanggal selesai wajib diisi';
  }
  const start = parseKolamIsoDate(form.startDate);
  const end = parseKolamIsoDate(form.endDate);
  if (!start || !end || start.getTime() >= end.getTime()) {
    return 'Tanggal selesai harus setelah tanggal mulai';
  }
  const discountValue = Number(form.discountValue);
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    return 'Nilai diskon harus lebih dari 0';
  }
  if (form.discountType === 'percentage' && discountValue > 100) {
    return 'Diskon persentase tidak boleh melebihi 100%';
  }
  const validProducts = form.products.filter(product => product.productId.trim());
  if (validProducts.length === 0) {
    return 'Pilih minimal satu produk';
  }
  return null;
}

export function createKolamCampaignSavePayload(
  form: KolamCampaignFormState,
): KolamCampaignSaveBody {
  return {
    title: form.title.trim(),
    startDate: kolamCampaignFormDateToApiIso(form.startDate),
    endDate: kolamCampaignFormDateToApiIso(form.endDate),
    discountType: form.discountType,
    discountValue: Number(form.discountValue) || 0,
    products: form.products
      .filter(product => product.productId.trim())
      .map(product => ({
        productId: product.productId.trim(),
        variantIds: product.variantIds.filter(Boolean),
      })),
    status: form.status,
  };
}

/** FE detail: price_to_sell ?? onlinePrice ?? price. */
export function getKolamCampaignDisplayPrice(item?: {
  price?: number | null;
  priceToSell?: number | null;
  onlinePrice?: number | null;
  price_to_sell?: number | null;
} | null): number | null {
  if (!item) {
    return null;
  }
  const candidates = [
    item.priceToSell,
    item.price_to_sell,
    item.onlinePrice,
    item.price,
  ];
  for (const value of candidates) {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value;
    }
  }
  return null;
}

export function calculateKolamCampaignPrice(
  price: number,
  campaign: { discountType?: string | null; discountValue?: number | null },
): number {
  const discountValue = Number(campaign.discountValue);
  const amount = Number.isFinite(discountValue) ? discountValue : 0;
  if (String(campaign.discountType || '').toLowerCase() === 'percentage') {
    return Math.max(Math.round(price * (1 - amount / 100)), 0);
  }
  return Math.max(price - amount, 0);
}

export function formatKolamCampaignPriceRange(
  items: Array<{
    price?: number | null;
    priceToSell?: number | null;
    onlinePrice?: number | null;
    price_to_sell?: number | null;
  }>,
  campaign: { discountType?: string | null; discountValue?: number | null },
): { original: string | null; campaign: string | null } {
  const prices = items
    .map(item => getKolamCampaignDisplayPrice(item))
    .filter((price): price is number => typeof price === 'number' && price > 0);

  if (prices.length === 0) {
    return { original: null, campaign: null };
  }

  const discounted = prices.map(price =>
    calculateKolamCampaignPrice(price, campaign),
  );
  const formatMoney = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatRange = (min: number, max: number) =>
    min === max ? formatMoney(min) : `${formatMoney(min)} - ${formatMoney(max)}`;

  return {
    original: formatRange(Math.min(...prices), Math.max(...prices)),
    campaign: formatRange(Math.min(...discounted), Math.max(...discounted)),
  };
}

export function mapKolamProductToCampaignOption(product: {
  id: string;
  name: string;
  sku: string;
  thumbnailUri?: string;
  price?: number;
  priceToSell?: number;
  onlinePrice?: number;
  variants?: Array<{
    id: string;
    label: string;
    sku: string;
    price?: number;
    priceToSell?: number;
    onlinePrice?: number;
  }>;
}): KolamCampaignProductOption {
  const variants = product.variants ?? [];
  let priceLabel = '';
  if (variants.length > 0) {
    const variantPrices = variants
      .map(variant =>
        getKolamCampaignDisplayPrice({
          price: variant.price,
          priceToSell: variant.priceToSell,
          onlinePrice: variant.onlinePrice,
        }),
      )
      .filter((price): price is number => typeof price === 'number');
    if (variantPrices.length > 0) {
      const min = Math.min(...variantPrices);
      const max = Math.max(...variantPrices);
      const formatMoney = (value: number) =>
        new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      priceLabel =
        min === max
          ? formatMoney(min)
          : `${formatMoney(min)} - ${formatMoney(max)}`;
    }
  } else {
    const single = getKolamCampaignDisplayPrice(product);
    if (single != null) {
      priceLabel = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(single);
    }
  }

  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    thumbnailUri: product.thumbnailUri ?? '',
    priceLabel,
    variants: variants.map(variant => ({
      id: variant.id,
      label: variant.label,
      sku: variant.sku,
    })),
  };
}

export function seedKolamCampaignProductOptionsFromCampaign(
  campaign: KolamCampaign,
): KolamCampaignProductOption[] {
  return campaign.products
    .map(entry => {
      const product = entry.product;
      if (!product) {
        return null;
      }
      return mapKolamProductToCampaignOption(product);
    })
    .filter((item): item is KolamCampaignProductOption => Boolean(item));
}

export function normalizeKolamCampaign(payload: unknown): KolamCampaign {
  const root = asRecord(payload);
  const nested = asRecord(root.data);
  const looksLikeCampaign = Boolean(
    root._id || root.id || root.title || root.startDate,
  );
  const record =
    !looksLikeCampaign && Object.keys(nested).length > 0 ? nested : root;

  const productsRaw = Array.isArray(record.products) ? record.products : [];
  const products = productsRaw
    .map(normalizeProductEntry)
    .filter(Boolean) as KolamCampaignProductEntry[];

  return {
    id: getMongoId(record, '_id') || getMongoId(record, 'id'),
    title: getString(record, 'title') || '—',
    startDate: stringifyDate(record.startDate),
    endDate: stringifyDate(record.endDate),
    discountType: normalizeDiscountType(getString(record, 'discountType')),
    discountValue: getNumber(record, 'discountValue') ?? 0,
    products,
    status: normalizeStatus(getString(record, 'status')),
    createdAt: stringifyDate(record.createdAt) || undefined,
    updatedAt: stringifyDate(record.updatedAt) || undefined,
    raw: payload,
  };
}

/**
 * BE: `{ total, page, limit, campaigns }` (no nested pagination / data envelope).
 * FE still sends `search`; BE ignores it — preserve FE wiring.
 */
export function normalizeKolamCampaignList(
  payload: unknown,
  query: KolamCampaignListQuery = {},
): KolamCampaignListResult {
  const root = asRecord(payload);
  const list: unknown[] = Array.isArray(root.campaigns)
    ? root.campaigns
    : Array.isArray(root.data)
      ? root.data
      : Array.isArray(payload)
        ? payload
        : [];

  const limit = query.limit ?? getNumber(root, 'limit') ?? 10;
  const page = query.page ?? getNumber(root, 'page') ?? 1;
  const total = getNumber(root, 'total') ?? list.length;
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return {
    items: list
      .map(row => {
        try {
          return normalizeKolamCampaign(row);
        } catch {
          return null;
        }
      })
      .filter((item): item is KolamCampaign => Boolean(item?.id)),
    page,
    limit,
    total,
    totalPages,
  };
}

function normalizeProductEntry(value: unknown): KolamCampaignProductEntry | null {
  const record = asRecord(value);
  const productId =
    getMongoId(record, 'productId') ||
    getMongoId(asRecord(record.product), '_id') ||
    getMongoId(asRecord(record.product), 'id');
  if (!productId) {
    return null;
  }
  const variantRaw = Array.isArray(record.variantIds) ? record.variantIds : [];
  const variantIds = variantRaw
    .map(entry => {
      if (typeof entry === 'string' || typeof entry === 'number') {
        return String(entry).trim();
      }
      const nested = asRecord(entry);
      return getMongoId(nested, '_id') || getMongoId(nested, 'id');
    })
    .filter(Boolean);

  const productRecord = asRecord(record.product);
  const product =
    Object.keys(productRecord).length > 0
      ? normalizeProductSnapshot(productRecord)
      : null;

  const variantDetailsRaw = Array.isArray(record.variantDetails)
    ? record.variantDetails
    : [];
  const variantDetails = variantDetailsRaw
    .map(normalizeVariantSnapshot)
    .filter(Boolean) as KolamCampaignVariantSnapshot[];

  return {
    productId,
    variantIds,
    product,
    variantDetails: variantDetails.length > 0 ? variantDetails : undefined,
  };
}

function normalizeProductSnapshot(
  record: Record<string, unknown>,
): KolamCampaignProductSnapshot {
  const variantsRaw = Array.isArray(record.variants) ? record.variants : [];
  const variants = variantsRaw
    .map(normalizeVariantSnapshot)
    .filter(Boolean) as KolamCampaignVariantSnapshot[];
  const photos = Array.isArray(record.photos)
    ? record.photos.map(entry => String(entry || '').trim()).filter(Boolean)
    : [];
  const thumbnail =
    getString(record, 'thumbnailImage') ||
    getString(record, 'thumbnailUri') ||
    photos[0] ||
    '';

  return {
    id: getMongoId(record, '_id') || getMongoId(record, 'id'),
    name: getString(record, 'name') || '—',
    sku: getString(record, 'sku'),
    thumbnailUri: thumbnail,
    price: getNumber(record, 'price') ?? 0,
    priceToSell:
      getNumber(record, 'price_to_sell') ?? getNumber(record, 'priceToSell') ?? 0,
    onlinePrice: getNumber(record, 'onlinePrice') ?? 0,
    variants,
  };
}

function normalizeVariantSnapshot(
  value: unknown,
): KolamCampaignVariantSnapshot | null {
  const record = asRecord(value);
  const id = getMongoId(record, '_id') || getMongoId(record, 'id');
  if (!id) {
    return null;
  }
  const tier1Value = getString(record, 'tier1Value');
  const tier2Value = getString(record, 'tier2Value');
  const label =
    getString(record, 'label') ||
    [tier1Value, tier2Value].filter(Boolean).join(' - ') ||
    id;

  return {
    id,
    label,
    sku: getString(record, 'sku'),
    tier1Value,
    tier2Value,
    price: getNumber(record, 'price') ?? 0,
    priceToSell:
      getNumber(record, 'price_to_sell') ?? getNumber(record, 'priceToSell') ?? 0,
    onlinePrice: getNumber(record, 'onlinePrice') ?? 0,
  };
}

function normalizeStatus(value: string): KolamCampaignStatus {
  const key = value.toLowerCase();
  if (key === 'on_going' || key === 'on_planning' || key === 'ended') {
    return key;
  }
  return 'on_planning';
}

function normalizeDiscountType(value: string): KolamCampaignDiscountType {
  return value.toLowerCase() === 'percentage' ? 'percentage' : 'fixed';
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function getString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return '';
}

function getNumber(record: Record<string, unknown>, key: string): number | null {
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

function getMongoId(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  if (value && typeof value === 'object') {
    const nested = asRecord(value);
    if (typeof nested.$oid === 'string') {
      return nested.$oid.trim();
    }
    if (typeof nested.toString === 'function') {
      const text = String(value);
      if (text && text !== '[object Object]') {
        return text;
      }
    }
  }
  return '';
}

function stringifyDate(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString();
  }
  if (value && typeof value === 'object') {
    const record = asRecord(value);
    if (typeof record.$date === 'string') {
      return record.$date;
    }
  }
  return '';
}

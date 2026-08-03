/**
 * Kolam backoffice Campaign (`/campaign`) — FE Kampanye list.
 * Source of truth: FE `types/campaign.ts` + BE `/api/campaign`.
 * DARA SEO / Market Intel under `/campaign/dara-*` are separate modules.
 */

import type { KolamBadgeIntent } from './kolam-badge';

export const KOLAM_CAMPAIGN_ROOT = '/campaign';
export const KOLAM_CAMPAIGN_CREATE_ROUTE = `${KOLAM_CAMPAIGN_ROOT}/create`;

export type KolamCampaignStatus = 'on_planning' | 'on_going' | 'ended';
export type KolamCampaignDiscountType = 'fixed' | 'percentage';

export type KolamCampaignProductRef = {
  productId: string;
  variantIds: string[];
};

export type KolamCampaign = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  discountType: KolamCampaignDiscountType;
  discountValue: number;
  products: KolamCampaignProductRef[];
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

export const KOLAM_CAMPAIGN_STATUS_FILTER_OPTIONS: Array<{
  label: string;
  value: '' | KolamCampaignStatus;
}> = [
  { label: 'Semua Status', value: '' },
  { label: 'Perencanaan', value: 'on_planning' },
  { label: 'Berlangsung', value: 'on_going' },
  { label: 'Berakhir', value: 'ended' },
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

/** FE list Durasi — ceil(|end−start| / day). */
export function formatKolamCampaignDurationLabel(campaign: {
  startDate?: string | null;
  endDate?: string | null;
}): string {
  const start = Date.parse(String(campaign.startDate || ''));
  const end = Date.parse(String(campaign.endDate || ''));
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return '—';
  }
  const days = Math.max(1, Math.ceil(Math.abs(end - start) / 86_400_000));
  return `${days} hari`;
}

export function countKolamCampaignVariants(campaign: {
  products?: Array<{ variantIds?: string[] | null }> | null;
}): number {
  const products = campaign.products ?? [];
  return products.reduce(
    (sum, product) => sum + (Array.isArray(product.variantIds) ? product.variantIds.length : 0),
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

export function normalizeKolamCampaign(payload: unknown): KolamCampaign {
  const root = asRecord(payload);
  const nested = asRecord(root.data);
  const looksLikeCampaign = Boolean(
    root._id || root.id || root.title || root.startDate,
  );
  const record =
    !looksLikeCampaign && Object.keys(nested).length > 0 ? nested : root;

  const productsRaw = Array.isArray(record.products) ? record.products : [];
  const products = productsRaw.map(normalizeProductRef).filter(Boolean) as KolamCampaignProductRef[];

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

function normalizeProductRef(value: unknown): KolamCampaignProductRef | null {
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
  return { productId, variantIds };
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

/**
 * Native Layanan module (JungleSystem).
 * SoT: DA-Layanan-Plugin admin + FE layanan-routes / GET /service.
 * Batch 1: route helpers + service catalog list normalizers.
 */

export const KOLAM_LAYANAN_ROOT = '/layanan';

export const KOLAM_LAYANAN_LIST_TABS = [
  { id: 'daftar', label: 'Daftar layanan', href: KOLAM_LAYANAN_ROOT },
  {
    id: 'operasional',
    label: 'Operasional Layanan',
    href: `${KOLAM_LAYANAN_ROOT}?tab=operasional`,
  },
  {
    id: 'langganan',
    label: 'Langganan',
    href: `${KOLAM_LAYANAN_ROOT}?tab=langganan`,
  },
] as const;

export type KolamLayananListTab =
  (typeof KOLAM_LAYANAN_LIST_TABS)[number]['id'];

export type KolamLayananSurfaceMode =
  | 'list'
  | 'create'
  | 'detail'
  | 'edit'
  | 'langganan'
  | 'voucher'
  | 'execution'
  | 'unsupported';

export type KolamLayananTaskType = 'dosing' | 'maintenance' | string;

export interface KolamLayananServiceBrandRef {
  id: string;
  name: string;
}

export interface KolamLayananService {
  id: string;
  name: string;
  sku: string;
  packageCode: string;
  brands: KolamLayananServiceBrandRef[];
  taskType: string | null;
  priceM3: number | null;
  priceKm: number | null;
  priceToSell: number | null;
  sellable: boolean;
  createdAt?: string;
  updatedAt?: string;
  raw: unknown;
}

export interface KolamLayananServiceListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'name' | 'price' | 'price_to_sell' | 'price_m3' | 'price_km';
  sortOrder?: 'asc' | 'desc';
  sellable?: boolean;
}

export interface KolamLayananServiceListResult {
  items: KolamLayananService[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function normalizeKolamLayananPath(route: string) {
  const path = route.trim().split('?')[0] || '';
  if (!path) {
    return '';
  }
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

export function isKolamLayananNativeRoute(route: string) {
  const path = normalizeKolamLayananPath(route);
  return path === KOLAM_LAYANAN_ROOT || path.startsWith(`${KOLAM_LAYANAN_ROOT}/`);
}

export function getKolamLayananListTab(route: string): KolamLayananListTab {
  const queryIndex = route.indexOf('?');
  if (queryIndex < 0) {
    return 'daftar';
  }
  const params = new URLSearchParams(route.slice(queryIndex + 1));
  const tab = params.get('tab');
  if (tab === 'operasional' || tab === 'langganan') {
    return tab;
  }
  return 'daftar';
}

export function getKolamLayananTabHref(tab: KolamLayananListTab) {
  const item = KOLAM_LAYANAN_LIST_TABS.find(entry => entry.id === tab);
  return item?.href ?? KOLAM_LAYANAN_ROOT;
}

export function getKolamLayananRouteMode(
  route: string,
): KolamLayananSurfaceMode {
  const path = normalizeKolamLayananPath(route);
  if (!isKolamLayananNativeRoute(path)) {
    return 'unsupported';
  }
  if (path === KOLAM_LAYANAN_ROOT) {
    return 'list';
  }
  if (path === `${KOLAM_LAYANAN_ROOT}/create`) {
    return 'create';
  }
  if (/^\/layanan\/langganan\/[^/]+$/.test(path)) {
    return 'langganan';
  }
  if (/^\/layanan\/voucher\/[^/]+\/execution\/[^/]+$/.test(path)) {
    return 'execution';
  }
  if (/^\/layanan\/voucher\/[^/]+$/.test(path)) {
    return 'voucher';
  }
  if (/^\/layanan\/[^/]+\/edit$/.test(path)) {
    return 'edit';
  }
  if (/^\/layanan\/[^/]+$/.test(path)) {
    return 'detail';
  }
  return 'unsupported';
}

export function getKolamLayananServiceIdFromRoute(route: string): string | null {
  const path = normalizeKolamLayananPath(route);
  const editMatch = path.match(/^\/layanan\/([^/]+)\/edit$/);
  if (editMatch?.[1] && editMatch[1] !== 'create') {
    return editMatch[1];
  }
  const detailMatch = path.match(/^\/layanan\/([^/]+)$/);
  if (
    detailMatch?.[1] &&
    detailMatch[1] !== 'create' &&
    detailMatch[1] !== 'langganan' &&
    detailMatch[1] !== 'voucher'
  ) {
    return detailMatch[1];
  }
  return null;
}

export function getKolamLayananTaskTypeLabel(taskType?: string | null) {
  if (!taskType) {
    return '—';
  }
  if (taskType === 'dosing') {
    return 'Dosing';
  }
  if (taskType === 'maintenance') {
    return 'Pemeliharaan';
  }
  return taskType;
}

export function formatKolamLayananUnitPrice(
  value: number | null | undefined,
  unit: 'm3' | 'km',
) {
  if (value == null || !Number.isFinite(value)) {
    return '—';
  }
  const suffix = unit === 'm3' ? '/m³' : '/km';
  return `${formatCompactIdr(value)}${suffix}`;
}

function formatCompactIdr(value: number) {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}Jt`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}Rb`;
  }
  return value.toLocaleString('id-ID');
}

export function normalizeKolamLayananService(payload: unknown): KolamLayananService {
  const record = asRecord(unwrapData(payload));
  const brandsRaw = record.brand;
  const brands: KolamLayananServiceBrandRef[] = [];
  if (Array.isArray(brandsRaw)) {
    brandsRaw.forEach(item => {
      if (typeof item === 'string' && item.trim()) {
        brands.push({ id: item, name: item });
        return;
      }
      const brandRecord = asRecord(item);
      const id =
        getString(brandRecord, '_id') || getString(brandRecord, 'id') || '';
      const name = getString(brandRecord, 'name') || id;
      if (id || name) {
        brands.push({ id: id || name, name: name || id });
      }
    });
  } else if (typeof brandsRaw === 'string' && brandsRaw.trim()) {
    brands.push({ id: brandsRaw, name: brandsRaw });
  } else if (brandsRaw && typeof brandsRaw === 'object') {
    const brandRecord = asRecord(brandsRaw);
    const id =
      getString(brandRecord, '_id') || getString(brandRecord, 'id') || '';
    const name = getString(brandRecord, 'name') || id;
    if (id || name) {
      brands.push({ id: id || name, name: name || id });
    }
  }

  return {
    id: getString(record, '_id') || getString(record, 'id'),
    name: getString(record, 'name') || '—',
    sku: getString(record, 'sku') || '—',
    packageCode: getString(record, 'packageCode') || '—',
    brands,
    taskType: getString(record, 'taskType') || null,
    priceM3: getNumber(record, 'price_m3'),
    priceKm: getNumber(record, 'price_km'),
    priceToSell: getNumber(record, 'price_to_sell'),
    sellable: getBoolean(record, 'sellable') ?? true,
    createdAt: getString(record, 'createdAt') || undefined,
    updatedAt: getString(record, 'updatedAt') || undefined,
    raw: payload,
  };
}

export function normalizeKolamLayananServiceList(
  payload: unknown,
  query: KolamLayananServiceListQuery = {},
): KolamLayananServiceListResult {
  // BE/FE shape: `{ data: Service[], pagination: { page, limit, total, totalPages } }`.
  const outer = asRecord(payload);
  const nested = asRecord(outer.data);
  const list: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray(outer.data)
      ? outer.data
      : Array.isArray(nested.data)
        ? nested.data
        : Array.isArray(nested.items)
          ? nested.items
          : Array.isArray(outer.items)
            ? outer.items
            : [];

  const pagination = asRecord(outer.pagination ?? nested.pagination ?? null);
  const limit = query.limit ?? getNumber(pagination, 'limit') ?? 10;
  const page = query.page ?? getNumber(pagination, 'page') ?? 1;
  const total =
    getNumber(pagination, 'total') ??
    getNumber(pagination, 'totalItems') ??
    list.length;
  const totalPages =
    getNumber(pagination, 'totalPages') ??
    Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return {
    items: list
      .map(normalizeKolamLayananService)
      .filter(item => Boolean(item.id)),
    page,
    limit,
    total,
    totalPages,
  };
}

function unwrapData(payload: unknown): unknown {
  const record = asRecord(payload);
  if ('data' in record && !Array.isArray(payload)) {
    const nested = record.data;
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      const nestedRecord = asRecord(nested);
      if ('data' in nestedRecord || '_id' in nestedRecord || 'id' in nestedRecord) {
        return nested;
      }
    }
    return nested;
  }
  return payload;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
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
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getBoolean(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === 'true' || value === 1 || value === '1') {
    return true;
  }
  if (value === 'false' || value === 0 || value === '0') {
    return false;
  }
  return null;
}

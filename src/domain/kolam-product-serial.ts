/**
 * Product Serials (Serial Produk) domain — mirror FE `types/product-serial.ts` +
 * BE `controllers/product-serial/product-serial.controllers.js`.
 *
 * KNOWN GAPS (RNW vs FE Kolam — do not invent BE fixes):
 * - Only list + stock opname are ported (no serial detail page, no opname report page).
 * - No customer/sale linkage display (FE detail-only fields, not surfaced in list/opname).
 */

export type KolamProductSerialProductType = 'freyer' | 'enclonura' | 'general';
export type KolamProductSerialStatus = 'in-stock' | 'sold' | 'void';
export type KolamProductSerialOpnameStatus = 'found' | 'missing' | null;

export interface KolamProductSerialProductRef {
  id: string;
  name: string;
  sku: string;
}

export interface KolamProductSerialProductionRef {
  id: string;
  batchId: string;
  quantity: number;
  completedQuantity: number;
  productionDate?: string;
}

export interface KolamProductSerial {
  id: string;
  serialNumber: string;
  product: KolamProductSerialProductRef | null;
  production: KolamProductSerialProductionRef | null;
  productType: KolamProductSerialProductType | string;
  status: KolamProductSerialStatus | string;
  productionDate: string;
  registrationDate: string;
  qrCode: string;
  opnameStatus: KolamProductSerialOpnameStatus;
  opnameAt: string;
}

export interface KolamProductSerialListFilters {
  page: number;
  limit: number;
  search: string;
  productType: KolamProductSerialProductType | '';
  status: KolamProductSerialStatus | '';
  productId: string;
}

export interface KolamProductSerialPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface KolamProductSerialListResult {
  data: KolamProductSerial[];
  pagination: KolamProductSerialPagination;
}

export interface KolamProductSerialOpnameResultData {
  id: string;
  serialNumber: string;
  productType: KolamProductSerialProductType | string;
  status: KolamProductSerialStatus | string;
  productionDate: string;
  registrationDate: string;
  productName: string;
  productSku: string;
  batchId: string;
  opnameAt: string;
}

export interface KolamProductSerialOpnameResult {
  found: boolean;
  serialNumber: string;
  message: string;
  status?: KolamProductSerialStatus | string;
  data: KolamProductSerialOpnameResultData | null;
}

/* ──────────────────────────────────────────
   Routes
   ──────────────────────────────────────────*/

export const KOLAM_PRODUCT_SERIAL_ROOT = '/product-serials';

export type KolamProductSerialSurfaceMode = 'list' | 'opname';

export function isKolamProductSerialRoute(route: string) {
  const path = normalizeProductSerialRoutePath(route);
  return (
    path === KOLAM_PRODUCT_SERIAL_ROOT ||
    path.startsWith(`${KOLAM_PRODUCT_SERIAL_ROOT}/`)
  );
}

export function isKolamProductSerialListRoute(route: string) {
  return normalizeProductSerialRoutePath(route) === KOLAM_PRODUCT_SERIAL_ROOT;
}

export function isKolamProductSerialOpnameRoute(route: string) {
  return (
    normalizeProductSerialRoutePath(route) ===
    `${KOLAM_PRODUCT_SERIAL_ROOT}/opname`
  );
}

export function getKolamProductSerialSurfaceMode(
  route: string,
): KolamProductSerialSurfaceMode {
  return isKolamProductSerialOpnameRoute(route) ? 'opname' : 'list';
}

export function createInitialProductSerialListFilters(
  route: string,
): KolamProductSerialListFilters {
  const query = parseProductSerialRouteQuery(route);
  return {
    page: Math.max(1, Number(query.page || '1') || 1),
    limit: 20,
    search: query.search ?? '',
    productType: isKolamProductSerialProductType(query.productType)
      ? query.productType
      : '',
    status: isKolamProductSerialStatus(query.status) ? query.status : '',
    productId: query.productId ?? '',
  };
}

/* ──────────────────────────────────────────
   Labels & status helpers
   ──────────────────────────────────────────*/

export const KOLAM_PRODUCT_SERIAL_STATUS_LABELS: Record<
  KolamProductSerialStatus,
  string
> = {
  'in-stock': 'Tersedia',
  sold: 'Terjual',
  void: 'Batal',
};

export function getKolamProductSerialStatusLabel(status?: string | null) {
  if (isKolamProductSerialStatus(status)) {
    return KOLAM_PRODUCT_SERIAL_STATUS_LABELS[status];
  }
  return status?.trim().replace(/_/g, ' ') || '—';
}

export const KOLAM_PRODUCT_SERIAL_TYPE_LABELS: Record<
  KolamProductSerialProductType,
  string
> = {
  freyer: 'Freyer',
  enclonura: 'Enclonura',
  general: 'Umum',
};

export function getKolamProductSerialTypeLabel(type?: string | null) {
  if (isKolamProductSerialProductType(type)) {
    return KOLAM_PRODUCT_SERIAL_TYPE_LABELS[type];
  }
  return type?.trim() || '—';
}

export type KolamProductSerialBadgeIntent =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'muted';

export function getKolamProductSerialStatusIntent(
  status?: string | null,
): KolamProductSerialBadgeIntent {
  if (status === 'in-stock') return 'success';
  if (status === 'sold') return 'secondary';
  if (status === 'void') return 'danger';
  return 'muted';
}

export function getKolamProductSerialTypeIntent(
  type?: string | null,
): KolamProductSerialBadgeIntent {
  if (type === 'freyer') return 'warning';
  if (type === 'enclonura') return 'secondary';
  if (type === 'general') return 'primary';
  return 'muted';
}

export function getKolamProductSerialOpnameIntent(
  opnameStatus?: KolamProductSerialOpnameStatus,
): KolamProductSerialBadgeIntent {
  if (opnameStatus === 'found') return 'success';
  if (opnameStatus === 'missing') return 'danger';
  return 'muted';
}

export function getKolamProductSerialOpnameLabel(
  opnameStatus?: KolamProductSerialOpnameStatus,
) {
  if (opnameStatus === 'found') return 'Ditemukan';
  if (opnameStatus === 'missing') return 'Hilang';
  return '—';
}

const KOLAM_PRODUCT_SERIAL_STATUS_SET = new Set<KolamProductSerialStatus>([
  'in-stock',
  'sold',
  'void',
]);

export function isKolamProductSerialStatus(
  value?: string | null,
): value is KolamProductSerialStatus {
  return (
    Boolean(value) &&
    KOLAM_PRODUCT_SERIAL_STATUS_SET.has(value as KolamProductSerialStatus)
  );
}

const KOLAM_PRODUCT_SERIAL_PRODUCT_TYPE_SET =
  new Set<KolamProductSerialProductType>(['freyer', 'enclonura', 'general']);

export function isKolamProductSerialProductType(
  value?: string | null,
): value is KolamProductSerialProductType {
  return (
    Boolean(value) &&
    KOLAM_PRODUCT_SERIAL_PRODUCT_TYPE_SET.has(
      value as KolamProductSerialProductType,
    )
  );
}

/* ──────────────────────────────────────────
   Permissions — resource `stock-transaction`
   ──────────────────────────────────────────*/

export type KolamProductSerialPermissionAction = 'view' | 'opname';

export type KolamProductSerialPermissionEntry = {
  resource?: string;
  actions?: string[];
};

export function hasKolamProductSerialPermission(
  permissions: KolamProductSerialPermissionEntry[] | null | undefined,
  action: KolamProductSerialPermissionAction,
  roleKey?: string | null,
) {
  const normalizedRole = String(roleKey ?? '')
    .trim()
    .toLowerCase();
  if (
    normalizedRole === 'super_administrator' ||
    normalizedRole === 'super_admin' ||
    normalizedRole === 'super-admin'
  ) {
    return true;
  }
  if (permissions == null) {
    return true;
  }
  const wanted = action.toLowerCase();
  return permissions.some(permission => {
    const resource = String(permission.resource ?? '')
      .trim()
      .toLowerCase();
    const actions = (permission.actions ?? []).map(item =>
      String(item).trim().toLowerCase(),
    );
    return (
      (resource === 'stock-transaction' || resource === '*') &&
      (actions.includes(wanted) || actions.includes('*'))
    );
  });
}

/* ──────────────────────────────────────────
   Normalize
   ──────────────────────────────────────────*/

export function normalizeKolamProductSerial(payload: unknown): KolamProductSerial {
  const root = asRecord(payload);
  // Prefer the document itself when it already looks like a serial row.
  // Only unwrap `.data` for single-resource envelopes ({ data: serial }).
  const nested = asRecord(root.data);
  const looksLikeSerial =
    Boolean(getString(root, 'serialNumber')) ||
    Boolean(getString(root, '_id')) ||
    Boolean(getString(root, 'id'));
  const record = looksLikeSerial
    ? root
    : Object.keys(nested).length
      ? nested
      : root;

  return {
    id: getString(record, '_id') || getString(record, 'id'),
    serialNumber: getString(record, 'serialNumber'),
    product: normalizeProductSerialProductRef(record.productId),
    production: normalizeProductSerialProductionRef(record.productionId),
    productType: getString(record, 'productType'),
    status: getString(record, 'status') || 'in-stock',
    productionDate: getString(record, 'productionDate'),
    registrationDate: getString(record, 'registrationDate'),
    qrCode: getString(record, 'qrCode'),
    opnameStatus: normalizeOpnameStatus(record.opnameStatus),
    opnameAt: getString(record, 'opnameAt'),
  };
}

export function normalizeKolamProductSerialList(
  payload: unknown,
): KolamProductSerialListResult {
  const root = asRecord(payload);
  const nested = asRecord(root.data);
  const list: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray(root.data)
      ? root.data
      : Array.isArray(nested.data)
        ? nested.data
        : [];

  const data = list.map(normalizeKolamProductSerial).filter(item =>
    Boolean(item.id || item.serialNumber),
  );
  const paginationSource = root.pagination ?? nested.pagination;
  return {
    data,
    pagination: normalizeProductSerialPagination(paginationSource, data.length),
  };
}

export function normalizeKolamProductSerialOpnameResult(
  payload: unknown,
): KolamProductSerialOpnameResult {
  const record = asRecord(payload);
  const dataRecord = asRecord(record.data);
  const hasData = Object.keys(dataRecord).length > 0;

  return {
    found: record.found === true,
    serialNumber: getString(record, 'serialNumber'),
    message: getString(record, 'message'),
    status: getString(record, 'status') || undefined,
    data: hasData
      ? {
          id: getString(dataRecord, '_id') || getString(dataRecord, 'id'),
          serialNumber: getString(dataRecord, 'serialNumber'),
          productType: getString(dataRecord, 'productType'),
          status: getString(dataRecord, 'status'),
          productionDate: getString(dataRecord, 'productionDate'),
          registrationDate: getString(dataRecord, 'registrationDate'),
          productName: getString(dataRecord, 'productName'),
          productSku: getString(dataRecord, 'productSku'),
          batchId: getString(dataRecord, 'batchId'),
          opnameAt: getString(dataRecord, 'opnameAt'),
        }
      : null,
  };
}

function normalizeProductSerialProductRef(
  value: unknown,
): KolamProductSerialProductRef | null {
  if (value == null || value === '') {
    return null;
  }
  if (typeof value === 'string') {
    return { id: value, name: '', sku: '' };
  }
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  if (!id) {
    return null;
  }
  return {
    id,
    name: getString(record, 'name'),
    sku: getString(record, 'sku'),
  };
}

function normalizeProductSerialProductionRef(
  value: unknown,
): KolamProductSerialProductionRef | null {
  if (value == null || value === '') {
    return null;
  }
  if (typeof value === 'string') {
    return { id: value, batchId: '', quantity: 0, completedQuantity: 0 };
  }
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  if (!id) {
    return null;
  }
  return {
    id,
    batchId: getString(record, 'batchId'),
    quantity: getNumber(record, 'quantity') ?? 0,
    completedQuantity: getNumber(record, 'completedQuantity') ?? 0,
    productionDate: getString(record, 'productionDate') || undefined,
  };
}

function normalizeOpnameStatus(value: unknown): KolamProductSerialOpnameStatus {
  return value === 'found' || value === 'missing' ? value : null;
}

function normalizeProductSerialPagination(
  value: unknown,
  fallbackTotal: number,
): KolamProductSerialPagination {
  const record = asRecord(value);
  const page = getNumber(record, 'page') ?? 1;
  const limit = getNumber(record, 'limit') ?? (fallbackTotal || 20);
  const total = getNumber(record, 'total') ?? fallbackTotal;
  const totalPages =
    getNumber(record, 'totalPages') ??
    (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1);
  return { page, limit, total, totalPages };
}

function normalizeProductSerialRoutePath(route: string) {
  const path = route.trim().split('?')[0] || '';
  if (!path) {
    return '';
  }
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

function parseProductSerialRouteQuery(route: string) {
  const queryIndex = route.indexOf('?');
  if (queryIndex < 0) {
    return {} as Record<string, string>;
  }
  const params = new URLSearchParams(route.slice(queryIndex + 1));
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  if (value && typeof value === 'object') {
    const recordValue = value as {toString?: () => string; $oid?: string};
    if (typeof recordValue.$oid === 'string' && recordValue.$oid.trim()) {
      return recordValue.$oid.trim();
    }
    if (
      typeof recordValue.toString === 'function' &&
      recordValue.toString !== Object.prototype.toString
    ) {
      const text = String(recordValue.toString()).trim();
      if (text && text !== '[object Object]') {
        return text;
      }
    }
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

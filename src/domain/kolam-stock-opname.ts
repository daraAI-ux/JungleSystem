/**
 * Dokumen Stock Opname (`/stock-opname`) — multi-line review/post.
 * Bukan Opname cepat (`/stock-transaction/opname`).
 *
 * Source of truth: FE `types/stock-opname.ts` + BE `/stock-opnames`.
 */

export const KOLAM_STOCK_OPNAME_ROOT = '/stock-opname';

export type KolamStockOpnameStatus =
  | 'draft'
  | 'in_review'
  | 'rejected'
  | 'ready_to_post'
  | 'posted'
  | 'partially_posted'
  | 'cancelled';

export type KolamStockOpnameLineStatus =
  | 'draft'
  | 'pending_review'
  | 'revision'
  | 'approved'
  | 'rejected';

export type KolamStockOpnameLineTargetType =
  | 'product'
  | 'raw'
  | 'species'
  | 'packing';

export type KolamOpnameMinusReason =
  | 'lost'
  | 'damaged'
  | 'expired'
  | 'internal_use';

export type KolamStockOpnameSurfaceMode = 'list' | 'new' | 'detail';

export interface KolamStockOpnameUserRef {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  username: string;
}

export interface KolamStockOpnameDocRef {
  id: string;
  documentNumber: string;
}

export interface KolamStockOpnameLocationRef {
  id: string;
  name: string;
}

export interface KolamStockOpnameWalletRef {
  id: string;
  name: string;
  type: string;
}

export interface KolamStockOpnameTargetRef {
  id: string;
  name: string;
  sku: string;
  scientificName: string;
  productCode: string;
  unitLabel: string;
}

export interface KolamStockOpnamePackingRef {
  id: string;
  name: string;
  category: string;
}

export interface KolamStockOpname {
  id: string;
  documentNumber: string;
  status: KolamStockOpnameStatus;
  statusLabel: string;
  locationId: string;
  location: KolamStockOpnameLocationRef | null;
  scheduledAt: string;
  note: string;
  walletId: string;
  wallet: KolamStockOpnameWalletRef | null;
  createdBy: KolamStockOpnameUserRef | null;
  ownerId: string;
  owner: KolamStockOpnameUserRef | null;
  conductedById: string;
  conductedBy: KolamStockOpnameUserRef | null;
  submittedAt: string;
  submittedBy: KolamStockOpnameUserRef | null;
  postedAt: string;
  postedBy: KolamStockOpnameUserRef | null;
  cancelledAt: string;
  cancelledBy: KolamStockOpnameUserRef | null;
  cancelReason: string;
  parentOpname: KolamStockOpnameDocRef | null;
  continuationOpname: KolamStockOpnameDocRef | null;
  lineCounts: Record<string, number>;
  createdAt: string;
  updatedAt: string;
  raw: unknown;
}

export interface KolamStockOpnameLine {
  id: string;
  stockOpnameId: string;
  lineNo: number;
  targetType: KolamStockOpnameLineTargetType;
  targetTypeLabel: string;
  productId: string;
  product: KolamStockOpnameTargetRef | null;
  speciesId: string;
  species: KolamStockOpnameTargetRef | null;
  packingId: string;
  packing: KolamStockOpnamePackingRef | null;
  variantId: string;
  variantLabel: string;
  unitLabel: string;
  systemQty: number | null;
  liveSystemQty: number | null;
  liveSystemQtyError: string;
  physicalQty: number;
  minusReason: KolamOpnameMinusReason | null;
  minusReasonLabel: string;
  lineNote: string;
  photos: string[];
  lineStatus: KolamStockOpnameLineStatus;
  lineStatusLabel: string;
  rejectReason: string;
  reviewedAt: string;
  reviewedBy: KolamStockOpnameUserRef | null;
  revisionRequestedAt: string;
  revisionRequestedBy: KolamStockOpnameUserRef | null;
  lastCorrectedAt: string;
  lastCorrectedBy: KolamStockOpnameUserRef | null;
  resubmittedAt: string;
  resubmittedBy: KolamStockOpnameUserRef | null;
  postedStockTransactionId: string;
  createdAt: string;
  updatedAt: string;
  raw: unknown;
}

export interface KolamStockOpnameListFilters {
  search: string;
  status: KolamStockOpnameStatus | '';
  startDate: string;
  endDate: string;
  page: number;
  limit: number;
  sort: string;
}

export interface KolamStockOpnamePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface KolamStockOpnameListResult {
  data: KolamStockOpname[];
  pagination: KolamStockOpnamePagination;
}

export interface KolamStockOpnameLinesResult {
  data: KolamStockOpnameLine[];
  pagination: KolamStockOpnamePagination;
}

export interface KolamStockOpnameStaffAssignee {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  username: string;
}

export interface KolamStockOpnameCreateBody {
  locationId?: string | null;
  scheduledAt?: string | null;
  note?: string;
  walletId?: string | null;
  ownerId?: string | null;
  conductedBy?: string | null;
}

export interface KolamStockOpnameImportSummary {
  totalRows: number;
  imported: number;
  skipped: number;
  variantImported: number;
  errors: Array<{ row: number; name: string; sku: string; message: string }>;
}

export interface KolamStockOpnameImportResult {
  header: KolamStockOpname;
  summary: KolamStockOpnameImportSummary;
}

export const KOLAM_STOCK_OPNAME_STATUS_OPTIONS: Array<{
  id: KolamStockOpnameStatus | 'all';
  name: string;
}> = [
  { id: 'all', name: 'Semua status' },
  { id: 'draft', name: 'Draf' },
  { id: 'in_review', name: 'Dalam review' },
  { id: 'rejected', name: 'Ditolak' },
  { id: 'ready_to_post', name: 'Siap posting' },
  { id: 'posted', name: 'Diposting' },
  { id: 'partially_posted', name: 'Diposting sebagian' },
  { id: 'cancelled', name: 'Dibatalkan' },
];

export const KOLAM_STOCK_OPNAME_LINE_TARGET_LABELS: Record<
  KolamStockOpnameLineTargetType,
  string
> = {
  product: 'Produk',
  raw: 'Bahan baku',
  species: 'Livestock',
  packing: 'Kemasan',
};

export const KOLAM_OPNAME_MINUS_REASON_OPTIONS = [
  { value: 'lost' as const, label: 'Hilang' },
  { value: 'damaged' as const, label: 'Rusak' },
  { value: 'expired' as const, label: 'Kadaluarsa' },
  { value: 'internal_use' as const, label: 'Pemakaian internal toko' },
];

const STATUS_LABELS: Record<KolamStockOpnameStatus, string> = {
  draft: 'Draf',
  in_review: 'Dalam review',
  rejected: 'Ditolak',
  ready_to_post: 'Siap posting',
  posted: 'Diposting',
  partially_posted: 'Diposting sebagian',
  cancelled: 'Dibatalkan',
};

const LINE_STATUS_LABELS: Record<KolamStockOpnameLineStatus, string> = {
  draft: 'Draft',
  pending_review: 'Menunggu review',
  revision: 'Revisi',
  approved: 'Disetujui',
  rejected: 'Ditolak',
};

const VALID_STATUSES = new Set<string>(Object.keys(STATUS_LABELS));
const VALID_LINE_STATUSES = new Set<string>(Object.keys(LINE_STATUS_LABELS));
const VALID_TARGET_TYPES = new Set<string>([
  'product',
  'raw',
  'species',
  'packing',
]);
const VALID_MINUS_REASONS = new Set<string>(
  KOLAM_OPNAME_MINUS_REASON_OPTIONS.map(option => option.value),
);

export function isKolamStockOpnameRoute(route: string) {
  const path = normalizeStockOpnameRoutePath(route);
  return (
    path === KOLAM_STOCK_OPNAME_ROOT ||
    path.startsWith(`${KOLAM_STOCK_OPNAME_ROOT}/`)
  );
}

export function isKolamStockOpnameListRoute(route: string) {
  return normalizeStockOpnameRoutePath(route) === KOLAM_STOCK_OPNAME_ROOT;
}

export function isKolamStockOpnameNewRoute(route: string) {
  return (
    normalizeStockOpnameRoutePath(route) === `${KOLAM_STOCK_OPNAME_ROOT}/new`
  );
}

export function getKolamStockOpnameRouteId(route: string) {
  const path = normalizeStockOpnameRoutePath(route);
  if (path === KOLAM_STOCK_OPNAME_ROOT || path.endsWith('/new')) {
    return null;
  }
  const match = /^\/stock-opname\/([^/]+)$/.exec(path);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function isKolamStockOpnameDetailRoute(route: string) {
  return Boolean(getKolamStockOpnameRouteId(route));
}

export function getKolamStockOpnameSurfaceMode(
  route: string,
): KolamStockOpnameSurfaceMode {
  if (isKolamStockOpnameNewRoute(route)) {
    return 'new';
  }
  if (getKolamStockOpnameRouteId(route)) {
    return 'detail';
  }
  return 'list';
}

export function createInitialStockOpnameListFilters(
  route: string,
): KolamStockOpnameListFilters {
  const query = parseRouteQuery(route);
  const status =
    query.status && VALID_STATUSES.has(query.status)
      ? (query.status as KolamStockOpnameStatus)
      : '';

  return {
    search: query.search ?? '',
    status,
    startDate: query.startDate ?? '',
    endDate: query.endDate ?? '',
    page: Math.max(1, Number(query.page || '1') || 1),
    limit: Math.max(1, Number(query.limit || '20') || 20),
    sort: query.sort?.trim() || 'createdAt:desc',
  };
}

export function stockOpnameStatusLabel(status?: string) {
  if (!status) {
    return '—';
  }
  if (VALID_STATUSES.has(status)) {
    return STATUS_LABELS[status as KolamStockOpnameStatus];
  }
  return status.replace(/_/g, ' ');
}

export function stockOpnameLineStatusLabel(status?: string) {
  if (!status) {
    return '—';
  }
  if (VALID_LINE_STATUSES.has(status)) {
    return LINE_STATUS_LABELS[status as KolamStockOpnameLineStatus];
  }
  return status.replace(/_/g, ' ');
}

export function stockOpnameTargetTypeLabel(targetType?: string) {
  if (!targetType) {
    return '—';
  }
  if (VALID_TARGET_TYPES.has(targetType)) {
    return KOLAM_STOCK_OPNAME_LINE_TARGET_LABELS[
      targetType as KolamStockOpnameLineTargetType
    ];
  }
  return targetType;
}

export function opnameMinusReasonLabel(value?: string | null) {
  if (!value) {
    return '';
  }
  return (
    KOLAM_OPNAME_MINUS_REASON_OPTIONS.find(option => option.value === value)
      ?.label ?? ''
  );
}

export function needsOpnameMinusReason(
  targetType: string,
  diff: number | null,
) {
  if (targetType !== 'product' && targetType !== 'raw') {
    return false;
  }
  return diff != null && diff < 0;
}

export function stockOpnameUserDisplayName(
  user: KolamStockOpnameUserRef | null | undefined,
) {
  if (!user) {
    return '';
  }
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return full || user.name || user.username || user.email || user.id;
}

export function normalizeKolamStockOpnameList(
  payload: unknown,
): KolamStockOpnameListResult {
  const root = asRecord(payload);
  const dataRecord = asRecord(root.data);
  const list: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray(root.data)
    ? root.data
    : Array.isArray(dataRecord.data)
    ? dataRecord.data
    : [];

  const data = list.map(normalizeKolamStockOpname);
  return {
    data,
    pagination: normalizePagination(
      root.pagination ?? dataRecord.pagination ?? root.meta,
      data.length,
    ),
  };
}

export function normalizeKolamStockOpname(payload: unknown): KolamStockOpname {
  const unwrapped = unwrapData(payload);
  const record = asRecord(unwrapped);
  const status = normalizeStatus(getString(record, 'status'));
  const location = normalizeLocationRef(record.locationId);
  const wallet = normalizeWalletRef(record.walletId);
  const owner = normalizeUserRef(record.ownerId);
  const conductedBy = normalizeUserRef(record.conductedBy);
  const lineCountsRaw = asRecord(record.lineCounts);
  const lineCounts: Record<string, number> = {};
  Object.keys(lineCountsRaw).forEach(key => {
    const value = Number(lineCountsRaw[key]);
    if (Number.isFinite(value)) {
      lineCounts[key] = value;
    }
  });

  return {
    id: getString(record, '_id') || getString(record, 'id'),
    documentNumber: getString(record, 'documentNumber'),
    status,
    statusLabel: stockOpnameStatusLabel(status),
    locationId: location?.id ?? getIdFromRef(record.locationId),
    location,
    scheduledAt: getString(record, 'scheduledAt'),
    note: getString(record, 'note'),
    walletId: wallet?.id ?? getIdFromRef(record.walletId),
    wallet,
    createdBy: normalizeUserRef(record.createdBy),
    ownerId: owner?.id ?? getIdFromRef(record.ownerId),
    owner,
    conductedById: conductedBy?.id ?? getIdFromRef(record.conductedBy),
    conductedBy,
    submittedAt: getString(record, 'submittedAt'),
    submittedBy: normalizeUserRef(record.submittedBy),
    postedAt: getString(record, 'postedAt'),
    postedBy: normalizeUserRef(record.postedBy),
    cancelledAt: getString(record, 'cancelledAt'),
    cancelledBy: normalizeUserRef(record.cancelledBy),
    cancelReason: getString(record, 'cancelReason'),
    parentOpname: normalizeDocRef(record.parentOpnameId),
    continuationOpname: normalizeDocRef(record.continuationOpnameId),
    lineCounts,
    createdAt: getString(record, 'createdAt'),
    updatedAt: getString(record, 'updatedAt'),
    raw: unwrapped,
  };
}

export function normalizeKolamStockOpnameLines(
  payload: unknown,
): KolamStockOpnameLinesResult {
  const root = asRecord(payload);
  const dataRecord = asRecord(root.data);
  const list: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray(root.data)
    ? root.data
    : Array.isArray(dataRecord.data)
    ? dataRecord.data
    : [];

  const data = list.map(normalizeKolamStockOpnameLine);
  return {
    data,
    pagination: normalizePagination(
      root.pagination ?? dataRecord.pagination ?? root.meta,
      data.length,
    ),
  };
}

export function normalizeKolamStockOpnameLine(
  payload: unknown,
): KolamStockOpnameLine {
  const unwrapped = unwrapData(payload);
  const record = asRecord(unwrapped);
  const targetType = normalizeTargetType(getString(record, 'targetType'));
  const product = normalizeTargetRef(record.productId);
  const species = normalizeTargetRef(record.speciesId);
  const packing = normalizePackingRef(record.packingId);
  const minusReason = normalizeMinusReason(record.minusReason);
  const lineStatus = normalizeLineStatus(getString(record, 'lineStatus'));
  const unitLabel =
    getString(record, 'unitLabel') ||
    product?.unitLabel ||
    species?.unitLabel ||
    (targetType === 'packing' ? 'pcs' : '');

  return {
    id: getString(record, '_id') || getString(record, 'id'),
    stockOpnameId: getIdFromRef(record.stockOpnameId),
    lineNo: getNumber(record, 'lineNo') ?? 0,
    targetType,
    targetTypeLabel: stockOpnameTargetTypeLabel(targetType),
    productId: product?.id ?? getIdFromRef(record.productId),
    product,
    speciesId: species?.id ?? getIdFromRef(record.speciesId),
    species,
    packingId: packing?.id ?? getIdFromRef(record.packingId),
    packing,
    variantId:
      getString(record, 'variant') ||
      getString(record, 'variantId') ||
      '',
    variantLabel: getString(record, 'variantLabel'),
    unitLabel,
    systemQty: getNullableNumber(record, 'systemQty'),
    liveSystemQty: getNullableNumber(record, 'liveSystemQty'),
    liveSystemQtyError: getString(record, 'liveSystemQtyError'),
    physicalQty: getNumber(record, 'physicalQty') ?? 0,
    minusReason,
    minusReasonLabel: opnameMinusReasonLabel(minusReason),
    lineNote: getString(record, 'lineNote'),
    photos: normalizeStringArray(record.photos),
    lineStatus,
    lineStatusLabel: stockOpnameLineStatusLabel(lineStatus),
    rejectReason: getString(record, 'rejectReason'),
    reviewedAt: getString(record, 'reviewedAt'),
    reviewedBy: normalizeUserRef(record.reviewedBy),
    revisionRequestedAt: getString(record, 'revisionRequestedAt'),
    revisionRequestedBy: normalizeUserRef(record.revisionRequestedBy),
    lastCorrectedAt: getString(record, 'lastCorrectedAt'),
    lastCorrectedBy: normalizeUserRef(record.lastCorrectedBy),
    resubmittedAt: getString(record, 'resubmittedAt'),
    resubmittedBy: normalizeUserRef(record.resubmittedBy),
    postedStockTransactionId: getIdFromRef(record.postedStockTransactionId),
    createdAt: getString(record, 'createdAt'),
    updatedAt: getString(record, 'updatedAt'),
    raw: unwrapped,
  };
}

export function normalizeKolamStockOpnameStaffAssignees(
  payload: unknown,
): KolamStockOpnameStaffAssignee[] {
  const root = asRecord(payload);
  const list: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray(root.data)
    ? root.data
    : [];

  return list
    .map(item => {
      const user = normalizeUserRef(item);
      if (!user) {
        return null;
      }
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        username: user.username,
      } satisfies KolamStockOpnameStaffAssignee;
    })
    .filter(Boolean) as KolamStockOpnameStaffAssignee[];
}

export function normalizeKolamStockOpnameImportResult(
  payload: unknown,
): KolamStockOpnameImportResult {
  const root = asRecord(unwrapData(payload));
  const summaryRecord = asRecord(root.summary);
  const errorsRaw = Array.isArray(summaryRecord.errors)
    ? summaryRecord.errors
    : [];

  return {
    header: normalizeKolamStockOpname(root.header ?? root),
    summary: {
      totalRows: getNumber(summaryRecord, 'totalRows') ?? 0,
      imported: getNumber(summaryRecord, 'imported') ?? 0,
      skipped: getNumber(summaryRecord, 'skipped') ?? 0,
      variantImported: getNumber(summaryRecord, 'variantImported') ?? 0,
      errors: errorsRaw.map(item => {
        const row = asRecord(item);
        return {
          row: getNumber(row, 'row') ?? 0,
          name: getString(row, 'name'),
          sku: getString(row, 'sku'),
          message: getString(row, 'message'),
        };
      }),
    },
  };
}

function normalizeStatus(value: string): KolamStockOpnameStatus {
  return VALID_STATUSES.has(value)
    ? (value as KolamStockOpnameStatus)
    : 'draft';
}

function normalizeLineStatus(value: string): KolamStockOpnameLineStatus {
  return VALID_LINE_STATUSES.has(value)
    ? (value as KolamStockOpnameLineStatus)
    : 'draft';
}

function normalizeTargetType(value: string): KolamStockOpnameLineTargetType {
  return VALID_TARGET_TYPES.has(value)
    ? (value as KolamStockOpnameLineTargetType)
    : 'product';
}

function normalizeMinusReason(
  value: unknown,
): KolamOpnameMinusReason | null {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text || !VALID_MINUS_REASONS.has(text)) {
    return null;
  }
  return text as KolamOpnameMinusReason;
}

function normalizeUserRef(value: unknown): KolamStockOpnameUserRef | null {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    const id = value.trim();
    return id
      ? {
          id,
          firstName: '',
          lastName: '',
          name: '',
          email: '',
          username: '',
        }
      : null;
  }
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  if (!id) {
    return null;
  }
  const firstName = getString(record, 'first_name') || getString(record, 'firstName');
  const lastName = getString(record, 'last_name') || getString(record, 'lastName');
  const name =
    getString(record, 'name') ||
    [firstName, lastName].filter(Boolean).join(' ').trim();
  return {
    id,
    firstName,
    lastName,
    name,
    email: getString(record, 'email'),
    username: getString(record, 'username'),
  };
}

function normalizeDocRef(value: unknown): KolamStockOpnameDocRef | null {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    const id = value.trim();
    return id ? { id, documentNumber: id } : null;
  }
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  if (!id) {
    return null;
  }
  return {
    id,
    documentNumber: getString(record, 'documentNumber') || id,
  };
}

function normalizeLocationRef(
  value: unknown,
): KolamStockOpnameLocationRef | null {
  if (!value || typeof value === 'string') {
    return null;
  }
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  if (!id) {
    return null;
  }
  return {
    id,
    name: getString(record, 'name'),
  };
}

function normalizeWalletRef(value: unknown): KolamStockOpnameWalletRef | null {
  if (!value || typeof value === 'string') {
    return null;
  }
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  if (!id) {
    return null;
  }
  return {
    id,
    name: getString(record, 'name'),
    type: getString(record, 'type'),
  };
}

function normalizeTargetRef(value: unknown): KolamStockOpnameTargetRef | null {
  if (!value || typeof value === 'string') {
    return null;
  }
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  if (!id) {
    return null;
  }
  const units = record.units;
  let unitLabel = '';
  if (typeof units === 'string') {
    unitLabel = units.trim();
  } else if (units && typeof units === 'object') {
    const unitRecord = asRecord(units);
    unitLabel =
      getString(unitRecord, 'initial') || getString(unitRecord, 'name');
  }
  return {
    id,
    name: getString(record, 'name'),
    sku: getString(record, 'sku'),
    scientificName: getString(record, 'scientificName'),
    productCode: getString(record, 'productCode'),
    unitLabel,
  };
}

function normalizePackingRef(value: unknown): KolamStockOpnamePackingRef | null {
  if (!value || typeof value === 'string') {
    return null;
  }
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  if (!id) {
    return null;
  }
  return {
    id,
    name: getString(record, 'name'),
    category: getString(record, 'category'),
  };
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }
  return value
    .map(item => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
}

function normalizePagination(
  value: unknown,
  fallbackTotal: number,
): KolamStockOpnamePagination {
  const record = asRecord(value);
  const page = getNumber(record, 'page') ?? 1;
  const limit = getNumber(record, 'limit') ?? Math.max(1, fallbackTotal || 20);
  const total =
    getNumber(record, 'total') ?? getNumber(record, 'totalItems') ?? fallbackTotal;
  const totalPages =
    getNumber(record, 'totalPages') ??
    getNumber(record, 'pages') ??
    (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1);

  return { page, limit, total, totalPages };
}

function normalizeStockOpnameRoutePath(route: string) {
  const path = route.trim().split('?')[0].replace(/^\/+/, '');
  return ('/' + path).replace(/\/+$/, '') || KOLAM_STOCK_OPNAME_ROOT;
}

function parseRouteQuery(route: string) {
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

function unwrapData(payload: unknown): unknown {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = (payload as { data: unknown }).data;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const nested = asRecord(data);
      if ('data' in nested && !('_id' in nested) && !('documentNumber' in nested)) {
        return nested.data;
      }
      return data;
    }
    return data;
  }
  return payload;
}

function getIdFromRef(value: unknown) {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (!value || typeof value !== 'object') {
    return '';
  }
  const record = asRecord(value);
  return getString(record, '_id') || getString(record, 'id');
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
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

function getNullableNumber(record: Record<string, unknown>, key: string) {
  if (!(key in record) || record[key] == null || record[key] === '') {
    return null;
  }
  return getNumber(record, key);
}

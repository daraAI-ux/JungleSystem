/**
 * Kolam Proyek (CustomProject) — native surface foundation (P0).
 * SoT: DA-Proyek-Plugin + BE plugins/proyek (`/api/custom-project`).
 */

import type { KolamStatusBadgeIntent } from '../components/kolam-status-badge-types';

export const KOLAM_PROYEK_ROOT = '/proyek';
export const KOLAM_PROYEK_NEW_ROUTE = `${KOLAM_PROYEK_ROOT}/new`;

export type KolamProyekLifecycleStatus =
  | 'draft'
  | 'quotation_sent'
  | 'revision_in_progress'
  | 'approved'
  | 'awaiting_dp'
  | 'dp_paid'
  | 'in_progress'
  | 'design_review'
  | 'delivered'
  | 'completed'
  | 'refunded'
  | 'cancelled';

export type KolamProyekProjectStatus = 'waiting' | 'in_progress' | 'completed';

export type KolamProyekPaymentMode = 'full' | 'staged';

export type KolamProyekSurfaceMode = 'list' | 'detail' | 'new' | 'edit';

export type KolamProyekSectionVisibility = 'active' | 'readonly' | 'hidden';

export type KolamProyekSectionKey =
  | 'quotationActions'
  | 'hppMaterials'
  | 'commission'
  | 'dpSchedule'
  | 'progressUpdate'
  | 'designReview'
  | 'closeProject'
  | 'projectReview'
  | 'lifecycleAdmin'
  | 'dangerDelete'
  | 'dangerCancel'
  | 'dangerRefund';

export type KolamProyekListItem = {
  id: string;
  quotationNumber: string;
  lifecycleStatus: KolamProyekLifecycleStatus | string;
  projectStatus: KolamProyekProjectStatus | string;
  clientName: string;
  clientId: string | null;
  designerName: string;
  designerId: string | null;
  progressPercent: number;
  contractValue: number;
  dealAmount: number;
  paymentMode: KolamProyekPaymentMode | string;
  saleId: string | null;
  saleInvoiceCode: string | null;
  linkedTaskId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  raw: unknown;
};

export type KolamProyekDetail = KolamProyekListItem & {
  progressNote: string;
  maxWorkDays: number | null;
  targetCompletionDate: string | null;
  quotationDecision: string;
  itemCount: number;
};

export type KolamProyekListQuery = {
  page?: number;
  limit?: number;
  lifecycleStatus?: KolamProyekLifecycleStatus | '';
  customer?: string;
};

export type KolamProyekListResult = {
  items: KolamProyekListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const KOLAM_PROYEK_LIFECYCLE_FILTER_OPTIONS: Array<{
  value: '' | KolamProyekLifecycleStatus;
  label: string;
}> = [
  { value: '', label: 'Semua status' },
  { value: 'draft', label: 'Draft' },
  { value: 'quotation_sent', label: 'Penawaran terkirim' },
  { value: 'revision_in_progress', label: 'Revisi' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'awaiting_dp', label: 'Menunggu DP' },
  { value: 'dp_paid', label: 'DP lunas' },
  { value: 'in_progress', label: 'Dalam proses' },
  { value: 'design_review', label: 'Review desain' },
  { value: 'delivered', label: 'Dikirim' },
  { value: 'completed', label: 'Selesai' },
  { value: 'refunded', label: 'Refund' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

const LIFECYCLE_LABEL: Record<string, string> = {
  draft: 'Draft',
  quotation_sent: 'Penawaran terkirim',
  revision_in_progress: 'Revisi',
  approved: 'Disetujui',
  awaiting_dp: 'Menunggu DP',
  dp_paid: 'DP lunas',
  in_progress: 'Dalam proses',
  design_review: 'Review desain',
  delivered: 'Dikirim',
  completed: 'Selesai',
  refunded: 'Refund',
  cancelled: 'Dibatalkan',
};

/** Mirror FE `allowed-transitions.ts` / BE lifecycle-guard happy path. */
const ALLOWED_TRANSITIONS: Record<
  KolamProyekLifecycleStatus,
  readonly KolamProyekLifecycleStatus[]
> = {
  draft: ['quotation_sent', 'cancelled'],
  quotation_sent: ['revision_in_progress', 'approved', 'cancelled'],
  revision_in_progress: ['quotation_sent', 'cancelled'],
  approved: ['awaiting_dp', 'cancelled'],
  awaiting_dp: ['dp_paid', 'cancelled'],
  dp_paid: ['in_progress', 'refunded'],
  in_progress: ['refunded'],
  design_review: [],
  delivered: ['completed', 'refunded'],
  completed: [],
  refunded: [],
  cancelled: [],
};

const EXCEPTION_TARGETS = new Set<KolamProyekLifecycleStatus>([
  'refunded',
  'cancelled',
]);

/** Mirror FE `visibility.ts` matrix (intended stage-aware UI). */
const SECTION_VISIBILITY: Record<
  KolamProyekLifecycleStatus,
  Record<KolamProyekSectionKey, KolamProyekSectionVisibility>
> = {
  draft: {
    quotationActions: 'active',
    hppMaterials: 'active',
    commission: 'readonly',
    dpSchedule: 'hidden',
    progressUpdate: 'hidden',
    designReview: 'hidden',
    closeProject: 'hidden',
    projectReview: 'hidden',
    lifecycleAdmin: 'hidden',
    dangerDelete: 'active',
    dangerCancel: 'hidden',
    dangerRefund: 'hidden',
  },
  quotation_sent: {
    quotationActions: 'active',
    hppMaterials: 'active',
    commission: 'readonly',
    dpSchedule: 'hidden',
    progressUpdate: 'hidden',
    designReview: 'hidden',
    closeProject: 'hidden',
    projectReview: 'hidden',
    lifecycleAdmin: 'hidden',
    dangerDelete: 'hidden',
    dangerCancel: 'active',
    dangerRefund: 'hidden',
  },
  revision_in_progress: {
    quotationActions: 'active',
    hppMaterials: 'active',
    commission: 'readonly',
    dpSchedule: 'hidden',
    progressUpdate: 'hidden',
    designReview: 'hidden',
    closeProject: 'hidden',
    projectReview: 'hidden',
    lifecycleAdmin: 'hidden',
    dangerDelete: 'hidden',
    dangerCancel: 'active',
    dangerRefund: 'hidden',
  },
  approved: {
    quotationActions: 'readonly',
    hppMaterials: 'active',
    commission: 'active',
    dpSchedule: 'active',
    progressUpdate: 'hidden',
    designReview: 'hidden',
    closeProject: 'hidden',
    projectReview: 'hidden',
    lifecycleAdmin: 'active',
    dangerDelete: 'hidden',
    dangerCancel: 'active',
    dangerRefund: 'hidden',
  },
  awaiting_dp: {
    quotationActions: 'readonly',
    hppMaterials: 'active',
    commission: 'active',
    dpSchedule: 'active',
    progressUpdate: 'hidden',
    designReview: 'hidden',
    closeProject: 'hidden',
    projectReview: 'hidden',
    lifecycleAdmin: 'active',
    dangerDelete: 'hidden',
    dangerCancel: 'active',
    dangerRefund: 'hidden',
  },
  dp_paid: {
    quotationActions: 'readonly',
    hppMaterials: 'active',
    commission: 'active',
    dpSchedule: 'readonly',
    progressUpdate: 'hidden',
    designReview: 'hidden',
    closeProject: 'hidden',
    projectReview: 'hidden',
    lifecycleAdmin: 'active',
    dangerDelete: 'hidden',
    dangerCancel: 'hidden',
    dangerRefund: 'active',
  },
  in_progress: {
    quotationActions: 'readonly',
    hppMaterials: 'active',
    commission: 'active',
    dpSchedule: 'readonly',
    progressUpdate: 'active',
    designReview: 'active',
    closeProject: 'hidden',
    projectReview: 'hidden',
    lifecycleAdmin: 'active',
    dangerDelete: 'hidden',
    dangerCancel: 'hidden',
    dangerRefund: 'active',
  },
  design_review: {
    quotationActions: 'readonly',
    hppMaterials: 'active',
    commission: 'active',
    dpSchedule: 'readonly',
    progressUpdate: 'active',
    designReview: 'active',
    closeProject: 'hidden',
    projectReview: 'hidden',
    lifecycleAdmin: 'active',
    dangerDelete: 'hidden',
    dangerCancel: 'hidden',
    dangerRefund: 'active',
  },
  delivered: {
    quotationActions: 'readonly',
    hppMaterials: 'readonly',
    commission: 'active',
    dpSchedule: 'readonly',
    progressUpdate: 'readonly',
    designReview: 'readonly',
    closeProject: 'active',
    projectReview: 'active',
    lifecycleAdmin: 'active',
    dangerDelete: 'hidden',
    dangerCancel: 'hidden',
    dangerRefund: 'active',
  },
  completed: {
    quotationActions: 'readonly',
    hppMaterials: 'readonly',
    commission: 'readonly',
    dpSchedule: 'readonly',
    progressUpdate: 'readonly',
    designReview: 'readonly',
    closeProject: 'readonly',
    projectReview: 'readonly',
    lifecycleAdmin: 'hidden',
    dangerDelete: 'hidden',
    dangerCancel: 'hidden',
    dangerRefund: 'hidden',
  },
  cancelled: {
    quotationActions: 'readonly',
    hppMaterials: 'readonly',
    commission: 'readonly',
    dpSchedule: 'readonly',
    progressUpdate: 'hidden',
    designReview: 'hidden',
    closeProject: 'hidden',
    projectReview: 'hidden',
    lifecycleAdmin: 'hidden',
    dangerDelete: 'hidden',
    dangerCancel: 'readonly',
    dangerRefund: 'hidden',
  },
  refunded: {
    quotationActions: 'readonly',
    hppMaterials: 'readonly',
    commission: 'readonly',
    dpSchedule: 'readonly',
    progressUpdate: 'readonly',
    designReview: 'readonly',
    closeProject: 'hidden',
    projectReview: 'readonly',
    lifecycleAdmin: 'hidden',
    dangerDelete: 'hidden',
    dangerCancel: 'hidden',
    dangerRefund: 'readonly',
  },
};

function normalizeRoutePath(route: string) {
  const path = String(route || '').split('?')[0].trim();
  if (!path) {
    return '/';
  }
  return path.startsWith('/') ? path.replace(/\/+$/, '') || '/' : `/${path}`;
}

export function isKolamProyekQuotationRef(ref: string) {
  return /^QUO-/i.test(String(ref || '').trim());
}

export function isKolamProyekRoute(route: string) {
  const path = normalizeRoutePath(route);
  if (path === KOLAM_PROYEK_ROOT || path.startsWith(`${KOLAM_PROYEK_ROOT}/`)) {
    return true;
  }
  return (
    path === '/custom-project' || path.startsWith('/custom-project/')
  );
}

export function isKolamProyekListRoute(route: string) {
  const path = normalizeRoutePath(route);
  return (
    path === KOLAM_PROYEK_ROOT ||
    path === `${KOLAM_PROYEK_ROOT}/instances` ||
    path === '/custom-project' ||
    path === '/custom-project/instances'
  );
}

export function isKolamProyekNewRoute(route: string) {
  const path = normalizeRoutePath(route);
  return (
    path === KOLAM_PROYEK_NEW_ROUTE ||
    path === '/custom-project/instances/new'
  );
}

export function isKolamProyekEditRoute(route: string) {
  const path = normalizeRoutePath(route);
  return (
    /^\/proyek\/[^/]+\/edit$/.test(path) ||
    /^\/custom-project\/instances\/[^/]+\/edit$/.test(path)
  );
}

export function isKolamProyekDetailRoute(route: string) {
  const path = normalizeRoutePath(route);
  if (
    isKolamProyekListRoute(path) ||
    isKolamProyekNewRoute(path) ||
    isKolamProyekEditRoute(path)
  ) {
    return false;
  }
  return (
    /^\/proyek\/[^/]+$/.test(path) ||
    /^\/custom-project\/instances\/[^/]+$/.test(path)
  );
}

export function getKolamProyekSurfaceMode(
  route: string,
): KolamProyekSurfaceMode {
  if (isKolamProyekNewRoute(route)) {
    return 'new';
  }
  if (isKolamProyekEditRoute(route)) {
    return 'edit';
  }
  if (isKolamProyekDetailRoute(route)) {
    return 'detail';
  }
  return 'list';
}

export function getKolamProyekRouteRef(route: string): string | null {
  const path = normalizeRoutePath(route);
  const proyekEdit = path.match(/^\/proyek\/([^/]+)\/edit$/);
  if (proyekEdit?.[1]) {
    return decodeURIComponent(proyekEdit[1]);
  }
  const proyekDetail = path.match(/^\/proyek\/([^/]+)$/);
  if (
    proyekDetail?.[1] &&
    proyekDetail[1] !== 'new' &&
    proyekDetail[1] !== 'instances'
  ) {
    return decodeURIComponent(proyekDetail[1]);
  }
  const legacyEdit = path.match(/^\/custom-project\/instances\/([^/]+)\/edit$/);
  if (legacyEdit?.[1]) {
    return decodeURIComponent(legacyEdit[1]);
  }
  const legacyDetail = path.match(/^\/custom-project\/instances\/([^/]+)$/);
  if (legacyDetail?.[1] && legacyDetail[1] !== 'new') {
    return decodeURIComponent(legacyDetail[1]);
  }
  return null;
}

export function buildKolamProyekListRoute() {
  return KOLAM_PROYEK_ROOT;
}

export function buildKolamProyekNewRoute() {
  return KOLAM_PROYEK_NEW_ROUTE;
}

export function buildKolamProyekDetailRoute(ref: string) {
  const key = String(ref || '').trim();
  return `${KOLAM_PROYEK_ROOT}/${encodeURIComponent(key)}`;
}

export function buildKolamProyekEditRoute(ref: string, fallbackId?: string) {
  const key = isKolamProyekQuotationRef(ref)
    ? String(ref).trim()
    : String(fallbackId || ref || '').trim();
  return `${KOLAM_PROYEK_ROOT}/${encodeURIComponent(key)}/edit`;
}

/** Prefer quotation number in URL when available. */
export function buildKolamProyekDetailRouteForItem(
  item: Pick<KolamProyekListItem, 'id' | 'quotationNumber'>,
) {
  const ref = item.quotationNumber?.trim() || item.id;
  return buildKolamProyekDetailRoute(ref);
}

export function formatKolamProyekLifecycleLabel(status?: string | null) {
  const key = String(status || '').trim();
  return LIFECYCLE_LABEL[key] || key || 'Draft';
}

export function getKolamProyekLifecycleIntent(
  status?: string | null,
): KolamStatusBadgeIntent {
  switch (String(status || '').trim()) {
    case 'revision_in_progress':
    case 'awaiting_dp':
      return 'warning';
    case 'in_progress':
    case 'dp_paid':
    case 'design_review':
      return 'info';
    case 'completed':
    case 'approved':
    case 'delivered':
      return 'success';
    case 'cancelled':
    case 'refunded':
      return 'danger';
    default:
      return 'secondary';
  }
}

export function getKolamProyekSectionVisibility(
  status: string | null | undefined,
  section: KolamProyekSectionKey,
): KolamProyekSectionVisibility {
  const key = String(status || 'draft').trim() as KolamProyekLifecycleStatus;
  const row = SECTION_VISIBILITY[key] || SECTION_VISIBILITY.draft;
  return row[section] || 'hidden';
}

export function getKolamProyekHappyPathNext(
  current: string | null | undefined,
): KolamProyekLifecycleStatus[] {
  const key = String(current || '').trim() as KolamProyekLifecycleStatus;
  return (ALLOWED_TRANSITIONS[key] || []).filter(
    status => !EXCEPTION_TARGETS.has(status),
  );
}

export function getKolamProyekAllowedNext(
  current: string | null | undefined,
): KolamProyekLifecycleStatus[] {
  const key = String(current || '').trim() as KolamProyekLifecycleStatus;
  return [...(ALLOWED_TRANSITIONS[key] || [])];
}

export function normalizeKolamProyekListItem(
  payload: unknown,
): KolamProyekListItem | null {
  const record = asRecord(unwrapData(payload));
  const id = getId(record);
  if (!id) {
    return null;
  }
  const client = asRecord(record.clientUser);
  const designer = asRecord(record.designerUser);
  const sale = asRecord(record.sale);
  const linkedTask = asRecord(record.linkedTask);

  return {
    id,
    quotationNumber: getString(record, 'quotationNumber'),
    lifecycleStatus: getString(record, 'lifecycleStatus') || 'draft',
    projectStatus: getString(record, 'projectStatus') || 'waiting',
    clientName:
      getString(client, 'name') ||
      (typeof record.clientUser === 'string' ? record.clientUser : '') ||
      '—',
    clientId: getId(client) || (typeof record.clientUser === 'string'
      ? record.clientUser
      : null),
    designerName:
      getString(record, 'designerName') ||
      [
        getString(designer, 'first_name'),
        getString(designer, 'last_name'),
      ]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      getString(designer, 'username') ||
      '—',
    designerId:
      getId(designer) ||
      (typeof record.designerUser === 'string' ? record.designerUser : null),
    progressPercent: getNumber(record, 'progressPercent') ?? 0,
    contractValue: getNumber(record, 'contractValue') ?? 0,
    dealAmount: getNumber(record, 'dealAmount') ?? 0,
    paymentMode: getString(record, 'paymentMode') || 'full',
    saleId:
      getId(sale) ||
      (typeof record.sale === 'string' ? record.sale : null),
    saleInvoiceCode: getString(sale, 'invoiceCode') || null,
    linkedTaskId:
      getId(linkedTask) ||
      (typeof record.linkedTask === 'string' ? record.linkedTask : null),
    createdAt: getString(record, 'createdAt') || null,
    updatedAt: getString(record, 'updatedAt') || null,
    raw: payload,
  };
}

export function normalizeKolamProyekDetail(
  payload: unknown,
): KolamProyekDetail | null {
  const base = normalizeKolamProyekListItem(payload);
  if (!base) {
    return null;
  }
  const record = asRecord(unwrapData(payload));
  const items = Array.isArray(record.items) ? record.items : [];
  return {
    ...base,
    progressNote: getString(record, 'progressNote'),
    maxWorkDays: getNumber(record, 'maxWorkDays'),
    targetCompletionDate: getString(record, 'targetCompletionDate') || null,
    quotationDecision: getString(record, 'quotationDecision') || 'pending',
    itemCount: items.length,
  };
}

export function normalizeKolamProyekList(
  payload: unknown,
  query: KolamProyekListQuery = {},
): KolamProyekListResult {
  const page = query.page ?? 1;
  const limit = query.limit ?? 50;
  const root = asRecord(payload);
  const data = asRecord(root.data);
  const nested = asRecord(data.data);

  const rows = Array.isArray(data.data)
    ? data.data
    : Array.isArray(nested.data)
      ? nested.data
      : Array.isArray(root.data)
        ? root.data
        : Array.isArray(root.items)
          ? root.items
          : Array.isArray(payload)
            ? payload
            : [];

  const pagination = asRecord(
    data.pagination || nested.pagination || root.pagination,
  );

  const items = rows
    .map(row => normalizeKolamProyekListItem(row))
    .filter((item): item is KolamProyekListItem => Boolean(item));

  const total =
    getNumber(pagination, 'total') ??
    getNumber(data, 'total') ??
    getNumber(root, 'total') ??
    items.length;
  const totalPages =
    getNumber(pagination, 'totalPages') ??
    Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return {
    items,
    page: getNumber(pagination, 'page') ?? page,
    limit: getNumber(pagination, 'limit') ?? limit,
    total,
    totalPages,
  };
}

function unwrapData(payload: unknown): unknown {
  const record = asRecord(payload);
  if ('data' in record) {
    return record.data;
  }
  return payload;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
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
  return '';
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

function getId(record: Record<string, unknown>) {
  return getString(record, '_id') || getString(record, 'id') || null;
}

import { getKolamFileUrl } from '../lib/file-url';

export const KOLAM_COMPLAINT_ROOT = '/complaints';

export type KolamComplaintStatus =
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'processing'
  | 'rework_in_progress'
  | 'rework_review'
  | 'return_in_transit'
  | 'return_received'
  | 'completed'
  | 'rejected'
  | 'cancelled'
  | 'closed';

export type KolamComplaintSource = 'arrival_inspection' | 'warranty_claim';

export type KolamComplaintDecision =
  | 'refund'
  | 'replacement'
  | 'return_then_refund'
  | 'rework'
  | 'warranty_honored_da'
  | 'warranty_honored_vendor'
  | 'warranty_rejected'
  | null;

export type KolamComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

export type KolamComplaintCategory =
  | 'defective'
  | 'wrong_item'
  | 'damaged'
  | 'quality_issue'
  | 'service_not_delivered'
  | 'service_incomplete'
  | 'service_quality_issue'
  | 'service_delayed'
  | 'product_warranty_defect'
  | 'product_warranty_malfunction'
  | 'product_warranty_other'
  | 'other';

export type KolamComplaintItemType =
  | 'product'
  | 'species'
  | 'freyer'
  | 'teranura'
  | 'service'
  | 'custom_project';

export type KolamComplaintHistoryAction =
  | 'status_change'
  | 'decision'
  | 'assignment'
  | 'message'
  | 'return_update'
  | 'replacement_update'
  | 'rework_update'
  | 'close'
  | 'photo_upload'
  | 'created'
  | 'refund_payment_sent'
  | 'refund_payment_completed';

export type KolamComplaintTrackingStatus =
  | 'pending'
  | 'in_transit'
  | 'received'
  | 'verified';

export interface KolamComplaintPhoto {
  id: string;
  path: string;
  uri: string | null;
  uploadedAt?: string;
  note?: string;
}

export interface KolamComplaintItem {
  id: string;
  saleItemIndex: number;
  itemType: KolamComplaintItemType;
  name: string;
  quantity: number;
  reason: string;
}

export interface KolamComplaintHistory {
  id: string;
  action: KolamComplaintHistoryAction;
  note: string;
  status?: KolamComplaintStatus;
  oldStatus?: KolamComplaintStatus;
  decision?: KolamComplaintDecision;
  changedByLabel: string;
  changedAt?: string;
}

export interface KolamComplaintTracking {
  status: KolamComplaintTrackingStatus;
  trackingNumber: string;
  courierName: string;
  receivedByLabel: string;
  verifiedNote: string;
  sentAt?: string;
  receivedAt?: string;
  verifiedAt?: string;
}

export interface KolamComplaintSaleSourceRef {
  id: string;
  name: string;
  logoUri: string | null;
}

export interface KolamComplaint {
  id: string;
  ticketCode: string;
  saleId: string | null;
  invoiceCode: string;
  customerName: string;
  isCustomProject: boolean;
  /** Sales sourceRef from linked sale (for logo strip like sales detail). */
  saleSourceRef: KolamComplaintSaleSourceRef | null;
  source: KolamComplaintSource;
  status: KolamComplaintStatus;
  decision: KolamComplaintDecision;
  priority: KolamComplaintPriority;
  category: KolamComplaintCategory;
  description: string;
  itemCount: number;
  items: KolamComplaintItem[];
  refundAmount: number;
  assignedStaffId: string | null;
  assignedStaffName: string;
  createdByName: string;
  createdByType: 'staff' | 'customer';
  isServiceOnly: boolean;
  marketplaceSource: 'shopee' | 'tokopedia' | null;
  marketplaceReadOnly: boolean;
  photos: KolamComplaintPhoto[];
  histories: KolamComplaintHistory[];
  returnTracking: KolamComplaintTracking | null;
  replacementTracking: KolamComplaintTracking | null;
  replacementReturnTracking: KolamComplaintTracking | null;
  reworkCount: number;
  maxRework: number;
  createdAt?: string;
  updatedAt?: string;
  raw: unknown;
}

export interface KolamComplaintListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: KolamComplaintStatus;
  decision?: NonNullable<KolamComplaintDecision>;
  source?: KolamComplaintSource;
  customProject?: boolean;
  priority?: KolamComplaintPriority;
  category?: KolamComplaintCategory;
}

export interface KolamComplaintListResult {
  items: KolamComplaint[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const KOLAM_COMPLAINT_STATUS_OPTIONS: Array<{
  id: KolamComplaintStatus;
  label: string;
}> = [
  { id: 'pending', label: 'Menunggu' },
  { id: 'in_review', label: 'Sedang Ditinjau' },
  { id: 'approved', label: 'Disetujui' },
  { id: 'processing', label: 'Diproses' },
  { id: 'rework_in_progress', label: 'Perbaikan Berlangsung' },
  { id: 'rework_review', label: 'Menunggu Review' },
  { id: 'return_in_transit', label: 'Retur Dalam Perjalanan' },
  { id: 'return_received', label: 'Retur Diterima' },
  { id: 'completed', label: 'Selesai' },
  { id: 'rejected', label: 'Ditolak' },
  { id: 'cancelled', label: 'Dibatalkan' },
  { id: 'closed', label: 'Ditutup' },
];

export const KOLAM_COMPLAINT_DECISION_OPTIONS: Array<{
  id: NonNullable<KolamComplaintDecision>;
  label: string;
}> = [
  { id: 'refund', label: 'Refund' },
  { id: 'replacement', label: 'Penggantian' },
  { id: 'return_then_refund', label: 'Retur & Refund' },
  { id: 'rework', label: 'Perbaikan' },
  { id: 'warranty_honored_da', label: 'Garansi DA' },
  { id: 'warranty_honored_vendor', label: 'Garansi Vendor' },
  { id: 'warranty_rejected', label: 'Garansi Ditolak' },
];

export const KOLAM_COMPLAINT_SOURCE_OPTIONS: Array<{
  id: KolamComplaintSource | 'all';
  label: string;
}> = [
  { id: 'all', label: 'Semua' },
  { id: 'arrival_inspection', label: 'Kedatangan' },
  { id: 'warranty_claim', label: 'Garansi produk' },
];

export function isKolamComplaintRoute(route: string) {
  const path = route.split('?')[0];
  return (
    path === KOLAM_COMPLAINT_ROOT || path.startsWith(`${KOLAM_COMPLAINT_ROOT}/`)
  );
}

export function getKolamComplaintRouteMode(
  route: string,
): 'list' | 'detail' | 'new' {
  const path = route.split('?')[0];
  if (path === `${KOLAM_COMPLAINT_ROOT}/create`) {
    return 'new';
  }
  if (
    /^\/complaints\/[^/]+$/.test(path) &&
    path !== `${KOLAM_COMPLAINT_ROOT}/create`
  ) {
    return 'detail';
  }
  return 'list';
}

export function getKolamComplaintIdFromRoute(route: string): string | null {
  const path = route.split('?')[0];
  const match = /^\/complaints\/([^/]+)$/.exec(path);
  if (match?.[1] && match[1] !== 'create') {
    return decodeURIComponent(match[1]);
  }
  return null;
}

export type KolamComplaintServiceContext = {
  taskKind: 'dosing' | 'maintenance';
  taskId?: string | null;
  executionId?: string | null;
  visitTitle?: string | null;
};

export type KolamComplaintCreateQuery = {
  saleId: string | null;
  pendingServiceId: string | null;
  subscriptionId: string | null;
  category: KolamComplaintCategory | null;
  serviceContext: KolamComplaintServiceContext | null;
};

export type KolamComplaintCreateItemInput = {
  saleItemIndex: number;
  quantity: number;
  reason?: string;
};

export type KolamComplaintCreateInput = {
  saleId: string;
  items: KolamComplaintCreateItemInput[];
  description: string;
  category: KolamComplaintCategory;
  priority: KolamComplaintPriority;
  createdByCustomerId?: string | null;
  pendingServiceId?: string | null;
  subscriptionId?: string | null;
  serviceContext?: KolamComplaintServiceContext | null;
  photoUris?: string[];
};

/** Categories offered on create form (matches FE select options). */
export const KOLAM_COMPLAINT_CREATE_CATEGORY_OPTIONS: Array<{
  id: KolamComplaintCategory;
  label: string;
}> = [
  { id: 'defective', label: 'Cacat' },
  { id: 'wrong_item', label: 'Item Salah' },
  { id: 'damaged', label: 'Rusak' },
  { id: 'quality_issue', label: 'Masalah Kualitas' },
  { id: 'service_not_delivered', label: 'Layanan Tidak Diberikan' },
  { id: 'service_incomplete', label: 'Layanan Tidak Lengkap' },
  { id: 'service_quality_issue', label: 'Masalah Kualitas Layanan' },
  { id: 'service_delayed', label: 'Layanan Terlambat' },
  { id: 'other', label: 'Lainnya' },
];

export const KOLAM_COMPLAINT_PRIORITY_OPTIONS: Array<{
  id: KolamComplaintPriority;
  label: string;
}> = [
  { id: 'low', label: 'Rendah' },
  { id: 'medium', label: 'Sedang' },
  { id: 'high', label: 'Tinggi' },
  { id: 'urgent', label: 'Mendesak' },
];

export function parseKolamComplaintCreateQuery(
  route: string,
): KolamComplaintCreateQuery {
  const queryIndex = route.indexOf('?');
  const params = new URLSearchParams(
    queryIndex >= 0 ? route.slice(queryIndex + 1) : '',
  );
  const saleId = params.get('saleId')?.trim() || null;
  const pendingServiceId = params.get('pendingServiceId')?.trim() || null;
  const subscriptionId = params.get('subscriptionId')?.trim() || null;
  const categoryRaw = params.get('category')?.trim() || '';
  const category = KOLAM_COMPLAINT_CREATE_CATEGORY_OPTIONS.some(
    option => option.id === categoryRaw,
  )
    ? (categoryRaw as KolamComplaintCategory)
    : null;
  const taskKind = params.get('taskKind')?.trim();
  const serviceContext: KolamComplaintServiceContext | null =
    taskKind === 'dosing' || taskKind === 'maintenance'
      ? {
          taskKind,
          taskId: params.get('taskId'),
          executionId: params.get('executionId'),
          visitTitle: params.get('visitTitle'),
        }
      : null;

  return {
    saleId,
    pendingServiceId,
    subscriptionId,
    category,
    serviceContext,
  };
}

export function buildKolamComplaintCreateRoute(params: {
  saleId: string;
  pendingServiceId?: string | null;
  subscriptionId?: string | null;
  category?: string | null;
}): string {
  const query = new URLSearchParams();
  if (params.saleId.trim()) {
    query.set('saleId', params.saleId.trim());
  }
  if (params.pendingServiceId?.trim()) {
    query.set('pendingServiceId', params.pendingServiceId.trim());
  }
  if (params.subscriptionId?.trim()) {
    query.set('subscriptionId', params.subscriptionId.trim());
  }
  if (params.category?.trim()) {
    query.set('category', params.category.trim());
  }
  const qs = query.toString();
  return qs
    ? `${KOLAM_COMPLAINT_ROOT}/create?${qs}`
    : `${KOLAM_COMPLAINT_ROOT}/create`;
}

export function isKolamSaleEligibleForComplaint(sale: {
  status?: string | null;
  deliveryStatus?: string | null;
}): boolean {
  const status = String(sale.status ?? '').toLowerCase();
  const delivery = String(sale.deliveryStatus ?? '').toLowerCase();
  return (
    status === 'paid' && (delivery === 'delivered' || delivery === 'success')
  );
}

export function validateKolamComplaintCreateInput(
  input: KolamComplaintCreateInput,
): string | null {
  if (!input.saleId.trim()) {
    return 'Silakan pilih penjualan/invoice';
  }
  if (!input.items.length) {
    return 'Silakan pilih minimal satu item untuk dikeluhkan';
  }
  if (!input.description.trim()) {
    return 'Silakan masukkan deskripsi';
  }
  for (const item of input.items) {
    if (!Number.isFinite(item.quantity) || item.quantity < 1) {
      return 'Jumlah item dikeluhkan harus minimal 1';
    }
  }
  return null;
}

export function isMarketplaceMirrorComplaint(complaint: {
  marketplaceSource?: string | null;
}): boolean {
  return Boolean(complaint.marketplaceSource);
}

export function isWarrantyClaimComplaint(complaint: {
  source?: string | null;
}): boolean {
  return (complaint.source || 'arrival_inspection') === 'warranty_claim';
}

export function getKolamComplaintStatusLabel(status: string) {
  return (
    KOLAM_COMPLAINT_STATUS_OPTIONS.find(option => option.id === status)?.label ||
    status
  );
}

export function getKolamComplaintDecisionLabel(
  decision: string | null | undefined,
) {
  if (!decision) {
    return 'Tidak ada';
  }
  return (
    KOLAM_COMPLAINT_DECISION_OPTIONS.find(option => option.id === decision)
      ?.label || decision
  );
}

export function getKolamComplaintSourceLabel(source: string) {
  return (
    KOLAM_COMPLAINT_SOURCE_OPTIONS.find(option => option.id === source)?.label ||
    source
  );
}

export function getKolamComplaintPriorityLabel(priority: string) {
  switch (priority) {
    case 'low':
      return 'Rendah';
    case 'medium':
      return 'Sedang';
    case 'high':
      return 'Tinggi';
    case 'urgent':
      return 'Mendesak';
    default:
      return priority;
  }
}

export function getKolamComplaintCategoryLabel(category: string) {
  const labelMap: Record<string, string> = {
    defective: 'Cacat',
    wrong_item: 'Barang salah',
    damaged: 'Rusak',
    quality_issue: 'Masalah kualitas',
    service_not_delivered: 'Layanan tidak dikerjakan',
    service_incomplete: 'Layanan tidak lengkap',
    service_quality_issue: 'Kualitas layanan',
    service_delayed: 'Layanan terlambat',
    product_warranty_defect: 'Cacat produk (garansi)',
    product_warranty_malfunction: 'Kerusakan fungsi (garansi)',
    product_warranty_other: 'Lainnya (garansi)',
    other: 'Lainnya',
  };
  return labelMap[category] || category;
}

export function getKolamComplaintStatusBadgeIntent(
  status: KolamComplaintStatus,
): 'secondary' | 'warning' | 'success' | 'danger' | 'info' {
  if (status === 'pending' || status === 'in_review' || status === 'rework_review') {
    return 'warning';
  }
  if (status === 'rejected' || status === 'cancelled') {
    return 'danger';
  }
  if (status === 'completed' || status === 'closed' || status === 'approved') {
    return 'success';
  }
  if (
    status === 'return_in_transit' ||
    status === 'return_received' ||
    status === 'processing' ||
    status === 'rework_in_progress'
  ) {
    return 'info';
  }
  return 'secondary';
}

export function getKolamComplaintDecisionBadgeIntent(
  decision: KolamComplaintDecision,
): 'secondary' | 'warning' | 'success' | 'danger' | 'info' {
  if (!decision) {
    return 'secondary';
  }
  if (decision === 'refund' || decision === 'warranty_honored_da') {
    return 'success';
  }
  if (decision === 'replacement' || decision === 'rework' || decision === 'warranty_honored_vendor') {
    return 'info';
  }
  if (decision === 'return_then_refund') {
    return 'warning';
  }
  if (decision === 'warranty_rejected') {
    return 'danger';
  }
  return 'secondary';
}

export function getKolamComplaintHistoryActionLabel(action: string) {
  const labelMap: Record<string, string> = {
    status_change: 'Status',
    decision: 'Keputusan',
    assignment: 'Penugasan',
    message: 'Pesan',
    return_update: 'Retur',
    replacement_update: 'Penggantian',
    rework_update: 'Perbaikan',
    close: 'Tutup',
    photo_upload: 'Foto',
    created: 'Dibuat',
    refund_payment_sent: 'Refund dikirim',
    refund_payment_completed: 'Refund selesai',
  };
  return labelMap[action] || action;
}

/** FE `complaint-status-updater` getAllowedStatuses. */
export function getAllowedKolamComplaintStatuses(
  currentStatus: KolamComplaintStatus,
): KolamComplaintStatus[] {
  switch (currentStatus) {
    case 'pending':
      return ['in_review'];
    case 'in_review':
      return ['approved', 'rejected', 'cancelled'];
    case 'approved':
      return ['processing', 'cancelled'];
    case 'processing':
      return ['completed', 'cancelled'];
    case 'return_in_transit':
      return ['return_received', 'completed'];
    case 'return_received':
      return ['completed'];
    case 'completed':
      return ['closed'];
    case 'rejected':
      return ['closed', 'cancelled'];
    case 'cancelled':
    case 'closed':
      return [];
    default:
      return [];
  }
}

/** FE `getAvailableDecisions` (warranty vendor mode optional). */
export function getAvailableKolamComplaintDecisions(
  isServiceOnly: boolean,
  options?: {
    isWarrantyClaim?: boolean;
    warrantyMode?: 'official_distributor' | 'da' | null;
  },
): Array<{ id: NonNullable<KolamComplaintDecision>; label: string }> {
  if (options?.isWarrantyClaim) {
    const decisions: Array<{
      id: NonNullable<KolamComplaintDecision>;
      label: string;
    }> = [
      { id: 'warranty_honored_da', label: 'Garansi dihonori (DA)' },
      { id: 'warranty_rejected', label: 'Garansi ditolak' },
    ];
    if (options.warrantyMode === 'official_distributor') {
      decisions.splice(1, 0, {
        id: 'warranty_honored_vendor',
        label: 'Garansi dihonori (Vendor)',
      });
    }
    return decisions;
  }
  if (isServiceOnly) {
    return [
      { id: 'rework', label: 'Rework (dikerjakan ulang)' },
      { id: 'refund', label: 'Refund' },
    ];
  }
  return [
    { id: 'replacement', label: 'Penggantian barang' },
    { id: 'return_then_refund', label: 'Retur & pengembalian dana' },
  ];
}

/** FE return updater: pending → in_transit → received → verified. */
export function getAllowedKolamComplaintTrackingStatuses(
  current: KolamComplaintTrackingStatus,
): KolamComplaintTrackingStatus[] {
  switch (current) {
    case 'pending':
      return ['in_transit'];
    case 'in_transit':
      return ['received'];
    case 'received':
      return ['verified'];
    case 'verified':
      return [];
    default:
      return [];
  }
}

export function getKolamComplaintTrackingStatusLabel(
  status: KolamComplaintTrackingStatus | string,
) {
  switch (status) {
    case 'pending':
      return 'Menunggu';
    case 'in_transit':
      return 'Dalam perjalanan';
    case 'received':
      return 'Diterima';
    case 'verified':
      return 'Terverifikasi';
    default:
      return status;
  }
}

export type KolamComplaintKpiSeverity = 'light' | 'valid' | 'severe';

export const KOLAM_COMPLAINT_KPI_OPTIONS: Array<{
  id: KolamComplaintKpiSeverity | 'none';
  label: string;
}> = [
  { id: 'none', label: 'Tanpa penalti KPI' },
  { id: 'light', label: 'Ringan (−10)' },
  { id: 'valid', label: 'Valid (−25)' },
  { id: 'severe', label: 'Berat (−50)' },
];

export function canUpdateKolamComplaintStatus(complaint: KolamComplaint) {
  if (complaint.marketplaceReadOnly) {
    return false;
  }
  if (!complaint.assignedStaffId) {
    return false;
  }
  if (complaint.status === 'cancelled' || complaint.status === 'closed') {
    return false;
  }
  return getAllowedKolamComplaintStatuses(complaint.status).length > 0;
}

export function canSetKolamComplaintDecision(complaint: KolamComplaint) {
  if (complaint.marketplaceReadOnly) {
    return false;
  }
  return complaint.status === 'in_review' || complaint.status === 'approved';
}

export function canCloseKolamComplaint(complaint: KolamComplaint) {
  if (complaint.marketplaceReadOnly) {
    return false;
  }
  return complaint.status === 'completed';
}

export function needsKolamComplaintReturnTracking(complaint: KolamComplaint) {
  return (
    complaint.decision === 'return_then_refund' ||
    complaint.decision === 'replacement'
  );
}

/**
 * Same resolution as sales detail: prefer embedded sale.sourceRef.logo,
 * then active Sales Source catalog by id.
 */
export function resolveKolamComplaintSaleSourceLogoUri(
  complaint: {
    saleSourceRef?: KolamComplaintSaleSourceRef | null;
  },
  sources: Array<{ id: string; logoUri?: string | null }> = [],
): string | null {
  const embedded = complaint.saleSourceRef?.logoUri?.trim() || '';
  if (embedded) {
    return embedded;
  }
  const sourceId = complaint.saleSourceRef?.id?.trim() || '';
  if (!sourceId) {
    return null;
  }
  const fromCatalog = sources.find(row => row.id === sourceId)?.logoUri?.trim();
  return fromCatalog || null;
}

export function normalizeKolamComplaint(payload: unknown): KolamComplaint {
  const record = asRecord(unwrapData(payload));
  const id = getString(record, '_id') || getString(record, 'id');
  const sale = normalizeSaleRef(record.sale);
  const assigned = normalizePerson(record.assignedStaff);
  const marketplaceSource = normalizeMarketplaceSource(record.marketplaceSource);
  const items = normalizeItems(record.items);
  const source = normalizeSource(getString(record, 'source'));

  return {
    id: id || getString(record, 'ticketCode') || 'complaint',
    ticketCode: getString(record, 'ticketCode') || id || '—',
    saleId: sale.id,
    invoiceCode: sale.invoiceCode,
    customerName: sale.customerName,
    isCustomProject: sale.isCustomProject,
    saleSourceRef: sale.sourceRef,
    source,
    status: normalizeStatus(getString(record, 'status')),
    decision: normalizeDecision(record.decision),
    priority: normalizePriority(getString(record, 'priority')),
    category: normalizeCategory(getString(record, 'category')),
    description: getString(record, 'description'),
    itemCount: items.length,
    items,
    refundAmount: getNumber(record, 'refundAmount') ?? 0,
    assignedStaffId: assigned.id,
    assignedStaffName: assigned.name || (record.assignedStaff ? 'Pengguna dihapus' : '—'),
    createdByName:
      getString(record, 'createdByName') ||
      normalizePerson(record.createdBy).name ||
      '—',
    createdByType:
      getString(record, 'createdByType') === 'customer' ? 'customer' : 'staff',
    isServiceOnly: getBoolean(record, 'isServiceOnly') ?? false,
    marketplaceSource,
    marketplaceReadOnly: Boolean(marketplaceSource),
    photos: normalizePhotos(record.photos),
    histories: normalizeHistories(record.histories),
    returnTracking: normalizeTracking(record.returnTracking),
    replacementTracking: normalizeTracking(record.replacementTracking),
    replacementReturnTracking: normalizeTracking(record.replacementReturnTracking),
    reworkCount: getNumber(record, 'reworkCount') ?? 0,
    maxRework: getNumber(record, 'maxRework') ?? 2,
    createdAt: getString(record, 'createdAt') || undefined,
    updatedAt: getString(record, 'updatedAt') || undefined,
    raw: payload,
  };
}

export function normalizeKolamComplaintList(
  payload: unknown,
  query: KolamComplaintListQuery = {},
): KolamComplaintListResult {
  // BE shape: `{ data: Complaint[], pagination: { page, limit, total, totalPages } }`.
  // Do not unwrap `data` first — that drops the sibling `pagination` object.
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

  const pagination = asRecord(
    outer.pagination ?? nested.pagination ?? null,
  );
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
    items: list.map(normalizeKolamComplaint).filter(item => item.id),
    page,
    limit,
    total,
    totalPages,
  };
}

export function normalizeKolamComplaintDetail(payload: unknown): KolamComplaint {
  return normalizeKolamComplaint(payload);
}

function normalizeSaleRef(value: unknown): {
  id: string | null;
  invoiceCode: string;
  customerName: string;
  isCustomProject: boolean;
  sourceRef: KolamComplaintSaleSourceRef | null;
} {
  if (!value) {
    return {
      id: null,
      invoiceCode: '—',
      customerName: '—',
      isCustomProject: false,
      sourceRef: null,
    };
  }
  if (typeof value === 'string') {
    return {
      id: value,
      invoiceCode: '—',
      customerName: '—',
      isCustomProject: false,
      sourceRef: null,
    };
  }
  const record = asRecord(value);
  const customer = record.customer;
  let customerName = '—';
  if (typeof customer === 'string') {
    customerName = customer;
  } else if (customer && typeof customer === 'object') {
    const customerRecord = asRecord(customer);
    customerName =
      getString(customerRecord, 'name') ||
      [
        getString(customerRecord, 'first_name'),
        getString(customerRecord, 'last_name'),
      ]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      getString(customerRecord, 'phone') ||
      '—';
  }
  return {
    id: getString(record, '_id') || getString(record, 'id') || null,
    invoiceCode: getString(record, 'invoiceCode') || '—',
    customerName,
    isCustomProject: getBoolean(record, 'isCustomProject') ?? false,
    sourceRef: normalizeSaleSourceRef(record.sourceRef),
  };
}

function normalizeSaleSourceRef(
  value: unknown,
): KolamComplaintSaleSourceRef | null {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    const id = value.trim();
    return id ? { id, name: '', logoUri: null } : null;
  }
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  if (!id) {
    return null;
  }
  const logo =
    getString(record, 'logo') ||
    getString(record, 'logoUrl') ||
    getString(record, 'logoUri') ||
    getString(record, 'icon');
  return {
    id,
    name: getString(record, 'name') || getString(record, 'displayName') || '',
    logoUri: logo ? getKolamFileUrl(logo) : null,
  };
}

function normalizePerson(value: unknown): { id: string | null; name: string } {
  if (!value) {
    return { id: null, name: '' };
  }
  if (typeof value === 'string') {
    return { id: value, name: '' };
  }
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id') || null;
  const name =
    getString(record, 'name') ||
    [
      getString(record, 'first_name') || getString(record, 'firstName'),
      getString(record, 'last_name') || getString(record, 'lastName'),
    ]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    getString(record, 'username') ||
    getString(record, 'email');
  return { id, name };
}

function normalizeItems(value: unknown): KolamComplaintItem[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item, index) => {
    const record = asRecord(item);
    const itemType = normalizeItemType(getString(record, 'itemType'));
    return {
      id: getString(record, '_id') || getString(record, 'id') || `item-${index}`,
      saleItemIndex: getNumber(record, 'saleItemIndex') ?? index,
      itemType,
      name: resolveItemName(record, itemType),
      quantity: getNumber(record, 'quantity') ?? 0,
      reason: getString(record, 'reason'),
    };
  });
}

function resolveItemName(
  record: Record<string, unknown>,
  itemType: KolamComplaintItemType,
): string {
  const nestedKeys = [
    'product',
    'species',
    'freyer',
    'teranura',
    'service',
    'variant',
  ] as const;
  for (const key of nestedKeys) {
    const nested = record[key];
    if (nested && typeof nested === 'object') {
      const nestedRecord = asRecord(nested);
      const name =
        getString(nestedRecord, 'name') ||
        getString(nestedRecord, 'title') ||
        getString(nestedRecord, 'sku');
      if (name) {
        return name;
      }
    }
  }
  return getString(record, 'name') || labelItemType(itemType);
}

function labelItemType(itemType: KolamComplaintItemType) {
  switch (itemType) {
    case 'product':
      return 'Produk';
    case 'species':
      return 'Spesies';
    case 'service':
      return 'Layanan';
    case 'custom_project':
      return 'Proyek khusus';
    case 'freyer':
      return 'Freyer';
    case 'teranura':
      return 'Teranura';
    default:
      return 'Item';
  }
}

function normalizePhotos(value: unknown): KolamComplaintPhoto[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const photos: KolamComplaintPhoto[] = [];
  value.forEach((item, index) => {
    const record = asRecord(item);
    const path = getString(record, 'path');
    if (!path) {
      return;
    }
    photos.push({
      id: getString(record, '_id') || getString(record, 'id') || `photo-${index}`,
      path,
      uri: getKolamFileUrl(path),
      uploadedAt: getString(record, 'uploadedAt') || undefined,
      note: getString(record, 'note') || undefined,
    });
  });
  return photos;
}

function normalizeHistories(value: unknown): KolamComplaintHistory[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item, index) => {
    const record = asRecord(item);
    return {
      id: getString(record, '_id') || getString(record, 'id') || `history-${index}`,
      action: normalizeHistoryAction(getString(record, 'action')),
      note: getString(record, 'note'),
      status: record.status
        ? normalizeStatus(String(record.status))
        : undefined,
      oldStatus: record.oldStatus
        ? normalizeStatus(String(record.oldStatus))
        : undefined,
      decision:
        record.decision !== undefined
          ? normalizeDecision(record.decision)
          : undefined,
      changedByLabel: normalizePerson(record.changedBy).name || '—',
      changedAt: getString(record, 'changedAt') || undefined,
    };
  });
}

function normalizeTracking(value: unknown): KolamComplaintTracking | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = asRecord(value);
  const statusRaw = getString(record, 'status');
  if (!statusRaw) {
    return null;
  }
  return {
    status: normalizeTrackingStatus(statusRaw),
    trackingNumber: getString(record, 'trackingNumber'),
    courierName: getString(record, 'courierName'),
    receivedByLabel:
      getString(record, 'receivedByLabel') ||
      normalizePerson(record.receivedBy).name,
    verifiedNote: getString(record, 'verifiedNote'),
    sentAt: getString(record, 'sentAt') || undefined,
    receivedAt: getString(record, 'receivedAt') || undefined,
    verifiedAt: getString(record, 'verifiedAt') || undefined,
  };
}

function normalizeStatus(value: string): KolamComplaintStatus {
  const allowed: KolamComplaintStatus[] = [
    'pending',
    'in_review',
    'approved',
    'processing',
    'rework_in_progress',
    'rework_review',
    'return_in_transit',
    'return_received',
    'completed',
    'rejected',
    'cancelled',
    'closed',
  ];
  return (allowed.includes(value as KolamComplaintStatus)
    ? value
    : 'pending') as KolamComplaintStatus;
}

function normalizeDecision(value: unknown): KolamComplaintDecision {
  if (value == null || value === '') {
    return null;
  }
  const raw = String(value);
  const allowed: NonNullable<KolamComplaintDecision>[] = [
    'refund',
    'replacement',
    'return_then_refund',
    'rework',
    'warranty_honored_da',
    'warranty_honored_vendor',
    'warranty_rejected',
  ];
  return allowed.includes(raw as NonNullable<KolamComplaintDecision>)
    ? (raw as KolamComplaintDecision)
    : null;
}

function normalizeSource(value: string): KolamComplaintSource {
  return value === 'warranty_claim' ? 'warranty_claim' : 'arrival_inspection';
}

function normalizePriority(value: string): KolamComplaintPriority {
  if (value === 'low' || value === 'high' || value === 'urgent') {
    return value;
  }
  return 'medium';
}

function normalizeCategory(value: string): KolamComplaintCategory {
  const allowed: KolamComplaintCategory[] = [
    'defective',
    'wrong_item',
    'damaged',
    'quality_issue',
    'service_not_delivered',
    'service_incomplete',
    'service_quality_issue',
    'service_delayed',
    'product_warranty_defect',
    'product_warranty_malfunction',
    'product_warranty_other',
    'other',
  ];
  return allowed.includes(value as KolamComplaintCategory)
    ? (value as KolamComplaintCategory)
    : 'other';
}

function normalizeItemType(value: string): KolamComplaintItemType {
  const allowed: KolamComplaintItemType[] = [
    'product',
    'species',
    'freyer',
    'teranura',
    'service',
    'custom_project',
  ];
  return allowed.includes(value as KolamComplaintItemType)
    ? (value as KolamComplaintItemType)
    : 'product';
}

function normalizeMarketplaceSource(
  value: unknown,
): 'shopee' | 'tokopedia' | null {
  const raw = String(value ?? '')
    .trim()
    .toLowerCase();
  if (raw === 'shopee' || raw === 'tokopedia') {
    return raw;
  }
  return null;
}

function normalizeHistoryAction(value: string): KolamComplaintHistoryAction {
  const allowed: KolamComplaintHistoryAction[] = [
    'status_change',
    'decision',
    'assignment',
    'message',
    'return_update',
    'replacement_update',
    'rework_update',
    'close',
    'photo_upload',
    'created',
    'refund_payment_sent',
    'refund_payment_completed',
  ];
  return allowed.includes(value as KolamComplaintHistoryAction)
    ? (value as KolamComplaintHistoryAction)
    : 'status_change';
}

function normalizeTrackingStatus(value: string): KolamComplaintTrackingStatus {
  if (
    value === 'in_transit' ||
    value === 'received' ||
    value === 'verified'
  ) {
    return value;
  }
  return 'pending';
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

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string'
    ? value.trim()
    : value == null
      ? ''
      : String(value).trim();
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

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
  receivedById: string | null;
  receivedByType: 'customer' | 'other' | '';
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

export type KolamComplaintRefundPaymentStatus = 'pending' | 'sent' | 'completed';

export type KolamComplaintRefundWorkflowStep =
  | 'create'
  | 'send'
  | 'confirm'
  | 'completed'
  | 'unavailable';

export interface KolamComplaintRefundPaymentDetails {
  accountNumber: string;
  accountName: string;
  bank: string;
  transferDate: string;
  transferMethod: string;
  note: string;
}

export interface KolamComplaintRefundPaymentHistoryEntry {
  id: string;
  action: string;
  note: string;
  changedByLabel: string;
  timestamp?: string;
}

export interface KolamComplaintRefundTransaction {
  id: string;
  amount: number;
  confirmStatus: 'unconfirmed' | 'confirmed' | 'rejected' | '';
  walletId: string | null;
  walletName: string;
  note: string;
  createdAt?: string;
}

export type KolamComplaintReworkStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed';

export type KolamComplaintWarrantyMode = 'official_distributor' | 'da';

export type KolamComplaintVendorClaimStatus =
  | 'not_applicable'
  | 'pending_submission'
  | 'submitted_to_vendor'
  | 'vendor_approved'
  | 'vendor_rejected'
  | 'resolved'
  | 'closed';

export interface KolamComplaintWarrantyContext {
  mode: KolamComplaintWarrantyMode | null;
  warrantyDays: number | null;
  warrantyEndsAt: string | null;
  vendorId: string | null;
  vendorName: string;
  termsTemplateId: string | null;
}

export interface KolamComplaintVendorClaim {
  status: KolamComplaintVendorClaimStatus;
  claimReference: string;
  submittedAt?: string;
  submittedByLabel: string;
  vendorResponseAt?: string;
  vendorResponseNote: string;
  resolutionNote: string;
}

export interface KolamComplaintServiceContext {
  taskKind: 'dosing' | 'maintenance' | null;
  taskId: string | null;
  executionId: string | null;
  visitTitle: string | null;
  packageTaskCode: string | null;
}

export interface KolamComplaintPendingServiceRef {
  id: string;
  serviceSerial: string;
  status: string;
}

export interface KolamComplaintSubscriptionRef {
  id: string;
  subscriptionNumber: string;
  status: string;
}

export interface KolamComplaintReworkTracking {
  id: string;
  reworkNumber: number;
  status: KolamComplaintReworkStatus;
  assignedToLabel: string;
  startedAt?: string;
  completedAt?: string;
  note: string;
  resultNote: string;
  photos: KolamComplaintPhoto[];
  customerAccepted: boolean | null;
  customerAcceptedAt?: string;
  customerNote: string;
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
  createdById: string | null;
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
  refundPaymentStatus: KolamComplaintRefundPaymentStatus | null;
  refundPaymentSentAt?: string;
  refundPaymentSentByLabel: string;
  refundPaymentDetails: KolamComplaintRefundPaymentDetails | null;
  refundPaymentProof: KolamComplaintPhoto[];
  refundPaymentHistory: KolamComplaintRefundPaymentHistoryEntry[];
  refundTransaction: KolamComplaintRefundTransaction | null;
  warrantyContext: KolamComplaintWarrantyContext | null;
  vendorClaim: KolamComplaintVendorClaim | null;
  serviceContext: KolamComplaintServiceContext | null;
  pendingService: KolamComplaintPendingServiceRef | null;
  subscription: KolamComplaintSubscriptionRef | null;
  reworkTracking: KolamComplaintReworkTracking[];
  currentReworkIndex: number | null;
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

/** Full category set for list filters (create + warranty). */
export const KOLAM_COMPLAINT_CATEGORY_FILTER_OPTIONS: Array<{
  id: KolamComplaintCategory;
  label: string;
}> = [
  ...KOLAM_COMPLAINT_CREATE_CATEGORY_OPTIONS,
  {
    id: 'product_warranty_defect',
    label: 'Cacat produk (garansi)',
  },
  {
    id: 'product_warranty_malfunction',
    label: 'Kerusakan fungsi (garansi)',
  },
  {
    id: 'product_warranty_other',
    label: 'Lainnya (garansi)',
  },
];

export const KOLAM_COMPLAINT_DEFAULT_PERIOD_DAYS = 3;

export function normalizeKolamComplaintPeriodDays(value: unknown): number {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim()
        ? Number(value)
        : Number.NaN;
  if (!Number.isFinite(parsed) || parsed < 0) {
    return KOLAM_COMPLAINT_DEFAULT_PERIOD_DAYS;
  }
  return Math.floor(parsed);
}

export function validateKolamComplaintPeriodDaysInput(
  raw: string,
): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return 'Masukkan jumlah hari yang valid.';
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 'Masukkan jumlah hari yang valid (≥ 0).';
  }
  return null;
}

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
          packageTaskCode: params.get('packageTaskCode'),
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

export const KOLAM_COMPLAINT_REFUND_TRANSFER_METHOD_OPTIONS: Array<{
  id: string;
  label: string;
}> = [
  { id: 'transfer', label: 'Transfer bank' },
  { id: 'ewallet', label: 'E-Wallet' },
  { id: 'cash', label: 'Tunai' },
  { id: 'other', label: 'Lainnya' },
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

/** FE: replacement updater after returnTracking verified. */
export function needsKolamComplaintReplacementTracking(
  complaint: KolamComplaint,
): boolean {
  if (complaint.marketplaceReadOnly || complaint.decision !== 'replacement') {
    return false;
  }
  if (complaint.returnTracking?.status !== 'verified') {
    return false;
  }
  const current = complaint.replacementTracking?.status || 'pending';
  return getAllowedKolamComplaintTrackingStatuses(current).length > 0;
}

/** FE: replacement-return updater when decision is replacement. */
export function needsKolamComplaintReplacementReturnTracking(
  complaint: KolamComplaint,
): boolean {
  if (complaint.marketplaceReadOnly || complaint.decision !== 'replacement') {
    return false;
  }
  const current = complaint.replacementReturnTracking?.status || 'pending';
  return getAllowedKolamComplaintTrackingStatuses(current).length > 0;
}

export function isKolamComplaintReturnAwaitingVerification(
  complaint: KolamComplaint,
): boolean {
  return (
    !complaint.marketplaceReadOnly &&
    complaint.decision === 'replacement' &&
    complaint.returnTracking?.status !== 'verified'
  );
}

/** BE: refund payment only for return_then_refund after return verified. */
export function canOpenKolamComplaintRefundPayment(
  complaint: KolamComplaint,
): boolean {
  return (
    !complaint.marketplaceReadOnly &&
    complaint.decision === 'return_then_refund' &&
    complaint.returnTracking?.status === 'verified' &&
    complaint.refundPaymentStatus !== 'completed'
  );
}

export function isKolamComplaintRefundAwaitingReturn(
  complaint: KolamComplaint,
): boolean {
  return (
    !complaint.marketplaceReadOnly &&
    complaint.decision === 'return_then_refund' &&
    complaint.returnTracking?.status !== 'verified'
  );
}

export function getKolamComplaintRefundPaymentStatusLabel(
  status: KolamComplaintRefundPaymentStatus | string | null | undefined,
): string {
  switch (status) {
    case 'sent':
      return 'Pembayaran dikirim';
    case 'completed':
      return 'Pembayaran selesai';
    case 'pending':
      return 'Menunggu';
    default:
      return 'Belum ada';
  }
}

export function getKolamComplaintRefundWorkflowStep(
  complaint: KolamComplaint,
): KolamComplaintRefundWorkflowStep {
  if (complaint.refundPaymentStatus === 'completed') {
    return 'completed';
  }
  if (!canOpenKolamComplaintRefundPayment(complaint)) {
    return 'unavailable';
  }
  if (!complaint.refundTransaction) {
    return 'create';
  }
  if (complaint.refundPaymentStatus !== 'sent') {
    return 'send';
  }
  if (
    complaint.refundPaymentStatus === 'sent' &&
    complaint.refundTransaction.confirmStatus !== 'confirmed'
  ) {
    return 'confirm';
  }
  return 'completed';
}

export function getKolamComplaintReworkStatusLabel(
  status: KolamComplaintReworkStatus | string,
): string {
  switch (status) {
    case 'pending':
      return 'Menunggu';
    case 'in_progress':
      return 'Sedang dikerjakan';
    case 'completed':
      return 'Selesai';
    case 'failed':
      return 'Gagal';
    default:
      return status;
  }
}

export function getAllowedKolamComplaintReworkStatuses(
  current: KolamComplaintReworkStatus,
): KolamComplaintReworkStatus[] {
  switch (current) {
    case 'pending':
      return ['in_progress'];
    case 'in_progress':
      return ['completed', 'failed'];
    case 'completed':
    case 'failed':
      return [];
    default:
      return [];
  }
}

export function getKolamComplaintCurrentRework(
  complaint: KolamComplaint,
): KolamComplaintReworkTracking | null {
  if (!complaint.reworkTracking.length) {
    return null;
  }
  if (
    complaint.currentReworkIndex != null &&
    complaint.currentReworkIndex >= 0 &&
    complaint.currentReworkIndex < complaint.reworkTracking.length
  ) {
    return complaint.reworkTracking[complaint.currentReworkIndex] ?? null;
  }
  return complaint.reworkTracking[complaint.reworkTracking.length - 1] ?? null;
}

export function canUpdateKolamComplaintReworkStatus(
  complaint: KolamComplaint,
): boolean {
  if (
    complaint.marketplaceReadOnly ||
    isWarrantyClaimComplaint(complaint) ||
    complaint.decision !== 'rework'
  ) {
    return false;
  }
  const current = getKolamComplaintCurrentRework(complaint);
  if (!current) {
    return false;
  }
  if (current.status === 'completed' && complaint.status === 'rework_review') {
    return false;
  }
  return getAllowedKolamComplaintReworkStatuses(current.status).length > 0;
}

export function canSubmitKolamComplaintReworkCustomerResponse(
  complaint: KolamComplaint,
): boolean {
  if (
    complaint.marketplaceReadOnly ||
    isWarrantyClaimComplaint(complaint) ||
    complaint.status !== 'rework_review'
  ) {
    return false;
  }
  const current = getKolamComplaintCurrentRework(complaint);
  return Boolean(
    current &&
      current.status === 'completed' &&
      current.customerAccepted === null,
  );
}

export function getKolamComplaintWarrantyModeLabel(
  mode: KolamComplaintWarrantyMode | string | null | undefined,
): string {
  if (mode === 'official_distributor') {
    return 'Distributor resmi';
  }
  if (mode === 'da') {
    return 'Dunia Anura';
  }
  return '—';
}

export function getKolamComplaintVendorClaimStatusLabel(
  status: KolamComplaintVendorClaimStatus | string,
): string {
  switch (status) {
    case 'not_applicable':
      return 'Tidak berlaku';
    case 'pending_submission':
      return 'Menunggu pengajuan';
    case 'submitted_to_vendor':
      return 'Diajukan ke vendor';
    case 'vendor_approved':
      return 'Disetujui vendor';
    case 'vendor_rejected':
      return 'Ditolak vendor';
    case 'resolved':
      return 'Selesai';
    case 'closed':
      return 'Ditutup';
    default:
      return status;
  }
}

export function getAllowedKolamComplaintVendorClaimStatuses(
  current: KolamComplaintVendorClaimStatus,
): KolamComplaintVendorClaimStatus[] {
  switch (current) {
    case 'pending_submission':
      return ['submitted_to_vendor'];
    case 'submitted_to_vendor':
      return ['vendor_approved', 'vendor_rejected'];
    case 'vendor_approved':
    case 'vendor_rejected':
      return ['resolved'];
    case 'resolved':
      return ['closed'];
    default:
      return [];
  }
}

export function canUpdateKolamComplaintVendorClaim(
  complaint: KolamComplaint,
): boolean {
  if (
    complaint.marketplaceReadOnly ||
    !isWarrantyClaimComplaint(complaint) ||
    complaint.warrantyContext?.mode !== 'official_distributor' ||
    complaint.status === 'closed'
  ) {
    return false;
  }
  const current = complaint.vendorClaim?.status || 'pending_submission';
  return getAllowedKolamComplaintVendorClaimStatuses(current).length > 0;
}

export function canShowKolamComplaintServiceContext(
  complaint: KolamComplaint,
): boolean {
  return Boolean(
    complaint.pendingService?.id ||
      complaint.subscription?.id ||
      complaint.serviceContext?.taskId,
  );
}

export function canSpawnKolamComplaintServiceReworkVisit(
  complaint: KolamComplaint,
): boolean {
  return Boolean(
    complaint.pendingService?.id &&
      complaint.decision === 'rework' &&
      (complaint.status === 'rework_in_progress' ||
        complaint.status === 'approved') &&
      complaint.reworkCount < complaint.maxRework,
  );
}

export function getKolamComplaintWarrantyDaysRemainingAtClaim(
  complaint: KolamComplaint,
): number | null {
  const endsAt = complaint.warrantyContext?.warrantyEndsAt;
  const createdAt = complaint.createdAt;
  if (!endsAt || !createdAt) {
    return null;
  }
  const end = new Date(endsAt).getTime();
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(end) || Number.isNaN(created)) {
    return null;
  }
  return Math.max(0, Math.ceil((end - created) / (1000 * 60 * 60 * 24)));
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
    createdById: normalizePerson(record.createdBy).id,
    createdByName:
      getString(record, 'createdByName') ||
      normalizePerson(record.createdBy).name ||
      '—',
    createdByType:
      getString(record, 'createdByType') === 'customer' ? 'customer' : 'staff',
    isServiceOnly:
      getBoolean(record, 'isServiceOnly') ??
      (items.length > 0 &&
        items.every(
          item =>
            item.itemType === 'service' || item.itemType === 'custom_project',
        )),
    marketplaceSource,
    marketplaceReadOnly: Boolean(marketplaceSource),
    photos: normalizePhotos(record.photos),
    histories: normalizeHistories(record.histories),
    returnTracking: normalizeTracking(record.returnTracking),
    replacementTracking: normalizeTracking(record.replacementTracking),
    replacementReturnTracking: normalizeTracking(record.replacementReturnTracking),
    refundPaymentStatus: normalizeRefundPaymentStatus(
      getString(record, 'refundPaymentStatus'),
    ),
    refundPaymentSentAt:
      getString(record, 'refundPaymentSentAt') || undefined,
    refundPaymentSentByLabel:
      normalizePerson(record.refundPaymentSentBy).name || '',
    refundPaymentDetails: normalizeRefundPaymentDetails(
      record.refundPaymentDetails,
    ),
    refundPaymentProof: normalizePhotos(record.refundPaymentProof),
    refundPaymentHistory: normalizeRefundPaymentHistory(
      record.refundPaymentHistory,
    ),
    refundTransaction: normalizeRefundTransaction(record.refundTransaction),
    warrantyContext: normalizeWarrantyContext(record.warrantyContext),
    vendorClaim: normalizeVendorClaim(record.vendorClaim),
    serviceContext: normalizeServiceContext(record.serviceContext),
    pendingService: normalizePendingServiceRef(record.pendingService),
    subscription: normalizeSubscriptionRef(record.subscription),
    reworkTracking: normalizeReworkTrackingList(record.reworkTracking),
    currentReworkIndex: normalizeCurrentReworkIndex(record.currentReworkIndex),
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
  const receivedBy = normalizePerson(record.receivedBy);
  const receivedByTypeRaw = getString(record, 'receivedByType');
  const receivedByType =
    receivedByTypeRaw === 'customer' || receivedByTypeRaw === 'other'
      ? receivedByTypeRaw
      : '';
  return {
    status: normalizeTrackingStatus(statusRaw),
    trackingNumber: getString(record, 'trackingNumber'),
    courierName: getString(record, 'courierName'),
    receivedByLabel:
      getString(record, 'receivedByLabel') || receivedBy.name,
    receivedById: receivedBy.id,
    receivedByType,
    verifiedNote: getString(record, 'verifiedNote'),
    sentAt: getString(record, 'sentAt') || undefined,
    receivedAt: getString(record, 'receivedAt') || undefined,
    verifiedAt: getString(record, 'verifiedAt') || undefined,
  };
}

function normalizeRefundPaymentStatus(
  value: string,
): KolamComplaintRefundPaymentStatus | null {
  if (value === 'sent' || value === 'completed' || value === 'pending') {
    return value;
  }
  return null;
}

function normalizeRefundPaymentDetails(
  value: unknown,
): KolamComplaintRefundPaymentDetails | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = asRecord(value);
  const details: KolamComplaintRefundPaymentDetails = {
    accountNumber: getString(record, 'accountNumber'),
    accountName: getString(record, 'accountName'),
    bank: getString(record, 'bank'),
    transferDate: getString(record, 'transferDate'),
    transferMethod: getString(record, 'transferMethod'),
    note: getString(record, 'note'),
  };
  if (
    !details.accountNumber &&
    !details.accountName &&
    !details.bank &&
    !details.transferDate &&
    !details.transferMethod &&
    !details.note
  ) {
    return null;
  }
  return details;
}

function normalizeRefundPaymentHistory(
  value: unknown,
): KolamComplaintRefundPaymentHistoryEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item, index) => {
    const record = asRecord(item);
    return {
      id: getString(record, '_id') || getString(record, 'id') || `refund-h-${index}`,
      action: getString(record, 'action') || '—',
      note: getString(record, 'note'),
      changedByLabel: normalizePerson(record.by).name || '—',
      timestamp:
        getString(record, 'timestamp') ||
        getString(record, 'changedAt') ||
        undefined,
    };
  });
}

function normalizeRefundTransaction(
  value: unknown,
): KolamComplaintRefundTransaction | null {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    const id = value.trim();
    if (!id) {
      return null;
    }
    return {
      id,
      amount: 0,
      confirmStatus: '',
      walletId: null,
      walletName: '—',
      note: '',
    };
  }
  if (typeof value !== 'object') {
    return null;
  }
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  if (!id) {
    return null;
  }
  const wallet = asRecord(record.wallet);
  const confirmRaw = getString(record, 'confirmStatus');
  const confirmStatus =
    confirmRaw === 'confirmed' ||
    confirmRaw === 'rejected' ||
    confirmRaw === 'unconfirmed'
      ? confirmRaw
      : '';
  return {
    id,
    amount: getNumber(record, 'amount') ?? 0,
    confirmStatus,
    walletId: getString(wallet, '_id') || getString(wallet, 'id') || null,
    walletName: getString(wallet, 'name') || '—',
    note: getString(record, 'note'),
    createdAt: getString(record, 'createdAt') || undefined,
  };
}

function normalizeWarrantyContext(
  value: unknown,
): KolamComplaintWarrantyContext | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = asRecord(value);
  const modeRaw = getString(record, 'mode');
  const mode =
    modeRaw === 'official_distributor' || modeRaw === 'da' ? modeRaw : null;
  return {
    mode,
    warrantyDays: getNumber(record, 'warrantyDays') ?? null,
    warrantyEndsAt: getString(record, 'warrantyEndsAt') || null,
    vendorId: getString(record, 'vendorId') || null,
    vendorName: getString(record, 'vendorName'),
    termsTemplateId: getString(record, 'termsTemplateId') || null,
  };
}

function normalizeVendorClaimStatus(
  value: string,
): KolamComplaintVendorClaimStatus {
  const allowed: KolamComplaintVendorClaimStatus[] = [
    'not_applicable',
    'pending_submission',
    'submitted_to_vendor',
    'vendor_approved',
    'vendor_rejected',
    'resolved',
    'closed',
  ];
  return allowed.includes(value as KolamComplaintVendorClaimStatus)
    ? (value as KolamComplaintVendorClaimStatus)
    : 'pending_submission';
}

function normalizeVendorClaim(
  value: unknown,
): KolamComplaintVendorClaim | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = asRecord(value);
  return {
    status: normalizeVendorClaimStatus(getString(record, 'status')),
    claimReference: getString(record, 'claimReference'),
    submittedAt: getString(record, 'submittedAt') || undefined,
    submittedByLabel: normalizePerson(record.submittedBy).name || '',
    vendorResponseAt: getString(record, 'vendorResponseAt') || undefined,
    vendorResponseNote: getString(record, 'vendorResponseNote'),
    resolutionNote: getString(record, 'resolutionNote'),
  };
}

function normalizeServiceContext(
  value: unknown,
): KolamComplaintServiceContext | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = asRecord(value);
  const taskKindRaw = getString(record, 'taskKind');
  const taskKind =
    taskKindRaw === 'dosing' || taskKindRaw === 'maintenance'
      ? taskKindRaw
      : null;
  const ctx: KolamComplaintServiceContext = {
    taskKind,
    taskId: getString(record, 'taskId') || null,
    executionId: getString(record, 'executionId') || null,
    visitTitle: getString(record, 'visitTitle') || null,
    packageTaskCode: getString(record, 'packageTaskCode') || null,
  };
  if (
    !ctx.taskKind &&
    !ctx.taskId &&
    !ctx.executionId &&
    !ctx.visitTitle &&
    !ctx.packageTaskCode
  ) {
    return null;
  }
  return ctx;
}

function normalizePendingServiceRef(
  value: unknown,
): KolamComplaintPendingServiceRef | null {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    const id = value.trim();
    return id ? { id, serviceSerial: '', status: '' } : null;
  }
  if (typeof value !== 'object') {
    return null;
  }
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  if (!id) {
    return null;
  }
  return {
    id,
    serviceSerial: getString(record, 'serviceSerial'),
    status: getString(record, 'status'),
  };
}

function normalizeSubscriptionRef(
  value: unknown,
): KolamComplaintSubscriptionRef | null {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    const id = value.trim();
    return id ? { id, subscriptionNumber: '', status: '' } : null;
  }
  if (typeof value !== 'object') {
    return null;
  }
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  if (!id) {
    return null;
  }
  return {
    id,
    subscriptionNumber: getString(record, 'subscriptionNumber'),
    status: getString(record, 'status'),
  };
}

function normalizeReworkStatus(value: string): KolamComplaintReworkStatus {
  if (
    value === 'in_progress' ||
    value === 'completed' ||
    value === 'failed'
  ) {
    return value;
  }
  return 'pending';
}

function normalizeReworkTrackingList(
  value: unknown,
): KolamComplaintReworkTracking[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item, index) => {
    const record = asRecord(item);
    const customerAcceptedRaw = record.customerAccepted;
    const customerAccepted =
      customerAcceptedRaw === true
        ? true
        : customerAcceptedRaw === false
          ? false
          : null;
    return {
      id:
        getString(record, '_id') ||
        getString(record, 'id') ||
        `rework-${index}`,
      reworkNumber: getNumber(record, 'reworkNumber') ?? index + 1,
      status: normalizeReworkStatus(getString(record, 'status')),
      assignedToLabel: normalizePerson(record.assignedTo).name || '',
      startedAt: getString(record, 'startedAt') || undefined,
      completedAt: getString(record, 'completedAt') || undefined,
      note: getString(record, 'note'),
      resultNote: getString(record, 'resultNote'),
      photos: normalizePhotos(record.photos),
      customerAccepted,
      customerAcceptedAt:
        getString(record, 'customerAcceptedAt') || undefined,
      customerNote: getString(record, 'customerNote'),
    };
  });
}

function normalizeCurrentReworkIndex(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  }
  return null;
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

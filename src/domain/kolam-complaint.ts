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

export interface KolamComplaint {
  id: string;
  ticketCode: string;
  saleId: string | null;
  invoiceCode: string;
  customerName: string;
  isCustomProject: boolean;
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
    return 'Belum ada keputusan';
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
  const root = unwrapData(payload);
  const rootRecord = asRecord(root);
  const list: unknown[] = Array.isArray(root)
    ? root
    : Array.isArray(rootRecord.data)
      ? rootRecord.data
      : Array.isArray(rootRecord.items)
        ? rootRecord.items
        : [];

  const pagination = asRecord(rootRecord.pagination);
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
} {
  if (!value) {
    return { id: null, invoiceCode: '—', customerName: '—', isCustomProject: false };
  }
  if (typeof value === 'string') {
    return {
      id: value,
      invoiceCode: '—',
      customerName: '—',
      isCustomProject: false,
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

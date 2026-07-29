export type KolamPOStatus =
  | 'draft'
  | 'sent'
  | 'delivery'
  | 'received'
  | 'on_check'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export type KolamPOPaymentStatus = 'unpaid' | 'partial_paid' | 'paid';
export type KolamPORefundStatus = 'none' | 'pending' | 'refunded';
export type KolamPOPaymentType = 'cash' | 'tempo' | 'cicilan';
export type KolamPOTempoMode = 'net_days' | 'specific_date';
export type KolamPODiscountType = 'percent' | 'amount';

export interface KolamPODiscount {
  type: KolamPODiscountType;
  value: number;
}

export interface KolamPOScheduleRow {
  installmentNumber: number;
  percentage: number | null;
  amount: number;
  dueDate: string;
  notes: string;
}

export interface KolamPODownPaymentConfig {
  enabled: boolean;
  inputType: 'percent' | 'amount';
  value: number;
  amount: number;
  dueDate: string;
  paidAt: string;
  paidByName: string;
  paymentProof: string;
}

export interface KolamPOPaymentConfig {
  type: KolamPOPaymentType;
  tempoMode: KolamPOTempoMode | '';
  netDays: number | null;
  specificDate: string;
  installmentCount: number | null;
  schedule: KolamPOScheduleRow[];
  downPayment: KolamPODownPaymentConfig | null;
}

export interface KolamPurchaseOrderItemUnit {
  id: string;
  name: string;
  initial: string;
}

export interface KolamPurchaseOrderItemVariant {
  id: string;
  tier1Value: string;
  tier2Value: string;
  sku: string;
}

export type KolamPurchaseOrderItemType = 'product' | 'species' | 'packing';

export interface KolamPurchaseOrderItem {
  id: string;
  itemType: KolamPurchaseOrderItemType;
  refId: string;
  title: string;
  sku: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  receivedQuantity: number | null;
  variant: KolamPurchaseOrderItemVariant | null;
  unit: KolamPurchaseOrderItemUnit | null;
  lineTotal: number;
}

export interface KolamPurchaseOrderHistory {
  id: string;
  status: KolamPOStatus | string;
  note: string;
  changedByName: string;
  changedAt: string;
}

export interface KolamPurchaseOrderVendorRef {
  id: string;
  name: string;
}

export interface KolamPurchaseOrderWalletRef {
  id: string;
  name: string;
  type: string;
}

export interface KolamPurchaseOrderPayableRef {
  id: string;
  code: string;
  status: string;
}

export type KolamPOFakturPajakStatus =
  | 'none'
  | 'draft'
  | 'issued'
  | 'cancelled';

export interface KolamPOFakturPajak {
  serialNumber: string;
  status: KolamPOFakturPajakStatus | string;
  vendorNpwp: string;
  vendorName: string;
  notes: string;
  issuedAt: string;
}

export interface KolamPurchaseOrder {
  id: string;
  poCode: string;
  vendor: KolamPurchaseOrderVendorRef | null;
  items: KolamPurchaseOrderItem[];
  total: number;
  finalTotal: number;
  status: KolamPOStatus | string;
  histories: KolamPurchaseOrderHistory[];
  notes: string;
  shippingCost: number;
  discount: KolamPODiscount | null;
  wallet: KolamPurchaseOrderWalletRef | null;
  createdByName: string;

  paymentStatus: KolamPOPaymentStatus | string;
  actualTotal: number;
  paymentAmount: number;
  paymentStatusManualOverride: boolean;
  paidAt: string;
  paidByName: string;
  paymentProof: string;
  paymentProofUploadedAt: string;
  paymentTerms: { startEvent: string; termDays: number } | null;
  paymentDueAt: string;
  payable: KolamPurchaseOrderPayableRef | null;
  paymentConfig: KolamPOPaymentConfig | null;

  refundStatus: KolamPORefundStatus | string;
  refundAmount: number;
  refundProof: string;
  refundProofUploadedAt: string;
  refundConfirmedByName: string;
  refundConfirmedAt: string;

  receivedByName: string;
  receiveProof: string;
  receiveProofs: string[];
  receiveProofUploadedAt: string;

  checkedByName: string;
  checkProof: string;
  checkProofs: string[];
  checkProofUploadedAt: string;

  isPartial: boolean;
  partialNote: string;
  partialProofs: string[];
  partialProofUploadedAt: string;

  vendorInvoice: string;
  vendorInvoiceUploadedAt: string;
  vendorInvoiceUploadedByName: string;

  /** Internal DJP note snapshot (not Coretax e-Faktur). */
  taxFaktur: KolamPOFakturPajak | null;

  orderedAt: string;
  deliveryAt: string;
  receivedAt: string;
  onCheckAt: string;
  completedAt: string;
  cancelledAt: string;

  createdAt: string;
  updatedAt: string;
}

export interface KolamPurchaseOrderListFilters {
  search: string;
  searchByItem: string;
  status: KolamPOStatus | '';
  paymentStatus: KolamPOPaymentStatus | '';
  startDate: string;
  endDate: string;
  page: number;
  limit: number;
}

export interface KolamPurchaseOrderPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface KolamPurchaseOrderListResult {
  data: KolamPurchaseOrder[];
  pagination: KolamPurchaseOrderPagination;
}

export function createInitialKolamPurchaseOrderListFilters(
  route: string,
): KolamPurchaseOrderListFilters {
  const query = parsePORouteQuery(route);
  return {
    search: query.search ?? '',
    searchByItem: query.searchByItem ?? '',
    status: isKolamPOStatus(query.status) ? query.status : '',
    paymentStatus: isKolamPOPaymentStatus(query.paymentStatus)
      ? query.paymentStatus
      : '',
    startDate: query.startDate ?? '',
    endDate: query.endDate ?? '',
    page: Math.max(1, Number(query.page || '1') || 1),
    limit: 10,
  };
}

/* ──────────────────────────────────────────
   Routes
   ──────────────────────────────────────────*/

export const KOLAM_PURCHASE_ORDER_ROOT = '/purchase-order';

export function isKolamPurchaseOrderRoute(route: string) {
  const path = normalizePORoutePath(route);
  return (
    path === KOLAM_PURCHASE_ORDER_ROOT ||
    path.startsWith(`${KOLAM_PURCHASE_ORDER_ROOT}/`)
  );
}

export function isKolamPurchaseOrderListRoute(route: string) {
  return normalizePORoutePath(route) === KOLAM_PURCHASE_ORDER_ROOT;
}

export function isKolamPurchaseOrderCreateRoute(route: string) {
  return normalizePORoutePath(route) === `${KOLAM_PURCHASE_ORDER_ROOT}/create`;
}

export function isKolamPurchaseOrderDetailRoute(route: string) {
  return Boolean(getKolamPurchaseOrderRouteId(route));
}

export function isKolamPurchaseOrderEditRoute(route: string) {
  return Boolean(getKolamPurchaseOrderEditRouteId(route));
}

export function getKolamPurchaseOrderRouteId(route: string) {
  const path = normalizePORoutePath(route);
  if (
    path === KOLAM_PURCHASE_ORDER_ROOT ||
    path.endsWith('/create') ||
    path.endsWith('/edit')
  ) {
    return null;
  }
  const match = /^\/purchase-order\/([^/]+)$/.exec(path);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function getKolamPurchaseOrderEditRouteId(route: string) {
  const path = normalizePORoutePath(route);
  const match = /^\/purchase-order\/([^/]+)\/edit$/.exec(path);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function getKolamPurchaseOrderBreadcrumbPath(
  mode: 'list' | 'detail' | 'edit' | 'new',
  po?: Pick<KolamPurchaseOrder, 'id' | 'poCode'> | null,
) {
  if (mode === 'new') {
    return `${KOLAM_PURCHASE_ORDER_ROOT}/create`;
  }
  if ((mode === 'detail' || mode === 'edit') && po?.id) {
    return mode === 'edit'
      ? `${KOLAM_PURCHASE_ORDER_ROOT}/${po.id}/edit`
      : `${KOLAM_PURCHASE_ORDER_ROOT}/${po.id}`;
  }
  return KOLAM_PURCHASE_ORDER_ROOT;
}

/* ──────────────────────────────────────────
   Labels
   ──────────────────────────────────────────*/

export const KOLAM_PO_STATUS_LABELS: Record<KolamPOStatus, string> = {
  draft: 'Draf',
  sent: 'Dikirim',
  delivery: 'Pengiriman',
  received: 'Diterima',
  on_check: 'Pemeriksaan',
  completed: 'Selesai',
  rejected: 'Ditolak',
  cancelled: 'Dibatalkan',
};

export function getKolamPOStatusLabel(status?: string) {
  if (isKolamPOStatus(status)) {
    return KOLAM_PO_STATUS_LABELS[status];
  }
  return status?.trim() || '—';
}

export const KOLAM_PO_PAYMENT_STATUS_LABELS: Record<
  KolamPOPaymentStatus,
  string
> = {
  unpaid: 'Belum dibayar',
  partial_paid: 'Dibayar sebagian',
  paid: 'Lunas',
};

export function getKolamPOPaymentStatusLabel(status?: string) {
  if (isKolamPOPaymentStatus(status)) {
    return KOLAM_PO_PAYMENT_STATUS_LABELS[status];
  }
  return status?.trim() || '—';
}

export const KOLAM_PO_REFUND_STATUS_LABELS: Record<
  KolamPORefundStatus,
  string
> = {
  none: '-',
  pending: 'Menunggu refund',
  refunded: 'Direfund',
};

export function getKolamPORefundStatusLabel(status?: string) {
  const normalized = status?.trim().toLowerCase();
  if (
    normalized === 'none' ||
    normalized === 'pending' ||
    normalized === 'refunded'
  ) {
    return KOLAM_PO_REFUND_STATUS_LABELS[normalized];
  }
  return status?.trim() || '—';
}

/* ──────────────────────────────────────────
   Status transitions — mirror BE
   `da-inventory-backend/controllers/purchase-order/po.controllers.js`
   `updateStatusPO`. `completed` and `rejected` are terminal there.
   ──────────────────────────────────────────*/

const KOLAM_PO_ALLOWED_NEXT_STATUSES: Record<KolamPOStatus, KolamPOStatus[]> =
  {
    draft: ['sent', 'cancelled'],
    sent: ['delivery', 'cancelled'],
    delivery: ['received'],
    received: ['on_check'],
    on_check: ['completed', 'rejected'],
    completed: [],
    rejected: [],
    cancelled: ['draft'],
  };

export function getAllowedNextPOStatuses(
  current: KolamPOStatus | string,
): KolamPOStatus[] {
  if (!isKolamPOStatus(current)) {
    return [];
  }
  return [...KOLAM_PO_ALLOWED_NEXT_STATUSES[current]];
}

/* ──────────────────────────────────────────
   Stage permission helpers — mirror FE
   `da-inventory-frontend/src/lib/permissions/po-stage.ts`
   ──────────────────────────────────────────*/

export type KolamPurchaseOrderPermissionAction =
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'receive'
  | 'check'
  | 'complete_stock'
  | 'update_status';

export type KolamPurchaseOrderPermissionEntry = {
  resource?: string;
  actions?: string[];
};

export type KolamPoWorkflowStage =
  | 'receive'
  | 'check'
  | 'complete_stock'
  | 'general';

/** Mirror FE `hasPermission("purchase-order", action)` + super-admin wildcard. */
export function hasKolamPurchaseOrderPermission(
  permissions: KolamPurchaseOrderPermissionEntry[] | null | undefined,
  action: KolamPurchaseOrderPermissionAction,
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

  // Sesi tanpa payload permission (legacy): biarkan UI status-gated; BE tetap enforce.
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
      (resource === 'purchase-order' || resource === '*') &&
      (actions.includes(wanted) || actions.includes('*'))
    );
  });
}

/** Legacy `update_status` grants all PO workflow stages. */
export function hasKolamPoStagePermission(
  permissions: KolamPurchaseOrderPermissionEntry[] | null | undefined,
  stage: KolamPoWorkflowStage,
  roleKey?: string | null,
): boolean {
  if (hasKolamPurchaseOrderPermission(permissions, 'update_status', roleKey)) {
    return true;
  }
  if (stage === 'general') {
    return false;
  }
  return hasKolamPurchaseOrderPermission(permissions, stage, roleKey);
}

export function canApprovePartialPoComplete(
  permissions: KolamPurchaseOrderPermissionEntry[] | null | undefined,
  roleKey?: string | null,
): boolean {
  return hasKolamPurchaseOrderPermission(permissions, 'update_status', roleKey);
}

export function filterPoStatusOptions(
  currentStatus: string,
  allowedNext: readonly string[],
  permissions: KolamPurchaseOrderPermissionEntry[] | null | undefined,
  roleKey?: string | null,
  opts?: { isPartial?: boolean },
): string[] {
  return allowedNext.filter(next => {
    if (next === 'received') {
      return hasKolamPoStagePermission(permissions, 'receive', roleKey);
    }
    if (next === 'on_check') {
      return hasKolamPoStagePermission(permissions, 'check', roleKey);
    }
    if (next === 'completed') {
      if (opts?.isPartial && !canApprovePartialPoComplete(permissions, roleKey)) {
        return false;
      }
      return hasKolamPoStagePermission(permissions, 'complete_stock', roleKey);
    }
    if (next === 'rejected') {
      return hasKolamPoStagePermission(permissions, 'check', roleKey);
    }
    return hasKolamPoStagePermission(permissions, 'general', roleKey);
  });
}

/* ──────────────────────────────────────────
   Item display helper
   ──────────────────────────────────────────*/

export function getKolamPOItemDisplayTitle(
  item: Pick<KolamPurchaseOrderItem, 'title' | 'variant'>,
) {
  const title = item.title || 'Item';
  if (!item.variant) {
    return title;
  }
  const variantLabel =
    [item.variant.tier1Value, item.variant.tier2Value]
      .map(part => part?.trim())
      .filter(Boolean)
      .join(' / ') ||
    item.variant.sku ||
    'Varian';
  return `${title} - ${variantLabel}`;
}

/* ──────────────────────────────────────────
   Status update / check-items request bodies
   ──────────────────────────────────────────*/

export interface KolamPOCheckItemInput {
  product?: string;
  species?: string;
  variant?: string;
  actualReceived: number;
}

export type KolamUpdatePOStatusBody =
  | { status: 'received'; receivedBy?: string; receiveProofs?: string[] }
  | {
      status: 'on_check';
      items: KolamPOCheckItemInput[];
      checkedBy?: string;
      checkProofs?: string[];
      partialNote?: string;
      partialProofs?: string[];
    }
  | { status: 'sent'; vendorInvoice?: string }
  | { status: Exclude<KolamPOStatus, 'received' | 'on_check' | 'sent'> };

export interface KolamEditPOCheckItemsBody {
  items: KolamPOCheckItemInput[];
  editReason: string;
  partialNote?: string;
  partialProofs?: string[];
}

/* ──────────────────────────────────────────
   Normalize
   ──────────────────────────────────────────*/

export function normalizeKolamPurchaseOrder(payload: unknown): KolamPurchaseOrder {
  const root = asRecord(payload);
  const record = Object.keys(asRecord(root.data)).length
    ? asRecord(root.data)
    : root;

  const vendor = normalizePORef(record.vendor, 'name');
  const wallet = normalizeWalletRef(record.wallet);
  const payable = normalizePayableRef(record.payable);
  const discount = normalizePODiscount(record.discount);
  const paymentConfig = normalizePOPaymentConfig(record.paymentConfig);
  const paymentTermsRecord = asRecord(record.paymentTerms);

  return {
    id: getString(record, '_id') || getString(record, 'id'),
    poCode: getString(record, 'poCode'),
    vendor,
    items: normalizePOItems(record.items),
    total: getNumber(record, 'total') ?? 0,
    finalTotal: getNumber(record, 'finalTotal') ?? 0,
    status: normalizePOStatus(getString(record, 'status')),
    histories: normalizePOHistories(record.poHistories),
    notes: getString(record, 'notes'),
    shippingCost: getNumber(record, 'shippingCost') ?? 0,
    discount,
    wallet,
    createdByName: resolvePOPersonName(record.createdBy),

    paymentStatus: normalizePOPaymentStatus(getString(record, 'paymentStatus')),
    actualTotal: getNumber(record, 'actualTotal') ?? 0,
    paymentAmount: getNumber(record, 'paymentAmount') ?? 0,
    paymentStatusManualOverride: getBoolean(record, 'paymentStatusManualOverride'),
    paidAt: getString(record, 'paidAt'),
    paidByName: resolvePOPersonName(record.paidBy),
    paymentProof: getString(record, 'paymentProof'),
    paymentProofUploadedAt: getString(record, 'paymentProofUploadedAt'),
    paymentTerms: Object.keys(paymentTermsRecord).length
      ? {
          startEvent: getString(paymentTermsRecord, 'startEvent') || 'completed',
          termDays: getNumber(paymentTermsRecord, 'termDays') ?? 30,
        }
      : null,
    paymentDueAt: getString(record, 'paymentDueAt'),
    payable,
    paymentConfig,

    refundStatus: normalizePORefundStatus(getString(record, 'refundStatus')),
    refundAmount: getNumber(record, 'refundAmount') ?? 0,
    refundProof: getString(record, 'refundProof'),
    refundProofUploadedAt: getString(record, 'refundProofUploadedAt'),
    refundConfirmedByName: resolvePOPersonName(record.refundConfirmedBy),
    refundConfirmedAt: getString(record, 'refundConfirmedAt'),

    receivedByName: resolvePOPersonName(record.receivedBy),
    receiveProof: getString(record, 'receiveProof'),
    receiveProofs: normalizeStringList(record.receiveProofs),
    receiveProofUploadedAt: getString(record, 'receiveProofUploadedAt'),

    checkedByName: resolvePOPersonName(record.checkedBy),
    checkProof: getString(record, 'checkProof'),
    checkProofs: normalizeStringList(record.checkProofs),
    checkProofUploadedAt: getString(record, 'checkProofUploadedAt'),

    isPartial: getBoolean(record, 'isPartial'),
    partialNote: getString(record, 'partialNote'),
    partialProofs: normalizeStringList(record.partialProofs),
    partialProofUploadedAt: getString(record, 'partialProofUploadedAt'),

    vendorInvoice: getString(record, 'vendorInvoice'),
    vendorInvoiceUploadedAt: getString(record, 'vendorInvoiceUploadedAt'),
    vendorInvoiceUploadedByName: resolvePOPersonName(record.vendorInvoiceUploadedBy),

    taxFaktur: normalizePOFakturPajak(record.tax),

    orderedAt: getString(record, 'orderedAt'),
    deliveryAt: getString(record, 'deliveryAt'),
    receivedAt: getString(record, 'receivedAt'),
    onCheckAt: getString(record, 'onCheckAt'),
    completedAt: getString(record, 'completedAt'),
    cancelledAt: getString(record, 'cancelledAt'),

    createdAt: getString(record, 'createdAt'),
    updatedAt: getString(record, 'updatedAt'),
  };
}

export function normalizeKolamPurchaseOrderList(
  payload: unknown,
): KolamPurchaseOrderListResult {
  const root = asRecord(payload);
  const list: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray(root.data)
    ? root.data
    : [];

  const data = list.map(normalizeKolamPurchaseOrder);

  return {
    data,
    pagination: normalizePOPagination(root.pagination, data.length),
  };
}

function normalizePOItems(value: unknown): KolamPurchaseOrderItem[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(normalizePOItem)
    .filter((item): item is KolamPurchaseOrderItem => Boolean(item));
}

function normalizePOItem(value: unknown): KolamPurchaseOrderItem | null {
  const record = asRecord(value);

  let itemType: KolamPurchaseOrderItemType | null = null;
  let refValue: unknown = null;
  if (record.product != null && record.product !== '') {
    itemType = 'product';
    refValue = record.product;
  } else if (record.species != null && record.species !== '') {
    itemType = 'species';
    refValue = record.species;
  } else if (record.packing != null && record.packing !== '') {
    itemType = 'packing';
    refValue = record.packing;
  }
  if (!itemType) {
    return null;
  }

  const refRecord = asRecord(refValue);
  const refId =
    typeof refValue === 'string'
      ? refValue
      : getString(refRecord, '_id') || getString(refRecord, 'id');

  const title =
    itemType === 'species'
      ? getString(refRecord, 'scientificName')
      : getString(refRecord, 'name');

  const unitSnapshot = asRecord(record.unit);
  const populatedUnit = asRecord(refRecord.units);
  const unit: KolamPurchaseOrderItemUnit | null =
    getString(unitSnapshot, 'name') || getString(unitSnapshot, 'initial')
      ? {
          id: '',
          name: getString(unitSnapshot, 'name'),
          initial: getString(unitSnapshot, 'initial'),
        }
      : getString(populatedUnit, 'name') || getString(populatedUnit, 'initial')
      ? {
          id: getString(populatedUnit, '_id') || getString(populatedUnit, 'id'),
          name: getString(populatedUnit, 'name'),
          initial: getString(populatedUnit, 'initial'),
        }
      : null;

  const quantity = getNumber(record, 'quantity') ?? 0;
  const unitPrice = getNumber(record, 'unitPrice') ?? 0;
  const receivedQuantity =
    record.receivedQuantity == null
      ? null
      : getNumber(record, 'receivedQuantity') ?? 0;

  return {
    id: getString(record, '_id') || getString(record, 'id'),
    itemType,
    refId,
    title: title || 'Item',
    sku: getString(refRecord, 'sku'),
    productCode: getString(refRecord, 'productCode'),
    quantity,
    unitPrice,
    receivedQuantity,
    variant: normalizePOItemVariant(record.variant),
    unit,
    lineTotal: quantity * unitPrice,
  };
}

function normalizePOItemVariant(
  value: unknown,
): KolamPurchaseOrderItemVariant | null {
  if (value == null || value === '') {
    return null;
  }
  if (typeof value === 'string') {
    return { id: value, tier1Value: '', tier2Value: '', sku: '' };
  }
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  if (!id) {
    return null;
  }
  return {
    id,
    tier1Value: getString(record, 'tier1Value'),
    tier2Value: getString(record, 'tier2Value'),
    sku: getString(record, 'sku'),
  };
}

function normalizePOHistories(value: unknown): KolamPurchaseOrderHistory[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(item => {
    const record = asRecord(item);
    return {
      id: getString(record, '_id') || getString(record, 'id'),
      status: normalizePOStatus(getString(record, 'status')),
      note: getString(record, 'note'),
      changedByName: resolvePOPersonName(record.changedBy),
      changedAt: getString(record, 'changedAt'),
    };
  });
}

function normalizePORef(
  value: unknown,
  nameField: string,
): KolamPurchaseOrderVendorRef | null {
  if (value == null || value === '') {
    return null;
  }
  if (typeof value === 'string') {
    return { id: value, name: '' };
  }
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  if (!id) {
    return null;
  }
  return { id, name: getString(record, nameField) };
}

function normalizeWalletRef(value: unknown): KolamPurchaseOrderWalletRef | null {
  if (value == null || value === '') {
    return null;
  }
  if (typeof value === 'string') {
    return { id: value, name: '', type: '' };
  }
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  if (!id) {
    return null;
  }
  return { id, name: getString(record, 'name'), type: getString(record, 'type') };
}

function normalizePayableRef(value: unknown): KolamPurchaseOrderPayableRef | null {
  if (value == null || value === '') {
    return null;
  }
  if (typeof value === 'string') {
    return { id: value, code: '', status: '' };
  }
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  if (!id) {
    return null;
  }
  return { id, code: getString(record, 'code'), status: getString(record, 'status') };
}

function normalizePOFakturPajak(taxValue: unknown): KolamPOFakturPajak | null {
  const tax = asRecord(taxValue);
  const faktur = asRecord(tax.fakturPajak);
  if (!Object.keys(faktur).length) {
    return null;
  }
  return {
    serialNumber: getString(faktur, 'serialNumber'),
    status: getString(faktur, 'status') || 'none',
    vendorNpwp: getString(faktur, 'vendorNpwp'),
    vendorName: getString(faktur, 'vendorName'),
    notes: getString(faktur, 'notes'),
    issuedAt: getString(faktur, 'issuedAt'),
  };
}

function normalizePODiscount(value: unknown): KolamPODiscount | null {
  const record = asRecord(value);
  if (!Object.keys(record).length) {
    return null;
  }
  return {
    type: getString(record, 'type') === 'amount' ? 'amount' : 'percent',
    value: getNumber(record, 'value') ?? 0,
  };
}

function normalizePOPaymentConfig(value: unknown): KolamPOPaymentConfig | null {
  const record = asRecord(value);
  if (!Object.keys(record).length) {
    return null;
  }
  const downPaymentRecord = asRecord(record.downPayment);
  const tempoMode = getString(record, 'tempoMode');

  return {
    type: normalizePOPaymentType(getString(record, 'type')),
    tempoMode:
      tempoMode === 'specific_date' || tempoMode === 'net_days' ? tempoMode : '',
    netDays: getNumber(record, 'netDays'),
    specificDate: getString(record, 'specificDate'),
    installmentCount: getNumber(record, 'installmentCount'),
    schedule: normalizePOSchedule(record.schedule),
    downPayment: Object.keys(downPaymentRecord).length
      ? {
          enabled: getBoolean(downPaymentRecord, 'enabled'),
          inputType:
            getString(downPaymentRecord, 'inputType') === 'amount'
              ? 'amount'
              : 'percent',
          value: getNumber(downPaymentRecord, 'value') ?? 0,
          amount: getNumber(downPaymentRecord, 'amount') ?? 0,
          dueDate: getString(downPaymentRecord, 'dueDate'),
          paidAt: getString(downPaymentRecord, 'paidAt'),
          paidByName: resolvePOPersonName(downPaymentRecord.paidBy),
          paymentProof: getString(downPaymentRecord, 'paymentProof'),
        }
      : null,
  };
}

function normalizePOSchedule(value: unknown): KolamPOScheduleRow[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(item => {
    const record = asRecord(item);
    return {
      installmentNumber: getNumber(record, 'installmentNumber') ?? 0,
      percentage: getNumber(record, 'percentage'),
      amount: getNumber(record, 'amount') ?? 0,
      dueDate: getString(record, 'dueDate'),
      notes: getString(record, 'notes'),
    };
  });
}

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
}

function resolvePOPersonName(value: unknown): string {
  if (value == null || value === '' || typeof value === 'string') {
    return '';
  }
  const record = asRecord(value);
  const fullName = [getString(record, 'first_name'), getString(record, 'last_name')]
    .filter(Boolean)
    .join(' ')
    .trim();
  return (
    fullName ||
    getString(record, 'name') ||
    getString(record, 'displayName') ||
    getString(record, 'username') ||
    getString(record, 'email')
  );
}

function normalizePOPagination(
  value: unknown,
  fallbackTotal: number,
): KolamPurchaseOrderPagination {
  const record = asRecord(value);
  const page = getNumber(record, 'page') ?? 1;
  const limit = getNumber(record, 'limit') ?? (fallbackTotal || 10);
  const total = getNumber(record, 'total') ?? fallbackTotal;
  const totalPages =
    getNumber(record, 'totalPages') ??
    (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1);
  return { page, limit, total, totalPages };
}

const KOLAM_PO_STATUS_SET = new Set<KolamPOStatus>([
  'draft',
  'sent',
  'delivery',
  'received',
  'on_check',
  'completed',
  'rejected',
  'cancelled',
]);

export function isKolamPOStatus(value?: string | null): value is KolamPOStatus {
  return Boolean(value) && KOLAM_PO_STATUS_SET.has(value as KolamPOStatus);
}

export function isKolamPOPaymentStatus(
  value?: string | null,
): value is KolamPOPaymentStatus {
  return value === 'unpaid' || value === 'partial_paid' || value === 'paid';
}

function normalizePOStatus(value: string): KolamPOStatus | string {
  const normalized = value.trim().toLowerCase();
  return isKolamPOStatus(normalized) ? normalized : value.trim() || 'draft';
}

function normalizePOPaymentStatus(value: string): KolamPOPaymentStatus | string {
  const normalized = value.trim().toLowerCase();
  return isKolamPOPaymentStatus(normalized) ? normalized : value.trim() || 'unpaid';
}

function normalizePORefundStatus(value: string): KolamPORefundStatus | string {
  const normalized = value.trim().toLowerCase();
  return normalized === 'none' || normalized === 'pending' || normalized === 'refunded'
    ? normalized
    : value.trim() || 'none';
}

function normalizePOPaymentType(value: string): KolamPOPaymentType {
  const normalized = value.trim().toLowerCase();
  return normalized === 'tempo' || normalized === 'cicilan' ? normalized : 'cash';
}

/* ──────────────────────────────────────────
   Allocation — port of FE
   `da-inventory-frontend/src/lib/po-allocation.ts`
   ──────────────────────────────────────────*/

export type KolamPOAllocationDiscountType = 'percent' | 'amount';

export interface KolamPOAllocationDiscount {
  type: KolamPOAllocationDiscountType;
  value: number;
}

export interface KolamPOAllocationItem {
  unitPrice: number;
  quantity: number;
}

export interface KolamPOAllocationInput {
  items: readonly KolamPOAllocationItem[];
  shippingCost: number;
  discount?: KolamPOAllocationDiscount | number;
}

export type KolamPOAllocationMode = 'flat' | 'proportional';

export interface KolamPOAllocationLine {
  index: number;
  unitPrice: number;
  quantity: number;
  effectivePrice: number;
  effectiveShipping: number;
  effectiveTotalCost: number;
}

export interface KolamPOAllocationResult {
  subtotal: number;
  totalQty: number;
  discountAmount: number;
  shippingPerUnit: number;
  discountPerUnit: number;
  allocationMode: KolamPOAllocationMode;
  finalTotal: number;
  lines: KolamPOAllocationLine[];
}

export function calculateKolamPOBreakdown(
  input: KolamPOAllocationInput,
): KolamPOAllocationResult {
  const items = input.items ?? [];
  const shippingCost = Math.max(0, poSafeNum(input.shippingCost));
  const discount = normalizePOAllocationDiscount(input.discount);

  const subtotal = items.reduce(
    (sum, item) =>
      sum + Math.max(0, poSafeNum(item.unitPrice)) * Math.max(0, poSafeNum(item.quantity)),
    0,
  );

  const totalQty = items.reduce(
    (sum, item) => sum + Math.max(0, poSafeNum(item.quantity)),
    0,
  );

  const rawDiscountAmount =
    discount.type === 'percent'
      ? Math.round(subtotal * (discount.value / 100))
      : Math.round(discount.value);
  const discountAmount = Math.min(subtotal, rawDiscountAmount);

  const shippingPerUnit = totalQty > 0 ? Math.round(shippingCost / totalQty) : 0;
  const discountPerUnit = totalQty > 0 ? Math.round(discountAmount / totalQty) : 0;

  const effectiveDiscountRatio = subtotal > 0 ? discountAmount / subtotal : 0;

  const positiveItems = items.filter(item => poSafeNum(item.quantity) > 0);
  const minUnitPrice =
    positiveItems.length > 0
      ? Math.min(...positiveItems.map(item => Math.max(0, poSafeNum(item.unitPrice))))
      : 0;

  const allocationMode: KolamPOAllocationMode =
    discountAmount > 0 && discountPerUnit > minUnitPrice ? 'proportional' : 'flat';

  const lines: KolamPOAllocationLine[] = items.map((item, index) => {
    const raw = Math.max(0, poSafeNum(item.unitPrice));
    const quantity = Math.max(0, poSafeNum(item.quantity));
    const effectivePrice =
      allocationMode === 'proportional'
        ? Math.round(raw * (1 - effectiveDiscountRatio))
        : Math.max(0, raw - discountPerUnit);
    return {
      index,
      unitPrice: raw,
      quantity,
      effectivePrice,
      effectiveShipping: shippingPerUnit,
      effectiveTotalCost: effectivePrice + shippingPerUnit,
    };
  });

  const finalTotal = subtotal - discountAmount + shippingCost;

  return {
    subtotal,
    totalQty,
    discountAmount,
    shippingPerUnit,
    discountPerUnit,
    allocationMode,
    finalTotal,
    lines,
  };
}

function poSafeNum(value: unknown): number {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : 0;
}

function poClampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function normalizePOAllocationDiscount(
  discount: KolamPOAllocationDiscount | number | undefined,
): KolamPOAllocationDiscount {
  if (typeof discount === 'number') {
    return { type: 'percent', value: poClampPercent(poSafeNum(discount)) };
  }
  if (!discount) {
    return { type: 'percent', value: 0 };
  }
  const type: KolamPOAllocationDiscountType =
    discount.type === 'amount' ? 'amount' : 'percent';
  const raw = Math.max(0, poSafeNum(discount.value));
  const value = type === 'percent' ? poClampPercent(raw) : raw;
  return { type, value };
}

/* ──────────────────────────────────────────
   Form state — create/edit
   ──────────────────────────────────────────*/

export interface KolamPOFormLineItem {
  key: string;
  itemType: KolamPurchaseOrderItemType;
  refId: string;
  variantId: string;
  title: string;
  sku: string;
  unitLabel: string;
  quantity: string;
  unitPrice: number;
}

export interface KolamPOFormState {
  id?: string;
  vendorId: string;
  vendorName: string;
  walletId: string;
  notes: string;
  shippingCost: string;
  discountType: KolamPODiscountType;
  discountValue: string;
  sendImmediately: boolean;
  items: KolamPOFormLineItem[];
  paymentType: KolamPOPaymentType;
  tempoMode: KolamPOTempoMode;
  netDays: string;
  specificDate: string;
  installmentCount: string;
  downPaymentEnabled: boolean;
  downPaymentInputType: 'percent' | 'amount';
  downPaymentValue: string;
  downPaymentDueDate: string;
}

export function createEmptyKolamPOFormState(): KolamPOFormState {
  return {
    vendorId: '',
    vendorName: '',
    walletId: '',
    notes: '',
    shippingCost: '0',
    discountType: 'percent',
    discountValue: '0',
    sendImmediately: false,
    items: [],
    paymentType: 'cash',
    tempoMode: 'net_days',
    netDays: '30',
    specificDate: '',
    installmentCount: '1',
    downPaymentEnabled: false,
    downPaymentInputType: 'percent',
    downPaymentValue: '0',
    downPaymentDueDate: '',
  };
}

export function createKolamPOFormStateFromPO(
  po: KolamPurchaseOrder,
): KolamPOFormState {
  const empty = createEmptyKolamPOFormState();
  return {
    ...empty,
    id: po.id,
    vendorId: po.vendor?.id ?? '',
    vendorName: po.vendor?.name ?? '',
    walletId: po.wallet?.id ?? '',
    notes: po.notes,
    shippingCost: String(po.shippingCost ?? 0),
    discountType: po.discount?.type ?? 'percent',
    discountValue: String(po.discount?.value ?? 0),
    items: po.items.map(item => ({
      key: item.id || `${item.itemType}-${item.refId}-${item.variant?.id ?? ''}`,
      itemType: item.itemType,
      refId: item.refId,
      variantId: item.variant?.id ?? '',
      title: getKolamPOItemDisplayTitle(item),
      sku: item.sku,
      unitLabel: item.unit?.initial || item.unit?.name || '',
      quantity: String(item.quantity),
      unitPrice: item.unitPrice,
    })),
    paymentType:
      (po.paymentConfig?.type as KolamPOPaymentType | undefined) ?? 'cash',
    tempoMode:
      (po.paymentConfig?.tempoMode as KolamPOTempoMode | undefined) || 'net_days',
    netDays: String(po.paymentConfig?.netDays ?? 30),
    specificDate: po.paymentConfig?.specificDate ?? '',
    installmentCount: String(po.paymentConfig?.installmentCount ?? 1),
    downPaymentEnabled: Boolean(po.paymentConfig?.downPayment?.enabled),
    downPaymentInputType: po.paymentConfig?.downPayment?.inputType ?? 'percent',
    downPaymentValue: String(po.paymentConfig?.downPayment?.value ?? 0),
    downPaymentDueDate: po.paymentConfig?.downPayment?.dueDate ?? '',
  };
}

export interface KolamPOItemBody {
  product?: string;
  species?: string;
  packing?: string;
  quantity: number;
  variant?: string;
  unitPrice?: number;
}

export interface KolamCreatePOBody {
  vendor: string;
  items: KolamPOItemBody[];
  notes?: string;
  shippingCost: number;
  discount?: KolamPODiscount;
  wallet?: string;
  status?: 'draft' | 'sent';
  paymentTerms?: { startEvent: string; termDays: number };
  paymentConfig?: KolamPOPaymentConfig;
}

export interface KolamUpdatePOContentBody {
  items?: KolamPOItemBody[];
  shippingCost?: number;
  discount?: KolamPODiscount;
  notes?: string;
  vendor?: string;
  paymentTerms?: { startEvent: string; termDays: number };
  paymentConfig?: KolamPOPaymentConfig;
}

export function buildCreatePOBody(form: KolamPOFormState): KolamCreatePOBody {
  return {
    vendor: form.vendorId,
    items: buildKolamPOItemBodies(form),
    notes: form.notes.trim() || undefined,
    shippingCost: Number(form.shippingCost) || 0,
    discount: {
      type: form.discountType,
      value: Number(form.discountValue) || 0,
    },
    wallet: form.walletId || undefined,
    status: form.sendImmediately ? 'sent' : undefined,
    paymentConfig: buildKolamPOPaymentConfig(form),
  };
}

export function buildUpdatePOContentBody(
  form: KolamPOFormState,
): KolamUpdatePOContentBody {
  return {
    vendor: form.vendorId || undefined,
    items: buildKolamPOItemBodies(form),
    shippingCost: Number(form.shippingCost) || 0,
    discount: {
      type: form.discountType,
      value: Number(form.discountValue) || 0,
    },
    notes: form.notes.trim() || undefined,
    paymentConfig: buildKolamPOPaymentConfig(form),
  };
}

function buildKolamPOItemBodies(form: KolamPOFormState): KolamPOItemBody[] {
  return form.items
    .filter(item => item.refId && Number(item.quantity) > 0)
    .map(item => ({
      ...(item.itemType === 'product' ? { product: item.refId } : {}),
      ...(item.itemType === 'species' ? { species: item.refId } : {}),
      ...(item.itemType === 'packing' ? { packing: item.refId } : {}),
      quantity: Number(item.quantity) || 0,
      ...(item.variantId ? { variant: item.variantId } : {}),
      ...(item.unitPrice > 0 ? { unitPrice: item.unitPrice } : {}),
    }));
}

function buildKolamPOPaymentConfig(
  form: KolamPOFormState,
): KolamPOPaymentConfig | undefined {
  if (form.paymentType === 'cash' && !form.downPaymentEnabled) {
    return undefined;
  }

  const config: KolamPOPaymentConfig = {
    type: form.paymentType,
    tempoMode: '',
    netDays: null,
    specificDate: '',
    installmentCount: null,
    schedule: [],
    downPayment: null,
  };

  if (form.paymentType === 'tempo') {
    config.tempoMode = form.tempoMode;
    if (form.tempoMode === 'net_days') {
      config.netDays = Number(form.netDays) || 0;
    } else {
      config.specificDate = form.specificDate;
    }
  }

  if (form.paymentType === 'cicilan') {
    const count = Math.max(2, Math.min(24, Number(form.installmentCount) || 2));
    config.installmentCount = count;
    const breakdown = calculateKolamPOBreakdown({
      items: form.items.map(item => ({
        unitPrice: item.unitPrice,
        quantity: Number(item.quantity) || 0,
      })),
      shippingCost: Number(form.shippingCost) || 0,
      discount: {
        type: form.discountType,
        value: Number(form.discountValue) || 0,
      },
    });
    let dpAmount = 0;
    if (form.downPaymentEnabled) {
      const raw = Number(form.downPaymentValue) || 0;
      dpAmount =
        form.downPaymentInputType === 'percent'
          ? (breakdown.finalTotal * Math.min(100, Math.max(0, raw))) / 100
          : Math.max(0, raw);
    }
    const principal = Math.max(0, breakdown.finalTotal - dpAmount);
    const base = Math.floor(principal / count);
    let remainder = principal - base * count;
    const start = new Date();
    config.schedule = Array.from({ length: count }, (_, index) => {
      const due = new Date(start);
      due.setMonth(due.getMonth() + index + 1);
      const amount = base + (remainder > 0 ? 1 : 0);
      if (remainder > 0) {
        remainder -= 1;
      }
      return {
        installmentNumber: index + 1,
        percentage: null,
        amount,
        dueDate: due.toISOString().slice(0, 10),
        notes: '',
      };
    });
  }

  if (form.downPaymentEnabled) {
    config.downPayment = {
      enabled: true,
      inputType: form.downPaymentInputType,
      value: Number(form.downPaymentValue) || 0,
      amount: 0,
      dueDate: form.downPaymentDueDate,
      paidAt: '',
      paidByName: '',
      paymentProof: '',
    };
  }

  return config;
}

/* ──────────────────────────────────────────
   Shared primitives
   ──────────────────────────────────────────*/

function normalizePORoutePath(route: string) {
  const path = route.trim().split('?')[0] || '';
  if (!path) {
    return '';
  }
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

function parsePORouteQuery(route: string) {
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
  return typeof value === 'string' ? value.trim() : '';
}

function getBoolean(record: Record<string, unknown>, key: string) {
  return record[key] === true;
}

function getNumber(record: Record<string, unknown>, key: string): number | null {
  return toPONumber(record[key]);
}

function toPONumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (value && typeof value === 'object' && '$numberDecimal' in (value as Record<string, unknown>)) {
    const parsed = Number((value as Record<string, unknown>).$numberDecimal);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

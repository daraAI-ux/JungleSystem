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

export type KolamLayananContractDurationUnit =
  | 'days'
  | 'weeks'
  | 'months'
  | 'years';

export const KOLAM_LAYANAN_ENCLOSURE_TYPE_OPTIONS = [
  'Terrarium',
  'Paludarium',
  'Aquarium',
  'Vivarium',
  'Cags',
] as const;

export const KOLAM_LAYANAN_TASK_TYPE_OPTIONS = [
  { id: 'dosing', label: 'Dosing' },
  { id: 'maintenance', label: 'Pemeliharaan' },
] as const;

export const KOLAM_LAYANAN_CONTRACT_DURATION_UNIT_OPTIONS: Array<{
  id: KolamLayananContractDurationUnit;
  label: string;
}> = [
  { id: 'days', label: 'Hari' },
  { id: 'weeks', label: 'Minggu' },
  { id: 'months', label: 'Bulan' },
  { id: 'years', label: 'Tahun' },
];

export interface KolamLayananServiceBrandRef {
  id: string;
  name: string;
}

export interface KolamLayananService {
  id: string;
  name: string;
  sku: string;
  description: string;
  packageCode: string;
  packageActive: boolean;
  brands: KolamLayananServiceBrandRef[];
  brandIds: string[];
  taskType: string | null;
  enclosureTaskTypeKeys: string[];
  enclosureTypes: string[];
  visitsPerMonth: number | null;
  requiresOnSiteVisit: boolean;
  includesDelivery: boolean;
  price: number | null;
  priceM3: number | null;
  priceKm: number | null;
  costM3: number | null;
  costKm: number | null;
  priceToSell: number | null;
  onlinePrice: number | null;
  sellable: boolean;
  commissionEnabled: boolean;
  commissionType: 'percentage' | 'fixed';
  commissionValue: number;
  memberPointsEnabled: boolean;
  memberPoints: number;
  contractDurationValue: number | null;
  contractDurationUnit: KolamLayananContractDurationUnit | null;
  productComponents: KolamLayananServiceProductComponent[];
  createdAt?: string;
  updatedAt?: string;
  raw: unknown;
}

/** Material line on service master (detail / BOM per kunjungan). */
export interface KolamLayananServiceProductComponent {
  key: string;
  productId: string;
  productName: string;
  productCode: string;
  inventoryKind: 'raw' | 'product';
  quantityPerExecution: number;
  unitLabel: string;
  stock: number | null;
  brandName: string;
  categoryName: string;
  typeLabel: string;
  price: number | null;
}

/** Result of POST /task-manager/spawn/service/:serviceId */
export interface KolamLayananServiceSpawnTaskResult {
  taskId: string;
  created: boolean;
}

export interface KolamLayananServiceFormState {
  id?: string;
  name: string;
  sku: string;
  description: string;
  brandIds: string[];
  sellable: boolean;
  enclosureTaskTypeKeys: string[];
  enclosureTypes: string[];
  taskType: string;
  visitsPerMonth: string;
  packageCode: string;
  packageActive: boolean;
  contractDurationValue: string;
  contractDurationUnit: KolamLayananContractDurationUnit;
  price: string;
  costM3: string;
  costKm: string;
  priceM3: string;
  priceKm: string;
  commissionEnabled: boolean;
  commissionType: 'percentage' | 'fixed';
  commissionValue: string;
  memberPointsEnabled: boolean;
  memberPoints: string;
}

export interface KolamLayananServiceSavePayload {
  name: string;
  sku: string;
  description: string;
  brand: string[];
  sellable: boolean;
  price: number;
  price_to_sell: number;
  cost_m3: number;
  cost_km: number;
  price_m3: number;
  price_km: number;
  minimum_price_to_sales: number;
  commissionEnabled: boolean;
  commissionType: 'percentage' | 'fixed';
  commissionValue: number;
  memberPoints: { enabled: boolean; points: number };
  enclosureTaskTypeKeys: string[];
  enclosureTypes: string[];
  taskType: string | null;
  visitsPerMonth?: number;
  packageCode?: string;
  packageActive: boolean;
  contractDurationValue?: number;
  contractDurationUnit?: KolamLayananContractDurationUnit;
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

export type KolamLayananSubscriptionStatus =
  | 'draft'
  | 'active'
  | 'suspended'
  | 'expired'
  | 'cancelled';

export type KolamLayananPendingStatus =
  | 'pending'
  | 'awaiting_staff_approval'
  | 'awaiting_client_approval'
  | 'schedule_approved'
  | 'initiated'
  | 'cancelled';

export type KolamLayananCapacityStatus = 'available' | 'limited' | 'full';

export interface KolamLayananOpsAlert {
  executionId: string | null;
  taskId: string | null;
  taskKind: 'dosing' | 'maintenance' | string;
  pendingServiceId: string | null;
  subscriptionId: string | null;
  visitTitle: string;
  packageTaskCode: string;
  scheduledTime: string | null;
  href: string | null;
}

export interface KolamLayananCapacitySlot {
  week: number;
  weekday: number;
  weekdayLabel: string;
  dates: string[];
  status: KolamLayananCapacityStatus;
  booked: number;
  capacity: number;
  remaining: number;
}

export interface KolamLayananOpsDashboard {
  generatedAt: string;
  timezone: string;
  activeSubscriptions: number;
  scheduledToday: number;
  fullSlots: number;
  hppThisMonth: number;
  capacityPeriodStart: string;
  capacityPeriodEnd: string;
  capacitySummary: {
    fullSlots: number;
    limitedSlots: number;
    totalSlots: number;
  };
  slots: KolamLayananCapacitySlot[];
  alerts: {
    overdue: KolamLayananOpsAlert[];
    pendingSupervisor: KolamLayananOpsAlert[];
    pendingCustomerConfirm: KolamLayananOpsAlert[];
  };
}

export interface KolamLayananPendingService {
  id: string;
  serviceSerial: string;
  invoiceCode: string;
  status: KolamLayananPendingStatus | string;
  packageCode: string;
  serviceName: string;
  customerName: string;
  taskType: string | null;
  purchasedAt?: string;
}

export interface KolamLayananPendingListQuery {
  page?: number;
  limit?: number;
  status?: KolamLayananPendingStatus;
  statuses?: string;
  search?: string;
  /** Filter pending vouchers linked to a service master. */
  service?: string;
}

/** Open + active vouchers shown on FE service detail. */
export const KOLAM_LAYANAN_SERVICE_DETAIL_VOUCHER_STATUSES =
  'pending,awaiting_staff_approval,awaiting_client_approval,schedule_approved,initiated';

export interface KolamLayananPendingListResult {
  items: KolamLayananPendingService[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Populated voucher detail (PendingService). */
export type KolamLayananVoucherMaterialChargeMode =
  | 'client'
  | 'hpp_voucher'
  | 'client_own';

export interface KolamLayananVisitSlot {
  weekday: number;
  time: string;
}

export interface KolamLayananVoucherMaterialLine {
  key: string;
  productId: string;
  productName: string;
  quantity: string;
  inventoryKind: 'raw' | 'product';
  chargeMode: KolamLayananVoucherMaterialChargeMode;
  unitPrice: string;
  stockFulfilledAt: string | null;
}

export interface KolamLayananPurchaseVolumeDimensions {
  length: number;
  width: number;
  height: number;
  unitLabel: string;
}

export interface KolamLayananVoucherDetail {
  id: string;
  serviceSerial: string;
  invoiceCode: string;
  status: string;
  packageCode: string;
  serviceId: string | null;
  serviceName: string;
  customerId: string | null;
  customerName: string;
  saleId: string | null;
  taskType: string | null;
  visitsPerMonth: number | null;
  purchasedAt: string | null;
  initiatedAt: string | null;
  quantity: number | null;
  purchaseDimensions: KolamLayananPurchaseVolumeDimensions | null;
  purchaseEnclosureTypes: string[];
  contractDurationValue: number | null;
  contractDurationUnit: string | null;
  proposedVisitSlots: KolamLayananVisitSlot[];
  scheduleProposedBy: 'client' | 'staff' | null;
  visitAssignedToId: string | null;
  visitAssignedToName: string | null;
  materialLines: KolamLayananVoucherMaterialLine[];
  subscriptionId: string | null;
  subscriptionNumber: string | null;
  initiatedDosingId: string | null;
  initiatedMaintenanceId: string | null;
  enclosureId: string | null;
  enclosureName: string | null;
  enclosureType: string | null;
  initiated: boolean;
  raw: unknown;
}

export interface KolamLayananScheduleRequirements {
  visitsPerMonth: number | null;
  visitsPerWeek: number | null;
  requiresScheduleFlow: boolean;
  status: string;
  proposedVisitSlots: KolamLayananVisitSlot[];
  scheduleProposedBy: 'client' | 'staff' | null;
  scheduleApprovedByStaffAt: string | null;
  scheduleApprovedByClientAt: string | null;
  visitAssignedTo: string | null;
  visitAssignedToDisplayName: string | null;
}

export interface KolamLayananTermsTemplate {
  termsTemplateId: string;
  title: string;
  version: number;
  content: string;
  accepted: boolean;
  acceptedAt: string | null;
}

export interface KolamLayananTermsContext {
  pendingServiceId: string;
  status: string;
  required: boolean;
  allAccepted: boolean;
  customerId: string | null;
  templates: KolamLayananTermsTemplate[];
}

export type KolamLayananVisitVerificationStatus =
  | 'not_applicable'
  | 'pending_supervisor'
  | 'verified'
  | 'rejected'
  | string;

export type KolamLayananRejectionDecision =
  | 'rework'
  | 'kompensasi'
  | 'skip'
  | 'lain';

export interface KolamLayananTaskUserRef {
  id: string;
  displayName: string;
}

export interface KolamLayananExecutionDetail {
  id: string;
  status: string;
  reviewStatus: string | null;
  visitVerificationStatus: KolamLayananVisitVerificationStatus;
  scheduledTime: string | null;
  estimatedAt: string | null;
  executionTime: string | null;
  executionNotes: string;
  notes: string;
  progressStep: string | null;
  packageTaskCode: string | null;
  visitSource: string | null;
  subscriptionId: string | null;
  assignedToName: string | null;
  executedByName: string | null;
  supervisorVerifiedAt: string | null;
  supervisorVerifiedByName: string | null;
  customerVerifiedAt: string | null;
  customerVerificationConfirmed: boolean | null;
  customerVerificationNote: string;
  rejectionReason: string;
  rejectionDecision: string | null;
  checkInAt: string | null;
}

export interface KolamLayananTaskDetail {
  id: string;
  taskType: 'dosing' | 'maintenance';
  name: string;
  executions: KolamLayananExecutionDetail[];
}

export const KOLAM_LAYANAN_EXECUTION_STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu',
  now: 'Sekarang',
  completed: 'Selesai',
  skipped: 'Dilewati',
  missed: 'Terlewat',
};

export const KOLAM_LAYANAN_REVIEW_STATUS_LABEL: Record<string, string> = {
  accepted: 'Diterima',
  rejected: 'Ditolak',
  pending_review: 'Menunggu tinjauan',
};

export const KOLAM_LAYANAN_VISIT_VERIFICATION_LABEL: Record<string, string> = {
  not_applicable: '—',
  pending_supervisor: 'Menunggu supervisor',
  verified: 'Terverifikasi (supervisor)',
  rejected: 'Ditolak supervisor',
};

export const KOLAM_LAYANAN_REJECTION_DECISION_OPTIONS: Array<{
  id: KolamLayananRejectionDecision;
  label: string;
}> = [
  { id: 'rework', label: 'Perbaikan ulang' },
  { id: 'kompensasi', label: 'Kompensasi' },
  { id: 'skip', label: 'Lewati' },
  { id: 'lain', label: 'Lainnya' },
];

export const KOLAM_LAYANAN_PROGRESS_STEP_LABEL: Record<string, string> = {
  en_route: 'Tim dalam perjalanan',
  arrived: 'Tiba di lokasi',
  in_progress: 'Sedang dikerjakan',
  completed: 'Selesai',
  skipped: 'Dilewati',
};

export function getKolamLayananExecutionStatusLabel(status?: string | null) {
  if (!status) {
    return '—';
  }
  return KOLAM_LAYANAN_EXECUTION_STATUS_LABEL[status] || status;
}

export function getKolamLayananReviewStatusLabel(status?: string | null) {
  if (!status) {
    return '—';
  }
  return KOLAM_LAYANAN_REVIEW_STATUS_LABEL[status] || status;
}

export function getKolamLayananVisitVerificationLabel(status?: string | null) {
  if (!status) {
    return '—';
  }
  return KOLAM_LAYANAN_VISIT_VERIFICATION_LABEL[status] || status;
}

export function getKolamLayananProgressStepLabel(step?: string | null) {
  if (!step) {
    return null;
  }
  return KOLAM_LAYANAN_PROGRESS_STEP_LABEL[step] || step;
}

/** Mirror FE `requiresVisitVerification`. */
export function requiresKolamLayananVisitVerification(
  execution: Pick<
    KolamLayananExecutionDetail,
    'subscriptionId' | 'visitSource' | 'packageTaskCode'
  >,
) {
  return Boolean(
    execution.subscriptionId ||
      execution.visitSource === 'subscription' ||
      (execution.packageTaskCode && execution.packageTaskCode !== 'LEGACY'),
  );
}

export function canKolamLayananSupervisorReview(
  execution: KolamLayananExecutionDetail,
) {
  if (!requiresKolamLayananVisitVerification(execution)) {
    return (
      (execution.status === 'completed' || execution.status === 'skipped') &&
      (!execution.reviewStatus || execution.reviewStatus === 'pending_review')
    );
  }
  return (
    execution.visitVerificationStatus === 'pending_supervisor' &&
    (execution.status === 'completed' || execution.status === 'skipped')
  );
}

/** Mirror FE `canRecordCustomerVerification`. */
export function canKolamLayananRecordCustomerVerification(
  execution: KolamLayananExecutionDetail,
) {
  return (
    requiresKolamLayananVisitVerification(execution) &&
    execution.visitVerificationStatus === 'verified' &&
    !execution.customerVerifiedAt
  );
}

export type KolamLayananSalePermissionAction = 'view' | 'create' | 'update' | 'delete';

export type KolamLayananSalePermissionEntry = {
  resource?: string;
  actions?: string[];
};

/**
 * BE pending-service mutate endpoints use `checkPermission("sale", …)`,
 * while the Layanan menu itself may be gated separately. Mirror FE `CanEdit resource="sale"`.
 */
export function hasKolamSalePermission(
  permissions: KolamLayananSalePermissionEntry[] | null | undefined,
  action: KolamLayananSalePermissionAction,
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
      (resource === 'sale' || resource === '*') &&
      (actions.includes(wanted) || actions.includes('*'))
    );
  });
}

export const KOLAM_LAYANAN_WEEKDAY_OPTIONS = [
  { id: '0', label: 'Minggu' },
  { id: '1', label: 'Senin' },
  { id: '2', label: 'Selasa' },
  { id: '3', label: 'Rabu' },
  { id: '4', label: 'Kamis' },
  { id: '5', label: 'Jumat' },
  { id: '6', label: 'Sabtu' },
] as const;

export const KOLAM_LAYANAN_MATERIAL_CHARGE_OPTIONS: Array<{
  id: KolamLayananVoucherMaterialChargeMode;
  label: string;
}> = [
  { id: 'client', label: 'Tagih pelanggan' },
  { id: 'hpp_voucher', label: 'HPP voucher' },
  { id: 'client_own', label: 'Punya sendiri' },
];

export const UNSCHEDULED_WEEKDAY = -1;

export function createEmptyKolamLayananVisitSlot(): KolamLayananVisitSlot {
  return { weekday: UNSCHEDULED_WEEKDAY, time: '' };
}

export function createEmptyKolamLayananVisitSlots(
  count: number,
): KolamLayananVisitSlot[] {
  const n = Math.max(0, Number(count) || 0);
  return Array.from({ length: n }, () => createEmptyKolamLayananVisitSlot());
}

export function ensureKolamLayananVisitSlotRows(
  value: KolamLayananVisitSlot[],
  count: number,
): KolamLayananVisitSlot[] {
  const n = Math.max(1, Number(count) || 1);
  const rows = value.slice(0, n);
  while (rows.length < n) {
    rows.push(createEmptyKolamLayananVisitSlot());
  }
  return rows;
}

export function isKolamLayananVisitSlotComplete(slot: KolamLayananVisitSlot) {
  const weekday = Number(slot.weekday);
  const time = String(slot.time ?? '').trim();
  return (
    Number.isFinite(weekday) &&
    weekday >= 0 &&
    weekday <= 6 &&
    /^\d{1,2}:\d{2}$/.test(time)
  );
}

export function kolamLayananVisitSlotsReadyForPropose(
  slots: KolamLayananVisitSlot[],
  visitsPerWeek: number,
) {
  const n = Math.max(1, Number(visitsPerWeek) || 1);
  const rows = ensureKolamLayananVisitSlotRows(slots, n);
  if (rows.length !== n) {
    return false;
  }
  if (!rows.every(isKolamLayananVisitSlotComplete)) {
    return false;
  }
  const weekdays = rows.map(slot => slot.weekday);
  return new Set(weekdays).size === weekdays.length;
}

export function completedKolamLayananVisitSlotsForApi(
  slots: KolamLayananVisitSlot[],
  visitsPerWeek: number,
): KolamLayananVisitSlot[] {
  return ensureKolamLayananVisitSlotRows(slots, visitsPerWeek)
    .filter(isKolamLayananVisitSlotComplete)
    .map(slot => ({
      weekday: Number(slot.weekday),
      time: String(slot.time).trim(),
    }));
}

export function createEmptyKolamLayananMaterialLine(
  partial?: Partial<KolamLayananVoucherMaterialLine>,
): KolamLayananVoucherMaterialLine {
  return {
    key: `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    productId: '',
    productName: '',
    quantity: '1',
    inventoryKind: 'product',
    chargeMode: 'client_own',
    unitPrice: '0',
    stockFulfilledAt: null,
    ...partial,
  };
}

export function getKolamLayananWeekdayLabel(weekday: number) {
  const match = KOLAM_LAYANAN_WEEKDAY_OPTIONS.find(
    option => Number(option.id) === weekday,
  );
  return match?.label ?? String(weekday);
}

export function getKolamLayananMaterialChargeLabel(
  mode: KolamLayananVoucherMaterialChargeMode | string,
) {
  const match = KOLAM_LAYANAN_MATERIAL_CHARGE_OPTIONS.find(
    option => option.id === mode,
  );
  return match?.label ?? mode;
}

export function validateKolamLayananMaterialLines(
  lines: KolamLayananVoucherMaterialLine[],
): string | null {
  for (const line of lines) {
    if (line.chargeMode === 'client_own') {
      if (!line.productName.trim() && !line.productId.trim()) {
        return 'Baris “punya sendiri” perlu nama material.';
      }
      continue;
    }
    if (!line.productId.trim()) {
      return `"${line.productName || 'Item'}": isi ID produk katalog (SKU) sebelum simpan.`;
    }
  }
  return null;
}

export function createKolamLayananProductComponentsPayload(
  lines: KolamLayananVoucherMaterialLine[],
) {
  return lines
    .filter(line =>
      line.chargeMode === 'client_own'
        ? Boolean(line.productName.trim() || line.productId.trim())
        : Boolean(line.productId.trim()),
    )
    .map(line => ({
      product:
        line.chargeMode === 'client_own' && !line.productId.trim()
          ? null
          : line.productId.trim(),
      quantityPerExecution: Number(line.quantity) || 1,
      inventoryKind: line.inventoryKind,
      chargeMode: line.chargeMode,
      unitPrice: Number(line.unitPrice) || 0,
      productName: line.productName.trim(),
    }));
}

export interface KolamLayananSubscription {
  id: string;
  subscriptionNumber: string;
  customerName: string;
  serviceName: string;
  packageCode: string;
  voucherSerial: string;
  voucherId: string | null;
  startDate: string | null;
  endDate: string | null;
  status: KolamLayananSubscriptionStatus | string;
  autoRenew: boolean;
}

export interface KolamLayananSubscriptionDetail extends KolamLayananSubscription {
  customerId: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  serviceId: string | null;
  taskType: string | null;
  saleId: string | null;
  saleInvoiceCode: string | null;
  saleStatus: string | null;
  notes: string;
  transportCostDefault: number;
  packageTasksCount: number;
  enclosureId: string | null;
  enclosureName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface KolamLayananSubscriptionCrossLink {
  id: string;
  label: string;
  description: string;
  route: string | null;
  available: boolean;
}

export interface KolamLayananSubscriptionVisitPreview {
  packageTaskCode: string;
  visitTitle: string;
  scheduledTime: string | null;
  estimatedAt: string | null;
}

export interface KolamLayananSubscriptionVisitPreviewResult {
  preview: KolamLayananSubscriptionVisitPreview[];
  skipped: boolean;
  reason: string | null;
  taskId: string | null;
  taskType: string | null;
  ops: number | null;
}

export interface KolamLayananSubscriptionUpdatePayload {
  status?: KolamLayananSubscriptionStatus | string;
  customerId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  autoRenew?: boolean;
  notes?: string;
  transportCostDefault?: number;
}

export interface KolamLayananSubscriptionSpawnVisitsResult {
  preview: KolamLayananSubscriptionVisitPreview[];
  skipped: boolean;
  reason: string | null;
  taskId: string | null;
  taskType: string | null;
  ops: number | null;
}

export interface KolamLayananSubscriptionContractFormState {
  status: KolamLayananSubscriptionStatus | string;
  customerId: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  notes: string;
  transportCostDefault: string;
}

export interface KolamLayananSubscriptionPendingVerification {
  taskId: string;
  executionId: string;
  pendingServiceId: string | null;
  visitTitle: string;
  packageTaskCode: string;
  scheduledTime: string | null;
  href: string | null;
}

export interface KolamLayananSubscriptionListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: KolamLayananSubscriptionStatus | 'all';
}

export interface KolamLayananSubscriptionListResult {
  items: KolamLayananSubscription[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const KOLAM_LAYANAN_SUBSCRIPTION_STATUS_OPTIONS: Array<{
  id: KolamLayananSubscriptionStatus;
  label: string;
}> = [
  { id: 'draft', label: 'Draf' },
  { id: 'active', label: 'Aktif' },
  { id: 'suspended', label: 'Ditangguhkan' },
  { id: 'expired', label: 'Kedaluwarsa' },
  { id: 'cancelled', label: 'Dibatalkan' },
];

/** FE voucher detail STATUS_LABEL (+ cancelled). */
export const KOLAM_LAYANAN_PENDING_STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu aktivasi',
  awaiting_staff_approval: 'Tunggu staff',
  awaiting_client_approval: 'Tunggu pelanggan',
  schedule_approved: 'Jadwal disetujui',
  initiated: 'Aktif',
  cancelled: 'Dibatalkan',
};

/** FE staff-voucher-schedule-card statusLabel. */
export const KOLAM_LAYANAN_SCHEDULE_STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu jadwal',
  awaiting_staff_approval: 'Menunggu persetujuan staff',
  awaiting_client_approval: 'Menunggu persetujuan pelanggan',
  schedule_approved: 'Jadwal disetujui',
};

export function getKolamLayananSubscriptionStatusLabel(status?: string | null) {
  return (
    KOLAM_LAYANAN_SUBSCRIPTION_STATUS_OPTIONS.find(option => option.id === status)
      ?.label ||
    status ||
    '—'
  );
}

export function getKolamLayananSubscriptionStatusIntent(
  status?: string | null,
): 'secondary' | 'success' | 'warning' | 'danger' | 'info' {
  if (status === 'active') {
    return 'success';
  }
  if (status === 'suspended') {
    return 'warning';
  }
  if (status === 'cancelled') {
    return 'danger';
  }
  if (status === 'draft' || status === 'expired') {
    return 'secondary';
  }
  return 'info';
}

/** Read-only deep links from subscription detail to related modules. */
export function buildKolamLayananSubscriptionCrossLinks(
  detail: KolamLayananSubscriptionDetail,
): KolamLayananSubscriptionCrossLink[] {
  return [
    {
      id: 'sales',
      label: 'Penjualan',
      description: detail.saleInvoiceCode
        ? `Faktur ${detail.saleInvoiceCode}`
        : 'Faktur penjualan terkait',
      route: detail.saleId ? `/sales/${detail.saleId}` : null,
      available: Boolean(detail.saleId),
    },
    {
      id: 'voucher',
      label: 'Voucher layanan',
      description: detail.voucherSerial || 'Pending service',
      route: detail.voucherId
        ? `${KOLAM_LAYANAN_ROOT}/voucher/${detail.voucherId}`
        : null,
      available: Boolean(detail.voucherId),
    },
    {
      id: 'service',
      label: 'Paket layanan',
      description: detail.serviceName,
      route: detail.serviceId
        ? `${KOLAM_LAYANAN_ROOT}/${detail.serviceId}`
        : null,
      available: Boolean(detail.serviceId),
    },
    {
      id: 'enclosure',
      label: 'Kandang',
      description: detail.enclosureName || 'Kandang pelanggan',
      route: detail.enclosureId
        ? `/enclosures/${detail.enclosureId}`
        : '/enclosures',
      available: true,
    },
    {
      id: 'stock',
      label: 'Transaksi stok',
      description: 'Riwayat pergerakan stok terkait penjualan',
      route: '/stock-transaction',
      available: true,
    },
    {
      id: 'complaint',
      label: 'Komplain',
      description: 'Komplain terkait penjualan/langganan',
      route: '/complaints',
      available: true,
    },
  ];
}

export function getKolamLayananPendingStatusLabel(status?: string | null) {
  if (!status) {
    return '—';
  }
  return KOLAM_LAYANAN_PENDING_STATUS_LABEL[status] || status;
}

export function getKolamLayananPendingStatusIntent(
  status?: string | null,
): 'secondary' | 'success' | 'warning' | 'danger' | 'info' {
  if (status === 'initiated') {
    return 'success';
  }
  if (status === 'pending') {
    return 'secondary';
  }
  if (status === 'cancelled') {
    return 'danger';
  }
  return 'warning';
}

export function getKolamLayananScheduleStatusLabel(status?: string | null) {
  if (!status) {
    return '—';
  }
  return KOLAM_LAYANAN_SCHEDULE_STATUS_LABEL[status] || status;
}

export function formatKolamLayananPurchaseDimensions(
  dims: KolamLayananPurchaseVolumeDimensions | null | undefined,
): string | null {
  if (!dims) {
    return null;
  }
  const nums = [dims.length, dims.width, dims.height].map(n => {
    const rounded = Math.round(n * 100) / 100;
    return String(rounded);
  });
  const unit = dims.unitLabel.trim();
  return unit
    ? `${nums[0]} × ${nums[1]} × ${nums[2]} ${unit}`
    : `${nums[0]} × ${nums[1]} × ${nums[2]}`;
}

export function formatKolamLayananPurchaseVolumeM3(
  quantity: number | null | undefined,
): string | null {
  if (typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity <= 0) {
    return null;
  }
  const rounded = Math.round(quantity * 100) / 100;
  return `${rounded} m³`;
}

export const KOLAM_LAYANAN_DIMENSION_UNIT_OPTIONS = [
  { id: 'Cm', label: 'cm' },
  { id: 'M', label: 'm' },
  { id: 'Mm', label: 'mm' },
] as const;

export interface KolamLayananContractDimensionsDraft {
  length: string;
  width: string;
  height: string;
  unitLabel: string;
}

export function createKolamLayananContractDimensionsDraft(
  dims: KolamLayananPurchaseVolumeDimensions | null | undefined,
): KolamLayananContractDimensionsDraft {
  if (!dims) {
    return { length: '', width: '', height: '', unitLabel: 'Cm' };
  }
  return {
    length: String(dims.length),
    width: String(dims.width),
    height: String(dims.height),
    unitLabel: dims.unitLabel.trim() || 'Cm',
  };
}

export function parseKolamLayananDimInput(raw: string): number {
  const normalized = raw.replace(',', '.').trim();
  if (!normalized) {
    return 0;
  }
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function calcKolamLayananVolumeM3FromUnitLabel(
  length: number,
  width: number,
  height: number,
  unitLabel: string,
): number | null {
  const key = unitLabel.trim().toLowerCase();
  let factor: number | null = null;
  if (key === 'm' || key === 'meter') {
    factor = 1;
  } else if (key === 'cm' || key === 'centimeter' || key.includes('centi')) {
    factor = 0.01;
  } else if (key === 'mm' || key === 'millimeter' || key.includes('milli')) {
    factor = 0.001;
  }
  if (factor == null || length <= 0 || width <= 0 || height <= 0) {
    return null;
  }
  return Math.round(length * factor * width * factor * height * factor * 100) / 100;
}

export function formatKolamLayananIdr(value: number) {
  return `Rp ${Math.round(value).toLocaleString('id-ID')}`;
}

export function getKolamLayananCapacityStatusLabel(status: string) {
  if (status === 'full') {
    return 'Penuh';
  }
  if (status === 'limited') {
    return 'Hampir penuh';
  }
  return 'Tersedia';
}

export function getKolamLayananCapacityStatusIntent(
  status: string,
): 'danger' | 'warning' | 'success' {
  if (status === 'full') {
    return 'danger';
  }
  if (status === 'limited') {
    return 'warning';
  }
  return 'success';
}

export function getKolamLayananOpsAlertHref(alert: {
  pendingServiceId: string | null;
  executionId: string | null;
}) {
  if (!alert.pendingServiceId || !alert.executionId) {
    return null;
  }
  return `${KOLAM_LAYANAN_ROOT}/voucher/${alert.pendingServiceId}/execution/${alert.executionId}`;
}

export function buildKolamLayananOpsKpiCards(dashboard: KolamLayananOpsDashboard | null) {
  return [
    {
      id: 'active',
      label: 'Langganan aktif',
      detail: 'Kontrak berstatus aktif',
      value: dashboard ? String(dashboard.activeSubscriptions) : '—',
      tone: 'success' as const,
    },
    {
      id: 'today',
      label: 'Kunjungan hari ini',
      detail: 'Jadwal operasional hari ini',
      value: dashboard ? String(dashboard.scheduledToday) : '—',
      tone: 'default' as const,
    },
    {
      id: 'fullSlots',
      label: 'Slot penuh',
      detail: 'Periode 30 hari ke depan',
      value: dashboard ? String(dashboard.fullSlots) : '—',
      tone: 'warning' as const,
    },
    {
      id: 'hpp',
      label: 'HPP bulan ini',
      detail: 'Biaya kunjungan layanan',
      value: dashboard ? formatCompactIdr(dashboard.hppThisMonth) : '—',
      tone: 'muted' as const,
    },
  ];
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

export function getKolamLayananVoucherIdFromRoute(route: string): string | null {
  const path = normalizeKolamLayananPath(route);
  const match = path.match(/^\/layanan\/voucher\/([^/]+)$/);
  return match?.[1] ?? null;
}

export function getKolamLayananSubscriptionIdFromRoute(
  route: string,
): string | null {
  const path = normalizeKolamLayananPath(route);
  const match = path.match(/^\/layanan\/langganan\/([^/]+)$/);
  return match?.[1] ?? null;
}

export function getKolamLayananExecutionRouteIds(route: string): {
  voucherId: string;
  executionId: string;
} | null {
  const path = normalizeKolamLayananPath(route);
  const match = path.match(/^\/layanan\/voucher\/([^/]+)\/execution\/([^/]+)$/);
  if (!match?.[1] || !match?.[2]) {
    return null;
  }
  return { voucherId: match[1], executionId: match[2] };
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

export function formatKolamLayananContractDuration(
  value: number | null | undefined,
  unit: KolamLayananContractDurationUnit | null | undefined,
) {
  if (value == null || !unit) {
    return '—';
  }
  const label =
    KOLAM_LAYANAN_CONTRACT_DURATION_UNIT_OPTIONS.find(option => option.id === unit)
      ?.label.toLowerCase() ?? unit;
  return `${value} ${label}`;
}

export function formatKolamLayananCommission(service: KolamLayananService) {
  if (!service.commissionEnabled) {
    return 'Nonaktif';
  }
  if (service.commissionType === 'fixed') {
    return formatRupiahAmount(service.commissionValue);
  }
  return `${service.commissionValue}%`;
}

export function formatKolamLayananMemberPoints(service: KolamLayananService) {
  if (!service.memberPointsEnabled) {
    return 'Nonaktif';
  }
  const pts = service.memberPoints || 0;
  return pts > 0 ? `${pts.toLocaleString('id-ID')} poin` : '0 poin';
}

export function hasKolamLayananVolumePricing(service: KolamLayananService) {
  return (service.priceM3 ?? 0) > 0 || (service.priceKm ?? 0) > 0;
}

export function formatKolamLayananPricingMethod(service: KolamLayananService) {
  const priceM3 = service.priceM3 ?? 0;
  const priceKm = service.priceKm ?? 0;
  if (priceM3 > 0 && priceKm > 0) {
    return 'Per m³ & per km';
  }
  if (priceM3 > 0) {
    return 'Per m³';
  }
  if (priceKm > 0) {
    return 'Per km';
  }
  return 'Standar (harga tetap)';
}

export function getKolamLayananStandardPrice(service: KolamLayananService) {
  return service.priceToSell ?? service.price ?? 0;
}

function formatRupiahAmount(value: number) {
  return `Rp ${Math.round(value).toLocaleString('id-ID')}`;
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

export function createEmptyKolamLayananServiceFormState(): KolamLayananServiceFormState {
  return {
    name: '',
    sku: '',
    description: '',
    brandIds: [],
    sellable: false,
    enclosureTaskTypeKeys: [],
    enclosureTypes: [],
    taskType: '',
    visitsPerMonth: '',
    packageCode: '',
    packageActive: true,
    contractDurationValue: '1',
    contractDurationUnit: 'months',
    price: '0',
    costM3: '0',
    costKm: '0',
    priceM3: '0',
    priceKm: '0',
    commissionEnabled: false,
    commissionType: 'percentage',
    commissionValue: '0',
    memberPointsEnabled: false,
    memberPoints: '0',
  };
}

export function createKolamLayananServiceFormState(
  service: KolamLayananService,
): KolamLayananServiceFormState {
  return {
    id: service.id,
    name: service.name === '—' ? '' : service.name,
    sku: service.sku === '—' ? '' : service.sku,
    description: service.description,
    brandIds: service.brandIds.length
      ? service.brandIds
      : service.brands.map(brand => brand.id),
    sellable: service.sellable,
    enclosureTaskTypeKeys: service.enclosureTaskTypeKeys.length
      ? service.enclosureTaskTypeKeys
      : service.taskType
        ? [service.taskType]
        : [],
    enclosureTypes: service.enclosureTypes,
    taskType: service.taskType || '',
    visitsPerMonth:
      service.visitsPerMonth != null ? String(service.visitsPerMonth) : '',
    packageCode: service.packageCode === '—' ? '' : service.packageCode,
    packageActive: service.packageActive,
    contractDurationValue:
      service.contractDurationValue != null
        ? String(service.contractDurationValue)
        : '1',
    contractDurationUnit: service.contractDurationUnit || 'months',
    price: String(service.price ?? 0),
    costM3: String(service.costM3 ?? 0),
    costKm: String(service.costKm ?? 0),
    priceM3: String(service.priceM3 ?? 0),
    priceKm: String(service.priceKm ?? 0),
    commissionEnabled: service.commissionEnabled,
    commissionType: service.commissionType,
    commissionValue: String(service.commissionValue ?? 0),
    memberPointsEnabled: service.memberPointsEnabled,
    memberPoints: String(service.memberPoints ?? 0),
  };
}

export function validateKolamLayananServiceForm(
  form: KolamLayananServiceFormState,
): string | null {
  if (!form.name.trim()) {
    return 'Nama layanan wajib diisi.';
  }
  if (!form.sku.trim()) {
    return 'SKU wajib diisi.';
  }
  if (!form.brandIds.length) {
    return 'Pilih minimal satu merek.';
  }
  if (!form.enclosureTaskTypeKeys.length) {
    return 'Pilih minimal satu tipe task (dosing/pemeliharaan).';
  }
  if (!form.enclosureTypes.length) {
    return 'Pilih minimal satu tipe kandang.';
  }
  return null;
}

export function createKolamLayananServiceSavePayload(
  form: KolamLayananServiceFormState,
): KolamLayananServiceSavePayload {
  const visitsPerMonth = Number(form.visitsPerMonth);
  const contractDurationValue = Number(form.contractDurationValue);
  const packageCode = form.packageCode.trim().toUpperCase();
  const taskType =
    form.taskType.trim() || form.enclosureTaskTypeKeys[0] || null;

  const body: KolamLayananServiceSavePayload = {
    name: form.name.trim(),
    sku: form.sku.trim(),
    description: form.description.trim(),
    brand: form.brandIds,
    sellable: form.sellable,
    price: Number(form.price) || 0,
    price_to_sell: 0,
    cost_m3: Number(form.costM3) || 0,
    cost_km: Number(form.costKm) || 0,
    price_m3: Number(form.priceM3) || 0,
    price_km: Number(form.priceKm) || 0,
    minimum_price_to_sales: 0,
    commissionEnabled: form.commissionEnabled,
    commissionType: form.commissionType,
    commissionValue: Number(form.commissionValue) || 0,
    memberPoints: {
      enabled: form.memberPointsEnabled,
      points: Number(form.memberPoints) || 0,
    },
    enclosureTaskTypeKeys: form.enclosureTaskTypeKeys,
    enclosureTypes: form.enclosureTypes,
    taskType,
    packageActive: form.packageActive,
  };

  if (Number.isFinite(visitsPerMonth) && visitsPerMonth > 0) {
    body.visitsPerMonth = visitsPerMonth;
  }
  if (packageCode) {
    body.packageCode = packageCode;
  }
  if (
    Number.isFinite(contractDurationValue) &&
    contractDurationValue > 0 &&
    form.contractDurationUnit
  ) {
    body.contractDurationValue = contractDurationValue;
    body.contractDurationUnit = form.contractDurationUnit;
  }

  return body;
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

  const enclosureTaskTypeKeys = Array.isArray(record.enclosureTaskTypeKeys)
    ? record.enclosureTaskTypeKeys
        .filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
        .map(item => item.trim())
    : [];
  const enclosureTypes = Array.isArray(record.enclosureTypes)
    ? record.enclosureTypes
        .filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
        .map(item => item.trim())
    : getString(record, 'enclosureType')
      ? [getString(record, 'enclosureType')]
      : [];
  const memberPoints = asRecord(record.memberPoints);
  const commissionTypeRaw = getString(record, 'commissionType');
  const contractUnitRaw = getString(record, 'contractDurationUnit');
  const contractDurationUnit =
    contractUnitRaw === 'days' ||
    contractUnitRaw === 'weeks' ||
    contractUnitRaw === 'months' ||
    contractUnitRaw === 'years'
      ? contractUnitRaw
      : null;

  return {
    id: getString(record, '_id') || getString(record, 'id'),
    name: getString(record, 'name') || '—',
    sku: getString(record, 'sku') || '—',
    description: getString(record, 'description'),
    packageCode: getString(record, 'packageCode') || '—',
    packageActive: getBoolean(record, 'packageActive') ?? true,
    brands,
    brandIds: brands.map(brand => brand.id),
    taskType: getString(record, 'taskType') || null,
    enclosureTaskTypeKeys,
    enclosureTypes,
    visitsPerMonth: getNumber(record, 'visitsPerMonth'),
    requiresOnSiteVisit: getBoolean(record, 'requiresOnSiteVisit') ?? false,
    includesDelivery: getBoolean(record, 'includesDelivery') ?? false,
    price: getNumber(record, 'price'),
    priceM3: getNumber(record, 'price_m3'),
    priceKm: getNumber(record, 'price_km'),
    costM3: getNumber(record, 'cost_m3'),
    costKm: getNumber(record, 'cost_km'),
    priceToSell: getNumber(record, 'price_to_sell'),
    onlinePrice: getNumber(record, 'onlinePrice'),
    sellable: getBoolean(record, 'sellable') ?? true,
    commissionEnabled: getBoolean(record, 'commissionEnabled') ?? false,
    commissionType: commissionTypeRaw === 'fixed' ? 'fixed' : 'percentage',
    commissionValue: getNumber(record, 'commissionValue') ?? 0,
    memberPointsEnabled: getBoolean(memberPoints, 'enabled') ?? false,
    memberPoints: getNumber(memberPoints, 'points') ?? 0,
    contractDurationValue: getNumber(record, 'contractDurationValue'),
    contractDurationUnit,
    productComponents: normalizeKolamLayananServiceProductComponents(record),
    createdAt: getString(record, 'createdAt') || undefined,
    updatedAt: getString(record, 'updatedAt') || undefined,
    raw: payload,
  };
}

export function normalizeKolamLayananServiceProductComponents(
  source: unknown,
): KolamLayananServiceProductComponent[] {
  const record = asRecord(source);
  const rows = Array.isArray(record.productComponents)
    ? record.productComponents
    : [];
  return rows
    .map((row, index) => {
      const item = asRecord(row);
      const productRaw = item.product;
      const product = asRecord(productRaw);
      const productId =
        typeof productRaw === 'string'
          ? productRaw.trim()
          : getString(product, '_id') || getString(product, 'id');
      const productName =
        getString(item, 'productName') ||
        getString(product, 'name') ||
        (productId ? productId : '');
      if (!productId && !productName) {
        return null;
      }
      const inventoryRaw = getString(item, 'inventoryKind');
      const productType = getString(product, 'type');
      const inventoryKind: 'raw' | 'product' =
        inventoryRaw === 'raw' || productType === 'raw' ? 'raw' : 'product';
      const unit = asRecord(item.unit ?? product.unit);
      const unitName = getString(unit, 'name');
      const unitInitial = getString(unit, 'initial');
      const unitLabel = unitInitial
        ? `${unitName || unitInitial}${unitName ? ` (${unitInitial})` : ''}`
        : unitName || '—';
      const brand = asRecord(product.brand);
      const category = asRecord(product.category);
      return {
        key: `${productId || 'pc'}-${index}`,
        productId,
        productName: productName || 'Produk tidak dikenal',
        productCode: getString(product, 'productCode') || getString(product, 'sku') || '—',
        inventoryKind,
        quantityPerExecution:
          getNumber(item, 'quantityPerExecution') ??
          getNumber(item, 'quantity') ??
          1,
        unitLabel,
        stock: getNumber(product, 'stock') ?? null,
        brandName:
          getString(brand, 'name') ||
          (typeof product.brand === 'string' ? product.brand : '') ||
          '—',
        categoryName:
          getString(category, 'name') ||
          (typeof product.category === 'string' ? product.category : '') ||
          '—',
        typeLabel: inventoryKind === 'raw' ? 'Bahan baku' : 'Produk jadi',
        price:
          getNumber(product, 'price') ??
          getNumber(product, 'price_to_sell') ??
          null,
      } satisfies KolamLayananServiceProductComponent;
    })
    .filter((item): item is KolamLayananServiceProductComponent => item != null);
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

export function normalizeKolamLayananOpsDashboard(
  payload: unknown,
): KolamLayananOpsDashboard {
  const root = asRecord(unwrapData(payload));
  const subscriptions = asRecord(root.subscriptions);
  const visits = asRecord(root.visits);
  const hpp = asRecord(root.hpp);
  const capacity = asRecord(root.capacity);
  const period = asRecord(capacity.period);
  const summary = asRecord(capacity.summary);
  const alerts = asRecord(root.alerts);
  const slotsRaw = Array.isArray(capacity.slots) ? capacity.slots : [];

  return {
    generatedAt: getString(root, 'generatedAt'),
    timezone: getString(root, 'timezone') || getString(capacity, 'timezone'),
    activeSubscriptions: getNumber(subscriptions, 'active') ?? 0,
    scheduledToday: getNumber(visits, 'scheduledToday') ?? 0,
    fullSlots: getNumber(summary, 'fullSlots') ?? 0,
    hppThisMonth: getNumber(hpp, 'totalThisMonth') ?? 0,
    capacityPeriodStart: getString(period, 'periodStart'),
    capacityPeriodEnd: getString(period, 'periodEnd'),
    capacitySummary: {
      fullSlots: getNumber(summary, 'fullSlots') ?? 0,
      limitedSlots: getNumber(summary, 'limitedSlots') ?? 0,
      totalSlots: getNumber(summary, 'totalSlots') ?? 0,
    },
    slots: slotsRaw.map(normalizeCapacitySlot).filter(slot => slot.week > 0),
    alerts: {
      overdue: normalizeAlertRows(alerts.overdue),
      pendingSupervisor: normalizeAlertRows(alerts.pendingSupervisor),
      pendingCustomerConfirm: normalizeAlertRows(alerts.pendingCustomerConfirm),
    },
  };
}

export function normalizeKolamLayananPendingService(
  payload: unknown,
): KolamLayananPendingService {
  const record = asRecord(unwrapData(payload));
  const service = asRecord(record.service);
  const sale = asRecord(record.sale);
  const customer = asRecord(sale.customer);

  return {
    id: getString(record, '_id') || getString(record, 'id'),
    serviceSerial: getString(record, 'serviceSerial') || '—',
    invoiceCode:
      getString(record, 'invoiceCode') ||
      getString(sale, 'invoiceCode') ||
      '—',
    status: getString(record, 'status') || 'pending',
    packageCode: getString(record, 'packageCode') || '—',
    serviceName: getString(service, 'name') || '—',
    customerName: getString(customer, 'name') || '—',
    taskType: getString(record, 'taskType') || getString(service, 'taskType') || null,
    purchasedAt: getString(record, 'purchasedAt') || undefined,
  };
}

export function normalizeKolamLayananPendingList(
  payload: unknown,
  query: KolamLayananPendingListQuery = {},
): KolamLayananPendingListResult {
  const outer = asRecord(payload);
  const nested = asRecord(outer.data);
  const list: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray(outer.data)
      ? outer.data
      : Array.isArray(nested.data)
        ? nested.data
        : [];

  const pagination = asRecord(outer.pagination ?? nested.pagination ?? null);
  const limit =
    query.limit ??
    getNumber(pagination, 'limit') ??
    10;
  const page =
    query.page ??
    getNumber(pagination, 'page') ??
    getNumber(pagination, 'currentPage') ??
    1;
  const total =
    getNumber(pagination, 'total') ??
    getNumber(pagination, 'totalDocuments') ??
    getNumber(pagination, 'totalItems') ??
    list.length;
  const totalPages =
    getNumber(pagination, 'totalPages') ??
    Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return {
    items: list
      .map(normalizeKolamLayananPendingService)
      .filter(item => Boolean(item.id)),
    page,
    limit,
    total,
    totalPages,
  };
}

export function normalizeKolamLayananSubscription(
  payload: unknown,
): KolamLayananSubscription {
  const record = asRecord(unwrapData(payload));
  const customer = asRecord(record.customer);
  const service = asRecord(record.service);
  const pending = asRecord(record.pendingService);

  return {
    id: getString(record, '_id') || getString(record, 'id'),
    subscriptionNumber: getString(record, 'subscriptionNumber') || '—',
    customerName:
      typeof record.customer === 'string'
        ? record.customer
        : getString(customer, 'name') || '—',
    serviceName:
      typeof record.service === 'string'
        ? record.service
        : getString(service, 'name') || '—',
    packageCode:
      getString(record, 'packageCode') ||
      getString(service, 'packageCode') ||
      '—',
    voucherSerial:
      getString(pending, 'serviceSerial') ||
      getString(record, 'serviceSerial') ||
      '—',
    voucherId:
      getString(pending, '_id') || getString(pending, 'id') || null,
    startDate: getString(record, 'startDate') || null,
    endDate: getString(record, 'endDate') || null,
    status: getString(record, 'status') || 'draft',
    autoRenew: getBoolean(record, 'autoRenew') ?? false,
  };
}

export function normalizeKolamLayananSubscriptionDetail(
  payload: unknown,
): KolamLayananSubscriptionDetail {
  const base = normalizeKolamLayananSubscription(payload);
  const record = asRecord(unwrapData(payload));
  const customer = asRecord(record.customer);
  const service = asRecord(record.service);
  const sale = asRecord(record.sale);
  const pending = asRecord(record.pendingService);
  const packageTasks = Array.isArray(record.packageTasksSnapshot)
    ? record.packageTasksSnapshot
    : [];

  return {
    ...base,
    customerId:
      getString(customer, '_id') ||
      getString(customer, 'id') ||
      (typeof record.customer === 'string' ? record.customer : '') ||
      null,
    customerPhone: getString(customer, 'phone') || null,
    customerEmail: getString(customer, 'email') || null,
    serviceId:
      getString(service, '_id') ||
      getString(service, 'id') ||
      (typeof record.service === 'string' ? record.service : '') ||
      null,
    taskType:
      getString(service, 'taskType') ||
      getString(pending, 'taskType') ||
      null,
    saleId:
      getString(sale, '_id') ||
      getString(sale, 'id') ||
      (typeof record.sale === 'string' ? record.sale : '') ||
      null,
    saleInvoiceCode:
      getString(sale, 'invoiceCode') ||
      getString(pending, 'invoiceCode') ||
      null,
    saleStatus: getString(sale, 'status') || null,
    notes: getString(record, 'notes'),
    transportCostDefault: getNumber(record, 'transportCostDefault') ?? 0,
    packageTasksCount: packageTasks.length,
    enclosureId: null,
    enclosureName: null,
    createdAt: getString(record, 'createdAt') || null,
    updatedAt: getString(record, 'updatedAt') || null,
  };
}

export function createKolamLayananSubscriptionContractForm(
  detail: KolamLayananSubscriptionDetail | null | undefined,
): KolamLayananSubscriptionContractFormState {
  return {
    status: detail?.status || 'draft',
    customerId: detail?.customerId || '',
    startDate: detail?.startDate ? detail.startDate.slice(0, 10) : '',
    endDate: detail?.endDate ? detail.endDate.slice(0, 10) : '',
    autoRenew: Boolean(detail?.autoRenew),
    notes: detail?.notes || '',
    transportCostDefault: String(detail?.transportCostDefault ?? 0),
  };
}

export function createKolamLayananSubscriptionUpdatePayload(
  form: KolamLayananSubscriptionContractFormState,
): KolamLayananSubscriptionUpdatePayload {
  const transport = Number(form.transportCostDefault.replace(/[^\d.-]/g, ''));
  return {
    status: form.status,
    customerId: form.customerId.trim() || null,
    startDate: form.startDate.trim() || null,
    endDate: form.endDate.trim() || null,
    autoRenew: form.autoRenew,
    notes: form.notes,
    transportCostDefault: Number.isFinite(transport) ? transport : 0,
  };
}

export function normalizeKolamLayananSubscriptionVisitPreviews(
  payload: unknown,
): KolamLayananSubscriptionVisitPreviewResult {
  const record = asRecord(unwrapData(payload));
  const list = Array.isArray(record.preview)
    ? record.preview
    : Array.isArray(payload)
      ? payload
      : [];
  return {
    preview: list.map(item => {
      const row = asRecord(item);
      return {
        packageTaskCode: getString(row, 'packageTaskCode'),
        visitTitle: getString(row, 'visitTitle') || 'Kunjungan',
        scheduledTime:
          getString(row, 'scheduled_time') ||
          getString(row, 'scheduledTime') ||
          null,
        estimatedAt: getString(row, 'estimatedAt') || null,
      };
    }),
    skipped: getBoolean(record, 'skipped') ?? false,
    reason: getString(record, 'reason') || null,
    taskId: getString(record, 'taskId') || null,
    taskType: getString(record, 'taskType') || null,
    ops: getNumber(record, 'ops'),
  };
}

export function normalizeKolamLayananSubscriptionSpawnVisitsResult(
  payload: unknown,
): KolamLayananSubscriptionSpawnVisitsResult {
  return normalizeKolamLayananSubscriptionVisitPreviews(payload);
}

export function normalizeKolamLayananSubscriptionPendingVerifications(
  payload: unknown,
): KolamLayananSubscriptionPendingVerification[] {
  const outer = asRecord(payload);
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(outer.data)
      ? outer.data
      : [];
  return list
    .map(item => {
      const row = asRecord(item);
      const pendingServiceId =
        getString(row, 'pendingServiceId') ||
        getIdFromMaybeRef(row.pendingService);
      const executionId = getString(row, 'executionId') || '';
      const taskId = getString(row, 'taskId') || '';
      return {
        taskId,
        executionId,
        pendingServiceId,
        visitTitle: getString(row, 'visitTitle') || 'Kunjungan',
        packageTaskCode: getString(row, 'packageTaskCode'),
        scheduledTime:
          getString(row, 'scheduledTime') ||
          getString(row, 'scheduled_time') ||
          null,
        href:
          pendingServiceId && executionId
            ? getKolamLayananOpsAlertHref({
                pendingServiceId,
                executionId,
              })
            : null,
      };
    })
    .filter(item => Boolean(item.executionId));
}

export function normalizeKolamLayananSubscriptionList(
  payload: unknown,
  query: KolamLayananSubscriptionListQuery = {},
): KolamLayananSubscriptionListResult {
  const outer = asRecord(payload);
  const nested = asRecord(outer.data);
  const list: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray(outer.data)
      ? outer.data
      : Array.isArray(nested.data)
        ? nested.data
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
      .map(normalizeKolamLayananSubscription)
      .filter(item => Boolean(item.id)),
    page,
    limit,
    total,
    totalPages,
  };
}

function normalizeCapacitySlot(value: unknown): KolamLayananCapacitySlot {
  const record = asRecord(value);
  const statusRaw = getString(record, 'status') || 'available';
  const status: KolamLayananCapacityStatus =
    statusRaw === 'full' || statusRaw === 'limited' ? statusRaw : 'available';
  const dates = Array.isArray(record.dates)
    ? record.dates.filter((item): item is string => typeof item === 'string')
    : [];

  return {
    week: getNumber(record, 'week') ?? 0,
    weekday: getNumber(record, 'weekday') ?? 0,
    weekdayLabel: getString(record, 'weekdayLabel'),
    dates,
    status,
    booked: getNumber(record, 'booked') ?? 0,
    capacity: getNumber(record, 'capacity') ?? 0,
    remaining: getNumber(record, 'remaining') ?? 0,
  };
}

function normalizeAlertRows(value: unknown): KolamLayananOpsAlert[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(item => {
    const record = asRecord(item);
    const pendingServiceId =
      getString(record, 'pendingServiceId') || null;
    const executionId = getString(record, 'executionId') || null;
    return {
      executionId,
      taskId: getString(record, 'taskId') || null,
      taskKind: getString(record, 'taskKind') || 'dosing',
      pendingServiceId,
      subscriptionId: getString(record, 'subscriptionId') || null,
      visitTitle: getString(record, 'visitTitle') || 'Kunjungan',
      packageTaskCode: getString(record, 'packageTaskCode'),
      scheduledTime: getString(record, 'scheduledTime') || null,
      href: getKolamLayananOpsAlertHref({ pendingServiceId, executionId }),
    };
  });
}

function normalizeVisitSlots(value: unknown): KolamLayananVisitSlot[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const record = asRecord(item);
      const weekday = getNumber(record, 'weekday');
      const time = getString(record, 'time');
      if (weekday == null) {
        return null;
      }
      return { weekday, time };
    })
    .filter((item): item is KolamLayananVisitSlot => item != null);
}

function normalizeVoucherMaterialLines(
  record: Record<string, unknown>,
): KolamLayananVoucherMaterialLine[] {
  const fromPc = Array.isArray(record.productComponents)
    ? record.productComponents.map((row, index) => {
        const item = asRecord(row);
        const product = item.product;
        const productRecord = asRecord(product);
        const productId =
          typeof product === 'string'
            ? product
            : getString(productRecord, '_id') || getString(productRecord, 'id');
        const productName =
          getString(item, 'productName') ||
          getString(productRecord, 'name') ||
          '';
        const chargeRaw = getString(item, 'chargeMode');
        const chargeMode: KolamLayananVoucherMaterialChargeMode =
          chargeRaw === 'hpp_voucher' || chargeRaw === 'client_own'
            ? chargeRaw
            : 'client';
        const inventoryRaw = getString(item, 'inventoryKind');
        return {
          key: `pc-${index}`,
          productId,
          productName,
          quantity: String(
            getNumber(item, 'quantityPerExecution') ??
              getNumber(item, 'quantity') ??
              1,
          ),
          inventoryKind: inventoryRaw === 'raw' ? 'raw' : 'product',
          chargeMode,
          unitPrice: String(getNumber(item, 'unitPrice') ?? 0),
          stockFulfilledAt: getString(item, 'stockFulfilledAt') || null,
        } satisfies KolamLayananVoucherMaterialLine;
      })
    : [];

  const fromAddon = Array.isArray(record.addonProducts)
    ? record.addonProducts.map((row, index) => {
        const item = asRecord(row);
        const product = item.product;
        const productRecord = asRecord(product);
        const productId =
          typeof product === 'string'
            ? product
            : getString(productRecord, '_id') || getString(productRecord, 'id');
        const chargeRaw = getString(item, 'chargeMode');
        const chargeMode: KolamLayananVoucherMaterialChargeMode =
          chargeRaw === 'hpp_internal' ? 'hpp_voucher' : 'client';
        return {
          key: `legacy-addon-${index}`,
          productId,
          productName: getString(item, 'productName') || getString(productRecord, 'name'),
          quantity: String(getNumber(item, 'quantity') ?? 1),
          inventoryKind: 'product' as const,
          chargeMode,
          unitPrice: String(getNumber(item, 'unitPrice') ?? 0),
          stockFulfilledAt: getString(item, 'stockFulfilledAt') || null,
        } satisfies KolamLayananVoucherMaterialLine;
      })
    : [];

  return [...fromPc, ...fromAddon];
}

export function normalizeKolamLayananVoucherDetail(
  payload: unknown,
): KolamLayananVoucherDetail {
  const record = asRecord(unwrapData(payload));
  const service = asRecord(record.service);
  const sale = asRecord(record.sale);
  const customer = asRecord(sale.customer);
  const subscription = asRecord(record.subscription);
  const visitAssigned = record.visitAssignedTo;
  const visitAssignedRecord = asRecord(visitAssigned);
  const visitUser = asRecord(record.visitAssignedToUser);

  const customerId =
    getString(customer, '_id') ||
    getString(customer, 'id') ||
    (typeof sale.customer === 'string' ? sale.customer : '') ||
    null;

  const visitAssignedToId =
    typeof visitAssigned === 'string'
      ? visitAssigned
      : getString(visitAssignedRecord, '_id') ||
        getString(visitAssignedRecord, 'id') ||
        null;

  const visitAssignedToName =
    getString(visitUser, 'displayName') ||
    [
      getString(visitAssignedRecord, 'first_name'),
      getString(visitAssignedRecord, 'last_name'),
    ]
      .filter(Boolean)
      .join(' ') ||
    getString(visitAssignedRecord, 'username') ||
    null;

  const scheduleProposedByRaw = getString(record, 'scheduleProposedBy');
  const scheduleProposedBy =
    scheduleProposedByRaw === 'client' || scheduleProposedByRaw === 'staff'
      ? scheduleProposedByRaw
      : null;

  const enclosureRecord = asRecord(
    asRecord(record.initiatedDosingId).enclosure ??
      asRecord(record.initiatedMaintenanceId).enclosure,
  );
  const status = getString(record, 'status') || 'pending';

  return {
    id: getString(record, '_id') || getString(record, 'id'),
    serviceSerial: getString(record, 'serviceSerial') || '—',
    invoiceCode:
      getString(record, 'invoiceCode') ||
      getString(sale, 'invoiceCode') ||
      '—',
    status,
    packageCode: getString(record, 'packageCode') || '—',
    serviceId:
      getString(service, '_id') ||
      getString(service, 'id') ||
      (typeof record.service === 'string' ? record.service : '') ||
      null,
    serviceName: getString(service, 'name') || '—',
    customerId: customerId || null,
    customerName: getString(customer, 'name') || '—',
    saleId:
      getString(sale, '_id') ||
      getString(sale, 'id') ||
      (typeof record.sale === 'string' ? record.sale : '') ||
      null,
    taskType: getString(record, 'taskType') || getString(service, 'taskType') || null,
    visitsPerMonth: getNumber(record, 'visitsPerMonth'),
    purchasedAt: getString(record, 'purchasedAt') || null,
    initiatedAt: getString(record, 'initiatedAt') || null,
    quantity: getNumber(record, 'quantity'),
    purchaseDimensions: resolveVoucherPurchaseDimensions(record, sale),
    purchaseEnclosureTypes: resolveVoucherPurchaseEnclosureTypes(
      record,
      service,
      status,
    ),
    contractDurationValue: getNumber(record, 'contractDurationValue'),
    contractDurationUnit: getString(record, 'contractDurationUnit') || null,
    proposedVisitSlots: normalizeVisitSlots(record.proposedVisitSlots),
    scheduleProposedBy,
    visitAssignedToId,
    visitAssignedToName,
    materialLines: normalizeVoucherMaterialLines(record),
    subscriptionId:
      getString(subscription, '_id') ||
      getString(subscription, 'id') ||
      (typeof record.subscription === 'string' ? record.subscription : '') ||
      null,
    subscriptionNumber: getString(subscription, 'subscriptionNumber') || null,
    initiatedDosingId: getIdFromMaybeRef(record.initiatedDosingId),
    initiatedMaintenanceId: getIdFromMaybeRef(record.initiatedMaintenanceId),
    enclosureId: getIdFromMaybeRef(enclosureRecord) || null,
    enclosureName:
      getString(enclosureRecord, 'enclosure_name') ||
      getString(enclosureRecord, 'name') ||
      null,
    enclosureType: getString(enclosureRecord, 'enclosure_type') || null,
    initiated: status === 'initiated',
    raw: payload,
  };
}

export function normalizeKolamLayananScheduleRequirements(
  payload: unknown,
): KolamLayananScheduleRequirements {
  const record = asRecord(unwrapData(payload));
  const visitUser = asRecord(record.visitAssignedToUser);
  const scheduleProposedByRaw = getString(record, 'scheduleProposedBy');
  return {
    visitsPerMonth: getNumber(record, 'visitsPerMonth'),
    visitsPerWeek: getNumber(record, 'visitsPerWeek'),
    requiresScheduleFlow: getBoolean(record, 'requiresScheduleFlow') ?? false,
    status: getString(record, 'status') || 'pending',
    proposedVisitSlots: normalizeVisitSlots(record.proposedVisitSlots),
    scheduleProposedBy:
      scheduleProposedByRaw === 'client' || scheduleProposedByRaw === 'staff'
        ? scheduleProposedByRaw
        : null,
    scheduleApprovedByStaffAt:
      getString(record, 'scheduleApprovedByStaffAt') || null,
    scheduleApprovedByClientAt:
      getString(record, 'scheduleApprovedByClientAt') || null,
    visitAssignedTo:
      getString(record, 'visitAssignedTo') ||
      (typeof record.visitAssignedTo === 'string'
        ? record.visitAssignedTo
        : getString(asRecord(record.visitAssignedTo), '_id')) ||
      null,
    visitAssignedToDisplayName: getString(visitUser, 'displayName') || null,
  };
}

export function normalizeKolamLayananTermsContext(
  payload: unknown,
): KolamLayananTermsContext {
  const record = asRecord(unwrapData(payload));
  const templatesRaw = Array.isArray(record.templates) ? record.templates : [];
  return {
    pendingServiceId:
      getString(record, 'pendingServiceId') || getString(record, '_id'),
    status: getString(record, 'status'),
    required: getBoolean(record, 'required') ?? false,
    allAccepted: getBoolean(record, 'allAccepted') ?? false,
    customerId: getString(record, 'customerId') || null,
    templates: templatesRaw.map(item => {
      const row = asRecord(item);
      return {
        termsTemplateId:
          getString(row, 'termsTemplateId') || getString(row, '_id'),
        title: getString(row, 'title') || 'Syarat & ketentuan',
        version: getNumber(row, 'version') ?? 1,
        content: getString(row, 'content'),
        accepted: getBoolean(row, 'accepted') ?? false,
        acceptedAt: getString(row, 'acceptedAt') || null,
      };
    }),
  };
}

function normalizeTaskUserName(value: unknown): string | null {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    return value.trim() || null;
  }
  const record = asRecord(value);
  const display = getString(record, 'displayName');
  if (display) {
    return display;
  }
  const name = [getString(record, 'first_name'), getString(record, 'last_name')]
    .filter(Boolean)
    .join(' ')
    .trim();
  if (name) {
    return name;
  }
  return getString(record, 'username') || getString(record, 'name') || null;
}

function isValidPurchaseDim(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function normalizePurchaseVolumeDimensions(
  value: unknown,
): KolamLayananPurchaseVolumeDimensions | null {
  const record = asRecord(value);
  const length = getNumber(record, 'length');
  const width = getNumber(record, 'width');
  const height = getNumber(record, 'height');
  if (
    !isValidPurchaseDim(length) ||
    !isValidPurchaseDim(width) ||
    !isValidPurchaseDim(height)
  ) {
    return null;
  }
  let unitLabel = getString(record, 'unitLabel');
  if (!unitLabel) {
    const unit = record.unit;
    if (typeof unit === 'string') {
      unitLabel = unit.trim();
    } else {
      const unitRecord = asRecord(unit);
      unitLabel =
        getString(unitRecord, 'initial') || getString(unitRecord, 'name') || '';
    }
  }
  return { length, width, height, unitLabel };
}

/** FE resolve-voucher-purchase-dimensions. */
function resolveVoucherPurchaseDimensions(
  record: Record<string, unknown>,
  sale: Record<string, unknown>,
): KolamLayananPurchaseVolumeDimensions | null {
  const direct = normalizePurchaseVolumeDimensions(
    record.purchaseVolumeDimensions,
  );
  if (direct) {
    return direct;
  }
  const idx = getNumber(record, 'saleItemIndex');
  const items = Array.isArray(sale.items) ? sale.items : [];
  if (idx != null && idx >= 0 && items[idx]) {
    return normalizePurchaseVolumeDimensions(
      asRecord(items[idx]).serviceVolumeDimensions,
    );
  }
  return null;
}

function normalizeEnclosureTypeList(value: unknown): string[] {
  const items = Array.isArray(value) ? value : value != null ? [value] : [];
  const out: string[] = [];
  for (const item of items) {
    const text = String(item ?? '').trim();
    if (
      text &&
      (KOLAM_LAYANAN_ENCLOSURE_TYPE_OPTIONS as readonly string[]).includes(
        text,
      ) &&
      !out.includes(text)
    ) {
      out.push(text);
    }
  }
  return out;
}

/** FE enclosureTypesFromPending (subset). */
function resolveVoucherPurchaseEnclosureTypes(
  record: Record<string, unknown>,
  service: Record<string, unknown>,
  status: string,
): string[] {
  const fromApi = normalizeEnclosureTypeList(record.effectiveEnclosureTypes);
  if (fromApi.length) {
    return fromApi;
  }
  const fromServiceArray = normalizeEnclosureTypeList(service.enclosureTypes);
  const fromService =
    fromServiceArray.length > 0
      ? fromServiceArray
      : normalizeEnclosureTypeList(service.enclosureType);
  const fromSnapshot = [
    ...normalizeEnclosureTypeList(record.purchaseEnclosureTypes),
    ...normalizeEnclosureTypeList(record.purchaseEnclosureType),
  ].filter((item, index, arr) => arr.indexOf(item) === index);

  if (status === 'initiated') {
    return fromSnapshot.length ? fromSnapshot : fromService;
  }
  if (fromService.length) {
    return fromService;
  }
  return fromSnapshot;
}

function getIdFromMaybeRef(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  const record = asRecord(value);
  return getString(record, '_id') || getString(record, 'id') || null;
}

export function normalizeKolamLayananExecutionDetail(
  payload: unknown,
): KolamLayananExecutionDetail {
  const record = asRecord(payload);
  const id =
    getString(record, '_id') ||
    getString(record, 'id') ||
    (record._id &&
    typeof record._id === 'object' &&
    '$oid' in (record._id as object)
      ? String((record._id as { $oid: string }).$oid)
      : '');

  return {
    id,
    status: getString(record, 'status') || 'pending',
    reviewStatus: getString(record, 'reviewStatus') || null,
    visitVerificationStatus:
      getString(record, 'visitVerificationStatus') || 'not_applicable',
    scheduledTime:
      getString(record, 'scheduled_time') ||
      getString(record, 'scheduledTime') ||
      null,
    estimatedAt: getString(record, 'estimatedAt') || null,
    executionTime:
      getString(record, 'execution_time') ||
      getString(record, 'executionTime') ||
      null,
    executionNotes: getString(record, 'executionNotes'),
    notes: getString(record, 'notes'),
    progressStep: getString(record, 'progressStep') || null,
    packageTaskCode: getString(record, 'packageTaskCode') || null,
    visitSource: getString(record, 'visitSource') || null,
    subscriptionId: getIdFromMaybeRef(record.subscription),
    assignedToName: normalizeTaskUserName(record.assignedTo),
    executedByName: normalizeTaskUserName(record.executed_by ?? record.executedBy),
    supervisorVerifiedAt: getString(record, 'supervisorVerifiedAt') || null,
    supervisorVerifiedByName: normalizeTaskUserName(
      record.supervisorVerifiedBy,
    ),
    customerVerifiedAt: getString(record, 'customerVerifiedAt') || null,
    customerVerificationConfirmed: getBoolean(
      record,
      'customerVerificationConfirmed',
    ),
    customerVerificationNote: getString(record, 'customerVerificationNote'),
    rejectionReason: getString(record, 'rejectionReason'),
    rejectionDecision: getString(record, 'rejectionDecision') || null,
    checkInAt: getString(record, 'checkInAt') || null,
  };
}

export function normalizeKolamLayananTaskDetail(
  payload: unknown,
  taskType: 'dosing' | 'maintenance',
): KolamLayananTaskDetail {
  const record = asRecord(unwrapData(payload));
  const executionsRaw = Array.isArray(record.executions)
    ? record.executions
    : [];
  return {
    id: getString(record, '_id') || getString(record, 'id'),
    taskType,
    name:
      getString(record, 'name') ||
      getString(record, 'title') ||
      (taskType === 'dosing' ? 'Tugas dosing' : 'Tugas pemeliharaan'),
    executions: executionsRaw
      .map(normalizeKolamLayananExecutionDetail)
      .filter(item => Boolean(item.id)),
  };
}

export function findKolamLayananExecutionInTask(
  task: KolamLayananTaskDetail | null | undefined,
  executionId: string,
): KolamLayananExecutionDetail | null {
  if (!task || !executionId) {
    return null;
  }
  return (
    task.executions.find(
      item => item.id === executionId || item.id.endsWith(executionId),
    ) ?? null
  );
}

export function normalizeKolamLayananServiceSpawnTaskResult(
  payload: unknown,
): KolamLayananServiceSpawnTaskResult {
  const record = asRecord(payload);
  const taskPayload = unwrapData(payload);
  const taskRecord = asRecord(taskPayload);
  const taskId =
    getString(taskRecord, '_id') ||
    getString(taskRecord, 'id') ||
    getIdFromMaybeRef(taskPayload) ||
    '';
  const created =
    typeof record.created === 'boolean'
      ? record.created
      : getBoolean(record, 'created') ?? false;
  return {
    taskId,
    created,
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

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
  sellable: boolean;
  commissionEnabled: boolean;
  commissionType: 'percentage' | 'fixed';
  commissionValue: number;
  memberPointsEnabled: boolean;
  memberPoints: number;
  contractDurationValue: number | null;
  contractDurationUnit: KolamLayananContractDurationUnit | null;
  createdAt?: string;
  updatedAt?: string;
  raw: unknown;
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
}

export interface KolamLayananPendingListResult {
  items: KolamLayananPendingService[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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

export const KOLAM_LAYANAN_PENDING_STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu',
  awaiting_staff_approval: 'Menunggu staf',
  awaiting_client_approval: 'Menunggu klien',
  schedule_approved: 'Jadwal disetujui',
  initiated: 'Diaktifkan',
  cancelled: 'Dibatalkan',
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

export function getKolamLayananPendingStatusLabel(status?: string | null) {
  if (!status) {
    return '—';
  }
  return KOLAM_LAYANAN_PENDING_STATUS_LABEL[status] || status;
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
    sellable: getBoolean(record, 'sellable') ?? true,
    commissionEnabled: getBoolean(record, 'commissionEnabled') ?? false,
    commissionType: commissionTypeRaw === 'fixed' ? 'fixed' : 'percentage',
    commissionValue: getNumber(record, 'commissionValue') ?? 0,
    memberPointsEnabled: getBoolean(memberPoints, 'enabled') ?? false,
    memberPoints: getNumber(memberPoints, 'points') ?? 0,
    contractDurationValue: getNumber(record, 'contractDurationValue'),
    contractDurationUnit,
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

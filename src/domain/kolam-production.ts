/**
 * Production manufacturing domain — mirror FE `types/production.ts` +
 * BE `controllers/production/production.controllers.js`.
 *
 * KNOWN GAPS (RNW vs FE Kolam — do not invent BE fixes):
 * - Species create UI mirrors FE; BE may reject species production without product components.
 * - No legacy PUT `completed` from `in_progress` UI — use submit-check → finalize flow only.
 * - No MaterialDetailSheet, no teranura create target, no in-progress proof upload UI.
 */

export type KolamProductionTargetType =
  | 'product'
  | 'species'
  | 'freyer'
  | 'teranura';

export type KolamProductionStatus =
  | 'waiting_for_po'
  | 'pending'
  | 'in_progress'
  | 'on_check'
  | 'completed'
  | 'cancelled';

export type KolamProductionHistoryStatus =
  | 'created'
  | 'waiting_for_po'
  | 'pending'
  | 'in_progress'
  | 'on_check'
  | 'completed'
  | 'cancelled'
  | 'po_voided'
  | 'po_status_changed'
  | 'cost_recalculated'
  | 'stock_recalculated'
  | 'submitted_for_check'
  | 'finalized_completed'
  | 'finalized_rejected'
  | 'materials_returned'
  | string;

export interface KolamProductionRef {
  id: string;
  name: string;
  sku: string;
  scientificName: string;
  commonName: string;
}

export interface KolamProductionVariantRef {
  id: string;
  tier1Value: string;
  tier2Value: string;
  sku: string;
  price: number;
}

export interface KolamProductionComponentUnit {
  id: string;
  initial: string;
  name: string;
}

export interface KolamProductionComponentUsed {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productCode: string;
  variant: KolamProductionVariantRef | null;
  quantity: number;
  unit: KolamProductionComponentUnit | null;
  currentStock: number | null;
  available: number | null;
  sufficient: boolean | null;
  shortage: number | null;
  actualConsumed: number | null;
  returnedQuantity: number | null;
  unitPrice: number;
}

export interface KolamProductionUserRef {
  id: string;
  email: string;
  name: string;
}

export interface KolamProductionLinkedPO {
  poId: string;
  poCode: string;
  vendorName: string;
  status: string;
  statusUpdatedAt: string;
  createdAt: string;
  finalTotal: number | null;
  items: KolamProductionLinkedPOItem[];
}

export interface KolamProductionLinkedPOItem {
  id: string;
  title: string;
  sku: string;
  quantity: number;
  receivedQuantity: number | null;
  unitPrice: number;
}

export interface KolamProductionHistory {
  id: string;
  status: KolamProductionHistoryStatus;
  note: string;
  changedByName: string;
  changedAt: string;
  poSnapshot: KolamProductionPOSnapshot | null;
  recalcDelta: KolamProductionRecalcDelta | null;
}

export interface KolamProductionPOSnapshot {
  poCode: string;
  vendor: string;
  finalTotal: number;
  status: string;
  items: Array<{
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
}

export interface KolamProductionRecalcDelta {
  estimatedCostBefore: number;
  estimatedCostAfter: number;
  stockChanges: Array<{
    productId: string;
    productName: string;
    before: number | null;
    after: number | null;
    delta: number | null;
  }>;
}

export interface KolamProduction {
  id: string;
  targetType: KolamProductionTargetType | string;
  product: KolamProductionRef | null;
  species: KolamProductionRef | null;
  freyer: KolamProductionRef | null;
  teranura: KolamProductionRef | null;
  variant: KolamProductionVariantRef | null;
  quantity: number;
  plannedQuantity: number;
  completedQuantity: number;
  estimatedCost: number;
  actualCost: number;
  assignedTo: KolamProductionUserRef | null;
  status: KolamProductionStatus | string;
  batchId: string;
  inProgressProof: string;
  inProgressProofUploadedAt: string;
  completedProof: string;
  completedProofUploadedAt: string;
  componentsUsed: KolamProductionComponentUsed[];
  productionDate: string;
  startAt: string;
  startedAt: string;
  endAt: string;
  description: string;
  photos: string[];
  productionHistories: KolamProductionHistory[];
  createdByName: string;
  serialEnabled: boolean;
  linkedPurchaseOrders: KolamProductionLinkedPO[];
  insufficientNote: string;
  waitingForPoSince: string;
  readyAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface KolamProductionListFilters {
  search: string;
  status: KolamProductionStatus | '';
  startDate: string;
  endDate: string;
  page: number;
  limit: number;
}

export interface KolamProductionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface KolamProductionListResult {
  data: KolamProduction[];
  pagination: KolamProductionPagination;
}

export interface KolamProductForProductionComponent {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  stock: number;
  price: number;
  unitLabel: string;
}

export interface KolamProductForProductionVariant {
  id: string;
  tier1Value: string;
  tier2Value: string;
  sku: string;
  stock: number;
  price: number;
  components: KolamProductForProductionComponent[];
}

export interface KolamProductForProduction {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  photo: string;
  unitLabel: string;
  estimatedCostPerUnit: number;
  components: KolamProductForProductionComponent[];
  variants: KolamProductForProductionVariant[];
  variantConfig: { tier1Name: string; tier2Name: string };
}

export interface KolamProductionStaffAssignee {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  displayName: string;
}

export interface KolamProductionSerial {
  id: string;
  serialNumber: string;
  productType: string;
  productionDate: string;
  qrCode: string;
}

export interface KolamProductionFormComponentLine {
  key: string;
  productId: string;
  productName: string;
  quantity: string;
}

export interface KolamProductionFormState {
  id?: string;
  targetType: 'product' | 'species';
  serialEnabled: boolean;
  productId: string;
  speciesId: string;
  variantId: string;
  quantity: string;
  description: string;
  assignedToId: string;
  productionDate: string;
  components: KolamProductionFormComponentLine[];
}

export interface KolamCreateProductionComponentBody {
  product: string;
  quantity: number;
  variant?: string;
}

export type KolamCreateProductionBody =
  | {
      targetType?: 'product' | 'freyer';
      serialEnabled?: boolean;
      product: string;
      variant?: string;
      quantity: number;
      description?: string;
      assignedTo?: string;
      productionDate?: string;
    }
  | {
      targetType: 'species';
      serialEnabled?: boolean;
      species: string;
      variant?: string;
      quantity: number;
      description?: string;
      assignedTo?: string;
      productionDate?: string;
      components: KolamCreateProductionComponentBody[];
    }
  | {
      targetType: 'freyer';
      serialEnabled?: boolean;
      freyer: string;
      variant?: string;
      quantity: number;
      description?: string;
      assignedTo?: string;
      productionDate?: string;
      components: KolamCreateProductionComponentBody[];
    };

export interface KolamCreateProductionWithPOBody {
  product: string;
  serialEnabled?: boolean;
  variant?: string;
  quantity: number;
  description: string;
  assignedTo: string;
  productionDate?: string;
}

export interface KolamUpdateProductionBody {
  description?: string;
  quantity?: number;
  assignedTo?: string;
  productionDate?: string | null;
  status?: KolamProductionStatus;
  note?: string;
  cancelLinkedDraftPOs?: boolean;
}

export interface KolamSubmitCheckBreakdownEntry {
  componentId: string;
  actualConsumed: number;
  returnedQuantity: number;
}

export interface KolamSubmitCheckBody {
  completedQuantity: number;
  componentsBreakdown: KolamSubmitCheckBreakdownEntry[];
  note?: string;
  completedProofLocalUri?: string;
}

export interface KolamFinalizeProductionBody {
  decision: 'accept' | 'reject';
  note?: string;
}

/* ──────────────────────────────────────────
   Routes
   ──────────────────────────────────────────*/

export const KOLAM_PRODUCTION_ROOT = '/production';

export function createInitialKolamProductionListFilters(
  route: string,
): KolamProductionListFilters {
  const query = parseProductionRouteQuery(route);
  return {
    search: query.search ?? '',
    status: isKolamProductionStatus(query.status) ? query.status : '',
    startDate: query.startDate ?? '',
    endDate: query.endDate ?? '',
    page: Math.max(1, Number(query.page || '1') || 1),
    limit: 10,
  };
}

export function isKolamProductionRoute(route: string) {
  const path = normalizeProductionRoutePath(route);
  return (
    path === KOLAM_PRODUCTION_ROOT || path.startsWith(`${KOLAM_PRODUCTION_ROOT}/`)
  );
}

export function isKolamProductionListRoute(route: string) {
  return normalizeProductionRoutePath(route) === KOLAM_PRODUCTION_ROOT;
}

export function isKolamProductionCreateRoute(route: string) {
  return normalizeProductionRoutePath(route) === `${KOLAM_PRODUCTION_ROOT}/create`;
}

export function isKolamProductionDetailRoute(route: string) {
  return Boolean(getKolamProductionRouteId(route));
}

export function isKolamProductionEditRoute(route: string) {
  return Boolean(getKolamProductionEditRouteId(route));
}

export function getKolamProductionRouteId(route: string) {
  const path = normalizeProductionRoutePath(route);
  if (
    path === KOLAM_PRODUCTION_ROOT ||
    path.endsWith('/create') ||
    path.endsWith('/edit')
  ) {
    return null;
  }
  const match = /^\/production\/([^/]+)$/.exec(path);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function getKolamProductionEditRouteId(route: string) {
  const path = normalizeProductionRoutePath(route);
  const match = /^\/production\/([^/]+)\/edit$/.exec(path);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function getKolamProductionBreadcrumbPath(
  mode: 'list' | 'detail' | 'edit' | 'new',
  production?: Pick<KolamProduction, 'id' | 'batchId'> | null,
) {
  if (mode === 'new') {
    return `${KOLAM_PRODUCTION_ROOT}/create`;
  }
  if ((mode === 'detail' || mode === 'edit') && production?.id) {
    return mode === 'edit'
      ? `${KOLAM_PRODUCTION_ROOT}/${production.id}/edit`
      : `${KOLAM_PRODUCTION_ROOT}/${production.id}`;
  }
  return KOLAM_PRODUCTION_ROOT;
}

/* ──────────────────────────────────────────
   Labels & status helpers
   ──────────────────────────────────────────*/

export const KOLAM_PRODUCTION_STATUS_LABELS: Record<KolamProductionStatus, string> = {
  waiting_for_po: 'Menunggu PO',
  pending: 'Menunggu',
  in_progress: 'Sedang berjalan',
  on_check: 'Pemeriksaan',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

export function getKolamProductionStatusLabel(status?: string) {
  if (isKolamProductionStatus(status)) {
    return KOLAM_PRODUCTION_STATUS_LABELS[status];
  }
  return status?.trim().replace(/_/g, ' ') || '—';
}

export const KOLAM_PRODUCTION_HISTORY_STATUS_LABELS: Record<string, string> = {
  created: 'Dibuat',
  waiting_for_po: 'Menunggu PO',
  pending: 'Menunggu',
  in_progress: 'Sedang berjalan',
  on_check: 'Pemeriksaan',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  po_voided: 'PO dihapus',
  po_status_changed: 'Status PO berubah',
  cost_recalculated: 'Biaya dihitung ulang',
  stock_recalculated: 'Stok dihitung ulang',
  submitted_for_check: 'Dikirim untuk Pemeriksaan',
  finalized_completed: 'Finalisasi · Selesai',
  finalized_rejected: 'Finalisasi · Ditolak',
  materials_returned: 'Bahan Dikembalikan',
};

export function getKolamProductionHistoryStatusLabel(status?: string) {
  const normalized = status?.trim() ?? '';
  return (
    KOLAM_PRODUCTION_HISTORY_STATUS_LABELS[normalized] ||
    normalized.replace(/_/g, ' ') ||
    '—'
  );
}

const KOLAM_PRODUCTION_STATUS_SET = new Set<KolamProductionStatus>([
  'waiting_for_po',
  'pending',
  'in_progress',
  'on_check',
  'completed',
  'cancelled',
]);

export function isKolamProductionStatus(
  value?: string | null,
): value is KolamProductionStatus {
  return Boolean(value) && KOLAM_PRODUCTION_STATUS_SET.has(value as KolamProductionStatus);
}

/** Mirror FE `production-status-updater.tsx` forward transitions (cancel is separate). */
const KOLAM_PRODUCTION_ALLOWED_NEXT: Record<
  KolamProductionStatus,
  KolamProductionStatus[]
> = {
  waiting_for_po: [],
  pending: ['in_progress'],
  in_progress: [],
  on_check: [],
  completed: [],
  cancelled: [],
};

export function getAllowedNextProductionStatuses(
  current: KolamProductionStatus | string,
): KolamProductionStatus[] {
  if (!isKolamProductionStatus(current)) {
    return [];
  }
  return [...KOLAM_PRODUCTION_ALLOWED_NEXT[current]];
}

export function canCancelKolamProduction(status?: string) {
  return (
    status === 'waiting_for_po' ||
    status === 'pending' ||
    status === 'in_progress'
  );
}

export function canRecalculateKolamProduction(status?: string) {
  return status !== 'completed' && status !== 'cancelled';
}

export function canEditKolamProduction(status?: string) {
  return (
    status !== 'cancelled' &&
    status !== 'completed' &&
    status !== 'in_progress' &&
    status !== 'on_check'
  );
}

/* ──────────────────────────────────────────
   Permissions — resource `production`
   ──────────────────────────────────────────*/

export type KolamProductionPermissionAction =
  | 'view'
  | 'create'
  | 'update'
  | 'delete';

export type KolamProductionPermissionEntry = {
  resource?: string;
  actions?: string[];
};

export function hasKolamProductionPermission(
  permissions: KolamProductionPermissionEntry[] | null | undefined,
  action: KolamProductionPermissionAction,
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
      (resource === 'production' || resource === '*') &&
      (actions.includes(wanted) || actions.includes('*'))
    );
  });
}

/* ──────────────────────────────────────────
   Display helpers
   ──────────────────────────────────────────*/

export function getKolamProductionTargetLabel(
  production: Pick<
    KolamProduction,
    'targetType' | 'product' | 'species' | 'freyer' | 'teranura'
  >,
) {
  const type = production.targetType ?? 'product';
  if (type === 'species') {
    const s = production.species;
    return s?.scientificName || s?.commonName || s?.name || '—';
  }
  const prod =
    production.product ?? production.freyer ?? production.teranura ?? null;
  return prod?.name || '—';
}

export function getKolamProductionTargetTypeLabel(targetType?: string) {
  if (targetType === 'species') {
    return 'Spesies';
  }
  if (targetType === 'freyer') {
    return 'Freyer';
  }
  if (targetType === 'teranura') {
    return 'Teranura';
  }
  return 'Produk';
}

export function getKolamProductionTargetHref(
  production: Pick<
    KolamProduction,
    'targetType' | 'product' | 'species' | 'freyer' | 'teranura'
  >,
) {
  const type = production.targetType ?? 'product';
  if (type === 'species' && production.species?.id) {
    return `/species/${production.species.id}`;
  }
  if (type === 'freyer' && production.freyer?.id) {
    return `/products/${production.freyer.id}`;
  }
  if (type === 'teranura' && production.teranura?.id) {
    return `/teranura/${production.teranura.id}`;
  }
  if (production.product?.id) {
    return `/products/${production.product.id}`;
  }
  return null;
}

export function getKolamProductionVariantLabel(
  variant: KolamProductionVariantRef | null | undefined,
) {
  if (!variant) {
    return '—';
  }
  return (
    [variant.tier1Value, variant.tier2Value]
      .map(part => part?.trim())
      .filter(Boolean)
      .join(' – ') ||
    variant.sku ||
    '—'
  );
}

export function createEmptyKolamProductionFormState(): KolamProductionFormState {
  return {
    targetType: 'product',
    serialEnabled: false,
    productId: '',
    speciesId: '',
    variantId: '',
    quantity: '1',
    description: '',
    assignedToId: '',
    productionDate: new Date().toISOString().slice(0, 10),
    components: [{ key: 'c-0', productId: '', productName: '', quantity: '1' }],
  };
}

export function createKolamProductionFormStateFromProduction(
  production: KolamProduction,
): KolamProductionFormState {
  const empty = createEmptyKolamProductionFormState();
  const targetType =
    production.targetType === 'species' ? 'species' : 'product';
  return {
    ...empty,
    id: production.id,
    targetType,
    serialEnabled: production.serialEnabled,
    productId: production.product?.id ?? production.freyer?.id ?? '',
    speciesId: production.species?.id ?? '',
    variantId: production.variant?.id ?? '',
    quantity: String(production.plannedQuantity || production.quantity || 1),
    description: production.description,
    assignedToId: production.assignedTo?.id ?? '',
    productionDate: production.productionDate
      ? production.productionDate.slice(0, 10)
      : empty.productionDate,
    components: production.componentsUsed.map((line, index) => ({
      key: line.id || `c-${index}`,
      productId: line.productId,
      productName: line.productName,
      quantity: String(line.quantity),
    })),
  };
}

export function buildCreateProductionBody(
  form: KolamProductionFormState,
): KolamCreateProductionBody {
  const quantity = Math.max(1, Number(form.quantity) || 1);
  const base = {
    quantity,
    description: form.description.trim() || undefined,
    assignedTo: form.assignedToId || undefined,
    productionDate: form.productionDate || undefined,
    serialEnabled: form.serialEnabled || undefined,
    ...(form.variantId ? { variant: form.variantId } : {}),
  };

  if (form.targetType === 'species') {
    return {
      targetType: 'species',
      species: form.speciesId,
      components: form.components
        .filter(line => line.productId && Number(line.quantity) > 0)
        .map(line => ({
          product: line.productId,
          quantity: Number(line.quantity) || 0,
        })),
      ...base,
    };
  }

  // Mirror FE create form: serial product still posts `product` + targetType freyer.
  // Do not send bare `freyer` id — BE createProduction requires `product`.
  return {
    targetType: form.serialEnabled ? 'freyer' : 'product',
    product: form.productId,
    ...base,
  };
}

export function buildUpdateProductionBody(
  form: KolamProductionFormState,
): KolamUpdateProductionBody {
  return {
    description: form.description.trim() || undefined,
    quantity: Number(form.quantity) || undefined,
    assignedTo: form.assignedToId || undefined,
    productionDate: form.productionDate || null,
  };
}

/* ──────────────────────────────────────────
   Normalize
   ──────────────────────────────────────────*/

export function normalizeKolamProduction(payload: unknown): KolamProduction {
  const root = asRecord(payload);
  const record = Object.keys(asRecord(root.data)).length
    ? asRecord(root.data)
    : root;

  const targetType =
    getString(record, 'targetType') ||
    (record.species ? 'species' : 'product');

  return {
    id: getString(record, '_id') || getString(record, 'id'),
    targetType,
    product: normalizeProductionRef(record.product, 'name'),
    species: normalizeProductionSpeciesRef(record.species),
    freyer: normalizeProductionRef(record.freyer, 'name'),
    teranura: normalizeProductionRef(record.teranura, 'name'),
    variant: normalizeProductionVariantRef(record.variant),
    quantity: getNumber(record, 'quantity') ?? 0,
    plannedQuantity:
      getNumber(record, 'plannedQuantity') ?? getNumber(record, 'quantity') ?? 0,
    completedQuantity: getNumber(record, 'completedQuantity') ?? 0,
    estimatedCost: getNumber(record, 'estimatedCost') ?? 0,
    actualCost: getNumber(record, 'actualCost') ?? 0,
    assignedTo: normalizeProductionUserRef(record.assignedTo),
    status: normalizeProductionStatus(getString(record, 'status')),
    batchId: getString(record, 'batchId'),
    inProgressProof: getString(record, 'inProgressProof'),
    inProgressProofUploadedAt: getString(record, 'inProgressProofUploadedAt'),
    completedProof: getString(record, 'completedProof'),
    completedProofUploadedAt: getString(record, 'completedProofUploadedAt'),
    componentsUsed: normalizeProductionComponents(record.componentsUsed),
    productionDate: getString(record, 'productionDate'),
    startAt: getString(record, 'startAt'),
    startedAt: getString(record, 'startedAt'),
    endAt: getString(record, 'endAt'),
    description: getString(record, 'description'),
    photos: normalizeStringList(record.photos),
    productionHistories: normalizeProductionHistories(record.productionHistories),
    createdByName: resolveProductionPersonName(record.createdBy),
    serialEnabled: getBoolean(record, 'serialEnabled'),
    linkedPurchaseOrders: normalizeProductionLinkedPOs(record.linkedPurchaseOrders),
    insufficientNote: getString(record, 'insufficientNote'),
    waitingForPoSince: getString(record, 'waitingForPoSince'),
    readyAt: getString(record, 'readyAt'),
    createdAt: getString(record, 'createdAt'),
    updatedAt: getString(record, 'updatedAt'),
  };
}

export function normalizeKolamProductionList(
  payload: unknown,
): KolamProductionListResult {
  const root = asRecord(payload);
  const list: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray(root.data)
    ? root.data
    : [];

  const data = list.map(normalizeKolamProduction);
  return {
    data,
    pagination: normalizeProductionPagination(root.pagination, data.length),
  };
}

export function normalizeKolamProductsForProduction(
  payload: unknown,
): KolamProductForProduction[] {
  const root = asRecord(payload);
  const list = Array.isArray(root.data) ? root.data : [];
  return list
    .map(normalizeProductForProduction)
    .filter((item): item is KolamProductForProduction => Boolean(item));
}

export function normalizeKolamProductionStaffAssignees(
  payload: unknown,
): KolamProductionStaffAssignee[] {
  const root = asRecord(payload);
  const list = Array.isArray(root.data) ? root.data : [];
  return list.map(item => {
    const record = asRecord(item);
    const firstName = getString(record, 'first_name');
    const lastName = getString(record, 'last_name');
    const displayName =
      [firstName, lastName].filter(Boolean).join(' ').trim() ||
      getString(record, 'name') ||
      getString(record, 'username') ||
      getString(record, 'email');
    return {
      id: getString(record, '_id') || getString(record, 'id'),
      firstName,
      lastName,
      username: getString(record, 'username'),
      email: getString(record, 'email'),
      displayName,
    };
  });
}

export function normalizeKolamProductionSerials(payload: unknown): {
  data: KolamProductionSerial[];
  total: number;
} {
  const root = asRecord(payload);
  const list = Array.isArray(root.data) ? root.data : [];
  return {
    data: list.map(item => {
      const record = asRecord(item);
      return {
        id: getString(record, '_id') || getString(record, 'id'),
        serialNumber: getString(record, 'serialNumber'),
        productType: getString(record, 'productType'),
        productionDate: getString(record, 'productionDate'),
        qrCode: getString(record, 'qrCode'),
      };
    }),
    total: getNumber(root, 'total') ?? list.length,
  };
}

function normalizeProductForProduction(
  value: unknown,
): KolamProductForProduction | null {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  const name = getString(record, 'name');
  if (!id || !name) {
    return null;
  }
  const unitRecord = asRecord(record.units);
  const variantConfig = asRecord(record.variantConfig);
  const photos = normalizeStringList(record.photos);

  return {
    id,
    name,
    sku: getString(record, 'sku'),
    price: getNumber(record, 'price') ?? 0,
    stock: getNumber(record, 'stock') ?? 0,
    photo: photos[0] ?? '',
    unitLabel: getString(unitRecord, 'initial') || getString(unitRecord, 'name'),
    estimatedCostPerUnit: getNumber(record, 'estimatedCostPerUnit') ?? 0,
    components: normalizeProductForProductionComponents(record.components),
    variants: normalizeProductForProductionVariants(record.variants),
    variantConfig: {
      tier1Name: getString(variantConfig, 'tier1Name'),
      tier2Name: getString(variantConfig, 'tier2Name'),
    },
  };
}

function normalizeProductForProductionComponents(
  value: unknown,
): KolamProductForProductionComponent[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(item => {
    const record = asRecord(item);
    const productRecord = asRecord(record.product);
    const unitRecord = asRecord(productRecord.units);
    return {
      productId:
        getString(productRecord, '_id') || getString(productRecord, 'id'),
      productName: getString(productRecord, 'name'),
      productSku: getString(productRecord, 'sku'),
      quantity: getNumber(record, 'quantity') ?? 0,
      stock: getNumber(productRecord, 'stock') ?? 0,
      price: getNumber(productRecord, 'price') ?? 0,
      unitLabel:
        getString(unitRecord, 'initial') || getString(unitRecord, 'name'),
    };
  });
}

function normalizeProductForProductionVariants(
  value: unknown,
): KolamProductForProductionVariant[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const record = asRecord(item);
      const id = getString(record, '_id') || getString(record, 'id');
      if (!id) {
        return null;
      }
      return {
        id,
        tier1Value: getString(record, 'tier1Value'),
        tier2Value: getString(record, 'tier2Value'),
        sku: getString(record, 'sku'),
        stock: getNumber(record, 'stock') ?? 0,
        price: getNumber(record, 'price') ?? 0,
        components: normalizeProductForProductionComponents(
          record.componentOverrides ?? record.components,
        ),
      };
    })
    .filter((item): item is KolamProductForProductionVariant => Boolean(item));
}

function normalizeProductionComponents(
  value: unknown,
): KolamProductionComponentUsed[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(item => {
    const record = asRecord(item);
    const productRecord = asRecord(record.product);
    const productId =
      typeof record.product === 'string'
        ? record.product
        : getString(productRecord, '_id') || getString(productRecord, 'id');
    const unitRecord = asRecord(record.unit);
    const variant = normalizeProductionVariantRef(record.variant);
    const unitPrice =
      variant?.price ??
      getNumber(productRecord, 'price') ??
      getNumber(record, 'unitPrice') ??
      0;

    return {
      id: getString(record, '_id') || getString(record, 'id'),
      productId,
      productName: getString(productRecord, 'name') || productId,
      productSku: getString(productRecord, 'sku'),
      productCode: getString(productRecord, 'productCode'),
      variant,
      quantity: getNumber(record, 'quantity') ?? 0,
      unit:
        getString(unitRecord, 'initial') || getString(unitRecord, 'name')
          ? {
              id: getString(unitRecord, '_id') || getString(unitRecord, 'id'),
              initial: getString(unitRecord, 'initial'),
              name: getString(unitRecord, 'name'),
            }
          : null,
      currentStock: getNumber(record, 'currentStock'),
      available: getNumber(record, 'available'),
      sufficient:
        record.sufficient === true
          ? true
          : record.sufficient === false
          ? false
          : null,
      shortage: getNumber(record, 'shortage'),
      actualConsumed: getNumber(record, 'actualConsumed'),
      returnedQuantity: getNumber(record, 'returnedQuantity'),
      unitPrice,
    };
  });
}

function normalizeProductionLinkedPOs(
  value: unknown,
): KolamProductionLinkedPO[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const record = asRecord(item);
      const poValue = record.po;
      if (poValue == null) {
        return null;
      }
      const poRecord =
        typeof poValue === 'string' ? { _id: poValue } : asRecord(poValue);
      const poId =
        typeof poValue === 'string'
          ? poValue
          : getString(poRecord, '_id') || getString(poRecord, 'id');
      if (!poId) {
        return null;
      }
      const vendorRecord = asRecord(poRecord.vendor);
      const items = Array.isArray(poRecord.items)
        ? poRecord.items.map(poItem => {
            const itemRecord = asRecord(poItem);
            const productRecord = asRecord(itemRecord.product);
            const speciesRecord = asRecord(itemRecord.species);
            const title =
              getString(productRecord, 'name') ||
              getString(speciesRecord, 'commonName') ||
              getString(speciesRecord, 'scientificName') ||
              'Item';
            return {
              id: getString(itemRecord, '_id') || getString(itemRecord, 'id'),
              title,
              sku:
                getString(productRecord, 'sku') ||
                getString(speciesRecord, 'sku'),
              quantity: getNumber(itemRecord, 'quantity') ?? 0,
              receivedQuantity: getNumber(itemRecord, 'receivedQuantity'),
              unitPrice: getNumber(itemRecord, 'unitPrice') ?? 0,
            };
          })
        : [];

      return {
        poId,
        poCode: getString(poRecord, 'poCode') || poId.slice(-6),
        vendorName: getString(vendorRecord, 'name'),
        status:
          getString(poRecord, 'status') || getString(record, 'status') || '',
        statusUpdatedAt: getString(record, 'statusUpdatedAt'),
        createdAt: getString(record, 'createdAt'),
        finalTotal: getNumber(poRecord, 'finalTotal'),
        items,
      };
    })
    .filter((item): item is KolamProductionLinkedPO => Boolean(item));
}

function normalizeProductionHistories(
  value: unknown,
): KolamProductionHistory[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(item => {
    const record = asRecord(item);
    const poSnapshotRecord = asRecord(record.poSnapshot);
    const recalcRecord = asRecord(record.recalcDelta);
    return {
      id: getString(record, '_id') || getString(record, 'id'),
      status: getString(record, 'status') || 'created',
      note: getString(record, 'note'),
      changedByName: resolveProductionPersonName(record.changedBy),
      changedAt: getString(record, 'changedAt'),
      poSnapshot: Object.keys(poSnapshotRecord).length
        ? {
            poCode: getString(poSnapshotRecord, 'poCode'),
            vendor: getString(poSnapshotRecord, 'vendor'),
            finalTotal: getNumber(poSnapshotRecord, 'finalTotal') ?? 0,
            status: getString(poSnapshotRecord, 'status'),
            items: Array.isArray(poSnapshotRecord.items)
              ? poSnapshotRecord.items.map(rawItem => {
                  const itemRecord = asRecord(rawItem);
                  return {
                    productId: getString(itemRecord, 'productId'),
                    productName: getString(itemRecord, 'productName'),
                    sku: getString(itemRecord, 'sku'),
                    quantity: getNumber(itemRecord, 'quantity') ?? 0,
                    unitPrice: getNumber(itemRecord, 'unitPrice') ?? 0,
                    subtotal: getNumber(itemRecord, 'subtotal') ?? 0,
                  };
                })
              : [],
          }
        : null,
      recalcDelta: Object.keys(recalcRecord).length
        ? {
            estimatedCostBefore: getNumber(recalcRecord, 'estimatedCostBefore') ?? 0,
            estimatedCostAfter: getNumber(recalcRecord, 'estimatedCostAfter') ?? 0,
            stockChanges: Array.isArray(recalcRecord.stockChanges)
              ? recalcRecord.stockChanges.map(rawChange => {
                  const changeRecord = asRecord(rawChange);
                  return {
                    productId: getString(changeRecord, 'productId'),
                    productName: getString(changeRecord, 'productName'),
                    before: getNumber(changeRecord, 'before'),
                    after: getNumber(changeRecord, 'after'),
                    delta: getNumber(changeRecord, 'delta'),
                  };
                })
              : [],
          }
        : null,
    };
  });
}

function normalizeProductionRef(
  value: unknown,
  nameField: string,
): KolamProductionRef | null {
  if (value == null || value === '') {
    return null;
  }
  if (typeof value === 'string') {
    return {
      id: value,
      name: '',
      sku: '',
      scientificName: '',
      commonName: '',
    };
  }
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  if (!id) {
    return null;
  }
  return {
    id,
    name: getString(record, nameField),
    sku: getString(record, 'sku'),
    scientificName: getString(record, 'scientificName'),
    commonName: getString(record, 'commonName'),
  };
}

function normalizeProductionSpeciesRef(value: unknown): KolamProductionRef | null {
  const ref = normalizeProductionRef(value, 'scientificName');
  if (!ref) {
    return null;
  }
  if (!ref.name) {
    ref.name = ref.commonName || ref.scientificName;
  }
  return ref;
}

function normalizeProductionVariantRef(
  value: unknown,
): KolamProductionVariantRef | null {
  if (value == null || value === '') {
    return null;
  }
  if (typeof value === 'string') {
    return { id: value, tier1Value: '', tier2Value: '', sku: '', price: 0 };
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
    price: getNumber(record, 'price') ?? 0,
  };
}

function normalizeProductionUserRef(
  value: unknown,
): KolamProductionUserRef | null {
  if (value == null || value === '') {
    return null;
  }
  if (typeof value === 'string') {
    return { id: value, email: '', name: '' };
  }
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  if (!id) {
    return null;
  }
  return {
    id,
    email: getString(record, 'email'),
    name: resolveProductionPersonName(record),
  };
}

function normalizeProductionStatus(value: string): KolamProductionStatus | string {
  const normalized = value.trim().toLowerCase();
  return isKolamProductionStatus(normalized) ? normalized : value.trim() || 'pending';
}

function normalizeProductionPagination(
  value: unknown,
  fallbackTotal: number,
): KolamProductionPagination {
  const record = asRecord(value);
  const page = getNumber(record, 'page') ?? 1;
  const limit = getNumber(record, 'limit') ?? (fallbackTotal || 10);
  const total = getNumber(record, 'total') ?? fallbackTotal;
  const totalPages =
    getNumber(record, 'totalPages') ??
    (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1);
  return { page, limit, total, totalPages };
}

function resolveProductionPersonName(value: unknown): string {
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

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
}

function normalizeProductionRoutePath(route: string) {
  const path = route.trim().split('?')[0] || '';
  if (!path) {
    return '';
  }
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

function parseProductionRouteQuery(route: string) {
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
  return toProductionNumber(record[key]);
}

function toProductionNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (
    value &&
    typeof value === 'object' &&
    '$numberDecimal' in (value as Record<string, unknown>)
  ) {
    const parsed = Number((value as Record<string, unknown>).$numberDecimal);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/**
 * Kolam backoffice Sales (`/sales`) — FE Penjualan ops.
 * Bukan POS kasir (`da-pos` / module shell `sales` thin panel).
 *
 * Source of truth: FE `types/sales.ts` + BE `/api/sales`.
 */

import type { KolamBadgeIntent } from './kolam-badge';
import { getKolamFileUrl } from '../lib/file-url';

export type KolamSaleStatusIntent = KolamBadgeIntent | 'muted';

export const KOLAM_SALES_ROOT = '/sales';
export const KOLAM_SALES_DISCOUNT_APPROVAL_ROUTE = '/sales/discount-approval';
export const KOLAM_SALES_NEED_DELIVERY_FILTER = 'need_delivery';

export type KolamSalePaymentStatus =
  | 'draft'
  | 'pending'
  | 'sent'
  | 'unpaid'
  | 'paid'
  | 'partial_paid'
  | 'cancelled';

export type KolamSaleDeliveryStatus =
  | 'none'
  | 'packing'
  | 'waiting_pickup'
  | 'on_delivery'
  | 'delivered'
  | 'success'
  | 'waiting_complaints'
  | 'complaint'
  | typeof KOLAM_SALES_NEED_DELIVERY_FILTER
  | string;

export type KolamSaleLifecycle = 'active' | 'completed' | 'cancelled';

export type KolamSaleSurfaceMode =
  | 'list'
  | 'detail'
  | 'create'
  | 'edit'
  | 'add-items'
  | 'approval';

export type KolamSaleItemType =
  | 'product'
  | 'species'
  | 'freyer'
  | 'teranura'
  | 'service'
  | 'custom'
  | 'custom_project'
  | 'enclosure'
  | string;

export type KolamSalePagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type KolamSaleListFilters = {
  search: string;
  status: '' | KolamSalePaymentStatus;
  deliveryStatus: '' | KolamSaleDeliveryStatus;
  lifecycle: KolamSaleLifecycle;
  needsAction: boolean;
  startDate: string;
  endDate: string;
  page: number;
  limit: number;
};

export type KolamSaleSourceRef = {
  id: string;
  name: string;
  type: string;
  logoUri: string | null;
};

export type KolamSalePaymentMethodRef = {
  id: string;
  name: string;
  type: string;
};

export type KolamSaleCustomerRef = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

export type KolamSaleBuyerInfo = {
  name: string;
  phone: string;
  email: string;
  address: string;
};

export type KolamSaleItemDiscount = {
  type: 'percentage' | 'fixed' | string;
  amount: number;
};

export type KolamSaleItem = {
  id: string;
  itemType: KolamSaleItemType;
  title: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount: KolamSaleItemDiscount | null;
  shippingCost: number;
  variantLabel: string;
  productId: string;
  speciesId: string;
  serviceId: string;
  enclosureId: string;
  customName: string;
  customUnit: string;
  customCost: number | null;
  voucherCode: string;
};

export type KolamSalePaymentProof = {
  id: string;
  path: string;
  uri: string | null;
  uploadedAt: string;
  note: string;
};

export type KolamSaleHistory = {
  id: string;
  status: string;
  note: string;
  changedByName: string;
  changedAt: string;
};

export type KolamSale = {
  id: string;
  invoiceCode: string;
  status: KolamSalePaymentStatus | string;
  deliveryStatus: KolamSaleDeliveryStatus;
  customer: KolamSaleCustomerRef | null;
  buyerInfo: KolamSaleBuyerInfo | null;
  buyerLabel: string;
  items: KolamSaleItem[];
  total: number;
  shippingCost: number;
  finalTotal: number;
  paidAmount: number;
  paymentMethod: KolamSalePaymentMethodRef | null;
  sourceRef: KolamSaleSourceRef | null;
  /** Marketplace channel source (shopee/tokopedia) when present. */
  marketplaceSource: string;
  paymentProofs: KolamSalePaymentProof[];
  saleHistories: KolamSaleHistory[];
  paidAt: string;
  sentAt: string;
  cancelledAt: string;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
};

/** Staff-selectable payment status targets (detail + approval). */
export type KolamSaleStatusTransitionTarget =
  | 'sent'
  | 'paid'
  | 'cancelled'
  | 'reject';

export type KolamSaleDeliveryTransitionTarget =
  | 'packing'
  | 'on_delivery'
  | 'delivered'
  | 'success';

const SALE_STATUS_TRANSITIONS: Record<
  KolamSalePaymentStatus,
  KolamSaleStatusTransitionTarget[]
> = {
  draft: ['sent', 'cancelled'],
  pending: [],
  sent: ['paid', 'cancelled'],
  unpaid: [],
  paid: ['cancelled'],
  partial_paid: ['paid', 'cancelled'],
  cancelled: [],
};

export type KolamSaleListResult = {
  data: KolamSale[];
  pagination: KolamSalePagination;
};

export const KOLAM_SALE_LIFECYCLE_OPTIONS: Array<{
  label: string;
  value: KolamSaleLifecycle;
}> = [
  { label: 'Berjalan', value: 'active' },
  { label: 'Selesai', value: 'completed' },
  { label: 'Dibatalkan', value: 'cancelled' },
];

export const KOLAM_SALE_PAYMENT_STATUS_OPTIONS: Array<{
  label: string;
  value: '' | KolamSalePaymentStatus;
}> = [
  { label: 'Semua status bayar', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Menunggu persetujuan finance', value: 'pending' },
  { label: 'Menunggu bayar', value: 'sent' },
  { label: 'Belum bayar', value: 'unpaid' },
  { label: 'Lunas', value: 'paid' },
  { label: 'Bayar sebagian', value: 'partial_paid' },
  { label: 'Dibatalkan', value: 'cancelled' },
];

export const KOLAM_SALE_DELIVERY_STATUS_OPTIONS: Array<{
  label: string;
  value: '' | KolamSaleDeliveryStatus;
}> = [
  { label: 'Semua pengiriman', value: '' },
  { label: 'Butuh kirim', value: KOLAM_SALES_NEED_DELIVERY_FILTER },
  { label: 'Belum dikirim', value: 'none' },
  { label: 'Sedang dipacking', value: 'packing' },
  { label: 'Menunggu di jemput kurir', value: 'waiting_pickup' },
  { label: 'Dalam pengiriman', value: 'on_delivery' },
  { label: 'Terkirim', value: 'delivered' },
  { label: 'Pengiriman selesai', value: 'success' },
  { label: 'Menunggu komplain', value: 'waiting_complaints' },
  { label: 'Komplain diproses', value: 'complaint' },
];

/* ──────────────────────────────────────────
   Routes
   ──────────────────────────────────────────*/

export function isKolamSalesRoute(route: string) {
  return (
    isKolamSalesListRoute(route) ||
    isKolamSalesDetailRoute(route) ||
    isKolamSalesCreateRoute(route) ||
    isKolamSalesEditRoute(route) ||
    isKolamSalesAddItemsRoute(route) ||
    isKolamSalesDiscountApprovalRoute(route)
  );
}

export function isKolamSalesListRoute(route: string) {
  return normalizeSalesRoutePath(route) === KOLAM_SALES_ROOT;
}

export function isKolamSalesCreateRoute(route: string) {
  return normalizeSalesRoutePath(route) === `${KOLAM_SALES_ROOT}/create`;
}

export function isKolamSalesDiscountApprovalRoute(route: string) {
  return (
    normalizeSalesRoutePath(route) === KOLAM_SALES_DISCOUNT_APPROVAL_ROUTE
  );
}

export function isKolamSalesEditRoute(route: string) {
  const path = normalizeSalesRoutePath(route);
  if (isKolamSalesAddItemsRoute(route)) {
    return false;
  }
  return /^\/sales\/[^/]+\/edit$/.test(path);
}

export function isKolamSalesAddItemsRoute(route: string) {
  const path = normalizeSalesRoutePath(route);
  if (!/^\/sales\/[^/]+\/edit$/.test(path)) {
    return false;
  }
  const query = parseSalesRouteQuery(route);
  return query.mode === 'add-items';
}

export function isKolamSalesDetailRoute(route: string) {
  return Boolean(getKolamSaleRouteId(route));
}

export function getKolamSaleEditRouteId(route: string) {
  const path = normalizeSalesRoutePath(route);
  const match = /^\/sales\/([^/]+)\/edit$/.exec(path);
  const id = match?.[1] ? decodeURIComponent(match[1]) : null;
  if (!id || id === 'create' || id === 'discount-approval') {
    return null;
  }
  return id;
}

/** Detail id only — create/edit/approval excluded. */
export function getKolamSaleRouteId(route: string) {
  const path = normalizeSalesRoutePath(route);
  if (
    path === KOLAM_SALES_ROOT ||
    path === KOLAM_SALES_DISCOUNT_APPROVAL_ROUTE ||
    path === `${KOLAM_SALES_ROOT}/create` ||
    path.endsWith('/edit')
  ) {
    return null;
  }
  const match = /^\/sales\/([^/]+)$/.exec(path);
  const id = match?.[1] ? decodeURIComponent(match[1]) : null;
  if (!id || id === 'create' || id === 'discount-approval') {
    return null;
  }
  return id;
}

export function getKolamSaleSurfaceMode(route: string): KolamSaleSurfaceMode {
  if (isKolamSalesDiscountApprovalRoute(route)) {
    return 'approval';
  }
  if (isKolamSalesCreateRoute(route)) {
    return 'create';
  }
  if (isKolamSalesAddItemsRoute(route)) {
    return 'add-items';
  }
  if (isKolamSalesEditRoute(route)) {
    return 'edit';
  }
  if (getKolamSaleRouteId(route)) {
    return 'detail';
  }
  return 'list';
}

export function getKolamSaleBreadcrumbPath(mode: KolamSaleSurfaceMode) {
  if (mode === 'create') {
    return `${KOLAM_SALES_ROOT}/create`;
  }
  if (mode === 'edit' || mode === 'add-items') {
    return `${KOLAM_SALES_ROOT}/edit`;
  }
  if (mode === 'approval') {
    return KOLAM_SALES_DISCOUNT_APPROVAL_ROUTE;
  }
  if (mode === 'detail') {
    return `${KOLAM_SALES_ROOT}/detail`;
  }
  return KOLAM_SALES_ROOT;
}

export function canEditKolamSaleDraft(sale: {
  status?: string | null;
}): boolean {
  return String(sale.status ?? '').toLowerCase() === 'draft';
}

export function canAddItemsToKolamSale(sale: {
  status?: string | null;
  deliveryStatus?: string | null;
}): boolean {
  const status = String(sale.status ?? '').toLowerCase();
  const delivery = String(sale.deliveryStatus ?? 'none').toLowerCase();
  return (
    (status === 'paid' || status === 'partial_paid') && delivery === 'none'
  );
}

export function saleHasUnsupportedEditItemTypes(
  items: Array<{ itemType?: string | null }>,
): boolean {
  const allowed = new Set(['product', 'species', 'custom', 'service']);
  return items.some(item => {
    const type = String(item.itemType ?? '').toLowerCase();
    return type && !allowed.has(type);
  });
}

export function createInitialKolamSaleListFilters(
  route: string,
): KolamSaleListFilters {
  const query = parseSalesRouteQuery(route);
  const lifecycle =
    query.lifecycle === 'completed' || query.lifecycle === 'cancelled'
      ? query.lifecycle
      : 'active';
  const needsAction =
    query.needsAction === '1' || query.needsAction === 'true';
  const status = isKolamSalePaymentStatus(query.status) ? query.status : '';

  return {
    search: query.search ?? '',
    status,
    deliveryStatus: query.deliveryStatus ?? '',
    lifecycle,
    needsAction,
    startDate: query.startDate ?? '',
    endDate: query.endDate ?? '',
    page: Math.max(1, Number(query.page || '1') || 1),
    limit: 10,
  };
}

/* ──────────────────────────────────────────
   Labels / intents
   ──────────────────────────────────────────*/

export function formatKolamSalePaymentStatusLabel(
  status?: string | null,
): string {
  const key = String(status || '').toLowerCase();
  switch (key) {
    case 'draft':
      return 'Draft';
    case 'pending':
      return 'Menunggu persetujuan finance';
    case 'sent':
      return 'Menunggu bayar';
    case 'unpaid':
      return 'Belum bayar';
    case 'paid':
      return 'Lunas';
    case 'partial_paid':
      return 'Bayar sebagian';
    case 'cancelled':
      return 'Dibatalkan';
    case 'reject':
      return 'Diskon ditolak';
    default:
      return status || '—';
  }
}

export function getKolamSalePaymentStatusIntent(
  status?: string | null,
): KolamSaleStatusIntent {
  const key = String(status || '').toLowerCase();
  if (key === 'cancelled') {
    return 'danger';
  }
  if (key === 'paid') {
    return 'success';
  }
  if (key === 'partial_paid') {
    return 'info';
  }
  if (key === 'unpaid' || key === 'sent') {
    return 'warning';
  }
  if (key === 'draft' || key === 'pending') {
    return 'secondary';
  }
  return 'secondary';
}

export function formatKolamSaleDeliveryStatusLabel(
  deliveryStatus?: string | null,
  paymentStatus?: string | null,
): string {
  const pay = String(paymentStatus || '').toLowerCase();
  if (pay === 'cancelled') {
    return 'Dibatalkan';
  }
  const ds = String(deliveryStatus || 'none').toLowerCase();
  if (ds === KOLAM_SALES_NEED_DELIVERY_FILTER) {
    return 'Butuh kirim';
  }
  if (pay === 'paid' && ds === 'none') {
    return 'Butuh kirim';
  }
  switch (ds) {
    case 'none':
      return 'Belum dikirim';
    case 'packing':
      return 'Sedang dipacking';
    case 'waiting_pickup':
      return 'Menunggu di jemput kurir';
    case 'on_delivery':
      return 'Dalam pengiriman';
    case 'delivered':
      return 'Terkirim';
    case 'success':
      return 'Pengiriman selesai';
    case 'waiting_complaints':
      return 'Menunggu komplain';
    case 'complaint':
      return 'Komplain diproses';
    default:
      return deliveryStatus || '—';
  }
}

export function getKolamSaleDeliveryStatusIntent(
  deliveryStatus?: string | null,
  paymentStatus?: string | null,
): KolamSaleStatusIntent {
  const pay = String(paymentStatus || '').toLowerCase();
  if (pay === 'cancelled') {
    return 'danger';
  }
  const ds = String(deliveryStatus || 'none').toLowerCase();
  if (pay === 'paid' && (ds === 'none' || ds === KOLAM_SALES_NEED_DELIVERY_FILTER)) {
    return 'warning';
  }
  if (ds === 'success' || ds === 'delivered') {
    return 'success';
  }
  if (ds === 'on_delivery' || ds === 'waiting_pickup' || ds === 'packing') {
    return 'info';
  }
  if (ds === 'complaint' || ds === 'waiting_complaints') {
    return 'warning';
  }
  return 'muted';
}

export function formatKolamSaleItemTypeLabel(itemType?: string | null): string {
  switch (String(itemType || '').toLowerCase()) {
    case 'product':
      return 'Produk';
    case 'species':
      return 'Spesies';
    case 'freyer':
      return 'Freyer';
    case 'teranura':
      return 'Teranura';
    case 'service':
      return 'Layanan';
    case 'custom':
      return 'Custom';
    case 'custom_project':
      return 'Proyek';
    case 'enclosure':
      return 'Enclosure';
    default:
      return itemType || 'Item';
  }
}

export function isKolamSalePaymentStatus(
  value: string | undefined | null,
): value is KolamSalePaymentStatus {
  return (
    value === 'draft' ||
    value === 'pending' ||
    value === 'sent' ||
    value === 'unpaid' ||
    value === 'paid' ||
    value === 'partial_paid' ||
    value === 'cancelled'
  );
}

export function isKolamSaleMarketplaceManaged(sale: {
  marketplaceSource?: string | null;
}): boolean {
  const source = String(sale.marketplaceSource || '').toLowerCase();
  return source === 'shopee' || source === 'tokopedia';
}

export function getKolamSaleAllowedStatusTransitions(
  status?: string | null,
): KolamSaleStatusTransitionTarget[] {
  const key = String(status || '').toLowerCase();
  if (!isKolamSalePaymentStatus(key)) {
    return [];
  }
  return [...SALE_STATUS_TRANSITIONS[key]];
}

export function canUploadKolamSalePaymentProof(status?: string | null): boolean {
  const key = String(status || '').toLowerCase();
  return key === 'sent' || key === 'partial_paid';
}

export function canMarkKolamSalePaid(sale: {
  status?: string | null;
  paymentProofs?: Array<unknown>;
}): { ok: boolean; reason: string | null } {
  const key = String(sale.status || '').toLowerCase();
  if (key !== 'sent' && key !== 'partial_paid') {
    return { ok: false, reason: 'Status saat ini tidak bisa diubah ke Lunas.' };
  }
  if (!sale.paymentProofs?.length) {
    return {
      ok: false,
      reason:
        'Unggah bukti pembayaran terlebih dahulu sebelum mengubah status ke Lunas.',
    };
  }
  return { ok: true, reason: null };
}

export function formatKolamSaleMutationError(error: unknown): string {
  if (error instanceof Error && 'code' in error) {
    const apiError = error as Error & { code?: string; status?: number };
    if (apiError.code === 'CASHFLOW_SESSION_REQUIRED') {
      return (
        `${apiError.message || 'Sesi tunai belum dibuka'}. ` +
        'Buka Sesi Tunai di menu Penjualan & Arus Kas → Sesi Tunai, lalu coba lagi.'
      );
    }
    if (apiError.status === 403 || apiError.code === 'FORBIDDEN') {
      return (
        apiError.message?.trim() ||
        'Akses ditolak. Periksa izin role Anda untuk aksi penjualan ini.'
      );
    }
  }
  if (error instanceof Error && /cashflow session/i.test(error.message)) {
    return (
      `${error.message}. ` +
      'Buka Sesi Tunai di menu Penjualan & Arus Kas → Sesi Tunai, lalu coba lagi.'
    );
  }
  return getErrorMessageFallback(error);
}

function getErrorMessageFallback(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error';
}

/* ──────────────────────────────────────────
   Create form (P1)
   ──────────────────────────────────────────*/

export type KolamSaleCreateItemType =
  | 'product'
  | 'species'
  | 'custom'
  | 'service'
  | 'enclosure';

export type KolamSaleCreateDiscountType = 'percentage' | 'fixed';

export interface KolamSaleSourceOption {
  id: string;
  name: string;
  type: 'online' | 'offline' | string;
}

export interface KolamSaleCatalogOption {
  id: string;
  name: string;
}

export interface KolamSaleCustomCostForm {
  key: string;
  name: string;
  amount: string;
}

export interface KolamSaleCreateItemForm {
  key: string;
  itemType: KolamSaleCreateItemType;
  productId: string;
  speciesId: string;
  serviceId: string;
  enclosureId: string;
  customName: string;
  customUnit: string;
  customUnitPrice: string;
  customCost: string;
  quantity: string;
  discountType: KolamSaleCreateDiscountType;
  discountAmount: string;
  voucherCode: string;
}

export interface KolamSaleCreateFormState {
  customerId: string;
  paymentMethodId: string;
  sourceRefId: string;
  notes: string;
  buyerInfoName: string;
  buyerInfoPhone: string;
  buyerInfoEmail: string;
  buyerInfoAddress: string;
  pointsMethod: '' | 'manual' | 'product_based';
  manualPoints: string;
  transactionDate: string;
  items: KolamSaleCreateItemForm[];
  customCosts: KolamSaleCustomCostForm[];
}

export interface KolamSaleCreateItemBody {
  itemType: KolamSaleCreateItemType;
  product?: string;
  species?: string;
  service?: string;
  enclosure?: string;
  quantity: number;
  unitPrice?: number;
  customName?: string;
  customUnit?: string;
  customCost?: number;
  voucherCode?: string;
  discount?: {
    type: KolamSaleCreateDiscountType;
    amount: number;
  };
}

export interface KolamSaleCustomCostBody {
  name: string;
  amount: number;
}

export interface KolamSaleCreateBody {
  customer: string | null;
  buyerInfo?: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  paymentMethod: string;
  sourceRef: string;
  shippingCost: number;
  notes?: string;
  pointsConfig?: { method: 'manual' | 'product_based'; manualPoints?: number };
  transactionDate?: string;
  customCosts?: KolamSaleCustomCostBody[];
  items: KolamSaleCreateItemBody[];
}

export type KolamSaleUpdateBody = Omit<KolamSaleCreateBody, 'customer' | 'buyerInfo'> & {
  paymentMethod: string;
  sourceRef: string;
};

export interface KolamSaleAddItemsBody {
  items?: KolamSaleCreateItemBody[];
  customCosts?: KolamSaleCustomCostBody[];
}

export interface KolamSaleCreateValidationResult {
  isValid: boolean;
  errors: string[];
}

export type KolamSaleSourceFilterInput = {
  type: 'online' | 'offline' | string;
  name: string;
} | null | undefined;

export interface KolamSaleAnalyticsOverview {
  totalSales: number;
  totalRevenue: number;
  bySource: Array<{ name: string; count: number; revenue: number }>;
}

export interface KolamSaleNotificationSummary {
  pendingApproval: number;
  needsAction: number;
  needDelivery: number;
}

export interface KolamSaleLivestockAllocationRow {
  id: string;
  label: string;
  status: string;
}

let createItemKeySeq = 0;
let customCostKeySeq = 0;

export function createEmptyKolamSaleCreateItem(
  itemType: KolamSaleCreateItemType = 'product',
): KolamSaleCreateItemForm {
  createItemKeySeq += 1;
  return {
    key: `sale-item-${createItemKeySeq}`,
    itemType,
    productId: '',
    speciesId: '',
    serviceId: '',
    enclosureId: '',
    customName: '',
    customUnit: 'pcs',
    customUnitPrice: '',
    customCost: '',
    quantity: itemType === 'enclosure' ? '1' : '1',
    discountType: 'fixed',
    discountAmount: '',
    voucherCode: '',
  };
}

export function createEmptyKolamSaleCustomCost(): KolamSaleCustomCostForm {
  customCostKeySeq += 1;
  return {
    key: `sale-cost-${customCostKeySeq}`,
    name: '',
    amount: '',
  };
}

export function createInitialKolamSaleCreateForm(): KolamSaleCreateFormState {
  return {
    customerId: '',
    paymentMethodId: '',
    sourceRefId: '',
    notes: '',
    buyerInfoName: '',
    buyerInfoPhone: '',
    buyerInfoEmail: '',
    buyerInfoAddress: '',
    pointsMethod: '',
    manualPoints: '',
    transactionDate: '',
    items: [createEmptyKolamSaleCreateItem()],
    customCosts: [],
  };
}

export function isMarketplaceSalesSource(
  source: KolamSaleSourceFilterInput,
): boolean {
  if (!source || source.type !== 'online') {
    return false;
  }
  return nameMatchesMarketplaceKeywords(source.name);
}

export function isKolamMongoObjectId(value: string): boolean {
  return typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value);
}

export function nameMatchesMarketplaceKeywords(name: string): boolean {
  const n = name.toLowerCase();
  return (
    n.includes('tokopedia') || n.includes('tokped') || n.includes('shopee')
  );
}

function nameMatchesTokopediaChannel(name: string): boolean {
  const n = name.toLowerCase();
  return n.includes('tokopedia') || n.includes('tokped');
}

function nameMatchesShopeeChannel(name: string): boolean {
  return name.toLowerCase().includes('shopee');
}

function classifyOnlineSourceChannel(
  sourceName: string,
): 'tokopedia' | 'shopee' | 'generic' {
  const n = sourceName.toLowerCase();
  const hasTok = n.includes('tokopedia') || n.includes('tokped');
  const hasShopee = n.includes('shopee');
  if (hasTok && !hasShopee) {
    return 'tokopedia';
  }
  if (hasShopee && !hasTok) {
    return 'shopee';
  }
  return 'generic';
}

/** Filter customers / payment methods by sales source channel (FE sales-utils). */
export function filterOptionsBySalesSource<T extends { name: string }>(
  options: T[],
  selectedSource: KolamSaleSourceFilterInput,
): T[] {
  if (!selectedSource || selectedSource.type === 'offline') {
    return options.filter(o => !nameMatchesMarketplaceKeywords(o.name));
  }
  const ch = classifyOnlineSourceChannel(selectedSource.name);
  if (ch === 'tokopedia') {
    return options.filter(o => nameMatchesTokopediaChannel(o.name));
  }
  if (ch === 'shopee') {
    return options.filter(o => nameMatchesShopeeChannel(o.name));
  }
  return options.filter(o => nameMatchesMarketplaceKeywords(o.name));
}

/** Default staff sale source: offline POS, else first offline. */
export function pickDefaultOfflinePosSourceId(
  sources: Array<{ id: string; type: string; name: string }>,
): string | null {
  if (!sources.length) {
    return null;
  }
  const pos = sources.find(
    s => s.type === 'offline' && /^pos$/i.test((s.name || '').trim()),
  );
  const offline = sources.find(s => s.type === 'offline');
  return (pos ?? offline)?.id ?? null;
}

function mapFormItemsToBody(
  items: KolamSaleCreateItemForm[],
): KolamSaleCreateItemBody[] {
  return items.map(item => {
    const quantity = Math.max(0, Number(item.quantity) || 0);
    const discountAmount = Number(item.discountAmount);
    const discount =
      Number.isFinite(discountAmount) && discountAmount > 0
        ? {
            type: item.discountType,
            amount: discountAmount,
          }
        : undefined;
    const voucherCode = item.voucherCode.trim();
    const voucher = voucherCode ? { voucherCode } : {};

    if (item.itemType === 'custom') {
      const customCost = Number(item.customCost);
      return {
        itemType: 'custom',
        quantity,
        unitPrice: Math.max(0, Number(item.customUnitPrice) || 0),
        customName: item.customName.trim(),
        customUnit: item.customUnit.trim() || 'pcs',
        ...(Number.isFinite(customCost) && customCost >= 0
          ? { customCost }
          : {}),
        ...(discount ? { discount } : {}),
        ...voucher,
      };
    }

    if (item.itemType === 'species') {
      return {
        itemType: 'species',
        species: item.speciesId.trim(),
        quantity,
        ...(discount ? { discount } : {}),
        ...voucher,
      };
    }

    if (item.itemType === 'service') {
      return {
        itemType: 'service',
        service: item.serviceId.trim(),
        quantity,
        ...(discount ? { discount } : {}),
        ...voucher,
      };
    }

    if (item.itemType === 'enclosure') {
      return {
        itemType: 'enclosure',
        enclosure: item.enclosureId.trim(),
        quantity: 1,
        ...(discount ? { discount } : {}),
        ...voucher,
      };
    }

    return {
      itemType: 'product',
      product: item.productId.trim(),
      quantity,
      ...(discount ? { discount } : {}),
      ...voucher,
    };
  });
}

function mapFormCustomCosts(
  costs: KolamSaleCustomCostForm[],
): KolamSaleCustomCostBody[] {
  return costs
    .map(cost => ({
      name: cost.name.trim(),
      amount: Number(cost.amount) || 0,
    }))
    .filter(cost => cost.name && cost.amount >= 0);
}

function appendOptionalSaleFields(
  form: KolamSaleCreateFormState,
  base: {
    paymentMethod: string;
    sourceRef: string;
    shippingCost: number;
    items: KolamSaleCreateItemBody[];
  },
) {
  const notes = form.notes.trim();
  const customCosts = mapFormCustomCosts(form.customCosts);
  const result: KolamSaleCreateBody = {
    customer: form.customerId.trim() || null,
    ...base,
    ...(notes ? { notes } : {}),
    ...(customCosts.length ? { customCosts } : {}),
  };

  if (form.pointsMethod === 'manual' || form.pointsMethod === 'product_based') {
    result.pointsConfig = {
      method: form.pointsMethod,
      ...(form.pointsMethod === 'manual'
        ? { manualPoints: Math.max(0, Number(form.manualPoints) || 0) }
        : {}),
    };
  }
  if (form.transactionDate.trim()) {
    result.transactionDate = form.transactionDate.trim();
  }
  return result;
}

export function buildKolamSaleCreateBody(
  form: KolamSaleCreateFormState,
  options?: { useBuyerInfo?: boolean },
): KolamSaleCreateBody {
  const body = appendOptionalSaleFields(form, {
    paymentMethod: form.paymentMethodId.trim(),
    sourceRef: form.sourceRefId.trim(),
    shippingCost: 0,
    items: mapFormItemsToBody(form.items),
  });

  if (options?.useBuyerInfo) {
    body.customer = null;
    body.buyerInfo = {
      name: form.buyerInfoName.trim(),
      phone: form.buyerInfoPhone.trim(),
      email: form.buyerInfoEmail.trim(),
      address: form.buyerInfoAddress.trim(),
    };
  }

  return body;
}

export function buildKolamSaleUpdateBody(
  form: KolamSaleCreateFormState,
): KolamSaleUpdateBody {
  const created = appendOptionalSaleFields(form, {
    paymentMethod: form.paymentMethodId.trim(),
    sourceRef: form.sourceRefId.trim(),
    shippingCost: 0,
    items: mapFormItemsToBody(form.items),
  });
  const { customer: _customer, buyerInfo: _buyerInfo, ...rest } = created;
  return rest;
}

export function buildKolamSaleAddItemsBody(
  form: KolamSaleCreateFormState,
): KolamSaleAddItemsBody {
  const items = mapFormItemsToBody(
    form.items.filter(
      item => item.itemType === 'product' || item.itemType === 'custom',
    ),
  );
  const customCosts = mapFormCustomCosts(form.customCosts);
  return {
    ...(items.length ? { items } : {}),
    ...(customCosts.length ? { customCosts } : {}),
  };
}

export function hydrateKolamSaleCreateFormFromSale(
  sale: KolamSale,
): KolamSaleCreateFormState {
  const items =
    sale.items.length > 0
      ? sale.items.map(item => {
          const typeRaw = String(item.itemType || 'product').toLowerCase();
          const itemType: KolamSaleCreateItemType =
            typeRaw === 'species' ||
            typeRaw === 'custom' ||
            typeRaw === 'service' ||
            typeRaw === 'enclosure'
              ? typeRaw
              : 'product';
          createItemKeySeq += 1;
          return {
            key: `sale-item-${createItemKeySeq}`,
            itemType,
            productId: item.productId,
            speciesId: item.speciesId,
            serviceId: item.serviceId,
            enclosureId: item.enclosureId,
            customName: item.customName || (itemType === 'custom' ? item.title : ''),
            customUnit: item.customUnit || 'pcs',
            customUnitPrice:
              itemType === 'custom' ? String(item.unitPrice || 0) : '',
            customCost:
              item.customCost != null ? String(item.customCost) : '',
            quantity: String(item.quantity || 1),
            discountType:
              item.discount?.type === 'percentage' ? 'percentage' : 'fixed',
            discountAmount:
              item.discount && item.discount.amount > 0
                ? String(item.discount.amount)
                : '',
            voucherCode: item.voucherCode || '',
          } satisfies KolamSaleCreateItemForm;
        })
      : [createEmptyKolamSaleCreateItem()];

  return {
    customerId: sale.customer?.id ?? '',
    paymentMethodId: sale.paymentMethod?.id ?? '',
    sourceRefId: sale.sourceRef?.id ?? '',
    notes: '',
    buyerInfoName: sale.buyerInfo?.name ?? '',
    buyerInfoPhone: sale.buyerInfo?.phone ?? '',
    buyerInfoEmail: sale.buyerInfo?.email ?? '',
    buyerInfoAddress: sale.buyerInfo?.address ?? '',
    pointsMethod: '',
    manualPoints: '',
    transactionDate: sale.transactionDate
      ? sale.transactionDate.slice(0, 10)
      : '',
    items,
    customCosts: [],
  };
}

function validateSaleItems(
  items: KolamSaleCreateItemBody[],
  errors: string[],
  options?: { requireQuantityWhenMissing?: boolean },
) {
  items.forEach((item, index) => {
    const idx = index + 1;
    if (item.itemType === 'custom') {
      if (!item.customName?.trim()) {
        errors.push(`Item ${idx}: nama custom wajib diisi`);
      }
      if (
        item.unitPrice === undefined ||
        typeof item.unitPrice !== 'number' ||
        item.unitPrice < 0
      ) {
        errors.push(`Item ${idx}: harga custom wajib (≥ 0)`);
      }
    }
    if (item.itemType === 'product') {
      if (!item.product?.trim()) {
        errors.push(`Item ${idx}: produk wajib dipilih`);
      } else if (!isKolamMongoObjectId(item.product)) {
        errors.push(`Item ${idx}: produk harus ObjectId valid`);
      }
    }
    if (item.itemType === 'species') {
      if (!item.species?.trim()) {
        errors.push(`Item ${idx}: spesies wajib dipilih`);
      } else if (!isKolamMongoObjectId(item.species)) {
        errors.push(`Item ${idx}: spesies harus ObjectId valid`);
      }
    }
    if (item.itemType === 'service') {
      if (!item.service?.trim()) {
        errors.push(`Item ${idx}: layanan wajib dipilih`);
      } else if (!isKolamMongoObjectId(item.service)) {
        errors.push(`Item ${idx}: layanan harus ObjectId valid`);
      }
    }
    if (item.itemType === 'enclosure') {
      if (!item.enclosure?.trim()) {
        errors.push(`Item ${idx}: kandang wajib dipilih`);
      } else if (!isKolamMongoObjectId(item.enclosure)) {
        errors.push(`Item ${idx}: kandang harus ObjectId valid`);
      }
      if (item.quantity !== 1) {
        errors.push(`Item ${idx}: kuantitas enclosure harus 1`);
      }
    }
    if (
      options?.requireQuantityWhenMissing !== false &&
      (item.quantity == null ||
        typeof item.quantity !== 'number' ||
        item.quantity <= 0)
    ) {
      errors.push(`Item ${idx}: kuantitas harus angka positif`);
    }
    const d = item.discount;
    if (d) {
      if (d.type !== 'percentage' && d.type !== 'fixed') {
        errors.push(`Item ${idx}: tipe diskon harus percentage atau fixed`);
      }
      if (typeof d.amount !== 'number' || d.amount < 0) {
        errors.push(`Item ${idx}: jumlah diskon harus ≥ 0`);
      } else if (d.type === 'percentage' && d.amount > 100) {
        errors.push(`Item ${idx}: diskon persen tidak boleh > 100`);
      }
    }
  });
}

/** Subset of FE validateCreateSalePayload for supported item types. */
export function validateKolamSaleCreatePayload(
  payload: KolamSaleCreateBody,
): KolamSaleCreateValidationResult {
  const errors: string[] = [];
  const hasCustomer =
    typeof payload.customer === 'string' && Boolean(payload.customer.trim());
  const buyerName =
    typeof payload.buyerInfo?.name === 'string'
      ? payload.buyerInfo.name.trim()
      : '';
  const hasBuyerInfo = buyerName.length > 0;

  if (!hasCustomer && !hasBuyerInfo) {
    errors.push('Customer atau nama pembeli wajib diisi');
  } else if (payload.customer && !isKolamMongoObjectId(payload.customer)) {
    errors.push('Customer harus ObjectId valid');
  }

  if (!payload.paymentMethod || typeof payload.paymentMethod !== 'string') {
    errors.push('Metode pembayaran wajib diisi');
  } else if (!isKolamMongoObjectId(payload.paymentMethod)) {
    errors.push('Metode pembayaran harus ObjectId valid');
  }

  const sr = payload.sourceRef;
  if (!sr || typeof sr !== 'string' || !sr.trim()) {
    errors.push('Sumber penjualan (sourceRef) wajib diisi');
  } else if (!isKolamMongoObjectId(sr.trim())) {
    errors.push('Sumber penjualan harus ObjectId valid');
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    errors.push('Minimal satu item wajib diisi');
  } else {
    validateSaleItems(payload.items, errors);
  }

  if (
    payload.shippingCost !== undefined &&
    (typeof payload.shippingCost !== 'number' || payload.shippingCost < 0)
  ) {
    errors.push('Ongkir harus angka ≥ 0');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateKolamSaleUpdatePayload(
  payload: KolamSaleUpdateBody,
): KolamSaleCreateValidationResult {
  const errors: string[] = [];

  if (payload.paymentMethod) {
    if (!isKolamMongoObjectId(payload.paymentMethod)) {
      errors.push('Metode pembayaran harus ObjectId valid');
    }
  }

  const sr = payload.sourceRef;
  if (sr === null || sr === undefined || String(sr).trim() === '') {
    errors.push('Sumber penjualan tidak boleh dikosongkan');
  } else if (!isKolamMongoObjectId(String(sr).trim())) {
    errors.push('Sumber penjualan harus ObjectId valid');
  }

  if (payload.items !== undefined) {
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      errors.push('Minimal satu item wajib diisi');
    } else {
      validateSaleItems(payload.items, errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateKolamSaleAddItemsPayload(
  payload: KolamSaleAddItemsBody,
): KolamSaleCreateValidationResult {
  const errors: string[] = [];
  const items = payload.items ?? [];
  const costs = payload.customCosts ?? [];
  if (!items.length && !costs.length) {
    errors.push('Tambahkan minimal satu item atau biaya tambahan');
  }
  if (items.length) {
    validateSaleItems(items, errors);
  }
  return { isValid: errors.length === 0, errors };
}

export function getKolamSaleAllowedDeliveryTransitions(
  current: string | null | undefined,
  options?: { isOfflineSource?: boolean },
): KolamSaleDeliveryTransitionTarget[] {
  const status = String(current ?? 'none').toLowerCase();
  const offline = Boolean(options?.isOfflineSource);
  switch (status) {
    case 'none':
      return offline
        ? ['packing', 'on_delivery', 'success']
        : ['packing', 'on_delivery'];
    case 'packing':
    case 'waiting_pickup':
      return offline ? ['on_delivery', 'success'] : ['on_delivery'];
    case 'on_delivery':
      return ['delivered'];
    case 'delivered':
      return offline ? ['success'] : [];
    default:
      return [];
  }
}

/* ──────────────────────────────────────────
   Normalize
   ──────────────────────────────────────────*/

export function normalizeKolamSale(payload: unknown): KolamSale {
  const root = asRecord(payload);
  // Detail API may wrap as `{ data: sale }`. List rows are already sales — do
  // NOT treat a sale's own `data` field (if present) as an envelope.
  const nested = asRecord(root.data);
  const looksLikeSale = Boolean(
    root._id || root.id || root.invoiceCode || root.status,
  );
  const record =
    !looksLikeSale && Object.keys(nested).length > 0 ? nested : root;

  const customer = normalizeCustomerRef(record.customer);
  const buyerInfo = normalizeBuyerInfo(record.buyerInfo);
  const sourceRef = normalizeSourceRef(record.sourceRef);
  const paymentMethod = normalizePaymentMethodRef(record.paymentMethod);
  const externalRef = asRecord(record.externalRef);

  return {
    id: getMongoId(record, '_id') || getMongoId(record, 'id'),
    invoiceCode: getString(record, 'invoiceCode') || '—',
    status: normalizePaymentStatus(getString(record, 'status')),
    deliveryStatus: getString(record, 'deliveryStatus') || 'none',
    customer,
    buyerInfo,
    buyerLabel: resolveBuyerLabel(customer, buyerInfo),
    items: normalizeSaleItems(record.items),
    total: getNumber(record, 'total') ?? 0,
    shippingCost: getNumber(record, 'shippingCost') ?? 0,
    finalTotal: getNumber(record, 'finalTotal') ?? 0,
    paidAmount: getNumber(record, 'paidAmount') ?? 0,
    paymentMethod,
    sourceRef,
    marketplaceSource: getString(externalRef, 'source').toLowerCase(),
    paymentProofs: normalizePaymentProofs(record.paymentProofs),
    saleHistories: normalizeSaleHistories(record.saleHistories),
    paidAt: stringifyDate(record.paidAt),
    sentAt: stringifyDate(record.sentAt),
    cancelledAt: stringifyDate(record.cancelledAt),
    transactionDate: stringifyDate(record.transactionDate),
    createdAt: stringifyDate(record.createdAt),
    updatedAt: stringifyDate(record.updatedAt),
  };
}

export function normalizeKolamSaleList(payload: unknown): KolamSaleListResult {
  const root = asRecord(payload);
  let list: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray(root.data)
      ? root.data
      : [];

  // Some gateways wrap again: `{ data: { data: Sale[], pagination } }`
  if (!list.length) {
    const nested = asRecord(root.data);
    if (Array.isArray(nested.data)) {
      list = nested.data;
    }
  }

  const paginationSource =
    root.pagination ?? asRecord(root.data).pagination ?? root;

  const data = list.map(normalizeKolamSale).filter(item => Boolean(item.id));

  return {
    data,
    pagination: normalizePagination(paginationSource, data.length),
  };
}

function normalizeSaleItems(value: unknown): KolamSaleItem[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((row, index) => normalizeSaleItem(row, index))
    .filter(item => Boolean(item.id));
}

function normalizeSaleItem(value: unknown, index: number): KolamSaleItem {
  const record = asRecord(value);
  const itemType = getString(record, 'itemType') || 'product';
  const product = asRecord(record.product);
  const species = asRecord(record.species);
  const freyer = asRecord(record.freyer);
  const teranura = asRecord(record.teranura);
  const service = asRecord(record.service);
  const enclosure = asRecord(record.enclosure);
  const variant = asRecord(record.variant);
  const discountRecord = asRecord(record.discount);

  const title =
    getString(record, 'customName') ||
    getString(product, 'name') ||
    getString(species, 'scientificName') ||
    getString(species, 'commonName') ||
    getString(species, 'localName') ||
    getString(freyer, 'name') ||
    getString(teranura, 'name') ||
    getString(service, 'name') ||
    getString(enclosure, 'name') ||
    getString(enclosure, 'code') ||
    `Item ${index + 1}`;

  const sku =
    getString(variant, 'sku') ||
    getString(product, 'sku') ||
    getString(species, 'sku') ||
    getString(freyer, 'sku') ||
    getString(teranura, 'sku') ||
    '';

  const variantLabel = [getString(variant, 'tier1Value'), getString(variant, 'tier2Value')]
    .filter(Boolean)
    .join(' / ');

  const discount =
    discountRecord.type || discountRecord.amount !== undefined
      ? {
          type: String(discountRecord.type || 'fixed'),
          amount: getNumber(discountRecord, 'amount') ?? 0,
        }
      : null;

  return {
    id: getMongoId(record, '_id') || getMongoId(record, 'id') || `item-${index}`,
    itemType,
    title,
    sku,
    quantity: getNumber(record, 'quantity') ?? 0,
    unitPrice: getNumber(record, 'unitPrice') ?? 0,
    subtotal: getNumber(record, 'subtotal') ?? 0,
    discount,
    shippingCost: getNumber(record, 'shippingCost') ?? 0,
    variantLabel,
    productId:
      getMongoId(product, '_id') ||
      getMongoId(product, 'id') ||
      (typeof record.product === 'string' ? record.product.trim() : ''),
    speciesId:
      getMongoId(species, '_id') ||
      getMongoId(species, 'id') ||
      (typeof record.species === 'string' ? record.species.trim() : ''),
    serviceId:
      getMongoId(service, '_id') ||
      getMongoId(service, 'id') ||
      (typeof record.service === 'string' ? record.service.trim() : ''),
    enclosureId:
      getMongoId(enclosure, '_id') ||
      getMongoId(enclosure, 'id') ||
      (typeof record.enclosure === 'string' ? record.enclosure.trim() : ''),
    customName: getString(record, 'customName'),
    customUnit: getString(record, 'customUnit') || 'pcs',
    customCost: getNumber(record, 'customCost'),
    voucherCode: getString(record, 'voucherCode'),
  };
}

function normalizePaymentProofs(value: unknown): KolamSalePaymentProof[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((row, index) => {
      const record = asRecord(row);
      const path = getString(record, 'path');
      if (!path) {
        return null;
      }
      return {
        id: getString(record, '_id') || getString(record, 'id') || `proof-${index}`,
        path,
        uri: getKolamFileUrl(path),
        uploadedAt: stringifyDate(record.uploadedAt),
        note: getString(record, 'note'),
      } satisfies KolamSalePaymentProof;
    })
    .filter((row): row is KolamSalePaymentProof => Boolean(row));
}

function normalizeSaleHistories(value: unknown): KolamSaleHistory[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((row, index) => {
    const record = asRecord(row);
    return {
      id: getString(record, '_id') || getString(record, 'id') || `history-${index}`,
      status: getString(record, 'status'),
      note: getString(record, 'note'),
      changedByName: resolveActorName(record.changedBy),
      changedAt: stringifyDate(record.changedAt),
    };
  });
}

function normalizeCustomerRef(value: unknown): KolamSaleCustomerRef | null {
  if (typeof value === 'string' && value.trim()) {
    return { id: value.trim(), name: '', phone: '', email: '' };
  }
  const record = asRecord(value);
  const id = getMongoId(record, '_id') || getMongoId(record, 'id');
  if (!id) {
    return null;
  }
  const name =
    getString(record, 'name') ||
    [getString(record, 'first_name'), getString(record, 'last_name')]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    getString(record, 'username');
  return {
    id,
    name,
    phone: getString(record, 'phone') || getString(record, 'whatsapp'),
    email: getString(record, 'email'),
  };
}

function normalizeBuyerInfo(value: unknown): KolamSaleBuyerInfo | null {
  const record = asRecord(value);
  const name = getString(record, 'name');
  if (!name && !getString(record, 'phone') && !getString(record, 'email')) {
    return null;
  }
  return {
    name,
    phone: getString(record, 'phone'),
    email: getString(record, 'email'),
    address: getString(record, 'address'),
  };
}

function normalizeSourceRef(value: unknown): KolamSaleSourceRef | null {
  if (typeof value === 'string' && value.trim()) {
    return { id: value.trim(), name: '', type: '', logoUri: null };
  }
  const record = asRecord(value);
  const id = getMongoId(record, '_id') || getMongoId(record, 'id');
  if (!id) {
    return null;
  }
  const logo = getString(record, 'logo');
  return {
    id,
    name: getString(record, 'name') || '—',
    type: getString(record, 'type'),
    logoUri: getKolamFileUrl(logo),
  };
}

function normalizePaymentMethodRef(
  value: unknown,
): KolamSalePaymentMethodRef | null {
  if (typeof value === 'string' && value.trim()) {
    return { id: value.trim(), name: '', type: '' };
  }
  const record = asRecord(value);
  const id = getMongoId(record, '_id') || getMongoId(record, 'id');
  if (!id) {
    return null;
  }
  return {
    id,
    name: getString(record, 'name') || '—',
    type: getString(record, 'type'),
  };
}

function resolveBuyerLabel(
  customer: KolamSaleCustomerRef | null,
  buyerInfo: KolamSaleBuyerInfo | null,
): string {
  if (customer?.name) {
    return customer.name;
  }
  if (buyerInfo?.name) {
    return buyerInfo.name;
  }
  if (customer?.id) {
    return customer.id;
  }
  return '—';
}

function resolveActorName(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  const record = asRecord(value);
  return (
    getString(record, 'name') ||
    [getString(record, 'first_name'), getString(record, 'last_name')]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    getString(record, 'username') ||
    getString(record, 'email') ||
    ''
  );
}

function normalizePaymentStatus(value: string): KolamSalePaymentStatus | string {
  const key = value.toLowerCase();
  return isKolamSalePaymentStatus(key) ? key : value || 'draft';
}

function normalizePagination(
  value: unknown,
  fallbackTotal: number,
): KolamSalePagination {
  const record = asRecord(value);
  const page = Math.max(1, Number(record.page) || 1);
  const limit = Math.max(1, Number(record.limit) || 10);
  const total = Math.max(0, Number(record.total) || fallbackTotal);
  const totalPages = Math.max(
    1,
    Number(record.totalPages) || Math.ceil(total / limit) || 1,
  );
  return { page, limit, total, totalPages };
}

function normalizeSalesRoutePath(route: string) {
  const path = route.trim().split('?')[0] || '';
  if (!path) {
    return '';
  }
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

function parseSalesRouteQuery(route: string) {
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

function getMongoId(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  if (value && typeof value === 'object') {
    const oid = (value as { $oid?: unknown }).$oid;
    if (typeof oid === 'string' && oid.trim()) {
      return oid.trim();
    }
    if (
      typeof (value as { toString?: () => string }).toString === 'function'
    ) {
      const text = String(value);
      if (text && text !== '[object Object]') {
        return text;
      }
    }
  }
  return '';
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

function getNumber(record: Record<string, unknown>, key: string): number | null {
  return toNumber(record[key]);
}

function toNumber(value: unknown): number | null {
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
    const parsed = Number(
      (value as Record<string, unknown>).$numberDecimal,
    );
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function stringifyDate(value: unknown): string {
  if (!value) {
    return '';
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string') {
    return value.trim();
  }
  return String(value);
}

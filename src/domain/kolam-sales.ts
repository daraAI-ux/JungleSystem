/**
 * Kolam backoffice Sales (`/sales`) — FE Penjualan ops.
 * Bukan POS kasir (`da-pos` / module shell `sales` thin panel).
 *
 * Source of truth: FE `types/sales.ts` + BE `/api/sales`.
 */

import type { KolamBadgeIntent } from './kolam-badge';
import type { KolamProduct } from './kolam-product';
import type { KolamShippingMethod } from './kolam-shipping-method';
import type { KolamSpecies } from './kolam-species';
import { getKolamFileUrl } from '../lib/file-url';
import { crossSyncSummaryLabel } from './kolam-stock-transaction';

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

export type KolamSaleItemPacking = {
  name: string;
  quantity: number;
  unitPriceAtSale: number;
  unitCostAtSale: number;
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
  /** HPP unit snapshot at sale (product/species); custom uses customCost. */
  unitCostAtSale: number | null;
  hppVendorUnitAtSale: number | null;
  hppBomUnitAtSale: number | null;
  hppStoredOnlyUnitAtSale: number | null;
  packings: KolamSaleItemPacking[];
  thumbnailUri: string | null;
  variantLabel: string;
  shippingSource: string;
  biteshipCourierCode: string;
  biteshipServiceCode: string;
  biteshipWaybillId: string;
  biteshipOrderId: string;
  itemDeliveryStatus: string;
  biteshipTrackingOrderStatus: string;
  shippingMethodId: string;
  shippingMethodName: string;
  productId: string;
  speciesId: string;
  serviceId: string;
  enclosureId: string;
  customName: string;
  customUnit: string;
  customCost: number | null;
  /** Applied voucher code from BE `items[].voucher.code` (or legacy top-level). */
  voucherCode: string;
  /** Rupiah applied from BE `items[].voucher.discountApplied`. */
  voucherDiscountApplied: number;
  voucherDiscountType: 'fixed' | 'percentage' | '';
  voucherDiscountValue: number | null;
};

export type KolamSaleCommissionAccrualByItem = {
  saleItemIndex: number;
  commissionType: 'percentage' | 'fixed';
  commissionValue: number;
  commissionAmount: number;
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

export type KolamSaleCustomCost = {
  name: string;
  amount: number;
};

/** FE `ShippingService` — courier/service/waybill shown on invoice. */
export type KolamSaleShippingService = {
  courierCode: string;
  courierName: string;
  serviceCode: string;
  serviceName: string;
  trackingNumber: string;
};

/** FE marketplace logistics timeline (Shopee/Tokopedia). */
export type KolamSaleLogisticsEvent = {
  at: string;
  message: string;
};

export type KolamSaleMarketplaceLogistics = {
  platform: 'shopee' | 'tokopedia';
  timeline: KolamSaleLogisticsEvent[];
  lastUpdate: string;
};

/** AM/FE `externalRef.(tokopedia|shopee).fulfillmentMode` — pickup vs drop-off. */
export type KolamSaleTokopediaFulfillmentMode =
  | 'pickup'
  | 'dropoff'
  | 'both'
  | 'unknown';

/**
 * Marketplace fulfillment flags from AM poll / platform cache.
 * FE: `externalRef.tokopedia|shopee` (+ `shippingService.trackingNumber` fallback).
 */
export type KolamSaleMarketplaceFulfillment = {
  platform: 'shopee' | 'tokopedia';
  /** Lowercased mode; empty when AM belum menempelkan. */
  fulfillmentMode: string;
  dropOffPointUrl: string;
  lastStatus: number | null;
  trackingNumber: string;
  /** Shopee — dipakai sync / reschedule helpers. */
  pickupArranged: boolean | null;
  pickupEditable: boolean | null;
  pickupTime: number | null;
};

/** Embedded wallet txs on sale detail (FE `walletTransactions`). */
export type KolamSaleWalletTransactionRef = {
  id: string;
  type: string;
  source: string;
  amount: number;
  confirmStatus: string;
  note: string;
  walletName: string;
  walletType: string;
  createdAt: string;
};

/** Embedded stock txs on sale detail (FE `stockTransactions`). */
export type KolamSaleStockTransactionRef = {
  id: string;
  source: string;
  type: string;
  quantity: number;
  before: number | null;
  after: number | null;
  reason: string;
  createdAt: string;
  crossSyncSummary: string;
};

/** Linked complaint summary on sale (FE `sales.complaints`). */
export type KolamSaleComplaintRef = {
  id: string;
  ticketCode: string;
  status: string;
  decision: string;
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
  marketplaceOrderId: string;
  paymentProofs: KolamSalePaymentProof[];
  saleHistories: KolamSaleHistory[];
  customCosts: KolamSaleCustomCost[];
  /** Legacy sale-level discount amount (new sales usually 0). */
  discount: number;
  discountType: string;
  notes: string;
  pointsEarned: number;
  shippingAddressText: string;
  shippingService: KolamSaleShippingService | null;
  marketplaceLogistics: KolamSaleMarketplaceLogistics | null;
  marketplaceFulfillment: KolamSaleMarketplaceFulfillment | null;
  shippingAutomationActive: boolean;
  walletTransactions: KolamSaleWalletTransactionRef[];
  stockTransactions: KolamSaleStockTransactionRef[];
  /** Linked complaints from sale detail/list payload (FE `complaints` / `hasComplaints`). */
  hasComplaints: boolean;
  complaints: KolamSaleComplaintRef[];
  createdByName: string;
  openLivestockPendingCount: number;
  hppTotalAtSale: number | null;
  commissionAccruedTotalAtSale: number | null;
  commissionAccrualByItem: KolamSaleCommissionAccrualByItem[];
  paymentMethodCost: number;
  sourceCost: number;
  sourceCostBreakdown: KolamSaleCustomCost[];
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

/** FE header “Ubah” — draft atau pending. */
export function canShowKolamSaleEditAction(sale: {
  status?: string | null;
}): boolean {
  const status = String(sale.status ?? '').toLowerCase();
  return status === 'draft' || status === 'pending';
}

export function canAddItemsToKolamSale(sale: {
  status?: string | null;
  deliveryStatus?: string | null;
}): boolean {
  const status = String(sale.status ?? '').toLowerCase();
  const delivery = String(sale.deliveryStatus ?? 'none').toLowerCase();
  return (
    (status === 'paid' || status === 'partial_paid') &&
    (!delivery || delivery === 'none')
  );
}

export function isKolamServiceOnlySale(sale: {
  items?: Array<{ itemType?: string | null }>;
}): boolean {
  const items = sale.items ?? [];
  if (!items.length) {
    return false;
  }
  return items.every(
    item => String(item.itemType ?? '').toLowerCase() === 'service',
  );
}

export function isKolamPosSale(sale: {
  sourceRef?: { type?: string | null; name?: string | null } | null;
}): boolean {
  const type = String(sale.sourceRef?.type ?? '').toLowerCase();
  if (type === 'offline') {
    return true;
  }
  return /^pos$/i.test(String(sale.sourceRef?.name ?? '').trim());
}

/** Hide shipping progress/card (service-only or POS) — FE `saleSkipsShippingFlow`. */
export function kolamSaleSkipsShippingFlow(sale: {
  items?: Array<{ itemType?: string | null }>;
  sourceRef?: { type?: string | null; name?: string | null } | null;
}): boolean {
  return isKolamServiceOnlySale(sale) || isKolamPosSale(sale);
}

export function getKolamNoShippingDeliveryLabel(sale: {
  items?: Array<{ itemType?: string | null }>;
  sourceRef?: { type?: string | null; name?: string | null } | null;
}): string {
  if (isKolamServiceOnlySale(sale)) {
    return 'Layanan (tanpa kirim)';
  }
  if (isKolamPosSale(sale)) {
    return 'POS (tanpa kirim)';
  }
  return 'Layanan (tanpa kirim)';
}

/** FE `canDownloadShippingResi` — paid + (marketplace or webstore-like). */
export function canDownloadKolamSaleShippingResi(sale: {
  status?: string | null;
  marketplaceSource?: string | null;
  sourceRef?: { type?: string | null } | null;
}): boolean {
  if (String(sale.status ?? '').toLowerCase() !== 'paid') {
    return false;
  }
  if (isKolamSaleMarketplaceManaged(sale)) {
    return true;
  }
  // Webstore-like: online source without marketplace externalRef
  const type = String(sale.sourceRef?.type ?? '').toLowerCase();
  return type === 'online' && !sale.marketplaceSource;
}

export function getKolamSaleOutstandingAmount(sale: {
  finalTotal?: number | null;
  paidAmount?: number | null;
}): number {
  return Math.max(0, (sale.finalTotal ?? 0) - (sale.paidAmount ?? 0));
}

/** Line HPP total — FE ItemRow: customCost vs unitCostAtSale × qty. */
export function getKolamSaleItemHppTotal(item: {
  itemType?: string | null;
  quantity?: number | null;
  unitCostAtSale?: number | null;
  customCost?: number | null;
}): number {
  const qty = Math.max(0, Number(item.quantity) || 0);
  const type = String(item.itemType ?? '').toLowerCase();
  const unit =
    type === 'custom'
      ? Math.max(0, Number(item.customCost) || 0)
      : Math.max(0, Number(item.unitCostAtSale) || 0);
  return Math.round(unit * qty);
}

export function getKolamSaleItemDiscountAmount(item: {
  quantity?: number | null;
  unitPrice?: number | null;
  discount?: { type?: string | null; amount?: number | null } | null;
}): number {
  const discount = item.discount;
  if (!discount || !(Number(discount.amount) > 0)) {
    return 0;
  }
  const line = Math.max(0, (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0));
  if (String(discount.type || '').toLowerCase() === 'percentage') {
    return Math.round((line * Number(discount.amount)) / 100);
  }
  return Math.round(Number(discount.amount) * (Number(item.quantity) || 0));
}

/** BE snapshot `items[].voucher.discountApplied` (already capped to line subtotal). */
export function getKolamSaleItemVoucherDiscountApplied(item: {
  voucherDiscountApplied?: number | null;
}): number {
  return Math.max(0, Math.round(Number(item.voucherDiscountApplied) || 0));
}

export function formatKolamSaleItemVoucherLabel(item: {
  voucherCode?: string | null;
  voucherDiscountType?: string | null;
  voucherDiscountValue?: number | null;
}): string {
  const code = String(item.voucherCode ?? '').trim();
  if (!code) {
    return '';
  }
  if (
    String(item.voucherDiscountType || '').toLowerCase() === 'percentage' &&
    Number(item.voucherDiscountValue) > 0
  ) {
    return `${code} (${item.voucherDiscountValue}%)`;
  }
  return code;
}

/**
 * BE `_sale-status-handlers`: approve/reject pending discount only for
 * finance or super-admin role keys (in addition to sale:update_status).
 */
export function canApproveKolamSaleDiscount(roleKey?: string | null): boolean {
  const normalized = String(roleKey ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  return (
    normalized === 'finance' ||
    normalized === 'super_admin' ||
    normalized === 'super_administrator' ||
    normalized === 'superadmin'
  );
}

/** FE Discount Approval: scrape saleHistories notes for finance/discount reasons. */
export function getKolamSaleDiscountApprovalReasons(
  sale: Pick<KolamSale, 'saleHistories'> | null | undefined,
): string[] {
  const reasons: string[] = [];
  for (const history of sale?.saleHistories ?? []) {
    const note = String(history.note ?? '').trim();
    if (!note) {
      continue;
    }
    const lower = note.toLowerCase();
    if (
      lower.includes('finance approval') ||
      lower.includes('below minimum') ||
      lower.includes('discount') ||
      lower.includes('voucher')
    ) {
      reasons.push(note);
    }
  }
  return reasons;
}

export function formatKolamSaleItemDiscountLabel(
  discount: KolamSaleItemDiscount | null | undefined,
): string {
  if (!discount || !(Number(discount.amount) > 0)) {
    return '';
  }
  if (String(discount.type || '').toLowerCase() === 'percentage') {
    return `${discount.amount}%`;
  }
  return String(discount.amount);
}

/**
 * FE ItemRow fallback: Profit Bersih = subtotal − HPP − komisi (− PM share).
 * Matches `sales-items-table` when full breakdown panels are absent.
 */
export function getKolamSaleItemNetProfit(
  item: {
    subtotal?: number | null;
    itemType?: string | null;
    quantity?: number | null;
    unitCostAtSale?: number | null;
    customCost?: number | null;
  },
  commissionShare = 0,
  paymentMethodShare = 0,
): number {
  return Math.round(
    (Number(item.subtotal) || 0) -
      getKolamSaleItemHppTotal(item) -
      Math.max(0, paymentMethodShare) -
      Math.max(0, commissionShare),
  );
}

/**
 * FE `InternalSaleProfitSummaryPanel` netProfit:
 * pendapatan item − HPP − biaya PM − komisi (PPN deferred until tax snapshot ported).
 */
export function getKolamSaleInternalNetProfit(sale: {
  items?: Array<{
    itemType?: string | null;
    subtotal?: number | null;
    quantity?: number | null;
    unitCostAtSale?: number | null;
    customCost?: number | null;
  }> | null;
  hppTotalAtSale?: number | null;
  commissionAccruedTotalAtSale?: number | null;
  paymentMethodCost?: number | null;
  sourceCost?: number | null;
  marketplaceSource?: string | null;
}): number {
  const items = sale.items ?? [];
  const grossSubtotal = items
    .filter(item => {
      const type = String(item.itemType ?? '').toLowerCase();
      return type === 'product' || type === 'species';
    })
    .reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
  const hppFromItems = items.reduce(
    (sum, item) => sum + getKolamSaleItemHppTotal(item),
    0,
  );
  const totalHpp =
    sale.hppTotalAtSale != null
      ? Math.max(0, Math.round(Number(sale.hppTotalAtSale) || 0))
      : hppFromItems;
  const marketplaceFee = sale.marketplaceSource
    ? Math.max(0, Number(sale.sourceCost) || 0)
    : 0;
  return Math.round(
    grossSubtotal -
      totalHpp -
      Math.max(0, Number(sale.paymentMethodCost) || 0) -
      Math.max(0, Number(sale.commissionAccruedTotalAtSale) || 0) -
      marketplaceFee,
  );
}

/** @deprecated Prefer getKolamSaleInternalNetProfit for Internal summary. */
export function getKolamSaleEstimatedMargin(sale: {
  finalTotal?: number | null;
  hppTotalAtSale?: number | null;
  commissionAccruedTotalAtSale?: number | null;
  paymentMethodCost?: number | null;
}): number {
  return Math.round(
    (Number(sale.finalTotal) || 0) -
      (Number(sale.hppTotalAtSale) || 0) -
      (Number(sale.commissionAccruedTotalAtSale) || 0) -
      (Number(sale.paymentMethodCost) || 0),
  );
}

/**
 * FE `getItemCommission` — proportional by subtotal among non-custom lines.
 */
export function allocateKolamSaleCommissionShares(
  items: Array<{ itemType?: string | null; subtotal?: number | null }>,
  totalCommission: number,
): number[] {
  const shares = items.map(() => 0);
  const total = Math.max(0, Math.round(Number(totalCommission) || 0));
  if (total <= 0) {
    return shares;
  }
  const eligibleIndexes: number[] = [];
  let productSubtotalSum = 0;
  items.forEach((item, index) => {
    const type = String(item.itemType ?? '').toLowerCase();
    if (type === 'custom') {
      return;
    }
    const sub = Math.max(0, Number(item.subtotal) || 0);
    eligibleIndexes.push(index);
    productSubtotalSum += sub;
  });
  if (!eligibleIndexes.length || productSubtotalSum <= 0) {
    return shares;
  }
  let allocated = 0;
  eligibleIndexes.forEach((index, i) => {
    const isLast = i === eligibleIndexes.length - 1;
    const sub = Math.max(0, Number(items[index]?.subtotal) || 0);
    const share = isLast
      ? total - allocated
      : Math.round((total * sub) / productSubtotalSum);
    shares[index] = Math.max(0, share);
    allocated += share;
  });
  return shares;
}

/** FE proportional PM cost shares across product/species lines. */
export function allocateKolamSalePaymentMethodShares(
  items: Array<{ itemType?: string | null; subtotal?: number | null }>,
  paymentMethodCost: number,
): number[] {
  const shares = items.map(() => 0);
  const total = Math.max(0, Math.round(Number(paymentMethodCost) || 0));
  if (total <= 0) {
    return shares;
  }
  const eligibleIndexes: number[] = [];
  let baseSum = 0;
  items.forEach((item, index) => {
    const type = String(item.itemType ?? '').toLowerCase();
    if (type !== 'product' && type !== 'species') {
      return;
    }
    const sub = Math.max(0, Number(item.subtotal) || 0);
    if (sub <= 0) {
      return;
    }
    eligibleIndexes.push(index);
    baseSum += sub;
  });
  if (!eligibleIndexes.length || baseSum <= 0) {
    return shares;
  }
  let allocated = 0;
  eligibleIndexes.forEach((index, i) => {
    const isLast = i === eligibleIndexes.length - 1;
    const sub = Math.max(0, Number(items[index]?.subtotal) || 0);
    const share = isLast
      ? total - allocated
      : Math.round((total * sub) / baseSum);
    shares[index] = Math.max(0, share);
    allocated += share;
  });
  return shares;
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

/**
 * FE `resolveDeliveryDbFilterLabel` — raw DB `deliveryStatus` labels for filters /
 * transition targets. Complaint window statuses stay explicit here.
 */
export function formatKolamSaleDeliveryFilterLabel(
  deliveryStatus?: string | null,
): string {
  const ds = String(deliveryStatus || '').toLowerCase();
  if (ds === KOLAM_SALES_NEED_DELIVERY_FILTER) {
    return 'Butuh kirim';
  }
  if (!ds) {
    return '(kosong)';
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

/**
 * FE `resolveShippingDisplayLabel` — optional `sale` remaps `waiting_pickup`
 * for marketplace drop-off vs courier pickup (DB status stays waiting_pickup).
 * Complaint-window statuses map to "Terkirim" (komplain is a separate column).
 * Filter dropdowns should use `formatKolamSaleDeliveryFilterLabel` instead.
 */
export function formatKolamSaleDeliveryStatusLabel(
  deliveryStatus?: string | null,
  paymentStatus?: string | null,
  sale?: KolamSaleFulfillmentContext | null,
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
  if (pay === 'paid' && ds === 'waiting_pickup') {
    return resolveKolamWaitingPickupDisplayLabel(sale);
  }
  // Escrow / complaint window — logistics already delivered (FE shipping column).
  if (ds === 'waiting_complaints' || ds === 'complaint') {
    return 'Terkirim';
  }
  switch (ds) {
    case 'none':
      return 'Belum dikirim';
    case 'packing':
      return 'Sedang dipacking';
    case 'waiting_pickup':
      return resolveKolamWaitingPickupDisplayLabel(sale);
    case 'on_delivery':
      return 'Dalam pengiriman';
    case 'delivered':
      return 'Terkirim';
    case 'success':
      return 'Pengiriman selesai';
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
  if (ds === 'success') {
    return 'success';
  }
  // delivered + complaint-window statuses share "Terkirim" shipping display.
  if (
    ds === 'delivered' ||
    ds === 'waiting_complaints' ||
    ds === 'complaint'
  ) {
    return 'success';
  }
  if (ds === 'on_delivery' || ds === 'waiting_pickup' || ds === 'packing') {
    return 'info';
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

export function isKolamSaleShippingAutomationActive(sale: {
  shippingAutomationActive?: boolean | null;
}): boolean {
  return sale.shippingAutomationActive === true;
}

/** Minimal sale shape for FE `fulfillment-display` helpers. */
export type KolamSaleFulfillmentContext = {
  status?: string | null;
  deliveryStatus?: string | null;
  marketplaceSource?: string | null;
  shippingService?: {trackingNumber?: string | null} | null;
  marketplaceFulfillment?: KolamSaleMarketplaceFulfillment | null;
};

function getMarketplaceFulfillmentSource(
  sale: KolamSaleFulfillmentContext,
): string {
  return String(sale.marketplaceSource || '').toLowerCase();
}

function getMarketplaceFulfillmentMode(
  sale: KolamSaleFulfillmentContext,
): string {
  return String(sale.marketplaceFulfillment?.fulfillmentMode || '').toLowerCase();
}

function hasKolamMarketplaceTrackingSynced(
  sale: KolamSaleFulfillmentContext,
): boolean {
  const source = getMarketplaceFulfillmentSource(sale);
  const extTracking = sale.marketplaceFulfillment?.trackingNumber;
  const svcTracking = sale.shippingService?.trackingNumber;
  if (source !== 'shopee' && source !== 'tokopedia') {
    return false;
  }
  return !!String(extTracking || svcTracking || '').trim();
}

function isKolamTokopediaShipmentSyncStarted(
  sale: KolamSaleFulfillmentContext,
): boolean {
  if (getMarketplaceFulfillmentSource(sale) !== 'tokopedia') {
    return false;
  }
  const status = Number(sale.marketplaceFulfillment?.lastStatus);
  return Number.isFinite(status) && status >= 102;
}

/** FE `isTokopediaDropOffOnly` — drop-off only, no courier pickup via Kolam/AM UI. */
export function isKolamTokopediaDropOffOnly(
  sale: KolamSaleFulfillmentContext,
): boolean {
  if (getMarketplaceFulfillmentSource(sale) !== 'tokopedia') {
    return false;
  }
  return getMarketplaceFulfillmentMode(sale) === 'dropoff';
}

/** FE `isShopeeDropOffOnly`. */
export function isKolamShopeeDropOffOnly(
  sale: KolamSaleFulfillmentContext,
): boolean {
  if (getMarketplaceFulfillmentSource(sale) !== 'shopee') {
    return false;
  }
  return getMarketplaceFulfillmentMode(sale) === 'dropoff';
}

/** FE `isShopeeDropOffArrangedOnSale` — drop-off already arranged (resi / flag). */
export function isKolamShopeeDropOffArrangedOnSale(
  sale: KolamSaleFulfillmentContext,
): boolean {
  if (!isKolamShopeeDropOffOnly(sale)) {
    return false;
  }
  if (hasKolamMarketplaceTrackingSynced(sale)) {
    return true;
  }
  return sale.marketplaceFulfillment?.pickupArranged === true;
}

/**
 * FE `resolveWaitingPickupDisplayLabel` — pickup kurir vs drop-off antar gerai.
 * DB `deliveryStatus` tetap `waiting_pickup`; label mengikuti fulfillmentMode.
 */
export function resolveKolamWaitingPickupDisplayLabel(
  sale?: KolamSaleFulfillmentContext | null,
): string {
  if (sale && isKolamShopeeDropOffOnly(sale)) {
    if (isKolamShopeeDropOffArrangedOnSale(sale)) {
      return 'Drop Off';
    }
    return 'Menunggu dibawa ke gerai';
  }
  if (sale && isKolamTokopediaDropOffOnly(sale)) {
    return 'Menunggu dibawa ke gerai';
  }
  return 'Menunggu di jemput kurir';
}

function isKolamShopeePickupArrangedOnSale(
  sale: KolamSaleFulfillmentContext,
): boolean {
  if (getMarketplaceFulfillmentSource(sale) !== 'shopee') {
    return false;
  }
  const fulfillment = sale.marketplaceFulfillment;
  if (!fulfillment) {
    return false;
  }
  if (isKolamShopeeDropOffOnly(sale)) {
    const pickupTime = Number(fulfillment.pickupTime);
    return Number.isFinite(pickupTime) && pickupTime > 0;
  }
  if (fulfillment.pickupArranged === true) {
    return true;
  }
  const pickupTime = Number(fulfillment.pickupTime);
  if (Number.isFinite(pickupTime) && pickupTime > 0) {
    return true;
  }
  return hasKolamMarketplaceTrackingSynced(sale);
}

/**
 * FE `isMarketplaceShipmentSyncStarted` — hide platform pickup once sync started.
 */
export function isKolamMarketplaceShipmentSyncStarted(
  sale: KolamSaleFulfillmentContext,
): boolean {
  if (!isKolamSaleMarketplaceManaged(sale) || sale.status !== 'paid') {
    return false;
  }
  if (hasKolamMarketplaceTrackingSynced(sale)) {
    return true;
  }
  const source = getMarketplaceFulfillmentSource(sale);
  if (source === 'shopee' && isKolamShopeePickupArrangedOnSale(sale)) {
    return true;
  }
  if (source === 'tokopedia' && isKolamTokopediaShipmentSyncStarted(sale)) {
    return true;
  }
  const ds = String(sale.deliveryStatus || 'none').toLowerCase();
  return (
    ds === 'waiting_pickup' ||
    ds === 'on_delivery' ||
    ds === 'delivered' ||
    ds === 'success'
  );
}

/**
 * FE `shouldShowTokopediaDropOffBadge` — badge antar counter, belum sync kirim.
 */
export function shouldShowKolamTokopediaDropOffBadge(
  sale: KolamSaleFulfillmentContext,
): boolean {
  if (!isKolamSaleMarketplaceManaged(sale) || sale.status !== 'paid') {
    return false;
  }
  if (!isKolamTokopediaDropOffOnly(sale)) {
    return false;
  }
  if (isKolamMarketplaceShipmentSyncStarted(sale)) {
    return false;
  }
  const ds = String(sale.deliveryStatus || 'none').toLowerCase();
  return ds === 'none' || ds === 'packing';
}

/**
 * FE `needsPlatformPickupRequest` — olshop paid + butuh request jemput platform.
 * Tokopedia `dropoff` disembunyikan (parity FE); mode `pickup`/`both`/`unknown` eligible.
 */
export function needsKolamPlatformPickupRequest(
  sale: KolamSaleFulfillmentContext,
): boolean {
  if (!isKolamSaleMarketplaceManaged(sale) || sale.status !== 'paid') {
    return false;
  }
  if (isKolamMarketplaceShipmentSyncStarted(sale)) {
    return false;
  }
  if (isKolamTokopediaDropOffOnly(sale)) {
    return false;
  }
  if (isKolamShopeeDropOffOnly(sale)) {
    return false;
  }
  const ds = String(sale.deliveryStatus || 'none').toLowerCase();
  return ds === 'none' || ds === 'packing';
}

/**
 * JungleSystem Batch 1 — Tokopedia jemput kurir only.
 * Shopee slot/modal/reschedule tetap out of scope sampai diminta eksplisit.
 */
export function needsKolamTokopediaPickupRequest(
  sale: KolamSaleFulfillmentContext,
): boolean {
  if (getMarketplaceFulfillmentSource(sale) !== 'tokopedia') {
    return false;
  }
  return needsKolamPlatformPickupRequest(sale);
}

export function getKolamSaleMarketplaceFulfillment(sale: {
  marketplaceFulfillment?: KolamSaleMarketplaceFulfillment | null;
}): KolamSaleMarketplaceFulfillment | null {
  return sale.marketplaceFulfillment ?? null;
}

/** FE sales-invoice header: paid sales without existing tickets can open create. */
export function canOpenKolamSaleComplaintCreate(sale: {
  status?: string | null;
  hasComplaints?: boolean;
}): boolean {
  return (
    String(sale.status ?? '').toLowerCase() === 'paid' && !sale.hasComplaints
  );
}

/** FE SalesSuccessConfirmation visibility (non-marketplace). */
export function canShowKolamSaleComplaintSuccessPrompt(sale: {
  status?: string | null;
  deliveryStatus?: string | null;
  marketplaceSource?: string | null;
}): boolean {
  return (
    !isKolamSaleMarketplaceManaged(sale) &&
    String(sale.status ?? '').toLowerCase() === 'paid' &&
    String(sale.deliveryStatus ?? '').toLowerCase() === 'delivered'
  );
}

export function getKolamSaleMainComplaint(sale: {
  complaints?: KolamSaleComplaintRef[] | null;
}): KolamSaleComplaintRef | null {
  return sale.complaints?.[0] ?? null;
}

/** FE `TERMINAL_COMPLAINT_STATUSES` — open tickets still count as active. */
const KOLAM_SALE_TERMINAL_COMPLAINT_STATUSES = new Set([
  'completed',
  'cancelled',
  'rejected',
  'closed',
]);

/**
 * FE `resolveComplaintDisplayLabel` — complaint column (not shipping).
 */
export function resolveKolamSaleComplaintDisplayLabel(sale: {
  deliveryStatus?: string | null;
  hasComplaints?: boolean;
  complaints?: Array<{status?: string | null}> | null;
}): string {
  const complaints = sale.complaints ?? [];
  const hasActiveComplaint = complaints.some(
    c =>
      !KOLAM_SALE_TERMINAL_COMPLAINT_STATUSES.has(
        String(c.status || '').toLowerCase(),
      ),
  );
  if (sale.hasComplaints && hasActiveComplaint) {
    return 'Komplain diproses';
  }

  const ds = String(sale.deliveryStatus || '').toLowerCase();
  if (ds === 'waiting_complaints') {
    return 'Menunggu komplain';
  }
  if (ds === 'complaint') {
    return 'Komplain diproses';
  }
  return 'Tidak dikomplain';
}

/** FE `salesListComplaintLabel` — short labels for the sales list Komplain cell. */
export function formatKolamSaleListComplaintLabel(raw: string): string {
  if (raw === 'Tidak dikomplain') {
    return 'Lulus';
  }
  if (raw === 'Menunggu komplain') {
    return 'Menunggu';
  }
  if (raw === 'Komplain diproses') {
    return 'Komplain';
  }
  return raw;
}

function getKolamSaleLinkedComplaintBadgeIntent(
  status?: string | null,
): KolamSaleStatusIntent {
  const key = String(status || '').toLowerCase();
  if (
    key === 'pending' ||
    key === 'in_review' ||
    key === 'rework_review'
  ) {
    return 'warning';
  }
  if (key === 'rejected' || key === 'cancelled') {
    return 'danger';
  }
  if (key === 'completed' || key === 'closed' || key === 'approved') {
    return 'success';
  }
  if (
    key === 'return_in_transit' ||
    key === 'return_received' ||
    key === 'processing' ||
    key === 'rework_in_progress'
  ) {
    return 'info';
  }
  return 'secondary';
}

/**
 * FE sales list Komplain cell — badge vs muted "Lulus" text.
 */
export function getKolamSaleListComplaintDisplay(sale: {
  deliveryStatus?: string | null;
  hasComplaints?: boolean;
  complaints?: KolamSaleComplaintRef[] | null;
}): {
  label: string;
  intent: KolamSaleStatusIntent;
  asBadge: boolean;
} {
  const main = getKolamSaleMainComplaint(sale);
  if (sale.hasComplaints && main) {
    return {
      label: 'Komplain',
      intent: getKolamSaleLinkedComplaintBadgeIntent(main.status),
      asBadge: true,
    };
  }

  const raw = resolveKolamSaleComplaintDisplayLabel(sale);
  const label = formatKolamSaleListComplaintLabel(raw);
  if (raw === 'Tidak dikomplain') {
    return {label, intent: 'muted', asBadge: false};
  }
  if (raw === 'Komplain diproses') {
    return {label, intent: 'danger', asBadge: true};
  }
  return {label, intent: 'warning', asBadge: true};
}

/**
 * FE `getSaleTrackingNumber`: marketplace externalRef → shippingService.
 * Callers pass marketplace tracking via sale fields already merged in normalize.
 */
export function getKolamSaleTrackingNumber(sale: {
  shippingService?: KolamSaleShippingService | null;
}): string {
  return String(sale.shippingService?.trackingNumber || '').trim();
}

export function getKolamSaleServiceLabel(sale: {
  shippingService?: KolamSaleShippingService | null;
  items?: Array<{ biteshipServiceCode?: string | null }> | null;
}): string {
  const fromService =
    sale.shippingService?.serviceName?.trim() ||
    sale.shippingService?.serviceCode?.trim().toUpperCase() ||
    '';
  if (fromService) {
    return fromService;
  }
  for (const item of sale.items ?? []) {
    const code = String(item.biteshipServiceCode || '').trim();
    if (code) {
      return code.toUpperCase();
    }
  }
  return '';
}

export type KolamSaleCourierDisplay = {
  name: string;
  logoKey: string | null;
};

/** FE shipping-info courier chips (deduped). */
export function getKolamSaleCouriers(sale: {
  shippingService?: KolamSaleShippingService | null;
  items?: Array<{
    biteshipCourierCode?: string | null;
    shippingMethodName?: string | null;
  }> | null;
}): KolamSaleCourierDisplay[] {
  const couriers: KolamSaleCourierDisplay[] = [];
  const seen = new Set<string>();

  for (const item of sale.items ?? []) {
    let name = '';
    let code = '';
    if (item.biteshipCourierCode?.trim()) {
      code = item.biteshipCourierCode.trim().toLowerCase();
      name = item.biteshipCourierCode.trim().toUpperCase();
    } else if (item.shippingMethodName?.trim()) {
      name = item.shippingMethodName.trim();
      code = name.toLowerCase();
    }
    if (!name) {
      continue;
    }
    const key = code || name.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    couriers.push({
      name,
      logoKey: resolveKolamCourierLogoKey(code || name),
    });
  }

  if (!couriers.length && sale.shippingService?.courierName?.trim()) {
    const name = sale.shippingService.courierName.trim();
    const code =
      sale.shippingService.courierCode?.trim().toLowerCase() ||
      name.toLowerCase();
    couriers.push({
      name,
      logoKey: resolveKolamCourierLogoKey(code),
    });
  }

  return couriers;
}

/**
 * Map courier code/name → FE logo key (`jne`, `jnt`, `sicepat`, …).
 */
export function resolveKolamCourierLogoKey(
  codeOrName: string | null | undefined,
): string | null {
  const raw = String(codeOrName || '')
    .toLowerCase()
    .trim();
  if (!raw) {
    return null;
  }
  const compact = raw.replace(/[\s._-]+/g, '');
  if (compact.includes('anteraja') || compact === 'anter') {
    return 'anteraja';
  }
  if (
    compact.includes('jnt') ||
    compact.includes('j&t') ||
    compact.includes('jet') ||
    compact === 'jtexpress'
  ) {
    return 'jnt';
  }
  if (compact.includes('jne')) {
    return 'jne';
  }
  if (compact.includes('sicepat')) {
    return 'sicepat';
  }
  if (compact.includes('tiki')) {
    return 'tiki';
  }
  if (compact.includes('lion')) {
    return 'lion';
  }
  if (compact.includes('grab')) {
    return 'grab';
  }
  if (compact.includes('gojek') || compact.includes('gosend')) {
    return 'gojek';
  }
  if (compact.includes('ninja')) {
    return 'ninja';
  }
  if (compact.includes('posindonesia') || compact === 'pos') {
    return 'pos';
  }
  return compact.length <= 24 ? compact : null;
}

/**
 * FE `getMarketplaceLogisticsView` — perjalanan paket Shopee/Tokopedia.
 */
export function getKolamSaleMarketplaceLogistics(sale: {
  marketplaceSource?: string | null;
  marketplaceLogistics?: KolamSaleMarketplaceLogistics | null;
}): KolamSaleMarketplaceLogistics | null {
  if (!sale.marketplaceLogistics) {
    return null;
  }
  const { platform, timeline, lastUpdate } = sale.marketplaceLogistics;
  if (!timeline.length && !lastUpdate) {
    return null;
  }
  void sale.marketplaceSource;
  return sale.marketplaceLogistics;
}

export function formatKolamSaleLogisticsTime(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  const ms = date.getTime();
  if (!Number.isFinite(ms) || ms <= 0) {
    return null;
  }
  return date.toLocaleString('id-ID', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function formatKolamSaleWalletTxTypeLabel(type?: string | null): string {
  if (type === 'credit') {
    return 'Kredit';
  }
  if (type === 'debit') {
    return 'Debit';
  }
  return type?.trim() || '—';
}

export function formatKolamSaleWalletConfirmStatusLabel(
  status?: string | null,
): string {
  switch (String(status || '').toLowerCase()) {
    case 'confirmed':
      return 'Dikonfirmasi';
    case 'rejected':
      return 'Ditolak';
    case 'unconfirmed':
      return 'Menunggu';
    default:
      return status?.trim() || 'Menunggu';
  }
}

export function getKolamSaleWalletConfirmStatusIntent(
  status?: string | null,
): KolamSaleStatusIntent {
  switch (String(status || '').toLowerCase()) {
    case 'confirmed':
      return 'success';
    case 'rejected':
      return 'danger';
    default:
      return 'warning';
  }
}

/** FE WalletTransactionsSection `getSourceLabel` (sale-related subset + fallback). */
export function formatKolamSaleWalletSourceLabel(source?: string | null): string {
  if (!source) {
    return 'Tidak diketahui';
  }
  const labels: Record<string, string> = {
    deposit: 'Drop Dana',
    withdraw: 'Tarik Dana',
    transfer: 'Transfer',
    initial_deposit: 'Saldo Awal',
    adjustment: 'Penyesuaian',
    sale: 'Penjualan',
    sale_revenue: 'Pendapatan penjualan',
    custom_project: 'Proyek kustom',
    commission: 'Komisi',
    refund: 'Pengembalian',
    complaint: 'Komplain',
    shipping_collected: 'Ongkir (titipan)',
    shipping_passthrough: 'Ongkir (auto-pass)',
    shipping_settlement: 'Ongkir (settlement)',
    cost_of_sale: 'Biaya penjualan',
    unexpected_income: 'Pendapatan lain',
    payable: 'Hutang',
    payable_payment: 'Bayar hutang',
    receivable_payment: 'Terima piutang',
  };
  return labels[source] || source.replace(/_/g, ' ');
}

export function formatKolamSaleWalletTypeLabel(type?: string | null): string {
  switch (String(type || '').toLowerCase()) {
    case 'main':
      return 'Utama';
    case 'regular':
      return 'Reguler';
    case 'virtual':
      return 'Virtual';
    case 'cash':
      return 'Tunai';
    default:
      return type?.trim() || '—';
  }
}

/**
 * FE list uses populated `sourceRef.logo`; detail GET often omits `logo`.
 * Prefer sale embed, then active Sales Source catalog option.
 */
export function resolveKolamSaleSourceLogoUri(
  sale: {
    sourceRef?: { id?: string | null; logoUri?: string | null } | null;
  },
  sources: Array<{ id: string; logoUri?: string | null }> = [],
): string | null {
  const embedded = sale.sourceRef?.logoUri?.trim() || '';
  if (embedded) {
    return embedded;
  }
  const sourceId = sale.sourceRef?.id?.trim() || '';
  if (!sourceId) {
    return null;
  }
  const fromCatalog = sources.find(row => row.id === sourceId)?.logoUri?.trim();
  return fromCatalog || null;
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
  /** Sales Source master logo — prefer this over sale embed when detail omits logo. */
  logoUri: string | null;
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
  shippingMethodId: string;
  shippingCost: string;
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
  /** Sale-level shipping total (FE `shippingCost`; editable, synced from items). */
  shippingCost: string;
  /** Document-level ToS template ids (optional; FE `termsTemplates`). */
  termsTemplateIds: string[];
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
  shippingMethod?: string;
  shippingCost?: number;
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
  /** Document-level Terms of Service template ObjectIds. */
  termsTemplates?: string[];
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

/** Same ranges as FE beranda / sales analytics (`SalesGraphRange` minus `today`). */
export type KolamSaleAnalyticsRange = 'week' | 'month' | 'year' | 'all';

export interface KolamSaleAnalyticsSourceRow {
  sourceId: string;
  name: string;
  logoUri: string | null;
  type: string;
  orderCount: number;
}

export interface KolamSaleAnalyticsTimelinePoint {
  timestamp: string;
  successCount: number;
  failedCount: number;
}

/** `GET /sales/analytics/overview` — FE `SalesAnalyticsOverview`. */
export interface KolamSaleAnalyticsOverview {
  range: KolamSaleAnalyticsRange;
  bySource: KolamSaleAnalyticsSourceRow[];
  timeline: KolamSaleAnalyticsTimelinePoint[];
  totals: {
    orders: number;
    success: number;
    failed: number;
  };
}

export const KOLAM_SALE_ANALYTICS_RANGE_OPTIONS: Array<{
  id: KolamSaleAnalyticsRange;
  label: string;
  hint: string;
}> = [
  {
    id: 'week',
    label: '7 Hari',
    hint: 'Per hari — 7 hari terakhir',
  },
  {
    id: 'month',
    label: 'Bulan Ini',
    hint: 'Per minggu — seluruh minggu dalam bulan berjalan',
  },
  {
    id: 'year',
    label: 'Tahun Ini',
    hint: 'Per bulan — Jan–Des tahun ini',
  },
  {
    id: 'all',
    label: 'Sepanjang Waktu',
    hint: 'Per tahun — sejak toko mulai berjualan',
  },
];

export const EMPTY_KOLAM_SALE_ANALYTICS: KolamSaleAnalyticsOverview = {
  range: 'month',
  bySource: [],
  timeline: [],
  totals: { orders: 0, success: 0, failed: 0 },
};

export function getKolamSaleAnalyticsRangeHint(
  range: KolamSaleAnalyticsRange,
): string {
  return (
    KOLAM_SALE_ANALYTICS_RANGE_OPTIONS.find(option => option.id === range)
      ?.hint ?? KOLAM_SALE_ANALYTICS_RANGE_OPTIONS[1].hint
  );
}

export function formatKolamSaleAnalyticsBucketLabel(
  timestamp: string,
  range: KolamSaleAnalyticsRange,
): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }
  if (range === 'all') {
    return date.toLocaleDateString('id-ID', { year: 'numeric' });
  }
  if (range === 'year') {
    return date.toLocaleDateString('id-ID', { month: 'short' });
  }
  if (range === 'month') {
    const day = Number(
      new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        timeZone: 'Asia/Jakarta',
      }).format(date),
    );
    const week = Math.floor((day - 1) / 7) + 1;
    return `Mgu ${week}`;
  }
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function normalizeKolamSaleAnalyticsOverview(
  payload: unknown,
  rangeFallback: KolamSaleAnalyticsRange = 'month',
): KolamSaleAnalyticsOverview {
  const root = asRecord(payload);
  const nested = asRecord(root.data);
  const record =
    Object.keys(nested).length > 0 &&
    (Array.isArray(nested.bySource) || Array.isArray(nested.timeline))
      ? nested
      : root;

  const rangeRaw = getString(record, 'range').toLowerCase();
  const range: KolamSaleAnalyticsRange =
    rangeRaw === 'week' ||
    rangeRaw === 'month' ||
    rangeRaw === 'year' ||
    rangeRaw === 'all'
      ? rangeRaw
      : rangeFallback;

  const bySourceRaw = Array.isArray(record.bySource) ? record.bySource : [];
  const bySource = bySourceRaw.map((row, index) => {
    const item = asRecord(row);
    const sourceId =
      getMongoId(item, 'sourceId') ||
      getMongoId(item, '_id') ||
      getMongoId(item, 'id') ||
      `source-${index}`;
    const logo = getString(item, 'logo');
    return {
      sourceId,
      name: getString(item, 'name') || '—',
      logoUri: logo ? getKolamFileUrl(logo) : null,
      type: getString(item, 'type'),
      orderCount:
        getNumber(item, 'orderCount') ??
        getNumber(item, 'count') ??
        0,
    } satisfies KolamSaleAnalyticsSourceRow;
  });

  const timelineRaw = Array.isArray(record.timeline) ? record.timeline : [];
  const timeline = timelineRaw.map(row => {
    const item = asRecord(row);
    return {
      timestamp:
        getString(item, 'timestamp') || stringifyDate(item.timestamp) || '',
      successCount: getNumber(item, 'successCount') ?? 0,
      failedCount: getNumber(item, 'failedCount') ?? 0,
    } satisfies KolamSaleAnalyticsTimelinePoint;
  });

  const totalsRecord = asRecord(record.totals);
  const totals = {
    orders:
      getNumber(totalsRecord, 'orders') ??
      bySource.reduce((sum, row) => sum + row.orderCount, 0),
    success:
      getNumber(totalsRecord, 'success') ??
      timeline.reduce((sum, row) => sum + row.successCount, 0),
    failed:
      getNumber(totalsRecord, 'failed') ??
      timeline.reduce((sum, row) => sum + row.failedCount, 0),
  };

  return { range, bySource, timeline, totals };
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
    shippingMethodId: '',
    shippingCost: '',
    discountType: 'percentage',
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
    pointsMethod: 'product_based',
    manualPoints: '',
    transactionDate: '',
    shippingCost: '',
    termsTemplateIds: [],
    items: [createEmptyKolamSaleCreateItem()],
    customCosts: [],
  };
}

/**
 * FE create maps `availableShippingMethods` as string ObjectIds or populated
 * docs. List payloads usually keep bare ids — extract both shapes.
 */
function extractCatalogShippingMethodIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const ids: string[] = [];
  for (const entry of value) {
    if (typeof entry === 'string') {
      const id = entry.trim();
      if (id) {
        ids.push(id);
      }
      continue;
    }
    if (!entry || typeof entry !== 'object') {
      continue;
    }
    const record = entry as Record<string, unknown>;
    const rawId = record._id ?? record.id;
    if (typeof rawId === 'string' && rawId.trim()) {
      ids.push(rawId.trim());
      continue;
    }
    if (rawId && typeof rawId === 'object') {
      const nested = rawId as Record<string, unknown>;
      if (typeof nested.$oid === 'string' && nested.$oid.trim()) {
        ids.push(nested.$oid.trim());
      }
    }
  }
  return ids;
}

function readRawAvailableShippingMethods(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') {
    return undefined;
  }
  return (raw as Record<string, unknown>).availableShippingMethods;
}

/** Shipping method ids allowed for the selected catalog row (FE create parity). */
export function resolveKolamSaleCreateItemShippingMethodIds(
  item: KolamSaleCreateItemForm,
  products: KolamProduct[],
  speciesList: KolamSpecies[],
): string[] {
  if (item.itemType === 'product' && item.productId.trim()) {
    const product = products.find(row => row.id === item.productId);
    if (!product) {
      return [];
    }
    const fromRaw = extractCatalogShippingMethodIds(
      readRawAvailableShippingMethods(product.raw),
    );
    if (fromRaw.length > 0) {
      return fromRaw;
    }
    // Ignore synthetic ids from unpopulated list rows (`shipping-1`, …).
    return extractCatalogShippingMethodIds(product.logistics.shippingMethods).filter(
      id => !/^shipping-\d+$/i.test(id),
    );
  }
  if (item.itemType === 'species' && item.speciesId.trim()) {
    const species = speciesList.find(row => row.id === item.speciesId);
    if (!species) {
      return [];
    }
    const fromNormalized = extractCatalogShippingMethodIds(
      species.availableShippingMethods,
    );
    if (fromNormalized.length > 0) {
      return fromNormalized;
    }
    return extractCatalogShippingMethodIds(
      readRawAvailableShippingMethods(species.raw),
    );
  }
  return [];
}

export function filterKolamSaleCreateItemShippingMethods(
  allMethods: KolamShippingMethod[],
  allowedIds: string[],
): KolamShippingMethod[] {
  if (!allowedIds.length) {
    return [];
  }
  const allowed = new Set(allowedIds);
  return allMethods.filter(method => allowed.has(method.id));
}

export function estimateKolamSaleCreateItemShippingCost(
  method: Pick<KolamShippingMethod, 'pricingPrice'> | null | undefined,
): number {
  if (!method) {
    return 0;
  }
  return Math.max(0, method.pricingPrice || 0);
}

/** Preview unit price for create-form line totals (FE Total column). */
export function resolveKolamSaleCreateItemUnitPrice(
  item: KolamSaleCreateItemForm,
  products: KolamProduct[],
  speciesList: KolamSpecies[],
): number {
  if (item.itemType === 'custom') {
    return Math.max(0, Number(item.customUnitPrice) || 0);
  }
  if (item.itemType === 'product' && item.productId.trim()) {
    const product = products.find(row => row.id === item.productId);
    return Math.max(0, product?.priceToSell ?? product?.price ?? 0);
  }
  if (item.itemType === 'species' && item.speciesId.trim()) {
    const species = speciesList.find(row => row.id === item.speciesId);
    return Math.max(0, species?.priceToSell ?? 0);
  }
  return 0;
}

/** Line total after per-item discount (excludes shipping; FE Total cell). */
export function estimateKolamSaleCreateItemLineTotal(
  item: KolamSaleCreateItemForm,
  products: KolamProduct[],
  speciesList: KolamSpecies[],
): { discount: number; subtotal: number; total: number; unitPrice: number } {
  const quantity =
    item.itemType === 'enclosure'
      ? 1
      : Math.max(0, Number(item.quantity) || 0);
  const unitPrice = resolveKolamSaleCreateItemUnitPrice(
    item,
    products,
    speciesList,
  );
  const subtotal = unitPrice * quantity;
  const discountRaw = Number(item.discountAmount);
  let discount = 0;
  if (Number.isFinite(discountRaw) && discountRaw > 0) {
    discount =
      item.discountType === 'percentage'
        ? (subtotal * discountRaw) / 100
        : discountRaw;
  }
  discount = Math.min(Math.max(0, discount), subtotal);
  return {
    unitPrice,
    subtotal,
    discount,
    total: Math.max(0, subtotal - discount),
  };
}

/** Sum of per-item shipping costs (FE form.shippingCost auto-total). */
export function sumKolamSaleCreateItemShippingCost(
  items: KolamSaleCreateItemForm[],
): number {
  return items.reduce((sum, item) => {
    const cost = Number(item.shippingCost);
    return sum + (Number.isFinite(cost) && cost > 0 ? cost : 0);
  }, 0);
}

export function isKolamSaleCreateItemFilled(
  item: KolamSaleCreateItemForm,
): boolean {
  switch (item.itemType) {
    case 'product':
      return Boolean(item.productId.trim());
    case 'species':
      return Boolean(item.speciesId.trim());
    case 'service':
      return Boolean(item.serviceId.trim());
    case 'enclosure':
      return Boolean(item.enclosureId.trim());
    case 'custom':
      return Boolean(item.customName.trim());
    default:
      return false;
  }
}

export function resolveKolamSaleCreateItemDisplayName(
  item: KolamSaleCreateItemForm,
  products: KolamProduct[],
  speciesList: KolamSpecies[],
  services: KolamSaleCatalogOption[],
  enclosures: KolamSaleCatalogOption[],
): string {
  if (item.itemType === 'custom') {
    return item.customName.trim() || 'Item kustom';
  }
  if (item.itemType === 'product') {
    const product = products.find(row => row.id === item.productId);
    return product?.name || 'Produk';
  }
  if (item.itemType === 'species') {
    const species = speciesList.find(row => row.id === item.speciesId);
    return (
      species?.scientificName ||
      species?.commonName ||
      species?.localName ||
      'Spesies'
    );
  }
  if (item.itemType === 'service') {
    return (
      services.find(row => row.id === item.serviceId)?.name || 'Layanan'
    );
  }
  if (item.itemType === 'enclosure') {
    return (
      enclosures.find(row => row.id === item.enclosureId)?.name || 'Kandang'
    );
  }
  return 'Item';
}

export interface KolamSaleCreateOrderSummaryLine {
  key: string;
  name: string;
  quantity: number;
  lineTotal: number;
  shippingCost: number;
}

export interface KolamSaleCreateOrderSummary {
  customCostsTotal: number;
  grandTotal: number;
  itemsTotal: number;
  lines: KolamSaleCreateOrderSummaryLine[];
  shippingTotal: number;
}

/** FE create “Ringkasan pesanan” totals (core fields; no packing/insurance). */
export function estimateKolamSaleCreateOrderSummary(
  form: KolamSaleCreateFormState,
  products: KolamProduct[],
  speciesList: KolamSpecies[],
  services: KolamSaleCatalogOption[],
  enclosures: KolamSaleCatalogOption[],
): KolamSaleCreateOrderSummary {
  const lines: KolamSaleCreateOrderSummaryLine[] = [];
  let itemsTotal = 0;
  for (const item of form.items) {
    if (!isKolamSaleCreateItemFilled(item)) {
      continue;
    }
    const line = estimateKolamSaleCreateItemLineTotal(
      item,
      products,
      speciesList,
    );
    const shippingCostRaw = Number(item.shippingCost);
    const shippingCost =
      Number.isFinite(shippingCostRaw) && shippingCostRaw > 0
        ? shippingCostRaw
        : 0;
    const quantity =
      item.itemType === 'enclosure'
        ? 1
        : Math.max(0, Number(item.quantity) || 0);
    lines.push({
      key: item.key,
      name: resolveKolamSaleCreateItemDisplayName(
        item,
        products,
        speciesList,
        services,
        enclosures,
      ),
      quantity,
      lineTotal: line.total,
      shippingCost,
    });
    itemsTotal += line.total;
  }
  const shippingRaw = Number(form.shippingCost);
  const shippingTotal =
    Number.isFinite(shippingRaw) && shippingRaw > 0 ? shippingRaw : 0;
  const customCostsTotal = form.customCosts.reduce((sum, cost) => {
    if (!cost.name.trim()) {
      return sum;
    }
    const amount = Number(cost.amount);
    return sum + (Number.isFinite(amount) && amount > 0 ? amount : 0);
  }, 0);
  return {
    lines,
    itemsTotal,
    shippingTotal,
    customCostsTotal,
    grandTotal: Math.max(0, itemsTotal + shippingTotal + customCostsTotal),
  };
}

/** Exact FE external-buyer sources (`sales-create-form` EXTERNAL_BUYER_SOURCE_NAMES). */
const EXTERNAL_BUYER_SOURCE_NAMES = new Set(['shopee', 'tokopedia']);

export function isMarketplaceSalesSource(
  source: KolamSaleSourceFilterInput,
): boolean {
  if (!source) {
    return false;
  }
  const lowered = String(source.name || '')
    .trim()
    .toLowerCase();
  return EXTERNAL_BUYER_SOURCE_NAMES.has(lowered);
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

/**
 * Same as filterOptionsBySalesSource, but if the channel filter removes every
 * row while the raw catalog is non-empty, fall back to the raw list so create
 * form dropdowns stay usable (with a UI hint).
 */
export function filterOptionsBySalesSourceWithFallback<T extends { name: string }>(
  options: T[],
  selectedSource: KolamSaleSourceFilterInput,
): { items: T[]; usedFallback: boolean } {
  const filtered = filterOptionsBySalesSource(options, selectedSource);
  if (filtered.length === 0 && options.length > 0) {
    return { items: options, usedFallback: true };
  }
  return { items: filtered, usedFallback: false };
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
    const shippingMethodId = item.shippingMethodId.trim();
    const shippingCostValue = Number(item.shippingCost);
    const shipping =
      shippingMethodId.length > 0
        ? {
            shippingMethod: shippingMethodId,
            ...(Number.isFinite(shippingCostValue) && shippingCostValue > 0
              ? { shippingCost: shippingCostValue }
              : {}),
          }
        : {};

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
        ...shipping,
      };
    }

    if (item.itemType === 'species') {
      return {
        itemType: 'species',
        species: item.speciesId.trim(),
        quantity,
        ...(discount ? { discount } : {}),
        ...voucher,
        ...shipping,
      };
    }

    if (item.itemType === 'service') {
      return {
        itemType: 'service',
        service: item.serviceId.trim(),
        quantity,
        ...(discount ? { discount } : {}),
        ...voucher,
        ...shipping,
      };
    }

    if (item.itemType === 'enclosure') {
      return {
        itemType: 'enclosure',
        enclosure: item.enclosureId.trim(),
        quantity: 1,
        ...(discount ? { discount } : {}),
        ...voucher,
        ...shipping,
      };
    }

    return {
      itemType: 'product',
      product: item.productId.trim(),
      quantity,
      ...(discount ? { discount } : {}),
      ...voucher,
      ...shipping,
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
  const termsTemplates = form.termsTemplateIds
    .map(id => id.trim())
    .filter(Boolean);
  if (termsTemplates.length > 0) {
    result.termsTemplates = termsTemplates;
  }
  if (form.transactionDate.trim()) {
    result.transactionDate = form.transactionDate.trim();
  }
  return result;
}

export function resolveKolamSaleCreateFormShippingCost(
  form: KolamSaleCreateFormState,
): number {
  const raw = Number(form.shippingCost);
  return Number.isFinite(raw) && raw > 0 ? raw : 0;
}

export function buildKolamSaleCreateBody(
  form: KolamSaleCreateFormState,
  options?: { useBuyerInfo?: boolean },
): KolamSaleCreateBody {
  const body = appendOptionalSaleFields(form, {
    paymentMethod: form.paymentMethodId.trim(),
    sourceRef: form.sourceRefId.trim(),
    shippingCost: resolveKolamSaleCreateFormShippingCost(form),
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
    shippingCost: resolveKolamSaleCreateFormShippingCost(form),
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
            shippingMethodId: item.shippingMethodId || '',
            shippingCost:
              item.shippingCost > 0 ? String(item.shippingCost) : '',
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
    pointsMethod: 'product_based',
    manualPoints: '',
    transactionDate: sale.transactionDate
      ? sale.transactionDate.slice(0, 10)
      : '',
    shippingCost:
      sale.shippingCost > 0 ? String(sale.shippingCost) : '',
    termsTemplateIds: [],
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
        errors.push(`Item ${idx}: kuantitas kandang harus 1`);
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
  const pointsConfig = asRecord(record.pointsConfig);
  const marketplaceSource = getString(externalRef, 'source').toLowerCase();
  const shopee = asRecord(externalRef.shopee);
  const tokopedia = asRecord(externalRef.tokopedia);
  const marketplaceOrderId =
    marketplaceSource === 'shopee'
      ? getString(shopee, 'mainOrderId') || getString(shopee, 'orderId')
      : marketplaceSource === 'tokopedia'
        ? getString(tokopedia, 'mainOrderId') || getString(tokopedia, 'orderId')
        : getString(externalRef, 'orderId');

  const shippingService = normalizeShippingService(
    record.shippingService,
    marketplaceSource,
    shopee,
    tokopedia,
  );
  const marketplaceLogistics = normalizeMarketplaceLogistics(
    marketplaceSource,
    shopee,
    tokopedia,
  );
  const autoOlshopFulfillment = asRecord(record.autoOlshopFulfillment);
  const daraOlshopFulfillment = asRecord(record.daraOlshopFulfillment);
  const shippingAutomationActive =
    autoOlshopFulfillment.active === true ||
    daraOlshopFulfillment.active === true;

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
    marketplaceSource,
    marketplaceOrderId,
    paymentProofs: normalizePaymentProofs(record.paymentProofs),
    saleHistories: normalizeSaleHistories(record.saleHistories),
    customCosts: normalizeCustomCosts(record.customCosts),
    discount: getNumber(record, 'discount') ?? 0,
    discountType: getString(record, 'discountType'),
    notes: getString(record, 'notes'),
    pointsEarned:
      getNumber(pointsConfig, 'pointsEarned') ??
      getNumber(record, 'pointsEarned') ??
      0,
    shippingAddressText: normalizeShippingAddressText(
      record.shippingAddress,
      buyerInfo,
    ),
    shippingService,
    marketplaceLogistics,
    marketplaceFulfillment: normalizeMarketplaceFulfillment(
      marketplaceSource,
      shopee,
      tokopedia,
      shippingService,
    ),
    shippingAutomationActive,
    walletTransactions: normalizeSaleWalletTransactions(
      record.walletTransactions,
    ),
    stockTransactions: normalizeSaleStockTransactions(
      record.stockTransactions,
    ),
    hasComplaints:
      Boolean(record.hasComplaints) ||
      (Array.isArray(record.complaints) && record.complaints.length > 0),
    complaints: normalizeSaleComplaintRefs(record.complaints),
    createdByName: resolveActorName(record.createdBy),
    openLivestockPendingCount:
      getNumber(record, 'openLivestockPendingCount') ?? 0,
    hppTotalAtSale: getNumber(record, 'hppTotalAtSale'),
    commissionAccruedTotalAtSale: getNumber(
      record,
      'commissionAccruedTotalAtSale',
    ),
    commissionAccrualByItem: normalizeCommissionAccrualByItem(
      record.commissionAccrualByItem,
    ),
    paymentMethodCost: getNumber(record, 'paymentMethodCost') ?? 0,
    sourceCost: getNumber(record, 'sourceCost') ?? 0,
    sourceCostBreakdown: normalizeCustomCosts(record.sourceCostBreakdown),
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

  const data = list
    .map(row => {
      try {
        return normalizeKolamSale(row);
      } catch {
        return null;
      }
    })
    .filter((item): item is KolamSale => Boolean(item?.id));

  return {
    data,
    pagination: normalizePagination(paginationSource, list.length),
  };
}

function normalizeShippingService(
  value: unknown,
  marketplaceSource: string,
  shopee: Record<string, unknown>,
  tokopedia: Record<string, unknown>,
): KolamSaleShippingService | null {
  const record = asRecord(value);
  const marketplaceTracking =
    marketplaceSource === 'shopee'
      ? getString(shopee, 'trackingNumber')
      : marketplaceSource === 'tokopedia'
        ? getString(tokopedia, 'trackingNumber')
        : '';
  const marketplaceCourier =
    marketplaceSource === 'tokopedia'
      ? getString(tokopedia, 'courierName')
      : marketplaceSource === 'shopee'
        ? getString(shopee, 'courierName')
        : '';

  const courierCode = getString(record, 'courierCode');
  const courierName =
    getString(record, 'courierName') || marketplaceCourier;
  const serviceCode = getString(record, 'serviceCode');
  const serviceName = getString(record, 'serviceName');
  const trackingNumber =
    marketplaceTracking || getString(record, 'trackingNumber');

  if (
    !courierCode &&
    !courierName &&
    !serviceCode &&
    !serviceName &&
    !trackingNumber
  ) {
    return null;
  }

  return {
    courierCode,
    courierName,
    serviceCode,
    serviceName,
    trackingNumber,
  };
}

function normalizeMarketplaceLogistics(
  marketplaceSource: string,
  shopee: Record<string, unknown>,
  tokopedia: Record<string, unknown>,
): KolamSaleMarketplaceLogistics | null {
  if (marketplaceSource !== 'shopee' && marketplaceSource !== 'tokopedia') {
    return null;
  }
  const platformRef =
    marketplaceSource === 'shopee' ? shopee : tokopedia;
  const timeline = normalizeLogisticsTimeline(platformRef.logisticsTimeline);
  const lastUpdate =
    getString(platformRef, 'logisticsLastUpdate') ||
    (marketplaceSource === 'shopee'
      ? getString(platformRef, 'statusDescription')
      : '') ||
    timeline[0]?.message ||
    '';

  if (!timeline.length && !lastUpdate) {
    return null;
  }

  return {
    platform: marketplaceSource,
    timeline,
    lastUpdate,
  };
}

function normalizeMarketplaceFulfillment(
  marketplaceSource: string,
  shopee: Record<string, unknown>,
  tokopedia: Record<string, unknown>,
  shippingService: KolamSaleShippingService | null,
): KolamSaleMarketplaceFulfillment | null {
  if (marketplaceSource !== 'shopee' && marketplaceSource !== 'tokopedia') {
    return null;
  }
  const platformRef =
    marketplaceSource === 'shopee' ? shopee : tokopedia;
  const trackingNumber =
    getString(platformRef, 'trackingNumber') ||
    shippingService?.trackingNumber ||
    '';
  const lastStatusRaw = platformRef.lastStatus;
  const lastStatusNumber = Number(lastStatusRaw);
  const lastStatus =
    lastStatusRaw === null ||
    lastStatusRaw === undefined ||
    lastStatusRaw === ''
      ? null
      : Number.isFinite(lastStatusNumber)
        ? lastStatusNumber
        : null;
  const pickupTimeRaw = Number(platformRef.pickupTime);
  const pickupTime =
    Number.isFinite(pickupTimeRaw) && pickupTimeRaw > 0 ? pickupTimeRaw : null;
  const pickupArranged =
    typeof platformRef.pickupArranged === 'boolean'
      ? platformRef.pickupArranged
      : null;
  const pickupEditable =
    typeof platformRef.pickupEditable === 'boolean'
      ? platformRef.pickupEditable
      : null;

  return {
    platform: marketplaceSource,
    fulfillmentMode: getString(platformRef, 'fulfillmentMode').toLowerCase(),
    dropOffPointUrl: getString(platformRef, 'dropOffPointUrl').trim(),
    lastStatus,
    trackingNumber: trackingNumber.trim(),
    pickupArranged,
    pickupEditable,
    pickupTime,
  };
}

function normalizeLogisticsTimeline(value: unknown): KolamSaleLogisticsEvent[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(row => {
      const record = asRecord(row);
      const message = getString(record, 'message').trim();
      if (!message) {
        return null;
      }
      return {
        at: stringifyDate(record.at),
        message,
      } satisfies KolamSaleLogisticsEvent;
    })
    .filter((row): row is KolamSaleLogisticsEvent => Boolean(row));
}

function normalizeSaleWalletTransactions(
  value: unknown,
): KolamSaleWalletTransactionRef[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(row => {
      const record = asRecord(row);
      const id = getMongoId(record, '_id') || getMongoId(record, 'id');
      if (!id) {
        return null;
      }
      const wallet = asRecord(record.wallet);
      return {
        id,
        type: getString(record, 'type'),
        source: getString(record, 'source'),
        amount: getNumber(record, 'amount') ?? 0,
        confirmStatus: getString(record, 'confirmStatus') || 'unconfirmed',
        note: getString(record, 'note'),
        walletName:
          getString(wallet, 'name') || getString(record, 'walletName'),
        walletType:
          getString(wallet, 'type') || getString(record, 'walletType'),
        createdAt: stringifyDate(record.createdAt),
      } satisfies KolamSaleWalletTransactionRef;
    })
    .filter((row): row is KolamSaleWalletTransactionRef => Boolean(row));
}

function normalizeSaleComplaintRefs(value: unknown): KolamSaleComplaintRef[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(row => {
      const record = asRecord(row);
      const id = getMongoId(record, '_id') || getMongoId(record, 'id');
      if (!id) {
        return null;
      }
      return {
        id,
        ticketCode: getString(record, 'ticketCode') || id,
        status: getString(record, 'status'),
        decision: getString(record, 'decision'),
      } satisfies KolamSaleComplaintRef;
    })
    .filter((row): row is KolamSaleComplaintRef => Boolean(row));
}

function normalizeSaleStockTransactions(
  value: unknown,
): KolamSaleStockTransactionRef[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(row => {
      const record = asRecord(row);
      const id = getMongoId(record, '_id') || getMongoId(record, 'id');
      if (!id) {
        return null;
      }
      const crossSync = asRecord(
        record.marketplaceCrossSync ?? record.crossSync,
      );
      const summaryRaw = getString(crossSync, 'summary');
      const crossSyncSummary = summaryRaw
        ? crossSyncSummaryLabel(summaryRaw)
        : '';
      return {
        id,
        source: getString(record, 'source'),
        type: getString(record, 'type'),
        quantity: getNumber(record, 'quantity') ?? 0,
        before: getNumber(record, 'before'),
        after: getNumber(record, 'after'),
        reason: getString(record, 'reason'),
        createdAt: stringifyDate(record.createdAt),
        crossSyncSummary,
      } satisfies KolamSaleStockTransactionRef;
    })
    .filter((row): row is KolamSaleStockTransactionRef => Boolean(row));
}

function resolveShippingMethodId(value: unknown): string {
  if (typeof value === 'string') {
    return isKolamMongoObjectId(value.trim()) ? value.trim() : '';
  }
  const record = asRecord(value);
  return getMongoId(record, '_id') || getMongoId(record, 'id') || '';
}

function resolveShippingMethodName(value: unknown): string {
  if (typeof value === 'string') {
    return isKolamMongoObjectId(value.trim()) ? '' : value.trim();
  }
  const record = asRecord(value);
  return (
    getString(record, 'displayName') ||
    getString(record, 'name') ||
    getString(record, 'biteshipServiceName') ||
    getString(record, 'courierName') ||
    ''
  );
}

function normalizeCustomCosts(value: unknown): KolamSaleCustomCost[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(row => {
      const record = asRecord(row);
      const name = getString(record, 'name') || getString(record, 'label');
      const amount = getNumber(record, 'amount') ?? getNumber(record, 'value');
      if (!name && amount == null) {
        return null;
      }
      return {
        name: name || 'Biaya',
        amount: amount ?? 0,
      } satisfies KolamSaleCustomCost;
    })
    .filter((row): row is KolamSaleCustomCost => Boolean(row));
}

function normalizeCommissionAccrualByItem(
  value: unknown,
): KolamSaleCommissionAccrualByItem[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(row => {
      const record = asRecord(row);
      const saleItemIndex = getNumber(record, 'saleItemIndex');
      if (saleItemIndex == null || saleItemIndex < 0) {
        return null;
      }
      const commissionType =
        String(record.commissionType || '').toLowerCase() === 'fixed'
          ? 'fixed'
          : 'percentage';
      return {
        saleItemIndex,
        commissionType,
        commissionValue: getNumber(record, 'commissionValue') ?? 0,
        commissionAmount: getNumber(record, 'commissionAmount') ?? 0,
      } satisfies KolamSaleCommissionAccrualByItem;
    })
    .filter((row): row is KolamSaleCommissionAccrualByItem => Boolean(row));
}

function normalizeSaleItemPackings(value: unknown): KolamSaleItemPacking[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(row => {
      const record = asRecord(row);
      const packing = asRecord(record.packing);
      const name =
        getString(packing, 'name') ||
        getString(record, 'name') ||
        'Kemasan';
      const quantity = getNumber(record, 'quantity') ?? 0;
      if (quantity <= 0) {
        return null;
      }
      return {
        name,
        quantity,
        unitPriceAtSale: getNumber(record, 'unitPriceAtSale') ?? 0,
        unitCostAtSale: getNumber(record, 'unitCostAtSale') ?? 0,
      } satisfies KolamSaleItemPacking;
    })
    .filter((row): row is KolamSaleItemPacking => Boolean(row));
}

function normalizeShippingAddressText(
  value: unknown,
  buyerInfo: KolamSaleBuyerInfo | null,
): string {
  if (typeof value === 'string' && value.trim()) {
    return sanitizeKolamPlatformMaskedText(value);
  }
  const record = asRecord(value);
  const parts = [
    getString(record, 'recipientName') || getString(record, 'name'),
    getString(record, 'phone'),
    getString(record, 'address') ||
      getString(record, 'fullAddress') ||
      getString(record, 'addressLine1'),
    getString(record, 'addressLine2'),
    getString(record, 'district'),
    getString(record, 'city'),
    getString(record, 'province'),
    getString(record, 'postalCode') || getString(record, 'zip'),
  ]
    .map(part => sanitizeKolamPlatformMaskedText(part))
    .filter(Boolean);
  if (parts.length) {
    return parts.join(', ');
  }
  return sanitizeKolamPlatformMaskedText(buyerInfo?.address?.trim() || '');
}

/**
 * Marketplace (Tokopedia/Shopee) often masks PII with `***` / `*****`.
 * Keep only readable characters so the address isn't a wall of asterisks.
 */
export function sanitizeKolamPlatformMaskedText(value: string): string {
  if (!value) {
    return '';
  }
  return value
    .replace(/\*{2,}/g, '')
    .replace(/•{2,}/g, '')
    .replace(/x{3,}/gi, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\[\s*\]/g, '')
    .replace(/\s*[|/]\s*(?=[,/]|$)/g, '')
    .replace(/\s+,/g, ',')
    .replace(/,\s*,+/g, ',')
    .replace(/^[,\s./\-–—]+|[,\s./\-–—]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
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
  const biteshipTracking = asRecord(record.biteshipTracking);

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
    unitCostAtSale: getNumber(record, 'unitCostAtSale'),
    hppVendorUnitAtSale: getNumber(record, 'hppVendorUnitAtSale'),
    hppBomUnitAtSale: getNumber(record, 'hppBomUnitAtSale'),
    hppStoredOnlyUnitAtSale: getNumber(record, 'hppStoredOnlyUnitAtSale'),
    packings: normalizeSaleItemPackings(record.packings),
    thumbnailUri: resolveSaleItemThumbnailUri(
      itemType,
      variant,
      product,
      species,
      service,
      enclosure,
    ),
    variantLabel,
    shippingSource: getString(record, 'shippingSource'),
    biteshipCourierCode: getString(record, 'biteshipCourierCode'),
    biteshipServiceCode: getString(record, 'biteshipServiceCode'),
    biteshipWaybillId: getString(record, 'biteshipWaybillId'),
    biteshipOrderId: getString(record, 'biteshipOrderId'),
    itemDeliveryStatus: getString(record, 'itemDeliveryStatus'),
    biteshipTrackingOrderStatus: getString(biteshipTracking, 'orderStatus'),
    shippingMethodId: resolveShippingMethodId(record.shippingMethod),
    shippingMethodName: resolveShippingMethodName(record.shippingMethod),
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
    ...normalizeSaleItemVoucherFields(record),
  };
}

function normalizeSaleItemVoucherFields(record: Record<string, unknown>): {
  voucherCode: string;
  voucherDiscountApplied: number;
  voucherDiscountType: 'fixed' | 'percentage' | '';
  voucherDiscountValue: number | null;
} {
  const voucher = asRecord(record.voucher);
  const codeFromSnapshot = getString(voucher, 'code');
  const codeLegacy = getString(record, 'voucherCode');
  const voucherCode = codeFromSnapshot || codeLegacy;
  const appliedRaw =
    getNumber(voucher, 'discountApplied') ??
    getNumber(record, 'voucherDiscountApplied');
  const voucherDiscountApplied = Math.max(0, Math.round(Number(appliedRaw) || 0));
  const typeRaw = String(getString(voucher, 'discountType') || '')
    .trim()
    .toLowerCase();
  const voucherDiscountType: 'fixed' | 'percentage' | '' =
    typeRaw === 'percentage' ? 'percentage' : typeRaw === 'fixed' ? 'fixed' : '';
  const voucherDiscountValue = getNumber(voucher, 'discountValue');

  return {
    voucherCode,
    voucherDiscountApplied,
    voucherDiscountType,
    voucherDiscountValue,
  };
}

function firstEntityPhotoPath(entity: Record<string, unknown>): string {
  const thumbnail = getString(entity, 'thumbnailImage');
  if (thumbnail) {
    return thumbnail;
  }
  const photos = entity.photos;
  if (Array.isArray(photos)) {
    for (const photo of photos) {
      if (typeof photo === 'string' && photo.trim()) {
        return photo.trim();
      }
      const nested = asRecord(photo);
      const path =
        getString(nested, 'path') ||
        getString(nested, 'url') ||
        getString(nested, 'uri');
      if (path) {
        return path;
      }
    }
  }
  return '';
}

/** FE `getSalesItemThumbnailPath` → absolute URI via getKolamFileUrl. */
function resolveSaleItemThumbnailUri(
  itemType: string,
  variant: Record<string, unknown>,
  product: Record<string, unknown>,
  species: Record<string, unknown>,
  service: Record<string, unknown>,
  enclosure: Record<string, unknown>,
): string | null {
  const type = itemType.toLowerCase();
  const variantPhoto = firstEntityPhotoPath(variant);
  if (variantPhoto) {
    return getKolamFileUrl(variantPhoto);
  }
  if (type === 'species' || (Object.keys(species).length && !Object.keys(product).length)) {
    const path = firstEntityPhotoPath(species);
    return path ? getKolamFileUrl(path) : null;
  }
  if (type === 'service') {
    const path = firstEntityPhotoPath(service);
    return path ? getKolamFileUrl(path) : null;
  }
  if (type === 'enclosure') {
    const path = firstEntityPhotoPath(enclosure);
    return path ? getKolamFileUrl(path) : null;
  }
  const productPath = firstEntityPhotoPath(product);
  return productPath ? getKolamFileUrl(productPath) : null;
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

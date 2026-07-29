import { getKolamFileUrl } from '../lib/file-url';

export type KolamStockTransactionType = 'in' | 'out' | 'adjust';
export type KolamStockTransactionStatus = 'unverified' | 'verified';
export type KolamStockTransactionWalletConfirmStatus =
  | 'unconfirmed'
  | 'confirmed'
  | 'rejected';

/** Sales channel Source (master) when stock tx reference is a Sale. */
export interface KolamStockTransactionSalesSource {
  id: string;
  name: string;
  logoUri: string | null;
  type: string;
}

export interface KolamStockTransactionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface KolamStockTransactionTargetRef {
  id: string;
  label: string;
  kind:
    | 'product'
    | 'species'
    | 'packing'
    | 'freyer'
    | 'teranura'
    | 'service'
    | 'unknown';
  sku: string;
  href: string | null;
}

export interface KolamStockTransactionCrossSyncTarget {
  platform: string;
  status: string;
  taskId: string;
  error: string;
  dispatchedAt: string;
  completedAt: string;
}

export interface KolamStockTransactionCrossSync {
  summary: string;
  originPlatform: string;
  sku: string;
  targetStock: number | null;
  targets: KolamStockTransactionCrossSyncTarget[];
}

export interface KolamStockTransactionPendingReturn {
  complaintId: string;
  ticketCode: string;
  quantity: number;
  source: string;
  saleInvoiceCode: string;
}

export interface KolamStockTransactionWallet {
  id: string;
  walletName: string;
  amount: number;
  confirmStatus: KolamStockTransactionWalletConfirmStatus | string;
  note: string;
}

export interface KolamStockTransactionPerson {
  id: string;
  name: string;
}

export interface KolamStockTransactionReference {
  sourceModel: string;
  label: string;
  href: string | null;
}

export interface KolamStockTransactionComputed {
  stockImpactScope: string;
  displayScopeLabel: string;
  displayBefore: number;
  displayAfter: number;
  displayDelta: number;
  globalBefore: number;
  globalAfter: number;
  isEnclosureOnly: boolean;
}

export interface KolamStockTransaction {
  id: string;
  target: KolamStockTransactionTargetRef | null;
  variantLabel: string;
  type: KolamStockTransactionType | string;
  source: string;
  sourceLabel: string;
  /** Present when linked Sale has populated sourceRef (channel logo). */
  salesSource: KolamStockTransactionSalesSource | null;
  quantity: number;
  before: number;
  after: number;
  delta: number;
  globalBefore: number;
  globalAfter: number;
  status: KolamStockTransactionStatus | '';
  financeCancelled: boolean;
  financeCancelledAt: string;
  statusLabel: string;
  financeNote: string;
  verificationHint: string;
  financeStatusLabel: string;
  financeStatusHint: string;
  crossSync: KolamStockTransactionCrossSync | null;
  stockOpnameId: string;
  createdAt: string;
  reason: string;
  photos: string[];
  walletTransaction: KolamStockTransactionWallet | null;
  verifiedAt: string;
  verifiedBy: KolamStockTransactionPerson | null;
  financeCancelledBy: KolamStockTransactionPerson | null;
  createdBy: KolamStockTransactionPerson | null;
  reference: KolamStockTransactionReference | null;
  enclosureLabel: string;
  enclosureHref: string | null;
  computed: KolamStockTransactionComputed | null;
}

export interface KolamStockTransactionListResult {
  data: KolamStockTransaction[];
  pagination: KolamStockTransactionPagination;
  pendingReturnExpectations: KolamStockTransactionPendingReturn[];
}

export interface KolamStockTransactionListFilters {
  search: string;
  productId: string;
  speciesId: string;
  stockOpnameId: string;
  status: '' | KolamStockTransactionStatus;
  startDate: string;
  endDate: string;
  page: number;
  limit: number;
}

export const KOLAM_STOCK_TRANSACTION_ROOT = '/stock-transaction';

const STOCK_SOURCE_LABELS: Record<string, string> = {
  'stock-opname': 'Stok opname',
  stock_opname: 'Stok opname',
  sale: 'Penjualan',
  'sale-draft': 'Penjualan (draft)',
  'sale-cancelled': 'Penjualan dibatalkan',
  production: 'Produksi',
  po: 'Purchase order',
  pos: 'POS',
  complaint: 'Komplain',
  'complaint-return': 'Retur komplain',
  'complaint-replacement': 'Pengganti komplain',
  custom_project: 'Proyek kustom',
  enclosure: 'Enclosure',
  adjustment: 'Penyesuaian',
  arrival_inspection: 'Inspeksi kedatangan',
  warranty_claim: 'Klaim garansi',
};

const STOCK_TX_REF_ROUTE: Record<string, string> = {
  Sale: '/sales',
  CustomProject: '/proyek',
  PurchaseOrder: '/purchase-order',
  DosingTask: '/layanan/layanan-tertunda/voucher',
  MaintenanceTask: '/layanan/layanan-tertunda/voucher',
};

const CROSS_SYNC_SUMMARY_LABELS: Record<string, string> = {
  ok: 'Sinkron OK',
  partial: 'Sinkron sebagian',
  failed: 'Sinkron gagal',
  pending: 'Menunggu sinkron',
  skipped: 'Sinkron dilewati',
  unknown: 'Status sinkron tidak lengkap',
};

const CROSS_SYNC_ORIGIN_LABELS: Record<string, string> = {
  shopee: 'Shopee',
  tokopedia: 'Tokopedia',
  kolam: 'Kolam / webstore',
};

const CROSS_SYNC_PLATFORM_LABELS: Record<string, string> = {
  shopee: 'Shopee',
  tokopedia: 'Tokopedia',
};

const CROSS_SYNC_TARGET_STATUS_LABELS: Record<string, string> = {
  synced: 'Berhasil',
  skipped: 'Dilewati',
  pending: 'Menunggu AM',
  dispatch_failed: 'Gagal kirim task',
  not_found: 'SKU tidak ditemukan',
  notFound: 'SKU tidak ditemukan',
  failed: 'Gagal',
  partial: 'Sebagian',
  unknown: 'Belum sinkron',
};

/** Prefix yang ditulis BE di `reason` setelah scheduleStockTxPlatformSync. */
export const STOCK_TX_MARKETPLACE_SYNC_MARKER = 'Sync ke semua platform:';

const DEFAULT_CROSS_SYNC_PLATFORMS = ['tokopedia', 'shopee'] as const;

export type KolamStockTxCrossSyncDisplayTarget = {
  platform: string;
  /** Raw status for KolamMarketplaceSyncPlatformList (AM sync indicator). */
  status: string;
  statusLabel: string;
  taskId: string;
  error: string;
  dispatchedAt: string;
  completedAt: string;
  fromFallback: boolean;
};

export type KolamStockTxCrossSyncDisplay = {
  summaryLabel: string;
  originPlatform: string;
  sku: string;
  targetStock: number | null;
  syncNote: string | null;
  targets: KolamStockTxCrossSyncDisplayTarget[];
  usedFallbackPlatforms: boolean;
};

export function isKolamStockTransactionRoute(route: string) {
  const path = normalizeStockTransactionRoutePath(route);
  return (
    path === KOLAM_STOCK_TRANSACTION_ROOT ||
    path.startsWith(`${KOLAM_STOCK_TRANSACTION_ROOT}/`)
  );
}

export function isKolamStockTransactionListRoute(route: string) {
  const path = normalizeStockTransactionRoutePath(route);
  return path === KOLAM_STOCK_TRANSACTION_ROOT;
}

export function isKolamStockTransactionDetailRoute(route: string) {
  return Boolean(getKolamStockTransactionRouteId(route));
}

export function isKolamStockTransactionOpnameRoute(route: string) {
  const path = normalizeStockTransactionRoutePath(route);
  return path === `${KOLAM_STOCK_TRANSACTION_ROOT}/opname`;
}

export function getKolamStockTransactionRouteId(route: string) {
  const path = normalizeStockTransactionRoutePath(route);
  if (path === KOLAM_STOCK_TRANSACTION_ROOT || path.endsWith('/opname')) {
    return null;
  }
  const match = /^\/stock-transaction\/([^/]+)$/.exec(path);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function getKolamStockTransactionBreadcrumbPath(
  mode: 'list' | 'detail' | 'opname',
) {
  if (mode === 'opname') {
    return `${KOLAM_STOCK_TRANSACTION_ROOT}/opname`;
  }
  if (mode === 'detail') {
    return `${KOLAM_STOCK_TRANSACTION_ROOT}/detail`;
  }
  return KOLAM_STOCK_TRANSACTION_ROOT;
}

export function createInitialStockTransactionListFilters(
  route: string,
): KolamStockTransactionListFilters {
  const query = parseRouteQuery(route);
  return {
    search: query.search ?? '',
    productId: query.productId ?? '',
    speciesId: query.speciesId ?? '',
    stockOpnameId: query.stockOpnameId ?? '',
    status:
      query.status === 'verified' || query.status === 'unverified'
        ? query.status
        : '',
    startDate: query.startDate ?? '',
    endDate: query.endDate ?? '',
    page: Math.max(1, Number(query.page || '1') || 1),
    limit: 10,
  };
}

export function stockTransactionSourceLabel(source?: string) {
  if (!source) {
    return '—';
  }
  return (
    STOCK_SOURCE_LABELS[source] ??
    source.replace(/_/g, ' ').replace(/-/g, ' ')
  );
}

export function hasStockTransactionFinanceVerification(source: string) {
  return source === 'stock-opname' || source === 'enclosure';
}

export function canVerifyStockTransaction(
  transaction: Pick<KolamStockTransaction, 'source' | 'status'>,
) {
  return (
    hasStockTransactionFinanceVerification(transaction.source) &&
    transaction.status === 'unverified'
  );
}

export function canCancelFinanceStockTransaction(
  transaction: Pick<
    KolamStockTransaction,
    'walletTransaction' | 'financeCancelled' | 'source'
  >,
) {
  if (!hasStockTransactionFinanceVerification(transaction.source)) {
    return false;
  }
  if (!transaction.walletTransaction || transaction.financeCancelled) {
    return false;
  }
  return transaction.walletTransaction.confirmStatus !== 'confirmed';
}

export function hasStockTransactionCrossSyncAudit(
  audit?: KolamStockTransactionCrossSync | null,
  reason?: string | null,
) {
  return Boolean(resolveStockTxCrossSyncDisplay(audit, reason));
}

export function crossSyncSummaryLabel(summary?: string) {
  if (!summary) {
    return '—';
  }
  return CROSS_SYNC_SUMMARY_LABELS[summary] ?? summary;
}

export function crossSyncOriginLabel(origin?: string) {
  if (!origin) {
    return '';
  }
  return CROSS_SYNC_ORIGIN_LABELS[origin] ?? origin;
}

export function crossSyncPlatformLabel(platform?: string) {
  if (!platform) {
    return '—';
  }
  return CROSS_SYNC_PLATFORM_LABELS[platform] ?? platform;
}

export function crossSyncTargetStatusLabel(status?: string) {
  if (!status) {
    return '—';
  }
  return CROSS_SYNC_TARGET_STATUS_LABELS[status] ?? status;
}

/** Ambil potongan catatan sync marketplace dari `reason` transaksi. */
export function parseStockTxMarketplaceSyncNote(reason?: string | null) {
  const text = String(reason ?? '');
  const markerIndex = text.indexOf(STOCK_TX_MARKETPLACE_SYNC_MARKER);
  if (markerIndex < 0) {
    return null;
  }
  const after = text
    .slice(markerIndex + STOCK_TX_MARKETPLACE_SYNC_MARKER.length)
    .trim();
  const note = after.split('|')[0]?.trim() || '';
  return note || null;
}

/**
 * Susun data tampilan panel Sinkron marketplace.
 * Jika audit.targets kosong, fallback ke Tokopedia/Shopee + catatan reason BE.
 */
export function resolveStockTxCrossSyncDisplay(
  crossSync?: KolamStockTransactionCrossSync | null,
  reason?: string | null,
): KolamStockTxCrossSyncDisplay | null {
  const syncNote = parseStockTxMarketplaceSyncNote(reason);
  const hasMeaningfulAudit = Boolean(
    crossSync &&
      ((crossSync.targets.length ?? 0) > 0 ||
        crossSync.sku ||
        crossSync.originPlatform ||
        (crossSync.summary && crossSync.summary !== 'unknown')),
  );

  if (!hasMeaningfulAudit && !syncNote) {
    return null;
  }

  if (!crossSync) {
    return {
      summaryLabel: summaryLabelFromSyncNote(syncNote),
      originPlatform: '',
      sku: '',
      targetStock: null,
      syncNote,
      targets: buildFallbackPlatformTargets(syncNote),
      usedFallbackPlatforms: true,
    };
  }

  const summaryLabel =
    crossSync.summary === 'unknown'
      ? syncNote
        ? summaryLabelFromSyncNote(syncNote)
        : CROSS_SYNC_SUMMARY_LABELS.unknown
      : crossSyncSummaryLabel(crossSync.summary);

  if (crossSync.targets.length > 0) {
    return {
      summaryLabel,
      originPlatform: crossSync.originPlatform,
      sku: crossSync.sku,
      targetStock: crossSync.targetStock,
      syncNote,
      targets: crossSync.targets.map(target => {
        const status = normalizeCrossSyncPlatformStatus(target.status);
        return {
          platform: target.platform,
          status,
          statusLabel: crossSyncTargetStatusLabel(target.status),
          taskId: target.taskId,
          error: target.error,
          dispatchedAt: target.dispatchedAt,
          completedAt: target.completedAt,
          fromFallback: false,
        };
      }),
      usedFallbackPlatforms: false,
    };
  }

  return {
    summaryLabel,
    originPlatform: crossSync.originPlatform,
    sku: crossSync.sku,
    targetStock: crossSync.targetStock,
    syncNote,
    targets: buildFallbackPlatformTargets(syncNote),
    usedFallbackPlatforms: true,
  };
}

function summaryLabelFromSyncNote(note: string | null) {
  if (!note) {
    return CROSS_SYNC_SUMMARY_LABELS.unknown;
  }
  const lower = note.toLowerCase();
  if (lower.startsWith('sukses')) {
    return CROSS_SYNC_SUMMARY_LABELS.ok;
  }
  if (lower.startsWith('sebagian')) {
    return CROSS_SYNC_SUMMARY_LABELS.partial;
  }
  if (lower.startsWith('gagal')) {
    return CROSS_SYNC_SUMMARY_LABELS.failed;
  }
  if (lower.startsWith('dilewati')) {
    return CROSS_SYNC_SUMMARY_LABELS.skipped;
  }
  return `Sinkron: ${note}`;
}

function buildFallbackPlatformTargets(
  syncNote: string | null,
): KolamStockTxCrossSyncDisplayTarget[] {
  return DEFAULT_CROSS_SYNC_PLATFORMS.map(platform => {
    const status = platformStatusKeyFromSyncNote(syncNote, platform);
    return {
      platform,
      status,
      statusLabel:
        status === 'unknown'
          ? syncNote
            ? `Sinkron: ${syncNote}`
            : 'Belum tercatat di audit'
          : crossSyncTargetStatusLabel(status),
      taskId: '',
      error: '',
      dispatchedAt: '',
      completedAt: '',
      fromFallback: true,
    };
  });
}

function normalizeCrossSyncPlatformStatus(status?: string | null) {
  const normalized = String(status || '')
    .trim()
    .toLowerCase();
  if (normalized === 'not_found' || normalized === 'notfound') {
    return 'notFound';
  }
  if (normalized === 'dispatch_failed') {
    return 'failed';
  }
  if (
    normalized === 'synced' ||
    normalized === 'pending' ||
    normalized === 'skipped' ||
    normalized === 'failed' ||
    normalized === 'partial'
  ) {
    return normalized;
  }
  return 'unknown';
}

function platformStatusKeyFromSyncNote(
  note: string | null,
  platform: string,
): string {
  if (!note) {
    return 'unknown';
  }
  const lower = note.toLowerCase();
  if (lower.startsWith('sukses')) {
    return 'synced';
  }
  if (lower.startsWith('dilewati')) {
    return 'skipped';
  }
  if (lower.startsWith('gagal')) {
    return 'failed';
  }
  if (lower.startsWith('sebagian')) {
    const okMatch = /ok:\s*([^;]+)/i.exec(note);
    const failMatch = /gagal:\s*(.+)$/i.exec(note);
    const okList = (okMatch?.[1] || '')
      .split(',')
      .map(item => item.trim().toLowerCase())
      .filter(Boolean);
    const failList = (failMatch?.[1] || '')
      .split(';')
      .map(item => item.trim().toLowerCase())
      .filter(Boolean);
    if (okList.some(item => item.includes(platform))) {
      return 'synced';
    }
    if (failList.some(item => item.includes(platform))) {
      return 'failed';
    }
    return 'partial';
  }
  return 'unknown';
}

export function normalizeKolamStockTransactionList(
  payload: unknown,
): KolamStockTransactionListResult {
  const root = asRecord(payload);
  const dataRecord = asRecord(root.data);
  const list: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray(root.data)
    ? root.data
    : Array.isArray(dataRecord.data)
    ? dataRecord.data
    : Array.isArray(root.transactions)
    ? root.transactions
    : [];

  const data = list.map(normalizeKolamStockTransaction);
  const pendingRaw = root.pendingReturnExpectations;
  const pendingReturnExpectations = Array.isArray(pendingRaw)
    ? (pendingRaw
        .map(normalizePendingReturn)
        .filter(Boolean) as KolamStockTransactionPendingReturn[])
    : [];

  return {
    data,
    pagination: normalizePagination(
      root.pagination ?? dataRecord.pagination ?? root.meta,
      data.length,
    ),
    pendingReturnExpectations,
  };
}

export function normalizeKolamStockTransaction(
  payload: unknown,
): KolamStockTransaction {
  const record = asRecord(unwrapData(payload));
  const product = asRecord(record.productId);
  const species = asRecord(record.speciesId);
  const packing = asRecord(record.packingId);
  const freyer = asRecord(record.freyerId);
  const teranura = asRecord(record.teranuraId);
  const service = asRecord(record.serviceId);
  const computedRecord = asRecord(record.computed);
  const crossSync = asRecord(record.marketplaceCrossSync);
  const before = getNumber(record, 'before') ?? 0;
  const after = getNumber(record, 'after') ?? 0;
  const displayBefore = getNumber(computedRecord, 'displayBefore') ?? before;
  const displayAfter = getNumber(computedRecord, 'displayAfter') ?? after;
  const displayDelta =
    getNumber(computedRecord, 'displayDelta') ?? displayAfter - displayBefore;
  const source = getString(record, 'source');
  const status = normalizeStatus(getString(record, 'status'));
  const financeCancelledAt = getString(record, 'financeCancelledAt');
  const financeCancelled = Boolean(financeCancelledAt);
  const target = resolveTarget({
    product,
    species,
    packing,
    freyer,
    teranura,
    service,
  });
  const walletTransaction = normalizeWallet(record.walletTransaction);
  const stockImpactScope =
    getString(computedRecord, 'stockImpactScope') ||
    getString(record, 'stockImpactScope');
  const computed: KolamStockTransactionComputed | null = Object.keys(
    computedRecord,
  ).length
    ? {
        stockImpactScope,
        displayScopeLabel: getString(computedRecord, 'displayScopeLabel'),
        displayBefore,
        displayAfter,
        displayDelta,
        globalBefore:
          getNumber(computedRecord, 'globalStockBefore') ?? before,
        globalAfter: getNumber(computedRecord, 'globalStockAfter') ?? after,
        isEnclosureOnly: stockImpactScope === 'enclosure_only',
      }
    : null;

  return {
    id: getString(record, '_id') || getString(record, 'id'),
    target,
    variantLabel: resolveVariantLabel(record),
    type: getString(record, 'type') || 'adjust',
    source,
    sourceLabel: stockTransactionSourceLabel(source),
    salesSource: normalizeSalesSource(record),
    quantity: getNumber(record, 'quantity') ?? 0,
    before: displayBefore,
    after: displayAfter,
    delta: displayDelta,
    globalBefore: before,
    globalAfter: after,
    status,
    financeCancelled,
    financeCancelledAt,
    statusLabel: getStatusLabel(status, source, financeCancelled),
    financeNote: getFinanceNote(
      source,
      status,
      financeCancelled,
      walletTransaction,
    ),
    verificationHint: getVerificationHint(
      status,
      financeCancelled,
      walletTransaction,
    ),
    financeStatusLabel: getFinanceStatusLabel(
      financeCancelled,
      walletTransaction,
    ),
    financeStatusHint: getFinanceStatusHint(
      financeCancelled,
      walletTransaction,
    ),
    crossSync: normalizeCrossSync(crossSync),
    stockOpnameId: getString(record, 'stockOpnameId'),
    createdAt: getString(record, 'createdAt'),
    reason: getString(record, 'reason'),
    photos: normalizePhotos(record.photos),
    walletTransaction,
    verifiedAt: getString(record, 'verifiedAt'),
    verifiedBy: normalizePerson(record.verifiedBy),
    financeCancelledBy: normalizePerson(record.financeCancelledBy),
    createdBy: normalizePerson(record.createdBy),
    reference: normalizeReference(record),
    enclosureLabel: resolveEnclosureLabel(record.enclosureId),
    enclosureHref: resolveEnclosureHref(record.enclosureId),
    computed,
  };
}

function resolveVariantLabel(record: Record<string, unknown>) {
  const explicit = getString(record, 'variantLabel');
  if (explicit && explicit !== 'Non Variant') {
    return explicit;
  }
  const variant = record.variant;
  if (variant && typeof variant === 'object') {
    const variantRecord = asRecord(variant);
    return (
      getString(variantRecord, 'name') ||
      getString(variantRecord, 'sku') ||
      'Varian'
    );
  }
  if (variant) {
    return 'Varian';
  }
  return 'Tanpa varian';
}

function resolveTarget({
  product,
  species,
  packing,
  freyer,
  teranura,
  service,
}: {
  product: Record<string, unknown>;
  species: Record<string, unknown>;
  packing: Record<string, unknown>;
  freyer: Record<string, unknown>;
  teranura: Record<string, unknown>;
  service: Record<string, unknown>;
}): KolamStockTransactionTargetRef | null {
  if (
    getString(product, '_id') ||
    getString(product, 'id') ||
    getString(product, 'name')
  ) {
    const id = getString(product, '_id') || getString(product, 'id');
    return {
      id,
      label: getString(product, 'name') || 'Produk',
      kind: 'product',
      sku:
        getString(product, 'sku') ||
        getString(product, 'code') ||
        'Tidak ada data',
      href: id ? `/products/${id}` : null,
    };
  }
  if (
    getString(species, '_id') ||
    getString(species, 'id') ||
    getString(species, 'scientificName')
  ) {
    const id = getString(species, '_id') || getString(species, 'id');
    return {
      id,
      label: getString(species, 'scientificName') || 'Spesies',
      kind: 'species',
      sku: getString(species, 'sku') || 'Tidak ada data',
      href: id ? `/species/${id}` : null,
    };
  }
  if (getString(packing, '_id') || getString(packing, 'name')) {
    return {
      id: getString(packing, '_id') || getString(packing, 'id'),
      label: getString(packing, 'name') || 'Kemasan',
      kind: 'packing',
      sku: getString(packing, 'category') || 'Tanpa kategori',
      href: null,
    };
  }
  if (getString(freyer, '_id') || getString(freyer, 'name')) {
    return {
      id: getString(freyer, '_id') || getString(freyer, 'id'),
      label: getString(freyer, 'name') || 'Freyer',
      kind: 'freyer',
      sku:
        getString(freyer, 'sku') ||
        getString(freyer, 'productCode') ||
        'Tidak ada data',
      href: null,
    };
  }
  if (getString(teranura, '_id') || getString(teranura, 'name')) {
    return {
      id: getString(teranura, '_id') || getString(teranura, 'id'),
      label: getString(teranura, 'name') || 'Teranura',
      kind: 'teranura',
      sku:
        getString(teranura, 'sku') ||
        getString(teranura, 'productCode') ||
        'Tidak ada data',
      href: null,
    };
  }
  if (getString(service, '_id') || getString(service, 'name')) {
    return {
      id: getString(service, '_id') || getString(service, 'id'),
      label: getString(service, 'name') || 'Layanan',
      kind: 'service',
      sku:
        getString(service, 'sku') ||
        getString(service, 'productCode') ||
        'Tidak ada data',
      href: null,
    };
  }
  return null;
}

function normalizeCrossSync(
  record: Record<string, unknown>,
): KolamStockTransactionCrossSync | null {
  const summary = getString(record, 'summary');
  const targetsRaw = Array.isArray(record.targets) ? record.targets : [];
  const targets = targetsRaw
    .map(item => {
      const target = asRecord(item);
      const platform = getString(target, 'platform');
      if (!platform) {
        return null;
      }
      return {
        platform,
        status: getString(target, 'status'),
        taskId: getString(target, 'taskId'),
        error: getString(target, 'error'),
        dispatchedAt: getString(target, 'dispatchedAt'),
        completedAt: getString(target, 'completedAt'),
      } satisfies KolamStockTransactionCrossSyncTarget;
    })
    .filter(Boolean) as KolamStockTransactionCrossSyncTarget[];

  if (!summary && !getString(record, 'originPlatform') && !getString(record, 'sku') && !targets.length) {
    return null;
  }

  return {
    summary: summary || 'unknown',
    originPlatform: getString(record, 'originPlatform'),
    sku: getString(record, 'sku'),
    targetStock: getNumber(record, 'targetStock') ?? null,
    targets,
  };
}

function normalizeWallet(
  value: unknown,
): KolamStockTransactionWallet | null {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  if (!id && !getNumber(record, 'amount') && !getString(record, 'confirmStatus')) {
    return null;
  }
  const wallet = asRecord(record.wallet);
  return {
    id,
    walletName: getString(wallet, 'name') || '—',
    amount: getNumber(record, 'amount') ?? 0,
    confirmStatus: getString(record, 'confirmStatus') || 'unconfirmed',
    note: getString(record, 'note'),
  };
}

function normalizePerson(value: unknown): KolamStockTransactionPerson | null {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  const fullName = [getString(record, 'first_name'), getString(record, 'last_name')]
    .filter(Boolean)
    .join(' ')
    .trim();
  const name =
    fullName ||
    getString(record, 'name') ||
    getString(record, 'displayName') ||
    getString(record, 'username') ||
    getString(record, 'email');
  if (!id && !name) {
    return null;
  }
  return { id, name: name || 'Tidak diketahui' };
}

function normalizeSalesSource(
  record: Record<string, unknown>,
): KolamStockTransactionSalesSource | null {
  const reference = asRecord(record.reference);
  if (!Object.keys(reference).length) {
    return null;
  }
  const sourceRef = asRecord(reference.sourceRef);
  if (!Object.keys(sourceRef).length) {
    return null;
  }
  const id = getString(sourceRef, '_id') || getString(sourceRef, 'id');
  const name = getString(sourceRef, 'name');
  const logoPath =
    getString(sourceRef, 'logo') ||
    getString(sourceRef, 'logoUrl') ||
    getString(sourceRef, 'icon');
  if (!id && !name && !logoPath) {
    return null;
  }
  return {
    id,
    name: name || id || 'Sumber',
    logoUri: getKolamFileUrl(logoPath),
    type: getString(sourceRef, 'type'),
  };
}

function normalizeReference(
  record: Record<string, unknown>,
): KolamStockTransactionReference | null {
  const sourceModel = getString(record, 'sourceModel');
  const pendingServiceId = getString(record, 'pendingServiceId');
  if (
    (sourceModel === 'DosingTask' || sourceModel === 'MaintenanceTask') &&
    pendingServiceId
  ) {
    return {
      sourceModel,
      label: 'Voucher layanan',
      href: `/layanan/voucher/${pendingServiceId}`,
    };
  }

  const reference = record.reference;
  if (!sourceModel || reference == null || reference === '') {
    return null;
  }

  if (typeof reference === 'string') {
    const base = STOCK_TX_REF_ROUTE[sourceModel];
    return {
      sourceModel,
      label: reference.slice(-8),
      href: base ? `${base}/${reference}` : null,
    };
  }

  const refRecord = asRecord(reference);
  const id = getString(refRecord, '_id') || getString(refRecord, 'id');
  if (!id) {
    return null;
  }
  const base = STOCK_TX_REF_ROUTE[sourceModel];
  return {
    sourceModel,
    label:
      getString(refRecord, 'invoiceCode') ||
      getString(refRecord, 'poCode') ||
      id.slice(-8),
    href: base ? `${base}/${id}` : null,
  };
}

function resolveEnclosureLabel(value: unknown) {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    return value.slice(-8);
  }
  const record = asRecord(value);
  return (
    getString(record, 'enclosure_code') ||
    getString(record, 'enclosure_name') ||
    (getString(record, '_id') || getString(record, 'id')).slice(-8)
  );
}

function resolveEnclosureHref(value: unknown) {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    return `/enclosures/${value}`;
  }
  const id = getString(asRecord(value), '_id') || getString(asRecord(value), 'id');
  return id ? `/enclosures/${id}` : null;
}

function normalizePhotos(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
}

function normalizePendingReturn(
  value: unknown,
): KolamStockTransactionPendingReturn | null {
  const record = asRecord(value);
  const complaintId = getString(record, 'complaintId');
  if (!complaintId) {
    return null;
  }
  return {
    complaintId,
    ticketCode: getString(record, 'ticketCode') || complaintId,
    quantity: getNumber(record, 'quantity') ?? 0,
    source: getString(record, 'source'),
    saleInvoiceCode: getString(record, 'saleInvoiceCode'),
  };
}

function getStatusLabel(
  status: KolamStockTransactionStatus | '',
  source: string,
  financeCancelled: boolean,
) {
  if (
    status ||
    (hasStockTransactionFinanceVerification(source) && financeCancelled)
  ) {
    return status === 'verified' || financeCancelled
      ? 'Terverifikasi'
      : 'Belum terverifikasi';
  }
  return '—';
}

function getFinanceNote(
  source: string,
  status: KolamStockTransactionStatus | '',
  financeCancelled: boolean,
  wallet: KolamStockTransactionWallet | null,
) {
  if (!hasStockTransactionFinanceVerification(source)) {
    return '';
  }
  if (financeCancelled) {
    return 'Hanya perubahan stok';
  }
  if (!wallet) {
    return 'Tidak ada debit dompet';
  }
  const debit = formatWalletDebitSummary(wallet);
  if (status === 'verified' || wallet.confirmStatus === 'confirmed') {
    return `Debit dikonfirmasi: ${debit}`;
  }
  if (wallet.confirmStatus === 'rejected') {
    return `Debit ditolak: ${debit}`;
  }
  return `Debit tertunda: ${debit}`;
}

function getVerificationHint(
  status: KolamStockTransactionStatus | '',
  financeCancelled: boolean,
  wallet: KolamStockTransactionWallet | null,
) {
  if (status === 'verified' || financeCancelled) {
    if (financeCancelled) {
      return 'Selesai; debit dompet dibatalkan (hanya perubahan stok).';
    }
    if (wallet) {
      return `Disetujui; debit ${formatWalletDebitSummary(wallet)} sudah diterapkan.`;
    }
    return 'Disetujui; tidak ada debit dompet.';
  }
  if (status === 'unverified') {
    if (wallet) {
      return `Stok berubah; debit ${formatWalletDebitSummary(wallet)} belum dikonfirmasi.`;
    }
    return 'Stok berubah; tidak ada debit dompet tertaut.';
  }
  return '';
}

function getFinanceStatusLabel(
  financeCancelled: boolean,
  wallet: KolamStockTransactionWallet | null,
) {
  if (financeCancelled) {
    return 'Dibatalkan';
  }
  if (!wallet) {
    return 'Tidak ada debit dompet';
  }
  if (wallet.confirmStatus === 'confirmed') {
    return 'Dikonfirmasi';
  }
  if (wallet.confirmStatus === 'rejected') {
    return 'Ditolak';
  }
  return 'Tertunda';
}

function getFinanceStatusHint(
  financeCancelled: boolean,
  wallet: KolamStockTransactionWallet | null,
) {
  if (financeCancelled) {
    return 'Finance diputus. Hanya stok yang berubah; tidak ada uang masuk/keluar.';
  }
  if (!wallet) {
    return 'Tidak ada transaksi dompet tertaut pada transaksi ini.';
  }
  return formatWalletDebitSummary(wallet);
}

function formatWalletDebitSummary(wallet: KolamStockTransactionWallet) {
  const name = wallet.walletName?.trim() || 'Dompet';
  return `${name} · ${formatWalletAmount(wallet.amount)}`;
}

function formatWalletAmount(amount: number) {
  return `Rp ${Math.round(Number(amount) || 0).toLocaleString('id-ID')}`;
}

function normalizeStatus(value: string): KolamStockTransactionStatus | '' {
  if (value === 'verified' || value === 'unverified') {
    return value;
  }
  return '';
}

function normalizePagination(
  value: unknown,
  fallbackTotal: number,
): KolamStockTransactionPagination {
  const record = asRecord(value);
  const page = getNumber(record, 'page') ?? getNumber(record, 'currentPage') ?? 1;
  const limit =
    getNumber(record, 'limit') ??
    getNumber(record, 'perPage') ??
    (fallbackTotal || 10);
  const total =
    getNumber(record, 'total') ?? getNumber(record, 'totalItems') ?? fallbackTotal;
  const totalPages =
    getNumber(record, 'totalPages') ??
    getNumber(record, 'pages') ??
    (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1);

  return { page, limit, total, totalPages };
}

function normalizeStockTransactionRoutePath(route: string) {
  const path = route.trim().split('?')[0].replace(/^\/+/, '');
  return ('/' + path).replace(/\/+$/, '') || KOLAM_STOCK_TRANSACTION_ROOT;
}

function parseRouteQuery(route: string) {
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

function unwrapData(payload: unknown): unknown {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: unknown }).data;
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
  return typeof value === 'string' ? value.trim() : '';
}

function getNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export type KolamStockOpnameTargetType =
  | 'product'
  | 'raw'
  | 'species'
  | 'freyer'
  | 'teranura';

export interface KolamStockOpnameVariantOption {
  id: string;
  label: string;
  sku: string;
  stock: number;
  price: number;
}

export interface KolamStockOpnameTargetOption {
  id: string;
  label: string;
  sku: string;
  stock: number;
  price: number;
  hasVariants: boolean;
  variants: KolamStockOpnameVariantOption[];
}

export interface KolamStockOpnameFormState {
  targetType: KolamStockOpnameTargetType;
  targetId: string;
  variantId: string;
  adjustedStock: string;
  reason: string;
  photoUris: string[];
  walletId: string;
}

export interface KolamStockOpnameCreateInput {
  targetType: KolamStockOpnameTargetType;
  targetId: string;
  variantId?: string;
  adjustedStock: string;
  reason?: string;
  photoUris: string[];
  walletId?: string;
}

export const KOLAM_STOCK_OPNAME_TARGET_LABELS: Record<
  KolamStockOpnameTargetType,
  string
> = {
  product: 'Produk',
  raw: 'Bahan baku',
  species: 'Life stock',
  freyer: 'Freyer',
  teranura: 'Teranura',
};

export function createEmptyKolamStockOpnameFormState(): KolamStockOpnameFormState {
  return {
    targetType: 'product',
    targetId: '',
    variantId: '',
    adjustedStock: '0',
    reason: '',
    photoUris: [],
    walletId: '',
  };
}

export function getStockOpnameCurrentStock(
  target: KolamStockOpnameTargetOption | null,
  variantId: string,
): number | null {
  if (!target) {
    return null;
  }
  if (variantId) {
    const variant = target.variants.find(item => item.id === variantId);
    if (!variant) {
      return null;
    }
    return Number.isFinite(variant.stock) ? variant.stock : null;
  }
  return Number.isFinite(target.stock) ? target.stock : null;
}

export function getStockOpnameAdjustedStock(form: KolamStockOpnameFormState) {
  const parsed = Number(form.adjustedStock);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getStockOpnameDiff(
  form: KolamStockOpnameFormState,
  target: KolamStockOpnameTargetOption | null,
) {
  const current = getStockOpnameCurrentStock(target, form.variantId);
  const adjusted = getStockOpnameAdjustedStock(form);
  if (current == null || adjusted == null) {
    return null;
  }
  return adjusted - current;
}

export function getStockOpnameUnitPrice(
  target: KolamStockOpnameTargetOption | null,
  variantId: string,
) {
  if (!target) {
    return 0;
  }
  if (variantId) {
    const variant = target.variants.find(item => item.id === variantId);
    return variant?.price ?? 0;
  }
  return target.price ?? 0;
}

export function getStockOpnameLossAmount(
  form: KolamStockOpnameFormState,
  target: KolamStockOpnameTargetOption | null,
) {
  const diff = getStockOpnameDiff(form, target);
  if (diff == null || diff >= 0) {
    return 0;
  }
  return Math.abs(diff) * getStockOpnameUnitPrice(target, form.variantId);
}

export function stockOpnameNeedsWalletConfirm(
  form: KolamStockOpnameFormState,
  target: KolamStockOpnameTargetOption | null,
) {
  const diff = getStockOpnameDiff(form, target);
  const loss = getStockOpnameLossAmount(form, target);
  return diff != null && diff < 0 && loss > 0;
}

export function validateKolamStockOpnameForm(
  form: KolamStockOpnameFormState,
  target: KolamStockOpnameTargetOption | null,
): string | null {
  if (!form.targetId || !target) {
    return `Pilih ${KOLAM_STOCK_OPNAME_TARGET_LABELS[form.targetType]} terlebih dahulu.`;
  }
  if (target.hasVariants && !form.variantId) {
    return 'Pilih varian terlebih dahulu.';
  }
  if (getStockOpnameAdjustedStock(form) == null) {
    return 'Stok sesudah harus berupa angka.';
  }
  return null;
}

export function createKolamStockOpnameTargetFromProduct(product: {
  id: string;
  name?: string;
  displayName?: string;
  sku?: string;
  stock?: number;
  price?: number;
  priceToSell?: number;
  hasVariants?: boolean;
  variants?: Array<{
    id: string;
    label?: string;
    sku?: string;
    stock?: number;
    price?: number;
    priceToSell?: number;
  }>;
}): KolamStockOpnameTargetOption {
  const variants = (product.variants ?? [])
    .filter(variant => variant.id)
    .map(variant => ({
      id: variant.id,
      label: variant.label || variant.sku || 'Varian',
      sku: variant.sku || '',
      stock: Number(variant.stock) || 0,
      price: Number(variant.priceToSell ?? variant.price) || 0,
    }));

  return {
    id: product.id,
    label: product.name || product.displayName || 'Produk',
    sku: product.sku || '',
    stock: Number(product.stock) || 0,
    price: Number(product.priceToSell ?? product.price) || 0,
    hasVariants: Boolean(product.hasVariants && variants.length) || variants.length > 0,
    variants,
  };
}

export function createKolamStockOpnameTargetFromSpecies(species: {
  id: string;
  scientificName?: string;
  displayName?: string;
  sku?: string;
  stock?: number | null;
  price?: number;
  priceToSell?: number;
  variants?: Array<{
    id: string;
    label?: string;
    sku?: string;
    stock?: number;
    price?: number;
    priceToSell?: number;
  }>;
}): KolamStockOpnameTargetOption {
  const variants = (species.variants ?? [])
    .filter(variant => variant.id)
    .map(variant => ({
      id: variant.id,
      label: variant.label || variant.sku || 'Varian',
      sku: variant.sku || '',
      stock: Number(variant.stock) || 0,
      price: Number(variant.priceToSell ?? variant.price) || 0,
    }));

  return {
    id: species.id,
    label: species.scientificName || species.displayName || 'Spesies',
    sku: species.sku || '',
    stock: Number(species.stock) || 0,
    price: Number(species.priceToSell ?? species.price) || 0,
    hasVariants: variants.length > 0,
    variants,
  };
}

export function createKolamStockOpnameTargetFromFreyer(item: {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  hasVariants: boolean;
  variants: KolamStockOpnameVariantOption[];
}): KolamStockOpnameTargetOption {
  return {
    id: item.id,
    label: item.name,
    sku: item.sku,
    stock: item.stock,
    price: item.price,
    hasVariants: item.hasVariants && item.variants.length > 0,
    variants: item.variants,
  };
}

export function createKolamStockOpnameTargetFromTeranura(item: {
  id: string;
  name: string;
  sku: string;
  stock: number;
  priceToSell: number;
  variants: Array<{
    id: string;
    label: string;
    sku: string;
    stock: number;
    priceToSell: number;
  }>;
}): KolamStockOpnameTargetOption {
  const variants = item.variants.map(variant => ({
    id: variant.id,
    label: variant.label || variant.sku || 'Varian',
    sku: variant.sku,
    stock: variant.stock,
    price: variant.priceToSell,
  }));

  return {
    id: item.id,
    label: item.name,
    sku: item.sku,
    stock: item.stock,
    price: item.priceToSell,
    hasVariants: variants.length > 0,
    variants,
  };
}

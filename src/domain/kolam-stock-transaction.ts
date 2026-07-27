export type KolamStockTransactionType = 'in' | 'out' | 'adjust';
export type KolamStockTransactionStatus = 'unverified' | 'verified';
export type KolamStockTransactionWalletConfirmStatus =
  | 'unconfirmed'
  | 'confirmed'
  | 'rejected';

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
  ok: 'Sync OK',
  partial: 'Sync sebagian',
  failed: 'Sync gagal',
  pending: 'Menunggu sync',
  skipped: 'Sync dilewati',
  unknown: 'Sync ?',
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
  failed: 'Gagal',
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
) {
  return Boolean(audit?.summary || (audit?.targets.length ?? 0) > 0);
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
    financeNote: getFinanceNote(source, status, financeCancelled),
    verificationHint: getVerificationHint(status, financeCancelled),
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
  const name =
    getString(record, 'name') ||
    getString(record, 'displayName') ||
    getString(record, 'email');
  if (!id && !name) {
    return null;
  }
  return { id, name: name || 'Unknown' };
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
) {
  if (!hasStockTransactionFinanceVerification(source)) {
    return '';
  }
  if (financeCancelled) {
    return 'Hanya perubahan stok';
  }
  if (status === 'verified') {
    return 'Debit dompet dikonfirmasi';
  }
  return 'Debit dompet tertunda atau tidak ada';
}

function getVerificationHint(
  status: KolamStockTransactionStatus | '',
  financeCancelled: boolean,
) {
  if (status === 'verified' || financeCancelled) {
    return financeCancelled
      ? 'Selesai; debit dompet dibatalkan (hanya perubahan stok).'
      : 'Disetujui; debit dompet (jika ada) sudah diterapkan.';
  }
  if (status === 'unverified') {
    return 'Stok berubah; debit dompet belum dikonfirmasi atau dibatalkan.';
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
    return 'Tidak ada';
  }
  if (wallet.confirmStatus === 'confirmed') {
    return 'Dikonfirmasi (dompet didebit)';
  }
  if (wallet.confirmStatus === 'rejected') {
    return 'Ditolak';
  }
  return 'Tertunda (belum dikonfirmasi)';
}

function getFinanceStatusHint(
  financeCancelled: boolean,
  wallet: KolamStockTransactionWallet | null,
) {
  if (financeCancelled) {
    return 'Finance diputus. Hanya stok yang berubah; tidak ada uang masuk/keluar.';
  }
  if (!wallet) {
    return 'Hanya stok (tidak ada transaksi dompet tertaut).';
  }
  if (wallet.confirmStatus === 'confirmed') {
    return 'Jumlah sudah dipotong dari dompet.';
  }
  return 'Klik Verifikasi untuk mengonfirmasi, atau Batalkan Finance untuk memutus tautan.';
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

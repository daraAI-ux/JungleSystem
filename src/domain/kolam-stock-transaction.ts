export type KolamStockTransactionType = 'in' | 'out' | 'adjust';
export type KolamStockTransactionStatus = 'unverified' | 'verified';

export interface KolamStockTransactionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface KolamStockTransactionTargetRef {
  id: string;
  label: string;
  kind: 'product' | 'species' | 'packing' | 'freyer' | 'teranura' | 'service' | 'unknown';
  sku: string;
}

export interface KolamStockTransactionCrossSync {
  summary: string;
  originPlatform: string;
  sku: string;
}

export interface KolamStockTransactionPendingReturn {
  complaintId: string;
  ticketCode: string;
  quantity: number;
  source: string;
  saleInvoiceCode: string;
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
  status: KolamStockTransactionStatus | '';
  financeCancelled: boolean;
  statusLabel: string;
  financeNote: string;
  crossSync: KolamStockTransactionCrossSync | null;
  stockOpnameId: string;
  createdAt: string;
  reason: string;
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
    ? pendingRaw.map(normalizePendingReturn).filter(Boolean) as KolamStockTransactionPendingReturn[]
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
  const computed = asRecord(record.computed);
  const crossSync = asRecord(record.marketplaceCrossSync);
  const before = getNumber(record, 'before') ?? 0;
  const after = getNumber(record, 'after') ?? 0;
  const displayBefore = getNumber(computed, 'displayBefore') ?? before;
  const displayAfter = getNumber(computed, 'displayAfter') ?? after;
  const displayDelta =
    getNumber(computed, 'displayDelta') ?? displayAfter - displayBefore;
  const source = getString(record, 'source');
  const status = normalizeStatus(getString(record, 'status'));
  const financeCancelled = Boolean(getString(record, 'financeCancelledAt'));
  const target = resolveTarget({
    product,
    species,
    packing,
    freyer,
    teranura,
    service,
  });

  return {
    id: getString(record, '_id') || getString(record, 'id'),
    target,
    variantLabel:
      getString(record, 'variantLabel') ||
      (record.variant ? 'Varian' : 'Tanpa varian'),
    type: getString(record, 'type') || 'adjust',
    source,
    sourceLabel: stockTransactionSourceLabel(source),
    quantity: getNumber(record, 'quantity') ?? 0,
    before: displayBefore,
    after: displayAfter,
    delta: displayDelta,
    status,
    financeCancelled,
    statusLabel: getStatusLabel(status, source, financeCancelled),
    financeNote: getFinanceNote(source, status, financeCancelled),
    crossSync: normalizeCrossSync(crossSync),
    stockOpnameId: getString(record, 'stockOpnameId'),
    createdAt: getString(record, 'createdAt'),
    reason: getString(record, 'reason'),
  };
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
  if (getString(product, '_id') || getString(product, 'id') || getString(product, 'name')) {
    return {
      id: getString(product, '_id') || getString(product, 'id'),
      label: getString(product, 'name') || 'Produk',
      kind: 'product',
      sku: getString(product, 'sku') || getString(product, 'code') || 'Tidak ada data',
    };
  }
  if (
    getString(species, '_id') ||
    getString(species, 'id') ||
    getString(species, 'scientificName')
  ) {
    return {
      id: getString(species, '_id') || getString(species, 'id'),
      label: getString(species, 'scientificName') || 'Spesies',
      kind: 'species',
      sku: getString(species, 'sku') || 'Tidak ada data',
    };
  }
  if (getString(packing, '_id') || getString(packing, 'name')) {
    return {
      id: getString(packing, '_id') || getString(packing, 'id'),
      label: getString(packing, 'name') || 'Kemasan',
      kind: 'packing',
      sku: getString(packing, 'category') || 'Tanpa kategori',
    };
  }
  if (getString(freyer, '_id') || getString(freyer, 'name')) {
    return {
      id: getString(freyer, '_id') || getString(freyer, 'id'),
      label: getString(freyer, 'name') || 'Freyer',
      kind: 'freyer',
      sku: getString(freyer, 'sku') || getString(freyer, 'productCode') || 'Tidak ada data',
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
    };
  }
  return null;
}

function normalizeCrossSync(
  record: Record<string, unknown>,
): KolamStockTransactionCrossSync | null {
  const summary = getString(record, 'summary');
  if (!summary && !getString(record, 'originPlatform') && !getString(record, 'sku')) {
    return null;
  }
  return {
    summary: summary || 'unknown',
    originPlatform: getString(record, 'originPlatform'),
    sku: getString(record, 'sku'),
  };
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
  if (status || (source === 'stock-opname' && financeCancelled)) {
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
  if (source !== 'stock-opname') {
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

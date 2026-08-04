/**
 * DARA Market Intelligence / Intel Pasar (`/campaign/dara-market-intel/*`).
 * SoT: DA-Dara-Plugin market pages + FE layout tabs + BE `/dara-market-intel/*`.
 */

export const KOLAM_DARA_MARKET_INTEL_ROOT = '/campaign/dara-market-intel';
export const KOLAM_DARA_MARKET_INTEL_JOBS_HREF = '/pusat-ai';

export type KolamDaraMarketIntelTabId =
  | 'dashboard'
  | 'approvals'
  | 'competitors'
  | 'peralatan'
  | 'kesehatan';

export const KOLAM_DARA_MARKET_INTEL_TABS: Array<{
  id: KolamDaraMarketIntelTabId;
  label: string;
  href: string;
}> = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: KOLAM_DARA_MARKET_INTEL_ROOT,
  },
  {
    id: 'approvals',
    label: 'Persetujuan',
    href: `${KOLAM_DARA_MARKET_INTEL_ROOT}/approvals`,
  },
  {
    id: 'competitors',
    label: 'Kompetitor',
    href: `${KOLAM_DARA_MARKET_INTEL_ROOT}/competitors`,
  },
  {
    id: 'peralatan',
    label: 'Peralatan',
    href: `${KOLAM_DARA_MARKET_INTEL_ROOT}/peralatan`,
  },
  {
    id: 'kesehatan',
    label: 'Kesehatan Toko',
    href: `${KOLAM_DARA_MARKET_INTEL_ROOT}/kesehatan`,
  },
];

/** FE SeoPageShell title (dashboard). */
export const KOLAM_DARA_MARKET_INTEL_TITLE = 'DARA AI Market Intelligence';

/** FE SeoPageShell description (dashboard). */
export const KOLAM_DARA_MARKET_INTEL_DESCRIPTION =
  'Monitor harga & supplier, rekomendasi pricing/pembelian. Semua saran butuh approval — terapkan harga manual di produk setelah disetujui.';

export type KolamDaraMarketIntelPermissionEntry = {
  resource?: string | null;
  actions?: Array<string | null | undefined> | null;
};

const MARKET_INTEL_DENY_ROLES = new Set(['pos', 'customer', 'member']);

export function normalizeKolamDaraMarketIntelPath(route: string) {
  const path = route.trim().split('?')[0] || '';
  if (!path) {
    return '';
  }
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

export function isKolamDaraMarketIntelRoute(route: string) {
  const path = normalizeKolamDaraMarketIntelPath(route);
  return (
    path === KOLAM_DARA_MARKET_INTEL_ROOT ||
    path.startsWith(`${KOLAM_DARA_MARKET_INTEL_ROOT}/`)
  );
}

export function getKolamDaraMarketIntelTab(
  route: string,
): KolamDaraMarketIntelTabId {
  const path = normalizeKolamDaraMarketIntelPath(route);
  if (path === KOLAM_DARA_MARKET_INTEL_ROOT) {
    return 'dashboard';
  }
  if (path === `${KOLAM_DARA_MARKET_INTEL_ROOT}/approvals`) {
    return 'approvals';
  }
  if (path === `${KOLAM_DARA_MARKET_INTEL_ROOT}/competitors`) {
    return 'competitors';
  }
  if (path === `${KOLAM_DARA_MARKET_INTEL_ROOT}/peralatan`) {
    return 'peralatan';
  }
  if (path === `${KOLAM_DARA_MARKET_INTEL_ROOT}/kesehatan`) {
    return 'kesehatan';
  }
  return 'dashboard';
}

export function buildKolamDaraMarketIntelRoute(tab: KolamDaraMarketIntelTabId) {
  const found = KOLAM_DARA_MARKET_INTEL_TABS.find(item => item.id === tab);
  return found?.href ?? KOLAM_DARA_MARKET_INTEL_ROOT;
}

/**
 * Mirror FE `useDaraMarketAccess` with admin/owner + `ai-market-intel`
 * permissions and margin/purchasing gates.
 */
export function resolveKolamDaraMarketIntelAccess(input: {
  roleKey?: string | null;
  permissions?: KolamDaraMarketIntelPermissionEntry[] | null;
  isOwner?: boolean | null;
}) {
  const role = String(input.roleKey ?? '')
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-');
  const isAdmin =
    role === 'admin' ||
    role === 'super-admin' ||
    role === 'super-administrator' ||
    role === 'superadmin';
  const isOwner = input.isOwner === true || role === 'owner';
  const isPurchasing = role === 'purchasing';
  const isDeniedRole = MARKET_INTEL_DENY_ROLES.has(role);

  const can = (action: string) => {
    if (isAdmin || isOwner) {
      return true;
    }
    const permissions = input.permissions;
    if (permissions == null) {
      return false;
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
        (resource === 'ai-market-intel' || resource === '*') &&
        (actions.includes(wanted) ||
          actions.includes('*') ||
          (wanted === 'view' && actions.length > 0))
      );
    });
  };

  const canSee = isAdmin || isOwner || can('view');
  const canDraft = isAdmin || isOwner || can('draft');
  const canApprove = isAdmin || isOwner || can('approve');
  const canViewMargin =
    !isDeniedRole &&
    !isPurchasing &&
    (isAdmin || isOwner || can('approve') || can('draft'));
  const canViewPurchasing =
    canSee &&
    (isPurchasing || canViewMargin || isAdmin || isOwner);

  return {
    canSee,
    canDraft,
    canApprove,
    canViewMargin,
    canViewPurchasing,
    isPurchasing,
  };
}

export type KolamDaraMarketIntelStatus = {
  enabled: boolean;
  canView: boolean;
  canViewMargin: boolean;
  canDraft: boolean;
  canApprove: boolean;
  disclaimer: string;
};

export type KolamDaraMarketIntelBrand = {
  id: string;
  name: string;
  productCount: number;
  monitoringActive: boolean;
};

export type KolamDaraMarketIntelPriceRow = {
  productId: string;
  name: string;
  sellPrice: number;
  idealPrice: number;
  marginPercent: number | null;
  extraProfitPotential: number | null;
};

export type KolamDaraMarketIntelLowMarginRow = {
  productId: string;
  name: string;
  marginPercent: number;
};

export type KolamDaraMarketIntelSupplierLeader = {
  productId: string;
  productName: string;
  bestSupplier: string;
  cheapest: string;
  score: number;
};

export type KolamDaraMarketIntelTaxPolicy = {
  ppnRate: number;
  pricesIncludeTax: boolean;
  source: string;
  taxDisclaimer: string;
};

export type KolamDaraMarketIntelDashboard = {
  pendingApprovals: number;
  tooCheap: KolamDaraMarketIntelPriceRow[];
  tooExpensive: KolamDaraMarketIntelPriceRow[];
  lowMargin: KolamDaraMarketIntelLowMarginRow[];
  supplierLeaders: KolamDaraMarketIntelSupplierLeader[];
  totals: {
    extraProfitPotential: number | null;
    purchaseSavingsPotential: number;
  };
  taxPolicy: KolamDaraMarketIntelTaxPolicy | null;
};

export function normalizeKolamDaraMarketIntelStatus(
  payload: unknown,
): KolamDaraMarketIntelStatus {
  const data = unwrapDataRecord(payload);
  return {
    enabled: data.enabled !== false,
    canView: data.canView === true,
    canViewMargin: data.canViewMargin === true,
    canDraft: data.canDraft === true,
    canApprove: data.canApprove === true,
    disclaimer: String(data.disclaimer || '').trim(),
  };
}

export function normalizeKolamDaraMarketIntelBrands(payload: unknown): {
  brands: KolamDaraMarketIntelBrand[];
  defaultBrandId: string;
} {
  const data = unwrapDataRecord(payload);
  const brands = Array.isArray(data.brands)
    ? data.brands
        .map(item => {
          const row = asRecord(item);
          const id = String(row._id || row.id || '').trim();
          if (!id) {
            return null;
          }
          return {
            id,
            name:
              typeof row.name === 'string' && row.name.trim()
                ? row.name.trim()
                : id,
            productCount: toFiniteNumber(row.productCount),
            monitoringActive: row.monitoringActive === true,
          } satisfies KolamDaraMarketIntelBrand;
        })
        .filter((item): item is KolamDaraMarketIntelBrand => item != null)
    : [];
  return {
    brands,
    defaultBrandId:
      typeof data.defaultBrandId === 'string' && data.defaultBrandId.trim()
        ? data.defaultBrandId.trim()
        : 'all',
  };
}

export function normalizeKolamDaraMarketIntelDashboard(
  payload: unknown,
): KolamDaraMarketIntelDashboard | null {
  const data = unwrapDataRecord(payload);
  if (!Object.keys(data).length) {
    return null;
  }
  const totals = asRecord(data.totals);
  const taxRaw = data.taxPolicy;
  const tax =
    taxRaw != null && typeof taxRaw === 'object' && !Array.isArray(taxRaw)
      ? asRecord(taxRaw)
      : null;

  return {
    pendingApprovals: toFiniteNumber(data.pendingApprovals),
    tooCheap: normalizePriceRows(data.tooCheap),
    tooExpensive: normalizePriceRows(data.tooExpensive),
    lowMargin: normalizeLowMarginRows(data.lowMargin),
    supplierLeaders: normalizeSupplierLeaders(data.supplierLeaders),
    totals: {
      extraProfitPotential:
        totals.extraProfitPotential == null ||
        totals.extraProfitPotential === ''
          ? null
          : toFiniteNumber(totals.extraProfitPotential),
      purchaseSavingsPotential: toFiniteNumber(
        totals.purchaseSavingsPotential,
      ),
    },
    taxPolicy: tax
      ? {
          ppnRate: toFiniteNumber(tax.ppnRate),
          pricesIncludeTax: tax.pricesIncludeTax === true,
          source: String(tax.source || '').trim(),
          taxDisclaimer: String(tax.taxDisclaimer || '').trim(),
        }
      : null,
  };
}

function normalizePriceRows(value: unknown): KolamDaraMarketIntelPriceRow[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const row = asRecord(item);
      const productId = String(row.productId || row._id || '').trim();
      if (!productId) {
        return null;
      }
      return {
        productId,
        name: String(row.name || '').trim() || productId,
        sellPrice: toFiniteNumber(row.sellPrice),
        idealPrice: toFiniteNumber(row.idealPrice),
        marginPercent:
          row.marginPercent == null || row.marginPercent === ''
            ? null
            : toFiniteNumber(row.marginPercent),
        extraProfitPotential:
          row.extraProfitPotential == null || row.extraProfitPotential === ''
            ? null
            : toFiniteNumber(row.extraProfitPotential),
      } satisfies KolamDaraMarketIntelPriceRow;
    })
    .filter((item): item is KolamDaraMarketIntelPriceRow => item != null);
}

function normalizeLowMarginRows(
  value: unknown,
): KolamDaraMarketIntelLowMarginRow[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const row = asRecord(item);
      const productId = String(row.productId || row._id || '').trim();
      if (!productId) {
        return null;
      }
      return {
        productId,
        name: String(row.name || '').trim() || productId,
        marginPercent: toFiniteNumber(row.marginPercent),
      } satisfies KolamDaraMarketIntelLowMarginRow;
    })
    .filter((item): item is KolamDaraMarketIntelLowMarginRow => item != null);
}

function normalizeSupplierLeaders(
  value: unknown,
): KolamDaraMarketIntelSupplierLeader[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const row = asRecord(item);
      const productId = String(row.productId || row._id || '').trim();
      if (!productId) {
        return null;
      }
      return {
        productId,
        productName: String(row.productName || row.name || '').trim() || productId,
        bestSupplier: String(row.bestSupplier || '').trim() || '—',
        cheapest: String(row.cheapest || '').trim() || '—',
        score: toFiniteNumber(row.score),
      } satisfies KolamDaraMarketIntelSupplierLeader;
    })
    .filter((item): item is KolamDaraMarketIntelSupplierLeader => item != null);
}

function unwrapDataRecord(payload: unknown): Record<string, unknown> {
  const root = asRecord(payload);
  if (root.data && typeof root.data === 'object' && !Array.isArray(root.data)) {
    return asRecord(root.data);
  }
  return root;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function toFiniteNumber(value: unknown) {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** FE `formatIdr` on market dashboard. */
export function formatKolamDaraMarketIntelIdr(value?: number | null) {
  if (value == null || !Number.isFinite(value)) {
    return '—';
  }
  return `Rp ${Math.round(value).toLocaleString('id-ID')}`;
}

/** FE `taxSourceLabel`. */
export function formatKolamDaraMarketIntelTaxSource(source: string) {
  if (source === 'regulation') {
    return 'Regulasi DARA Tax';
  }
  if (source === 'po_latest') {
    return 'PO terbaru';
  }
  return source.trim() || '—';
}

export type KolamDaraMarketIntelRecStatus =
  | 'draft_ready'
  | 'pending_approval'
  | 'approved'
  | 'applied'
  | 'rejected'
  | 'deferred'
  | string;

export type KolamDaraMarketIntelRecCategory =
  | 'pricing'
  | 'purchasing'
  | 'supplier'
  | 'competitor_alert'
  | 'channel_pricing'
  | string;

export type KolamDaraMarketIntelStatusFilterId =
  | 'all'
  | 'draft_ready'
  | 'pending_approval'
  | 'applied'
  | 'rejected';

export const KOLAM_DARA_MARKET_INTEL_STATUS_FILTERS: Array<{
  id: KolamDaraMarketIntelStatusFilterId;
  label: string;
}> = [
  {id: 'all', label: 'Semua'},
  {id: 'draft_ready', label: 'Draft'},
  {id: 'pending_approval', label: 'Menunggu'},
  {id: 'applied', label: 'Disetujui'},
  {id: 'rejected', label: 'Ditolak'},
];

export const KOLAM_DARA_MARKET_INTEL_APPROVALS_PAGE_SIZE = 10;

export type KolamDaraMarketIntelEntityRef = {
  id: string;
  name: string;
  sku?: string;
};

export type KolamDaraMarketIntelRecommendation = {
  id: string;
  category: KolamDaraMarketIntelRecCategory;
  status: KolamDaraMarketIntelRecStatus;
  title: string;
  summary: string;
  daraMessage: string;
  product: KolamDaraMarketIntelEntityRef | null;
  species: KolamDaraMarketIntelEntityRef | null;
  vendor: KolamDaraMarketIntelEntityRef | null;
  metrics: Record<string, number | null> | null;
  createdAt: string;
};

export type KolamDaraMarketIntelBulkActionResult = {
  id: string;
  ok: boolean;
  error?: string;
};

export type KolamDaraMarketIntelMetricLine = {
  label: string;
  value: string;
};

export function formatKolamDaraMarketIntelCategory(
  category: KolamDaraMarketIntelRecCategory,
) {
  if (category === 'pricing') {
    return 'Pricing';
  }
  if (category === 'purchasing') {
    return 'Pembelian';
  }
  if (category === 'channel_pricing') {
    return 'Channel';
  }
  if (category === 'supplier') {
    return 'Supplier';
  }
  if (category === 'competitor_alert') {
    return 'Kompetitor';
  }
  return String(category || '—');
}

export function formatKolamDaraMarketIntelRecStatus(
  status: KolamDaraMarketIntelRecStatus,
) {
  if (status === 'draft_ready') {
    return 'Draft';
  }
  if (status === 'pending_approval') {
    return 'Menunggu';
  }
  if (status === 'applied' || status === 'approved') {
    return 'Disetujui';
  }
  if (status === 'rejected') {
    return 'Ditolak';
  }
  if (status === 'deferred') {
    return 'Ditunda';
  }
  return String(status || '—');
}

/** FE `isApprovable`. */
export function isKolamDaraMarketIntelApprovable(
  item: Pick<KolamDaraMarketIntelRecommendation, 'status'>,
) {
  return item.status === 'draft_ready' || item.status === 'pending_approval';
}

/** FE `entityName`. */
export function formatKolamDaraMarketIntelEntityName(
  item: Pick<
    KolamDaraMarketIntelRecommendation,
    'category' | 'product' | 'species'
  >,
) {
  if (item.category === 'channel_pricing' && item.species) {
    return item.species.name || 'Species';
  }
  return item.product?.name || item.product?.sku || 'Produk';
}

/** FE client margin gate: hide pricing / channel_pricing rows. */
export function filterKolamDaraMarketIntelRecommendationsForMargin(
  items: KolamDaraMarketIntelRecommendation[],
  canViewMargin: boolean,
) {
  if (canViewMargin) {
    return items;
  }
  return items.filter(
    item =>
      item.category !== 'pricing' && item.category !== 'channel_pricing',
  );
}

export function paginateKolamDaraMarketIntelRecommendations(
  items: KolamDaraMarketIntelRecommendation[],
  page: number,
  pageSize = KOLAM_DARA_MARKET_INTEL_APPROVALS_PAGE_SIZE,
) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    page: safePage,
    totalPages,
    total,
    items: items.slice(start, start + pageSize),
  };
}

function formatMetricIdr(value?: number | null) {
  if (value == null || !Number.isFinite(value) || value === 0) {
    return null;
  }
  return `Rp ${Math.round(value).toLocaleString('id-ID')}`;
}

function formatMetricPct(value?: number | null) {
  if (value == null || !Number.isFinite(value) || value === 0) {
    return null;
  }
  return `${Number(value).toFixed(1)}%`;
}

/** FE `MarketMetricsSummary` / `linesFromMetrics`. */
export function buildKolamDaraMarketIntelMetricLines(
  category: KolamDaraMarketIntelRecCategory,
  metrics: Record<string, number | null> | null | undefined,
): KolamDaraMarketIntelMetricLine[] {
  if (!metrics || typeof metrics !== 'object') {
    return [];
  }
  const m = metrics;
  const out: KolamDaraMarketIntelMetricLine[] = [];

  const stockDays = m.stockDaysLeft;
  const recQty = m.recommendedPurchaseQty;
  if (stockDays != null && stockDays > 0) {
    const qty =
      recQty != null && recQty > 0
        ? ` — rekomendasi beli ${recQty} unit`
        : '';
    out.push({
      label: 'Stok',
      value: `Perkiraan sisa ${stockDays} hari${qty}`,
    });
  } else if (recQty != null && recQty > 0) {
    out.push({
      label: 'Pembelian',
      value: `Rekomendasi beli ${recQty} unit`,
    });
  }

  const sell = formatMetricIdr(m.currentSellPrice);
  const ideal = formatMetricIdr(m.idealPrice);
  const minP = formatMetricIdr(m.minPrice);
  const prem = formatMetricIdr(m.premiumPrice);
  const comp = formatMetricIdr(m.competitorPrice);
  const hpp = formatMetricIdr(m.hpp);
  const sup = formatMetricIdr(m.supplierPrice);

  if (category === 'channel_pricing') {
    const recWeb = formatMetricIdr(m.recommendedWebPrice);
    const recOl = formatMetricIdr(m.recommendedOnlinePrice);
    if (sell) {
      out.push({label: 'Harga web sekarang', value: sell});
    }
    if (recWeb) {
      out.push({label: 'Rekomendasi web/POS', value: recWeb});
    }
    if (recOl) {
      out.push({label: 'Rekomendasi listing olshop', value: recOl});
    }
    const webMk = formatMetricPct(m.websiteMarkupPercent);
    if (webMk) {
      out.push({label: 'Markup web', value: webMk});
    }
    if (hpp) {
      out.push({label: 'HPP', value: hpp});
    }
  }

  if (category === 'pricing' || sell || ideal) {
    if (sell) {
      out.push({label: 'Harga jual sekarang', value: sell});
    }
    if (ideal) {
      out.push({label: 'Harga ideal', value: ideal});
    }
    if (minP) {
      out.push({label: 'Batas bawah', value: minP});
    }
    if (prem) {
      out.push({label: 'Harga premium', value: prem});
    }
    if (comp) {
      out.push({label: 'Harga kompetitor', value: comp});
    }
    const margin = formatMetricPct(m.marginPercent);
    if (margin) {
      out.push({label: 'Margin', value: margin});
    }
    const extra = formatMetricIdr(m.extraProfitPotential);
    if (extra) {
      out.push({label: 'Potensi laba tambahan', value: extra});
    }
  }

  if (category === 'purchasing' || hpp || sup) {
    if (hpp) {
      out.push({label: 'HPP', value: hpp});
    }
    if (sup) {
      out.push({label: 'Harga supplier', value: sup});
    }
    const save = formatMetricIdr(m.purchaseSavingsPotential);
    if (save) {
      out.push({label: 'Potensi hemat beli', value: save});
    }
  }

  if (m.supplierScore != null && m.supplierScore > 0) {
    out.push({
      label: 'Skor supplier',
      value: `${Math.round(m.supplierScore)}/100`,
    });
  }

  const tax = formatMetricPct(m.taxRatePercent);
  if (tax) {
    out.push({label: 'PPN (estimasi)', value: tax});
  }

  const estMargin = formatMetricIdr(m.estimatedMargin);
  if (estMargin && !out.some(line => line.label === 'Margin')) {
    out.push({label: 'Estimasi margin (Rp)', value: estMargin});
  }

  return out;
}

export function normalizeKolamDaraMarketIntelRecommendations(
  payload: unknown,
): {items: KolamDaraMarketIntelRecommendation[]; total: number} {
  const data = unwrapDataRecord(payload);
  const rawItems = Array.isArray(data.items)
    ? data.items
    : Array.isArray(payload)
      ? payload
      : [];
  const items = rawItems
    .map(normalizeKolamDaraMarketIntelRecommendation)
    .filter(
      (item): item is KolamDaraMarketIntelRecommendation => item != null,
    );
  const total =
    typeof data.total === 'number' && Number.isFinite(data.total)
      ? data.total
      : items.length;
  return {items, total};
}

export function normalizeKolamDaraMarketIntelRecommendation(
  payload: unknown,
): KolamDaraMarketIntelRecommendation | null {
  const row = unwrapDataRecord(payload);
  const id = String(row._id || row.id || '').trim();
  if (!id) {
    return null;
  }
  const metricsRaw = row.metrics;
  let metrics: Record<string, number | null> | null = null;
  if (
    metricsRaw &&
    typeof metricsRaw === 'object' &&
    !Array.isArray(metricsRaw)
  ) {
    metrics = {};
    for (const [key, value] of Object.entries(asRecord(metricsRaw))) {
      if (value == null || value === '') {
        metrics[key] = null;
      } else {
        const n = typeof value === 'number' ? value : Number(value);
        metrics[key] = Number.isFinite(n) ? n : null;
      }
    }
  }

  return {
    id,
    category: String(row.category || '').trim() || 'pricing',
    status: String(row.status || '').trim() || 'draft_ready',
    title: String(row.title || '').trim() || id,
    summary: String(row.summary || '').trim(),
    daraMessage: String(row.daraMessage || '').trim(),
    product: normalizeEntityRef(row.productId, 'name'),
    species: normalizeSpeciesRef(row.speciesId),
    vendor: normalizeEntityRef(row.vendorId, 'name'),
    metrics,
    createdAt: String(row.createdAt || '').trim(),
  };
}

export function normalizeKolamDaraMarketIntelBulkActionResults(
  payload: unknown,
): KolamDaraMarketIntelBulkActionResult[] {
  const data = unwrapDataRecord(payload);
  const raw = Array.isArray(data)
    ? data
    : Array.isArray(data.data)
      ? data.data
      : Array.isArray(payload)
        ? payload
        : Array.isArray(data.results)
          ? data.results
          : [];
  return raw
    .map(item => {
      const row = asRecord(item);
      const id = String(row.id || row._id || '').trim();
      if (!id) {
        return null;
      }
      return {
        id,
        ok: row.ok === true,
        error:
          typeof row.error === 'string' && row.error.trim()
            ? row.error.trim()
            : undefined,
      } satisfies KolamDaraMarketIntelBulkActionResult;
    })
    .filter(
      (item): item is KolamDaraMarketIntelBulkActionResult => item != null,
    );
}

function normalizeEntityRef(
  value: unknown,
  nameKey: string,
): KolamDaraMarketIntelEntityRef | null {
  if (value == null) {
    return null;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const id = String(value).trim();
    return id ? {id, name: id} : null;
  }
  const row = asRecord(value);
  const id = String(row._id || row.id || '').trim();
  if (!id) {
    return null;
  }
  const name =
    typeof row[nameKey] === 'string' && String(row[nameKey]).trim()
      ? String(row[nameKey]).trim()
      : typeof row.sku === 'string' && row.sku.trim()
        ? row.sku.trim()
        : id;
  const sku =
    typeof row.sku === 'string' && row.sku.trim() ? row.sku.trim() : undefined;
  return {id, name, sku};
}

function normalizeSpeciesRef(
  value: unknown,
): KolamDaraMarketIntelEntityRef | null {
  if (value == null) {
    return null;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const id = String(value).trim();
    return id ? {id, name: 'Species'} : null;
  }
  const row = asRecord(value);
  const id = String(row._id || row.id || '').trim();
  if (!id) {
    return null;
  }
  const name =
    (typeof row.commonName === 'string' && row.commonName.trim()) ||
    (typeof row.localName === 'string' && row.localName.trim()) ||
    (typeof row.scientificName === 'string' && row.scientificName.trim()) ||
    'Species';
  return {id, name};
}

export type KolamDaraMarketIntelCompetitorChannelId =
  | 'website'
  | 'tokopedia'
  | 'shopee';

export const KOLAM_DARA_MARKET_INTEL_COMPETITOR_CHANNELS: Array<{
  id: KolamDaraMarketIntelCompetitorChannelId;
  label: string;
  platform: string;
  compareWith: 'website' | 'marketplace';
}> = [
  {
    id: 'website',
    label: 'Website',
    platform: 'website',
    compareWith: 'website',
  },
  {
    id: 'tokopedia',
    label: 'Tokopedia',
    platform: 'tokopedia',
    compareWith: 'marketplace',
  },
  {
    id: 'shopee',
    label: 'Shopee',
    platform: 'shopee',
    compareWith: 'marketplace',
  },
];

export type KolamDaraMarketIntelCompetitorLinkMonitor = {
  ourPrice: number | null;
  hpp: number | null;
  minSafePrice: number | null;
  suggestedPrice: number | null;
  priceDelta: number | null;
  priceDeltaPct: number | null;
};

export type KolamDaraMarketIntelCompetitorLink = {
  id: string;
  competitorName: string;
  platform: string;
  listingUrl: string;
  websiteUrl: string;
  compareWith: string;
  lastIngestedAt: string;
  lastFetchStatus: string;
  lastFetchError: string;
  lastFetchedPrice: number | null;
  active: boolean;
  product: KolamDaraMarketIntelEntityRef | null;
  latestSnapshotPrice: number | null;
  monitor: KolamDaraMarketIntelCompetitorLinkMonitor | null;
};

export type KolamDaraMarketIntelCompetitorGroup = {
  name: string;
  itemCount: number;
  tokopedia: boolean;
  shopee: boolean;
  website: boolean;
};

export type KolamDaraMarketIntelCompetitorBaseline = {
  webPrice: number;
  onlinePrice: number;
  hpp: number;
};

export type KolamDaraMarketIntelCompetitorFetchResult = {
  ok: boolean;
  price: number | null;
  error: string;
};

/** FE `isMongoObjectId`. */
export function isKolamDaraMarketIntelMongoObjectId(value: string) {
  return /^[a-f\d]{24}$/i.test(String(value || '').trim());
}

/** FE `matchProductDigitFilter`. */
export function matchKolamDaraMarketIntelProductDigitFilter(
  sku: string,
  name: string,
  digits: string,
) {
  const filter = String(digits || '').replace(/\D/g, '');
  if (!filter) {
    return true;
  }
  const hay = `${sku || ''} ${name || ''}`;
  try {
    const pattern = filter
      .split('')
      .map(digit => `${digit}[\\w-]*`)
      .join('');
    return new RegExp(pattern, 'i').test(hay);
  } catch {
    return hay.includes(filter);
  }
}

export function formatKolamDaraMarketIntelCompetitorPlatform(platform: string) {
  if (platform === 'website') {
    return 'Website';
  }
  if (platform === 'tokopedia') {
    return 'Tokopedia';
  }
  if (platform === 'shopee') {
    return 'Shopee';
  }
  return platform || '—';
}

export function formatKolamDaraMarketIntelCompetitorFetchStatus(status: string) {
  if (status === 'ok') {
    return 'OK';
  }
  if (status === 'failed') {
    return 'Gagal';
  }
  if (status === 'skipped') {
    return 'Skip';
  }
  return '—';
}

export function formatKolamDaraMarketIntelCompetitorFetchTime(
  iso?: string | null,
) {
  if (!iso) {
    return '—';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function resolveKolamDaraMarketIntelCompetitorPrice(
  link: Pick<
    KolamDaraMarketIntelCompetitorLink,
    'lastFetchedPrice' | 'latestSnapshotPrice'
  >,
) {
  if (link.lastFetchedPrice != null && link.lastFetchedPrice > 0) {
    return link.lastFetchedPrice;
  }
  return link.latestSnapshotPrice;
}

/** FE `groupCompetitors`. */
export function groupKolamDaraMarketIntelCompetitors(
  links: KolamDaraMarketIntelCompetitorLink[],
): KolamDaraMarketIntelCompetitorGroup[] {
  const map = new Map<
    string,
    {products: Set<string>; platforms: Set<string>}
  >();
  for (const link of links) {
    const name = link.competitorName.trim();
    if (!name) {
      continue;
    }
    if (!map.has(name)) {
      map.set(name, {products: new Set(), platforms: new Set()});
    }
    const group = map.get(name)!;
    const productId = link.product?.id || '';
    if (productId) {
      group.products.add(productId);
    }
    group.platforms.add(link.platform);
  }
  return [...map.entries()]
    .map(([name, group]) => ({
      name,
      itemCount: group.products.size,
      tokopedia: group.platforms.has('tokopedia'),
      shopee: group.platforms.has('shopee'),
      website: group.platforms.has('website'),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'id'));
}

export function normalizeKolamDaraMarketIntelCompetitorLinks(
  payload: unknown,
): KolamDaraMarketIntelCompetitorLink[] {
  const root = asRecord(payload);
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(root.data)
      ? root.data
      : Array.isArray(root.items)
        ? root.items
        : [];
  return list
    .map(normalizeKolamDaraMarketIntelCompetitorLink)
    .filter(
      (item): item is KolamDaraMarketIntelCompetitorLink => item != null,
    );
}

export function normalizeKolamDaraMarketIntelCompetitorLink(
  payload: unknown,
): KolamDaraMarketIntelCompetitorLink | null {
  const row = asRecord(payload);
  const id = String(row._id || row.id || '').trim();
  if (!id) {
    return null;
  }
  const monitorRaw = row.monitor;
  const monitor =
    monitorRaw && typeof monitorRaw === 'object' && !Array.isArray(monitorRaw)
      ? asRecord(monitorRaw)
      : null;
  const snapshot = asRecord(row.latestSnapshot);
  const snapshotPrice =
    snapshot.price == null || snapshot.price === ''
      ? null
      : toFiniteNumber(snapshot.price);

  return {
    id,
    competitorName: String(row.competitorName || '').trim(),
    platform: String(row.platform || '').trim(),
    listingUrl: String(row.listingUrl || '').trim(),
    websiteUrl: String(row.websiteUrl || '').trim(),
    compareWith: String(row.compareWith || '').trim(),
    lastIngestedAt: String(row.lastIngestedAt || '').trim(),
    lastFetchStatus: String(row.lastFetchStatus || '').trim(),
    lastFetchError: String(row.lastFetchError || '').trim(),
    lastFetchedPrice:
      row.lastFetchedPrice == null || row.lastFetchedPrice === ''
        ? null
        : toFiniteNumber(row.lastFetchedPrice),
    active: row.active !== false,
    product: normalizeEntityRef(row.productId, 'name'),
    latestSnapshotPrice: snapshotPrice,
    monitor: monitor
      ? {
          ourPrice: nullableNumber(monitor.ourPrice),
          hpp: nullableNumber(monitor.hpp),
          minSafePrice: nullableNumber(monitor.minSafePrice),
          suggestedPrice: nullableNumber(monitor.suggestedPrice),
          priceDelta: nullableNumber(monitor.priceDelta),
          priceDeltaPct: nullableNumber(monitor.priceDeltaPct),
        }
      : null,
  };
}

export function normalizeKolamDaraMarketIntelCompetitorBaseline(
  payload: unknown,
): KolamDaraMarketIntelCompetitorBaseline | null {
  const data = unwrapDataRecord(payload);
  if (!Object.keys(data).length) {
    return null;
  }
  return {
    webPrice: toFiniteNumber(data.webPrice),
    onlinePrice: toFiniteNumber(data.onlinePrice),
    hpp: toFiniteNumber(data.hpp),
  };
}

export function normalizeKolamDaraMarketIntelCompetitorFetchResult(
  payload: unknown,
): KolamDaraMarketIntelCompetitorFetchResult {
  const data = unwrapDataRecord(payload);
  return {
    ok: data.ok === true,
    price:
      data.price == null || data.price === ''
        ? null
        : toFiniteNumber(data.price),
    error: String(data.error || '').trim(),
  };
}

function nullableNumber(value: unknown): number | null {
  if (value == null || value === '') {
    return null;
  }
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export type KolamDaraMarketIntelStoreHealthTone = 'good' | 'warn' | 'bad';

export type KolamDaraMarketIntelStoreHealthIssue = {
  code: string;
  message: string;
  level: 'blocker' | 'warning';
};

export type KolamDaraMarketIntelStoreHealthProductRow = {
  productId: string;
  sku: string;
  name: string;
  score: number;
  blockers: number;
  warnings: number;
  issues: KolamDaraMarketIntelStoreHealthIssue[];
  complete: boolean;
};

export type KolamDaraMarketIntelStoreHealthParameter = {
  id: string;
  label: string;
  level: 'blocker' | 'warning';
  sellableOnly: boolean;
  pass: number;
  fail: number;
  passRate: number;
};

export type KolamDaraMarketIntelStoreHealthScan = {
  generatedAt: string;
  sellableOnly: boolean;
  formula: {
    storeScore: string;
    productScore: string;
    complete: string;
  };
  summary: {
    total: number;
    complete: number;
    incomplete: number;
    blockerProducts: number;
    storeHealthScore: number;
  };
  parameters: KolamDaraMarketIntelStoreHealthParameter[];
  products: KolamDaraMarketIntelStoreHealthProductRow[];
};

/** FE `scoreTone` on store-health gauge. */
export function resolveKolamDaraMarketIntelStoreHealthTone(
  score: number,
): KolamDaraMarketIntelStoreHealthTone {
  if (score >= 100) {
    return 'good';
  }
  if (score >= 70) {
    return 'warn';
  }
  return 'bad';
}

export function buildKolamDaraMarketIntelProductEditRoute(productId: string) {
  return `/products/${encodeURIComponent(productId)}/edit`;
}

export function normalizeKolamDaraMarketIntelStoreHealthScan(
  payload: unknown,
): KolamDaraMarketIntelStoreHealthScan | null {
  const data = unwrapDataRecord(payload);
  if (!Object.keys(data).length) {
    return null;
  }
  const summary = asRecord(data.summary);
  const formula = asRecord(data.formula);
  return {
    generatedAt: String(data.generatedAt || '').trim(),
    sellableOnly: data.sellableOnly !== false,
    formula: {
      storeScore: String(formula.storeScore || '').trim(),
      productScore: String(formula.productScore || '').trim(),
      complete: String(formula.complete || '').trim(),
    },
    summary: {
      total: toFiniteNumber(summary.total),
      complete: toFiniteNumber(summary.complete),
      incomplete: toFiniteNumber(summary.incomplete),
      blockerProducts: toFiniteNumber(summary.blockerProducts),
      storeHealthScore: toFiniteNumber(summary.storeHealthScore),
    },
    parameters: normalizeStoreHealthParameters(data.parameters),
    products: normalizeStoreHealthProducts(data.products),
  };
}

function normalizeStoreHealthParameters(
  value: unknown,
): KolamDaraMarketIntelStoreHealthParameter[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const row = asRecord(item);
      const id = String(row.id || '').trim();
      if (!id) {
        return null;
      }
      return {
        id,
        label: String(row.label || '').trim() || id,
        level: row.level === 'blocker' ? 'blocker' : 'warning',
        sellableOnly: row.sellableOnly === true,
        pass: toFiniteNumber(row.pass),
        fail: toFiniteNumber(row.fail),
        passRate: toFiniteNumber(row.passRate),
      } satisfies KolamDaraMarketIntelStoreHealthParameter;
    })
    .filter(
      (item): item is KolamDaraMarketIntelStoreHealthParameter => item != null,
    );
}

function normalizeStoreHealthProducts(
  value: unknown,
): KolamDaraMarketIntelStoreHealthProductRow[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const row = asRecord(item);
      const productId = String(row.productId || row._id || '').trim();
      if (!productId) {
        return null;
      }
      return {
        productId,
        sku: String(row.sku || '').trim(),
        name: String(row.name || '').trim() || productId,
        score: toFiniteNumber(row.score),
        blockers: toFiniteNumber(row.blockers),
        warnings: toFiniteNumber(row.warnings),
        issues: normalizeStoreHealthIssues(row.issues),
        complete: row.complete === true,
      } satisfies KolamDaraMarketIntelStoreHealthProductRow;
    })
    .filter(
      (item): item is KolamDaraMarketIntelStoreHealthProductRow => item != null,
    );
}

function normalizeStoreHealthIssues(
  value: unknown,
): KolamDaraMarketIntelStoreHealthIssue[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const row = asRecord(item);
      const code = String(row.code || '').trim();
      if (!code) {
        return null;
      }
      return {
        code,
        message: String(row.message || '').trim() || code,
        level: row.level === 'blocker' ? 'blocker' : 'warning',
      } satisfies KolamDaraMarketIntelStoreHealthIssue;
    })
    .filter(
      (item): item is KolamDaraMarketIntelStoreHealthIssue => item != null,
    );
}

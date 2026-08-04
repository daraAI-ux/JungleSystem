/**
 * DARA Market Intelligence / Intel Pasar (`/campaign/dara-market-intel/*`).
 * SoT: DA-Dara-Plugin market pages + FE layout tabs + BE `/dara-market-intel/*`.
 */

export const KOLAM_DARA_MARKET_INTEL_ROOT = '/campaign/dara-market-intel';
export const KOLAM_DARA_MARKET_INTEL_JOBS_HREF = '/pusat-ai?tab=proses';

export type KolamDaraMarketIntelTabId =
  | 'dashboard'
  | 'approvals'
  | 'competitors'
  | 'peralatan'
  | 'kesehatan'
  | 'jobs';

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
  {
    id: 'jobs',
    label: 'Riwayat proses',
    href: KOLAM_DARA_MARKET_INTEL_JOBS_HREF,
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

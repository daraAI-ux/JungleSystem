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

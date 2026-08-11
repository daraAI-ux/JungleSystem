/**
 * Finance tax routes — FE `/finance/tax` (DARA Inteligensi Pajak).
 *
 * SoT: DA-Dara-Plugin `dara-tax-dashboard` + `tax-intelligence-dashboard`.
 */

export const KOLAM_FINANCE_TAX_ROOT = '/finance/tax';

/** FE HeaderDescription — also shell nav description. */
export const KOLAM_DARA_TAX_DESCRIPTION =
  'Ringkasan estimasi pajak, faktur, setoran, dan kepatuhan per periode.';

export type KolamDaraTaxTabId =
  | 'ringkasan'
  | 'operasional'
  | 'regulasi'
  | 'laporan'
  | 'pelunasan';

export type KolamDaraTaxPeriod = 'today' | 'week' | 'month' | 'year';

export const KOLAM_DARA_TAX_TABS: Array<{
  id: KolamDaraTaxTabId;
  label: string;
}> = [
  {id: 'ringkasan', label: 'Ringkasan'},
  {id: 'operasional', label: 'Operasional'},
  {id: 'regulasi', label: 'Regulasi'},
  {id: 'laporan', label: 'Laporan'},
  {id: 'pelunasan', label: 'Setoran'},
];

export const KOLAM_DARA_TAX_PERIOD_OPTIONS: Array<{
  id: KolamDaraTaxPeriod;
  label: string;
}> = [
  {id: 'month', label: 'Bulan ini'},
  {id: 'week', label: 'Minggu ini'},
  {id: 'today', label: 'Hari ini'},
  {id: 'year', label: 'Tahun ini'},
];

export const KOLAM_DARA_TAX_DEFAULT_PERIOD: KolamDaraTaxPeriod = 'month';

export type KolamDaraTaxPermissionEntry = {
  resource?: string | null;
  actions?: Array<string | null> | null;
};

export function isKolamFinanceTaxRoute(route: string): boolean {
  const path = normalizeTaxPath(route);
  return path === KOLAM_FINANCE_TAX_ROOT;
}

export function getKolamFinanceTaxSurfaceMode(
  route: string,
): 'dashboard' {
  void route;
  return 'dashboard';
}

/** FE `?tab=` — empty / unknown → ringkasan. */
export function getKolamDaraTaxTab(route: string): KolamDaraTaxTabId {
  const query = route.includes('?') ? route.split('?')[1] || '' : '';
  const raw = String(new URLSearchParams(query).get('tab') || '')
    .trim()
    .toLowerCase();
  const match = KOLAM_DARA_TAX_TABS.find(tab => tab.id === raw);
  return match?.id ?? 'ringkasan';
}

export function buildKolamDaraTaxRoute(tab: KolamDaraTaxTabId): string {
  if (tab === 'ringkasan') {
    return KOLAM_FINANCE_TAX_ROOT;
  }
  return `${KOLAM_FINANCE_TAX_ROOT}?tab=${tab}`;
}

export function resolveKolamDaraTaxAccess(input: {
  roleKey?: string | null;
  permissions?: KolamDaraTaxPermissionEntry[] | null;
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
        (resource === 'tax' || resource === '*') &&
        (actions.includes(wanted) ||
          actions.includes('*') ||
          (wanted === 'view' && actions.length > 0))
      );
    });
  };

  return {
    canSee: isAdmin || isOwner || can('view'),
    canDraft: isAdmin || isOwner || can('draft'),
    canApprove: isAdmin || isOwner || can('approve'),
    isAdmin: isAdmin || isOwner,
  };
}

function normalizeTaxPath(route: string): string {
  const path = String(route || '').split('?')[0].replace(/\/+$/, '') || '/';
  return path.startsWith('/') ? path : `/${path}`;
}

/**
 * Finance tax routes — FE `/finance/tax` (DARA plugin) + `/finance/settings/tax-profile`.
 */

export const KOLAM_FINANCE_TAX_ROOT = '/finance/tax';
export const KOLAM_FINANCE_TAX_PROFILE_ROUTE = '/finance/settings/tax-profile';

export function isKolamFinanceTaxRoute(route: string): boolean {
  const path = normalizeTaxPath(route);
  return (
    path === KOLAM_FINANCE_TAX_ROOT ||
    path === KOLAM_FINANCE_TAX_PROFILE_ROUTE
  );
}

export function getKolamFinanceTaxSurfaceMode(
  route: string,
): 'dashboard' | 'tax-profile' {
  const path = normalizeTaxPath(route);
  if (path === KOLAM_FINANCE_TAX_PROFILE_ROUTE) {
    return 'tax-profile';
  }
  return 'dashboard';
}

function normalizeTaxPath(route: string): string {
  const path = String(route || '').split('?')[0].replace(/\/+$/, '') || '/';
  return path.startsWith('/') ? path : `/${path}`;
}

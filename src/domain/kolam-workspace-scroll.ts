export type KolamWorkspaceScrollOwner = 'shell' | 'workspace';

export type KolamWorkspaceLayoutMode = 'default' | 'centered';

export type KolamWorkspaceScrollPolicyInput = {
  activeModule?: string | null;
  route?: string | null;
};

export type KolamWorkspaceScrollPolicy = {
  isCentered: boolean;
  layout: KolamWorkspaceLayoutMode;
  routePath: string;
  scrollOwner: KolamWorkspaceScrollOwner;
};

export function getKolamWorkspaceScrollPolicy({
  activeModule,
  route,
}: KolamWorkspaceScrollPolicyInput): KolamWorkspaceScrollPolicy {
  const routePath = normalizeKolamWorkspaceRoute(route);
  const isCentered =
    activeModule === 'kolam' ||
    activeModule === 'am' ||
    isKolamCenteredRoutePath(routePath);

  return {
    isCentered,
    layout: isCentered ? 'centered' : 'default',
    routePath,
    scrollOwner: isKolamWorkspaceOwnedScrollRoutePath(routePath)
      ? 'workspace'
      : 'shell',
  };
}

export function normalizeKolamWorkspaceRoute(route?: string | null) {
  return (route?.split('?')[0] ?? '').replace(/\/+$/, '') || '/';
}

export function isCatalogTableListRoute(route?: string | null) {
  return isKolamWorkspaceOwnedScrollRoutePath(
    normalizeKolamWorkspaceRoute(route),
  );
}

export function isKolamCenteredRoute(route?: string | null) {
  return isKolamCenteredRoutePath(normalizeKolamWorkspaceRoute(route));
}

function isKolamWorkspaceOwnedScrollRoutePath(routePath: string) {
  return routePath === '/' || routePath === '/cashflow-session';
}

function isKolamCenteredRoutePath(routePath: string) {
  return (
    KOLAM_CENTERED_EXACT_ROUTES.includes(routePath) ||
    KOLAM_CENTERED_ROUTE_PREFIXES.some(
      prefix => routePath === prefix || routePath.startsWith(`${prefix}/`),
    )
  );
}

const KOLAM_CENTERED_EXACT_ROUTES = ['/list-of-users'];

const KOLAM_CENTERED_ROUTE_PREFIXES = [
  '/am',
  '/pengaturan',
  '/label-dan-field',
  '/merek',
  '/kategori',
  '/tag',
  '/tags',
  '/field-kustom',
  '/custom-fields',
  '/satuan',
  '/units',
  '/species',
  '/taxonomy',
  '/iucn-status',
  '/products',
  '/archive',
  '/raw-materials',
  '/packing-materials',
  '/teranura',
  '/stock-transaction',
  '/stock-opname',
  '/sales',
  '/locations',
  '/suppliers',
  '/customers',
  '/purchase-order',
  '/production',
];

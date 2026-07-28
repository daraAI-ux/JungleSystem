export const KOLAM_LOCATION_BREADCRUMB_ROOT = '/locations';

export type KolamLocationRouteMode = 'list' | 'detail' | 'edit' | 'new';

export function isKolamLocationRoute(route: string) {
  return (
    route === KOLAM_LOCATION_BREADCRUMB_ROOT ||
    route === `${KOLAM_LOCATION_BREADCRUMB_ROOT}/create` ||
    route === `${KOLAM_LOCATION_BREADCRUMB_ROOT}/baru` ||
    route.startsWith(`${KOLAM_LOCATION_BREADCRUMB_ROOT}/`)
  );
}

export function getKolamLocationRouteMode(route: string): KolamLocationRouteMode {
  if (
    route === `${KOLAM_LOCATION_BREADCRUMB_ROOT}/create` ||
    route === `${KOLAM_LOCATION_BREADCRUMB_ROOT}/baru`
  ) {
    return 'new';
  }

  if (route.endsWith('/edit')) {
    return 'edit';
  }

  return route === KOLAM_LOCATION_BREADCRUMB_ROOT ? 'list' : 'detail';
}

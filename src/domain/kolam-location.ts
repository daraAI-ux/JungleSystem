export const KOLAM_LOCATION_BREADCRUMB_ROOT = '/locations';

export type KolamLocationRouteMode = 'list' | 'detail' | 'edit' | 'new';
export type KolamLocationType =
  | 'warehouse'
  | 'floor'
  | 'rack'
  | 'bin'
  | 'store'
  | 'area';
export type KolamLocationTier = 'primary' | 'secondary' | 'tertiary';

export const KOLAM_LOCATION_TYPE_OPTIONS: Array<{
  label: string;
  value: KolamLocationType;
}> = [
  {label: 'Gudang', value: 'warehouse'},
  {label: 'Lantai', value: 'floor'},
  {label: 'Rak', value: 'rack'},
  {label: 'Bin', value: 'bin'},
  {label: 'Toko', value: 'store'},
  {label: 'Area', value: 'area'},
];

export const KOLAM_LOCATION_TIER_OPTIONS: Array<{
  label: string;
  value: KolamLocationTier;
}> = [
  {label: 'Utama', value: 'primary'},
  {label: 'Sekunder', value: 'secondary'},
  {label: 'Tersier', value: 'tertiary'},
];

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

export function getKolamLocationTypeLabel(type: string) {
  return (
    (KOLAM_LOCATION_TYPE_OPTIONS.find(option => option.value === type)?.label ??
      type) ||
    '-'
  );
}

export function getKolamLocationTierLabel(tier: string) {
  return (
    (KOLAM_LOCATION_TIER_OPTIONS.find(option => option.value === tier)?.label ??
      tier) ||
    '-'
  );
}

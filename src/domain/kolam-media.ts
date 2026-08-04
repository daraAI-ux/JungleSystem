export type KolamMediaType = 'image' | 'video';

export type KolamMediaFilter =
  | 'all'
  | 'attached'
  | 'orphan'
  | 'catalogue'
  | 'product'
  | 'species'
  | 'sale'
  | 'customer'
  | 'user'
  | 'teamChat'
  | 'task';

export interface KolamMediaRouteState {
  filter: KolamMediaFilter;
  page: number;
  search: string;
  type: KolamMediaType;
}

export const kolamMediaFilterOptions: ReadonlyArray<{
  id: KolamMediaFilter;
  label: string;
}> = [
  {id: 'all', label: 'Semua'},
  {id: 'attached', label: 'Attached'},
  {id: 'orphan', label: 'Orphan'},
  {id: 'catalogue', label: 'Catalogue'},
  {id: 'product', label: 'Product'},
  {id: 'species', label: 'Species'},
  {id: 'sale', label: 'Sale'},
  {id: 'customer', label: 'Customer'},
  {id: 'user', label: 'User'},
  {id: 'teamChat', label: 'Team Chat'},
  {id: 'task', label: 'Task'},
];

const kolamMediaFilters = new Set<KolamMediaFilter>(
  kolamMediaFilterOptions.map(option => option.id),
);

export function isKolamMediaRoute(route: string): boolean {
  return route.split('?')[0] === '/media';
}

export function parseKolamMediaRoute(route: string): KolamMediaRouteState {
  const queryString = route.split('?')[1] ?? '';
  const params = new URLSearchParams(queryString);
  const type = params.get('type') === 'video' ? 'video' : 'image';
  const rawFilter = params.get('filter') ?? 'all';
  const rawPage = Number.parseInt(params.get('page') ?? '1', 10);

  return {
    filter: kolamMediaFilters.has(rawFilter as KolamMediaFilter)
      ? (rawFilter as KolamMediaFilter)
      : 'all',
    page: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
    search: params.get('search')?.trim() ?? '',
    type,
  };
}

export function createKolamMediaRoute(
  state: Partial<KolamMediaRouteState>,
): string {
  const type = state.type ?? 'image';
  const filter = state.filter ?? 'all';
  const page = state.page && state.page > 1 ? Math.floor(state.page) : 1;
  const search = state.search?.trim() ?? '';
  const params = new URLSearchParams();

  if (type !== 'image') {
    params.set('type', type);
  }

  if (filter !== 'all') {
    params.set('filter', filter);
  }

  if (page > 1) {
    params.set('page', String(page));
  }

  if (search) {
    params.set('search', search);
  }

  const query = params.toString();
  return query ? `/media?${query}` : '/media';
}


export const KOLAM_ENCLOSURE_ROOT = '/enclosures';
export const KOLAM_ENCLOSURE_CUSTOMER_ROOT = '/dashboard/enclosures';

export const KOLAM_ENCLOSURE_TYPES = [
  'Terrarium',
  'Paludarium',
  'Aquarium',
  'Vivarium',
  'Cags',
] as const;

export const KOLAM_ENCLOSURE_LIST_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'internal', label: 'Internal staff' },
  { id: 'client_linked', label: 'Customer' },
  { id: 'pending', label: 'Pending' },
  { id: 'allocation', label: 'Statistik' },
  { id: 'deaths', label: 'Riwayat kematian' },
] as const;

export type KolamEnclosureType = (typeof KOLAM_ENCLOSURE_TYPES)[number];
export type KolamEnclosureListTab =
  (typeof KOLAM_ENCLOSURE_LIST_TABS)[number]['id'];
export type KolamEnclosureClientScope = 'internal' | 'client_linked';
export type KolamEnclosureLivestockPurpose = 'saleable' | 'production';
export type KolamEnclosureLivestockFilter =
  | 'all'
  | KolamEnclosureLivestockPurpose;
export type KolamEnclosureTypeFilter = 'all' | KolamEnclosureType;
export type KolamEnclosureSurfaceMode =
  | 'list'
  | 'detail'
  | 'edit'
  | 'customer-list'
  | 'customer-detail'
  | 'unsupported';

export interface KolamEnclosureStaffRef {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  displayName: string;
  /** Absolute or relative media path for profile/HR photo. */
  photo: string;
}

export interface KolamEnclosureCustomerRef {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface KolamEnclosureLocationRef {
  id: string;
  name: string;
  code: string;
  address: string;
}

export interface KolamEnclosureUnitRef {
  id: string;
  name: string;
  initial: string;
}

export interface KolamEnclosureBrandRef {
  id: string;
  name: string;
  photos: string[];
}

export interface KolamEnclosureSizeDimension {
  value: number;
  unit: KolamEnclosureUnitRef | null;
  unitLabel: string;
}

export interface KolamEnclosureSize {
  high: KolamEnclosureSizeDimension;
  width: KolamEnclosureSizeDimension;
  length: KolamEnclosureSizeDimension;
}

export interface KolamEnclosureComputed {
  volumeLiters: number | null;
  ageLabel: string;
  needsProvisioning: boolean;
  productionPhaseTabVisible: boolean;
  productionPhaseTabReason: string;
  productionEggSectionVisible: boolean;
}

export interface KolamEnclosure {
  id: string;
  code: string;
  name: string;
  type: KolamEnclosureType | string;
  aquariumWaterType: string;
  note: string;
  status: string;
  coverPhotoUrl: string;
  photos: string[];
  assignedTo: KolamEnclosureStaffRef | null;
  assignedToId: string;
  brand: KolamEnclosureBrandRef | null;
  brandId: string;
  customer: KolamEnclosureCustomerRef | null;
  customerId: string;
  location: KolamEnclosureLocationRef | null;
  locationId: string;
  clientScope: KolamEnclosureClientScope;
  livestockPurpose: KolamEnclosureLivestockPurpose;
  saleStatus: string;
  salePrice: number | null;
  size: KolamEnclosureSize;
  computed: KolamEnclosureComputed;
  species: KolamEnclosureSpeciesRef[];
  speciesPopulationHistory: KolamEnclosurePopulationHistory[];
  productionEggs: KolamEnclosureProductionEgg[];
  parameters: KolamEnclosureParameter[];
  createdAt: string;
  updatedAt: string;
  raw: unknown;
}

export interface KolamEnclosureSpeciesRef {
  id: string;
  speciesId: string;
  speciesName: string;
  scientificName: string;
  variantId: string;
  variantLabel: string;
  thumbnailUrl: string;
  quantity: number;
  unitLabel: string;
  displayLine: string;
}

export interface KolamEnclosurePopulationHistory {
  id: string;
  speciesId: string;
  speciesName: string;
  scientificName: string;
  variantId: string;
  variantLabel: string;
  unitLabel: string;
  delta: number;
  enclosureQtyBefore: number | null;
  enclosureQtyAfter: number | null;
  reason: string;
  eventType: string;
  eventTypeLabel: string;
  invoiceCode: string;
  stockTransactionId: string;
  createdAt: string;
  photos: string[];
}

export interface KolamEnclosureProductionEgg {
  speciesId: string;
  speciesName: string;
  scientificName: string;
  quantity: number;
  unitLabel: string;
}

export interface KolamEnclosureParameter {
  id: string;
  name: string;
  currentValue: number | null;
  unit: KolamEnclosureUnitRef | null;
  unitLabel: string;
  updatedAt: string;
  raw: unknown;
}

export interface KolamEnclosurePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface KolamEnclosureListFilters {
  search: string;
  scope: KolamEnclosureListTab;
  page: number;
  limit: number;
  livestockPurpose: KolamEnclosureLivestockFilter;
  enclosureType: KolamEnclosureTypeFilter;
}

export interface KolamEnclosureListResult {
  data: KolamEnclosure[];
  pagination: KolamEnclosurePagination;
}

export interface KolamEnclosureDashboardSpeciesRow {
  speciesId: string;
  variantId: string;
  speciesName: string;
  scientificName: string;
  variantLabel: string;
  unit: string;
  thumbnailUrl: string;
  qty: number;
  enclosureCount: number;
}

export interface KolamEnclosureDashboardStats {
  totals: {
    enclosures: number;
    speciesDistinct: number;
    individuals: number;
  };
  byType: Array<{ type: string; count: number }>;
  production: KolamEnclosureDashboardSpeciesSummary;
  saleable: KolamEnclosureDashboardSpeciesSummary;
  deaths: {
    reportedCases: number;
    reportedAnimals: number;
    totalCases: number;
    totalAnimals: number;
    recent: KolamEnclosureDashboardDeathEvent[];
  };
  births: {
    totalCases: number;
    totalAnimals: number;
  };
}

export interface KolamEnclosureDashboardSpeciesSummary {
  totalQty: number;
  speciesDistinct: number;
  rows: KolamEnclosureDashboardSpeciesRow[];
}

export interface KolamEnclosureDashboardDeathEvent {
  enclosureCode: string;
  enclosureId: string;
  speciesId: string;
  speciesName: string;
  scientificName: string;
  variantId: string;
  qty: number;
  reported: boolean;
  reason: string;
  stockTransactionId: string;
  createdAt: string;
  livestockPurpose: string;
}

export interface KolamEnclosureStatistics {
  enclosureId: string;
  enclosureCode: string;
  livestockPurpose: KolamEnclosureLivestockPurpose;
  summary: KolamEnclosureStatisticsSummary;
  deaths: KolamEnclosureStatisticsEvent[];
  lost: KolamEnclosureStatisticsEvent[];
  sales: KolamEnclosureStatisticsEvent[];
  production: KolamEnclosureProductionStatistics | null;
  raw: unknown;
}

export interface KolamEnclosureStatisticsSummary {
  deathQty: number;
  deathValue: number;
  lostQty: number;
  lostValue: number;
  saleQty: number;
  saleRevenue: number;
  totalLossValue: number;
  netBalance: number;
  currentPopulationQty: number;
  currentPopulationValue: number;
  mortalityRate: number | null;
  healthLabel: string;
  healthTone: string;
}

export interface KolamEnclosureStatisticsEvent {
  id: string;
  speciesId: string;
  variantId: string;
  speciesName: string;
  scientificName: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  invoiceCode: string;
  saleId: string;
  stockTransactionId: string;
  reason: string;
  createdAt: string;
  raw: unknown;
}

export interface KolamEnclosureProductionStatistics {
  summary: {
    indukanBirthQty: number;
    hatchQty: number;
    eggAddedQty: number;
    placementQty: number;
    otherAddedQty: number;
    transferInQty: number;
    fromSaleableQty: number;
    netGrowthQty: number;
    currentEggQty: number;
  };
  events: KolamEnclosureProductionEvent[];
  eggsBySpecies: Array<{
    speciesId: string;
    speciesName: string;
    scientificName: string;
    quantity: number;
  }>;
}

export interface KolamEnclosureProductionEvent {
  id: string;
  speciesId: string;
  variantId: string;
  speciesName: string;
  scientificName: string;
  variantLabel: string;
  quantity: number;
  category: string;
  categoryLabel: string;
  reason: string;
  stockTransactionId: string;
  createdAt: string;
  raw: unknown;
}

export interface KolamEnclosureComment {
  id: string;
  comment: string;
  createdAt: string;
  edited: boolean;
  likedByMe: boolean;
  totalLikes: number;
  isMyOwn: boolean;
  user: KolamEnclosureStaffRef | null;
  customer: KolamEnclosureCustomerRef | null;
  replies: KolamEnclosureComment[];
  raw: unknown;
}

export interface KolamEnclosurePendingAllocation {
  id: string;
  speciesId: string;
  variantId: string;
  saleId: string;
  saleItemIndex: number;
  invoiceCode: string;
  qtyTotal: number;
  qtyRemaining: number;
  status: string;
  speciesName: string;
  scientificName: string;
  variantLabel: string;
  unitLabel: string;
  displayLine: string;
  createdAt: string;
  raw: unknown;
}

export interface KolamEnclosurePendingAllocationResult {
  items: KolamEnclosurePendingAllocation[];
  total: number;
}

export interface KolamEnclosureAllocationOverviewRow {
  speciesId: string;
  variantId: string;
  speciesName: string;
  scientificName: string;
  variantLabel: string;
  unit: string;
  totalStock: number;
  allocated: number;
  unallocated: number;
  enclosureCodes: string[];
  enclosures: Array<{ enclosureId: string; code: string }>;
}

export interface KolamEnclosureAllocationOverview {
  totals: {
    speciesCount: number;
    rowCount: number;
    totalStock: number;
    totalAllocated: number;
    totalUnallocated: number;
  };
  items: KolamEnclosureAllocationOverviewRow[];
}

const VALID_LIST_TABS = new Set<string>(
  KOLAM_ENCLOSURE_LIST_TABS.map(tab => tab.id),
);
const VALID_ENCLOSURE_TYPES = new Set<string>(KOLAM_ENCLOSURE_TYPES);

export function isKolamEnclosureRoute(route: string) {
  const path = normalizeEnclosureRoutePath(route);
  return (
    path === KOLAM_ENCLOSURE_ROOT ||
    path.startsWith(`${KOLAM_ENCLOSURE_ROOT}/`) ||
    path === KOLAM_ENCLOSURE_CUSTOMER_ROOT ||
    path.startsWith(`${KOLAM_ENCLOSURE_CUSTOMER_ROOT}/`)
  );
}

export function isKolamEnclosureNativeRoute(route: string) {
  return getKolamEnclosureSurfaceMode(route) !== 'unsupported';
}

export function getKolamEnclosureSurfaceMode(
  route: string,
): KolamEnclosureSurfaceMode {
  const path = normalizeEnclosureRoutePath(route);

  if (path === KOLAM_ENCLOSURE_ROOT) {
    return 'list';
  }
  if (path === KOLAM_ENCLOSURE_CUSTOMER_ROOT) {
    return 'customer-list';
  }
  if (path.startsWith(`${KOLAM_ENCLOSURE_ROOT}/`) && path.endsWith('/edit')) {
    return 'edit';
  }
  if (path.startsWith(`${KOLAM_ENCLOSURE_ROOT}/`)) {
    return 'detail';
  }
  if (path.startsWith(`${KOLAM_ENCLOSURE_CUSTOMER_ROOT}/`)) {
    return 'customer-detail';
  }

  return 'unsupported';
}

export function getKolamEnclosureRouteId(route: string) {
  const path = normalizeEnclosureRoutePath(route);
  const root = path.startsWith(KOLAM_ENCLOSURE_CUSTOMER_ROOT)
    ? KOLAM_ENCLOSURE_CUSTOMER_ROOT
    : KOLAM_ENCLOSURE_ROOT;
  const rest = path.slice(root.length).replace(/^\/+/, '');
  const [id] = rest.split('/');
  return id ? decodeURIComponent(id) : '';
}

export function createInitialEnclosureListFilters(
  route: string,
): KolamEnclosureListFilters {
  const query = parseRouteQuery(route);
  return {
    search: query.search ?? '',
    scope: parseKolamEnclosureListTab(query.scope),
    page: Math.max(1, Number(query.page || '1') || 1),
    limit: normalizeKolamEnclosurePageSize(
      Math.max(1, Number(query.limit || '10') || 10),
    ),
    livestockPurpose: parseKolamEnclosureLivestockFilter(query.livestock),
    enclosureType: parseKolamEnclosureTypeFilter(query.enclosureType),
  };
}

const KOLAM_ENCLOSURE_PAGE_SIZES = [10, 50, 100] as const;

/** Match staff/list footer options (10 / 50 / 100). */
export function normalizeKolamEnclosurePageSize(limit: number) {
  return KOLAM_ENCLOSURE_PAGE_SIZES.includes(
    limit as (typeof KOLAM_ENCLOSURE_PAGE_SIZES)[number],
  )
    ? limit
    : 10;
}

export function parseKolamEnclosureListTab(
  value: string | null | undefined,
): KolamEnclosureListTab {
  const normalized = String(value ?? '').trim();
  return VALID_LIST_TABS.has(normalized)
    ? (normalized as KolamEnclosureListTab)
    : 'dashboard';
}

export function parseKolamEnclosureLivestockFilter(
  value: string | null | undefined,
): KolamEnclosureLivestockFilter {
  if (value === 'production' || value === 'saleable') {
    return value;
  }
  return 'all';
}

export function parseKolamEnclosureTypeFilter(
  value: string | null | undefined,
): KolamEnclosureTypeFilter {
  const normalized = String(value ?? '').trim();
  return VALID_ENCLOSURE_TYPES.has(normalized)
    ? (normalized as KolamEnclosureType)
    : 'all';
}

export function getKolamEnclosureApiClientScope(
  scope: KolamEnclosureListTab,
): KolamEnclosureClientScope {
  return scope === 'client_linked' ? 'client_linked' : 'internal';
}

export function createKolamEnclosureListQuery(
  filters: KolamEnclosureListFilters,
) {
  const query: Record<string, string | number> = {
    page: filters.page,
    limit: filters.limit,
    clientScope: getKolamEnclosureApiClientScope(filters.scope),
  };

  if (filters.search.trim()) {
    query.search = filters.search.trim();
  }
  if (filters.livestockPurpose !== 'all') {
    query.livestockPurpose = filters.livestockPurpose;
  }
  if (filters.enclosureType !== 'all') {
    query.enclosure_type = filters.enclosureType;
  }

  return query;
}

export function normalizeKolamEnclosureList(
  payload: unknown,
  fallback: Partial<KolamEnclosurePagination> = {},
): KolamEnclosureListResult {
  const record = asRecord(payload);
  const dataRecord = asRecord(record.data);
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(record.data)
      ? record.data
      : Array.isArray(dataRecord.data)
        ? dataRecord.data
        : Array.isArray(record.items)
          ? record.items
          : [];

  return {
    data: rows
      .map(normalizeKolamEnclosure)
      .filter(item => Boolean(item.id || item.code || item.name)),
    pagination: normalizeKolamEnclosurePagination(
      record.meta ?? record.pagination ?? dataRecord.meta ?? dataRecord.pagination,
      rows.length,
      fallback,
    ),
  };
}

export function normalizeKolamEnclosureDetail(payload: unknown) {
  return normalizeKolamEnclosure(unwrapData(payload));
}

export function normalizeKolamEnclosure(value: unknown): KolamEnclosure {
  const record = asRecord(value);
  const assignedTo = normalizeKolamEnclosureStaff(record.assignedTo);
  const customer = normalizeKolamEnclosureCustomer(record.customer);
  const location = normalizeKolamEnclosureLocation(record.locationId);
  const brand = normalizeKolamEnclosureBrand(record.brandId);
  const code =
    getString(record, 'enclosure_code') ||
    getString(record, 'enclosureCode') ||
    getString(record, 'code');
  const photos = getStringArray(record.photo);
  const coverPhotoUrl =
    getString(record, 'coverPhotoUrl') ||
    getString(record, 'cover_photo') ||
    photos[0] ||
    '';

  return {
    id: getId(record),
    code,
    name:
      getString(record, 'enclosure_name') ||
      getString(record, 'enclosureName') ||
      getString(record, 'name') ||
      code,
    type:
      getString(record, 'enclosure_type') ||
      getString(record, 'enclosureType') ||
      getString(record, 'type'),
    aquariumWaterType: getString(record, 'type_aquarium'),
    note: getString(record, 'note'),
    status: getString(record, 'status') || 'active',
    coverPhotoUrl,
    photos,
    assignedTo,
    assignedToId: assignedTo?.id ?? getIdFromRef(record.assignedTo),
    brand,
    brandId: brand?.id ?? getIdFromRef(record.brandId),
    customer,
    customerId: customer?.id ?? getIdFromRef(record.customer),
    location,
    locationId: location?.id ?? getIdFromRef(record.locationId),
    clientScope: normalizeKolamEnclosureClientScope(record.clientScope),
    livestockPurpose: normalizeKolamEnclosureLivestockPurpose(
      record.livestockPurpose,
    ),
    saleStatus: getString(record, 'saleStatus') || 'not_for_sale',
    salePrice: getNullableNumber(record, 'salePrice'),
    size: normalizeKolamEnclosureSize(record.enclosure_size),
    computed: normalizeKolamEnclosureComputed(record.computed),
    species: getArray(record.species).map(normalizeKolamEnclosureSpeciesRef),
    speciesPopulationHistory: getArray(
      record.speciesPopulationHistory ?? record.species_population_history,
    ).map(normalizeKolamEnclosurePopulationHistory),
    productionEggs: getArray(record.productionEggs).map(
      normalizeKolamEnclosureProductionEgg,
    ),
    parameters: getArray(record.enclosure_parameter).map(
      normalizeKolamEnclosureParameter,
    ),
    createdAt: getString(record, 'createdAt'),
    updatedAt: getString(record, 'updatedAt'),
    raw: value,
  };
}

export function normalizeKolamEnclosureDashboardStats(
  payload: unknown,
): KolamEnclosureDashboardStats {
  const record = asRecord(unwrapData(payload));
  const totals = asRecord(record.totals);

  return {
    totals: {
      enclosures: getNumber(totals, 'enclosures') ?? 0,
      speciesDistinct: getNumber(totals, 'speciesDistinct') ?? 0,
      individuals: getNumber(totals, 'individuals') ?? 0,
    },
    byType: getArray(record.byType).map(row => {
      const item = asRecord(row);
      return {
        type: getString(item, 'type'),
        count: getNumber(item, 'count') ?? 0,
      };
    }),
    production: normalizeDashboardSpeciesSummary(record.production),
    saleable: normalizeDashboardSpeciesSummary(record.saleable),
    deaths: normalizeDashboardDeaths(record.deaths),
    births: normalizeDashboardBirths(record.births),
  };
}

export function normalizeKolamEnclosureStatistics(
  payload: unknown,
): KolamEnclosureStatistics {
  const record = asRecord(unwrapData(payload));

  return {
    enclosureId: getString(record, 'enclosureId'),
    enclosureCode: getString(record, 'enclosureCode'),
    livestockPurpose: normalizeKolamEnclosureLivestockPurpose(
      record.livestockPurpose,
    ),
    summary: normalizeKolamEnclosureStatisticsSummary(record.summary),
    deaths: getArray(record.deaths).map(normalizeKolamEnclosureStatisticsEvent),
    lost: getArray(record.lost).map(normalizeKolamEnclosureStatisticsEvent),
    sales: getArray(record.sales).map(normalizeKolamEnclosureStatisticsEvent),
    production: record.production
      ? normalizeKolamEnclosureProductionStatistics(record.production)
      : null,
    raw: payload,
  };
}

export function normalizeKolamEnclosureComments(
  payload: unknown,
): KolamEnclosureComment[] {
  const record = asRecord(unwrapData(payload));
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(record.comments)
      ? record.comments
      : Array.isArray(record.data)
        ? record.data
        : [];
  return rows.map(normalizeKolamEnclosureComment).filter(item => item.id);
}

export function normalizeKolamEnclosurePendingAllocations(
  payload: unknown,
): KolamEnclosurePendingAllocationResult {
  const record = asRecord(payload);
  const meta = asRecord(record.meta);
  const rows = Array.isArray(record.data)
    ? record.data
    : Array.isArray(record.items)
      ? record.items
      : Array.isArray(payload)
        ? payload
        : [];
  const items = rows.map(normalizePendingAllocation).filter(item => item.id);

  return {
    items,
    total: getNumber(meta, 'total') ?? getNumber(record, 'total') ?? items.length,
  };
}

export function normalizeKolamEnclosureAllocationOverview(
  payload: unknown,
): KolamEnclosureAllocationOverview {
  const record = asRecord(unwrapData(payload));
  const totals = asRecord(record.totals);

  return {
    totals: {
      speciesCount: getNumber(totals, 'speciesCount') ?? 0,
      rowCount: getNumber(totals, 'rowCount') ?? 0,
      totalStock: getNumber(totals, 'totalStock') ?? 0,
      totalAllocated: getNumber(totals, 'totalAllocated') ?? 0,
      totalUnallocated: getNumber(totals, 'totalUnallocated') ?? 0,
    },
    items: getArray(record.items).map(normalizeAllocationOverviewRow),
  };
}

export function groupKolamEnclosureAllocationRows(
  rows: KolamEnclosureAllocationOverviewRow[],
) {
  const map = new Map<
    string,
    {
      speciesId: string;
      speciesName: string;
      scientificName: string;
      unit: string;
      hasVariants: boolean;
      rows: KolamEnclosureAllocationOverviewRow[];
      totalStock: number;
      totalAllocated: number;
      totalUnallocated: number;
    }
  >();

  for (const row of rows) {
    const id = row.speciesId;
    const current =
      map.get(id) ??
      {
        speciesId: id,
        speciesName: row.speciesName,
        scientificName: row.scientificName,
        unit: row.unit,
        hasVariants: false,
        rows: [],
        totalStock: 0,
        totalAllocated: 0,
        totalUnallocated: 0,
      };
    current.rows.push(row);
    current.hasVariants = current.hasVariants || Boolean(row.variantId);
    current.totalStock += row.totalStock;
    current.totalAllocated += row.allocated;
    current.totalUnallocated += row.unallocated;
    map.set(id, current);
  }

  return [...map.values()].sort((a, b) =>
    a.speciesName.localeCompare(b.speciesName, 'id'),
  );
}

function normalizeDashboardSpeciesSummary(
  value: unknown,
): KolamEnclosureDashboardSpeciesSummary {
  const record = asRecord(value);
  return {
    totalQty: getNumber(record, 'totalQty') ?? 0,
    speciesDistinct: getNumber(record, 'speciesDistinct') ?? 0,
    rows: getArray(record.rows).map(normalizeDashboardSpeciesRow),
  };
}

function normalizeDashboardSpeciesRow(
  value: unknown,
): KolamEnclosureDashboardSpeciesRow {
  const record = asRecord(value);
  return {
    speciesId: getString(record, 'speciesId'),
    variantId: getString(record, 'variantId'),
    speciesName: getString(record, 'speciesName'),
    scientificName: getString(record, 'scientificName'),
    variantLabel: getString(record, 'variantLabel'),
    unit: getString(record, 'unit') || 'ekor',
    thumbnailUrl: getString(record, 'thumbnailUrl'),
    qty: getNumber(record, 'qty') ?? 0,
    enclosureCount: getNumber(record, 'enclosureCount') ?? 0,
  };
}

function normalizeDashboardDeaths(value: unknown) {
  const record = asRecord(value);
  return {
    reportedCases: getNumber(record, 'reportedCases') ?? 0,
    reportedAnimals: getNumber(record, 'reportedAnimals') ?? 0,
    totalCases: getNumber(record, 'totalCases') ?? 0,
    totalAnimals: getNumber(record, 'totalAnimals') ?? 0,
    recent: getArray(record.recent).map(row => {
      const item = asRecord(row);
      return {
        enclosureCode: getString(item, 'enclosureCode'),
        enclosureId: getString(item, 'enclosureId'),
        speciesId: getString(item, 'speciesId'),
        speciesName: getString(item, 'speciesName'),
        scientificName: getString(item, 'scientificName'),
        variantId: getString(item, 'variantId'),
        qty: getNumber(item, 'qty') ?? 0,
        reported: getBoolean(item, 'reported'),
        reason: getString(item, 'reason'),
        stockTransactionId: getString(item, 'stockTransactionId'),
        createdAt: getString(item, 'createdAt'),
        livestockPurpose: getString(item, 'livestockPurpose'),
      };
    }),
  };
}

function normalizeDashboardBirths(value: unknown) {
  const record = asRecord(value);
  return {
    totalCases: getNumber(record, 'totalCases') ?? 0,
    totalAnimals: getNumber(record, 'totalAnimals') ?? 0,
  };
}

function normalizeKolamEnclosureStatisticsSummary(
  value: unknown,
): KolamEnclosureStatisticsSummary {
  const record = asRecord(value);
  return {
    deathQty: getNumber(record, 'deathQty') ?? 0,
    deathValue: getNumber(record, 'deathValue') ?? 0,
    lostQty: getNumber(record, 'lostQty') ?? 0,
    lostValue: getNumber(record, 'lostValue') ?? 0,
    saleQty: getNumber(record, 'saleQty') ?? 0,
    saleRevenue: getNumber(record, 'saleRevenue') ?? 0,
    totalLossValue: getNumber(record, 'totalLossValue') ?? 0,
    netBalance: getNumber(record, 'netBalance') ?? 0,
    currentPopulationQty: getNumber(record, 'currentPopulationQty') ?? 0,
    currentPopulationValue: getNumber(record, 'currentPopulationValue') ?? 0,
    mortalityRate: getNullableNumber(record, 'mortalityRate'),
    healthLabel: getString(record, 'healthLabel') || 'Statistik belum tersedia',
    healthTone: getString(record, 'healthTone') || 'neutral',
  };
}

function normalizeKolamEnclosureStatisticsEvent(
  value: unknown,
): KolamEnclosureStatisticsEvent {
  const record = asRecord(value);
  return {
    id: getId(record),
    speciesId: getString(record, 'speciesId'),
    variantId: getString(record, 'variantId'),
    speciesName: getString(record, 'speciesName'),
    scientificName: getString(record, 'scientificName'),
    variantLabel: getString(record, 'variantLabel'),
    quantity: getNumber(record, 'quantity') ?? 0,
    unitPrice: getNumber(record, 'unitPrice') ?? 0,
    totalValue: getNumber(record, 'totalValue') ?? 0,
    invoiceCode: getString(record, 'invoiceCode'),
    saleId: getString(record, 'saleId'),
    stockTransactionId: getString(record, 'stockTransactionId'),
    reason: getString(record, 'reason'),
    createdAt: getString(record, 'createdAt'),
    raw: value,
  };
}

function normalizeKolamEnclosureProductionStatistics(
  value: unknown,
): KolamEnclosureProductionStatistics {
  const record = asRecord(value);
  const summary = asRecord(record.summary);
  return {
    summary: {
      indukanBirthQty: getNumber(summary, 'indukanBirthQty') ?? 0,
      hatchQty: getNumber(summary, 'hatchQty') ?? 0,
      eggAddedQty: getNumber(summary, 'eggAddedQty') ?? 0,
      placementQty: getNumber(summary, 'placementQty') ?? 0,
      otherAddedQty: getNumber(summary, 'otherAddedQty') ?? 0,
      transferInQty: getNumber(summary, 'transferInQty') ?? 0,
      fromSaleableQty: getNumber(summary, 'fromSaleableQty') ?? 0,
      netGrowthQty: getNumber(summary, 'netGrowthQty') ?? 0,
      currentEggQty: getNumber(summary, 'currentEggQty') ?? 0,
    },
    events: getArray(record.events).map(normalizeKolamEnclosureProductionEvent),
    eggsBySpecies: getArray(record.eggsBySpecies).map(item => {
      const egg = asRecord(item);
      return {
        speciesId: getString(egg, 'speciesId'),
        speciesName: getString(egg, 'speciesName'),
        scientificName: getString(egg, 'scientificName'),
        quantity: getNumber(egg, 'quantity') ?? 0,
      };
    }),
  };
}

function normalizeKolamEnclosureProductionEvent(
  value: unknown,
): KolamEnclosureProductionEvent {
  const record = asRecord(value);
  return {
    id: getId(record),
    speciesId: getString(record, 'speciesId'),
    variantId: getString(record, 'variantId'),
    speciesName: getString(record, 'speciesName'),
    scientificName: getString(record, 'scientificName'),
    variantLabel: getString(record, 'variantLabel'),
    quantity: getNumber(record, 'quantity') ?? 0,
    category: getString(record, 'category'),
    categoryLabel: getString(record, 'categoryLabel'),
    reason: getString(record, 'reason'),
    stockTransactionId: getString(record, 'stockTransactionId'),
    createdAt: getString(record, 'createdAt'),
    raw: value,
  };
}

function normalizeKolamEnclosureComment(value: unknown): KolamEnclosureComment {
  const record = asRecord(value);
  return {
    id: getId(record),
    comment: getString(record, 'comment'),
    createdAt: getString(record, 'createdAt'),
    edited: getBoolean(record, 'edited'),
    likedByMe: getBoolean(record, 'liked_by_me') || getBoolean(record, 'likedByMe'),
    totalLikes: getNumber(record, 'totalLikes') ?? 0,
    isMyOwn: getBoolean(record, 'isMyOwn'),
    user: normalizeKolamEnclosureStaff(record.user),
    customer: normalizeKolamEnclosureCustomer(record.customer),
    replies: getArray(record.replies).map(normalizeKolamEnclosureComment),
    raw: value,
  };
}

function normalizePendingAllocation(
  value: unknown,
): KolamEnclosurePendingAllocation {
  const record = asRecord(value);
  return {
    id: getId(record),
    speciesId: getString(record, 'speciesId'),
    variantId: getString(record, 'variantId'),
    saleId: getString(record, 'saleId'),
    saleItemIndex: getNumber(record, 'saleItemIndex') ?? 0,
    invoiceCode: getString(record, 'invoiceCode'),
    qtyTotal: getNumber(record, 'qtyTotal') ?? 0,
    qtyRemaining: getNumber(record, 'qtyRemaining') ?? 0,
    status: getString(record, 'status'),
    speciesName: getString(record, 'speciesName'),
    scientificName: getString(record, 'scientificName'),
    variantLabel: getString(record, 'variantLabel'),
    unitLabel: getString(record, 'unitLabel') || 'ekor',
    displayLine: getString(record, 'displayLine'),
    createdAt: getString(record, 'createdAt'),
    raw: value,
  };
}

function normalizeAllocationOverviewRow(
  value: unknown,
): KolamEnclosureAllocationOverviewRow {
  const record = asRecord(value);
  return {
    speciesId: getString(record, 'speciesId'),
    variantId: getString(record, 'variantId'),
    speciesName: getString(record, 'speciesName'),
    scientificName: getString(record, 'scientificName'),
    variantLabel: getString(record, 'variantLabel'),
    unit: getString(record, 'unit') || 'ekor',
    totalStock: getNumber(record, 'totalStock') ?? 0,
    allocated: getNumber(record, 'allocated') ?? 0,
    unallocated: getNumber(record, 'unallocated') ?? 0,
    enclosureCodes: getStringArray(record.enclosureCodes),
    enclosures: getArray(record.enclosures).map(item => {
      const enclosure = asRecord(item);
      return {
        enclosureId: getString(enclosure, 'enclosureId'),
        code: getString(enclosure, 'code'),
      };
    }),
  };
}

function normalizeKolamEnclosureSize(value: unknown): KolamEnclosureSize {
  const record = asRecord(value);
  return {
    high: normalizeSizeDimension(record.high),
    width: normalizeSizeDimension(record.width),
    length: normalizeSizeDimension(record.length),
  };
}

function normalizeSizeDimension(value: unknown): KolamEnclosureSizeDimension {
  const record = asRecord(value);
  const unit = normalizeUnitRef(record.unit);
  return {
    value: getNumber(record, 'value') ?? 0,
    unit,
    unitLabel: unit?.initial || unit?.name || getString(record, 'unit'),
  };
}

function normalizeKolamEnclosureComputed(
  value: unknown,
): KolamEnclosureComputed {
  const record = asRecord(value);
  return {
    volumeLiters: getNullableNumber(record, 'volumeLiters'),
    ageLabel: getString(record, 'ageLabel'),
    needsProvisioning: getBoolean(record, 'needsProvisioning'),
    productionPhaseTabVisible: getBoolean(record, 'productionPhaseTabVisible'),
    productionPhaseTabReason: getString(record, 'productionPhaseTabReason'),
    productionEggSectionVisible: getBoolean(record, 'productionEggSectionVisible'),
  };
}

function normalizeKolamEnclosureStaff(
  value: unknown,
): KolamEnclosureStaffRef | null {
  const record = asRecord(value);
  const id = getId(record) || (typeof value === 'string' ? value.trim() : '');
  if (!id) {
    return null;
  }
  const firstName = getString(record, 'first_name') || getString(record, 'firstName');
  const lastName = getString(record, 'last_name') || getString(record, 'lastName');
  const username = getString(record, 'username');
  const email = getString(record, 'email');
  const displayName =
    [firstName, lastName].filter(Boolean).join(' ').trim() ||
    username ||
    email ||
    id;
  const hr = asRecord(record.hr);

  return {
    id,
    firstName,
    lastName,
    username,
    email,
    displayName,
    photo:
      getString(record, 'profile_picture') ||
      getString(record, 'photo') ||
      getString(hr, 'photo'),
  };
}

function normalizeKolamEnclosureCustomer(
  value: unknown,
): KolamEnclosureCustomerRef | null {
  const record = asRecord(value);
  const id = getId(record) || (typeof value === 'string' ? value.trim() : '');
  const name = getString(record, 'name');

  if (!id && !name) {
    return null;
  }

  return {
    id,
    name: name || id || 'Customer',
    email: getString(record, 'email'),
    phone: getString(record, 'phone'),
  };
}

function normalizeKolamEnclosureBrand(
  value: unknown,
): KolamEnclosureBrandRef | null {
  const record = asRecord(value);
  const id = getId(record) || (typeof value === 'string' ? value.trim() : '');
  const name = getString(record, 'name');

  if (!id && !name) {
    return null;
  }

  return {
    id,
    name: name || id,
    photos: getStringArray(record.photos),
  };
}

function normalizeKolamEnclosureLocation(
  value: unknown,
): KolamEnclosureLocationRef | null {
  const record = asRecord(value);
  const id = getId(record) || (typeof value === 'string' ? value.trim() : '');
  const name = getString(record, 'name');

  if (!id && !name) {
    return null;
  }

  return {
    id,
    name: name || id,
    code: getString(record, 'code'),
    address: getString(record, 'address'),
  };
}

function normalizeUnitRef(value: unknown): KolamEnclosureUnitRef | null {
  const record = asRecord(value);
  const id = getId(record) || (typeof value === 'string' ? value.trim() : '');
  const initial = getString(record, 'initial');
  const name = getString(record, 'name');

  if (!id && !initial && !name) {
    return null;
  }

  return { id, initial: initial || name || id, name };
}

function normalizeKolamEnclosureSpeciesRef(
  value: unknown,
): KolamEnclosureSpeciesRef {
  const record = asRecord(value);
  const speciesRecord = asRecord(record.species);
  const speciesId =
    getString(record, 'speciesId') ||
    getId(speciesRecord) ||
    getId(record);
  const speciesName =
    getString(record, 'speciesName') ||
    getString(record, 'commonName') ||
    getString(speciesRecord, 'commonName') ||
    getString(speciesRecord, 'localName') ||
    getString(speciesRecord, 'scientificName') ||
    speciesId;
  const scientificName =
    getString(record, 'scientificName') ||
    getString(speciesRecord, 'scientificName');

  return {
    id: getId(record) || speciesId,
    speciesId,
    speciesName,
    scientificName,
    variantId: getString(record, 'variantId'),
    variantLabel: getString(record, 'variantLabel'),
    thumbnailUrl:
      getString(record, 'thumbnailImage') ||
      getString(speciesRecord, 'thumbnailImage') ||
      getFirstString(record.photos) ||
      getFirstString(speciesRecord.photos),
    quantity: getNumber(record, 'quantity') ?? 0,
    unitLabel: getString(record, 'unitLabel') || 'ekor',
    displayLine:
      getString(record, 'displayLine') ||
      [speciesName, getString(record, 'variantLabel')]
        .filter(Boolean)
        .join(' / '),
  };
}

function normalizeKolamEnclosurePopulationHistory(
  value: unknown,
): KolamEnclosurePopulationHistory {
  const record = asRecord(value);
  return {
    id: getId(record),
    speciesId: getString(record, 'speciesId') || getIdFromRef(record.species),
    speciesName: getString(record, 'speciesName'),
    scientificName: getString(record, 'scientificName'),
    variantId: getString(record, 'variantId'),
    variantLabel: getString(record, 'variantLabel'),
    unitLabel: getString(record, 'unitLabel') || 'ekor',
    delta: getNumber(record, 'delta') ?? 0,
    enclosureQtyBefore: getNullableNumber(record, 'enclosureQtyBefore'),
    enclosureQtyAfter: getNullableNumber(record, 'enclosureQtyAfter'),
    reason: getString(record, 'reason'),
    eventType: getString(record, 'eventType'),
    eventTypeLabel: getString(record, 'eventTypeLabel'),
    invoiceCode: getString(record, 'invoiceCode'),
    stockTransactionId: getString(record, 'stockTransactionId'),
    createdAt: getString(record, 'createdAt'),
    photos: getStringArray(record.photos),
  };
}

function normalizeKolamEnclosureProductionEgg(
  value: unknown,
): KolamEnclosureProductionEgg {
  const record = asRecord(value);
  return {
    speciesId: getString(record, 'speciesId') || getIdFromRef(record.species),
    speciesName: getString(record, 'speciesName'),
    scientificName: getString(record, 'scientificName'),
    quantity: getNumber(record, 'quantity') ?? 0,
    unitLabel: getString(record, 'unitLabel') || 'telur',
  };
}

function normalizeKolamEnclosureParameter(
  value: unknown,
): KolamEnclosureParameter {
  const record = asRecord(value);
  const unit = normalizeUnitRef(record.unit);
  return {
    id: getId(record) || getString(record, 'parameter_name'),
    name: getString(record, 'parameter_name') || getString(record, 'name'),
    currentValue: getNullableNumber(record, 'current_value'),
    unit,
    unitLabel: unit?.initial || unit?.name || getString(record, 'unit'),
    updatedAt: getString(record, 'updatedAt'),
    raw: value,
  };
}

function normalizeKolamEnclosureClientScope(
  value: unknown,
): KolamEnclosureClientScope {
  return value === 'client_linked' ? 'client_linked' : 'internal';
}

function normalizeKolamEnclosureLivestockPurpose(
  value: unknown,
): KolamEnclosureLivestockPurpose {
  return value === 'production' ? 'production' : 'saleable';
}

function normalizeKolamEnclosurePagination(
  value: unknown,
  fallbackTotal: number,
  fallback: Partial<KolamEnclosurePagination>,
): KolamEnclosurePagination {
  const record = asRecord(value);
  const page = getNumber(record, 'page') ?? fallback.page ?? 1;
  const limit = getNumber(record, 'limit') ?? fallback.limit ?? 10;
  const total =
    getNumber(record, 'total') ??
    getNumber(record, 'totalItems') ??
    fallback.total ??
    fallbackTotal;
  const totalPages =
    getNumber(record, 'totalPages') ??
    fallback.totalPages ??
    Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return { page, limit, total, totalPages };
}

function normalizeEnclosureRoutePath(route: string) {
  const path = route.trim().split('?')[0].replace(/^\/+/, '');
  return ('/' + path).replace(/\/+$/, '') || KOLAM_ENCLOSURE_ROOT;
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

function getIdFromRef(value: unknown) {
  if (typeof value === 'string') {
    return value.trim();
  }
  return getId(asRecord(value));
}

function getId(record: Record<string, unknown>) {
  return getString(record, '_id') || getString(record, 'id');
}

function getArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function getStringArray(value: unknown) {
  return getArray(value)
    .map(item => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
}

function getFirstString(value: unknown) {
  return getStringArray(value)[0] ?? '';
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string'
    ? value.trim()
    : value == null
      ? ''
      : String(value).trim();
}

function getNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getNullableNumber(record: Record<string, unknown>, key: string) {
  if (!(key in record) || record[key] == null || record[key] === '') {
    return null;
  }
  return getNumber(record, key);
}

function getBoolean(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return false;
}

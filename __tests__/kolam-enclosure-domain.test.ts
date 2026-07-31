import {
  createInitialEnclosureListFilters,
  createKolamEnclosureListQuery,
  getKolamEnclosureRouteId,
  getKolamEnclosureSurfaceMode,
  groupKolamEnclosureAllocationRows,
  isKolamEnclosureNativeRoute,
  isKolamEnclosureRoute,
  normalizeKolamEnclosureAllocationOverview,
  normalizeKolamEnclosureDashboardStats,
  normalizeKolamEnclosureList,
  normalizeKolamEnclosurePendingAllocations,
  parseKolamEnclosureListTab,
} from '../src/domain/kolam-enclosure';

describe('Kolam enclosure domain', () => {
  it('recognizes admin and customer plugin routes', () => {
    expect(isKolamEnclosureRoute('/enclosures')).toBe(true);
    expect(isKolamEnclosureRoute('/enclosures/abc')).toBe(true);
    expect(isKolamEnclosureRoute('/enclosures/abc/edit')).toBe(true);
    expect(isKolamEnclosureRoute('/dashboard/enclosures')).toBe(true);
    expect(isKolamEnclosureRoute('/dashboard/enclosures/abc')).toBe(true);
    expect(isKolamEnclosureRoute('/species')).toBe(false);

    expect(getKolamEnclosureSurfaceMode('/enclosures')).toBe('list');
    expect(getKolamEnclosureSurfaceMode('/enclosures/abc')).toBe('detail');
    expect(getKolamEnclosureSurfaceMode('/enclosures/abc/edit')).toBe('edit');
    expect(getKolamEnclosureSurfaceMode('/dashboard/enclosures')).toBe(
      'customer-list',
    );
    expect(getKolamEnclosureSurfaceMode('/dashboard/enclosures/abc')).toBe(
      'customer-detail',
    );
    expect(isKolamEnclosureNativeRoute('/enclosures')).toBe(true);
    expect(getKolamEnclosureRouteId('/enclosures/abc%20123/edit')).toBe(
      'abc 123',
    );
  });

  it('parses list filters from plugin-compatible query params', () => {
    expect(parseKolamEnclosureListTab(undefined)).toBe('dashboard');
    expect(parseKolamEnclosureListTab('deaths')).toBe('deaths');
    expect(parseKolamEnclosureListTab('unknown')).toBe('dashboard');

    expect(createInitialEnclosureListFilters('/enclosures?scope=internal')).toEqual(
      expect.objectContaining({
        limit: 10,
        page: 1,
        scope: 'internal',
      }),
    );
    expect(
      createInitialEnclosureListFilters('/enclosures?scope=internal&limit=20'),
    ).toEqual(
      expect.objectContaining({
        limit: 10,
      }),
    );

    const filters = createInitialEnclosureListFilters(
      '/enclosures?scope=internal&page=2&limit=50&search=ENC&livestock=production&enclosureType=Aquarium',
    );

    expect(filters).toEqual({
      search: 'ENC',
      scope: 'internal',
      page: 2,
      limit: 50,
      livestockPurpose: 'production',
      enclosureType: 'Aquarium',
    });
    expect(createKolamEnclosureListQuery(filters)).toEqual({
      page: 2,
      limit: 50,
      clientScope: 'internal',
      search: 'ENC',
      livestockPurpose: 'production',
      enclosure_type: 'Aquarium',
    });
  });

  it('normalizes list payload and legacy saleable defaults', () => {
    const result = normalizeKolamEnclosureList({
      data: [
        {
          _id: 'enc-1',
          enclosure_code: 'ENC-AQUA-01',
          enclosure_name: 'Aquarium Satu',
          enclosure_type: 'Aquarium',
          type_aquarium: 'freshwater',
          coverPhotoUrl: '/uploads/enc.jpg',
          assignedTo: {
            _id: 'u1',
            first_name: 'Ada',
            last_name: 'Lovelace',
            email: 'ada@example.com',
          },
          customer: { _id: 'c1', name: 'Customer A' },
          locationId: { _id: 'loc1', name: 'Rak A' },
          enclosure_size: {
            high: { value: '40', unit: { _id: 'cm', initial: 'Cm' } },
            width: { value: 50, unit: { _id: 'cm', initial: 'Cm' } },
            length: { value: 60, unit: { _id: 'cm', initial: 'Cm' } },
          },
          computed: { volumeLiters: 120, needsProvisioning: true },
        },
      ],
      meta: { page: 1, limit: 20, total: 1 },
    });

    expect(result.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    });
    expect(result.data[0]).toMatchObject({
      id: 'enc-1',
      code: 'ENC-AQUA-01',
      name: 'Aquarium Satu',
      type: 'Aquarium',
      aquariumWaterType: 'freshwater',
      coverPhotoUrl: '/uploads/enc.jpg',
      assignedToId: 'u1',
      customerId: 'c1',
      locationId: 'loc1',
      clientScope: 'internal',
      livestockPurpose: 'saleable',
      saleStatus: 'not_for_sale',
    });
    expect(result.data[0]?.assignedTo?.displayName).toBe('Ada Lovelace');
    expect(result.data[0]?.size.high.unitLabel).toBe('Cm');
    expect(result.data[0]?.computed.volumeLiters).toBe(120);
  });

  it('normalizes dashboard, pending, and allocation payloads', () => {
    const dashboard = normalizeKolamEnclosureDashboardStats({
      data: {
        totals: { enclosures: 2, speciesDistinct: 1, individuals: 8 },
        byType: [{ type: 'Aquarium', count: '2' }],
        production: {
          totalQty: 3,
          speciesDistinct: 1,
          rows: [{ speciesId: 'sp1', speciesName: 'Frog', qty: 3 }],
        },
        saleable: { totalQty: 5, speciesDistinct: 1, rows: [] },
        deaths: {
          reportedCases: 1,
          reportedAnimals: 2,
          totalCases: 1,
          totalAnimals: 2,
          recent: [{ enclosureId: 'enc-1', qty: '2', reported: true }],
        },
        births: { totalCases: 1, totalAnimals: 4 },
      },
    });
    expect(dashboard.totals.enclosures).toBe(2);
    expect(dashboard.byType[0]).toEqual({ type: 'Aquarium', count: 2 });
    expect(dashboard.production.rows[0]).toMatchObject({
      speciesId: 'sp1',
      speciesName: 'Frog',
      qty: 3,
      unit: 'ekor',
    });
    expect(dashboard.deaths.recent[0]?.reported).toBe(true);

    const pending = normalizeKolamEnclosurePendingAllocations({
      data: [{ _id: 'p1', speciesId: 'sp1', qtyRemaining: '2' }],
      meta: { total: 1 },
    });
    expect(pending).toMatchObject({
      total: 1,
      items: [{ id: 'p1', speciesId: 'sp1', qtyRemaining: 2 }],
    });

    const allocation = normalizeKolamEnclosureAllocationOverview({
      data: {
        totals: { speciesCount: 1, totalStock: 5, totalAllocated: 3 },
        items: [
          {
            speciesId: 'sp1',
            speciesName: 'Frog',
            totalStock: 5,
            allocated: 3,
            unallocated: 2,
            enclosureCodes: ['ENC-1'],
            enclosures: [{ enclosureId: 'enc-1', code: 'ENC-1' }],
          },
        ],
      },
    });
    expect(allocation.totals.totalAllocated).toBe(3);
    expect(allocation.items[0]?.enclosures[0]).toEqual({
      enclosureId: 'enc-1',
      code: 'ENC-1',
    });
    expect(groupKolamEnclosureAllocationRows(allocation.items)[0]).toMatchObject({
      speciesId: 'sp1',
      totalStock: 5,
      totalAllocated: 3,
      totalUnallocated: 2,
    });
  });
});

import {
  canKolamEnclosureBeListed,
  createInitialEnclosureListFilters,
  createKolamEnclosureListQuery,
  filterKolamEnclosureTaskTypesForCategoryBucket,
  formatKolamEnclosureTaskStatusLabel,
  getKolamEnclosureParameterChartValues,
  getKolamEnclosureRouteId,
  getKolamEnclosureSurfaceMode,
  getKolamEnclosureTaskStatusIntent,
  groupKolamEnclosureAllocationRows,
  isKolamEnclosureNativeRoute,
  isKolamEnclosureRoute,
  mergeKolamEnclosureClimateRows,
  normalizeKolamEnclosureAllocationOverview,
  normalizeKolamEnclosureDashboardStats,
  normalizeKolamEnclosureDetail,
  normalizeKolamEnclosureList,
  normalizeKolamEnclosurePendingAllocations,
  normalizeKolamEnclosureRecurringEnrollments,
  normalizeKolamEnclosureSpawnTaskResult,
  normalizeKolamEnclosureStatistics,
  normalizeKolamEnclosureTaskTypes,
  normalizeKolamEnclosureTasks,
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

  it('normalizes enclosure detail fields from plugin response', () => {
    const detail = normalizeKolamEnclosureDetail({
      data: {
        _id: 'enc-1',
        brandId: {_id: 'brand-1', name: 'ZooMed', photos: ['/brand.jpg']},
        computed: {ageLabel: '2 bulan', volumeLiters: 120},
        enclosure_code: 'ENC-1',
        enclosure_name: 'Rack 1',
        enclosure_parameter: [
          {
            _id: 'param-1',
            current_value: '28',
            parameter_name: 'Temperature',
            unit: {_id: 'c', initial: 'C'},
          },
        ],
        photo: ['/uploads/a.jpg', '/uploads/b.jpg'],
        productionEggs: [{quantity: 4, speciesId: 'sp-egg'}],
        species: [
          {
            quantity: '3',
            scientificName: 'Ranitomeya imitator',
            speciesId: 'sp-1',
            speciesName: 'Ranitomeya',
            unitLabel: 'ekor',
            variantLabel: 'Orange',
          },
        ],
        speciesPopulationHistory: [
          {
            _id: 'hist-1',
            delta: '-1',
            eventType: 'death',
            reason: 'sakit',
            speciesName: 'Ranitomeya',
          },
        ],
      },
    });

    expect(detail).toMatchObject({
      brand: {id: 'brand-1', name: 'ZooMed', photos: ['/brand.jpg']},
      code: 'ENC-1',
      computed: {ageLabel: '2 bulan', volumeLiters: 120},
      coverPhotoUrl: '/uploads/a.jpg',
      id: 'enc-1',
      name: 'Rack 1',
      photos: ['/uploads/a.jpg', '/uploads/b.jpg'],
    });
    expect(detail.species[0]).toMatchObject({
      quantity: 3,
      scientificName: 'Ranitomeya imitator',
      speciesName: 'Ranitomeya',
      variantLabel: 'Orange',
    });
    expect(detail.speciesPopulationHistory[0]).toMatchObject({
      delta: -1,
      eventType: 'death',
      reason: 'sakit',
    });
    expect(detail.productionEggs[0]).toMatchObject({quantity: 4});
    expect(detail.parameters[0]).toMatchObject({
      currentValue: 28,
      name: 'Temperature',
      unitLabel: 'C',
    });
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

  it('normalizes enclosure detail statistics payloads', () => {
    const statistics = normalizeKolamEnclosureStatistics({
      data: {
        deaths: [
          {
            _id: 'death-1',
            quantity: '2',
            speciesName: 'Frog',
            totalValue: '250000',
            unitPrice: '125000',
          },
        ],
        enclosureCode: 'ENC-1',
        enclosureId: 'enc-1',
        livestockPurpose: 'production',
        lost: [{ _id: 'lost-1', quantity: 1 }],
        production: {
          eggsBySpecies: [{ quantity: '4', speciesId: 'sp-egg' }],
          events: [
            {
              _id: 'prod-1',
              category: 'indukan_birth',
              categoryLabel: 'Kelahiran indukan',
              quantity: '3',
            },
          ],
          summary: {
            currentEggQty: '4',
            hatchQty: '1',
            indukanBirthQty: '3',
          },
        },
        sales: [{ invoiceCode: 'INV-1', quantity: 2, totalValue: 300000 }],
        summary: {
          currentPopulationQty: '6',
          deathQty: '2',
          healthLabel: 'Menguntungkan',
          healthTone: 'positive',
          mortalityRate: '12.5',
          netBalance: '50000',
        },
      },
    });

    expect(statistics).toMatchObject({
      deaths: [{ id: 'death-1', quantity: 2, totalValue: 250000 }],
      enclosureCode: 'ENC-1',
      enclosureId: 'enc-1',
      livestockPurpose: 'production',
      lost: [{ id: 'lost-1', quantity: 1 }],
      sales: [{ invoiceCode: 'INV-1', quantity: 2, totalValue: 300000 }],
      summary: {
        currentPopulationQty: 6,
        deathQty: 2,
        healthTone: 'positive',
        mortalityRate: 12.5,
        netBalance: 50000,
      },
    });
    expect(statistics.production?.summary).toMatchObject({
      currentEggQty: 4,
      hatchQty: 1,
      indukanBirthQty: 3,
    });
    expect(statistics.production?.events[0]).toMatchObject({
      category: 'indukan_birth',
      quantity: 3,
    });
  });

  it('normalizes enclosure tasks, task types, enrollments, and spawn result', () => {
    expect(
      normalizeKolamEnclosureTasks({
        data: [{_id: 'task-1', status: 'in_progress', title: 'Cek suhu'}],
      }),
    ).toEqual([
      expect.objectContaining({
        id: 'task-1',
        status: 'in_progress',
        title: 'Cek suhu',
      }),
    ]);

    const types = normalizeKolamEnclosureTaskTypes({
      data: [
        {
          _id: 'tt-crm',
          categoryBuckets: ['crm'],
          key: 'crm',
          name: 'CRM',
          sortOrder: 2,
        },
        {
          _id: 'tt-enc',
          categoryBuckets: ['enclosure'],
          key: 'enc',
          name: 'Enclosure',
          sortOrder: 1,
        },
        {
          _id: 'tt-all',
          key: 'all',
          name: 'Semua',
          sortOrder: 0,
        },
      ],
    });
    expect(types.map(item => item.id)).toEqual(['tt-all', 'tt-enc', 'tt-crm']);
    expect(
      filterKolamEnclosureTaskTypesForCategoryBucket(types, 'enclosure').map(
        item => item.id,
      ),
    ).toEqual(['tt-all', 'tt-enc']);

    expect(
      normalizeKolamEnclosureRecurringEnrollments({
        data: {
          enrollments: [
            {
              active: true,
              enrollmentId: 'enr-1',
              taskType: {_id: 'tt-enc', name: 'Enclosure'},
            },
          ],
        },
      }),
    ).toEqual([
      expect.objectContaining({
        active: true,
        enrollmentId: 'enr-1',
        taskType: expect.objectContaining({id: 'tt-enc', name: 'Enclosure'}),
      }),
    ]);

    expect(
      normalizeKolamEnclosureSpawnTaskResult({
        created: true,
        data: {_id: 'task-2', status: 'todo', title: 'Baru'},
      }),
    ).toEqual({
      created: true,
      task: expect.objectContaining({id: 'task-2', title: 'Baru'}),
    });
    expect(getKolamEnclosureTaskStatusIntent('needs_review')).toBe('warning');
    expect(formatKolamEnclosureTaskStatusLabel('in_progress')).toBe(
      'in progress',
    );
  });

  it('merges climate defaults and gates enclosure sale listing', () => {
    const rows = mergeKolamEnclosureClimateRows(
      'Terrarium',
      [
        {
          currentValue: 29,
          history: [
            {currentValue: 28, timestamp: '2026-07-01T00:00:00.000Z'},
            {currentValue: 29, timestamp: '2026-07-02T00:00:00.000Z'},
          ],
          id: 'p1',
          maxValue: 33,
          minValue: 23,
          name: 'Temperature',
          raw: {},
          targetValue: 29,
          unit: null,
          unitId: 'u1',
          unitLabel: '°C',
          updatedAt: '',
        },
      ],
      null,
    );
    expect(rows.map(row => row.parameterName)).toEqual([
      'Temperature',
      'Humidity',
    ]);
    expect(rows[0]).toMatchObject({
      currentValue: 29,
      constant: 29,
      min: 23,
      max: 33,
    });
    expect(getKolamEnclosureParameterChartValues(rows[0]?.server)).toEqual([
      28, 29,
    ]);

    expect(
      canKolamEnclosureBeListed({
        livestockPurpose: 'production',
        productionEggs: [],
        saleStatus: 'not_for_sale',
        species: [],
      }).reason,
    ).toContain('produksi');
    expect(
      canKolamEnclosureBeListed({
        livestockPurpose: 'saleable',
        productionEggs: [],
        saleStatus: 'not_for_sale',
        species: [
          {
            displayLine: '',
            id: '1',
            quantity: 2,
            scientificName: '',
            speciesId: 'sp',
            speciesName: 'Frog',
            thumbnailUrl: '',
            unitLabel: 'ekor',
            variantId: '',
            variantLabel: '',
          },
        ],
      }).ok,
    ).toBe(false);
    expect(
      canKolamEnclosureBeListed({
        livestockPurpose: 'saleable',
        productionEggs: [],
        saleStatus: 'not_for_sale',
        species: [],
      }),
    ).toEqual({ok: true, reason: ''});
  });
});

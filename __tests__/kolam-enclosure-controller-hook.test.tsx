import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type {KolamEnclosureListResult} from '../src/domain/kolam-enclosure';
import {useKolamEnclosureController} from '../src/hooks/use-kolam-enclosure-controller';
import {
  getKolamEnclosureDetail,
  getKolamEnclosureDashboardStats,
  getKolamEnclosureComments,
  getKolamEnclosureRecurringEnrollments,
  getKolamEnclosureStaffAssignees,
  getKolamEnclosureStatistics,
  getKolamEnclosureTaskTypes,
  getKolamEnclosureTasks,
  getKolamEnclosures,
  getKolamPendingLivestockAllocations,
  getKolamSpeciesAllocationOverview,
  updateKolamEnclosure,
  updateKolamEnclosureAssignedTo,
} from '../src/services/kolam-enclosure-api';
import {getKolamStockTransactionList} from '../src/services/kolam-stock-transaction-api';
import {getKolamBrands} from '../src/services/kolam-brand-api';
import {getKolamLocations} from '../src/services/kolam-location-api';
import {getKolamUnits} from '../src/services/kolam-unit-api';

jest.mock('../src/services/kolam-enclosure-api', () => ({
  getKolamEnclosureComments: jest.fn(),
  getKolamEnclosureDashboardStats: jest.fn(),
  getKolamEnclosureDetail: jest.fn(),
  getKolamEnclosureRecurringEnrollments: jest.fn(),
  getKolamEnclosureStaffAssignees: jest.fn(),
  getKolamEnclosureStatistics: jest.fn(),
  getKolamEnclosureTaskTypes: jest.fn(),
  getKolamEnclosureTasks: jest.fn(),
  getKolamEnclosures: jest.fn(),
  getKolamPendingLivestockAllocations: jest.fn(),
  getKolamSpeciesAllocationOverview: jest.fn(),
  updateKolamEnclosure: jest.fn(),
  updateKolamEnclosureAssignedTo: jest.fn(),
}));

jest.mock('../src/services/kolam-stock-transaction-api', () => ({
  getKolamStockTransactionList: jest.fn(),
}));

jest.mock('../src/services/kolam-brand-api', () => ({
  getKolamBrands: jest.fn(),
}));

jest.mock('../src/services/kolam-location-api', () => ({
  getKolamLocations: jest.fn(),
}));

jest.mock('../src/services/kolam-unit-api', () => ({
  getKolamUnits: jest.fn(),
}));

type EnclosureController = ReturnType<typeof useKolamEnclosureController>;

const getDashboardStatsMock =
  getKolamEnclosureDashboardStats as jest.MockedFunction<
    typeof getKolamEnclosureDashboardStats
  >;
const getDetailMock = getKolamEnclosureDetail as jest.MockedFunction<
  typeof getKolamEnclosureDetail
>;
const getStatisticsMock = getKolamEnclosureStatistics as jest.MockedFunction<
  typeof getKolamEnclosureStatistics
>;
const getStaffAssigneesMock =
  getKolamEnclosureStaffAssignees as jest.MockedFunction<
    typeof getKolamEnclosureStaffAssignees
  >;
const getCommentsMock = getKolamEnclosureComments as jest.MockedFunction<
  typeof getKolamEnclosureComments
>;
const getTasksMock = getKolamEnclosureTasks as jest.MockedFunction<
  typeof getKolamEnclosureTasks
>;
const getTaskTypesMock = getKolamEnclosureTaskTypes as jest.MockedFunction<
  typeof getKolamEnclosureTaskTypes
>;
const getRecurringEnrollmentsMock =
  getKolamEnclosureRecurringEnrollments as jest.MockedFunction<
    typeof getKolamEnclosureRecurringEnrollments
  >;
const getEnclosuresMock = getKolamEnclosures as jest.MockedFunction<
  typeof getKolamEnclosures
>;
const getPendingAllocationsMock =
  getKolamPendingLivestockAllocations as jest.MockedFunction<
    typeof getKolamPendingLivestockAllocations
  >;
const getAllocationOverviewMock =
  getKolamSpeciesAllocationOverview as jest.MockedFunction<
    typeof getKolamSpeciesAllocationOverview
  >;
const getStockTransactionsMock =
  getKolamStockTransactionList as jest.MockedFunction<
    typeof getKolamStockTransactionList
  >;
const getBrandsMock = getKolamBrands as jest.MockedFunction<
  typeof getKolamBrands
>;
const getLocationsMock = getKolamLocations as jest.MockedFunction<
  typeof getKolamLocations
>;
const getUnitsMock = getKolamUnits as jest.MockedFunction<typeof getKolamUnits>;
const updateEnclosureMock = updateKolamEnclosure as jest.MockedFunction<
  typeof updateKolamEnclosure
>;
const updateAssignedToMock =
  updateKolamEnclosureAssignedTo as jest.MockedFunction<
    typeof updateKolamEnclosureAssignedTo
  >;

function requireController(controller: EnclosureController | null) {
  if (!controller) {
    throw new Error('Enclosure controller did not render.');
  }

  return controller;
}

function EnclosureHarness({
  onRender,
  route,
}: {
  onRender: (controller: EnclosureController) => void;
  route: string;
}) {
  const controller = useKolamEnclosureController(route);
  onRender(controller);
  return null;
}

describe('Kolam enclosure controller hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDashboardStatsMock.mockResolvedValue(createDashboardStats());
    getStaffAssigneesMock.mockResolvedValue([
      {
        displayName: 'Keeper One',
        email: 'keeper@example.com',
        firstName: 'Keeper',
        id: 'u1',
        lastName: 'One',
        photo: '',
        username: 'keeper',
      },
    ]);
    getDetailMock.mockResolvedValue(createListResult().data[0]!);
    getStatisticsMock.mockResolvedValue(createStatistics());
    getCommentsMock.mockResolvedValue([]);
    getTasksMock.mockResolvedValue([
      {id: 'task-1', raw: {}, status: 'todo', title: 'Cek suhu'},
    ]);
    getTaskTypesMock.mockResolvedValue([
      {
        active: true,
        categoryBuckets: ['enclosure'],
        description: '',
        handler: 'maintenance',
        id: 'tt-1',
        isSystem: false,
        key: 'check',
        name: 'Cek rutin',
        raw: {},
        requiresProductComponents: false,
        sortOrder: 1,
      },
    ]);
    getRecurringEnrollmentsMock.mockResolvedValue([
      {
        active: true,
        enrollmentId: 'enr-1',
        taskType: {
          active: true,
          categoryBuckets: ['enclosure'],
          description: '',
          handler: 'maintenance',
          id: 'tt-1',
          isSystem: false,
          key: 'check',
          name: 'Cek rutin',
          raw: {},
          requiresProductComponents: false,
          sortOrder: 1,
        },
      },
    ]);
    getStockTransactionsMock.mockResolvedValue({
      data: [
        {
          after: 1,
          before: 2,
          computed: null,
          createdAt: '2026-07-30T08:00:00.000Z',
          createdBy: null,
          crossSync: null,
          delta: -1,
          enclosureHref: null,
          enclosureLabel: 'ENC-1',
          financeCancelled: false,
          financeCancelledAt: '',
          financeCancelledBy: null,
          financeNote: '',
          financeStatusHint: '',
          financeStatusLabel: '',
          globalAfter: 0,
          globalBefore: 0,
          id: 'stx-1',
          photos: [],
          quantity: -1,
          reason: 'death',
          reference: null,
          salesSource: null,
          source: 'enclosure',
          sourceLabel: 'Enclosure',
          status: '',
          statusLabel: '',
          stockOpnameId: '',
          target: {
            href: null,
            id: 'sp-1',
            kind: 'species',
            label: 'Ranitomeya',
            sku: '',
          },
          type: 'out',
          variantLabel: '',
          verificationHint: '',
          verifiedAt: '',
          verifiedBy: null,
          walletTransaction: null,
        },
      ],
      pagination: {limit: 30, page: 1, total: 1, totalPages: 1},
      pendingReturnExpectations: [],
    });
    getEnclosuresMock.mockResolvedValue(createListResult());
    getPendingAllocationsMock.mockResolvedValue({
      items: [
        {
          createdAt: '',
          displayLine: 'Frog x 2',
          id: 'pending-1',
          invoiceCode: 'INV-1',
          qtyRemaining: 2,
          qtyTotal: 3,
          raw: {},
          saleId: 'sale-1',
          saleItemIndex: 0,
          scientificName: 'Rana',
          speciesId: 'sp-1',
          speciesName: 'Frog',
          status: 'pending',
          unitLabel: 'ekor',
          variantId: '',
          variantLabel: '',
        },
      ],
      total: 1,
    });
    getAllocationOverviewMock.mockResolvedValue({
      items: [
        {
          allocated: 2,
          enclosureCodes: ['ENC-1'],
          enclosures: [{code: 'ENC-1', enclosureId: 'enc-1'}],
          scientificName: 'Rana',
          speciesId: 'sp-1',
          speciesName: 'Frog',
          totalStock: 5,
          unallocated: 3,
          unit: 'ekor',
          variantId: '',
          variantLabel: '',
        },
      ],
      totals: {
        rowCount: 1,
        speciesCount: 1,
        totalAllocated: 2,
        totalStock: 5,
        totalUnallocated: 3,
      },
    });
    getBrandsMock.mockResolvedValue([
      {
        createdAt: '',
        description: '',
        id: 'brand-1',
        links: [],
        logoUrl: null,
        name: 'Brand A',
        notes: '',
        originCountry: '',
        photos: [],
        productCount: 0,
        raw: {},
        rawMaterialCount: 0,
        serviceCount: 0,
        slug: 'brand-a',
        speciesCount: 0,
        status: 'active',
        updatedAt: '',
      },
    ]);
    getLocationsMock.mockResolvedValue([
      {
        id: 'loc-1',
        label: 'Room A',
        name: 'Room A',
        tier: 'primary',
        type: 'building',
      },
    ]);
    getUnitsMock.mockResolvedValue([
      {
        category: 'size',
        id: 'unit-1',
        initial: 'cm',
        isBase: true,
        name: 'Centimeter',
        raw: {},
        status: 'active',
        type: 'length',
      },
    ]);
    updateEnclosureMock.mockResolvedValue(createListResult().data[0]!);
    updateAssignedToMock.mockResolvedValue(createListResult().data[0]!);
  });

  it('derives list mode and initial filters from the route query', async () => {
    let latest: EnclosureController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <EnclosureHarness
          route="/enclosures?scope=client_linked&page=3&limit=50&search=rack&livestock=production&enclosureType=Aquarium"
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
      await flushPromises();
    });

    const controller = requireController(latest);
    expect(controller.mode).toBe('list');
    expect(controller.activeTab).toBe('client_linked');
    expect(controller.filters).toMatchObject({
      enclosureType: 'Aquarium',
      limit: 50,
      livestockPurpose: 'production',
      page: 3,
      scope: 'client_linked',
      search: 'rack',
    });
    expect(getEnclosuresMock).toHaveBeenCalledWith(
      expect.objectContaining({
        enclosureType: 'Aquarium',
        livestockPurpose: 'production',
        page: 3,
        scope: 'client_linked',
      }),
    );
    expect(controller.enclosures).toEqual([
      expect.objectContaining({code: 'ENC-1', id: 'enc-1'}),
    ]);
    expect(controller.pagination).toMatchObject({page: 3, total: 21});
  });

  it('switches tabs and refreshes the matching enclosure endpoint', async () => {
    let latest: EnclosureController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <EnclosureHarness
          route="/enclosures"
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
      await flushPromises();
    });

    expect(requireController(latest).activeTab).toBe('dashboard');
    expect(getDashboardStatsMock).toHaveBeenCalledTimes(1);

    await ReactTestRenderer.act(async () => {
      requireController(latest).onTabChange('pending');
      await flushPromises();
    });

    expect(requireController(latest).activeTab).toBe('pending');
    expect(getPendingAllocationsMock).toHaveBeenCalledWith({status: 'pending'});
    expect(requireController(latest).pendingAllocations).toEqual([
      expect.objectContaining({id: 'pending-1', qtyRemaining: 2}),
    ]);

    await ReactTestRenderer.act(async () => {
      requireController(latest).onTabChange('allocation');
      await flushPromises();
    });

    expect(getAllocationOverviewMock).toHaveBeenCalledTimes(1);
    expect(requireController(latest).allocationSpeciesGroups).toEqual([
      expect.objectContaining({
        speciesId: 'sp-1',
        totalAllocated: 2,
      }),
    ]);

    await ReactTestRenderer.act(async () => {
      requireController(latest).onTabChange('deaths');
      await flushPromises();
    });

    expect(requireController(latest).activeTab).toBe('deaths');
    expect(getDashboardStatsMock).toHaveBeenCalledTimes(2);
  });

  it('resets pagination for search, filters, and tab changes', async () => {
    let latest: EnclosureController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <EnclosureHarness
          route="/enclosures?scope=internal&page=4&limit=20"
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
      await flushPromises();
    });

    await ReactTestRenderer.act(async () => {
      requireController(latest).onSearchChange('frog');
      await flushPromises();
    });

    expect(requireController(latest).filters).toMatchObject({
      page: 1,
      search: 'frog',
    });

    await ReactTestRenderer.act(async () => {
      requireController(latest).onPageChange(5);
      await flushPromises();
    });

    expect(requireController(latest).filters.page).toBe(5);

    await ReactTestRenderer.act(async () => {
      requireController(latest).onChangeFilters({enclosureType: 'Terrarium'});
      await flushPromises();
    });

    expect(requireController(latest).filters).toMatchObject({
      enclosureType: 'Terrarium',
      page: 1,
    });

    await ReactTestRenderer.act(async () => {
      requireController(latest).onTabChange('client_linked');
      await flushPromises();
    });

    expect(requireController(latest).filters).toMatchObject({
      page: 1,
      scope: 'client_linked',
    });
  });

  it('exposes loading error state when refresh fails', async () => {
    let latest: EnclosureController | null = null;
    getEnclosuresMock.mockRejectedValueOnce(new Error('backend down'));

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <EnclosureHarness
          route="/enclosures?scope=internal"
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
      await flushPromises();
    });

    const controller = requireController(latest);
    expect(controller.dataSource).toBe('error');
    expect(controller.error).toBe('backend down');
    expect(controller.loading).toBe(false);
  });

  it('loads selected enclosure for detail routes', async () => {
    let latest: EnclosureController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <EnclosureHarness
          route="/enclosures/enc-1"
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
      await flushPromises();
    });

    expect(getDetailMock).toHaveBeenCalledWith('enc-1');
    expect(getStatisticsMock).toHaveBeenCalledWith('enc-1');
    expect(getTasksMock).toHaveBeenCalledWith('enc-1');
    expect(getTaskTypesMock).toHaveBeenCalled();
    expect(getRecurringEnrollmentsMock).toHaveBeenCalledWith('enc-1');
    expect(getStockTransactionsMock).toHaveBeenCalledWith(
      expect.objectContaining({enclosureId: 'enc-1', limit: 30}),
    );
    expect(requireController(latest).mode).toBe('detail');
    expect(requireController(latest).selectedEnclosure).toEqual(
      expect.objectContaining({id: 'enc-1', code: 'ENC-1'}),
    );
    expect(requireController(latest).enclosureStatistics).toEqual(
      expect.objectContaining({
        enclosureId: 'enc-1',
        summary: expect.objectContaining({deathQty: 1}),
      }),
    );
    expect(requireController(latest).enclosureTasks).toEqual([
      expect.objectContaining({id: 'task-1', title: 'Cek suhu'}),
    ]);
    expect(requireController(latest).enclosureRecurringEnrollments).toEqual([
      expect.objectContaining({
        active: true,
        taskType: expect.objectContaining({id: 'tt-1', name: 'Cek rutin'}),
      }),
    ]);
    expect(requireController(latest).enclosureStockTransactions).toEqual([
      expect.objectContaining({id: 'stx-1'}),
    ]);
    expect(getDashboardStatsMock).not.toHaveBeenCalled();
  });

  it('loads enclosure detail and edit lookups for edit routes', async () => {
    let latest: EnclosureController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <EnclosureHarness
          route="/enclosures/enc-1/edit"
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
      await flushPromises();
    });

    expect(requireController(latest).mode).toBe('edit');
    expect(getDetailMock).toHaveBeenCalledWith('enc-1');
    expect(getStaffAssigneesMock).toHaveBeenCalledWith({limit: 200});
    expect(getBrandsMock).toHaveBeenCalled();
    expect(getLocationsMock).toHaveBeenCalled();
    expect(getUnitsMock).toHaveBeenCalled();
    expect(getStatisticsMock).not.toHaveBeenCalled();
    expect(getTasksMock).not.toHaveBeenCalled();
    expect(getStockTransactionsMock).not.toHaveBeenCalled();
    expect(getDashboardStatsMock).not.toHaveBeenCalled();
    expect(getEnclosuresMock).not.toHaveBeenCalled();
    expect(requireController(latest).selectedEnclosure).toEqual(
      expect.objectContaining({id: 'enc-1', code: 'ENC-1'}),
    );
    expect(requireController(latest).staffAssignees).toEqual([
      expect.objectContaining({id: 'u1', displayName: 'Keeper One'}),
    ]);
    expect(requireController(latest).editBrands).toEqual([
      expect.objectContaining({id: 'brand-1', name: 'Brand A'}),
    ]);
    expect(requireController(latest).editLocations).toEqual([
      expect.objectContaining({id: 'loc-1', name: 'Room A'}),
    ]);
    expect(requireController(latest).editUnits).toEqual([
      expect.objectContaining({id: 'unit-1', initial: 'cm'}),
    ]);
  });

  it('saves enclosure edit and updates PIC only when changed', async () => {
    let latest: EnclosureController | null = null;
    const enclosure = {
      ...createListResult().data[0]!,
      assignedTo: {
        displayName: 'Keeper One',
        email: 'keeper@example.com',
        firstName: 'Keeper',
        id: 'u1',
        lastName: 'One',
        photo: '',
        username: 'keeper',
      },
      assignedToId: 'u1',
    };
    getDetailMock.mockResolvedValue(enclosure);
    updateEnclosureMock.mockResolvedValue(enclosure);
    updateAssignedToMock.mockResolvedValue({
      ...enclosure,
      assignedToId: 'u2',
    });

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <EnclosureHarness
          route="/enclosures/enc-1/edit"
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
      await flushPromises();
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).onSaveEnclosureEdit({
        assignedTo: 'u1',
        body: {
          enclosure_code: 'ENC-1',
          enclosure_type: 'Terrarium',
          status: 'active',
        },
      });
      await flushPromises();
    });

    expect(updateEnclosureMock).toHaveBeenCalledWith('enc-1', {
      enclosure_code: 'ENC-1',
      enclosure_type: 'Terrarium',
      status: 'active',
    });
    expect(updateAssignedToMock).not.toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      await requireController(latest).onSaveEnclosureEdit({
        assignedTo: 'u2',
        body: {enclosure_code: 'ENC-1'},
      });
      await flushPromises();
    });

    expect(updateAssignedToMock).toHaveBeenCalledWith('enc-1', 'u2');
  });
});

function createListResult(): KolamEnclosureListResult {
  return {
    data: [
      {
        aquariumWaterType: '',
        assignedTo: null,
        assignedToId: '',
        acquiredDate: '',
        clientScope: 'internal',
        code: 'ENC-1',
        computed: {
          ageLabel: '',
          needsProvisioning: false,
          productionEggSectionVisible: false,
          productionPhaseTabReason: '',
          productionPhaseTabVisible: false,
          volumeLiters: null,
        },
        coverPhotoUrl: '',
        photos: [],
        createdAt: '',
        customer: null,
        customerId: '',
        brand: null,
        brandId: '',
        id: 'enc-1',
        livestockPurpose: 'saleable',
        location: null,
        locationId: '',
        name: 'Rack 1',
        note: '',
        raw: {},
        salePrice: null,
        saleReservedInvoiceCode: '',
        saleReservedInvoiceStatus: '',
        saleReservedSaleId: '',
        saleStatus: 'not_for_sale',
        soldAt: '',
        size: {
          high: {unit: null, unitLabel: 'Cm', value: 10},
          length: {unit: null, unitLabel: 'Cm', value: 20},
          width: {unit: null, unitLabel: 'Cm', value: 15},
        },
        species: [],
        speciesPopulationHistory: [],
        status: 'active',
        parameters: [],
        productionEggs: [],
        type: 'Aquarium',
        updatedAt: '',
      },
    ],
    pagination: {
      limit: 15,
      page: 3,
      total: 21,
      totalPages: 2,
    },
  };
}

function createDashboardStats() {
  return {
    births: {totalAnimals: 0, totalCases: 0},
    byType: [{count: 1, type: 'Aquarium'}],
    deaths: {
      recent: [],
      reportedAnimals: 0,
      reportedCases: 0,
      totalAnimals: 0,
      totalCases: 0,
    },
    production: {rows: [], speciesDistinct: 0, totalQty: 0},
    saleable: {rows: [], speciesDistinct: 0, totalQty: 0},
    totals: {enclosures: 1, individuals: 0, speciesDistinct: 0},
  };
}

function createStatistics() {
  return {
    deaths: [
      {
        createdAt: '',
        id: 'death-1',
        invoiceCode: '',
        quantity: 1,
        raw: {},
        reason: 'sakit',
        saleId: '',
        scientificName: 'Rana',
        speciesId: 'sp-1',
        speciesName: 'Frog',
        stockTransactionId: 'tx-1',
        totalValue: 100000,
        unitPrice: 100000,
        variantId: '',
        variantLabel: '',
      },
    ],
    enclosureCode: 'ENC-1',
    enclosureId: 'enc-1',
    livestockPurpose: 'saleable' as const,
    lost: [],
    production: null,
    raw: {},
    sales: [],
    summary: {
      currentPopulationQty: 2,
      currentPopulationValue: 200000,
      deathQty: 1,
      deathValue: 100000,
      healthLabel: 'Rugi',
      healthTone: 'negative',
      lostQty: 0,
      lostValue: 0,
      mortalityRate: 33.3,
      netBalance: -100000,
      saleQty: 0,
      saleRevenue: 0,
      totalLossValue: 100000,
    },
  };
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

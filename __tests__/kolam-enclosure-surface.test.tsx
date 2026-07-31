import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type {KolamEnclosure} from '../src/domain/kolam-enclosure';
import {
  KolamEnclosureSurface,
} from '../src/components/kolam-enclosure-surface';
import {
  useKolamEnclosureController,
  type KolamEnclosureController,
} from '../src/hooks/use-kolam-enclosure-controller';

jest.mock('../src/hooks/use-kolam-enclosure-controller', () => ({
  useKolamEnclosureController: jest.fn(),
}));

jest.mock('react-native', () => {
  const ReactActual = require('react');
  const RN = jest.requireActual('react-native');
  const renderListComponent = (
    Component: React.ReactNode | React.ComponentType | undefined,
  ) => {
    if (!Component) {
      return null;
    }
    return typeof Component === 'function'
      ? ReactActual.createElement(Component)
      : Component;
  };

  const mock = Object.create(RN);
  Object.defineProperty(mock, 'FlatList', {
    value: ({
      data = [],
      ListEmptyComponent,
      ListHeaderComponent,
      renderItem,
    }: {
      data?: unknown[];
      ListEmptyComponent?: React.ReactNode | React.ComponentType;
      ListHeaderComponent?: React.ReactNode | React.ComponentType;
      renderItem: (params: {item: unknown; index: number}) => React.ReactNode;
    }) =>
      ReactActual.createElement(
        RN.View,
        null,
        renderListComponent(ListHeaderComponent),
        data.length
          ? data.map((item, index) =>
              ReactActual.createElement(
                RN.View,
                {key: String((item as {id?: string}).id ?? index)},
                renderItem({item, index}),
              ),
            )
          : renderListComponent(ListEmptyComponent),
      ),
  });
  return mock;
});

const useControllerMock =
  useKolamEnclosureController as jest.MockedFunction<
    typeof useKolamEnclosureController
  >;

describe('Kolam enclosure surface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders tabs, toolbar filters, internal table rows, and pagination', async () => {
    const controller = createController();
    useControllerMock.mockReturnValue(controller);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamEnclosureSurface route="/enclosures?scope=internal" />,
      );
    });

    const root = renderer!.root;
    expect(root.findAllByProps({label: 'Dashboard'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({placeholder: 'Cari kode / nama enclosure'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({label: 'Tipe'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({label: 'Livestock'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'ENC-1'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Rack 1'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({label: 'Sebelumnya'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({label: 'Berikutnya'}).length).toBeGreaterThan(0);
  });

  it('calls controller handlers from tab, search, filters, refresh, and pagination', async () => {
    jest.useFakeTimers();
    const controller = createController();
    useControllerMock.mockReturnValue(controller);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamEnclosureSurface route="/enclosures?scope=internal" />,
      );
    });

    const root = renderer!.root;

    await ReactTestRenderer.act(async () => {
      root.findAllByProps({label: 'Customer'})[0].props.onPress();
      root
        .findAllByProps({placeholder: 'Cari kode / nama enclosure'})
        .find(node => typeof node.props.onChangeText === 'function')!
        .props.onChangeText('frog');
    });
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(350);
    });

    expect(controller.onTabChange).toHaveBeenCalledWith('client_linked');
    expect(controller.onSearchChange).toHaveBeenCalledWith('frog');

    await ReactTestRenderer.act(async () => {
      root.findAllByProps({label: 'Tipe'})[0].props.onPress();
    });
    await ReactTestRenderer.act(async () => {
      root.findAllByProps({label: 'Aquarium'})[0].props.onPress();
    });
    expect(controller.onChangeFilters).toHaveBeenCalledWith({
      enclosureType: 'Aquarium',
    });

    await ReactTestRenderer.act(async () => {
      root.findAllByProps({label: 'Livestock'})[0].props.onPress();
    });
    await ReactTestRenderer.act(async () => {
      root.findAllByProps({label: 'Production'})[0].props.onPress();
    });
    expect(controller.onChangeFilters).toHaveBeenCalledWith({
      livestockPurpose: 'production',
    });

    await ReactTestRenderer.act(async () => {
      root.findAllByProps({label: 'Refresh'})[0].props.onPress();
      root.findAllByProps({label: 'Berikutnya'})[0].props.onPress();
    });

    expect(controller.onRefresh).toHaveBeenCalledTimes(1);
    expect(controller.onPageChange).toHaveBeenCalledWith(2);
    jest.useRealTimers();
  });

  it('renders loading, empty, and error states', async () => {
    const loadingController = createController({
      enclosures: [],
      loading: true,
      pagination: {...createController().pagination, total: 0, totalPages: 1},
    });
    useControllerMock.mockReturnValue(loadingController);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamEnclosureSurface route="/enclosures?scope=internal" />,
      );
    });

    expect(
      renderer!.root.findAllByProps({title: 'Memuat enclosure…'}).length,
    ).toBeGreaterThan(0);

    const emptyController = createController({
      enclosures: [],
      loading: false,
      pagination: {...createController().pagination, total: 0, totalPages: 1},
    });
    useControllerMock.mockReturnValue(emptyController);

    await ReactTestRenderer.act(async () => {
      renderer!.update(
        <KolamEnclosureSurface route="/enclosures?scope=internal" />,
      );
    });

    expect(
      renderer!.root.findAllByProps({title: 'Belum ada enclosure'}).length,
    ).toBeGreaterThan(0);

    const errorController = createController({
      enclosures: [],
      error: 'backend down',
      loading: false,
      pagination: {...createController().pagination, total: 0, totalPages: 1},
    });
    useControllerMock.mockReturnValue(errorController);

    await ReactTestRenderer.act(async () => {
      renderer!.update(
        <KolamEnclosureSurface route="/enclosures?scope=internal" />,
      );
    });

    expect(
      renderer!.root.findAllByProps({title: 'Gagal memuat enclosure'}).length,
    ).toBeGreaterThan(0);
    expect(renderer!.root.findAllByProps({label: 'backend down'}).length).toBeGreaterThan(0);
  });

  it('renders the plugin-parity dashboard sections', async () => {
    const onRouteChange = jest.fn();
    const controller = createController({
      activeTab: 'dashboard',
      dashboardStats: createDashboardStats(),
      filters: {
        enclosureType: 'all',
        limit: 20,
        livestockPurpose: 'all',
        page: 1,
        scope: 'dashboard',
        search: '',
      },
    });
    useControllerMock.mockReturnValue(controller);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamEnclosureSurface
          onRouteChange={onRouteChange}
          route="/enclosures?scope=dashboard"
        />,
      );
    });

    const root = renderer!.root;
    expect(root.findAllByProps({children: 'Jumlah enclosure'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Species di enclosure'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Indukan produksi'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Stok jual di enclosure'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Kematian dilaporkan'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Total kelahiran indukan'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'E'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: '!'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: '+'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Statistik kandang produksi (tidak dijual)'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({label: 'Pergerakan stok'}).length).toBe(0);
    expect(root.findAllByProps({children: 'Kasus dilaporkan'}).length).toBe(0);
  });

  it('renders death history on its own tab beside statistik', async () => {
    const onRouteChange = jest.fn();
    const controller = createController({
      activeTab: 'deaths',
      dashboardStats: createDashboardStats(),
      filters: {
        enclosureType: 'all',
        limit: 10,
        livestockPurpose: 'all',
        page: 1,
        scope: 'deaths',
        search: '',
      },
    });
    useControllerMock.mockReturnValue(controller);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamEnclosureSurface
          onRouteChange={onRouteChange}
          route="/enclosures?scope=deaths"
        />,
      );
    });

    const root = renderer!.root;
    expect(root.findAllByProps({children: 'Riwayat kematian'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Kasus dilaporkan'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Total event'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Ranitomeya'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'ENC-A'}).length).toBeGreaterThan(0);

    await ReactTestRenderer.act(async () => {
      root.findAllByProps({label: 'Pergerakan stok'})[0].props.onPress();
      const overflowMenus = root.findAll(
        node =>
          Array.isArray(node.props.actions) &&
          node.props.actions.some(
            (action: {label?: string}) => action.label === 'Lihat',
          ),
      );
      expect(overflowMenus.length).toBeGreaterThan(0);
      overflowMenus[0].props.actions
        .find((action: {label?: string}) => action.label === 'Lihat')
        .onPress();
    });

    expect(onRouteChange).toHaveBeenCalledWith('/stock-transaction');
    expect(onRouteChange).toHaveBeenCalledWith('/stock-transaction/tx-1');
  });

  it('renders enclosure detail read-only overview and navigation actions', async () => {
    const onRouteChange = jest.fn();
    const controller = createController({
      activeTab: 'dashboard',
      dataSource: 'live',
      mode: 'detail',
      routeEnclosureId: 'enc-1',
      selectedEnclosure: createEnclosure({
        brand: {id: 'brand-1', name: 'ZooMed', photos: []},
        brandId: 'brand-1',
        clientScope: 'client_linked',
        customer: {
          email: 'client@example.com',
          id: 'cust-1',
          name: 'Client A',
          phone: '0812',
        },
        customerId: 'cust-1',
        note: 'Catatan detail enclosure',
        species: [
          {
            displayLine: 'Ranitomeya / Orange',
            id: 'sp-line-1',
            quantity: 3,
            scientificName: 'Ranitomeya imitator',
            speciesId: 'sp-1',
            speciesName: 'Ranitomeya',
            thumbnailUrl: '',
            unitLabel: 'ekor',
            variantId: 'v1',
            variantLabel: 'Orange',
          },
        ],
      }),
    });
    useControllerMock.mockReturnValue(controller);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamEnclosureSurface
          onRouteChange={onRouteChange}
          route="/enclosures/enc-1"
        />,
      );
    });

    const root = renderer!.root;
    expect(root.findAllByProps({children: 'Rack 1'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'ENC-1'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Catatan detail enclosure'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Species di enclosure'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Ranitomeya'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Client A'}).length).toBeGreaterThan(0);

    await ReactTestRenderer.act(async () => {
      root.findAllByProps({label: 'Daftar'})[0].props.onPress();
      root.findAllByProps({label: 'Edit'})[0].props.onPress();
    });

    expect(onRouteChange).toHaveBeenCalledWith('/enclosures?scope=dashboard');
    expect(onRouteChange).toHaveBeenCalledWith('/enclosures/enc-1/edit');
  });

  it('renders the plugin-parity allocation statistics with grouped variants', async () => {
    const onRouteChange = jest.fn();
    const allocationOverview = createAllocationOverview();
    const controller = createController({
      activeTab: 'allocation',
      allocationOverview,
      allocationSpeciesGroups: [
        {
          hasVariants: true,
          rows: allocationOverview.items,
          scientificName: 'Dendrobates tinctorius',
          speciesId: 'sp-alloc',
          speciesName: 'Tinctorius',
          totalAllocated: 8,
          totalStock: 11,
          totalUnallocated: 3,
          unit: 'ekor',
        },
      ],
      filters: {
        enclosureType: 'all',
        limit: 20,
        livestockPurpose: 'all',
        page: 1,
        scope: 'allocation',
        search: '',
      },
    });
    useControllerMock.mockReturnValue(controller);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamEnclosureSurface
          onRouteChange={onRouteChange}
          route="/enclosures?scope=allocation"
        />,
      );
    });

    const root = renderer!.root;
    expect(root.findAllByProps({children: 'Jumlah species'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Stok total'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Sudah di enclosure'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Belum di enclosure'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Tinctorius'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: '2 varian down'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'ENC-A'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'ENC-B'}).length).toBeGreaterThan(0);

    await ReactTestRenderer.act(async () => {
      let node: ReactTestRenderer.ReactTestInstance | null =
        root.findAllByProps({children: 'ENC-A'})[0] ?? null;
      while (node && typeof node.props.onPress !== 'function') {
        node = node.parent;
      }
      expect(node?.props.onPress).toEqual(expect.any(Function));
      node!.props.onPress();
    });
    expect(onRouteChange).toHaveBeenCalledWith('/enclosures/enc-a');

    await ReactTestRenderer.act(async () => {
      root.findAllByProps({label: '2 varian down'})[0].props.onPress();
    });

    expect(root.findAllByProps({children: 'Azureus'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Tiny'}).length).toBeGreaterThan(0);
  });
});

function createController(
  patch: Partial<KolamEnclosureController> = {},
): KolamEnclosureController {
  return {
    activeTab: 'internal',
    allocationOverview: {
      items: [],
      totals: {
        rowCount: 0,
        speciesCount: 0,
        totalAllocated: 0,
        totalStock: 0,
        totalUnallocated: 0,
      },
    },
    allocationSpeciesGroups: [],
    dashboardStats: {
      births: {totalAnimals: 0, totalCases: 0},
      byType: [],
      deaths: {
        recent: [],
        reportedAnimals: 0,
        reportedCases: 0,
        totalAnimals: 0,
        totalCases: 0,
      },
      production: {rows: [], speciesDistinct: 0, totalQty: 0},
      saleable: {rows: [], speciesDistinct: 0, totalQty: 0},
      totals: {enclosures: 0, individuals: 0, speciesDistinct: 0},
    },
    dataSource: 'live',
    enclosures: [createEnclosure()],
    error: null,
    filters: {
      enclosureType: 'all',
      limit: 10,
      livestockPurpose: 'all',
      page: 1,
      scope: 'internal',
      search: '',
    },
    loading: false,
    mode: 'list',
    pagination: {
      limit: 10,
      page: 1,
      total: 21,
      totalPages: 3,
    },
    pendingAllocations: [],
    pendingTotal: 0,
    routeEnclosureId: '',
    selectedEnclosure: null,
    staffAssignees: [],
    statusMessage: null,
    onChangeFilters: jest.fn(),
    onClearFilters: jest.fn(),
    onLimitChange: jest.fn(),
    onPageChange: jest.fn(),
    onRefresh: jest.fn().mockResolvedValue(undefined),
    onSearchChange: jest.fn(),
    onTabChange: jest.fn(),
    ...patch,
  };
}

function createDashboardStats(): KolamEnclosureController['dashboardStats'] {
  return {
    births: {totalAnimals: 4, totalCases: 2},
    byType: [
      {count: 3, type: 'Aquarium'},
      {count: 2, type: 'Terrarium'},
    ],
    deaths: {
      recent: [
        {
          createdAt: '2026-07-30T08:00:00.000Z',
          enclosureCode: 'ENC-A',
          enclosureId: 'enc-a',
          livestockPurpose: 'saleable',
          qty: 1,
          reason: 'death',
          reported: true,
          scientificName: 'Ranitomeya imitator',
          speciesId: 'sp-1',
          speciesName: 'Ranitomeya',
          stockTransactionId: 'tx-1',
          variantId: '',
        },
      ],
      reportedAnimals: 1,
      reportedCases: 1,
      totalAnimals: 1,
      totalCases: 1,
    },
    production: {
      rows: [
        {
          enclosureCount: 2,
          qty: 5,
          scientificName: 'Ranitomeya imitator',
          speciesId: 'sp-1',
          speciesName: 'Ranitomeya',
          thumbnailUrl: '',
          unit: 'ekor',
          variantId: '',
          variantLabel: 'Orange',
        },
      ],
      speciesDistinct: 1,
      totalQty: 5,
    },
    saleable: {
      rows: [
        {
          enclosureCount: 1,
          qty: 2,
          scientificName: 'Dendrobates tinctorius',
          speciesId: 'sp-2',
          speciesName: 'Tinctorius',
          thumbnailUrl: '',
          unit: 'ekor',
          variantId: '',
          variantLabel: 'Azureus',
        },
      ],
      speciesDistinct: 1,
      totalQty: 2,
    },
    totals: {enclosures: 5, individuals: 7, speciesDistinct: 2},
  };
}

function createAllocationOverview(): KolamEnclosureController['allocationOverview'] {
  return {
    items: [
      {
        allocated: 5,
        enclosureCodes: ['ENC-A'],
        enclosures: [{code: 'ENC-A', enclosureId: 'enc-a'}],
        scientificName: 'Dendrobates tinctorius',
        speciesId: 'sp-alloc',
        speciesName: 'Tinctorius',
        totalStock: 7,
        unallocated: 2,
        unit: 'ekor',
        variantId: 'v-azureus',
        variantLabel: 'Azureus',
      },
      {
        allocated: 3,
        enclosureCodes: ['ENC-B'],
        enclosures: [{code: 'ENC-B', enclosureId: 'enc-b'}],
        scientificName: 'Dendrobates tinctorius',
        speciesId: 'sp-alloc',
        speciesName: 'Tinctorius',
        totalStock: 4,
        unallocated: 1,
        unit: 'ekor',
        variantId: 'v-tiny',
        variantLabel: 'Tiny',
      },
    ],
    totals: {
      rowCount: 2,
      speciesCount: 1,
      totalAllocated: 8,
      totalStock: 11,
      totalUnallocated: 3,
    },
  };
}

function createEnclosure(patch: Partial<KolamEnclosure> = {}): KolamEnclosure {
  const enclosure: KolamEnclosure = {
    aquariumWaterType: 'freshwater',
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
    location: {address: '', code: 'LOC', id: 'loc-1', name: 'Room A'},
    locationId: 'loc-1',
    name: 'Rack 1',
    note: '',
    parameters: [],
    productionEggs: [],
    raw: {},
    salePrice: null,
    saleStatus: 'not_for_sale',
    size: {
      high: {unit: null, unitLabel: 'Cm', value: 30},
      length: {unit: null, unitLabel: 'Cm', value: 60},
      width: {unit: null, unitLabel: 'Cm', value: 40},
    },
    species: [],
    speciesPopulationHistory: [],
    status: 'active',
    type: 'Aquarium',
    updatedAt: '',
  };
  return {...enclosure, ...patch};
}

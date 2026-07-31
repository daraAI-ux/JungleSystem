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

jest.mock('../src/components/kolam-barcode-print-dialog', () => ({
  KolamBarcodePrintDialog: () => null,
}));

jest.mock('../src/services/kolam-species-api', () => ({
  getKolamSpeciesList: jest.fn().mockResolvedValue({data: [], pagination: {}}),
  getKolamSpeciesTaxonomyProduction: jest.fn().mockResolvedValue({
    profile: null,
    raw: {},
    ready: false,
    stages: [],
  }),
}));

jest.mock('../src/services/kolam-enclosure-api', () => ({
  getKolamEnclosures: jest.fn().mockResolvedValue({
    data: [],
    pagination: {limit: 200, page: 1, total: 0, totalPages: 1},
  }),
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
      enclosureStatistics: createEnclosureStatistics(),
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
        parameters: [
          {
            currentValue: 27,
            history: [],
            id: 'param-1',
            maxValue: null,
            minValue: null,
            name: 'Suhu',
            raw: {},
            targetValue: null,
            unit: null,
            unitId: '',
            unitLabel: 'C',
            updatedAt: '',
          },
        ],
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
        speciesPopulationHistory: [
          {
            createdAt: '2026-07-30T08:00:00.000Z',
            delta: -1,
            enclosureQtyAfter: 2,
            enclosureQtyBefore: 3,
            eventType: 'death',
            eventTypeLabel: 'Kematian',
            id: 'hist-1',
            invoiceCode: '',
            photos: [],
            reason: 'MATI',
            scientificName: 'Ranitomeya imitator',
            speciesId: 'sp-1',
            speciesName: 'Ranitomeya',
            stockTransactionId: 'tx-1',
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
    expect(root.findAllByProps({children: 'Jual unit kandang'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({label: 'Cetak barcode'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({label: 'Overview'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({label: 'Species'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({label: 'Statistics'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({label: 'Tasks'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({label: 'Production'}).length).toBe(0);

    await ReactTestRenderer.act(async () => {
      root.findAllByProps({label: 'Species'})[0].props.onPress();
    });
    expect(root.findAllByProps({children: 'Riwayat populasi'}).length).toBeGreaterThan(0);

    await ReactTestRenderer.act(async () => {
      root.findAllByProps({label: 'Statistics'})[0].props.onPress();
    });
    expect(root.findAllByProps({children: 'Ringkasan kondisi'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Parameter terbaca'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Penjualan'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Pergerakan stok'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Belum ada transaksi.'}).length).toBeGreaterThan(0);

    await ReactTestRenderer.act(async () => {
      root.findAllByProps({label: 'Tasks'})[0].props.onPress();
    });
    expect(root.findAllByProps({children: 'Task terkait'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Jadwal berulang'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Belum ada task.'}).length).toBeGreaterThan(0);
    expect(
      root.findAllByProps({children: 'Tidak ada tipe task enclosure.'}).length,
    ).toBeGreaterThan(0);

    await ReactTestRenderer.act(async () => {
      root.findAllByProps({label: 'Daftar'})[0].props.onPress();
      root.findAllByProps({label: 'Edit'})[0].props.onPress();
    });

    expect(onRouteChange).toHaveBeenCalledWith('/enclosures?scope=dashboard');
    expect(onRouteChange).toHaveBeenCalledWith('/enclosures/enc-1/edit');
  });

  it('renders edit route load shell after detail and lookups are ready', async () => {
    const onRouteChange = jest.fn();
    const controller = createController({
      dataSource: 'live',
      editBrands: [
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
      ],
      editLocations: [
        {
          id: 'loc-1',
          label: 'Room A',
          name: 'Room A',
          tier: 'primary',
          type: 'building',
        },
      ],
      editUnits: [
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
      ],
      loading: false,
      mode: 'edit',
      routeEnclosureId: 'enc-1',
      selectedEnclosure: createEnclosure(),
      staffAssignees: [
        {
          displayName: 'Keeper One',
          email: 'keeper@example.com',
          firstName: 'Keeper',
          id: 'u1',
          lastName: 'One',
          photo: '',
          username: 'keeper',
        },
      ],
    });
    useControllerMock.mockReturnValue(controller);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamEnclosureSurface
          onRouteChange={onRouteChange}
          route="/enclosures/enc-1/edit"
        />,
      );
    });

    const root = renderer!.root;
    expect(root.findAllByProps({children: 'ENC-1 · Rack 1'}).length).toBeGreaterThan(
      0,
    );
    expect(
      root.findAllByProps({
        children:
          'Data enclosure dan lookup siap. Form ubah akan tersedia di langkah berikutnya.',
      }).length,
    ).toBeGreaterThan(0);
    expect(
      root.findAllByProps({
        children: 'Lookup: 1 lokasi · 1 brand · 1 unit · 1 PIC',
      }).length,
    ).toBeGreaterThan(0);
    expect(root.findAllByProps({label: 'Dashboard'}).length).toBe(0);
    expect(root.findAllByProps({label: 'Overview'}).length).toBe(0);

    await ReactTestRenderer.act(async () => {
      root.findAllByProps({label: 'Batal'})[0].props.onPress();
    });
    expect(onRouteChange).toHaveBeenCalledWith('/enclosures/enc-1');
  });

  it('shows production detail tab only for production enclosures', async () => {
    const controller = createController({
      activeTab: 'dashboard',
      dataSource: 'live',
      enclosureStatistics: createEnclosureStatistics({
        livestockPurpose: 'production',
        production: {
          eggsBySpecies: [
            {
              quantity: 12,
              scientificName: 'Ranitomeya imitator',
              speciesId: 'sp-1',
              speciesName: 'Ranitomeya',
            },
          ],
          events: [
            {
              category: 'indukan_birth',
              categoryLabel: 'Kelahiran indukan',
              createdAt: '2026-07-30T08:00:00.000Z',
              id: 'prod-1',
              quantity: 4,
              raw: {},
              reason: 'KELAHIRAN',
              scientificName: 'Ranitomeya imitator',
              speciesId: 'sp-1',
              speciesName: 'Ranitomeya',
              stockTransactionId: 'tx-birth-1',
              variantId: 'v1',
              variantLabel: 'Orange',
            },
          ],
          summary: {
            currentEggQty: 12,
            eggAddedQty: 12,
            fromSaleableQty: 0,
            hatchQty: 0,
            indukanBirthQty: 4,
            netGrowthQty: 4,
            otherAddedQty: 0,
            placementQty: 0,
            transferInQty: 0,
          },
        },
      }),
      mode: 'detail',
      routeEnclosureId: 'enc-1',
      selectedEnclosure: createEnclosure({
        computed: {
          ...createEnclosure().computed,
          productionPhaseTabVisible: true,
        },
        livestockPurpose: 'production',
        productionEggs: [
          {
            quantity: 12,
            scientificName: 'Ranitomeya imitator',
            speciesId: 'sp-1',
            speciesName: 'Ranitomeya',
            unitLabel: 'telur',
          },
        ],
        species: [
          {
            displayLine: 'Ranitomeya / Orange',
            id: 'sp-line-1',
            quantity: 4,
            scientificName: 'Ranitomeya imitator',
            speciesId: 'sp-1',
            speciesName: 'Ranitomeya',
            thumbnailUrl: '',
            unitLabel: 'ekor',
            variantId: 'v1',
            variantLabel: 'Orange',
          },
        ],
        speciesPopulationHistory: [
          {
            createdAt: '2026-07-30T08:00:00.000Z',
            delta: 4,
            enclosureQtyAfter: 4,
            enclosureQtyBefore: 0,
            eventType: 'birth',
            eventTypeLabel: 'Kelahiran',
            id: 'hist-birth-1',
            invoiceCode: '',
            photos: [],
            reason: 'KELAHIRAN',
            scientificName: 'Ranitomeya imitator',
            speciesId: 'sp-1',
            speciesName: 'Ranitomeya',
            stockTransactionId: 'tx-birth-1',
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
        <KolamEnclosureSurface route="/enclosures/enc-1" />,
      );
    });

    const root = renderer!.root;
    expect(root.findAllByProps({label: 'Production'}).length).toBeGreaterThan(0);

    await ReactTestRenderer.act(async () => {
      root
        .findAllByProps({label: 'Production'})
        .find(node => typeof node.props.onPress === 'function')!
        .props.onPress();
    });

    expect(root.findAllByProps({children: 'Ringkasan produksi'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Telur di kandang'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Kelahiran indukan'}).length).toBeGreaterThan(0);
    expect(root.findAllByProps({children: 'Log produksi'}).length).toBeGreaterThan(0);
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
    enclosureComments: [],
    enclosureStatistics: null,
    enclosureStatisticsError: null,
    enclosureStatisticsLoading: false,
    enclosureTasks: [],
    enclosureTasksLoading: false,
    enclosureTaskTypes: [],
    enclosureRecurringEnrollments: [],
    enclosureRecurringLoading: false,
    enclosureStockTransactions: [],
    enclosureStockTransactionsLoading: false,
    enclosureStockTransactionsError: null,
    editBrands: [],
    editLocations: [],
    editUnits: [],
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
    operationLoading: false,
    routeEnclosureId: '',
    selectedEnclosure: null,
    staffAssignees: [],
    statusMessage: null,
    onAddProductionEggs: jest.fn().mockResolvedValue(undefined),
    onAdvanceProductionEggs: jest.fn().mockResolvedValue(undefined),
    onAttachSpecies: jest.fn().mockResolvedValue(undefined),
    onChangeFilters: jest.fn(),
    onClearFilters: jest.fn(),
    onChangeProductionPhase: jest.fn().mockResolvedValue(undefined),
    onCreateComment: jest.fn().mockResolvedValue(undefined),
    onCrossPoolTransferSpecies: jest.fn().mockResolvedValue(undefined),
    onDeleteComment: jest.fn().mockResolvedValue(undefined),
    onDeleteCoverPhoto: jest.fn().mockResolvedValue(undefined),
    onDeletePhoto: jest.fn().mockResolvedValue(undefined),
    onEditComment: jest.fn().mockResolvedValue(undefined),
    onLikeComment: jest.fn().mockResolvedValue(undefined),
    onLimitChange: jest.fn(),
    onMoveProductionPhaseToSale: jest.fn().mockResolvedValue(undefined),
    onPageChange: jest.fn(),
    onRecordPopulationEvent: jest.fn().mockResolvedValue(undefined),
    onRefresh: jest.fn().mockResolvedValue(undefined),
    onRefreshComments: jest.fn().mockResolvedValue(undefined),
    onRefreshTasks: jest.fn().mockResolvedValue(undefined),
    onRefreshStockTransactions: jest.fn().mockResolvedValue(undefined),
    onReplyComment: jest.fn().mockResolvedValue(undefined),
    onSearchChange: jest.fn(),
    onSetRecurringEnrollment: jest.fn().mockResolvedValue(undefined),
    onSpawnTask: jest.fn().mockResolvedValue(undefined),
    onProvisionCode: jest.fn().mockResolvedValue(undefined),
    onUpsertClimateParameter: jest.fn().mockResolvedValue(undefined),
    onSwitchSpeciesVariant: jest.fn().mockResolvedValue(undefined),
    onTabChange: jest.fn(),
    onTransferSpecies: jest.fn().mockResolvedValue(undefined),
    onUpdateParameter: jest.fn().mockResolvedValue(undefined),
    onUpdateSaleListing: jest.fn().mockResolvedValue(undefined),
    onUploadCoverPhoto: jest.fn().mockResolvedValue(undefined),
    onUploadPhotos: jest.fn().mockResolvedValue(undefined),
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

function createEnclosureStatistics(
  patch: Partial<
    NonNullable<KolamEnclosureController['enclosureStatistics']>
  > = {},
): NonNullable<KolamEnclosureController['enclosureStatistics']> {
  return {
    deaths: [
      {
        createdAt: '2026-07-30T08:00:00.000Z',
        id: 'death-1',
        invoiceCode: '',
        quantity: 1,
        raw: {},
        reason: 'sakit',
        saleId: '',
        scientificName: 'Ranitomeya imitator',
        speciesId: 'sp-1',
        speciesName: 'Ranitomeya',
        stockTransactionId: 'tx-1',
        totalValue: 100000,
        unitPrice: 100000,
        variantId: 'v1',
        variantLabel: 'Orange',
      },
    ],
    enclosureCode: 'ENC-1',
    enclosureId: 'enc-1',
    livestockPurpose: 'saleable',
    lost: [
      {
        createdAt: '2026-07-29T08:00:00.000Z',
        id: 'lost-1',
        invoiceCode: '',
        quantity: 1,
        raw: {},
        reason: 'hilang',
        saleId: '',
        scientificName: 'Ranitomeya imitator',
        speciesId: 'sp-1',
        speciesName: 'Ranitomeya',
        stockTransactionId: 'tx-2',
        totalValue: 100000,
        unitPrice: 100000,
        variantId: 'v1',
        variantLabel: 'Orange',
      },
    ],
    production: null,
    raw: {},
    sales: [
      {
        createdAt: '2026-07-28T08:00:00.000Z',
        id: 'sale-1',
        invoiceCode: 'INV-1',
        quantity: 2,
        raw: {},
        reason: 'adoption',
        saleId: 'sale-1',
        scientificName: 'Ranitomeya imitator',
        speciesId: 'sp-1',
        speciesName: 'Ranitomeya',
        stockTransactionId: 'tx-3',
        totalValue: 300000,
        unitPrice: 150000,
        variantId: 'v1',
        variantLabel: 'Orange',
      },
    ],
    summary: {
      currentPopulationQty: 3,
      currentPopulationValue: 450000,
      deathQty: 1,
      deathValue: 100000,
      healthLabel: 'Menguntungkan',
      healthTone: 'positive',
      lostQty: 1,
      lostValue: 100000,
      mortalityRate: 25,
      netBalance: 100000,
      saleQty: 2,
      saleRevenue: 300000,
      totalLossValue: 200000,
    },
    ...patch,
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
    saleReservedInvoiceCode: '',
    saleReservedInvoiceStatus: '',
    saleReservedSaleId: '',
    saleStatus: 'not_for_sale',
    soldAt: '',
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

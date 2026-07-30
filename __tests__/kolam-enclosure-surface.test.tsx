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
      renderer!.root.findAllByProps({title: 'Memuat enclosure...'}).length,
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
      limit: 20,
      livestockPurpose: 'all',
      page: 1,
      scope: 'internal',
      search: '',
    },
    loading: false,
    mode: 'list',
    pagination: {
      limit: 20,
      page: 1,
      total: 21,
      totalPages: 2,
    },
    pendingAllocations: [],
    pendingTotal: 0,
    routeEnclosureId: '',
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

function createEnclosure(): KolamEnclosure {
  return {
    aquariumWaterType: 'freshwater',
    assignedTo: {
      displayName: 'Keeper One',
      email: 'keeper@example.com',
      firstName: 'Keeper',
      id: 'u1',
      lastName: 'One',
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
    createdAt: '',
    customer: null,
    customerId: '',
    id: 'enc-1',
    livestockPurpose: 'saleable',
    location: {address: '', code: 'LOC', id: 'loc-1', name: 'Room A'},
    locationId: 'loc-1',
    name: 'Rack 1',
    note: '',
    raw: {},
    salePrice: null,
    saleStatus: 'not_for_sale',
    size: {
      high: {unit: null, unitLabel: 'Cm', value: 30},
      length: {unit: null, unitLabel: 'Cm', value: 60},
      width: {unit: null, unitLabel: 'Cm', value: 40},
    },
    status: 'active',
    type: 'Aquarium',
    updatedAt: '',
  };
}

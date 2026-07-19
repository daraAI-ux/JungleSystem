import type {UnifiedDataset} from '../services/unified-data';

export type DashboardCountIconKind =
  | 'shopping-bag'
  | 'package'
  | 'book'
  | 'service';

export interface DashboardCountCard {
  id: 'products' | 'rawProducts' | 'species' | 'services';
  label: string;
  subLabel: string;
  value: number;
  iconKind: DashboardCountIconKind;
  iconSource: string;
  routeHint: string;
  accessibilityLabel: string;
}

export interface DashboardCountSectionDescriptor {
  title: 'Ringkasan Inventori';
  description: 'Ringkasan katalog, stok, dan layanan aktif.';
  actionLabel: 'Ke inventori';
  actionRoute: '/inventory';
  actionIconKind: 'chevron';
  actionTone: 'primary';
}

export interface DashboardCountVisualContract {
  sourceComponent: string;
  sourceIconRoot: string;
  cardSpacing: number;
  gridColumns: {
    base: 1;
    tablet: 2;
    desktop: 4;
  };
  breakpoints: {
    tabletMaxWidth: number;
    mobileMaxWidth: number;
  };
  card: {
    minHeight: number;
    minWidth: number;
    gapX: number;
    padding: number;
    radius: number;
    borderWidth: number;
  };
  section: {
    frameRadius: number;
    headerPaddingX: number;
    headerPaddingTop: number;
    headerPaddingBottom: number;
    headerGapX: number;
    headerBorderBottom: false;
    titleFontSize: number;
    descriptionGapY: number;
    descriptionFontSize: number;
    gridPaddingX: number;
    gridPaddingBottom: number;
  };
  iconTile: {
    size: number;
    radius: number;
    background: 'muted';
  };
  copy: {
    labelGapY: number;
    labelTone: 'fg';
    labelFontSize: number;
    valueGapY: number;
    valueFontSize: number;
    subLabelGapY: number;
    subLabelFontSize: number;
  };
  showRouteHint: false;
}

const dashboardCountSectionDescriptor: DashboardCountSectionDescriptor = {
  title: 'Ringkasan Inventori',
  description: 'Ringkasan katalog, stok, dan layanan aktif.',
  actionLabel: 'Ke inventori',
  actionRoute: '/inventory',
  actionIconKind: 'chevron',
  actionTone: 'primary',
};

const dashboardCountVisualContract: DashboardCountVisualContract = {
  sourceComponent:
    'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\app\\(app)\\(dashboard)\\(partials)\\inventory-counts.tsx',
  sourceIconRoot: '/dara-premium-icons/inventory',
  cardSpacing: 10,
  gridColumns: {
    base: 1,
    tablet: 2,
    desktop: 4,
  },
  breakpoints: {
    tabletMaxWidth: 1180,
    mobileMaxWidth: 760,
  },
  card: {
    minHeight: 82,
    minWidth: 220,
    gapX: 12,
    padding: 12,
    radius: 10,
    borderWidth: 1,
  },
  section: {
    frameRadius: 12,
    headerPaddingX: 20,
    headerPaddingTop: 18,
    headerPaddingBottom: 12,
    headerGapX: 18,
    headerBorderBottom: false,
    titleFontSize: 15,
    descriptionGapY: 5,
    descriptionFontSize: 13,
    gridPaddingX: 14,
    gridPaddingBottom: 14,
  },
  iconTile: {
    size: 46,
    radius: 10,
    background: 'muted',
  },
  copy: {
    labelGapY: 3,
    labelTone: 'fg',
    labelFontSize: 13,
    valueGapY: 0,
    valueFontSize: 20,
    subLabelGapY: 2,
    subLabelFontSize: 12,
  },
  showRouteHint: false,
};

export function getDashboardCountCards(
  dataset: UnifiedDataset,
): DashboardCountCard[] {
  const fallbackCounts = {
    products: dataset.catalog.filter(item => item.type === 'product').length,
    rawProducts: 0,
    species: dataset.catalog.filter(item => item.type === 'species').length,
    services: 0,
  };
  const counts = dataset.kolam.dashboardCounts ?? fallbackCounts;

  return [
    {
      id: 'products',
      label: 'Produk',
      subLabel: 'Total produk',
      value: counts.products,
      iconKind: 'shopping-bag',
      iconSource: `${dashboardCountVisualContract.sourceIconRoot}/products.svg`,
      routeHint: '/products',
      accessibilityLabel: 'Buka Produk di /products',
    },
    {
      id: 'rawProducts',
      label: 'Bahan baku',
      subLabel: 'Total bahan baku',
      value: counts.rawProducts,
      iconKind: 'package',
      iconSource: `${dashboardCountVisualContract.sourceIconRoot}/raw-materials.svg`,
      routeHint: '/raw-materials',
      accessibilityLabel: 'Buka Bahan baku di /raw-materials',
    },
    {
      id: 'species',
      label: 'Life stock',
      subLabel: 'Total life stock',
      value: counts.species,
      iconKind: 'book',
      iconSource: `${dashboardCountVisualContract.sourceIconRoot}/life-stock.svg`,
      routeHint: '/species',
      accessibilityLabel: 'Buka Life stock di /species',
    },
    {
      id: 'services',
      label: 'Layanan',
      subLabel: 'Total layanan',
      value: counts.services,
      iconKind: 'service',
      iconSource: `${dashboardCountVisualContract.sourceIconRoot}/services.svg`,
      routeHint: '/layanan',
      accessibilityLabel: 'Buka Layanan di /layanan',
    },
  ];
}

export function getDashboardCountSectionDescriptor(): DashboardCountSectionDescriptor {
  return dashboardCountSectionDescriptor;
}

export function getDashboardCountVisualContract(): DashboardCountVisualContract {
  return {
    ...dashboardCountVisualContract,
    card: {...dashboardCountVisualContract.card},
    breakpoints: {...dashboardCountVisualContract.breakpoints},
    gridColumns: {...dashboardCountVisualContract.gridColumns},
    iconTile: {...dashboardCountVisualContract.iconTile},
    copy: {...dashboardCountVisualContract.copy},
    section: {...dashboardCountVisualContract.section},
  };
}



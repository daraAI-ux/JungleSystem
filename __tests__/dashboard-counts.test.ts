import {
  getDashboardCountCards,
  getDashboardCountSectionDescriptor,
  getDashboardCountVisualContract,
} from '../src/domain/dashboard-counts';
import {seedUnifiedDataset} from '../src/services/unified-data';

describe('getDashboardCountCards', () => {
  it('builds Kolam dashboard inventory count cards from the active dataset', () => {
    const cards = getDashboardCountCards(seedUnifiedDataset);

    expect(cards.map(card => card.id)).toEqual([
      'products',
      'rawProducts',
      'species',
      'services',
    ]);
    expect(cards.map(card => card.label)).toEqual([
      'Produk',
      'Bahan baku',
      'Life stock',
      'Layanan',
    ]);
    expect(cards.map(card => card.subLabel)).toEqual([
      'Total produk',
      'Total bahan baku',
      'Total life stock',
      'Total layanan',
    ]);
    expect(cards.every(card => card.value >= 0)).toBe(true);
    expect(cards.map(card => card.iconKind)).toEqual([
      'shopping-bag',
      'package',
      'book',
      'service',
    ]);
    expect(cards.map(card => card.iconSource)).toEqual([
      '/dara-premium-icons/inventory/products.svg',
      '/dara-premium-icons/inventory/raw-materials.svg',
      '/dara-premium-icons/inventory/life-stock.svg',
      '/dara-premium-icons/inventory/services.svg',
    ]);
    expect(cards.map(card => card.routeHint)).toEqual([
      '/products',
      '/raw-materials',
      '/species',
      '/layanan',
    ]);
    expect(cards.map(card => card.accessibilityLabel)).toEqual([
      'Buka Produk di /products',
      'Buka Bahan baku di /raw-materials',
      'Buka Life stock di /species',
      'Buka Layanan di /layanan',
    ]);
  });

  it('prefers live Kolam dashboard counts when available', () => {
    const cards = getDashboardCountCards({
      ...seedUnifiedDataset,
      kolam: {
        ...seedUnifiedDataset.kolam,
        dashboardCounts: {
          products: 12,
          rawProducts: 5,
          species: 7,
          services: 3,
        },
      },
    });

    expect(cards.map(card => card.value)).toEqual([12, 5, 7, 3]);
  });

  it('tracks the live InventoryCounts section descriptor', () => {
    expect(getDashboardCountSectionDescriptor()).toEqual({
      title: 'Ringkasan Inventori',
      description: 'Ringkasan katalog, stok, dan layanan aktif.',
      actionLabel: 'Ke inventori',
      actionRoute: '/inventory',
      actionIconKind: 'chevron',
      actionTone: 'primary',
    });
  });

  it('tracks the live InventoryCounts card visual contract', () => {
    expect(getDashboardCountVisualContract()).toEqual({
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
    });
  });

  it('returns defensive copies of the inventory count visual contract', () => {
    const first = getDashboardCountVisualContract();

    first.card.minHeight = 99;
    first.card.minWidth = 99;
    first.sourceIconRoot = 'mutated';
    first.cardSpacing = 99;
    first.copy.valueGapY = 99;
    first.copy.labelTone = 'fg';
    first.breakpoints.tabletMaxWidth = 99;
    (first.gridColumns as {tablet: number}).tablet = 99;
    (first.gridColumns as {desktop: number}).desktop = 99;
    first.iconTile.size = 99;
    first.iconTile.background = 'muted';
    first.section.frameRadius = 99;
    first.section.gridPaddingX = 99;
    first.section.headerPaddingX = 99;

    const next = getDashboardCountVisualContract();

    expect(next.card.minHeight).toBe(82);
    expect(next.card.minWidth).toBe(220);
    expect(next.sourceIconRoot).toBe('/dara-premium-icons/inventory');
    expect(next.cardSpacing).toBe(10);
    expect(next.copy.valueGapY).toBe(0);
    expect(next.copy.labelTone).toBe('fg');
    expect(next.breakpoints.tabletMaxWidth).toBe(1180);
    expect(next.gridColumns.tablet).toBe(2);
    expect(next.gridColumns.desktop).toBe(4);
    expect(next.iconTile.size).toBe(46);
    expect(next.iconTile.background).toBe('muted');
    expect(next.section.frameRadius).toBe(12);
    expect(next.section.gridPaddingX).toBe(14);
    expect(next.section.headerPaddingX).toBe(20);
  });
});





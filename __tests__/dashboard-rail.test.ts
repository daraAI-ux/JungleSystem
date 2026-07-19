import {
  getDashboardRailSections,
  getDashboardRailVisualContract,
} from '../src/domain/dashboard-rail';
import {seedUnifiedDataset} from '../src/services/unified-data';

describe('getDashboardRailSections', () => {
  it('builds inventory rail sections for the Kolam dashboard layout', () => {
    const sections = getDashboardRailSections(seedUnifiedDataset);

    expect(sections.map(section => section.id)).toEqual([
      'out-of-stock',
      'low-stock',
      'top-sales',
    ]);
    expect(sections.map(section => section.title)).toEqual([
      'Stok Habis',
      'Stok Menipis',
      'Produk Terlaris',
    ]);
    expect(sections.every(section => section.actionLabel === 'Lihat semua')).toBe(true);
    expect(sections.every(section => section.actionIconKind === 'chevron')).toBe(
      true,
    );
    expect(sections.every(section => section.actionRoute.startsWith('/products'))).toBe(
      true,
    );
    expect(sections.every(section => section.emptyTitle.length > 0)).toBe(true);
    expect(sections.map(section => section.iconKind)).toEqual([
      'circle-x',
      'triangle-warning',
      'trending',
    ]);
    expect(sections.map(section => section.emptyIconKind)).toEqual([
      'circle-check',
      'circle-check',
      'trending',
    ]);
    expect(sections.flatMap(section => section.items).every(item => item.route.startsWith('/'))).toBe(
      true,
    );
    expect(
      sections
        .flatMap(section => section.items)
        .every(item => item.trailingIconKind === 'chevron'),
    ).toBe(true);
    expect(sections[1].items.every(item => item.tone === 'warning')).toBe(true);
    expect(sections[2].items[0]).toEqual(
      expect.objectContaining({
        label: 'Sponge Filter Medium',
        value: 'Terjual 2',
        route: '/products/product-filter-sponge',
        rank: 1,
        tone: 'success',
      }),
    );
    expect(sections[2].items.map(item => item.label)).not.toContain(
      'POS-20260711-001',
    );
  });

  it('prefers live Kolam dashboard.latest products when available', () => {
    const sections = getDashboardRailSections({
      ...seedUnifiedDataset,
      kolam: {
        ...seedUnifiedDataset.kolam,
        dashboardLatest: {
          outOfStockProducts: [
            {
              _id: 'product-live-empty',
              name: 'Live Empty Stock',
              stock: 0,
              photos: ['api/media/empty.jpg'],
            },
          ],
          lowStockProducts: [
            {
              _id: 'product-live-low',
              name: 'Live Low Stock',
              stock: 2,
              photos: ['/media/low.jpg'],
            },
          ],
          topSellingProducts: [
            {
              productId: 'product-live-top',
              name: 'Live Top Product',
              stock: 8,
              totalSold: 11,
              photo: 'https://cdn.example.com/top.jpg',
            },
          ],
        },
      },
    });

    expect(sections[0].items[0]).toEqual(
      expect.objectContaining({
        id: 'product-live-empty',
        label: 'Live Empty Stock',
        value: '0',
        route: '/products/product-live-empty',
        thumbnailUrl: 'https://amfibi.dunia-anura.com/media/empty.jpg',
        tone: 'danger',
      }),
    );
    expect(sections[1].items[0]).toEqual(
      expect.objectContaining({
        id: 'product-live-low',
        label: 'Live Low Stock',
        value: '2',
        route: '/products/product-live-low',
        thumbnailUrl: 'https://amfibi.dunia-anura.com/media/low.jpg',
        tone: 'warning',
      }),
    );
    expect(sections[2].items[0]).toEqual(
      expect.objectContaining({
        id: 'product-live-top',
        label: 'Live Top Product',
        value: 'Terjual 11',
        route: '/products/product-live-top',
        thumbnailUrl: 'https://cdn.example.com/top.jpg',
        rank: 1,
        tone: 'success',
      }),
    );
  });

  it('matches the live dashboard page rail cap of three products per card', () => {
    const liveProducts = Array.from({length: 6}, (_, index) => ({
      _id: `product-live-empty-${index + 1}`,
      name: `Live Empty Stock ${index + 1}`,
      stock: 0,
      photos: [],
    }));
    const sections = getDashboardRailSections({
      ...seedUnifiedDataset,
      kolam: {
        ...seedUnifiedDataset.kolam,
        dashboardLatest: {
          outOfStockProducts: liveProducts,
          lowStockProducts: liveProducts.map(product => ({
            ...product,
            stock: 2,
          })),
          topSellingProducts: liveProducts.map((product, index) => ({
            productId: product._id,
            name: product.name,
            stock: 8,
            totalSold: index + 1,
            photo: null,
          })),
        },
      },
    });

    expect(sections[0].items).toHaveLength(3);
    expect(sections[1].items).toHaveLength(3);
    expect(sections[2].items).toHaveLength(3);
    expect(sections[0].items.map(item => item.label)).toEqual([
      'Live Empty Stock 1',
      'Live Empty Stock 2',
      'Live Empty Stock 3',
    ]);
  });

  it('does not show sale invoices as fallback products in the top-selling rail', () => {
    const sections = getDashboardRailSections({
      ...seedUnifiedDataset,
      catalog: [],
      recentSales: seedUnifiedDataset.recentSales.map(sale => ({
        ...sale,
        items: [],
      })),
      kolam: {
        ...seedUnifiedDataset.kolam,
        dashboardLatest: null,
      },
    });

    expect(sections[2]).toEqual(
      expect.objectContaining({
        id: 'top-sales',
        emptyTitle: 'Belum ada data penjualan',
        items: [],
      }),
    );
  });

  it('tracks the live dashboard right rail visual contract', () => {
    const contract = getDashboardRailVisualContract();

    expect(contract.sourcePage).toBe(
      'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\app\\(app)\\(dashboard)\\page.tsx',
    );
    expect(contract.sourcePartials.lowStock).toContain(
      'latest-lowstockproduct.tsx',
    );
    expect(contract.sourcePartials.topSelling).toContain(
      'latest-topsellingproduct.tsx',
    );
    expect(contract.card).toEqual({
      radius: 24,
      radiusSourceClass: 'rounded-3xl',
    });
    expect(contract.layout).toEqual({
      cardMinWidth: 220,
      cardBasisPercent: 31,
      cardGap: 10,
      cardPadding: 0,
      gridColumns: {
        base: 1,
        tablet: 2,
        desktop: 3,
      },
      headerPaddingX: 16,
      headerPaddingY: 12,
      headerIconVisible: false,
      rowGapX: 12,
      rowPaddingX: 16,
      rowPaddingY: 12,
      rowMinHeight: 64,
      showDescription: false,
      thumbSize: 40,
      thumbRadius: 14,
      thumbBorderWidth: 1,
      thumbBorderColor: '#e2e8f0',
      thumbBackgroundColor: '#f8fafc',
      iconShellSize: 28,
      iconShellRadius: 14,
    });
    expect(contract.list).toEqual({
      maxItems: 3,
      maxItemsSource: 'live-page-slice',
      showItemMeta: false,
      showRowChevron: false,
      rankSize: 20,
    });
    expect(contract.valueDisplay).toEqual({
      dangerShape: 'circle',
      warningShape: 'badge',
      successShape: 'plain-text',
      dangerSize: 28,
      dangerFontWeight: 'semibold',
      successFontWeight: 'medium',
      warningFontWeight: 'medium',
      tabularNumbers: true,
    });
    expect(contract.text).toEqual({
      actionToneFollowsSection: true,
      emptyIconVisible: false,
      headerDescriptionGapY: 3,
      headerDescriptionFontSize: 11,
      headerTitleFontSize: 16,
      rowLabelFontSize: 14,
      rowLabelFontWeight: 'regular',
      rowMetaGapY: 3,
      rowMetaFontSize: 11,
      emptyTitleFontSize: 14,
      emptyTitleFontWeight: 'regular',
      emptyTitleTone: 'mutedFg',
      thumbPlaceholderFontSize: 10,
      thumbPlaceholderText: '—',
    });
  });

  it('returns defensive copies of the right rail visual contract', () => {
    const first = getDashboardRailVisualContract();

    first.text.headerTitleFontSize = 99;
    first.text.actionToneFollowsSection = false;
    first.text.emptyIconVisible = true as false;
    first.text.emptyTitleFontSize = 99;
    first.text.emptyTitleFontWeight = 'mutated' as 'regular';
    first.text.emptyTitleTone = 'fg' as 'mutedFg';
    first.text.thumbPlaceholderFontSize = 99;
    first.text.thumbPlaceholderText = 'x' as '—';
    first.layout.cardGap = 99;
    first.card.radius = 99;
    first.card.radiusSourceClass = 'mutated' as 'rounded-3xl';
    first.layout.headerIconVisible = true as false;
    first.layout.gridColumns.desktop = 99;
    first.layout.rowGapX = 99;
    first.layout.iconShellSize = 99;
    first.layout.thumbBorderWidth = 99;
    first.list.maxItems = 99;
    (
      first.list as {maxItemsSource: string}
    ).maxItemsSource = 'mutated';
    first.list.rankSize = 99;
    first.valueDisplay.dangerSize = 99;
    first.valueDisplay.dangerFontWeight = 'mutated' as 'semibold';
    first.valueDisplay.successFontWeight = 'mutated' as 'medium';
    first.valueDisplay.warningFontWeight = 'mutated' as 'medium';
    first.valueDisplay.tabularNumbers = false;

    const next = getDashboardRailVisualContract();

    expect(next.text.headerTitleFontSize).toBe(16);
    expect(next.text.actionToneFollowsSection).toBe(true);
    expect(next.text.emptyIconVisible).toBe(false);
    expect(next.text.emptyTitleFontSize).toBe(14);
    expect(next.text.emptyTitleFontWeight).toBe('regular');
    expect(next.text.emptyTitleTone).toBe('mutedFg');
    expect(next.text.thumbPlaceholderFontSize).toBe(10);
    expect(next.text.thumbPlaceholderText).toBe('—');
    expect(next.card.radius).toBe(24);
    expect(next.card.radiusSourceClass).toBe('rounded-3xl');
    expect(next.layout.cardGap).toBe(10);
    expect(next.layout.headerIconVisible).toBe(false);
    expect(next.layout.gridColumns.desktop).toBe(3);
    expect(next.layout.rowGapX).toBe(12);
    expect(next.layout.iconShellSize).toBe(28);
    expect(next.layout.thumbBorderWidth).toBe(1);
    expect(next.list.maxItems).toBe(3);
    expect(next.list.maxItemsSource).toBe('live-page-slice');
    expect(next.list.rankSize).toBe(20);
    expect(next.valueDisplay.dangerSize).toBe(28);
    expect(next.valueDisplay.dangerFontWeight).toBe('semibold');
    expect(next.valueDisplay.successFontWeight).toBe('medium');
    expect(next.valueDisplay.warningFontWeight).toBe('medium');
    expect(next.valueDisplay.tabularNumbers).toBe(true);
  });
});



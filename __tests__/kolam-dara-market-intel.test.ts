import {
  KOLAM_DARA_MARKET_INTEL_DESCRIPTION,
  KOLAM_DARA_MARKET_INTEL_TITLE,
  buildKolamDaraMarketIntelMetricLines,
  buildKolamDaraMarketIntelRoute,
  filterKolamDaraMarketIntelRecommendationsForMargin,
  formatKolamDaraMarketIntelEntityName,
  formatKolamDaraMarketIntelIdr,
  formatKolamDaraMarketIntelTaxSource,
  getKolamDaraMarketIntelTab,
  isKolamDaraMarketIntelApprovable,
  isKolamDaraMarketIntelRoute,
  normalizeKolamDaraMarketIntelBrands,
  normalizeKolamDaraMarketIntelDashboard,
  normalizeKolamDaraMarketIntelRecommendations,
  normalizeKolamDaraMarketIntelStatus,
  paginateKolamDaraMarketIntelRecommendations,
  resolveKolamDaraMarketIntelAccess,
} from '../src/domain/kolam-dara-market-intel';

describe('kolam-dara-market-intel domain', () => {
  it('matches market intel routes and tabs like FE layout', () => {
    expect(isKolamDaraMarketIntelRoute('/campaign/dara-market-intel')).toBe(
      true,
    );
    expect(
      isKolamDaraMarketIntelRoute('/campaign/dara-market-intel/approvals'),
    ).toBe(true);
    expect(isKolamDaraMarketIntelRoute('/campaign/dara-seo')).toBe(false);
    expect(getKolamDaraMarketIntelTab('/campaign/dara-market-intel')).toBe(
      'dashboard',
    );
    expect(
      getKolamDaraMarketIntelTab('/campaign/dara-market-intel/competitors'),
    ).toBe('competitors');
    expect(
      getKolamDaraMarketIntelTab('/campaign/dara-market-intel/kesehatan'),
    ).toBe('kesehatan');
    expect(buildKolamDaraMarketIntelRoute('peralatan')).toBe(
      '/campaign/dara-market-intel/peralatan',
    );
    expect(buildKolamDaraMarketIntelRoute('jobs')).toBe(
      '/pusat-ai?tab=proses',
    );
    expect(KOLAM_DARA_MARKET_INTEL_TITLE).toBe('DARA AI Market Intelligence');
    expect(KOLAM_DARA_MARKET_INTEL_DESCRIPTION).toContain('approval');
  });

  it('resolves access gates like FE useDaraMarketAccess', () => {
    expect(
      resolveKolamDaraMarketIntelAccess({roleKey: 'admin', permissions: []}),
    ).toEqual({
      canSee: true,
      canDraft: true,
      canApprove: true,
      canViewMargin: true,
      canViewPurchasing: true,
      isPurchasing: false,
    });

    expect(
      resolveKolamDaraMarketIntelAccess({
        roleKey: 'staff',
        permissions: [{resource: 'ai-market-intel', actions: ['view']}],
      }),
    ).toMatchObject({
      canSee: true,
      canDraft: false,
      canApprove: false,
      canViewMargin: false,
    });

    expect(
      resolveKolamDaraMarketIntelAccess({
        roleKey: 'purchasing',
        permissions: [{resource: 'ai-market-intel', actions: ['view', 'draft']}],
      }),
    ).toMatchObject({
      canSee: true,
      canDraft: true,
      canViewMargin: false,
      canViewPurchasing: true,
      isPurchasing: true,
    });

    expect(
      resolveKolamDaraMarketIntelAccess({
        roleKey: 'pos',
        permissions: [{resource: 'ai-market-intel', actions: ['view', 'draft']}],
      }),
    ).toMatchObject({
      canViewMargin: false,
    });
  });

  it('normalizes status, brands, and dashboard payloads', () => {
    expect(
      normalizeKolamDaraMarketIntelStatus({
        data: {
          enabled: true,
          canView: true,
          canViewMargin: true,
          canDraft: false,
          canApprove: false,
          disclaimer: 'Draft manual.',
        },
      }),
    ).toEqual({
      enabled: true,
      canView: true,
      canViewMargin: true,
      canDraft: false,
      canApprove: false,
      disclaimer: 'Draft manual.',
    });

    const brands = normalizeKolamDaraMarketIntelBrands({
      data: {
        brands: [
          {_id: 'b1', name: 'Anura', productCount: 12, monitoringActive: true},
        ],
        defaultBrandId: 'all',
      },
    });
    expect(brands.defaultBrandId).toBe('all');
    expect(brands.brands).toEqual([
      {
        id: 'b1',
        name: 'Anura',
        productCount: 12,
        monitoringActive: true,
      },
    ]);

    const dash = normalizeKolamDaraMarketIntelDashboard({
      data: {
        pendingApprovals: 3,
        taxPolicy: {
          ppnRate: 11,
          pricesIncludeTax: true,
          source: 'regulation',
          taxDisclaimer: 'PPN 11%',
        },
        tooCheap: [
          {
            productId: 'p1',
            name: 'Produk A',
            sellPrice: 100,
            idealPrice: 150,
            marginPercent: 10,
          },
        ],
        tooExpensive: [],
        lowMargin: [{productId: 'p2', name: 'Produk B', marginPercent: 5}],
        supplierLeaders: [
          {
            productId: 'p3',
            productName: 'Produk C',
            bestSupplier: 'Vendor X',
            cheapest: 'Vendor Y',
            score: 88,
          },
        ],
        totals: {
          extraProfitPotential: 1200,
          purchaseSavingsPotential: 400,
        },
      },
    });
    expect(dash).toMatchObject({
      pendingApprovals: 3,
      taxPolicy: {ppnRate: 11, pricesIncludeTax: true, source: 'regulation'},
      totals: {extraProfitPotential: 1200, purchaseSavingsPotential: 400},
    });
    expect(dash?.tooCheap).toHaveLength(1);
    expect(dash?.lowMargin[0]).toEqual({
      productId: 'p2',
      name: 'Produk B',
      marginPercent: 5,
    });
    expect(dash?.supplierLeaders[0].bestSupplier).toBe('Vendor X');
    expect(normalizeKolamDaraMarketIntelDashboard({})).toBeNull();
  });

  it('formats IDR and tax source like FE dashboard helpers', () => {
    expect(formatKolamDaraMarketIntelIdr(null)).toBe('—');
    expect(formatKolamDaraMarketIntelIdr(1200)).toMatch(/^Rp /);
    expect(formatKolamDaraMarketIntelTaxSource('regulation')).toBe(
      'Regulasi DARA Tax',
    );
    expect(formatKolamDaraMarketIntelTaxSource('po_latest')).toBe(
      'PO terbaru',
    );
  });

  it('normalizes recommendations and gates margin categories', () => {
    const list = normalizeKolamDaraMarketIntelRecommendations({
      data: {
        total: 2,
        items: [
          {
            _id: 'r1',
            category: 'pricing',
            status: 'draft_ready',
            title: 'Naikkan harga',
            summary: 'Margin rendah',
            daraMessage: 'Detail AI',
            productId: {_id: 'p1', name: 'Produk A', sku: 'A1'},
            metrics: {currentSellPrice: 100000, idealPrice: 150000},
          },
          {
            _id: 'r2',
            category: 'purchasing',
            status: 'pending_approval',
            title: 'Ganti supplier',
            productId: {_id: 'p2', name: 'Produk B'},
          },
        ],
      },
    });
    expect(list.total).toBe(2);
    expect(list.items[0]).toMatchObject({
      id: 'r1',
      category: 'pricing',
      title: 'Naikkan harga',
    });
    expect(formatKolamDaraMarketIntelEntityName(list.items[0])).toBe(
      'Produk A',
    );
    expect(isKolamDaraMarketIntelApprovable(list.items[0])).toBe(true);
    expect(
      filterKolamDaraMarketIntelRecommendationsForMargin(list.items, false),
    ).toHaveLength(1);
    expect(
      filterKolamDaraMarketIntelRecommendationsForMargin(list.items, false)[0]
        .category,
    ).toBe('purchasing');

    const page = paginateKolamDaraMarketIntelRecommendations(
      Array.from({length: 12}, (_, i) => ({
        ...list.items[1],
        id: `id-${i}`,
      })),
      2,
    );
    expect(page.totalPages).toBe(2);
    expect(page.items).toHaveLength(2);

    const lines = buildKolamDaraMarketIntelMetricLines('pricing', {
      currentSellPrice: 100000,
      idealPrice: 150000,
      marginPercent: 12.5,
    });
    expect(lines.some(line => line.label === 'Harga ideal')).toBe(true);
    expect(lines.some(line => line.label === 'Margin')).toBe(true);
  });
});

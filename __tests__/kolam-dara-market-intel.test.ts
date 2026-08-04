import {
  KOLAM_DARA_MARKET_INTEL_DESCRIPTION,
  KOLAM_DARA_MARKET_INTEL_JOBS_HREF,
  KOLAM_DARA_MARKET_INTEL_TITLE,
  buildKolamDaraMarketIntelMetricLines,
  buildKolamDaraMarketIntelProductEditRoute,
  buildKolamDaraMarketIntelRoute,
  filterKolamDaraMarketIntelRecommendationsForMargin,
  formatKolamDaraMarketIntelEntityName,
  formatKolamDaraMarketIntelIdr,
  formatKolamDaraMarketIntelTaxSource,
  getKolamDaraMarketIntelTab,
  groupKolamDaraMarketIntelCompetitors,
  isKolamDaraMarketIntelApprovable,
  isKolamDaraMarketIntelMongoObjectId,
  isKolamDaraMarketIntelRoute,
  normalizeKolamDaraMarketIntelBrands,
  normalizeKolamDaraMarketIntelCompetitorLinks,
  normalizeKolamDaraMarketIntelDashboard,
  normalizeKolamDaraMarketIntelRecommendations,
  normalizeKolamDaraMarketIntelStatus,
  normalizeKolamDaraMarketIntelStoreHealthScan,
  paginateKolamDaraMarketIntelRecommendations,
  resolveKolamDaraMarketIntelAccess,
  resolveKolamDaraMarketIntelStoreHealthTone,
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
    expect(KOLAM_DARA_MARKET_INTEL_JOBS_HREF).toBe('/pusat-ai');
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

  it('normalizes competitor links and groups by name', () => {
    expect(isKolamDaraMarketIntelMongoObjectId('507f1f77bcf86cd799439011')).toBe(
      true,
    );
    const links = normalizeKolamDaraMarketIntelCompetitorLinks({
      data: [
        {
          _id: 'l1',
          competitorName: 'Toko X',
          platform: 'tokopedia',
          productId: {_id: 'p1', name: 'Filter'},
          lastFetchedPrice: 120000,
          monitor: {ourPrice: 100000, priceDeltaPct: 20, minSafePrice: 90000},
        },
        {
          _id: 'l2',
          competitorName: 'Toko X',
          platform: 'shopee',
          productId: {_id: 'p1', name: 'Filter'},
        },
        {
          _id: 'l3',
          competitorName: 'Toko Y',
          platform: 'website',
          productId: {_id: 'p2', name: 'Pompa'},
        },
      ],
    });
    expect(links).toHaveLength(3);
    const groups = groupKolamDaraMarketIntelCompetitors(links);
    expect(groups).toEqual([
      {
        name: 'Toko X',
        itemCount: 1,
        tokopedia: true,
        shopee: true,
        website: false,
      },
      {
        name: 'Toko Y',
        itemCount: 1,
        tokopedia: false,
        shopee: false,
        website: true,
      },
    ]);
  });

  it('normalizes store-health scan and score tone', () => {
    const scan = normalizeKolamDaraMarketIntelStoreHealthScan({
      data: {
        generatedAt: '2026-01-01',
        sellableOnly: true,
        formula: {
          storeScore: 'avg',
          productScore: 'weighted',
          complete: '100%',
        },
        summary: {
          total: 10,
          complete: 7,
          incomplete: 3,
          blockerProducts: 1,
          storeHealthScore: 72,
        },
        parameters: [
          {
            id: 'sku',
            label: 'SKU',
            level: 'blocker',
            pass: 9,
            fail: 1,
            passRate: 90,
          },
        ],
        products: [
          {
            productId: 'p1',
            sku: 'A1',
            name: 'Filter',
            score: 60,
            blockers: 1,
            warnings: 0,
            issues: [{code: 'sku', message: 'SKU kosong', level: 'blocker'}],
            complete: false,
          },
        ],
      },
    });
    expect(scan?.summary.storeHealthScore).toBe(72);
    expect(resolveKolamDaraMarketIntelStoreHealthTone(72)).toBe('warn');
    expect(resolveKolamDaraMarketIntelStoreHealthTone(100)).toBe('good');
    expect(scan?.products[0].issues[0].message).toBe('SKU kosong');
    expect(buildKolamDaraMarketIntelProductEditRoute('p1')).toBe(
      '/products/p1/edit',
    );
  });
});

import {
  KOLAM_DARA_MARKET_INTEL_DESCRIPTION,
  KOLAM_DARA_MARKET_INTEL_TITLE,
  buildKolamDaraMarketIntelRoute,
  getKolamDaraMarketIntelTab,
  isKolamDaraMarketIntelRoute,
  normalizeKolamDaraMarketIntelBrands,
  normalizeKolamDaraMarketIntelDashboard,
  normalizeKolamDaraMarketIntelStatus,
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
});

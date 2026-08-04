import {
  KOLAM_DARA_MARKET_INTEL_DESCRIPTION,
  KOLAM_DARA_MARKET_INTEL_TITLE,
  buildKolamDaraMarketIntelRoute,
  getKolamDaraMarketIntelTab,
  isKolamDaraMarketIntelRoute,
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
});

import {
  buildKolamPusatAiHubRoute,
  filterKolamPusatAiHubTabs,
  filterKolamPusatAiRingkasanQuickLinks,
  getKolamPusatAiHubTab,
  isKolamPusatAiHubRoute,
  isKolamPusatAiRingkasanRoute,
  normalizeKolamDaraMarketingHub,
  normalizeKolamPusatAiQuickLinkHref,
} from '../src/domain/kolam-pusat-ai';

describe('kolam-pusat-ai domain', () => {
  it('matches hub routes including legacy jobs and tab aliases', () => {
    expect(isKolamPusatAiHubRoute('/pusat-ai')).toBe(true);
    expect(isKolamPusatAiHubRoute('/pusat-ai?tab=proses')).toBe(true);
    expect(isKolamPusatAiHubRoute('/pusat-ai?tab=owner-copilot')).toBe(true);
    expect(isKolamPusatAiHubRoute('/campaign/dara-jobs')).toBe(true);
    expect(isKolamPusatAiHubRoute('/campaign/dara-marketing')).toBe(true);
    expect(isKolamPusatAiHubRoute('/campaign/dara-seo')).toBe(false);

    expect(isKolamPusatAiRingkasanRoute('/pusat-ai')).toBe(true);
    expect(isKolamPusatAiRingkasanRoute('/pusat-ai?tab=proses')).toBe(true);
    expect(getKolamPusatAiHubTab('/campaign/dara-jobs')).toBe('ringkasan');
    expect(getKolamPusatAiHubTab('/pusat-ai?tab=shipping-copilot')).toBe(
      'transaksi-copilot',
    );
    expect(getKolamPusatAiHubTab('/pusat-ai?tab=warehouse-copilot')).toBe(
      'inventory-copilot',
    );
    expect(buildKolamPusatAiHubRoute('ringkasan')).toBe('/pusat-ai');
  });

  it('filters admin-only hub tabs', () => {
    expect(filterKolamPusatAiHubTabs(false).map(tab => tab.id)).toEqual([
      'ringkasan',
    ]);
    expect(filterKolamPusatAiHubTabs(true).map(tab => tab.label)).toEqual([
      'Ringkasan',
      'Owner Copilot',
      'Transaksi Copilot',
      'PO Copilot',
      'Inventory Copilot',
      'Log DARA',
    ]);
  });

  it('filters jobs quick link and normalizes href', () => {
    expect(normalizeKolamPusatAiQuickLinkHref('/campaign/dara-jobs')).toBe(
      '/pusat-ai',
    );
    expect(
      filterKolamPusatAiRingkasanQuickLinks([
        {href: '/campaign/dara-seo', label: 'DARA SEO'},
        {href: '/campaign/dara-jobs', label: 'Riwayat proses'},
      ]),
    ).toEqual([{href: '/campaign/dara-seo', label: 'DARA SEO'}]);
  });

  it('normalizes marketing hub envelope', () => {
    const hub = normalizeKolamDaraMarketingHub({
      success: true,
      data: {
        generatedAt: '2026-08-03T00:00:00.000Z',
        seo: {
          seoScore: 72,
          pendingApprovals: 2,
          negativeMentions: 1,
          keywordCount: 9,
        },
        market: {
          pendingApprovals: 3,
          tooCheap: 4,
          tooExpensive: 5,
          lowMargin: 1,
        },
        integrations: {
          serpConfigured: true,
          searxngReachable: false,
        },
        serpSnapshotsStored: 11,
        quickLinks: [{href: '/campaign/dara-seo', label: 'DARA SEO'}],
        brands: [{_id: 'b1', name: 'Anura', productCount: 2}],
        selectedBrandId: 'all',
      },
    });

    expect(hub.seo?.seoScore).toBe(72);
    expect(hub.serpSnapshotsStored).toBe(11);
    expect(hub.market.pendingApprovals).toBe(3);
  });
});

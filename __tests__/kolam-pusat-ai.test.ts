import {
  buildKolamPusatAiRingkasanKpiCards,
  filterKolamPusatAiRingkasanQuickLinks,
  getKolamPusatAiHubTab,
  isKolamPusatAiRingkasanRoute,
  normalizeKolamDaraMarketingHub,
  normalizeKolamPusatAiQuickLinkHref,
} from '../src/domain/kolam-pusat-ai';

describe('kolam-pusat-ai domain', () => {
  it('matches Ringkasan routes and excludes other hub tabs', () => {
    expect(isKolamPusatAiRingkasanRoute('/pusat-ai')).toBe(true);
    expect(isKolamPusatAiRingkasanRoute('/pusat-ai?tab=ringkasan')).toBe(true);
    expect(isKolamPusatAiRingkasanRoute('/campaign/dara-marketing')).toBe(true);
    expect(isKolamPusatAiRingkasanRoute('/pusat-ai?tab=proses')).toBe(false);
    expect(isKolamPusatAiRingkasanRoute('/pusat-ai?tab=owner-copilot')).toBe(
      false,
    );
    expect(isKolamPusatAiRingkasanRoute('/pusat-ai?tab=shipping-copilot')).toBe(
      false,
    );
    expect(getKolamPusatAiHubTab('/pusat-ai?tab=warehouse-copilot')).toBe(
      'inventory-copilot',
    );
    expect(getKolamPusatAiHubTab('/pusat-ai?tab=procurement-copilot')).toBe(
      'po-copilot',
    );
  });

  it('filters jobs quick link and normalizes href', () => {
    expect(normalizeKolamPusatAiQuickLinkHref('/campaign/dara-jobs')).toBe(
      '/pusat-ai?tab=proses',
    );
    expect(
      filterKolamPusatAiRingkasanQuickLinks([
        {href: '/campaign/dara-seo', label: 'DARA SEO'},
        {href: '/campaign/dara-jobs', label: 'Riwayat proses'},
      ]),
    ).toEqual([{href: '/campaign/dara-seo', label: 'DARA SEO'}]);
  });

  it('normalizes marketing hub envelope and builds KPI cards', () => {
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
    expect(hub.market.pendingApprovals).toBe(3);
    expect(hub.brands).toEqual([
      {
        id: 'b1',
        name: 'Anura',
        productCount: 2,
        monitoringActive: false,
      },
    ]);

    const cards = buildKolamPusatAiRingkasanKpiCards(hub);
    expect(cards.map(card => card.label)).toEqual([
      'Skor SEO',
      'Persetujuan',
      'Snapshot SERP',
      'Keywords',
    ]);
    expect(cards[0].value).toBe('72');
    expect(cards[1].value).toBe('5');
    expect(cards[2].value).toBe('11');
    expect(cards[3].value).toBe('9');
  });
});

import {
  buildKolamDaraSeoRoute,
  formatKolamDaraSeoScoreStatus,
  formatKolamDaraSeoSentimentStatus,
  getKolamDaraSeoTab,
  isKolamDaraSeoRoute,
  normalizeKolamDaraSeoBrands,
  normalizeKolamDaraSeoDashboard,
  normalizeKolamDaraSeoPendingSuggestions,
  normalizeKolamDaraSeoStatus,
} from '../src/domain/kolam-dara-seo';

describe('kolam-dara-seo domain', () => {
  it('matches SEO routes and resolves tabs', () => {
    expect(isKolamDaraSeoRoute('/campaign/dara-seo')).toBe(true);
    expect(isKolamDaraSeoRoute('/campaign/dara-seo/approvals')).toBe(true);
    expect(isKolamDaraSeoRoute('/campaign/dara-seo/approvals?id=1')).toBe(true);
    expect(isKolamDaraSeoRoute('/pusat-ai')).toBe(false);
    expect(isKolamDaraSeoRoute('/campaign')).toBe(false);

    expect(getKolamDaraSeoTab('/campaign/dara-seo')).toBe('dashboard');
    expect(getKolamDaraSeoTab('/campaign/dara-seo/approvals')).toBe(
      'approvals',
    );
    expect(getKolamDaraSeoTab('/campaign/dara-seo/website')).toBe('website');
    expect(buildKolamDaraSeoRoute('jobs')).toBe('/pusat-ai?tab=proses');
    expect(buildKolamDaraSeoRoute('dashboard')).toBe('/campaign/dara-seo');
  });

  it('formats score and sentiment labels', () => {
    expect(formatKolamDaraSeoScoreStatus(80)).toBe('Excellent');
    expect(formatKolamDaraSeoScoreStatus(55)).toBe('Cukup');
    expect(formatKolamDaraSeoScoreStatus(20)).toBe('Perlu Perbaikan');
    expect(formatKolamDaraSeoSentimentStatus(-2)).toBe('Negatif');
    expect(formatKolamDaraSeoSentimentStatus(20)).toBe('Positif');
    expect(formatKolamDaraSeoSentimentStatus(5)).toBe('Netral');
  });

  it('normalizes status, brands, dashboard, and pending suggestions', () => {
    expect(normalizeKolamDaraSeoStatus({data: {seoEnabled: false}})).toEqual({
      seoEnabled: false,
    });
    expect(
      normalizeKolamDaraSeoBrands({
        data: {
          defaultBrandId: 'b1',
          brands: [{_id: 'b1', name: 'Anura', productCount: 3}],
        },
      }),
    ).toEqual({
      defaultBrandId: 'b1',
      brands: [
        {
          id: 'b1',
          name: 'Anura',
          productCount: 3,
          monitoringActive: false,
        },
      ],
    });

    const dash = normalizeKolamDaraSeoDashboard({
      data: {
        seoScore: 71,
        searchVisibility: 44,
        brandReputationScore: 88,
        sentimentScore: 12,
        pendingApprovals: 2,
        appliedChanges: 5,
        negativeMentions: 1,
        growthInsights: {
          bullets: ['Naik'],
          needsOptimization: 9,
          keywordOpportunities: 4,
        },
      },
    });
    expect(dash).toMatchObject({
      seoScore: 71,
      pendingApprovals: 2,
      growthBullets: ['Naik'],
      needsOptimization: 9,
      keywordOpportunities: 4,
    });

    expect(
      normalizeKolamDaraSeoPendingSuggestions({
        data: {
          items: [
            {
              _id: 's1',
              targetType: 'product',
              seoScore: 40,
              status: 'pending_approval',
              daraSummary: 'Perbaiki title',
              productId: {name: 'Filter'},
              pendingItemCount: 2,
            },
          ],
        },
      }),
    ).toEqual([
      {
        id: 's1',
        targetType: 'product',
        title: 'Filter',
        seoScore: 40,
        status: 'pending_approval',
        summary: 'Perbaiki title',
        pendingItemCount: 2,
      },
    ]);
  });
});

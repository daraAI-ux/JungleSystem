import {
  buildKolamDaraSeoRoute,
  filterKolamDaraSeoSuggestions,
  formatKolamDaraSeoScoreStatus,
  formatKolamDaraSeoSentimentStatus,
  formatKolamDaraSeoSuggestionStatus,
  formatKolamDaraSeoWorkflowHint,
  getKolamDaraSeoApprovalsFocusId,
  getKolamDaraSeoTab,
  isKolamDaraSeoReadyToApply,
  isKolamDaraSeoRoute,
  normalizeKolamDaraSeoBrands,
  normalizeKolamDaraSeoDashboard,
  normalizeKolamDaraSeoPendingSuggestions,
  normalizeKolamDaraSeoStatus,
  normalizeKolamDaraSeoSuggestionDetail,
  paginateKolamDaraSeoSuggestions,
  resolveKolamDaraSeoAccess,
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
    expect(
      getKolamDaraSeoApprovalsFocusId('/campaign/dara-seo/approvals?id=abc'),
    ).toBe('abc');
  });

  it('formats score and sentiment labels', () => {
    expect(formatKolamDaraSeoScoreStatus(80)).toBe('Excellent');
    expect(formatKolamDaraSeoScoreStatus(55)).toBe('Cukup');
    expect(formatKolamDaraSeoScoreStatus(20)).toBe('Perlu Perbaikan');
    expect(formatKolamDaraSeoSentimentStatus(-2)).toBe('Negatif');
    expect(formatKolamDaraSeoSentimentStatus(20)).toBe('Positif');
    expect(formatKolamDaraSeoSentimentStatus(5)).toBe('Netral');
    expect(formatKolamDaraSeoSuggestionStatus('pending_approval')).toBe(
      'Menunggu approve',
    );
  });

  it('resolves access, workflow hint, filter, and detail normalize', () => {
    expect(
      resolveKolamDaraSeoAccess({roleKey: 'admin', permissions: []}),
    ).toEqual({canSee: true, canDraft: true, canApprove: true});
    expect(
      resolveKolamDaraSeoAccess({
        roleKey: 'staff',
        permissions: [{resource: 'ai-seo', actions: ['view', 'approve']}],
      }),
    ).toEqual({canSee: true, canDraft: false, canApprove: true});

    expect(
      formatKolamDaraSeoWorkflowHint('pending_approval', {
        hasPendingItems: true,
        canDraft: false,
        canApprove: true,
      }),
    ).toContain('Approve');

    const ready = {
      id: 's1',
      targetType: 'product' as const,
      entityId: 'p1',
      title: 'Filter',
      seoScore: 40,
      status: 'pending_approval',
      summary: '',
      pendingItemCount: 2,
      productId: 'p1',
      blogId: null,
      speciesId: null,
    };
    expect(isKolamDaraSeoReadyToApply(ready)).toBe(true);
    expect(
      filterKolamDaraSeoSuggestions([ready], {
        targetTab: 'product',
        statusFilter: 'ready',
        search: 'fil',
      }),
    ).toHaveLength(1);
    expect(
      paginateKolamDaraSeoSuggestions([ready, {...ready, id: 's2'}], 1, 1),
    ).toMatchObject({page: 1, totalPages: 2, total: 2});

    const detail = normalizeKolamDaraSeoSuggestionDetail({
      data: {
        suggestion: {
          _id: 's1',
          status: 'pending_approval',
          seoScore: 55,
          productId: {name: 'Filter', _id: 'p1'},
          pendingItemCount: 1,
        },
        items: [
          {
            _id: 'i1',
            label: 'Meta title',
            beforeValue: 'A',
            proposedValue: 'B',
            itemStatus: 'pending',
          },
        ],
      },
    });
    expect(detail?.suggestion.title).toBe('Filter');
    expect(detail?.items[0]?.label).toBe('Meta title');
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

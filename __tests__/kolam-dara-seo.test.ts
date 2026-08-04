import {
  buildKolamDaraSeoRoute,
  filterKolamDaraSeoSuggestions,
  formatKolamDaraSeoKeywordDifficulty,
  formatKolamDaraSeoKeywordVolume,
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
  normalizeKolamDaraSeoIntegrationSettings,
  normalizeKolamDaraSeoKeywords,
  normalizeKolamDaraSeoPendingSuggestions,
  normalizeKolamDaraSeoRankings,
  normalizeKolamDaraSeoSentimentRows,
  normalizeKolamDaraSeoSocialInsights,
  normalizeKolamDaraSeoStatus,
  normalizeKolamDaraSeoSuggestionDetail,
  normalizeKolamDaraSeoWebsitePreview,
  paginateKolamDaraSeoMentions,
  paginateKolamDaraSeoSuggestions,
  pickKolamDaraSeoLatestSocialSnapshot,
  resolveKolamDaraSeoAccess,
  resolveKolamDaraSeoKeywordDifficulty,
} from '../src/domain/kolam-dara-seo';

describe('kolam-dara-seo domain', () => {
  it('formats keyword volume and difficulty like FE', () => {
    expect(formatKolamDaraSeoKeywordVolume(60)).toBe(25200);
    expect(resolveKolamDaraSeoKeywordDifficulty(80)).toBe('low');
    expect(resolveKolamDaraSeoKeywordDifficulty(55)).toBe('medium');
    expect(resolveKolamDaraSeoKeywordDifficulty(20)).toBe('high');
    expect(formatKolamDaraSeoKeywordDifficulty(55)).toBe('Medium');
  });

  it('paginates mentions 10 per page', () => {
    const rows = Array.from({length: 12}, (_, i) => ({
      id: `m${i}`,
      entityName: `E${i}`,
      url: '',
      sourceName: '',
      sourceType: 'serp',
      engine: 'google',
      snippet: 's',
      mentionedAt: '',
    }));
    const page1 = paginateKolamDaraSeoMentions(rows, 1);
    expect(page1.items).toHaveLength(10);
    expect(page1.totalPages).toBe(2);
    expect(page1.total).toBe(12);
    expect(paginateKolamDaraSeoMentions(rows, 2).items).toHaveLength(2);
  });

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
    ).toEqual({
      canSee: true,
      canDraft: true,
      canApprove: true,
      canManageSettings: true,
    });
    expect(
      resolveKolamDaraSeoAccess({
        roleKey: 'staff',
        permissions: [{resource: 'ai-seo', actions: ['view', 'approve']}],
      }),
    ).toEqual({
      canSee: true,
      canDraft: false,
      canApprove: true,
      canManageSettings: false,
    });

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

  it('normalizes rankings, keywords, website preview, sentiment, integration settings, and social insights', () => {
    expect(
      normalizeKolamDaraSeoRankings({
        data: {
          total: 1,
          items: [
            {
              _id: 'r1',
              keyword: 'ikan koi',
              engine: 'google',
              position: 3,
              url: 'https://x.test',
              title: 'Ikan koi',
              snippet: 'Jual ikan koi',
              mentionedAt: '2026-01-01T00:00:00.000Z',
            },
          ],
        },
      }),
    ).toEqual({
      total: 1,
      items: [
        {
          id: 'r1',
          keyword: 'ikan koi',
          engine: 'google',
          position: 3,
          url: 'https://x.test',
          title: 'Ikan koi',
          snippet: 'Jual ikan koi',
          mentionedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });

    expect(
      normalizeKolamDaraSeoKeywords({
        data: {
          items: [
            {
              _id: 'k1',
              mainKeyword: 'pakan lele',
              keywordType: 'opportunity',
              opportunityScore: 60,
              productId: 'p1',
            },
          ],
        },
      }),
    ).toEqual([
      {
        id: 'k1',
        mainKeyword: 'pakan lele',
        keywordType: 'opportunity',
        opportunityScore: 60,
        productId: 'p1',
      },
    ]);

    expect(
      normalizeKolamDaraSeoWebsitePreview({
        data: {
          companyName: 'Dunia Anura',
          websiteSeo: {
            publicSiteUrl: 'https://duniaanura.test',
            metaTitle: 'Judul',
            metaDescription: 'Deskripsi',
            keywords: ['ikan', 'koi'],
            lastAuditedAt: '2026-01-01T00:00:00.000Z',
            lastSeoScore: 70,
          },
          audit: {
            seoScore: 75,
            issues: [{code: 'meta', message: 'Meta kosong', severity: 'low'}],
          },
        },
      }),
    ).toEqual({
      companyName: 'Dunia Anura',
      publicSiteUrl: 'https://duniaanura.test',
      metaTitle: 'Judul',
      metaDescription: 'Deskripsi',
      keywords: ['ikan', 'koi'],
      lastAuditedAt: '2026-01-01T00:00:00.000Z',
      lastSeoScore: 70,
      auditScore: 75,
      issues: [{code: 'meta', message: 'Meta kosong', severity: 'low'}],
    });

    expect(
      normalizeKolamDaraSeoSentimentRows({
        data: {
          items: [
            {
              _id: 's1',
              text: 'Produk bagus',
              sentiment: 'positive',
              sentimentScore: 20,
              analyzedBy: 'dara_rules',
              detectedAt: '2026-01-01T00:00:00.000Z',
            },
          ],
        },
      }),
    ).toEqual([
      {
        id: 's1',
        text: 'Produk bagus',
        sentiment: 'positive',
        sentimentScore: 20,
        analyzedBy: 'dara_rules',
        detectedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);

    const settings = normalizeKolamDaraSeoIntegrationSettings({
      data: {
        monitorKeywords: 'ikan, koi',
        serpApi: {enabled: true, configured: true, apiKeyMasked: '******ab'},
        duckduckgo: {enabled: false},
        searxng: {enabled: false, baseUrl: 'https://searx.test'},
        firecrawl: {enabled: false, baseUrl: 'https://api.firecrawl.dev'},
        searchConsole: {enabled: false, propertyUrl: '', clientEmail: ''},
        indexingApi: {enabled: false, clientEmail: ''},
      },
    });
    expect(settings).toMatchObject({
      monitorKeywords: 'ikan, koi',
      serpApi: {enabled: true, configured: true, apiKeyMasked: '******ab'},
      duckduckgo: {enabled: false},
    });

    const social = normalizeKolamDaraSeoSocialInsights({
      data: {
        rows: [
          {
            _id: 'sn1',
            platform: 'instagram',
            status: 'success',
            periodDays: 7,
            metrics: {followers: 1200, reach: 300},
            fetchedAt: '2026-01-01T00:00:00.000Z',
          },
          {
            _id: 'sn2',
            platform: 'instagram',
            status: 'pending',
            periodDays: 7,
          },
        ],
      },
    });
    expect(social.total).toBe(2);
    expect(
      pickKolamDaraSeoLatestSocialSnapshot(social.rows, 'instagram')?.id,
    ).toBe('sn1');
  });
});

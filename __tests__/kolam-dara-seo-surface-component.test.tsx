import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {KolamDaraSeoSurface} from '../src/components/kolam-dara-seo-surface';
import {useKolamAuthContext} from '../src/context/kolam-app-contexts';
import {
  fetchKolamDaraSeoActiveBrands,
  fetchKolamDaraSeoDashboard,
  fetchKolamDaraSeoKeywords,
  fetchKolamDaraSeoPendingSuggestions,
  fetchKolamDaraSeoRankings,
  fetchKolamDaraSeoStatus,
  fetchKolamDaraSeoSuggestion,
  fetchKolamDaraSeoSuggestions,
  fetchKolamDaraSeoWebsitePreview,
} from '../src/services/kolam-dara-seo-api';
import {startKolamDaraJob, fetchKolamDaraJobsList, fetchKolamDaraJob} from '../src/services/kolam-dara-jobs-api';

jest.mock('../src/context/kolam-app-contexts', () => ({
  useKolamAuthContext: jest.fn(),
}));

jest.mock('../src/services/kolam-dara-seo-api', () => ({
  fetchKolamDaraSeoStatus: jest.fn(),
  fetchKolamDaraSeoActiveBrands: jest.fn(),
  fetchKolamDaraSeoDashboard: jest.fn(),
  fetchKolamDaraSeoPendingSuggestions: jest.fn(),
  fetchKolamDaraSeoSuggestions: jest.fn(),
  fetchKolamDaraSeoSuggestion: jest.fn(),
  submitKolamDaraSeoSuggestion: jest.fn(),
  approveKolamDaraSeoSuggestion: jest.fn(),
  rejectKolamDaraSeoSuggestion: jest.fn(),
  deferKolamDaraSeoSuggestion: jest.fn(),
  rollbackKolamDaraSeoSuggestion: jest.fn(),
  bulkApproveKolamDaraSeoSuggestions: jest.fn(),
  bulkRejectKolamDaraSeoSuggestions: jest.fn(),
  fetchKolamDaraSeoRankings: jest.fn(),
  fetchKolamDaraSeoKeywords: jest.fn(),
  fetchKolamDaraSeoBrandMentions: jest.fn(),
  fetchKolamDaraSeoSerpKeyword: jest.fn(),
  ingestKolamDaraSeoCompetitor: jest.fn(),
  ingestKolamDaraSeoBacklink: jest.fn(),
  fetchKolamDaraSeoWebsitePreview: jest.fn(),
  updateKolamDaraSeoWebsite: jest.fn(),
  submitKolamDaraSeoGoogleIndexing: jest.fn(),
  fetchKolamDaraSeoAuditLogs: jest.fn(),
  fetchKolamDaraSeoSentiment: jest.fn(),
  ingestKolamDaraSeoSentiment: jest.fn(),
  deleteKolamDaraSeoSentiment: jest.fn(),
  fetchKolamDaraSeoSentimentLlmEnabled: jest.fn(),
  fetchKolamDaraSeoIntegrationSettings: jest.fn(),
  updateKolamDaraSeoIntegrationSettings: jest.fn(),
  testKolamDaraSeoIntegration: jest.fn(),
  previewKolamDaraSeoIntegrationReport: jest.fn(),
  fetchKolamDaraSeoSocialInsights: jest.fn(),
  syncKolamDaraSeoSocialInsights: jest.fn(),
}));

jest.mock('../src/services/kolam-dara-jobs-api', () => ({
  startKolamDaraJob: jest.fn(),
  fetchKolamDaraJobsList: jest.fn(),
  fetchKolamDaraJob: jest.fn(),
}));

const authMock = useKolamAuthContext as jest.MockedFunction<
  typeof useKolamAuthContext
>;
const statusMock = fetchKolamDaraSeoStatus as jest.MockedFunction<
  typeof fetchKolamDaraSeoStatus
>;
const brandsMock = fetchKolamDaraSeoActiveBrands as jest.MockedFunction<
  typeof fetchKolamDaraSeoActiveBrands
>;
const dashMock = fetchKolamDaraSeoDashboard as jest.MockedFunction<
  typeof fetchKolamDaraSeoDashboard
>;
const pendingMock = fetchKolamDaraSeoPendingSuggestions as jest.MockedFunction<
  typeof fetchKolamDaraSeoPendingSuggestions
>;
const suggestionsMock = fetchKolamDaraSeoSuggestions as jest.MockedFunction<
  typeof fetchKolamDaraSeoSuggestions
>;
const suggestionMock = fetchKolamDaraSeoSuggestion as jest.MockedFunction<
  typeof fetchKolamDaraSeoSuggestion
>;
const jobsListMock = fetchKolamDaraJobsList as jest.MockedFunction<
  typeof fetchKolamDaraJobsList
>;
const rankingsMock = fetchKolamDaraSeoRankings as jest.MockedFunction<
  typeof fetchKolamDaraSeoRankings
>;
const keywordsMock = fetchKolamDaraSeoKeywords as jest.MockedFunction<
  typeof fetchKolamDaraSeoKeywords
>;
const websitePreviewMock = fetchKolamDaraSeoWebsitePreview as jest.MockedFunction<
  typeof fetchKolamDaraSeoWebsitePreview
>;

describe('KolamDaraSeoSurface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authMock.mockReturnValue({
      authUser: {roleKey: 'admin'},
    } as ReturnType<typeof useKolamAuthContext>);
    statusMock.mockResolvedValue({seoEnabled: true});
    brandsMock.mockResolvedValue({brands: [], defaultBrandId: 'all'});
    jobsListMock.mockResolvedValue([]);
    rankingsMock.mockResolvedValue({items: [], total: 0});
    keywordsMock.mockResolvedValue([]);
    websitePreviewMock.mockResolvedValue({
      companyName: 'Dunia Anura',
      publicSiteUrl: 'https://duniaanura.test',
      metaTitle: '',
      metaDescription: '',
      keywords: [],
      lastAuditedAt: '',
      lastSeoScore: null,
      auditScore: null,
      issues: [],
    });
    dashMock.mockResolvedValue({
      seoScore: 70,
      searchVisibility: 50,
      brandReputationScore: 80,
      sentimentScore: 10,
      pendingApprovals: 1,
      appliedChanges: 2,
      negativeMentions: 0,
      growthBullets: [],
      needsOptimization: 3,
      keywordOpportunities: 4,
    });
    pendingMock.mockResolvedValue([
      {
        id: 's1',
        targetType: 'product',
        title: 'Filter',
        seoScore: 40,
        status: 'pending_approval',
        summary: 'Perbaiki title',
        pendingItemCount: 1,
      },
    ]);
    suggestionsMock.mockResolvedValue({
      total: 1,
      items: [
        {
          id: 's1',
          targetType: 'product',
          entityId: 'p1',
          title: 'Filter',
          seoScore: 40,
          status: 'pending_approval',
          summary: 'Perbaiki title',
          pendingItemCount: 1,
          productId: 'p1',
          blogId: null,
          speciesId: null,
        },
      ],
    });
    suggestionMock.mockResolvedValue({
      suggestion: {
        id: 's1',
        targetType: 'product',
        entityId: 'p1',
        title: 'Filter',
        seoScore: 40,
        status: 'pending_approval',
        summary: 'Perbaiki title',
        pendingItemCount: 1,
        productId: 'p1',
        blogId: null,
        speciesId: null,
      },
      items: [
        {
          id: 'i1',
          fieldPath: 'metaTitle',
          label: 'Meta title',
          beforeValue: 'A',
          proposedValue: 'B',
          itemStatus: 'pending',
          rationale: '',
        },
      ],
    });
  });

  it('renders dashboard KPIs from live API', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraSeoSurface route="/campaign/dara-seo" />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('SEO Score');
    expect(text).toContain('70');
    expect(text).toContain('Menunggu persetujuan');
    expect(text).toContain('Filter');
    expect(statusMock).toHaveBeenCalled();
    expect(dashMock).toHaveBeenCalled();
    expect(jobsListMock).toHaveBeenCalledWith({module: 'seo', hours: 48});
    expect(startKolamDaraJob).not.toHaveBeenCalled();
    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('shows SEO job progress strip for queued/running bulk jobs', async () => {
    jobsListMock.mockResolvedValue([
      {
        id: 'job-bulk-1',
        module: 'seo',
        jobType: 'seo.bulk_products',
        status: 'running',
        label: 'Audit bulk produk',
        progressCurrent: 4,
        progressTotal: 30,
        progressMessage: 'Produk 4/30',
        error: '',
        createdAt: '2026-08-04T00:00:00.000Z',
        finishedAt: '',
      },
    ]);

    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraSeoSurface route="/campaign/dara-seo" />,
      );
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Audit bulk produk');
    expect(text).toContain('Berjalan');
    expect(text).toContain('4/30');
    expect(text).toContain('13%');
    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('renders approvals list and opens detail', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraSeoSurface route="/campaign/dara-seo/approvals" />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    let text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Filter');
    expect(text).toContain('Review');
    expect(text).toContain('Terapkan terpilih');
    expect(suggestionsMock).toHaveBeenCalled();
    expect(dashMock).not.toHaveBeenCalled();

    const review = tree!.root.find(
      node =>
        typeof node.props?.label === 'string' && node.props.label === 'Review',
    );
    await ReactTestRenderer.act(async () => {
      review.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    text = JSON.stringify(tree!.toJSON());
    expect(suggestionMock).toHaveBeenCalledWith('s1');
    expect(text).toContain('Approve & terapkan');
    expect(text).toContain('Meta title');
    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('renders website SEO fields and audit action', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraSeoSurface route="/campaign/dara-seo/website" />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Skor audit');
    expect(text).toContain('Field homepage');
    expect(text).toContain('Audit + draft');
    expect(websitePreviewMock).toHaveBeenCalled();
    expect(dashMock).not.toHaveBeenCalled();
    expect(suggestionsMock).not.toHaveBeenCalled();
    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('renders rankings tab and loads rows from live API', async () => {
    rankingsMock.mockResolvedValue({
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
      total: 1,
    });

    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraSeoSurface route="/campaign/dara-seo/rankings" />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('ikan koi');
    expect(rankingsMock).toHaveBeenCalled();
    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('renders keywords as FE table columns with volume and difficulty', async () => {
    keywordsMock.mockResolvedValue([
      {
        id: 'k1',
        mainKeyword: 'pakan lele',
        keywordType: 'opportunity',
        opportunityScore: 60,
        productId: 'p1',
      },
    ]);

    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraSeoSurface route="/campaign/dara-seo/keywords" />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Keyword');
    expect(text).toContain('Volume');
    expect(text).toContain('Difficulty');
    expect(text).toContain('Trend');
    expect(text).toContain('Skor');
    expect(text).toContain('pakan lele');
    expect(text).toContain('25.200');
    expect(text).toContain('Medium');
    expect(keywordsMock).toHaveBeenCalled();
    expect(text).not.toContain('Refresh');
    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });
});

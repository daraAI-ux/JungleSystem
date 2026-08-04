import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {KolamDaraSeoSurface} from '../src/components/kolam-dara-seo-surface';
import {useKolamAuthContext} from '../src/context/kolam-app-contexts';
import {
  fetchKolamDaraSeoActiveBrands,
  fetchKolamDaraSeoDashboard,
  fetchKolamDaraSeoPendingSuggestions,
  fetchKolamDaraSeoStatus,
} from '../src/services/kolam-dara-seo-api';
import {startKolamDaraJob} from '../src/services/kolam-dara-jobs-api';

jest.mock('../src/context/kolam-app-contexts', () => ({
  useKolamAuthContext: jest.fn(),
}));

jest.mock('../src/services/kolam-dara-seo-api', () => ({
  fetchKolamDaraSeoStatus: jest.fn(),
  fetchKolamDaraSeoActiveBrands: jest.fn(),
  fetchKolamDaraSeoDashboard: jest.fn(),
  fetchKolamDaraSeoPendingSuggestions: jest.fn(),
}));

jest.mock('../src/services/kolam-dara-jobs-api', () => ({
  startKolamDaraJob: jest.fn(),
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

describe('KolamDaraSeoSurface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authMock.mockReturnValue({
      authUser: {roleKey: 'admin'},
    } as ReturnType<typeof useKolamAuthContext>);
    statusMock.mockResolvedValue({seoEnabled: true});
    brandsMock.mockResolvedValue({brands: [], defaultBrandId: 'all'});
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
    expect(startKolamDaraJob).not.toHaveBeenCalled();
  });

  it('shows module placeholder on non-dashboard SEO tabs', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraSeoSurface route="/campaign/dara-seo/approvals" />,
      );
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Belum tersedia');
    expect(dashMock).not.toHaveBeenCalled();
  });
});

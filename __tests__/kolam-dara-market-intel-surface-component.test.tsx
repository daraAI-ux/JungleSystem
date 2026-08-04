import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {KolamDaraMarketIntelSurface} from '../src/components/kolam-dara-market-intel-surface';
import {useKolamAuthContext} from '../src/context/kolam-app-contexts';
import {
  approveKolamDaraMarketIntelRecommendation,
  bulkApproveKolamDaraMarketIntelRecommendations,
  fetchKolamDaraMarketIntelActiveBrands,
  fetchKolamDaraMarketIntelCompetitorLinks,
  fetchKolamDaraMarketIntelDashboard,
  fetchKolamDaraMarketIntelRecommendations,
  fetchKolamDaraMarketIntelStatus,
  fetchKolamDaraMarketIntelStoreHealthProducts,
  rejectKolamDaraMarketIntelRecommendation,
} from '../src/services/kolam-dara-market-intel-api';
import {
  fetchKolamDaraJobsList,
  startKolamDaraJob,
} from '../src/services/kolam-dara-jobs-api';
import {getKolamProducts} from '../src/services/kolam-product-api';

jest.mock('../src/context/kolam-app-contexts', () => ({
  useKolamAuthContext: jest.fn(),
}));

jest.mock('../src/services/kolam-dara-market-intel-api', () => ({
  fetchKolamDaraMarketIntelStatus: jest.fn(),
  fetchKolamDaraMarketIntelActiveBrands: jest.fn(),
  fetchKolamDaraMarketIntelDashboard: jest.fn(),
  fetchKolamDaraMarketIntelRecommendations: jest.fn(),
  fetchKolamDaraMarketIntelRecommendation: jest.fn(),
  approveKolamDaraMarketIntelRecommendation: jest.fn(),
  rejectKolamDaraMarketIntelRecommendation: jest.fn(),
  bulkApproveKolamDaraMarketIntelRecommendations: jest.fn(),
  fetchKolamDaraMarketIntelCompetitorLinks: jest.fn(),
  fetchKolamDaraMarketIntelCompetitorBaseline: jest.fn(),
  saveKolamDaraMarketIntelCompetitorLink: jest.fn(),
  deleteKolamDaraMarketIntelCompetitorLink: jest.fn(),
  fetchKolamDaraMarketIntelCompetitorLinkPrice: jest.fn(),
  sendKolamDaraMarketIntelCompetitorReport: jest.fn(),
  fetchKolamDaraMarketIntelStoreHealthProducts: jest.fn(),
}));

jest.mock('../src/services/kolam-product-api', () => ({
  getKolamProducts: jest.fn(),
}));

jest.mock('../src/services/kolam-dara-jobs-api', () => ({
  startKolamDaraJob: jest.fn(),
  fetchKolamDaraJobsList: jest.fn(),
  fetchKolamDaraJob: jest.fn(),
}));

const authMock = useKolamAuthContext as jest.MockedFunction<
  typeof useKolamAuthContext
>;
const statusMock = fetchKolamDaraMarketIntelStatus as jest.MockedFunction<
  typeof fetchKolamDaraMarketIntelStatus
>;
const brandsMock = fetchKolamDaraMarketIntelActiveBrands as jest.MockedFunction<
  typeof fetchKolamDaraMarketIntelActiveBrands
>;
const dashMock = fetchKolamDaraMarketIntelDashboard as jest.MockedFunction<
  typeof fetchKolamDaraMarketIntelDashboard
>;
const recsMock = fetchKolamDaraMarketIntelRecommendations as jest.MockedFunction<
  typeof fetchKolamDaraMarketIntelRecommendations
>;
const linksMock = fetchKolamDaraMarketIntelCompetitorLinks as jest.MockedFunction<
  typeof fetchKolamDaraMarketIntelCompetitorLinks
>;
const storeHealthMock =
  fetchKolamDaraMarketIntelStoreHealthProducts as jest.MockedFunction<
    typeof fetchKolamDaraMarketIntelStoreHealthProducts
  >;
const productsMock = getKolamProducts as jest.MockedFunction<
  typeof getKolamProducts
>;
const jobsListMock = fetchKolamDaraJobsList as jest.MockedFunction<
  typeof fetchKolamDaraJobsList
>;

describe('KolamDaraMarketIntelSurface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authMock.mockReturnValue({
      authUser: {roleKey: 'admin'},
    } as ReturnType<typeof useKolamAuthContext>);
    statusMock.mockResolvedValue({
      enabled: true,
      canView: true,
      canViewMargin: true,
      canDraft: true,
      canApprove: true,
      disclaimer: '',
    });
    brandsMock.mockResolvedValue({
      brands: [
        {id: 'b1', name: 'Anura', productCount: 3, monitoringActive: true},
      ],
      defaultBrandId: 'all',
    });
    jobsListMock.mockResolvedValue([]);
    linksMock.mockResolvedValue([
      {
        id: 'l1',
        competitorName: 'Toko X',
        platform: 'tokopedia',
        listingUrl: 'https://tokopedia.test/x',
        websiteUrl: '',
        compareWith: 'marketplace',
        lastIngestedAt: '',
        lastFetchStatus: 'ok',
        lastFetchError: '',
        lastFetchedPrice: 120000,
        active: true,
        product: {id: 'p1', name: 'Filter', sku: 'F1'},
        latestSnapshotPrice: null,
        monitor: {
          ourPrice: 100000,
          hpp: 50000,
          minSafePrice: 90000,
          suggestedPrice: null,
          priceDelta: 20000,
          priceDeltaPct: 20,
        },
      },
    ]);
    productsMock.mockResolvedValue({
      data: [],
      pagination: {page: 1, limit: 250, total: 0, totalPages: 0},
    });
    storeHealthMock.mockResolvedValue({
      generatedAt: '2026-01-01',
      sellableOnly: true,
      formula: {
        storeScore: 'avg',
        productScore: 'weighted',
        complete: '100%',
      },
      summary: {
        total: 5,
        complete: 3,
        incomplete: 2,
        blockerProducts: 1,
        storeHealthScore: 68,
      },
      parameters: [
        {
          id: 'sku',
          label: 'SKU',
          level: 'blocker',
          sellableOnly: false,
          pass: 4,
          fail: 1,
          passRate: 80,
        },
      ],
      products: [
        {
          productId: 'p1',
          sku: 'A1',
          name: 'Filter',
          score: 55,
          blockers: 1,
          warnings: 0,
          issues: [{code: 'sku', message: 'SKU kosong', level: 'blocker'}],
          complete: false,
        },
      ],
    });
    dashMock.mockResolvedValue({
      pendingApprovals: 2,
      tooCheap: [
        {
          productId: 'p1',
          name: 'Produk A',
          sellPrice: 100000,
          idealPrice: 150000,
          marginPercent: 10,
          extraProfitPotential: 50000,
        },
      ],
      tooExpensive: [],
      lowMargin: [],
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
        extraProfitPotential: 1200000,
        purchaseSavingsPotential: 400000,
      },
      taxPolicy: {
        ppnRate: 11,
        pricesIncludeTax: true,
        source: 'regulation',
        taxDisclaimer: '',
      },
    });
    recsMock.mockResolvedValue({
      total: 1,
      items: [
        {
          id: 'r1',
          category: 'pricing',
          status: 'draft_ready',
          title: 'Naikkan harga Produk A',
          summary: 'Margin rendah',
          daraMessage: 'Usulan AI',
          product: {id: 'p1', name: 'Produk A', sku: 'A1'},
          species: null,
          vendor: null,
          metrics: {currentSellPrice: 100000, idealPrice: 150000},
          createdAt: '',
        },
      ],
    });
  });

  it('renders dashboard KPIs and panels from live API', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraMarketIntelSurface route="/campaign/dara-market-intel" />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Menunggu approval');
    expect(text).toContain('2');
    expect(text).toContain('Potensi profit tambahan');
    expect(text).toContain('Potensi hemat pembelian');
    expect(text).toContain('Terlalu murah');
    expect(text).toContain('Produk A');
    expect(text).toContain('Supplier terbaik / termurah');
    expect(text).toContain('Vendor X');
    expect(text).toContain('Scan 40 produk');
    expect(text).toContain('Scan channel');
    expect(dashMock).toHaveBeenCalled();
    expect(jobsListMock).toHaveBeenCalledWith({
      module: 'market-intel',
      hours: 48,
    });
    expect(startKolamDaraJob).not.toHaveBeenCalled();
    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('renders approvals list from recommendations API', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraMarketIntelSurface route="/campaign/dara-market-intel/approvals" />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Produk A');
    expect(text).toContain('Pricing');
    expect(text).toContain('Naikkan harga Produk A');
    expect(text).toContain('Review');
    expect(text).toContain('Setujui (0)');
    expect(recsMock).toHaveBeenCalledWith({
      status: 'draft_ready',
      limit: 100,
      brandId: 'all',
    });
    expect(dashMock).not.toHaveBeenCalled();
    expect(approveKolamDaraMarketIntelRecommendation).not.toHaveBeenCalled();
    expect(rejectKolamDaraMarketIntelRecommendation).not.toHaveBeenCalled();
    expect(bulkApproveKolamDaraMarketIntelRecommendations).not.toHaveBeenCalled();
    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('renders competitors list from links API', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraMarketIntelSurface route="/campaign/dara-market-intel/competitors" />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Toko X');
    expect(text).toContain('Daftar kompetitor');
    expect(text).toContain('+ Add kompetitor');
    expect(text).toContain('Laporkan DARA');
    expect(linksMock).toHaveBeenCalledWith({brandId: 'all', enriched: true});
    expect(dashMock).not.toHaveBeenCalled();
    expect(recsMock).not.toHaveBeenCalled();
    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('renders store-health idle state then scan results', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraMarketIntelSurface route="/campaign/dara-market-intel/kesehatan" />,
      );
      await Promise.resolve();
    });

    let text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Scan seluruh produk');
    expect(text).toContain('Hanya produk sellable');
    expect(text).toContain('Tekan scan');
    expect(storeHealthMock).not.toHaveBeenCalled();

    const scan = tree!.root.findAll(
      node =>
        typeof node.props?.onPress === 'function' &&
        String(node.props?.accessibilityLabel || '').includes(
          'Scan seluruh produk',
        ),
    )[0];
    expect(scan).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      scan.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    text = JSON.stringify(tree!.toJSON());
    expect(storeHealthMock).toHaveBeenCalledWith({sellableOnly: true});
    expect(text).toContain('Kesehatan toko');
    expect(text).toContain('Parameter kesehatan produk');
    expect(text).toContain('Filter');
    expect(text).toContain('Buka edit');
    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('shows placeholder on unimplemented tabs', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraMarketIntelSurface route="/campaign/dara-market-intel/peralatan" />,
      );
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Belum tersedia');
    expect(text).toContain('Peralatan');
    expect(dashMock).not.toHaveBeenCalled();
    expect(recsMock).not.toHaveBeenCalled();
    expect(linksMock).not.toHaveBeenCalled();
    expect(storeHealthMock).not.toHaveBeenCalled();
    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('denies access without market-intel permission', async () => {
    authMock.mockReturnValue({
      authUser: {roleKey: 'pos', permissions: []},
    } as ReturnType<typeof useKolamAuthContext>);

    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraMarketIntelSurface route="/campaign/dara-market-intel" />,
      );
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Akses ditolak');
    expect(dashMock).not.toHaveBeenCalled();
    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });
});

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {KolamDaraMarketIntelSurface} from '../src/components/kolam-dara-market-intel-surface';
import {useKolamAuthContext} from '../src/context/kolam-app-contexts';
import {
  fetchKolamDaraMarketIntelActiveBrands,
  fetchKolamDaraMarketIntelDashboard,
  fetchKolamDaraMarketIntelStatus,
} from '../src/services/kolam-dara-market-intel-api';
import {
  fetchKolamDaraJobsList,
  startKolamDaraJob,
} from '../src/services/kolam-dara-jobs-api';

jest.mock('../src/context/kolam-app-contexts', () => ({
  useKolamAuthContext: jest.fn(),
}));

jest.mock('../src/services/kolam-dara-market-intel-api', () => ({
  fetchKolamDaraMarketIntelStatus: jest.fn(),
  fetchKolamDaraMarketIntelActiveBrands: jest.fn(),
  fetchKolamDaraMarketIntelDashboard: jest.fn(),
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
      brands: [{id: 'b1', name: 'Anura', productCount: 3, monitoringActive: true}],
      defaultBrandId: 'all',
    });
    jobsListMock.mockResolvedValue([]);
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

  it('shows placeholder on non-dashboard tabs', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamDaraMarketIntelSurface route="/campaign/dara-market-intel/approvals" />,
      );
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Belum tersedia');
    expect(text).toContain('Persetujuan');
    expect(dashMock).not.toHaveBeenCalled();
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

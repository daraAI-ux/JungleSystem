import {catalogItems, recentSales} from '../src/data/seed';
import {appConfig} from '../src/config/app';
import {
  amSurfaces,
  filterPluginRegistry,
  getAmSurfaceById,
  getKolamSurfaceById,
  getPluginIntegrationStats,
  getPluginRouteIndex,
  getUnifiedOverviewMetrics,
  kolamSurfaces,
  pluginRegistry,
} from '../src/domain/unified';
import {
  getAmDeviceRows,
  getAmOperationRows,
  getKolamFinanceRows,
  getKolamWalletRows,
} from '../src/lib/unified-summary';
import {activeCashflowSession} from '../src/data/seed';

describe('unified application registry', () => {
  it('uses the live Dunia Anura application endpoints', () => {
    expect(appConfig.appName).toBe('JungleSystem');
    expect(appConfig.kolamWebUrl).toBe('https://kolam.dunia-anura.com');
    expect(appConfig.posWebUrl).toBe('https://pos.dunia-anura.com');
    expect(appConfig.amWebUrl).toBe('https://frogs.dunia-anura.com');
    expect(appConfig.apiBaseUrl).toBe('https://amfibi.dunia-anura.com/api');
  });

  it('covers the live Kolam and AM operating surfaces', () => {
    expect(kolamSurfaces.map(surface => surface.id)).toEqual([
      'inventory',
      'finance',
      'service',
      'projects',
      'storage',
    ]);
    expect(getKolamSurfaceById('finance')).toEqual(
      expect.objectContaining({
        label: 'Finance',
        route: 'finance / wallet / payable / receivable',
      }),
    );
    expect(getKolamSurfaceById('missing')).toBeNull();
    expect(amSurfaces.map(surface => surface.id)).toEqual([
      'dashboard',
      'tasks',
      'hardware',
      'marketplace',
      'operations',
    ]);
    expect(getAmSurfaceById('tasks')).toEqual(
      expect.objectContaining({
        label: 'Tasks',
        route: 'am-fe/(dashboard)/tasks / am-be/routes/task',
      }),
    );
    expect(getAmSurfaceById('missing')).toBeNull();
  });

  it('registers every DA plugin pulled from the server source tree', () => {
    expect(pluginRegistry).toHaveLength(9);
    expect(pluginRegistry.every(plugin => plugin.sourceRepo.startsWith('E:\\Projects\\DA-'))).toBe(true);
    expect(new Set(pluginRegistry.map(plugin => plugin.packageName)).size).toBe(9);
    expect(pluginRegistry.every(plugin => plugin.entryPoint === './dist/index.mjs')).toBe(true);
    expect(pluginRegistry.every(plugin => plugin.routes.length > 0)).toBe(true);
    expect(getPluginIntegrationStats()).toEqual({
      total: 9,
      ready: 8,
      versionMismatch: 1,
      routeCount: 64,
    });
    expect(pluginRegistry.find(plugin => plugin.id === 'dara')).toEqual(
      expect.objectContaining({
        packageVersion: '0.1.44',
        manifestVersion: '0.1.45',
        integrationStatus: 'version-mismatch',
      }),
    );
  });

  it('builds a searchable route index for the native Plugin Hub', () => {
    const routeIndex = getPluginRouteIndex();

    expect(routeIndex).toHaveLength(64);
    expect(routeIndex).toContainEqual(
      expect.objectContaining({
        pluginId: 'chat',
        pluginLabel: 'Chat',
        route: '/team-chat',
        integrationStatus: 'ready',
      }),
    );
    expect(routeIndex).toContainEqual(
      expect.objectContaining({
        pluginId: 'dara',
        route: '/campaign/dara-seo/approvals',
        integrationStatus: 'version-mismatch',
      }),
    );
  });

  it('filters plugins by route package capability and integration status', () => {
    expect(filterPluginRegistry(pluginRegistry, 'team-chat').map(plugin => plugin.id)).toEqual([
      'chat',
    ]);
    expect(filterPluginRegistry(pluginRegistry, 'voucher').map(plugin => plugin.id)).toEqual([
      'layanan',
    ]);
    expect(filterPluginRegistry(pluginRegistry, 'version-mismatch').map(plugin => plugin.id)).toEqual([
      'dara',
    ]);
    expect(filterPluginRegistry(pluginRegistry, '  ').length).toBe(pluginRegistry.length);
  });

  it('derives shared operational metrics from the POS dataset', () => {
    expect(getUnifiedOverviewMetrics({
      catalog: catalogItems,
      recentSales,
      activeSession: activeCashflowSession,
    })).toEqual({
      catalogCount: 4,
      lowStockCount: 0,
      salesCount: 2,
      salesValue: 633000,
      activeSession: true,
    });
  });

  it('summarizes live Kolam finance and wallet data for the native dashboard', () => {
    const kolam = {
      source: 'live' as const,
      dashboardRange: 'month' as const,
      salesGraph: [],
      pendingCustomerVerifications: [],
      dashboardSummary: [],
      dashboardLatest: null,
      dashboardCounts: null,
      dashboardActionRequired: null,
      errorMessage: undefined,
      financeSummary: {
        totalIncome: 1000000,
        totalExpense: 1250000,
        profitLoss: -250000,
        details: {
          sales: 1000000,
          unexpectedIncome: 0,
          shippingCollected: 0,
          purchaseOrder: 0,
          production: 0,
          routineExpense: 1250000,
          unexpectedExpense: 0,
          assetPurchase: 0,
          costOfSale: 0,
          commissionReleased: 0,
        },
        wallets: [
          {name: 'Cash', balance: 250000},
          {name: 'Bank', balance: 900000},
        ],
        transactions: [],
        filter: {startDate: null, endDate: null, range: 'month'},
      },
      saleCostSummary: {
        revenue: 1000000,
        totalHpp: 500000,
        totalCommissionAccrued: 50000,
        grossMargin: 450000,
        saleCount: 4,
        filter: {startDate: null, endDate: null, range: 'month'},
      },
    };

    const financeRows = getKolamFinanceRows(kolam);
    expect(financeRows).toHaveLength(6);
    expect(financeRows.find(row => row.label === 'Profit/Loss')?.tone).toBe('warning');
    expect(getKolamWalletRows(kolam).map(row => row.label)).toEqual([
      'Bank',
      'Cash',
    ]);
  });

  it('summarizes live AM dashboard operation and device data', () => {
    const am = {
      source: 'live' as const,
      errorMessage: undefined,
      dashboard: {
        summary: {
          totalBalance: 2000000,
          totalAccounts: 7,
          todayIncoming: {total: 300000, count: 3},
          todayOutgoing: {total: 100000, count: 1},
          activeDevices: 2,
        },
        transfers: {
          pending: 1,
          processing: 1,
          success: 5,
          failed: 0,
          totalAmount: 400000,
        },
        recentTransfers: [],
        recentMutasi: [],
        chartData: [],
        devices: [
          {
            _id: 'device-1',
            name: 'Rack A Phone',
            udid: 'udid-1',
            brand: 'Brand',
            model: 'Model',
            boxName: 'Box A',
            rackName: 'Rack A',
            accountCount: 3,
            activeAccountCount: 2,
            accountTypes: ['tokopedia'],
          },
        ],
      },
    };

    const operationRows = getAmOperationRows(am);
    expect(operationRows.find(row => row.label === 'Transfer pending')?.value).toBe('2');
    expect(operationRows.find(row => row.label === 'Transfer pending')?.tone).toBe('warning');
    expect(getAmDeviceRows(am)).toEqual([
      {
        label: 'Rack A Phone',
        value: '2/3 account',
        tone: 'warning',
      },
    ]);
  });
});


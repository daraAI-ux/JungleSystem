import {appConfig} from '../src/config/app';
import {getAmDashboard} from '../src/services/am-api';
import {
  getKolamDashboard,
  getKolamFinanceSummary,
} from '../src/services/kolam-api';
import {
  getUnifiedSyncMessage,
  loadUnifiedDataset,
} from '../src/services/unified-data';

const fetchMock = jest.fn();

describe('unified live data contracts', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
  });

  it('requests Kolam finance summary with the Kolam source header', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({
      totalIncome: 1000,
      totalExpense: 250,
      profitLoss: 750,
      details: {
        sales: 1000,
        unexpectedIncome: 0,
        shippingCollected: 0,
        purchaseOrder: 0,
        production: 0,
        routineExpense: 250,
        unexpectedExpense: 0,
        assetPurchase: 0,
        costOfSale: 0,
        commissionReleased: 0,
      },
      wallets: [],
      transactions: [],
      filter: {startDate: null, endDate: null, range: 'month'},
    }));

    await expect(getKolamFinanceSummary({range: 'month'})).resolves.toMatchObject({
      totalIncome: 1000,
      profitLoss: 750,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/finance-summary?range=month`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'x-source': appConfig.kolamSourceHeader,
        }),
      }),
    );
  });

  it('requests Kolam dashboard counts with the Kolam source header', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({
      data: {
        summary: [
          {
            range: 'today',
            metric: 'revenue',
            value: 125000,
            change: 5,
            data: [{timestamp: '2026-07-18T00:00:00.000Z', value: 125000}],
            bySource: {
              POS: {value: 125000, count: 1},
            },
          },
        ],
        salesGraph: {range: 'month', data: []},
        latest: {
          lowStockProducts: [],
          topSellingProducts: [],
          outOfStockProducts: [],
        },
        counts: {
          products: 8,
          rawProducts: 3,
          species: 4,
          services: 2,
        },
      },
    }));

    await expect(getKolamDashboard('month')).resolves.toMatchObject({
      counts: {
        products: 8,
        rawProducts: 3,
        species: 4,
        services: 2,
      },
      summary: [
        expect.objectContaining({
          range: 'today',
          metric: 'revenue',
          value: 125000,
        }),
      ],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/dashboard?range=month`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'x-source': appConfig.kolamSourceHeader,
        }),
      }),
    );
  });

  it('requests Kolam dashboard with the selected live SalesGraph range', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({
      data: {
        summary: [],
        salesGraph: {
          range: 'week',
          data: [{timestamp: '2026-07-18T00:00:00.000Z', value: 125000}],
        },
        latest: {
          lowStockProducts: [],
          topSellingProducts: [],
          outOfStockProducts: [],
        },
        counts: {
          products: 8,
          rawProducts: 3,
          species: 4,
          services: 2,
        },
      },
    }));

    await expect(getKolamDashboard('week')).resolves.toMatchObject({
      salesGraph: {
        range: 'week',
        data: [expect.objectContaining({value: 125000})],
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/dashboard?range=week`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'x-source': appConfig.kolamSourceHeader,
        }),
      }),
    );
  });

  it('unwraps the AM dashboard response envelope from a configured AM base URL', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({
      success: true,
      message: 'Dashboard stats fetched',
      data: {
        summary: {
          totalBalance: 900000,
          totalAccounts: 4,
          todayIncoming: {total: 125000, count: 2},
          todayOutgoing: {total: 50000, count: 1},
          activeDevices: 3,
        },
        transfers: {
          pending: 1,
          processing: 0,
          success: 2,
          failed: 0,
          totalAmount: 175000,
        },
        recentTransfers: [],
        recentMutasi: [],
        chartData: [],
        devices: [],
      },
    }));

    await expect(getAmDashboard('https://am.example.test/api')).resolves.toMatchObject({
      summary: {
        totalBalance: 900000,
        activeDevices: 3,
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://am.example.test/api/dashboard',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('keeps POS seed data and marks Kolam/AM fallback when live requests fail', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    const dataset = await loadUnifiedDataset({preferLiveApi: true});

    expect(dataset.source).toBe('seed');
    expect(dataset.sync).toEqual({
      pos: 'fallback',
      kolam: 'fallback',
      am: 'fallback',
    });
    expect(dataset.catalog).toHaveLength(4);
    expect(dataset.kolam.source).toBe('fallback');
    expect(dataset.kolam.errorMessage).toBe('network down');
    expect(dataset.am.source).toBe('fallback');
  });

  it('loads AM dashboard from a runtime existing AM server URL override', async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url === 'https://am.example.test/api/dashboard') {
        return Promise.resolve(jsonResponse({
          success: true,
          data: {
            summary: {
              totalBalance: 200000,
              totalAccounts: 2,
              todayIncoming: {total: 50000, count: 1},
              todayOutgoing: {total: 0, count: 0},
              activeDevices: 1,
            },
            transfers: {
              pending: 0,
              processing: 0,
              success: 1,
              failed: 0,
              totalAmount: 50000,
            },
            recentTransfers: [],
            recentMutasi: [],
            chartData: [],
            devices: [],
          },
        }));
      }

      return Promise.reject(new Error('offline for non-AM endpoint'));
    });

    const dataset = await loadUnifiedDataset({
      preferLiveApi: true,
      amApiBaseUrl: 'https://am.example.test/api/',
      enabledAreas: {
        pos: false,
        kolam: false,
        am: true,
      },
    });

    expect(dataset.source).toBe('seed');
    expect(dataset.sync).toEqual({
      pos: 'disabled',
      kolam: 'disabled',
      am: 'live',
    });
    expect(dataset.kolam.source).toBe('disabled');
    expect(dataset.am.source).toBe('live');
    expect(dataset.am.baseUrl).toBe('https://am.example.test/api');
    expect(dataset.am.dashboard?.summary.activeDevices).toBe(1);
    expect(getUnifiedSyncMessage(dataset)).toBe(
      'Sync: POS disabled, Kolam disabled, AM live.',
    );
    expect(fetchMock).toHaveBeenCalledWith(
      'https://am.example.test/api/dashboard',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('stores Kolam dashboard latest products from the existing server payload', async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url.startsWith(`${appConfig.kolamApiBaseUrl}/finance-summary?`)) {
        return Promise.resolve(jsonResponse({
          totalIncome: 1000,
          totalExpense: 250,
          profitLoss: 750,
          details: {
            sales: 1000,
            unexpectedIncome: 0,
            shippingCollected: 0,
            purchaseOrder: 0,
            production: 0,
            routineExpense: 250,
            unexpectedExpense: 0,
            assetPurchase: 0,
            costOfSale: 0,
            commissionReleased: 0,
          },
          wallets: [],
          transactions: [],
          filter: {startDate: null, endDate: null, range: 'month'},
        }));
      }

      if (url.startsWith(`${appConfig.kolamApiBaseUrl}/finance-summary/sale-cost?`)) {
        return Promise.resolve(jsonResponse({
          revenue: 1000,
          totalHpp: 400,
          totalCommissionAccrued: 0,
          grossMargin: 600,
          saleCount: 1,
          filter: {startDate: null, endDate: null, range: 'month'},
        }));
      }

      if (url === `${appConfig.kolamApiBaseUrl}/dashboard?range=month`) {
        return Promise.resolve(jsonResponse({
          data: {
            summary: [],
            salesGraph: {range: 'month', data: []},
            latest: {
              outOfStockProducts: [
                {_id: 'product-live-empty', name: 'Live Empty Stock', stock: 0},
              ],
              lowStockProducts: [
                {_id: 'product-live-low', name: 'Live Low Stock', stock: 2},
              ],
              topSellingProducts: [
                {
                  productId: 'product-live-top',
                  name: 'Live Top Product',
                  stock: 8,
                  totalSold: 11,
                  photo: null,
                },
              ],
            },
            counts: {
              products: 8,
              rawProducts: 3,
              species: 4,
              services: 2,
            },
          },
        }));
      }

      if (
        url ===
        `${appConfig.kolamApiBaseUrl}/subscriptions/my/pending-customer-verifications`
      ) {
        return Promise.resolve(jsonResponse({data: []}));
      }

      return Promise.reject(new Error(`Unexpected URL ${url}`));
    });

    const dataset = await loadUnifiedDataset({
      preferLiveApi: true,
      enabledAreas: {
        pos: false,
        kolam: true,
        am: false,
      },
    });

    expect(dataset.kolam.source).toBe('live');
    expect(dataset.kolam.dashboardLatest?.topSellingProducts[0]).toEqual(
      expect.objectContaining({
        productId: 'product-live-top',
        totalSold: 11,
      }),
    );
  });

  it('does not call live APIs for disabled access scope areas', async () => {
    const dataset = await loadUnifiedDataset({
      preferLiveApi: true,
      amApiBaseUrl: 'https://am.example.test/api',
      enabledAreas: {
        pos: false,
        kolam: false,
        am: false,
      },
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(dataset.source).toBe('seed');
    expect(dataset.sync).toEqual({
      pos: 'disabled',
      kolam: 'disabled',
      am: 'disabled',
    });
    expect(dataset.kolam).toMatchObject({
      source: 'disabled',
      errorMessage: 'Kolam live tidak dicoba karena sesi tidak punya akses Kolam.',
    });
    expect(dataset.am).toMatchObject({
      source: 'disabled',
      errorMessage:
        'AM live tidak dicoba karena sesi tidak punya akses AM atau URL server existing belum diset.',
    });
  });
});

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    text: jest.fn().mockResolvedValue(JSON.stringify(payload)),
  };
}

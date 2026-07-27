import {
  createInitialStockTransactionListFilters,
  isKolamStockTransactionListRoute,
  isKolamStockTransactionRoute,
  normalizeKolamStockTransactionList,
  stockTransactionSourceLabel,
} from '../src/domain/kolam-stock-transaction';

describe('Kolam stock transaction domain', () => {
  it('recognizes list and detail routes', () => {
    expect(isKolamStockTransactionRoute('/stock-transaction')).toBe(true);
    expect(
      isKolamStockTransactionRoute('/stock-transaction?productId=abc'),
    ).toBe(true);
    expect(isKolamStockTransactionRoute('/stock-transaction/tx-1')).toBe(true);
    expect(isKolamStockTransactionRoute('/stock-transaction/opname')).toBe(
      true,
    );
    expect(isKolamStockTransactionListRoute('/stock-transaction')).toBe(true);
    expect(
      isKolamStockTransactionListRoute('/stock-transaction?productId=abc'),
    ).toBe(true);
    expect(isKolamStockTransactionListRoute('/stock-transaction/tx-1')).toBe(
      false,
    );
    expect(isKolamStockTransactionRoute('/products')).toBe(false);
  });

  it('parses list filters from route query', () => {
    const filters = createInitialStockTransactionListFilters(
      '/stock-transaction?productId=p1&status=verified&startDate=2026-01-01&page=3&search=sku',
    );

    expect(filters).toEqual({
      search: 'sku',
      productId: 'p1',
      speciesId: '',
      stockOpnameId: '',
      status: 'verified',
      startDate: '2026-01-01',
      endDate: '',
      page: 3,
      limit: 10,
    });
  });

  it('normalizes list payload with pagination and computed display deltas', () => {
    const result = normalizeKolamStockTransactionList({
      success: true,
      data: [
        {
          _id: 'tx-1',
          type: 'out',
          source: 'sale',
          quantity: 2,
          before: 10,
          after: 8,
          status: 'verified',
          productId: {
            _id: 'prod-1',
            name: 'Produk A',
            sku: 'SKU-A',
          },
          computed: {
            displayBefore: 12,
            displayAfter: 9,
            displayDelta: -3,
          },
          marketplaceCrossSync: {
            summary: 'synced',
            originPlatform: 'shopee',
            sku: 'SKU-A',
          },
        },
      ],
      pagination: {
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      },
      pendingReturnExpectations: [
        {
          complaintId: 'c1',
          ticketCode: 'TK-1',
          quantity: 1,
          source: 'complaint-return',
          saleInvoiceCode: 'INV-1',
        },
      ],
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: 'tx-1',
      type: 'out',
      sourceLabel: 'Penjualan',
      before: 12,
      after: 9,
      delta: -3,
      statusLabel: 'Terverifikasi',
      target: {
        id: 'prod-1',
        label: 'Produk A',
        kind: 'product',
        sku: 'SKU-A',
        href: '/products/prod-1',
      },
      crossSync: {
        summary: 'synced',
        originPlatform: 'shopee',
        sku: 'SKU-A',
        targetStock: null,
        targets: [],
      },
    });
    expect(result.pagination).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
    });
    expect(result.pendingReturnExpectations).toEqual([
      {
        complaintId: 'c1',
        ticketCode: 'TK-1',
        quantity: 1,
        source: 'complaint-return',
        saleInvoiceCode: 'INV-1',
      },
    ]);
  });

  it('maps known stock source labels', () => {
    expect(stockTransactionSourceLabel('stock-opname')).toBe('Stok opname');
    expect(stockTransactionSourceLabel('custom_project')).toBe('Proyek kustom');
    expect(stockTransactionSourceLabel('unknown_source')).toBe('unknown source');
  });
});

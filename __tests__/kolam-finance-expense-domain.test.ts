import {
  buildCommissionListRoute,
  createInitialCommissionListFilters,
  getKolamCommissionSurfaceMode,
  isKolamCommissionListRoute,
  isKolamCommissionRoute,
  normalizeKolamCommissionList,
} from '../src/domain/kolam-commission';
import {
  buildFinanceExpenseListRoute,
  createInitialFinanceExpenseListFilters,
  getKolamFinanceExpenseKindFromRoute,
  getKolamFinanceExpenseSurfaceMode,
  isKolamAssetPurchaseRoute,
  isKolamFinanceExpenseListRoute,
  isKolamFinanceExpenseRoute,
  isKolamRoutineExpenseRoute,
  isKolamUnexpectedExpenseRoute,
  isKolamUnexpectedIncomeRoute,
  normalizeKolamFinanceExpenseList,
} from '../src/domain/kolam-finance-expense';

describe('Kolam finance expense domain', () => {
  it('recognizes expense/income list routes', () => {
    expect(isKolamRoutineExpenseRoute('/routine-expenses')).toBe(true);
    expect(isKolamRoutineExpenseRoute('/routine-expenses/create')).toBe(true);
    expect(isKolamUnexpectedExpenseRoute('/unexpected-expense')).toBe(true);
    expect(isKolamUnexpectedIncomeRoute('/unexpected-income')).toBe(true);
    expect(isKolamAssetPurchaseRoute('/asset-purchase')).toBe(true);
    expect(isKolamFinanceExpenseRoute('/stock-transaction')).toBe(false);

    expect(isKolamFinanceExpenseListRoute('/routine-expenses')).toBe(true);
    expect(isKolamFinanceExpenseListRoute('/routine-expenses/abc')).toBe(false);
    expect(getKolamFinanceExpenseSurfaceMode('/unexpected-expense')).toBe('list');
    expect(getKolamFinanceExpenseSurfaceMode('/unexpected-expense/x/edit')).toBe(
      'unsupported',
    );
  });

  it('maps route to expense kind', () => {
    expect(getKolamFinanceExpenseKindFromRoute('/routine-expenses')).toBe(
      'routine-expense',
    );
    expect(getKolamFinanceExpenseKindFromRoute('/unexpected-expense')).toBe(
      'unexpected-expense',
    );
    expect(getKolamFinanceExpenseKindFromRoute('/unexpected-income')).toBe(
      'unexpected-income',
    );
    expect(getKolamFinanceExpenseKindFromRoute('/asset-purchase')).toBe(
      'asset-purchase',
    );
    expect(getKolamFinanceExpenseKindFromRoute('/finance')).toBeNull();
  });

  it('parses list filters from route query', () => {
    expect(
      createInitialFinanceExpenseListFilters(
        '/routine-expenses?search=gaji&status=verified&page=2&limit=20',
      ),
    ).toEqual({
      search: 'gaji',
      status: 'verified',
      period: 'all',
      startDate: '',
      endDate: '',
      locationId: '',
      page: 2,
      limit: 20,
    });
  });

  it('parses asset-purchase period and location filters', () => {
    expect(
      createInitialFinanceExpenseListFilters(
        '/asset-purchase?period=custom&startDate=2026-01-01&endDate=2026-01-31&locationId=loc1&status=unverified',
      ),
    ).toEqual({
      search: '',
      status: 'unverified',
      period: 'custom',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      locationId: 'loc1',
      page: 1,
      limit: 10,
    });
  });

  it('builds list route with filters', () => {
    expect(
      buildFinanceExpenseListRoute('unexpected-expense', {
        search: 'listrik',
        status: 'unverified',
        period: 'all',
        startDate: '',
        endDate: '',
        locationId: '',
        page: 3,
        limit: 10,
      }),
    ).toBe('/unexpected-expense?search=listrik&status=unverified&page=3');
  });

  it('builds asset-purchase list route with period and location', () => {
    expect(
      buildFinanceExpenseListRoute('asset-purchase', {
        search: '',
        status: 'all',
        period: 'monthly',
        startDate: '',
        endDate: '',
        locationId: 'abc',
        page: 1,
        limit: 10,
      }),
    ).toBe('/asset-purchase?period=monthly&locationId=abc');
  });

  it('normalizes routine expense list payload', () => {
    const result = normalizeKolamFinanceExpenseList(
      {
        data: [
          {
            _id: 're-1',
            code: 'REXP-001',
            name: 'Gaji',
            category: 'salary_payment',
            amount: 5000000,
            wallet: { _id: 'w1', name: 'Kas' },
            executedAt: '2026-07-01T00:00:00.000Z',
            status: 'unverified',
            createdBy: { first_name: 'Ada', last_name: 'Lovelace' },
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        totals: { totalAmount: 5000000, totalCount: 1 },
      },
      'routine-expense',
    );

    expect(result.data[0]).toMatchObject({
      id: 're-1',
      code: 'REXP-001',
      name: 'Gaji',
      categoryLabel: 'Bayar Gaji',
      amount: 5000000,
      walletLabel: 'Kas',
      status: 'unverified',
      createdByLabel: 'Ada Lovelace',
    });
    expect(result.totals).toEqual({ totalAmount: 5000000, totalCount: 1 });
  });

  it('normalizes asset-purchase list row with price shipping and book value', () => {
    const result = normalizeKolamFinanceExpenseList(
      {
        data: [
          {
            _id: 'ap-1',
            code: 'APUR-001',
            name: 'Laptop',
            price: 10000000,
            shippingCost: 50000,
            total: 10050000,
            location: { name: 'Gudang A' },
            wallet: { name: 'Utama' },
            status: 'verified',
            reason: 'Ops',
            asset: { currentBookValue: 9000000 },
            executedAt: '2026-07-01T00:00:00.000Z',
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
      'asset-purchase',
    );

    expect(result.data[0]).toMatchObject({
      id: 'ap-1',
      price: 10000000,
      shippingCost: 50000,
      total: 10050000,
      locationLabel: 'Gudang A',
      bookValue: 9000000,
      reason: 'Ops',
    });
  });
});

describe('Kolam commission domain', () => {
  it('recognizes commission list route', () => {
    expect(isKolamCommissionRoute('/commissions')).toBe(true);
    expect(isKolamCommissionListRoute('/commissions')).toBe(true);
    expect(isKolamCommissionRoute('/commission')).toBe(false);
    expect(getKolamCommissionSurfaceMode('/commissions/detail')).toBe('unsupported');
  });

  it('parses commission filters and builds route', () => {
    expect(
      createInitialCommissionListFilters('/commissions?status=accrued&page=2'),
    ).toEqual({
      search: '',
      status: 'accrued',
      page: 2,
      limit: 20,
    });

    expect(
      buildCommissionListRoute({
        search: 'INV',
        status: 'released',
        page: 1,
        limit: 20,
      }),
    ).toBe('/commissions?search=INV&status=released');
  });

  it('normalizes commission list row release eligibility', () => {
    const result = normalizeKolamCommissionList({
      data: [
        {
          _id: 'c1',
          status: 'accrued',
          itemType: 'product',
          sale: { _id: 's1', invoiceCode: 'INV-1', status: 'paid' },
          product: { name: 'Produk A', sku: 'SKU-A' },
          recipientUser: { name: 'Budi' },
          commissionType: 'percentage',
          commissionValue: 5,
          commissionAmount: 50000,
          quantity: 1,
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });

    expect(result.data[0]).toMatchObject({
      id: 'c1',
      invoiceLabel: 'INV-1',
      recipientLabel: 'Budi',
      itemLabel: 'Produk A',
      itemSku: 'SKU-A',
      canRelease: true,
    });
  });
});

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
  buildKolamAssetPurchaseCreatePayload,
  buildKolamAssetPurchaseDetailRoute,
  buildKolamAssetPurchaseHistoryItems,
  buildKolamUnexpectedIncomeCreatePayload,
  buildKolamUnexpectedIncomeHistoryItems,
  buildKolamUnexpectedExpenseCreatePayload,
  buildKolamUnexpectedExpenseHistoryItems,
  buildKolamRoutineExpenseCreatePayload,
  createEmptyKolamAssetPurchaseForm,
  createEmptyKolamUnexpectedIncomeForm,
  createEmptyKolamUnexpectedExpenseForm,
  createEmptyKolamRoutineExpenseForm,
  createInitialFinanceExpenseListFilters,
  createKolamAssetPurchaseFormFromDetail,
  createKolamUnexpectedIncomeFormFromDetail,
  createKolamUnexpectedExpenseFormFromDetail,
  getAssetPurchaseFormTotal,
  getKolamAssetPurchaseDetailTab,
  getKolamAssetPurchaseEditRoute,
  getKolamAssetPurchaseIdFromRoute,
  getKolamAssetPurchaseSurfaceMode,
  getKolamFinanceExpenseKindFromRoute,
  getKolamFinanceExpenseSurfaceMode,
  getKolamUnexpectedIncomeCreateRoute,
  getKolamUnexpectedIncomeEditRoute,
  getKolamUnexpectedIncomeIdFromRoute,
  getKolamUnexpectedIncomeSurfaceMode,
  getKolamUnexpectedExpenseCreateRoute,
  getKolamUnexpectedExpenseEditRoute,
  getKolamUnexpectedExpenseIdFromRoute,
  getKolamUnexpectedExpenseSurfaceMode,
  getKolamRoutineExpenseCreateRoute,
  getKolamRoutineExpenseSurfaceMode,
  isKolamAssetPurchaseRoute,
  isKolamFinanceExpenseListRoute,
  isKolamFinanceExpenseRoute,
  isKolamRoutineExpenseRoute,
  isKolamUnexpectedExpenseRoute,
  isKolamUnexpectedIncomeRoute,
  normalizeKolamAssetPurchaseDetail,
  normalizeKolamFinanceExpenseList,
  normalizeKolamUnexpectedIncomeDetail,
  normalizeKolamUnexpectedExpenseDetail,
  normalizeKolamRoutineExpenseCreateResult,
  validateKolamAssetPurchaseForm,
  validateKolamUnexpectedIncomeForm,
  validateKolamUnexpectedExpenseForm,
  validateKolamRoutineExpenseForm,
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

  it('normalizes asset-purchase list row with wallet id and createdAt', () => {
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
            wallet: { _id: 'w1', name: 'Utama' },
            status: 'verified',
            reason: 'Ops',
            asset: { currentBookValue: 9000000 },
            executedAt: '2026-07-01T00:00:00.000Z',
            createdAt: '2026-07-01T00:00:00.000Z',
            createdBy: {
              first_name: 'Budi',
              last_name: 'Santoso',
              email: 'budi@example.com',
              hr: { photo: '/media/users/budi.jpg' },
            },
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
      'asset-purchase',
    );

    expect(result.data[0]).toMatchObject({
      id: 'ap-1',
      walletId: 'w1',
      walletLabel: 'Utama',
      bookValue: 9000000,
      createdAt: '2026-07-01T00:00:00.000Z',
      createdByLabel: 'Budi Santoso',
      createdByPhoto: '/media/users/budi.jpg',
    });
    expect(result.data[0].createdAtLabel).toBeTruthy();
  });

  it('maps asset-purchase create and edit surface modes', () => {
    expect(getKolamAssetPurchaseSurfaceMode('/asset-purchase')).toBe('list');
    expect(getKolamAssetPurchaseSurfaceMode('/asset-purchase/create')).toBe(
      'create',
    );
    expect(getKolamAssetPurchaseSurfaceMode('/asset-purchase/ap-1/edit')).toBe(
      'edit',
    );
    expect(getKolamAssetPurchaseSurfaceMode('/asset-purchase/ap-1')).toBe(
      'detail',
    );
    expect(getKolamAssetPurchaseIdFromRoute('/asset-purchase/ap-1/edit')).toBe(
      'ap-1',
    );
    expect(getKolamAssetPurchaseEditRoute('ap-1')).toBe(
      '/asset-purchase/ap-1/edit',
    );
  });

  it('builds create payload and validates form', () => {
    const form = {
      ...createEmptyKolamAssetPurchaseForm('2026-07-01'),
      name: ' Laptop ',
      priceText: '10000000',
      shippingCostText: '50000',
      walletId: 'w1',
      locationId: 'loc1',
      series: ' SN-1 ',
      customFieldValues: [
        { label: 'RAM', value: '16GB' },
        { label: '  ', value: 'ignored' },
      ],
      reason: ' Ops ',
    };
    expect(getAssetPurchaseFormTotal(form)).toBe(10050000);
    expect(validateKolamAssetPurchaseForm(form, 'create')).toBeNull();
    expect(buildKolamAssetPurchaseCreatePayload(form)).toMatchObject({
      name: 'Laptop',
      price: 10000000,
      shippingCost: 50000,
      total: 10050000,
      wallet: 'w1',
      location: 'loc1',
      series: 'SN-1',
      customFieldValues: [{ label: 'RAM', value: '16GB' }],
      reason: 'Ops',
    });
    expect(
      validateKolamAssetPurchaseForm(
        { ...form, name: '', priceText: '0' },
        'create',
      ),
    ).toBe('Masukkan nama aset');
  });

  it('normalizes asset-purchase detail for edit form', () => {
    const detail = normalizeKolamAssetPurchaseDetail({
      data: {
        _id: 'ap-1',
        code: 'APUR-001',
        name: 'Laptop',
        series: 'SN-1',
        photos: ['/uploads/a.jpg'],
        customFieldValues: [{ label: 'RAM', value: '16GB' }],
        price: 10000000,
        shippingCost: 50000,
        total: 10050000,
        wallet: { _id: 'w1', name: 'Kas' },
        location: { _id: 'loc1', name: 'Gudang', type: 'warehouse' },
        executedAt: '2026-07-01T12:00:00.000Z',
        createdAt: '2026-07-01T10:00:00.000Z',
        updatedAt: '2026-07-02T10:00:00.000Z',
        reason: 'Ops',
        status: 'unverified',
        asset: null,
      },
    });
    expect(detail).toMatchObject({
      id: 'ap-1',
      walletId: 'w1',
      locationId: 'loc1',
      locationType: 'warehouse',
      photos: ['/uploads/a.jpg'],
      hasLinkedAsset: false,
      linkedAssetId: '',
    });
    expect(createKolamAssetPurchaseFormFromDetail(detail)).toMatchObject({
      name: 'Laptop',
      priceText: '10000000',
      shippingCostText: '50000',
      walletId: 'w1',
      locationId: 'loc1',
      executedAt: '2026-07-01',
    });
  });

  it('parses detail tab query and builds history items', () => {
    expect(
      getKolamAssetPurchaseDetailTab('/asset-purchase/ap-1?tab=pricing'),
    ).toBe('pricing');
    expect(
      getKolamAssetPurchaseDetailTab('/asset-purchase/ap-1?tab=depreciation'),
    ).toBe('depreciation');
    expect(
      getKolamAssetPurchaseDetailTab('/asset-purchase/ap-1?tab=history'),
    ).toBe('details');
    expect(buildKolamAssetPurchaseDetailRoute('ap-1', 'pricing')).toBe(
      '/asset-purchase/ap-1?tab=pricing',
    );

    const detail = normalizeKolamAssetPurchaseDetail({
      _id: 'ap-1',
      name: 'Laptop',
      total: 10050000,
      reason: 'Ops long enough',
      createdAt: '2026-07-01T10:00:00.000Z',
      updatedAt: '2026-07-02T10:00:00.000Z',
      asset: { _id: 'asset-1' },
    });
    expect(detail.hasLinkedAsset).toBe(true);
    expect(detail.linkedAssetId).toBe('asset-1');
    const history = buildKolamAssetPurchaseHistoryItems(detail);
    expect(history[0]?.title).toBe('Pembelian Diperbarui');
    expect(history[1]?.title).toBe('Pembelian Aset Dibuat');
    expect(history[1]?.lines[0]).toContain('Laptop');
  });
  it('maps unexpected-income create, detail, and edit surface modes', () => {
    expect(getKolamUnexpectedIncomeSurfaceMode('/unexpected-income')).toBe(
      'list',
    );
    expect(
      getKolamUnexpectedIncomeSurfaceMode('/unexpected-income/create'),
    ).toBe('create');
    expect(
      getKolamUnexpectedIncomeSurfaceMode('/unexpected-income/abc'),
    ).toBe('detail');
    expect(
      getKolamUnexpectedIncomeSurfaceMode('/unexpected-income/abc/edit'),
    ).toBe('edit');
    expect(getKolamUnexpectedIncomeIdFromRoute('/unexpected-income/abc')).toBe(
      'abc',
    );
    expect(
      getKolamUnexpectedIncomeIdFromRoute('/unexpected-income/abc/edit'),
    ).toBe('abc');
    expect(getKolamUnexpectedIncomeCreateRoute()).toBe(
      '/unexpected-income/create',
    );
    expect(getKolamUnexpectedIncomeEditRoute('abc')).toBe(
      '/unexpected-income/abc/edit',
    );
  });

  it('builds unexpected-income create payload and validates form', () => {
    const form = createEmptyKolamUnexpectedIncomeForm('2026-08-05');
    expect(validateKolamUnexpectedIncomeForm(form)).toBe(
      'Masukkan nama pemasukan',
    );
    form.name = 'Refund vendor';
    form.amountText = '150000';
    form.walletId = 'w1';
    form.reason = 'Diskon';
    expect(validateKolamUnexpectedIncomeForm(form)).toBeNull();
    expect(buildKolamUnexpectedIncomeCreatePayload(form)).toMatchObject({
      name: 'Refund vendor',
      amount: 150000,
      wallet: 'w1',
      reason: 'Diskon',
    });
  });

  it('normalizes unexpected-income detail for edit form', () => {
    const detail = normalizeKolamUnexpectedIncomeDetail({
      data: {
        _id: 'inc1',
        code: 'UINC-01',
        name: 'Kasbon Ali',
        amount: 50000,
        status: 'unverified',
        wallet: { _id: 'w1', name: 'Kas' },
        executedAt: '2026-08-01T00:00:00.000Z',
        reason: 'Kasbon',
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-08-02T00:00:00.000Z',
      },
    });
    expect(detail.id).toBe('inc1');
    expect(detail.walletLabel).toBe('Kas');
    const form = createKolamUnexpectedIncomeFormFromDetail(detail);
    expect(form.name).toBe('Kasbon Ali');
    expect(form.amountText).toBe('50000');
    expect(form.walletId).toBe('w1');
    expect(buildKolamUnexpectedIncomeHistoryItems(detail)[0]?.title).toBe(
      'Pemasukan Diperbarui',
    );
  });

  it('maps unexpected-expense create, detail, and edit surface modes', () => {
    expect(getKolamUnexpectedExpenseSurfaceMode('/unexpected-expense')).toBe(
      'list',
    );
    expect(
      getKolamUnexpectedExpenseSurfaceMode('/unexpected-expense/create'),
    ).toBe('create');
    expect(
      getKolamUnexpectedExpenseSurfaceMode('/unexpected-expense/abc'),
    ).toBe('detail');
    expect(
      getKolamUnexpectedExpenseSurfaceMode('/unexpected-expense/abc/edit'),
    ).toBe('edit');
    expect(
      getKolamUnexpectedExpenseIdFromRoute('/unexpected-expense/abc'),
    ).toBe('abc');
    expect(
      getKolamUnexpectedExpenseIdFromRoute('/unexpected-expense/abc/edit'),
    ).toBe('abc');
    expect(getKolamUnexpectedExpenseCreateRoute()).toBe(
      '/unexpected-expense/create',
    );
    expect(getKolamUnexpectedExpenseEditRoute('abc')).toBe(
      '/unexpected-expense/abc/edit',
    );
  });

  it('builds unexpected-expense create payload and validates form', () => {
    const form = createEmptyKolamUnexpectedExpenseForm('2026-08-05');
    expect(validateKolamUnexpectedExpenseForm(form)).toBe(
      'Masukkan jumlah yang valid',
    );
    form.amountText = '75000';
    form.walletId = 'w1';
    form.reason = 'Belanja darurat';
    expect(validateKolamUnexpectedExpenseForm(form)).toBeNull();
    expect(buildKolamUnexpectedExpenseCreatePayload(form)).toMatchObject({
      name: 'UEXP',
      amount: 75000,
      wallet: 'w1',
      reason: 'Belanja darurat',
    });
  });

  it('normalizes unexpected-expense detail for edit form', () => {
    const detail = normalizeKolamUnexpectedExpenseDetail({
      data: {
        _id: 'exp1',
        code: 'UEXP-01',
        name: 'Biaya tak terduga',
        amount: 75000,
        status: 'unverified',
        wallet: { _id: 'w1', name: 'Kas' },
        executedAt: '2026-08-01T00:00:00.000Z',
        reason: 'Darurat',
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-08-02T00:00:00.000Z',
      },
    });
    expect(detail.id).toBe('exp1');
    expect(detail.walletLabel).toBe('Kas');
    const form = createKolamUnexpectedExpenseFormFromDetail(detail);
    expect(form.name).toBe('Biaya tak terduga');
    expect(form.amountText).toBe('75000');
    expect(form.walletId).toBe('w1');
    expect(buildKolamUnexpectedExpenseHistoryItems(detail)[0]?.title).toBe(
      'Pengeluaran Diperbarui',
    );
  });

  it('maps routine-expense list and create surface modes', () => {
    expect(getKolamRoutineExpenseSurfaceMode('/routine-expenses')).toBe('list');
    expect(getKolamRoutineExpenseSurfaceMode('/routine-expenses/create')).toBe(
      'create',
    );
    expect(
      getKolamRoutineExpenseSurfaceMode('/routine-expenses/pos-rutin'),
    ).toBe('unsupported');
    expect(getKolamRoutineExpenseCreateRoute()).toBe(
      '/routine-expenses/create',
    );
  });

  it('builds routine-expense create payload and validates form', () => {
    const form = createEmptyKolamRoutineExpenseForm('2026-08-05');
    expect(validateKolamRoutineExpenseForm(form)).toBe(
      'Masukkan nama pengeluaran',
    );
    form.name = 'Gaji Karyawan';
    expect(validateKolamRoutineExpenseForm(form)).toBe(
      'Masukkan jumlah yang valid',
    );
    form.amountText = '2500000';
    form.walletId = 'w1';
    form.note = 'Juli 2026';
    expect(validateKolamRoutineExpenseForm(form)).toBeNull();
    expect(buildKolamRoutineExpenseCreatePayload(form)).toMatchObject({
      name: 'Gaji Karyawan',
      amount: 2500000,
      wallet: 'w1',
      note: 'Juli 2026',
    });
    expect(
      normalizeKolamRoutineExpenseCreateResult({
        data: { _id: 're1', name: 'Gaji Karyawan' },
      }),
    ).toEqual({ id: 're1' });
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
      recipientUser: '',
      search: '',
      status: 'accrued',
      page: 2,
      limit: 20,
    });

    expect(
      buildCommissionListRoute({
        recipientUser: 'user-1',
        search: 'INV',
        status: 'released',
        page: 1,
        limit: 20,
      }),
    ).toBe('/commissions?search=INV&recipientUser=user-1&status=released');
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

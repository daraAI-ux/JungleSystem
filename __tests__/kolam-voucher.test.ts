import {
  buildKolamVoucherDetailRoute,
  buildKolamVoucherEditRoute,
  createEmptyKolamVoucherFormState,
  createKolamVoucherFormState,
  createKolamVoucherSavePayload,
  formatKolamVoucherDiscountLabel,
  formatKolamVoucherUsageLabel,
  getKolamVoucherIdFromRoute,
  getKolamVoucherRouteMode,
  hasKolamVoucherPermission,
  isKolamVoucherRoute,
  kolamVoucherFormDateToApiIso,
  normalizeKolamVoucher,
  normalizeKolamVoucherList,
  normalizeKolamVoucherRedemptionList,
  validateKolamVoucherForm,
} from '../src/domain/kolam-voucher';
import { getKolamTableColumns } from '../src/domain/kolam-table';
import { getKolamNavigationItemByRoute } from '../src/domain/kolam-navigation';

describe('kolam-voucher domain', () => {
  it('parses voucher routes', () => {
    expect(isKolamVoucherRoute('/vouchers')).toBe(true);
    expect(isKolamVoucherRoute('/vouchers/create')).toBe(true);
    expect(isKolamVoucherRoute('/vouchers/abc')).toBe(true);
    expect(isKolamVoucherRoute('/vouchers/abc/edit')).toBe(true);
    expect(isKolamVoucherRoute('/campaign')).toBe(false);
    expect(isKolamVoucherRoute('/sales')).toBe(false);

    expect(getKolamVoucherRouteMode('/vouchers')).toBe('list');
    expect(getKolamVoucherRouteMode('/vouchers/create')).toBe('new');
    expect(getKolamVoucherRouteMode('/vouchers/abc')).toBe('detail');
    expect(getKolamVoucherRouteMode('/vouchers/abc/edit')).toBe('edit');
    expect(getKolamVoucherIdFromRoute('/vouchers/abc/edit')).toBe('abc');
    expect(getKolamVoucherIdFromRoute('/vouchers/create')).toBe(null);
    expect(buildKolamVoucherDetailRoute('x1')).toBe('/vouchers/x1');
    expect(buildKolamVoucherEditRoute('x1')).toBe('/vouchers/x1/edit');
  });

  it('resolves sidebar nav for /vouchers', () => {
    expect(getKolamNavigationItemByRoute('/vouchers')?.route).toBe('/vouchers');
  });

  it('exposes voucher table columns', () => {
    const columns = getKolamTableColumns('voucher');
    expect(columns.map(column => column.id)).toEqual([
      'primary',
      'amount',
      'meta',
      'children',
      'notes',
      'status',
      'actions',
    ]);
  });

  it('normalizes BE list envelope { data, pagination }', () => {
    const list = normalizeKolamVoucherList(
      {
        data: [
          {
            _id: 'v1',
            code: 'flash10',
            title: 'Flash 10%',
            discountType: 'percentage',
            discountValue: 10,
            maxDiscountAmount: 50000,
            minPurchaseAmount: 100000,
            startDate: '2026-01-01T00:00:00.000Z',
            endDate: '2026-12-31T00:00:00.000Z',
            usageLimit: 100,
            usedCount: 3,
            status: 'active',
            applicableTo: 'all',
          },
          {
            id: 'v2',
            code: 'FLAT20K',
            title: 'Flat 20rb',
            discountType: 'fixed',
            discountValue: 20000,
            minPurchaseAmount: 0,
            startDate: '2026-02-01T00:00:00.000Z',
            endDate: '2026-02-28T00:00:00.000Z',
            usedCount: 0,
            status: 'inactive',
          },
        ],
        pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
      },
      { page: 1, limit: 20 },
    );

    expect(list.total).toBe(2);
    expect(list.items).toHaveLength(2);
    expect(list.items[0]).toMatchObject({
      id: 'v1',
      code: 'FLASH10',
      title: 'Flash 10%',
      discountType: 'percentage',
      discountValue: 10,
      status: 'active',
      applicableProducts: [],
    });
    expect(formatKolamVoucherDiscountLabel(list.items[0])).toContain('10%');
    expect(formatKolamVoucherUsageLabel(list.items[0])).toBe('3 / 100');
    expect(formatKolamVoucherUsageLabel(list.items[1])).toBe('0 / ∞');
  });

  it('normalizes single voucher entity with populated scope', () => {
    const voucher = normalizeKolamVoucher({
      _id: { $oid: 'oid1' },
      code: 'welcome',
      title: 'Welcome',
      discountType: 'fixed',
      discountValue: 5000,
      status: 'expired',
      applicableTo: 'products',
      applicableProducts: [{ _id: 'p1', name: 'Produk A' }],
      applicableCustomers: [{ _id: 'c1', name: 'Andi', email: 'a@x.com' }],
      firstOrderOnly: true,
    });
    expect(voucher.id).toBe('oid1');
    expect(voucher.code).toBe('WELCOME');
    expect(voucher.status).toBe('expired');
    expect(voucher.applicableTo).toBe('products');
    expect(voucher.firstOrderOnly).toBe(true);
    expect(voucher.applicableProducts).toEqual([
      { id: 'p1', label: 'Produk A' },
    ]);
    expect(voucher.applicableCustomers[0]).toMatchObject({
      id: 'c1',
      label: 'Andi',
      sublabel: 'a@x.com',
    });
  });

  it('validates and builds save payload like FE voucher form', () => {
    const form = {
      ...createEmptyKolamVoucherFormState(),
      code: 'welcome10',
      title: 'Welcome',
      discountType: 'percentage' as const,
      discountValue: '10',
      maxDiscountAmount: '50000',
      minPurchaseAmount: '0',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      usageLimit: '0',
      usageLimitPerUser: '1',
      status: 'active' as const,
      applicableTo: 'all' as const,
      firstOrderOnly: true,
    };
    expect(validateKolamVoucherForm(form)).toBeNull();
    expect(kolamVoucherFormDateToApiIso('2026-08-01')).toBe(
      '2026-08-01T00:00:00.000Z',
    );
    expect(createKolamVoucherSavePayload(form)).toMatchObject({
      code: 'WELCOME10',
      title: 'Welcome',
      discountType: 'percentage',
      discountValue: 10,
      maxDiscountAmount: 50000,
      usageLimit: null,
      usageLimitPerUser: 1,
      startDate: '2026-08-01T00:00:00.000Z',
      endDate: '2026-08-31T00:00:00.000Z',
      firstOrderOnly: true,
      applicableProducts: [],
    });

    expect(
      validateKolamVoucherForm({
        ...form,
        applicableTo: 'products',
        applicableProductIds: [],
      }),
    ).toContain('produk');
  });

  it('maps entity to form state and round-trips dates', () => {
    const voucher = normalizeKolamVoucher({
      _id: 'v9',
      code: 'X',
      title: 'X',
      discountType: 'fixed',
      discountValue: 1000,
      startDate: '2026-03-01T00:00:00.000Z',
      endDate: '2026-03-10T00:00:00.000Z',
      status: 'active',
      applicableTo: 'all',
    });
    const form = createKolamVoucherFormState(voucher);
    expect(form.startDate).toBe('2026-03-01');
    expect(form.endDate).toBe('2026-03-10');
    expect(form.code).toBe('X');
  });

  it('normalizes redemption list envelope', () => {
    const list = normalizeKolamVoucherRedemptionList({
      data: [
        {
          _id: 'r1',
          code: 'FLASH10',
          discountApplied: 15000,
          cancelled: false,
          createdAt: '2026-07-01T10:00:00.000Z',
          customer: { first_name: 'Budi', last_name: 'S' },
          sale: { _id: 's1', invoiceCode: 'INV-1' },
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    expect(list.items[0]).toMatchObject({
      id: 'r1',
      customerLabel: 'Budi S',
      saleLabel: 'INV-1',
      discountApplied: 15000,
    });
  });

  it('gates voucher permissions like FE resource voucher', () => {
    expect(hasKolamVoucherPermission(null, 'view')).toBe(true);
    expect(
      hasKolamVoucherPermission([], 'view', 'super_administrator'),
    ).toBe(true);
    expect(
      hasKolamVoucherPermission(
        [{ resource: 'voucher', actions: ['view'] }],
        'delete',
      ),
    ).toBe(false);
    expect(
      hasKolamVoucherPermission(
        [{ resource: 'voucher', actions: ['delete'] }],
        'delete',
      ),
    ).toBe(true);
  });
});

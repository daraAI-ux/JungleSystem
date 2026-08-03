import {
  buildKolamVoucherDetailRoute,
  buildKolamVoucherEditRoute,
  formatKolamVoucherDiscountLabel,
  formatKolamVoucherUsageLabel,
  getKolamVoucherIdFromRoute,
  getKolamVoucherRouteMode,
  hasKolamVoucherPermission,
  isKolamVoucherRoute,
  normalizeKolamVoucher,
  normalizeKolamVoucherList,
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
    });
    expect(formatKolamVoucherDiscountLabel(list.items[0])).toContain('10%');
    expect(formatKolamVoucherUsageLabel(list.items[0])).toBe('3 / 100');
    expect(formatKolamVoucherUsageLabel(list.items[1])).toBe('0 / ∞');
  });

  it('normalizes single voucher entity', () => {
    const voucher = normalizeKolamVoucher({
      _id: { $oid: 'oid1' },
      code: 'welcome',
      title: 'Welcome',
      discountType: 'fixed',
      discountValue: 5000,
      status: 'expired',
      applicableTo: 'products',
      firstOrderOnly: true,
    });
    expect(voucher.id).toBe('oid1');
    expect(voucher.code).toBe('WELCOME');
    expect(voucher.status).toBe('expired');
    expect(voucher.applicableTo).toBe('products');
    expect(voucher.firstOrderOnly).toBe(true);
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

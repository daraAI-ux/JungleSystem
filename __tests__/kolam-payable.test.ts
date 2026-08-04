import {
  getKolamPayableRouteId,
  getKolamPayableSurfaceMode,
  hasKolamPayablePermission,
  isKolamPayableListRoute,
  isKolamPayableRoute,
  normalizeKolamPayable,
  normalizeKolamPayableList,
  normalizeKolamPayableSummary,
} from '../src/domain/kolam-payable';

describe('kolam payable domain', () => {
  it('detects payable routes and surface mode', () => {
    expect(isKolamPayableRoute('/payable')).toBe(true);
    expect(isKolamPayableRoute('/payable/create')).toBe(true);
    expect(isKolamPayableRoute('/payable/pay-1')).toBe(true);
    expect(isKolamPayableRoute('/payable/pay-1/edit')).toBe(true);
    expect(isKolamPayableRoute('/receivable')).toBe(false);
    expect(isKolamPayableListRoute('/payable')).toBe(true);
    expect(isKolamPayableListRoute('/payable/pay-1')).toBe(false);
    expect(getKolamPayableRouteId('/payable/pay-1')).toBe('pay-1');
    expect(getKolamPayableRouteId('/payable/create')).toBe(null);
    expect(getKolamPayableSurfaceMode('/payable')).toBe('list');
    expect(getKolamPayableSurfaceMode('/payable/pay-1')).toBe('detail');
  });

  it('checks payable and wallet permissions', () => {
    expect(
      hasKolamPayablePermission(
        [{ resource: 'payable', actions: ['view'] }],
        'view',
      ),
    ).toBe(true);
    expect(
      hasKolamPayablePermission(
        [{ resource: 'wallet', actions: ['update'] }],
        'update',
      ),
    ).toBe(true);
    expect(
      hasKolamPayablePermission(
        [{ resource: 'payable', actions: ['view'] }],
        'update',
      ),
    ).toBe(false);
    expect(hasKolamPayablePermission([], 'view', 'super_administrator')).toBe(
      true,
    );
  });

  it('normalizes payable list payload', () => {
    const result = normalizeKolamPayableList({
      data: [
        {
          _id: 'pay-1',
          code: 'AP-001',
          name: 'Vendor A',
          amount: 100000,
          paidAmount: 25000,
          status: 'open',
          sourceModel: 'PurchaseOrder',
          sourceRef: { poCode: 'PO-77', vendor: { name: 'Vendor A' } },
          dueDate: '2026-08-10',
        },
      ],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      id: 'pay-1',
      code: 'AP-001',
      remainingAmount: 75000,
      sourceLabel: 'PO-77',
      vendorName: 'Vendor A',
      status: 'open',
    });
  });

  it('normalizes payable summary payload', () => {
    const summary = normalizeKolamPayableSummary({
      data: {
        open: { count: 3, totalAmount: 500000, outstanding: 300000 },
        overdue: { count: 1, totalAmount: 100000 },
      },
    });

    expect(summary.open.outstanding).toBe(300000);
    expect(summary.overdue.count).toBe(1);
  });

  it('normalizes a single payable with decimal amount', () => {
    const payable = normalizeKolamPayable({
      _id: 'pay-2',
      code: 'AP-002',
      name: 'Loan',
      amount: { $numberDecimal: '150000' },
      paidAmount: 0,
      wallet: { _id: 'w1', name: 'Kas' },
      status: 'open',
      sourceModel: 'Loan',
    });

    expect(payable.amount).toBe(150000);
    expect(payable.walletName).toBe('Kas');
    expect(payable.remainingAmount).toBe(150000);
  });
});

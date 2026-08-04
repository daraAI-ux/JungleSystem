import {
  hasKolamReceivablePermission,
  isKolamReceivableListRoute,
  isKolamReceivableRoute,
  normalizeKolamReceivable,
  normalizeKolamReceivableList,
  normalizeKolamReceivableSummary,
} from '../src/domain/kolam-receivable';

describe('kolam receivable domain', () => {
  it('detects receivable routes', () => {
    expect(isKolamReceivableRoute('/receivable')).toBe(true);
    expect(isKolamReceivableRoute('/receivable/create')).toBe(true);
    expect(isKolamReceivableRoute('/receivable/rec-1/edit')).toBe(true);
    expect(isKolamReceivableRoute('/payable')).toBe(false);
    expect(isKolamReceivableListRoute('/receivable')).toBe(true);
    expect(isKolamReceivableListRoute('/receivable/rec-1/edit')).toBe(false);
  });

  it('checks receivable and wallet permissions', () => {
    expect(
      hasKolamReceivablePermission(
        [{ resource: 'receivable', actions: ['view'] }],
        'view',
      ),
    ).toBe(true);
    expect(
      hasKolamReceivablePermission(
        [{ resource: 'wallet', actions: ['update'] }],
        'update',
      ),
    ).toBe(true);
    expect(
      hasKolamReceivablePermission(
        [{ resource: 'receivable', actions: ['view'] }],
        'delete',
      ),
    ).toBe(false);
    expect(
      hasKolamReceivablePermission([], 'view', 'super_administrator'),
    ).toBe(true);
  });

  it('normalizes receivable list payload', () => {
    const result = normalizeKolamReceivableList({
      data: [
        {
          _id: 'rec-1',
          code: 'AR-001',
          name: 'Invoice A',
          amount: 200000,
          paidAmount: 50000,
          status: 'open',
          sourceModel: 'Sale',
          customer: { name: 'Customer X' },
          dueDate: '2026-08-15',
        },
      ],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      id: 'rec-1',
      code: 'AR-001',
      remainingAmount: 150000,
      customerName: 'Customer X',
      status: 'open',
    });
  });

  it('normalizes receivable summary payload', () => {
    const summary = normalizeKolamReceivableSummary({
      data: {
        open: { count: 2, totalAmount: 400000, outstanding: 250000 },
        overdue: { count: 1, totalAmount: 80000 },
      },
    });

    expect(summary.open.outstanding).toBe(250000);
    expect(summary.overdue.totalAmount).toBe(80000);
  });

  it('normalizes a single receivable', () => {
    const receivable = normalizeKolamReceivable({
      _id: 'rec-2',
      code: 'AR-002',
      name: 'Manual',
      amount: 75000,
      paidAmount: 75000,
      wallet: 'Kas Utama',
      status: 'paid',
      sourceModel: 'FutureReceivable',
    });

    expect(receivable.walletName).toBe('Kas Utama');
    expect(receivable.remainingAmount).toBe(0);
    expect(receivable.status).toBe('paid');
  });
});

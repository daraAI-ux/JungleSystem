import {
  getKolamFinanceFocusTxId,
  hasKolamWalletPermission,
  isKolamFinanceConfirmableSource,
  isKolamFinanceSummaryRoute,
  normalizeKolamFinanceSummary,
  resolveKolamFinanceCashflowSessionId,
  txMatchesFinanceFocusId,
} from '../src/domain/kolam-finance-summary';

describe('kolam finance summary domain', () => {
  it('detects finance summary routes and focus tx id', () => {
    expect(isKolamFinanceSummaryRoute('/finance')).toBe(true);
    expect(isKolamFinanceSummaryRoute('/finance/abc123')).toBe(true);
    expect(isKolamFinanceSummaryRoute('/finance/payroll')).toBe(false);
    expect(isKolamFinanceSummaryRoute('/finance/bonus')).toBe(false);
    expect(isKolamFinanceSummaryRoute('/wallet')).toBe(false);
    expect(getKolamFinanceFocusTxId('/finance')).toBe(null);
    expect(getKolamFinanceFocusTxId('/finance/abc123')).toBe('abc123');
    expect(getKolamFinanceFocusTxId('/finance/payroll')).toBe(null);
  });

  it('mirrors confirmable source exclusion for commission', () => {
    expect(isKolamFinanceConfirmableSource('sale')).toBe(true);
    expect(isKolamFinanceConfirmableSource('commission')).toBe(false);
  });

  it('resolves cashflow session id from string or object', () => {
    expect(resolveKolamFinanceCashflowSessionId('sess-1')).toBe('sess-1');
    expect(resolveKolamFinanceCashflowSessionId({ _id: 'sess-2' })).toBe(
      'sess-2',
    );
    expect(resolveKolamFinanceCashflowSessionId(null)).toBe(null);
  });

  it('matches focus tx id loosely', () => {
    const tx = {
      id: 'aabbccddeeff001122334455',
      date: '',
      wallet: '',
      type: 'credit' as const,
      source: '',
      amount: 0,
      note: '',
      confirmStatus: 'unconfirmed' as const,
      cashflowSessionId: null,
      sourceModel: '',
      createdByName: '',
      confirmedByName: '',
    };
    expect(txMatchesFinanceFocusId(tx, '4455')).toBe(true);
    expect(txMatchesFinanceFocusId(tx, 'zzzz')).toBe(false);
  });

  it('checks wallet confirm permission with super-admin bypass', () => {
    expect(
      hasKolamWalletPermission(
        [{ resource: 'wallet', actions: ['view'] }],
        'confirm',
      ),
    ).toBe(false);
    expect(
      hasKolamWalletPermission(
        [{ resource: 'wallet', actions: ['confirm'] }],
        'confirm',
      ),
    ).toBe(true);
    expect(
      hasKolamWalletPermission([], 'confirm', 'super_administrator'),
    ).toBe(true);
    expect(hasKolamWalletPermission(null, 'confirm')).toBe(true);
  });

  it('normalizes finance summary payload', () => {
    const summary = normalizeKolamFinanceSummary({
      data: {
        totalIncome: 1000,
        totalExpense: 400,
        profitLoss: 600,
        wallets: [{ name: 'Kas', balance: 250 }],
        transactions: [
          {
            _id: 'tx1',
            date: '2026-08-01T00:00:00.000Z',
            wallet: 'Kas',
            type: 'credit',
            source: 'sale',
            amount: 1000,
            note: 'Penjualan',
            confirmStatus: 'unconfirmed',
            cashflowSession: { _id: 'sess-1' },
            sourceModel: 'Sale',
          },
        ],
        liabilities: {
          payable: {
            open: { outstanding: 50 },
            overdue: { totalAmount: 10 },
          },
        },
        filter: { range: 'month', startDate: 'a', endDate: 'b' },
      },
    });
    expect(summary.totalIncome).toBe(1000);
    expect(summary.wallets[0]?.balance).toBe(250);
    expect(summary.transactions[0]?.cashflowSessionId).toBe('sess-1');
    expect(summary.liabilitiesPayableOpen).toBe(50);
    expect(summary.liabilitiesPayableOverdue).toBe(10);
  });
});

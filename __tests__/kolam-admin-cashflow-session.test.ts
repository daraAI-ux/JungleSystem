import {
  computeAdminCashflowReviewSummary,
  getGrossCashFromInvoiceGroup,
  getKolamAdminCashflowSurfaceMode,
  isCashInvoiceGroup,
  isKolamAdminCashflowSessionRoute,
  isKolamPosCashflowShiftRoute,
  normalizeKolamAdminCashflowActiveProbe,
  normalizeKolamAdminCashflowDeposits,
  normalizeKolamAdminCashflowInvoiceGroups,
  normalizeKolamAdminCashflowSession,
  type KolamAdminCashflowReviewEntry,
} from '../src/domain/kolam-admin-cashflow-session';
import { getKolamNavigationRouteTarget } from '../src/domain/kolam-navigation';

describe('admin cashflow session domain', () => {
  it('detects admin and POS cashflow routes', () => {
    expect(isKolamAdminCashflowSessionRoute('/cashflow-session')).toBe(true);
    expect(isKolamAdminCashflowSessionRoute('/cashflow-session/create')).toBe(
      true,
    );
    expect(isKolamAdminCashflowSessionRoute('/cashflow-session/abc')).toBe(
      true,
    );
    expect(isKolamPosCashflowShiftRoute('/pos/cashflow')).toBe(true);
    expect(isKolamAdminCashflowSessionRoute('/pos/cashflow')).toBe(false);
  });

  it('maps surface modes from route', () => {
    expect(getKolamAdminCashflowSurfaceMode('/cashflow-session')).toBe('list');
    expect(getKolamAdminCashflowSurfaceMode('/cashflow-session/create')).toBe(
      'create',
    );
    expect(getKolamAdminCashflowSurfaceMode('/cashflow-session/abc')).toBe(
      'detail',
    );
  });

  it('routes admin cashflow to kolam and POS shift to cashflow module', () => {
    expect(
      getKolamNavigationRouteTarget({
        label: 'Sesi Tunai',
        route: '/cashflow-session',
        description: 'Sesi kas harian',
        requiredAccess: ['kolam'],
      }).moduleId,
    ).toBe('kolam');
    expect(
      getKolamNavigationRouteTarget({
        label: 'Shift Kasir POS',
        route: '/pos/cashflow',
        description: 'Shift POS',
        requiredAccess: ['pos'],
      }).moduleId,
    ).toBe('cashflow');
  });

  it('normalizes session and active probe payloads', () => {
    const session = normalizeKolamAdminCashflowSession({
      _id: 'sess-1',
      name: 'Hari ini',
      source: 'admin',
      status: 'open',
      openedBy: { first_name: 'Ada', last_name: 'Lovelace', _id: 'u1' },
    });
    expect(session.id).toBe('sess-1');
    expect(session.openedBy?.name).toBe('Ada Lovelace');

    const probe = normalizeKolamAdminCashflowActiveProbe({
      data: { _id: 'sess-1', status: 'open', source: 'admin', name: 'Hari ini' },
      todaySession: {
        _id: 'sess-1',
        name: 'Hari ini',
        status: 'open',
      },
    });
    expect(probe.active?.id).toBe('sess-1');
    expect(probe.todaySession?.id).toBe('sess-1');
  });

  it('computes review summary and cash invoice helpers', () => {
    const entries: KolamAdminCashflowReviewEntry[] = [
      {
        id: '1',
        type: 'credit',
        source: 'sale_revenue',
        amount: 100_000,
        confirmStatus: 'unconfirmed',
        walletType: 'cash',
        walletProvider: 'CASH',
        paymentMethodType: 'cash',
        sourceModel: 'Sale',
      },
      {
        id: '2',
        type: 'credit',
        source: 'sale_revenue',
        amount: 50_000,
        confirmStatus: 'unconfirmed',
        walletType: 'bank',
        walletProvider: 'BCA',
        paymentMethodType: 'transfer',
        sourceModel: 'Sale',
      },
    ];
    const summary = computeAdminCashflowReviewSummary(entries);
    expect(summary.cashTotal).toBe(100_000);
    expect(summary.nonCashTotal).toBe(50_000);
    expect(summary.unconfirmedCount).toBe(2);

    const groups = normalizeKolamAdminCashflowInvoiceGroups({
      data: [
        {
          saleId: 'sale-1',
          invoiceCode: 'INV-1',
          confirmStatus: 'unconfirmed',
          netAmount: '100000',
          excludedCount: 0,
          entries: [
            {
              _id: 'e1',
              type: 'credit',
              source: 'sale_revenue',
              amount: 100_000,
              confirmStatus: 'unconfirmed',
              wallet: {
                _id: 'w1',
                name: 'Cash',
                type: 'cash',
                provider: 'CASH',
              },
            },
          ],
          confirmableEntries: [
            {
              _id: 'e1',
              type: 'credit',
              source: 'sale_revenue',
              amount: 100_000,
              confirmStatus: 'unconfirmed',
              wallet: {
                _id: 'w1',
                name: 'Cash',
                type: 'cash',
                provider: 'CASH',
              },
            },
          ],
        },
      ],
    });
    expect(isCashInvoiceGroup(groups[0]!)).toBe(true);
    expect(getGrossCashFromInvoiceGroup(groups[0]!)).toBe(100_000);
  });

  it('normalizes deposits and hides drafts', () => {
    const deposits = normalizeKolamAdminCashflowDeposits({
      data: [
        {
          _id: 'd1',
          status: 'draft',
          amount: 1,
        },
        {
          _id: 'd2',
          status: 'submitted',
          amount: 250_000,
          fromWallet: { _id: 'w1', name: 'Cash Drawer' },
          toWallet: { _id: 'w2', name: 'Bank' },
          invoiceAllocations: [{ sale: 's1', invoiceCode: 'INV-1' }],
          totalActualIdr: '250000',
          totalShortageIdr: '0',
        },
      ],
    });
    expect(deposits).toHaveLength(1);
    expect(deposits[0]?.id).toBe('d2');
    expect(deposits[0]?.headlineAmount).toBe(250_000);
    expect(deposits[0]?.allocationCount).toBe(1);
  });
});

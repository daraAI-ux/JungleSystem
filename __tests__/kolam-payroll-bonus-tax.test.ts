import {
  buildBonusListRoute,
  createInitialBonusListFilters,
  isKolamBonusRoute,
  normalizeKolamBonusList,
} from '../src/domain/kolam-bonus';
import {
  buildKolamDaraTaxRoute,
  getKolamDaraTaxTab,
  getKolamFinanceTaxSurfaceMode,
  isKolamFinanceTaxRoute,
  KOLAM_DARA_TAX_DEFAULT_PERIOD,
  KOLAM_DARA_TAX_TABS,
  resolveKolamDaraTaxAccess,
} from '../src/domain/kolam-finance-tax';
import {
  buildKolamPayrollPeriodRoute,
  buildKolamPayrollSlipRoute,
  getKolamPayrollPeriodKey,
  getKolamPayrollSlipId,
  getKolamPayrollSurfaceMode,
  isKolamPayrollRoute,
  normalizeKolamPayrollPeriodDetail,
  normalizeKolamPayrollPeriodList,
} from '../src/domain/kolam-payroll';

describe('kolam payroll domain', () => {
  it('detects payroll routes and surface modes', () => {
    expect(isKolamPayrollRoute('/finance/payroll')).toBe(true);
    expect(isKolamPayrollRoute('/finance/payroll/2026-08')).toBe(true);
    expect(isKolamPayrollRoute('/finance/payroll/slip/abc')).toBe(true);
    expect(isKolamPayrollRoute('/finance/bonus')).toBe(false);

    expect(getKolamPayrollSurfaceMode('/finance/payroll')).toBe('list');
    expect(getKolamPayrollSurfaceMode('/finance/payroll/2026-08')).toBe('detail');
    expect(getKolamPayrollSurfaceMode('/finance/payroll/slip/slip-1')).toBe(
      'slip',
    );
    expect(getKolamPayrollSurfaceMode('/finance/payroll/foo/bar')).toBe(
      'unsupported',
    );

    expect(getKolamPayrollPeriodKey('/finance/payroll/2026-08')).toBe('2026-08');
    expect(getKolamPayrollSlipId('/finance/payroll/slip/slip-1')).toBe('slip-1');
    expect(buildKolamPayrollPeriodRoute('2026-08')).toBe('/finance/payroll/2026-08');
    expect(buildKolamPayrollSlipRoute('slip-1')).toBe(
      '/finance/payroll/slip/slip-1',
    );
  });

  it('normalizes payroll period list and detail payloads', () => {
    const periods = normalizeKolamPayrollPeriodList({
      data: [
        {
          _id: 'p1',
          periodKey: '2026-08',
          year: 2026,
          month: 8,
          status: 'draft',
          slipCount: 2,
          totalTakeHome: 5000000,
          wallet: { _id: 'w1', name: 'Kas' },
        },
      ],
    });
    expect(periods[0]?.periodKey).toBe('2026-08');
    expect(periods[0]?.walletName).toBe('Kas');

    const detail = normalizeKolamPayrollPeriodDetail({
      data: {
        period: { periodKey: '2026-08', status: 'draft' },
        slips: [
          {
            _id: 's1',
            slipCode: 'SLIP-1',
            user: { first_name: 'A', last_name: 'B' },
            takeHomePay: 2500000,
          },
        ],
        pendingEmployees: [{ userId: 'u1', name: 'Pending User' }],
      },
    });
    expect(detail?.period.periodKey).toBe('2026-08');
    expect(detail?.slips[0]?.userLabel).toBe('A B');
    expect(detail?.pendingEmployees[0]?.name).toBe('Pending User');
  });
});

describe('kolam bonus domain', () => {
  it('detects bonus list route and builds query route', () => {
    expect(isKolamBonusRoute('/finance/bonus')).toBe(true);
    expect(isKolamBonusRoute('/finance/bonus/extra')).toBe(false);
    expect(isKolamBonusRoute('/finance/payroll')).toBe(false);

    const filters = createInitialBonusListFilters('/finance/bonus?year=2026&month=3');
    expect(filters.year).toBe(2026);
    expect(filters.month).toBe(3);
    expect(buildBonusListRoute(filters)).toBe('/finance/bonus?year=2026&month=3');
  });

  it('normalizes bonus list rows', () => {
    const rows = normalizeKolamBonusList({
      data: [
        {
          _id: 'b1',
          code: 'BNS-1',
          name: 'Bonus',
          amount: 100000,
          status: 'pending',
          employeeUser: { first_name: 'C', last_name: 'D' },
        },
      ],
    });
    expect(rows[0]?.employeeLabel).toBe('C D');
    expect(rows[0]?.statusLabel).toBe('Menunggu');
  });
});

describe('kolam finance tax domain', () => {
  it('detects tax dashboard and tax profile routes', () => {
    expect(isKolamFinanceTaxRoute('/finance/tax')).toBe(true);
    expect(isKolamFinanceTaxRoute('/finance/settings/tax-profile')).toBe(true);
    expect(isKolamFinanceTaxRoute('/finance/payroll')).toBe(false);

    expect(getKolamFinanceTaxSurfaceMode('/finance/tax')).toBe('dashboard');
    expect(getKolamFinanceTaxSurfaceMode('/finance/settings/tax-profile')).toBe(
      'tax-profile',
    );
  });

  it('resolves FE tabs, period default, and ?tab= routes', () => {
    expect(KOLAM_DARA_TAX_TABS.map(tab => tab.id)).toEqual([
      'ringkasan',
      'operasional',
      'regulasi',
      'laporan',
      'pelunasan',
    ]);
    expect(KOLAM_DARA_TAX_TABS.find(tab => tab.id === 'pelunasan')?.label).toBe(
      'Setoran',
    );
    expect(KOLAM_DARA_TAX_DEFAULT_PERIOD).toBe('month');
    expect(getKolamDaraTaxTab('/finance/tax')).toBe('ringkasan');
    expect(getKolamDaraTaxTab('/finance/tax?tab=operasional')).toBe(
      'operasional',
    );
    expect(getKolamDaraTaxTab('/finance/tax?tab=nope')).toBe('ringkasan');
    expect(buildKolamDaraTaxRoute('ringkasan')).toBe('/finance/tax');
    expect(buildKolamDaraTaxRoute('pelunasan')).toBe(
      '/finance/tax?tab=pelunasan',
    );
  });

  it('resolves tax access like FE tax:view + admin/owner', () => {
    expect(
      resolveKolamDaraTaxAccess({roleKey: 'cashier', permissions: []}).canSee,
    ).toBe(false);
    expect(resolveKolamDaraTaxAccess({roleKey: 'admin'}).canSee).toBe(true);
    expect(resolveKolamDaraTaxAccess({roleKey: 'owner'}).canSee).toBe(true);
    expect(
      resolveKolamDaraTaxAccess({
        roleKey: 'finance',
        permissions: [{resource: 'tax', actions: ['view']}],
      }).canSee,
    ).toBe(true);
    expect(
      resolveKolamDaraTaxAccess({
        roleKey: 'finance',
        permissions: [{resource: 'tax', actions: ['draft']}],
      }).canDraft,
    ).toBe(true);
  });
});

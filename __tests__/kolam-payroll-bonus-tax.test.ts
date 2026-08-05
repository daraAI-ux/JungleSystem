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
  normalizeKolamPayrollSlip,
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
          wallet: { _id: 'w1', name: 'Kas', currentBalance: 12000000 },
          taxSettlement: {
            _id: 'ts1',
            code: 'PPh21-2026-08',
            status: 'draft',
            amount: 150000,
          },
        },
      ],
    });
    expect(periods[0]?.periodKey).toBe('2026-08');
    expect(periods[0]?.walletName).toBe('Kas');
    expect(periods[0]?.walletBalance).toBe(12000000);
    expect(periods[0]?.taxSettlement).toEqual({
      id: 'ts1',
      code: 'PPh21-2026-08',
      status: 'draft',
      amount: 150000,
    });

    const detail = normalizeKolamPayrollPeriodDetail({
      data: {
        period: {
          periodKey: '2026-08',
          status: 'draft',
          wallet: 'w-string-only',
          taxSettlement: 'ts-id-only',
        },
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
    expect(detail?.period.walletId).toBe('w-string-only');
    expect(detail?.period.walletBalance).toBeNull();
    expect(detail?.period.taxSettlement).toEqual({
      id: 'ts-id-only',
      code: '',
      status: '',
      amount: 0,
    });
    expect(detail?.slips[0]?.userLabel).toBe('A B');
    expect(detail?.pendingEmployees[0]?.name).toBe('Pending User');
  });

  it('normalizes FE-shaped payroll slip with commissions, tax, warnings', () => {
    const slip = normalizeKolamPayrollSlip({
      data: {
        _id: 'slip-99',
        slipCode: 'PAY-2026-08-001',
        periodKey: '2026-08',
        status: 'draft',
        user: {
          _id: 'user-42',
          first_name: 'Sari',
          last_name: 'Dewi',
        },
        warnings: [
          {
            code: 'MISSING_NPWP',
            message: 'NPWP kosong',
            severity: 'warning',
          },
          {
            code: 'ZERO_SALARY',
            message: 'Gaji 0',
            severity: 'error',
          },
        ],
        employeeSnapshot: {
          firstName: 'Sari',
          lastName: 'Dewi',
          employeeNumber: 'EMP-9',
          position: 'Kasir',
          department: 'Retail',
          taxNumber: '10.20.30.40-50.000',
          isPkp: true,
          salaryDate: 25,
        },
        baseSalary: 4000000,
        bonusTotal: 250000,
        commissionGross: 500000,
        commissionPph21Withheld: 25000,
        commissionNet: 475000,
        kasbonTotal: 100000,
        salaryDeductionTotal: 50000,
        grossBruto: 4750000,
        totalDeductions: 175000,
        pph21Payroll: {
          applicable: true,
          rate: 5,
          taxableBase: 4250000,
          amount: 212500,
        },
        takeHomePay: 4325000,
        pph21AiNote: 'Estimasi PPh 21 bulanan.',
        generatedAt: '2026-08-01T10:00:00.000Z',
      },
    });

    expect(slip).not.toBeNull();
    expect(slip?.id).toBe('slip-99');
    expect(slip?.userId).toBe('user-42');
    expect(slip?.userLabel).toBe('Sari Dewi');
    expect(slip?.employeeNumber).toBe('EMP-9');
    expect(slip?.commissionGross).toBe(500000);
    expect(slip?.commissionPph21Withheld).toBe(25000);
    expect(slip?.commissionNet).toBe(475000);
    expect(slip?.kasbonTotal).toBe(100000);
    expect(slip?.salaryDeductionTotal).toBe(50000);
    expect(slip?.pph21Payroll).toEqual({
      applicable: true,
      rate: 5,
      taxableBase: 4250000,
      amount: 212500,
    });
    expect(slip?.pph21Amount).toBe(212500);
    expect(slip?.pph21AiNote).toBe('Estimasi PPh 21 bulanan.');
    expect(slip?.warnings).toEqual([
      {
        code: 'MISSING_NPWP',
        message: 'NPWP kosong',
        severity: 'warning',
      },
      {
        code: 'ZERO_SALARY',
        message: 'Gaji 0',
        severity: 'error',
      },
    ]);
    expect(slip?.employeeSnapshot).toEqual({
      firstName: 'Sari',
      lastName: 'Dewi',
      employeeNumber: 'EMP-9',
      position: 'Kasir',
      department: 'Retail',
      taxNumber: '10.20.30.40-50.000',
      isPkp: true,
      salaryDate: 25,
    });
  });

  it('defaults missing slip fields safely for thin list payloads', () => {
    const slip = normalizeKolamPayrollSlip({
      _id: 'thin',
      slipCode: 'T1',
      periodKey: '2026-01',
      user: 'user-string',
      takeHomePay: 1,
    });
    expect(slip?.userId).toBe('user-string');
    expect(slip?.warnings).toEqual([]);
    expect(slip?.pph21Payroll.applicable).toBe(false);
    expect(slip?.pph21Amount).toBe(0);
    expect(slip?.commissionGross).toBe(0);
    expect(slip?.employeeSnapshot.isPkp).toBe(false);
    expect(slip?.pph21AiNote).toBe('');
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
    expect(resolveKolamDaraTaxAccess({roleKey: 'admin'}).isAdmin).toBe(true);
  });
});

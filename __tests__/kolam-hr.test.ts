import {
  buildKolamHrRoute,
  canonicalizeKolamHrRoute,
  getKolamHrTab,
  isKolamHrRoute,
  normalizeKolamHrDailyAttendanceSummary,
  normalizeKolamHrLeaveRequestList,
  normalizeKolamHrOvertimeList,
  pickKolamHrVisibleTab,
  resolveKolamHrAccess,
} from '../src/domain/kolam-hr';

describe('kolam-hr domain', () => {
  it('resolves hub and legacy routes like FE redirects', () => {
    expect(isKolamHrRoute('/list-of-users/hr')).toBe(true);
    expect(isKolamHrRoute('/list-of-users/hr?tab=cuti')).toBe(true);
    expect(isKolamHrRoute('/staff-attendance')).toBe(true);
    expect(isKolamHrRoute('/staff-attendance/leaves')).toBe(true);
    expect(isKolamHrRoute('/list-of-users/overtime')).toBe(true);
    expect(isKolamHrRoute('/staff-attendance/me')).toBe(false);
    expect(isKolamHrRoute('/finance/payroll')).toBe(false);

    expect(getKolamHrTab('/list-of-users/hr')).toBe('absensi');
    expect(getKolamHrTab('/list-of-users/hr?tab=lembur')).toBe('lembur');
    expect(getKolamHrTab('/staff-attendance')).toBe('absensi');
    expect(getKolamHrTab('/staff-attendance/leaves')).toBe('cuti');
    expect(getKolamHrTab('/list-of-users/overtime')).toBe('lembur');

    expect(canonicalizeKolamHrRoute('/staff-attendance')).toBe(
      '/list-of-users/hr',
    );
    expect(canonicalizeKolamHrRoute('/staff-attendance/leaves')).toBe(
      '/list-of-users/hr?tab=cuti',
    );
    expect(canonicalizeKolamHrRoute('/list-of-users/overtime')).toBe(
      '/list-of-users/hr?tab=lembur',
    );
    expect(buildKolamHrRoute('cuti')).toBe('/list-of-users/hr?tab=cuti');
  });

  it('resolves access gates like FE HrSystemPage', () => {
    expect(resolveKolamHrAccess({roleKey: 'super-admin'}).canSee).toBe(true);

    const salaryView = resolveKolamHrAccess({
      roleKey: 'staff',
      permissions: [{resource: 'salary', actions: ['view']}],
    });
    expect(salaryView.canAbsensi).toBe(true);
    expect(salaryView.canCuti).toBe(false);
    expect(salaryView.canLembur).toBe(false);
    expect(salaryView.visibleTabs.map(tab => tab.id)).toEqual(['absensi']);

    const payroll = resolveKolamHrAccess({
      roleKey: 'staff',
      permissions: [{resource: 'payroll', actions: ['view', 'update']}],
    });
    expect(payroll.canLembur).toBe(true);
    expect(payroll.canLemburUpdate).toBe(true);
    expect(payroll.visibleTabs.map(tab => tab.id)).toEqual(['lembur']);

    expect(
      resolveKolamHrAccess({
        roleKey: 'cashier',
        permissions: [],
      }).canSee,
    ).toBe(false);

    expect(
      pickKolamHrVisibleTab('/list-of-users/hr?tab=lembur', [
        {id: 'absensi'},
        {id: 'cuti'},
      ]),
    ).toBe('absensi');
  });

  it('normalizes daily summary, leave list, and overtime list', () => {
    const summary = normalizeKolamHrDailyAttendanceSummary({
      data: {
        dateKey: '2026-08-10',
        holiday: true,
        workStartTime: '09:00',
        timezone: 'Asia/Jakarta',
        stats: {total: 2, present: 1, pending: 1},
        rows: [
          {
            user: {_id: 'u1', first_name: 'Ada', last_name: 'Lovelace'},
            status: 'present',
            checkInAt: '2026-08-10T02:00:00.000Z',
            lateMinutes: 0,
            fineAmount: 0,
          },
          {
            user: {_id: 'u2', first_name: 'Alan', last_name: 'Turing'},
            status: 'pending',
          },
        ],
      },
    });
    expect(summary?.holiday).toBe(true);
    expect(summary?.rows).toHaveLength(2);
    expect(summary?.rows[0].userName).toBe('Ada Lovelace');
    expect(summary?.stats.present).toBe(1);

    const leaves = normalizeKolamHrLeaveRequestList({
      data: [
        {
          _id: 'l1',
          user: {_id: 'u1', first_name: 'Ada', last_name: 'Lovelace'},
          type: 'cuti',
          startDateKey: '2026-08-11',
          endDateKey: '2026-08-12',
          status: 'pending',
          reason: 'Liburan',
        },
      ],
    });
    expect(leaves).toHaveLength(1);
    expect(leaves[0]).toMatchObject({
      id: 'l1',
      type: 'cuti',
      status: 'pending',
    });

    const overtime = normalizeKolamHrOvertimeList({
      data: [
        {
          _id: 'o1',
          user: {_id: 'u1', first_name: 'Ada', last_name: 'Lovelace'},
          taskTitle: 'Packing',
          taskDueDate: '2026-08-10T15:00:00.000Z',
          reason: 'Deadline malam',
          amount: 50000,
          overtimeUnits: 2,
          unitLabel: 'jam',
          status: 'pending',
        },
      ],
    });
    expect(overtime).toHaveLength(1);
    expect(overtime[0].userName).toBe('Ada Lovelace');
    expect(overtime[0].amount).toBe(50000);
  });
});

import {
  getCashflowShiftName,
  getRequiredDeposit,
} from '../src/lib/cashflow';

test('calculates required deposit from opening cash and cash sales', () => {
  expect(
    getRequiredDeposit({
      openingCash: 750000,
      totalSalesCount: 4,
      totalSalesAmount: 1200000,
      cashSalesCount: 2,
      cashSalesTotal: 450000,
    }),
  ).toBe(1200000);
});

test('normalizes optional cashflow shift name', () => {
  expect(getCashflowShiftName(' Morning Shift ')).toBe('Morning Shift');
  expect(getCashflowShiftName('   ')).toBeUndefined();
});

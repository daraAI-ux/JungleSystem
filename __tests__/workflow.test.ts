import {
  canCloseCashflow,
  canCreateSaleDraft,
  canOpenCashflow,
  canMoveSaleStatus,
  getCheckoutWorkflowSteps,
} from '../src/lib/workflow';

test('requires login cashflow customer payment and cart before sale draft', () => {
  expect(
    canCreateSaleDraft({
      signedIn: true,
      hasPosAccess: true,
      hasCashflow: true,
      hasCustomer: true,
      hasPaymentMethod: true,
      cartItemCount: 1,
    }),
  ).toBe(true);

  expect(
    canCreateSaleDraft({
      signedIn: true,
      hasPosAccess: true,
      hasCashflow: false,
      hasCustomer: true,
      hasPaymentMethod: true,
      cartItemCount: 1,
    }),
  ).toBe(false);

  expect(
    canCreateSaleDraft({
      signedIn: true,
      hasPosAccess: false,
      hasCashflow: true,
      hasCustomer: true,
      hasPaymentMethod: true,
      cartItemCount: 1,
    }),
  ).toBe(false);
});

test('reports checkout workflow steps in cashier order', () => {
  expect(
    getCheckoutWorkflowSteps({
      signedIn: false,
      hasPosAccess: false,
      hasCashflow: true,
      hasCustomer: true,
      hasPaymentMethod: false,
      cartItemCount: 0,
    }),
  ).toEqual([
    {label: 'Login kasir', done: false},
    {label: 'Akses POS', done: false},
    {label: 'Cashflow open', done: true},
    {label: 'Customer dipilih', done: true},
    {label: 'Payment dipilih', done: false},
    {label: 'Cart berisi item', done: false},
  ]);
});

test('guards sale status transitions used by POS', () => {
  expect(canMoveSaleStatus('draft', 'sent')).toBe(true);
  expect(canMoveSaleStatus('draft', 'paid')).toBe(true);
  expect(canMoveSaleStatus('sent', 'paid')).toBe(true);
  expect(canMoveSaleStatus('paid', 'sent')).toBe(false);
  expect(canMoveSaleStatus('paid', 'cancelled')).toBe(false);
  expect(canMoveSaleStatus('cancelled', 'paid')).toBe(false);
});

test('guards cashflow open and close actions', () => {
  expect(canOpenCashflow(true, true, false)).toBe(true);
  expect(canOpenCashflow(false, true, false)).toBe(false);
  expect(canOpenCashflow(true, false, false)).toBe(false);
  expect(canOpenCashflow(true, true, true)).toBe(false);

  expect(canCloseCashflow(true, true, true)).toBe(true);
  expect(canCloseCashflow(false, true, true)).toBe(false);
  expect(canCloseCashflow(true, false, true)).toBe(false);
  expect(canCloseCashflow(true, true, false)).toBe(false);
});

import type {SaleStatus} from '../domain/pos';

export interface CheckoutReadinessInput {
  signedIn: boolean;
  hasPosAccess: boolean;
  hasCashflow: boolean;
  hasCustomer: boolean;
  hasPaymentMethod: boolean;
  cartItemCount: number;
}

export interface WorkflowStep {
  label: string;
  done: boolean;
}

export function getCheckoutWorkflowSteps(
  input: CheckoutReadinessInput,
): WorkflowStep[] {
  return [
    {label: 'Login kasir', done: input.signedIn},
    {label: 'Akses POS', done: input.hasPosAccess},
    {label: 'Cashflow open', done: input.hasCashflow},
    {label: 'Customer dipilih', done: input.hasCustomer},
    {label: 'Payment dipilih', done: input.hasPaymentMethod},
    {label: 'Cart berisi item', done: input.cartItemCount > 0},
  ];
}

export function canCreateSaleDraft(input: CheckoutReadinessInput): boolean {
  return getCheckoutWorkflowSteps(input).every(step => step.done);
}

export function canOpenCashflow(
  signedIn: boolean,
  hasPosAccess: boolean,
  hasCashflow: boolean,
) {
  return signedIn && hasPosAccess && !hasCashflow;
}

export function canCloseCashflow(
  signedIn: boolean,
  hasPosAccess: boolean,
  hasCashflow: boolean,
) {
  return signedIn && hasPosAccess && hasCashflow;
}

export function canMoveSaleStatus(
  currentStatus: SaleStatus,
  nextStatus: SaleStatus,
): boolean {
  if (currentStatus === 'cancelled') {
    return false;
  }

  if (nextStatus === 'cancelled') {
    return currentStatus === 'draft' || currentStatus === 'sent';
  }

  if (nextStatus === 'sent') {
    return currentStatus === 'draft';
  }

  if (nextStatus === 'paid') {
    return currentStatus === 'draft' || currentStatus === 'sent';
  }

  return false;
}

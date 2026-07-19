import type {CashflowSalesPreview} from '../domain/pos';

export function getRequiredDeposit(preview: CashflowSalesPreview): number {
  return preview.openingCash + preview.cashSalesTotal;
}

export function getCashflowShiftName(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed || undefined;
}

import type {CashflowSalesPreview} from '../domain/pos';

export function getRequiredDeposit(preview: CashflowSalesPreview): number {
  return preview.openingCash + preview.cashSalesTotal;
}

export function getCashflowShiftName(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed || undefined;
}

/**
 * Display helper — BE defaults still use English names
 * (`Daily Cashflow`, `Auto Daily Cashflow - …`).
 */
export function formatCashflowSessionDisplayName(
  name: string | null | undefined,
  fallback = 'Sesi Tunai Harian',
): string {
  const trimmed = String(name || '').trim();
  if (!trimmed) {
    return fallback;
  }

  if (/^daily\s+cashflow$/i.test(trimmed)) {
    return 'Sesi Tunai Harian';
  }

  const autoMatch = /^auto\s+daily\s+cashflow\s*[-–—]\s*(.+)$/i.exec(trimmed);
  if (autoMatch?.[1]) {
    return `Sesi Tunai Harian Otomatis - ${autoMatch[1].trim()}`;
  }

  return trimmed;
}

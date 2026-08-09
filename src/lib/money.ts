const formatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const accountingFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const accountingNumberFormatter = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatRupiah(value: number): string {
  return formatter.format(value);
}

export function formatRupiahAccounting(value: number): string {
  return accountingFormatter.format(safeMoneyNumber(value));
}

export function formatRupiahAccountingNumber(value: number): string {
  return accountingNumberFormatter.format(safeMoneyNumber(value));
}

export function parseRupiahAccountingInput(value: string): number {
  const trimmed = value.trim();

  if (!trimmed) {
    return 0;
  }

  const cleaned = trimmed
    .replace(/rp/gi, '')
    .replace(/\s/g, '')
    .replace(/[^0-9,.-]/g, '');
  const decimalSeparator = getRupiahDecimalSeparator(cleaned);
  const normalized =
    decimalSeparator === ','
      ? cleaned.replace(/\./g, '').replace(/,/g, '.')
      : decimalSeparator === '.'
      ? cleaned.replace(/,/g, '')
      : cleaned.replace(/[.,]/g, '');
  const parsed = Number(normalized);

  return safeMoneyNumber(parsed);
}

function getRupiahDecimalSeparator(value: string): ',' | '.' | null {
  const lastComma = value.lastIndexOf(',');
  const lastDot = value.lastIndexOf('.');

  if (lastComma >= 0) {
    return ',';
  }

  if (lastDot >= 0) {
    const decimals = value.length - lastDot - 1;
    return decimals > 0 && decimals <= 2 ? '.' : null;
  }

  return null;
}

function safeMoneyNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

export function formatRupiahCompact(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}Jt`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}Rb`;
  }

  return value.toLocaleString('id-ID');
}

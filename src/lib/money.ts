const formatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function formatRupiah(value: number): string {
  return formatter.format(value);
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

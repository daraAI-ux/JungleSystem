import {formatRupiah, formatRupiahCompact} from '../src/lib/money';

describe('money formatting', () => {
  it('keeps full Rupiah labels for primary values', () => {
    expect(formatRupiah(12_500_000)).toBe('Rp\u00a012.500.000');
  });

  it('matches live Kolam compact channel labels without a Rupiah prefix', () => {
    expect(formatRupiahCompact(1_500_000_000)).toBe('1.5M');
    expect(formatRupiahCompact(12_500_000)).toBe('12.5Jt');
    expect(formatRupiahCompact(45_000)).toBe('45.0Rb');
    expect(formatRupiahCompact(900)).toBe('900');
  });
});

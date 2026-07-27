import {
  buildKolamCalendarCells,
  formatKolamDateLabel,
  formatKolamIsoDate,
  isKolamIsoDate,
  parseKolamIsoDate,
} from '../src/domain/kolam-date';

describe('Kolam date helpers', () => {
  it('parses and formats ISO date-only values without UTC shift', () => {
    expect(isKolamIsoDate('2026-07-28')).toBe(true);
    expect(isKolamIsoDate('2026-13-01')).toBe(false);
    expect(isKolamIsoDate('2026-02-30')).toBe(false);

    const date = parseKolamIsoDate('2026-07-28');
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(6);
    expect(date?.getDate()).toBe(28);
    expect(formatKolamIsoDate(date!)).toBe('2026-07-28');
  });

  it('formats readable id-ID labels', () => {
    expect(formatKolamDateLabel('')).toBe('Pilih tanggal');
    expect(formatKolamDateLabel('2026-01-05')).toMatch(/2026/);
  });

  it('builds monday-first calendar cells for a month', () => {
    // 2026-07-01 is Wednesday → 2 leading blanks (Mon, Tue)
    const cells = buildKolamCalendarCells(2026, 6);
    expect(cells[0]).toMatchObject({ day: null, inMonth: false });
    expect(cells[1]).toMatchObject({ day: null, inMonth: false });
    expect(cells[2]).toMatchObject({
      day: 1,
      iso: '2026-07-01',
      inMonth: true,
    });
    expect(cells.filter(cell => cell.inMonth)).toHaveLength(31);
    expect(cells.length % 7).toBe(0);
  });
});

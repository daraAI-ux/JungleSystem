import {
  getKolamDataTableColumnStyle,
  KOLAM_DATA_TABLE_PRIMARY_MIN_WIDTH,
} from '../src/components/kolam-data-table-column-style';

describe('getKolamDataTableColumnStyle', () => {
  it('keeps adaptive content width and adds horizontal padding outside it', () => {
    const style = getKolamDataTableColumnStyle({
      id: 'amount',
      width: 120,
      align: 'right',
    }) as Record<string, number | string>;

    expect(style.width).toBe(120 + 6 + 10);
    expect(style.paddingLeft).toBe(6);
    expect(style.paddingRight).toBe(10);
    expect(style.overflow).toBe('hidden');
  });

  it('protects primary flex columns with padded min width', () => {
    const style = getKolamDataTableColumnStyle({
      id: 'primary',
      align: 'left',
    }) as Record<string, number | string>;

    expect(style.flex).toBe(1);
    expect(style.minWidth).toBe(KOLAM_DATA_TABLE_PRIMARY_MIN_WIDTH + 12);
    expect(style.paddingLeft).toBe(6);
    expect(style.paddingRight).toBe(6);
  });
});

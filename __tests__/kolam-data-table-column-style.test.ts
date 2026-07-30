import {
  getKolamDataTableColumnStyle,
  KOLAM_DATA_TABLE_PRIMARY_MIN_WIDTH,
} from '../src/components/kolam-data-table-column-style';

describe('getKolamDataTableColumnStyle', () => {
  it('uses adaptive width as the full cell box without inner horizontal padding', () => {
    const style = getKolamDataTableColumnStyle({
      id: 'amount',
      width: 120,
      align: 'right',
    }) as Record<string, number | string>;

    expect(style.width).toBe(120);
    expect(style.flexShrink).toBe(0);
    expect(style.overflow).toBe('hidden');
    expect(style.paddingLeft).toBeUndefined();
    expect(style.paddingRight).toBeUndefined();
  });

  it('protects primary flex columns with a readable min width', () => {
    const style = getKolamDataTableColumnStyle({
      id: 'primary',
      align: 'left',
    }) as Record<string, number | string>;

    expect(style.flex).toBe(1);
    expect(style.minWidth).toBe(KOLAM_DATA_TABLE_PRIMARY_MIN_WIDTH);
    expect(style.overflow).toBe('hidden');
  });
});

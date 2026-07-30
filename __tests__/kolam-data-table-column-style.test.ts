import {
  getKolamDataTableColumnStyle,
  KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  KOLAM_DATA_TABLE_PRIMARY_MIN_WIDTH,
} from '../src/components/kolam-data-table-column-style';

describe('getKolamDataTableColumnStyle', () => {
  it('locks adaptive width with flexBasis/min/max so Yoga cannot stretch the cell', () => {
    const style = getKolamDataTableColumnStyle({
      id: 'amount',
      width: 120,
      align: 'right',
    }) as Record<string, number | string>;

    expect(style.width).toBe(120);
    expect(style.minWidth).toBe(120);
    expect(style.maxWidth).toBe(120);
    expect(style.flexBasis).toBe(120);
    expect(style.flexGrow).toBe(0);
    expect(style.flexShrink).toBe(0);
    expect(style.overflow).toBe('hidden');
  });

  it('sizes primary by content width instead of flex-fill leftover space', () => {
    const style = getKolamDataTableColumnStyle({
      id: 'primary',
      align: 'left',
    }) as Record<string, number | string>;

    expect(style.width).toBe(KOLAM_DATA_TABLE_PRIMARY_MIN_WIDTH);
    expect(style.minWidth).toBe(KOLAM_DATA_TABLE_PRIMARY_MIN_WIDTH);
    expect(style.maxWidth).toBe(KOLAM_DATA_TABLE_PRIMARY_MIN_WIDTH);
    expect(style.flexBasis).toBe(KOLAM_DATA_TABLE_PRIMARY_MIN_WIDTH);
    expect(style.flexGrow).toBe(0);
    expect(style.flexShrink).toBe(0);
    expect(style.overflow).toBe('hidden');
  });

  it('keeps the actions column wide enough for the overflow menu button', () => {
    const style = getKolamDataTableColumnStyle({
      id: 'actions',
      width: 48,
      align: 'right',
    }) as Record<string, number | string>;

    expect(style.width).toBe(KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH);
    expect(style.minWidth).toBe(KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH);
    expect(style.maxWidth).toBe(KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH);
    expect(style.flexBasis).toBe(KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH);
    expect(style.flexShrink).toBe(0);
    expect(style.overflow).toBe('visible');
  });
});

import type {StyleProp, ViewStyle} from 'react-native';
import type {KolamTableColumn} from '../domain/kolam-table';

/** Protect the primary/name column from being crushed by fixed secondary widths. */
export const KOLAM_DATA_TABLE_PRIMARY_MIN_WIDTH = 180;

/** Shared horizontal gap for data-table header/body rows. */
export const KOLAM_DATA_TABLE_COLUMN_GAP = 12;

const CELL_PADDING_X = 6;
const CELL_PADDING_RIGHT_ALIGNED = 10;

function getKolamDataTableCellPadding(align: KolamTableColumn['align'] | KolamTableColumn['headerAlign']) {
  if (align === 'right') {
    return {
      paddingLeft: CELL_PADDING_X,
      paddingRight: CELL_PADDING_RIGHT_ALIGNED,
    };
  }

  return {
    paddingLeft: CELL_PADDING_X,
    paddingRight: CELL_PADDING_X,
  };
}

/**
 * Shared column layout for header + body cells.
 * Primary without an explicit width grows (`flex: 1`) but keeps a readable min width.
 * Secondary `column.width` is treated as the **content** width from adaptive sizing;
 * horizontal padding is added outside that content so clip/overflow cannot eat characters.
 */
export function getKolamDataTableColumnStyle(
  column: Pick<KolamTableColumn, 'id' | 'width' | 'align' | 'headerAlign'>,
): StyleProp<ViewStyle> {
  const align = column.headerAlign ?? column.align;
  const isPrimaryFlex = column.id === 'primary' && column.width == null;
  const paddingStyle = getKolamDataTableCellPadding(align);
  const horizontalPadding = paddingStyle.paddingLeft + paddingStyle.paddingRight;

  const base: ViewStyle = {
    overflow: 'hidden',
    ...paddingStyle,
  };

  if (isPrimaryFlex) {
    return {
      ...base,
      flex: 1,
      minWidth: KOLAM_DATA_TABLE_PRIMARY_MIN_WIDTH + horizontalPadding,
    };
  }

  if (column.width != null) {
    return {
      ...base,
      width: column.width + horizontalPadding,
      minWidth: 0,
    };
  }

  return {
    ...base,
    minWidth: 0,
  };
}

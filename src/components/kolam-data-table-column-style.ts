import type {StyleProp, ViewStyle} from 'react-native';
import type {KolamTableColumn} from '../domain/kolam-table';

/** Protect the primary/name column from being crushed by fixed secondary widths. */
export const KOLAM_DATA_TABLE_PRIMARY_MIN_WIDTH = 180;

/** Shared horizontal gap for data-table header/body rows. */
export const KOLAM_DATA_TABLE_COLUMN_GAP = 12;

const CELL_PADDING_X = 6;
const CELL_PADDING_RIGHT_ALIGNED = 10;

/**
 * Shared column layout for header + body cells.
 * Primary without an explicit width grows (`flex: 1`) but keeps a readable min width.
 * Secondary columns use adaptive/fixed `column.width` from the table contract.
 * Overflow is clipped so right-aligned amounts cannot bleed into the next column.
 */
export function getKolamDataTableColumnStyle(
  column: Pick<KolamTableColumn, 'id' | 'width' | 'align' | 'headerAlign'>,
): StyleProp<ViewStyle> {
  const align = column.headerAlign ?? column.align;
  const isPrimaryFlex = column.id === 'primary' && column.width == null;
  const paddingStyle: ViewStyle =
    align === 'right'
      ? {
          paddingLeft: CELL_PADDING_X,
          paddingRight: CELL_PADDING_RIGHT_ALIGNED,
        }
      : {
          paddingHorizontal: CELL_PADDING_X,
        };

  const base: ViewStyle = {
    overflow: 'hidden',
    ...paddingStyle,
  };

  if (isPrimaryFlex) {
    return {
      ...base,
      flex: 1,
      minWidth: KOLAM_DATA_TABLE_PRIMARY_MIN_WIDTH,
    };
  }

  if (column.width != null) {
    return {
      ...base,
      width: column.width,
      minWidth: 0,
    };
  }

  return {
    ...base,
    minWidth: 0,
  };
}

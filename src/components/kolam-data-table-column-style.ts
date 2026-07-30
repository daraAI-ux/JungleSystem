import type {StyleProp, ViewStyle} from 'react-native';
import type {KolamTableColumn} from '../domain/kolam-table';

/** Protect the primary/name column from being crushed by fixed secondary widths. */
export const KOLAM_DATA_TABLE_PRIMARY_MIN_WIDTH = 180;

/** Shared horizontal gap for data-table header/body rows. */
export const KOLAM_DATA_TABLE_COLUMN_GAP = 8;

/**
 * Shared column layout for header + body cells.
 * Primary without an explicit width grows (`flex: 1`) but keeps a readable min width.
 * Secondary columns use adaptive/fixed `column.width` from the table contract.
 */
export function getKolamDataTableColumnStyle(
  column: Pick<KolamTableColumn, 'id' | 'width'>,
): StyleProp<ViewStyle> {
  const isPrimaryFlex = column.id === 'primary' && column.width == null;

  if (isPrimaryFlex) {
    return {
      flex: 1,
      minWidth: KOLAM_DATA_TABLE_PRIMARY_MIN_WIDTH,
    };
  }

  if (column.width != null) {
    return {
      width: column.width,
      minWidth: 0,
    };
  }

  return {minWidth: 0};
}

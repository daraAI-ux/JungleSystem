import type {StyleProp, ViewStyle} from 'react-native';
import type {KolamTableColumn} from '../domain/kolam-table';

/** Protect the primary/name column from being crushed by fixed secondary widths. */
export const KOLAM_DATA_TABLE_PRIMARY_MIN_WIDTH = 180;

/** Shared horizontal gap for data-table header/body rows. */
export const KOLAM_DATA_TABLE_COLUMN_GAP = 16;

/**
 * Shared column layout for header + body cells.
 *
 * - Adaptive `column.width` is the full cell box (no inner horizontal padding).
 *   Gutter between columns comes from row `gap` only — padding inside width was
 *   crushing primary and fighting char-based sizing.
 * - Fixed columns use `flexShrink: 0` so Yoga cannot squeeze them into neighbors.
 * - Primary grows with `flex: 1` and a readable min width.
 */
export function getKolamDataTableColumnStyle(
  column: Pick<KolamTableColumn, 'id' | 'width' | 'align' | 'headerAlign'>,
): StyleProp<ViewStyle> {
  const isPrimaryFlex = column.id === 'primary' && column.width == null;

  if (isPrimaryFlex) {
    return {
      flex: 1,
      flexShrink: 1,
      minWidth: KOLAM_DATA_TABLE_PRIMARY_MIN_WIDTH,
      overflow: 'hidden',
    };
  }

  if (column.width != null) {
    return {
      width: column.width,
      flexGrow: 0,
      flexShrink: 0,
      overflow: 'hidden',
    };
  }

  return {
    flexShrink: 0,
    minWidth: 0,
    overflow: 'hidden',
  };
}

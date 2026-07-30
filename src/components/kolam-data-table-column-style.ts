import type {StyleProp, ViewStyle} from 'react-native';
import type {KolamTableColumn} from '../domain/kolam-table';

/** Protect the primary/name column from being crushed by fixed secondary widths. */
export const KOLAM_DATA_TABLE_PRIMARY_MIN_WIDTH = 180;

/** Shared horizontal gap for data-table header/body rows. */
export const KOLAM_DATA_TABLE_COLUMN_GAP = 16;

/** Room for KolamOverflowMenuButton ("...") — button minWidth 38 + padding. */
export const KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH = 64;

/**
 * Shared column layout for header + body cells.
 *
 * - Adaptive `column.width` is the full cell box; gutter is row `gap` only.
 * - Fixed columns use `flexShrink: 0` so Yoga cannot squeeze them into neighbors.
 * - `actions` stays wide enough for the overflow menu and keeps overflow visible.
 * - Primary grows with `flex: 1` and a readable min width.
 */
export function getKolamDataTableColumnStyle(
  column: Pick<KolamTableColumn, 'id' | 'width' | 'align' | 'headerAlign'>,
): StyleProp<ViewStyle> {
  const isPrimaryFlex = column.id === 'primary' && column.width == null;
  const isActions = column.id === 'actions';

  if (isPrimaryFlex) {
    return {
      flex: 1,
      flexShrink: 1,
      minWidth: KOLAM_DATA_TABLE_PRIMARY_MIN_WIDTH,
      overflow: 'hidden',
    };
  }

  if (isActions) {
    const width = Math.max(
      column.width ?? KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
      KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
    );
    return {
      width,
      flexGrow: 0,
      flexShrink: 0,
      overflow: 'visible',
      zIndex: 9000,
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

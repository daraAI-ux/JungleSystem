import type {StyleProp, ViewStyle} from 'react-native';
import type {KolamTableColumn} from '../domain/kolam-table';

/** Fallback primary width only when content sizing has not run yet. */
export const KOLAM_DATA_TABLE_PRIMARY_MIN_WIDTH = 96;

/** Shared horizontal gap for data-table header/body rows. */
export const KOLAM_DATA_TABLE_COLUMN_GAP = 16;

/** Room for KolamOverflowMenuButton ("...") — button minWidth 38 + padding. */
export const KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH = 64;

/**
 * Shared column layout for header + body cells.
 *
 * Content columns (including primary) use explicit content-based widths.
 * Leftover row space is absorbed by `KolamDataTableMainTrack` spacer — not by stretching Target.
 */
export function getKolamDataTableColumnStyle(
  column: Pick<KolamTableColumn, 'id' | 'width' | 'align' | 'headerAlign'>,
): StyleProp<ViewStyle> {
  const isActions = column.id === 'actions';

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

  if (column.id === 'primary') {
    return {
      width: KOLAM_DATA_TABLE_PRIMARY_MIN_WIDTH,
      flexGrow: 0,
      flexShrink: 0,
      overflow: 'hidden',
    };
  }

  return {
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 0,
    overflow: 'hidden',
  };
}

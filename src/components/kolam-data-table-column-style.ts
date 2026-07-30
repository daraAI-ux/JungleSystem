import type {StyleProp, ViewStyle} from 'react-native';
import type {KolamTableColumn} from '../domain/kolam-table';

/** Fallback primary width only when content sizing has not run yet. */
export const KOLAM_DATA_TABLE_PRIMARY_MIN_WIDTH = 96;

/** Shared horizontal gap for data-table header/body rows. */
export const KOLAM_DATA_TABLE_COLUMN_GAP = 16;

/** Room for KolamOverflowMenuButton ("...") — button minWidth 38 + padding. */
export const KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH = 64;

/**
 * Lock a fixed column box so Yoga/RNW cannot stretch it with leftover row space.
 * `width` alone is not enough on flex rows — also pin flexBasis/min/max.
 */
function lockKolamDataTableColumnWidth(
  width: number,
  extras?: Pick<ViewStyle, 'overflow' | 'zIndex'>,
): ViewStyle {
  const style: ViewStyle = {
    width,
    minWidth: width,
    maxWidth: width,
    flexBasis: width,
    flexGrow: 0,
    flexShrink: 0,
    overflow: extras?.overflow ?? 'hidden',
  };
  if (extras?.zIndex != null) {
    style.zIndex = extras.zIndex;
  }
  return style;
}

/**
 * Shared column layout for header + body cells.
 *
 * Content columns (including primary) use explicit content-based widths.
 * Content columns use explicit fitted widths (char preferred, then fill/shrink to body).
 * Leftover body width is distributed into those column widths — not a trailing empty spacer.
 */
export function getKolamDataTableColumnStyle(
  column: Pick<KolamTableColumn, 'id' | 'width' | 'align' | 'headerAlign'>,
): StyleProp<ViewStyle> {
  const isActions = column.id === 'actions';

  if (isActions) {
    return lockKolamDataTableColumnWidth(
      Math.max(
        column.width ?? KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
        KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
      ),
      {overflow: 'visible', zIndex: 9000},
    );
  }

  if (column.width != null) {
    return lockKolamDataTableColumnWidth(column.width);
  }

  if (column.id === 'primary') {
    return lockKolamDataTableColumnWidth(KOLAM_DATA_TABLE_PRIMARY_MIN_WIDTH);
  }

  return {
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 0,
    overflow: 'hidden',
  };
}

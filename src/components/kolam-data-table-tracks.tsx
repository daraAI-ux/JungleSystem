import React from 'react';
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';
import {
  KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  KOLAM_DATA_TABLE_COLUMN_GAP,
} from './kolam-data-table-column-style';

/**
 * Left track for data-table content cells (everything except row actions).
 * Column widths come from fit/resolve — leftover space is distributed into those
 * widths, not absorbed by a trailing empty spacer.
 */
export function KolamDataTableMainTrack({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.mainTrack, style]}>{children}</View>;
}

/**
 * Compact actions track for overflow menu ("...").
 * Sits immediately after content columns at the end of the fitted row.
 */
export function KolamDataTableActionsTrack({
  children,
  style,
  width = KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  width?: number;
}) {
  return (
    <View
      style={[
        styles.actionsTrack,
        {
          width,
          minWidth: width,
          maxWidth: width,
          flexBasis: width,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  mainTrack: {
    alignItems: 'center',
    flexDirection: 'row',
    flexGrow: 0,
    flexShrink: 1,
    gap: KOLAM_DATA_TABLE_COLUMN_GAP,
    minWidth: 0,
    overflow: 'hidden',
  },
  actionsTrack: {
    alignItems: 'flex-end',
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: 'center',
    overflow: 'visible',
    zIndex: 9000,
  },
});

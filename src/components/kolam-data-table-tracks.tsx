import React from 'react';
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';
import {
  KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  KOLAM_DATA_TABLE_COLUMN_GAP,
} from './kolam-data-table-column-style';

/**
 * Left track for data-table content cells (everything except row actions).
 * Hugs content widths — does not absorb leftover row space.
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
 * Sits immediately after content columns — leftover space goes to TrailingSpacer.
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

/**
 * Absorbs leftover row width AFTER actions so "..." stays next to the last column
 * (FE-like), instead of floating at the far right with a gulf of empty space.
 */
export function KolamDataTableTrailingSpacer({
  style,
}: {
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.trailingSpacer, style]} />;
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
  trailingSpacer: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
});

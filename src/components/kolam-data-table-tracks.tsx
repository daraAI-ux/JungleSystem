import React from 'react';
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';
import {
  KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  KOLAM_DATA_TABLE_COLUMN_GAP,
} from './kolam-data-table-column-style';

/**
 * Left track for data-table cells (everything except row actions).
 * Flexes and clips so the pinned actions column can stay on-screen.
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
 * Right-pinned actions track for overflow menu ("...").
 * Always reserved — never participates in content shrink/clip of the main track.
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
    <View style={[styles.actionsTrack, {width}, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  mainTrack: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
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

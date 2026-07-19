import React from 'react';
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export type KolamStatusGlyphKind = 'activity' | 'clock' | 'search' | 'seed';

export interface KolamStatusGlyphProps {
  color?: string;
  kind: KolamStatusGlyphKind;
  style?: StyleProp<ViewStyle>;
}

export function KolamStatusGlyph({
  color = V.colors.mutedFg,
  kind,
  style,
}: KolamStatusGlyphProps) {
  const fillStyle = {backgroundColor: color};
  const strokeStyle = {borderColor: color};

  if (kind === 'activity') {
    return (
      <View style={[styles.activityIcon, style]}>
        <View style={[styles.activityDot, fillStyle]} />
        <View style={[styles.activityLine, fillStyle]} />
      </View>
    );
  }

  if (kind === 'search') {
    return (
      <View style={[styles.searchIcon, style]}>
        <View style={[styles.searchRing, strokeStyle]} />
        <View style={[styles.searchHandle, fillStyle]} />
      </View>
    );
  }

  if (kind === 'seed') {
    return (
      <View style={[styles.seedIcon, style]}>
        <View style={[styles.seedDiskTop, fillStyle]} />
        <View style={[styles.seedDiskBody, fillStyle]} />
      </View>
    );
  }

  return (
    <View style={[styles.clockIcon, strokeStyle, style]}>
      <View style={[styles.clockHandHour, fillStyle]} />
      <View style={[styles.clockHandMinute, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  activityIcon: {
    width: 11,
    height: 11,
    justifyContent: 'center',
    gap: 2,
  },
  activityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  activityLine: {
    width: 10,
    height: 2,
    borderRadius: 999,
  },
  clockIcon: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  clockHandHour: {
    position: 'absolute',
    left: 4,
    top: 2,
    width: 2,
    height: 4,
    borderRadius: 999,
  },
  clockHandMinute: {
    position: 'absolute',
    left: 4,
    top: 5,
    width: 4,
    height: 2,
    borderRadius: 999,
  },
  searchIcon: {
    width: 11,
    height: 11,
    position: 'relative',
  },
  searchRing: {
    position: 'absolute',
    left: 1,
    top: 1,
    width: 7,
    height: 7,
    borderRadius: 5,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  searchHandle: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 5,
    height: 2,
    borderRadius: 999,
    transform: [{rotate: '45deg'}],
  },
  seedIcon: {
    width: 11,
    height: 11,
    position: 'relative',
  },
  seedDiskTop: {
    position: 'absolute',
    left: 1,
    top: 1,
    width: 9,
    height: 3,
    borderRadius: 3,
  },
  seedDiskBody: {
    position: 'absolute',
    left: 2,
    top: 5,
    width: 7,
    height: 5,
    borderRadius: 2,
  },
});

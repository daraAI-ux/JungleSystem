import React from 'react';
import {StyleSheet, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCheckmarkIcon} from './kolam-checkmark-icon';
import {
  KolamStatusGlyph,
  type KolamStatusGlyphKind,
} from './kolam-status-glyph';

export type KolamStatusIndicatorIconKind =
  | 'check'
  | 'triangle-left'
  | KolamStatusGlyphKind;

export interface KolamStatusIndicatorIconProps {
  color?: string;
  kind: KolamStatusIndicatorIconKind;
}

export function KolamStatusIndicatorIcon({
  color = V.colors.mutedFg,
  kind,
}: KolamStatusIndicatorIconProps) {
  if (kind === 'check') {
    return <KolamCheckmarkIcon color={color} />;
  }

  if (kind === 'triangle-left') {
    return <KolamTriangleLeftGlyph color={color} />;
  }

  return <KolamStatusGlyph color={color} kind={kind} />;
}

/**
 * Filled left triangle via border geometry (same technique as KolamWarningIcon).
 * Text glyphs + rotate clip to fragments inside compact status badges on RNW.
 */
function KolamTriangleLeftGlyph({color}: {color: string}) {
  return (
    <View style={styles.triangleWrap}>
      <View style={[styles.triangleLeft, {borderRightColor: color}]} />
    </View>
  );
}

const transparent = 'transparent';

const styles = StyleSheet.create({
  triangleWrap: {
    alignItems: 'center',
    flexShrink: 0,
    height: 12,
    justifyContent: 'center',
    width: 10,
  },
  triangleLeft: {
    backgroundColor: transparent,
    borderBottomColor: transparent,
    borderBottomWidth: 5,
    borderLeftWidth: 0,
    borderRightWidth: 7,
    borderTopColor: transparent,
    borderTopWidth: 5,
    height: 0,
    width: 0,
  },
});

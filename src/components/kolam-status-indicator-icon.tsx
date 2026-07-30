import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
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

/** Same filled triangle as quiet filter caret (▾), rotated to point left. */
function KolamTriangleLeftGlyph({color}: {color: string}) {
  return (
    <View style={styles.triangleWrap}>
      <Text style={[styles.triangleGlyph, {color}]}>▾</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  triangleWrap: {
    alignItems: 'center',
    height: 11,
    justifyContent: 'center',
    transform: [{rotate: '90deg'}],
    width: 11,
  },
  triangleGlyph: {
    fontSize: 10,
    fontWeight: '700',
    includeFontPadding: false,
    lineHeight: 11,
    textAlign: 'center',
  },
});

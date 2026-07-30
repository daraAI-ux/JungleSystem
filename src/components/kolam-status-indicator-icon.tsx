import React from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Polygon} from 'react-native-svg';
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

/** Solid left triangle via SVG — border/Text approaches break on RNW badges. */
function KolamTriangleLeftGlyph({color}: {color: string}) {
  return (
    <View style={styles.triangleWrap}>
      <Svg height={10} width={8} viewBox="0 0 8 10">
        <Polygon fill={color} points="8,0 0,5 8,10" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  triangleWrap: {
    alignItems: 'center',
    flexShrink: 0,
    height: 12,
    justifyContent: 'center',
    width: 10,
  },
});

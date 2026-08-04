import React from 'react';
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export type KolamXIconSize = 'sm' | 'close' | 'md';

export interface KolamXIconProps {
  color?: string;
  size?: KolamXIconSize;
  style?: StyleProp<ViewStyle>;
}

export function KolamXIcon({
  color = V.colors.fg,
  size = 'close',
  style,
}: KolamXIconProps) {
  const box = getBoxSize(size);
  const glyph = getGlyphSize(size);

  return (
    <View style={[styles.wrap, {height: box, width: box}, style]}>
      <Svg height={glyph} width={glyph} viewBox="0 0 12 12">
        <Path
          d="M2 2 L10 10 M10 2 L2 10"
          stroke={color}
          strokeLinecap="round"
          strokeWidth={2.4}
        />
      </Svg>
    </View>
  );
}

function getBoxSize(size: KolamXIconSize) {
  if (size === 'sm') {
    return 12;
  }

  return size === 'md' ? 17 : 14;
}

function getGlyphSize(size: KolamXIconSize) {
  if (size === 'sm') {
    return 6;
  }

  return size === 'md' ? 13 : 11;
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
  },
});

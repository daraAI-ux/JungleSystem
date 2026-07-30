import React from 'react';
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

/**
 * Solid triangle caret (SVG Path).
 *
 * Bar/line chevrons mis-render as scratches or sideways arrows on RNW —
 * one shared glyph here updates dropdown footers, filter triggers, menus, etc.
 */
export type KolamChevronDirection = 'down' | 'left' | 'right' | 'up';
export type KolamChevronSize =
  | 'dashboard'
  | 'dashboard-sm'
  | 'menu'
  | 'menu-sm'
  | 'user';

export interface KolamChevronIconProps {
  color?: string;
  direction?: KolamChevronDirection;
  size?: KolamChevronSize;
  style?: StyleProp<ViewStyle>;
}

/** viewBox 0 0 10 10 — filled isosceles triangle per direction. */
const TRIANGLE_PATH: Record<KolamChevronDirection, string> = {
  down: 'M1 3 L5 8 L9 3 Z',
  up: 'M1 7 L5 2 L9 7 Z',
  right: 'M3 1 L8 5 L3 9 Z',
  left: 'M7 1 L2 5 L7 9 Z',
};

export function KolamChevronIcon({
  color = V.colors.mutedFg,
  direction = 'right',
  size = 'dashboard',
  style,
}: KolamChevronIconProps) {
  const box = getBoxSize(size);
  const glyph = getGlyphSize(size);

  return (
    <View style={[styles.wrap, {height: box, width: box}, style]}>
      <Svg height={glyph} width={glyph} viewBox="0 0 10 10">
        <Path d={TRIANGLE_PATH[direction]} fill={color} />
      </Svg>
    </View>
  );
}

function getBoxSize(size: KolamChevronSize) {
  switch (size) {
    case 'menu-sm':
      return 10;
    case 'menu':
    case 'dashboard-sm':
      return 12;
    case 'user':
      return 16;
    case 'dashboard':
    default:
      return 14;
  }
}

function getGlyphSize(size: KolamChevronSize) {
  switch (size) {
    case 'menu-sm':
      return 7;
    case 'menu':
    case 'dashboard-sm':
      return 8;
    case 'user':
      return 11;
    case 'dashboard':
    default:
      return 10;
  }
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
  },
});
